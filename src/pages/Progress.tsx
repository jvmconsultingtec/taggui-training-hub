
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { fetchAssignedTrainings, fetchTrainingProgress } from "@/services/api";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Check, Clock, Play } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress as ProgressBar } from "@/components/ui/progress";

type TrainingStatus = "not_started" | "in_progress" | "completed";

type TrainingWithProgress = {
  id: string;
  title: string;
  description: string | null;
  duration_min: number;
  progress_pct: number;
  status: TrainingStatus;
  last_viewed_at?: string;
  tags: string[] | null;
};

const statusIcons = {
  not_started: <Clock className="h-4 w-4 mr-1" />,
  in_progress: <Play className="h-4 w-4 mr-1" />,
  completed: <Check className="h-4 w-4 mr-1" />
};

const ProgressPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [trainings, setTrainings] = useState<TrainingWithProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTrainingsWithProgress = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        setError(null);
        const assignments = await fetchAssignedTrainings(user.id);
        
        if (!assignments || assignments.length === 0) {
          setLoading(false);
          return;
        }
        
        const trainingWithProgressPromises = assignments.map(async (assignment) => {
          const training = assignment.training;
          
          if (!training) {
            console.error("Training data missing in assignment:", assignment);
            return null;
          }
          
          const progress = await fetchTrainingProgress(training.id, user.id);
          
          // Determine status
          let status: TrainingStatus = "not_started";
          if (progress?.completed_at) {
            status = "completed";
          } else if (progress?.progress_pct > 0) {
            status = "in_progress";
          }
          
          return {
            id: training.id,
            title: training.title,
            description: training.description,
            duration_min: training.duration_min,
            progress_pct: progress?.progress_pct || 0,
            status: status,
            last_viewed_at: progress?.last_viewed_at,
            tags: training.tags,
          };
        });
        
        const trainingWithProgress = (await Promise.all(trainingWithProgressPromises)).filter(Boolean) as TrainingWithProgress[];
        setTrainings(trainingWithProgress);
      } catch (err: any) {
        console.error("Erro ao carregar progresso dos treinamentos:", err);
        setError("Não foi possível carregar seu progresso. Por favor, tente novamente mais tarde.");
      } finally {
        setLoading(false);
      }
    };

    loadTrainingsWithProgress();
  }, [user]);

  const getStatusLabel = (status: TrainingStatus) => {
    switch (status) {
      case "completed": return "Concluído";
      case "in_progress": return "Em andamento";
      case "not_started": return "Não iniciado";
      default: return "Desconhecido";
    }
  };

  const getStatusColor = (status: TrainingStatus): string => {
    switch (status) {
      case "completed": return "bg-green-500";
      case "in_progress": return "bg-blue-500";
      case "not_started": return "bg-gray-500";
      default: return "bg-gray-500";
    }
  };

  const getBadgeVariant = (status: TrainingStatus) => {
    switch (status) {
      case "completed": return "default";
      case "in_progress": return "secondary";
      case "not_started": return "outline";
      default: return "outline";
    }
  };

  const handleViewDashboard = () => {
    navigate("/dashboard");
  };

  return (
    <Layout>
      <div className="container mx-auto py-6 space-y-8">
        <div>
          <h1 className="text-2xl font-bold">Meu Progresso</h1>
          <p className="text-muted-foreground">Acompanhe seu progresso em todos os treinamentos</p>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erro</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Visão Geral</CardTitle>
            <CardDescription>Seu progresso em todos os treinamentos atribuídos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-8">Carregando progresso...</div>
              ) : trainings.length > 0 ? (
                trainings.map((training) => (
                  <div key={training.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <Link to={`/trainings/${training.id}`} className="hover:underline">
                          <h3 className="font-medium">{training.title}</h3>
                        </Link>
                        <p className="text-sm text-muted-foreground">
                          {training.description?.substring(0, 100) || "Sem descrição"}
                          {training.description && training.description.length > 100 ? "..." : ""}
                        </p>
                      </div>
                      <div className="flex items-center">
                        {statusIcons[training.status]}
                        <Badge variant={getBadgeVariant(training.status) as any} className="ml-1">
                          {getStatusLabel(training.status)}
                        </Badge>
                      </div>
                    </div>
                    
                    {training.status !== "not_started" && (
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <ProgressBar 
                            className={`h-2 ${getStatusColor(training.status)} bg-gray-200`}
                            value={training.progress_pct}
                          />
                        </div>
                        <div className="text-sm font-medium">{Math.round(training.progress_pct)}%</div>
                      </div>
                    )}
                    
                    <div className="flex justify-between flex-wrap items-center text-xs text-muted-foreground">
                      <div className="flex items-center gap-4">
                        <span>Duração: {training.duration_min} minutos</span>
                        {training.last_viewed_at && (
                          <span>
                            Última visualização:{" "}
                            {new Date(training.last_viewed_at).toLocaleDateString("pt-BR")}
                          </span>
                        )}
                      </div>
                      
                      {/* Display tags */}
                      {training.tags && training.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {training.tags.map((tag, i) => (
                            <span key={i} className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full text-xs">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <Separator className="my-2" />
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <h3 className="text-lg font-medium">Nenhum treinamento atribuído</h3>
                  <p className="text-muted-foreground mt-1">
                    Você ainda não tem treinamentos atribuídos.
                  </p>
                  <Button className="mt-4" onClick={handleViewDashboard}>
                    Ver treinamentos disponíveis
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default ProgressPage;
