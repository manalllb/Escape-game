export default function AdminLogin({
  adminEmail,
  setAdminEmail,
  adminPassword,
  setAdminPassword,
  onSubmit,
  loading,
  error,
}) {
  return (
    <section className="glass-card center-card">
      <p style={{ marginTop: 0, opacity: 0.72 }}>Connexion administrateur</p>
      <h2 style={{ fontSize: "2rem", marginBottom: 10 }}>Administrateur</h2>
      <p style={{ marginTop: 0, opacity: 0.72 }}>
        Seuls les administrateurs autorisés peuvent créer une session.
      </p>

      {error && <div className="error-box">{error}</div>}

      <div className="layout-stack">
        <input
          className="input"
          type="email"
          value={adminEmail}
          onChange={(e) => setAdminEmail(e.target.value)}
          placeholder="Email admin"
        />

        <input
          className="input"
          type="password"
          value={adminPassword}
          onChange={(e) => setAdminPassword(e.target.value)}
          placeholder="Mot de passe"
        />

        <button
          className="primary-btn"
          onClick={onSubmit}
          disabled={!adminEmail || !adminPassword || loading}
        >
          {loading ? "Connexion..." : "Créer la session"}
        </button>
      </div>
    </section>
  );
}
