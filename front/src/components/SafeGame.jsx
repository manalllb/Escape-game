import { useState } from "react";
import { apiPost } from "../api";

export default function SafeGame({ sessionJoueurId, onSuccess }) {
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      const data = await apiPost(
        `/api/session-joueurs/${sessionJoueurId}/validate-code`,
        { code }
      );
      setMessage(data.message);
      onSuccess();
    } catch (err) {
      setError(err.message);
      onSuccess();
    }
  }

  return (
    <section className="panel center-panel">
      <p className="eyebrow">Coffre final</p>
      <h2>Entrer le code</h2>
      <p className="muted">Tu as 3 tentatives maximum.</p>

      <form className="stack" onSubmit={handleSubmit}>
        <input
          className="input"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="ABCD1234WXYZ"
        />
        {message && <p className="success-text">{message}</p>}
        {error && <p className="error-text">{error}</p>}
        <button className="primary-button" type="submit">Valider le code</button>
      </form>
    </section>
  );
}
