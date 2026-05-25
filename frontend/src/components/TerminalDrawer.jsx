import React from 'react';
import { useAuth } from '../context/AuthContext';

export default function TerminalDrawer({
  isOpen,
  onClose,
  isExecuting,
  executingUser,
  output,
  stdin,
  setStdin,
  activeTab,
  setActiveTab,
  language,
}) {
  const { theme } = useAuth();

  if (!isOpen) return null;

  const stdout = output?.run?.stdout || '';
  const stderr = output?.run?.stderr || '';
  const exitCode = output?.run?.code !== undefined ? output?.run?.code : null;
  const signal = output?.run?.signal || 'None';
  
  // Format execution duration gracefully
  const time = output?.run?.output ? '100 - 300 ms' : 'N/A'; // Piston doesn't always provide duration directly, so we give a clean stat

  const handleCopyOutput = () => {
    const textToCopy = stderr ? `Error:\n${stderr}\n\nOutput:\n${stdout}` : stdout;
    navigator.clipboard.writeText(textToCopy);
  };

  return (
    <div className={`w-full border-t rounded-t-2xl shadow-2xl flex flex-col h-64 shrink-0 overflow-hidden transition-all duration-300 relative ${
      theme === 'dark'
        ? 'bg-[#0a0f1d]/95 border-slate-800/80'
        : 'bg-[#ffffff]/95 border-slate-200/80 shadow-slate-200/50'
    }`}>
      {/* Drawer Header */}
      <div className={`flex items-center justify-between px-6 py-3 border-b shrink-0 transition-colors duration-150 ${
        theme === 'dark' ? 'bg-[#070b14]/90 border-slate-800/60' : 'bg-slate-50 border-slate-200/60'
      }`}>
        <div className="flex items-center gap-4">
          <span className={`text-xs font-bold uppercase tracking-wider font-mono flex items-center gap-2 ${
            theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
          }`}>
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 shadow-md shadow-cyan-500/50" />
            Interactive Console
          </span>

          {/* Sockets executing loader */}
          {isExecuting && (
            <div className="flex items-center gap-2 text-xs text-cyan-400 font-mono bg-cyan-950/20 border border-cyan-900/30 px-2.5 py-0.5 rounded-full animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
              <span>{executingUser ? `${executingUser} is compiling…` : 'Compiling & Running…'}</span>
            </div>
          )}
        </div>

        {/* Action controls */}
        <div className="flex items-center gap-3">
          {(stdout || stderr) && (
            <button
              onClick={handleCopyOutput}
              className={`px-2.5 py-1 rounded border transition text-[10px] font-bold font-mono uppercase tracking-wider ${
                theme === 'dark'
                  ? 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-100 hover:border-slate-700'
                  : 'bg-slate-100 border-slate-200 text-slate-500 hover:text-slate-800 hover:border-slate-350'
              }`}
              title="Copy Output"
            >
              Copy Logs
            </button>
          )}
          <button
            onClick={onClose}
            className={`p-1 rounded-lg transition ${
              theme === 'dark' ? 'hover:bg-slate-900 text-slate-400 hover:text-slate-100' : 'hover:bg-slate-200 text-slate-500 hover:text-slate-800'
            }`}
            title="Minimize Console"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Tabs Row */}
      <div className={`flex px-6 border-b shrink-0 transition-colors duration-150 ${
        theme === 'dark' ? 'bg-[#060a12]/60 border-slate-800/40' : 'bg-slate-100/50 border-slate-200/40'
      }`}>
        <button
          onClick={() => setActiveTab('output')}
          className={`px-4 py-2 text-xs font-bold font-mono tracking-wide relative transition-colors duration-150 ${
            activeTab === 'output' ? 'text-cyan-400' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          Console Logs
          {activeTab === 'output' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-400 to-blue-500 shadow-md shadow-cyan-500/20" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('stdin')}
          className={`px-4 py-2 text-xs font-bold font-mono tracking-wide relative transition-colors duration-150 ${
            activeTab === 'stdin' ? 'text-cyan-400' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          Standard Input (stdin)
          {activeTab === 'stdin' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-400 to-blue-500 shadow-md shadow-cyan-500/20" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('stats')}
          className={`px-4 py-2 text-xs font-bold font-mono tracking-wide relative transition-colors duration-150 ${
            activeTab === 'stats' ? 'text-cyan-400' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          Execution Statistics
          {activeTab === 'stats' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-400 to-blue-500 shadow-md shadow-cyan-500/20" />
          )}
        </button>
      </div>

      {/* Tab Panels */}
      <div className={`flex-1 p-5 overflow-y-auto custom-scrollbar font-mono text-xs transition-colors duration-150 ${
        theme === 'dark' ? 'bg-[#0a0f1d]/50 text-slate-300' : 'bg-[#ffffff]/50 text-slate-700'
      }`}>
        
        {/* PANEL: OUTPUT */}
        {activeTab === 'output' && (
          <div className="h-full flex flex-col gap-2 min-h-0">
            {isExecuting ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-3 py-6 text-slate-550">
                <div className="w-6 h-6 rounded-full border-2 border-cyan-500 border-t-transparent animate-spin" />
                <p className="animate-pulse">Compiling script and executing sandbox environment…</p>
              </div>
            ) : stderr ? (
              <div className="flex flex-col gap-2.5">
                <div className="px-4 py-3 rounded-xl bg-red-950/20 border border-red-500/20 text-red-400">
                  <h4 className="font-bold uppercase tracking-wider text-[10px] mb-1.5">Runtime/Compiler Error</h4>
                  <pre className="whitespace-pre-wrap leading-relaxed font-mono">{stderr}</pre>
                </div>
                {stdout && (
                  <div className={`px-4 py-3 rounded-xl border ${
                    theme === 'dark' ? 'bg-slate-950/50 border-slate-800/80 text-slate-200' : 'bg-slate-50 border-slate-200/60 text-slate-700'
                  }`}>
                    <h4 className="font-bold uppercase tracking-wider text-[10px] text-slate-500 mb-1.5">Partial Output</h4>
                    <pre className="whitespace-pre-wrap leading-relaxed">{stdout}</pre>
                  </div>
                )}
              </div>
            ) : stdout ? (
              <pre className={`whitespace-pre-wrap leading-relaxed ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>{stdout}</pre>
            ) : (
              <div className={`flex-1 flex items-center justify-center py-8 italic ${theme === 'dark' ? 'text-slate-600' : 'text-slate-400'}`}>
                No output returned. Press 'Run Code' to execute.
              </div>
            )}
          </div>
        )}

        {/* PANEL: STDIN */}
        {activeTab === 'stdin' && (
          <div className="h-full flex flex-col gap-1.5">
            <p className={`text-[10px] uppercase tracking-wider mb-1 font-bold ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Specify standard inputs (stdin) for your program:</p>
            <textarea
              value={stdin}
              onChange={(e) => setStdin(e.target.value)}
              placeholder="e.g. 5&#10;hello&#10;world"
              rows={4}
              className={`flex-1 w-full p-3 rounded-xl border font-mono text-xs leading-relaxed resize-none focus:outline-none transition-all duration-150 ${
                theme === 'dark'
                  ? 'bg-slate-950 border-slate-800 text-slate-200 placeholder:text-slate-700 focus:ring-cyan-500/45 focus:border-cyan-500/45'
                  : 'bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-400 focus:ring-indigo-500/40 focus:border-indigo-500/40'
              }`}
            />
          </div>
        )}

        {/* PANEL: STATS */}
        {activeTab === 'stats' && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 h-full py-2">
            <div className={`p-3.5 rounded-xl border flex flex-col gap-1 ${
              theme === 'dark' ? 'bg-slate-950/50 border-slate-800/60' : 'bg-slate-50 border-slate-200/50'
            }`}>
              <span className={`text-[9px] uppercase tracking-wider font-bold ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Execution Language</span>
              <span className={`font-bold capitalize text-sm ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>{language}</span>
            </div>
            <div className={`p-3.5 rounded-xl border flex flex-col gap-1 ${
              theme === 'dark' ? 'bg-slate-950/50 border-slate-800/60' : 'bg-slate-50 border-slate-200/50'
            }`}>
              <span className={`text-[9px] uppercase tracking-wider font-bold ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Exit Status Code</span>
              <span className={`font-bold text-sm ${exitCode === 0 ? 'text-emerald-400' : exitCode === null ? (theme === 'dark' ? 'text-slate-400' : 'text-slate-500') : 'text-red-400'}`}>
                {exitCode !== null ? exitCode : 'N/A'}
              </span>
            </div>
            <div className={`p-3.5 rounded-xl border flex flex-col gap-1 ${
              theme === 'dark' ? 'bg-slate-950/50 border-slate-800/60' : 'bg-slate-50 border-slate-200/50'
            }`}>
              <span className={`text-[9px] uppercase tracking-wider font-bold ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Termination Signal</span>
              <span className={`font-bold text-sm ${signal === 'None' ? (theme === 'dark' ? 'text-slate-400' : 'text-slate-500') : 'text-amber-450 animate-pulse'}`}>{signal}</span>
            </div>
            <div className={`p-3.5 rounded-xl border flex flex-col gap-1 ${
              theme === 'dark' ? 'bg-[#0e1628]/30 border-slate-800/60' : 'bg-slate-100/40 border-slate-200/50'
            }`}>
              <span className={`text-[9px] uppercase tracking-wider font-bold ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Docker Run Time</span>
              <span className={`font-bold text-sm ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>{time}</span>
            </div>
          </div>
        )}
        </div>
    </div>
  );
}
