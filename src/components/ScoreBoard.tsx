interface Props {
  score: number
  highScore: number
}

export function ScoreBoard({ score, highScore }: Props) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        width: '100%',
        padding: '10px 4px',
        boxSizing: 'border-box',
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '12px',
        color: '#FFD700',
        letterSpacing: '1px',
      }}
    >
      <span>SCORE&nbsp;&nbsp;{String(score).padStart(6, '0')}</span>
      <span>BEST&nbsp;&nbsp;{String(highScore).padStart(6, '0')}</span>
    </div>
  )
}
