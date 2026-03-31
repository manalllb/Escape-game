export default function JoinSession({ pin, setPin, pseudo, setPseudo, onSubmit, loading, error }) {
  return (
    <section className="glass-card center-card">
      <p style={{ marginTop: 0, opacity: 0.72 }}>Accès joueur</p>
      <h2 style={{ fontSize: '2rem', marginBottom: 8 }}>Rejoindre une session</h2>
      <p style={{ marginTop: 0, opacity: 0.72 }}>
        Entre le code PIN communiqué par l’administrateur puis ton pseudo.
      </p>

      {error && <div className="error-box">{error}</div>}

      <div className="layout-stack">
        <input
          className="code-input"
          value={pin}
          onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
          placeholder="Code PIN (6 chiffres)"
          inputMode="numeric"
          maxLength={6}
        />

        <input
          className="input"
          value={pseudo}
          onChange={(e) => setPseudo(e.target.value)}
          placeholder="Ton pseudo"
        />

        <button
          className="primary-btn"
          onClick={onSubmit}
          disabled={!pin || !pseudo || loading}
        >
          {loading ? 'Connexion...' : 'Rejoindre la session'}
        </button>
      </div>
    </section>
  );
}
