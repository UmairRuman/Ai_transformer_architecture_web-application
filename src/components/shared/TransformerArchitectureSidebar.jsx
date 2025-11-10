'use client';

import { useState } from 'react';
import { Check, Lock, ArrowRight, ArrowDown, Menu, X, Zap, Info, ExternalLink } from 'lucide-react';
import { useVisualizationStore } from '../../store/visualizationStore';

// Tooltip Component
const Tooltip = ({ children, content }) => {
  const [show, setShow] = useState(false);

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        className="cursor-help"
      >
        {children}
      </div>
      {show && (
        <div className="absolute z-50 w-64 p-3 bg-slate-800 border-2 border-purple-400 rounded-lg shadow-2xl text-xs text-slate-200 -right-2 top-full mt-2 animate-fadeIn">
          {content}
          <div className="absolute -top-2 right-4 w-4 h-4 bg-slate-800 border-t-2 border-l-2 border-purple-400 transform rotate-45" />
        </div>
      )}
    </div>
  );
};

// Step Info Data
const stepInfo = {
  tokenizing: {
    description: "Splits sentence into individual words/tokens. Foundation of all NLP.",
    realWorld: "GPT-4 uses ~100k tokens in vocabulary",
    paperSection: "Section 3.1"
  },
  embedding: {
    description: "Converts each token into a dense vector. Similar words get similar vectors.",
    realWorld: "Typical dim: 512 (BERT), 768 (GPT-2), 12,288 (GPT-4)",
    paperSection: "Section 3.4"
  },
  positional: {
    description: "Adds position information so model knows word order. Uses sine/cosine functions.",
    realWorld: "Enables parallel processing unlike RNNs",
    paperSection: "Section 3.5"
  },
  attention: {
    description: "Each word 'looks at' all other words to understand context. Key innovation!",
    realWorld: "8-16 heads typical, 96 heads in GPT-3",
    paperSection: "Section 3.2.1"
  },
  addnorm: {
    description: "Residual connection + Layer Norm. Stabilizes training of deep networks.",
    realWorld: "Enables stacking 6-96+ layers",
    paperSection: "Section 3.1"
  },
  feedforward: {
    description: "2-layer neural network applied to each position independently.",
    realWorld: "Typically 4x expansion (d_model=512 → 2048)",
    paperSection: "Section 3.3"
  },
  decoder_masked_attention: {
    description: "Self-attention with causal mask. Prevents 'cheating' by looking at future words.",
    realWorld: "Core of autoregressive generation",
    paperSection: "Section 3.2.3"
  },
  decoder_cross_attention: {
    description: "Decoder 'queries' the encoder output. How translation happens!",
    realWorld: "Q from decoder, K&V from encoder",
    paperSection: "Section 3.2.3"
  },
  output_projection: {
    description: "Projects decoder output to vocabulary size. Final prediction layer.",
    realWorld: "50k-100k vocab size in production",
    paperSection: "Section 3.4"
  }
};

// Block Component with Enhanced Features
const ArchitectureBlock = ({ 
  step, 
  label, 
  icon, 
  status, 
  onClick, 
  color = 'blue',
  isSubBlock = false,
  showInfo = false
}) => {
  const [expanded, setExpanded] = useState(false);
  const info = stepInfo[step];

  const colorMap = {
    blue: {
      active: 'border-blue-400 bg-blue-500/20 text-blue-300 shadow-lg shadow-blue-500/50',
      completed: 'border-green-400 bg-green-500/10 text-green-300 hover:bg-green-500/20 cursor-pointer',
      locked: 'border-slate-600 bg-slate-800/50 text-slate-500 opacity-60'
    },
    purple: {
      active: 'border-purple-400 bg-purple-500/20 text-purple-300 shadow-lg shadow-purple-500/50',
      completed: 'border-green-400 bg-green-500/10 text-green-300 hover:bg-green-500/20 cursor-pointer',
      locked: 'border-slate-600 bg-slate-800/50 text-slate-500 opacity-60'
    },
    pink: {
      active: 'border-pink-400 bg-pink-500/20 text-pink-300 shadow-lg shadow-pink-500/50',
      completed: 'border-green-400 bg-green-500/10 text-green-300 hover:bg-green-500/20 cursor-pointer',
      locked: 'border-slate-600 bg-slate-800/50 text-slate-500 opacity-60'
    },
    cyan: {
      active: 'border-cyan-400 bg-cyan-500/20 text-cyan-300 shadow-lg shadow-cyan-500/50',
      completed: 'border-green-400 bg-green-500/10 text-green-300 hover:bg-green-500/20 cursor-pointer',
      locked: 'border-slate-600 bg-slate-800/50 text-slate-500 opacity-60'
    }
  };

  const statusClass = colorMap[color][status] || colorMap[color].locked;
  const isClickable = status === 'completed';

  return (
    <div className="space-y-2">
      <div
        className={`
          relative border-2 rounded-lg transition-all duration-300
          ${isSubBlock ? 'p-2' : 'p-3'}
          ${statusClass}
          ${status === 'active' ? 'animate-pulse' : ''}
          ${isClickable ? 'transform hover:scale-105' : ''}
        `}
      >
        <div className="flex items-center justify-between gap-2">
          <div 
            className="flex items-center gap-2 flex-1 min-w-0"
            onClick={isClickable ? onClick : undefined}
          >
            {icon && <span className="flex-shrink-0 text-base">{icon}</span>}
            <span className={`font-semibold truncate ${isSubBlock ? 'text-xs' : 'text-sm'}`}>
              {label}
            </span>
          </div>
          
          <div className="flex items-center gap-1 flex-shrink-0">
            {showInfo && info && status !== 'locked' && (
              <Tooltip content={
                <div className="space-y-2">
                  <div className="font-semibold text-purple-300">{label}</div>
                  <div>{info.description}</div>
                  <div className="text-cyan-300 text-xs">
                    💡 Real models: {info.realWorld}
                  </div>
                  <div className="text-slate-400 text-xs">
                    📄 Paper: {info.paperSection}
                  </div>
                </div>
              }>
                <Info className="w-3 h-3 text-slate-400 hover:text-purple-400 transition-colors" />
              </Tooltip>
            )}
            
            {status === 'completed' && (
              <Check className="w-4 h-4 text-green-400" />
            )}
            {status === 'locked' && (
              <Lock className="w-4 h-4 text-slate-500" />
            )}
            {status === 'active' && (
              <Zap className="w-4 h-4 text-yellow-400 animate-pulse" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Encoder Diagram
const EncoderSection = ({ currentStep, completedSteps, onStepClick }) => {
  const encoderSteps = [
    { id: 'tokenizing', label: 'Tokenize', color: 'blue', icon: '✂️' },
    { id: 'embedding', label: 'Embedding', color: 'purple', icon: '🔢' },
    { id: 'positional', label: 'Positional Enc.', color: 'purple', icon: '📍' },
    { id: 'attention', label: 'Multi-Head Attention', color: 'blue', icon: '🎯', showInfo: true },
    { id: 'addnorm', label: 'Add & Norm', color: 'cyan', icon: '➕', showInfo: true },
    { id: 'feedforward', label: 'Feed Forward', color: 'purple', icon: '⚡', showInfo: true }
  ];

  const getStatus = (stepId) => {
    if (stepId === currentStep) return 'active';
    if (completedSteps.includes(stepId)) return 'completed';
    return 'locked';
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 px-2 mb-2">
        <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
        <h3 className="text-sm font-bold text-blue-300 uppercase tracking-wide">
          Encoder
        </h3>
        <span className="text-xs text-slate-500">(Source Language)</span>
      </div>

      {encoderSteps.map((step, idx) => (
        <div key={step.id}>
          <ArchitectureBlock
            step={step.id}
            label={step.label}
            icon={step.icon}
            status={getStatus(step.id)}
            onClick={() => onStepClick(step.id)}
            color={step.color}
            showInfo={step.showInfo}
          />
          {idx < encoderSteps.length - 1 && (
            <div className="flex justify-center py-1">
              <ArrowDown className={`w-4 h-4 transition-colors ${
                completedSteps.includes(encoderSteps[idx + 1].id) || currentStep === encoderSteps[idx + 1].id
                  ? 'text-green-400'
                  : 'text-slate-600'
              }`} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

// Decoder Diagram
const DecoderSection = ({ currentStep, completedSteps, onStepClick }) => {
  const decoderSteps = [
    { id: 'decoder_start', label: 'Start Generation', color: 'pink', icon: '▶️' },
    { id: 'decoder_embedding', label: 'Output Embedding', color: 'pink', icon: '🔢' },
    { id: 'decoder_positional', label: 'Positional Enc.', color: 'pink', icon: '📍' },
    { id: 'decoder_masked_attention', label: 'Masked Attention', color: 'pink', icon: '🚫', showInfo: true },
    { id: 'decoder_addnorm1', label: 'Add & Norm', color: 'cyan', icon: '➕' },
    { id: 'decoder_cross_attention', label: 'Cross Attention', color: 'cyan', icon: '🔗', showInfo: true },
    { id: 'decoder_addnorm2', label: 'Add & Norm', color: 'cyan', icon: '➕' },
    { id: 'decoder_ffn', label: 'Feed Forward', color: 'pink', icon: '⚡' },
    { id: 'output_projection', label: 'Output Projection', color: 'purple', icon: '📊', showInfo: true },
    { id: 'translation_complete', label: 'Complete!', color: 'purple', icon: '✨' }
  ];

  const getStatus = (stepId) => {
    if (stepId === currentStep) return 'active';
    if (completedSteps.includes(stepId)) return 'completed';
    return 'locked';
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 px-2 mb-2">
        <div className="w-2 h-2 rounded-full bg-pink-400 animate-pulse" />
        <h3 className="text-sm font-bold text-pink-300 uppercase tracking-wide">
          Decoder
        </h3>
        <span className="text-xs text-slate-500">(Target Language)</span>
      </div>

      {decoderSteps.map((step, idx) => (
        <div key={step.id}>
          <ArchitectureBlock
            step={step.id}
            label={step.label}
            icon={step.icon}
            status={getStatus(step.id)}
            onClick={() => onStepClick(step.id)}
            color={step.color}
            showInfo={step.showInfo}
          />
          {idx < decoderSteps.length - 1 && (
            <div className="flex justify-center py-1">
              <ArrowDown className={`w-4 h-4 transition-colors ${
                completedSteps.includes(decoderSteps[idx + 1].id) || currentStep === decoderSteps[idx + 1].id
                  ? 'text-green-400'
                  : 'text-slate-600'
              }`} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

// Main Sidebar Component
export default function TransformerArchitectureSidebar() {
  const { currentStep, setCurrentStep } = useVisualizationStore();
  const [isOpen, setIsOpen] = useState(false);

  const allSteps = [
    'tokenizing', 'embedding', 'positional', 'attention', 'addnorm', 'feedforward',
    'decoder_start', 'decoder_embedding', 'decoder_positional',
    'decoder_masked_attention', 'decoder_addnorm1',
    'decoder_cross_attention', 'decoder_addnorm2',
    'decoder_ffn', 'output_projection', 'translation_complete'
  ];

  const currentIndex = allSteps.indexOf(currentStep);
  const completedSteps = currentIndex >= 0 ? allSteps.slice(0, currentIndex) : [];

  const handleStepClick = (step) => {
    if (completedSteps.includes(step)) {
      setCurrentStep(step);
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 lg:hidden bg-gradient-to-br from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white p-4 rounded-full shadow-2xl transition-all transform hover:scale-110"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:sticky top-0 left-0 h-screen
          w-80 bg-slate-900 border-r border-slate-700
          overflow-y-auto transition-transform duration-300 z-40
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
        style={{ scrollbarWidth: 'thin', scrollbarColor: '#475569 #1e293b' }}
      >
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="text-center pb-4 border-b border-slate-700">
            <h2 className="text-lg font-bold text-white mb-1">
              🤖 Transformer Architecture
            </h2>
            <p className="text-xs text-slate-400 mb-2">
              Interactive Step-by-Step Guide
            </p>
            <a
              href="https://arxiv.org/abs/1706.03762"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300 transition-colors"
            >
              <ExternalLink className="w-3 h-3" />
              Read Original Paper
            </a>
          </div>

          {/* Encoder */}
          <EncoderSection
            currentStep={currentStep}
            completedSteps={completedSteps}
            onStepClick={handleStepClick}
          />

          {/* Encoder → Decoder Connection */}
          <div className="flex items-center justify-center py-4 border-y border-slate-700 bg-gradient-to-r from-blue-500/10 to-pink-500/10 rounded-lg">
            <div className="flex flex-col items-center gap-2">
              <ArrowDown className="w-6 h-6 text-cyan-400 animate-bounce" />
              <div className="text-xs text-cyan-300 font-semibold">Encoder Output</div>
              <div className="text-xs text-slate-400">→ Decoder Input</div>
              <ArrowDown className="w-6 h-6 text-cyan-400 animate-bounce" />
            </div>
          </div>

          {/* Decoder */}
          <DecoderSection
            currentStep={currentStep}
            completedSteps={completedSteps}
            onStepClick={handleStepClick}
          />

          {/* Legend */}
          <div className="pt-4 border-t border-slate-700 space-y-2 text-xs bg-slate-800/30 rounded-lg p-3">
            <div className="text-slate-300 font-semibold mb-3 flex items-center gap-2">
              <Info className="w-4 h-4 text-purple-400" />
              Legend
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Zap className="w-3 h-3 text-yellow-400" />
                <span className="text-slate-300">Currently viewing</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-3 h-3 text-green-400" />
                <span className="text-slate-300">Completed (click to review)</span>
              </div>
              <div className="flex items-center gap-2">
                <Lock className="w-3 h-3 text-slate-500" />
                <span className="text-slate-300">Locked (not yet reached)</span>
              </div>
              <div className="flex items-center gap-2 pt-2 border-t border-slate-700">
                <Info className="w-3 h-3 text-purple-400" />
                <span className="text-slate-300">Hover (ℹ️) for details</span>
              </div>
            </div>
          </div>

          {/* Progress Stats */}
          <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-lg p-4 border border-purple-400/30">
            <div className="text-xs text-purple-300 font-semibold mb-2">📊 Progress</div>
            <div className="space-y-1 text-xs text-slate-300">
              <div className="flex justify-between">
                <span>Steps Completed:</span>
                <span className="font-bold text-green-400">{completedSteps.length}/{allSteps.length}</span>
              </div>
              <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-green-400 to-green-600 transition-all duration-500"
                  style={{ width: `${(completedSteps.length / allSteps.length) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden"
        />
      )}
    </>
  );
}