
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Loader2, Upload, X, Plus } from "lucide-react";
import Layout from "../components/layout/Layout";
import { createTraining, fetchTrainingById, updateTraining, uploadTrainingVideo } from "../services/api";
import { toast } from "../hooks/use-toast";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";

// Helper function to convert duration to minutes
const durationToMinutes = (duration: string): number => {
  // Handle empty cases
  if (!duration) return 0;
  
  // If already a number, return it
  if (!isNaN(Number(duration))) {
    return Math.max(0, Math.round(Number(duration)));
  }

  // Try to parse it as MM:SS format
  const parts = duration.split(':');
  if (parts.length === 2) {
    const minutes = parseInt(parts[0], 10);
    const seconds = parseInt(parts[1], 10);
    if (!isNaN(minutes) && !isNaN(seconds)) {
      return Math.round(minutes + (seconds / 60));
    }
  }
  
  return 0;
};

const TrainingForm = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Form fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [author, setAuthor] = useState("");
  const [videoType, setVideoType] = useState<"YOUTUBE" | "UPLOAD">("YOUTUBE");
  const [videoUrl, setVideoUrl] = useState("");
  const [duration, setDuration] = useState(""); // User input in MM:SS or minutes format
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [visibility, setVisibility] = useState<"PUBLIC" | "PRIVATE">("PRIVATE");
  
  // File upload state
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    // If we have an ID, fetch the training to edit
    if (id) {
      loadTraining(id);
    }
  }, [id]);

  const loadTraining = async (trainingId: string) => {
    try {
      setLoading(true);
      const training = await fetchTrainingById(trainingId);
      
      if (!training) {
        toast({
          title: "Erro",
          description: "Treinamento não encontrado",
          variant: "destructive"
        });
        navigate("/trainings");
        return;
      }
      
      // Populate form fields
      setTitle(training.title);
      setDescription(training.description || "");
      setAuthor(training.author || "");
      setVideoType(training.video_type);
      setVideoUrl(training.video_url);
      setDuration(training.duration_min.toString());
      setTags(training.tags || []);
      setVisibility(training.visibility || "PRIVATE");
      
    } catch (error) {
      console.error("Error loading training:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar o treinamento",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      // Validate file type
      const selectedFile = e.target.files[0];
      const fileType = selectedFile.type;
      
      if (!fileType.startsWith('video/')) {
        toast({
          title: "Erro",
          description: "Por favor, selecione um arquivo de vídeo válido",
          variant: "destructive"
        });
        return;
      }
      
      setFile(selectedFile);
      
      // Extract duration if possible (only works in modern browsers)
      const video = document.createElement('video');
      video.preload = 'metadata';
      
      video.onloadedmetadata = function() {
        window.URL.revokeObjectURL(video.src);
        const durationInMinutes = Math.round(video.duration / 60);
        setDuration(durationInMinutes.toString());
      };
      
      video.src = URL.createObjectURL(selectedFile);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast({
        title: "Erro",
        description: "O título é obrigatório",
        variant: "destructive"
      });
      return;
    }
    
    if (videoType === "YOUTUBE" && !videoUrl.trim()) {
      toast({
        title: "Erro",
        description: "A URL do vídeo é obrigatória",
        variant: "destructive"
      });
      return;
    }
    
    if (videoType === "UPLOAD" && !file && !videoUrl) {
      toast({
        title: "Erro",
        description: "É necessário fazer upload de um vídeo",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setSubmitting(true);
      
      let finalVideoUrl = videoUrl;
      
      // If we have a file to upload, do that first
      if (file) {
        setUploading(true);
        
        try {
          // Start a simulated progress
          let progress = 0;
          const progressInterval = setInterval(() => {
            progress += 5;
            if (progress > 95) {
              clearInterval(progressInterval);
            }
            setUploadProgress(progress);
          }, 300);
          
          finalVideoUrl = await uploadTrainingVideo(file);
          
          clearInterval(progressInterval);
          setUploadProgress(100);
          
          toast({
            title: "Sucesso",
            description: "Vídeo enviado com sucesso"
          });
        } catch (error) {
          console.error("Error uploading video:", error);
          toast({
            title: "Erro no upload",
            description: "Não foi possível fazer upload do vídeo",
            variant: "destructive"
          });
          return;
        } finally {
          setUploading(false);
        }
      }
      
      // Convert duration to minutes
      const durationMinutes = durationToMinutes(duration);
      
      // Create or update the training
      const trainingData = {
        title,
        description: description.trim() || null,
        author: author.trim() || null,
        video_type: videoType,
        video_url: finalVideoUrl,
        duration_min: durationMinutes,
        tags: tags.length > 0 ? tags : null,
        company_id: "00000000-0000-0000-0000-000000000000", // Default company ID
        visibility: visibility
      };
      
      if (id) {
        // Update existing training
        await updateTraining(id, trainingData);
        toast({
          title: "Treinamento atualizado",
          description: "O treinamento foi atualizado com sucesso"
        });
      } else {
        // Create new training
        const newTraining = await createTraining(trainingData);
        toast({
          title: "Treinamento criado",
          description: "O treinamento foi criado com sucesso"
        });
      }
      
      // Navigate back to trainings list
      navigate("/trainings");
      
    } catch (error) {
      console.error("Error saving training:", error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o treinamento",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto py-6 flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 text-taggui-primary animate-spin" />
          <span className="ml-2 text-lg">Carregando...</span>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          {id ? "Editar Treinamento" : "Novo Treinamento"}
        </h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Informações do Treinamento</CardTitle>
                <CardDescription>Preencha os detalhes do treinamento</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                      Título
                    </label>
                    <Input 
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Digite o título do treinamento"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                      Descrição
                    </label>
                    <Textarea 
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Descreva o conteúdo do treinamento (opcional)"
                      rows={4}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="author" className="block text-sm font-medium text-gray-700 mb-1">
                      Autor
                    </label>
                    <Input 
                      id="author"
                      value={author}
                      onChange={(e) => setAuthor(e.target.value)}
                      placeholder="Digite o nome do autor ou departamento"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Visibilidade
                    </label>
                    <div className="flex space-x-4">
                      <label className="flex items-center">
                        <input 
                          type="radio" 
                          value="PUBLIC" 
                          checked={visibility === "PUBLIC"}
                          onChange={() => setVisibility("PUBLIC")}
                          className="mr-2"
                        />
                        <span>Público</span>
                      </label>
                      <label className="flex items-center">
                        <input 
                          type="radio" 
                          value="PRIVATE" 
                          checked={visibility === "PRIVATE"}
                          onChange={() => setVisibility("PRIVATE")}
                          className="mr-2"
                        />
                        <span>Privado</span>
                      </label>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tipo de Vídeo
                    </label>
                    <div className="flex space-x-4">
                      <label className="flex items-center">
                        <input 
                          type="radio" 
                          value="YOUTUBE" 
                          checked={videoType === "YOUTUBE"}
                          onChange={() => setVideoType("YOUTUBE")}
                          className="mr-2"
                        />
                        <span>Link do YouTube</span>
                      </label>
                      <label className="flex items-center">
                        <input 
                          type="radio" 
                          value="UPLOAD" 
                          checked={videoType === "UPLOAD"}
                          onChange={() => setVideoType("UPLOAD")}
                          className="mr-2"
                        />
                        <span>Fazer upload</span>
                      </label>
                    </div>
                  </div>
                  
                  {videoType === "YOUTUBE" ? (
                    <div>
                      <label htmlFor="videoUrl" className="block text-sm font-medium text-gray-700 mb-1">
                        URL do Vídeo
                      </label>
                      <Input 
                        id="videoUrl"
                        value={videoUrl}
                        onChange={(e) => setVideoUrl(e.target.value)}
                        placeholder="Cole o link do vídeo do YouTube"
                        required={videoType === "YOUTUBE"}
                      />
                    </div>
                  ) : (
                    <div>
                      <label htmlFor="videoFile" className="block text-sm font-medium text-gray-700 mb-1">
                        Arquivo de Vídeo
                      </label>
                      <div className="border-2 border-dashed border-gray-300 rounded-md p-6">
                        <div className="flex flex-col items-center">
                          <Upload className="h-8 w-8 text-gray-400 mb-2" />
                          <p className="text-sm text-gray-500 mb-4">
                            Arraste e solte ou clique para selecionar um vídeo
                          </p>
                          <input
                            id="videoFile"
                            type="file"
                            accept="video/*"
                            onChange={handleFileChange}
                            className="hidden"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => document.getElementById("videoFile")?.click()}
                            disabled={uploading}
                          >
                            Selecionar Vídeo
                          </Button>
                          
                          {file && (
                            <div className="mt-4 w-full">
                              <div className="flex items-center justify-between">
                                <p className="text-sm font-medium text-gray-900 truncate max-w-xs">
                                  {file.name}
                                </p>
                                <button
                                  type="button"
                                  onClick={() => setFile(null)}
                                  className="text-gray-500 hover:text-gray-700"
                                  disabled={uploading}
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </div>
                              <p className="text-xs text-gray-500">
                                {(file.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                              
                              {uploading && (
                                <div className="mt-2">
                                  <div className="h-2 bg-gray-200 rounded-full mt-1">
                                    <div
                                      className="h-2 bg-taggui-primary rounded-full"
                                      style={{ width: `${uploadProgress}%` }}
                                    />
                                  </div>
                                  <p className="text-xs text-gray-500 mt-1">
                                    {uploadProgress}% enviado...
                                  </p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div>
                    <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">
                      Duração (minutos)
                    </label>
                    <Input 
                      id="duration"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      placeholder="10"
                      type="text"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Digite o número de minutos ou no formato MM:SS
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tags
                    </label>
                    <div className="flex items-center">
                      <Input 
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        placeholder="Adicionar tag"
                        className="flex-grow"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddTag();
                          }
                        }}
                      />
                      <Button
                        type="button"
                        onClick={handleAddTag}
                        className="ml-2"
                        variant="outline"
                        disabled={!newTag.trim()}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mt-2">
                      {tags.map((tag, index) => (
                        <div 
                          key={index}
                          className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm flex items-center"
                        >
                          {tag}
                          <button 
                            type="button"
                            onClick={() => handleRemoveTag(tag)}
                            className="ml-2 text-gray-500 hover:text-gray-700"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                      {tags.length === 0 && (
                        <p className="text-sm text-gray-500">Nenhuma tag adicionada</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="pt-4 flex justify-end space-x-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate("/trainings")}
                      disabled={submitting}
                    >
                      Cancelar
                    </Button>
                    <Button 
                      type="submit"
                      disabled={submitting || uploading}
                    >
                      {submitting ? (
                        <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Salvando...</>
                      ) : (
                        id ? "Atualizar" : "Criar"
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
          
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Dicas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 text-sm">
                  <div>
                    <h3 className="font-semibold mb-1">Título</h3>
                    <p className="text-gray-600">
                      Use um título claro e objetivo que descreva o conteúdo do treinamento.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-1">Descrição</h3>
                    <p className="text-gray-600">
                      Forneça uma descrição detalhada para que os colaboradores saibam o que esperar do treinamento.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-1">Autor</h3>
                    <p className="text-gray-600">
                      Indique quem criou o treinamento ou qual departamento é responsável por ele.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-1">Vídeos</h3>
                    <p className="text-gray-600">
                      Para links do YouTube, certifique-se de que o vídeo não está privado ou restrito. Para uploads, recomendamos vídeos com até 500MB.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-1">Tags</h3>
                    <p className="text-gray-600">
                      Adicione tags relevantes para facilitar a busca e categorização dos treinamentos.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default TrainingForm;
