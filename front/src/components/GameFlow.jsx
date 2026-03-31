import { useEffect, useMemo, useState } from 'react';
import { apiGet } from '../api';
import QuizGame from './QuizGame';
import SequenceGame from './SequenceGame';
import TriGame from './TriGame';
import SafeGame from './SafeGame';

const FRAGMENTS = ['FORM', '1223', 'RECY'];

export default function GameFlow({ sessionId, pseudo, onVictory, onDefeat }) {
  const [session, setSession] = useState(null);
  const [error, setError] = useState('');

  async function loadState() {
    try {
      setError('');
      const data = await apiGet(`/api/sessions/${sessionId}/state`);
      setSession(data);
    } catch (e) {
      setError(e.message);
    }
  }

  useEffect(() => {
    loadState();
  }, [sessionId]);

  const suivis = session?.suivis ?? [];
  const orderedSuivis = useMemo(() => suivis.slice().sort((a, b) => a.ordre - b.ordre), [suivis]);
  const prochain = orderedSuivis.find((s) => !s.termine);
  const doneCount = orderedSuivis.filter((s) => s.termine).length;
  const progress = orderedSuivis.length ? (doneCount / orderedSuivis.length) * 100 : 0;
  const fragments = orderedSuivis.map((s, index) => (s.termine ? FRAGMENTS[index] : '????'));

  if (error) {
    return (
      <div className="glass-card center-card">
        <div className="error-box" style={{ marginBottom: 0 }}>{error}</div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="glass-card center-card">
        <p>Chargement de la session...</p>
      </div>
    );
  }

  const header = (
    <>
      <section className="glass-card" style={{ padding: 26 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <div>
            <p style={{ marginTop: 0, opacity: 0.72 }}>Mission en cours</p>
            <h2 style={{ marginBottom: 8 }}>Bonjour {pseudo || session.joueur?.pseudo || 'joueur'} 👋</h2>
            <p style={{ margin: 0, opacity: 0.72 }}>
              Session #{session.sessionId} · PIN {session.codePin} · Score total {session.score}
            </p>
          </div>
          <div className="status-chip active">{doneCount} / {orderedSuivis.length} terminés</div>
        </div>

        <div style={{ marginTop: 18 }}>
          <div className="progress"><span style={{ width: `${progress}%` }} /></div>
        </div>
      </section>

      <section className="glass-card" style={{ padding: 24 }}>
        <h3 style={{ marginTop: 0 }}>Fragments du code</h3>
        <div className="fragment-row">
          {fragments.map((fragment, index) => (
            <div key={index} className="fragment-card">
              <div>Fragment {index + 1}</div>
              <div className="fragment-code">{fragment}</div>
            </div>
          ))}
        </div>
      </section>
    </>
  );

  if (!prochain) {
    return (
      <div style={{ width: 'min(980px, 100%)', margin: '0 auto' }} className="layout-stack">
        {header}
        <SafeGame
          fragments={FRAGMENTS}
          score={session.score}
          onVictory={() => onVictory?.({ session, finalCode: FRAGMENTS.join('') })}
          onDefeat={() => onDefeat?.({ session, finalCode: FRAGMENTS.join('') })}
        />
      </div>
    );
  }

  const commonProps = {
    sessionId,
    miniJeuId: prochain.miniJeuId,
    onComplete: loadState,
  };

  return (
    <div style={{ width: 'min(980px, 100%)', margin: '0 auto' }} className="layout-stack">
      {header}

      {prochain.type === 'tri' && <TriGame {...commonProps} />}
      {prochain.type === 'sequence' && <SequenceGame {...commonProps} />}
      {prochain.type === 'quiz' && <QuizGame {...commonProps} />}

      {!['tri', 'sequence', 'quiz'].includes(prochain.type) && (
        <section className="glass-card" style={{ padding: 28 }}>
          <h3>Mini-jeu non géré</h3>
          <p>Le type “{prochain.type}” n’est pas encore implémenté côté front.</p>
        </section>
      )}
    </div>
  );
}
