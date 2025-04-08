import React from 'react';

interface EventStepSelectorProps {
  currentStep: number;
  onChange: (step: number) => void;
}

function EventStepSelector({
  currentStep,
  onChange
}: EventStepSelectorProps) {
  return (
    <div className="mb-10">
      <div className="flex justify-center mb-4">
        <div className="flex items-center">
          <button
            onClick={() => onChange(1)}
            className={`flex items-center justify-center w-10 h-10 rounded-full ${
              currentStep === 1
                ? "bg-primary-500 text-white"
                : "bg-primary-100 text-primary-500"
            } font-bold text-lg shadow-sm transition-colors hover:opacity-90`}
          >
            1
          </button>
          <div
            className={`w-16 h-0.5 ${
              currentStep === 1 ? "bg-gray-200" : "bg-primary-300"
            }`}
          ></div>
          <button
            onClick={() => onChange(2)}
            className={`flex items-center justify-center w-10 h-10 rounded-full ${
              currentStep === 2
                ? "bg-primary-500 text-white"
                : "bg-primary-100 text-primary-500"
            } font-bold text-lg shadow-sm transition-colors hover:opacity-90`}
          >
            2
          </button>
        </div>
      </div>
      <div className="flex justify-center text-sm">
        <div className="flex w-36 justify-between">
          <span className={currentStep === 1 ? "font-medium text-primary-600" : "text-gray-500"}>
            Details
          </span>
          <span className={currentStep === 2 ? "font-medium text-primary-600" : "text-gray-500"}>
            Services
          </span>
        </div>
      </div>
    </div>
  );
};

export default EventStepSelector; 