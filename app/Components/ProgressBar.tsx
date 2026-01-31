import React from "react";

interface ProgressBarProps {
  goal: number;
  current: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ goal, current }) => {
  const percentage =
    goal > 0 ? Math.min((current / goal) * 100, 100) : 0;

  return (
    <div className="w-full ">
      {/* Label */}
      <div className="mb-1 flex justify-between text-sm text-gray-600">
        <span>
          {current} / {goal}
        </span>
        <span>{Math.round(percentage)}%</span>
      </div>

      {/* Bar background */}
      <div className="h-3 w-full rounded-full bg-gray-200 overflow-hidden">
        {/* Progress */}
        <div
          className="h-full rounded-full bg-linear-to-r from-blue-500 to-blue-400 transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
