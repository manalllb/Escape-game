import { useMemo, useState } from "react";
import { apiPost } from "./api";
import WelcomePage from "./components/WelcomePage";
import AdminLogin from "./components/AdminLogin";
import AdminDashboard from "./components/AdminDashboard";
import JoinSession from "./components/JoinSession";
import GameIntro from "./components/GameIntro";
import GameFlow from "./components/GameFlow";
import VictoryPage from "./components/VictoryPage";
import DefeatPage from "./components/DefeatPage";

export default function App() {
  const [page, setPage] = useState("welcome");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [joinPin, setJoinPin] = useState("");
  const [pseudo, setPseudo] = useState("");
  const [sessionId, setSessionId] = useState(null);
  const [sessionPin, setSessionPin] = useState("");
  const [sessionMeta, setSessionMeta] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [gameResult, setGameResult] = useState(null);

  const headerSubtitle = useMemo(() => {
    if (page === "admin-login") return "Connexion administrateur";
    if (page === "admin-dashboard")
      return "Gestion de session et suivi des mini-jeux";
    if (page === "join") return "Rejoindre une session avec un code PIN";
    if (page === "intro") return "Briefing avant de commencer la mission";
    if (page === "game") return "Progression de l escape game";
    if (page === "victory") return "Mission accomplie";
    if (page === "defeat") return "Mission échouée";
    return "Escape game cosmétique";
  }, [page]);

  function resetError() {
    setError("");
  }

  function goHome() {
    setPage("welcome");
    setError("");
    setLoading(false);
    setGameResult(null);
  }

  async function handleCreateSession() {
    setLoading(true);
    setError("");
    try {
      const response = await apiPost("/api/sessions", {
        adminEmail,
        password: adminPassword,
      });
      setSessionId(response.sessionId);
      setSessionPin(response.codePin);
      setSessionMeta(response);
      setPage("admin-dashboard");
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleJoinSession() {
    setLoading(true);
    setError("");
    try {
      const response = await apiPost("/api/sessions/join", {
        codePin: joinPin,
        pseudo,
      });
      setSessionId(response.sessionId);
      setSessionPin(response.codePin);
      setSessionMeta(response);
      setPage("intro");
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-shell">
      <header className="topbar">
        <div className="brand">
          <div className="brand-badge">🧪</div>
          <div>
            <h1 className="brand-title">Mission We Lab</h1>
            <p className="brand-subtitle">{headerSubtitle}</p>
          </div>
        </div>

        <div className="actions-row">
          {page !== "welcome" && (
            <button className="ghost-btn" onClick={goHome}>
              Retour accueil
            </button>
          )}
        </div>
      </header>

      {page === "welcome" && (
        <WelcomePage
          onAdmin={() => {
            resetError();
            setPage("admin-login");
          }}
          onPlayer={() => {
            resetError();
            setPage("join");
          }}
        />
      )}

      {page === "admin-login" && (
        <AdminLogin
          adminEmail={adminEmail}
          setAdminEmail={setAdminEmail}
          adminPassword={adminPassword}
          setAdminPassword={setAdminPassword}
          onSubmit={handleCreateSession}
          loading={loading}
          error={error}
        />
      )}

      {page === "admin-dashboard" && sessionId && (
        <AdminDashboard
          sessionId={sessionId}
          sessionPin={sessionPin}
          adminEmail={adminEmail}
          initialData={sessionMeta}
          onCreateAnother={() => {
            setSessionId(null);
            setSessionPin("");
            setSessionMeta(null);
            setPage("admin-login");
          }}
        />
      )}

      {page === "join" && (
        <JoinSession
          pin={joinPin}
          setPin={setJoinPin}
          pseudo={pseudo}
          setPseudo={setPseudo}
          onSubmit={handleJoinSession}
          loading={loading}
          error={error}
        />
      )}

      {page === "intro" && sessionId && (
        <GameIntro
          sessionPin={sessionPin}
          pseudo={pseudo}
          onStart={() => setPage("game")}
        />
      )}

      {page === "game" && sessionId && (
        <GameFlow
          sessionId={sessionId}
          pseudo={pseudo}
          onVictory={(result) => {
            setGameResult(result);
            setPage("victory");
          }}
          onDefeat={(result) => {
            setGameResult(result);
            setPage("defeat");
          }}
        />
      )}

      {page === "victory" && (
        <VictoryPage result={gameResult} onRestart={goHome} />
      )}
      {page === "defeat" && (
        <DefeatPage result={gameResult} onRestart={goHome} />
      )}
    </div>
  );
}
