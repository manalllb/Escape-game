import { useEffect, useState } from "react";
import { apiGet, apiPost } from "../api";

export default function TriGame({ sessionId, miniJeuId, onComplete }) {
  const [game, setGame] = useState(null);
  const [selected, setSelected] = useState({});
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

  function setChoice(itemId, zone) {
    setSelected((prev) => ({ ...prev, [itemId]: zone }));
  }

  async function validate() {
    if (!game) return;
    setSaving(true);
    setError("");

    try {
      const total = game.items.length;
      let score = 0;
      let nbCosmetiqueAtt = 0;
      let nbNonCosmetiqueAtt = 0;

      for (const item of game.items) {
        const choice = selected[item.id];
        if (choice === "cosmetique") nbCosmetiqueAtt += 1;
        if (choice === "nonCosmetique") nbNonCosmetiqueAtt += 1;

        const correct =
          (item.estCosmetique && choice === "cosmetique") ||
          (!item.estCosmetique && choice === "nonCosmetique");

        if (correct) score += 1;
      }

      if (Object.keys(selected).length !== total) {
        throw new Error("Il faut trier tous les produits avant de valider.");
      }

      const temps = Math.floor((Date.now() - startedAt) / 1000);

      await apiPost(
        `/api/sessions/${sessionId}/minijeux/${miniJeuId}/complete`,
        {
          score,
          temps,
          nbCosmetiqueAtt,
          nbNonCosmetiqueAtt,
        },
      );

      onComplete();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
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
        <p>Chargement du jeu de tri...</p>
      </section>
    );

  return (
    <section className="panel">
      <p className="eyebrow">Mini-jeu 1</p>
      <h2>{game.nom}</h2>
      <p className="muted">Choisis la bonne catégorie pour chaque produit.</p>

      <div className="card-list">
        {game.items.map((item) => (
          <div className="mini-card" key={item.id}>
            <strong>{item.nomProduit}</strong>
            <div className="choice-row">
              <button
                className={
                  selected[item.id] === "cosmetique"
                    ? "small-button active"
                    : "small-button"
                }
                onClick={() => setChoice(item.id, "cosmetique")}
              >
                Cosmétique
              </button>
              <button
                className={
                  selected[item.id] === "nonCosmetique"
                    ? "small-button active"
                    : "small-button"
                }
                onClick={() => setChoice(item.id, "nonCosmetique")}
              >
                Non cosmétique
              </button>
            </div>
          </div>
        ))}
      </div>

      {error && <p className="error-text">{error}</p>}

      <button className="primary-button" onClick={validate} disabled={saving}>
        {saving ? "Validation..." : "Valider le tri"}
      </button>
    </section>
  );
}
