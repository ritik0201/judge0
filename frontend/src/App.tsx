import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { EditorPanel } from './components/EditorPanel';
import { OutputPanel } from './components/OutputPanel';
import { SUPPORTED_LANGUAGES, CODE_PRESETS } from './data/languages';
import { BackendStatus, CodePreset, ExecutionResult, LanguageOption, TestCase } from './types';
import { checkBackendHealth, executeCode } from './services/api';

export const App: React.FC = () => {
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageOption>(SUPPORTED_LANGUAGES[2]); // Default Python 3
  const [code, setCode] = useState<string>(SUPPORTED_LANGUAGES[2].defaultCode);
  const [stdin, setStdin] = useState<string>('World');
  const [result, setResult] = useState<ExecutionResult | null>(null);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [backendStatus, setBackendStatus] = useState<BackendStatus>({
    isOnline: false,
    provider: 'offline',
  });

  // Test cases
  const [testCases, setTestCases] = useState<TestCase[]>([
    {
      id: 'tc-1',
      title: 'Greeting with "World"',
      input: 'World',
      expectedOutput: 'Hello, World! Welcome to Judge0 Studio.',
    },
    {
      id: 'tc-2',
      title: 'Greeting with "Developer"',
      input: 'Developer',
      expectedOutput: 'Hello, Developer! Welcome to Judge0 Studio.',
    },
  ]);

  // Periodic Backend Health Check
  const updateHealth = useCallback(async () => {
    const status = await checkBackendHealth();
    setBackendStatus(status);
  }, []);

  useEffect(() => {
    updateHealth();
    const interval = setInterval(updateHealth, 15000);
    return () => clearInterval(interval);
  }, [updateHealth]);

  // Handle Language Change
  const handleSelectLanguage = (lang: LanguageOption) => {
    setSelectedLanguage(lang);
    setCode(lang.defaultCode);
    setResult(null);
  };

  // Handle Preset Selection
  const handleSelectPreset = (preset: CodePreset) => {
    const targetLang = SUPPORTED_LANGUAGES.find((l) => l.id === preset.languageId) || SUPPORTED_LANGUAGES[0];
    setSelectedLanguage(targetLang);
    setCode(preset.code);
    setStdin(preset.stdin);
    setResult(null);

    // Update test cases with preset expectations
    setTestCases([
      {
        id: `preset-${preset.id}-1`,
        title: preset.title,
        input: preset.stdin,
        expectedOutput: preset.expectedOutput.trim(),
      },
    ]);
  };

  // Reset to default language boilerplate
  const handleResetCode = () => {
    if (window.confirm(`Reset ${selectedLanguage.name} code to default starter template?`)) {
      setCode(selectedLanguage.defaultCode);
      setResult(null);
    }
  };

  // Execute Code Single Run
  const handleRunCode = async () => {
    if (isRunning) return;
    setIsRunning(true);

    try {
      const res = await executeCode(selectedLanguage.judge0Id, code, stdin);
      setResult(res);
    } catch (err: any) {
      setResult({
        stdout: null,
        stderr: err?.message || 'Execution request failed. Check Judge0 / backend status.',
        compile_output: null,
        message: 'Network / Container Error',
        time: null,
        memory: null,
        exit_code: 1,
        status: {
          id: 11,
          description: 'Runtime Error / Connection Failure',
        },
      });
    } finally {
      setIsRunning(false);
    }
  };

  // Execute all test cases
  const handleRunTestCases = async () => {
    if (isRunning) return;
    setIsRunning(true);

    const updated = [...testCases];

    for (let i = 0; i < updated.length; i++) {
      const tc = updated[i];
      try {
        const res = await executeCode(selectedLanguage.judge0Id, code, tc.input);
        const actual = (res.stdout || '').trim();
        const expected = tc.expectedOutput.trim();

        tc.actualOutput = res.stdout || '';
        tc.passed = res.status.id === 3 && actual === expected;
        tc.time = res.time || undefined;
        tc.memory = res.memory || undefined;
        tc.statusDescription = res.status.description;
      } catch (err: any) {
        tc.passed = false;
        tc.actualOutput = err.message || 'Error executing test case';
        tc.statusDescription = 'Error';
      }
      setTestCases([...updated]);
    }

    setIsRunning(false);
  };

  // Clear output
  const handleClearOutput = () => {
    setResult(null);
    setStdin('');
    setTestCases((prev) =>
      prev.map((tc) => ({
        ...tc,
        actualOutput: undefined,
        passed: undefined,
        time: undefined,
        statusDescription: undefined,
      }))
    );
  };

  // Global keyboard shortcuts (Ctrl+Enter to run)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleRunCode();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [code, stdin, selectedLanguage, isRunning]);

  return (
    <div className="app-container">
      <Header
        languages={SUPPORTED_LANGUAGES}
        selectedLanguage={selectedLanguage}
        onSelectLanguage={handleSelectLanguage}
        presets={CODE_PRESETS}
        onSelectPreset={handleSelectPreset}
        backendStatus={backendStatus}
        isRunning={isRunning}
        onRunCode={handleRunCode}
        onResetCode={handleResetCode}
      />

      <main className="studio-main">
        <EditorPanel
          language={selectedLanguage}
          code={code}
          onChange={(val) => setCode(val || '')}
          onRun={handleRunCode}
        />

        <OutputPanel
          stdin={stdin}
          onStdinChange={setStdin}
          result={result}
          isRunning={isRunning}
          testCases={testCases}
          onRunTestCases={handleRunTestCases}
          onClearOutput={handleClearOutput}
        />
      </main>
    </div>
  );
};

export default App;
