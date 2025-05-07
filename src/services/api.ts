
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Training = Database["public"]["Tables"]["trainings"]["Row"];
type User = Database["public"]["Tables"]["users"]["Row"];
type TrainingProgress = Database["public"]["Tables"]["training_progress"]["Row"];
type TrainingAssignment = Database["public"]["Tables"]["training_assignments"]["Row"];

// Trainings
export const fetchTrainings = async () => {
  const { data, error } = await supabase
    .from("trainings")
    .select("*")
    .order("created_at", { ascending: false });
  
  if (error) {
    throw error;
  }
  
  return data;
};

export const fetchTrainingById = async (id: string) => {
  const { data, error } = await supabase
    .from("trainings")
    .select("*")
    .eq("id", id)
    .single();
  
  if (error) {
    throw error;
  }
  
  return data;
};

export const createTraining = async (training: Omit<Training, "id" | "created_at">) => {
  const { data, error } = await supabase
    .from("trainings")
    .insert(training)
    .select()
    .single();
  
  if (error) {
    throw error;
  }
  
  return data;
};

export const updateTraining = async (id: string, updates: Partial<Training>) => {
  const { data, error } = await supabase
    .from("trainings")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  
  if (error) {
    throw error;
  }
  
  return data;
};

export const deleteTraining = async (id: string) => {
  const { error } = await supabase
    .from("trainings")
    .delete()
    .eq("id", id);
  
  if (error) {
    throw error;
  }
};

// Training Assignments
export const fetchAssignedTrainings = async (userId: string) => {
  const { data, error } = await supabase
    .from("training_assignments")
    .select(`
      *,
      training:trainings (*)
    `)
    .eq("user_id", userId);
  
  if (error) {
    throw error;
  }
  
  return data;
};

export const assignTraining = async (trainingId: string, userIds: string[]) => {
  const assignments = userIds.map(userId => ({
    training_id: trainingId,
    user_id: userId
  }));
  
  const { data, error } = await supabase
    .from("training_assignments")
    .insert(assignments)
    .select();
  
  if (error) {
    throw error;
  }
  
  return data;
};

// Training Progress
export const fetchTrainingProgress = async (trainingId: string, userId: string) => {
  const { data, error } = await supabase
    .from("training_progress")
    .select("*")
    .eq("training_id", trainingId)
    .eq("user_id", userId)
    .single();
  
  if (error && error.code !== "PGRST116") { // Not found is okay
    throw error;
  }
  
  return data;
};

export const updateTrainingProgress = async (trainingId: string, userId: string, progressPct: number, completed: boolean = false) => {
  const updates: Partial<TrainingProgress> = {
    progress_pct: progressPct,
    last_viewed_at: new Date().toISOString(),
  };
  
  if (completed) {
    updates.completed_at = new Date().toISOString();
  }
  
  const { data, error } = await supabase
    .from("training_progress")
    .update(updates)
    .eq("training_id", trainingId)
    .eq("user_id", userId)
    .select();
  
  if (error) {
    throw error;
  }
  
  return data;
};

// Users
export const fetchCompanyUsers = async () => {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .order("name");
  
  if (error) {
    throw error;
  }
  
  return data;
};

// Storage
export const uploadTrainingVideo = async (file: File) => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
  const filePath = `uploads/${fileName}`;
  
  const { error } = await supabase.storage
    .from('training_videos')
    .upload(filePath, file);
  
  if (error) {
    throw error;
  }
  
  const { data } = supabase.storage
    .from('training_videos')
    .getPublicUrl(filePath);
  
  return data.publicUrl;
};
