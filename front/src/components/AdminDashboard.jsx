import { useEffect, useState } from 'react';
import { apiGet } from '../api';

function statusLabel(session) {
  if (!session) return 'Chargement';
  const doneCount = session.suivis?.filter((s) => s.termine).length ?? 0;
  if (doneCount === 0) return 'En attente';
  if (doneCount === (session.suivis?.length ?? 0)) return 'Terminée';
  return 'En cours';
}

function statusClass(session) {
  const label = statusLabel(session);
  if (label === 'Terminée') return 'done';
  if (label === 'En cours') return 'active';
  return 'pending';
}

export default function AdminDashboard({ sessionId, sessionPin, adminEmail, onCreateAnother }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadSession() {
    try {
      setError('');
      setLoading(true);
      const data = await apiGet(`/api/sessions/${sessionId}/state`);
      setSession(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSession();
    const interval = setInterval(loadSession, 4000);
    return () => clearInterval(interval);
  }, [sessionId]);

  const suivis = session?.suivis ?? [];
  const doneCount = suivis.filter((s) => s.termine).length;
  const progress = suivis.length ? (doneCount / suivis.length) * 100 : 0;

  return (
    <div className="layout-stack" style={{ width: 'min(1100px, 100%)', margin: '0 auto' }}>
      <section className="glass-card" style={{ padding: 26 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <p style={{ marginTop: 0, opacity: 0.72 }}>Panneau d’administration</p>
            <h2 style={{ marginBottom: 8 }}>Session active créée</h2>
            <p style={{ margin: 0, opacity: 0.72 }}>Admin connecté : {adminEmail}</p>
          </div>

          <div className="actions-row">
            <button className="secondary-btn" onClick={loadSession}>
              Actualiser
            </button>
            <button className="primary-btn" onClick={onCreateAnother}>
              Créer une autre session
            </button>
          </div>
        </div>
      </section>

      {error && <div className="error-box">{error}</div>}

      <div className="stat-grid">
        <div className="stat-card glass-card">
          <small>Code PIN à partager</small>
          <strong>{sessionPin}</strong>
        </div>
        <div className="stat-card glass-card">
          <small>Numéro de session</small>
          <strong>{sessionId}</strong>
        </div>
        <div className="stat-card glass-card">
          <small>État</small>
          <div className={`status-chip ${statusClass(session)}`}>{statusLabel(session)}</div>
        </div>
        <div className="stat-card glass-card">
          <small>Joueur connecté</small>
          <strong style={{ fontSize: '1.05rem' }}>{session?.joueur?.pseudo || 'Aucun joueur'}</strong>
        </div>
      </div>

      <section className="glass-card" style={{ padding: 26 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <div>
            <h3 style={{ marginTop: 0 }}>Progression de la mission</h3>
            <p style={{ margin: 0, opacity: 0.72 }}>
              Les joueurs peuvent utiliser le code PIN <strong>{sessionPin}</strong> pour rejoindre la partie.
            </p>
          </div>
          <div className="status-chip active">Score session : {session?.score ?? 0}</div>
        </div>

        <div style={{ marginTop: 18 }}>
          <div className="progress">
            <span style={{ width: `${progress}%` }} />
          </div>
          <p style={{ marginBottom: 0, opacity: 0.74 }}>{doneCount} / {suivis.length} mini-jeux terminés</p>
        </div>
      </section>

      <section className="glass-card" style={{ padding: 26 }}>
        <h3 style={{ marginTop: 0 }}>État des parties</h3>
        {loading && <p>Chargement de l’état de la session...</p>}

        {!loading && suivis.length === 0 && <p>Aucun mini-jeu trouvé pour cette session.</p>}

        {!loading && suivis.length > 0 && (
          <div className="layout-stack">
            {suivis
              .slice()
              .sort((a, b) => a.ordre - b.ordre)
              .map((suivi) => (
                <div key={suivi.id} className="mini-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                    <div>
                      <p style={{ margin: '0 0 6px', opacity: 0.62, textTransform: 'uppercase', fontSize: 12 }}>
                        Jeu {suivi.ordre}
                      </p>
                      <h4 style={{ margin: 0 }}>{suivi.nom}</h4>
                      <p style={{ margin: '6px 0 0', opacity: 0.72 }}>
                        Type : {suivi.type} · Durée max : {suivi.dureeMax ?? '—'}
                      </p>
                    </div>
                    <div className={`status-chip ${suivi.termine ? 'done' : 'pending'}`}>
                      {suivi.termine ? 'Terminé' : 'Non commencé'}
                    </div>
                  </div>

                  <div className="stat-grid" style={{ marginTop: 14 }}>
                    <div className="stat-card">
                      <small>Score</small>
                      <strong>{suivi.score}</strong>
                    </div>
                    <div className="stat-card">
                      <small>Temps</small>
                      <strong>{suivi.temps}s</strong>
                    </div>
                    <div className="stat-card">
                      <small>Cosmétiques triés</small>
                      <strong>{suivi.nbCosmetiqueAtt ?? 0}</strong>
                    </div>
                    <div className="stat-card">
                      <small>Non-cosmétiques triés</small>
                      <strong>{suivi.nbNonCosmetiqueAtt ?? 0}</strong>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </section>
    </div>
  );
}
