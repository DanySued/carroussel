import { useState, useRef, useCallback, useEffect } from "react";
import {
  Layers,
  Grid3x3,
  Settings,
  CloudUpload,
  ChevronLeft,
  ChevronRight,
  Download,
  Menu,
  X,
  ImagePlus,
  Trash2,
} from "lucide-react";
import TemplatesPage from "./pages/TemplatesPage";
import SettingsPage from "./pages/SettingsPage";
import { Toaster, toast } from "sonner";
import { extractText } from "./lib/extractText";
import type { Slide } from "../../api/generate";
import * as htmlToImage from "html-to-image";
import JSZip from "jszip";
import Cropper from "react-easy-crop";
import type { Area } from "react-easy-crop";

// ─── Theme definitions ────────────────────────────────────────────────────────
const THEMES = [
  {
    label: "Purple Indigo",
    card: "from-purple-600 to-indigo-600",
    text: "text-white",
  },
  {
    label: "Orange Pink",
    card: "from-orange-500 to-pink-500",
    text: "text-white",
  },
  { label: "Cyan Blue", card: "from-cyan-500 to-blue-600", text: "text-white" },
  {
    label: "Amber Yellow",
    card: "from-amber-400 to-yellow-400",
    text: "text-gray-900",
  },
  {
    label: "Navy Slate",
    card: "from-[#1e3a8a] to-slate-600",
    text: "text-white",
  },
] as const;

const LANGUAGES = [
  "English",
  "Spanish",
  "French",
  "German",
  "Portuguese",
  "Italian",
  "Dutch",
  "Polish",
  "Arabic",
  "Hebrew",
  "Chinese",
  "Japanese",
  "Korean",
];

// ─── Crop helper ──────────────────────────────────────────────────────────────
async function getCroppedImg(src: string, px: Area): Promise<string> {
  const img = new window.Image();
  img.src = src;
  await new Promise<void>((res) => {
    img.onload = () => res();
  });
  const canvas = document.createElement("canvas");
  canvas.width = px.width;
  canvas.height = px.height;
  canvas
    .getContext("2d")!
    .drawImage(img, px.x, px.y, px.width, px.height, 0, 0, px.width, px.height);
  return canvas.toDataURL("image/jpeg", 0.95);
}

// ─── Slide card ───────────────────────────────────────────────────────────────
interface SlideCardProps {
  slide: Slide;
  themeIndex: number;
  size?: "full" | "thumb";
  bgImage?: string | null;
  editable?: boolean;
  totalSlides?: number;
  onChangeTitle?: (val: string) => void;
  onChangeBody?: (val: string) => void;
}

function SlideCard({
  slide,
  themeIndex,
  size = "full",
  bgImage,
  editable,
  totalSlides,
  onChangeTitle,
  onChangeBody,
}: SlideCardProps) {
  const theme = THEMES[themeIndex];
  const textColor = bgImage ? "text-white" : theme.text;
  const editableCls =
    "outline-none rounded px-1 -mx-1 hover:bg-white/10 focus:bg-white/10 cursor-text transition-colors";

  if (size === "thumb") {
    return (
      <div
        className="w-full h-full rounded overflow-hidden relative"
        style={
          bgImage
            ? {
                backgroundImage: `url(${bgImage})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }
            : undefined
        }
      >
        {!bgImage && (
          <div className={`absolute inset-0 bg-gradient-to-br ${theme.card}`} />
        )}
        {bgImage && <div className="absolute inset-0 bg-black/40" />}
        <div className="relative z-10 w-full h-full flex flex-col items-center justify-center p-1">
          <span className="text-[6px] font-bold text-center leading-tight text-white line-clamp-2">
            {slide.title}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      className="w-full h-full rounded-2xl flex flex-col items-start justify-end p-8 sm:p-10 relative overflow-hidden"
      style={
        bgImage
          ? {
              backgroundImage: `url(${bgImage})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }
          : undefined
      }
    >
      {/* Background layer */}
      {!bgImage && (
        <div className={`absolute inset-0 bg-gradient-to-br ${theme.card}`} />
      )}
      {bgImage && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
      )}

      {/* Content */}
      <div className="relative z-10 w-full">
        {editable ? (
          <div
            contentEditable
            suppressContentEditableWarning
            onBlur={(e) => onChangeTitle?.(e.currentTarget.textContent ?? "")}
            className={`text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 leading-tight ${textColor} ${editableCls}`}
          >
            {slide.title}
          </div>
        ) : (
          <h2
            className={`text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 leading-tight ${textColor}`}
          >
            {slide.title}
          </h2>
        )}
        {editable ? (
          <div
            contentEditable
            suppressContentEditableWarning
            onBlur={(e) => onChangeBody?.(e.currentTarget.textContent ?? "")}
            className={`text-sm sm:text-base opacity-80 leading-relaxed max-w-lg ${textColor} ${editableCls}`}
          >
            {slide.body}
          </div>
        ) : (
          <p
            className={`text-sm sm:text-base opacity-80 leading-relaxed max-w-lg ${textColor}`}
          >
            {slide.body}
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [file, setFile] = useState<File | null>(null);
  const [extractedText, setExtractedText] = useState("");
  const [slides, setSlides] = useState<Slide[]>([]);
  const [selectedTheme, setSelectedTheme] = useState(2);
  const [titleOverride, setTitleOverride] = useState("");
  const [content, setContent] = useState("");
  const [activeSlide, setActiveSlide] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [rightPanelOpen, setRightPanelOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // ── Generation settings ───────────────────────────────────────────────────
  const [slideCount, setSlideCount] = useState(5);
  const [language, setLanguage] = useState("English");
  const [pixelRatio, setPixelRatio] = useState(2);

  // ── Background image + crop state ─────────────────────────────────────────
  const [bgImages, setBgImages] = useState<(string | null)[]>([]);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const bgInputRef = useRef<HTMLInputElement>(null);

  type Page = "layers" | "grid" | "settings";
  const [currentPage, setCurrentPage] = useState<Page>("layers");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);
  const exportRefs = useRef<(HTMLDivElement | null)[]>([]);

  // ── File handling ──────────────────────────────────────────────────────────
  const handleFile = useCallback(async (f: File) => {
    setFile(f);
    setSlides([]);
    setContent("");
    setActiveSlide(0);
    try {
      const text = await extractText(f);
      setExtractedText(text);
      toast.success(`"${f.name}" loaded — ready to generate`);
    } catch (err) {
      toast.error((err as Error).message ?? "Failed to read file");
      setFile(null);
      setExtractedText("");
    }
  }, []);

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  };

  // ── Background image handling ──────────────────────────────────────────────
  const onBgInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      setCropSrc(reader.result as string);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
    };
    reader.readAsDataURL(f);
    e.target.value = "";
  };

  const onCropConfirm = async () => {
    if (!cropSrc || !croppedAreaPixels) return;
    try {
      const cropped = await getCroppedImg(cropSrc, croppedAreaPixels);
      setBgImages((prev) => {
        const next = [...prev];
        next[activeSlide] = cropped;
        return next;
      });
      setCropSrc(null);
    } catch {
      toast.error("Failed to crop image");
    }
  };

  const removeSlideBgImage = () => {
    setBgImages((prev) => {
      const next = [...prev];
      next[activeSlide] = null;
      return next;
    });
  };

  // ── Slide text editing ────────────────────────────────────────────────────
  const updateSlide = (index: number, changes: Partial<Slide>) => {
    setSlides((prev) =>
      prev.map((s, i) => (i === index ? { ...s, ...changes } : s)),
    );
  };

  const activeBgImage = bgImages[activeSlide] ?? null;

  // ── Generate ───────────────────────────────────────────────────────────────
  const handleGenerate = async () => {
    if (!extractedText) return;
    if (slides.length > 0) {
      await handleExport();
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: extractedText,
          title: titleOverride || undefined,
          slideCount,
          language,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Generation failed");
      setSlides(data.slides);
      setContent(
        data.slides.map((s: Slide) => `${s.title}\n${s.body}`).join("\n\n"),
      );
      setActiveSlide(0);
      toast.success("Slides generated!");
    } catch (err) {
      toast.error((err as Error).message ?? "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  // ── Export PNG ─────────────────────────────────────────────────────────────
  const handleExport = async () => {
    if (slides.length === 0) return;
    setIsExporting(true);
    try {
      const zip = new JSZip();
      for (let i = 0; i < slides.length; i++) {
        const el = exportRefs.current[i];
        if (!el) continue;
        const dataUrl = await htmlToImage.toPng(el, { pixelRatio });
        const base64 = dataUrl.split(",")[1];
        zip.file(`slide-${String(i + 1).padStart(2, "0")}.png`, base64, {
          base64: true,
        });
      }
      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${titleOverride || "carousel"}.zip`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Download started!");
    } catch {
      toast.error("Export failed — please try again");
    } finally {
      setIsExporting(false);
    }
  };

  // ── Keyboard navigation ────────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (slides.length === 0) return;
      if (e.key === "ArrowLeft") setActiveSlide((i) => Math.max(0, i - 1));
      if (e.key === "ArrowRight")
        setActiveSlide((i) => Math.min(slides.length - 1, i + 1));
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [slides.length]);

  const buttonLabel = isLoading
    ? "Generating…"
    : isExporting
      ? "Exporting…"
      : slides.length > 0
        ? "Download PNGs"
        : "Generate & Download PNGs";
  const buttonDisabled = isLoading || isExporting || !file;

  return (
    <div className="w-screen h-screen bg-[#0B0F1A] flex font-[Inter] overflow-hidden relative">
      <Toaster position="bottom-center" theme="dark" />

      {/* ── CROP MODAL ──────────────────────────────────────────────────── */}
      {cropSrc && (
        <div className="fixed inset-0 z-50 flex flex-col bg-black/90">
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#1E2545] shrink-0">
            <span className="text-white font-semibold text-sm">
              Crop background image
            </span>
            <button
              onClick={() => setCropSrc(null)}
              className="text-[#475280] hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>
          <div className="relative flex-1">
            <Cropper
              image={cropSrc}
              crop={crop}
              zoom={zoom}
              aspect={1}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={(_: Area, px: Area) => setCroppedAreaPixels(px)}
            />
          </div>
          <div className="px-6 py-5 border-t border-[#1E2545] shrink-0 flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <span className="text-[#6B7DB3] text-xs w-10 shrink-0">Zoom</span>
              <input
                type="range"
                min={1}
                max={3}
                step={0.01}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="flex-1 accent-[#7C3AED]"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setCropSrc(null)}
                className="flex-1 h-10 rounded-lg border border-[#1E2545] text-[#6B7DB3] hover:text-white text-sm transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={onCropConfirm}
                className="flex-1 h-10 rounded-lg bg-gradient-to-r from-[#7C3AED] to-[#4F46E5] text-white text-sm font-semibold transition-all hover:opacity-90"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── LEFT SIDEBAR ────────────────────────────────────────────────── */}
      <aside className="w-[60px] sm:w-[72px] h-full bg-[#10142A]/60 border-r border-[#1E2545] flex flex-col items-center py-5 shrink-0 z-10">
        <div className="w-9 h-9 flex items-center justify-center text-[#7C3AED] text-xl font-bold mb-10">
          C
        </div>
        <nav className="flex flex-col gap-8">
          {[
            { Icon: Layers, page: "layers" as Page, label: "Carousel" },
            { Icon: Grid3x3, page: "grid" as Page, label: "Templates" },
            { Icon: Settings, page: "settings" as Page, label: "Settings" },
          ].map(({ Icon, page, label }) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`w-6 h-6 flex items-center justify-center transition-colors ${currentPage === page ? "text-white" : "text-[#475280] hover:text-white"}`}
              aria-label={label}
            >
              <Icon size={20} />
            </button>
          ))}
        </nav>
        <button
          className="mt-auto lg:hidden w-6 h-6 flex items-center justify-center text-[#475280] hover:text-white transition-colors mb-4"
          onClick={() => setRightPanelOpen((v) => !v)}
          aria-label="Toggle settings panel"
        >
          <Menu size={20} />
        </button>
        <div className="mt-auto lg:mt-4 relative hidden lg:block">
          <div className="w-8 h-8 rounded-full bg-[#475280]" />
          <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-[#0B0F1A]" />
        </div>
      </aside>

      {/* ── CENTER STAGE ────────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {currentPage === "layers" && (
          <>
            <div className="flex-1 flex items-center justify-center p-4 overflow-hidden">
              {slides.length === 0 ? (
                <div
                  className={`w-full max-w-[480px] aspect-square max-h-[480px] bg-[#111631] border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-4 cursor-pointer transition-colors ${isDragging ? "border-[#7C3AED] bg-[#161D38]" : "border-[#2D365A] hover:border-[#7C3AED]/50"}`}
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={onDrop}
                  role="button"
                  aria-label="Upload file"
                >
                  <CloudUpload
                    size={48}
                    className={isDragging ? "text-[#7C3AED]" : "text-[#475280]"}
                  />
                  {file ? (
                    <>
                      <p className="text-[15px] font-medium text-white px-4 text-center">
                        {file.name}
                      </p>
                      <p className="text-[13px] text-[#6B7DB3]">
                        Ready — click Generate in the panel
                      </p>
                    </>
                  ) : (
                    <>
                      <h2 className="text-[15px] font-medium text-[#A0AEC0] text-center px-4">
                        Drop your PDF, DOCX, or TXT here
                      </h2>
                      <p className="text-[13px] text-[#6B7DB3]">
                        or click to browse
                      </p>
                      <button
                        className="mt-2 px-5 py-2.5 bg-[#7C3AED] text-white text-[13px] rounded-full hover:bg-[#6D2FD1] transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          fileInputRef.current?.click();
                        }}
                      >
                        Browse files
                      </button>
                    </>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.docx,.txt"
                    className="hidden"
                    onChange={onFileInputChange}
                  />
                </div>
              ) : (
                <div className="w-full max-w-[540px] flex flex-col items-center gap-4">
                  {/* Slide card */}
                  <div className="w-full aspect-square relative">
                    <div
                      key={activeSlide}
                      ref={(el) => {
                        slideRefs.current[activeSlide] = el;
                      }}
                      className="w-full h-full"
                    >
                      <SlideCard
                        slide={slides[activeSlide]}
                        themeIndex={selectedTheme}
                        bgImage={activeBgImage}
                        editable
                        totalSlides={slides.length}
                        onChangeTitle={(val) =>
                          updateSlide(activeSlide, { title: val })
                        }
                        onChangeBody={(val) =>
                          updateSlide(activeSlide, { body: val })
                        }
                      />
                    </div>
                    {activeSlide > 0 && (
                      <button
                        className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-colors"
                        onClick={() => setActiveSlide((i) => i - 1)}
                      >
                        <ChevronLeft size={20} />
                      </button>
                    )}
                    {activeSlide < slides.length - 1 && (
                      <button
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-colors"
                        onClick={() => setActiveSlide((i) => i + 1)}
                      >
                        <ChevronRight size={20} />
                      </button>
                    )}
                  </div>

                  {/* Dots */}
                  <div className="flex gap-2">
                    {slides.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveSlide(i)}
                        className={`w-2 h-2 rounded-full transition-colors ${i === activeSlide ? "bg-[#7C3AED]" : "bg-[#2D365A] hover:bg-[#475280]"}`}
                      />
                    ))}
                  </div>

                  {/* Hidden export refs */}
                  <div
                    className="fixed -top-[9999px] -left-[9999px] pointer-events-none"
                    aria-hidden
                  >
                    {slides.map((slide, i) => (
                      <div
                        key={i}
                        ref={(el) => {
                          exportRefs.current[i] = el;
                        }}
                        style={{ width: 540, height: 540 }}
                      >
                        <SlideCard
                          slide={slide}
                          themeIndex={selectedTheme}
                          bgImage={bgImages[i] ?? null}
                          totalSlides={slides.length}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom strip */}
            <div className="h-16 bg-[#0E1228] border-t border-[#1E2545] px-4 sm:px-6 flex items-center gap-3 shrink-0">
              <span className="text-[11px] text-[#6B7DB3] font-['JetBrains_Mono'] shrink-0">
                {isLoading
                  ? "Generating…"
                  : slides.length > 0
                    ? "Ready"
                    : "Waiting"}
              </span>
              <div className="flex gap-2 ml-2">
                {(slides.length > 0
                  ? slides
                  : Array(slideCount).fill(null)
                ).map((slide, i) => (
                  <button
                    key={i}
                    onClick={() => slide && setActiveSlide(i)}
                    className={`w-10 h-10 sm:w-12 sm:h-12 rounded-md overflow-hidden transition-all shrink-0 ${slide ? (activeSlide === i ? "ring-2 ring-[#7C3AED]" : "ring-1 ring-[#2D365A] hover:ring-[#475280]") : "bg-[#161D38]"}`}
                  >
                    {slide && (
                      <SlideCard
                        slide={slide}
                        themeIndex={selectedTheme}
                        size="thumb"
                        bgImage={bgImages[i] ?? null}
                      />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {currentPage === "grid" && (
          <TemplatesPage
            selectedTheme={selectedTheme}
            onSelectTheme={setSelectedTheme}
          />
        )}
        {currentPage === "settings" && (
          <SettingsPage
            pixelRatio={pixelRatio}
            onPixelRatioChange={setPixelRatio}
          />
        )}
      </main>

      {/* ── RIGHT PANEL ─────────────────────────────────────────────────── */}
      {currentPage === "layers" && (
        <>
          {rightPanelOpen && (
            <div
              className="fixed inset-0 bg-black/50 z-20 lg:hidden"
              onClick={() => setRightPanelOpen(false)}
            />
          )}
          <aside
            className={`fixed lg:relative top-0 right-0 h-full z-30 lg:z-auto w-[300px] lg:w-[320px] shrink-0 bg-[#10142A] lg:bg-[#10142A]/80 border-l border-[#1E2545] p-6 overflow-y-auto transition-transform duration-200 ${rightPanelOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"}`}
          >
            <button
              className="lg:hidden absolute top-4 right-4 text-[#475280] hover:text-white"
              onClick={() => setRightPanelOpen(false)}
            >
              <X size={20} />
            </button>

            {/* Content */}
            <div className="mb-6">
              <label className="block text-[11px] uppercase text-[#6B7DB3] tracking-wide mb-3">
                Content
              </label>
              <textarea
                className="w-full h-[120px] bg-[#161D38] border border-[#1E2545] rounded-lg p-3 text-[13px] text-[#A0AEC0] italic placeholder-[#384265] resize-none focus:outline-none focus:border-[#7C3AED]/50"
                placeholder="AI-generated copy appears here…"
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
            </div>

            {/* Theme */}
            <div className="mb-6">
              <label className="block text-[11px] uppercase text-[#6B7DB3] tracking-wide mb-3">
                Theme
              </label>
              <div className="flex gap-2">
                {THEMES.map((theme, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedTheme(i)}
                    title={theme.label}
                    className={`w-11 h-11 rounded-lg bg-gradient-to-r ${theme.card} transition-all ${selectedTheme === i ? "ring-2 ring-[#7C3AED] ring-offset-1 ring-offset-[#10142A] scale-105" : "hover:scale-105 opacity-70 hover:opacity-100"}`}
                  />
                ))}
              </div>
            </div>

            {/* Background image */}
            <div className="mb-6">
              <label className="block text-[11px] uppercase text-[#6B7DB3] tracking-wide mb-3">
                Slide {slides.length > 0 ? activeSlide + 1 : ""} Background
                Image
              </label>
              {activeBgImage ? (
                <div className="relative rounded-lg overflow-hidden border border-[#1E2545]">
                  <img
                    src={activeBgImage}
                    alt="Background"
                    className="w-full h-24 object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => bgInputRef.current?.click()}
                      className="p-2 rounded-lg bg-[#161D38] text-white hover:bg-[#1E2545] transition-colors"
                      title="Replace image"
                    >
                      <ImagePlus size={14} />
                    </button>
                    <button
                      onClick={removeSlideBgImage}
                      className="p-2 rounded-lg bg-[#161D38] text-red-400 hover:bg-[#1E2545] transition-colors"
                      title="Remove image"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => bgInputRef.current?.click()}
                  className="w-full h-10 flex items-center justify-center gap-2 rounded-lg border border-dashed border-[#2D365A] hover:border-[#7C3AED]/50 text-[#475280] hover:text-white text-[13px] transition-colors"
                >
                  <ImagePlus size={14} />
                  Upload image
                </button>
              )}
              <input
                ref={bgInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={onBgInputChange}
              />
            </div>

            {/* Title Override */}
            <div className="mb-6">
              <label className="block text-[11px] uppercase text-[#6B7DB3] tracking-wide mb-3">
                Title Override
              </label>
              <input
                type="text"
                value={titleOverride}
                onChange={(e) => setTitleOverride(e.target.value)}
                className="w-full h-10 bg-[#161D38] border border-[#1E2545] rounded-lg px-3 text-[13px] text-white placeholder-[#384265] focus:outline-none focus:border-[#7C3AED]/50"
                placeholder="Carousel Title"
              />
            </div>

            {/* Slide Count */}
            <div className="mb-6">
              <label className="block text-[11px] uppercase text-[#6B7DB3] tracking-wide mb-3">
                Number of Slides
              </label>
              <select
                value={slideCount}
                onChange={(e) => setSlideCount(Number(e.target.value))}
                disabled={slides.length > 0}
                className="w-full h-10 bg-[#161D38] border border-[#1E2545] rounded-lg px-3 text-[13px] text-white focus:outline-none focus:border-[#7C3AED]/50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {[3, 4, 5, 6, 7, 8, 9, 10, 12, 15].map((n) => (
                  <option key={n} value={n}>
                    {n} slides
                  </option>
                ))}
              </select>
              {slides.length > 0 && (
                <p className="text-[11px] text-[#475280] mt-1.5">
                  Start over to change slide count
                </p>
              )}
            </div>

            {/* Language */}
            <div className="mb-6">
              <label className="block text-[11px] uppercase text-[#6B7DB3] tracking-wide mb-3">
                Language
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                disabled={slides.length > 0}
                className="w-full h-10 bg-[#161D38] border border-[#1E2545] rounded-lg px-3 text-[13px] text-white focus:outline-none focus:border-[#7C3AED]/50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {LANGUAGES.map((lang) => (
                  <option key={lang} value={lang}>
                    {lang}
                  </option>
                ))}
              </select>
              {slides.length > 0 && (
                <p className="text-[11px] text-[#475280] mt-1.5">
                  Start over to change language
                </p>
              )}
            </div>

            {/* Export */}
            <div>
              <label className="block text-[11px] uppercase text-[#6B7DB3] tracking-wide mb-3">
                Export
              </label>
              {file && (
                <div className="mb-3 px-3 py-2 bg-[#161D38] rounded-lg border border-[#1E2545] text-[12px] text-[#6B7DB3] truncate">
                  {file.name}
                </div>
              )}
              <button
                disabled={buttonDisabled}
                onClick={handleGenerate}
                className={`w-full h-11 flex items-center justify-center gap-2 font-bold text-[14px] rounded-lg transition-all ${buttonDisabled ? "bg-[#2D365A] text-[#475280] cursor-not-allowed" : "bg-gradient-to-r from-[#7C3AED] to-[#4F46E5] text-white shadow-[0_0_20px_rgba(124,58,237,0.2)] hover:shadow-[0_0_30px_rgba(124,58,237,0.3)]"}`}
              >
                {isLoading || isExporting ? (
                  <span className="flex items-center gap-2">
                    <svg
                      className="animate-spin h-4 w-4"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8H4z"
                      />
                    </svg>
                    {buttonLabel}
                  </span>
                ) : (
                  <>
                    {slides.length > 0 && <Download size={16} />}
                    {buttonLabel}
                  </>
                )}
              </button>
              {slides.length > 0 && (
                <button
                  className="mt-2 w-full h-9 text-[12px] text-[#6B7DB3] hover:text-white border border-[#1E2545] rounded-lg transition-colors"
                  onClick={() => {
                    setSlides([]);
                    setFile(null);
                    setExtractedText("");
                    setContent("");
                    setTitleOverride("");
                    setActiveSlide(0);
                    setBgImages([]);
                  }}
                >
                  Start over
                </button>
              )}
            </div>
          </aside>
        </>
      )}
    </div>
  );
}
