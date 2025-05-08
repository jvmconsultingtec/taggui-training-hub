
import { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2, VolumeX, Maximize, SkipBack, SkipForward, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface VideoPlayerProps {
  videoUrl: string;
  videoType: "YOUTUBE" | "UPLOAD";
  onProgressUpdate?: (progress: number) => void;
  initialProgress?: number;
}

// Helper function to format time (seconds to MM:SS)
const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

// Parse YouTube video ID from URL
const getYoutubeVideoId = (url: string) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
};

// Get proper URL for Supabase storage files
const getProperVideoUrl = (url: string) => {
  console.log("Processing video URL:", url);
  
  // Correct URL format for Supabase Storage
  const SUPABASE_PROJECT_ID = "deudqfjiieufqenzfclv";
  
  // For complete external URLs, return directly
  if (url.startsWith('http://') || url.startsWith('https://')) {
    if (url.includes('supabase.co/storage/v1/object/public/')) {
      console.log("Input is already a complete Supabase URL:", url);
      
      // Ensure the bucket name uses hyphen instead of underscore in the URL
      if (url.includes('/training_videos/')) {
        const correctedUrl = url.replace('/training_videos/', '/training-videos/');
        console.log("Corrected bucket name in URL to use hyphen:", correctedUrl);
        return correctedUrl;
      }
      
      return url;
    }
    console.log("Returning external URL:", url);
    return url;
  }
  
  // If just the file name, create the complete Supabase URL
  if (!url.includes('/')) {
    // Format: https://[PROJECT_ID].supabase.co/storage/v1/object/public/[BUCKET_NAME]/[FILE_PATH]
    const directUrl = `https://${SUPABASE_PROJECT_ID}.supabase.co/storage/v1/object/public/training-videos/${url}`;
    console.log("Created URL from filename with hyphen bucket:", directUrl);
    return directUrl;
  }
  
  // If it already has 'training_videos/' but not the complete Supabase URL
  if ((url.includes('training_videos/') || url.includes('training-videos/')) && !url.includes('supabase.co')) {
    // Ensure we're using the hyphen version in the URL
    const pathPart = url.replace('training_videos/', 'training-videos/');
    const directUrl = `https://${SUPABASE_PROJECT_ID}.supabase.co/storage/v1/object/public/${pathPart}`;
    console.log("Created URL from partial path:", directUrl);
    return directUrl;
  }
  
  // Default case - try to build the complete Supabase URL with hyphen bucket name
  const directUrl = `https://${SUPABASE_PROJECT_ID}.supabase.co/storage/v1/object/public/training-videos/${url}`;
  console.log("Default URL construction with hyphen bucket:", directUrl);
  return directUrl;
};

// Generate alternative URL attempts for fallbacks
const generateAlternativeUrls = (url: string): string[] => {
  const alternatives: string[] = [];
  const SUPABASE_PROJECT_ID = "deudqfjiieufqenzfclv";
  
  // If it's already a full URL
  if (url.includes('supabase.co/storage/v1/object/public/')) {
    // Try with hyphen version of bucket name
    if (url.includes('/training_videos/')) {
      alternatives.push(url.replace('/training_videos/', '/training-videos/'));
    }
    // Try with underscore version of bucket name
    if (url.includes('/training-videos/')) {
      alternatives.push(url.replace('/training-videos/', '/training_videos/'));
    }
    
    // Try direct URL without /object/ segment
    if (url.includes('/object/')) {
      alternatives.push(url.replace('/object/', '/'));
    }
    
    // Extract just the file path
    const pathMatch = url.match(/public\/(training[_-]videos\/[^?#]+)/);
    if (pathMatch && pathMatch[1]) {
      const filePath = pathMatch[1].split('/').pop();
      if (filePath) {
        // Try with just the file name in both bucket formats
        alternatives.push(`https://${SUPABASE_PROJECT_ID}.supabase.co/storage/v1/object/public/training-videos/${filePath}`);
        alternatives.push(`https://${SUPABASE_PROJECT_ID}.supabase.co/storage/v1/object/public/training_videos/${filePath}`);
        
        // Try with full file path in different formats
        if (url.includes('/uploads/')) {
          alternatives.push(`https://${SUPABASE_PROJECT_ID}.supabase.co/storage/v1/object/public/training-videos/uploads/${filePath}`);
          alternatives.push(`https://${SUPABASE_PROJECT_ID}.supabase.co/storage/v1/object/public/training_videos/uploads/${filePath}`);
        }
      }
    }
  } else {
    // For non-URL inputs, assume it's a file name or path
    if (url.includes('/')) {
      // It's a path
      const fileName = url.split('/').pop() || '';
      alternatives.push(`https://${SUPABASE_PROJECT_ID}.supabase.co/storage/v1/object/public/training-videos/${url}`);
      alternatives.push(`https://${SUPABASE_PROJECT_ID}.supabase.co/storage/v1/object/public/training_videos/${url}`);
      alternatives.push(`https://${SUPABASE_PROJECT_ID}.supabase.co/storage/v1/object/public/training-videos/uploads/${fileName}`);
      alternatives.push(`https://${SUPABASE_PROJECT_ID}.supabase.co/storage/v1/object/public/training_videos/uploads/${fileName}`);
    } else {
      // It's just a filename
      alternatives.push(`https://${SUPABASE_PROJECT_ID}.supabase.co/storage/v1/object/public/training-videos/${url}`);
      alternatives.push(`https://${SUPABASE_PROJECT_ID}.supabase.co/storage/v1/object/public/training_videos/${url}`);
      alternatives.push(`https://${SUPABASE_PROJECT_ID}.supabase.co/storage/v1/object/public/training-videos/uploads/${url}`);
      alternatives.push(`https://${SUPABASE_PROJECT_ID}.supabase.co/storage/v1/object/public/training_videos/uploads/${url}`);
    }
  }
  
  return alternatives;
};

const VideoPlayer = ({ videoUrl, videoType, onProgressUpdate, initialProgress = 0 }: VideoPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(initialProgress);
  const [error, setError] = useState<string | null>(null);
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [loadAttempts, setLoadAttempts] = useState(0);
  const [alternativeUrls, setAlternativeUrls] = useState<string[]>([]);
  
  const videoRef = useRef<HTMLVideoElement>(null);

  // Set up proper video URL
  useEffect(() => {
    if (videoType === "UPLOAD" && videoUrl) {
      try {
        console.log("Original video URL:", videoUrl);
        const directUrl = getProperVideoUrl(videoUrl);
        console.log("Attempting to load video from:", directUrl);
        setVideoSrc(directUrl);
        
        // Generate alternative URLs for fallbacks
        const altUrls = generateAlternativeUrls(videoUrl);
        console.log("Generated alternative URLs:", altUrls);
        setAlternativeUrls(altUrls);
      } catch (err) {
        console.error("Error setting up video URL:", err);
        setError("Erro ao processar URL do vídeo");
      }
    }
  }, [videoUrl, videoType]);
  
  // YouTube embed with responsive container
  if (videoType === "YOUTUBE") {
    const videoId = getYoutubeVideoId(videoUrl);
    
    if (!videoId) {
      return <div className="bg-gray-100 p-4 text-center rounded">Link do YouTube inválido</div>;
    }
    
    return (
      <div className="aspect-video w-full bg-black rounded-lg overflow-hidden">
        <iframe
          className="w-full h-full"
          src={`https://www.youtube.com/embed/${videoId}`}
          title="YouTube video player"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      </div>
    );
  }
  
  // Handle play/pause toggle
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        // Reset error state when trying to play
        setError(null);
        videoRef.current.play().catch(err => {
          console.error("Error playing video:", err);
          setError(`Não foi possível reproduzir o vídeo: ${err.message}`);
        });
      }
      setIsPlaying(!isPlaying);
    }
  };
  
  // Handle volume change
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setVolume(value);
    if (videoRef.current) {
      videoRef.current.volume = value;
    }
    
    if (value === 0) {
      setIsMuted(true);
    } else if (isMuted) {
      setIsMuted(false);
    }
  };
  
  // Toggle mute
  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };
  
  // Handle seeking
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setCurrentTime(value);
    if (videoRef.current) {
      videoRef.current.currentTime = value;
    }
    
    // Calculate and update progress
    const newProgress = (value / duration) * 100;
    setProgress(newProgress);
    if (onProgressUpdate) {
      onProgressUpdate(newProgress);
    }
  };
  
  // Update time and progress as video plays
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      
      const newProgress = (videoRef.current.currentTime / duration) * 100;
      
      // Only send progress updates every ~5%
      if (Math.abs(newProgress - progress) > 5 && onProgressUpdate) {
        onProgressUpdate(newProgress);
        setProgress(newProgress);
      }
    }
  };
  
  // Handle video metadata loaded (to get duration)
  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
      
      // Set initial position based on initialProgress
      if (initialProgress > 0 && initialProgress <= 100) {
        const time = (initialProgress / 100) * videoRef.current.duration;
        videoRef.current.currentTime = time;
        setCurrentTime(time);
      }
    }
  };
  
  // Handle fullscreen toggle
  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        videoRef.current.requestFullscreen();
      }
    }
  };
  
  // Skip forward/backward
  const skip = (seconds: number) => {
    if (videoRef.current) {
      const newTime = Math.max(0, Math.min(videoRef.current.duration, videoRef.current.currentTime + seconds));
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };
  
  // Handle errors
  const handleVideoError = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    console.error("Video error:", e, e.currentTarget.error);
    const videoElement = e.currentTarget;
    let errorMessage = "Ocorreu um erro ao carregar o vídeo.";
    
    if (videoElement.error) {
      switch (videoElement.error.code) {
        case 1:
          errorMessage = "O vídeo foi abortado.";
          break;
        case 2:
          errorMessage = "Erro de rede ao carregar o vídeo.";
          break;
        case 3:
          errorMessage = "Erro de decodificação. O formato pode não ser suportado.";
          break;
        case 4:
          errorMessage = "O vídeo não está disponível ou não é suportado.";
          break;
        default:
          errorMessage = `Erro de reprodução (código ${videoElement.error.code}).`;
      }
    }
    
    console.log("Detailed error information:", {
      code: videoElement.error?.code,
      message: videoElement.error?.message,
      videoUrl: videoSrc,
    });
    
    setError(errorMessage);
    setIsPlaying(false);
  };
  
  // Try alternative URL
  const tryAlternativeUrl = async () => {
    if (alternativeUrls.length > 0) {
      try {
        const currentAttempt = loadAttempts % alternativeUrls.length;
        const newUrl = alternativeUrls[currentAttempt];
        
        setLoadAttempts(prev => prev + 1);
        setError(`Tentando URL alternativa... (${currentAttempt + 1}/${alternativeUrls.length})`);
        
        console.log(`Trying alternative URL ${currentAttempt + 1}/${alternativeUrls.length}:`, newUrl);
        
        setVideoSrc(newUrl);
        setError(null);
      } catch (err) {
        console.error("Erro ao tentar URL alternativa:", err);
        setError("Não foi possível carregar o vídeo de forma alternativa.");
      }
    } else {
      setError("Não há URLs alternativas disponíveis para tentar.");
    }
  };
  
  return (
    <div className="relative group bg-black rounded-lg overflow-hidden">
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro de reprodução</AlertTitle>
          <AlertDescription className="flex flex-col">
            <p>{error}</p>
            <div className="flex justify-end mt-4">
              <Button 
                onClick={tryAlternativeUrl}
                variant="secondary"
                size="sm"
              >
                Tentar URL alternativa
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}
      
      {videoSrc && (
        <video
          ref={videoRef}
          className="w-full h-auto"
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onError={handleVideoError}
          onEnded={() => {
            setIsPlaying(false);
            if (onProgressUpdate) {
              onProgressUpdate(100);
            }
          }}
          controls // Keep native browser controls as fallback
          controlsList="nodownload"
          crossOrigin="anonymous"
          playsInline
        >
          <source src={videoSrc} type="video/mp4" />
          <p>Seu navegador não suporta a reprodução de vídeos.</p>
        </video>
      )}
      
      {/* Video controls - appears on hover */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity">
        {/* Progress bar */}
        <div className="relative mb-2">
          <input
            type="range"
            min={0}
            max={duration || 100}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-1 bg-gray-300 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
          />
          <div 
            className="absolute top-0 left-0 h-1 bg-primary rounded-full pointer-events-none"
            style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
          ></div>
        </div>
        
        <div className="flex items-center justify-between text-white">
          {/* Left controls */}
          <div className="flex items-center gap-2">
            <button onClick={togglePlay} className="p-1">
              {isPlaying ? <Pause size={20} /> : <Play size={20} />}
            </button>
            
            <button onClick={() => skip(-10)} className="p-1">
              <SkipBack size={20} />
            </button>
            
            <button onClick={() => skip(10)} className="p-1">
              <SkipForward size={20} />
            </button>
            
            <div className="flex items-center gap-1.5 mx-2">
              <button onClick={toggleMute} className="p-1">
                {isMuted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-16 h-1 bg-gray-300 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-2 [&::-webkit-slider-thumb]:w-2 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
              />
            </div>
            
            <span className="text-sm">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>
          
          {/* Right controls */}
          <button onClick={toggleFullscreen} className="p-1">
            <Maximize size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
