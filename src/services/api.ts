import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { toast } from "@/hooks/use-toast";

type Training = Database["public"]["Tables"]["trainings"]["Row"];
type User = Database["public"]["Tables"]["users"]["Row"];
type TrainingProgress = Database["public"]["Tables"]["training_progress"]["Row"];
type TrainingAssignment = Database["public"]["Tables"]["training_assignments"]["Row"];
type VideoType = Database["public"]["Enums"]["video_type"];
type Visibility = Database["public"]["Enums"]["visibility"];

// Helper function to verify authentication
const checkAuth = async () => {
  const { data, error } = await supabase.auth.getSession();
  
  if (error) {
    console.error("Auth check failed:", error);
    throw new Error("Authentication required");
  }
  
  if (!data.session) {
    console.error("No session found");
    throw new Error("Authentication required");
  }
  
  console.log("Auth check passed, user:", data.session.user.id);
  return data.session;
};

// Helper function for basic error handling
const handleError = (error: any, message: string) => {
  console.error(`${message} Details:`, error);
  
  // Show toast with error message
  toast({
    title: "Erro",
    description: error instanceof Error ? error.message : "Ocorreu um erro inesperado",
    variant: "destructive"
  });
  
  throw error;
};

// Helper function to create the training_videos bucket if it doesn't exist
export const ensureTrainingVideosBucket = async () => {
  try {
    // Check if bucket exists
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error("Error checking buckets:", bucketsError);
      return;
    }
    
    console.log("Available buckets:", buckets);
    
    // Check for both variations of the bucket name
    const bucketExists = buckets?.some(bucket => 
      bucket.name === 'training_videos' || bucket.name === 'training-videos'
    );
    
    if (!bucketExists) {
      // Create bucket - try with hyphen format as that seems to be working better
      console.log("Bucket not found, creating it...");
      const { data, error } = await supabase.storage.createBucket('training-videos', {
        public: true,
        fileSizeLimit: 52428800, // 50MB
      });
      
      if (error) {
        console.error("Error creating bucket:", error);
      } else {
        console.log("Created bucket:", data);
      }
    } else {
      console.log("Bucket already exists");
      
      // Update bucket to ensure it's public
      try {
        // Try both naming formats since we're not sure which one exists
        const { error: updateError } = await supabase.storage.updateBucket('training-videos', {
          public: true,
          fileSizeLimit: 52428800, // 50MB
        });
        
        if (updateError) {
          console.error("Error updating bucket with hyphen to public:", updateError);
          
          // Try with underscore naming
          const { error: updateError2 } = await supabase.storage.updateBucket('training_videos', {
            public: true,
            fileSizeLimit: 52428800, // 50MB
          });
          
          if (updateError2) {
            console.error("Error updating bucket with underscore to public:", updateError2);
          } else {
            console.log("Updated training_videos bucket to be public");
          }
        } else {
          console.log("Updated training-videos bucket to be public");
        }
      } catch (err) {
        console.error("Error updating bucket:", err);
      }
    }
  } catch (error) {
    console.error("Error checking/creating bucket:", error);
  }
};

// Users
export const fetchCurrentUser = async () => {
  try {
    console.log("Fetching current user data");
    
    // Get the current authenticated user from auth
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error("No authenticated session:", error);
      return null;
    }
    
    const authUser = data.session?.user;
    if (!authUser) {
      console.log("No authenticated user found in session");
      return null;
    }
    
    console.log("Auth user found:", authUser.id);
    
    // Look for the user profile
    const { data: userProfile, error: profileError } = await supabase
      .from("users")
      .select("*")
      .eq("id", authUser.id)
      .maybeSingle();
    
    if (profileError) {
      console.error("Error fetching user profile:", profileError);
      
      // Create a basic profile from auth metadata as fallback
      return {
        id: authUser.id,
        email: authUser.email || "",
        name: authUser.user_metadata?.name || authUser.email?.split("@")[0] || "User",
        company_id: authUser.user_metadata?.company_id || "00000000-0000-0000-0000-000000000000",
        role: authUser.user_metadata?.role || "COLLABORATOR"
      };
    }
    
    console.log("User profile found:", userProfile);
    return userProfile;
  } catch (error) {
    console.error("Error in fetchCurrentUser:", error);
    return null;
  }
};

export const fetchCompanyUsers = async () => {
  try {
    // Ensure we have a valid session before making the request
    await checkAuth();
    
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .order("name");
    
    if (error) {
      handleError(error, "Error fetching company users:");
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error("Error in fetchCompanyUsers:", error);
    return [];
  }
};

// Trainings
export const fetchTrainings = async () => {
  try {
    // Ensure we have a valid session before making the request
    await checkAuth();
    
    console.log("Fetching trainings");

    const { data, error } = await supabase
      .from("trainings")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (error) {
      console.error("Error fetching trainings:", error);
      throw error;
    }
    
    console.log("Trainings fetched:", data?.length || 0);
    return data || [];
  } catch (error) {
    console.error("Error in fetchTrainings:", error);
    toast({
      title: "Erro ao carregar treinamentos",
      description: error instanceof Error ? error.message : "Erro desconhecido",
      variant: "destructive"
    });
    return [];
  }
};

export const fetchTrainingById = async (id: string) => {
  try {
    // Verify we have an authenticated session before making the request
    await checkAuth();
    
    const { data, error } = await supabase
      .from("trainings")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    
    if (error) throw error;
    return data;
  } catch (error) {
    handleError(error, "Error fetching training by ID:");
    throw error;
  }
};

export const createTraining = async (training: Omit<Training, "id" | "created_at">) => {
  try {
    const { data, error } = await supabase
      .from("trainings")
      .insert(training)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    handleError(error, "Error creating training:");
    throw error;
  }
};

export const updateTraining = async (id: string, updates: Partial<Training>) => {
  try {
    const { data, error } = await supabase
      .from("trainings")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    handleError(error, "Error updating training:");
    throw error;
  }
};

export const deleteTraining = async (id: string) => {
  try {
    // First, check if the training exists
    const { data: training, error: fetchError } = await supabase
      .from("trainings")
      .select("*")
      .eq("id", id)
      .single();
      
    if (fetchError) {
      throw fetchError;
    }
    
    if (!training) {
      throw new Error("Treinamento não encontrado");
    }
    
    // Delete any progress records associated with this training
    const { error: progressDeleteError } = await supabase
      .from("training_progress")
      .delete()
      .eq("training_id", id);
      
    if (progressDeleteError) {
      console.error("Error deleting associated progress:", progressDeleteError);
      // Continue with deletion even if progress removal fails
    }
    
    // Delete any assignments associated with this training
    const { error: assignmentDeleteError } = await supabase
      .from("training_assignments")
      .delete()
      .eq("training_id", id);
      
    if (assignmentDeleteError) {
      console.error("Error deleting associated assignments:", assignmentDeleteError);
      // Continue with deletion even if assignment removal fails
    }
    
    // Delete the training itself
    const { error } = await supabase
      .from("trainings")
      .delete()
      .eq("id", id);
    
    if (error) throw error;
    
    toast({
      title: "Treinamento excluído",
      description: "O treinamento foi excluído com sucesso",
    });
    
    return true;
  } catch (error) {
    handleError(error, "Error deleting training:");
    return false;
  }
};

// Training Assignments
export const fetchAssignedTrainings = async (userId: string) => {
  try {
    // Verify we have an authenticated session before making the request
    await checkAuth();
    
    console.log(`Fetching assigned trainings for user ${userId}`);
    
    const { data, error } = await supabase
      .from("training_assignments")
      .select(`
        *,
        training:trainings (*)
      `)
      .eq("user_id", userId);
    
    if (error) {
      console.error("Error fetching assigned trainings:", error);
      throw error;
    }
    
    console.log("Assigned trainings fetched:", data?.length || 0);
    return data || [];
  } catch (error) {
    console.error("Error in fetchAssignedTrainings:", error);
    toast({
      title: "Erro ao carregar treinamentos",
      description: error instanceof Error ? error.message : "Erro desconhecido",
      variant: "destructive"
    });
    return [];
  }
};

export const assignTraining = async (trainingId: string, userIds: string[]) => {
  try {
    const assignments = userIds.map(userId => ({
      training_id: trainingId,
      user_id: userId
    }));
    
    const { data, error } = await supabase
      .from("training_assignments")
      .insert(assignments)
      .select();
    
    if (error) throw error;
    return data;
  } catch (error) {
    handleError(error, "Error assigning training:");
    throw error;
  }
};

// Training Progress
export const fetchTrainingProgress = async (trainingId: string, userId: string) => {
  try {
    // Verify we have an authenticated session before making the request
    await checkAuth();
    
    const { data, error } = await supabase
      .from("training_progress")
      .select("*")
      .eq("training_id", trainingId)
      .eq("user_id", userId)
      .maybeSingle();
    
    if (error) throw error;
    
    // If no progress record exists, create an initial one with zero progress
    if (!data) {
      try {
        console.log("No progress record found, creating initial record");
        const { data: newProgress, error: createError } = await supabase
          .from("training_progress")
          .insert({
            training_id: trainingId,
            user_id: userId,
            progress_pct: 0,
            last_viewed_at: new Date().toISOString()
          })
          .select()
          .single();
        
        if (createError) throw createError;
        return newProgress;
      } catch (createErr) {
        console.error("Error creating initial progress record:", createErr);
        return null;
      }
    }
    
    return data;
  } catch (error) {
    handleError(error, "Error fetching training progress:");
    return null;
  }
};

export const updateTrainingProgress = async (trainingId: string, userId: string, progressPct: number, completed: boolean = false) => {
  try {
    console.log(`Updating progress for training ${trainingId}, user ${userId} to ${progressPct}%, completed: ${completed}`);
    
    // Check if progress record exists
    const { data: existingProgress, error: checkError } = await supabase
      .from("training_progress")
      .select("*")
      .eq("training_id", trainingId)
      .eq("user_id", userId)
      .maybeSingle();
    
    if (checkError) {
      console.error("Error checking for existing progress:", checkError);
    }
    
    // Prepare data for update or create
    const updates: any = {
      progress_pct: progressPct,
      last_viewed_at: new Date().toISOString(),
    };
    
    // Only set completed_at if the status is being changed to completed
    // and it wasn't already completed
    if (completed && !existingProgress?.completed_at) {
      updates.completed_at = new Date().toISOString();
    }
    
    // If switching from completed to another status, remove the completed_at date
    if (!completed && existingProgress?.completed_at) {
      updates.completed_at = null;
    }
    
    // Use upsert to update or create the progress record
    const { data, error } = await supabase
      .from("training_progress")
      .upsert({
        id: existingProgress?.id || undefined,
        training_id: trainingId,
        user_id: userId,
        ...updates
      })
      .select();
    
    if (error) {
      console.error("Error upserting training progress:", error);
      throw error;
    }
    
    console.log("Progress updated successfully:", data);
    return data;
  } catch (error) {
    handleError(error, "Error updating training progress:");
    throw error;
  }
};

export const fetchUserTrainingProgress = async (userId: string) => {
  try {
    // Verify we have an authenticated session before making the request
    await checkAuth();
    
    const { data, error } = await supabase
      .from("training_progress")
      .select(`
        *,
        training:trainings (*)
      `)
      .eq("user_id", userId);
    
    if (error) throw error;
    
    console.log("User training progress fetched:", data?.length || 0);
    return data || [];
  } catch (error) {
    handleError(error, "Error fetching user training progress:");
    return [];
  }
};

// Storage
export const uploadTrainingVideo = async (file: File) => {
  try {
    console.log("Starting video upload...");
    
    // Ensure the bucket exists
    await ensureTrainingVideosBucket();
    
    const fileExt = file.name.split('.').pop();
    const fileName = `uploads/${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
    
    console.log("Upload path:", fileName, "File size:", file.size);
    
    // For large files, use a chunked upload approach
    if (file.size > 5 * 1024 * 1024) { // For files larger than 5MB
      console.log("Using chunked upload for large file");
      
      const chunkSize = 5 * 1024 * 1024; // 5MB chunks
      const chunks = Math.ceil(file.size / chunkSize);
      let uploadedChunks = 0;
      
      for (let i = 0; i < chunks; i++) {
        const start = i * chunkSize;
        const end = Math.min(file.size, start + chunkSize);
        const chunk = file.slice(start, end);
        
        const uploadOptions = i > 0 ? { upsert: true } : undefined;
        
        console.log(`Uploading chunk ${i+1}/${chunks} (${start}-${end} of ${file.size})`);
        
        // Try upload with hyphen format first
        const { error: uploadError } = await supabase.storage
          .from('training-videos')
          .upload(fileName, chunk, uploadOptions);
          
        if (uploadError) {
          console.error(`Error uploading chunk ${i+1} to training-videos:`, uploadError);
          
          // Try with underscore format as fallback
          const { error: uploadError2 } = await supabase.storage
            .from('training_videos')
            .upload(fileName, chunk, uploadOptions);
            
          if (uploadError2) {
            console.error(`Error uploading chunk ${i+1} to training_videos:`, uploadError2);
            throw uploadError2;
          }
        }
        
        uploadedChunks++;
        console.log(`Chunk ${uploadedChunks}/${chunks} uploaded successfully`);
      }
      
      console.log("All chunks uploaded successfully");
    } else {
      // For smaller files, use standard upload - try hyphen format first
      const { data, error } = await supabase.storage
        .from('training-videos')
        .upload(fileName, file);
      
      if (error) {
        console.error("Upload error with hyphen format:", error);
        
        // Try with underscore format as fallback
        const { data: data2, error: error2 } = await supabase.storage
          .from('training_videos')
          .upload(fileName, file);
        
        if (error2) {
          console.error("Upload error with underscore format:", error2);
          throw error2;
        }
        
        console.log("Upload successful with underscore format:", data2);
      } else {
        console.log("Upload successful with hyphen format:", data);
      }
    }
    
    // Generate the correct public URL format - with hyphen
    const publicUrl = `https://deudqfjiieufqenzfclv.supabase.co/storage/v1/object/public/training-videos/${fileName}`;
    
    console.log("Generated public URL with hyphen:", publicUrl);
    
    // Also try getting the URL through the official method to confirm it works
    try {
      const { data: urlData } = supabase.storage
        .from('training-videos')
        .getPublicUrl(fileName);
      
      console.log("Official public URL method (hyphen):", urlData.publicUrl);
    } catch (err) {
      console.error("Error getting public URL with hyphen format:", err);
      
      try {
        // Try underscore format
        const { data: urlData2 } = supabase.storage
          .from('training_videos')
          .getPublicUrl(fileName);
        
        console.log("Official public URL method (underscore):", urlData2.publicUrl);
      } catch (err2) {
        console.error("Error getting public URL with underscore format:", err2);
      }
    }
    
    // Return the URL that matches the required format
    return publicUrl;
  } catch (error) {
    handleError(error, "Error uploading training video:");
    throw error;
  }
};

// Call ensureTrainingVideosBucket on module import to make sure the bucket exists
ensureTrainingVideosBucket();
