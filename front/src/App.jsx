import { useState } from "react";
import HomePage from "./components/HomePage";
import AdminLogin from "./components/AdminLogin";
import AdminDashboard from "./components/AdminDashboard";
import JoinSession from "./components/JoinSession";
import GameFlow from "./components/GameFlow";

export default function App() {
  const [page, setPage] = useState("home");
  const [sessionId, setSessionId] = useState(null);
  const [sessionPin, setSessionPin] = useState("");
  const [sessionJoueurId, setSessionJoueurId] = useState(null);
  const [adminEmail, setAdminEmail] = useState("");
  const [pseudo, setPseudo] = useState("");

  function resetAll() {
    setPage("home");
    setSessionId(null);
    setSessionPin("");
    setSessionJoueurId(null);
    setAdminEmail("");
    setPseudo("");
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Escape game cosmétique</p>
          <h1>Mission We Lab</h1>
        </div>
        {page !== "home" && (
          <button className="secondary-button" onClick={resetAll}>
            Retour accueil
          </button>
        )}
      </header>

      {page === "home" && (
        <HomePage
          onAdmin={() => setPage("admin")}
          onPlayer={() => setPage("join")}
        />
      )}

      {page === "admin" && (
        <AdminLogin
          onSuccess={({ sessionId, codePin, adminEmail }) => {
            setSessionId(sessionId);
            setSessionPin(codePin);
            setAdminEmail(adminEmail);
            setPage("dashboard");
          }}
        />
      )}

      {page === "dashboard" && sessionId && (
        <AdminDashboard
          sessionId={sessionId}
          sessionPin={sessionPin}
          adminEmail={adminEmail}
        />
      )}

      {page === "join" && (
        <JoinSession
          onSuccess={({ sessionId, sessionJoueurId, codePin, pseudo }) => {
            setSessionId(sessionId);
            setSessionJoueurId(sessionJoueurId);
            setSessionPin(codePin);
            setPseudo(pseudo);
            setPage("game");
          }}
        />
      )}

      {page === "game" && sessionId && sessionJoueurId && (
        <GameFlow
          sessionId={sessionId}
          sessionJoueurId={sessionJoueurId}
          pseudo={pseudo}
          onQuit={resetAll}
        />
      )}
    </div>
  );
}

