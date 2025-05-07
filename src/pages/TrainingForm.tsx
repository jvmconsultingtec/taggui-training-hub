
import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { useAuth } from "@/hooks/useAuth";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { fetchTrainingById, createTraining, updateTraining, uploadTrainingVideo } from "@/services/api";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, Upload, Loader, Plus, X } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { Database } from "@/integrations/supabase/types";
import { supabase } from "@/integrations/supabase/client";

// Define the VideoType type from the Database types
type VideoType = Database["public"]["Enums"]["video_type"];
type Visibility = Database["public"]["Enums"]["visibility"];

const TrainingForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const isEditMode = Boolean(id);
  
  // State to hold the company ID
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [fetchingCompanyId, setFetchingCompanyId] = useState(true);

  // State to hold the form data
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    videoType: "YOUTUBE" as VideoType,
    videoUrl: "",
    durationMin: "10",
    tag: "",
    visibility: "PUBLIC" as Visibility
  });
  
  // Tags state
  const [tags, setTags] = useState<string[]>([]);
  
  // File state
  const [file, setFile] = useState<File | null>(null);
  
  // Loading states
  const [loading, setLoading] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Get company ID directly from user auth metadata
  useEffect(() => {
    const getCompanyId = async () => {
      try {
        setFetchingCompanyId(true);
        setError(null);
        
        if (!user) {
          setError("User not authenticated. Please login again.");
          setFetchingCompanyId(false);
          return;
        }

        // Get current user
        const { data: { user: currentUser }, error: authError } = await supabase.auth.getUser();
        
        if (authError || !currentUser) {
          console.error("Auth error:", authError);
          setError("Authentication error. Please login again.");
          setFetchingCompanyId(false);
          return;
        }

        // Get user profile from users table
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('company_id')
          .eq('id', currentUser.id)
          .single();
        
        if (userError) {
          console.error("Error fetching user data:", userError);
          
          // Fallback to user metadata
          if (currentUser.user_metadata?.company_id) {
            console.log("Using company ID from user metadata:", currentUser.user_metadata.company_id);
            setCompanyId(currentUser.user_metadata.company_id);
            setFetchingCompanyId(false);
            return;
          }
          
          setError("Could not get company ID. Please contact support.");
          setFetchingCompanyId(false);
          return;
        }
        
        if (!userData || !userData.company_id) {
          setError("User is not associated with any company.");
          setFetchingCompanyId(false);
          return;
        }
        
        console.log("Company ID found:", userData.company_id);
        setCompanyId(userData.company_id);
        setFetchingCompanyId(false);
      } catch (err: any) {
        console.error("Error in getCompanyId:", err);
        setError("Error: " + (err.message || "Unknown error"));
        setFetchingCompanyId(false);
      }
    };
    
    getCompanyId();
  }, [user]);
  
  // Fetch training if in edit mode
  useEffect(() => {
    if (isEditMode && id) {
      const getTraining = async () => {
        try {
          setLoading(true);
          setError(null);
          
          const training = await fetchTrainingById(id);
          
          if (training) {
            setFormData({
              title: training.title || "",
              description: training.description || "",
              videoType: training.video_type as VideoType || "YOUTUBE",
              videoUrl: training.video_url || "",
              durationMin: String(training.duration_min) || "10",
              tag: "",
              visibility: training.visibility as Visibility || "PUBLIC"
            });
            
            if (training.tags && Array.isArray(training.tags)) {
              setTags(training.tags);
            }
          } else {
            setError("Training not found");
          }
        } catch (err: any) {
          console.error("Error fetching training:", err);
          setError(`Error loading training: ${err.message || "Unknown error"}`);
        } finally {
          setLoading(false);
        }
      };
      
      getTraining();
    }
  }, [id, isEditMode]);
  
  // Handle text field changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Add tag to list
  const handleAddTag = () => {
    if (formData.tag.trim() && !tags.includes(formData.tag.trim())) {
      setTags(prev => [...prev, formData.tag.trim()]);
      setFormData(prev => ({ ...prev, tag: "" }));
    }
  };
  
  // Remove tag from list
  const handleRemoveTag = (tagToRemove: string) => {
    setTags(prev => prev.filter(tag => tag !== tagToRemove));
  };
  
  // Handle radio button changes
  const handleRadioChange = (value: string) => {
    setFormData(prev => ({ ...prev, videoType: value as VideoType }));
    if (value === "YOUTUBE") {
      setFile(null);
    }
  };
  
  // Handle visibility change
  const handleVisibilityChange = (value: string) => {
    setFormData(prev => ({ ...prev, visibility: value as Visibility }));
  };
  
  // Handle file changes
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSubmitting(true);
      setError(null);
      setUploadProgress(0);
      
      if (!user) {
        throw new Error("User not authenticated. Please login again.");
      }
      
      if (!companyId) {
        throw new Error("Company ID not available. Please try refreshing the page.");
      }
      
      // Validate form
      if (!formData.title) {
        throw new Error("Title is required");
      }
      
      if (formData.videoType === "YOUTUBE" && !formData.videoUrl) {
        throw new Error("YouTube URL is required");
      }
      
      if (formData.videoType === "UPLOAD" && !file && !isEditMode) {
        throw new Error("You must upload a video");
      }
      
      // Upload file if needed
      let videoUrl = formData.videoUrl;
      if (file && formData.videoType === "UPLOAD") {
        try {
          // Update progress
          const progressInterval = setInterval(() => {
            setUploadProgress(prev => Math.min(prev + 10, 90));
          }, 500);
          
          videoUrl = await uploadTrainingVideo(file);
          clearInterval(progressInterval);
          setUploadProgress(100);
        } catch (err: any) {
          throw new Error(`Error uploading video: ${err.message || "Unknown error"}`);
        }
      }
      
      // Prepare training data
      const trainingData = {
        title: formData.title,
        description: formData.description,
        video_type: formData.videoType,
        video_url: videoUrl,
        duration_min: parseInt(formData.durationMin, 10) || 10,
        tags: tags,
        company_id: companyId,
        visibility: formData.visibility
      };
      
      console.log("Submitting training data:", trainingData);
      
      // Create or update training
      if (isEditMode && id) {
        await updateTraining(id, trainingData);
        toast({
          title: "Training updated",
          description: "The training was updated successfully"
        });
      } else {
        await createTraining(trainingData);
        toast({
          title: "Training created",
          description: "The training was created successfully"
        });
      }
      
      // Navigate back
      navigate("/trainings");
      
    } catch (err: any) {
      console.error("Error submitting training:", err);
      setError(`Error: ${err.message || "Unknown error"}`);
      toast({
        title: "Error",
        description: err.message || "An error occurred while saving the training",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Show loading state during fetch
  if (fetchingCompanyId) {
    return (
      <Layout>
        <div className="container mx-auto py-6">
          <div className="flex justify-center py-12">
            <Loader className="h-8 w-8 animate-spin text-primary" />
            <p className="ml-2">Loading company information...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto py-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate(-1)} 
            className="p-0 h-8 w-8"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">
              {isEditMode ? "Edit Training" : "New Training"}
            </h1>
            <p className="text-muted-foreground">
              {isEditMode 
                ? "Update the training information" 
                : "Create a new training for your team"
              }
            </p>
          </div>
        </div>
        
        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <Alert variant="destructive" className="mb-6">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
            <div className="mt-4">
              <Button onClick={() => navigate('/dashboard')} variant="outline">
                Go back to Dashboard
              </Button>
            </div>
          </Alert>
        ) : (
          <Card>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input 
                    id="title"
                    name="title"
                    placeholder="Training title" 
                    value={formData.title}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea 
                    id="description"
                    name="description"
                    placeholder="Describe the training"
                    rows={4}
                    value={formData.description}
                    onChange={handleChange}
                  />
                </div>
                
                {/* Video Type */}
                <div className="space-y-2">
                  <Label>Video Type</Label>
                  <RadioGroup 
                    value={formData.videoType}
                    onValueChange={handleRadioChange}
                    className="flex flex-col space-y-1"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="YOUTUBE" id="video-youtube" />
                      <Label htmlFor="video-youtube">YouTube</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="UPLOAD" id="video-upload" />
                      <Label htmlFor="video-upload">File upload</Label>
                    </div>
                  </RadioGroup>
                </div>
                
                {/* YouTube URL or File Upload based on selected type */}
                {formData.videoType === "YOUTUBE" ? (
                  <div className="space-y-2">
                    <Label htmlFor="videoUrl">YouTube URL</Label>
                    <Input 
                      id="videoUrl"
                      name="videoUrl"
                      placeholder="https://youtube.com/watch?v=..." 
                      value={formData.videoUrl}
                      onChange={handleChange}
                      required={formData.videoType === "YOUTUBE"}
                    />
                    <p className="text-sm text-muted-foreground">
                      Paste the complete YouTube video URL
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="videoFile">Video file</Label>
                    <div className="flex items-center space-x-2">
                      <Input 
                        id="videoFile"
                        type="file"
                        accept="video/*"
                        onChange={handleFileChange}
                        className={isEditMode ? "w-3/4" : "w-full"}
                      />
                      {isEditMode && (
                        <div className="text-sm text-muted-foreground">
                          {file ? file.name : "Keep current video"}
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Accepted formats: MP4, WebM. Maximum size: 100MB.
                    </p>
                    
                    {uploadProgress > 0 && (
                      <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mt-2">
                        <div 
                          className="bg-primary h-2.5 rounded-full" 
                          style={{ width: `${uploadProgress}%` }}
                        ></div>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Duration */}
                <div className="space-y-2">
                  <Label htmlFor="durationMin">Duration (minutes)</Label>
                  <Input 
                    id="durationMin"
                    name="durationMin"
                    type="number"
                    min="1"
                    value={formData.durationMin}
                    onChange={handleChange}
                    className="max-w-[200px]"
                  />
                </div>
                
                {/* Tags */}
                <div className="space-y-2">
                  <Label htmlFor="tag">Tags</Label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-sm py-1 px-3">
                        {tag}
                        <button 
                          type="button" 
                          onClick={() => handleRemoveTag(tag)} 
                          className="ml-2 text-muted-foreground hover:text-foreground"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Input 
                      id="tag"
                      name="tag"
                      placeholder="Add tag" 
                      value={formData.tag}
                      onChange={handleChange}
                      className="flex-1"
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      onClick={handleAddTag}
                      disabled={!formData.tag.trim()}
                    >
                      <Plus className="h-4 w-4 mr-1" /> Add
                    </Button>
                  </div>
                </div>
                
                {/* Visibility */}
                <div className="space-y-2">
                  <Label>Visibility</Label>
                  <RadioGroup 
                    value={formData.visibility}
                    onValueChange={handleVisibilityChange}
                    className="flex flex-col space-y-1"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="PUBLIC" id="visibility-public" />
                      <Label htmlFor="visibility-public">Public (all team members)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="PRIVATE" id="visibility-private" />
                      <Label htmlFor="visibility-private">Private (selected team members only)</Label>
                    </div>
                  </RadioGroup>
                </div>
                
                {/* Submit buttons */}
                <div className="flex items-center justify-end gap-2 pt-4">
                  <Link to="/trainings">
                    <Button type="button" variant="outline">
                      Cancel
                    </Button>
                  </Link>
                  <Button type="submit" disabled={submitting || !companyId}>
                    {submitting && <Loader className="mr-2 h-4 w-4 animate-spin" />}
                    {isEditMode ? "Save changes" : "Create training"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default TrainingForm;
