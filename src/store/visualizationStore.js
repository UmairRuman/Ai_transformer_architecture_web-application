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
  
  // Animation state
  currentStep: 'idle',
  isPlaying: false,
  animationSpeed: 1,
  isPaused: false,
  
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
  
  // Actions
  setConfig: (config) => set({ config }),
  
  setInputSentence: (sentence) => set({ inputSentence: sentence }),
  
  setTokens: (tokens) => set({ tokens }),
  
  setEmbeddings: (embeddings) => set({ embeddings }),
  
  setPositionEncodings: (encodings) => set({ positionEncodings: encodings }),
  
  setFinalInputVectors: (vectors) => set({ finalInputVectors: vectors }),
  
  setCurrentStep: (step) => set({ currentStep: step }),
  
  setIsPlaying: (playing) => set({ isPlaying: playing }),
  
  togglePlay: () => set((state) => ({ 
    isPlaying: !state.isPlaying,
    isPaused: state.isPlaying ? !state.isPaused : false
  })),
  
  pauseAnimation: () => set({ isPaused: true, isPlaying: false }),
  
  resumeAnimation: () => set({ isPaused: false, isPlaying: true }),
  
  setAnimationSpeed: (speed) => set({ animationSpeed: speed }),
  
  setActiveComponent: (component) => set({ 
    activeComponent: component,
    showIntuition: false,
    intuitionContent: null
  }),
  
  toggleIntuition: () => set((state) => ({ 
    showIntuition: !state.showIntuition 
  })),
  
  setIntuitionContent: (content) => set({ 
    intuitionContent: content,
    showIntuition: true 
  }),
  
  setAttentionData: (data) => set({ attentionData: data }),
  
  resetVisualization: () => set({
    currentStep: 'idle',
    isPlaying: false,
    isPaused: false,
    activeComponent: null,
    showIntuition: false,
    intuitionContent: null,
    tokens: [],
    embeddings: [],
    positionEncodings: [],
    finalInputVectors: [],
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
    const steps = ['idle', 'tokenizing', 'embedding', 'positional', 'attention'];
    const currentIndex = steps.indexOf(state.currentStep);
    const nextIndex = Math.min(currentIndex + 1, steps.length - 1);
    return { currentStep: steps[nextIndex] };
  }),
  
  previousStep: () => set((state) => {
    const steps = ['idle', 'tokenizing', 'embedding', 'positional', 'attention'];
    const currentIndex = steps.indexOf(state.currentStep);
    const prevIndex = Math.max(currentIndex - 1, 0);
    return { currentStep: steps[prevIndex] };
  })
}));