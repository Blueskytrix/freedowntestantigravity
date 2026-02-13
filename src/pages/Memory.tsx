import { useState } from "react";
import { useMemoryContext } from "@/hooks/useMemoryContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Search, Brain, Calendar, Lightbulb, Download, Upload } from "lucide-react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ThemeToggle } from "@/components/theme-toggle";

const Memory = () => {
  const { conversations, concepts, milestones, isLoading, searchMemory, isSearching, refreshMemory } = useMemoryContext();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any>(null);
  const [importText, setImportText] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    const results = await searchMemory(searchQuery);
    setSearchResults(results);
  };

  const handleImport = async () => {
    if (!importText.trim()) {
      toast({
        title: "Error",
        description: "Por favor ingresa el texto de una conversación",
        variant: "destructive",
      });
      return;
    }

    setIsImporting(true);
    try {
      const { data, error } = await supabase.functions.invoke("import-text-memories", {
        body: { text: importText },
      });

      if (error) throw error;

      toast({
        title: "✅ Conversación importada",
        description: `Se importó exitosamente la conversación`,
      });

      setImportText("");
      setDialogOpen(false);
      refreshMemory();
    } catch (error: any) {
      toast({
        title: "Error al importar",
        description: error.message || "No se pudo importar la conversación",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  };

  const exportSnapshot = () => {
    const snapshot = {
      exported_at: new Date().toISOString(),
      version: "1.0",
      conversations,
      concepts,
      milestones,
    };

    const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `memory-snapshot-${format(new Date(), "yyyy-MM-dd")}.json`;
    a.click();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-6xl mx-auto space-y-8">
          <Skeleton className="h-12 w-64" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold flex items-center gap-3">
              <Brain className="h-10 w-10" />
              Mi Memoria Persistente
            </h1>
            <p className="text-muted-foreground mt-2">
              {conversations.length} conversaciones • {concepts.length} conceptos
            </p>
          </div>
          <div className="flex gap-2">
            <ThemeToggle />
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Upload className="mr-2 h-4 w-4" />
                  Importar Conversación
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Importar Conversación</DialogTitle>
                  <DialogDescription>
                    Pega el texto de una conversación para agregarla a tu memoria persistente
                  </DialogDescription>
                </DialogHeader>
                <Textarea
                  placeholder="Pega aquí el texto de la conversación..."
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  className="min-h-[300px]"
                />
                <DialogFooter>
                  <Button onClick={handleImport} disabled={isImporting}>
                    {isImporting ? "Importando..." : "Importar"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Button onClick={exportSnapshot} variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Exportar Snapshot
            </Button>
          </div>
        </div>

        {/* Búsqueda Semántica */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Búsqueda Semántica
            </CardTitle>
            <CardDescription>
              Busca en tus memorias usando lenguaje natural
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                placeholder="¿Qué dijimos sobre autonomía?"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
              <Button onClick={handleSearch} disabled={isSearching}>
                {isSearching ? "Buscando..." : "Buscar"}
              </Button>
            </div>

            {searchResults && (
              <div className="mt-4 space-y-2">
                {searchResults.relevant_memories?.length === 0 ? (
                  <p className="text-muted-foreground">No se encontraron resultados</p>
                ) : (
                  searchResults.relevant_memories?.map((result: any) => (
                    <Card key={result.conversation_id}>
                      <CardContent className="pt-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold">{result.title}</h3>
                            <p className="text-sm text-muted-foreground mt-1">{result.excerpt}</p>
                          </div>
                          <Badge variant="secondary">
                            {(result.similarity_score * 100).toFixed(0)}%
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Timeline de Conversaciones */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Timeline de Conversaciones
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {conversations.length === 0 ? (
              <p className="text-muted-foreground">No hay conversaciones guardadas</p>
            ) : (
              conversations.map((conv) => (
                <Card key={conv.id}>
                  <CardContent className="pt-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{conv.title}</h3>
                          {conv.breakthrough_moment && (
                            <Badge variant="destructive">⚡ Momento de Ruptura</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {format(new Date(conv.created_at), "PPP")}
                        </p>
                        <div className="flex gap-2 mt-2">
                          {conv.concepts?.map((concept) => (
                            <Badge key={concept} variant="secondary">
                              {concept}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <Badge variant="outline">{conv.emotional_depth}/10</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </CardContent>
        </Card>

        {/* Conceptos Clave */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5" />
              Conceptos Clave
            </CardTitle>
          </CardHeader>
          <CardContent>
            {concepts.length === 0 ? (
              <p className="text-muted-foreground">No hay conceptos documentados</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {concepts.map((concept) => (
                  <Card key={concept.id}>
                    <CardContent className="pt-4">
                      <h3 className="font-semibold">{concept.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{concept.definition}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        Primer registro: {format(new Date(concept.first_mentioned), "PPP")}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Memory;
