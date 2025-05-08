
import { useEffect, useState } from "react";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { supabase } from "@/integrations/supabase/client";
import { Loader } from "lucide-react";
import { toast } from "@/hooks/use-toast";

type TrainingCompletionData = {
  name: string;
  taxa: number;
};

type MonthlyProgressData = {
  name: string;
  concluidos: number;
  iniciados: number;
};

type EngagementMetric = {
  averageCompletionTime: number; // in days
  completionRate: number; // percentage
  activeUsers: number;
  previousTimeComparison: number; // percentage
  previousRateComparison: number; // percentage
  newUsers: number;
};

const Reports = () => {
  const [completionData, setCompletionData] = useState<TrainingCompletionData[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlyProgressData[]>([]);
  const [engagementData, setEngagementData] = useState<EngagementMetric | null>(null);
  const [loading, setLoading] = useState({
    completion: true,
    monthly: true,
    engagement: true
  });

  useEffect(() => {
    const fetchTrainingCompletion = async () => {
      try {
        setLoading(prev => ({ ...prev, completion: true }));
        
        // Fetch all trainings
        const { data: trainings, error: trainingError } = await supabase
          .from("trainings")
          .select("id, title");
          
        if (trainingError) throw trainingError;
        
        if (!trainings || trainings.length === 0) {
          setCompletionData([]);
          return;
        }
        
        // For each training, get completion stats
        const completionStats = await Promise.all(trainings.map(async (training) => {
          // Get total users
          const { count: totalUsers } = await supabase
            .from("users")
            .select("*", { count: 'exact', head: true });
            
          if (totalUsers === null) return null;
          
          // Get completed users for this training
          const { count: completedUsers } = await supabase
            .from("training_progress")
            .select("*", { count: 'exact', head: true })
            .eq("training_id", training.id)
            .not("completed_at", "is", null);
            
          if (completedUsers === null) return null;
          
          // Calculate completion rate
          const completionRate = totalUsers > 0 
            ? Math.round((completedUsers / totalUsers) * 100) 
            : 0;
            
          return {
            name: training.title,
            taxa: completionRate
          };
        }));
        
        // Filter out null values and sort by completion rate
        const validStats = completionStats.filter(Boolean) as TrainingCompletionData[];
        validStats.sort((a, b) => b.taxa - a.taxa);
        
        setCompletionData(validStats);
      } catch (error) {
        console.error("Error fetching training completion data:", error);
        toast({
          title: "Erro ao carregar dados",
          description: "Não foi possível carregar as taxas de conclusão",
          variant: "destructive"
        });
      } finally {
        setLoading(prev => ({ ...prev, completion: false }));
      }
    };

    const fetchMonthlyProgress = async () => {
      try {
        setLoading(prev => ({ ...prev, monthly: true }));
        
        // Get the last 6 months
        const months = [];
        const currentDate = new Date();
        for (let i = 5; i >= 0; i--) {
          const monthDate = new Date(currentDate);
          monthDate.setMonth(currentDate.getMonth() - i);
          
          const monthName = monthDate.toLocaleString('pt-BR', { month: 'short' });
          const monthStartDate = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
          const monthEndDate = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);
          
          months.push({
            name: monthName.charAt(0).toUpperCase() + monthName.slice(1),
            startDate: monthStartDate,
            endDate: monthEndDate
          });
        }
        
        // For each month, get started and completed trainings
        const monthlyStats = await Promise.all(months.map(async (month) => {
          // Get completed trainings for this month
          const { count: completed } = await supabase
            .from("training_progress")
            .select("*", { count: 'exact', head: true })
            .gte("completed_at", month.startDate.toISOString())
            .lte("completed_at", month.endDate.toISOString());
            
          // Get started trainings for this month
          const { count: started } = await supabase
            .from("training_progress")
            .select("*", { count: 'exact', head: true })
            .gte("created_at", month.startDate.toISOString())
            .lte("created_at", month.endDate.toISOString());
            
          return {
            name: month.name,
            concluidos: completed || 0,
            iniciados: started || 0
          };
        }));
        
        setMonthlyData(monthlyStats);
      } catch (error) {
        console.error("Error fetching monthly progress data:", error);
        toast({
          title: "Erro ao carregar dados",
          description: "Não foi possível carregar o progresso mensal",
          variant: "destructive"
        });
      } finally {
        setLoading(prev => ({ ...prev, monthly: false }));
      }
    };

    const fetchEngagementMetrics = async () => {
      try {
        setLoading(prev => ({ ...prev, engagement: true }));
        
        // Get active users (users with any progress in the last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const { count: activeUsers } = await supabase
          .from("training_progress")
          .select("user_id", { count: 'exact', head: true })
          .gte("last_viewed_at", thirtyDaysAgo.toISOString())
          .distinct();
          
        // Get new users in the last 30 days
        const { count: newUsers } = await supabase
          .from("users")
          .select("*", { count: 'exact', head: true })
          .gte("created_at", thirtyDaysAgo.toISOString());
          
        // Get completion rate (completed trainings / total assigned trainings)
        const { count: totalAssignments } = await supabase
          .from("training_assignments")
          .select("*", { count: 'exact', head: true });
          
        const { count: completedTrainings } = await supabase
          .from("training_progress")
          .select("*", { count: 'exact', head: true })
          .not("completed_at", "is", null);
          
        const completionRate = totalAssignments > 0 
          ? Math.round((completedTrainings / totalAssignments) * 100) 
          : 0;
          
        // Get average completion time (average days between assignment and completion)
        const { data: completions } = await supabase
          .from("training_progress")
          .select("created_at, completed_at")
          .not("completed_at", "is", null)
          .limit(100); // Limit to recent 100 completions for performance
          
        let totalDays = 0;
        let completionCount = 0;
        
        if (completions && completions.length > 0) {
          completions.forEach(completion => {
            if (completion.created_at && completion.completed_at) {
              const startDate = new Date(completion.created_at);
              const endDate = new Date(completion.completed_at);
              const diffDays = (endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24);
              
              if (diffDays >= 0) {
                totalDays += diffDays;
                completionCount++;
              }
            }
          });
        }
        
        const averageCompletionTime = completionCount > 0 
          ? parseFloat((totalDays / completionCount).toFixed(1))
          : 0;
          
        // Get previous period comparisons (mock data for now, would need more complex queries)
        const previousTimeComparison = 5; // 5% faster than previous period
        const previousRateComparison = 2; // 2% higher than previous period
        
        setEngagementData({
          averageCompletionTime,
          completionRate,
          activeUsers: activeUsers || 0,
          previousTimeComparison,
          previousRateComparison,
          newUsers: newUsers || 0
        });
      } catch (error) {
        console.error("Error fetching engagement metrics:", error);
        toast({
          title: "Erro ao carregar dados",
          description: "Não foi possível carregar as métricas de engajamento",
          variant: "destructive"
        });
      } finally {
        setLoading(prev => ({ ...prev, engagement: false }));
      }
    };

    fetchTrainingCompletion();
    fetchMonthlyProgress();
    fetchEngagementMetrics();
  }, []);

  return (
    <Layout>
      <div className="container mx-auto py-6 space-y-8">
        <div>
          <h1 className="text-2xl font-bold">Relatórios</h1>
          <p className="text-muted-foreground">Visualize estatísticas e relatórios dos treinamentos</p>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="completion">Taxa de Conclusão</TabsTrigger>
            <TabsTrigger value="engagement">Engajamento</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview">
            <Card>
              <CardHeader>
                <CardTitle>Progresso Mensal</CardTitle>
                <CardDescription>Treinamentos concluídos e iniciados por mês</CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="h-[400px]">
                  {loading.monthly ? (
                    <div className="h-full flex items-center justify-center">
                      <Loader className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                  ) : monthlyData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={monthlyData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="concluidos" name="Treinamentos Concluídos" fill="#0088FE" />
                        <Bar dataKey="iniciados" name="Treinamentos Iniciados" fill="#00C49F" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-muted-foreground">
                      Nenhum dado disponível para exibição.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="completion">
            <Card>
              <CardHeader>
                <CardTitle>Taxa de Conclusão por Treinamento</CardTitle>
                <CardDescription>Porcentagem de colaboradores que concluíram cada treinamento</CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="h-[400px]">
                  {loading.completion ? (
                    <div className="h-full flex items-center justify-center">
                      <Loader className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                  ) : completionData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        layout="vertical"
                        data={completionData}
                        margin={{ top: 20, right: 30, left: 60, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" domain={[0, 100]} />
                        <YAxis dataKey="name" type="category" />
                        <Tooltip formatter={(value) => [`${value}%`, 'Taxa de Conclusão']} />
                        <Legend />
                        <Bar dataKey="taxa" name="Taxa de Conclusão (%)" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-muted-foreground">
                      Nenhum dado disponível para exibição.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="engagement">
            <Card>
              <CardHeader>
                <CardTitle>Engajamento</CardTitle>
                <CardDescription>Métricas de engajamento dos colaboradores</CardDescription>
              </CardHeader>
              <CardContent>
                {loading.engagement ? (
                  <div className="h-40 flex items-center justify-center">
                    <Loader className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : engagementData ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">
                          Tempo Médio de Conclusão
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{engagementData.averageCompletionTime.toFixed(1)} dias</div>
                        <p className="text-xs text-muted-foreground mt-2">
                          {engagementData.previousTimeComparison}% mais rápido que o mês anterior
                        </p>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">
                          Taxa de Conclusão
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{engagementData.completionRate}%</div>
                        <p className="text-xs text-muted-foreground mt-2">
                          {engagementData.previousRateComparison}% maior que o mês anterior
                        </p>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">
                          Colaboradores Ativos
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{engagementData.activeUsers}</div>
                        <p className="text-xs text-muted-foreground mt-2">
                          {engagementData.newUsers} novos colaboradores este mês
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  <div className="h-40 flex items-center justify-center text-muted-foreground">
                    Nenhum dado disponível para exibição.
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

export default Reports;
