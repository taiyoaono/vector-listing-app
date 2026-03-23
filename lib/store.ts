import { create } from "zustand";
import type { AnalysisResult, ListingData } from "./types";

interface ListingStore extends ListingData {
  setScannedCode: (code: string | null) => void;
  addProductImage: (image: string) => void;
  removeProductImage: (index: number) => void;
  addTagImage: (image: string) => void;
  removeTagImage: (index: number) => void;
  setAnalysis: (analysis: AnalysisResult) => void;
  updateAnalysis: (updates: Partial<AnalysisResult>) => void;
  setSelectedTitleIndex: (index: number) => void;
  setMeasurement: (key: string, value: string) => void;
  setAccessories: (value: string) => void;
  reset: () => void;
}

const initialState: ListingData = {
  scannedCode: null,
  productImages: [],
  tagImages: [],
  analysis: null,
  selectedTitleIndex: 0,
  measurements: {},
  accessories: "",
};

export const useListingStore = create<ListingStore>((set) => ({
  ...initialState,
  setScannedCode: (code) => set({ scannedCode: code }),
  addProductImage: (image) =>
    set((state) => ({ productImages: [...state.productImages, image] })),
  removeProductImage: (index) =>
    set((state) => ({
      productImages: state.productImages.filter((_, i) => i !== index),
    })),
  addTagImage: (image) =>
    set({ tagImages: [image] }),
  removeTagImage: (index) =>
    set((state) => ({
      tagImages: state.tagImages.filter((_, i) => i !== index),
    })),
  setAnalysis: (analysis) => set({ analysis }),
  updateAnalysis: (updates) =>
    set((state) => ({
      analysis: state.analysis ? { ...state.analysis, ...updates } : null,
    })),
  setSelectedTitleIndex: (index) => set({ selectedTitleIndex: index }),
  setMeasurement: (key, value) =>
    set((state) => ({
      measurements: { ...state.measurements, [key]: value },
    })),
  setAccessories: (value) => set({ accessories: value }),
  reset: () => set(initialState),
}));
