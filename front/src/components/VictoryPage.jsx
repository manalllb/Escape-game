export default function VictoryPage({ result, onRestart }) {
  return (
    <section className="glass-card center-card" style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 60 }}>🏆</div>
      <p style={{ marginTop: 10, opacity: 0.72 }}>Mission réussie</p>
      <h2 style={{ fontSize: '2.2rem', marginBottom: 10 }}>Félicitations !</h2>
      <p style={{ lineHeight: 1.7 }}>
        Le lancement du produit est sauvé. Le coffre a bien été déverrouillé et la formule finale est sécurisée.
      </p>

      <div className="stat-grid" style={{ marginTop: 20 }}>
        <div className="stat-card">
          <small>Score final</small>
          <strong>{result?.session?.score ?? 0}</strong>
        </div>
        <div className="stat-card">
          <small>Session</small>
          <strong>{result?.session?.codePin ?? '—'}</strong>
        </div>
      </div>

      <button className="primary-btn" style={{ width: '100%', marginTop: 22 }} onClick={onRestart}>
        Retour à l’accueil
      </button>
    </section>
  );
}
