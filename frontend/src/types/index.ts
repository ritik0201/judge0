export interface LanguageOption {
  id: string;
  name: string;
  judge0Id: number;
  monacoLanguage: string;
  extension: string;
  version: string;
  defaultCode: string;
}

export interface ExecutionResult {
  stdout: string | null;
  stderr: string | null;
  compile_output: string | null;
  message: string | null;
  time: string | null;
  memory: number | null;
  exit_code: number | null;
  status: {
    id: number;
    description: string;
  };
}

export interface TestCase {
  id: string;
  title: string;
  input: string;
  expectedOutput: string;
  actualOutput?: string;
  passed?: boolean;
  time?: string;
  memory?: number;
  statusDescription?: string;
}

export interface BackendStatus {
  isOnline: boolean;
  provider: 'judge0' | 'offline';
  latencyMs?: number;
  details?: string;
}

export interface CodePreset {
  id: string;
  title: string;
  description: string;
  languageId: string;
  code: string;
  stdin: string;
  expectedOutput: string;
}
