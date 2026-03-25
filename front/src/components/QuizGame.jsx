import { useEffect, useMemo, useState } from "react";
import { apiGet, apiPost } from "../api";

function shuffle(array) {
  return [...array].sort(() => Math.random() - 0.5);
}

export default function QuizGame({ sessionId, miniJeuId = 3 }) {
  const [quiz, setQuiz] = useState(null);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [startedAt, setStartedAt] = useState(null);
  const [finished, setFinished] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadQuiz() {
      try {
        setError("");
        const data = await apiGet(`/api/minijeux/${miniJeuId}/contenu`);
        setQuiz(data);
        setStartedAt(Date.now());
      } catch (e) {
        setError(e.message);
      }
    }
    loadQuiz();
  }, [miniJeuId]);

  const currentQuestion = quiz?.questions?.[index];

  const choices = useMemo(() => {
    if (!currentQuestion) return [];
    return shuffle([
      currentQuestion.bonneReponse,
      ...currentQuestion.mauvaisesReponses,
    ]);
  }, [currentQuestion]);

  async function handleAnswer(choice) {
    if (!currentQuestion) return;

    const isCorrect = choice === currentQuestion.bonneReponse;
    const newScore = isCorrect ? score + 1 : score;
    setScore(newScore);

    const isLast = index === quiz.questions.length - 1;

    if (isLast) {
      const temps = Math.floor((Date.now() - startedAt) / 1000);

      try {
        await apiPost(`/api/sessions/${sessionId}/minijeux/${miniJeuId}/complete`, {
          score: newScore,
          temps,
          nbCosmetiqueAtt: 0,
          nbNonCosmetiqueAtt: 0,
        });
        window.location.reload();
        setFinished(true);
      } catch (e) {
        setError(e.message);
      }
    } else {
      setIndex(index + 1);
    }
  }

  if (error) return <p style={{ color: "crimson" }}>{error}</p>;
  if (!quiz) return <p>Chargement du quiz...</p>;
  if (finished) {
    return (
      <div>
        <h2>{quiz.nom}</h2>
        <p>Quiz terminé ✅</p>
        <p>Score : {score} / {quiz.questions.length}</p>
      </div>
    );
  }

  return (
    <div style={{ padding: 16, border: "1px solid #ddd", borderRadius: 8 }}>
      <h2>{quiz.nom}</h2>
      <p>Question {index + 1} / {quiz.questions.length}</p>
      <h3>{currentQuestion.question}</h3>

      <div style={{ display: "grid", gap: 8 }}>
        {choices.map((choice, i) => (
          <button key={i} onClick={() => handleAnswer(choice)}>
            {choice}
          </button>
        ))}
      </div>

      <p style={{ marginTop: 12 }}>Score actuel : {score}</p>
    </div>
  );
}