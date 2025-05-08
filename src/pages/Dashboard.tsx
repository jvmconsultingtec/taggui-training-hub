
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { fetchAssignedTrainings, fetchCurrentUser, fetchUserTrainingProgress } from "@/services/api";
import Layout from "@/components/layout/Layout";
import { TrainingStats } from "@/components/dashboard/TrainingStats";
import TrainingCard from "@/components/trainings/TrainingCard";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { AlertCircle, RefreshCcw } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { refreshData } from "@/integrations/supabase/client";

type Assignment = {
  id: string;
  training: {
    id: string;
    title: string;
    description: string | null;
    duration_min: number;
    video_type: "UPLOAD" | "YOUTUBE";
    video_url: string;
    tags: string[] | null;
  };
};

type TrainingProgress = {
  training_id: string;
  progress_pct: number;
  completed_at: string | null;
};

const Dashboard = () => {
  const { user, session } = useAuth();
  const [trainings, setTrainings] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [progressMap, setProgressMap] = useState<Record<string, TrainingProgress>>({});
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const loadUserProfile = async () => {
      if (!user) return;
      
      try {
        console.log("Loading user profile for:", user.id);
        const profile = await fetchCurrentUser();
        
        if (profile) {
          console.log("User profile loaded:", profile.name);
          setUserProfile(profile);
        } else {
          console.warn("Could not load user profile");
        }
      } catch (err) {
        console.error("Error loading user profile:", err);
      }
    };

    if (user) {
      loadUserProfile();
    }
  }, [user]);

  useEffect(() => {
    const loadTrainings = async () => {
      if (!user) {
        console.log("No user, skipping training load");
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        setError(null);
        
        console.log("Loading trainings and progress for user:", user.id);
        
        // Fetch assigned trainings with fresh data
        const assignments = await refreshData(() => fetchAssignedTrainings(user.id));
        if (!assignments || assignments.length === 0) {
          console.log("No assignments found for user");
          setTrainings([]);
        } else {
          setTrainings(assignments);
          console.log("Trainings loaded:", assignments.length);
        }
        
        // Fetch progress for all trainings with fresh data
        const progress = await refreshData(() => fetchUserTrainingProgress(user.id));
        console.log("Progress loaded:", progress.length);
        
        // Create a map of training_id to progress data
        const progressMapData: Record<string, TrainingProgress> = {};
        progress.forEach(item => {
          progressMapData[item.training_id] = {
            training_id: item.training_id,
            progress_pct: item.progress_pct || 0,
            completed_at: item.completed_at
          };
        });
        
        setProgressMap(progressMapData);
      } catch (err: any) {
        console.error("Error loading trainings:", err);
        setError("Não foi possível carregar os treinamentos. Por favor, tente novamente mais tarde.");
      } finally {
        setLoading(false);
      }
    };

    loadTrainings();
  }, [user, retryCount]);

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
  };

  // Stats calculations
  const totalTrainings = trainings.length;
  const completedTrainings = Object.values(progressMap).filter(p => p.completed_at !== null).length;
  const inProgressTrainings = Object.values(progressMap).filter(p => !p.completed_at && p.progress_pct > 0).length;
  
  console.log("Stats calculations:", {
    total: totalTrainings,
    completed: completedTrainings,
    inProgress: inProgressTrainings
  });

  // Get status for a training
  const getTrainingStatus = (trainingId: string) => {
    const progress = progressMap[trainingId];
    if (!progress) return "not_started";
    if (progress.completed_at) return "completed";
    if (progress.progress_pct > 0) return "in_progress";
    return "not_started";
  };

  // Get progress for a training
  const getTrainingProgress = (trainingId: string) => {
    return progressMap[trainingId]?.progress_pct || 0;
  };

  return (
    <Layout>
      <div className="container mx-auto py-6 space-y-8">
        <div>
          <h1 className="text-2xl font-bold">
            Bem-vindo, {userProfile?.name || user?.user_metadata?.name || 'Colaborador'}
          </h1>
          <p className="text-muted-foreground">Acompanhe seus treinamentos e continue aprendendo</p>
        </div>
        
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erro</AlertTitle>
            <AlertDescription className="flex justify-between items-center">
              <span>{error}</span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRetry}
                className="ml-2"
              >
                <RefreshCcw className="h-4 w-4 mr-1" /> Tentar Novamente
              </Button>
            </AlertDescription>
          </Alert>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <TrainingStats
              total={totalTrainings}
              completed={completedTrainings}
              inProgress={inProgressTrainings}
            />
          </div>
          <div>
            <Button className="w-full" variant="outline">Ver certificados</Button>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Meus treinamentos</h2>
          </div>
          <Separator />
          
          {loading ? (
            <div className="text-center py-8">Carregando treinamentos...</div>
          ) : trainings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {trainings.map((assignment) => (
                <TrainingCard 
                  key={assignment.id} 
                  training={assignment.training}
                  status={getTrainingStatus(assignment.training.id)}
                  progress={getTrainingProgress(assignment.training.id)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium">Nenhum treinamento disponível</h3>
              <p className="text-muted-foreground mt-1">
                Você ainda não tem treinamentos atribuídos.
              </p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
