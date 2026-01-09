import { create } from "zustand";

export type CursorVariant = 'default' | 'click';

interface CursorState {
    isHovered: boolean;
    setIsHovered: (hovered: boolean) => void;
    cursorText: string;
    setCursorText: (text: string) => void;
    cursorVariant: CursorVariant;
    setCursorVariant: (variant: CursorVariant) => void;
}

export const useCursorStore = create<CursorState>((set) => ({
    isHovered: false,
    setIsHovered: (isHovered) => set({ isHovered }),
    cursorText: "",
    setCursorText: (text) => set({ cursorText: text }),
    cursorVariant: 'default',
    setCursorVariant: (variant) => set({ cursorVariant: variant }),
}));