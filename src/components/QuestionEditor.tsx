import { Trash2, GripVertical, Check } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Question, Option } from '@/lib/types';
import { cn } from '@/lib/utils';

interface QuestionEditorProps {
  question: Question;
  index: number;
  onUpdate: (question: Question) => void;
  onDelete: () => void;
}

export const QuestionEditor = ({
  question,
  index,
  onUpdate,
  onDelete,
}: QuestionEditorProps) => {
  const handleQuestionTextChange = (text: string) => {
    onUpdate({ ...question, text });
  };

  const handleOptionTextChange = (optionId: string, text: string) => {
    onUpdate({
      ...question,
      options: question.options.map((opt) =>
        opt.id === optionId ? { ...opt, text } : opt
      ),
    });
  };

  const handleCorrectOptionChange = (optionId: string) => {
    onUpdate({
      ...question,
      options: question.options.map((opt) => ({
        ...opt,
        isCorrect: opt.id === optionId,
      })),
    });
  };

  const optionLabels = ['A', 'B', 'C'];

  return (
    <Card className="animate-fade-in">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-primary-foreground font-semibold text-sm">
              {index + 1}
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onDelete}
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor={`question-${question.id}`}>Question Text</Label>
          <Input
            id={`question-${question.id}`}
            value={question.text}
            onChange={(e) => handleQuestionTextChange(e.target.value)}
            placeholder="Enter question text..."
          />
        </div>

        <div className="space-y-3">
          <Label>Answer Options</Label>
          {question.options.map((option, optIndex) => (
            <div key={option.id} className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => handleCorrectOptionChange(option.id)}
                className={cn(
                  'flex items-center justify-center w-8 h-8 rounded-lg border-2 transition-all font-medium text-sm',
                  option.isCorrect
                    ? 'border-success bg-success text-success-foreground'
                    : 'border-border hover:border-primary/50 text-muted-foreground'
                )}
              >
                {option.isCorrect ? (
                  <Check className="h-4 w-4" />
                ) : (
                  optionLabels[optIndex]
                )}
              </button>
              <Input
                value={option.text}
                onChange={(e) => handleOptionTextChange(option.id, e.target.value)}
                placeholder={`Option ${optionLabels[optIndex]}...`}
                className="flex-1"
              />
            </div>
          ))}
          <p className="text-xs text-muted-foreground">
            Click the letter to mark the correct answer
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
