import { useState, useEffect } from 'react';
import { get, set } from 'idb-keyval';
import questionsData from '../data/questions.json';

export type QuestionMedia = {
  text?: string;
  image?: string;
  video?: string;
  audio?: string;
};

export type OptionMedia = {
  text?: string;
  image?: string;
  audio?: string;
};

export type Question = {
  id: string;
  type: string;
  // Support both old simple string and new media object for backward compatibility
  question: string; 
  content?: QuestionMedia; 
  options: (string | OptionMedia)[];
  correctAnswer: number;
  level: string;
};

export type PlayerInfo = {
  name: string;
  className: string;
  level: string;
};

export function useGameLogic() {
  const [playerInfo, setPlayerInfo] = useState<PlayerInfo | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]); // Full question bank
  const [gameQuestions, setGameQuestions] = useState<Question[]>([]); // Current session questions
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'result'>('idle');
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load questions from IndexedDB or fallback to mock data
  useEffect(() => {
    const loadQuestions = async () => {
      try {
        const storedQuestions = await get<Question[]>('admin_questions');
        if (storedQuestions && storedQuestions.length > 0) {
          setQuestions(storedQuestions);
        } else {
          // Migration from localStorage if exists
          const legacy = localStorage.getItem('admin_questions');
          if (legacy) {
            const parsed = JSON.parse(legacy);
            await set('admin_questions', parsed);
            setQuestions(parsed);
          } else {
            setQuestions(questionsData as any);
            await set('admin_questions', questionsData);
          }
        }
      } catch (err) {
        console.error('Failed to load questions from IndexedDB:', err);
        setQuestions(questionsData as any);
      } finally {
        setIsLoading(false);
      }
    };
    loadQuestions();
  }, []);

  const startGame = (info: PlayerInfo) => {
    setPlayerInfo(info);
    
    // Filter questions by level if needed, or just shuffle
    let filtered = [...questions];
    if (info.level !== 'all') {
      filtered = questions.filter(q => q.level === info.level);
    }
    
    // Shuffle
    filtered = [...filtered].sort(() => Math.random() - 0.5);
    
    setGameQuestions(filtered);
    setCurrentQuestionIndex(0);
    setScore(0);
    setGameState('playing');
    setFeedback(null);
  };

  const answerQuestion = (answerIndex: number) => {
    const currentQuestion = gameQuestions[currentQuestionIndex];
    if (!currentQuestion) return;
    
    const isCorrect = answerIndex === currentQuestion.correctAnswer;

    if (isCorrect) {
      setScore(prev => prev + 10);
      setFeedback('correct');
    } else {
      setFeedback('incorrect');
    }

    setTimeout(() => {
      setFeedback(null);
      if (currentQuestionIndex < gameQuestions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
      } else {
        endGame();
      }
    }, 2000);
  };

  const endGame = async () => {
    setGameState('result');
    // Save to leaderboard
    if (playerInfo) {
      const leaderboardStr = localStorage.getItem('leaderboard') || '[]';
      const leaderboard = JSON.parse(leaderboardStr);
      leaderboard.push({
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: playerInfo.name,
        className: playerInfo.className,
        score: score + (feedback === 'correct' ? 10 : 0), // account for last question
        date: new Date().toISOString()
      });
      // Sort and keep top 50 to show a longer participant list
      leaderboard.sort((a: any, b: any) => b.score - a.score);
      localStorage.setItem('leaderboard', JSON.stringify(leaderboard.slice(0, 50)));
    }
  };

  const resetGame = () => {
    setGameState('idle');
    setPlayerInfo(null);
    setCurrentQuestionIndex(0);
    setScore(0);
    setFeedback(null);
    setGameQuestions([]);
  };

  return {
    playerInfo,
    questions, // Full bank for Admin
    currentQuestionIndex,
    activeQuestions: gameQuestions, // Export active questions for the game session
    currentQuestion: gameQuestions[currentQuestionIndex],
    score,
    gameState,
    feedback,
    isLoading,
    startGame,
    answerQuestion,
    resetGame
  };
}
