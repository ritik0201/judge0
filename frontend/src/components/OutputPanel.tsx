import React, { useState } from 'react';
import { 
  Terminal, 
  FileInput, 
  AlertTriangle, 
  Clock, 
  Cpu, 
  CheckCircle, 
  XCircle, 
  Copy, 
  Check, 
  Trash2,
  CheckCircle2,
  TestTubes
} from 'lucide-react';
import { ExecutionResult, TestCase } from '../types';

interface OutputPanelProps {
  stdin: string;
  onStdinChange: (value: string) => void;
  result: ExecutionResult | null;
  isRunning: boolean;
  testCases: TestCase[];
  onRunTestCases: () => void;
  onClearOutput: () => void;
}

export const OutputPanel: React.FC<OutputPanelProps> = ({
  stdin,
  onStdinChange,
  result,
  isRunning,
  testCases,
  onRunTestCases,
  onClearOutput,
}) => {
  const [activeTab, setActiveTab] = useState<'stdout' | 'stdin' | 'stderr' | 'testcases'>('stdout');
  const [copied, setCopied] = useState(false);

  // Copy active text
  const handleCopy = async () => {
    let text = '';
    if (activeTab === 'stdout') text = result?.stdout || '';
    else if (activeTab === 'stdin') text = stdin;
    else if (activeTab === 'stderr') text = result?.stderr || result?.compile_output || '';

    if (text) {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Determine verdict class & label
  const getVerdictBadge = () => {
    if (!result) {
      return <span className="verdict-pill neutral">READY</span>;
    }

    const id = result.status.id;
    if (id === 3) {
      return (
        <span className="verdict-pill accepted">
          <CheckCircle size={13} />
          {result.status.description || 'ACCEPTED'}
        </span>
      );
    }
    if (id === 4) {
      return (
        <span className="verdict-pill wrong">
          <XCircle size={13} />
          {result.status.description || 'WRONG ANSWER'}
        </span>
      );
    }
    if (id === 5 || id === 13) {
      return (
        <span className="verdict-pill warning">
          <Clock size={13} />
          {result.status.description || 'TIME LIMIT EXCEEDED'}
        </span>
      );
    }
    if (id === 6) {
      return (
        <span className="verdict-pill error">
          <AlertTriangle size={13} />
          COMPILATION ERROR
        </span>
      );
    }
    return (
      <span className="verdict-pill error">
        <AlertTriangle size={13} />
        {result.status.description || 'RUNTIME ERROR'}
      </span>
    );
  };

  return (
    <div className="output-card">
      {/* Top Tab Bar */}
      <div className="card-topbar">
        <div style={{ display: 'flex', gap: '0.25rem' }}>
          <button
            className={`tab-btn ${activeTab === 'stdout' ? 'active' : ''}`}
            onClick={() => setActiveTab('stdout')}
          >
            <Terminal size={14} />
            <span>Output (stdout)</span>
          </button>

          <button
            className={`tab-btn ${activeTab === 'stdin' ? 'active' : ''}`}
            onClick={() => setActiveTab('stdin')}
          >
            <FileInput size={14} />
            <span>Input (stdin)</span>
            {stdin.trim() && (
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#3b82f6' }} />
            )}
          </button>

          <button
            className={`tab-btn ${activeTab === 'stderr' ? 'active' : ''}`}
            onClick={() => setActiveTab('stderr')}
          >
            <AlertTriangle size={14} />
            <span>Diagnostics</span>
            {(result?.stderr || result?.compile_output) && (
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#ef4444' }} />
            )}
          </button>

          <button
            className={`tab-btn ${activeTab === 'testcases' ? 'active' : ''}`}
            onClick={() => setActiveTab('testcases')}
          >
            <TestTubes size={14} />
            <span>Test Cases</span>
          </button>
        </div>

        <div className="card-topbar-actions">
          {activeTab !== 'testcases' && (
            <button className="tab-btn" onClick={handleCopy} title="Copy Content">
              {copied ? <Check size={14} color="#16a34a" /> : <Copy size={14} />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          )}

          <button className="tab-btn" onClick={onClearOutput} title="Clear Output">
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Main Output Body */}
      <div className="output-body">
        {activeTab === 'stdout' && (
          <div className="output-content-area">
            {isRunning ? (
              <div className="empty-state">
                <span style={{ fontSize: '0.9rem', color: '#64748b' }}>Executing in sandboxed container...</span>
              </div>
            ) : result?.stdout ? (
              <pre style={{ whiteSpace: 'pre-wrap', color: '#0f172a' }}>{result.stdout}</pre>
            ) : result ? (
              <div className="empty-state">
                <p>Execution finished with no standard output.</p>
                {(result.stderr || result.compile_output) && (
                  <p style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: 4 }}>
                    See Diagnostics tab for compiler/runtime logs.
                  </p>
                )}
              </div>
            ) : (
              <div className="empty-state">
                <p>Run your code (Ctrl + Enter) to see standard output here.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'stdin' && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '0.5rem 1rem', background: '#fafbfc', borderBottom: '1px solid #e2e8f0', fontSize: '0.75rem', color: '#64748b' }}>
              Standard input passed directly to your program via STDIN (cin, Scanner, sys.stdin, fs.readFileSync)
            </div>
            <textarea
              className="stdin-textarea"
              placeholder="Enter custom input lines here..."
              value={stdin}
              onChange={(e) => onStdinChange(e.target.value)}
            />
          </div>
        )}

        {activeTab === 'stderr' && (
          <div className="output-content-area">
            {result?.compile_output ? (
              <div>
                <h4 style={{ color: '#dc2626', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Compiler Diagnostic:</h4>
                <div className="code-block" style={{ color: '#b91c1c', background: '#fef2f2', borderColor: '#fecaca' }}>
                  {result.compile_output}
                </div>
              </div>
            ) : null}

            {result?.stderr ? (
              <div style={{ marginTop: result?.compile_output ? '1rem' : '0' }}>
                <h4 style={{ color: '#dc2626', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Standard Error (stderr):</h4>
                <div className="code-block" style={{ color: '#b91c1c', background: '#fef2f2', borderColor: '#fecaca' }}>
                  {result.stderr}
                </div>
              </div>
            ) : null}

            {!result?.compile_output && !result?.stderr && (
              <div className="empty-state">
                <p>No compiler or runtime errors detected.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'testcases' && (
          <div className="output-content-area">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>
                Automated Test Verification
              </span>
              <button
                className="btn-secondary"
                onClick={onRunTestCases}
                disabled={isRunning}
                style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}
              >
                Run All Cases
              </button>
            </div>

            <div className="testcase-list">
              {testCases.map((tc, index) => (
                <div
                  key={tc.id}
                  className={`testcase-card ${
                    tc.passed === true ? 'passed' : tc.passed === false ? 'failed' : ''
                  }`}
                >
                  <div className="testcase-header">
                    <span>
                      Case {index + 1}: {tc.title}
                    </span>
                    {tc.passed === true && (
                      <span style={{ color: '#16a34a', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <CheckCircle2 size={14} /> Passed {tc.time ? `(${tc.time}s)` : ''}
                      </span>
                    )}
                    {tc.passed === false && (
                      <span style={{ color: '#dc2626', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <XCircle size={14} /> Failed {tc.statusDescription ? `(${tc.statusDescription})` : ''}
                      </span>
                    )}
                  </div>

                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>Input:</div>
                  <div className="code-block">{tc.input || '(empty)'}</div>

                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.4rem' }}>Expected Output:</div>
                  <div className="code-block">{tc.expectedOutput}</div>

                  {tc.actualOutput !== undefined && (
                    <>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.4rem' }}>Actual Output:</div>
                      <div className="code-block" style={{ color: tc.passed ? '#15803d' : '#b91c1c' }}>
                        {tc.actualOutput || '(no output)'}
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Execution Telemetry Ribbon */}
      <div className="metrics-ribbon">
        <div className="metric-item">
          <span>Verdict:</span>
          {getVerdictBadge()}
        </div>

        <div className="metric-item">
          <Clock size={13} />
          <span>Time:</span>
          <span className="metric-val">{result?.time ? `${Math.round(parseFloat(result.time) * 1000)} ms` : '--'}</span>
        </div>

        <div className="metric-item">
          <Cpu size={13} />
          <span>Memory:</span>
          <span className="metric-val">{result?.memory ? `${result.memory} KB` : '--'}</span>
        </div>

        <div className="metric-item">
          <span>Exit Code:</span>
          <span className="metric-val">{result?.exit_code !== null && result?.exit_code !== undefined ? result.exit_code : '--'}</span>
        </div>
      </div>
    </div>
  );
};
