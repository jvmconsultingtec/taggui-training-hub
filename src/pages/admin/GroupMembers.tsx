
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, Loader, Users, UserPlus, Save, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface Group {
  id: string;
  name: string;
  description: string | null;
}

const GroupMembers = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [group, setGroup] = useState<Group | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [groupMembers, setGroupMembers] = useState<string[]>([]);
  const [loadingGroup, setLoadingGroup] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  // Buscar grupo
  useEffect(() => {
    const fetchGroup = async () => {
      try {
        if (!groupId) return;
        
        const { data, error } = await supabase
          .from("user_groups")
          .select("*")
          .eq("id", groupId)
          .single();
          
        if (error) throw error;
        setGroup(data);
      } catch (error) {
        console.error("Erro ao buscar grupo:", error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os dados do grupo",
          variant: "destructive",
        });
        navigate("/admin/groups");
      } finally {
        setLoadingGroup(false);
      }
    };
    
    fetchGroup();
  }, [groupId, navigate]);

  // Buscar todos usuários da empresa
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoadingUsers(true);
        
        // Busca direta com as novas políticas
        const { data: usersData, error: usersError } = await supabase
          .from("users")
          .select("*");
          
        if (usersError) throw usersError;
        
        setAllUsers(usersData || []);
        setFilteredUsers(usersData || []);
        
        // Buscar membros atuais do grupo
        if (groupId) {
          const { data: membersData, error: membersError } = await supabase
            .from("user_group_members")
            .select("user_id")
            .eq("group_id", groupId);
            
          if (membersError) throw membersError;
          
          const memberIds = membersData.map(member => member.user_id);
          setGroupMembers(memberIds);
          setSelectedUsers(memberIds);
        }
      } catch (error) {
        console.error("Erro ao buscar usuários:", error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os usuários",
          variant: "destructive",
        });
      } finally {
        setLoadingUsers(false);
      }
    };
    
    fetchUsers();
  }, [groupId]);

  // Filtrar usuários com base na pesquisa
  useEffect(() => {
    if (!searchQuery) {
      setFilteredUsers(allUsers);
    } else {
      const filtered = allUsers.filter(
        user =>
          user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  }, [searchQuery, allUsers]);

  // Gerenciar seleção de usuários
  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  // Salvar alterações
  const saveChanges = async () => {
    if (!groupId || !group) return;
    
    try {
      setSaving(true);
      
      // Usuários a serem adicionados (novos)
      const usersToAdd = selectedUsers.filter(id => !groupMembers.includes(id));
      
      // Usuários a serem removidos
      const usersToRemove = groupMembers.filter(id => !selectedUsers.includes(id));
      
      // Adicionar usuários
      if (usersToAdd.length > 0) {
        const newMembers = usersToAdd.map(userId => ({
          group_id: groupId,
          user_id: userId,
          added_by: user?.id
        }));
        
        const { error: addError } = await supabase
          .from("user_group_members")
          .insert(newMembers);
          
        if (addError) throw addError;
      }
      
      // Remover usuários
      if (usersToRemove.length > 0) {
        for (const userId of usersToRemove) {
          const { error: removeError } = await supabase
            .from("user_group_members")
            .delete()
            .eq("group_id", groupId)
            .eq("user_id", userId);
            
          if (removeError) throw removeError;
        }
      }
      
      toast({
        title: "Membros atualizados",
        description: "Os membros do grupo foram atualizados com sucesso",
      });
      
      // Atualizar a lista de membros
      setGroupMembers(selectedUsers);
    } catch (error) {
      console.error("Erro ao atualizar membros:", error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar os membros do grupo",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // Renderizar status do papel do usuário
  const renderRole = (role: string) => {
    switch (role) {
      case "ADMIN":
        return <span className="text-xs px-2 py-1 bg-red-100 text-red-800 rounded-full">Admin</span>;
      case "MANAGER":
        return <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">Gestor</span>;
      default:
        return <span className="text-xs px-2 py-1 bg-gray-100 text-gray-800 rounded-full">Colaborador</span>;
    }
  };

  // Verificar se houve alterações
  const hasChanges = () => {
    if (selectedUsers.length !== groupMembers.length) return true;
    return selectedUsers.some(id => !groupMembers.includes(id));
  };

  return (
    <Layout>
      <div className="container mx-auto py-6">
        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <Button
              variant="outline"
              onClick={() => navigate("/admin/groups")}
              className="mb-2"
            >
              Voltar
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">
              {loadingGroup ? "Carregando..." : `Membros do grupo: ${group?.name}`}
            </h1>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => setSelectedUsers(groupMembers)}
              disabled={saving || !hasChanges()}
            >
              <X className="mr-2 h-4 w-4" />
              Cancelar
            </Button>
            <Button 
              onClick={saveChanges}
              disabled={saving || !hasChanges()}
            >
              {saving ? (
                <Loader className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Salvar alterações
            </Button>
          </div>
        </div>
        
        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <CardTitle>
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  <span>Gerenciar Membros</span>
                </div>
              </CardTitle>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <Input
                  placeholder="Buscar usuários..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-full md:w-64"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loadingUsers ? (
              <div className="flex items-center justify-center py-8">
                <Loader className="h-8 w-8 text-primary animate-spin mr-2" />
                <span>Carregando usuários...</span>
              </div>
            ) : filteredUsers.length > 0 ? (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <UserPlus className="h-5 w-5 text-gray-500" />
                  <span className="text-sm text-gray-500">
                    Selecione os usuários que deseja adicionar ao grupo
                  </span>
                </div>
                
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12"></TableHead>
                      <TableHead>Nome</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Papel</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedUsers.includes(user.id)}
                            onCheckedChange={() => toggleUserSelection(user.id)}
                          />
                        </TableCell>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{renderRole(user.role)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500">
                <p>Nenhum usuário encontrado com esses critérios de busca.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default GroupMembers;
