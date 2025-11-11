import ComponentBlock from './ComponentBlock';
import { VerticalArrow } from './ConnectionArrows';

/**
 * DecoderStack - Right side of Transformer Architecture
 * Matches "Attention is All You Need" paper layout
 */
export default function DecoderStack({ 
  currentStep, 
  completedSteps = [], 
  onBlockClick,
  encoderCompleted = false
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
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-pink-500/10 border border-pink-400/30 rounded-lg">
          <div className="w-2 h-2 rounded-full bg-pink-400 animate-pulse" />
          <span className="text-pink-300 font-bold text-sm uppercase tracking-wide">
            Decoder
          </span>
        </div>
        <div className="text-xs text-slate-500 mt-1">Output Generation</div>
      </div>

      {/* Output Label (shifted right in paper) */}
      <div className="text-center mb-2">
        <div className="text-xs text-slate-400 font-mono px-3 py-1 bg-slate-800/50 rounded border border-slate-700">
          Outputs
          <div className="text-[9px] text-slate-500">(shifted right)</div>
        </div>
      </div>

      <VerticalArrow 
        isActive={isArrowActive('decoder_embedding')} 
        isCompleted={isArrowCompleted('decoder_embedding')}
        height={25}
      />

      {/* Output Embedding */}
      <ComponentBlock
        id="decoder_embedding"
        label="Output"
        sublabel="Embedding"
        state={getBlockState('decoder_embedding')}
        onClick={() => onBlockClick('decoder_embedding')}
        tooltip="Embeds target language tokens"
        color="orange"
        width="w-48"
      />

      <div className="flex items-center gap-2">
        <div className="text-slate-500 text-xl">+</div>
      </div>

      {/* Positional Encoding */}
      <ComponentBlock
        id="decoder_positional"
        label="Positional"
        sublabel="Encoding"
        state={getBlockState('decoder_positional')}
        onClick={() => onBlockClick('decoder_positional')}
        tooltip="Same positional encoding as encoder"
        color="orange"
        width="w-48"
      />

      <VerticalArrow 
        isActive={isArrowActive('decoder_masked_attention')} 
        isCompleted={isArrowCompleted('decoder_masked_attention')}
        height={30}
      />

      {/* Decoder Block Container */}
      <div className="border-2 border-dashed border-slate-600 rounded-xl p-4 bg-slate-900/30 space-y-4 relative">
        
        {/* Masked Multi-Head Attention */}
        <ComponentBlock
          id="decoder_masked_attention"
          label="Masked"
          sublabel="Multi-Head Attention"
          state={getBlockState('decoder_masked_attention')}
          onClick={() => onBlockClick('decoder_masked_attention')}
          tooltip="Self-attention with causal mask (can't look ahead)"
          color="pink"
          width="w-44"
        />

        <VerticalArrow 
          isActive={isArrowActive('decoder_addnorm1')} 
          isCompleted={isArrowCompleted('decoder_addnorm1')}
          height={25}
        />

        {/* Add & Norm 1 */}
        <ComponentBlock
          id="decoder_addnorm1"
          label="Add & Norm"
          state={getBlockState('decoder_addnorm1')}
          onClick={() => onBlockClick('decoder_addnorm1')}
          tooltip="Residual + LayerNorm after masked attention"
          color="cyan"
          width="w-44"
        />

        <VerticalArrow 
          isActive={isArrowActive('decoder_cross_attention')} 
          isCompleted={isArrowCompleted('decoder_cross_attention')}
          height={25}
        />

        {/* Cross-Attention with indicator from encoder */}
        <div className="relative">
          {/* Connection indicator from encoder */}
          {encoderCompleted && (
            <div className="absolute -left-16 top-1/2 transform -translate-y-1/2">
              <div className="flex items-center gap-1">
                <div className="text-xs text-cyan-400 font-mono">K,V</div>
                <div className="text-cyan-400">→</div>
              </div>
            </div>
          )}

          <ComponentBlock
            id="decoder_cross_attention"
            label="Multi-Head"
            sublabel="Attention"
            state={getBlockState('decoder_cross_attention')}
            onClick={() => onBlockClick('decoder_cross_attention')}
            tooltip="Attends to encoder output (K,V from encoder, Q from decoder)"
            color="cyan"
            width="w-44"
          />
        </div>

        <VerticalArrow 
          isActive={isArrowActive('decoder_addnorm2')} 
          isCompleted={isArrowCompleted('decoder_addnorm2')}
          height={25}
        />

        {/* Add & Norm 2 */}
        <ComponentBlock
          id="decoder_addnorm2"
          label="Add & Norm"
          state={getBlockState('decoder_addnorm2')}
          onClick={() => onBlockClick('decoder_addnorm2')}
          tooltip="Residual + LayerNorm after cross-attention"
          color="cyan"
          width="w-44"
        />

        <VerticalArrow 
          isActive={isArrowActive('decoder_ffn')} 
          isCompleted={isArrowCompleted('decoder_ffn')}
          height={25}
        />

        {/* Feed Forward */}
        <ComponentBlock
          id="decoder_ffn"
          label="Feed"
          sublabel="Forward"
          state={getBlockState('decoder_ffn')}
          onClick={() => onBlockClick('decoder_ffn')}
          tooltip="Position-wise FFN (same as encoder)"
          color="pink"
          width="w-44"
        />

        <VerticalArrow 
          isActive={isArrowActive('output_projection')} 
          isCompleted={isArrowCompleted('output_projection')}
          height={25}
        />

        {/* Add & Norm 3 (after FFN) */}
        <ComponentBlock
          id="decoder_final_norm"
          label="Add & Norm"
          state={completedSteps.includes('decoder_ffn') ? 'completed' : 'locked'}
          onClick={() => {}}
          tooltip="Final normalization in decoder"
          color="cyan"
          width="w-44"
        />
      </div>

      <VerticalArrow 
        isActive={isArrowActive('output_projection')} 
        isCompleted={isArrowCompleted('output_projection')}
        height={30}
      />

      {/* Linear Projection */}
      <ComponentBlock
        id="output_projection"
        label="Linear"
        state={getBlockState('output_projection')}
        onClick={() => onBlockClick('output_projection')}
        tooltip="Projects to vocabulary size"
        color="purple"
        width="w-44"
      />

      <VerticalArrow 
        isActive={isArrowActive('translation_complete')} 
        isCompleted={isArrowCompleted('translation_complete')}
        height={25}
      />

      {/* Softmax */}
      <ComponentBlock
        id="translation_complete"
        label="Softmax"
        state={getBlockState('translation_complete')}
        onClick={() => onBlockClick('translation_complete')}
        tooltip="Converts to probability distribution"
        color="purple"
        width="w-44"
      />

      {/* Output Probabilities */}
      <div className="mt-4 text-center">
        <div className="text-xs text-slate-400 font-mono px-3 py-1 bg-slate-800/50 rounded border border-slate-700 inline-block">
          Output Probabilities
        </div>
        <div className="text-[10px] text-slate-500 mt-1">
          Final Translation
        </div>
      </div>
    </div>
  );
}