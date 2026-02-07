import { useState } from 'react';
import { ArrowRight, CheckCircle2, Subtitles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ExplanationVideo } from './ExplanationVideo';

interface CorrectAnswerSectionProps {
  videoUrl: string;
  isLastQuestion: boolean;
  onNext: () => void;
}

export const CorrectAnswerSection = ({
  videoUrl,
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
            Watch Explanation (Optional)
          </Button>
        )}
      </div>

      {/* Optional Video Section */}
      {showVideo && (
        <div className="space-y-3">
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
          <ExplanationVideo
            label="Correct Procedure Explanation"
            labelIcon="✅"
            videoUrl={videoUrl}
            subtitlesEnabled={subtitlesEnabled}
            onWatched={() => {}}
          />
        </div>
      )}
    </div>
  );
};
