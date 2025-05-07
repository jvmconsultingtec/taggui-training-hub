
import { useState } from "react";
import Layout from "../components/layout/Layout";
import TrainingCard, { TrainingStatus } from "../components/trainings/TrainingCard";
import { BarChart3, Clock, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

// Mock data for employee dashboard
const mockAssignedTrainings = [
  {
    id: "1",
    title: "Onboarding: Conheça a Empresa",
    description: "Um treinamento completo sobre nossa história, valores e cultura.",
    duration: 15,
    progress: 0,
    status: "pending" as TrainingStatus,
    thumbnailUrl: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?ixlib=rb-1.2.1&auto=format&fit=crop&w=2100&q=80"
  },
  {
    id: "2", 
    title: "Segurança da Informação",
    description: "Aprenda as melhores práticas para proteger dados sensíveis.",
    duration: 25,
    progress: 45,
    status: "inprogress" as TrainingStatus,
    thumbnailUrl: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?ixlib=rb-1.2.1&auto=format&fit=crop&w=2100&q=80"
  },
  {
    id: "3",
    title: "Treinamento em Diversidade e Inclusão",
    description: "Como criar um ambiente de trabalho inclusivo e respeitoso.",
    duration: 30,
    progress: 100,
    status: "completed" as TrainingStatus,
    thumbnailUrl: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?ixlib=rb-1.2.1&auto=format&fit=crop&w=2100&q=80"
  },
  {
    id: "4",
    title: "Noções Básicas de Programação",
    description: "Introdução aos conceitos fundamentais de programação.",
    duration: 45,
    progress: 0,
    status: "overdue" as TrainingStatus,
    thumbnailUrl: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?ixlib=rb-1.2.1&auto=format&fit=crop&w=2100&q=80"
  }
];

// Statistics for the dashboard
const stats = [
  { label: "Treinamentos atribuídos", value: 8 },
  { label: "Concluídos", value: 3 },
  { label: "Em andamento", value: 2 },
  { label: "Pendentes", value: 3 }
];

const Dashboard = () => {
  const [filter, setFilter] = useState<TrainingStatus | "all">("all");
  
  const filteredTrainings = filter === "all" 
    ? mockAssignedTrainings 
    : mockAssignedTrainings.filter(training => training.status === filter);
    
  // Calculate overall progress
  const totalTrainings = mockAssignedTrainings.length;
  const completedTrainings = mockAssignedTrainings.filter(t => t.status === "completed").length;
  const overallProgress = totalTrainings > 0 ? Math.round((completedTrainings / totalTrainings) * 100) : 0;
  
  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard de Treinamentos</h1>
        
        {/* Stats cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="taggui-card">
              <p className="text-sm text-gray-500">{stat.label}</p>
              <p className="text-2xl font-bold">{stat.value}</p>
            </div>
          ))}
        </div>
        
        {/* Overall progress */}
        <div className="taggui-card mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Seu progresso geral</h2>
            <Link 
              to="/progress" 
              className="flex items-center text-sm text-taggui-primary hover:text-taggui-primary-hover"
            >
              <span>Ver detalhes</span>
              <ChevronRight size={16} />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="col-span-2">
              <div className="h-6 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-taggui-primary transition-all duration-500"
                  style={{ width: `${overallProgress}%` }}
                ></div>
              </div>
              <div className="flex justify-between mt-2">
                <span className="text-sm text-gray-500">Progresso</span>
                <span className="text-sm font-medium">{overallProgress}% concluído</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center">
                <BarChart3 className="h-8 w-8 text-taggui-primary" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Próxima meta</p>
                <p className="font-medium">5 treinamentos</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Training filters and list */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Meus treinamentos</h2>
          <div className="flex gap-2">
            <button 
              onClick={() => setFilter("all")}
              className={`px-3 py-1.5 text-sm rounded-md ${
                filter === "all" 
                  ? "bg-taggui-primary text-white" 
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Todos
            </button>
            <button 
              onClick={() => setFilter("inprogress")}
              className={`px-3 py-1.5 text-sm rounded-md ${
                filter === "inprogress" 
                  ? "bg-taggui-primary text-white" 
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Em andamento
            </button>
            <button 
              onClick={() => setFilter("pending")}
              className={`px-3 py-1.5 text-sm rounded-md ${
                filter === "pending" 
                  ? "bg-taggui-primary text-white" 
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Pendentes
            </button>
            <button 
              onClick={() => setFilter("completed")}
              className={`px-3 py-1.5 text-sm rounded-md ${
                filter === "completed" 
                  ? "bg-taggui-primary text-white" 
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Concluídos
            </button>
          </div>
        </div>
        
        {filteredTrainings.length === 0 ? (
          <div className="taggui-card flex flex-col items-center justify-center py-12">
            <Clock className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum treinamento encontrado</h3>
            <p className="text-gray-500 text-center max-w-md">
              {filter === "all" 
                ? "Você não possui treinamentos atribuídos no momento." 
                : `Você não possui treinamentos com status "${filter}" no momento.`}
            </p>
            {filter !== "all" && (
              <button 
                onClick={() => setFilter("all")}
                className="mt-4 taggui-btn-outline"
              >
                Ver todos os treinamentos
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTrainings.map((training) => (
              <TrainingCard key={training.id} {...training} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Dashboard;
