import { useState, useRef, useEffect } from 'react';
import { Trash2, GripVertical, Check, Loader2, CheckCircle2, ChevronDown, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
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
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const originalRef = useRef<Question>(question);

  // Track if question content has changed
  useEffect(() => {
    const hasTextChanges = 
      question.question !== originalRef.current.question ||
      question.options.some((opt, i) => opt !== originalRef.current.options[i]) ||
      question.correct_answer_index !== originalRef.current.correct_answer_index ||
      question.common_pitfall_index !== originalRef.current.common_pitfall_index ||
      question.explanation !== originalRef.current.explanation ||
      question.video_assets.success_video !== originalRef.current.video_assets.success_video ||
      question.video_assets.failure_video !== originalRef.current.video_assets.failure_video;
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
    onUpdate({
      ...question,
      options: newOptions,
    });
  };

  const handleCorrectOptionChange = (optionIndex: number) => {
    const updatedQuestion = {
      ...question,
      correct_answer_index: optionIndex,
      // If pitfall was set to the new correct answer, reset it
      common_pitfall_index: question.common_pitfall_index === optionIndex 
        ? (optionIndex === 0 ? 1 : 0) 
        : question.common_pitfall_index,
    };
    onUpdate(updatedQuestion);
    onSave(updatedQuestion);
  };

  const handlePitfallChange = (optionIndex: number) => {
    const updatedQuestion = {
      ...question,
      common_pitfall_index: optionIndex,
    };
    onUpdate(updatedQuestion);
    onSave(updatedQuestion);
  };

  const handleExplanationChange = (text: string) => {
    onUpdate({ ...question, explanation: text });
  };

  const handleVideoAssetChange = (field: 'success_video' | 'failure_video', text: string) => {
    onUpdate({
      ...question,
      video_assets: {
        ...question.video_assets,
        [field]: text,
      },
    });
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
        {/* Question Text */}
        <div className="space-y-2">
          <Label htmlFor={`question-${question.id}`}>Question Text</Label>
          <Input
            id={`question-${question.id}`}
            value={question.question}
            onChange={(e) => handleQuestionTextChange(e.target.value)}
            onBlur={handleBlur}
            placeholder="Enter question text..."
            disabled={isGenerating}
          />
        </div>

        {/* Answer Options with Correct Answer & Pitfall Selectors */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Answer Options</Label>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Check className="h-3 w-3 text-success" /> Correct
              </span>
              <span className="flex items-center gap-1">
                <AlertTriangle className="h-3 w-3 text-amber-500" /> Pitfall
              </span>
            </div>
          </div>
          
          {question.options.map((option, optIndex) => {
            const isCorrect = optIndex === question.correct_answer_index;
            const isPitfall = optIndex === question.common_pitfall_index;
            
            return (
              <div key={optIndex} className="flex items-center gap-2">
                {/* Correct Answer Button */}
                <button
                  type="button"
                  onClick={() => handleCorrectOptionChange(optIndex)}
                  disabled={isGenerating}
                  title="Mark as correct answer"
                  className={cn(
                    'flex items-center justify-center w-8 h-8 rounded-lg border-2 transition-all font-medium text-sm shrink-0',
                    isCorrect
                      ? 'border-success bg-success text-success-foreground'
                      : 'border-border hover:border-success/50 text-muted-foreground',
                    isGenerating && 'opacity-50 cursor-not-allowed'
                  )}
                >
                  {isCorrect ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    optionLabels[optIndex]
                  )}
                </button>
                
                {/* Pitfall Button (only for incorrect options) */}
                <button
                  type="button"
                  onClick={() => handlePitfallChange(optIndex)}
                  disabled={isGenerating || isCorrect}
                  title={isCorrect ? "Correct answer cannot be pitfall" : "Mark as common pitfall"}
                  className={cn(
                    'flex items-center justify-center w-8 h-8 rounded-lg border-2 transition-all shrink-0',
                    isPitfall && !isCorrect
                      ? 'border-amber-500 bg-amber-500 text-white'
                      : 'border-border hover:border-amber-500/50 text-muted-foreground',
                    (isGenerating || isCorrect) && 'opacity-30 cursor-not-allowed'
                  )}
                >
                  <AlertTriangle className="h-4 w-4" />
                </button>
                
                {/* Option Input */}
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
            Click <Check className="h-3 w-3 inline text-success" /> to mark correct answer • Click <AlertTriangle className="h-3 w-3 inline text-amber-500" /> to mark common pitfall
          </p>
        </div>

        {/* Collapsible Advanced Section */}
        <Collapsible open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
          <CollapsibleTrigger asChild>
            <Button 
              variant="ghost" 
              className="w-full justify-between text-muted-foreground hover:text-foreground"
            >
              <span className="flex items-center gap-2">
                Video & AI Settings
              </span>
              <ChevronDown className={cn(
                "h-4 w-4 transition-transform",
                isAdvancedOpen && "rotate-180"
              )} />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-4 pt-4">
            {/* Explanation Field */}
            <div className="space-y-2">
              <Label htmlFor={`explanation-${question.id}`}>Explanation Text</Label>
              <Textarea
                id={`explanation-${question.id}`}
                value={question.explanation || ''}
                onChange={(e) => handleExplanationChange(e.target.value)}
                onBlur={handleBlur}
                placeholder="Explanation shown after the user answers..."
                disabled={isGenerating}
                rows={2}
              />
            </div>

            {/* Video Asset Scripts */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor={`success-video-${question.id}`} className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-success" />
                  Success Video Script
                </Label>
                <Textarea
                  id={`success-video-${question.id}`}
                  value={question.video_assets?.success_video || ''}
                  onChange={(e) => handleVideoAssetChange('success_video', e.target.value)}
                  onBlur={handleBlur}
                  placeholder="Visual: Description of the correct behavior video..."
                  disabled={isGenerating}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`failure-video-${question.id}`} className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                  Failure Video Script
                </Label>
                <Textarea
                  id={`failure-video-${question.id}`}
                  value={question.video_assets?.failure_video || ''}
                  onChange={(e) => handleVideoAssetChange('failure_video', e.target.value)}
                  onBlur={handleBlur}
                  placeholder="Visual: Description of the incorrect behavior video..."
                  disabled={isGenerating}
                  rows={3}
                />
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
};
