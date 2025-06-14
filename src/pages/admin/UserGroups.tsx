
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PlusCircle, Search, Edit, Trash2, Users, Loader } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface UserGroup {
  id: string;
  name: string;
  description: string | null;
  company_id: string;
  created_at: string;
  created_by: string | null;
  members_count?: number;
}

const UserGroups = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [groups, setGroups] = useState<UserGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredGroups, setFilteredGroups] = useState<UserGroup[]>([]);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      
      if (!user) {
        toast({
          title: "Erro de autenticação",
          description: "Você precisa estar logado para acessar esta página",
          variant: "destructive",
        });
        navigate("/login");
        return;
      }
      
      // Now we can use RLS directly since we fixed the policies
      const { data: userGroups, error: groupsError } = await supabase
        .from("user_groups")
        .select("*")
        .order("name");

      if (groupsError) {
        console.error("Erro ao buscar grupos:", groupsError);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os grupos de usuários",
          variant: "destructive",
        });
        setGroups([]);
        setFilteredGroups([]);
        setLoading(false);
        return;
      }

      console.log("Grupos obtidos:", userGroups);

      // Para cada grupo, buscar o número de membros
      const enhancedGroups = await Promise.all(
        userGroups.map(async (group) => {
          try {
            // Usar count para evitar transferência de dados grandes
            const { count, error: countError } = await supabase
              .from("user_group_members")
              .select("*", { count: "exact", head: true })
              .eq("group_id", group.id);

            if (countError) {
              console.error(`Erro ao contar membros para grupo ${group.id}:`, countError);
              return { ...group, members_count: 0 };
            }

            return { ...group, members_count: count || 0 };
          } catch (err) {
            console.error(`Erro ao processar grupo ${group.id}:`, err);
            return { ...group, members_count: 0 };
          }
        })
      );

      setGroups(enhancedGroups);
      setFilteredGroups(enhancedGroups);
    } catch (error) {
      console.error("Erro ao buscar grupos:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os grupos de usuários",
        variant: "destructive",
      });
      setGroups([]);
      setFilteredGroups([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, [user]);

  // Filtrar grupos com base na pesquisa
  useEffect(() => {
    if (!searchQuery) {
      setFilteredGroups(groups);
      return;
    }
    
    const filtered = groups.filter((group) =>
      group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (group.description && group.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    setFilteredGroups(filtered);
  }, [searchQuery, groups]);

  // Formatar data
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  // Deletar grupo
  const handleDeleteGroup = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este grupo? Todos os membros serão removidos.")) {
      return;
    }

    try {
      // Remover membros do grupo
      const { error: membersError } = await supabase
        .from("user_group_members")
        .delete()
        .eq("group_id", id);

      if (membersError) {
        console.error("Erro ao remover membros:", membersError);
        throw membersError;
      }

      // Remover atribuições de treinamentos ao grupo
      const { error: assignmentsError } = await supabase
        .from("training_group_assignments")
        .delete()
        .eq("group_id", id);

      if (assignmentsError && !assignmentsError.message.includes("no rows")) {
        console.error("Erro ao remover atribuições de treinamentos:", assignmentsError);
        throw assignmentsError;
      }

      // Excluir o grupo
      const { error: groupError } = await supabase
        .from("user_groups")
        .delete()
        .eq("id", id);

      if (groupError) {
        console.error("Erro ao excluir grupo:", groupError);
        throw groupError;
      }

      toast({
        title: "Grupo excluído",
        description: "O grupo foi excluído com sucesso",
      });

      // Atualizar a lista de grupos
      fetchGroups();
    } catch (error: any) {
      console.error("Erro ao excluir grupo:", error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível excluir o grupo",
        variant: "destructive",
      });
    }
  };

  return (
    <Layout>
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Grupos de Usuários</h1>
          <Button onClick={() => navigate("/admin/groups/new")}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Novo Grupo
          </Button>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <CardTitle>Gerenciar Grupos</CardTitle>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <Input
                  placeholder="Buscar grupos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-full md:w-64"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader className="h-8 w-8 text-primary animate-spin mr-2" />
                <span>Carregando grupos...</span>
              </div>
            ) : filteredGroups.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Membros</TableHead>
                    <TableHead>Criado em</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredGroups.map((group) => (
                    <TableRow key={group.id}>
                      <TableCell className="font-medium">{group.name}</TableCell>
                      <TableCell>{group.description || "—"}</TableCell>
                      <TableCell>{group.members_count}</TableCell>
                      <TableCell>{formatDate(group.created_at)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => navigate(`/admin/groups/${group.id}/members`)}
                          >
                            <Users size={16} />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => navigate(`/admin/groups/edit/${group.id}`)}
                          >
                            <Edit size={16} />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDeleteGroup(group.id)}
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-6 text-gray-500">
                <p>Nenhum grupo encontrado. Crie seu primeiro grupo de usuários.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default UserGroups;
