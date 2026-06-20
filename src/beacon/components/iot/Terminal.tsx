'use client';

import React, { useEffect, useRef } from 'react';
import { Terminal as XTerm } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';
import { useIotStore } from '@/store/useIotStore';
import { TerminalIcon, Trash2 } from 'lucide-react';

export const Terminal: React.FC = () => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<XTerm | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  
  const { logs, clearLogs, adapter } = useIotStore();

  useEffect(() => {
    if (!terminalRef.current) return;

    const term = new XTerm({
      theme: {
        background: '#1e1e1e',
        foreground: '#d4d4d4',
        cursor: '#ffffff',
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
                  // Only open term when we actually have dimensions
                  term.open(terminalRef.current);
                  xtermRef.current = term;
                  fitAddonRef.current = fitAddon;
                  
                  term.writeln('\x1b[32m[IoT Workbench] Terminal initialized.\x1b[0m');
                  term.writeln('\x1b[90mWaiting for device connection...\x1b[0m');
                  
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

    return () => {
      window.removeEventListener('resize', handleResize);
      resizeObserver.disconnect();
      clearTimeout(resizeTimeout);
      term.dispose();
      xtermRef.current = null;
    };
  }, []);

  // Use a ref to track how many logs we've already written to avoid rewriting or skipping
  const writtenLogsCount = useRef(0);

  // Sync logs from Zustand store to xterm
  useEffect(() => {
    if (!xtermRef.current) return;
    
    // If logs were cleared, reset our counter
    if (logs.length === 0 && writtenLogsCount.current > 0) {
      writtenLogsCount.current = 0;
      return;
    }

    // Only write new logs that haven't been written yet
    if (logs.length > writtenLogsCount.current) {
      const newLogs = logs.slice(writtenLogsCount.current);
      
      try {
        // Group multiple logs into one write operation for performance
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

  return (
    <div className="flex flex-col h-full w-full bg-[#1e1e1e] rounded-md overflow-hidden border border-gray-800">
      <div className="flex items-center justify-between px-4 py-2 bg-[#2d2d2d] border-b border-gray-800">
        <div className="flex items-center space-x-2 text-gray-300">
          <TerminalIcon size={16} />
          <span className="text-sm font-medium">Serial Monitor</span>
        </div>
        <div className="flex items-center space-x-4">
          <button 
            onClick={handleClear}
            className="text-gray-400 hover:text-white transition-colors"
            title="Clear Terminal"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
      <div 
        ref={terminalRef} 
        className="flex-grow p-2" 
        style={{ minHeight: '300px' }}
      />
    </div>
  );
};
