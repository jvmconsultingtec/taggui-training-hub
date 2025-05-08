
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress as ProgressBar } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { fetchAssignedTrainings, fetchTrainingProgress } from "@/services/api";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

type TrainingStatus = "not_started" | "in_progress" | "completed";

type TrainingWithProgress = {
  id: string;
  title: string;
  description: string | null;
  duration_min: number;
  progress_pct: number;
  status: TrainingStatus;
  last_viewed_at?: string;
};

const Progress = () => {
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
        
        const trainingWithProgressPromises = assignments.map(async (assignment) => {
          const progress = await fetchTrainingProgress(assignment.training.id, user.id);
          
          // Determine status
          let status: TrainingStatus = "not_started";
          if (progress?.completed_at) {
            status = "completed";
          } else if (progress?.progress_pct > 0) {
            status = "in_progress";
          }
          
          return {
            id: assignment.training.id,
            title: assignment.training.title,
            description: assignment.training.description,
            duration_min: assignment.training.duration_min,
            progress_pct: progress?.progress_pct || 0,
            status: status,
            last_viewed_at: progress?.last_viewed_at,
          };
        });
        
        const trainingWithProgress = await Promise.all(trainingWithProgressPromises);
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
      case "completed": return "default";
      case "in_progress": return "blue";
      case "not_started": return "secondary";
      default: return "secondary";
    }
  };

  const getProgressColor = (status: TrainingStatus): string => {
    switch (status) {
      case "completed": return "bg-green-500";
      case "in_progress": return "bg-blue-500";
      case "not_started": return "bg-gray-300";
      default: return "bg-gray-300";
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
                      <Badge variant={getStatusColor(training.status) as any} className="ml-2">
                        {getStatusLabel(training.status)}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
                          <div 
                            className={`h-full ${getProgressColor(training.status)}`}
                            style={{ width: `${training.progress_pct}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="text-sm font-medium">{Math.round(training.progress_pct)}%</div>
                    </div>
                    <div className="flex justify-between items-center text-xs text-muted-foreground">
                      <span>Duração: {training.duration_min} minutos</span>
                      {training.last_viewed_at && (
                        <span>
                          Última visualização:{" "}
                          {new Date(training.last_viewed_at).toLocaleDateString("pt-BR")}
                        </span>
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

export default Progress;
