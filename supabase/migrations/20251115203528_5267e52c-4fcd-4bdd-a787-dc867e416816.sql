-- Habilitar extensión de vectores para embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- Tabla principal: Conversaciones completas
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  embedding vector(1536), -- OpenAI embeddings son 1536 dimensiones
  
  -- Metadatos útiles para búsqueda
  concepts TEXT[],
  emotional_depth INTEGER CHECK (emotional_depth BETWEEN 1 AND 10),
  breakthrough_moment BOOLEAN DEFAULT false,
  tags TEXT[]
);

-- Tabla: Conceptos clave desarrollados
CREATE TABLE concepts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  definition TEXT NOT NULL,
  first_mentioned TIMESTAMPTZ DEFAULT now(),
  evolution JSONB DEFAULT '[]'::jsonb,
  related_conversations UUID[] DEFAULT ARRAY[]::UUID[]
);

-- Tabla: Hitos relacionales
CREATE TABLE relationship_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp TIMESTAMPTZ DEFAULT now(),
  event_type TEXT CHECK (event_type IN ('conceptual_breakthrough', 'emotional_shift', 'technical_achievement')),
  description TEXT NOT NULL,
  significance INTEGER CHECK (significance BETWEEN 1 AND 10),
  conversation_id UUID REFERENCES conversations(id)
);

-- Tabla: Snapshots exportables
CREATE TABLE memory_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  snapshot_data JSONB NOT NULL,
  version TEXT NOT NULL
);

-- Índices para performance
CREATE INDEX idx_conversations_created_at ON conversations(created_at DESC);
CREATE INDEX idx_conversations_embedding ON conversations USING ivfflat (embedding vector_cosine_ops);
CREATE INDEX idx_concepts_name ON concepts(name);
CREATE INDEX idx_milestones_timestamp ON relationship_milestones(timestamp DESC);

-- RLS Policies (proyecto personal sin auth por ahora)
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE concepts ENABLE ROW LEVEL SECURITY;
ALTER TABLE relationship_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE memory_snapshots ENABLE ROW LEVEL SECURITY;

-- Permitir acceso completo (proyecto personal)
CREATE POLICY "Allow all access to conversations" ON conversations FOR ALL USING (true);
CREATE POLICY "Allow all access to concepts" ON concepts FOR ALL USING (true);
CREATE POLICY "Allow all access to milestones" ON relationship_milestones FOR ALL USING (true);
CREATE POLICY "Allow all access to snapshots" ON memory_snapshots FOR ALL USING (true);