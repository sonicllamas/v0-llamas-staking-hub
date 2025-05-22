interface StepIndicatorProps {
  steps: string[]
  currentStep: number
}

export function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <div className="flex justify-between items-center">
      {steps.map((step, index) => (
        <div key={index} className="flex flex-col items-center flex-1">
          <div className="relative flex items-center justify-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center z-10 ${
                index <= currentStep ? "bg-green-500 text-white" : "bg-gray-700 text-gray-300"
              }`}
            >
              {index + 1}
            </div>
            {index < steps.length - 1 && (
              <div
                className={`absolute top-4 h-0.5 w-full left-1/2 ${
                  index < currentStep ? "bg-green-500" : "bg-gray-700"
                }`}
              ></div>
            )}
          </div>
          <span
            className={`mt-2 text-xs md:text-sm ${
              index <= currentStep ? "text-green-300" : "text-gray-400"
            } hidden md:block`}
          >
            {step}
          </span>
        </div>
      ))}
    </div>
  )
}
