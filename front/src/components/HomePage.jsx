export default function HomePage({ onAdmin, onPlayer }) {
  return (
    <section className="panel center-panel">
      <p className="eyebrow">Bienvenue</p>
      <h2>Choisis ton rôle</h2>
      <p className="muted">
        L'administrateur crée une session. Les joueurs rejoignent ensuite la partie avec le code PIN.
      </p>

      <div className="button-row large-gap">
        <button className="primary-button" onClick={onAdmin}>Administrateur</button>
        <button className="secondary-button" onClick={onPlayer}>Joueur</button>
      </div>
    </section>
  );
}
