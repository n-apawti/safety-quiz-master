import { FileText, ChevronDown, ChevronUp, Calendar, ClipboardList, Plus, Pencil, Trash2, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AddQuizModal } from '@/components/AddQuizModal';
import { Manual, Quiz } from '@/lib/types';
import { addQuizToManual, deleteQuiz } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface ManualCardProps {
  manual: Manual;
  onManualUpdate: (manual: Manual) => void;
}

export const ManualCard = ({ manual, onManualUpdate }: ManualCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deletingQuizId, setDeletingQuizId] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleAddQuiz = async (quizName: string, questionCount: number) => {
    try {
      const newQuiz = await addQuizToManual({
        manualId: manual.id,
        quizName,
        questionCount,
      });

      onManualUpdate({
        ...manual,
        quizzes: [...manual.quizzes, newQuiz],
      });

      toast({
        title: 'Quiz Created',
        description: `"${quizName}" has been generated with ${questionCount} questions.`,
      });
    } catch (error) {
      console.error('Failed to add quiz:', error);
      toast({
        title: 'Error',
        description: 'Failed to create quiz. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteQuiz = async (quizId: string, quizName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeletingQuizId(quizId);

    try {
      await deleteQuiz(manual.id, quizId);

      onManualUpdate({
        ...manual,
        quizzes: manual.quizzes.filter(q => q.id !== quizId),
      });

      toast({
        title: 'Quiz Deleted',
        description: `"${quizName}" has been removed.`,
      });
    } catch (error) {
      console.error('Failed to delete quiz:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete quiz. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setDeletingQuizId(null);
    }
  };

  const handleEditQuiz = (quizId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/editor/${manual.id}?quiz=${quizId}`);
  };

  return (
    <>
      <Card className="overflow-hidden transition-all duration-200 hover:shadow-card-hover animate-fade-in">
        <CardHeader
          className="cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div className="space-y-1">
                <h3 className="font-semibold text-foreground">{manual.name}</h3>
                <p className="text-sm text-muted-foreground">{manual.filename}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="gap-1">
                <ClipboardList className="h-3 w-3" />
                {manual.quizzes.length} {manual.quizzes.length === 1 ? 'Quiz' : 'Quizzes'}
              </Badge>
              <Button variant="ghost" size="icon" className="shrink-0">
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>Uploaded {formatDate(manual.uploadedAt)}</span>
          </div>
        </CardHeader>

        {isExpanded && (
          <CardContent className="pt-0 animate-slide-up">
            {/* Add New Quiz Button */}
            <div className="mb-4">
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsAddModalOpen(true);
                }}
                className="gap-2 w-full justify-center border-dashed"
              >
                <Plus className="h-4 w-4" />
                Add New Quiz
              </Button>
            </div>

            {manual.quizzes.length === 0 ? (
              <div className="py-6 text-center text-muted-foreground">
                <ClipboardList className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No quizzes generated yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {manual.quizzes.map((quiz, index) => (
                  <div
                    key={quiz.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-sm font-medium">
                        {index + 1}
                      </span>
                      <div>
                        <p className="font-medium text-sm">{quiz.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {quiz.questions.length} questions
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={(e) => handleEditQuiz(quiz.id, e)}
                        className="h-8 w-8"
                        title="Edit Quiz"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={(e) => handleDeleteQuiz(quiz.id, quiz.name, e)}
                        disabled={deletingQuizId === quiz.id}
                        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                        title="Delete Quiz"
                      >
                        {deletingQuizId === quiz.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/quiz/${quiz.id}`);
                        }}
                      >
                        Start Quiz
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        )}
      </Card>

      <AddQuizModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        onSubmit={handleAddQuiz}
        manualName={manual.name}
      />
    </>
  );
};
