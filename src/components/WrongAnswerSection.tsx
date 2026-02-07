import { useState } from 'react';
import { RotateCcw, Subtitles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ExplanationVideo } from './ExplanationVideo';

interface WrongAnswerSectionProps {
  wrongVideoUrl: string;
  correctVideoUrl: string;
  onRetry: () => void;
}

export const WrongAnswerSection = ({
  wrongVideoUrl,
  correctVideoUrl,
  onRetry,
}: WrongAnswerSectionProps) => {
  const [wrongVideoWatched, setWrongVideoWatched] = useState(false);
  const [correctVideoWatched, setCorrectVideoWatched] = useState(false);
  const [subtitlesEnabled, setSubtitlesEnabled] = useState(false);

  const canRetry = wrongVideoWatched && correctVideoWatched;

  return (
    <div className="animate-slide-up pt-4 space-y-4">
      {/* Error Message */}
      <div className="flex items-center gap-2 p-4 rounded-lg bg-destructive/10 text-destructive">
        <span className="font-medium">
          ❌ Incorrect answer. Please watch both explanation videos to retry.
        </span>
      </div>

      {/* Subtitles Toggle */}
      <div className="flex items-center justify-end gap-2 px-1">
        <Subtitles className="h-4 w-4 text-muted-foreground" />
        <Label htmlFor="subtitles-toggle" className="text-sm text-muted-foreground cursor-pointer">
          Subtitles
        </Label>
        <Switch
          id="subtitles-toggle"
          checked={subtitlesEnabled}
          onCheckedChange={setSubtitlesEnabled}
        />
      </div>

      {/* Safety Explanation Container */}
      <div className="rounded-xl border-2 border-warning/30 bg-warning/5 p-4 space-y-4">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          📚 Safety Explanation
        </h3>

        {/* Video 1: What went wrong */}
        <ExplanationVideo
          label="What went wrong (Example of what NOT to do)"
          labelIcon="❌"
          videoUrl={wrongVideoUrl}
          subtitlesEnabled={subtitlesEnabled}
          onWatched={() => setWrongVideoWatched(true)}
        />

        {/* Video 2: Correct Procedure */}
        <ExplanationVideo
          label="Correct Procedure (What to do)"
          labelIcon="✅"
          videoUrl={correctVideoUrl}
          subtitlesEnabled={subtitlesEnabled}
          onWatched={() => setCorrectVideoWatched(true)}
        />

        {/* Watch Progress Indicator */}
        <div className="flex items-center gap-4 text-sm">
          <span className={wrongVideoWatched ? 'text-success' : 'text-muted-foreground'}>
            {wrongVideoWatched ? '✓' : '○'} Wrong example video
          </span>
          <span className={correctVideoWatched ? 'text-success' : 'text-muted-foreground'}>
            {correctVideoWatched ? '✓' : '○'} Correct procedure video
          </span>
        </div>
      </div>

      {/* Retry Button */}
      <div className="flex justify-center pt-2">
        <Button
          onClick={onRetry}
          disabled={!canRetry}
          variant={canRetry ? 'default' : 'outline'}
          className="gap-2"
          size="lg"
        >
          <RotateCcw className="h-4 w-4" />
          Retry Question
        </Button>
      </div>

      {!canRetry && (
        <p className="text-sm text-warning text-center">
          ⚠️ Watch both videos to unlock the retry button
        </p>
      )}
    </div>
  );
};
