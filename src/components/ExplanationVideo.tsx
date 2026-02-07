import { Play, Pause, Volume2, VolumeX, RotateCcw, AlertCircle } from 'lucide-react';
import { useState, useRef, useCallback, useEffect } from 'react';
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
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [hasWatched, setHasWatched] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Check if we have a valid video URL
  const hasVideo = videoUrl && videoUrl.trim() !== '';

  console.log('[DEBUG] ExplanationVideo:', { label, videoUrl, hasVideo });

  const handlePlay = useCallback(() => {
    if (videoRef.current && hasVideo) {
      setIsLoading(true);
      videoRef.current.play().then(() => {
        setIsPlaying(true);
        setIsLoading(false);
      }).catch((err) => {
        console.error('Video play error:', err);
        setHasError(true);
        setIsLoading(false);
      });
    } else if (!hasVideo) {
      // Simulate video for demo purposes when no URL
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
    }
  }, [hasVideo, onWatched]);

  const handlePause = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  }, []);

  const handleReplay = useCallback(() => {
    if (videoRef.current && hasVideo) {
      videoRef.current.currentTime = 0;
      setProgress(0);
      setHasWatched(false);
      handlePlay();
    } else {
      setProgress(0);
      setHasWatched(false);
      handlePlay();
    }
  }, [hasVideo, handlePlay]);

  const handleTimeUpdate = useCallback(() => {
    if (videoRef.current) {
      const currentProgress = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setProgress(currentProgress);
    }
  }, []);

  const handleVideoEnded = useCallback(() => {
    setIsPlaying(false);
    setHasWatched(true);
    setProgress(100);
    onWatched();
  }, [onWatched]);

  const handleVideoError = useCallback(() => {
    setHasError(true);
    setIsLoading(false);
    console.error('Video failed to load:', videoUrl);
  }, [videoUrl]);

  const toggleMute = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  }, [isMuted]);

  return (
    <div className={cn('rounded-lg overflow-hidden bg-foreground/5 border', className)}>
      <div className="px-4 py-2 bg-muted/50 border-b">
        <span className="text-sm font-medium">
          {labelIcon} {label}
        </span>
      </div>
      <div className="aspect-video flex items-center justify-center bg-gradient-to-br from-muted/50 to-muted/30 relative">
        {/* Actual Video Element (hidden until playing) */}
        {hasVideo && (
          <video
            ref={videoRef}
            src={videoUrl}
            className={cn(
              'w-full h-full object-contain absolute inset-0',
              (!isPlaying && progress === 0) ? 'hidden' : ''
            )}
            onTimeUpdate={handleTimeUpdate}
            onEnded={handleVideoEnded}
            onError={handleVideoError}
            onLoadedData={() => setIsLoading(false)}
            playsInline
            muted={isMuted}
          />
        )}

        {/* Error State */}
        {hasError && (
          <div className="flex flex-col items-center gap-3 text-muted-foreground">
            <AlertCircle className="h-8 w-8" />
            <span className="text-sm">Video unavailable</span>
            <Button variant="outline" size="sm" onClick={() => { setHasError(false); handlePlay(); }}>
              Retry
            </Button>
          </div>
        )}

        {/* No Video URL State */}
        {!hasVideo && !isPlaying && progress === 0 && (
          <div className="flex flex-col items-center gap-3 text-muted-foreground">
            <AlertCircle className="h-8 w-8" />
            <span className="text-sm font-medium">Video not available</span>
            <span className="text-xs">Video has not been generated yet</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setHasWatched(true);
                setProgress(100);
                onWatched();
              }}
            >
              Skip
            </Button>
          </div>
        )}

        {/* Loading State */}
        {isLoading && !hasError && (
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <span className="text-sm">Loading video...</span>
          </div>
        )}

        {/* Initial State - Show Play Button (only when video exists) */}
        {hasVideo && !isPlaying && progress === 0 && !hasError && !isLoading && (
          <Button onClick={handlePlay} size="lg" className="gap-2 shadow-elevated">
            <Play className="h-5 w-5" />
            Watch Video
          </Button>
        )}

        {/* Video Controls Overlay (when video is playing) */}
        {isPlaying && hasVideo && !hasError && !isLoading && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3 flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={handlePause} className="text-white hover:bg-white/20">
              <Pause className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={toggleMute} className="text-white hover:bg-white/20">
              {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
            </Button>
            <div className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
              <div
                className="h-full bg-white transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Complete State */}
        {!isPlaying && progress >= 100 && !hasError && (
          <div className="flex flex-col items-center gap-3 absolute inset-0 bg-black/40 justify-center">
            <div className="text-white flex items-center gap-2">
              <span className="text-lg font-medium">✓ Video Complete</span>
            </div>
            <Button variant="outline" size="sm" onClick={handleReplay} className="gap-2 bg-white/10 text-white border-white/30 hover:bg-white/20">
              <RotateCcw className="h-4 w-4" />
              Replay
            </Button>
          </div>
        )}

        {/* Subtitles */}
        {isPlaying && subtitlesEnabled && (
          <div className="absolute bottom-12 left-4 right-4 bg-black/80 text-white text-sm px-3 py-2 rounded text-center">
            [Subtitles: Demonstrating proper safety procedure...]
          </div>
        )}

        {/* Progress Bar (bottom) */}
        {(isPlaying || progress > 0) && !hasVideo && (
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
