/**
 * Step Indicator component for Ether Excel
 */
import React from 'react';
import { Check, Upload, Brain, Activity, Rocket } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { AppView } from '../../types';

interface StepInfo {
  name: string;
  icon: React.ReactNode;
  view: AppView;
}

const StepIndicator: React.FC = () => {
  const { view, setView } = useAppContext();
  
  const steps: StepInfo[] = [
    { name: 'Upload', icon: <Upload className="w-5 h-5" />, view: 'upload' },
    { name: 'Process', icon: <Brain className="w-5 h-5" />, view: 'processing' },
    { name: 'Review', icon: <Activity className="w-5 h-5" />, view: 'review' },
    { name: 'Launch', icon: <Rocket className="w-5 h-5" />, view: 'launch' },
  ];
  
  const currentStepIndex = steps.findIndex(step => step.view === view);
  
  // Handle step click - allow going back to previous steps
  const handleStepClick = (stepView: AppView, index: number) => {
    // Only allow navigation to previous steps or current step
    if (index <= currentStepIndex) {
      setView(stepView);
    }
  };
  
  return (
    <div className="w-full max-w-3xl mx-auto my-8">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          // Determine step status
          const isComplete = index < currentStepIndex;
          const isCurrent = index === currentStepIndex;
          const isPending = index > currentStepIndex;
          
          // Style based on status
          const circleStyle = isComplete
            ? 'bg-[#3A7AFE] text-white'
            : isCurrent
              ? 'bg-[#3A7AFE] text-white ring-4 ring-[#EEF4FF]'
              : 'bg-[#EEF4FF] text-[#3A7AFE]';
              
          const textStyle = isComplete || isCurrent
            ? 'text-[#1F2937] font-medium'
            : 'text-gray-400';
            
          // Line between steps
          const lineStyle = index < steps.length - 1
            ? isComplete
              ? 'bg-[#3A7AFE]'
              : 'bg-gray-200'
            : '';
          
          // Add clickable functionality
          const isClickable = index <= currentStepIndex;
          const cursorStyle = isClickable ? 'cursor-pointer' : 'cursor-default';
          
          return (
            <React.Fragment key={step.name}>
              <div 
                className={`flex flex-col items-center ${cursorStyle}`}
                onClick={() => isClickable && handleStepClick(step.view, index)}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${circleStyle} transition-all duration-300`}>
                  {isComplete ? <Check className="w-5 h-5" /> : step.icon}
                </div>
                <span className={`mt-2 text-sm ${textStyle} transition-all duration-300`}>
                  {step.name}
                </span>
              </div>
              
              {index < steps.length - 1 && (
                <div className={`flex-1 h-1 mx-2 ${lineStyle} transition-all duration-300`} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default StepIndicator;