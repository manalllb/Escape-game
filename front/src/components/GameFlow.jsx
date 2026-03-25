import { useEffect, useState } from "react";
import { apiGet } from "../api";
import QuizGame from "./QuizGame";

export default function GameFlow({ sessionId }) {
  const [session, setSession] = useState(null);
  const [error, setError] = useState("");

  async function loadState() {
    try {
      const data = await apiGet(`/api/sessions/${sessionId}/state`);
      setSession(data);
    } catch (e) {
      setError(e.message);
    }
  }

  useEffect(() => {
    loadState();
  }, []);

  if (error) return <p>{error}</p>;
  if (!session) return <p>Chargement...</p>;

  const prochain = session.suivis
    .filter(s => !s.termine)
    .sort((a, b) => a.ordre - b.ordre)[0];

  if (!prochain) {
    return (
      <div>
        <h2>🎉 Jeu terminé !</h2>
        <p>Score total : {session.score}</p>
      </div>
    );
  }

  // SWITCH DES MINI-JEUX
  if (prochain.type === "quiz") {
    return <QuizGame sessionId={sessionId} miniJeuId={prochain.miniJeuId} />;
  }

  return <p>Mini-jeu "{prochain.type}" pas encore implémenté</p>;
}