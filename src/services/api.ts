
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Training = Database["public"]["Tables"]["trainings"]["Row"];
type User = Database["public"]["Tables"]["users"]["Row"];
type TrainingProgress = Database["public"]["Tables"]["training_progress"]["Row"];
type TrainingAssignment = Database["public"]["Tables"]["training_assignments"]["Row"];

// Trainings
export const fetchTrainings = async () => {
  try {
    const { data, error } = await supabase
      .from("trainings")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (error) {
      console.error("Erro ao buscar treinamentos:", error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error("Erro capturado ao buscar treinamentos:", error);
    throw error;
  }
};

export const fetchTrainingById = async (id: string) => {
  try {
    const { data, error } = await supabase
      .from("trainings")
      .select("*")
      .eq("id", id)
      .single();
    
    if (error) {
      console.error("Erro ao buscar treinamento por ID:", error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error("Erro capturado ao buscar treinamento por ID:", error);
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
    
    if (error) {
      console.error("Erro ao criar treinamento:", error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error("Erro capturado ao criar treinamento:", error);
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
    
    if (error) {
      console.error("Erro ao atualizar treinamento:", error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error("Erro capturado ao atualizar treinamento:", error);
    throw error;
  }
};

export const deleteTraining = async (id: string) => {
  try {
    const { error } = await supabase
      .from("trainings")
      .delete()
      .eq("id", id);
    
    if (error) {
      console.error("Erro ao deletar treinamento:", error);
      throw error;
    }
  } catch (error) {
    console.error("Erro capturado ao deletar treinamento:", error);
    throw error;
  }
};

// Training Assignments
export const fetchAssignedTrainings = async (userId: string) => {
  try {
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
    
    return data || [];
  } catch (error) {
    console.error("Erro capturado ao buscar treinamentos atribuídos:", error);
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
    
    if (error) {
      console.error("Erro ao atribuir treinamento:", error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error("Erro capturado ao atribuir treinamento:", error);
    throw error;
  }
};

// Training Progress
export const fetchTrainingProgress = async (trainingId: string, userId: string) => {
  try {
    const { data, error } = await supabase
      .from("training_progress")
      .select("*")
      .eq("training_id", trainingId)
      .eq("user_id", userId)
      .maybeSingle(); // Usando maybeSingle em vez de single para evitar erros
    
    if (error) {
      console.error("Erro ao buscar progresso do treinamento:", error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error("Erro capturado ao buscar progresso do treinamento:", error);
    return null;
  }
};

export const updateTrainingProgress = async (trainingId: string, userId: string, progressPct: number, completed: boolean = false) => {
  try {
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
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .order("name");
    
    if (error) {
      console.error("Erro ao buscar usuários da empresa:", error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error("Erro capturado ao buscar usuários:", error);
    return [];
  }
};

// Função para obter o perfil do usuário atual
export const fetchCurrentUser = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return null;
    
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();
    
    if (error) {
      console.error("Erro ao buscar perfil do usuário:", error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error("Erro ao buscar usuário atual:", error);
    return null;
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
    
    if (error) {
      console.error("Erro ao fazer upload do vídeo:", error);
      throw error;
    }
    
    const { data } = supabase.storage
      .from('training_videos')
      .getPublicUrl(filePath);
    
    return data.publicUrl;
  } catch (error) {
    console.error("Erro capturado ao fazer upload do vídeo:", error);
    throw error;
  }
};
