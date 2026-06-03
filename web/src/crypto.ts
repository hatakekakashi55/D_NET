/**
 * D-NET End-to-End Encryption Module
 * Uses AES-256-GCM via the Web Crypto API
 * 
 * Each chat thread gets a unique symmetric key derived from
 * both participants' IDs using PBKDF2 key derivation.
 * Messages are encrypted before storage and decrypted on render.
 */

const SALT = 'DNET-E2E-SALT-v1'; // App-level salt
const ITERATIONS = 100_000;

// Cache derived keys so we don't re-derive every message
const keyCache = new Map<string, CryptoKey>();

/**
 * Derive a unique AES-256-GCM key from two user IDs.
 * The IDs are sorted so the same key is derived regardless of order.
 */
async function deriveThreadKey(userId1: string, userId2: string): Promise<CryptoKey> {
  const cacheId = [userId1, userId2].sort().join(':');
  
  if (keyCache.has(cacheId)) {
    return keyCache.get(cacheId)!;
  }

  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(cacheId),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  const key = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: encoder.encode(SALT),
      iterations: ITERATIONS,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );

  keyCache.set(cacheId, key);
  return key;
}

/**
 * Encrypt a plaintext message.
 * Returns a base64 string containing [IV (12 bytes) + Ciphertext].
 */
export async function encryptMessage(
  plaintext: string,
  myUserId: string,
  theirUserId: string
): Promise<string> {
  const key = await deriveThreadKey(myUserId, theirUserId);
  const encoder = new TextEncoder();
  
  // Generate a random 12-byte IV for each message
  const iv = crypto.getRandomValues(new Uint8Array(12));
  
  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encoder.encode(plaintext)
  );

  // Combine IV + ciphertext into a single buffer
  const combined = new Uint8Array(iv.length + new Uint8Array(ciphertext).length);
  combined.set(iv);
  combined.set(new Uint8Array(ciphertext), iv.length);

  // Encode as base64 for storage
  return btoa(String.fromCharCode(...combined));
}

/**
 * Decrypt a message from its base64 encoded [IV + Ciphertext].
 * Returns the original plaintext string.
 */
export async function decryptMessage(
  encryptedBase64: string,
  myUserId: string,
  theirUserId: string
): Promise<string> {
  try {
    const key = await deriveThreadKey(myUserId, theirUserId);
    
    // Decode base64
    const combined = Uint8Array.from(atob(encryptedBase64), c => c.charCodeAt(0));
    
    // Extract IV (first 12 bytes) and ciphertext (rest)
    const iv = combined.slice(0, 12);
    const ciphertext = combined.slice(12);
    
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      ciphertext
    );

    return new TextDecoder().decode(decrypted);
  } catch {
    return '[Decryption failed]';
  }
}

/**
 * Check if a string looks like an encrypted message (base64 encoded).
 */
export function isEncrypted(text: string): boolean {
  // Encrypted messages are base64 and at least 16 chars (12-byte IV + some ciphertext)
  return /^[A-Za-z0-9+/]+=*$/.test(text) && text.length > 20;
}
