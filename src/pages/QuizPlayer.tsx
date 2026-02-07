import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Loader2,
  Trophy,
  RotateCcw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { VideoPlayer } from '@/components/VideoPlayer';
import { fetchQuizById } from '@/lib/api';
import { Quiz, Option } from '@/lib/types';
import { cn } from '@/lib/utils';

type AnswerState = 'unanswered' | 'correct' | 'incorrect';

interface QuestionState {
  selectedOptionId: string | null;
  answerState: AnswerState;
  videoWatched: boolean;
}

const QuizPlayer = () => {
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState<Quiz | null>(null);
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
          setQuestionStates(
            result.quiz.questions.map(() => ({
              selectedOptionId: null,
              answerState: 'unanswered',
              videoWatched: false,
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

  const currentQuestion = quiz?.questions[currentQuestionIndex];
  const currentState = questionStates[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / (quiz?.questions.length || 1)) * 100;

  const handleOptionSelect = (option: Option) => {
    if (currentState?.answerState !== 'unanswered') return;

    const isCorrect = option.isCorrect;
    const newStates = [...questionStates];
    newStates[currentQuestionIndex] = {
      ...newStates[currentQuestionIndex],
      selectedOptionId: option.id,
      answerState: isCorrect ? 'correct' : 'incorrect',
    };
    setQuestionStates(newStates);
  };

  const handleVideoWatched = () => {
    const newStates = [...questionStates];
    newStates[currentQuestionIndex] = {
      ...newStates[currentQuestionIndex],
      videoWatched: true,
    };
    setQuestionStates(newStates);
  };

  const handleNext = () => {
    if (currentQuestionIndex < (quiz?.questions.length || 0) - 1) {
      setCurrentQuestionIndex((i) => i + 1);
    } else {
      setIsComplete(true);
    }
  };

  const handleRetry = () => {
    const newStates = [...questionStates];
    newStates[currentQuestionIndex] = {
      selectedOptionId: null,
      answerState: 'unanswered',
      videoWatched: false,
    };
    setQuestionStates(newStates);
  };

  const canProceed = () => {
    if (!currentState) return false;
    if (currentState.answerState === 'correct') return true;
    if (currentState.answerState === 'incorrect' && currentState.videoWatched) return true;
    return false;
  };

  const correctCount = questionStates.filter((s) => s.answerState === 'correct').length;
  const optionLabels = ['A', 'B', 'C'];

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
    const percentage = Math.round((correctCount / quiz.questions.length) * 100);
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
                {correctCount} of {quiz.questions.length} correct
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
                  setQuestionStates(
                    quiz.questions.map(() => ({
                      selectedOptionId: null,
                      answerState: 'unanswered',
                      videoWatched: false,
                    }))
                  );
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
                  Question {currentQuestionIndex + 1} of {quiz.questions.length}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                Score: {correctCount}/{quiz.questions.length}
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
                {currentQuestion?.text}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Options */}
            <div className="space-y-3">
              {currentQuestion?.options.map((option, index) => {
                const isSelected = currentState?.selectedOptionId === option.id;
                const showCorrect =
                  currentState?.answerState !== 'unanswered' && option.isCorrect;
                const showIncorrect =
                  currentState?.answerState === 'incorrect' && isSelected;

                return (
                  <button
                    key={option.id}
                    onClick={() => handleOptionSelect(option)}
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
                    <span className="flex-1 font-medium">{option.text}</span>
                  </button>
                );
              })}
            </div>

            {/* Feedback & Video Section */}
            {currentState?.answerState === 'correct' && (
              <div className="animate-slide-up pt-4">
                <div className="flex items-center gap-2 p-4 rounded-lg bg-success/10 text-success mb-4">
                  <CheckCircle2 className="h-5 w-5" />
                  <span className="font-medium">Correct! Great job.</span>
                </div>
                <div className="flex gap-3">
                  <Button onClick={handleNext} className="gap-2">
                    {currentQuestionIndex < quiz.questions.length - 1 ? (
                      <>
                        Next Question
                        <ArrowRight className="h-4 w-4" />
                      </>
                    ) : (
                      'Finish Quiz'
                    )}
                  </Button>
                  {!currentState.videoWatched && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        const videoSection = document.getElementById('video-section');
                        videoSection?.scrollIntoView({ behavior: 'smooth' });
                      }}
                    >
                      Explain (Video)
                    </Button>
                  )}
                </div>
                <div id="video-section" className="mt-6">
                  <p className="text-sm text-muted-foreground mb-3">
                    Optional: Watch the explanation video
                  </p>
                  <VideoPlayer
                    videoUrl={currentQuestion?.videoUrl || ''}
                    onWatched={handleVideoWatched}
                  />
                </div>
              </div>
            )}

            {currentState?.answerState === 'incorrect' && (
              <div className="animate-slide-up pt-4">
                <div className="flex items-center gap-2 p-4 rounded-lg bg-destructive/10 text-destructive mb-4">
                  <XCircle className="h-5 w-5" />
                  <span className="font-medium">
                    Incorrect. Please watch the explanation to continue.
                  </span>
                </div>
                <VideoPlayer
                  videoUrl={currentQuestion?.videoUrl || ''}
                  onWatched={handleVideoWatched}
                />
                <div className="flex gap-3 mt-4">
                  <Button
                    onClick={handleRetry}
                    disabled={!currentState.videoWatched}
                    variant="outline"
                    className="gap-2"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Retry Question
                  </Button>
                  <Button
                    onClick={handleNext}
                    disabled={!currentState.videoWatched}
                    className="gap-2"
                  >
                    {currentQuestionIndex < quiz.questions.length - 1 ? (
                      <>
                        Next Question
                        <ArrowRight className="h-4 w-4" />
                      </>
                    ) : (
                      'Finish Quiz'
                    )}
                  </Button>
                </div>
                {!currentState.videoWatched && (
                  <p className="text-sm text-warning mt-3">
                    ⚠️ Watch the full explanation video to unlock navigation
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default QuizPlayer;
