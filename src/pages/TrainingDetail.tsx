
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { fetchTrainingById, updateTrainingProgress } from "@/services/api";
import Layout from "@/components/layout/Layout";
import VideoPlayer from "@/components/trainings/VideoPlayer";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Clock, Bookmark, Tag, Check } from "lucide-react";
import { toast } from "@/hooks/use-toast";

type Training = {
  id: string;
  title: string;
  description: string | null;
  duration_min: number;
  video_type: "UPLOAD" | "YOUTUBE";
  video_url: string;
  tags: string[] | null;
};

const TrainingDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [training, setTraining] = useState<Training | null>(null);
  const [loading, setLoading] = useState(true);
  const [completed, setCompleted] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const loadTraining = async () => {
      if (!id || !user) return;
      
      try {
        setLoading(true);
        const data = await fetchTrainingById(id);
        setTraining(data);
        
        // Here you would load progress data from training_progress table
      } catch (error) {
        console.error("Error loading training:", error);
        toast({
          title: "Erro ao carregar treinamento",
          description: "Não foi possível carregar os detalhes do treinamento",
          variant: "destructive"
        });
        navigate("/dashboard");
      } finally {
        setLoading(false);
      }
    };

    loadTraining();
  }, [id, user, navigate]);

  const handleProgressUpdate = async (progressPercent: number) => {
    if (!training || !user) return;
    
    try {
      setProgress(progressPercent);
      await updateTrainingProgress(training.id, user.id, progressPercent);
    } catch (error) {
      console.error("Error updating progress:", error);
    }
  };

  const handleComplete = async () => {
    if (!training || !user) return;
    
    try {
      await updateTrainingProgress(training.id, user.id, 100, true);
      setCompleted(true);
      setProgress(100);
      
      toast({
        title: "Treinamento completado",
        description: "Parabéns por completar este treinamento!",
      });
    } catch (error) {
      console.error("Error completing training:", error);
      toast({
        title: "Erro ao completar treinamento",
        description: "Não foi possível marcar o treinamento como concluído",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto py-6">
          <div className="text-center">Carregando treinamento...</div>
        </div>
      </Layout>
    );
  }

  if (!training) {
    return (
      <Layout>
        <div className="container mx-auto py-6">
          <div className="text-center">Treinamento não encontrado</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">{training.title}</h1>
            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{training.duration_min} minutos</span>
              </div>
              {completed ? (
                <div className="flex items-center gap-1 text-green-600">
                  <Check className="h-4 w-4" />
                  <span>Concluído</span>
                </div>
              ) : (
                <div className="flex items-center gap-1">
                  <Bookmark className="h-4 w-4" />
                  <span>{progress}% completo</span>
                </div>
              )}
            </div>
          </div>
          <Button 
            onClick={handleComplete} 
            disabled={completed || progress < 90}
            className="bg-taggui-primary hover:bg-taggui-primary-hover"
          >
            {completed ? "Concluído" : "Marcar como Concluído"}
          </Button>
        </div>

        <VideoPlayer 
          videoType={training.video_type} 
          videoUrl={training.video_url}
          onProgressUpdate={handleProgressUpdate}
        />

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Sobre este treinamento</h2>
          <Separator />
          <div className="prose max-w-none">
            {training.description ? (
              <p>{training.description}</p>
            ) : (
              <p className="text-muted-foreground">Nenhuma descrição disponível.</p>
            )}
          </div>

          {training.tags && training.tags.length > 0 && (
            <div className="pt-4">
              <div className="flex items-center gap-2 flex-wrap">
                <Tag className="h-4 w-4 text-muted-foreground" />
                {training.tags.map((tag, index) => (
                  <div key={index} className="bg-taggui-primary-light text-taggui-primary px-2 py-1 rounded text-xs">
                    {tag}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default TrainingDetail;
