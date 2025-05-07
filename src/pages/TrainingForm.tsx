
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Upload, X, AlertTriangle, Loader } from "lucide-react";
import Layout from "../components/layout/Layout";
import { toast } from "@/hooks/use-toast";
import { createTraining, uploadTrainingVideo } from "@/services/api";
import { useAuth } from "@/hooks/useAuth";

const TrainingForm = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
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
  
  // Handle file upload
  const handleUpload = async () => {
    if (!uploadFile) return;
    
    try {
      setIsUploading(true);
      setUploadProgress(0);
      
      // Set up progress tracking
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 95) {
            clearInterval(interval);
            return 95;
          }
          return prev + 5;
        });
      }, 300);
      
      // Perform actual upload to Supabase storage
      const videoUrl = await uploadTrainingVideo(uploadFile);
      
      // Complete the progress bar
      clearInterval(interval);
      setUploadProgress(100);
      setFormData(prev => ({ ...prev, videoUrl }));
      
      toast({
        title: "Upload concluído",
        description: "O vídeo foi carregado com sucesso!"
      });
    } catch (error) {
      console.error("Erro no upload do vídeo:", error);
      toast({
        title: "Erro no upload",
        description: "Não foi possível fazer o upload do vídeo. Por favor, tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };
  
  // Submit the form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.title) {
      toast({
        title: "Dados incompletos",
        description: "Por favor, informe um título para o treinamento.",
        variant: "destructive"
      });
      return;
    }
    
    if (formData.videoType === "YOUTUBE" && !formData.videoUrl) {
      toast({
        title: "Dados incompletos",
        description: "Por favor, informe o link do vídeo no YouTube.",
        variant: "destructive"
      });
      return;
    }
    
    if (formData.videoType === "UPLOAD" && !formData.videoUrl) {
      toast({
        title: "Dados incompletos",
        description: "Por favor, faça o upload de um vídeo.",
        variant: "destructive"
      });
      return;
    }
    
    if (!formData.durationMin) {
      toast({
        title: "Dados incompletos",
        description: "Por favor, informe a duração do treinamento.",
        variant: "destructive"
      });
      return;
    }
    
    // Filter out empty tags
    const filteredTags = formData.tags.filter(tag => tag.trim() !== "");
    
    setIsSubmitting(true);
    
    try {
      // Real API call to save the training
      await createTraining({
        title: formData.title,
        description: formData.description,
        video_type: formData.videoType as "YOUTUBE" | "UPLOAD",
        video_url: formData.videoUrl,
        duration_min: parseInt(formData.durationMin),
        tags: filteredTags.length > 0 ? filteredTags : null,
        company_id: user?.company_id || ""
      });
      
      toast({
        title: "Sucesso!",
        description: "Treinamento criado com sucesso!"
      });
      
      // Redirect after successful creation
      navigate("/trainings");
    } catch (error) {
      console.error("Erro ao criar treinamento:", error);
      toast({
        title: "Erro",
        description: "Não foi possível criar o treinamento. Por favor, tente novamente mais tarde.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Layout>
      <div className="max-w-4xl mx-auto py-6">
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
                            disabled={isUploading}
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
                          onClick={() => {
                            setUploadFile(null);
                            setUploadProgress(0);
                            setFormData(prev => ({ ...prev, videoUrl: "" }));
                          }}
                          className="text-gray-400 hover:text-gray-500"
                          disabled={isUploading}
                        >
                          <X size={16} />
                        </button>
                      </div>
                      
                      {!isUploading && uploadProgress === 0 && (
                        <button
                          type="button"
                          onClick={handleUpload}
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
                              {isUploading ? "Enviando..." : uploadProgress === 100 ? "Upload completo" : "Processando..."}
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
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            
            <button
              type="submit"
              disabled={isSubmitting}
              className="taggui-btn-primary flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader size={16} className="animate-spin" />
                  <span>Salvando...</span>
                </>
              ) : "Salvar Treinamento"}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default TrainingForm;
