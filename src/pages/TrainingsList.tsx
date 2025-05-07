
import { useState } from "react";
import { Link } from "react-router-dom";
import { PlusCircle, Filter, Search, MoreVertical, Edit, Trash2, Users } from "lucide-react";
import Layout from "../components/layout/Layout";

// Mock data for trainings
const mockTrainings = [
  {
    id: "1",
    title: "Onboarding: Conheça a Empresa",
    description: "Um treinamento completo sobre nossa história, valores e cultura.",
    videoType: "YOUTUBE",
    createdAt: "2025-04-01T10:30:00Z",
    durationMin: 15,
    author: "RH",
    assigned: 38,
    completed: 22,
    completionRate: 58,
    tags: ["Onboarding", "Obrigatório"]
  },
  {
    id: "2",
    title: "Segurança da Informação",
    description: "Aprenda as melhores práticas para proteger dados sensíveis.",
    videoType: "UPLOAD",
    createdAt: "2025-04-05T14:20:00Z",
    durationMin: 25,
    author: "TI",
    assigned: 156,
    completed: 130,
    completionRate: 83,
    tags: ["Segurança", "TI", "Obrigatório"]
  },
  {
    id: "3",
    title: "Treinamento em Diversidade e Inclusão",
    description: "Como criar um ambiente de trabalho inclusivo e respeitoso.",
    videoType: "YOUTUBE",
    createdAt: "2025-04-10T09:15:00Z",
    durationMin: 30,
    author: "RH",
    assigned: 156,
    completed: 110,
    completionRate: 71,
    tags: ["Soft Skills", "Cultura"]
  },
  {
    id: "4", 
    title: "Comunicação Efetiva",
    description: "Técnicas para melhorar sua comunicação no ambiente de trabalho.",
    videoType: "YOUTUBE",
    createdAt: "2025-04-12T11:45:00Z",
    durationMin: 40,
    author: "Comunicação",
    assigned: 45,
    completed: 29,
    completionRate: 64,
    tags: ["Soft Skills", "Comunicação"]
  },
  {
    id: "5",
    title: "Excel Avançado",
    description: "Domine fórmulas avançadas e análise de dados no Excel.",
    videoType: "UPLOAD",
    createdAt: "2025-04-15T13:00:00Z",
    durationMin: 60,
    author: "TI",
    assigned: 32,
    completed: 19,
    completionRate: 59,
    tags: ["Excel", "Ferramentas", "Análise"]
  },
  {
    id: "6",
    title: "Gestão de Tempo",
    description: "Aprenda técnicas para gerenciar melhor seu tempo e aumentar a produtividade.",
    videoType: "YOUTUBE",
    createdAt: "2025-04-18T09:30:00Z",
    durationMin: 35,
    author: "RH",
    assigned: 78,
    completed: 42,
    completionRate: 54,
    tags: ["Produtividade", "Soft Skills"]
  },
  {
    id: "7",
    title: "Marketing Digital",
    description: "Fundamentos de marketing digital e estratégias eficazes.",
    videoType: "UPLOAD",
    createdAt: "2025-04-20T15:00:00Z",
    durationMin: 55,
    author: "Marketing",
    assigned: 25,
    completed: 18,
    completionRate: 72,
    tags: ["Marketing", "Digital"]
  }
];

// Dropdown menu component for table actions
const ActionsMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  
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
          <Link 
            to="#" 
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            <Edit size={14} />
            <span>Editar</span>
          </Link>
          <Link 
            to="#" 
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            <Users size={14} />
            <span>Atribuir</span>
          </Link>
          <Link 
            to="#" 
            className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
          >
            <Trash2 size={14} />
            <span>Excluir</span>
          </Link>
        </div>
      )}
    </div>
  );
};

const TrainingsList = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTags, setFilterTags] = useState<string[]>([]);
  
  // Get all unique tags from trainings
  const allTags = Array.from(
    new Set(mockTrainings.flatMap(training => training.tags))
  );
  
  // Filter trainings based on search query and tags
  const filteredTrainings = mockTrainings.filter(training => {
    const matchesSearch = !searchQuery || 
      training.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      training.description.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesTags = filterTags.length === 0 || 
      filterTags.some(tag => training.tags.includes(tag));
      
    return matchesSearch && matchesTags;
  });
  
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
  
  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Treinamentos</h1>
          
          <Link to="/trainings/new" className="taggui-btn-primary flex items-center gap-2">
            <PlusCircle size={18} />
            <span>Novo Treinamento</span>
          </Link>
        </div>
        
        {/* Filters and search */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
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
                {filteredTrainings.map((training) => (
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
                      {formatDate(training.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {training.durationMin} min
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {training.author}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${
                              training.completionRate > 80 ? "bg-green-500" : 
                              training.completionRate > 50 ? "bg-amber-500" : "bg-red-500"
                            }`}
                            style={{ width: `${training.completionRate}%` }}
                          ></div>
                        </div>
                        <span className="ml-2 text-xs font-medium">{training.completionRate}%</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {training.completed}/{training.assigned} concluídos
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-wrap gap-1">
                        {training.tags.map((tag, index) => (
                          <span 
                            key={index}
                            className="bg-gray-100 px-2 py-1 rounded-full text-xs text-gray-600"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <ActionsMenu />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredTrainings.length === 0 && (
            <div className="py-8 text-center">
              <p className="text-gray-500">Nenhum treinamento encontrado.</p>
            </div>
          )}
          
          {/* Pagination would go here in a real app */}
          <div className="py-3 px-6 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Mostrando <span className="font-medium">{filteredTrainings.length}</span> de <span className="font-medium">{mockTrainings.length}</span> treinamentos
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
        </div>
      </div>
    </Layout>
  );
};

export default TrainingsList;
