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

export default function GameFlow({ sessionId, sessionJoueurId, pseudo, onQuit }) {
  const [state, setState] = useState(null);
  const [selectedGameId, setSelectedGameId] = useState("");
  const [error, setError] = useState("");

  async function loadState() {
    try {
      const data = await apiGet(`/api/session-joueurs/${sessionJoueurId}/state`);
      setState(data);
      setError("");
    } catch (err) {
      setError(err.message || "Erreur lors du chargement de la mission.");
    }
  }

  useEffect(() => {
    if (!sessionJoueurId) return;
    loadState();
    const interval = setInterval(loadState, 4000);
    return () => clearInterval(interval);
  }, [sessionJoueurId]);

  const availableGames = useMemo(() => {
    return [...(state?.suivis || [])].sort((a, b) => a.ordre - b.ordre);
  }, [state]);

  useEffect(() => {
    if (!availableGames.length) return;
    const selectedStillExists = availableGames.some(
      (game) => String(game.miniJeuId) === String(selectedGameId)
    );
    if (!selectedGameId || !selectedStillExists) {
      const firstPlayable = availableGames.find((game) => !game.termine) || availableGames[0];
      setSelectedGameId(String(firstPlayable.miniJeuId));
    }
  }, [availableGames, selectedGameId]);

  const selectedGame = availableGames.find(
    (game) => String(game.miniJeuId) === String(selectedGameId)
  );
  const allGamesCompleted = availableGames.length > 0 && availableGames.every((game) => game.termine);
  const currentPseudo = state?.joueur?.pseudo || pseudo;

  if (error) {
    return (
      <section className="panel center-panel">
        <p className="error-text">{error}</p>
        <button className="secondary-button" onClick={onQuit}>Retour accueil</button>
      </section>
    );
  }

  if (!state) {
    return <section className="panel"><p>Chargement de la mission...</p></section>;
  }

  if (state.sessionExpiree || state.estGameOver) {
    return (
      <section className="panel center-panel">
        <p className="eyebrow">Mission arrêtée</p>
        <h2>Game over</h2>
        <p className="muted">
          {state.sessionExpiree ? "Le temps de la session est écoulé." : "La partie est terminée."}
        </p>
        <button className="secondary-button" onClick={onQuit}>Retour accueil</button>
      </section>
    );
  }

  if (state.aGagne) {
    return (
      <section className="panel center-panel">
        <p className="eyebrow">Mission réussie</p>
        <h2>Bravo {currentPseudo} !</h2>
        <p className="muted">Tu as trouvé le code final et terminé la mission.</p>
        <p><strong>Score final :</strong> {state.score}</p>
        <button className="secondary-button" onClick={onQuit}>Retour accueil</button>
      </section>
    );
  }

  return (
    <div className="game-layout">
      <aside className="panel sidebar-panel">
        <p className="eyebrow">Joueur</p>
        <h2>{currentPseudo}</h2>
        <p className="muted">Session #{state.sessionId} — PIN {state.codePin}</p>
        <p className="muted">Temps restant : {formatTime(state.tempsRestant)}</p>
        <p className="muted">Score : {state.score}</p>

        <div className="section-line">
          <strong>Fragments débloqués</strong>
          <div className="fragment-row">
            {(state.inventaireCodes || []).map((inv) => (
              <div className="fragment-box" key={inv.id}>
                {inv.estValide ? inv.code.fragment : "????"}
              </div>
            ))}
          </div>
        </div>

        <div className="section-line">
          <strong>Mini-jeux</strong>
          {availableGames.length === 0 ? (
            <p className="muted">Aucun mini-jeu trouvé pour ce joueur.</p>
          ) : (
            <select
              className="input"
              value={selectedGameId}
              onChange={(event) => setSelectedGameId(event.target.value)}
            >
              {availableGames.map((game) => (
                <option key={game.id} value={game.miniJeuId}>
                  {game.ordre}. {game.nom} {game.termine ? "(validé)" : ""}
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="mini-list">
          {availableGames.map((game) => (
            <div className="mini-card" key={game.id}>
              <div className="mini-card-head">
                <strong>{game.nom}</strong>
                <span className={game.termine ? "badge success" : "badge pending"}>
                  {game.termine ? "Validé" : "À faire"}
                </span>
              </div>
              <div className="inline-meta small">
                <span>Score : {game.score}</span>
                <span>Temps : {game.temps}s</span>
              </div>
            </div>
          ))}
        </div>
      </aside>

      <main>
        {allGamesCompleted ? (
          <SafeGame sessionJoueurId={sessionJoueurId} onSuccess={loadState} />
        ) : selectedGame?.type === "tri" ? (
          <TriGame sessionJoueurId={sessionJoueurId} miniJeuId={selectedGame.miniJeuId} onComplete={loadState} />
        ) : selectedGame?.type === "sequence" ? (
          <SequenceGame sessionJoueurId={sessionJoueurId} miniJeuId={selectedGame.miniJeuId} onComplete={loadState} />
        ) : selectedGame?.type === "quiz" ? (
          <QuizGame sessionJoueurId={sessionJoueurId} miniJeuId={selectedGame.miniJeuId} onComplete={loadState} />
        ) : (
          <section className="panel"><p>Choisis un mini-jeu.</p></section>
        )}
      </main>
    </div>
  );
}
