import { useMemo, useState } from 'react';

export default function SafeGame({ fragments, score, onVictory, onDefeat }) {
  const [value, setValue] = useState('');
  const [message, setMessage] = useState('');
  const finalCode = useMemo(() => fragments.join(''), [fragments]);

  function validate() {
    if (value.toUpperCase() === finalCode) {
      setMessage('Code correct ! Le coffre est déverrouillé.');
      onVictory?.();
      return;
    }

    setMessage('Code incorrect. La mission échoue pour le moment.');
    onDefeat?.();
  }

  return (
    <section className="glass-card" style={{ padding: 28, textAlign: 'center' }}>
      <p style={{ marginTop: 0, opacity: 0.72 }}>Phase finale</p>
      <h2 style={{ fontSize: '2.2rem', marginBottom: 8 }}>Coffre-fort du laboratoire</h2>
      <p style={{ maxWidth: 660, margin: '0 auto', opacity: 0.74, lineHeight: 1.7 }}>
        Tu as terminé les 3 mini-jeux. Assemble maintenant les fragments pour saisir le code final.
      </p>

      <div className="fragment-row" style={{ marginTop: 20 }}>
        {fragments.map((fragment, index) => (
          <div key={index} className="fragment-card">
            <div>Fragment {index + 1}</div>
            <div className="fragment-code">{fragment}</div>
          </div>
        ))}
      </div>

      <div className="mini-card" style={{ marginTop: 24, maxWidth: 520, marginInline: 'auto' }}>
        <p style={{ marginTop: 0, opacity: 0.72 }}>Score final provisoire : {score}</p>
        <input
          className="code-input"
          value={value}
          onChange={(e) => setValue(e.target.value.toUpperCase())}
          placeholder="Entre le code final"
        />
        <div className="actions-row" style={{ justifyContent: 'center', marginTop: 16 }}>
          <button className="danger-btn" onClick={() => setValue('')}>Effacer</button>
          <button className="primary-btn" onClick={validate} disabled={!value}>Valider le code</button>
        </div>
        {message && <div className={message.includes('correct') ? 'success-box' : 'error-box'} style={{ marginTop: 16 }}>{message}</div>}
      </div>
    </section>
  );
}
