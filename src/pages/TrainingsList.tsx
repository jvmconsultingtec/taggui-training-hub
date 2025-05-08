
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Filter, Search, MoreVertical, Edit, Trash2, Users, Loader } from "lucide-react";
import Layout from "../components/layout/Layout";
import { fetchTrainings, deleteTraining, fetchCurrentUser, fetchUserTrainingProgress } from "@/services/api";
import { toast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { TrainingStatus } from "@/components/trainings/TrainingCard";

type Training = {
  id: string;
  title: string;
  description: string | null;
  video_type: "YOUTUBE" | "UPLOAD";
  video_url: string;
  duration_min: number;
  created_at: string;
  tags: string[] | null;
  company_id: string;
  author: string | null;
  status?: TrainingStatus;
};

type TrainingProgressMap = {
  [trainingId: string]: {
    progress_pct: number;
    completed_at: string | null;
  };
};

// Dropdown menu component for table actions
const ActionsMenu = ({ id, onDelete }: { id: string, onDelete: () => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  
  const handleDelete = async () => {
    if (confirm("Tem certeza que deseja excluir este treinamento? Esta ação não pode ser desfeita.")) {
      onDelete();
      setIsOpen(false);
    }
  };
  
  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-1.5 rounded-md hover:bg-gray-100"
      >
        <MoreVertical size={16} />
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-100">
          <button 
            onClick={() => {
              navigate(`/trainings/edit/${id}`);
              setIsOpen(false);
            }}
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
          >
            <Edit size={14} />
            <span>Editar</span>
          </button>
          <button 
            onClick={() => {
              navigate(`/trainings/assign/${id}`);
              setIsOpen(false);
            }} 
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
          >
            <Users size={14} />
            <span>Atribuir</span>
          </button>
          <button 
            onClick={handleDelete} 
            className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
          >
            <Trash2 size={14} />
            <span>Excluir</span>
          </button>
        </div>
      )}
    </div>
  );
};

const TrainingsList = () => {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTags, setFilterTags] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<"all" | TrainingStatus>("all");
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [filteredTrainings, setFilteredTrainings] = useState<Training[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [progressMap, setProgressMap] = useState<TrainingProgressMap>({});
  
  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // First, fetch all trainings
      const trainingsData = await fetchTrainings();
      
      if (!user) {
        setTrainings(trainingsData);
        setFilteredTrainings(trainingsData);
        setLoading(false);
        return;
      }
      
      // Then fetch the current user's progress for all trainings
      const progressData = await fetchUserTrainingProgress(user.id);
      
      // Create a map of training_id to progress data
      const newProgressMap: TrainingProgressMap = {};
      progressData.forEach((item: any) => {
        newProgressMap[item.training_id] = {
          progress_pct: item.progress_pct || 0,
          completed_at: item.completed_at
        };
      });
      
      setProgressMap(newProgressMap);
      
      // Add status to each training based on progress data
      const trainingsWithStatus = trainingsData.map((training: Training) => {
        const progress = newProgressMap[training.id];
        let status: TrainingStatus = "not_started";
        
        if (progress) {
          if (progress.completed_at) {
            status = "completed";
          } else if (progress.progress_pct > 0) {
            status = "in_progress";
          }
        }
        
        return {
          ...training,
          status
        };
      });
      
      setTrainings(trainingsWithStatus);
      setFilteredTrainings(trainingsWithStatus);
    } catch (err) {
      console.error("Erro ao carregar treinamentos:", err);
      setError("Não foi possível carregar os treinamentos. Por favor, tente novamente mais tarde.");
      toast({
        title: "Erro",
        description: "Não foi possível carregar os treinamentos",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    loadData();
  }, [user]);
  
  // Get all unique tags from trainings
  const allTags = Array.from(
    new Set(trainings.flatMap(training => training.tags || []).filter(Boolean))
  );
  
  // Filter trainings based on search query, tags, and status
  useEffect(() => {
    const filtered = trainings.filter(training => {
      const matchesSearch = !searchQuery || 
        training.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (training.description && training.description.toLowerCase().includes(searchQuery.toLowerCase()));
        
      const matchesTags = filterTags.length === 0 || 
        (training.tags && filterTags.some(tag => training.tags?.includes(tag)));
      
      // Filter by status if not "all"
      const matchesStatus = statusFilter === "all" || training.status === statusFilter;
        
      return matchesSearch && matchesTags && matchesStatus;
    });
    
    setFilteredTrainings(filtered);
  }, [searchQuery, filterTags, statusFilter, trainings]);
  
  // Toggle tag filter
  const toggleTag = (tag: string) => {
    setFilterTags(prevTags => 
      prevTags.includes(tag) 
        ? prevTags.filter(t => t !== tag) 
        : [...prevTags, tag]
    );
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  const handleDeleteTraining = async (id: string) => {
    try {
      setDeleting(id);
      const success = await deleteTraining(id);
      
      if (success) {
        // Remove the training from the state
        setTrainings(prev => prev.filter(t => t.id !== id));
        toast({
          title: "Treinamento excluído",
          description: "O treinamento foi excluído com sucesso"
        });
      }
    } catch (err) {
      console.error("Erro ao excluir treinamento:", err);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o treinamento",
        variant: "destructive"
      });
    } finally {
      setDeleting(null);
    }
  };
  
  // Status filter options with their labels
  const statusOptions = [
    { value: "all", label: "Todos os status" },
    { value: "not_started", label: "Não iniciados" },
    { value: "in_progress", label: "Em andamento" },
    { value: "completed", label: "Concluídos" }
  ];

  // Get status label function
  const getStatusLabel = (status: TrainingStatus) => {
    switch (status) {
      case "completed": return "Concluído";
      case "in_progress": return "Em andamento";
      case "not_started": return "Não iniciado";
      default: return "Desconhecido";
    }
  };

  // Get status color function
  const getStatusColor = (status: TrainingStatus) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-800";
      case "in_progress": return "bg-blue-100 text-blue-800";
      case "not_started": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Layout>
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Treinamentos</h1>
          
          {/* Mostrar botão apenas para administradores */}
          {isAdmin && (
            <Link to="/admin/trainings/new" className="taggui-btn-primary flex items-center gap-2">
              <PlusCircle size={18} />
              <span>Novo Treinamento</span>
            </Link>
          )}
        </div>
        
        {error && (
          <Alert variant="destructive">
            <AlertTitle>Erro</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {/* Filters and search */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text"
              placeholder="Buscar treinamentos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-taggui-primary focus:border-transparent"
            />
          </div>
          
          {/* Status Filter */}
          <div className="w-40">
            <Select 
              value={statusFilter} 
              onValueChange={(value) => setStatusFilter(value as "all" | TrainingStatus)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {allTags.length > 0 && (
            <div className="flex items-center gap-2">
              <Filter size={18} className="text-gray-500" />
              <div className="flex flex-wrap gap-2">
                {allTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      filterTags.includes(tag)
                        ? "bg-taggui-primary text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Trainings table */}
        <div className="taggui-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Título</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Criado</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Duração</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Autor</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Tags</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <div className="flex items-center justify-center">
                        <Loader className="h-6 w-6 text-gray-400 animate-spin mr-2" />
                        <span>Carregando treinamentos...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredTrainings.length > 0 ? (
                  filteredTrainings.map((training) => {
                    // Get the status from the training object
                    const status = training.status || "not_started";
                    
                    return (
                      <tr key={training.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Link 
                            to={`/trainings/${training.id}`} 
                            className="font-medium text-gray-900 hover:text-taggui-primary"
                          >
                            {training.title}
                          </Link>
                          <p className="text-xs text-gray-500 mt-1 line-clamp-1">{training.description}</p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {formatDate(training.created_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {training.duration_min} min
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {training.author || "Geral"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                            {getStatusLabel(status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-wrap gap-1">
                            {training.tags && training.tags.map((tag, index) => (
                              <span 
                                key={index}
                                className="bg-gray-100 px-2 py-1 rounded-full text-xs text-gray-600"
                              >
                                {tag}
                              </span>
                            ))}
                            {(!training.tags || training.tags.length === 0) && (
                              <span className="text-xs text-gray-400">Sem tags</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          {deleting === training.id ? (
                            <span className="text-sm text-gray-500 italic">Excluindo...</span>
                          ) : (
                            <ActionsMenu 
                              id={training.id} 
                              onDelete={() => handleDeleteTraining(training.id)}
                            />
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <p className="text-gray-500">Nenhum treinamento encontrado.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination would go here in a real app */}
          {!loading && filteredTrainings.length > 0 && (
            <div className="py-3 px-6 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Mostrando <span className="font-medium">{filteredTrainings.length}</span> de <span className="font-medium">{trainings.length}</span> treinamentos
              </div>
              
              {/* Simple pagination - would be more robust in a real app */}
              <div className="flex gap-2">
                <button className="px-3 py-1 rounded border border-gray-200 text-sm disabled:opacity-50">
                  Anterior
                </button>
                <button className="px-3 py-1 rounded border border-gray-200 text-sm bg-gray-50">
                  1
                </button>
                <button className="px-3 py-1 rounded border border-gray-200 text-sm disabled:opacity-50">
                  Próximo
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default TrainingsList;
