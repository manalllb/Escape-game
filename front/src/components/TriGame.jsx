import { useEffect, useState } from "react";
import { apiGet, apiPost } from "../api";

export default function TriGame({ sessionJoueurId, miniJeuId, onComplete }) {
  const [game, setGame] = useState(null);
  const [selected, setSelected] = useState({});
  const [startedAt, setStartedAt] = useState(Date.now());
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const data = await apiGet(`/api/minijeux/${miniJeuId}/contenu`);
        setGame(data);
        setSelected({});
        setStartedAt(Date.now());
        setError("");
        setMessage("");
      } catch (err) {
        setError(err.message);
      }
    }
    load();
  }, [miniJeuId]);

  async function handleValidate() {
    if (!game) return;

    let score = 0;
    let nbCosmetiqueAtt = 0;
    let nbNonCosmetiqueAtt = 0;

    for (const item of game.items) {
      const choice = selected[item.id];
      const expected = item.estCosmetique ? "cosmetique" : "nonCosmetique";
      if (choice === expected) score += 1;
      if (choice === "cosmetique") nbCosmetiqueAtt += 1;
      if (choice === "nonCosmetique") nbNonCosmetiqueAtt += 1;
    }

    try {
      const temps = Math.floor((Date.now() - startedAt) / 1000);
      const result = await apiPost(
        `/api/session-joueurs/${sessionJoueurId}/minijeux/${miniJeuId}/complete`,
        { score, temps, nbCosmetiqueAtt, nbNonCosmetiqueAtt }
      );
      setMessage(result.message);
      onComplete();
    } catch (err) {
      setError(err.message);
    }
  }

  if (error) return <section className="panel"><p className="error-text">{error}</p></section>;
  if (!game) return <section className="panel"><p>Chargement du tri...</p></section>;

  return (
    <section className="panel">
      <p className="eyebrow">Mini-jeu tri</p>
      <h2>{game.nom}</h2>
      <p className="muted">Choisis pour chaque produit s'il est cosmétique ou non.</p>

      <div className="stack">
        {game.items.map((item) => (
          <div className="question-card" key={item.id}>
            <strong>{item.nomProduit}</strong>
            <div className="button-row">
              <button
                className={selected[item.id] === "cosmetique" ? "primary-button" : "secondary-button"}
                onClick={() => setSelected((prev) => ({ ...prev, [item.id]: "cosmetique" }))}
              >
                Cosmétique
              </button>
              <button
                className={selected[item.id] === "nonCosmetique" ? "primary-button" : "secondary-button"}
                onClick={() => setSelected((prev) => ({ ...prev, [item.id]: "nonCosmetique" }))}
              >
                Non cosmétique
              </button>
            </div>
          </div>
        ))}
      </div>

      {message && <p className="success-text">{message}</p>}
      <button className="primary-button" onClick={handleValidate}>Valider le tri</button>
    </section>
  );
}
