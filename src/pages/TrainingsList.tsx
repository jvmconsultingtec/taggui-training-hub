
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PlusCircle, Search, Video, Users } from "lucide-react";
import TrainingCard from "@/components/trainings/TrainingCard";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

interface Training {
  id: string;
  title: string;
  description: string | null;
  video_url: string;
  video_type: 'YOUTUBE' | 'UPLOADED';
  duration_min: number;
  company_id: string;
  created_at: string;
}

const TrainingsList = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredTrainings, setFilteredTrainings] = useState<Training[]>([]);

  // Buscar todos os treinamentos da empresa
  useEffect(() => {
    fetchTrainings();
  }, []);

  const fetchTrainings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("trainings")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      setTrainings(data || []);
      setFilteredTrainings(data || []);
    } catch (error) {
      console.error("Erro ao buscar treinamentos:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar a lista de treinamentos",
        variant: "destructive",
      });
      setTrainings([]);
      setFilteredTrainings([]);
    } finally {
      setLoading(false);
    }
  };

  // Filtrar treinamentos quando a pesquisa mudar
  useEffect(() => {
    if (!searchQuery) {
      setFilteredTrainings(trainings);
      return;
    }

    const filtered = trainings.filter(
      (training) =>
        training.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (training.description &&
          training.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    setFilteredTrainings(filtered);
  }, [searchQuery, trainings]);

  return (
    <Layout>
      <div className="container mx-auto py-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold">Treinamentos</h1>
            <p className="text-gray-600">
              Veja todos os treinamentos disponíveis para você
            </p>
          </div>
          
          {isAdmin && (
            <div className="flex gap-2">
              <Button onClick={() => navigate("/trainings/new")} className="flex items-center">
                <PlusCircle className="mr-2 h-4 w-4" />
                Novo Treinamento
              </Button>
            </div>
          )}
        </div>

        {/* Filtro de pesquisa */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <Input
                placeholder="Buscar treinamentos..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Lista de treinamentos */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : filteredTrainings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTrainings.map((training) => (
              <div key={training.id} className="relative">
                <TrainingCard
                  id={training.id}
                  title={training.title}
                  description={training.description}
                  videoUrl={training.video_url}
                  duration={training.duration_min}
                  videoType={training.video_type}
                />
                
                {isAdmin && (
                  <div className="absolute top-2 right-2 flex gap-1">
                    <Button 
                      variant="secondary" 
                      size="icon" 
                      className="h-8 w-8 bg-white/90 hover:bg-white"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        navigate(`/admin/trainings/${training.id}/groups`);
                      }}
                      title="Atribuir a grupos"
                    >
                      <Users size={16} />
                    </Button>
                    <Button 
                      variant="secondary" 
                      size="icon" 
                      className="h-8 w-8 bg-white/90 hover:bg-white"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        navigate(`/trainings/edit/${training.id}`);
                      }}
                      title="Editar treinamento"
                    >
                      <Video size={16} />
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="text-center">Nenhum treinamento encontrado</CardTitle>
            </CardHeader>
            <CardContent className="text-center text-gray-500">
              {searchQuery ? (
                <p>Não encontramos treinamentos correspondentes à sua pesquisa.</p>
              ) : isAdmin ? (
                <div className="space-y-4">
                  <p>Você ainda não tem nenhum treinamento cadastrado.</p>
                  <Button onClick={() => navigate("/trainings/new")}>
                    Criar primeiro treinamento
                  </Button>
                </div>
              ) : (
                <p>Não há treinamentos disponíveis para você no momento.</p>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default TrainingsList;
