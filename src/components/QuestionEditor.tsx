import { useState, useRef, useEffect } from 'react';
import { Trash2, GripVertical, Check, Loader2, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Question } from '@/lib/types';
import { cn } from '@/lib/utils';

interface QuestionEditorProps {
  question: Question;
  index: number;
  isGenerating?: boolean;
  isSaved?: boolean;
  onUpdate: (question: Question) => void;
  onSave: (question: Question) => void;
  onDelete: () => void;
}

export const QuestionEditor = ({
  question,
  index,
  isGenerating = false,
  isSaved = false,
  onUpdate,
  onSave,
  onDelete,
}: QuestionEditorProps) => {
  const [hasChanges, setHasChanges] = useState(false);
  const originalRef = useRef<Question>(question);

  // Track if question content has changed
  useEffect(() => {
    const hasTextChanges = 
      question.question !== originalRef.current.question ||
      question.correct_answer !== originalRef.current.correct_answer ||
      question.options.some((opt, i) => opt !== originalRef.current.options[i]);
    setHasChanges(hasTextChanges);
  }, [question]);

  // Update original ref when save completes
  useEffect(() => {
    if (isSaved && !isGenerating) {
      originalRef.current = question;
      setHasChanges(false);
    }
  }, [isSaved, isGenerating, question]);

  const handleQuestionTextChange = (text: string) => {
    onUpdate({ ...question, question: text });
  };

  const handleOptionTextChange = (optionIndex: number, text: string) => {
    const newOptions = [...question.options];
    newOptions[optionIndex] = text;
    onUpdate({ ...question, options: newOptions });
  };

  const handleCorrectOptionChange = (optionIndex: number) => {
    const updatedQuestion = {
      ...question,
      correct_answer: optionIndex,
    };
    onUpdate(updatedQuestion);
    // Immediately save when correct answer changes
    onSave(updatedQuestion);
  };

  const handleBlur = () => {
    if (hasChanges && !isGenerating) {
      onSave(question);
    }
  };

  const optionLabels = ['A', 'B', 'C', 'D'];
  const isNewQuestion = question.isNew;

  return (
    <Card className={cn(
      "animate-fade-in transition-all",
      isGenerating && "ring-2 ring-primary/50",
      isNewQuestion && !isGenerating && "ring-2 ring-amber-500/50 bg-amber-50/5"
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
            <span className={cn(
              "flex items-center justify-center w-8 h-8 rounded-lg font-semibold text-sm",
              isNewQuestion 
                ? "bg-amber-500 text-white" 
                : "bg-primary text-primary-foreground"
            )}>
              {index + 1}
            </span>
            {isNewQuestion && (
              <span className="text-xs font-medium text-amber-600 bg-amber-100 px-2 py-1 rounded">
                New
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {isGenerating && (
              <span className="flex items-center gap-2 text-sm text-primary animate-pulse">
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating Assets...
              </span>
            )}
            {isSaved && !isGenerating && !hasChanges && !isNewQuestion && (
              <span className="flex items-center gap-1 text-sm text-success">
                <CheckCircle2 className="h-4 w-4" />
                Saved
              </span>
            )}
            {hasChanges && !isGenerating && (
              <span className="text-xs text-muted-foreground">Unsaved changes</span>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={onDelete}
              disabled={isGenerating}
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
          <Textarea
            id={`question-${question.id}`}
            value={question.question}
            onChange={(e) => handleQuestionTextChange(e.target.value)}
            onBlur={handleBlur}
            placeholder="Enter question text..."
            disabled={isGenerating}
            rows={2}
          />
        </div>

        <div className="space-y-3">
          <Label>Answer Options</Label>
          {question.options.map((option, optIndex) => {
            const isCorrect = question.correct_answer === optIndex;
            return (
              <div key={optIndex} className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleCorrectOptionChange(optIndex)}
                  disabled={isGenerating}
                  className={cn(
                    'flex items-center justify-center w-8 h-8 rounded-lg border-2 transition-all font-medium text-sm',
                    isCorrect
                      ? 'border-success bg-success text-success-foreground'
                      : 'border-border hover:border-primary/50 text-muted-foreground',
                    isGenerating && 'opacity-50 cursor-not-allowed'
                  )}
                >
                  {isCorrect ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    optionLabels[optIndex]
                  )}
                </button>
                <Input
                  value={option}
                  onChange={(e) => handleOptionTextChange(optIndex, e.target.value)}
                  onBlur={handleBlur}
                  placeholder={`Option ${optionLabels[optIndex]}...`}
                  className="flex-1"
                  disabled={isGenerating}
                />
              </div>
            );
          })}
          <p className="text-xs text-muted-foreground">
            Click the letter to mark the correct answer • Changes auto-save on blur
          </p>
        </div>

        {/* Explanation field */}
        <div className="space-y-2">
          <Label htmlFor={`explanation-${question.id}`}>Explanation</Label>
          <Textarea
            id={`explanation-${question.id}`}
            value={question.explanation}
            onChange={(e) => onUpdate({ ...question, explanation: e.target.value })}
            onBlur={handleBlur}
            placeholder="Why is this the correct answer..."
            disabled={isGenerating}
            rows={2}
          />
        </div>

        {/* Reference field */}
        <div className="space-y-2">
          <Label htmlFor={`reference-${question.id}`}>Reference</Label>
          <Input
            id={`reference-${question.id}`}
            value={question.reference}
            onChange={(e) => onUpdate({ ...question, reference: e.target.value })}
            onBlur={handleBlur}
            placeholder="e.g., [DANGER] Fall Hazard"
            disabled={isGenerating}
          />
        </div>
      </CardContent>
    </Card>
  );
};
