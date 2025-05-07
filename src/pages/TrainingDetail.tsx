
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import Layout from "@/components/layout/Layout";
import VideoPlayer from "@/components/trainings/VideoPlayer";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, Clock, Users } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { fetchTrainingById, fetchTrainingProgress, updateTrainingProgress } from "@/services/api";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const TrainingDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [training, setTraining] = useState<any>(null);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTraining = async () => {
      if (!id || !user) return;
      
      try {
        setLoading(true);
        setError(null);
        const trainingData = await fetchTrainingById(id);
        setTraining(trainingData);
        
        // Try to load progress if it exists
        try {
          const progressData = await fetchTrainingProgress(id, user.id);
          if (progressData) {
            setProgress(progressData.progress_pct || 0);
          }
        } catch (error) {
          console.log("No progress data found, starting fresh");
        }
      } catch (error) {
        console.error("Error loading training:", error);
        setError("Não foi possível carregar os detalhes do treinamento");
        toast({
          title: "Erro ao carregar treinamento",
          description: "Não foi possível carregar os detalhes do treinamento",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadTraining();
  }, [id, user, navigate]);

  const handleProgressUpdate = async (progressPercent: number) => {
    if (!id || !user) return;
    
    try {
      const isCompleted = progressPercent >= 95; // Consider completed when 95% watched
      await updateTrainingProgress(id, user.id, progressPercent, isCompleted);
      setProgress(progressPercent);
      
      if (isCompleted) {
        toast({
          title: "Treinamento concluído!",
          description: "Parabéns por finalizar este treinamento"
        });
      }
    } catch (error) {
      console.error("Error updating progress:", error);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto py-6">
          <div className="text-center py-12">
            <p>Carregando treinamento...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="container mx-auto py-6">
          <Alert variant="destructive">
            <AlertTitle>Erro</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <div className="text-center py-12">
            <Button 
              variant="link" 
              onClick={() => navigate("/dashboard")} 
              className="mt-4"
            >
              Voltar ao Dashboard
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  if (!training) {
    return (
      <Layout>
        <div className="container mx-auto py-6">
          <div className="text-center py-12">
            <h3 className="text-lg font-medium">Treinamento não encontrado</h3>
            <p className="text-muted-foreground mt-1">
              O treinamento solicitado não existe ou foi removido.
            </p>
            <Button 
              variant="link" 
              onClick={() => navigate("/dashboard")} 
              className="mt-4"
            >
              Voltar ao Dashboard
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto py-6 space-y-6">
        <div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/dashboard")}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-1" /> Voltar
          </Button>
          
          <h1 className="text-2xl font-bold">{training.title}</h1>
        </div>
        
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-1" />
            <span>{training.duration_min} minutos</span>
          </div>
          {training.created_at && (
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              <span>Adicionado em {new Date(training.created_at).toLocaleDateString()}</span>
            </div>
          )}
        </div>
        
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <VideoPlayer 
            videoUrl={training.video_url} 
            videoType={training.video_type}
            onProgressUpdate={handleProgressUpdate}
          />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <div>
              <h2 className="text-xl font-semibold">Descrição</h2>
              <Separator className="my-2" />
              <p className="text-gray-600">
                {training.description || "Nenhuma descrição disponível para este treinamento."}
              </p>
            </div>
            
            {training.tags && training.tags.length > 0 && (
              <div>
                <h3 className="text-lg font-medium">Tags</h3>
                <div className="flex flex-wrap gap-2 mt-2">
                  {training.tags.map((tag: string) => (
                    <span 
                      key={tag} 
                      className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <div>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h3 className="text-lg font-medium mb-4">Seu progresso</h3>
              
              <div className="progress-bar mb-2">
                <div 
                  className="progress-bar-fill bg-taggui-primary" 
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-sm text-gray-500">
                <span>Progresso</span>
                <span className="font-medium">{Math.round(progress)}%</span>
              </div>
              
              {progress >= 100 ? (
                <div className="mt-4 text-center">
                  <div className="inline-block p-2 bg-green-100 text-green-800 rounded-full mb-2">
                    ✓
                  </div>
                  <p className="font-medium">Treinamento concluído</p>
                </div>
              ) : (
                <p className="text-sm text-gray-500 mt-4">
                  Continue assistindo para completar este treinamento.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default TrainingDetail;
