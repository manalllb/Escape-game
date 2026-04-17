import { useEffect, useState } from "react";
import { apiGet, apiPost } from "../api";

export default function SafeGame({ sessionId }) {
  const [session, setSession] = useState(null);
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function loadState() {
      try {
        const data = await apiGet(`/api/sessions/${sessionId}/state`);
        setSession(data);
      } catch (err) {
        setError(err.message);
      }
    }

    loadState();
  }, [sessionId]);

  async function validateCode(e) {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      const data = await apiPost(`/api/sessions/${sessionId}/validate-code`, {
        code,
      });

      setSuccess(Boolean(data.success));
      setMessage(data.message || "Résultat reçu.");
    } catch (err) {
      setError(err.message);
      setSuccess(false);
    }
  }

  if (error && !session)
    return (
      <section className="panel">
        <p className="error-text">{error}</p>
      </section>
    );
  if (!session)
    return (
      <section className="panel">
        <p>Chargement du coffre...</p>
      </section>
    );

  return (
    <section className="panel center-panel">
      <p className="eyebrow">Coffre final</p>
      <h2>Entre le code secret</h2>
      <p className="muted">
        Assemble les 3 fragments pour déverrouiller le coffre.
      </p>

      <div className="fragment-row">
        {session.inventaireCodes?.map((item) => (
          <div className="fragment-box" key={item.id}>
            {item.estValide ? item.code.fragment : "????"}
          </div>
        ))}
      </div>

      <form className="stack" onSubmit={validateCode}>
        <input
          className="input code-input"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="Exemple : ABCD1234WXYZ"
          maxLength={12}
        />

        <button className="primary-button">Valider le code</button>
      </form>

      {message && (
        <p className={success ? "success-text" : "error-text"}>{message}</p>
      )}
      {error && <p className="error-text">{error}</p>}
    </section>
  );
}
