import { create } from 'zustand';

export const useVisualizationStore = create((set) => ({
  // Configuration
  config: {
    dModel: 6,
    numHeads: 2
  },
  
  // Input data
  inputSentence: '',
  tokens: [],
  embeddings: [],
  positionEncodings: [],
  finalInputVectors: [],
  
  // --- NEW & RENAMED STATE PROPERTIES ---
  // These will hold the output vectors from each major component
  attentionOutputs: [],   // Output from the Multi-Head Attention block
  addNormOutputs1: [],    // Output from the FIRST Add & Norm layer
  feedForwardOutputs: [], // Output from the Feed-Forward Network
  encoderOutputs: [],     // FINAL output from the SECOND Add & Norm layer
  
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
  
  // Attention mechanism state (for deep dive)
  attentionData: {
    queries: [],
    keys: [],
    values: [],
    scores: [],
    scaledScores: [],
    attentionWeights: [],
    outputs: []
  },
  
  // Actions
  setConfig: (config) => set({ config }),
  setInputSentence: (sentence) => set({ inputSentence: sentence }),
  setTokens: (tokens) => set({ tokens }),
  setEmbeddings: (embeddings) => set({ embeddings }),
  setPositionEncodings: (encodings) => set({ positionEncodings: encodings }),
  setFinalInputVectors: (vectors) => set({ finalInputVectors: vectors }),
  
  // --- NEW ACTIONS ---
  setAttentionOutputs: (outputs) => set({ attentionOutputs: outputs }),
  setAddNormOutputs1: (outputs) => set({ addNormOutputs1: outputs }),
  setFeedForwardOutputs: (outputs) => set({ feedForwardOutputs: outputs }),
  setEncoderOutputs: (outputs) => set({ encoderOutputs: outputs }),

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
  
  resetVisualization: () => set({
    currentStep: 'idle',
    isPlaying: false,
    isPaused: false,
    hasStarted: false,
    activeComponent: null,
    showIntuition: false,
    intuitionContent: null,
    tokens: [],
    embeddings: [],
    positionEncodings: [],
    finalInputVectors: [],
    // Reset the new state properties
    attentionOutputs: [],
    addNormOutputs1: [],
    feedForwardOutputs: [],
    encoderOutputs: [],
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
  
  nextStep: () => set((state) => {
    const steps = ['idle', 'tokenizing', 'embedding', 'positional', 'attention' , 'addnorm' , "feedforward"];
    const currentIndex = steps.indexOf(state.currentStep);
    const nextIndex = Math.min(currentIndex + 1, steps.length - 1);
    return { currentStep: steps[nextIndex] };
  }),
  
  previousStep: () => set((state) => {
    const steps = ['idle', 'tokenizing', 'embedding', 'positional', 'attention', 'addnorm' , "feedforward"];
    const currentIndex = steps.indexOf(state.currentStep);
    const prevIndex = Math.max(currentIndex - 1, 0);
    return { currentStep: steps[prevIndex] };
  })
}));