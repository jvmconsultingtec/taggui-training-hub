
import { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2, VolumeX, Maximize, SkipBack, SkipForward, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

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

// Add public URL to Supabase storage URLs if needed
const getProperVideoUrl = (url: string) => {
  // If it's already a complete URL, return it
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // Otherwise treat as a storage path and construct proper URL
  // Using Supabase URL from environment or default
  const supabaseUrl = "https://deudqfjiieufqenzfclv.supabase.co";
  return `${supabaseUrl}/storage/v1/object/public/${url}`;
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
  const [availableFormats, setAvailableFormats] = useState<string[]>([]);
  
  const videoRef = useRef<HTMLVideoElement>(null);

  // Set up proper video URL
  useEffect(() => {
    if (videoType === "UPLOAD") {
      try {
        const directUrl = getProperVideoUrl(videoUrl);
        console.log("Initial URL attempt:", directUrl);
        setVideoSrc(directUrl);
        
        // Prepare alternative formats to try if the primary one fails
        const urlWithoutExtension = videoUrl.replace(/\.[^/.]+$/, "");
        const alternativeFormats = [
          videoUrl, // Original URL
          `training_videos/${videoUrl.split('/').pop()}`, // Just the filename with training_videos prefix
          `uploads/${videoUrl.split('/').pop()}`, // Just the filename with uploads prefix
        ];
        
        console.log("Alternative formats prepared:", alternativeFormats);
        setAvailableFormats(alternativeFormats);
      } catch (err) {
        console.error("Error setting up video URL:", err);
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
      setProgress(newProgress);
      
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
    
    setError(errorMessage);
    setIsPlaying(false);
    
    // Try to load with next available format if there are more to try
    if (availableFormats.length > 0) {
      const nextFormat = availableFormats.shift();
      if (nextFormat) {
        console.log("Auto trying next format:", nextFormat);
        setVideoSrc(getProperVideoUrl(nextFormat));
      }
    }
  };
  
  // Try direct URL for video
  const tryDirectUrl = () => {
    if (videoUrl && videoType === "UPLOAD") {
      try {
        // Prepare a list of URLs to try
        const urlsToTry = [
          // Original with authenticated path
          videoUrl.replace('/storage/v1/object/public', '/storage/v1/object/authenticated'),
          // Try with direct Supabase URL
          `https://deudqfjiieufqenzfclv.supabase.co/storage/v1/object/public/training_videos/${videoUrl.split('/').pop()}`,
          // Try with just the filename in training_videos bucket
          `training_videos/${videoUrl.split('/').pop()}`,
          // Try with direct embed
          `https://deudqfjiieufqenzfclv.supabase.co/storage/v1/object/authenticated/training_videos/${videoUrl.split('/').pop()}?download=true`,
        ];
        
        // Use the first URL that hasn't been tried yet
        const nextUrl = urlsToTry.find(url => url !== videoSrc);
        
        if (nextUrl) {
          console.log("Trying alternative URL:", nextUrl);
          setVideoSrc(getProperVideoUrl(nextUrl));
          setError(null);
        } else {
          setError("Tentamos todos os formatos disponíveis. O vídeo pode estar indisponível.");
        }
      } catch (err) {
        console.error("Error with alternative URL:", err);
      }
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
                onClick={tryDirectUrl}
                variant="secondary"
                size="sm"
              >
                Tentar URL alternativo
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
          crossOrigin="anonymous"
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
            className="absolute top-0 left-0 h-1 bg-taggui-primary rounded-full pointer-events-none"
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
