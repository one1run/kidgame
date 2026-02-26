import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart } from 'lucide-react';

type GameState = 'start' | 'playing' | 'won' | 'lost';
type AnimationState = 'idle' | 'jumping' | 'shaking' | 'falling';

const generateQuestion = () => {
  const special = [2, 3, 5, 9];
  const general = [2, 3, 4, 5, 6, 7, 8, 9];
  const a = special[Math.floor(Math.random() * special.length)];
  const b = general[Math.floor(Math.random() * general.length)];
  return Math.random() > 0.5 ? { num1: a, num2: b } : { num1: b, num2: a };
};

export default function App() {
  const [gameState, setGameState] = useState<GameState>('start');
  const [lives, setLives] = useState(3);
  const [position, setPosition] = useState(0);
  const [question, setQuestion] = useState({ num1: 2, num2: 2 });
  const [inputValue, setInputValue] = useState('');
  const [animState, setAnimState] = useState<AnimationState>('idle');
  const inputRef = useRef<HTMLInputElement>(null);

  const startGame = () => {
    setLives(3);
    setPosition(0);
    setQuestion(generateQuestion());
    setInputValue('');
    setAnimState('idle');
    setGameState('playing');
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (gameState !== 'playing' || animState !== 'idle' || !inputValue) return;

    const answer = parseInt(inputValue, 10);
    const correctAnswer = question.num1 * question.num2;

    if (answer === correctAnswer) {
      setAnimState('jumping');
      setTimeout(() => {
        const newPos = position + 1;
        setPosition(newPos);
        if (newPos >= 7) {
          setGameState('won');
        } else {
          setQuestion(generateQuestion());
        }
        setInputValue('');
        setAnimState('idle');
        setTimeout(() => inputRef.current?.focus(), 100);
      }, 500);
    } else {
      setAnimState('shaking');
      const newLives = lives - 1;
      setLives(newLives);
      setTimeout(() => {
        if (newLives <= 0) {
          setAnimState('falling');
          setTimeout(() => {
            setGameState('lost');
          }, 1200);
        } else {
          setAnimState('idle');
          setInputValue('');
          setTimeout(() => inputRef.current?.focus(), 100);
        }
      }, 500);
    }
  };

  const positions = [0, 1, 2, 3, 4, 5, 6, 7];
  const getLeftPos = (step: number) => `calc(10% + ${step * (80 / 7)}%)`;

  return (
    <div className="min-h-screen bg-pink-50 flex flex-col items-center justify-center p-4 font-sans">
      <div className="w-full max-w-4xl bg-white rounded-[3rem] shadow-2xl p-6 sm:p-10 border-8 border-pink-100 relative overflow-hidden">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-black text-pink-500 tracking-tight">
            小公主過橋大冒險 👑
          </h1>
          <div className="flex space-x-2 bg-pink-100 px-4 py-2 rounded-full border-2 border-pink-200">
            {[1, 2, 3].map((heart) => (
              <motion.div
                key={heart}
                animate={lives < heart ? { scale: 0, opacity: 0 } : { scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                <Heart
                  className={`w-8 h-8 ${lives < heart ? 'text-gray-300' : 'text-red-500 fill-red-500'}`}
                />
              </motion.div>
            ))}
          </div>
        </div>

        {/* Game Area */}
        <div className="relative w-full h-64 sm:h-80 bg-[#E6F2F5] rounded-3xl overflow-hidden border-4 border-[#B3D9E6] shadow-inner">
          {/* River Background */}
          <div className="absolute inset-0 opacity-40">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="waves" x="0" y="0" width="60" height="40" patternUnits="userSpaceOnUse">
                  <path d="M0 20 Q 15 5, 30 20 T 60 20" fill="none" stroke="#7AB8CC" strokeWidth="3" strokeLinecap="round" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#waves)" />
            </svg>
          </div>

          {/* Bridge */}
          <motion.div 
            className="absolute top-1/2 left-0 w-full h-16 sm:h-20 bg-[#FFB6C1] transform -translate-y-1/2 border-y-4 border-[#FF69B4] shadow-lg flex items-center"
            animate={animState === 'falling' ? { y: ['-50%', '-45%', '-55%', '-50%'] } : { y: '-50%' }}
            transition={{ duration: 0.4, repeat: animState === 'falling' ? 2 : 0 }}
          >
            {positions.map((step) => (
              <div 
                key={step} 
                className="absolute h-full w-8 sm:w-12 bg-[#FFC0CB] border-x-2 border-[#FF69B4] flex flex-col items-center justify-center shadow-inner"
                style={{ left: getLeftPos(step), transform: 'translateX(-50%)' }}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-[#FF69B4] opacity-40 mb-6 sm:mb-8"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-[#FF69B4] opacity-40 mt-6 sm:mt-8"></div>
                {step === 0 && <span className="absolute -bottom-8 text-xs sm:text-sm font-black text-[#FF69B4]">Start</span>}
                {step === 7 && <span className="absolute -bottom-8 text-xs sm:text-sm font-black text-[#FF69B4]">End</span>}
              </div>
            ))}
          </motion.div>

          {/* Princess */}
          <motion.div
            className="absolute top-1/2 -mt-12 sm:-mt-16 text-5xl sm:text-6xl z-10 flex flex-col items-center"
            initial={false}
            animate={{
              left: getLeftPos(position),
              y: animState === 'jumping' ? [-20, -60, 0] : animState === 'falling' ? [0, -20, 200] : 0,
              x: animState === 'shaking' ? ['-50%', 'calc(-50% - 15px)', 'calc(-50% + 15px)', 'calc(-50% - 15px)', 'calc(-50% + 15px)', '-50%'] : '-50%',
              rotate: animState === 'falling' ? [0, 45, 180] : 0,
              opacity: animState === 'falling' ? [1, 1, 0] : 1,
            }}
            transition={{ duration: animState === 'idle' ? 0.4 : 0.5, ease: "easeInOut" }}
          >
            {animState === 'falling' && (
              <motion.div 
                initial={{ opacity: 0, scale: 0, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="absolute -top-12 sm:-top-16 bg-white px-3 py-1.5 rounded-2xl text-sm sm:text-base font-bold text-blue-500 whitespace-nowrap border-2 border-blue-200 shadow-md"
              >
                救命啊！💦
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-b-2 border-r-2 border-blue-200 transform rotate-45"></div>
              </motion.div>
            )}
            <span className="drop-shadow-lg">{animState === 'falling' ? '😭' : '👸'}</span>
          </motion.div>
        </div>

        {/* Question & Input Area */}
        <div className="mt-8 sm:mt-12 flex flex-col items-center">
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
            <div className="flex items-center space-x-4 sm:space-x-6 text-4xl sm:text-6xl font-black text-gray-700">
              <span className="bg-pink-50 w-16 h-16 sm:w-24 sm:h-24 flex items-center justify-center rounded-3xl shadow-sm border-4 border-pink-200 text-pink-600">
                {question.num1}
              </span>
              <span className="text-pink-300">×</span>
              <span className="bg-pink-50 w-16 h-16 sm:w-24 sm:h-24 flex items-center justify-center rounded-3xl shadow-sm border-4 border-pink-200 text-pink-600">
                {question.num2}
              </span>
              <span className="text-pink-300">=</span>
            </div>
            
            <form onSubmit={handleSubmit} className="flex items-center space-x-3 sm:space-x-4">
              <input
                ref={inputRef}
                type="number"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="w-24 sm:w-32 h-16 sm:h-24 text-center bg-white rounded-3xl shadow-inner border-4 border-pink-300 focus:outline-none focus:border-pink-500 focus:ring-4 focus:ring-pink-200 text-4xl sm:text-5xl font-black text-gray-700 transition-all"
                placeholder="?"
                disabled={gameState !== 'playing' || animState !== 'idle'}
              />
              <button 
                type="submit"
                disabled={gameState !== 'playing' || animState !== 'idle' || !inputValue}
                className="h-16 sm:h-24 px-6 sm:px-8 bg-pink-500 hover:bg-pink-600 disabled:bg-pink-300 text-white rounded-3xl font-black text-xl sm:text-2xl shadow-[0_8px_0_0_rgba(219,39,119,1)] hover:shadow-[0_4px_0_0_rgba(219,39,119,1)] hover:translate-y-1 disabled:shadow-none disabled:translate-y-2 transition-all active:shadow-none active:translate-y-2"
              >
                送出
              </button>
            </form>
          </div>
        </div>

        {/* Modals */}
        <AnimatePresence>
          {gameState !== 'playing' && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 flex items-center justify-center bg-white/60 backdrop-blur-md rounded-[2.5rem]"
            >
              <motion.div 
                initial={{ scale: 0.8, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.8, y: 20 }}
                className="bg-white p-8 sm:p-10 rounded-[2.5rem] shadow-2xl text-center max-w-sm w-full mx-4 border-8 border-pink-100"
              >
                {gameState === 'start' && (
                  <>
                    <div className="text-7xl mb-6">👸</div>
                    <h2 className="text-3xl font-black text-pink-500 mb-4">準備好了嗎？</h2>
                    <p className="text-gray-500 mb-8 text-lg font-bold">
                      回答乘法問題，<br/>幫助小公主安全過橋！✨
                    </p>
                    <button onClick={startGame} className="w-full bg-pink-500 text-white py-4 rounded-2xl font-black text-2xl shadow-[0_6px_0_0_rgba(219,39,119,1)] hover:shadow-[0_3px_0_0_rgba(219,39,119,1)] hover:translate-y-1 transition-all active:shadow-none active:translate-y-[6px]">
                      開始遊戲 🚀
                    </button>
                  </>
                )}
                {gameState === 'won' && (
                  <>
                    <div className="text-7xl mb-6">🎉</div>
                    <h2 className="text-3xl font-black text-pink-500 mb-4">過關恭喜！🎊</h2>
                    <p className="text-gray-500 mb-8 text-lg font-bold">
                      太棒了！<br/>小公主成功到達對岸了！✨
                    </p>
                    <button onClick={startGame} className="w-full bg-pink-500 text-white py-4 rounded-2xl font-black text-2xl shadow-[0_6px_0_0_rgba(219,39,119,1)] hover:shadow-[0_3px_0_0_rgba(219,39,119,1)] hover:translate-y-1 transition-all active:shadow-none active:translate-y-[6px]">
                      再玩一次 🔄
                    </button>
                  </>
                )}
                {gameState === 'lost' && (
                  <>
                    <div className="text-7xl mb-6">💦</div>
                    <h2 className="text-3xl font-black text-blue-500 mb-4">挑戰失敗</h2>
                    <p className="text-gray-500 mb-8 text-lg font-bold">
                      哎呀！小公主掉進水裡了... 🥺<br/>不要灰心，再試一次吧！
                    </p>
                    <button onClick={startGame} className="w-full bg-blue-500 text-white py-4 rounded-2xl font-black text-2xl shadow-[0_6px_0_0_rgba(59,130,246,1)] hover:shadow-[0_3px_0_0_rgba(59,130,246,1)] hover:translate-y-1 transition-all active:shadow-none active:translate-y-[6px]">
                      重新開始 🔄
                    </button>
                  </>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
