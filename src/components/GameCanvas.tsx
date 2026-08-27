import { useEffect, useRef } from 'react'
import { GRID_WIDTH, GRID_HEIGHT } from '../engine/types'
import type { Position } from '../engine/types'

const CELL = 24           // px per grid cell
const CANVAS_W = GRID_WIDTH * CELL
const CANVAS_H = GRID_HEIGHT * CELL

const COLOR = {
  bg: '#000000',
  grid: '#0a0a0a',
  snakeHead: '#FFE500',
  snakeBody: '#FFD700',
  snakeOutline: '#B8A000',
  food: '#FFFFFF',
  foodGlow: 'rgba(255,255,255,0.35)',
}

interface Props {
  snake: Position[]
  food: Position
}

export function GameCanvas({ snake, food }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Background
    ctx.fillStyle = COLOR.bg
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H)

    // Subtle grid lines
    ctx.strokeStyle = COLOR.grid
    ctx.lineWidth = 0.5
    for (let x = 0; x <= GRID_WIDTH; x++) {
      ctx.beginPath()
      ctx.moveTo(x * CELL, 0)
      ctx.lineTo(x * CELL, CANVAS_H)
      ctx.stroke()
    }
    for (let y = 0; y <= GRID_HEIGHT; y++) {
      ctx.beginPath()
      ctx.moveTo(0, y * CELL)
      ctx.lineTo(CANVAS_W, y * CELL)
      ctx.stroke()
    }

    // Food – white circle with soft glow
    const fx = food.x * CELL + CELL / 2
    const fy = food.y * CELL + CELL / 2
    const fr = CELL * 0.35

    // glow
    const grd = ctx.createRadialGradient(fx, fy, fr * 0.2, fx, fy, fr * 1.8)
    grd.addColorStop(0, COLOR.foodGlow)
    grd.addColorStop(1, 'transparent')
    ctx.fillStyle = grd
    ctx.beginPath()
    ctx.arc(fx, fy, fr * 1.8, 0, Math.PI * 2)
    ctx.fill()

    // solid dot
    ctx.fillStyle = COLOR.food
    ctx.beginPath()
    ctx.arc(fx, fy, fr, 0, Math.PI * 2)
    ctx.fill()

    // Snake segments (tail → body → head so head paints on top)
    for (let i = snake.length - 1; i >= 0; i--) {
      const seg = snake[i]
      const isHead = i === 0
      const padding = isHead ? 1 : 2
      const radius = isHead ? 5 : 3

      const rx = seg.x * CELL + padding
      const ry = seg.y * CELL + padding
      const rw = CELL - padding * 2
      const rh = CELL - padding * 2

      ctx.fillStyle = isHead ? COLOR.snakeHead : COLOR.snakeBody
      ctx.strokeStyle = COLOR.snakeOutline
      ctx.lineWidth = isHead ? 1.5 : 1

      roundRect(ctx, rx, ry, rw, rh, radius)
      ctx.fill()
      ctx.stroke()

      // Eyes on the head
      if (isHead) {
        ctx.fillStyle = '#000'
        const eyeSize = 3
        ctx.beginPath()
        ctx.arc(rx + rw * 0.3, ry + rh * 0.3, eyeSize, 0, Math.PI * 2)
        ctx.fill()
        ctx.beginPath()
        ctx.arc(rx + rw * 0.7, ry + rh * 0.3, eyeSize, 0, Math.PI * 2)
        ctx.fill()
      }
    }
  }, [snake, food])

  return (
    <canvas
      ref={canvasRef}
      width={CANVAS_W}
      height={CANVAS_H}
      style={{
        display: 'block',
        border: '2px solid #333',
        boxShadow: '0 0 32px rgba(255,215,0,0.15)',
      }}
    />
  )
}

/** Draws a rounded rectangle path on a CanvasRenderingContext2D. */
function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.arcTo(x + w, y, x + w, y + r, r)
  ctx.lineTo(x + w, y + h - r)
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r)
  ctx.lineTo(x + r, y + h)
  ctx.arcTo(x, y + h, x, y + h - r, r)
  ctx.lineTo(x, y + r)
  ctx.arcTo(x, y, x + r, y, r)
  ctx.closePath()
}
