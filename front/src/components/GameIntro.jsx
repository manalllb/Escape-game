export default function GameIntro({ playerName, sessionPin, onStart }) {
  return (
    <section className="panel center-panel">
      <p className="eyebrow">Briefing</p>
      <h2>Bienvenue {playerName || "joueur"}</h2>
      <p className="muted">
        Ta session est prête. Code PIN : <strong>{sessionPin}</strong>
      </p>
      <p className="muted">
        Tu as 45 minutes pour terminer les 3 mini-jeux et retrouver le code final.
      </p>
      <button className="primary-button" onClick={onStart}>
        Commencer la mission
      </button>
    </section>
  );
}
