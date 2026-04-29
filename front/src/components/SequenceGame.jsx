import { useEffect, useMemo, useState } from "react";
import { apiGet, apiPost } from "../api";

function shuffle(array) {
  return [...array].sort(() => Math.random() - 0.5);
}

export default function SequenceGame({ sessionJoueurId, miniJeuId, onComplete }) {
  const [game, setGame] = useState(null);
  const [selected, setSelected] = useState([]);
  const [choices, setChoices] = useState([]);
  const [startedAt, setStartedAt] = useState(Date.now());
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const data = await apiGet(`/api/minijeux/${miniJeuId}/contenu`);
        setGame(data);
        setChoices(shuffle(data.etapes || []));
        setSelected([]);
        setStartedAt(Date.now());
        setMessage("");
        setError("");
      } catch (err) {
        setError(err.message);
      }
    }
    load();
  }, [miniJeuId]);

  const expected = useMemo(() => {
    return [...(game?.etapes || [])].sort((a, b) => a.ordreAttendu - b.ordreAttendu);
  }, [game]);

  async function handleValidate() {
    const score = selected.reduce((acc, step, index) => {
      return acc + (expected[index]?.id === step.id ? 1 : 0);
    }, 0);

    try {
      const temps = Math.floor((Date.now() - startedAt) / 1000);
      const result = await apiPost(
        `/api/session-joueurs/${sessionJoueurId}/minijeux/${miniJeuId}/complete`,
        { score, temps, nbCosmetiqueAtt: 0, nbNonCosmetiqueAtt: 0 }
      );
      setMessage(result.message);
      onComplete();
    } catch (err) {
      setError(err.message);
    }
  }

  if (error) return <section className="panel"><p className="error-text">{error}</p></section>;
  if (!game) return <section className="panel"><p>Chargement de la séquence...</p></section>;

  return (
    <section className="panel">
      <p className="eyebrow">Mini-jeu séquence</p>
      <h2>{game.nom}</h2>
      <p className="muted">Clique les étapes dans l'ordre qui te semble correct.</p>

      <div className="question-card">
        <strong>Ordre choisi</strong>
        <div className="chip-row">
          {selected.length === 0 && <span className="muted">Aucune étape choisie</span>}
          {selected.map((step, index) => (
            <span className="chip" key={`${step.id}-${index}`}>{index + 1}. {step.libelle}</span>
          ))}
        </div>
      </div>

      <div className="stack">
        {choices.map((step) => {
          const alreadySelected = selected.some((item) => item.id === step.id);
          return (
            <button
              key={step.id}
              className="secondary-button left-button"
              disabled={alreadySelected}
              onClick={() => setSelected((prev) => [...prev, step])}
            >
              {step.libelle} — {step.zoneApp}
            </button>
          );
        })}
      </div>

      <div className="button-row">
        <button className="secondary-button" onClick={() => setSelected([])}>Réinitialiser</button>
        <button className="primary-button" onClick={handleValidate}>Valider</button>
      </div>
      {message && <p className="success-text">{message}</p>}
    </section>
  );
}
