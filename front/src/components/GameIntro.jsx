export default function GameIntro({ sessionPin, pseudo, onStart }) {
  return (
    <div style={{ width: 'min(920px, 100%)', margin: '0 auto' }} className="layout-stack">
      <section className="glass-card" style={{ padding: 32, textAlign: 'center' }}>
        <p style={{ marginTop: 0, opacity: 0.72 }}>Urgence laboratoire</p>
        <h2 style={{ fontSize: '2.4rem', marginBottom: 12 }}>Mission We Lab</h2>
        <p style={{ maxWidth: 760, margin: '0 auto', lineHeight: 1.7 }}>
          Bonjour {pseudo || 'joueur'} ! La formule d’un nouveau soin cosmétique est verrouillée.
          Pour débloquer le laboratoire, tu dois réussir 3 mini-jeux et reconstituer le code final.
        </p>
      </section>

      <div className="two-col" style={{ width: '100%' }}>
        <section className="glass-card" style={{ padding: 28 }}>
          <h3 style={{ marginTop: 0 }}>Ta session</h3>
          <div className="stat-grid">
            <div className="stat-card">
              <small>Code PIN</small>
              <strong>{sessionPin}</strong>
            </div>
            <div className="stat-card">
              <small>Mini-jeux</small>
              <strong>3</strong>
            </div>
          </div>
        </section>

        <section className="glass-card" style={{ padding: 28 }}>
          <h3 style={{ marginTop: 0 }}>Objectifs</h3>
          <ul style={{ margin: 0, paddingLeft: 20, lineHeight: 1.8 }}>
            <li>Trier les produits cosmétiques correctement</li>
            <li>Reconstituer la routine de soin dans le bon ordre</li>
            <li>Réussir le quiz écologique</li>
          </ul>
        </section>
      </div>

      <section className="glass-card" style={{ padding: 28 }}>
        <h3 style={{ marginTop: 0 }}>Fragments à récupérer</h3>
        <div className="fragment-row">
          <div className="fragment-card">
            <div>Fragment 1</div>
            <div className="fragment-code">????</div>
          </div>
          <div className="fragment-card">
            <div>Fragment 2</div>
            <div className="fragment-code">????</div>
          </div>
          <div className="fragment-card">
            <div>Fragment 3</div>
            <div className="fragment-code">????</div>
          </div>
        </div>

        <button className="primary-btn" style={{ marginTop: 20, width: '100%' }} onClick={onStart}>
          Lancer la mission
        </button>
      </section>
    </div>
  );
}
