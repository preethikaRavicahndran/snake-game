import { useSnakeGame } from './hooks/useSnakeGame'
import { GameCanvas } from './components/GameCanvas'
import { ScoreBoard } from './components/ScoreBoard'
import { Overlay } from './components/Overlay'

export default function App() {
  const {
    snake,
    food,
    score,
    highScore,
    gameState,
    start,
    pause,
    resume,
    changeDirection,
  } = useSnakeGame()

  return (
    <div
      style={{
        minHeight: '100dvh',
        background: '#0d0d0d',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'monospace',
        padding: '16px',
        boxSizing: 'border-box',
        gap: '0',
      }}
    >
      {/* Title */}
      <h1
        style={{
          fontFamily: '"Press Start 2P", monospace',
          fontSize: 'clamp(14px, 3vw, 22px)',
          color: '#FFD700',
          letterSpacing: '4px',
          margin: '0 0 12px',
          textShadow: '0 0 18px #FFD70088',
        }}
      >
        SNAKE
      </h1>

      {/* Scoreboard */}
      <div style={{ width: '480px', maxWidth: '100%' }}>
        <ScoreBoard score={score} highScore={highScore} />
      </div>

      {/* Game area */}
      <div
        style={{
          position: 'relative',
          lineHeight: 0,
          borderRadius: '4px',
          overflow: 'hidden',
          maxWidth: '100%',
        }}
      >
        <GameCanvas snake={snake} food={food} />
        <Overlay
          gameState={gameState}
          score={score}
          onStart={start}
          onResume={gameState === 'PLAYING' ? pause : resume}
          onChangeDirection={changeDirection}
        />
      </div>

      {/* Control hint bar */}
      <p
        style={{
          fontFamily: '"Press Start 2P", monospace',
          fontSize: '8px',
          color: '#444',
          marginTop: '14px',
          letterSpacing: '1px',
          textAlign: 'center',
        }}
      >
        ARROW KEYS / WASD &nbsp;·&nbsp; P / ESC = PAUSE
      </p>
    </div>
  )
}
