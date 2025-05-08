
import { useState } from "react";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { PlusCircle, Users, Video, UserPlus, Settings, BookOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";

const AdminPanel = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");

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
                  <div className="text-2xl font-bold">12</div>
                  <p className="text-xs text-muted-foreground">
                    3 adicionados este mês
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
                  <div className="text-2xl font-bold">45</div>
                  <p className="text-xs text-muted-foreground">
                    8 registrados este mês
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
                  <div className="text-2xl font-bold">7</div>
                  <p className="text-xs text-muted-foreground">
                    1 criado este mês
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
                  <div className="text-2xl font-bold">135</div>
                  <p className="text-xs text-muted-foreground">
                    28 este mês
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
                  <div className="border rounded-md p-3 flex justify-between items-center">
                    <div>
                      <h4 className="font-medium">Segurança da Informação</h4>
                      <p className="text-sm text-muted-foreground">Adicionado há 3 dias</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => navigate("/admin/trainings/1")}>
                      Ver
                    </Button>
                  </div>
                  <div className="border rounded-md p-3 flex justify-between items-center">
                    <div>
                      <h4 className="font-medium">Normas da Empresa</h4>
                      <p className="text-sm text-muted-foreground">Adicionado há 5 dias</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => navigate("/admin/trainings/2")}>
                      Ver
                    </Button>
                  </div>
                  <div className="border rounded-md p-3 flex justify-between items-center">
                    <div>
                      <h4 className="font-medium">Atendimento ao Cliente</h4>
                      <p className="text-sm text-muted-foreground">Adicionado há 1 semana</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => navigate("/admin/trainings/3")}>
                      Ver
                    </Button>
                  </div>
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
                  <Button variant="outline" className="w-full justify-start" onClick={() => navigate("/admin/settings/users")}>
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
      </div>
    </Layout>
  );
};

export default AdminPanel;
