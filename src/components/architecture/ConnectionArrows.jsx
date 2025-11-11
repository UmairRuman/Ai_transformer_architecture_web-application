/**
 * ConnectionArrows - SVG arrows showing data flow between components
 */
export default function ConnectionArrows({ 
  type = 'vertical', // 'vertical' | 'horizontal' | 'curved'
  isActive = false, 
  isCompleted = false,
  distance = 30,
  color = 'slate'
}) {
  const colors = {
    slate: isActive ? '#94a3b8' : isCompleted ? '#22c55e' : '#475569',
    blue: isActive ? '#60a5fa' : isCompleted ? '#22c55e' : '#475569',
    purple: isActive ? '#c084fc' : isCompleted ? '#22c55e' : '#475569',
    cyan: isActive ? '#22d3ee' : isCompleted ? '#22c55e' : '#475569'
  };

  const strokeColor = colors[color] || colors.slate;

  // Vertical arrow (most common - going down)
  if (type === 'vertical') {
    return (
      <div className="flex justify-center" style={{ height: `${distance}px` }}>
        <svg 
          width="20" 
          height={distance} 
          className="overflow-visible"
        >
          {/* Main line */}
          <line
            x1="10"
            y1="0"
            x2="10"
            y2={distance - 8}
            stroke={strokeColor}
            strokeWidth="2"
            className={isActive ? 'animate-pulse' : ''}
          />
          
          {/* Arrow head */}
          <polygon
            points={`10,${distance} 6,${distance - 8} 14,${distance - 8}`}
            fill={strokeColor}
            className={isActive ? 'animate-pulse' : ''}
          />

          {/* Animated particle effect when active */}
          {isActive && (
            <>
              <circle
                cx="10"
                cy="0"
                r="3"
                fill="#60a5fa"
                className="animate-moveDown"
              />
              <circle
                cx="10"
                cy="0"
                r="2"
                fill="#ffffff"
                className="animate-moveDown"
                style={{ animationDelay: '0.3s' }}
              />
            </>
          )}
        </svg>

        <style jsx>{`
          @keyframes moveDown {
            0% {
              cy: 0;
              opacity: 1;
            }
            100% {
              cy: ${distance};
              opacity: 0;
            }
          }
          .animate-moveDown {
            animation: moveDown 1.5s ease-in-out infinite;
          }
        `}</style>
      </div>
    );
  }

  // Horizontal arrow (for encoder to decoder connections)
  if (type === 'horizontal') {
    const width = distance;
    return (
      <div className="flex items-center" style={{ width: `${width}px` }}>
        <svg 
          width={width} 
          height="20"
          className="overflow-visible"
        >
          {/* Main line */}
          <line
            x1="0"
            y1="10"
            x2={width - 8}
            y2="10"
            stroke={strokeColor}
            strokeWidth="2"
            strokeDasharray={isActive ? "5,5" : "0"}
            className={isActive ? 'animate-dash' : ''}
          />
          
          {/* Arrow head */}
          <polygon
            points={`${width},10 ${width - 8},6 ${width - 8},14`}
            fill={strokeColor}
          />

          {/* Animated particle */}
          {isActive && (
            <circle
              cx="0"
              cy="10"
              r="3"
              fill="#22d3ee"
              className="animate-moveRight"
            />
          )}
        </svg>

        <style jsx>{`
          @keyframes dash {
            to {
              stroke-dashoffset: -10;
            }
          }
          @keyframes moveRight {
            0% {
              cx: 0;
              opacity: 1;
            }
            100% {
              cx: ${width};
              opacity: 0;
            }
          }
          .animate-dash {
            animation: dash 1s linear infinite;
          }
          .animate-moveRight {
            animation: moveRight 2s ease-in-out infinite;
          }
        `}</style>
      </div>
    );
  }

  // Curved arrow (for residual connections)
  if (type === 'curved') {
    return (
      <div className="absolute" style={{ width: '40px', height: '60px' }}>
        <svg width="40" height="60" className="overflow-visible">
          <path
            d="M 5 10 Q 35 10, 35 50"
            stroke={strokeColor}
            strokeWidth="2"
            fill="none"
            className={isActive ? 'animate-pulse' : ''}
          />
          <polygon
            points="35,50 31,43 38,45"
            fill={strokeColor}
          />
        </svg>
      </div>
    );
  }

  return null;
}

// Simple vertical arrow component for quick use
export function VerticalArrow({ isActive, isCompleted, height = 30 }) {
  return (
    <ConnectionArrows 
      type="vertical" 
      isActive={isActive} 
      isCompleted={isCompleted}
      distance={height}
    />
  );
}

// Simple horizontal arrow component
export function HorizontalArrow({ isActive, isCompleted, width = 60 }) {
  return (
    <ConnectionArrows 
      type="horizontal" 
      isActive={isActive} 
      isCompleted={isCompleted}
      distance={width}
      color="cyan"
    />
  );
}