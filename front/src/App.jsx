import { useState } from "react";
import HomePage from "./components/HomePage";
import AdminLogin from "./components/AdminLogin";
import AdminDashboard from "./components/AdminDashboard";
import JoinSession from "./components/JoinSession";
import GameIntro from "./components/GameIntro";
import GameFlow from "./components/GameFlow";

export default function App() {
  const [screen, setScreen] = useState("home");
  const [sessionId, setSessionId] = useState(null);
  const [sessionPin, setSessionPin] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [playerName, setPlayerName] = useState("");

  function goHome() {
    setScreen("home");
    setSessionId(null);
    setSessionPin("");
    setAdminEmail("");
    setPlayerName("");
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Escape game cosmétique</p>
          <h1>Mission We Lab</h1>
        </div>

        {screen !== "home" && (
          <button className="secondary-button" onClick={goHome}>
            Retour accueil
          </button>
        )}
      </header>

      {screen === "home" && (
        <HomePage
          onAdmin={() => setScreen("admin")}
          onPlayer={() => setScreen("join")}
        />
      )}

      {screen === "admin" && (
        <AdminLogin
          onSuccess={({
            sessionId: newSessionId,
            codePin,
            adminEmail: email,
          }) => {
            setSessionId(newSessionId);
            setSessionPin(codePin);
            setAdminEmail(email);
            setScreen("dashboard");
          }}
        />
      )}

      {screen === "dashboard" && sessionId && (
        <AdminDashboard
          sessionId={sessionId}
          sessionPin={sessionPin}
          adminEmail={adminEmail}
        />
      )}

      {screen === "join" && (
        <JoinSession
          onSuccess={({ sessionId: newSessionId, codePin, pseudo }) => {
            setSessionId(newSessionId);
            setSessionPin(codePin);
            setPlayerName(pseudo);
            setScreen("intro");
          }}
        />
      )}

      {screen === "intro" && sessionId && (
        <GameIntro
          playerName={playerName}
          sessionPin={sessionPin}
          onStart={() => setScreen("game")}
        />
      )}

      {screen === "game" && sessionId && (
        <GameFlow sessionId={sessionId} playerName={playerName} />
      )}
    </div>
  );
}
