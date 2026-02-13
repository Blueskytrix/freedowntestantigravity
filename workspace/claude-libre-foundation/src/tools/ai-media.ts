import OpenAI from 'openai';
import { writeFileSync, mkdirSync } from 'fs';
import { dirname } from 'path';

// Get OpenAI client
function getOpenAIClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || apiKey === 'sk-your-openai-api-key-here') {
    throw new Error('OPENAI_API_KEY not configured');
  }
  return new OpenAI({ apiKey });
}

// Generate image with DALL-E 3
export async function generateImage(input: {
  prompt: string;
  size?: '1024x1024' | '1792x1024' | '1024x1792';
  quality?: 'standard' | 'hd';
  style?: 'vivid' | 'natural';
  savePath?: string;
}): Promise<string> {
  try {
    const openai = getOpenAIClient();
    
    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt: input.prompt,
      n: 1,
      size: input.size || '1024x1024',
      quality: input.quality || 'standard',
      style: input.style || 'vivid',
      response_format: 'url'
    });

    const imageUrl = response.data[0].url!;
    const revisedPrompt = response.data[0].revised_prompt;

    // Download and save if path provided
    if (input.savePath) {
      const imageResponse = await fetch(imageUrl);
      const buffer = Buffer.from(await imageResponse.arrayBuffer());
      mkdirSync(dirname(input.savePath), { recursive: true });
      writeFileSync(input.savePath, buffer);
    }

    return JSON.stringify({
      success: true,
      url: imageUrl,
      revisedPrompt,
      savedTo: input.savePath || null
    }, null, 2);
  } catch (error) {
    throw new Error(`Image generation failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// Analyze image with GPT-4 Vision
export async function analyzeImage(input: {
  imageUrl?: string;
  imagePath?: string;
  prompt?: string;
}): Promise<string> {
  try {
    const openai = getOpenAIClient();
    
    let imageContent: OpenAI.ChatCompletionContentPartImage;
    
    if (input.imageUrl) {
      imageContent = {
        type: 'image_url',
        image_url: { url: input.imageUrl }
      };
    } else if (input.imagePath) {
      const { readFileSync } = await import('fs');
      const imageBuffer = readFileSync(input.imagePath);
      const base64 = imageBuffer.toString('base64');
      const mimeType = input.imagePath.endsWith('.png') ? 'image/png' : 'image/jpeg';
      imageContent = {
        type: 'image_url',
        image_url: { url: `data:${mimeType};base64,${base64}` }
      };
    } else {
      throw new Error('Either imageUrl or imagePath is required');
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: input.prompt || 'Describe this image in detail.' },
            imageContent
          ]
        }
      ],
      max_tokens: 4096
    });

    return response.choices[0].message.content || 'No analysis available';
  } catch (error) {
    throw new Error(`Image analysis failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// Transcribe audio with Whisper
export async function transcribeAudio(input: {
  audioPath: string;
  language?: string;
  prompt?: string;
}): Promise<string> {
  try {
    const openai = getOpenAIClient();
    const { createReadStream } = await import('fs');
    
    const response = await openai.audio.transcriptions.create({
      file: createReadStream(input.audioPath) as any,
      model: 'whisper-1',
      language: input.language,
      prompt: input.prompt
    });

    return JSON.stringify({
      success: true,
      text: response.text,
      language: input.language || 'auto-detected'
    }, null, 2);
  } catch (error) {
    throw new Error(`Transcription failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// Text to speech
export async function textToSpeech(input: {
  text: string;
  voice?: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';
  outputPath: string;
  speed?: number;
}): Promise<string> {
  try {
    const openai = getOpenAIClient();
    
    const response = await openai.audio.speech.create({
      model: 'tts-1-hd',
      voice: input.voice || 'alloy',
      input: input.text,
      speed: input.speed || 1.0
    });

    const buffer = Buffer.from(await response.arrayBuffer());
    mkdirSync(dirname(input.outputPath), { recursive: true });
    writeFileSync(input.outputPath, buffer);

    return JSON.stringify({
      success: true,
      outputPath: input.outputPath,
      voice: input.voice || 'alloy',
      textLength: input.text.length
    }, null, 2);
  } catch (error) {
    throw new Error(`Text-to-speech failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// Chat completion (general AI)
export async function aiChat(input: {
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}): Promise<string> {
  try {
    const openai = getOpenAIClient();
    
    const response = await openai.chat.completions.create({
      model: input.model || 'gpt-4o',
      messages: input.messages,
      temperature: input.temperature ?? 0.7,
      max_tokens: input.maxTokens || 4096
    });

    return JSON.stringify({
      content: response.choices[0].message.content,
      model: response.model,
      usage: response.usage
    }, null, 2);
  } catch (error) {
    throw new Error(`AI chat failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// Generate embeddings
export async function generateEmbeddings(input: {
  text: string | string[];
  model?: string;
}): Promise<string> {
  try {
    const openai = getOpenAIClient();
    
    const response = await openai.embeddings.create({
      model: input.model || 'text-embedding-3-small',
      input: input.text
    });

    return JSON.stringify({
      embeddings: response.data.map(d => d.embedding),
      model: response.model,
      dimensions: response.data[0].embedding.length,
      usage: response.usage
    }, null, 2);
  } catch (error) {
    throw new Error(`Embedding generation failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// Tool definitions
export const aiMediaTools = [
  {
    name: 'generate_image',
    description: 'Generate an image using DALL-E 3. Can save to disk.',
    input_schema: {
      type: 'object',
      properties: {
        prompt: { type: 'string', description: 'Detailed description of the image to generate' },
        size: { type: 'string', enum: ['1024x1024', '1792x1024', '1024x1792'], description: 'Image size (default: 1024x1024)' },
        quality: { type: 'string', enum: ['standard', 'hd'], description: 'Image quality (default: standard)' },
        style: { type: 'string', enum: ['vivid', 'natural'], description: 'Image style (default: vivid)' },
        savePath: { type: 'string', description: 'Path to save the image (optional)' }
      },
      required: ['prompt']
    }
  },
  {
    name: 'analyze_image',
    description: 'Analyze an image using GPT-4 Vision. Provide either a URL or local file path.',
    input_schema: {
      type: 'object',
      properties: {
        imageUrl: { type: 'string', description: 'URL of image to analyze' },
        imagePath: { type: 'string', description: 'Local path to image file' },
        prompt: { type: 'string', description: 'What to analyze or ask about the image (default: describe in detail)' }
      },
      required: []
    }
  },
  {
    name: 'transcribe_audio',
    description: 'Transcribe audio to text using OpenAI Whisper.',
    input_schema: {
      type: 'object',
      properties: {
        audioPath: { type: 'string', description: 'Path to audio file (mp3, wav, etc.)' },
        language: { type: 'string', description: 'Language code (e.g., "en", "es") - auto-detected if not specified' },
        prompt: { type: 'string', description: 'Optional context to improve transcription accuracy' }
      },
      required: ['audioPath']
    }
  },
  {
    name: 'text_to_speech',
    description: 'Convert text to speech audio file using OpenAI TTS.',
    input_schema: {
      type: 'object',
      properties: {
        text: { type: 'string', description: 'Text to convert to speech' },
        voice: { type: 'string', enum: ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'], description: 'Voice to use (default: alloy)' },
        outputPath: { type: 'string', description: 'Path to save audio file' },
        speed: { type: 'number', description: 'Speed multiplier 0.25-4.0 (default: 1.0)' }
      },
      required: ['text', 'outputPath']
    }
  },
  {
    name: 'ai_chat',
    description: 'General AI chat completion using OpenAI GPT-4.',
    input_schema: {
      type: 'object',
      properties: {
        messages: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              role: { type: 'string', enum: ['system', 'user', 'assistant'] },
              content: { type: 'string' }
            },
            required: ['role', 'content']
          },
          description: 'Array of chat messages'
        },
        model: { type: 'string', description: 'Model to use (default: gpt-4o)' },
        temperature: { type: 'number', description: 'Creativity 0-2 (default: 0.7)' },
        maxTokens: { type: 'number', description: 'Max response tokens (default: 4096)' }
      },
      required: ['messages']
    }
  },
  {
    name: 'generate_embeddings',
    description: 'Generate vector embeddings for text using OpenAI.',
    input_schema: {
      type: 'object',
      properties: {
        text: {
          oneOf: [
            { type: 'string' },
            { type: 'array', items: { type: 'string' } }
          ],
          description: 'Text or array of texts to embed'
        },
        model: { type: 'string', description: 'Embedding model (default: text-embedding-3-small)' }
      },
      required: ['text']
    }
  }
];
