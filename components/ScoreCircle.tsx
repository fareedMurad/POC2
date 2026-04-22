const ScoreCircle = ({ score }: { score?: string | null }) => {
  const getScoreValue = (score?: string) => {
    if (!score) return null;
    const num = parseFloat(score.split("/")[0]);
    return isNaN(num) ? null : num;
  };

  const value = getScoreValue(score || "");
  const percentage = value ? (value / 10) * 100 : 0;

  const size = 250; // matches w-62.5 (~250px)
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="flex flex-col items-center justify-center px-6 border-r border-[#3F3F3F]">
      <p className="text-lg text-[#BBBBBB] mb-8">Overall Score</p>

      <div className="relative w-62.5 h-62.5">
        <svg width={size} height={size} className="-rotate-90">
          {/* Background */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#2D313A"
            strokeWidth={strokeWidth}
            fill="none"
          />

          {/* Progress */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#68AD5C"
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={
              circumference - (circumference * percentage) / 100
            }
          />
        </svg>

        {/* Center Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
          <span className="text-[100px] font-semibold leading-24">
            {value !== undefined && value !== null
              ? Number(value).toFixed(0)
              : "-"}
          </span>
          <span className="text-3xl text-[#BBBBBB]">/10</span>
        </div>
      </div>
    </div>
  );
};

export default ScoreCircle;
