
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { UserPlus, Users, Video, Database } from "lucide-react";

const AdminPanel = () => {
  return (
    <Layout>
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold mb-6">Painel Administrativo</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link to="/admin/users">
            <Card className="cursor-pointer hover:bg-gray-50 transition-colors">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Gerenciar Usuários
                </CardTitle>
                <UserPlus className="h-5 w-5 text-blue-600" />
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Adicionar, editar e gerenciar usuários do sistema
                </p>
              </CardContent>
            </Card>
          </Link>
          
          <Link to="/admin/groups">
            <Card className="cursor-pointer hover:bg-gray-50 transition-colors">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Grupos de Usuários
                </CardTitle>
                <Users className="h-5 w-5 text-blue-600" />
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Criar e gerenciar grupos de usuários para acessos a treinamentos
                </p>
              </CardContent>
            </Card>
          </Link>
          
          <Link to="/trainings">
            <Card className="cursor-pointer hover:bg-gray-50 transition-colors">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Treinamentos
                </CardTitle>
                <Video className="h-5 w-5 text-blue-600" />
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Gerenciar e atribuir treinamentos aos usuários e grupos
                </p>
              </CardContent>
            </Card>
          </Link>
          
          <Link to="/admin/database">
            <Card className="cursor-pointer hover:bg-gray-50 transition-colors">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Dados e Relatórios
                </CardTitle>
                <Database className="h-5 w-5 text-blue-600" />
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Visualizar e exportar dados do sistema
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </Layout>
  );
};

export default AdminPanel;
