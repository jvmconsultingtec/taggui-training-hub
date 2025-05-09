
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Video, Save, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const TrainingForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [videoType, setVideoType] = useState<"YOUTUBE" | "UPLOAD">("YOUTUBE");
  const [durationMin, setDurationMin] = useState<number>(0);
  const [companyId, setCompanyId] = useState<string | null>(null);

  const isEditMode = !!id;
  
  // Buscar dados da empresa e do usuário logado
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.user) {
          navigate("/login");
          return;
        }
        
        // Buscar o perfil do usuário para obter o company_id
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("company_id")
          .eq("id", session.user.id)
          .single();
        
        if (userError) {
          console.error("Erro ao buscar dados do usuário:", userError);
          return;
        }
        
        setCompanyId(userData.company_id);
        
        // Se estamos em modo de edição, carregar os dados do treinamento
        if (isEditMode && id) {
          await fetchTrainingData(id);
        }
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os dados necessários",
          variant: "destructive",
        });
      }
    };
    
    fetchUserData();
  }, [id, isEditMode, navigate]);

  const fetchTrainingData = async (trainingId: string) => {
    try {
      setLoading(true);
      
      const { data: training, error } = await supabase
        .from("trainings")
        .select("*")
        .eq("id", trainingId)
        .single();
      
      if (error) {
        throw error;
      }
      
      setTitle(training.title);
      setDescription(training.description || "");
      setVideoUrl(training.video_url);
      setVideoType(training.video_type);
      setDurationMin(training.duration_min);
    } catch (error) {
      console.error("Erro ao buscar dados do treinamento:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados do treinamento",
        variant: "destructive",
      });
      navigate("/trainings");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !videoUrl || !durationMin) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos obrigatórios",
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
      setLoading(true);
      
      const trainingData = {
        title,
        description: description || null,
        video_url: videoUrl,
        video_type: videoType,
        duration_min: durationMin,
        company_id: companyId,
      };
      
      if (isEditMode && id) {
        // Atualizar treinamento existente
        const { error } = await supabase
          .from("trainings")
          .update(trainingData)
          .eq("id", id);
        
        if (error) throw error;
        
        toast({
          title: "Treinamento atualizado",
          description: "O treinamento foi atualizado com sucesso",
        });
      } else {
        // Criar novo treinamento
        const { data, error } = await supabase
          .from("trainings")
          .insert(trainingData)
          .select();
        
        if (error) throw error;
        
        toast({
          title: "Treinamento criado",
          description: "O treinamento foi criado com sucesso",
        });
        
        // Se for admin, perguntar se deseja atribuir a grupos
        if (data && data[0] && data[0].id) {
          const shouldAssignGroups = window.confirm("Deseja atribuir este treinamento a grupos de usuários?");
          
          if (shouldAssignGroups) {
            navigate(`/admin/trainings/${data[0].id}/groups`);
            return;
          }
        }
      }
      
      // Redirecionar para a lista de treinamentos
      navigate("/trainings");
    } catch (error) {
      console.error("Erro ao salvar treinamento:", error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o treinamento",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto py-6">
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => navigate("/trainings")}
            className="mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
          </Button>
          <h1 className="text-2xl font-bold">
            {isEditMode ? "Editar Treinamento" : "Novo Treinamento"}
          </h1>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Informações do Treinamento</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Digite o título do treinamento"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Digite uma descrição para o treinamento"
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="videoType">Tipo de Vídeo *</Label>
                  <Select 
                    value={videoType} 
                    onValueChange={(value) => setVideoType(value as "YOUTUBE" | "UPLOAD")}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo de vídeo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="YOUTUBE">YouTube</SelectItem>
                      <SelectItem value="UPLOAD">Upload Direto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="duration">Duração (minutos) *</Label>
                  <Input
                    id="duration"
                    type="number"
                    min="1"
                    value={durationMin}
                    onChange={(e) => setDurationMin(parseInt(e.target.value) || 0)}
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="videoUrl">URL do Vídeo *</Label>
                <Input
                  id="videoUrl"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder={
                    videoType === "YOUTUBE" 
                      ? "https://www.youtube.com/watch?v=..." 
                      : "URL do vídeo após upload"
                  }
                  required
                />
              </div>
              
              {isEditMode && (
                <div className="pt-4 border-t border-gray-200">
                  <Button 
                    type="button" 
                    variant="outline"
                    className="flex items-center gap-2"
                    onClick={() => navigate(`/admin/trainings/${id}/groups`)}
                  >
                    <Users size={16} />
                    Gerenciar atribuições a grupos
                  </Button>
                </div>
              )}
              
              <div className="flex justify-end pt-4">
                <Button type="submit" disabled={loading} className="flex items-center gap-2">
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white"></div>
                  ) : (
                    <Save size={16} />
                  )}
                  {isEditMode ? "Atualizar Treinamento" : "Criar Treinamento"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default TrainingForm;
