
import { Check, Clock, Play } from "lucide-react";
import { Link } from "react-router-dom";

export type TrainingStatus = "pending" | "inprogress" | "completed" | "overdue";

export interface TrainingCardProps {
  id: string;
  title: string;
  description?: string;
  duration: number;
  progress: number;
  status: TrainingStatus;
  thumbnailUrl?: string;
}

const statusIcons = {
  pending: <Clock className="h-4 w-4" />,
  inprogress: <Play className="h-4 w-4" />,
  completed: <Check className="h-4 w-4" />,
  overdue: <Clock className="h-4 w-4" />
};

const statusLabels = {
  pending: "Pendente",
  inprogress: "Em andamento",
  completed: "Concluído",
  overdue: "Atrasado"
};

const TrainingCard = ({
  id,
  title,
  description,
  duration,
  progress,
  status,
  thumbnailUrl
}: TrainingCardProps) => {
  return (
    <Link to={`/trainings/${id}`} className="block group">
      <div className="taggui-card group-hover:shadow-md transition-shadow">
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
              <span className={`status-badge ${status}`}>
                {statusIcons[status]}
                <span>{statusLabels[status]}</span>
              </span>
            </div>
            
            {description && (
              <p className="text-sm text-gray-600 line-clamp-2">{description}</p>
            )}
            
            <div className="pt-1">
              <div className="progress-bar">
                <div 
                  className="progress-bar-fill bg-taggui-primary" 
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <div className="flex justify-between mt-1 text-xs text-gray-500">
                <span>Progresso</span>
                <span className="font-medium">{progress}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default TrainingCard;
