
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader, Save, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface Group {
  id: string;
  name: string;
  description: string | null;
  members_count?: number;
}

interface Training {
  id: string;
  title: string;
  description: string | null;
  duration_min: number;
}

const TrainingGroupAssignment = () => {
  const { trainingId } = useParams<{ trainingId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [training, setTraining] = useState<Training | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loadingTraining, setLoadingTraining] = useState(true);
  const [loadingGroups, setLoadingGroups] = useState(true);
  const [assignedGroups, setAssignedGroups] = useState<string[]>([]);
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  // Buscar treinamento
  useEffect(() => {
    const fetchTraining = async () => {
      try {
        if (!trainingId) return;
        
        const { data, error } = await supabase
          .from("trainings")
          .select("*")
          .eq("id", trainingId)
          .single();
          
        if (error) throw error;
        setTraining(data);
      } catch (error) {
        console.error("Erro ao buscar treinamento:", error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os dados do treinamento",
          variant: "destructive",
        });
        navigate("/admin/trainings");
      } finally {
        setLoadingTraining(false);
      }
    };
    
    fetchTraining();
  }, [trainingId]);

  // Buscar grupos e atribuições
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        setLoadingGroups(true);
        
        // Buscar todos os grupos da empresa
        const { data: groupsData, error: groupsError } = await supabase
          .from("user_groups")
          .select("*")
          .order("name");
          
        if (groupsError) throw groupsError;
        
        // Para cada grupo, buscar o número de membros
        const groupsWithMembersCount = await Promise.all(
          groupsData.map(async (group) => {
            const { count, error: countError } = await supabase
              .from("user_group_members")
              .select("*", { count: "exact", head: true })
              .eq("group_id", group.id);

            if (countError) {
              console.error("Erro ao buscar membros:", countError);
              return { ...group, members_count: 0 };
            }

            return { ...group, members_count: count || 0 };
          })
        );
        
        setGroups(groupsWithMembersCount);
        
        // Buscar grupos já atribuídos ao treinamento
        if (trainingId) {
          const { data: assignmentsData, error: assignmentsError } = await supabase
            .from("training_group_assignments")
            .select("group_id")
            .eq("training_id", trainingId);
            
          if (assignmentsError) throw assignmentsError;
          
          const groupIds = assignmentsData.map(assignment => assignment.group_id);
          setAssignedGroups(groupIds);
          setSelectedGroups(groupIds);
        }
      } catch (error) {
        console.error("Erro ao buscar grupos:", error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os grupos",
          variant: "destructive",
        });
      } finally {
        setLoadingGroups(false);
      }
    };
    
    fetchGroups();
  }, [trainingId]);

  // Gerenciar seleção de grupos
  const toggleGroupSelection = (groupId: string) => {
    setSelectedGroups(prev =>
      prev.includes(groupId)
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    );
  };

  // Salvar alterações
  const saveChanges = async () => {
    if (!trainingId || !training) return;
    
    try {
      setSaving(true);
      
      // Grupos a serem adicionados (novos)
      const groupsToAdd = selectedGroups.filter(id => !assignedGroups.includes(id));
      
      // Grupos a serem removidos
      const groupsToRemove = assignedGroups.filter(id => !selectedGroups.includes(id));
      
      // Adicionar grupos
      if (groupsToAdd.length > 0) {
        const newAssignments = groupsToAdd.map(groupId => ({
          training_id: trainingId,
          group_id: groupId,
          assigned_by: user?.id
        }));
        
        const { error: addError } = await supabase
          .from("training_group_assignments")
          .insert(newAssignments);
          
        if (addError) throw addError;
        
        // Para cada grupo adicionado, atribuir o treinamento a todos os usuários do grupo
        for (const groupId of groupsToAdd) {
          // Buscar todos os membros do grupo
          const { data: membersData, error: membersError } = await supabase
            .from("user_group_members")
            .select("user_id")
            .eq("group_id", groupId);
            
          if (membersError) throw membersError;
          
          if (membersData.length > 0) {
            // Criar atribuições de treinamento para cada usuário
            const userAssignments = membersData.map(member => ({
              training_id: trainingId,
              user_id: member.user_id
            }));
            
            const { error: assignError } = await supabase
              .from("training_assignments")
              .insert(userAssignments)
              .onConflict(['training_id', 'user_id'])
              .ignore();
              
            if (assignError) throw assignError;
          }
        }
      }
      
      // Remover grupos
      if (groupsToRemove.length > 0) {
        for (const groupId of groupsToRemove) {
          const { error: removeError } = await supabase
            .from("training_group_assignments")
            .delete()
            .eq("training_id", trainingId)
            .eq("group_id", groupId);
            
          if (removeError) throw removeError;
          
          // Nota: não removemos as atribuições de usuários individuais
          // para preservar o histórico de treinamento
        }
      }
      
      toast({
        title: "Grupos atualizados",
        description: "Os grupos atribuídos ao treinamento foram atualizados com sucesso",
      });
      
      // Atualizar a lista de grupos atribuídos
      setAssignedGroups(selectedGroups);
    } catch (error) {
      console.error("Erro ao atualizar grupos:", error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar os grupos atribuídos ao treinamento",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // Verificar se houve alterações
  const hasChanges = () => {
    if (selectedGroups.length !== assignedGroups.length) return true;
    return selectedGroups.some(id => !assignedGroups.includes(id));
  };

  return (
    <Layout>
      <div className="container mx-auto py-6">
        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <Button
              variant="outline"
              onClick={() => navigate("/admin/trainings")}
              className="mb-2"
            >
              Voltar
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">
              {loadingTraining ? "Carregando..." : `Atribuir "${training?.title}" a grupos`}
            </h1>
            {training?.description && (
              <p className="text-gray-600 mt-1">{training.description}</p>
            )}
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => setSelectedGroups(assignedGroups)}
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
          <CardHeader>
            <CardTitle>Grupos disponíveis</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingGroups ? (
              <div className="flex items-center justify-center py-8">
                <Loader className="h-8 w-8 text-primary animate-spin mr-2" />
                <span>Carregando grupos...</span>
              </div>
            ) : groups.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12"></TableHead>
                    <TableHead>Nome do Grupo</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Membros</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {groups.map((group) => (
                    <TableRow key={group.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedGroups.includes(group.id)}
                          onCheckedChange={() => toggleGroupSelection(group.id)}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{group.name}</TableCell>
                      <TableCell>{group.description || "—"}</TableCell>
                      <TableCell>{group.members_count}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-6 text-gray-500">
                <p>Nenhum grupo disponível. Crie grupos de usuários primeiro.</p>
                <Button className="mt-4" onClick={() => navigate("/admin/groups/new")}>
                  Criar Grupo
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default TrainingGroupAssignment;
