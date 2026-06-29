import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * UI Store
 *
 * Manages UI state like theme, sidebar, etc.
 *
 * Environment configuration is now handled via environment files:
 * - .dev.env (local development)
 * - .test.env (test environment)
 * - .beta.env (beta/preview environment)
 * - .prod.env (production environment)
 */

export const useUIStore = create(
  persist(
    (set, get) => ({
      // State
      theme: "light",
      sidebarOpen: true,
      chatOpen: false,

      // Actions
      toggleTheme: () => {
        const newTheme = get().theme === "light" ? "dark" : "light";
        set({ theme: newTheme });
        document.documentElement.classList.toggle("dark", newTheme === "dark");
      },

      setTheme: (theme) => {
        set({ theme });
        document.documentElement.classList.toggle("dark", theme === "dark");
      },

      toggleSidebar: () => set({ sidebarOpen: !get().sidebarOpen }),

      setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),

      toggleChat: () => set({ chatOpen: !get().chatOpen }),

      setChatOpen: (chatOpen) => set({ chatOpen }),
    }),
    {
      name: "ui-storage",
      partialize: (state) => ({
        theme: state.theme,
      }),
      onRehydrateStorage: () => (state) => {
        // Apply theme on rehydration
        if (state?.theme === "dark") {
          document.documentElement.classList.add("dark");
        }
      },
    },
  ),
);
