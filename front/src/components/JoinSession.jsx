import { useState } from "react";
import { apiPost } from "../api";

export default function JoinSession({ onSuccess }) {
  const [pin, setPin] = useState("");
  const [pseudo, setPseudo] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const data = await apiPost("/api/sessions/join", {
        codePin: pin,
        pseudo,
      });

      onSuccess({
        sessionId: data.sessionId,
        codePin: data.codePin,
        pseudo: data.pseudo,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="panel small-panel">
      <p className="eyebrow">Rejoindre une partie</p>
      <h2>Entrer dans la mission</h2>

      <form className="stack" onSubmit={handleSubmit}>
        <input
          className="input"
          placeholder="Code PIN"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
        />

        <input
          className="input"
          placeholder="Pseudo"
          value={pseudo}
          onChange={(e) => setPseudo(e.target.value)}
        />

        {error && <p className="error-text">{error}</p>}

        <button className="primary-button" disabled={loading || !pin || !pseudo}>
          {loading ? "Connexion..." : "Rejoindre"}
        </button>
      </form>
    </section>
  );
}
