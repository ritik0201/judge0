import React from 'react';
import { 
  Play, 
  RotateCcw, 
  Code2, 
  CheckCircle2, 
  AlertCircle, 
  ChevronDown, 
  Layers,
  Sparkles,
  Loader2
} from 'lucide-react';
import { BackendStatus, CodePreset, LanguageOption } from '../types';

interface HeaderProps {
  languages: LanguageOption[];
  selectedLanguage: LanguageOption;
  onSelectLanguage: (lang: LanguageOption) => void;
  presets: CodePreset[];
  onSelectPreset: (preset: CodePreset) => void;
  backendStatus: BackendStatus;
  isRunning: boolean;
  onRunCode: () => void;
  onResetCode: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  languages,
  selectedLanguage,
  onSelectLanguage,
  presets,
  onSelectPreset,
  backendStatus,
  isRunning,
  onRunCode,
  onResetCode,
}) => {
  return (
    <header className="studio-header">
      {/* Brand Section */}
      <div className="brand-section">
        <div className="brand-badge">
          <Code2 size={20} strokeWidth={2.5} />
        </div>
        <div>
          <div className="brand-title">
            Judge0 Studio
            <span className="brand-pill">Light Edition</span>
          </div>
        </div>
      </div>

      {/* Center Controls: Language & Presets */}
      <div className="header-controls">
        {/* Language Selector */}
        <div className="select-wrapper">
          <select
            className="select-control"
            value={selectedLanguage.id}
            onChange={(e) => {
              const lang = languages.find((l) => l.id === e.target.value);
              if (lang) onSelectLanguage(lang);
            }}
          >
            {languages.map((lang) => (
              <option key={lang.id} value={lang.id}>
                {lang.name} ({lang.version})
              </option>
            ))}
          </select>
          <ChevronDown size={14} style={{ position: 'absolute', right: 10, pointerEvents: 'none', color: '#64748b' }} />
        </div>

        {/* Code Presets */}
        <div className="select-wrapper">
          <select
            className="select-control"
            defaultValue=""
            onChange={(e) => {
              const preset = presets.find((p) => p.id === e.target.value);
              if (preset) {
                onSelectPreset(preset);
                e.target.value = ''; // reset dropdown
              }
            }}
          >
            <option value="" disabled>
              Select Algorithm Preset...
            </option>
            {presets.map((preset) => (
              <option key={preset.id} value={preset.id}>
                {preset.title}
              </option>
            ))}
          </select>
          <Sparkles size={14} style={{ position: 'absolute', right: 10, pointerEvents: 'none', color: '#f59e0b' }} />
        </div>

        {/* Reset Code Template */}
        <button
          className="btn-secondary"
          onClick={onResetCode}
          title="Reset to default language boilerplate"
        >
          <RotateCcw size={14} />
          Reset
        </button>
      </div>

      {/* Right Controls: Status & Execution CTA */}
      <div className="header-controls">
        {/* Backend Status Indicator */}
        <div 
          className="status-pill" 
          title={backendStatus.details || 'Connection Status'}
        >
          <span 
            className={`status-dot ${backendStatus.isOnline ? 'online' : 'offline'}`} 
          />
          <span>
            {backendStatus.isOnline 
              ? `${backendStatus.provider === 'devlab' ? 'DevLab Proxy' : 'Judge0 Direct'} (${backendStatus.latencyMs}ms)`
              : 'Backend Offline'}
          </span>
        </div>

        {/* Run Button */}
        <button
          className="btn-run"
          onClick={onRunCode}
          disabled={isRunning}
          title="Run Code (Ctrl + Enter)"
        >
          {isRunning ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>Executing...</span>
            </>
          ) : (
            <>
              <Play size={16} fill="white" />
              <span>Run Code</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
};
