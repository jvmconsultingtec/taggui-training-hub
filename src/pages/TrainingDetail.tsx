
import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import Layout from "@/components/layout/Layout";
import VideoPlayer from "@/components/trainings/VideoPlayer";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, Clock, Loader } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { fetchTrainingById, fetchTrainingProgress, updateTrainingProgress } from "@/services/api";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

export type TrainingStatusType = "not_started" | "in_progress" | "completed";

const TrainingDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, session } = useAuth();
  const [loading, setLoading] = useState(true);
  const [training, setTraining] = useState<any>(null);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<TrainingStatusType>("not_started");
  const [error, setError] = useState<string | null>(null);
  const [loadingProgress, setLoadingProgress] = useState(false);
  const [statusChanging, setStatusChanging] = useState(false);

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
        
        const trainingData = await fetchTrainingById(id);
        
        if (!trainingData) {
          console.error("Training not found for ID:", id);
          setError("Treinamento não encontrado");
          setLoading(false);
          return;
        }
        
        console.log("Training data loaded:", trainingData.title);
        setTraining(trainingData);
        
        setLoadingProgress(true);
        // Load or create progress record
        try {
          console.log("Fetching training progress for training:", id, "and user:", user.id);
          const progressData = await fetchTrainingProgress(id, user.id);
          console.log("Progress data received:", progressData);
          
          if (progressData) {
            console.log("Progress data loaded:", progressData.progress_pct, "Completed:", !!progressData.completed_at);
            
            setProgress(progressData.progress_pct || 0);
            
            // Determine status based on progress
            let currentStatus: TrainingStatusType = "not_started";
            if (progressData.completed_at) {
              currentStatus = "completed";
            } else if (progressData.progress_pct > 0) {
              currentStatus = "in_progress";
            }
            
            setStatus(currentStatus);
            console.log("Set initial status to:", currentStatus);
          } else {
            console.log("No progress data found, initializing with not_started status");
            setStatus("not_started");
            setProgress(0);
          }
        } catch (error) {
          console.error("Error loading progress:", error);
          setStatus("not_started");
          setProgress(0);
        } finally {
          setLoadingProgress(false);
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
      // Update local progress
      setProgress(progressPercent);
      
      // Update status based on progress
      let newStatus = status;
      if (progressPercent >= 100 && status !== "completed") {
        newStatus = "completed";
        setStatus(newStatus);
      } else if (progressPercent > 0 && status === "not_started") {
        newStatus = "in_progress";
        setStatus(newStatus);
      }
      
      console.log(`Updating progress to ${progressPercent}% with status ${newStatus}`);
      
      // Send to API with current status
      await updateTrainingProgress(id, user.id, progressPercent, newStatus === "completed");
    } catch (error) {
      console.error("Error updating progress:", error);
    }
  };

  const handleStatusChange = async (newStatus: TrainingStatusType) => {
    if (!id || !user) return;
    
    // Se estamos tentando alterar para o mesmo status, não faz nada
    if (newStatus === status) {
      console.log("Status já está definido como", newStatus);
      return;
    }
    
    try {
      setStatusChanging(true);
      console.log(`Changing status from ${status} to ${newStatus}`);
      
      // Calculate new progress based on status
      let newProgress = progress;
      if (newStatus === "completed") {
        newProgress = 100; // Sempre 100% para concluído
      } else if (newStatus === "in_progress") {
        // Se estiver vindo de "concluído", definir um valor médio
        if (status === "completed") {
          newProgress = 50;
        } else if (progress === 0) {
          // Se vindo de "não iniciado", iniciar com algum progresso
          newProgress = 10;
        }
      } else if (newStatus === "not_started") {
        newProgress = 0; // Reset progress
      }
      
      // Update local state first for responsive UI
      setStatus(newStatus);
      setProgress(newProgress);
      
      // Send to API
      await updateTrainingProgress(
        id, 
        user.id, 
        newProgress, 
        newStatus === "completed"
      );
      
      console.log(`Status updated to ${newStatus} with progress ${newProgress}%`);
      
      toast({
        title: "Status atualizado",
        description: `Treinamento marcado como ${newStatus === "completed" ? "concluído" : newStatus === "in_progress" ? "em andamento" : "não iniciado"}`
      });
    } catch (error) {
      console.error("Error updating status:", error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status",
        variant: "destructive"
      });
      
      // Revert status changes on error
      const progressData = await fetchTrainingProgress(id, user.id);
      if (progressData) {
        let revertStatus: TrainingStatusType = "not_started";
        if (progressData.completed_at) {
          revertStatus = "completed";
        } else if (progressData.progress_pct > 0) {
          revertStatus = "in_progress";
        }
        
        setStatus(revertStatus);
        setProgress(progressData.progress_pct || 0);
      }
    } finally {
      setStatusChanging(false);
    }
  };

  const getStatusLabel = (status: TrainingStatusType) => {
    switch (status) {
      case "completed": return "Concluído";
      case "in_progress": return "Em andamento";
      case "not_started": return "Não iniciado";
      default: return "Desconhecido";
    }
  };

  const getStatusColor = (status: TrainingStatusType) => {
    switch (status) {
      case "completed": return "bg-green-500 text-white";
      case "in_progress": return "bg-blue-500 text-white";
      case "not_started": return "bg-gray-200 text-gray-800";
      default: return "bg-gray-200";
    }
  };

  // List of available statuses for trainings
  const availableStatuses: {value: TrainingStatusType, label: string}[] = [
    { value: "not_started", label: "Não iniciado" },
    { value: "in_progress", label: "Em andamento" },
    { value: "completed", label: "Concluído" }
  ];

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
          <Link to="/dashboard">
            <Button
              variant="ghost"
              size="sm"
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-1" /> Voltar
            </Button>
          </Link>
          
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
          {training.tags && training.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {training.tags.map((tag: string, i: number) => (
                <Badge key={i} variant="outline">{tag}</Badge>
              ))}
            </div>
          )}
        </div>
        
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {training?.video_url && (
            <VideoPlayer 
              videoUrl={training.video_url} 
              videoType={training.video_type}
              onProgressUpdate={handleProgressUpdate}
              initialProgress={progress}
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
                  {training.tags.map((tag: string, index: number) => (
                    <span 
                      key={index} 
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
              
              {loadingProgress ? (
                <div className="flex justify-center py-4">
                  <Loader className="h-6 w-6 animate-spin text-gray-400" />
                </div>
              ) : (
                <>
                  {/* Status buttons - direct selection without dropdown */}
                  <div className="mb-4">
                    <span className="text-sm text-gray-600 block mb-2">Status:</span>
                    <div className="flex flex-wrap gap-2">
                      {availableStatuses.map(statusOption => (
                        <button
                          key={statusOption.value}
                          onClick={() => handleStatusChange(statusOption.value)}
                          disabled={statusChanging || status === statusOption.value}
                          className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                            status === statusOption.value
                              ? getStatusColor(statusOption.value)
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          } ${statusChanging ? "opacity-50 cursor-not-allowed" : ""}`}
                          aria-pressed={status === statusOption.value}
                          type="button"
                        >
                          {statusOption.label}
                          {status === statusOption.value && <span className="ml-1">✓</span>}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="progress-bar mb-2 bg-gray-200 rounded-full overflow-hidden h-2">
                    <div 
                      className={`progress-bar-fill h-full rounded-full ${
                        status === "completed" ? "bg-green-500" : 
                        status === "in_progress" ? "bg-blue-500" : "bg-gray-300"
                      }`}
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                  
                  <div className="flex justify-between mt-1 text-xs text-gray-500">
                    <span>Progresso</span>
                    <span className="font-medium">{Math.round(progress)}%</span>
                  </div>
                  
                  {status === "completed" ? (
                    <div className="mt-4 text-center">
                      <div className="inline-block p-2 bg-green-100 text-green-800 rounded-full mb-2">
                        ✓
                      </div>
                      <p className="font-medium">Treinamento concluído</p>
                    </div>
                  ) : status === "in_progress" ? (
                    <p className="text-sm text-gray-500 mt-4">
                      Continue assistindo para completar este treinamento.
                    </p>
                  ) : (
                    <p className="text-sm text-gray-500 mt-4">
                      Comece a assistir para registrar seu progresso.
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default TrainingDetail;
