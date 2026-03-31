export default function DefeatPage({ result, onRestart }) {
  return (
    <section className="glass-card center-card" style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 60 }}>⚠️</div>
      <p style={{ marginTop: 10, opacity: 0.72 }}>Mission échouée</p>
      <h2 style={{ fontSize: '2.2rem', marginBottom: 10 }}>Le coffre reste verrouillé</h2>
      <p style={{ lineHeight: 1.7 }}>
        Le code final saisi n’était pas correct. La session peut être relancée pour retenter la mission.
      </p>

      <div className="info-box" style={{ marginTop: 18 }}>
        Code attendu pour les tests de ce front : <strong>{result?.finalCode ?? 'FORM1223RECY'}</strong>
      </div>

      <button className="primary-btn" style={{ width: '100%', marginTop: 22 }} onClick={onRestart}>
        Réessayer depuis l’accueil
      </button>
    </section>
  );
}
