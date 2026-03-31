import { useEffect, useState } from 'react';
import { apiGet, apiPost } from '../api';

function shuffle(array) {
  return [...array].sort(() => Math.random() - 0.5);
}

export default function TriGame({ sessionId, miniJeuId = 1, onComplete }) {
  const [game, setGame] = useState(null);
  const [items, setItems] = useState([]);
  const [cosmetiques, setCosmetiques] = useState([]);
  const [nonCosmetiques, setNonCosmetiques] = useState([]);
  const [selected, setSelected] = useState(null);
  const [startedAt, setStartedAt] = useState(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadGame() {
      try {
        setError('');
        const data = await apiGet(`/api/minijeux/${miniJeuId}/contenu`);
        setGame(data);
        setItems(shuffle(data.items || []));
        setStartedAt(Date.now());
      } catch (e) {
        setError(e.message);
      }
    }

    loadGame();
  }, [miniJeuId]);

  function removeFromAll(id) {
    setItems((prev) => prev.filter((item) => item.id !== id));
    setCosmetiques((prev) => prev.filter((item) => item.id !== id));
    setNonCosmetiques((prev) => prev.filter((item) => item.id !== id));
  }

  function handleSelectItem(item) {
    setSelected((prev) => (prev?.id === item.id ? null : item));
  }

  function handleDropToZone(target) {
    if (!selected) return;
    removeFromAll(selected.id);
    if (target === 'cosmetique') setCosmetiques((prev) => [...prev, selected]);
    if (target === 'nonCosmetique') setNonCosmetiques((prev) => [...prev, selected]);
    setSelected(null);
  }

  function handleReturnToPool(item) {
    removeFromAll(item.id);
    setItems((prev) => [...prev, item]);
    setSelected(null);
  }

  async function validate() {
    if (!game || saving) return;

    const temps = Math.floor((Date.now() - startedAt) / 1000);
    const nbCosmetiqueAtt = cosmetiques.filter((item) => item.estCosmetique).length;
    const nbNonCosmetiqueAtt = nonCosmetiques.filter((item) => !item.estCosmetique).length;
    const score = nbCosmetiqueAtt + nbNonCosmetiqueAtt;

    try {
      setSaving(true);
      await apiPost(`/api/sessions/${sessionId}/minijeux/${miniJeuId}/complete`, {
        score,
        temps,
        nbCosmetiqueAtt,
        nbNonCosmetiqueAtt,
      });
      onComplete?.();
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  if (error) {
    return <div className="error-box">{error}</div>;
  }

  if (!game) {
    return <section className="glass-card" style={{ padding: 26 }}><p>Chargement du mini-jeu...</p></section>;
  }

  const allPlaced = items.length === 0;

  return (
    <section className="glass-card" style={{ padding: 26 }}>
      <p style={{ marginTop: 0, opacity: 0.72 }}>Mini-jeu 1</p>
      <h2 style={{ marginBottom: 8 }}>{game.nom}</h2>
      <p style={{ opacity: 0.74 }}>
        Sélectionne un produit puis clique sur la bonne zone. L’objectif est de distinguer les produits cosmétiques des autres.
      </p>

      <div className="mini-card" style={{ marginTop: 20 }}>
        <h3 style={{ marginTop: 0 }}>Produits à trier</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          {items.length === 0 && <p style={{ opacity: 0.6 }}>Tous les produits ont été placés.</p>}
          {items.map((item) => (
            <button
              key={item.id}
              className={selected?.id === item.id ? 'primary-btn' : 'ghost-btn'}
              onClick={() => handleSelectItem(item)}
            >
              {item.nomProduit}
            </button>
          ))}
        </div>
      </div>

      <div className="two-col" style={{ width: '100%', marginTop: 20 }}>
        {[
          { key: 'cosmetique', title: '💄 Cosmétique', items: cosmetiques, bg: 'rgba(244, 114, 182, 0.08)' },
          { key: 'nonCosmetique', title: '🚫 Non cosmétique', items: nonCosmetiques, bg: 'rgba(96, 165, 250, 0.09)' },
        ].map((zone) => (
          <div
            key={zone.key}
            className="mini-card"
            onClick={() => handleDropToZone(zone.key)}
            style={{ background: zone.bg, cursor: selected ? 'pointer' : 'default' }}
          >
            <h3 style={{ marginTop: 0 }}>{zone.title}</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {zone.items.length === 0 && <p style={{ opacity: 0.62 }}>{selected ? 'Clique ici pour déposer' : 'Aucun produit'}</p>}
              {zone.items.map((item) => (
                <button key={item.id} className="ghost-btn" onClick={(e) => { e.stopPropagation(); handleReturnToPool(item); }}>
                  {item.nomProduit} ✕
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="actions-row" style={{ marginTop: 20 }}>
        <button className="primary-btn" onClick={validate} disabled={!allPlaced || saving}>
          {saving ? 'Validation...' : 'Valider le tri'}
        </button>
      </div>
    </section>
  );
}
