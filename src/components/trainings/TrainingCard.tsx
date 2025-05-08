
import { Check, Clock, Play } from "lucide-react";
import { Link } from "react-router-dom";

export type TrainingStatus = "not_started" | "in_progress" | "completed";

export interface TrainingCardProps {
  id?: string;
  title?: string;
  description?: string | null;
  duration?: number;
  progress?: number;
  status?: TrainingStatus;
  thumbnailUrl?: string;
  training?: {
    id: string;
    title: string;
    description: string | null;
    duration_min: number;
    video_type: "UPLOAD" | "YOUTUBE";
    video_url: string;
    tags?: string[] | null;
  };
}

const statusIcons = {
  not_started: <Clock className="h-4 w-4" />,
  in_progress: <Play className="h-4 w-4" />,
  completed: <Check className="h-4 w-4" />
};

const statusLabels = {
  not_started: "Não iniciado",
  in_progress: "Em andamento",
  completed: "Concluído"
};

const statusColors = {
  not_started: "bg-gray-200 text-gray-800",
  in_progress: "bg-blue-500 text-white",
  completed: "bg-green-500 text-white"
};

const TrainingCard = (props: TrainingCardProps) => {
  // If we're receiving the "training" object, extract properties from it
  const {
    id = props.training?.id,
    title = props.training?.title,
    description = props.training?.description,
    duration = props.training?.duration_min,
    progress = 0,
    status = "not_started",
    thumbnailUrl
  } = props;

  // Calculate progress bar width - ensure it's always accurate
  const progressWidth = status === "completed" ? 100 : 
                       status === "in_progress" ? (progress || 50) : 0;

  const tags = props.training?.tags || [];

  return (
    <Link to={`/trainings/${id}`} className="block group">
      <div className="border border-gray-200 rounded-md p-4 group-hover:shadow-md transition-shadow">
        <div className="relative">
          <div className="aspect-video rounded-md bg-gray-200 overflow-hidden mb-3">
            {thumbnailUrl ? (
              <img 
                src={thumbnailUrl} 
                alt={title} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-100">
                <Play className="text-gray-400" size={40} />
              </div>
            )}
            
            {/* Play overlay */}
            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <div className="h-12 w-12 rounded-full bg-white/90 flex items-center justify-center">
                <Play className="text-taggui-primary h-6 w-6" fill="currentColor" />
              </div>
            </div>
            
            {/* Duration badge */}
            <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
              {duration} min
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-gray-900 group-hover:text-taggui-primary transition-colors">{title}</h3>
              <span className={`px-2 py-1 rounded text-xs flex items-center gap-1 ${statusColors[status]}`}>
                {statusIcons[status]}
                <span>{statusLabels[status]}</span>
              </span>
            </div>
            
            {description && (
              <p className="text-sm text-gray-600 line-clamp-2">{description}</p>
            )}
            
            <div className="pt-1">
              <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
                <div 
                  className={`h-full rounded-full ${
                    status === "completed" ? "bg-green-500" : 
                    status === "in_progress" ? "bg-blue-500" : "bg-gray-300"
                  }`}
                  style={{ width: `${progressWidth}%` }}
                ></div>
              </div>
              <div className="flex justify-between mt-1 text-xs text-gray-500">
                <span>Status</span>
                <span className="font-medium">{statusLabels[status]}</span>
              </div>
            </div>
            
            {/* Display tags */}
            {tags && tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1 pt-2">
                {tags.map((tag, index) => (
                  <span 
                    key={index} 
                    className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default TrainingCard;
