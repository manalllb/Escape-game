import { useEffect, useMemo, useState } from "react";
import { apiGet, apiPost } from "../api";

function shuffle(list) {
  return [...list].sort(() => Math.random() - 0.5);
}

export default function QuizGame({ sessionId, miniJeuId, onComplete }) {
  const [game, setGame] = useState(null);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [startedAt, setStartedAt] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadGame() {
      try {
        const data = await apiGet(`/api/minijeux/${miniJeuId}/contenu`);
        setGame(data);
        setStartedAt(Date.now());
      } catch (err) {
        setError(err.message);
      }
    }

    loadGame();
  }, [miniJeuId]);

  const question = game?.questions?.[index];

  const answers = useMemo(() => {
    if (!question) return [];
    return shuffle([question.bonneReponse, ...question.mauvaisesReponses]);
  }, [question]);

  async function chooseAnswer(answer) {
    const nextScore = answer === question.bonneReponse ? score + 1 : score;
    setScore(nextScore);

    const isLast = index === game.questions.length - 1;

    if (!isLast) {
      setIndex((prev) => prev + 1);
      return;
    }

    try {
      const temps = Math.floor((Date.now() - startedAt) / 1000);
      await apiPost(
        `/api/sessions/${sessionId}/minijeux/${miniJeuId}/complete`,
        {
          score: nextScore,
          temps,
          nbCosmetiqueAtt: 0,
          nbNonCosmetiqueAtt: 0,
        },
      );
      onComplete();
    } catch (err) {
      setError(err.message);
    }
  }

  if (error && !game)
    return (
      <section className="panel">
        <p className="error-text">{error}</p>
      </section>
    );
  if (!game)
    return (
      <section className="panel">
        <p>Chargement du quiz...</p>
      </section>
    );

  return (
    <section className="panel">
      <p className="eyebrow">Mini-jeu 3</p>
      <h2>{game.nom}</h2>
      <p className="muted">
        Question {index + 1} / {game.questions.length}
      </p>

      <div className="subpanel">
        <h3>{question.question}</h3>
        <div className="stack">
          {answers.map((answer, indexAnswer) => (
            <button
              className="answer-button"
              key={indexAnswer}
              onClick={() => chooseAnswer(answer)}
            >
              {answer}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="error-text">{error}</p>}
    </section>
  );
}
