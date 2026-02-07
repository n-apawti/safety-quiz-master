import { Play, Volume2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface VideoPlayerProps {
  videoUrl: string;
  onWatched: () => void;
  className?: string;
}

export const VideoPlayer = ({ videoUrl, onWatched, className = '' }: VideoPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  const handlePlay = () => {
    setIsPlaying(true);
    // Simulate video playback
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          onWatched();
          return 100;
        }
        return prev + 20;
      });
    }, 500);
  };

  return (
    <div className={`relative rounded-lg overflow-hidden bg-foreground/5 ${className}`}>
      <div className="aspect-video flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
        {!isPlaying ? (
          <Button
            onClick={handlePlay}
            size="lg"
            className="gap-2 shadow-elevated"
          >
            <Play className="h-5 w-5" />
            Watch Explanation
          </Button>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-2 text-primary">
              <Volume2 className="h-8 w-8 animate-pulse-soft" />
              <span className="text-lg font-medium">Playing explanation...</span>
            </div>
            <div className="w-48 h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>
      {isPlaying && progress < 100 && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-muted">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
};
