import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  Trash2,
  Check,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { QuestionEditor } from '@/components/QuestionEditor';
import { fetchManualById, updateQuiz, updateQuestion, deleteQuiz, publishQuizzes } from '@/lib/api';
import { Manual, Quiz, Question } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const QuizEditor = () => {
  const { manualId } = useParams<{ manualId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [manual, setManual] = useState<Manual | null>(null);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isPublishing, setIsPublishing] = useState(false);
  const [regeneratingQuestions, setRegeneratingQuestions] = useState<Set<string>>(new Set());

  useEffect(() => {
    const loadManual = async () => {
      if (!manualId) return;
      try {
        const data = await fetchManualById(manualId);
        setManual(data);
        
        // If a specific quiz ID is provided, navigate to it
        const quizId = searchParams.get('quiz');
        if (quizId && data) {
          const quizIndex = data.quizzes.findIndex(q => q.id === quizId);
          if (quizIndex !== -1) {
            setCurrentQuizIndex(quizIndex);
          }
        }
      } catch (error) {
        console.error('Failed to fetch manual:', error);
        toast({
          title: 'Error',
          description: 'Failed to load manual data',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadManual();
  }, [manualId, searchParams, toast]);

  const currentQuiz = manual?.quizzes[currentQuizIndex];

  // Local update only (no API call)
  const handleQuestionUpdate = (updatedQuestion: Question) => {
    if (!manual || !currentQuiz) return;

    const updatedQuiz: Quiz = {
      ...currentQuiz,
      questions: currentQuiz.questions.map((q) =>
        q.id === updatedQuestion.id ? updatedQuestion : q
      ),
    };

    setManual({
      ...manual,
      quizzes: manual.quizzes.map((q, i) =>
        i === currentQuizIndex ? updatedQuiz : q
      ),
    });
  };

  // Save individual question and trigger video regeneration
  const handleQuestionSave = async (question: Question) => {
    if (!manual || !currentQuiz) return;

    // Mark question as regenerating
    setRegeneratingQuestions(prev => new Set(prev).add(question.id));

    try {
      // Send only this question to the backend for video regeneration
      const updatedQuestion = await updateQuestion(manual.id, currentQuiz.id, question);
      
      // Update local state with the regenerated question
      setManual(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          quizzes: prev.quizzes.map((quiz, i) => {
            if (i === currentQuizIndex) {
              return {
                ...quiz,
                questions: quiz.questions.map(q =>
                  q.id === question.id ? updatedQuestion : q
                ),
              };
            }
            return quiz;
          }),
        };
      });

      toast({
        title: 'Question Updated',
        description: 'Video regeneration complete for this question.',
      });
    } catch (error) {
      console.error('Failed to save question:', error);
      toast({
        title: 'Error',
        description: 'Failed to update question',
        variant: 'destructive',
      });
    } finally {
      setRegeneratingQuestions(prev => {
        const newSet = new Set(prev);
        newSet.delete(question.id);
        return newSet;
      });
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    if (!manual || !currentQuiz) return;

    const updatedQuiz: Quiz = {
      ...currentQuiz,
      questions: currentQuiz.questions.filter((q) => q.id !== questionId),
    };

    setManual({
      ...manual,
      quizzes: manual.quizzes.map((q, i) =>
        i === currentQuizIndex ? updatedQuiz : q
      ),
    });

    try {
      await updateQuiz(manual.id, updatedQuiz);
      toast({
        title: 'Question deleted',
        description: 'The question has been removed from the quiz.',
      });
    } catch (error) {
      console.error('Failed to save:', error);
    }
  };

  const handleDeleteQuiz = async () => {
    if (!manual || !currentQuiz) return;

    try {
      await deleteQuiz(manual.id, currentQuiz.id);
      
      const updatedQuizzes = manual.quizzes.filter((_, i) => i !== currentQuizIndex);
      setManual({ ...manual, quizzes: updatedQuizzes });
      
      if (currentQuizIndex >= updatedQuizzes.length && updatedQuizzes.length > 0) {
        setCurrentQuizIndex(updatedQuizzes.length - 1);
      }
      
      toast({
        title: 'Quiz deleted',
        description: 'The quiz has been removed.',
      });
      
      if (updatedQuizzes.length === 0) {
        navigate('/');
      }
    } catch (error) {
      console.error('Failed to delete quiz:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete quiz',
        variant: 'destructive',
      });
    }
  };

  const handlePublish = async () => {
    if (!manual) return;

    // Check if any questions are still regenerating
    if (regeneratingQuestions.size > 0) {
      toast({
        title: 'Please Wait',
        description: 'Some questions are still regenerating videos. Please wait before publishing.',
        variant: 'destructive',
      });
      return;
    }

    setIsPublishing(true);
    try {
      await publishQuizzes(manual.id);
      toast({
        title: 'Quizzes Published!',
        description: 'Your quizzes are now ready for users to take.',
      });
      navigate('/');
    } catch (error) {
      console.error('Failed to publish:', error);
      toast({
        title: 'Error',
        description: 'Failed to publish quizzes',
        variant: 'destructive',
      });
    } finally {
      setIsPublishing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!manual || manual.quizzes.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md text-center p-8">
          <CardTitle className="mb-4">No Quizzes Found</CardTitle>
          <p className="text-muted-foreground mb-6">
            This manual doesn't have any quizzes to edit.
          </p>
          <Button onClick={() => navigate('/')}>Back to Dashboard</Button>
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
                <h1 className="text-xl font-bold text-foreground">Quiz Editor</h1>
                <p className="text-sm text-muted-foreground">{manual.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {regeneratingQuestions.size > 0 && (
                <span className="flex items-center gap-2 text-sm text-primary">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {regeneratingQuestions.size} question{regeneratingQuestions.size > 1 ? 's' : ''} regenerating...
                </span>
              )}
              <Button
                variant="success"
                onClick={handlePublish}
                disabled={isPublishing || regeneratingQuestions.size > 0}
                className="gap-2"
              >
                {isPublishing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Publishing...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    Finish & Publish
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container py-8 max-w-4xl">
        {/* Quiz Navigation */}
        <Card className="mb-6">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">
                Quiz {currentQuizIndex + 1} of {manual.quizzes.length}
              </CardTitle>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDeleteQuiz}
                className="gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Delete Quiz
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={() => setCurrentQuizIndex((i) => i - 1)}
                disabled={currentQuizIndex === 0}
                className="gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous Quiz
              </Button>
              <div className="flex gap-2">
                {manual.quizzes.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentQuizIndex(index)}
                    className={cn(
                      'w-8 h-8 rounded-lg font-medium text-sm transition-all',
                      index === currentQuizIndex
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    )}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
              <Button
                variant="outline"
                onClick={() => setCurrentQuizIndex((i) => i + 1)}
                disabled={currentQuizIndex === manual.quizzes.length - 1}
                className="gap-2"
              >
                Next Quiz
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quiz Info */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-foreground">{currentQuiz?.name}</h2>
          <p className="text-muted-foreground">
            {currentQuiz?.questions.length} questions
          </p>
        </div>

        {/* Questions */}
        <div className="space-y-4">
          {currentQuiz?.questions.map((question, index) => (
            <QuestionEditor
              key={question.id}
              question={question}
              index={index}
              isRegenerating={regeneratingQuestions.has(question.id)}
              onUpdate={handleQuestionUpdate}
              onSave={handleQuestionSave}
              onDelete={() => handleDeleteQuestion(question.id)}
            />
          ))}
        </div>

        {currentQuiz?.questions.length === 0 && (
          <Card className="py-12 text-center">
            <p className="text-muted-foreground">No questions in this quiz.</p>
          </Card>
        )}
      </main>
    </div>
  );
};

export default QuizEditor;
