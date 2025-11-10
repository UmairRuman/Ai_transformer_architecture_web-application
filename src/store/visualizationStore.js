// store/visualizationStore.js
import { create } from 'zustand';

export const useVisualizationStore = create((set) => ({
  // Configuration
  config: {
    dModel: 6,
    numHeads: 2
  },
  
  // ENCODER STATE
  inputSentence: '',
  tokens: [],
  embeddings: [],
  positionEncodings: [],
  finalInputVectors: [],
  attentionOutputs: [],
  addNormOutputs1: [],
  feedForwardOutputs: [],
  encoderOutputs: [],
  
  // DECODER STATE (NEW - Phase 2)
  targetLanguage: 'french',
  decoderMode: 'inference', // 'training' or 'inference'
  decoderTokens: [],
  decoderEmbeddings: [],
  decoderPositionEncodings: [],
  decoderFinalInputVectors: [],
  decoderMaskedAttentionOutputs: [],
  decoderAddNormOutputs1: [],
  decoderCrossAttentionOutputs: [],
  decoderAddNormOutputs2: [],
  decoderFFNOutputs: [],
  decoderFinalOutputs: [],
  outputLogits: [],
  outputProbabilities: [],
  predictedTokens: [],
  
  // Animation state
  currentStep: 'idle',
  isPlaying: false,
  animationSpeed: 1,
  isPaused: false,
  hasStarted: false,
  
  // Deep dive state
  activeComponent: null,
  showIntuition: false,
  intuitionContent: null,
  
  // Attention mechanism state
  attentionData: {
    queries: [],
    keys: [],
    values: [],
    scores: [],
    scaledScores: [],
    attentionWeights: [],
    outputs: []
  },
  
  // ENCODER ACTIONS
  setConfig: (config) => set({ config }),
  setInputSentence: (sentence) => set({ inputSentence: sentence }),
  setTokens: (tokens) => set({ tokens }),
  setEmbeddings: (embeddings) => set({ embeddings }),
  setPositionEncodings: (encodings) => set({ positionEncodings: encodings }),
  setFinalInputVectors: (vectors) => set({ finalInputVectors: vectors }),
  setAttentionOutputs: (outputs) => set({ attentionOutputs: outputs }),
  setAddNormOutputs1: (outputs) => set({ addNormOutputs1: outputs }),
  setFeedForwardOutputs: (outputs) => set({ feedForwardOutputs: outputs }),
  setEncoderOutputs: (outputs) => set({ encoderOutputs: outputs }),
  
  // DECODER ACTIONS (NEW)
  setTargetLanguage: (lang) => set({ targetLanguage: lang }),
  setDecoderMode: (mode) => set({ decoderMode: mode }),
  setDecoderTokens: (tokens) => set({ decoderTokens: tokens }),
  setDecoderEmbeddings: (embs) => set({ decoderEmbeddings: embs }),
  setDecoderPositionEncodings: (encs) => set({ decoderPositionEncodings: encs }),
  setDecoderFinalInputVectors: (vecs) => set({ decoderFinalInputVectors: vecs }),
  setDecoderMaskedAttentionOutputs: (outs) => set({ decoderMaskedAttentionOutputs: outs }),
  setDecoderAddNormOutputs1: (outs) => set({ decoderAddNormOutputs1: outs }),
  setDecoderCrossAttentionOutputs: (outs) => set({ decoderCrossAttentionOutputs: outs }),
  setDecoderAddNormOutputs2: (outs) => set({ decoderAddNormOutputs2: outs }),
  setDecoderFFNOutputs: (outs) => set({ decoderFFNOutputs: outs }),
  setDecoderFinalOutputs: (outs) => set({ decoderFinalOutputs: outs }),
  setOutputLogits: (logits) => set({ outputLogits: logits }),
  setOutputProbabilities: (probs) => set({ outputProbabilities: probs }),
  setPredictedTokens: (tokens) => set({ predictedTokens: tokens }),

  setCurrentStep: (step) => set({ currentStep: step }),
  setIsPlaying: (playing) => set({ isPlaying: playing, hasStarted: true }),
  
  togglePlay: () => set((state) => ({ 
    isPlaying: !state.isPlaying,
    isPaused: !state.isPlaying ? false : !state.isPaused,
    hasStarted: true
  })),
  
  pauseAnimation: () => set({ isPaused: true, isPlaying: false }),
  resumeAnimation: () => set({ isPaused: false, isPlaying: true }),
  setAnimationSpeed: (speed) => set({ animationSpeed: speed }),
  
  setActiveComponent: (component) => set({ 
    activeComponent: component,
    showIntuition: false,
    intuitionContent: null
  }),
  
  toggleIntuition: () => set((state) => ({ showIntuition: !state.showIntuition })),
  setIntuitionContent: (content) => set({ intuitionContent: content, showIntuition: true }),
  setAttentionData: (data) => set({ attentionData: data }),
  
  // Restart animation from beginning
  restartAnimation: () => set((state) => ({
    currentStep: 'tokenizing',
    isPlaying: true,
    isPaused: false,
  })),
  
  // Full reset - clears everything
  resetVisualization: () => set({
    currentStep: 'idle',
    isPlaying: false,
    isPaused: false,
    hasStarted: false,
    activeComponent: null,
    showIntuition: false,
    intuitionContent: null,
    
    // Reset encoder
    tokens: [],
    embeddings: [],
    positionEncodings: [],
    finalInputVectors: [],
    attentionOutputs: [],
    addNormOutputs1: [],
    feedForwardOutputs: [],
    encoderOutputs: [],
    
    // Reset decoder
    decoderTokens: [],
    decoderEmbeddings: [],
    decoderPositionEncodings: [],
    decoderFinalInputVectors: [],
    decoderMaskedAttentionOutputs: [],
    decoderAddNormOutputs1: [],
    decoderCrossAttentionOutputs: [],
    decoderAddNormOutputs2: [],
    decoderFFNOutputs: [],
    decoderFinalOutputs: [],
    outputLogits: [],
    outputProbabilities: [],
    predictedTokens: [],
    
    attentionData: {
      queries: [],
      keys: [],
      values: [],
      scores: [],
      scaledScores: [],
      attentionWeights: [],
      outputs: []
    }
  }),
  
  // Navigation
  nextStep: () => set((state) => {
    const steps = [
      'tokenizing', 'embedding', 'positional', 'attention', 'addnorm', 'feedforward',
      'decoder_start', 'decoder_embedding', 'decoder_positional',
      'decoder_masked_attention', 'decoder_addnorm1',
      'decoder_cross_attention', 'decoder_addnorm2',
      'decoder_ffn', 'output_projection', 'translation_complete'
    ];
    const currentIndex = steps.indexOf(state.currentStep);
    const nextIndex = Math.min(currentIndex + 1, steps.length - 1);
    return { currentStep: steps[nextIndex], isPlaying: false };
  }),
  
  previousStep: () => set((state) => {
    const steps = [
      'tokenizing', 'embedding', 'positional', 'attention', 'addnorm', 'feedforward',
      'decoder_start', 'decoder_embedding', 'decoder_positional',
      'decoder_masked_attention', 'decoder_addnorm1',
      'decoder_cross_attention', 'decoder_addnorm2',
      'decoder_ffn', 'output_projection', 'translation_complete'
    ];
    const currentIndex = steps.indexOf(state.currentStep);
    const prevIndex = Math.max(currentIndex - 1, 0);
    return { currentStep: steps[prevIndex], isPlaying: false };
  })
}));