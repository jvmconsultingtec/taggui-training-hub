
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
  video_url?: string;
  video_type?: "YOUTUBE" | "UPLOAD";
  training?: {
    id: string;
    title: string;
    description: string | null;
    duration_min: number;
    video_type: "YOUTUBE" | "UPLOAD";
    video_url: string;
    tags?: string[] | null;
    status?: TrainingStatus;
  };
}

const statusIcons = {
  not_started: <Clock className="h-4 w-4 mr-1" />,
  in_progress: <Play className="h-4 w-4 mr-1" />,
  completed: <Check className="h-4 w-4 mr-1" />
};

const statusLabels = {
  not_started: "Não iniciado",
  in_progress: "Em andamento",
  completed: "Concluído"
};

const statusColors = {
  not_started: "bg-gray-100 text-gray-700",
  in_progress: "bg-blue-100 text-blue-700",
  completed: "bg-green-100 text-green-700"
};

const TrainingCard = (props: TrainingCardProps) => {
  // If we're receiving the "training" object, extract properties from it
  const {
    id = props.training?.id,
    title = props.training?.title,
    description = props.training?.description,
    duration = props.training?.duration_min,
    video_url = props.video_url || props.training?.video_url,
    video_type = props.video_type || props.training?.video_type,
    progress = 0,
    status = props.status || props.training?.status || "not_started",
    thumbnailUrl
  } = props;

  // Calculate progress bar width based on status
  const progressWidth = status === "completed" ? 100 : 
                       status === "in_progress" ? (progress || 50) : 0;

  const tags = props.training?.tags || [];

  return (
    <Link to={`/trainings/${id}`} className="block group">
      <div className="border border-gray-200 rounded-md overflow-hidden transition-shadow hover:shadow-md">
        {/* Training info header */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex justify-between items-start gap-2 mb-1">
            <h3 className="font-medium text-gray-900 group-hover:text-taggui-primary transition-colors line-clamp-1">{title}</h3>
            
            <div className={`flex items-center px-2 py-1 rounded-full text-xs ${statusColors[status]}`}>
              {statusIcons[status]}
              <span>{statusLabels[status]}</span>
            </div>
          </div>
          
          {description && (
            <p className="text-sm text-gray-600 line-clamp-2 mb-2">{description}</p>
          )}
          
          <div className="flex items-center text-xs text-gray-500">
            <span className="flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              {duration} min
            </span>
            
            {tags && tags.length > 0 && (
              <div className="flex ml-3 gap-1">
                {tags.slice(0, 2).map((tag, index) => (
                  <span 
                    key={index}
                    className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs"
                  >
                    {tag}
                  </span>
                ))}
                {tags.length > 2 && (
                  <span className="text-gray-500">+{tags.length - 2}</span>
                )}
              </div>
            )}
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="h-1 w-full bg-gray-100">
          <div 
            className={`h-full ${
              status === "completed" ? "bg-green-500" : 
              status === "in_progress" ? "bg-blue-500" : "bg-gray-200"
            }`}
            style={{ width: `${progressWidth}%` }}
          />
        </div>
      </div>
    </Link>
  );
};

export default TrainingCard;
