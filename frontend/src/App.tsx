import { useEffect, useState, useRef } from 'react'
import { BrowserRouter, Routes, Route, useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { io, Socket } from 'socket.io-client'

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL ||
  (window.location.hostname === 'localhost'
    ? 'http://localhost:3001'
    : `http://${window.location.hostname}:3001`);

type Player = {
  id: string;
  nickname: string;
  isHost: boolean;
};

type GameResult = { winner: 'spy' | 'players', reason: string };

function Lobby() {
  const { t, i18n } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [socket, setSocket] = useState<Socket | null>(null);
  const [roomId, setRoomId] = useState(searchParams.get('room') || '');
  const [nickname, setNickname] = useState('');
  const [joined, setJoined] = useState(false);
  const [players, setPlayers] = useState<Player[]>([]);

  // Game State
  const [gameState, setGameState] = useState<'lobby' | 'playing' | 'voting' | 'finished'>('lobby');
  const [secretRole, setSecretRole] = useState<any>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [gameResult, setGameResult] = useState<GameResult | null>(null);
  const [votes, setVotes] = useState<Record<string, string>>({});
  const [endTime, setEndTime] = useState<number | null>(null);
  const [eliminated, setEliminated] = useState<string[]>([]);
  const [showWelcome, setShowWelcome] = useState(true);

  // Guess State
  const [showGuessModal, setShowGuessModal] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<string>('');

  // Settings
  const [timeLimitMinutes, setTimeLimitMinutes] = useState(5);
  const [spyCount, setSpyCount] = useState(1);

  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const roomParam = searchParams.get('room');
    const savedNickname = sessionStorage.getItem('nickname');
    if (roomParam) setRoomId(roomParam);
    if (savedNickname) setNickname(savedNickname);
    
    if (savedNickname && roomParam) {
      setTimeout(() => { if (formRef.current) formRef.current.requestSubmit(); }, 300);
    }
  }, []);

  useEffect(() => {
    const handleMouseUp = () => setIsRevealed(false);
    if (isRevealed) {
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchend', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isRevealed]);

  // Clean, isolated Timer Logic
  useEffect(() => {
    if (gameState === 'playing' && endTime) {
      const interval = setInterval(() => {
        const now = Date.now();
        const remaining = Math.max(0, Math.floor((endTime - now) / 1000));
        setTimeRemaining(remaining);
        if (remaining <= 0) {
           clearInterval(interval);
           if (amIHost && socket) {
              socket.emit('time_up', { roomId });
           }
        }
      }, 1000);
      
      // Update immediately
      setTimeRemaining(Math.max(0, Math.floor((endTime - Date.now()) / 1000)));
      return () => clearInterval(interval);
    }
  }, [gameState, endTime]);

  useEffect(() => {
    if (socket) {
      socket.on('lobby_update', (currentPlayers: Player[]) => setPlayers(currentPlayers));
      socket.on('game_status', (status) => setGameState(status));

      socket.on('game_started', (data) => {
        setGameState(data.status);
        setShowGuessModal(false);
        setGameResult(null);
        setVotes({});
        setEliminated([]);
        
        const absoluteEndTime = data.startTime + (data.timeLimitSeconds * 1000);
        setEndTime(absoluteEndTime);
      });

      socket.on('secret_role_assigned', (data) => setSecretRole(data));
      socket.on('game_ended', (data) => {
        setGameState('finished');
        setGameResult(data);
      });
      socket.on('vote_update', (data) => setVotes(data));
      socket.on('eliminated_update', (data) => setEliminated(data));

      return () => {
        socket.off('lobby_update');
        socket.off('game_status');
        socket.off('game_started');
        socket.off('secret_role_assigned');
        socket.off('game_ended');
        socket.off('vote_update');
      };
    }
  }, [socket]);

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomId.trim() || !nickname.trim()) return;
    sessionStorage.setItem('nickname', nickname);
    const newSocket = io(SOCKET_URL);
    setSocket(newSocket);
    newSocket.emit('join_room', { roomId, nickname }, (response: { success: boolean, players: Player[], status: string }) => {
      if (response.success) {
        setJoined(true);
        setPlayers(response.players);
        setGameState(response.status as any);
        setSearchParams({ room: roomId });
      }
    });
  };

  const startGame = () => socket && socket.emit('start_game', { roomId, timeLimitSeconds: timeLimitMinutes * 60, spyCount });  
  
  const triggerAccuse = () => socket && socket.emit('accuse_player', { roomId });
  const castVote = (votedPlayerId: string) => socket && socket.emit('cast_vote', { roomId, votedPlayerId });
  const submitGuess = () => socket && selectedLocation && socket.emit('spy_guess', { roomId, selectedLocationId: selectedLocation });
  const backToLobby = () => socket && socket.emit('back_to_lobby', { roomId });

  const leaveRoom = () => {
    if (socket) socket.disconnect();
    setSocket(null);
    setJoined(false);
    setPlayers([]);
    setSearchParams({});
    setGameState('lobby');
  };

  const currentLang = i18n.language.split('-')[0];
  const isMe = (id: string) => socket?.id === id;
  const amIHost = socket && players.find(p => p.id === socket.id)?.isHost;

  const handleCreateNewRoom = () => {
    const randomCode = Math.floor(1000 + Math.random() * 9000).toString();
    setRoomId(randomCode);
  };

  return (
    <div className="app-container" style={{ justifyContent: 'flex-start' }}>

      {/* Welcome Ice Breaking Pop-up */}
      {showWelcome && (
        <div className="modal-overlay">
          <div className="modal-content pop-anim" style={{ textAlign: 'center' }}>
            <h2 style={{ color: 'var(--color-matcha-deep)', fontSize: '22px', fontWeight: 700, marginBottom: '16px' }}>
              {t('welcome_title')}
            </h2>
            <div style={{
              width: '130px',
              height: '130px',
              borderRadius: '50%',
              background: '#2c2c2c',
              border: '3px solid #4a4a4a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px auto',
              overflow: 'hidden',
              boxShadow: '0 4px 20px rgba(0,0,0,0.25)'
            }}>
              <img
                src="/attika_logo.jpg"
                alt="Attika Logo"
                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
              />
            </div>
            <p style={{ fontSize: '15px', lineHeight: '1.7', color: 'var(--color-text)', marginBottom: '8px' }}>
              {t('welcome_body')}
            </p>
            <p style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-matcha-dark)', marginBottom: '6px' }}>
              {t('welcome_footer')} 🌙
            </p>
            <p style={{ fontSize: '13px', color: 'var(--color-text-light)', marginBottom: '28px' }}>- by Atom</p>
            <button className="primary-btn" onClick={() => setShowWelcome(false)}>
              {t('welcome_btn')}
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', maxWidth: '400px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', fontSize: '20px', color: 'var(--color-matcha-deep)' }}>
          {gameState === 'playing' || gameState === 'voting' ? (
             <>⏱️ {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}</>
          ) : (gameState === 'lobby' && joined ? (
             <>Room: #{roomId}</>
          ) : (
             <>☕ SPYFALL</>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '4px' }}>
          <button className="secondary-btn" style={{ padding: '6px 10px', fontSize: '12px' }} onClick={() => i18n.changeLanguage('th')}>TH</button>
          <button className="secondary-btn" style={{ padding: '6px 10px', fontSize: '12px' }} onClick={() => i18n.changeLanguage('en')}>EN</button>
          <button className="secondary-btn" style={{ padding: '6px 10px', fontSize: '12px' }} onClick={() => i18n.changeLanguage('zh')}>ZH</button>
        </div>
      </header>

      {/* Body */}
      <div className="card glass-panel" style={{ position: 'relative', overflow: 'visible', width: '100%' }}>
        {gameState === 'lobby' && (
          <>
            {!joined ? (
              <>
                <h1 className="text-center mb-6" style={{ color: 'var(--color-matcha-deep)' }}>SPYFALL: Who is the Spy?</h1>
                <form ref={formRef} onSubmit={handleJoin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <input type="text" className="input-field" value={roomId} placeholder={t('room_id')} onChange={e => setRoomId(e.target.value)} required />
                  <input type="text" className="input-field" value={nickname} placeholder={t('nickname')} onChange={e => setNickname(e.target.value)} required />
                  <button type="submit" className="primary-btn" style={{ marginTop: '8px' }}>JOIN GAME</button>
                </form>

                <div style={{ display: 'flex', alignItems: 'center', margin: '24px 0' }}>
                  <div style={{ flex: 1, height: '1px', background: 'var(--color-matcha-base)', opacity: 0.3 }}></div>
                  <span style={{ padding: '0 10px', color: 'var(--color-text-light)', fontSize: '14px', fontWeight: 600 }}>OR</span>
                  <div style={{ flex: 1, height: '1px', background: 'var(--color-matcha-base)', opacity: 0.3 }}></div>
                </div>

                <button onClick={handleCreateNewRoom} className="secondary-btn" style={{ width: '100%' }}>CREATE NEW ROOM</button>
              </>
            ) : (
              <div>
                <div className="mb-6" style={{ background: 'var(--color-matcha-light)', padding: '16px', borderRadius: 'var(--border-radius-md)' }}>
                  <h3 className="mb-4" style={{ display: 'flex', justifyContent: 'space-between'}}>
                    <span>Players Joined:</span> <span>{players.length}</span>
                  </h3>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '250px', overflowY: 'auto' }}>
                    {players.map((p, idx) => {
                      const isEliminated = eliminated.includes(p.id);
                      return (
                        <li key={p.id} style={{ display: 'flex', alignItems: 'center', padding: '8px 12px', background: isEliminated ? '#f2f2f2' : 'white', borderRadius: '4px', textDecoration: isEliminated ? 'line-through' : 'none', opacity: isEliminated ? 0.6 : 1 }}>
                          <span style={{ fontWeight: 500, marginRight: '8px' }}>{idx + 1}.</span>
                          <span>{p.nickname} {isMe(p.id) ? `(${t('you')})` : ''} {isEliminated && '☠️'}</span>
                          {p.isHost && !isEliminated && <span style={{ marginLeft: 'auto' }}>👑</span>}
                        </li>
                      );
                    })}
                  </ul>

                  {!amIHost && (
                    <div className="mt-4 text-center pulse-hover" style={{ color: 'var(--color-text-light)', fontSize: '14px', marginTop: '16px' }}>
                       ⏳ Loading Spinner... Waiting for Host
                    </div>
                  )}
                </div>

                {amIHost && (
                  <div className="mb-6">
                    <div style={{ display: 'flex', alignItems: 'center', margin: '24px 0 16px 0' }}>
                      <div style={{ flex: 1, height: '1px', background: 'var(--color-matcha-base)', opacity: 0.3 }}></div>
                      <span style={{ padding: '0 10px', color: 'var(--color-text-light)', fontSize: '13px', fontWeight: 600 }}>Host Settings (Visible to Host only)</span>
                      <div style={{ flex: 1, height: '1px', background: 'var(--color-matcha-base)', opacity: 0.3 }}></div>
                    </div>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                       <span style={{ fontWeight: 500 }}>Time Limit:</span>
                       <select className="input-field" style={{ width: 'auto', padding: '6px 12px' }} value={timeLimitMinutes} onChange={e => setTimeLimitMinutes(Number(e.target.value))}>
                          <option value={3}>3 Minutes</option>
                          <option value={5}>5 Minutes</option>
                          <option value={7}>7 Minutes</option>
                          <option value={10}>10 Minutes</option>
                       </select>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                       <span style={{ fontWeight: 500 }}>Spy Count:</span>
                       <select className="input-field" style={{ width: 'auto', padding: '6px 12px' }} value={spyCount} onChange={e => setSpyCount(Number(e.target.value))}>
                          <option value={1}>1 Spy</option>
                          <option value={2}>2 Spies</option>
                          <option value={3}>3 Spies</option>
                       </select>
                    </div>

                    <button onClick={startGame} className="primary-btn pulse-hover">START GAME</button>
                  </div>
                )}
                
                <button onClick={leaveRoom} className="secondary-btn" style={{ width: '100%', marginTop: amIHost ? '0' : '16px', color: '#d9534f', borderColor: '#d9534f' }}>
                  {t('leave_room')}
                </button>
              </div>
            )}
          </>
        )}

        {(gameState === 'playing' || gameState === 'voting') && !secretRole && joined && (
          <div style={{ textAlign: 'center', padding: '40px 20px', width: '100%' }}>
             <h2 className="mb-4" style={{ color: 'var(--color-matcha-deep)' }}>{t('game_in_progress')}</h2>
             <p style={{ color: 'var(--color-text-light)' }}>{t('please_wait')}</p>
          </div>
        )}

        {(gameState === 'playing' || gameState === 'voting') && secretRole && (
          <div style={{ textAlign: 'center', width: '100%' }}>
            <div style={{ margin: '40px 0', minHeight: '220px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                {isRevealed ? (
                  <div className="secret-card pop-anim">
                    {secretRole.isSpy ? (
                      <div>
                        <h3 style={{ color: '#d9534f', fontSize: '28px', margin: '12px 0' }}>You are the... SPY! 🕵️</h3>
                        <p style={{ color: 'var(--color-text-light)' }}>(Blend in and guess the location!)</p>
                      </div>
                    ) : (
                      <div style={{ textAlign: 'left', minWidth: '200px' }}>
                        <p className="mb-4" style={{ fontSize: '18px' }}><strong style={{ color: 'var(--color-matcha-deep)'}}>Location:</strong><br/> <span style={{fontSize: '22px'}}>{secretRole.location ? secretRole.location[`name_${currentLang}`] : ''}</span></p>
                        <p style={{ fontSize: '18px' }}><strong style={{color: 'var(--color-matcha-deep)'}}>Role:</strong><br/> <span style={{fontSize: '22px'}}>{secretRole.role ? secretRole.role[`name_${currentLang}`] : ''}</span></p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <h3 style={{ fontWeight: 600, fontSize: '20px' }}>🔒 Hidden Info</h3>
                    <p style={{ color: 'var(--color-text-light)', marginBottom: '32px' }}>Keep your screen hidden from others</p>
                    <button 
                      className="primary-btn pulse-btn" 
                      onMouseDown={() => setIsRevealed(true)}
                      onTouchStart={() => setIsRevealed(true)}
                      style={{ 
                        borderRadius: '50%', width: '180px', height: '180px', 
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '18px', boxShadow: '0 10px 25px rgba(74, 102, 74, 0.4)',
                        userSelect: 'none', WebkitUserSelect: 'none',
                        margin: '0 auto', padding: '20px', lineHeight: '1.4'
                      }}>
                      PRESS AND HOLD<br/>TO REVEAL ROLE
                    </button>
                  </div>
                )}
            </div>

            {eliminated.includes(socket.id) ? (
               <div style={{ marginTop: '20px', padding: '20px', background: '#ffebee', borderRadius: '8px', color: '#d9534f' }}>
                  <h3 style={{ fontWeight: 'bold', marginBottom: '8px' }}>☠️ YOU ARE ELIMINATED</h3>
                  <p>You can no longer vote, accuse, or participate. Wait for the game to end!</p>
               </div>
            ) : (
              <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                 <button onClick={triggerAccuse} className="secondary-btn" style={{ fontWeight: 'bold' }}>PAUSE & ACCUSE (Vote to catch Spy)</button>
                 {secretRole.isSpy && (
                   <button onClick={() => setShowGuessModal(true)} className="primary-btn" style={{ fontWeight: 'bold' }}>REVEAL & GUESS LOCATION</button>
                 )}
              </div>
            )}
          </div>
        )}

        {/* Voting Modal */}
        {gameState === 'voting' && (
          <div className="secret-card pop-anim" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 10, display: 'flex', flexDirection: 'column', backgroundColor: 'rgba(255,255,255,0.95)' }}>
            <h2 className="mb-4 text-center" style={{ color: 'var(--color-matcha-deep)' }}>{t('vote_question')}</h2>
            
            <div style={{ flex: 1, overflowY: 'auto' }}>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {players.map(p => {
                  const isEliminated = eliminated.includes(p.id);
                  const amIEliminated = eliminated.includes(socket?.id || '');
                  return (
                    <li key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: isEliminated ? '#f2f2f2' : 'var(--color-matcha-light)', borderRadius: '8px', opacity: isEliminated ? 0.6 : 1 }}>
                       <span style={{ fontWeight: 500, textDecoration: isEliminated ? 'line-through' : 'none' }}>{p.nickname} {isMe(p.id) ? `(${t('you')})` : ''} {isEliminated && '☠️'}</span>
                       <div>
                         {isEliminated ? (
                           <span style={{ color: '#d9534f', fontWeight: 'bold' }}>Eliminated</span>
                         ) : votes[socket?.id || ''] === p.id ? (
                           <span style={{ color: 'var(--color-matcha-deep)', fontWeight: 'bold' }}>{t('voted')}</span>
                         ) : (
                           <button onClick={() => !amIEliminated && castVote(p.id)} disabled={amIEliminated || votes[socket?.id || ''] !== undefined} className="primary-btn" style={{ padding: '6px 12px', width: 'auto', background: amIEliminated ? '#ccc' : '' }}>{t('vote')}</button>
                         )}
                       </div>
                    </li>
                  );
                })}
              </ul>
            </div>
            
            <p className="text-center mt-4" style={{ marginTop: '20px', color: 'var(--color-text-light)' }}>
              {t('waiting_for_votes', { count: Object.keys(votes).length, total: players.filter(p => !eliminated.includes(p.id)).length })} ({Object.keys(votes).length}/{players.filter(p => !eliminated.includes(p.id)).length})
            </p>
          </div>
        )}

        {/* Finished Phase */}
        {gameState === 'finished' && gameResult && (
          <div className="secret-card pop-anim" style={{ textAlign: 'center' }}>
            <h2 className="mb-6" style={{ fontSize: '32px' }}>{t('game_over')}</h2>
            <h3 style={{ color: gameResult.winner === 'spy' ? '#d9534f' : 'var(--color-matcha-deep)', fontSize: '24px', marginBottom: '20px' }}>
              {gameResult.winner === 'spy' ? t('spy_wins') : t('players_win')}
            </h3>
            <p className="mb-6" style={{ color: '#666' }}>{gameResult.reason}</p>
            {amIHost && (
              <button onClick={backToLobby} className="primary-btn">{t('back_to_lobby')}</button>
            )}
          </div>
        )}

        {/* Guess Modal Overlay (Spy Only in Playing mode) */}
        {showGuessModal && (gameState === 'playing' || gameState === 'voting') && (
           <div className="secret-card pop-anim" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 20, display: 'flex', flexDirection: 'column', backgroundColor: 'rgba(255,255,255,0.95)' }}>
             <h3 className="mb-4 text-center">{t('guess_location')}</h3>
             <select 
                className="input-field mb-4" 
                value={selectedLocation} 
                onChange={(e) => setSelectedLocation(e.target.value)}
             >
                <option value="" disabled>{t('select_location')}</option>
                {secretRole?.allLocations?.map((loc: any) => (
                  <option key={loc.id} value={loc.id}>{loc[`name_${currentLang}`]}</option>
                ))}
             </select>
             <button onClick={submitGuess} className="primary-btn mb-4">{t('submit_guess')}</button>
             <button onClick={() => setShowGuessModal(false)} className="secondary-btn">{t('release_to_hide')}</button>
           </div>
        )}

      </div>

      {/* Footer */}
      {gameState === 'lobby' && !joined && (
        <footer style={{ marginTop: 'auto', paddingTop: '40px', paddingBottom: '20px', fontSize: '12px', color: 'var(--color-text-light)', textAlign: 'center' }}>
          © 2026 Powered by <a href="https://www.facebook.com/attikastudiocnx" target="_blank" rel="noreferrer" style={{ color: 'var(--color-matcha-dark)', textDecoration: 'none', fontWeight: 'bold' }}>Attika Studio</a>
        </footer>
      )}

    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Lobby />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
