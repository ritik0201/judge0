import { BackendStatus, ExecutionResult } from '../types';

const JUDGE0_URL = import.meta.env.VITE_JUDGE0_URL || 'http://127.0.0.1:2358';

/**
 * Safely encode UTF-8 string to base64
 */
export function toBase64(str: string): string {
  try {
    return btoa(unescape(encodeURIComponent(str || '')));
  } catch {
    return btoa(str || '');
  }
}

/**
 * Safely decode base64 string to UTF-8
 */
export function fromBase64(str: string | null | undefined): string {
  if (!str) return '';
  try {
    return decodeURIComponent(escape(atob(str)));
  } catch {
    try {
      return atob(str);
    } catch {
      return str;
    }
  }
}

/**
 * Health check targeting Judge0 directly
 */
export async function checkBackendHealth(): Promise<BackendStatus> {
  const startTime = performance.now();

  try {
    const res = await fetch(`${JUDGE0_URL}/about`, { method: 'GET', signal: AbortSignal.timeout(2500) });
    if (res.ok) {
      const data = await res.json();
      const latency = Math.round(performance.now() - startTime);
      return {
        isOnline: true,
        provider: 'judge0',
        latencyMs: latency,
        details: `Connected to Judge0 CE ${data.version || 'v1.13.1'} (Port 2358)`
      };
    }
  } catch {
    // Offline
  }

  return {
    isOnline: false,
    provider: 'offline',
    details: 'Judge0 is offline. Start containers with docker compose or .\\scripts\\start.ps1.'
  };
}

/**
 * Execute code directly via Judge0 API
 */
export async function executeCode(
  judge0LanguageId: number,
  sourceCode: string,
  stdin: string = '',
  expectedOutput?: string
): Promise<ExecutionResult> {
  const payload = {
    source_code: toBase64(sourceCode),
    language_id: judge0LanguageId,
    stdin: toBase64(stdin),
    expected_output: expectedOutput ? toBase64(expectedOutput) : undefined,
    cpu_time_limit: 5,
    cpu_extra_time: 1.0,
    wall_time_limit: 10,
    memory_limit: 2097152, // 2GB to accommodate Java and Node v8 runtimes
    enable_per_process_and_thread_time_limit: true,
    enable_per_process_and_thread_memory_limit: true,
  };

  const response = await fetch(`${JUDGE0_URL}/submissions?wait=true&base64_encoded=true`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(20000),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Judge0 responded with ${response.status}: ${errText}`);
  }

  const raw = await response.json();

  return {
    stdout: raw.stdout ? fromBase64(raw.stdout) : null,
    stderr: raw.stderr ? fromBase64(raw.stderr) : null,
    compile_output: raw.compile_output ? fromBase64(raw.compile_output) : null,
    message: raw.message ? fromBase64(raw.message) : null,
    time: raw.time || null,
    memory: raw.memory || null,
    exit_code: raw.exit_code ?? null,
    status: {
      id: raw.status?.id ?? 0,
      description: raw.status?.description || 'Unknown Status',
    },
  };
}
