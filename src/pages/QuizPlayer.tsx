import { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Loader2, Trophy, RotateCcw, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { WrongAnswerSection } from '@/components/WrongAnswerSection';
import { CorrectAnswerSection } from '@/components/CorrectAnswerSection';
import { fetchQuizById } from '@/lib/api';
import { Quiz, Question } from '@/lib/types';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useCompany } from '@/contexts/CompanyContext';

type AnswerState = 'unanswered' | 'correct' | 'incorrect';

interface QuestionState {
  selectedOptionIndex: number | null;
  answerState: AnswerState;
}

// Shuffled question with reordered options and updated correct index
interface ShuffledQuestion {
  original: Question;
  shuffledOptions: string[];
  shuffledCorrectIndex: number;
}

// Fisher-Yates shuffle that returns indices mapping
function shuffleWithIndices<T>(array: T[]): { shuffled: T[]; originalIndices: number[] } {
  const indices = array.map((_, i) => i);
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  return { shuffled, originalIndices: indices };
}

// Create shuffled questions with shuffled options
function createShuffledQuestions(questions: Question[]): ShuffledQuestion[] {
  return questions.map((q) => {
    const { shuffled, originalIndices } = shuffleWithIndices(q.options);
    // Find where the correct answer ended up after shuffle
    const shuffledCorrectIndex = originalIndices.indexOf(q.correct_answer_index);
    return {
      original: q,
      shuffledOptions: shuffled,
      shuffledCorrectIndex,
    };
  });
}

const QuizPlayer = () => {
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();
  const { company } = useCompany();
  const attemptSaved = useRef(false);

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [shuffledQuestions, setShuffledQuestions] = useState<ShuffledQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questionStates, setQuestionStates] = useState<QuestionState[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    const loadQuiz = async () => {
      if (!quizId) return;
      try {
        const result = await fetchQuizById(quizId);
        if (result) {
          setQuiz(result.quiz);
          // Shuffle answer options for each question
          const shuffled = createShuffledQuestions(result.quiz.questions);
          setShuffledQuestions(shuffled);
          setQuestionStates(
            shuffled.map(() => ({
              selectedOptionIndex: null,
              answerState: 'unanswered',
            }))
          );
        }
      } catch (error) {
        console.error('Failed to fetch quiz:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadQuiz();
  }, [quizId]);

  const currentShuffledQuestion = shuffledQuestions[currentQuestionIndex];
  const currentQuestion = currentShuffledQuestion?.original;
  const currentState = questionStates[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / (shuffledQuestions.length || 1)) * 100;

  const handleOptionSelect = (optionIndex: number) => {
    if (currentState?.answerState !== 'unanswered' || !currentShuffledQuestion) return;

    // Use the shuffled correct index for comparison
    const isCorrect = optionIndex === currentShuffledQuestion.shuffledCorrectIndex;
    const newStates = [...questionStates];
    newStates[currentQuestionIndex] = {
      ...newStates[currentQuestionIndex],
      selectedOptionIndex: optionIndex,
      answerState: isCorrect ? 'correct' : 'incorrect',
    };
    setQuestionStates(newStates);
  };

  const handleNext = () => {
    if (currentQuestionIndex < shuffledQuestions.length - 1) {
      setCurrentQuestionIndex((i) => i + 1);
    } else {
      setIsComplete(true);
    }
  };

  const handleRetry = () => {
    const newStates = [...questionStates];
    newStates[currentQuestionIndex] = {
      selectedOptionIndex: null,
      answerState: 'unanswered',
    };
    setQuestionStates(newStates);
  };

  const correctCount = questionStates.filter((s) => s.answerState === 'correct').length;
  const optionLabels = ['A', 'B', 'C', 'D'];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md text-center p-8">
          <CardTitle className="mb-4">Quiz Not Found</CardTitle>
          <p className="text-muted-foreground mb-6">
            The quiz you're looking for doesn't exist.
          </p>
          <Button onClick={() => navigate('/')}>Back to Dashboard</Button>
        </Card>
      </div>
    );
  }

  if (isComplete) {
    const percentage = Math.round((correctCount / shuffledQuestions.length) * 100);
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center animate-scale-in">
          <CardHeader>
            <div className="mx-auto mb-4 p-4 rounded-full bg-success/10">
              <Trophy className="h-12 w-12 text-success" />
            </div>
            <CardTitle className="text-2xl">Quiz Complete!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <p className="text-4xl font-bold text-primary">{percentage}%</p>
              <p className="text-muted-foreground">
                {correctCount} of {shuffledQuestions.length} correct
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <Button onClick={() => navigate('/')} className="w-full">
                Back to Dashboard
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setCurrentQuestionIndex(0);
                  // Reshuffle options on retake
                  if (quiz) {
                    const reshuffled = createShuffledQuestions(quiz.questions);
                    setShuffledQuestions(reshuffled);
                    setQuestionStates(
                      reshuffled.map(() => ({
                        selectedOptionIndex: null,
                        answerState: 'unanswered',
                      }))
                    );
                  }
                  setIsComplete(false);
                }}
                className="w-full gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Retake Quiz
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold text-foreground">{quiz.name}</h1>
                <p className="text-sm text-muted-foreground">
                  Question {currentQuestionIndex + 1} of {shuffledQuestions.length}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                Score: {correctCount}/{shuffledQuestions.length}
              </span>
            </div>
          </div>
          <Progress value={progress} className="mt-4 h-2" />
        </div>
      </header>

      <main className="container py-8 max-w-3xl">
        {/* Question Card */}
        <Card className="animate-fade-in">
          <CardHeader>
            <div className="flex items-start gap-4">
              <span className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary text-primary-foreground font-bold">
                {currentQuestionIndex + 1}
              </span>
              <CardTitle className="text-xl leading-relaxed pt-1">
                {currentQuestion?.question}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Options */}
            <div className="space-y-3">
              {currentShuffledQuestion?.shuffledOptions.map((option, index) => {
                const isSelected = currentState?.selectedOptionIndex === index;
                const isCorrectOption = index === currentShuffledQuestion.shuffledCorrectIndex;
                // Only show correct highlight if user got it right
                const showCorrect =
                  currentState?.answerState === 'correct' && isCorrectOption;
                // Show incorrect highlight only for the selected wrong option
                const showIncorrect =
                  currentState?.answerState === 'incorrect' && isSelected;

                return (
                  <button
                    key={index}
                    onClick={() => handleOptionSelect(index)}
                    disabled={currentState?.answerState !== 'unanswered'}
                    className={cn(
                      'w-full flex items-center gap-4 p-4 rounded-lg border-2 text-left transition-all',
                      currentState?.answerState === 'unanswered'
                        ? 'border-border hover:border-primary/50 hover:bg-muted/50 cursor-pointer'
                        : 'cursor-default',
                      showCorrect && 'border-success bg-success/10',
                      showIncorrect && 'border-destructive bg-destructive/10',
                      isSelected &&
                      currentState?.answerState === 'unanswered' &&
                      'border-primary'
                    )}
                  >
                    <span
                      className={cn(
                        'flex items-center justify-center w-8 h-8 rounded-lg font-medium text-sm transition-all',
                        showCorrect
                          ? 'bg-success text-success-foreground'
                          : showIncorrect
                            ? 'bg-destructive text-destructive-foreground'
                            : 'bg-muted text-muted-foreground'
                      )}
                    >
                      {showCorrect ? (
                        <CheckCircle2 className="h-5 w-5" />
                      ) : showIncorrect ? (
                        <XCircle className="h-5 w-5" />
                      ) : (
                        optionLabels[index]
                      )}
                    </span>
                    <span className="flex-1 font-medium">{option}</span>
                  </button>
                );
              })}
            </div>

            {/* Feedback Sections */}
            {currentState?.answerState === 'correct' && (
              <CorrectAnswerSection
                failureVideoUrl={currentQuestion?.video_assets.failure_video || ''}
                successVideoUrl={currentQuestion?.video_assets.success_video || ''}
                explanation={currentQuestion?.explanation}
                isLastQuestion={currentQuestionIndex >= shuffledQuestions.length - 1}
                onNext={handleNext}
              />
            )}

            {currentState?.answerState === 'incorrect' && (
              <WrongAnswerSection
                failureVideoUrl={currentQuestion?.video_assets.failure_video || ''}
                successVideoUrl={currentQuestion?.video_assets.success_video || ''}
                explanation={currentQuestion?.explanation}
                onRetry={handleRetry}
              />
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default QuizPlayer;
