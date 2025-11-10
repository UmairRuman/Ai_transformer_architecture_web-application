'use client';

export default function Vector({ 
  values, 
  label, 
  color = '#3B82F6', 
  showValues = true,
  orientation = 'vertical',
  size = 'medium',
  showIndices = true // New prop to toggle index display
}) {
  const sizes = {
    small: { box: 24, text: 'text-xs', spacing: 'gap-1', label: 'text-xs' },
    medium: { box: 32, text: 'text-sm', spacing: 'gap-1.5', label: 'text-sm' },
    large: { box: 40, text: 'text-base', spacing: 'gap-2', label: 'text-base' }
  };

  const config = sizes[size];

  return (
    <div className={`inline-flex ${orientation === 'vertical' ? 'flex-col' : 'flex-row'} items-center ${config.spacing}`}>
      {/* Label */}
      {label && (
        <div className={`font-mono font-semibold ${config.label}`} style={{ color }}>
          {label}
        </div>
      )}

      {/* Vector Container */}
      <div 
        className={`
          inline-flex ${orientation === 'vertical' ? 'flex-col' : 'flex-row'} 
          ${config.spacing} bg-slate-800/50 rounded-lg p-2 border-2 backdrop-blur-sm
          ${showIndices ? (orientation === 'vertical' ? 'pb-6' : 'pr-6') : ''}
        `}
        style={{ borderColor: color }}
      >
        {values.map((value, idx) => (
          <div
            key={idx}
            className="relative group"
          >
            {/* Vector Element Box */}
            <div
              className={`
                rounded transition-all hover:scale-110 cursor-pointer
                flex items-center justify-center font-mono font-semibold
                ${config.text}
              `}
              style={{
                width: config.box,
                height: config.box,
                backgroundColor: `${color}40`,
                color: 'white',
                border: `1px solid ${color}`
              }}
            >
              {showValues ? value.toFixed(1) : ''}
            </div>

            {/* Hover Tooltip */}
            {showValues && (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10 border border-slate-700">
                [{idx}]: {value.toFixed(4)}
              </div>
            )}

            {/* Index Label - FIXED POSITIONING */}
            {showIndices && (
              <div 
                className={`
                  absolute text-slate-400 font-mono pointer-events-none font-semibold
                  ${orientation === 'vertical' 
                    ? 'top-full left-1/2 -translate-x-1/2' 
                    : 'left-full top-1/2 -translate-y-1/2'
                  }
                `}
                style={{ 
                  fontSize: '0.7rem',
                  marginTop: orientation === 'vertical' ? '4px' : '0',
                  marginLeft: orientation === 'horizontal' ? '4px' : '0'
                }}
              >
                {idx}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Dimension Info */}
      <div className="text-xs text-slate-500 font-mono">
        dim: {values.length}
      </div>
    </div>
  );
}