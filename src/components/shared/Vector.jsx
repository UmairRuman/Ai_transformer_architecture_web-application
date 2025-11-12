'use client';

export default function Vector({
  values,
  label,
  color = '#3B82F6',
  showValues = true,
  orientation = 'vertical',
  size = 'medium',
  showIndices = true
}) {
  const sizes = {
    small: { box: 32, text: 'text-sm', spacing: 'gap-1.5', label: 'text-xs' },
    medium: { box: 40, text: 'text-base', spacing: 'gap-2', label: 'text-sm' },
    large: { box: 48, text: 'text-lg', spacing: 'gap-2.5', label: 'text-base' }
  };

  const config = sizes[size];

  return (
    <div className="inline-flex flex-col items-center gap-2">
      {/* Label */}
      {label && (
        <div className={`font-mono font-semibold ${config.label}`} style={{ color }}>
          {label}
        </div>
      )}

      {/* Main container */}
      <div
        className={`
          inline-flex ${orientation === 'vertical' ? 'flex-col' : 'flex-row'}
          ${config.spacing} bg-slate-800/50 rounded-lg p-2 border-2 backdrop-blur-sm
        `}
        style={{ borderColor: color }}
      >
        {values.map((value, idx) => (
          <div key={idx} className="group">
            {/* Vector Element Box */}
            <div
              className={`
                rounded transition-all hover:scale-110 cursor-pointer
                flex items-center justify-center font-mono font-semibold
                relative
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
              {/* Index Label */}
              {showIndices && (
                <div
                  className={`
                    absolute top-[-6px] left-1/2 -translate-x-1/2 // KEY CHANGE: Using a precise pixel value to anchor it to the top.
                    text-slate-400 font-mono pointer-events-none
                  `}
                  style={{ fontSize: '0.7rem' }}
                >
                  {idx}
                </div>
              )}

              {/* The Value remains perfectly centered */}
              {showValues && value !== null ? (typeof value === 'number' ? value.toFixed(1) : value) : ''}
              
              {/* Hover Tooltip */}
              {showValues && value !== null && typeof value === 'number' && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10 border border-slate-700">
                  [{idx}]: {value.toFixed(4)}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Dimension Info */}
      <div className="text-xs text-slate-500 font-mono mt-1">
        dim: {values.length}
      </div>
    </div>
  );
}