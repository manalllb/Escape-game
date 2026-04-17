export default function HomePage({ onAdmin, onPlayer }) {
  return (
    <section className="panel center-panel">
      <p className="eyebrow">Bienvenue</p>
      <h2>Lance la mission</h2>
      <p className="muted">
        Un espace simple pour l&apos;admin et un parcours clair pour le joueur.
      </p>

      <div className="choice-grid">
        <button className="choice-card" onClick={onAdmin}>
          <span className="choice-icon">🛠️</span>
          <strong>Administrateur</strong>
          <span>Créer et suivre une session</span>
        </button>

        <button className="choice-card" onClick={onPlayer}>
          <span className="choice-icon">🎮</span>
          <strong>Joueur</strong>
          <span>Rejoindre avec un code PIN</span>
        </button>
      </div>
    </section>
  );
}
