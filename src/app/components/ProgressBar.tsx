import { motion } from 'motion/react';

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
}

const steps = [
  { id: 1, name: 'Parsing', percentage: 25 },
  { id: 2, name: 'Generating', percentage: 50 },
  { id: 3, name: 'Rendering', percentage: 75 },
  { id: 4, name: 'Saving', percentage: 100 },
];

export function ProgressBar({ currentStep, totalSteps }: ProgressBarProps) {
  const progress = (currentStep / totalSteps) * 100;
  const currentStepData = steps[currentStep - 1];

  if (currentStep === 0) return null;

  return (
    <div className="w-full bg-white/5 rounded-xl p-6 backdrop-blur-sm border border-white/10">
      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-4">
        {steps.map((step, index) => {
          const isActive = currentStep >= step.id;
          const isCurrent = currentStep === step.id;

          return (
            <div key={step.id} className="flex items-center flex-1">
              {/* Step Circle */}
              <div className="flex flex-col items-center">
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{ scale: isActive ? 1 : 0.8 }}
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center
                    font-mono text-sm font-medium transition-all duration-200
                    ${isActive 
                      ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg shadow-purple-500/50' 
                      : 'bg-white/10 text-gray-500'
                    }
                    ${isCurrent ? 'ring-4 ring-purple-500/30 animate-pulse' : ''}
                  `}
                >
                  {isActive ? '✓' : step.id}
                </motion.div>
                <span className={`text-xs mt-2 font-mono ${isActive ? 'text-white' : 'text-gray-500'}`}>
                  {step.name}
                </span>
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="flex-1 h-0.5 mx-4 bg-white/10">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: isActive ? '100%' : '0%' }}
                    transition={{ duration: 0.5 }}
                    className="h-full bg-gradient-to-r from-purple-500 to-indigo-600"
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Progress Bar */}
      <div className="relative w-full h-2 bg-white/10 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="h-full bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full"
        />
      </div>

      {/* Status Text */}
      <div className="flex items-center justify-between mt-4">
        <span className="text-sm font-mono text-gray-400">
          {currentStepData ? currentStepData.name : 'Waiting...'}
        </span>
        <span className="text-sm font-mono text-purple-400 font-medium">
          {Math.round(progress)}%
        </span>
      </div>
    </div>
  );
}
