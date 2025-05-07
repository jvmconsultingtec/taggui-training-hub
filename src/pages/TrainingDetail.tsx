
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, Calendar, Clock, Tag, Check } from "lucide-react";
import VideoPlayer from "../components/trainings/VideoPlayer";
import Layout from "../components/layout/Layout";
import { toast } from "sonner";

// Mock training data
const mockTrainingDetails = {
  id: "2",
  title: "Segurança da Informação",
  description: "Aprenda as melhores práticas para proteger dados sensíveis da empresa e dos clientes. Este treinamento cobre os fundamentos de segurança digital, prevenção contra phishing, gerenciamento seguro de senhas e muito mais.",
  videoType: "YOUTUBE" as const,
  videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", // Example YouTube URL
  durationMin: 25,
  tags: ["Segurança", "TI", "Obrigatório"],
  createdAt: "2025-04-15T10:30:00Z",
  progress: 45,
  instructor: "Carlos Silva",
  instructorRole: "Diretor de TI"
};

const TrainingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [training, setTraining] = useState(mockTrainingDetails);
  const [progress, setProgress] = useState(training.progress);
  const [isCompleted, setIsCompleted] = useState(progress === 100);
  const [isCompletionLoading, setIsCompletionLoading] = useState(false);
  
  useEffect(() => {
    // In a real app, you'd fetch the training details by ID
    // For now, we'll just use the mock data
    console.log(`Fetching training with ID: ${id}`);
    
    // For demonstration purposes, let's pretend we're loading data
    // In a real app, you'd make an API call here
  }, [id]);
  
  const handleProgressUpdate = (newProgress: number) => {
    setProgress(newProgress);
    
    // In a real app, you'd save this progress to the backend
    console.log(`Updating progress to ${newProgress}%`);
    
    // Mark as completed if reached 100%
    if (newProgress >= 100 && !isCompleted) {
      setIsCompleted(true);
    }
  };
  
  const handleMarkAsCompleted = () => {
    setIsCompletionLoading(true);
    
    // Simulate API call to mark the training as completed
    setTimeout(() => {
      setProgress(100);
      setIsCompleted(true);
      setIsCompletionLoading(false);
      toast.success("Treinamento marcado como concluído!");
    }, 1000);
  };
  
  // Format the creation date
  const formattedDate = new Date(training.createdAt).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
  
  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        {/* Back button */}
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-gray-600 hover:text-taggui-primary mb-6"
        >
          <ChevronLeft size={18} />
          <span>Voltar</span>
        </button>
        
        {/* Training header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{training.title}</h1>
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Calendar size={16} />
                <span>{formattedDate}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock size={16} />
                <span>{training.durationMin} minutos</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {!isCompleted ? (
              <button 
                onClick={handleMarkAsCompleted}
                disabled={isCompletionLoading}
                className="taggui-btn-primary flex items-center gap-2"
              >
                <Check size={18} />
                {isCompletionLoading ? "Processando..." : "Marcar como concluído"}
              </button>
            ) : (
              <div className="status-badge completed flex items-center gap-2 px-3 py-2">
                <Check size={18} />
                <span>Concluído</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content with video */}
          <div className="lg:col-span-2">
            <div className="taggui-card mb-6">
              <VideoPlayer 
                videoUrl={training.videoUrl}
                videoType={training.videoType}
                onProgress={handleProgressUpdate}
                initialProgress={progress}
              />
              
              {/* Progress bar */}
              <div className="mt-4">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-600">Seu progresso</span>
                  <span className="font-medium">{Math.round(progress)}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-taggui-primary transition-all duration-500 ease-out"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>
            </div>
            
            {/* Description section */}
            <div className="taggui-card">
              <h2 className="text-lg font-semibold mb-3">Descrição</h2>
              <p className="text-gray-700 whitespace-pre-line">{training.description}</p>
              
              {/* Tags */}
              <div className="flex flex-wrap gap-2 mt-6">
                {training.tags.map((tag, index) => (
                  <span 
                    key={index}
                    className="flex items-center gap-1 bg-gray-100 px-3 py-1 rounded-full text-xs font-medium text-gray-600"
                  >
                    <Tag size={12} />
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
          
          {/* Sidebar with instructor and additional info */}
          <div className="space-y-6">
            {/* Instructor card */}
            <div className="taggui-card">
              <h2 className="text-lg font-semibold mb-4">Instrutor</h2>
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 font-medium">
                  {training.instructor.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <p className="font-medium">{training.instructor}</p>
                  <p className="text-sm text-gray-600">{training.instructorRole}</p>
                </div>
              </div>
            </div>
            
            {/* Related trainings card - would be dynamic in a real app */}
            <div className="taggui-card">
              <h2 className="text-lg font-semibold mb-4">Treinamentos relacionados</h2>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="h-16 w-24 bg-gray-200 rounded overflow-hidden flex-shrink-0"></div>
                  <div>
                    <p className="font-medium text-sm">Proteção de Dados e LGPD</p>
                    <p className="text-xs text-gray-600">18 minutos</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="h-16 w-24 bg-gray-200 rounded overflow-hidden flex-shrink-0"></div>
                  <div>
                    <p className="font-medium text-sm">Cibersegurança Básica</p>
                    <p className="text-xs text-gray-600">22 minutos</p>
                  </div>
                </div>
              </div>
              <button className="taggui-btn-outline w-full mt-4">
                Ver mais treinamentos
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default TrainingDetail;
