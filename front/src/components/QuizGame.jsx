import { useEffect, useMemo, useState } from 'react';
import { apiGet, apiPost } from '../api';

function shuffle(array) {
  return [...array].sort(() => Math.random() - 0.5);
}

export default function QuizGame({ sessionId, miniJeuId = 3, onComplete }) {
  const [quiz, setQuiz] = useState(null);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [startedAt, setStartedAt] = useState(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadQuiz() {
      try {
        setError('');
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
    if (!currentQuestion || saving) return;

    const isCorrect = choice === currentQuestion.bonneReponse;
    const newScore = isCorrect ? score + 1 : score;
    setScore(newScore);

    const isLast = index === quiz.questions.length - 1;

    if (!isLast) {
      setIndex((prev) => prev + 1);
      return;
    }

    const temps = Math.floor((Date.now() - startedAt) / 1000);
    try {
      setSaving(true);
      await apiPost(`/api/sessions/${sessionId}/minijeux/${miniJeuId}/complete`, {
        score: newScore,
        temps,
        nbCosmetiqueAtt: 0,
        nbNonCosmetiqueAtt: 0,
      });
      onComplete?.();
    } catch (e) {
      setError(e.message);
      setSaving(false);
    }
  }

  if (error) return <div className="error-box">{error}</div>;
  if (!quiz) return <section className="glass-card" style={{ padding: 26 }}><p>Chargement du quiz...</p></section>;

  return (
    <section className="glass-card" style={{ padding: 26 }}>
      <p style={{ marginTop: 0, opacity: 0.72 }}>Mini-jeu 3</p>
      <h2 style={{ marginBottom: 8 }}>{quiz.nom}</h2>
      <p style={{ opacity: 0.74 }}>
        Réponds correctement aux questions pour valider le défi écologique.
      </p>

      <div className="mini-card" style={{ marginTop: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <div className="status-chip active">Question {index + 1} / {quiz.questions.length}</div>
          <div className="status-chip done">Score actuel : {score}</div>
        </div>

        <h3 style={{ marginTop: 18 }}>{currentQuestion.question}</h3>

        <div className="layout-stack" style={{ marginTop: 16 }}>
          {choices.map((choice, choiceIndex) => (
            <button
              key={choiceIndex}
              className="ghost-btn"
              style={{ width: '100%', textAlign: 'left', padding: '16px 18px' }}
              onClick={() => handleAnswer(choice)}
              disabled={saving}
            >
              {choice}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
