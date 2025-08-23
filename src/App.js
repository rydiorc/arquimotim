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
        <div style={{ color: player.color, fontWeight: "bold" }}>
          {player.name} {isWinner ? '🏆' : isEliminated ? '❌' : ''}
        </div>
      </div>
      <div style={styles.countersContainer}>
        <div style={styles.counterSection}>
          <div style={styles.counterLabel}>PC</div>
          <div style={styles.counterValue}>{player.pc}</div>
          <ButtonsRow
            onPress={(delta) => onAdjust(player.id, 'pc', delta)}
            disabled={isEliminated || gameOver}
          />
        </div>
        <div style={styles.separator} />
        <div style={styles.counterSection}>
          <div style={styles.counterLabel}>PI</div>
          <div style={styles.counterValue}>{player.pi}</div>
          <ButtonsRow
            onPress={(delta) => onAdjust(player.id, 'pi', delta)}
            disabled={isEliminated || gameOver}
          />
        </div>
      </div>
    </div>
  );
}

function ButtonsRow({ onPress, disabled }) {
  return (
    <div style={styles.buttonsRow}>
      {BUTTON_DELTAS.map((d) => (
        <button
          key={d}
          onClick={() => !disabled && onPress(d)}
          style={{
            ...styles.btn,
            color: d > 0 ? 'green' : 'red',
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




export default function App() {

  const [screen, setScreen] = useState('home'); // 'home' or 'game'
  const [moeda, setMoeda] = useState(null); 
  const [coin, setCoin] = useState(null); 
  const [qtdmoeda, setQtdmoeda] = useState(0);
  const [flipping, setFlipping] = useState(false);
  const [playerConfigs, setPlayerConfigs] = useState([
    { id: 1, name: 'Jogador 1'},
    { id: 2, name: 'Jogador 2'},
  ]);
  const [players, setPlayers] = useState([]);

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
      status: 'playing', // playing, won, lost
      color: playerColors[i % playerColors.length],  // assign color here by index
    }));
    setPlayers(initialPlayers);
    setScreen('game');
  }

  const flipCoin = () => {
    setFlipping(true);
    setMoeda("Jogando...");

    setTimeout(() => {
      const result = Math.random() < 0.5 ? "Cara" : "Coroa";
      setMoeda(result === "Cara" ? result + " (+)" : result + " (0)");
      setCoin(result);
      setQtdmoeda((prev) => prev + 1)
      setFlipping(false);

      setTimeout(() => {
        setCoin(null);
      }, 1000);
    }, 1000);
  };

  // New state to track winner
  const [winner, setWinner] = useState(null);

  useEffect(() => {
    if (winner) {
      alert(`Vitória de ${winner}!`);
    }
  }, [winner]);

  function adjustPoints(id, field, delta) {
    setPlayers((prev) => {
      let updated = prev.map((p) => {
        if (p.id !== id) return p;
        const newVal = Math.max(0, p[field] + delta);
        return { ...p, [field]: newVal };
      });

      let winnerFound = null;

      // --- win check ---
      updated = updated.map((p) => {
        if (p.status !== 'playing') return p;
        if (p.pc >= 60 || p.pi <= 0) {
          if (!winnerFound) winnerFound = p.name;
          return { ...p, status: 'won' };
        }
        return p;
      });

      // --- lose check ---
      if (!winnerFound) {
        updated = updated.map((p) => {
          if (p.status !== 'playing') return p;
          if (p.pc <= p.pi) {
            return { ...p, status: 'lost' };
          }
          return p;
        });
      }

      // --- last survivor ---
      if (!winnerFound) {
        const activePlayers = updated.filter((p) => p.status === 'playing');
        if (activePlayers.length === 1) {
          winnerFound = activePlayers[0].name;
          updated = updated.map((p) =>
            p.id === activePlayers[0].id
              ? { ...p, status: 'won' }
              : { ...p, status: 'lost' }
          );
        }
      }

      if (winnerFound) {
        setWinner(winnerFound); // <-- trigger alert in useEffect
        updated = updated.map((p) =>
          p.status === 'won' ? p : { ...p, status: 'lost' }
        );
      }

      return updated;
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
    setMoeda("N/A");
    setQtdmoeda(0);
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
          <button onClick={startGame} style={{ ...styles.startBtn, marginTop: 20 }}>
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
            <p style={{display: "flex", alignItems: "center"}}>
              Última moeda (nº {qtdmoeda}): {moeda}
              {flipping ? (
                <img src={`${process.env.PUBLIC_URL}/flipcoin.gif`} alt="Flipping..." width="70" style={{ marginLeft: 20 }}/>
              ) : coin ? (
                <img src={`${process.env.PUBLIC_URL}/${coin}.png`} alt={coin} width="70" style={{ marginLeft: 20 }}/>
              ) : (
                <div style={{height: "70px", width: "70px"}}></div> // placeholder
              )}
            </p>
            
            
          </div>

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
    color: '#555',
    fontSize: 16,
    marginBottom: 6,
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
    border: '1px solid #ccc',
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
};
