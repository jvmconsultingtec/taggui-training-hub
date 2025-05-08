import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Training = Database["public"]["Tables"]["trainings"]["Row"];
type User = Database["public"]["Tables"]["users"]["Row"];
type TrainingProgress = Database["public"]["Tables"]["training_progress"]["Row"];
type TrainingAssignment = Database["public"]["Tables"]["training_assignments"]["Row"];
type VideoType = Database["public"]["Enums"]["video_type"];
type Visibility = Database["public"]["Enums"]["visibility"];

// Helper function to verify authentication
const checkAuth = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    throw new Error("No authenticated session found");
  }
  return session;
};

// Helper function for basic error handling
const handleError = (error: any, message: string) => {
  console.error(message, error);
  throw error;
};

// Users
export const fetchCurrentUser = async () => {
  try {
    console.log("Fetching current user data");
    
    // Ensure we have a valid session before making the request
    await checkAuth();
    
    // Get the current authenticated user from auth
    const { data: { user: authUser } } = await supabase.auth.getUser();
    
    if (!authUser) {
      console.log("No authenticated user found");
      return null;
    }
    
    console.log("Auth user found:", authUser.id);
    
    // Direct query to users table with explicit ID
    const { data: userProfile, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", authUser.id)
      .single();
    
    if (error) {
      console.error("Error fetching user profile:", error);
      // Try to use auth metadata as fallback
      if (authUser.user_metadata) {
        return {
          id: authUser.id,
          email: authUser.email || "",
          name: authUser.user_metadata.name || authUser.email?.split("@")[0] || "",
          company_id: authUser.user_metadata.company_id || "00000000-0000-0000-0000-000000000000",
          role: authUser.user_metadata.role || "COLLABORATOR"
        };
      }
      return null;
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
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    handleError(error, "Error fetching company users:");
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
    handleError(error, "Error fetching trainings:");
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
    const { error } = await supabase
      .from("trainings")
      .delete()
      .eq("id", id);
    
    if (error) throw error;
  } catch (error) {
    handleError(error, "Error deleting training:");
    throw error;
  }
};

// Training Assignments
export const fetchAssignedTrainings = async (userId: string) => {
  try {
    // Verify we have an authenticated session before making the request
    await checkAuth();
    
    const { data, error } = await supabase
      .from("training_assignments")
      .select(`
        *,
        training:trainings (*)
      `)
      .eq("user_id", userId);
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    handleError(error, "Error fetching assigned trainings:");
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
    return data;
  } catch (error) {
    handleError(error, "Error fetching training progress:");
    return null;
  }
};

export const updateTrainingProgress = async (trainingId: string, userId: string, progressPct: number, completed: boolean = false) => {
  try {
    // Check if progress record exists
    const existingProgress = await fetchTrainingProgress(trainingId, userId);
    
    // Prepare data for update or create
    const updates = {
      progress_pct: progressPct,
      last_viewed_at: new Date().toISOString(),
      ...(completed ? { completed_at: new Date().toISOString() } : {})
    };
    
    if (existingProgress) {
      // Update existing record
      const { data, error } = await supabase
        .from("training_progress")
        .update(updates)
        .eq("training_id", trainingId)
        .eq("user_id", userId)
        .select();
      
      if (error) throw error;
      return data;
    } else {
      // Create new record
      const { data, error } = await supabase
        .from("training_progress")
        .insert({
          training_id: trainingId,
          user_id: userId,
          ...updates
        })
        .select();
      
      if (error) throw error;
      return data;
    }
  } catch (error) {
    handleError(error, "Error updating training progress:");
    throw error;
  }
};

export const fetchUserTrainingProgress = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from("training_progress")
      .select(`
        *,
        training:trainings (*)
      `)
      .eq("user_id", userId)
      .order("last_viewed_at", { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    handleError(error, "Error fetching user training progress:");
    return [];
  }
};

// Storage
export const uploadTrainingVideo = async (file: File) => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
    const filePath = `uploads/${fileName}`;
    
    const { error } = await supabase.storage
      .from('training_videos')
      .upload(filePath, file);
    
    if (error) throw error;
    
    const { data } = supabase.storage
      .from('training_videos')
      .getPublicUrl(filePath);
    
    return data.publicUrl;
  } catch (error) {
    handleError(error, "Error uploading training video:");
    throw error;
  }
};
