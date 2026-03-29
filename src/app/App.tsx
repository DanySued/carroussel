import { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { UploadZone } from './components/UploadZone';
import { SlidePreview } from './components/SlidePreview';
import { ConfigPanel } from './components/ConfigPanel';
import { TerminalLog } from './components/TerminalLog';
import { ProgressBar } from './components/ProgressBar';
import { SlideStrip } from './components/SlideStrip';
import { Terminal } from 'lucide-react';

interface Slide {
  id: number;
  title: string;
  content: string;
}

interface LogEntry {
  id: string;
  message: string;
  timestamp: string;
}

// Mock AI-generated slide data
const generateMockSlides = (fileName: string): Slide[] => [
  {
    id: 1,
    title: 'Introduction to AI',
    content: 'Artificial Intelligence is transforming how we interact with technology, enabling machines to learn from experience and perform human-like tasks.',
  },
  {
    id: 2,
    title: 'Machine Learning Basics',
    content: 'Machine learning algorithms use statistical techniques to give computers the ability to learn without being explicitly programmed.',
  },
  {
    id: 3,
    title: 'Neural Networks',
    content: 'Neural networks are computing systems inspired by biological neural networks that constitute animal brains.',
  },
  {
    id: 4,
    title: 'Deep Learning Applications',
    content: 'Deep learning enables computers to recognize patterns and make decisions with minimal human intervention in various domains.',
  },
  {
    id: 5,
    title: 'Future of AI',
    content: 'The future of AI holds promise for solving complex problems in healthcare, climate change, and space exploration.',
  },
  {
    id: 6,
    title: 'Ethical Considerations',
    content: 'As AI becomes more powerful, we must address ethical concerns around privacy, bias, and the impact on employment.',
  },
  {
    id: 7,
    title: 'AI in Business',
    content: 'Businesses are leveraging AI for automation, predictive analytics, customer service, and strategic decision-making.',
  },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('carousels');
  const [hasFile, setHasFile] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slides, setSlides] = useState<Slide[]>([]);
  const [theme, setTheme] = useState('midnight');
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [directory, setDirectory] = useState('downloads');
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [showTerminal, setShowTerminal] = useState(false);

  // Update content and title when slide changes
  useEffect(() => {
    if (slides.length > 0 && slides[currentSlide]) {
      setContent(slides[currentSlide].content);
      setTitle(slides[currentSlide].title);
    }
  }, [currentSlide, slides]);

  const handleFileUpload = (file: File) => {
    setHasFile(true);
    
    // Simulate processing
    simulateProcessing(file.name);
  };

  const simulateProcessing = (fileName: string) => {
    setIsGenerating(true);
    setCurrentStep(1);
    setShowTerminal(true);
    setLogs([]);

    const steps = [
      { step: 1, message: '[1/4] Parsing document...', delay: 800 },
      { step: 2, message: '[2/4] Generating slide content with Gemini AI...', delay: 1500 },
      { step: 3, message: '[3/4] Rendering slides with selected theme...', delay: 1200 },
      { step: 4, message: '[4/4] Preparing export files...', delay: 1000 },
    ];

    let logId = 0;

    steps.forEach((stepData, index) => {
      setTimeout(() => {
        const timestamp = new Date().toLocaleTimeString('en-US', { 
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit' 
        });
        
        setLogs(prev => [...prev, {
          id: `log-${logId++}`,
          message: stepData.message,
          timestamp,
        }]);
        
        setCurrentStep(stepData.step);

        // On completion
        if (index === steps.length - 1) {
          setTimeout(() => {
            const generatedSlides = generateMockSlides(fileName);
            setSlides(generatedSlides);
            setContent(generatedSlides[0].content);
            setTitle(generatedSlides[0].title);
            setIsGenerating(false);
            
            setLogs(prev => [...prev, {
              id: `log-${logId++}`,
              message: '✓ Successfully generated 7 slides!',
              timestamp: new Date().toLocaleTimeString('en-US', { 
                hour12: false,
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit' 
              }),
            }]);
          }, 500);
        }
      }, steps.slice(0, index + 1).reduce((sum, s) => sum + s.delay, 0));
    });
  };

  const handleGenerate = () => {
    if (slides.length === 0) return;
    
    setIsGenerating(true);
    setCurrentStep(1);
    setShowTerminal(true);

    const timestamp = new Date().toLocaleTimeString('en-US', { 
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit' 
    });

    setLogs([{
      id: 'export-1',
      message: `[1/4] Exporting ${slides.length} slides to ${directory}...`,
      timestamp,
    }]);

    setTimeout(() => {
      setCurrentStep(2);
      setLogs(prev => [...prev, {
        id: 'export-2',
        message: '[2/4] Rendering high-resolution PNGs...',
        timestamp: new Date().toLocaleTimeString('en-US', { 
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit' 
        }),
      }]);
    }, 1000);

    setTimeout(() => {
      setCurrentStep(3);
      setLogs(prev => [...prev, {
        id: 'export-3',
        message: '[3/4] Applying theme and optimizing...',
        timestamp: new Date().toLocaleTimeString('en-US', { 
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit' 
        }),
      }]);
    }, 2000);

    setTimeout(() => {
      setCurrentStep(4);
      setLogs(prev => [...prev, {
        id: 'export-4',
        message: `[4/4] Saving files to ~/${directory}/carousel-ai-export/`,
        timestamp: new Date().toLocaleTimeString('en-US', { 
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit' 
        }),
      }]);
    }, 3000);

    setTimeout(() => {
      setIsGenerating(false);
      setCurrentStep(0);
      setLogs(prev => [...prev, {
        id: 'export-complete',
        message: '✓ Export complete! 7 PNG files saved successfully.',
        timestamp: new Date().toLocaleTimeString('en-US', { 
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit' 
        }),
      }]);
    }, 4000);
  };

  const handlePrevious = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    // Update the slide data
    if (slides[currentSlide]) {
      const updatedSlides = [...slides];
      updatedSlides[currentSlide] = {
        ...updatedSlides[currentSlide],
        content: newContent,
      };
      setSlides(updatedSlides);
    }
  };

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    // Update the slide data
    if (slides[currentSlide]) {
      const updatedSlides = [...slides];
      updatedSlides[currentSlide] = {
        ...updatedSlides[currentSlide],
        title: newTitle,
      };
      setSlides(updatedSlides);
    }
  };

  return (
    <div className="flex h-screen bg-surface-base font-sans overflow-hidden relative selection:bg-purple-500/30 selection:text-white">
      {/* Ambient Lighting */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-purple-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-600/10 blur-[100px] pointer-events-none" />
      
      {/* Left Sidebar */}
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative z-10">
        {/* Header */}
        <div className="h-[72px] border-b border-white/5 flex items-center justify-between px-8 bg-surface-base/40 backdrop-blur-xl z-20">
          <div className="flex items-center gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-semibold text-white">Carousel AI</h1>
                <span className="px-1.5 py-0.5 text-[10px] font-mono font-semibold text-purple-400 bg-purple-500/15 border border-purple-500/25 rounded">
                  AI
                </span>
              </div>
              <p className="text-sm text-gray-500">Transform documents into beautiful carousels</p>
            </div>
          </div>

          {/* Terminal Toggle */}
          <button
            onClick={() => setShowTerminal(!showTerminal)}
            className={`
              px-3.5 py-2 rounded-lg flex items-center gap-2 transition-all duration-200 border
              ${showTerminal
                ? 'bg-green-500/15 text-green-400 border-green-500/30'
                : 'bg-white/5 text-gray-400 border-white/8 hover:bg-white/8 hover:text-gray-300'
              }
            `}
          >
            <Terminal className="w-4 h-4" />
            <span className="text-sm font-mono">Terminal</span>
            {logs.length > 0 && (
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            )}
          </button>
        </div>

        {/* Central Workspace */}
        <div className="flex-1 flex flex-col p-8 overflow-hidden">
          {/* Progress Bar (when generating) */}
          {currentStep > 0 && (
            <div className="mb-6">
              <ProgressBar currentStep={currentStep} totalSteps={4} />
            </div>
          )}

          {/* Main Stage */}
          <div className="flex-1 mb-6">
            {!hasFile ? (
              <UploadZone onFileUpload={handleFileUpload} />
            ) : (
              <SlidePreview
                currentSlide={currentSlide}
                totalSlides={slides.length}
                theme={theme}
                content={content}
                title={title}
                onPrevious={handlePrevious}
                onNext={handleNext}
              />
            )}
          </div>

          {/* Slide Strip (when slides are generated) */}
          {slides.length > 0 && (
            <SlideStrip
              slides={slides}
              currentSlide={currentSlide}
              onSlideSelect={setCurrentSlide}
              theme={theme}
            />
          )}
        </div>

        {/* Terminal Log */}
        <TerminalLog
          logs={logs}
          isVisible={showTerminal}
          onClose={() => setShowTerminal(false)}
        />
      </div>

      {/* Right Configuration Panel */}
      <ConfigPanel
        content={content}
        onContentChange={handleContentChange}
        theme={theme}
        onThemeChange={setTheme}
        title={title}
        onTitleChange={handleTitleChange}
        directory={directory}
        onDirectoryChange={setDirectory}
        onGenerate={handleGenerate}
        isGenerating={isGenerating}
      />
    </div>
  );
}
