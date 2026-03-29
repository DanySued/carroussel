import { Terminal, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface LogEntry {
  id: string;
  message: string;
  timestamp: string;
}

interface TerminalLogProps {
  logs: LogEntry[];
  isVisible: boolean;
  onClose: () => void;
}

export function TerminalLog({ logs, isVisible, onClose }: TerminalLogProps) {
  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="absolute bottom-0 left-0 right-0 h-48 bg-surface-panel/95 backdrop-blur-xl border-t border-white/10 z-50"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-white/5">
          <div className="flex items-center gap-3">
            {/* macOS-style traffic lights */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={onClose}
                aria-label="Close terminal"
                className="w-3 h-3 rounded-full bg-red-500/80 hover:bg-red-500 transition-colors"
              />
              <div className="w-3 h-3 rounded-full bg-yellow-500/40" />
              <div className="w-3 h-3 rounded-full bg-green-500/40" />
            </div>
            <div className="flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5 text-green-400" />
              <span className="text-xs font-mono text-gray-400">Terminal Output</span>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close terminal"
            className="w-6 h-6 rounded hover:bg-white/10 flex items-center justify-center transition-colors"
          >
            <X className="w-3.5 h-3.5 text-gray-500" />
          </button>
        </div>

        {/* Log Content */}
        <div role="log" aria-live="polite" aria-label="Terminal output" className="h-[calc(100%-40px)] overflow-y-auto p-4 font-mono text-sm">
          {logs.length === 0 ? (
            <div className="text-gray-500 text-xs">Waiting for process...</div>
          ) : (
            <div className="space-y-1">
              {logs.map((log) => (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex gap-3 text-xs"
                >
                  <span className="text-gray-600">{log.timestamp}</span>
                  <span className="text-green-400">{log.message}</span>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
