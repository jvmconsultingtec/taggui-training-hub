
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

const UserGroupForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [companyId, setCompanyId] = useState<string | null>(null);
  
  const isEditMode = !!id;
  
  useEffect(() => {
    // Obter o ID da empresa do usuário 
    const fetchUserCompanyId = async () => {
      try {
        setLoading(true);
        console.log("Buscando ID da empresa");
        
        // Usar diretamente a função RPC para evitar recursão
        const { data: companyData, error: companyError } = await supabase.rpc(
          'get_auth_user_company_id'
        );
        
        if (companyError) {
          console.error("Erro ao buscar ID da empresa:", companyError);
          throw companyError;
        }
        
        console.log("ID da empresa obtido:", companyData);
        if (companyData) {
          setCompanyId(companyData);
          
          // Se estamos em modo de edição, carregar também os dados do grupo
          if (isEditMode) {
            await loadGroupData();
          }
        } else {
          throw new Error("ID da empresa não encontrado");
        }
      } catch (error) {
        console.error("Erro ao buscar ID da empresa:", error);
        toast({
          title: "Erro",
          description: "Não foi possível obter informações da empresa",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserCompanyId();
  }, [id, isEditMode]);

  const loadGroupData = async () => {
    try {
      console.log("Carregando dados do grupo para ID:", id);
      
      // Consulta direta à tabela de grupos
      const { data, error } = await supabase
        .from("user_groups")
        .select("*")
        .eq("id", id)
        .single();
        
      if (error) {
        console.error("Erro ao carregar dados do grupo:", error);
        throw error;
      }
      
      console.log("Dados do grupo carregados:", data);
      setName(data.name);
      setDescription(data.description || "");
    } catch (error) {
      console.error("Erro ao carregar dados do grupo:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados do grupo",
        variant: "destructive",
      });
      navigate("/admin/groups");
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast({
        title: "Erro",
        description: "O nome do grupo é obrigatório",
        variant: "destructive",
      });
      return;
    }
    
    if (!companyId) {
      toast({
        title: "Erro",
        description: "Informações da empresa não disponíveis",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setSaving(true);
      console.log("Salvando grupo com company ID:", companyId);
      
      if (isEditMode) {
        // Atualizar grupo existente
        const { error } = await supabase
          .from("user_groups")
          .update({
            name,
            description: description.trim() || null
          })
          .eq("id", id);
          
        if (error) {
          console.error("Erro ao atualizar grupo:", error);
          throw error;
        }
        
        toast({
          title: "Grupo atualizado",
          description: "O grupo foi atualizado com sucesso",
        });
      } else {
        // Criar novo grupo com o company_id explícito
        const { data, error } = await supabase
          .from("user_groups")
          .insert({
            name,
            description: description.trim() || null,
            created_by: user?.id,
            company_id: companyId
          })
          .select();
          
        if (error) {
          console.error("Erro ao criar grupo:", error);
          throw error;
        }
        
        console.log("Grupo criado com sucesso:", data);
        
        toast({
          title: "Grupo criado",
          description: "O grupo foi criado com sucesso",
        });
      }
      
      // Redirecionar para a lista de grupos
      navigate("/admin/groups");
    } catch (error: any) {
      console.error("Erro ao salvar grupo:", error);
      toast({
        title: "Erro",
        description: error.message || (isEditMode ? "Não foi possível atualizar o grupo" : "Não foi possível criar o grupo"),
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto py-6">
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => navigate("/admin/groups")}
            className="mb-6"
          >
            Voltar
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditMode ? "Editar Grupo" : "Novo Grupo"}
          </h1>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>{isEditMode ? "Atualizar grupo de usuários" : "Criar novo grupo de usuários"}</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader className="h-8 w-8 text-primary animate-spin mr-2" />
                <span>Carregando...</span>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome do Grupo</Label>
                  <Input
                    id="name"
                    placeholder="Digite o nome do grupo"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    placeholder="Digite uma descrição para o grupo (opcional)"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                  />
                </div>
                <div className="flex gap-4 justify-end">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => navigate("/admin/groups")}
                    disabled={saving}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={saving}
                  >
                    {saving && <Loader size={16} className="mr-2 animate-spin" />}
                    {isEditMode ? "Atualizar Grupo" : "Criar Grupo"}
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default UserGroupForm;
