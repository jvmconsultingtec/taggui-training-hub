import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Training = Database["public"]["Tables"]["trainings"]["Row"];
type User = Database["public"]["Tables"]["users"]["Row"];
type TrainingProgress = Database["public"]["Tables"]["training_progress"]["Row"];
type TrainingAssignment = Database["public"]["Tables"]["training_assignments"]["Row"];
type VideoType = Database["public"]["Enums"]["video_type"];
type Visibility = Database["public"]["Enums"]["visibility"];

// Trainings
export const fetchTrainings = async () => {
  try {
    console.log("Fetching trainings...");
    const { data, error } = await supabase
      .from("trainings")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (error) {
      console.error("Erro ao buscar treinamentos:", error);
      throw error;
    }
    
    console.log("Trainings fetched:", data);
    return data || [];
  } catch (error) {
    console.error("Erro capturado ao buscar treinamentos:", error);
    return [];
  }
};

export const fetchTrainingById = async (id: string) => {
  try {
    console.log("Fetching training by ID:", id);
    const { data, error } = await supabase
      .from("trainings")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    
    if (error) {
      console.error("Erro ao buscar treinamento por ID:", error);
      throw error;
    }
    
    console.log("Training fetched:", data);
    return data;
  } catch (error) {
    console.error("Erro capturado ao buscar treinamento por ID:", error);
    throw error;
  }
};

export const createTraining = async (training: Omit<Training, "id" | "created_at">) => {
  try {
    console.log("Creating training:", training);
    const { data, error } = await supabase
      .from("trainings")
      .insert(training)
      .select()
      .single();
    
    if (error) {
      console.error("Erro ao criar treinamento:", error);
      throw error;
    }
    
    console.log("Training created:", data);
    return data;
  } catch (error) {
    console.error("Erro capturado ao criar treinamento:", error);
    throw error;
  }
};

export const updateTraining = async (id: string, updates: Partial<Training>) => {
  try {
    console.log("Updating training:", id, updates);
    const { data, error } = await supabase
      .from("trainings")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    
    if (error) {
      console.error("Erro ao atualizar treinamento:", error);
      throw error;
    }
    
    console.log("Training updated:", data);
    return data;
  } catch (error) {
    console.error("Erro capturado ao atualizar treinamento:", error);
    throw error;
  }
};

export const deleteTraining = async (id: string) => {
  try {
    console.log("Deleting training:", id);
    const { error } = await supabase
      .from("trainings")
      .delete()
      .eq("id", id);
    
    if (error) {
      console.error("Erro ao deletar treinamento:", error);
      throw error;
    }
    console.log("Training deleted successfully");
  } catch (error) {
    console.error("Erro capturado ao deletar treinamento:", error);
    throw error;
  }
};

// Training Assignments
export const fetchAssignedTrainings = async (userId: string) => {
  try {
    console.log("Fetching assigned trainings for user:", userId);
    const { data, error } = await supabase
      .from("training_assignments")
      .select(`
        *,
        training:trainings (*)
      `)
      .eq("user_id", userId);
    
    if (error) {
      console.error("Erro ao buscar treinamentos atribuídos:", error);
      throw error;
    }
    
    console.log("Assigned trainings fetched:", data);
    return data || [];
  } catch (error) {
    console.error("Erro capturado ao buscar treinamentos atribuídos:", error);
    return [];
  }
};

export const assignTraining = async (trainingId: string, userIds: string[]) => {
  try {
    console.log("Assigning training:", trainingId, "to users:", userIds);
    const assignments = userIds.map(userId => ({
      training_id: trainingId,
      user_id: userId
    }));
    
    const { data, error } = await supabase
      .from("training_assignments")
      .insert(assignments)
      .select();
    
    if (error) {
      console.error("Erro ao atribuir treinamento:", error);
      throw error;
    }
    
    console.log("Training assigned:", data);
    return data;
  } catch (error) {
    console.error("Erro capturado ao atribuir treinamento:", error);
    throw error;
  }
};

// Training Progress
export const fetchTrainingProgress = async (trainingId: string, userId: string) => {
  try {
    console.log("Fetching training progress:", trainingId, userId);
    const { data, error } = await supabase
      .from("training_progress")
      .select("*")
      .eq("training_id", trainingId)
      .eq("user_id", userId)
      .maybeSingle();
    
    if (error) {
      console.error("Erro ao buscar progresso do treinamento:", error);
      throw error;
    }
    
    console.log("Training progress fetched:", data);
    return data;
  } catch (error) {
    console.error("Erro capturado ao buscar progresso do treinamento:", error);
    return null;
  }
};

export const updateTrainingProgress = async (trainingId: string, userId: string, progressPct: number, completed: boolean = false) => {
  try {
    console.log("Updating training progress:", trainingId, userId, progressPct, completed);
    // Primeiro tenta buscar se já existe um registro de progresso
    const existingProgress = await fetchTrainingProgress(trainingId, userId);
    
    // Prepara os dados para atualização ou criação
    const updates: Partial<TrainingProgress> = {
      progress_pct: progressPct,
      last_viewed_at: new Date().toISOString(),
    };
    
    if (completed) {
      updates.completed_at = new Date().toISOString();
    }
    
    try {
      // Se já existe um registro, atualize-o
      if (existingProgress) {
        const { data, error } = await supabase
          .from("training_progress")
          .update(updates)
          .eq("training_id", trainingId)
          .eq("user_id", userId)
          .select();
        
        if (error) throw error;
        console.log("Training progress updated:", data);
        return data;
      } 
      // Se não existe, crie um novo
      else {
        const { data, error } = await supabase
          .from("training_progress")
          .insert({
            training_id: trainingId,
            user_id: userId,
            ...updates
          })
          .select();
        
        if (error) throw error;
        console.log("Training progress created:", data);
        return data;
      }
    } catch (error: any) {
      console.error("Erro ao atualizar progresso:", error);
      throw error;
    }
  } catch (error) {
    console.error("Erro capturado ao atualizar progresso do treinamento:", error);
    throw error;
  }
};

// Users
export const fetchCompanyUsers = async () => {
  try {
    console.log("Fetching company users");
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .order("name");
    
    if (error) {
      console.error("Erro ao buscar usuários da empresa:", error);
      throw error;
    }
    
    console.log("Company users fetched:", data);
    return data || [];
  } catch (error) {
    console.error("Erro capturado ao buscar usuários:", error);
    return [];
  }
};

// Function to get the current user's profile with company_id
export const fetchCurrentUser = async () => {
  try {
    console.log("Fetching current user");
    // First get the authenticated user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.log("No authenticated user found");
      return null;
    }
    
    console.log("User from auth:", user);
    
    // Directly query the users table for the complete profile
    const { data: userProfile, error: profileError } = await supabase
      .from("users")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();
    
    if (profileError) {
      console.error("Error fetching user profile:", profileError);
      throw profileError;
    }
    
    if (!userProfile) {
      console.error("User profile not found in database");
      return null;
    }
    
    console.log("User profile from database:", userProfile);
    return userProfile;
  } catch (error) {
    console.error("Error fetching current user:", error);
    return null;
  }
};

// New function to fetch all training progress for a user
export const fetchUserTrainingProgress = async (userId: string) => {
  try {
    console.log("Fetching user training progress:", userId);
    const { data, error } = await supabase
      .from("training_progress")
      .select(`
        *,
        training:trainings (*)
      `)
      .eq("user_id", userId)
      .order("last_viewed_at", { ascending: false });
    
    if (error) {
      console.error("Erro ao buscar progresso de treinamentos do usuário:", error);
      throw error;
    }
    
    console.log("User training progress fetched:", data);
    return data || [];
  } catch (error) {
    console.error("Erro capturado ao buscar progresso de treinamentos:", error);
    return [];
  }
};

// Storage
export const uploadTrainingVideo = async (file: File) => {
  try {
    console.log("Uploading training video:", file.name);
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
    const filePath = `uploads/${fileName}`;
    
    const { error } = await supabase.storage
      .from('training_videos')
      .upload(filePath, file);
    
    if (error) {
      console.error("Erro ao fazer upload do vídeo:", error);
      throw error;
    }
    
    const { data } = supabase.storage
      .from('training_videos')
      .getPublicUrl(filePath);
    
    console.log("Video uploaded, public URL:", data.publicUrl);
    return data.publicUrl;
  } catch (error) {
    console.error("Erro capturado ao fazer upload do vídeo:", error);
    throw error;
  }
};
