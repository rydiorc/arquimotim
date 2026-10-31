import React, { useState, useEffect, useRef } from 'react';

const BUTTON_DELTAS = [1, 2, 4, -1, -2, -4];
const playerColors = [
  "#e6194b",
  "#3cb44b",
  "#ffe119",
  "#4363d8",
  "#f58231",
  "#911eb4",
  "#46f0f0",
  "#f032e6",
];

const FIELD_COLORS = {
  pc: '#d32f2f', // Coletivo - vermelho
  pi: '#1976d2', // Individual - azul
  pcBtn: '#ffc5c5', // Coletivo - vermelho
  piBtn: '#c5e2ff', // Individual - azul
};
const FIELD_NAMES = {
  pc: 'Coletivo',
  pi: 'Individual',
};

// ---------- Confetes ----------
function Confetti({ active }) {
  const [pieces, setPieces] = useState([]);

  useEffect(() => {
    if (!active) {
      setPieces([]);
      return;
    }
    const colors = ['#e6194b', '#3cb44b', '#ffe119', '#4363d8', '#f58231', '#911eb4', '#46f0f0', '#f032e6'];
    const newPieces = Array.from({ length: 80 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 2,
      duration: 2 + Math.random() * 2,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: 6 + Math.random() * 8,
      rotate: Math.random() * 360,
      shape: Math.random() < 0.5 ? '50%' : '0',
    }));
    setPieces(newPieces);

    const timer = setTimeout(() => setPieces([]), 6000);
    return () => clearTimeout(timer);
  }, [active]);

  if (pieces.length === 0) return null;

  return (
    <div style={confettiStyles.container}>
      {pieces.map((p) => (
        <div
          key={p.id}
          style={{
            position: 'absolute',
            left: `${p.left}%`,
            top: '-20px',
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            borderRadius: p.shape,
            transform: `rotate(${p.rotate}deg)`,
            animation: `confettiFall ${p.duration}s linear ${p.delay}s forwards`,
            opacity: 0.9,
          }}
        />
      ))}
      <style>{`
        @keyframes confettiFall {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

const confettiStyles = {
  container: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
    overflow: 'hidden',
    zIndex: 999,
  },
};

// ---------- Popup de Vencedor ----------
function WinnerPopup({ winner, onClose }) {
  if (!winner) return null;
  return (
    <>
      <Confetti active={!!winner} />
      <div style={winnerStyles.overlay}>
        <div style={winnerStyles.popup}>
          <div style={winnerStyles.crown}>👑</div>
          <div style={winnerStyles.title}>Vitória!</div>
          <div style={winnerStyles.name}>{winner}</div>
          <button onClick={onClose} style={winnerStyles.closeBtn}>
            Fechar
          </button>
        </div>
      </div>
    </>
  );
}

const winnerStyles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  popup: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: '40px 60px',
    textAlign: 'center',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
    animation: 'popIn 0.4s ease-out',
    border: '4px solid #ffd700',
    maxWidth: '90%',
  },
  crown: {
    fontSize: 80,
    marginBottom: 8,
    animation: 'bounce 1s infinite',
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#ffd700',
    textShadow: '2px 2px 4px rgba(0,0,0,0.2)',
    marginBottom: 8,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 20,
  },
  closeBtn: {
    padding: '10px 28px',
    fontSize: 16,
    fontWeight: '700',
    backgroundColor: '#4363d8',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    cursor: 'pointer',
  },
};

// ---------- PlayerRow ----------
function PlayerRow({ player, onAdjust, gameOver }) {
  const isEliminated = player.status === 'lost';
  const isWinner = player.status === 'won';

  return (
    <div
      style={{
        ...styles.playerContainer,
        backgroundColor: isEliminated ? '#f5f5f5' : isWinner ? '#d0f5d0' : '#fff',
        opacity: isEliminated || gameOver ? 0.6 : 1,
      }}
    >
      <div style={styles.playerTitle}>
        <div style={{ color: player.color, fontWeight: 'bold' }}>
          {player.name} {isWinner ? '🏆' : isEliminated ? '❌' : ''}
        </div>
      </div>
      <div style={styles.countersContainer}>
        <div style={styles.counterSection}>
          <div style={{ ...styles.counterLabel, color: FIELD_COLORS.pc }}>
            {FIELD_NAMES.pc}
          </div>
          <div style={{ ...styles.counterValue, color: FIELD_COLORS.pc }}>
            {player.pc}
          </div>
          <ButtonsRow
            onPress={(delta) => onAdjust(player.id, 'pc', delta)}
            disabled={isEliminated || gameOver}
            color={FIELD_COLORS.pcBtn}
          />
        </div>
        <div style={styles.separator} />
        <div style={styles.counterSection}>
          <div style={{ ...styles.counterLabel, color: FIELD_COLORS.pi }}>
            {FIELD_NAMES.pi}
          </div>
          <div style={{ ...styles.counterValue, color: FIELD_COLORS.pi }}>
            {player.pi}
          </div>
          <ButtonsRow
            onPress={(delta) => onAdjust(player.id, 'pi', delta)}
            disabled={isEliminated || gameOver}
            color={FIELD_COLORS.piBtn}
          />
        </div>
      </div>
    </div>
  );
}

function ButtonsRow({ onPress, disabled, color }) {
  return (
    <div style={styles.buttonsRow}>
      {BUTTON_DELTAS.map((d) => (
        <button
          key={d}
          onClick={() => !disabled && onPress(d)}
          style={{
            ...styles.btn,
            color: d > 0 ? 'green' : 'red',
            borderColor: color,
            backgroundColor:color,
            cursor: disabled ? 'not-allowed' : 'pointer',
            opacity: disabled ? 0.4 : 1,
          }}
          disabled={disabled}
        >
          {d > 0 ? `+${d}` : d}
        </button>
      ))}
    </div>
  );
}

// ---------- GlobalAdjustPanel ----------
function GlobalAdjustPanel({ onApply, onDeclareWinner, gameOver, players }) {
  const activePlayers = players.filter((p) => p.status === 'playing');

  return (
    <div style={styles.playerContainer}>
      <div style={styles.playerTitle}>
        <div style={{ color: '#333', fontWeight: 'bold', fontSize: 20 }}>
          Todos:
        </div>
      </div>
      <div style={styles.countersContainer}>
        <div style={styles.counterSection}>
          <div style={{ ...styles.counterLabel, color: FIELD_COLORS.pc }}>
            {FIELD_NAMES.pc}
          </div>
          <ButtonsRow
            onPress={(delta) => onApply('pc', delta)}
            disabled={gameOver || activePlayers.length === 0}
            color={FIELD_COLORS.pcBtn}
          />
        </div>
        <div style={styles.separator} />
        <div style={styles.counterSection}>
          <div style={{ ...styles.counterLabel, color: FIELD_COLORS.pi }}>
            {FIELD_NAMES.pi}
          </div>
          <ButtonsRow
            onPress={(delta) => onApply('pi', delta)}
            disabled={gameOver || activePlayers.length === 0}
            color={FIELD_COLORS.piBtn}
          />
        </div>
      </div>
    </div>
  );
}

// ---------- Histórico ----------
function HistoryLog({ history, onUndo, canUndo }) {
  return (
    <div style={styles.historyContainer}>
      <div style={styles.historyHeader}>
        <div style={styles.historyTitle}>📜 Histórico</div>
        <button
          onClick={onUndo}
          disabled={!canUndo}
          style={{
            ...styles.undoBtn,
            opacity: canUndo ? 1 : 0.4,
            cursor: canUndo ? 'pointer' : 'not-allowed',
          }}
        >
          ↩ Desfazer última jogada
        </button>
      </div>
      {history.length === 0 ? (
        <div style={styles.historyEmpty}>Nenhuma ação registrada ainda.</div>
      ) : (
        <div style={styles.historyList}>
          {history.map((h) => (
            <div
              key={h.key}
              style={{
                ...styles.historyItem,
                borderLeft: `4px solid ${FIELD_COLORS[h.field] || '#999'}`,
              }}
            >
              <span style={styles.historyTime}>{h.time}</span>
              {h.scope && (
                <span
                  style={{
                    ...styles.scopeBadge,
                    backgroundColor:
                      h.scope === 'global' ? '#ffe0b2' : '#e3f2fd',
                    color: h.scope === 'global' ? '#e65100' : '#0d47a1',
                  }}
                >
                  {h.scope === 'global' ? '🌐 Global' : '👤 Jogador'}
                </span>
              )}
              <span style={styles.historyText}>{h.text}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [screen, setScreen] = useState('home');
  const [moeda, setMoeda] = useState(null);
  const [coin, setCoin] = useState(null);
  const [qtdmoeda, setQtdmoeda] = useState(0);
  const [flipping, setFlipping] = useState(false);
  const [playerConfigs, setPlayerConfigs] = useState([
    { id: 1, name: 'Jogador 1' },
    { id: 2, name: 'Jogador 2' },
  ]);
  const [players, setPlayers] = useState([]);
  const [winner, setWinner] = useState(null);
  const [showWinnerPopup, setShowWinnerPopup] = useState(false);
  const [tiebreakMessage, setTiebreakMessage] = useState(null);
  const [history, setHistory] = useState([]);
  const snapshotStackRef = useRef([]);

  function addPlayer() {
    if (playerConfigs.length >= 8) return;
    const newId = playerConfigs.length + 1;
    setPlayerConfigs([...playerConfigs, { id: newId, name: `Jogador ${newId}` }]);
  }

  function removePlayer(id) {
    setPlayerConfigs((prev) => prev.filter((p) => p.id !== id));
  }

  function updatePlayerName(id, newName) {
    setPlayerConfigs((prev) =>
      prev.map((p) => (p.id === id ? { ...p, name: newName } : p))
    );
  }

  function startGame() {
    const initialPlayers = playerConfigs.map((p, i) => ({
      id: p.id,
      name: p.name.trim() || `Player ${p.id}`,
      pc: 30,
      pi: 15,
      status: 'playing',
      color: playerColors[i % playerColors.length],
    }));
    setPlayers(initialPlayers);
    setScreen('game');
    setWinner(null);
    setShowWinnerPopup(false);
    setTiebreakMessage(null);
    setHistory([]);
    snapshotStackRef.current = [];
  }

  function pushHistory(text, field, scope = null) {
    const time = new Date().toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    setHistory((prev) =>
      [
        { time, text, field, scope, key: Date.now() + Math.random() },
        ...prev,
      ].slice(0, 100)
    );
  }

  function pushSnapshot() {
    snapshotStackRef.current.push({
      players: players.map((p) => ({ ...p })),
      history: [...history],
      winner,
      tiebreakMessage,
      showWinnerPopup,
    });
  }

  function undo() {
    const snap = snapshotStackRef.current.pop();
    if (!snap) return;
    setPlayers(snap.players);
    setHistory(snap.history);
    setWinner(snap.winner);
    setTiebreakMessage(snap.tiebreakMessage);
    setShowWinnerPopup(snap.showWinnerPopup);
  }

  const flipCoin = () => {
    setFlipping(true);
    setMoeda('Jogando...');

    setTimeout(() => {
      const result = Math.random() < 0.5 ? 'Cara' : 'Coroa';
      setMoeda(result === 'Cara' ? result + ' (+)' : result + ' (0)');
      setCoin(result);
      setQtdmoeda((prev) => prev + 1);
      setFlipping(false);
      pushHistory(`Moeda jogada: ${result}`, null, 'global');
      setTimeout(() => {
        setCoin(null);
      }, 1000);
    }, 1000);
  };

  function evaluateState(updated) {
    let winners = [];

    updated = updated.map((p) => {
      if (p.status !== 'playing') return p;
      if (p.pc >= 60 || p.pi <= 0) {
        winners.push({ id: p.id, name: p.name });
        return { ...p, status: 'won' };
      }
      return p;
    });

    if (winners.length > 0) {
      updated = updated.map((p) => {
        if (p.status === 'won') return p;
        return { ...p, status: 'lost' };
      });
      return { updated, winners };
    }

    updated = updated.map((p) => {
      if (p.status !== 'playing') return p;
      if (p.pc <= p.pi) {
        return { ...p, status: 'lost' };
      }
      return p;
    });

    const activePlayers = updated.filter((p) => p.status === 'playing');
    if (activePlayers.length === 1) {
      winners = [{ id: activePlayers[0].id, name: activePlayers[0].name }];
      const survivorId = activePlayers[0].id;
      updated = updated.map((p) =>
        p.id === survivorId
          ? { ...p, status: 'won' }
          : { ...p, status: 'lost' }
      );
    }

    return { updated, winners };
  }

  function finalizeWinners(winners, tiebreakWinnerId, logText, field, scope) {
    if (winners.length === 0) return;

    if (winners.length === 1) {
      setWinner(winners[0].name);
      setShowWinnerPopup(true);
      setTiebreakMessage(null);
      pushHistory(`${logText} → 🏆 ${winners[0].name} venceu!`, field, scope);
      return;
    }

    const names = winners.map((w) => w.name).join(', ');

    if (tiebreakWinnerId != null) {
      const tieWinner = winners.find((w) => w.id === tiebreakWinnerId);
      if (tieWinner) {
        setWinner(tieWinner.name);
        setShowWinnerPopup(true);
        setTiebreakMessage(
          `Empate entre: ${names}. Vencedor por desempate (quem jogou a carta): ${tieWinner.name}`
        );
        pushHistory(
          `${logText} → Empate (${names}). Desempate: ${tieWinner.name} jogou a carta e venceu!`,
          field,
          scope
        );
        return;
      }
    }

    setTiebreakMessage(
      `Empate entre: ${names}. O vencedor é quem jogou a carta ou Fez a maior pontuação.`
    );
    setWinner(null);
    setShowWinnerPopup(false);
    pushHistory(
      `${logText} → Empate entre: ${names}.`,
      field,
      scope
    );
  }

  // Ajuste individual: registra UM item só para o jogador
  function adjustPoints(id, field, delta) {
    pushSnapshot();
    setPlayers((prev) => {
      const target = prev.find((p) => p.id === id);
      const updated = prev.map((p) => {
        if (p.id !== id) return p;
        const newVal = Math.max(0, p[field] + delta);
        return { ...p, [field]: newVal };
      });

      const { updated: evaluated, winners } = evaluateState(updated);
      const sign = delta > 0 ? `+${delta}` : `${delta}`;
      const logText = `${target.name}: ${FIELD_NAMES[field]} ${sign}`;
      finalizeWinners(winners, null, logText, field, 'player');
      return evaluated;
    });
  }

  // Ajuste global: registra UM item POR JOGADOR afetado + 1 cabeçalho global
  function adjustAll(field, delta) {
    pushSnapshot();
    setPlayers((prev) => {
      const activeBefore = prev.filter((p) => p.status === 'playing');
      const updated = prev.map((p) => {
        if (p.status !== 'playing') return p;
        const newVal = Math.max(0, p[field] + delta);
        return { ...p, [field]: newVal };
      });

      const { updated: evaluated, winners } = evaluateState(updated);
      const sign = delta > 0 ? `+${delta}` : `${delta}`;

      // Registra o cabeçalho global
      pushHistory(
        `🌐 Todos: ${FIELD_NAMES[field]} ${sign}`,
        field,
        'global'
      );

      // Registra cada jogador individualmente
      activeBefore.forEach((p) => {
        pushHistory(
          `   └ ${p.name}: ${FIELD_NAMES[field]} ${sign}`,
          field,
          'player'
        );
      });

      finalizeWinners(
        winners,
        null,
        `Global: ${FIELD_NAMES[field]} ${sign}`,
        field,
        'global'
      );
      return evaluated;
    });
  }

  function declareTiebreakWinner(playerId) {
    pushSnapshot();
    setPlayers((prev) => {
      const { updated: evaluated, winners } = evaluateState(prev);
      finalizeWinners(winners, playerId, 'Desempate', null, 'player');
      return evaluated;
    });
  }

  function restartGame() {
    pushSnapshot();
    setPlayers((prev) =>
      prev.map((p) => ({
        ...p,
        pc: 30,
        pi: 15,
        status: 'playing',
      }))
    );
    setWinner(null);
    setShowWinnerPopup(false);
    setTiebreakMessage(null);
    setMoeda('N/A');
    setQtdmoeda(0);
    pushHistory('Jogo reiniciado.', null, 'global');
  }

  return (
    <div style={styles.appContainer}>
      {screen === 'home' && (
        <div style={styles.homeContainer}>
          <h1>Configurar Jogadores</h1>
          <button
            onClick={addPlayer}
            style={{
              ...styles.startBtn,
              marginBottom: 12,
              opacity: playerConfigs.length >= 8 ? 0.5 : 1,
            }}
            disabled={playerConfigs.length >= 8}
          >
            Adicionar Jogador
          </button>
          {playerConfigs.map((p, idx) => (
            <div key={p.id} style={styles.playerSetupRow}>
              <input
                type="text"
                value={p.name}
                onChange={(e) => updatePlayerName(p.id, e.target.value)}
                style={styles.nameInput}
              />
              {idx >= 2 && (
                <button
                  onClick={() => removePlayer(p.id)}
                  style={styles.removeBtn}
                >
                  X
                </button>
              )}
            </div>
          ))}
          <button
            onClick={startGame}
            style={{ ...styles.startBtn, marginTop: 20 }}
          >
            Novo Jogo
          </button>
        </div>
      )}

      {screen === 'game' && (
        <div style={styles.gameContainer}>
          <header style={styles.header}>
            <button onClick={restartGame} style={styles.headerBtn}>
              Reiniciar Jogo
            </button>
            <button onClick={flipCoin} style={styles.headerBtn}>
              Jogar uma moeda
            </button>
            <button onClick={() => setScreen('home')} style={styles.headerBtn}>
              Novo Jogo
            </button>
          </header>

          <div>
            <p style={{ display: 'flex', alignItems: 'center' }}>
              Última moeda (nº {qtdmoeda}): {moeda}
              {flipping ? (
                <img
                  src={`${process.env.PUBLIC_URL}/flipcoin.gif`}
                  alt="Flipping..."
                  width="70"
                  style={{ marginLeft: 20 }}
                />
              ) : coin ? (
                <img
                  src={`${process.env.PUBLIC_URL}/${coin}.png`}
                  alt={coin}
                  width="70"
                  style={{ marginLeft: 20 }}
                />
              ) : (
                <div style={{ height: '70px', width: '70px' }}></div>
              )}
            </p>
          </div>

          {tiebreakMessage && (
            <div style={styles.tiebreakMessage}>{tiebreakMessage}</div>
          )}

          <GlobalAdjustPanel
            onApply={adjustAll}
            onDeclareWinner={declareTiebreakWinner}
            gameOver={players.some((p) => p.status === 'won')}
            players={players}
          />

          <div>
            {players.map((player) => (
              <PlayerRow
                key={player.id}
                player={player}
                onAdjust={adjustPoints}
                gameOver={players.some((p) => p.status === 'won')}
              />
            ))}
          </div>

          <HistoryLog
            history={history}
            onUndo={undo}
            canUndo={snapshotStackRef.current.length > 0}
          />
        </div>
      )}

      {showWinnerPopup && (
        <WinnerPopup
          winner={winner}
          onClose={() => setShowWinnerPopup(false)}
        />
      )}
    </div>
  );
}

const styles = {
  appContainer: {
    fontFamily: 'Arial, sans-serif',
    maxWidth: 700,
    margin: '20px auto',
    padding: 10,
    paddingBottom: 300,
  },
  homeContainer: { textAlign: 'center' },
  playerSetupRow: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: 8,
    alignItems: 'center',
  },
  nameInput: { fontSize: 16, padding: 6, width: 200 },
  removeBtn: {
    marginLeft: 8,
    background: 'red',
    color: 'white',
    border: 'none',
    borderRadius: 4,
    cursor: 'pointer',
    padding: '4px 8px',
  },
  startBtn: { fontSize: 16, padding: '8px 16px', cursor: 'pointer' },
  gameContainer: {},
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  headerBtn: { fontSize: 16, padding: '8px 12px', cursor: 'pointer' },
  playerContainer: {
    border: '1px solid #ccc',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  playerTitle: {
    fontWeight: '600',
    fontSize: 20,
    marginBottom: 12,
    textAlign: 'center',
  },
  countersContainer: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  counterSection: { flex: 1, textAlign: 'center' },
  counterLabel: { fontSize: 16, marginBottom: 6, fontWeight: '700' },
  counterValue: { fontWeight: '700', fontSize: 36, marginBottom: 12 },
  buttonsRow: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  btn: {
    padding: '8px 14px',
    borderRadius: 6,
    border: '2px solid #ccc',
    backgroundColor: '#eee',
    cursor: 'pointer',
    minWidth: 44,
    fontWeight: '600',
    fontSize: 16,
  },
  separator: { width: 1, backgroundColor: '#ccc', margin: '0 12px' },
  tiebreakSection: {
    marginTop: 16,
    paddingTop: 12,
    borderTop: '1px dashed #aab',
  },
  tiebreakLabel: {
    fontWeight: '700',
    fontSize: 15,
    marginBottom: 8,
    color: '#333',
  },
  tiebreakPlayers: { display: 'flex', flexWrap: 'wrap', gap: 8 },
  tiebreakBtn: {
    padding: '8px 16px',
    borderRadius: 8,
    border: '2px solid',
    backgroundColor: '#fff',
    cursor: 'pointer',
    fontWeight: '700',
    fontSize: 14,
  },
  tiebreakMessage: {
    padding: 12,
    marginBottom: 16,
    backgroundColor: '#fff3cd',
    border: '1px solid #ffc107',
    borderRadius: 8,
    fontWeight: '600',
    color: '#856404',
    textAlign: 'center',
  },
  historyContainer: {
    marginTop: 24,
    border: '1px solid #ccc',
    borderRadius: 10,
    padding: 12,
    backgroundColor: '#fafafa',
  },
  historyHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    flexWrap: 'wrap',
    gap: 8,
  },
  historyTitle: { fontWeight: '700', fontSize: 16, color: '#333' },
  undoBtn: {
    padding: '6px 12px',
    fontSize: 13,
    fontWeight: '700',
    backgroundColor: '#ff9800',
    color: '#fff',
    border: 'none',
    borderRadius: 6,
  },
  historyEmpty: {
    fontSize: 13,
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 8,
  },
  historyList: {
    maxHeight: 300,
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  historyItem: {
    padding: '6px 10px',
    backgroundColor: '#fff',
    borderRadius: 4,
    fontSize: 13,
    display: 'flex',
    gap: 8,
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  historyTime: {
    color: '#888',
    fontSize: 11,
    fontVariantNumeric: 'tabular-nums',
    minWidth: 60,
  },
  scopeBadge: {
    fontSize: 10,
    fontWeight: '700',
    padding: '2px 6px',
    borderRadius: 4,
    whiteSpace: 'nowrap',
  },
  historyText: { color: '#222' },
};