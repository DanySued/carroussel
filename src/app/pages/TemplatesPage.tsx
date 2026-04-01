import { Check } from 'lucide-react';

const THEMES = [
  { label: 'Purple Indigo', card: 'from-purple-600 to-indigo-600', text: 'text-white' },
  { label: 'Orange Pink',   card: 'from-orange-500 to-pink-500',   text: 'text-white' },
  { label: 'Cyan Blue',     card: 'from-cyan-500 to-blue-600',      text: 'text-white' },
  { label: 'Amber Yellow',  card: 'from-amber-400 to-yellow-400',   text: 'text-gray-900' },
  { label: 'Navy Slate',    card: 'from-[#1e3a8a] to-slate-600',    text: 'text-white' },
] as const;

interface Props {
  selectedTheme: number;
  onSelectTheme: (i: number) => void;
}

export default function TemplatesPage({ selectedTheme, onSelectTheme }: Props) {
  return (
    <div className="flex-1 flex flex-col min-w-0 overflow-y-auto p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">Templates</h1>
        <p className="text-[#6B7DB3] text-sm">Choose a theme for your carousel slides</p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-w-2xl">
        {THEMES.map((theme, i) => (
          <button
            key={i}
            onClick={() => onSelectTheme(i)}
            className={`relative aspect-square rounded-2xl bg-gradient-to-br ${theme.card} flex flex-col items-start justify-end p-5 transition-all hover:scale-[1.02] ${
              selectedTheme === i ? 'ring-2 ring-[#7C3AED] ring-offset-2 ring-offset-[#0B0F1A]' : ''
            }`}
          >
            {selectedTheme === i && (
              <div className="absolute top-3 right-3 w-6 h-6 bg-[#7C3AED] rounded-full flex items-center justify-center">
                <Check size={13} className="text-white" />
              </div>
            )}
            <span className={`text-xs font-mono opacity-50 mb-1 ${theme.text}`}>01 / 05</span>
            <span className={`text-base font-bold leading-tight ${theme.text}`}>{theme.label}</span>
          </button>
        ))}
        <div className="aspect-square rounded-2xl border-2 border-dashed border-[#2D365A] flex flex-col items-center justify-center gap-2 text-[#475280]">
          <span className="text-2xl font-light">+</span>
          <span className="text-xs">More soon</span>
        </div>
      </div>
    </div>
  );
}
