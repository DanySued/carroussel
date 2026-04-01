interface SettingsPageProps {
  pixelRatio: number;
  onPixelRatioChange: (ratio: number) => void;
}

const RESOLUTIONS: { label: string; value: number; description: string }[] = [
  { label: "1×", value: 1, description: "1× exports at 540×540 px" },
  { label: "2×", value: 2, description: "2× exports at 1080×1080 px" },
  { label: "3×", value: 3, description: "3× exports at 1620×1620 px" },
];

export default function SettingsPage({
  pixelRatio,
  onPixelRatioChange,
}: SettingsPageProps) {
  const selected =
    RESOLUTIONS.find((r) => r.value === pixelRatio) ?? RESOLUTIONS[1];

  return (
    <div className="flex-1 flex flex-col min-w-0 overflow-y-auto p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">Settings</h1>
        <p className="text-[#6B7DB3] text-sm">Configure your workspace</p>
      </div>

      <div className="max-w-lg space-y-6">
        {/* API Configuration */}
        <div>
          <label className="block text-[11px] uppercase text-[#6B7DB3] tracking-wide mb-3">
            API Configuration
          </label>
          <div className="bg-[#111631] border border-[#1E2545] rounded-2xl p-4 space-y-4">
            <div>
              <p className="text-[12px] text-[#A0AEC0] mb-1.5">
                Gemini API Key
              </p>
              <input
                type="password"
                value="••••••••••••••••••••••"
                readOnly
                className="w-full h-10 bg-[#161D38] border border-[#1E2545] rounded-lg px-3 text-[13px] text-[#475280] focus:outline-none cursor-not-allowed"
              />
              <p className="text-[11px] text-[#475280] mt-1.5">
                Set <code className="text-[#7C3AED]">GEMINI_API_KEY</code> in
                your .env file
              </p>
            </div>
            <div>
              <p className="text-[12px] text-[#A0AEC0] mb-1.5">Model</p>
              <div className="h-10 bg-[#161D38] border border-[#1E2545] rounded-lg px-3 flex items-center">
                <span className="text-[13px] text-[#6B7DB3]">
                  gemini-2.5-flash
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Export Settings */}
        <div>
          <label className="block text-[11px] uppercase text-[#6B7DB3] tracking-wide mb-3">
            Export
          </label>
          <div className="bg-[#111631] border border-[#1E2545] rounded-2xl p-4">
            <p className="text-[12px] text-[#A0AEC0] mb-2">Resolution</p>
            <div className="flex gap-2">
              {RESOLUTIONS.map((res) => (
                <button
                  key={res.value}
                  onClick={() => onPixelRatioChange(res.value)}
                  className={`px-4 h-9 rounded-lg text-[13px] border transition-colors ${
                    pixelRatio === res.value
                      ? "bg-[#7C3AED]/20 border-[#7C3AED] text-[#7C3AED]"
                      : "bg-[#161D38] border-[#1E2545] text-[#6B7DB3] hover:border-[#475280]"
                  }`}
                >
                  {res.label}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-[#475280] mt-2">
              {selected.description}
            </p>
          </div>
        </div>

        {/* About */}
        <div className="pt-4 border-t border-[#1E2545]">
          <p className="text-[11px] text-[#475280]">
            Carroussel v0.1.0 · Powered by Gemini 2.5 Flash
          </p>
        </div>
      </div>
    </div>
  );
}
