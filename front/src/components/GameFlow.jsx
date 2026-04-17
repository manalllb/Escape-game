import { useEffect, useMemo, useState } from "react";
import { apiGet } from "../api";
import TriGame from "./TriGame";
import SequenceGame from "./SequenceGame";
import QuizGame from "./QuizGame";
import SafeGame from "./SafeGame";

function formatTime(totalSeconds) {
  const seconds = Math.max(0, totalSeconds || 0);
  const minutes = Math.floor(seconds / 60);
  const remaining = seconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(remaining).padStart(2, "0")}`;
}

export default function GameFlow({ sessionId, playerName }) {
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
  }, [sessionId]);

  const nextGame = useMemo(() => {
    if (!session?.suivis) return null;
    return [...session.suivis]
      .filter((item) => !item.termine)
      .sort((a, b) => a.ordre - b.ordre)[0] || null;
  }, [session]);

  if (error) return <section className="panel"><p className="error-text">{error}</p></section>;
  if (!session) return <section className="panel"><p>Chargement de la mission...</p></section>;

  if (session.sessionExpiree) {
    return (
      <section className="panel center-panel">
        <p className="eyebrow">Temps écoulé</p>
        <h2>Mission terminée</h2>
        <p className="muted">Le temps de la session est dépassé.</p>
      </section>
    );
  }

  return (
    <div className="game-layout">
      <aside className="panel sidebar-panel">
        <p className="eyebrow">Progression</p>
        <h2>{playerName || "Joueur"}</h2>
        <p className="muted">Temps restant : {formatTime(session.tempsRestant)}</p>
        <p className="muted">Score : {session.score}</p>

        <div className="subpanel no-margin-bottom">
          <h3>Fragments</h3>
          <div className="fragment-row">
            {session.inventaireCodes?.map((item) => (
              <div className="fragment-box" key={item.id}>
                {item.estValide ? item.code.fragment : "????"}
              </div>
            ))}
          </div>
        </div>

        <div className="subpanel no-margin-bottom">
          <h3>Mini-jeux</h3>
          <div className="card-list compact-list">
            {session.suivis.map((suivi) => (
              <div className="mini-card" key={suivi.id}>
                <div className="mini-card-head">
                  <strong>{suivi.nom}</strong>
                  <span className={suivi.termine ? "badge success" : "badge pending"}>
                    {suivi.termine ? "OK" : "..."}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </aside>

      <main>
        {!nextGame ? (
          <SafeGame sessionId={sessionId} onSuccess={loadState} />
        ) : nextGame.type === "tri" ? (
          <TriGame sessionId={sessionId} miniJeuId={nextGame.miniJeuId} onComplete={loadState} />
        ) : nextGame.type === "sequence" ? (
          <SequenceGame sessionId={sessionId} miniJeuId={nextGame.miniJeuId} onComplete={loadState} />
        ) : (
          <QuizGame sessionId={sessionId} miniJeuId={nextGame.miniJeuId} onComplete={loadState} />
        )}
      </main>
    </div>
  );
}
