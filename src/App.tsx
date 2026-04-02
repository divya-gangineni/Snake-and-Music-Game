import React, { useState, useEffect, useRef, useCallback } from 'react';

// --- Types & Constants ---
type Point = { x: number; y: number };
type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

const GRID_SIZE = 20;
const INITIAL_SNAKE: Point[] = [
  { x: 10, y: 10 },
  { x: 10, y: 11 },
  { x: 10, y: 12 },
];
const INITIAL_DIRECTION: Direction = 'UP';
const GAME_SPEED = 60;

const TRACKS = [
  {
    id: 1,
    title: "ERR_0x001_CORRUPTION",
    artist: "SYS.ADMIN",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
  },
  {
    id: 2,
    title: "DATA_STREAM_INTERCEPT",
    artist: "UNKNOWN_ENTITY",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
  },
  {
    id: 3,
    title: "VOID_PROTOCOL",
    artist: "NULL_POINTER",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
  }
];

// --- Helper Functions ---
const generateFood = (snake: Point[]): Point => {
  let newFood: Point;
  while (true) {
    newFood = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    };
    const isOnSnake = snake.some(segment => segment.x === newFood.x && segment.y === newFood.y);
    if (!isOnSnake) break;
  }
  return newFood;
};

export default function App() {
  // --- Game State ---
  const [snake, setSnake] = useState<Point[]>(INITIAL_SNAKE);
  const [direction, setDirection] = useState<Direction>(INITIAL_DIRECTION);
  const [food, setFood] = useState<Point>({ x: 5, y: 5 });
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isGamePaused, setIsGamePaused] = useState(false);
  
  const directionRef = useRef(direction);
  const snakeRef = useRef(snake);
  const foodRef = useRef(food);
  const gameOverRef = useRef(gameOver);
  const isGamePausedRef = useRef(isGamePaused);

  // --- Music Player State ---
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => { directionRef.current = direction; }, [direction]);
  useEffect(() => { snakeRef.current = snake; }, [snake]);
  useEffect(() => { foodRef.current = food; }, [food]);
  useEffect(() => { gameOverRef.current = gameOver; }, [gameOver]);
  useEffect(() => { isGamePausedRef.current = isGamePaused; }, [isGamePaused]);

  // --- Game Logic ---
  const resetGame = () => {
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    setScore(0);
    setGameOver(false);
    setIsGamePaused(false);
    setFood(generateFood(INITIAL_SNAKE));
  };

  const moveSnake = useCallback(() => {
    if (gameOverRef.current || isGamePausedRef.current) return;

    const currentSnake = [...snakeRef.current];
    const head = { ...currentSnake[0] };
    const currentDir = directionRef.current;

    switch (currentDir) {
      case 'UP': head.y -= 1; break;
      case 'DOWN': head.y += 1; break;
      case 'LEFT': head.x -= 1; break;
      case 'RIGHT': head.x += 1; break;
    }

    if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
      setGameOver(true);
      return;
    }

    if (currentSnake.some(segment => segment.x === head.x && segment.y === head.y)) {
      setGameOver(true);
      return;
    }

    currentSnake.unshift(head);

    if (head.x === foodRef.current.x && head.y === foodRef.current.y) {
      setScore(s => {
        const newScore = s + 10;
        if (newScore > highScore) setHighScore(newScore);
        return newScore;
      });
      setFood(generateFood(currentSnake));
    } else {
      currentSnake.pop();
    }

    setSnake(currentSnake);
  }, [highScore]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }

      if (e.key === ' ') {
        setIsGamePaused(p => !p);
        return;
      }

      const currentDir = directionRef.current;
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          if (currentDir !== 'DOWN') setDirection('UP');
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          if (currentDir !== 'UP') setDirection('DOWN');
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          if (currentDir !== 'RIGHT') setDirection('LEFT');
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          if (currentDir !== 'LEFT') setDirection('RIGHT');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const gameInterval = setInterval(moveSnake, GAME_SPEED);
    return () => clearInterval(gameInterval);
  }, [moveSnake]);

  // --- Music Player Logic ---
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.5;
      if (isPlaying) {
        audioRef.current.play().catch(e => console.log("Audio play prevented:", e));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentTrackIndex]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = isMuted;
    }
  }, [isMuted]);

  const togglePlay = () => setIsPlaying(!isPlaying);
  
  const nextTrack = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % TRACKS.length);
    setIsPlaying(true);
  };
  
  const prevTrack = () => {
    setCurrentTrackIndex((prev) => (prev - 1 + TRACKS.length) % TRACKS.length);
    setIsPlaying(true);
  };

  const handleTrackEnd = () => {
    nextTrack();
  };

  const currentTrack = TRACKS[currentTrackIndex];

  return (
    <div className="min-h-screen bg-[#050505] text-cyan-400 font-retro flex flex-col items-center justify-center p-4 overflow-hidden relative selection:bg-fuchsia-500 selection:text-white crt-flicker">
      
      <div className="static-noise" />
      <div className="scanlines" />

      {/* Header */}
      <header className="mb-8 text-center z-10 glitch-wrapper screen-tear">
        <h1 
          className="text-6xl md:text-8xl font-black tracking-tighter mb-2 glitch-text uppercase border-b-4 border-fuchsia-500 pb-2 inline-block"
          data-text="SYS.OVERRIDE"
        >
          SYS.OVERRIDE
        </h1>
        <br />
        <p className="text-fuchsia-500 tracking-[0.3em] text-xl uppercase font-bold mt-2 bg-cyan-400/10 px-4 py-1 border border-cyan-400 inline-block">
          // PROTOCOL: SNAKE_EXEC
        </p>
      </header>

      <div className="flex flex-col lg:flex-row gap-8 items-center lg:items-start z-10 w-full max-w-6xl justify-center screen-tear">
        
        {/* Left Panel: Score & Instructions */}
        <div className="flex flex-col gap-6 w-full lg:w-64 order-2 lg:order-1">
          {/* Score Board */}
          <div className="bg-[#0a0a0a] border-2 border-cyan-400 p-6 relative overflow-hidden group shadow-[4px_4px_0_#ff00ff]">
            <div className="absolute top-0 left-0 w-full h-1 bg-fuchsia-500 animate-pulse" />
            
            <h2 className="text-2xl font-bold text-fuchsia-500 tracking-widest mb-4 border-b border-cyan-400/30 pb-2">
              &gt; MEMORY_ALLOC
            </h2>
            
            <div className="space-y-4">
              <div>
                <p className="text-cyan-600 text-lg uppercase tracking-widest mb-1">&gt; CURRENT_BYTES</p>
                <p className="text-6xl text-cyan-400 drop-shadow-[2px_2px_0_#ff00ff]">
                  {score.toString().padStart(4, '0')}
                </p>
              </div>
              <div>
                <p className="text-cyan-600 text-lg uppercase tracking-widest mb-1">&gt; PEAK_BYTES</p>
                <p className="text-4xl text-fuchsia-500 drop-shadow-[2px_2px_0_#00ffff]">
                  {highScore.toString().padStart(4, '0')}
                </p>
              </div>
            </div>
          </div>

          {/* Controls Info */}
          <div className="bg-[#0a0a0a] border-2 border-fuchsia-500 p-6 shadow-[4px_4px_0_#00ffff]">
            <h3 className="text-xl font-bold text-cyan-400 uppercase tracking-widest mb-4 border-b border-fuchsia-500/30 pb-2">
              &gt; INPUT_MAP
            </h3>
            <div className="grid grid-cols-1 gap-4 text-lg text-fuchsia-400">
              <div className="flex justify-between items-center border-b border-cyan-900 pb-1">
                <span>VECTOR_CTRL</span>
                <span className="text-cyan-400 bg-cyan-900/30 px-2 border border-cyan-400">W A S D</span>
              </div>
              <div className="flex justify-between items-center border-b border-cyan-900 pb-1">
                <span>ALT_VECTOR</span>
                <span className="text-cyan-400 bg-cyan-900/30 px-2 border border-cyan-400">ARROWS</span>
              </div>
              <div className="flex justify-between items-center">
                <span>HALT_EXEC</span>
                <span className="text-fuchsia-500 bg-fuchsia-900/30 px-2 border border-fuchsia-500">SPACE</span>
              </div>
            </div>
          </div>
        </div>

        {/* Center Panel: Game Board */}
        <div className="order-1 lg:order-2 relative">
          <div 
            className="bg-[#050505] border-4 border-cyan-400 relative"
            style={{
              width: GRID_SIZE * 20,
              height: GRID_SIZE * 20,
              boxShadow: gameOver ? '0 0 0 4px #ff00ff, 0 0 30px #ff00ff' : '8px 8px 0 #ff00ff'
            }}
          >
            {/* Grid Lines */}
            <div className="absolute inset-0" 
                 style={{
                   backgroundImage: 'linear-gradient(to right, #00ffff 1px, transparent 1px), linear-gradient(to bottom, #00ffff 1px, transparent 1px)',
                   backgroundSize: '20px 20px',
                   opacity: 0.1
                 }} 
            />

            {/* Food */}
            <div
              className="absolute bg-fuchsia-500 animate-pulse border border-white"
              style={{
                width: 20,
                height: 20,
                left: food.x * 20,
                top: food.y * 20,
                boxShadow: '0 0 10px #ff00ff'
              }}
            />

            {/* Snake */}
            {snake.map((segment, index) => {
              const isHead = index === 0;
              const opacity = Math.max(0.2, 1 - (index / snake.length));
              
              return (
                <div
                  key={`${segment.x}-${segment.y}-${index}`}
                  className={`absolute ${
                    isHead 
                      ? 'bg-cyan-400 z-10 border-2 border-white' 
                      : 'bg-cyan-600 border border-cyan-400'
                  }`}
                  style={{
                    width: 20,
                    height: 20,
                    left: segment.x * 20,
                    top: segment.y * 20,
                    opacity: opacity,
                    boxShadow: isHead 
                      ? '0 0 15px #00ffff' 
                      : 'none',
                  }}
                />
              );
            })}

            {/* Overlays */}
            {gameOver && (
              <div className="absolute inset-0 bg-[#050505]/90 flex flex-col items-center justify-center z-20 border-4 border-fuchsia-500 m-2">
                <div className="glitch-wrapper mb-4">
                  <h2 className="text-5xl font-black text-fuchsia-500 glitch-text uppercase tracking-widest" data-text="FATAL_ERROR">
                    FATAL_ERROR
                  </h2>
                </div>
                <p className="text-cyan-400 mb-8 text-2xl">&gt; BYTES_LOST: {score}</p>
                <button
                  onClick={resetGame}
                  className="px-8 py-2 bg-fuchsia-500 text-white text-2xl font-bold uppercase tracking-widest border-2 border-white hover:bg-cyan-400 hover:text-black transition-colors shadow-[4px_4px_0_#00ffff] active:translate-x-1 active:translate-y-1 active:shadow-none"
                >
                  &gt; REBOOT_SYS
                </button>
              </div>
            )}

            {isGamePaused && !gameOver && (
              <div className="absolute inset-0 bg-[#050505]/80 flex items-center justify-center z-20 border-4 border-cyan-400 m-2">
                <h2 className="text-4xl font-black text-cyan-400 uppercase tracking-widest animate-pulse border-y-2 border-fuchsia-500 py-2">
                  &gt; SYS_HALTED
                </h2>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel: Music Player */}
        <div className="w-full lg:w-80 order-3">
          <div className="bg-[#0a0a0a] border-2 border-cyan-400 p-6 relative overflow-hidden shadow-[4px_4px_0_#ff00ff]">
            
            <h2 className="text-xl font-bold text-fuchsia-500 uppercase tracking-widest mb-6 flex items-center gap-2 border-b border-cyan-400/30 pb-2">
              <span className={`w-3 h-3 border border-fuchsia-500 ${isPlaying ? 'bg-fuchsia-500 animate-pulse' : 'bg-transparent'}`} />
              &gt; AUDIO_STREAM
            </h2>

            {/* Track Info */}
            <div className="mb-8 border-l-4 border-fuchsia-500 pl-4">
              <h3 className="text-2xl font-bold truncate text-cyan-400 uppercase">
                {currentTrack.title}
              </h3>
              <p className="text-fuchsia-400 text-lg mt-1 truncate uppercase">
                SRC: {currentTrack.artist}
              </p>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between mb-8 border-y border-cyan-900 py-4">
              <button 
                onClick={prevTrack}
                className="text-cyan-400 hover:text-fuchsia-500 transition-colors text-2xl font-bold"
              >
                [PREV]
              </button>
              
              <button 
                onClick={togglePlay}
                className={`px-4 py-2 border-2 text-xl font-bold uppercase transition-colors ${isPlaying ? 'bg-fuchsia-500 text-white border-white shadow-[2px_2px_0_#00ffff]' : 'bg-transparent text-cyan-400 border-cyan-400 hover:bg-cyan-400 hover:text-black'}`}
              >
                {isPlaying ? 'PAUSE' : 'EXECUTE'}
              </button>
              
              <button 
                onClick={nextTrack}
                className="text-cyan-400 hover:text-fuchsia-500 transition-colors text-2xl font-bold"
              >
                [NEXT]
              </button>
            </div>

            {/* Volume / Mute */}
            <div className="flex items-center justify-between">
              <button 
                onClick={() => setIsMuted(!isMuted)}
                className="text-cyan-600 hover:text-cyan-400 transition-colors text-lg uppercase tracking-widest"
              >
                &gt; {isMuted ? 'AUDIO_MUTED' : 'AUDIO_ACTIVE'}
              </button>
              
              {/* Visualizer bars */}
              <div className="flex items-end gap-1 h-8">
                {[0, 0.2, 0.4, 0.1, 0.3, 0.5].map((delay, i) => (
                  <div 
                    key={i} 
                    className={`w-3 border border-cyan-400 transition-all duration-150 ${isPlaying && !isMuted ? 'bg-fuchsia-500 animate-equalize' : 'bg-transparent'}`}
                    style={{ 
                      height: '20%',
                      animationDelay: `${delay}s`
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
          
          {/* Playlist Preview */}
          <div className="mt-6 bg-[#0a0a0a] border-2 border-fuchsia-500 p-4 shadow-[4px_4px_0_#00ffff]">
            <h4 className="text-lg font-bold text-cyan-400 uppercase tracking-widest mb-3 border-b border-fuchsia-500/30 pb-1">&gt; QUEUE</h4>
            <div className="space-y-2">
              {TRACKS.map((track, idx) => (
                <div 
                  key={track.id}
                  onClick={() => {
                    setCurrentTrackIndex(idx);
                    setIsPlaying(true);
                  }}
                  className={`flex items-center gap-3 p-2 cursor-pointer border-l-2 transition-colors ${idx === currentTrackIndex ? 'border-fuchsia-500 bg-fuchsia-500/10 text-fuchsia-400' : 'border-transparent text-cyan-700 hover:text-cyan-400 hover:border-cyan-400'}`}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-lg truncate uppercase">
                      {idx === currentTrackIndex ? '> ' : ''}{track.title}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Hidden Audio Element */}
      <audio 
        ref={audioRef} 
        src={currentTrack.url} 
        onEnded={handleTrackEnd}
        crossOrigin="anonymous"
      />
    </div>
  );
}
