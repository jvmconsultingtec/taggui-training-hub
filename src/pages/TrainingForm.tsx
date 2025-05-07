
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Upload, X, AlertTriangle } from "lucide-react";
import Layout from "../components/layout/Layout";
import { toast } from "sonner";

const TrainingForm = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    videoType: "YOUTUBE", // "YOUTUBE" or "UPLOAD"
    videoUrl: "",
    durationMin: "",
    tags: [""] // Start with one empty tag
  });
  
  // Handle upload state for video file
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  
  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle tag changes
  const handleTagChange = (index: number, value: string) => {
    const newTags = [...formData.tags];
    newTags[index] = value;
    setFormData(prev => ({ ...prev, tags: newTags }));
  };
  
  // Add a new tag input
  const addTag = () => {
    setFormData(prev => ({ ...prev, tags: [...prev.tags, ""] }));
  };
  
  // Remove a tag
  const removeTag = (index: number) => {
    const newTags = formData.tags.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, tags: newTags }));
  };
  
  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadFile(file);
    }
  };
  
  // Simulate file upload progress
  const simulateUpload = () => {
    if (!uploadFile) return;
    
    setIsUploading(true);
    setUploadProgress(0);
    
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        const newProgress = prev + 10;
        
        if (newProgress >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          setFormData(prev => ({ 
            ...prev, 
            videoUrl: URL.createObjectURL(uploadFile) 
          }));
          return 100;
        }
        
        return newProgress;
      });
    }, 500);
  };
  
  // Submit the form
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.title) {
      toast.error("Por favor, informe um título para o treinamento.");
      return;
    }
    
    if (formData.videoType === "YOUTUBE" && !formData.videoUrl) {
      toast.error("Por favor, informe o link do vídeo no YouTube.");
      return;
    }
    
    if (formData.videoType === "UPLOAD" && !formData.videoUrl) {
      toast.error("Por favor, faça o upload de um vídeo.");
      return;
    }
    
    if (!formData.durationMin) {
      toast.error("Por favor, informe a duração do treinamento.");
      return;
    }
    
    // Filter out empty tags
    const filteredTags = formData.tags.filter(tag => tag.trim() !== "");
    
    setIsSubmitting(true);
    
    // Simulate API call to save the training
    setTimeout(() => {
      toast.success("Treinamento criado com sucesso!");
      setIsSubmitting(false);
      navigate("/trainings");
    }, 1500);
  };
  
  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-gray-600 hover:text-taggui-primary mb-6"
        >
          <ChevronLeft size={18} />
          <span>Voltar</span>
        </button>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Novo Treinamento</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic info card */}
          <div className="taggui-card">
            <h2 className="text-lg font-semibold mb-4">Informações Básicas</h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Título <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Ex: Onboarding: Conheça a Empresa"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-taggui-primary focus:border-taggui-primary"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Descreva o conteúdo do treinamento"
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-taggui-primary focus:border-taggui-primary"
                />
              </div>
              
              <div>
                <label htmlFor="durationMin" className="block text-sm font-medium text-gray-700 mb-1">
                  Duração (minutos) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="durationMin"
                  name="durationMin"
                  value={formData.durationMin}
                  onChange={handleChange}
                  placeholder="Ex: 30"
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-taggui-primary focus:border-taggui-primary"
                  required
                />
              </div>
            </div>
          </div>
          
          {/* Video section */}
          <div className="taggui-card">
            <h2 className="text-lg font-semibold mb-4">Conteúdo do Vídeo</h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="videoType" className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Vídeo <span className="text-red-500">*</span>
                </label>
                <select
                  id="videoType"
                  name="videoType"
                  value={formData.videoType}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-taggui-primary focus:border-taggui-primary"
                >
                  <option value="YOUTUBE">YouTube</option>
                  <option value="UPLOAD">Upload de Arquivo</option>
                </select>
              </div>
              
              {formData.videoType === "YOUTUBE" ? (
                <div>
                  <label htmlFor="videoUrl" className="block text-sm font-medium text-gray-700 mb-1">
                    Link do YouTube <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="url"
                    id="videoUrl"
                    name="videoUrl"
                    value={formData.videoUrl}
                    onChange={handleChange}
                    placeholder="Ex: https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-taggui-primary focus:border-taggui-primary"
                  />
                  
                  <div className="mt-1 text-xs text-gray-500 flex items-center gap-1">
                    <AlertTriangle size={12} />
                    <span>Certifique-se que o vídeo é público ou não-listado</span>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Upload de Vídeo <span className="text-red-500">*</span>
                  </label>
                  
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                    <div className="space-y-1 text-center">
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600">
                        <label
                          htmlFor="file-upload"
                          className="relative cursor-pointer rounded-md bg-white font-medium text-taggui-primary hover:text-taggui-primary-hover focus-within:outline-none focus-within:ring-2 focus-within:ring-taggui-primary"
                        >
                          <span>Carregar um arquivo</span>
                          <input
                            id="file-upload"
                            name="file-upload"
                            type="file"
                            accept="video/*"
                            className="sr-only"
                            onChange={handleFileChange}
                          />
                        </label>
                        <p className="pl-1">ou arraste e solte</p>
                      </div>
                      <p className="text-xs text-gray-500">MP4, MOV ou AVI até 2GB</p>
                    </div>
                  </div>
                  
                  {uploadFile && (
                    <div className="mt-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium truncate max-w-xs">
                          {uploadFile.name}
                        </span>
                        <button
                          type="button"
                          onClick={() => setUploadFile(null)}
                          className="text-gray-400 hover:text-gray-500"
                        >
                          <X size={16} />
                        </button>
                      </div>
                      
                      {!isUploading && uploadProgress === 0 && (
                        <button
                          type="button"
                          onClick={simulateUpload}
                          className="mt-2 taggui-btn-outline text-sm"
                        >
                          Iniciar upload
                        </button>
                      )}
                      
                      {(isUploading || uploadProgress > 0) && (
                        <div className="mt-2">
                          <div className="w-full h-2 bg-gray-200 rounded-full">
                            <div 
                              className="h-full bg-taggui-primary rounded-full" 
                              style={{ width: `${uploadProgress}%` }}
                            ></div>
                          </div>
                          <div className="mt-1 flex justify-between text-xs">
                            <span>{uploadProgress}%</span>
                            <span>
                              {isUploading ? "Enviando..." : "Upload completo"}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          
          {/* Tags section */}
          <div className="taggui-card">
            <h2 className="text-lg font-semibold mb-4">Tags</h2>
            
            <div className="space-y-3">
              {formData.tags.map((tag, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={tag}
                    onChange={(e) => handleTagChange(index, e.target.value)}
                    placeholder="Ex: Onboarding"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-taggui-primary focus:border-taggui-primary"
                  />
                  
                  <button
                    type="button"
                    onClick={() => removeTag(index)}
                    disabled={formData.tags.length === 1}
                    className="p-2 rounded-md text-gray-400 hover:text-gray-600 disabled:opacity-50"
                  >
                    <X size={18} />
                  </button>
                </div>
              ))}
              
              <button
                type="button"
                onClick={addTag}
                className="text-sm text-taggui-primary hover:text-taggui-primary-hover font-medium"
              >
                + Adicionar tag
              </button>
            </div>
          </div>
          
          {/* Submit buttons */}
          <div className="flex gap-4 justify-end">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
            
            <button
              type="submit"
              disabled={isSubmitting}
              className="taggui-btn-primary"
            >
              {isSubmitting ? "Salvando..." : "Salvar Treinamento"}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default TrainingForm;
