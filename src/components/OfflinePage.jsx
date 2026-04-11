import React, { useState, useEffect, useRef } from 'react';
import { WifiOff, RefreshCw, Play, Trophy, ChevronLeft } from 'lucide-react';

const GRID_SIZE = 20;
const INITIAL_SNAKE = [{ x: 10, y: 10 }];
const INITIAL_DIRECTION = { x: 0, y: -1 }; // moving up
const INITIAL_SPEED = 150;

const OfflinePage = () => {
  const [hasLoadedOnline, setHasLoadedOnline] = useState(navigator.onLine);
  
  // Game States
  const [view, setView] = useState('offline'); // 'offline', 'playing', 'gameover'
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [direction, setDirection] = useState(INITIAL_DIRECTION);
  const [food, setFood] = useState({ x: 5, y: 5 });
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  
  // Refs to avoid stale closures in setInterval
  const snakeRef = useRef(snake);
  const directionRef = useRef(direction);
  
  useEffect(() => {
    snakeRef.current = snake;
    directionRef.current = direction;
  }, [snake, direction]);

  useEffect(() => {
    if (hasLoadedOnline) return;

    const handleOnline = () => {
      setHasLoadedOnline(true);
    };

    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('online', handleOnline);
    };
  }, [hasLoadedOnline]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Prevent default scrolling for arrow keys while playing
      if (view === 'playing' && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }

      if (view !== 'playing') return;
      
      const currentDir = directionRef.current;
      
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          if (currentDir.y !== 1) setDirection({ x: 0, y: -1 });
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          if (currentDir.y !== -1) setDirection({ x: 0, y: 1 });
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          if (currentDir.x !== 1) setDirection({ x: -1, y: 0 });
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          if (currentDir.x !== -1) setDirection({ x: 1, y: 0 });
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown, { passive: false });
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [view]);

  // Game Loop
  useEffect(() => {
    if (view !== 'playing') return;

    const moveSnake = () => {
      const currentSnake = [...snakeRef.current];
      const head = { ...currentSnake[0] };
      const currentDir = directionRef.current;

      head.x += currentDir.x;
      head.y += currentDir.y;

      // Check collision with walls
      if (
        head.x < 0 ||
        head.x >= GRID_SIZE ||
        head.y < 0 ||
        head.y >= GRID_SIZE
      ) {
        setView('gameover');
        if (score > highScore) setHighScore(score);
        return;
      }

      // Check collision with self
      for (let i = 0; i < currentSnake.length; i++) {
        if (head.x === currentSnake[i].x && head.y === currentSnake[i].y) {
          setView('gameover');
          if (score > highScore) setHighScore(score);
          return;
        }
      }

      currentSnake.unshift(head);

      // Check collision with food
      setFood((prevFood) => {
        if (head.x === prevFood.x && head.y === prevFood.y) {
          setScore((s) => s + 10);
          return generateFood(currentSnake);
        } else {
          currentSnake.pop();
          return prevFood;
        }
      });
      
      setSnake(currentSnake);
    };

    // Speed increases slightly based on score
    const speed = Math.max(50, INITIAL_SPEED - Math.floor(score / 50) * 15);
    const interval = setInterval(moveSnake, speed);
    
    return () => clearInterval(interval);
  }, [view, score, highScore]);

  const generateFood = (currentSnake) => {
    let newFood;
    let isOccupied = true;
    while (isOccupied) {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
      // eslint-disable-next-line
      isOccupied = currentSnake.some((segment) => segment.x === newFood.x && segment.y === newFood.y);
    }
    return newFood;
  };

  const startGame = () => {
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    setScore(0);
    setFood(generateFood(INITIAL_SNAKE));
    setView('playing');
  };

  if (hasLoadedOnline) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 999999, // Cover entire screen
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#0a0a0a',
        color: '#ffffff',
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {view === 'offline' && (
        <div 
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            padding: '2rem',
            maxWidth: '500px',
            animation: 'fadeIn 0.5s ease-out'
          }}
        >
          <style>
            {`
              @keyframes fadeIn {
                from { opacity: 0; transform: scale(0.95); }
                to { opacity: 1; transform: scale(1); }
              }
            `}
          </style>

          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            padding: '1.5rem',
            borderRadius: '50%',
            marginBottom: '2rem',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            boxShadow: '0 0 40px rgba(239, 68, 68, 0.15)'
          }}>
            <WifiOff size={64} color="#ef4444" strokeWidth={1.5} />
          </div>
          
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: '700',
            marginBottom: '1rem',
            letterSpacing: '-0.02em',
            background: 'linear-gradient(135deg, #ffffff 0%, #a3a3a3 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            You're Offline
          </h1>
          
          <p style={{
            fontSize: '1.1rem',
            color: '#a3a3a3',
            lineHeight: '1.6',
            marginBottom: '2.5rem'
          }}>
            It seems you've lost your connection to the internet. Please check your network settings and ensure you are connected to continue using Whizan AI.
          </p>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button
              onClick={() => window.location.reload()}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                background: '#ffffff',
                color: '#000000',
                border: 'none',
                padding: '0.875rem 2rem',
                borderRadius: '9999px',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 4px 15px rgba(255, 255, 255, 0.1)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(255, 255, 255, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(255, 255, 255, 0.1)';
              }}
            >
              <RefreshCw size={18} />
              Try Again
            </button>
            
            {/* Play Game Button */}
            <button
              onClick={startGame}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                background: 'transparent',
                color: '#ffffff',
                border: '1px solid rgba(255,255,255,0.2)',
                padding: '0.875rem 2rem',
                borderRadius: '9999px',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              <Play size={18} fill="#ffffff" />
              Play Snake
            </button>
          </div>
        </div>    
      )}

      {(view === 'playing' || view === 'gameover') && (
        <div style={{ display: 'flex', flexDirection: 'column', width: '100%', alignItems: 'center', animation: 'fadeIn 0.5s ease-out', padding: '1rem' }}>
          
          {/* Header row with back btn and score */}
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', maxWidth: '450px', marginBottom: '1.5rem', alignItems: 'center' }}>
            <button
              onClick={() => setView('offline')}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#a3a3a3',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.95rem',
                padding: '0.5rem',
                marginLeft: '-0.5rem',
                transition: 'color 0.2s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#fff'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#a3a3a3'}
            >
              <ChevronLeft size={20} /> Back
            </button>
            
            <div style={{ display: 'flex', gap: '1.5rem', fontSize: '1.1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#a3a3a3' }}>
                Score: <span style={{ color: '#fff', fontWeight: 'bold' }}>{score}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#a3a3a3' }}>
                <Trophy size={16} color="#fbbf24" /> <span style={{ color: '#fbbf24', fontWeight: 'bold' }}>{highScore}</span>
              </div>
            </div>
          </div>

          {/* Game Board */}
          <div 
             style={{
               position: 'relative',
               width: '100%',
               maxWidth: '450px',
               aspectRatio: '1 / 1', // Perfect square
               backgroundColor: '#171717',
               border: '1px solid rgba(255,255,255,0.1)',
               borderRadius: '12px',
               overflow: 'hidden',
               boxShadow: '0 0 50px rgba(0,0,0,0.5), inset 0 0 20px rgba(0,0,0,0.5)'
             }}
          >
            {/* Grid Pattern (optional subtle background dots) */}
            <div style={{
              position: 'absolute', inset: 0,
              backgroundImage: 'radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px)',
              backgroundSize: `${100 / GRID_SIZE}% ${100 / GRID_SIZE}%`
            }} />

            {/* Food */}
            <div
              style={{
                position: 'absolute',
                width: `${100 / GRID_SIZE}%`,
                height: `${100 / GRID_SIZE}%`,
                left: `${(food.x / GRID_SIZE) * 100}%`,
                top: `${(food.y / GRID_SIZE) * 100}%`,
                backgroundColor: '#ef4444',
                borderRadius: '50%',
                boxShadow: '0 0 15px rgba(239,68,68,0.8)',
                transform: 'scale(0.8)',
              }}
            />

            {/* Snake */}
            {snake.map((segment, index) => (
              <div
                key={`${segment.x}-${segment.y}-${index}`}
                style={{
                  position: 'absolute',
                  width: `${100 / GRID_SIZE}%`,
                  height: `${100 / GRID_SIZE}%`,
                  left: `${(segment.x / GRID_SIZE) * 100}%`,
                  top: `${(segment.y / GRID_SIZE) * 100}%`,
                  backgroundColor: index === 0 ? '#10b981' : '#34d399',
                  borderRadius: index === 0 ? '6px' : '4px',
                  transform: index === 0 ? 'scale(0.95)' : 'scale(0.85)',
                  boxShadow: index === 0 ? '0 0 15px rgba(16, 185, 129, 0.6)' : 'none',
                  zIndex: index === 0 ? 10 : 1,
                  transition: 'left 0.05s linear, top 0.05s linear' // small trick for smooth movement visual
                }}
              />
            ))}

            {/* Game Over Overlay */}
            {view === 'gameover' && (
              <div 
                style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundColor: 'rgba(0,0,0,0.7)',
                  backdropFilter: 'blur(4px)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 20,
                  animation: 'fadeIn 0.3s ease-out'
                }}
              >
                <h2 style={{ fontSize: '2.5rem', color: '#fff', marginBottom: '0.5rem', fontWeight: 700 }}>Game Over</h2>
                <p style={{ color: '#a3a3a3', marginBottom: '2rem', fontSize: '1.1rem' }}>Final Score: {score}</p>
                <button
                  onClick={startGame}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    background: '#10b981', // green
                    color: '#000000',
                    border: 'none',
                    padding: '0.875rem 2rem',
                    borderRadius: '9999px',
                    fontSize: '1rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(16, 185, 129, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 15px rgba(16, 185, 129, 0.3)';
                  }}
                >
                  <RefreshCw size={18} /> Play Again
                </button>
              </div>
            )}
          </div>
          
          <p style={{ color: '#737373', fontSize: '0.9rem', marginTop: '1.5rem' }}>
            Use <strong style={{ color: '#a3a3a3' }}>Arrow Keys</strong> or <strong style={{ color: '#a3a3a3' }}>WASD</strong> to move. Avoid walls and your own tail!
          </p>
        </div>
      )}
    </div>
  );
};

export default OfflinePage;
