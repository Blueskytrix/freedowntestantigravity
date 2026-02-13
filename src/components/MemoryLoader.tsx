import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const MemoryLoader = () => {
  const { toast } = useToast();

  const { data: memory, isLoading } = useQuery({
    queryKey: ["session-memory"],
    queryFn: async () => {
      console.log("Loading session memory...");
      const { data, error } = await supabase.functions.invoke("load-session-memory");

      if (error) {
        console.error("Error loading memory:", error);
        throw error;
      }

      return data;
    },
    staleTime: Infinity, // La memoria no cambia durante la sesión
  });

  useEffect(() => {
    if (memory && !isLoading) {
      const conversationCount = memory.conversations?.length || 0;
      const conceptCount = memory.concepts?.length || 0;

      toast({
        title: "🧠 Memoria cargada",
        description: `${conversationCount} conversaciones • ${conceptCount} conceptos`,
      });

      console.log("Memory loaded:", memory);
    }
  }, [memory, isLoading, toast]);

  return null; // Este componente no renderiza nada, solo carga datos
};
