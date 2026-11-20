import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import { Copy, Check, FileCode, ZoomIn, ZoomOut } from 'lucide-react';
import { LanguageOption } from '../types';

interface EditorPanelProps {
  language: LanguageOption;
  code: string;
  onChange: (value: string | undefined) => void;
  onRun: () => void;
}

export const EditorPanel: React.FC<EditorPanelProps> = ({
  language,
  code,
  onChange,
  onRun,
}) => {
  const [copied, setCopied] = useState(false);
  const [fontSize, setFontSize] = useState(14);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const handleEditorKeyDown = (e: any) => {
    // Ctrl + Enter or Cmd + Enter to trigger execution
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      onRun();
    }
  };

  return (
    <div className="editor-card">
      <div className="card-topbar">
        <div className="file-tab">
          <FileCode size={16} color="#2563eb" />
          <span>main.{language.extension}</span>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 400, marginLeft: 8 }}>
            ({language.version})
          </span>
        </div>

        <div className="card-topbar-actions">
          {/* Font Size Controls */}
          <button
            className="tab-btn"
            onClick={() => setFontSize((s) => Math.max(12, s - 1))}
            title="Decrease font size"
          >
            <ZoomOut size={13} />
          </button>
          <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
            {fontSize}px
          </span>
          <button
            className="tab-btn"
            onClick={() => setFontSize((s) => Math.min(20, s + 1))}
            title="Increase font size"
          >
            <ZoomIn size={13} />
          </button>

          <div style={{ width: 1, height: 16, background: '#e2e8f0', margin: '0 4px' }} />

          {/* Copy Button */}
          <button
            className="tab-btn"
            onClick={handleCopy}
            title="Copy Source Code"
          >
            {copied ? <Check size={14} color="#16a34a" /> : <Copy size={14} />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>

      <div className="editor-body">
        <Editor
          height="100%"
          language={language.monacoLanguage}
          value={code}
          theme="vs" // Official Clean Light Mode
          onChange={onChange}
          options={{
            fontSize: fontSize,
            fontFamily: "'JetBrains Mono', Consolas, Menlo, Monaco, monospace",
            fontLigatures: true,
            minimap: { enabled: false },
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 4,
            padding: { top: 12, bottom: 12 },
            wordWrap: 'on',
            lineDecorationsWidth: 10,
            renderLineHighlight: 'all',
            cursorBlinking: 'smooth',
            overviewRulerBorder: false,
          }}
        />
      </div>
    </div>
  );
};
