import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  Trash2,
  Check,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Plus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { QuestionEditor } from '@/components/QuestionEditor';
import { fetchManualById, updateQuiz, updateQuestionText, generateQuestionAssets, deleteQuiz, publishQuizzes } from '@/lib/api';
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
  const [generatingQuestions, setGeneratingQuestions] = useState<Set<string>>(new Set());
  const [savedQuestions, setSavedQuestions] = useState<Set<string>>(new Set());

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

  // Create a new blank question
  const handleAddQuestion = () => {
    if (!manual || !currentQuiz) return;

    const newQuestion: Question = {
      id: `question-${Date.now()}`,
      question: '',
      options: ['', '', ''],
      correct_answer_index: 0,
      common_pitfall_index: 1,
      video_assets: {
        failure_video: '',
        success_video: '',
      },
      isNew: true, // Mark as new - needs asset generation
    };

    const updatedQuiz: Quiz = {
      ...currentQuiz,
      questions: [...currentQuiz.questions, newQuestion],
    };

    setManual({
      ...manual,
      quizzes: manual.quizzes.map((q, i) =>
        i === currentQuizIndex ? updatedQuiz : q
      ),
    });

    toast({
      title: 'Question Added',
      description: 'Fill in the details and save to generate assets.',
    });
  };

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

  // Smart save: differentiate between existing and new questions
  const handleQuestionSave = async (question: Question) => {
    if (!manual || !currentQuiz) return;

    // Check if this is a NEW question (needs asset generation)
    if (question.isNew) {
      // Validate that the question has content
      if (!question.question.trim() || question.options.some(o => !o.trim())) {
        toast({
          title: 'Incomplete Question',
          description: 'Please fill in all fields before saving.',
          variant: 'destructive',
        });
        return;
      }

      // Mark as generating
      setGeneratingQuestions(prev => new Set(prev).add(question.id));

      try {
        // Generate assets for the new question
        const updatedQuestion = await generateQuestionAssets(manual.id, currentQuiz.id, question);
        
        // Update local state
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

        setSavedQuestions(prev => new Set(prev).add(question.id));
        
        toast({
          title: 'Assets Generated',
          description: 'Videos have been created for this question.',
        });
      } catch (error) {
        console.error('Failed to generate assets:', error);
        toast({
          title: 'Error',
          description: 'Failed to generate question assets',
          variant: 'destructive',
        });
      } finally {
        setGeneratingQuestions(prev => {
          const newSet = new Set(prev);
          newSet.delete(question.id);
          return newSet;
        });
      }
    } else {
      // EXISTING question - just update text, no video regeneration
      try {
        await updateQuestionText(manual.id, currentQuiz.id, question);
        
        setSavedQuestions(prev => new Set(prev).add(question.id));
        
        // Clear saved status after a delay
        setTimeout(() => {
          setSavedQuestions(prev => {
            const newSet = new Set(prev);
            newSet.delete(question.id);
            return newSet;
          });
        }, 2000);
      } catch (error) {
        console.error('Failed to save question:', error);
        toast({
          title: 'Error',
          description: 'Failed to save question',
          variant: 'destructive',
        });
      }
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

    // Check if any questions are still generating
    if (generatingQuestions.size > 0) {
      toast({
        title: 'Please Wait',
        description: 'Some questions are still generating assets. Please wait before publishing.',
        variant: 'destructive',
      });
      return;
    }

    // Check for incomplete new questions
    const hasIncompleteNew = currentQuiz?.questions.some(q => q.isNew);
    if (hasIncompleteNew) {
      toast({
        title: 'Incomplete Questions',
        description: 'Please save all new questions before publishing.',
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
              {generatingQuestions.size > 0 && (
                <span className="flex items-center gap-2 text-sm text-primary">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {generatingQuestions.size} question{generatingQuestions.size > 1 ? 's' : ''} generating...
                </span>
              )}
              <Button
                variant="success"
                onClick={handlePublish}
                disabled={isPublishing || generatingQuestions.size > 0}
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
              isGenerating={generatingQuestions.has(question.id)}
              isSaved={savedQuestions.has(question.id)}
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

        {/* Add Question Button */}
        <Button
          variant="outline"
          onClick={handleAddQuestion}
          className="w-full mt-6 gap-2 border-dashed h-14 text-base"
        >
          <Plus className="h-5 w-5" />
          Add Question
        </Button>
      </main>
    </div>
  );
};

export default QuizEditor;
