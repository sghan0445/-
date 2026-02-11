
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { 
  CANVAS_WIDTH, 
  CANVAS_HEIGHT, 
  PADDLE_WIDTH, 
  PADDLE_HEIGHT, 
  PADDLE_SPEED,
  BALL_RADIUS,
  INITIAL_BALL_SPEED,
  BRICK_ROWS,
  BRICK_COLS,
  BRICK_WIDTH,
  BRICK_HEIGHT,
  BRICK_PADDING,
  BRICK_OFFSET_TOP,
  BRICK_OFFSET_LEFT,
  COLORS
} from '../constants';
import { GameStatus, GameState, Ball, Paddle, Brick } from '../types';

interface GameCanvasProps {
  gameState: GameState;
  onScoreUpdate: (points: number) => void;
  onLifeLost: () => void;
  onLevelComplete: () => void;
}

const GameCanvas: React.FC<GameCanvasProps> = ({ 
  gameState, 
  onScoreUpdate, 
  onLifeLost, 
  onLevelComplete 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>();
  
  // Game Entities
  const ballRef = useRef<Ball>({
    x: CANVAS_WIDTH / 2,
    y: CANVAS_HEIGHT - 50,
    dx: INITIAL_BALL_SPEED,
    dy: -INITIAL_BALL_SPEED,
    radius: BALL_RADIUS,
    speed: INITIAL_BALL_SPEED,
    color: COLORS.BALL
  });

  const paddleRef = useRef<Paddle>({
    x: (CANVAS_WIDTH - PADDLE_WIDTH) / 2,
    y: CANVAS_HEIGHT - PADDLE_HEIGHT - 10,
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT,
    speed: PADDLE_SPEED,
    isMovingLeft: false,
    isMovingRight: false,
    color: COLORS.PADDLE
  });

  const bricksRef = useRef<Brick[]>([]);

  // Initialize Bricks
  const initBricks = useCallback(() => {
    const bricks: Brick[] = [];
    for (let r = 0; r < BRICK_ROWS; r++) {
      for (let c = 0; c < BRICK_COLS; c++) {
        const x = c * (BRICK_WIDTH + BRICK_PADDING) + BRICK_OFFSET_LEFT;
        const y = r * (BRICK_HEIGHT + BRICK_PADDING) + BRICK_OFFSET_TOP;
        bricks.push({
          x,
          y,
          width: BRICK_WIDTH,
          height: BRICK_HEIGHT,
          strength: 1,
          points: 10 * (BRICK_ROWS - r),
          alive: true,
          color: COLORS.BRICKS[r % COLORS.BRICKS.length]
        });
      }
    }
    bricksRef.current = bricks;
  }, []);

  // Reset Ball and Paddle
  const resetBall = useCallback(() => {
    ballRef.current = {
      ...ballRef.current,
      x: paddleRef.current.x + paddleRef.current.width / 2,
      y: paddleRef.current.y - BALL_RADIUS,
      dx: INITIAL_BALL_SPEED * (Math.random() > 0.5 ? 1 : -1),
      dy: -INITIAL_BALL_SPEED,
      speed: INITIAL_BALL_SPEED + (gameState.level * 0.5)
    };
  }, [gameState.level]);

  // Handle Input
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!canvasRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();
      const relativeX = e.clientX - rect.left;
      if (relativeX > 0 && relativeX < CANVAS_WIDTH) {
        paddleRef.current.x = relativeX - paddleRef.current.width / 2;
        
        // Boundaries
        if (paddleRef.current.x < 0) paddleRef.current.x = 0;
        if (paddleRef.current.x + paddleRef.current.width > CANVAS_WIDTH) {
          paddleRef.current.x = CANVAS_WIDTH - paddleRef.current.width;
        }
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Game Logic
  const update = useCallback(() => {
    if (gameState.status !== GameStatus.PLAYING) return;

    const ball = ballRef.current;
    const paddle = paddleRef.current;
    const bricks = bricksRef.current;

    // Move Ball
    ball.x += ball.dx;
    ball.y += ball.dy;

    // Wall Collisions
    if (ball.x + ball.radius > CANVAS_WIDTH || ball.x - ball.radius < 0) {
      ball.dx = -ball.dx;
    }
    if (ball.y - ball.radius < 0) {
      ball.dy = -ball.dy;
    }

    // Floor Collision (Life Lost)
    if (ball.y + ball.radius > CANVAS_HEIGHT) {
      onLifeLost();
      resetBall();
    }

    // Paddle Collision
    if (
      ball.y + ball.radius > paddle.y &&
      ball.x > paddle.x &&
      ball.x < paddle.x + paddle.width
    ) {
      // Impact point on paddle affects bounce angle
      const impact = (ball.x - (paddle.x + paddle.width / 2)) / (paddle.width / 2);
      ball.dx = impact * ball.speed;
      ball.dy = -Math.sqrt(Math.pow(ball.speed, 2) - Math.pow(ball.dx, 2));
    }

    // Brick Collision
    let allBricksDestroyed = true;
    for (let brick of bricks) {
      if (brick.alive) {
        allBricksDestroyed = false;
        if (
          ball.x + ball.radius > brick.x &&
          ball.x - ball.radius < brick.x + brick.width &&
          ball.y + ball.radius > brick.y &&
          ball.y - ball.radius < brick.y + brick.height
        ) {
          brick.alive = false;
          ball.dy = -ball.dy;
          onScoreUpdate(brick.points);
        }
      }
    }

    if (allBricksDestroyed) {
      onLevelComplete();
    }
  }, [gameState.status, onScoreUpdate, onLifeLost, resetBall, onLevelComplete]);

  // Rendering
  const draw = useCallback((ctx: CanvasRenderingContext2D) => {
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw Background Gradient
    const grad = ctx.createRadialGradient(
      CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, 0,
      CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, CANVAS_WIDTH
    );
    grad.addColorStop(0, '#1e293b');
    grad.addColorStop(1, '#0f172a');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw Bricks with Glow
    bricksRef.current.forEach(brick => {
      if (brick.alive) {
        ctx.shadowBlur = 10;
        ctx.shadowColor = brick.color;
        ctx.fillStyle = brick.color;
        ctx.beginPath();
        ctx.roundRect(brick.x, brick.y, brick.width, brick.height, 4);
        ctx.fill();
        
        // Inner highlight
        ctx.fillStyle = 'rgba(255,255,255,0.2)';
        ctx.fillRect(brick.x + 2, brick.y + 2, brick.width - 4, 2);
      }
    });

    // Reset shadow
    ctx.shadowBlur = 0;

    // Draw Paddle
    const paddle = paddleRef.current;
    ctx.shadowBlur = 15;
    ctx.shadowColor = paddle.color;
    ctx.fillStyle = paddle.color;
    ctx.beginPath();
    ctx.roundRect(paddle.x, paddle.y, paddle.width, paddle.height, 8);
    ctx.fill();

    // Draw Ball
    const ball = ballRef.current;
    ctx.shadowBlur = 20;
    ctx.shadowColor = ball.color;
    ctx.fillStyle = ball.color;
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowBlur = 0;
  }, []);

  // Animation Frame Loop
  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (ctx) {
      update();
      draw(ctx);
    }
    requestRef.current = requestAnimationFrame(animate);
  }, [update, draw]);

  // Initial Setup and Reset on Level Change
  useEffect(() => {
    initBricks();
    resetBall();
    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [gameState.level, initBricks, resetBall, animate]);

  return (
    <canvas 
      ref={canvasRef} 
      width={CANVAS_WIDTH} 
      height={CANVAS_HEIGHT}
      className="bg-slate-900 cursor-none block"
    />
  );
};

export default GameCanvas;
