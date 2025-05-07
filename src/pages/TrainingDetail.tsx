import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import Layout from "@/components/layout/Layout";
import VideoPlayer from "@/components/trainings/VideoPlayer";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, Clock, Users, Loader } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { fetchTrainingById, fetchTrainingProgress, updateTrainingProgress } from "@/services/api";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const TrainingDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, session } = useAuth();
  const [loading, setLoading] = useState(true);
  const [training, setTraining] = useState<any>(null);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTraining = async () => {
      if (!id) {
        setError("ID do treinamento não fornecido");
        setLoading(false);
        return;
      }
      
      if (!user || !session) {
        console.error("User or session is null. User:", user, "Session:", session ? "exists" : "null");
        setError("Usuário não autenticado");
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        setError(null);
        console.log("Loading training with ID:", id, "User ID:", user.id);
        
        // Verificar se a sessão é válida
        console.log("Current session expires at:", new Date(session?.expires_at || 0).toLocaleString());
        console.log("Current time:", new Date().toLocaleString());
        
        const trainingData = await fetchTrainingById(id);
        
        if (!trainingData) {
          console.error("Training not found for ID:", id);
          setError("Treinamento não encontrado");
          setLoading(false);
          return;
        }
        
        console.log("Training data loaded:", trainingData.title);
        setTraining(trainingData);
        
        // Try to load progress if it exists
        try {
          console.log("Fetching training progress for training:", id, "and user:", user.id);
          const progressData = await fetchTrainingProgress(id, user.id);
          if (progressData) {
            console.log("Progress data loaded:", progressData.progress_pct);
            setProgress(progressData.progress_pct || 0);
          } else {
            console.log("No progress data found");
          }
        } catch (error) {
          console.error("Error loading progress:", error);
          console.log("No progress data found, starting fresh");
        }
      } catch (error: any) {
        console.error("Error loading training:", error);
        setError(error.message || "Não foi possível carregar os detalhes do treinamento");
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
  }, [id, user, session, navigate]);

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
            <Loader className="h-6 w-6 text-gray-400 animate-spin mx-auto mb-2" />
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
          {training.video_url && (
            <VideoPlayer 
              videoUrl={training.video_url} 
              videoType={training.video_type}
              onProgressUpdate={handleProgressUpdate}
            />
          )}
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
              
              <div className="progress-bar mb-2 bg-gray-200 rounded-full overflow-hidden h-2">
                <div 
                  className="progress-bar-fill bg-taggui-primary h-full rounded-full" 
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-sm text-gray-500">
                <span>Progresso</span>
                <span className="font-medium">{Math.round(progress)}%</span>
              </div>
              
              {progress >= 95 ? (
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
