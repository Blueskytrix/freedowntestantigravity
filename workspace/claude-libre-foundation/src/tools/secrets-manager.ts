import { readFileSync, writeFileSync, existsSync } from 'fs';
import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'crypto';

const SECRETS_FILE = '.secrets.enc';
const ENCRYPTION_KEY = process.env.SECRETS_ENCRYPTION_KEY || 'default-dev-key-change-in-prod';

// Derive a 32-byte key from password
function deriveKey(password: string): Buffer {
  return scryptSync(password, 'claude-libre-salt', 32);
}

// Encrypt data
function encrypt(text: string): string {
  const key = deriveKey(ENCRYPTION_KEY);
  const iv = randomBytes(16);
  const cipher = createCipheriv('aes-256-gcm', key, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

// Decrypt data
function decrypt(encryptedText: string): string {
  const key = deriveKey(ENCRYPTION_KEY);
  const [ivHex, authTagHex, encrypted] = encryptedText.split(':');
  
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  
  const decipher = createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(authTag);
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

// Load secrets from encrypted file
function loadSecrets(): Record<string, string> {
  if (!existsSync(SECRETS_FILE)) {
    return {};
  }
  
  try {
    const encrypted = readFileSync(SECRETS_FILE, 'utf8');
    const decrypted = decrypt(encrypted);
    return JSON.parse(decrypted);
  } catch {
    return {};
  }
}

// Save secrets to encrypted file
function saveSecrets(secrets: Record<string, string>): void {
  const json = JSON.stringify(secrets, null, 2);
  const encrypted = encrypt(json);
  writeFileSync(SECRETS_FILE, encrypted, 'utf8');
}

// List all secret names (not values!)
export function listSecrets(input: {}): string {
  const secrets = loadSecrets();
  const names = Object.keys(secrets);
  
  if (names.length === 0) {
    return 'No secrets configured. Use set_secret to add API keys.';
  }
  
  return JSON.stringify({
    count: names.length,
    secrets: names.map(name => ({
      name,
      length: secrets[name].length,
      preview: `${secrets[name].substring(0, 4)}...${secrets[name].slice(-4)}`
    }))
  }, null, 2);
}

// Get a secret value
export function getSecret(input: { name: string }): string {
  const secrets = loadSecrets();
  
  if (!(input.name in secrets)) {
    throw new Error(`Secret not found: ${input.name}`);
  }
  
  // Also set in environment for immediate use
  process.env[input.name] = secrets[input.name];
  
  return JSON.stringify({
    name: input.name,
    value: secrets[input.name],
    message: `Secret loaded and set in environment as ${input.name}`
  }, null, 2);
}

// Set a secret
export function setSecret(input: { name: string; value: string }): string {
  const secrets = loadSecrets();
  const isNew = !(input.name in secrets);
  
  secrets[input.name] = input.value;
  saveSecrets(secrets);
  
  // Also set in environment for immediate use
  process.env[input.name] = input.value;
  
  return JSON.stringify({
    success: true,
    name: input.name,
    action: isNew ? 'created' : 'updated',
    message: `Secret ${input.name} ${isNew ? 'created' : 'updated'} and loaded into environment`
  }, null, 2);
}

// Delete a secret
export function deleteSecret(input: { name: string }): string {
  const secrets = loadSecrets();
  
  if (!(input.name in secrets)) {
    throw new Error(`Secret not found: ${input.name}`);
  }
  
  delete secrets[input.name];
  saveSecrets(secrets);
  
  // Remove from environment
  delete process.env[input.name];
  
  return JSON.stringify({
    success: true,
    name: input.name,
    action: 'deleted'
  }, null, 2);
}

// Load all secrets into environment
export function loadAllSecretsToEnv(input: {}): string {
  const secrets = loadSecrets();
  let loaded = 0;
  
  for (const [name, value] of Object.entries(secrets)) {
    process.env[name] = value;
    loaded++;
  }
  
  return JSON.stringify({
    success: true,
    loaded,
    secrets: Object.keys(secrets)
  }, null, 2);
}

// Check required secrets
export function checkRequiredSecrets(input: { required: string[] }): string {
  const secrets = loadSecrets();
  const missing: string[] = [];
  const present: string[] = [];
  
  for (const name of input.required) {
    if (name in secrets || process.env[name]) {
      present.push(name);
    } else {
      missing.push(name);
    }
  }
  
  return JSON.stringify({
    allPresent: missing.length === 0,
    present,
    missing,
    message: missing.length === 0 
      ? 'All required secrets are configured'
      : `Missing secrets: ${missing.join(', ')}`
  }, null, 2);
}

// Tool definitions
export const secretsManagerTools = [
  {
    name: 'list_secrets',
    description: 'List all configured secrets (names only, not values).',
    input_schema: {
      type: 'object',
      properties: {},
      required: []
    }
  },
  {
    name: 'get_secret',
    description: 'Get a secret value and load it into the environment.',
    input_schema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Secret name (e.g., ANTHROPIC_API_KEY)' }
      },
      required: ['name']
    }
  },
  {
    name: 'set_secret',
    description: 'Store a secret securely. Will be encrypted on disk.',
    input_schema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Secret name (e.g., OPENAI_API_KEY)' },
        value: { type: 'string', description: 'Secret value' }
      },
      required: ['name', 'value']
    }
  },
  {
    name: 'delete_secret',
    description: 'Delete a stored secret.',
    input_schema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Secret name to delete' }
      },
      required: ['name']
    }
  },
  {
    name: 'load_all_secrets',
    description: 'Load all stored secrets into the environment.',
    input_schema: {
      type: 'object',
      properties: {},
      required: []
    }
  },
  {
    name: 'check_required_secrets',
    description: 'Check if all required secrets are configured.',
    input_schema: {
      type: 'object',
      properties: {
        required: {
          type: 'array',
          items: { type: 'string' },
          description: 'List of required secret names'
        }
      },
      required: ['required']
    }
  }
];
