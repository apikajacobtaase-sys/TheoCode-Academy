interface ProgressBarProps {
  progress: number;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  showPercentage?: boolean;
}

export default function ProgressBar({ progress, label, size = 'md', showPercentage = true }: ProgressBarProps) {
  const sizeClasses = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4'
  };

  const clampedProgress = Math.min(100, Math.max(0, progress));

  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-400">{label}</span>
          {showPercentage && (
            <span className="text-sm font-bold text-green-400">{clampedProgress}%</span>
          )}
        </div>
      )}
      
      <div className={`w-full bg-gray-800 rounded-full ${sizeClasses[size]} overflow-hidden`}>
        <div
          className={`${sizeClasses[size]} rounded-full transition-all duration-500 ${
            clampedProgress === 100 
              ? 'bg-gradient-to-r from-green-500 to-emerald-400' 
              : 'bg-gradient-to-r from-green-600 to-green-400'
          }`}
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
      
      {!label && showPercentage && (
        <div className="text-right mt-1">
          <span className="text-xs font-bold text-green-400">{clampedProgress}%</span>
        </div>
      )}
    </div>
  );
}