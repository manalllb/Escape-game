import { useEffect, useState } from "react";
import { apiGet } from "../api";

function formatTime(totalSeconds) {
  const seconds = Math.max(0, totalSeconds || 0);
  const minutes = Math.floor(seconds / 60);
  const remaining = seconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(remaining).padStart(2, "0")}`;
}

export default function AdminDashboard({ sessionId, sessionPin, adminEmail }) {
  const [session, setSession] = useState(null);
  const [error, setError] = useState("");

  async function loadState() {
    try {
      const data = await apiGet(`/api/sessions/${sessionId}/state`);
      setSession(data);
      setError("");
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    loadState();
    const interval = setInterval(loadState, 3000);
    return () => clearInterval(interval);
  }, [sessionId]);

  return (
    <section className="panel">
      <div className="section-title-row">
        <div>
          <p className="eyebrow">Tableau de bord admin</p>
          <h2>Session {sessionId}</h2>
          <p className="muted">Connecté comme {adminEmail}</p>
        </div>
        <button className="secondary-button" onClick={loadState}>Actualiser</button>
      </div>

      {error && <p className="error-text">{error}</p>}
      {!session && !error && <p>Chargement...</p>}

      {session && (
        <>
          <div className="stats-grid">
            <div className="stat-card">
              <span>Code PIN</span>
              <strong>{sessionPin || session.codePin}</strong>
            </div>
            <div className="stat-card">
              <span>Temps restant</span>
              <strong>{session.sessionExpiree ? "Terminé" : formatTime(session.tempsRestant)}</strong>
            </div>
            <div className="stat-card">
              <span>Score</span>
              <strong>{session.score}</strong>
            </div>
            <div className="stat-card">
              <span>Joueur</span>
              <strong>{session.joueur?.pseudo || "En attente"}</strong>
            </div>
          </div>

          <div className="subpanel">
            <h3>État des mini-jeux</h3>
            <div className="card-list">
              {session.suivis.map((suivi) => (
                <div className="mini-card" key={suivi.id}>
                  <div className="mini-card-head">
                    <strong>{suivi.nom}</strong>
                    <span className={suivi.termine ? "badge success" : "badge pending"}>
                      {suivi.termine ? "Validé" : "À faire"}
                    </span>
                  </div>
                  <p className="muted">Type : {suivi.type} · Ordre : {suivi.ordre}</p>
                  <p className="muted">Score : {suivi.score} · Temps : {suivi.temps}s</p>
                  <p className="muted">Fragment gagné : {suivi.aGagneCode ? "Oui" : "Non"}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="subpanel">
            <h3>Fragments</h3>
            <div className="fragment-row">
              {session.inventaireCodes?.map((item) => (
                <div className="fragment-box" key={item.id}>
                  {item.estValide ? item.code.fragment : "????"}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </section>
  );
}
