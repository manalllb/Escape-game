import { useEffect, useMemo, useState } from "react";
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
      setError(err.message || "Erreur dashboard admin.");
    }
  }

  useEffect(() => {
    if (!sessionId) return;
    loadState();
    const interval = setInterval(loadState, 4000);
    return () => clearInterval(interval);
  }, [sessionId]);

  const joueurs = session?.joueurs || [];
  const totalScore = useMemo(
    () => joueurs.reduce((sum, joueur) => sum + (joueur.score || 0), 0),
    [joueurs]
  );

  return (
    <section className="panel">
      <div className="stats-grid">
        <div className="stat-box"><span>Admin</span><strong>{adminEmail || session?.admin || "—"}</strong></div>
        <div className="stat-box"><span>Session</span><strong>#{sessionId}</strong></div>
        <div className="stat-box"><span>PIN</span><strong>{sessionPin || session?.codePin}</strong></div>
        <div className="stat-box"><span>Temps restant</span><strong>{session ? formatTime(session.tempsRestant) : "--:--"}</strong></div>
        <div className="stat-box"><span>Joueurs</span><strong>{joueurs.length}</strong></div>
        <div className="stat-box"><span>Score total</span><strong>{totalScore}</strong></div>
      </div>

      {error && <p className="error-text">{error}</p>}
      {!session && !error && <p>Chargement...</p>}

      {session && (
        <div className="stack">
          <h3>Joueurs connectés</h3>
          {joueurs.length === 0 && <p className="muted">Aucun joueur connecté pour le moment.</p>}

          {joueurs.map((joueur) => (
            <div className="player-card" key={joueur.sessionJoueurId}>
              <div className="player-card-head">
                <div>
                  <strong>{joueur.pseudo || "Joueur"}</strong>
                  <p className="muted">SessionJoueur #{joueur.sessionJoueurId}</p>
                </div>
                <div className="badge-row">
                  <span className={joueur.estGameOver ? "badge danger" : "badge pending"}>
                    {joueur.estGameOver ? "Game over" : "En cours"}
                  </span>
                  <span className={joueur.aGagne ? "badge success" : "badge pending"}>
                    {joueur.aGagne ? "Gagné" : "Pas fini"}
                  </span>
                </div>
              </div>

              <div className="inline-meta">
                <span>Score : {joueur.score}</span>
                <span>Connexion : {joueur.dateConnexion ? new Date(joueur.dateConnexion).toLocaleTimeString() : "—"}</span>
              </div>

              <div className="section-line">
                <strong>Mini-jeux</strong>
                <div className="mini-list">
                  {(joueur.suivis || []).map((suivi) => (
                    <div className="mini-card" key={suivi.id}>
                      <div className="mini-card-head">
                        <strong>{suivi.ordre}. {suivi.nom}</strong>
                        <span className={suivi.termine ? "badge success" : "badge pending"}>
                          {suivi.termine ? "Validé" : "En attente"}
                        </span>
                      </div>
                      <div className="inline-meta small">
                        <span>Score : {suivi.score}</span>
                        <span>Temps : {suivi.temps}s</span>
                        <span>Code : {suivi.aGagneCode ? "débloqué" : "bloqué"}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="section-line">
                <strong>Fragments</strong>
                <div className="fragment-row">
                  {(joueur.inventaireCodes || []).map((inv) => (
                    <div className="fragment-box" key={inv.id}>
                      {inv.estValide ? inv.code.fragment : "????"}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
