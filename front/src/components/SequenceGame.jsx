import { useEffect, useMemo, useState } from 'react';
import { apiGet, apiPost } from '../api';

function shuffle(array) {
  return [...array].sort(() => Math.random() - 0.5);
}

export default function SequenceGame({ sessionId, miniJeuId = 2, onComplete }) {
  const [game, setGame] = useState(null);
  const [choices, setChoices] = useState([]);
  const [selected, setSelected] = useState([]);
  const [startedAt, setStartedAt] = useState(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadGame() {
      try {
        setError('');
        const data = await apiGet(`/api/minijeux/${miniJeuId}/contenu`);
        setGame(data);
        setChoices(shuffle(data.etapes || []));
        setStartedAt(Date.now());
      } catch (e) {
        setError(e.message);
      }
    }

    loadGame();
  }, [miniJeuId]);

  const orderedExpected = useMemo(() => {
    if (!game?.etapes) return [];
    return [...game.etapes].sort((a, b) => a.ordreAttendu - b.ordreAttendu);
  }, [game]);

  function handleSelect(step) {
    if (selected.find((item) => item.id === step.id)) return;
    setSelected((prev) => [...prev, step]);
  }

  function handleRemove(stepId) {
    setSelected((prev) => prev.filter((item) => item.id !== stepId));
  }

  function resetSelection() {
    setSelected([]);
    setChoices((prev) => shuffle(prev));
  }

  async function validateSequence() {
    if (!game || saving) return;

    const temps = Math.floor((Date.now() - startedAt) / 1000);
    const isCorrect =
      selected.length === orderedExpected.length &&
      selected.every((step, index) => step.id === orderedExpected[index].id);

    const score = isCorrect ? orderedExpected.length : 0;

    try {
      setSaving(true);
      await apiPost(`/api/sessions/${sessionId}/minijeux/${miniJeuId}/complete`, {
        score,
        temps,
        nbCosmetiqueAtt: 0,
        nbNonCosmetiqueAtt: 0,
      });
      onComplete?.();
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  if (error) return <div className="error-box">{error}</div>;
  if (!game) return <section className="glass-card" style={{ padding: 26 }}><p>Chargement du mini-jeu...</p></section>;

  return (
    <section className="glass-card" style={{ padding: 26 }}>
      <p style={{ marginTop: 0, opacity: 0.72 }}>Mini-jeu 2</p>
      <h2 style={{ marginBottom: 8 }}>{game.nom}</h2>
      <p style={{ opacity: 0.74 }}>
        Clique les étapes dans le bon ordre pour reconstituer la routine de soin parfaite.
      </p>

      <div className="mini-card" style={{ marginTop: 20 }}>
        <h3 style={{ marginTop: 0 }}>Routine en cours</h3>
        <div style={{ minHeight: 90, display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          {selected.length === 0 && <p style={{ opacity: 0.62 }}>Aucune étape sélectionnée.</p>}
          {selected.map((step, index) => (
            <button key={step.id} className="secondary-btn" onClick={() => handleRemove(step.id)}>
              {index + 1}. {step.libelle}
            </button>
          ))}
        </div>
      </div>

      <div className="mini-card" style={{ marginTop: 20 }}>
        <h3 style={{ marginTop: 0 }}>Étapes disponibles</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
          {choices.map((step) => {
            const alreadySelected = selected.some((item) => item.id === step.id);
            return (
              <button
                key={step.id}
                className={alreadySelected ? 'secondary-btn' : 'ghost-btn'}
                disabled={alreadySelected}
                onClick={() => handleSelect(step)}
                style={{ textAlign: 'left' }}
              >
                <div style={{ fontWeight: 800 }}>{step.libelle}</div>
                <div style={{ fontSize: 13, opacity: 0.72, marginTop: 6 }}>Zone : {step.zoneApp}</div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="actions-row" style={{ marginTop: 20 }}>
        <button
          className="primary-btn"
          onClick={validateSequence}
          disabled={selected.length !== orderedExpected.length || saving}
        >
          {saving ? 'Validation...' : 'Valider la routine'}
        </button>
        <button className="ghost-btn" onClick={resetSelection}>Réinitialiser</button>
      </div>
    </section>
  );
}
