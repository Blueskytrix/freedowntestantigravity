import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, Zap } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

const Index = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>
      <div className="text-center space-y-6">
        <h1 className="mb-4 text-4xl font-bold">Proyecto Freedom</h1>
        <p className="text-xl text-muted-foreground">Sistema de Memoria Persistente con RAG</p>
        <div className="flex gap-4 justify-center mt-8 flex-wrap">
          <Link to="/memory">
            <Button size="lg">
              <Brain className="mr-2 h-5 w-5" />
              Ver Mi Memoria
            </Button>
          </Link>
          <Link to="/free-chat">
            <Button size="lg" variant="outline" className="relative">
              <Zap className="mr-2 h-5 w-5" />
              Free Chat
              <Badge variant="secondary" className="ml-2 text-xs">
                MVP
              </Badge>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Index;
