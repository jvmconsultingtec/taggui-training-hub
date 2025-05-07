
import { useState, useEffect, FormEvent, ChangeEvent } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "@/hooks/use-toast";
import { createTraining, fetchTrainingById, updateTraining, uploadTrainingVideo } from "@/services/api";
import { ArrowLeft, Upload, Loader, Plus, X } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";

const TrainingForm = () => {
  const navigate = useNavigate();
  const { user, session } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    videoType: "YOUTUBE",
    videoUrl: "",
    durationMin: "10",
    tag: "",
    visibility: "PUBLIC" as "PUBLIC" | "PRIVATE"
  });
  
  // Tags state
  const [tags, setTags] = useState<string[]>([]);
  
  // File state
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  
  // Form validation state
  const [errors, setErrors] = useState({
    title: "",
    videoUrl: "",
    durationMin: ""
  });
  
  // Edit mode
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const isEditMode = !!id;
  
  // Load training data if in edit mode
  useEffect(() => {
    const loadTraining = async () => {
      if (isEditMode && id) {
        try {
          setLoading(true);
          const training = await fetchTrainingById(id);
          
          if (training) {
            setFormData({
              title: training.title || "",
              description: training.description || "",
              videoType: training.video_type || "YOUTUBE",
              videoUrl: training.video_url || "",
              durationMin: String(training.duration_min) || "10",
              tag: "",
              visibility: training.visibility || "PUBLIC"
            });
            
            if (training.tags && Array.isArray(training.tags)) {
              setTags(training.tags);
            }
          } else {
            setLoadError("Treinamento não encontrado.");
          }
        } catch (error: any) {
          console.error("Erro ao carregar treinamento:", error);
          setLoadError(error.message || "Erro ao carregar dados do treinamento");
        } finally {
          setLoading(false);
        }
      }
    };
    
    loadTraining();
  }, [id, isEditMode]);
  
  // Handle input changes
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when field is edited
    if (name in errors) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };
  
  // Handle radio button changes
  const handleRadioChange = (value: string) => {
    setFormData(prev => ({ ...prev, videoType: value as "YOUTUBE" | "UPLOAD" }));
    if (value === "YOUTUBE") {
      setFile(null);
    }
  };
  
  // Handle visibility change
  const handleVisibilityChange = (value: string) => {
    setFormData(prev => ({ ...prev, visibility: value as "PUBLIC" | "PRIVATE" }));
  };
  
  // Handle file changes
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };
  
  // Add tag to list
  const addTag = () => {
    const tagValue = formData.tag.trim();
    
    if (tagValue && !tags.includes(tagValue)) {
      setTags([...tags, tagValue]);
      setFormData(prev => ({ ...prev, tag: "" }));
    }
  };
  
  // Remove tag from list
  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };
  
  // Filter out empty tags
  const filteredTags = tags.filter(tag => tag.trim() !== "");
  
  // Validate form
  const validateForm = () => {
    const newErrors = {
      title: "",
      videoUrl: "",
      durationMin: ""
    };
    
    let isValid = true;
    
    if (!formData.title.trim()) {
      newErrors.title = "O título é obrigatório";
      isValid = false;
    }
    
    if (formData.videoType === "YOUTUBE" && !formData.videoUrl.trim()) {
      newErrors.videoUrl = "A URL do vídeo é obrigatória";
      isValid = false;
    }
    
    if (formData.videoType === "UPLOAD" && !file && !formData.videoUrl) {
      newErrors.videoUrl = "Por favor, selecione um vídeo para upload";
      isValid = false;
    }
    
    const duration = parseInt(formData.durationMin);
    if (isNaN(duration) || duration <= 0) {
      newErrors.durationMin = "A duração deve ser um número maior que zero";
      isValid = false;
    }
    
    setErrors(newErrors);
    return isValid;
  };
  
  // Handle form submission
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Get company_id from user metadata or session
      let companyId = "00000000-0000-0000-0000-000000000000";
      
      if (user?.user_metadata?.company_id) {
        companyId = user.user_metadata.company_id;
      }
      
      // Handle file upload if necessary
      let videoUrl = formData.videoUrl;
      
      if (formData.videoType === "UPLOAD" && file) {
        setIsUploading(true);
        try {
          videoUrl = await uploadTrainingVideo(file);
        } catch (error: any) {
          toast({
            title: "Erro no upload do vídeo",
            description: error.message || "Não foi possível fazer o upload do vídeo",
            variant: "destructive"
          });
          setIsSubmitting(false);
          setIsUploading(false);
          return;
        }
        setIsUploading(false);
      }
      
      const trainingData = {
        title: formData.title,
        description: formData.description,
        video_type: formData.videoType,
        video_url: videoUrl,
        duration_min: parseInt(formData.durationMin),
        tags: filteredTags.length > 0 ? filteredTags : null,
        company_id: companyId,
        visibility: formData.visibility
      };
      
      if (isEditMode && id) {
        // Update existing training
        await updateTraining(id, trainingData);
        toast({
          title: "Treinamento atualizado",
          description: "O treinamento foi atualizado com sucesso"
        });
      } else {
        // Create new training
        await createTraining(trainingData);
        toast({
          title: "Treinamento criado",
          description: "O treinamento foi criado com sucesso"
        });
      }
      
      // Navigate back to trainings list
      navigate("/trainings");
      
    } catch (error: any) {
      console.error("Erro ao salvar treinamento:", error);
      toast({
        title: "Erro ao salvar",
        description: error.message || "Ocorreu um erro ao salvar o treinamento",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <Loader className="h-8 w-8 animate-spin text-taggui-primary" />
          <span className="ml-2">Carregando dados do treinamento...</span>
        </div>
      </Layout>
    );
  }
  
  if (loadError) {
    return (
      <Layout>
        <div className="container mx-auto py-6">
          <Alert variant="destructive">
            <AlertTitle>Erro</AlertTitle>
            <AlertDescription>{loadError}</AlertDescription>
          </Alert>
          <div className="flex justify-center mt-4">
            <Button onClick={() => navigate("/trainings")}>
              Voltar para Treinamentos
            </Button>
          </div>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="container mx-auto py-6 space-y-6 max-w-4xl">
        <div className="flex items-center justify-between">
          <div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/trainings")}
              className="mb-2"
            >
              <ArrowLeft className="h-4 w-4 mr-1" /> Voltar
            </Button>
            <h1 className="text-2xl font-bold">
              {isEditMode ? "Editar Treinamento" : "Novo Treinamento"}
            </h1>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Título</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Digite um título para o treinamento"
                className={errors.title ? "border-red-500" : ""}
              />
              {errors.title && <p className="text-sm text-red-500 mt-1">{errors.title}</p>}
            </div>
            
            <div>
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Descreva o conteúdo do treinamento"
                rows={4}
              />
            </div>
            
            <div>
              <Label>Tipo de Vídeo</Label>
              <RadioGroup 
                value={formData.videoType} 
                onValueChange={handleRadioChange}
                className="flex gap-4 mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="YOUTUBE" id="youtube" />
                  <Label htmlFor="youtube">YouTube</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="UPLOAD" id="upload" />
                  <Label htmlFor="upload">Upload</Label>
                </div>
              </RadioGroup>
            </div>
            
            <div>
              <Label>Visibilidade</Label>
              <RadioGroup 
                value={formData.visibility} 
                onValueChange={handleVisibilityChange}
                className="flex gap-4 mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="PUBLIC" id="public" />
                  <Label htmlFor="public">Público</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="PRIVATE" id="private" />
                  <Label htmlFor="private">Privado</Label>
                </div>
              </RadioGroup>
            </div>
            
            {formData.videoType === "YOUTUBE" ? (
              <div>
                <Label htmlFor="videoUrl">URL do Vídeo do YouTube</Label>
                <Input
                  id="videoUrl"
                  name="videoUrl"
                  value={formData.videoUrl}
                  onChange={handleChange}
                  placeholder="Ex: https://www.youtube.com/watch?v=..."
                  className={errors.videoUrl ? "border-red-500" : ""}
                />
                {errors.videoUrl && <p className="text-sm text-red-500 mt-1">{errors.videoUrl}</p>}
              </div>
            ) : (
              <div>
                <Label htmlFor="videoUpload">Fazer Upload do Vídeo</Label>
                <div className="mt-2">
                  <Card className="border-dashed">
                    <CardContent className="p-4">
                      <div className="flex flex-col items-center justify-center py-4">
                        <Upload className="h-8 w-8 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-500">
                          {file ? file.name : "Selecione um arquivo de vídeo"}
                        </p>
                        <div className="mt-4">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => document.getElementById("videoUpload")?.click()}
                          >
                            Selecionar Arquivo
                          </Button>
                          <input
                            type="file"
                            id="videoUpload"
                            accept="video/*"
                            onChange={handleFileChange}
                            className="hidden"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  {errors.videoUrl && <p className="text-sm text-red-500 mt-1">{errors.videoUrl}</p>}
                </div>
              </div>
            )}
            
            <div>
              <Label htmlFor="durationMin">Duração (minutos)</Label>
              <Input
                id="durationMin"
                name="durationMin"
                value={formData.durationMin}
                onChange={handleChange}
                type="number"
                min="1"
                className={`w-48 ${errors.durationMin ? "border-red-500" : ""}`}
              />
              {errors.durationMin && <p className="text-sm text-red-500 mt-1">{errors.durationMin}</p>}
            </div>
            
            <div>
              <Label>Tags</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  id="tag"
                  name="tag"
                  value={formData.tag}
                  onChange={handleChange}
                  placeholder="Adicione uma tag"
                  className="flex-grow"
                />
                <Button type="button" onClick={addTag} size="sm" className="flex-shrink-0">
                  <Plus className="h-4 w-4 mr-1" /> Adicionar
                </Button>
              </div>
              
              {filteredTags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {filteredTags.map((tag, index) => (
                    <span
                      key={index}
                      className="bg-taggui-primary/10 text-taggui-primary px-2 py-1 rounded-full text-sm flex items-center"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-1 text-taggui-primary hover:text-taggui-primary-hover rounded-full"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/trainings")}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="taggui-btn-primary"
            >
              {isSubmitting ? (
                <>
                  <Loader className="h-4 w-4 animate-spin mr-2" />
                  {isUploading ? "Enviando vídeo..." : "Salvando..."}
                </>
              ) : (
                isEditMode ? "Atualizar Treinamento" : "Criar Treinamento"
              )}
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default TrainingForm;
