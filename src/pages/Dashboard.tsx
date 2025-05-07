
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { fetchAssignedTrainings } from "@/services/api";
import Layout from "@/components/layout/Layout";
import { TrainingStats } from "@/components/dashboard/TrainingStats";
import TrainingCard from "@/components/trainings/TrainingCard";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";

type Assignment = {
  id: string;
  training: {
    id: string;
    title: string;
    description: string | null;
    duration_min: number;
    video_type: "UPLOAD" | "YOUTUBE";
    video_url: string;
  };
};

const Dashboard = () => {
  const { user } = useAuth();
  const [trainings, setTrainings] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTrainings = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const data = await fetchAssignedTrainings(user.id);
        setTrainings(data);
      } catch (error) {
        console.error("Error loading trainings:", error);
        toast({
          title: "Erro ao carregar treinamentos",
          description: "Não foi possível carregar seus treinamentos",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    loadTrainings();
  }, [user]);

  // Stats calculations
  const totalTrainings = trainings.length;
  const completedTrainings = 0; // This would come from progress data
  const inProgressTrainings = totalTrainings - completedTrainings;

  return (
    <Layout>
      <div className="container mx-auto py-6 space-y-8">
        <div>
          <h1 className="text-2xl font-bold">Bem-vindo, {user?.user_metadata?.name || 'Colaborador'}</h1>
          <p className="text-muted-foreground">Acompanhe seus treinamentos e continue aprendendo</p>
        </div>
        
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
