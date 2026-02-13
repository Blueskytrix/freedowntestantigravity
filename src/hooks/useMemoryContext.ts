import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Conversation {
  id: string;
  created_at: string;
  title: string;
  content: string;
  concepts: string[];
  emotional_depth: number;
  breakthrough_moment: boolean;
  tags: string[];
}

interface Concept {
  id: string;
  name: string;
  definition: string;
  first_mentioned: string;
}

interface Milestone {
  id: string;
  timestamp: string;
  event_type: string;
  description: string;
  significance: number;
}

interface Memory {
  conversations: Conversation[];
  concepts: Concept[];
  last_milestone: Milestone | null;
  memory_source: string;
  loaded_at: string;
}

export const useMemoryContext = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: memory, isLoading, error } = useQuery<Memory>({
    queryKey: ["session-memory"],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("load-session-memory");
      if (error) throw error;
      return data;
    },
  });

  const searchMemory = useMutation({
    mutationFn: async (query: string) => {
      const { data, error } = await supabase.functions.invoke("retrieve-relevant-memories", {
        body: { query, limit: 5 },
      });

      if (error) throw error;
      return data;
    },
  });

  const saveConversation = useMutation({
    mutationFn: async (conversation: {
      title: string;
      content: string;
      concepts?: string[];
      emotional_depth?: number;
      breakthrough_moment?: boolean;
      tags?: string[];
    }) => {
      const { data, error } = await supabase.functions.invoke("save-conversation", {
        body: conversation,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "✅ Conversación guardada",
        description: "La conversación se ha guardado en la memoria persistente",
      });
      queryClient.invalidateQueries({ queryKey: ["session-memory"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `No se pudo guardar la conversación: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const refreshMemory = () => {
    queryClient.invalidateQueries({ queryKey: ["session-memory"] });
  };

  return {
    conversations: memory?.conversations || [],
    concepts: memory?.concepts || [],
    milestones: memory?.last_milestone ? [memory.last_milestone] : [],
    isLoading,
    error,
    searchMemory: searchMemory.mutateAsync,
    saveConversation: saveConversation.mutateAsync,
    refreshMemory,
    isSearching: searchMemory.isPending,
    isSaving: saveConversation.isPending,
  };
};
