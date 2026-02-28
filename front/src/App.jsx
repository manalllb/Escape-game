import { useState } from 'react';
import { apiGet, apiPost } from "./api";

//import reactLogo from './assets/react.svg'
//import viteLogo from '/vite.svg'
//import './App.css'

export default function App() {
  const [adminEmail, setAdminEmail] = useState("admin@escape.local");
  const [pin, setPin] = useState("");
  const [pseudo, setPseudo] = useState("Manal");
  const [sessionId, setSessionId] = useState(null);
  const [state, setState] = useState(null);
  const [error, setError] = useState("");

  async function createSession() {
    setError("");
    const r = await apiPost("/api/sessions", { adminEmail });
    setPin(r.codePin);
    setSessionId(r.sessionId);
    setState(null);
  }

  async function joinSession() {
    setError("");
    const r = await apiPost("/api/sessions/join", { codePin: pin, pseudo });
    setSessionId(r.sessionId);
  }

  async function loadState() {
    setError("");
    if (!sessionId) return;
    const r = await apiGet(`/api/sessions/${sessionId}/state`);
    setState(r);
  }

  return (
    <div style={{ maxWidth: 720, margin: "40px auto", fontFamily: "system-ui" }}>
      <h1>Escape Game – MVP</h1>

      {error && <p style={{ color: "crimson" }}>{error}</p>}

      <div style={{ padding: 12, border: "1px solid #ddd", borderRadius: 8, marginBottom: 12 }}>
        <h2>Admin</h2>
        <input
          value={adminEmail}
          onChange={(e) => setAdminEmail(e.target.value)}
          placeholder="admin email"
          style={{ width: "100%", padding: 8 }}
        />
        <button onClick={() => createSession().catch(e => setError(e.message))} style={{ marginTop: 8 }}>
          Créer une session
        </button>
        {pin && <p><b>PIN:</b> {pin} | <b>Session:</b> {sessionId}</p>}
      </div>

      <div style={{ padding: 12, border: "1px solid #ddd", borderRadius: 8, marginBottom: 12 }}>
        <h2>Joueur</h2>
        <input value={pin} onChange={(e) => setPin(e.target.value)} placeholder="PIN" style={{ padding: 8 }} />
        <input value={pseudo} onChange={(e) => setPseudo(e.target.value)} placeholder="Pseudo" style={{ padding: 8, marginLeft: 8 }} />
        <button onClick={() => joinSession().catch(e => setError(e.message))} style={{ marginLeft: 8 }}>
          Rejoindre
        </button>
      </div>

      <div style={{ padding: 12, border: "1px solid #ddd", borderRadius: 8 }}>
        <h2>State</h2>
        <button onClick={() => loadState().catch(e => setError(e.message))} disabled={!sessionId}>
          Charger /state
        </button>
        {state && (
          <pre style={{ background: "#f6f6f6", padding: 12, borderRadius: 8, marginTop: 8 }}>
            {JSON.stringify(state, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
}