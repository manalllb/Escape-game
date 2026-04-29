import { useState } from "react";
import { apiPost } from "../api";

export default function JoinSession({ onSuccess }) {
  const [codePin, setCodePin] = useState("");
  const [pseudo, setPseudo] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const data = await apiPost("/api/sessions/join", { codePin, pseudo });
      onSuccess({ ...data, pseudo });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="panel center-panel">
      <p className="eyebrow">Joueur</p>
      <h2>Rejoindre une session</h2>

      <form className="stack" onSubmit={handleSubmit}>
        <input
          className="input"
          placeholder="Code PIN"
          value={codePin}
          onChange={(e) => setCodePin(e.target.value)}
        />
        <input
          className="input"
          placeholder="Pseudo"
          value={pseudo}
          onChange={(e) => setPseudo(e.target.value)}
        />
        {error && <p className="error-text">{error}</p>}
        <button className="primary-button" type="submit" disabled={loading}>
          {loading ? "Connexion..." : "Entrer dans la mission"}
        </button>
      </form>
    </section>
  );
}
