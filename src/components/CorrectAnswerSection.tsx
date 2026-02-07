import { useState } from 'react';
import { ArrowRight, CheckCircle2, Subtitles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ExplanationVideo } from './ExplanationVideo';

interface CorrectAnswerSectionProps {
  failureVideoUrl: string;
  successVideoUrl: string;
  isLastQuestion: boolean;
  onNext: () => void;
}

export const CorrectAnswerSection = ({
  failureVideoUrl,
  successVideoUrl,
  isLastQuestion,
  onNext,
}: CorrectAnswerSectionProps) => {
  const [subtitlesEnabled, setSubtitlesEnabled] = useState(false);
  const [showVideo, setShowVideo] = useState(false);

  return (
    <div className="animate-slide-up pt-4">
      {/* Success Message */}
      <div className="flex items-center gap-2 p-4 rounded-lg bg-success/10 text-success mb-4">
        <CheckCircle2 className="h-5 w-5" />
        <span className="font-medium">Correct! Great job.</span>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 mb-4">
        <Button onClick={onNext} className="gap-2">
          {isLastQuestion ? (
            'Finish Quiz'
          ) : (
            <>
              Next Question
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
        {!showVideo && (
          <Button variant="outline" onClick={() => setShowVideo(true)}>
            View Explanation (Optional)
          </Button>
        )}
      </div>

      {/* Optional Video Section - Same layout as wrong answer */}
      {showVideo && (
        <div className="rounded-xl border-2 border-muted bg-muted/5 p-4 space-y-4">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            📚 Safety Explanation
          </h3>

          {/* Subtitles Toggle */}
          <div className="flex items-center justify-end gap-2 px-1">
            <Subtitles className="h-4 w-4 text-muted-foreground" />
            <Label htmlFor="subtitles-correct" className="text-sm text-muted-foreground cursor-pointer">
              Subtitles
            </Label>
            <Switch
              id="subtitles-correct"
              checked={subtitlesEnabled}
              onCheckedChange={setSubtitlesEnabled}
            />
          </div>

          {/* Video 1: The Mistake / What NOT to do */}
          <ExplanationVideo
            label="The Mistake / What NOT to do"
            labelIcon="❌"
            videoUrl={failureVideoUrl}
            subtitlesEnabled={subtitlesEnabled}
            onWatched={() => {}}
          />

          {/* Video 2: The Solution / What to do */}
          <ExplanationVideo
            label="The Solution / What to do"
            labelIcon="✅"
            videoUrl={successVideoUrl}
            subtitlesEnabled={subtitlesEnabled}
            onWatched={() => {}}
          />
        </div>
      )}
    </div>
  );
};
