'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Terminal as XTerm } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';
import { useIotStore } from '@/store/useIotStore';
import { TerminalIcon, Trash2, Send, CornerDownLeft, History, Cpu } from 'lucide-react';

const QUICK_COMMANDS = [
  { label: 'Help', value: 'help', description: 'Show device help menu' },
  { label: 'Status', value: 'status', description: 'Get current system status' },
  { label: 'Reboot', value: 'reboot', description: 'Perform software reset' },
  { label: 'Config', value: 'config', description: 'Print loaded settings' },
];

export const Terminal: React.FC = () => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<XTerm | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  
  const { logs, clearLogs, adapter, status } = useIotStore();

  const [command, setCommand] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number | null>(null);
  const [lineEnding, setLineEnding] = useState<string>('\r\n');

  // Load history from localStorage on client side
  useEffect(() => {
    try {
      const stored = localStorage.getItem('iot_command_history');
      if (stored) {
        setHistory(JSON.parse(stored));
      }
    } catch (e) {
      console.warn('Failed to load command history', e);
    }
  }, []);

  // Update localStorage when history changes
  const saveHistory = (newHistory: string[]) => {
    setHistory(newHistory);
    try {
      localStorage.setItem('iot_command_history', JSON.stringify(newHistory));
    } catch (e) {
      console.warn('Failed to save command history', e);
    }
  };

  useEffect(() => {
    if (!terminalRef.current) return;

    const term = new XTerm({
      theme: {
        background: '#1e1e1e',
        foreground: '#d4d4d4',
        cursor: '#ffffff',
        selectionBackground: '#5c5c5c',
      },
      fontFamily: 'Menlo, Monaco, "Courier New", monospace',
      fontSize: 14,
      cursorBlink: true,
      scrollback: 10000,
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);

    let isTermOpened = false;
    let resizeTimeout: NodeJS.Timeout;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width > 0 && entry.contentRect.height > 0) {
          clearTimeout(resizeTimeout);
          resizeTimeout = setTimeout(() => {
            try {
              if (terminalRef.current?.clientWidth) {
                if (!isTermOpened) {
                  term.open(terminalRef.current);
                  xtermRef.current = term;
                  fitAddonRef.current = fitAddon;
                  
                  term.writeln('\x1b[32m[IoT Workbench] Serial Monitor initialized.\x1b[0m');
                  term.writeln('\x1b[90mLeft Pane: Device logs / Interactive shell. Right Pane: Command console.\x1b[0m');
                  if (useIotStore.getState().status === 'connected') {
                    term.writeln('\x1b[32m[Connected] Ready for interaction.\x1b[0m');
                  } else {
                    term.writeln('\x1b[90mWaiting for device connection...\x1b[0m');
                  }
                  
                  // Write any logs that were buffered before the terminal opened
                  const currentLogs = useIotStore.getState().logs;
                  if (currentLogs.length > 0) {
                    term.write(currentLogs.join('').replace(/\n/g, '\r\n'));
                    writtenLogsCount.current = currentLogs.length;
                  }
                  
                  isTermOpened = true;
                }
                fitAddon.fit();
              }
            } catch (e) {
              console.warn('xterm.js initialization/fit error:', e);
            }
          }, 50);
        }
      }
    });

    resizeObserver.observe(terminalRef.current);

    const handleResize = () => {
      try {
        if (isTermOpened && terminalRef.current && terminalRef.current.clientWidth > 0) {
          fitAddon.fit();
        }
      } catch (e) {}
    };
    window.addEventListener('resize', handleResize);

    // Keyboard interaction directly inside the terminal window
    const dataListener = term.onData((data) => {
      const state = useIotStore.getState();
      if (state.status === 'connected' && state.adapter) {
        state.adapter.write(data).catch((e) => {
          console.warn('Serial direct write error:', e);
        });
      }
    });

    return () => {
      window.removeEventListener('resize', handleResize);
      resizeObserver.disconnect();
      clearTimeout(resizeTimeout);
      dataListener.dispose();
      term.dispose();
      xtermRef.current = null;
    };
  }, []);

  const writtenLogsCount = useRef(0);

  // Sync logs from Zustand store to xterm
  useEffect(() => {
    if (!xtermRef.current) return;
    
    if (logs.length === 0 && writtenLogsCount.current > 0) {
      writtenLogsCount.current = 0;
      return;
    }

    if (logs.length > writtenLogsCount.current) {
      const newLogs = logs.slice(writtenLogsCount.current);
      
      try {
        const chunk = newLogs.join('').replace(/\n/g, '\r\n');
        xtermRef.current.write(chunk);
        writtenLogsCount.current = logs.length;
      } catch (e) {
        console.warn('xterm.js write error:', e);
      }
    }
  }, [logs]);

  const handleClear = () => {
    if (xtermRef.current) {
      xtermRef.current.clear();
      xtermRef.current.writeln('\x1b[32m[IoT Workbench] Terminal cleared.\x1b[0m');
    }
    clearLogs();
  };

  const sendCommand = async (cmdText: string) => {
    if (!cmdText.trim()) return;
    
    // Add to local terminal display
    if (xtermRef.current) {
      xtermRef.current.write(`\r\n\x1b[36m> ${cmdText}\x1b[0m\r\n`);
    }

    // Add to history
    const filteredHistory = history.filter(h => h !== cmdText);
    const newHistory = [...filteredHistory, cmdText].slice(-100);
    saveHistory(newHistory);
    setHistoryIndex(null);

    if (adapter && status === 'connected') {
      try {
        const payload = cmdText + (lineEnding === 'none' ? '' : lineEnding);
        await adapter.write(payload);
      } catch (e) {
        console.error('Failed to write to device adapter:', e);
        if (xtermRef.current) {
          xtermRef.current.write(`\x1b[31m\r\n[Error] Failed to send: ${(e as Error).message}\x1b[0m\r\n`);
        }
      }
    } else {
      if (xtermRef.current) {
        xtermRef.current.write('\x1b[33m\r\n[Warning] Command not sent: Device is disconnected.\x1b[0m\r\n');
      }
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!command) return;
    sendCommand(command);
    setCommand('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (history.length === 0) return;

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      const nextIndex = historyIndex === null ? history.length - 1 : Math.max(0, historyIndex - 1);
      setHistoryIndex(nextIndex);
      setCommand(history[nextIndex]);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex === null) return;
      
      const nextIndex = historyIndex + 1;
      if (nextIndex >= history.length) {
        setHistoryIndex(null);
        setCommand('');
      } else {
        setHistoryIndex(nextIndex);
        setCommand(history[nextIndex]);
      }
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-full w-full bg-[#1e1e1e] rounded-md overflow-hidden border border-gray-800 shadow-xl">
      {/* Left Pane: Device Logs */}
      <div className="flex flex-col flex-grow min-w-0 h-1/2 lg:h-full border-b lg:border-b-0 lg:border-r border-gray-800">
        <div className="flex items-center justify-between px-4 py-2 bg-[#2d2d2d] border-b border-gray-800 select-none">
          <div className="flex items-center space-x-2 text-gray-300">
            <TerminalIcon size={16} className="text-blue-400" />
            <span className="text-sm font-medium">Device Logs & Output</span>
            {status === 'connected' && (
              <span className="flex items-center text-[10px] bg-green-950 text-green-400 border border-green-800 px-1.5 py-0.5 rounded ml-2 animate-pulse">
                LIVE
              </span>
            )}
          </div>
          <button 
            onClick={handleClear}
            className="text-gray-400 hover:text-white transition-colors p-1 hover:bg-[#3d3d3d] rounded"
            title="Clear Output"
          >
            <Trash2 size={16} />
          </button>
        </div>
        <div 
          ref={terminalRef} 
          className="flex-grow p-2 overflow-hidden bg-[#1e1e1e]" 
        />
      </div>

      {/* Right Pane: Command Input & Console */}
      <div className="flex flex-col w-full lg:w-[380px] bg-[#151515] h-1/2 lg:h-full">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2 bg-[#202020] border-b border-gray-800 select-none">
          <div className="flex items-center space-x-2 text-gray-300">
            <Cpu size={16} className="text-teal-400" />
            <span className="text-sm font-medium">Interactive Command Console</span>
          </div>
          <div className="flex items-center">
            {status === 'connected' ? (
              <span className="h-2 w-2 rounded-full bg-green-500" title="Connected" />
            ) : (
              <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" title="Disconnected" />
            )}
          </div>
        </div>

        {/* Command History View */}
        <div className="flex-grow overflow-y-auto p-4 space-y-3 flex flex-col justify-end min-h-0">
          <div className="space-y-2 max-h-full overflow-y-auto pr-1">
            {history.length === 0 ? (
              <div className="text-center text-gray-600 text-xs py-8">
                <History size={24} className="mx-auto mb-2 opacity-30" />
                <p>No recent commands</p>
                <p className="text-[10px] mt-1">Commands sent from here will be saved</p>
              </div>
            ) : (
              <>
                <div className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold mb-2 flex items-center justify-between">
                  <span>Command History</span>
                  <button 
                    onClick={() => saveHistory([])} 
                    className="hover:text-red-400 transition-colors text-[9px]"
                  >
                    Clear History
                  </button>
                </div>
                {history.map((cmdText, idx) => (
                  <div 
                    key={idx} 
                    className="group flex items-center justify-between p-1.5 rounded bg-[#1e1e1e] border border-gray-800 hover:border-gray-700 text-xs font-mono text-teal-400"
                  >
                    <span className="truncate pr-2 cursor-pointer hover:underline" onClick={() => setCommand(cmdText)}>
                      {cmdText}
                    </span>
                    <button
                      onClick={() => sendCommand(cmdText)}
                      disabled={status !== 'connected'}
                      className="opacity-0 group-hover:opacity-100 transition-opacity bg-teal-900/40 text-teal-300 hover:bg-teal-800 border border-teal-800 text-[10px] px-2 py-0.5 rounded disabled:opacity-30 disabled:hover:bg-teal-900/40"
                    >
                      Resend
                    </button>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>

        {/* Quick Action Commands */}
        <div className="px-4 py-2 border-t border-gray-800/80 bg-[#1a1a1a]">
          <div className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold mb-2">
            Quick Actions
          </div>
          <div className="grid grid-cols-2 gap-2">
            {QUICK_COMMANDS.map((qCmd) => (
              <button
                key={qCmd.value}
                onClick={() => sendCommand(qCmd.value)}
                disabled={status !== 'connected'}
                title={qCmd.description}
                className="flex items-center justify-between px-2.5 py-1.5 text-left text-xs bg-[#242424] hover:bg-[#2d2d2d] border border-gray-800 hover:border-gray-700 text-gray-300 rounded font-medium disabled:opacity-40 disabled:hover:bg-[#242424] transition-colors"
              >
                <span className="font-mono text-teal-400">{qCmd.value}</span>
                <span className="text-[9px] text-gray-500 font-normal truncate max-w-[80px]">
                  {qCmd.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-gray-800 bg-[#202020]">
          <form onSubmit={handleFormSubmit} className="space-y-3">
            <div className="flex items-center space-x-2">
              <div className="relative flex-grow">
                <input
                  type="text"
                  value={command}
                  onChange={(e) => setCommand(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={status !== 'connected'}
                  placeholder={status === 'connected' ? 'Enter serial command...' : 'Device disconnected'}
                  className="w-full bg-[#151515] border border-gray-800 focus:border-teal-500 text-white placeholder-gray-600 rounded px-3 py-2 text-sm focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed font-mono"
                />
                {status === 'connected' && (
                  <div className="absolute right-2.5 top-2.5 text-[10px] text-gray-600 pointer-events-none flex items-center space-x-0.5">
                    <CornerDownLeft size={10} />
                    <span>Enter</span>
                  </div>
                )}
              </div>
              <button
                type="submit"
                disabled={status !== 'connected' || !command.trim()}
                className="bg-teal-600 hover:bg-teal-500 text-white p-2 rounded shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Send Command"
              >
                <Send size={16} />
              </button>
            </div>

            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Line Ending:</span>
              <select
                value={lineEnding}
                onChange={(e) => setLineEnding(e.target.value)}
                disabled={status !== 'connected'}
                className="bg-[#151515] border border-gray-800 rounded px-2 py-1 text-gray-400 focus:outline-none focus:border-teal-500 disabled:opacity-50"
              >
                <option value="\r\n">Both NL & CR (\r\n)</option>
                <option value="\n">Newline (\n)</option>
                <option value="\r">Carriage Return (\r)</option>
                <option value="none">No Line Ending</option>
              </select>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
