
import { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { PlusCircle, Users, Video, UserPlus, Settings, BookOpen, Loader } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

// Interfaces para os dados das estatísticas
interface AdminStats {
  totalTrainings: number;
  totalUsers: number;
  totalGroups: number;
  completedCourses: number;
  recentTrainings: RecentTraining[];
  newTrainingsCount: number;
  newUsersCount: number;
  newGroupsCount: number;
  completionsThisMonth: number;
}

interface RecentTraining {
  id: string;
  title: string;
  created_at: string;
  daysAgo: number;
}

const AdminPanel = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState<AdminStats>({
    totalTrainings: 0,
    totalUsers: 0,
    totalGroups: 0,
    completedCourses: 0,
    recentTrainings: [],
    newTrainingsCount: 0,
    newUsersCount: 0,
    newGroupsCount: 0,
    completionsThisMonth: 0
  });
  const [loading, setLoading] = useState(true);

  // Buscar estatísticas
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        
        // Início do mês atual
        const today = new Date();
        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const firstDayOfMonthISO = firstDayOfMonth.toISOString();
        
        // Total e novos treinamentos
        const { data: trainingsData, error: trainingsError } = await supabase
          .from("trainings")
          .select("id, title, created_at")
          .order("created_at", { ascending: false });
          
        if (trainingsError) throw trainingsError;
        
        // Total e novos usuários
        const { data: usersData, error: usersError } = await supabase
          .from("users")
          .select("id, created_at")
          .order("created_at", { ascending: false });
          
        if (usersError) throw usersError;
        
        // Total e novos grupos
        const { data: groupsData, error: groupsError } = await supabase
          .from("user_groups")
          .select("id, created_at")
          .order("created_at", { ascending: false });
          
        if (groupsError) throw groupsError;
        
        // Total de cursos concluídos
        const { count: completedCount, error: completedError } = await supabase
          .from("training_progress")
          .select("*", { count: "exact", head: true })
          .not("completed_at", "is", null);
          
        if (completedError) throw completedError;
        
        // Cursos concluídos este mês
        const { count: completionsThisMonth, error: monthCompletionsError } = await supabase
          .from("training_progress")
          .select("*", { count: "exact", head: true })
          .not("completed_at", "is", null)
          .gte("completed_at", firstDayOfMonthISO);
          
        if (monthCompletionsError) throw monthCompletionsError;
        
        // Processar treinamentos recentes
        const recentTrainings = trainingsData.slice(0, 3).map(training => {
          const createdAt = new Date(training.created_at);
          const diffTime = Math.abs(today.getTime() - createdAt.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          
          return {
            id: training.id,
            title: training.title,
            created_at: training.created_at,
            daysAgo: diffDays
          };
        });
        
        // Contar novos treinamentos, usuários e grupos deste mês
        const newTrainings = trainingsData.filter(item => 
          new Date(item.created_at) >= firstDayOfMonth
        ).length;
        
        const newUsers = usersData.filter(item => 
          new Date(item.created_at) >= firstDayOfMonth
        ).length;
        
        const newGroups = groupsData.filter(item => 
          new Date(item.created_at) >= firstDayOfMonth
        ).length;
        
        // Atualizar estatísticas
        setStats({
          totalTrainings: trainingsData.length,
          totalUsers: usersData.length,
          totalGroups: groupsData.length,
          completedCourses: completedCount || 0,
          recentTrainings,
          newTrainingsCount: newTrainings,
          newUsersCount: newUsers,
          newGroupsCount: newGroups,
          completionsThisMonth: completionsThisMonth || 0
        });
      } catch (error) {
        console.error("Erro ao buscar estatísticas:", error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar as estatísticas",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
  }, []);

  return (
    <Layout>
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">Painel de Administração</h1>
            <p className="text-muted-foreground">
              Gerencie treinamentos, grupos de usuários e permissões
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button onClick={() => navigate("/admin/trainings/new")}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Novo Treinamento
            </Button>
            <Button variant="outline" onClick={() => navigate("/admin/groups/new")}>
              <UserPlus className="mr-2 h-4 w-4" />
              Novo Grupo
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader className="h-8 w-8 text-primary animate-spin mr-2" />
            <span>Carregando estatísticas...</span>
          </div>
        ) : (
          <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid grid-cols-4 md:w-fit">
              <TabsTrigger value="overview">Resumo</TabsTrigger>
              <TabsTrigger value="trainings">Treinamentos</TabsTrigger>
              <TabsTrigger value="groups">Grupos</TabsTrigger>
              <TabsTrigger value="settings">Configurações</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Treinamentos
                    </CardTitle>
                    <Video className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.totalTrainings}</div>
                    <p className="text-xs text-muted-foreground">
                      {stats.newTrainingsCount} adicionados este mês
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Usuários
                    </CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.totalUsers}</div>
                    <p className="text-xs text-muted-foreground">
                      {stats.newUsersCount} registrados este mês
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Grupos
                    </CardTitle>
                    <UserPlus className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.totalGroups}</div>
                    <p className="text-xs text-muted-foreground">
                      {stats.newGroupsCount} criado este mês
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Cursos Concluídos
                    </CardTitle>
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.completedCourses}</div>
                    <p className="text-xs text-muted-foreground">
                      {stats.completionsThisMonth} este mês
                    </p>
                  </CardContent>
                </Card>
              </div>
              
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Treinamentos Recentes</CardTitle>
                    <CardDescription>
                      Lista dos últimos treinamentos adicionados
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {stats.recentTrainings.length > 0 ? (
                      stats.recentTrainings.map(training => (
                        <div key={training.id} className="border rounded-md p-3 flex justify-between items-center">
                          <div>
                            <h4 className="font-medium">{training.title}</h4>
                            <p className="text-sm text-muted-foreground">
                              {training.daysAgo === 0 
                                ? "Adicionado hoje" 
                                : training.daysAgo === 1 
                                ? "Adicionado ontem" 
                                : `Adicionado há ${training.daysAgo} dias`
                              }
                            </p>
                          </div>
                          <Button variant="outline" size="sm" onClick={() => navigate(`/admin/trainings/edit/${training.id}`)}>
                            Ver
                          </Button>
                        </div>
                      ))
                    ) : (
                      <p className="text-center text-muted-foreground py-4">
                        Nenhum treinamento encontrado
                      </p>
                    )}
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Ações Rápidas</CardTitle>
                    <CardDescription>
                      Acesse rapidamente as principais funcionalidades
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-3">
                    <Button onClick={() => navigate("/admin/trainings/new")}>
                      <Video className="mr-2 h-4 w-4" />
                      Criar Treinamento
                    </Button>
                    <Button variant="outline" onClick={() => navigate("/admin/groups/new")}>
                      <UserPlus className="mr-2 h-4 w-4" />
                      Criar Grupo
                    </Button>
                    <Button variant="outline" onClick={() => navigate("/admin/trainings")}>
                      <Settings className="mr-2 h-4 w-4" />
                      Gerenciar Treinamentos
                    </Button>
                    <Button variant="outline" onClick={() => navigate("/admin/users")}>
                      <Users className="mr-2 h-4 w-4" />
                      Gerenciar Usuários
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="trainings" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Gerenciamento de Treinamentos</CardTitle>
                      <CardDescription>
                        Crie, edite e atribua treinamentos para grupos de usuários
                      </CardDescription>
                    </div>
                    <Button onClick={() => navigate("/admin/trainings/new")}>
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Novo Treinamento
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-center text-muted-foreground py-8">
                    Selecione "Novo Treinamento" para adicionar conteúdo ou acesse o gerenciamento de treinamentos para editar existentes.
                  </p>
                  <div className="flex justify-center">
                    <Button variant="outline" onClick={() => navigate("/admin/trainings")}>
                      Ver Todos os Treinamentos
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="groups" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Gerenciamento de Grupos</CardTitle>
                      <CardDescription>
                        Crie e gerencie grupos para organizar usuários
                      </CardDescription>
                    </div>
                    <Button onClick={() => navigate("/admin/groups/new")}>
                      <UserPlus className="mr-2 h-4 w-4" />
                      Novo Grupo
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-center text-muted-foreground py-8">
                    Crie grupos para organizar usuários e atribuir treinamentos de forma eficiente.
                  </p>
                  <div className="flex justify-center">
                    <Button variant="outline" onClick={() => navigate("/admin/groups")}>
                      Ver Todos os Grupos
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="settings" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Configurações Administrativas</CardTitle>
                  <CardDescription>
                    Gerencie permissões e configurações do sistema
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Esta seção permite configurar aspectos avançados do sistema de treinamentos.
                  </p>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full justify-start" onClick={() => navigate("/admin/users")}>
                      <Users className="mr-2 h-4 w-4" />
                      Gerenciar Permissões de Usuários
                    </Button>
                    <Button variant="outline" className="w-full justify-start" onClick={() => navigate("/admin/settings/system")}>
                      <Settings className="mr-2 h-4 w-4" />
                      Configurações do Sistema
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </Layout>
  );
};

export default AdminPanel;
