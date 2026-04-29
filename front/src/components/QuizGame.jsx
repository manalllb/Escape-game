import { useEffect, useMemo, useState } from "react";
import { apiGet, apiPost } from "../api";

function shuffle(array) {
  return [...array].sort(() => Math.random() - 0.5);
}

export default function QuizGame({ sessionJoueurId, miniJeuId, onComplete }) {
  const [game, setGame] = useState(null);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [startedAt, setStartedAt] = useState(Date.now());
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const data = await apiGet(`/api/minijeux/${miniJeuId}/contenu`);
        setGame(data);
        setIndex(0);
        setScore(0);
        setStartedAt(Date.now());
        setError("");
      } catch (err) {
        setError(err.message);
      }
    }
    load();
  }, [miniJeuId]);

  const currentQuestion = game?.questions?.[index];
  const choices = useMemo(() => {
    if (!currentQuestion) return [];
    return shuffle([currentQuestion.bonneReponse, ...currentQuestion.mauvaisesReponses]);
  }, [currentQuestion]);

  async function handleAnswer(choice) {
    const isCorrect = choice === currentQuestion.bonneReponse;
    const newScore = isCorrect ? score + 1 : score;

    if (index === game.questions.length - 1) {
      try {
        const temps = Math.floor((Date.now() - startedAt) / 1000);
        await apiPost(
          `/api/session-joueurs/${sessionJoueurId}/minijeux/${miniJeuId}/complete`,
          { score: newScore, temps, nbCosmetiqueAtt: 0, nbNonCosmetiqueAtt: 0 }
        );
        onComplete();
      } catch (err) {
        setError(err.message);
      }
    } else {
      setScore(newScore);
      setIndex((prev) => prev + 1);
    }
  }

  if (error) return <section className="panel"><p className="error-text">{error}</p></section>;
  if (!game || !currentQuestion) return <section className="panel"><p>Chargement du quiz...</p></section>;

  return (
    <section className="panel">
      <p className="eyebrow">Mini-jeu quiz</p>
      <h2>{game.nom}</h2>
      <p className="muted">Question {index + 1} / {game.questions.length}</p>

      <div className="question-card">
        <strong>{currentQuestion.question}</strong>
      </div>

      <div className="stack">
        {choices.map((choice) => (
          <button key={choice} className="secondary-button left-button" onClick={() => handleAnswer(choice)}>
            {choice}
          </button>
        ))}
      </div>
    </section>
  );
}
