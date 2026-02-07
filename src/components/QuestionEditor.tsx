import { useState, useRef, useEffect } from 'react';
import { Trash2, GripVertical, Check, Loader2, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Question, Option } from '@/lib/types';
import { cn } from '@/lib/utils';

interface QuestionEditorProps {
  question: Question;
  index: number;
  isRegenerating?: boolean;
  onUpdate: (question: Question) => void;
  onSave: (question: Question) => void;
  onDelete: () => void;
}

export const QuestionEditor = ({
  question,
  index,
  isRegenerating = false,
  onUpdate,
  onSave,
  onDelete,
}: QuestionEditorProps) => {
  const [hasChanges, setHasChanges] = useState(false);
  const originalRef = useRef<Question>(question);

  // Track if question content has changed
  useEffect(() => {
    const hasTextChanges = 
      question.text !== originalRef.current.text ||
      question.options.some((opt, i) => 
        opt.text !== originalRef.current.options[i]?.text ||
        opt.isCorrect !== originalRef.current.options[i]?.isCorrect
      );
    setHasChanges(hasTextChanges);
  }, [question]);

  // Update original ref when save completes (regeneration done)
  useEffect(() => {
    if (!isRegenerating && hasChanges) {
      originalRef.current = question;
      setHasChanges(false);
    }
  }, [isRegenerating]);

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
    const updatedQuestion = {
      ...question,
      options: question.options.map((opt) => ({
        ...opt,
        isCorrect: opt.id === optionId,
      })),
    };
    onUpdate(updatedQuestion);
    // Immediately save when correct answer changes
    onSave(updatedQuestion);
  };

  const handleBlur = () => {
    if (hasChanges && !isRegenerating) {
      onSave(question);
    }
  };

  const optionLabels = ['A', 'B', 'C'];

  return (
    <Card className={cn(
      "animate-fade-in transition-all",
      isRegenerating && "ring-2 ring-primary/50"
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-primary-foreground font-semibold text-sm">
              {index + 1}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {isRegenerating && (
              <span className="flex items-center gap-2 text-sm text-primary animate-pulse">
                <RefreshCw className="h-4 w-4 animate-spin" />
                Regenerating Video...
              </span>
            )}
            {hasChanges && !isRegenerating && (
              <span className="text-xs text-muted-foreground">Unsaved changes</span>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={onDelete}
              disabled={isRegenerating}
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor={`question-${question.id}`}>Question Text</Label>
          <Input
            id={`question-${question.id}`}
            value={question.text}
            onChange={(e) => handleQuestionTextChange(e.target.value)}
            onBlur={handleBlur}
            placeholder="Enter question text..."
            disabled={isRegenerating}
          />
        </div>

        <div className="space-y-3">
          <Label>Answer Options</Label>
          {question.options.map((option, optIndex) => (
            <div key={option.id} className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => handleCorrectOptionChange(option.id)}
                disabled={isRegenerating}
                className={cn(
                  'flex items-center justify-center w-8 h-8 rounded-lg border-2 transition-all font-medium text-sm',
                  option.isCorrect
                    ? 'border-success bg-success text-success-foreground'
                    : 'border-border hover:border-primary/50 text-muted-foreground',
                  isRegenerating && 'opacity-50 cursor-not-allowed'
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
                onBlur={handleBlur}
                placeholder={`Option ${optionLabels[optIndex]}...`}
                className="flex-1"
                disabled={isRegenerating}
              />
            </div>
          ))}
          <p className="text-xs text-muted-foreground">
            Click the letter to mark the correct answer • Changes auto-save on blur
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
