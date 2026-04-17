import { useState } from "react";
import { apiPost } from "../api";

export default function AdminLogin({ onSuccess }) {
  const [adminEmail, setAdminEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const data = await apiPost("/api/sessions", {
        adminEmail,
        password,
      });

      onSuccess({
        sessionId: data.sessionId,
        codePin: data.codePin,
        adminEmail,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="panel small-panel">
      <p className="eyebrow">Connexion admin</p>
      <h2>Créer une session</h2>

      <form className="stack" onSubmit={handleSubmit}>
        <input
          className="input"
          type="email"
          placeholder="Email admin"
          value={adminEmail}
          onChange={(e) => setAdminEmail(e.target.value)}
        />

        <input
          className="input"
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && <p className="error-text">{error}</p>}

        <button className="primary-button" disabled={loading || !adminEmail || !password}>
          {loading ? "Création..." : "Créer la session"}
        </button>
      </form>
    </section>
  );
}
