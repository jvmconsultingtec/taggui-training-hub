
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PlusCircle, Search, Video, Users, Clock, Play, Check } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

interface Training {
  id: string;
  title: string;
  description: string | null;
  video_url: string;
  video_type: 'YOUTUBE' | 'UPLOAD';
  duration_min: number;
  company_id: string;
  created_at: string;
  status?: string;
}

const statusIcons = {
  not_started: <Clock className="h-4 w-4 mr-1" />,
  in_progress: <Play className="h-4 w-4 mr-1" />,
  completed: <Check className="h-4 w-4 mr-1" />
};

const statusLabels = {
  not_started: "Não iniciado",
  in_progress: "Em andamento",
  completed: "Concluído"
};

const statusColors = {
  not_started: "bg-gray-200 text-gray-800",
  in_progress: "bg-blue-500 text-white",
  completed: "bg-green-500 text-white"
};

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

  const getStatusBadge = (training: Training) => {
    const status = training.status || "not_started";
    
    return (
      <Badge 
        className={`flex items-center ${
          status === "completed" ? "bg-green-500 text-white" : 
          status === "in_progress" ? "bg-blue-500 text-white" : 
          "bg-gray-200 text-gray-800"
        }`}
      >
        {statusIcons[status as keyof typeof statusIcons] || statusIcons.not_started}
        <span>
          {statusLabels[status as keyof typeof statusLabels] || statusLabels.not_started}
        </span>
      </Badge>
    );
  };

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
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-1/3">Treinamento</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Duração</TableHead>
                    <TableHead>Status</TableHead>
                    {isAdmin && <TableHead className="text-right">Ações</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTrainings.map((training) => (
                    <TableRow 
                      key={training.id} 
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => navigate(`/trainings/${training.id}`)}
                    >
                      <TableCell className="font-medium">{training.title}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {training.description?.substring(0, 100) || "Sem descrição"}
                        {training.description && training.description.length > 100 ? "..." : ""}
                      </TableCell>
                      <TableCell>{training.duration_min} min</TableCell>
                      <TableCell>{getStatusBadge(training)}</TableCell>
                      {isAdmin && (
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="outline" 
                              size="icon" 
                              className="h-8 w-8"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/admin/trainings/${training.id}/groups`);
                              }}
                              title="Atribuir a grupos"
                            >
                              <Users size={16} />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="icon" 
                              className="h-8 w-8"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/trainings/edit/${training.id}`);
                              }}
                              title="Editar treinamento"
                            >
                              <Video size={16} />
                            </Button>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
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
