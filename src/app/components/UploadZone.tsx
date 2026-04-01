import React, { useState } from 'react';
import { Upload, FileText, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface UploadZoneProps {
  onFileUpload: (file: File) => void;
}

const fileFormats = [
  { label: 'PDF', className: 'text-red-400 bg-red-500/10 border-red-500/20' },
  { label: 'DOCX', className: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
  { label: 'TXT', className: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
];

export function UploadZone({ onFileUpload }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (
      file &&
      (file.type === 'application/pdf' ||
        file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        file.type === 'text/plain')
    ) {
      onFileUpload(file);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileUpload(file);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      role="region"
      aria-label="File upload area. Drag and drop or use the Browse Files button."
      className={`
        relative w-full h-full flex items-center justify-center overflow-hidden
        rounded-3xl transition-all duration-500 border-2
        ${isDragging
          ? 'border-purple-500/50 bg-purple-500/5'
          : 'border-white/5 bg-white/[0.015] hover:border-purple-500/30 hover:bg-purple-500/[0.02]'
        }
      `}
    >
      {/* Grid Pattern Background */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
          maskImage: 'radial-gradient(circle at center, black, transparent 80%)',
          WebkitMaskImage: 'radial-gradient(circle at center, black, transparent 80%)'
        }}
      />

      {/* Dynamic Glow Effect */}
      <AnimatePresence>
        {(isDragging || isHovering) && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
          >
            <div className="w-64 h-64 bg-purple-500/20 rounded-full blur-[80px]" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Absolute exact center block for the icon only */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
        <motion.div
          animate={{ 
            y: isDragging ? -10 : 0,
            scale: isDragging ? 1.05 : 1
          }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="relative"
          style={{ width: '88px', height: '88px' }}
        >
          {/* Abstract background shapes around icon */}
          <motion.div 
            animate={{ rotate: isDragging ? 180 : 0 }}
            transition={{ duration: 0.8, ease: "backOut" }}
            className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-indigo-500/20 rounded-2xl rotate-6 border border-white/10"
          />
          <motion.div 
            animate={{ rotate: isDragging ? -180 : 0 }}
            transition={{ duration: 0.8, ease: "backOut" }}
            className="absolute inset-0 bg-gradient-to-tl from-purple-500/20 to-fuchsia-500/20 rounded-2xl -rotate-6 border border-white/10"
          />
          
          <div className="absolute inset-0 bg-surface-base rounded-2xl flex items-center justify-center shadow-xl border border-white/10">
            <AnimatePresence mode="wait">
              {isDragging ? (
                <motion.div
                  key="dragging"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  className="flex items-center justify-center w-full h-full"
                >
                  <Sparkles className="w-10 h-10 text-purple-400" />
                </motion.div>
              ) : (
                <motion.div
                  key="idle"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  className="flex items-center justify-center w-full h-full"
                >
                  <Upload className="w-10 h-10 text-purple-400/80" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      {/* Content strictly below the icon */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 translate-y-[60px] text-center w-full px-8 z-10 flex flex-col items-center">
        <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 mb-2 whitespace-nowrap">
          {isDragging ? 'Drop to transform' : 'Upload your document'}
        </h3>

        <p className="text-sm text-zinc-500 mb-5 max-w-[260px] mx-auto leading-relaxed">
          Drag and drop your file here or click the button below to browse.
        </p>

        <div className="flex items-center justify-center gap-3 mb-6">
          {fileFormats.map((fmt) => (
            <span
              key={fmt.label}
              className={`px-3 py-1 text-xs font-mono font-semibold tracking-wide rounded-md border backdrop-blur-sm ${fmt.className}`}
            >
              {fmt.label}
            </span>
          ))}
        </div>

        <label className="relative inline-block group cursor-pointer">
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="relative px-8 py-3.5 bg-white text-black font-semibold rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.1)] overflow-hidden"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              <FileText className="w-4 h-4" />
              Browse Files
            </span>
            {/* Elegant sweep effect on hover */}
            <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-black/10 to-transparent" />
          </motion.div>
          <input
            type="file"
            accept=".pdf,.docx,.txt"
            onChange={handleFileInput}
            className="hidden"
          />
        </label>
      </div>
    </motion.div>
  );
}
