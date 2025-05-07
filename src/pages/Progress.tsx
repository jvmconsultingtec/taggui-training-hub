
import { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { useAuth } from "@/hooks/useAuth";
import { fetchAssignedTrainings } from "@/services/api";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts";
import { Separator } from "@/components/ui/separator";

type AssignedTraining = {
  id: string;
  training: {
    id: string;
    title: string;
    description: string | null;
    duration_min: number;
    video_type: "UPLOAD" | "YOUTUBE";
    video_url: string;
  };
  progress?: {
    progress_pct: number;
    completed_at: string | null;
  };
};

// Dados do gráfico
const COLORS = ["#0088FE", "#00C49F", "#FF8042"];

const ProgressPage = () => {
  const { user } = useAuth();
  const [trainings, setTrainings] = useState<AssignedTraining[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTrainings = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const data = await fetchAssignedTrainings(user.id);
        
        // Aqui seria o local para carregar o progresso de cada treinamento
        // No momento, estamos atribuindo progresso aleatório para fins de demonstração
        const trainingWithProgress = data.map((item: any) => ({
          ...item,
          progress: {
            progress_pct: Math.floor(Math.random() * 100),
            completed_at: Math.random() > 0.7 ? new Date().toISOString() : null,
          }
        }));
        
        setTrainings(trainingWithProgress);
      } catch (error) {
        console.error("Erro ao carregar treinamentos:", error);
      } finally {
        setLoading(false);
      }
    };

    loadTrainings();
  }, [user]);

  // Cálculos e estatísticas
  const totalTrainings = trainings.length;
  const completedTrainings = trainings.filter(t => t.progress?.completed_at).length;
  const inProgressTrainings = trainings.filter(t => !t.progress?.completed_at && t.progress?.progress_pct > 0).length;
  const notStartedTrainings = totalTrainings - completedTrainings - inProgressTrainings;
  
  // Dados para o gráfico de pizza
  const chartData = [
    { name: "Concluídos", value: completedTrainings },
    { name: "Em andamento", value: inProgressTrainings },
    { name: "Não iniciados", value: notStartedTrainings }
  ].filter(item => item.value > 0);

  // Média de progresso geral
  const overallProgress = trainings.length 
    ? Math.floor(trainings.reduce((acc, t) => acc + (t.progress?.progress_pct || 0), 0) / trainings.length) 
    : 0;

  return (
    <Layout>
      <div className="container mx-auto py-6 space-y-8">
        <div>
          <h1 className="text-2xl font-bold">Meu Progresso</h1>
          <p className="text-muted-foreground">Acompanhe seu desenvolvimento nos treinamentos</p>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="details">Detalhes</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Progresso Geral
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{overallProgress}%</div>
                  <Progress value={overallProgress} className="h-2 mt-2" />
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total de Treinamentos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalTrainings}</div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {completedTrainings} concluídos · {inProgressTrainings} em andamento · {notStartedTrainings} não iniciados
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-2">
                  {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={120}>
                      <PieChart>
                        <Pie
                          data={chartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={30}
                          outerRadius={50}
                          paddingAngle={2}
                          dataKey="value"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          labelLine={false}
                        >
                          {chartData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Legend verticalAlign="bottom" height={36} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-center text-muted-foreground">Sem dados disponíveis</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="details">
            <Card>
              <CardHeader>
                <CardTitle>Detalhes de Progresso</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-4">Carregando dados...</div>
                ) : trainings.length > 0 ? (
                  <div className="space-y-6">
                    {trainings.map((training) => (
                      <div key={training.id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium">{training.training.title}</h3>
                          <span className="text-sm">
                            {training.progress?.progress_pct || 0}%
                          </span>
                        </div>
                        <Progress value={training.progress?.progress_pct || 0} className="h-2" />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>
                            {training.progress?.completed_at ? "Concluído" : 
                             training.progress?.progress_pct ? "Em andamento" : "Não iniciado"}
                          </span>
                          <span>{training.training.duration_min} min</span>
                        </div>
                        {training !== trainings[trainings.length-1] && <Separator className="my-4" />}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    Nenhum treinamento disponível para mostrar progresso.
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default ProgressPage;
