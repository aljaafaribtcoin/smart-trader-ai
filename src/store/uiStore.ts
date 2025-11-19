import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type ConnectionStatus = 'connected' | 'disconnected' | 'connecting';

interface UIState {
  isDarkMode: boolean;
  sidebarOpen: boolean;
  connectionStatus: ConnectionStatus;
  toggleTheme: () => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setConnectionStatus: (status: ConnectionStatus) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      isDarkMode: true, // Default to dark mode
      sidebarOpen: true,
      connectionStatus: 'connected',
      
      toggleTheme: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
      
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      
      setConnectionStatus: (status) => set({ connectionStatus: status }),
    }),
    {
      name: 'ui-storage',
      partialize: (state) => ({
        isDarkMode: state.isDarkMode,
        sidebarOpen: state.sidebarOpen,
      }),
    }
  )
);
