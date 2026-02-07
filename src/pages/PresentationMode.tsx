import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight, X, Monitor, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { fetchQuizById } from '@/lib/api';
import { Quiz, Question } from '@/lib/types';
import { cn } from '@/lib/utils';

const PresentationMode = () => {
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();
  
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadQuiz = async () => {
      if (!quizId) return;
      try {
        const result = await fetchQuizById(quizId);
        if (result) {
          setQuiz(result.quiz);
        }
      } catch (error) {
        console.error('Failed to load quiz:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadQuiz();
  }, [quizId]);

  const totalSlides = quiz ? quiz.questions.length + 1 : 1; // +1 for title slide
  const currentQuestion = currentIndex > 0 && quiz ? quiz.questions[currentIndex - 1] : null;

  const goNext = useCallback(() => {
    if (currentIndex < totalSlides - 1) {
      setCurrentIndex(prev => prev + 1);
      setShowAnswer(false);
    }
  }, [currentIndex, totalSlides]);

  const goPrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setShowAnswer(false);
    }
  }, [currentIndex]);

  const toggleAnswer = useCallback(() => {
    setShowAnswer(prev => !prev);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowDown':
        case ' ':
          e.preventDefault();
          goNext();
          break;
        case 'ArrowLeft':
        case 'ArrowUp':
          e.preventDefault();
          goPrev();
          break;
        case 'Enter':
          e.preventDefault();
          toggleAnswer();
          break;
        case 'Escape':
          navigate(-1);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goNext, goPrev, toggleAnswer, navigate]);

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-background flex items-center justify-center">
        <Monitor className="h-16 w-16 text-primary animate-pulse" />
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="fixed inset-0 bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Quiz Not Found</h1>
          <Button onClick={() => navigate('/')}>Back to Dashboard</Button>
        </div>
      </div>
    );
  }

  const optionLabels = ['A', 'B', 'C', 'D'];

  return (
    <div className="fixed inset-0 bg-background overflow-hidden">
      {/* Exit Button */}
      <button
        onClick={() => navigate(-1)}
        className="absolute top-6 right-6 z-50 p-3 rounded-full bg-muted/50 hover:bg-muted transition-colors"
        title="Exit Presentation (Esc)"
      >
        <X className="h-6 w-6" />
      </button>

      {/* Slide Counter */}
      <div className="absolute top-6 left-6 z-50">
        <span className="text-lg font-medium text-muted-foreground">
          {currentIndex + 1} / {totalSlides}
        </span>
      </div>

      {/* Main Content */}
      <div className="h-full flex items-center justify-center p-8">
        {currentIndex === 0 ? (
          // Title Slide
          <div className="text-center max-w-4xl animate-fade-in">
            <div className="mb-8">
              <Monitor className="h-24 w-24 mx-auto text-primary mb-6" />
            </div>
            <h1 className="text-6xl md:text-7xl font-bold text-foreground mb-6 leading-tight">
              {quiz.name}
            </h1>
            <p className="text-2xl text-muted-foreground">
              {quiz.questions.length} Questions
            </p>
            <div className="mt-12 text-lg text-muted-foreground/70">
              Press <kbd className="px-2 py-1 bg-muted rounded text-foreground">→</kbd> or <kbd className="px-2 py-1 bg-muted rounded text-foreground">Space</kbd> to begin
            </div>
          </div>
        ) : currentQuestion ? (
          // Question Slide
          <div className="w-full max-w-5xl animate-fade-in">
            <div className="mb-8">
              <span className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary text-primary-foreground text-2xl font-bold">
                {currentIndex}
              </span>
            </div>
            
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-12 leading-tight">
              {currentQuestion.text}
            </h2>

            <div className="grid gap-4">
              {currentQuestion.options.map((option, index) => (
                <div
                  key={option.id}
                  className={cn(
                    "flex items-center gap-6 p-6 rounded-2xl border-2 transition-all",
                    showAnswer && option.isCorrect
                      ? "border-success bg-success/10"
                      : "border-border bg-card"
                  )}
                >
                  <span className={cn(
                    "flex items-center justify-center w-14 h-14 rounded-xl text-xl font-bold shrink-0",
                    showAnswer && option.isCorrect
                      ? "bg-success text-success-foreground"
                      : "bg-muted text-muted-foreground"
                  )}>
                    {showAnswer && option.isCorrect ? (
                      <CheckCircle2 className="h-7 w-7" />
                    ) : (
                      optionLabels[index]
                    )}
                  </span>
                  <span className="text-2xl md:text-3xl text-foreground">
                    {option.text}
                  </span>
                </div>
              ))}
            </div>

            {/* Show Answer Toggle */}
            <div className="mt-10 text-center">
              <Button
                size="lg"
                variant={showAnswer ? "secondary" : "default"}
                onClick={toggleAnswer}
                className="text-lg px-8 py-6 h-auto"
              >
                {showAnswer ? "Hide Answer" : "Reveal Answer"}
              </Button>
              <p className="mt-4 text-muted-foreground">
                Press <kbd className="px-2 py-1 bg-muted rounded text-foreground text-sm">Enter</kbd> to toggle
              </p>
            </div>
          </div>
        ) : null}
      </div>

      {/* Navigation Arrows */}
      <div className="absolute inset-y-0 left-0 flex items-center pl-4">
        <Button
          size="lg"
          variant="ghost"
          onClick={goPrev}
          disabled={currentIndex === 0}
          className="h-20 w-20 rounded-full hover:bg-muted/80"
        >
          <ChevronLeft className="h-12 w-12" />
        </Button>
      </div>
      <div className="absolute inset-y-0 right-0 flex items-center pr-4">
        <Button
          size="lg"
          variant="ghost"
          onClick={goNext}
          disabled={currentIndex === totalSlides - 1}
          className="h-20 w-20 rounded-full hover:bg-muted/80"
        >
          <ChevronRight className="h-12 w-12" />
        </Button>
      </div>

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-muted">
        <div 
          className="h-full bg-primary transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / totalSlides) * 100}%` }}
        />
      </div>
    </div>
  );
};

export default PresentationMode;
