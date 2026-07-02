interface PaceArcProps {
  logged: number;
  planned: number;
}

export function PaceArc({ logged, planned }: PaceArcProps) {
  const radius = 80;
  const strokeWidth = 12;
  const viewSize = (radius + strokeWidth) * 2;
  const center = viewSize / 2;
  const circumference = Math.PI * radius;
  const progress = planned > 0 ? Math.min(logged / planned, 1) : 0;
  const arcLength = progress * circumference;
  const gapLength = circumference - arcLength;

  const startX = strokeWidth;
  const endX = viewSize - strokeWidth;
  const startY = center + radius * 0.05;
  const arcPath = `M ${startX} ${startY} A ${radius} ${radius} 0 0 1 ${endX} ${startY}`;

  return (
    <svg
      viewBox={`0 0 ${viewSize} ${center + strokeWidth + 4}`}
      className="w-[180px] h-[120px] sm:w-[180px] sm:h-[120px] w-[120px] h-[80px]"
    >
      <path
        d={arcPath}
        fill="none"
        stroke="#1a1a1a"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      <path
        d={arcPath}
        fill="none"
        stroke="#8b5cf6"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={`${arcLength} ${gapLength}`}
        strokeDashoffset="0"
        className="transition-all duration-300"
      />
      <text
        x={center}
        y={center - 4}
        textAnchor="middle"
        fill="white"
        fontSize="20"
        fontWeight="bold"
      >
        {logged}/{planned}h
      </text>
      <text
        x={center}
        y={center + 18}
        textAnchor="middle"
        fill="#a1a1aa"
        fontSize="11"
      >
        Pace
      </text>
    </svg>
  );
}
