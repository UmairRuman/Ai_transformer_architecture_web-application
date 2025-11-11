import ComponentBlock from './ComponentBlock';
import { VerticalArrow } from './ConnectionArrows';

/**
 * EncoderStack - Left side of Transformer Architecture
 * Matches "Attention is All You Need" paper layout
 */
export default function EncoderStack({ 
  currentStep, 
  completedSteps = [], 
  onBlockClick 
}) {
  const getBlockState = (stepId) => {
    if (stepId === currentStep) return 'active';
    if (completedSteps.includes(stepId)) return 'completed';
    return 'locked';
  };

  const isArrowActive = (nextStep) => {
    return currentStep === nextStep;
  };

  const isArrowCompleted = (nextStep) => {
    return completedSteps.includes(nextStep);
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Title */}
      <div className="text-center mb-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-400/30 rounded-lg">
          <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
          <span className="text-blue-300 font-bold text-sm uppercase tracking-wide">
            Encoder
          </span>
        </div>
        <div className="text-xs text-slate-500 mt-1">Input Processing</div>
      </div>

      {/* Input Label */}
      <div className="text-center mb-2">
        <div className="text-xs text-slate-400 font-mono px-3 py-1 bg-slate-800/50 rounded border border-slate-700">
          Inputs
        </div>
      </div>

      <VerticalArrow 
        isActive={isArrowActive('tokenizing')} 
        isCompleted={isArrowCompleted('tokenizing')}
        height={25}
      />

      {/* Input Embedding */}
      <ComponentBlock
        id="embedding"
        label="Input"
        sublabel="Embedding"
        state={getBlockState('embedding')}
        onClick={() => onBlockClick('embedding')}
        tooltip="Converts tokens into dense vectors (d_model dimensions)"
        color="orange"
        width="w-48"
      />

      <div className="flex items-center gap-2">
        <div className="text-slate-500 text-xl">+</div>
      </div>

      {/* Positional Encoding */}
      <ComponentBlock
        id="positional"
        label="Positional"
        sublabel="Encoding"
        state={getBlockState('positional')}
        onClick={() => onBlockClick('positional')}
        tooltip="Adds position information using sine/cosine functions"
        color="orange"
        width="w-48"
      />

      <VerticalArrow 
        isActive={isArrowActive('attention')} 
        isCompleted={isArrowCompleted('attention')}
        height={30}
      />

      {/* Encoder Block Container */}
      <div className="border-2 border-dashed border-slate-600 rounded-xl p-4 bg-slate-900/30 space-y-4">
        {/* Multi-Head Attention */}
        <ComponentBlock
          id="attention"
          label="Multi-Head"
          sublabel="Attention"
          state={getBlockState('attention')}
          onClick={() => onBlockClick('attention')}
          tooltip="Parallel attention mechanisms (Q, K, V)"
          color="blue"
          width="w-44"
        />

        <VerticalArrow 
          isActive={isArrowActive('addnorm')} 
          isCompleted={isArrowCompleted('addnorm')}
          height={25}
        />

        {/* Add & Norm 1 */}
        <ComponentBlock
          id="addnorm"
          label="Add & Norm"
          state={getBlockState('addnorm')}
          onClick={() => onBlockClick('addnorm')}
          tooltip="Residual connection + Layer Normalization"
          color="cyan"
          width="w-44"
        />

        <VerticalArrow 
          isActive={isArrowActive('feedforward')} 
          isCompleted={isArrowCompleted('feedforward')}
          height={25}
        />

        {/* Feed Forward */}
        <ComponentBlock
          id="feedforward"
          label="Feed"
          sublabel="Forward"
          state={getBlockState('feedforward')}
          onClick={() => onBlockClick('feedforward')}
          tooltip="Position-wise fully connected feed-forward network"
          color="blue"
          width="w-44"
        />

        <VerticalArrow 
          isActive={currentStep === 'decoder_start'} 
          isCompleted={completedSteps.includes('feedforward')}
          height={25}
        />

        {/* Add & Norm 2 (after FFN) */}
        <ComponentBlock
          id="encoder_final_norm"
          label="Add & Norm"
          state={completedSteps.includes('feedforward') ? 'completed' : 'locked'}
          onClick={() => {}}
          tooltip="Final normalization in encoder"
          color="cyan"
          width="w-44"
        />
      </div>

      {/* Output indicator */}
      <div className="mt-4 text-center">
        <div className="text-xs text-slate-400 font-mono px-3 py-1 bg-slate-800/50 rounded border border-slate-700 inline-block">
          Encoder Output
        </div>
        <div className="text-[10px] text-slate-500 mt-1">
          → Sent to Decoder
        </div>
      </div>
    </div>
  );
}