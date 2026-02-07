import { Play, Volume2, RotateCcw } from 'lucide-react';
import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ExplanationVideoProps {
  label: string;
  labelIcon: '❌' | '✅';
  videoUrl: string;
  subtitlesEnabled: boolean;
  onWatched: () => void;
  className?: string;
}

export const ExplanationVideo = ({
  label,
  labelIcon,
  videoUrl,
  subtitlesEnabled,
  onWatched,
  className = '',
}: ExplanationVideoProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [hasWatched, setHasWatched] = useState(false);

  const handlePlay = useCallback(() => {
    setIsPlaying(true);
    setProgress(0);

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsPlaying(false);
          setHasWatched(true);
          onWatched();
          return 100;
        }
        return prev + 10;
      });
    }, 300);
  }, [onWatched]);

  const handleReplay = useCallback(() => {
    setProgress(0);
    handlePlay();
  }, [handlePlay]);

  return (
    <div className={cn('rounded-lg overflow-hidden bg-foreground/5 border', className)}>
      <div className="px-4 py-2 bg-muted/50 border-b">
        <span className="text-sm font-medium">
          {labelIcon} {label}
        </span>
      </div>
      <div className="aspect-video flex items-center justify-center bg-gradient-to-br from-muted/50 to-muted/30 relative">
        {!isPlaying && progress === 0 ? (
          <Button onClick={handlePlay} size="lg" className="gap-2 shadow-elevated">
            <Play className="h-5 w-5" />
            Watch Video
          </Button>
        ) : isPlaying ? (
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-2 text-primary">
              <Volume2 className="h-8 w-8 animate-pulse" />
              <span className="text-lg font-medium">Playing...</span>
            </div>
            <div className="w-48 h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            {subtitlesEnabled && (
              <div className="absolute bottom-4 left-4 right-4 bg-black/80 text-white text-sm px-3 py-2 rounded text-center">
                [Subtitles: Demonstrating proper safety procedure...]
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="text-success flex items-center gap-2">
              <span className="text-lg font-medium">✓ Video Complete</span>
            </div>
            <Button variant="outline" size="sm" onClick={handleReplay} className="gap-2">
              <RotateCcw className="h-4 w-4" />
              Replay
            </Button>
          </div>
        )}

        {isPlaying && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-muted">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>
    </div>
  );
};
