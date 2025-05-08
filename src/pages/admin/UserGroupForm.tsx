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

interface UserWithCompany {
  id: string;
  company_id?: string;
}

const UserGroupForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [companyId, setCompanyId] = useState<string | undefined>(undefined);
  
  const isEditMode = !!id;
  
  useEffect(() => {
    // Get the company ID for the current user
    const fetchUserCompany = async () => {
      if (user?.id) {
        try {
          const { data, error } = await supabase
            .from("users")
            .select("company_id")
            .eq("id", user.id)
            .single();
            
          if (error) throw error;
          
          setCompanyId(data.company_id);
        } catch (error) {
          console.error("Error fetching company ID:", error);
        }
      }
    };
    
    fetchUserCompany();
    
    if (isEditMode) {
      loadGroupData();
    }
  }, [id, user?.id]);

  const loadGroupData = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from("user_groups")
        .select("*")
        .eq("id", id)
        .single();
        
      if (error) throw error;
      
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
    } finally {
      setLoading(false);
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
      
      if (isEditMode) {
        // Atualizar grupo existente
        const { error } = await supabase
          .from("user_groups")
          .update({
            name,
            description: description.trim() || null
          })
          .eq("id", id);
          
        if (error) throw error;
        
        toast({
          title: "Grupo atualizado",
          description: "O grupo foi atualizado com sucesso",
        });
      } else {
        // Criar novo grupo
        const { error } = await supabase
          .from("user_groups")
          .insert({
            name,
            description: description.trim() || null,
            created_by: user?.id,
            company_id: companyId
          });
          
        if (error) throw error;
        
        toast({
          title: "Grupo criado",
          description: "O grupo foi criado com sucesso",
        });
      }
      
      // Redirecionar para a lista de grupos
      navigate("/admin/groups");
    } catch (error) {
      console.error("Erro ao salvar grupo:", error);
      toast({
        title: "Erro",
        description: isEditMode ? "Não foi possível atualizar o grupo" : "Não foi possível criar o grupo",
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
