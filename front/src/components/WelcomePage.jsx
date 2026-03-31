export default function WelcomePage({ onAdmin, onPlayer }) {
  return (
    <div className="two-col">
      <section className="glass-card" style={{ padding: 36 }}>
        <p style={{ marginTop: 0, opacity: 0.75 }}>Bienvenue sur Mission We Lab</p>
        <h2 style={{ fontSize: '2.3rem', marginBottom: 12 }}>Escape game cosmétique interactif</h2>
        <p style={{ lineHeight: 1.7, marginBottom: 24 }}>
          Sensibilisez les joueurs à la cosmétique, à la réglementation et à l’éco-responsabilité
          grâce à 3 mini-jeux reliés à une session unique.
        </p>

        <div className="info-box" style={{ marginBottom: 0 }}>
          L’administrateur crée une session et partage le code PIN. Les joueurs rejoignent ensuite
          la mission et enchaînent les mini-jeux.
        </div>
      </section>

      <div className="layout-stack">
        <section className="glass-card" style={{ padding: 28 }}>
          <div style={{ fontSize: 42, marginBottom: 12 }}>🛠️</div>
          <h3 style={{ marginTop: 0 }}>Je suis administrateur</h3>
          <p style={{ opacity: 0.74 }}>
            Crée une session, récupère le numéro de session et le code PIN, puis suis l’état des parties.
          </p>
          <button className="primary-btn" style={{ width: '100%' }} onClick={onAdmin}>
            Accès admin
          </button>
        </section>

        <section className="glass-card" style={{ padding: 28 }}>
          <div style={{ fontSize: 42, marginBottom: 12 }}>🎮</div>
          <h3 style={{ marginTop: 0 }}>Je suis joueur</h3>
          <p style={{ opacity: 0.74 }}>
            Rejoins une session déjà créée avec ton code PIN et commence la mission avec ton pseudo.
          </p>
          <button className="secondary-btn" style={{ width: '100%' }} onClick={onPlayer}>
            Rejoindre la session
          </button>
        </section>
      </div>
    </div>
  );
}
