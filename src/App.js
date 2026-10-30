import React, { useState, useEffect } from 'react';

const BUTTON_DELTAS = [1, 2, 4, -1, -2, -4];
const playerColors = [
  "#e6194b", // red
  "#3cb44b", // green
  "#ffe119", // yellow
  "#4363d8", // blue
  "#f58231", // orange
  "#911eb4", // purple
  "#46f0f0", // cyan
  "#f032e6", // magenta
];

// Cores dos campos
const FIELD_COLORS = {
  pc: '#e6194b', // Coletivo - vermelho
  pi: '#4363d8', // Individual - azul
};
const FIELD_NAMES = {
  pc: 'Coletivo',
  pi: 'Individual',
};

// ---------- PlayerRow: mesmo estilo do player, com dois lados ----------
function PlayerRow({ player, onAdjust, gameOver }) {
  const isEliminated = player.status === 'lost';
  const isWinner = player.status === 'won';

  return (
    <div
      style={{
        ...styles.playerContainer,
        backgroundColor: isEliminated
          ? '#f5f5f5'
          : isWinner
          ? '#d0f5d0'
          : '#fff',
        opacity: isEliminated || gameOver ? 0.6 : 1,
      }}
    >
      <div style={styles.playerTitle}>
        <div style={{ color: player.color, fontWeight: 'bold' }}>
          {player.name} {isWinner ? '🏆' : isEliminated ? '❌' : ''}
        </div>
      </div>
      <div style={styles.countersContainer}>
        {/* Lado Coletivo (vermelho) */}
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
            color={FIELD_COLORS.pc}
          />
        </div>
        <div style={styles.separator} />
        {/* Lado Individual (azul) */}
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
            color={FIELD_COLORS.pi}
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

// ---------- GlobalAdjustPanel: mesmo layout, Coletivo | Individual ----------
function GlobalAdjustPanel({ onApply, onDeclareWinner, gameOver, players }) {
  const activePlayers = players.filter((p) => p.status === 'playing');

  return (
    <div style={styles.playerContainer}>
      <div style={styles.playerTitle}>
        <div style={{ color: '#333', fontWeight: 'bold', fontSize: 20 }}>
          Ajuste Global
        </div>
      </div>
      <div style={styles.countersContainer}>
        {/* Lado Coletivo (vermelho) */}
        <div style={styles.counterSection}>
          <div style={{ ...styles.counterLabel, color: FIELD_COLORS.pc }}>
            {FIELD_NAMES.pc}
          </div>
          <div style={{ ...styles.counterValue, color: FIELD_COLORS.pc }}>
            —
          </div>
          <ButtonsRow
            onPress={(delta) => onApply('pc', delta)}
            disabled={gameOver || activePlayers.length === 0}
            color={FIELD_COLORS.pc}
          />
        </div>
        <div style={styles.separator} />
        {/* Lado Individual (azul) */}
        <div style={styles.counterSection}>
          <div style={{ ...styles.counterLabel, color: FIELD_COLORS.pi }}>
            {FIELD_NAMES.pi}
          </div>
          <div style={{ ...styles.counterValue, color: FIELD_COLORS.pi }}>
            —
          </div>
          <ButtonsRow
            onPress={(delta) => onApply('pi', delta)}
            disabled={gameOver || activePlayers.length === 0}
            color={FIELD_COLORS.pi}
          />
        </div>
      </div>
    </div>
  );
}

// ---------- Histórico ----------
function HistoryLog({ history }) {
  if (history.length === 0) return null;
  return (
    <div style={styles.historyContainer}>
      <div style={styles.historyTitle}>📜 Histórico</div>
      <div style={styles.historyList}>
        {history.map((h, i) => (
          <div
            key={i}
            style={{
              ...styles.historyItem,
              borderLeft: `4px solid ${FIELD_COLORS[h.field] || '#999'}`,
            }}
          >
            <span style={styles.historyTime}>{h.time}</span>
            <span style={styles.historyText}>{h.text}</span>
          </div>
        ))}
      </div>
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
  const [tiebreakMessage, setTiebreakMessage] = useState(null);
  const [history, setHistory] = useState([]);

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
    setTiebreakMessage(null);
    setHistory([]);
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
      pushHistory(`Moeda jogada: ${result}`);
      setTimeout(() => {
        setCoin(null);
      }, 1000);
    }, 1000);
  };

  // helper para registrar histórico
  function pushHistory(text) {
    const time = new Date().toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    setHistory((prev) => [{ time, text, key: Date.now() + Math.random() }, ...prev].slice(0, 30));
  }

  useEffect(() => {
    if (winner) {
      alert(`Vitória de ${winner}!`);
    }
  }, [winner]);

  // Lógica central de verificação (mesma do anterior)
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

  function finalizeWinners(winners, tiebreakWinnerId, logText) {
    if (winners.length === 0) return;

    if (winners.length === 1) {
      setWinner(winners[0].name);
      setTiebreakMessage(null);
      pushHistory(`${logText} → 🏆 ${winners[0].name} venceu!`);
      return;
    }

    const names = winners.map((w) => w.name).join(', ');

    if (tiebreakWinnerId != null) {
      const tieWinner = winners.find((w) => w.id === tiebreakWinnerId);
      if (tieWinner) {
        setWinner(`${tieWinner.name} (desempate por carta)`);
        setTiebreakMessage(
          `Empate entre: ${names}. Vencedor por desempate (quem jogou a carta): ${tieWinner.name}`
        );
        pushHistory(
          `${logText} → Empate (${names}). Desempate: ${tieWinner.name} jogou a carta e venceu!`
        );
        return;
      }
    }

    setTiebreakMessage(
      `Empate entre: ${names}. Ganha quem jogou a carta.`
    );
    setWinner(null);
    pushHistory(`${logText} → Empate entre: ${names}.`);
  }

  function adjustPoints(id, field, delta) {
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
      finalizeWinners(winners, null, logText);
      return evaluated;
    });
  }

  function adjustAll(field, delta) {
    setPlayers((prev) => {
      const updated = prev.map((p) => {
        if (p.status !== 'playing') return p;
        const newVal = Math.max(0, p[field] + delta);
        return { ...p, [field]: newVal };
      });

      const { updated: evaluated, winners } = evaluateState(updated);
      const sign = delta > 0 ? `+${delta}` : `${delta}`;
      const logText = `Todos: ${FIELD_NAMES[field]} ${sign}`;
      finalizeWinners(winners, null, logText);
      return evaluated;
    });
  }

  function declareTiebreakWinner(playerId) {
    setPlayers((prev) => {
      const { updated: evaluated, winners } = evaluateState(prev);
      finalizeWinners(winners, playerId, 'Desempate');
      return evaluated;
    });
  }

  function restartGame() {
    setPlayers((prev) =>
      prev.map((p) => ({
        ...p,
        pc: 30,
        pi: 15,
        status: 'playing',
      }))
    );
    setWinner(null);
    setTiebreakMessage(null);
    setMoeda('N/A');
    setQtdmoeda(0);
    setHistory([]);
    pushHistory('Jogo reiniciado.');
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

          <HistoryLog history={history} />
        </div>
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
  },
  homeContainer: {
    textAlign: 'center',
  },
  playerSetupRow: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: 8,
    alignItems: 'center',
  },
  nameInput: {
    fontSize: 16,
    padding: 6,
    width: 200,
  },
  removeBtn: {
    marginLeft: 8,
    background: 'red',
    color: 'white',
    border: 'none',
    borderRadius: 4,
    cursor: 'pointer',
    padding: '4px 8px',
  },
  startBtn: {
    fontSize: 16,
    padding: '8px 16px',
    cursor: 'pointer',
  },
  gameContainer: {},
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  headerBtn: {
    fontSize: 16,
    padding: '8px 12px',
    cursor: 'pointer',
  },
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
  counterSection: {
    flex: 1,
    textAlign: 'center',
  },
  counterLabel: {
    fontSize: 16,
    marginBottom: 6,
    fontWeight: '700',
  },
  counterValue: {
    fontWeight: '700',
    fontSize: 36,
    marginBottom: 12,
  },
  buttonsRow: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  btn: {
    padding: '8px 14px',
    borderRadius: 6,
    border: '0px solid #ccc',
    backgroundColor: '#eee',
    cursor: 'pointer',
    minWidth: 44,
    fontWeight: '600',
    fontSize: 16,
  },
  separator: {
    width: 1,
    backgroundColor: '#ccc',
    margin: '0 12px',
  },
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
  tiebreakPlayers: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 8,
  },
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

  // --- Histórico ---
  historyContainer: {
    marginTop: 24,
    border: '1px solid #ccc',
    borderRadius: 10,
    padding: 12,
    backgroundColor: '#fafafa',
  },
  historyTitle: {
    fontWeight: '700',
    fontSize: 16,
    marginBottom: 8,
    color: '#333',
  },
  historyList: {
    maxHeight: 220,
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  historyItem: {
    padding: '6px 10px',
    backgroundColor: '#fff',
    borderRadius: 4,
    fontSize: 13,
    display: 'flex',
    gap: 8,
    alignItems: 'center',
  },
  historyTime: {
    color: '#888',
    fontSize: 11,
    fontVariantNumeric: 'tabular-nums',
    minWidth: 60,
  },
  historyText: {
    color: '#222',
  },
};