import { useEffect, useState } from "react";
import { apiGet, apiPost } from "../api";

export default function SequenceGame({ sessionId, miniJeuId, onComplete }) {
  const [game, setGame] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [startedAt, setStartedAt] = useState(0);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

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

  function toggleStep(stepId) {
    setSelectedIds((prev) =>
      prev.includes(stepId) ? prev.filter((id) => id !== stepId) : [...prev, stepId]
    );
  }

  async function validate() {
    if (!game) return;
    setSaving(true);
    setError("");

    try {
      const ordered = [...game.etapes].sort((a, b) => a.ordreAttendu - b.ordreAttendu);
      let score = 0;

      ordered.forEach((step, index) => {
        if (selectedIds[index] === step.id) {
          score += 1;
        }
      });

      const temps = Math.floor((Date.now() - startedAt) / 1000);

      await apiPost(`/api/sessions/${sessionId}/minijeux/${miniJeuId}/complete`, {
        score,
        temps,
        nbCosmetiqueAtt: 0,
        nbNonCosmetiqueAtt: 0,
      });

      onComplete();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (error && !game) return <section className="panel"><p className="error-text">{error}</p></section>;
  if (!game) return <section className="panel"><p>Chargement du jeu de séquence...</p></section>;

  return (
    <section className="panel">
      <p className="eyebrow">Mini-jeu 2</p>
      <h2>{game.nom}</h2>
      <p className="muted">Clique les étapes dans l'ordre où tu veux les placer.</p>

      <div className="subpanel">
        <h3>Ordre choisi</h3>
        <div className="fragment-row left-wrap">
          {selectedIds.length === 0 && <span className="muted">Aucune étape choisie.</span>}
          {selectedIds.map((id, index) => {
            const step = game.etapes.find((item) => item.id === id);
            return (
              <div className="fragment-box wide" key={`${id}-${index}`}>
                {index + 1}. {step?.libelle}
              </div>
            );
          })}
        </div>
      </div>

      <div className="card-list">
        {game.etapes.map((step) => (
          <button className="mini-card button-card" key={step.id} onClick={() => toggleStep(step.id)}>
            <strong>{step.libelle}</strong>
            <p className="muted">Zone : {step.zoneApp}</p>
          </button>
        ))}
      </div>

      {error && <p className="error-text">{error}</p>}

      <div className="button-row">
        <button className="secondary-button" onClick={() => setSelectedIds([])}>
          Réinitialiser
        </button>
        <button className="primary-button" onClick={validate} disabled={saving}>
          {saving ? "Validation..." : "Valider la routine"}
        </button>
      </div>
    </section>
  );
}
