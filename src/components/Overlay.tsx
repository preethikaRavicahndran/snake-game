import type { GameState, Direction } from '../engine/types'

interface Props {
  gameState: GameState
  score: number
  onStart: () => void
  onResume: () => void
  onChangeDirection: (dir: Direction) => void
}

export function Overlay({ gameState, score, onStart, onResume, onChangeDirection }: Props) {
  const showPanel = gameState !== 'PLAYING'

  return (
    <>
      {/* ── Modal overlays ───────────────────────────────────────────── */}
      {showPanel && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '20px',
            background: 'rgba(0,0,0,0.75)',
            backdropFilter: 'blur(3px)',
            borderRadius: '4px',
            zIndex: 10,
          }}
        >
          {gameState === 'IDLE' && (
            <>
              <PixelText size={28} color="#FFD700">SNAKE</PixelText>
              <PixelText size={10} color="#aaa">Use Arrow Keys / WASD</PixelText>
              <ActionButton onClick={onStart} color="#FFD700">
                ▶ START
              </ActionButton>
            </>
          )}

          {gameState === 'PAUSED' && (
            <>
              <PixelText size={22} color="#FFD700">PAUSED</PixelText>
              <ActionButton onClick={onResume} color="#4fc3f7">
                ▶ RESUME
              </ActionButton>
              <PixelText size={9} color="#555">Press ESC or P to toggle</PixelText>
            </>
          )}

          {gameState === 'GAMEOVER' && (
            <>
              <PixelText size={22} color="#FF4444">GAME OVER</PixelText>
              <PixelText size={11} color="#FFD700">SCORE&nbsp;&nbsp;{String(score).padStart(6, '0')}</PixelText>
              <ActionButton onClick={onStart} color="#FFD700">
                ↺ RESTART
              </ActionButton>
            </>
          )}
        </div>
      )}

      {/* ── Pause / Resume button (visible while playing) ────────────── */}
      {gameState === 'PLAYING' && (
        <div
          style={{
            position: 'absolute',
            top: '6px',
            right: '6px',
            zIndex: 10,
          }}
        >
          <ActionButton onClick={onResume} color="#555" small>
            ⏸
          </ActionButton>
        </div>
      )}

      {/* ── Mobile touch D-pad (always rendered, visible on small screens) */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '4px',
          marginTop: '12px',
          userSelect: 'none',
        }}
        className="dpad"
      >
        <DpadButton label="▲" onClick={() => onChangeDirection('UP')} />
        <div style={{ display: 'flex', gap: '4px' }}>
          <DpadButton label="◀" onClick={() => onChangeDirection('LEFT')} />
          <div style={{ width: 44, height: 44 }} />
          <DpadButton label="▶" onClick={() => onChangeDirection('RIGHT')} />
        </div>
        <DpadButton label="▼" onClick={() => onChangeDirection('DOWN')} />
      </div>
    </>
  )
}

function PixelText({
  children,
  size,
  color,
}: {
  children: React.ReactNode
  size: number
  color: string
}) {
  return (
    <span
      style={{
        fontFamily: '"Press Start 2P", monospace',
        fontSize: `${size}px`,
        color,
        textShadow: `0 0 12px ${color}88`,
        textAlign: 'center',
        lineHeight: 1.6,
      }}
    >
      {children}
    </span>
  )
}

function ActionButton({
  children,
  onClick,
  color,
  small,
}: {
  children: React.ReactNode
  onClick: () => void
  color: string
  small?: boolean
}) {
  return (
    <button
      onClick={onClick}
      style={{
        background: 'transparent',
        border: `2px solid ${color}`,
        color,
        fontFamily: '"Press Start 2P", monospace',
        fontSize: small ? '12px' : '14px',
        padding: small ? '4px 8px' : '10px 24px',
        cursor: 'pointer',
        letterSpacing: '2px',
        transition: 'all 0.15s',
        outline: 'none',
        borderRadius: '3px',
        boxShadow: `0 0 8px ${color}44`,
      }}
      onMouseEnter={(e) => {
        ;(e.currentTarget as HTMLButtonElement).style.background = `${color}22`
        ;(e.currentTarget as HTMLButtonElement).style.boxShadow = `0 0 18px ${color}88`
      }}
      onMouseLeave={(e) => {
        ;(e.currentTarget as HTMLButtonElement).style.background = 'transparent'
        ;(e.currentTarget as HTMLButtonElement).style.boxShadow = `0 0 8px ${color}44`
      }}
    >
      {children}
    </button>
  )
}

function DpadButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onTouchStart={(e) => {
        e.preventDefault()
        onClick()
      }}
      onClick={onClick}
      style={{
        width: 44,
        height: 44,
        background: 'rgba(255,215,0,0.08)',
        border: '2px solid rgba(255,215,0,0.3)',
        color: '#FFD700',
        fontSize: '18px',
        cursor: 'pointer',
        borderRadius: '6px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        outline: 'none',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        touchAction: 'none',
      }}
    >
      {label}
    </button>
  )
}
