import React, { useState, useEffect, useRef, useContext } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import FAQ from "./components/FAQ";
import Resources from "./components/Resources";
import LaunchpoolPage from "./components/LaunchpoolPage";
import PurchasePage from "./components/PurchasePage";
import Agent from "./components/Agent";
import Toast from "./components/Toast";
import KeyboardShortcutHelper from "./components/KeyboardShortcutHelper";
import "./App.css";
// Import scrollbar styling
import "./components/scrollbar.css";
import { IQContext } from "./AIContext";

function App() {
  const { isIqOpen, setIsIqOpen, isAgentOpen, setIsAgentOpen } =
    useContext(IQContext);

  const [toast, setToast] = useState({
    message: "",
    type: "success" as "success" | "error" | "info",
    isVisible: false,
    subtitle: "",
  });

  // Simplified mutex system
  const mutexRef = useRef({
    isLocked: false, // Prevents operations when locked
    lastAgentOpenTime: 0, // When was the last Agent opened
  });

  // Command pattern: Handle keyboard shortcut
  const handleKeyboardShortcut = async (e: KeyboardEvent) => {
    try {
      // Only process cmd+k (Mac) or ctrl+k (Windows/Linux)
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        console.log("Cmd+K shortcut detected");

        // Save current scroll position
        const currentScrollX = window.scrollX;
        const currentScrollY = window.scrollY;

        // Check if text is selected - let default behavior handle it
        const selection = window.getSelection();
        const hasTextSelected =
          selection && selection.toString().trim().length > 0;

        // Check if text is selected in an input element
        const activeElement = document.activeElement;
        let inputHasSelection = false;

        if (
          activeElement instanceof HTMLInputElement ||
          activeElement instanceof HTMLTextAreaElement
        ) {
          inputHasSelection =
            activeElement.selectionStart !== activeElement.selectionEnd;
        }
        
        // Check if click is inside a text-summary-container
        const isInTextSummary = 
          activeElement && activeElement.closest && 
          (activeElement.closest('.text-summary-container') !== null ||
           (e.target && (e.target as Element).closest && (e.target as Element).closest('.text-summary-container') !== null));

        // If text is selected or we're in text summary, don't interfere
        if (hasTextSelected || inputHasSelection || isInTextSummary || isIqOpen) {
          console.log("Text selection or IQ detected, allowing default behavior");
          return;
        }

        // Prevent default behavior AFTER selection checks
        e.preventDefault();
        e.stopPropagation();

        // If the Agent is already open, just close it immediately and return
        if (isAgentOpen) {
          console.log("Cmd+K: Agent is open, closing it");
          setIsAgentOpen(false);

          // Restore scroll position
          setTimeout(() => {
            window.scrollTo(currentScrollX, currentScrollY);
          }, 0);
          return;
        }

        // Only lock mutex if we're opening the agent (not needed for closing)
        if (mutexRef.current.isLocked) {
          console.log("Mutex is locked, ignoring shortcut");
          window.scrollTo(currentScrollX, currentScrollY);
          return;
        }

        // Lock the mutex
        mutexRef.current.isLocked = true;

        try {
          // If IQ is open, don't open Agent
          if (isIqOpen) {
            console.log("Cmd+K: IQ is open, not opening Agent");
            window.scrollTo(currentScrollX, currentScrollY);
            return;
          }

          // Safe to open Agent
          console.log("Cmd+K: All checks passed, opening Agent");
          mutexRef.current.lastAgentOpenTime = Date.now();
          setIsAgentOpen(true);

          // Restore scroll position after opening
          setTimeout(() => {
            window.scrollTo(currentScrollX, currentScrollY);
          }, 50);
        } finally {
          // Always unlock the mutex when done
          mutexRef.current.isLocked = false;

          // Final scroll position restore as a safeguard
          setTimeout(() => {
            window.scrollTo(currentScrollX, currentScrollY);
          }, 100);
        }
      }
    } catch (error) {
      console.error("Error handling keyboard shortcut:", error);
      // Make sure to unlock the mutex in case of error
      mutexRef.current.isLocked = false;

      // Restore scroll position on error
      window.scrollTo(window.scrollX, window.scrollY);
    }
  };

  // Simplified monitor system
  useEffect(() => {
    // Register keyboard shortcut
    document.addEventListener("keydown", handleKeyboardShortcut, {
      capture: true, // Intercept early
      passive: false, // Allow preventDefault
    });

    // Cleanup
    return () => {
      document.removeEventListener("keydown", handleKeyboardShortcut, {
        capture: true,
      });
    };
  }, [isAgentOpen, isIqOpen]);

  // Simplified open function
  const openAgent = () => {
    if (!isIqOpen && !isAgentOpen && !mutexRef.current.isLocked) {
      mutexRef.current.isLocked = true;
      try {
        setIsAgentOpen(true);
        mutexRef.current.lastAgentOpenTime = Date.now();
      } finally {
        mutexRef.current.isLocked = false;
      }
    }
  };

  const closeAgent = () => {
    setIsAgentOpen(false);
  };

  const showToast = (
    message: string,
    type: "success" | "error" | "info",
    subtitle?: string
  ) => {
    setToast({ message, type, isVisible: true, subtitle: subtitle || "" });
  };

  const closeToast = () => {
    setToast((prev) => ({ ...prev, isVisible: false }));
  };

  return (
    <Router>
      <div className="min-h-screen bg-binance-dark">
        <Navbar openAgent={openAgent} />
        <Routes>
          <Route path="/launchpool" element={<LaunchpoolPage />} />
          <Route path="/purchase" element={<PurchasePage showToast={showToast} />} />
          <Route
            path="/"
            element={
              <div className="flex flex-col px-6">
                <Hero />
                <img
                  src="/SS/SS1.png"
                  alt="Screenshot"
                  className="w-full h-screen object-cover mx-auto"
                />
                <FAQ />
                <Resources />
              </div>
            }
          />
        </Routes>

        {/* Agent Modal - adding agent-container class for detection */}
        <div className="agent-container">
          <Agent
            isOpen={isAgentOpen}
            onClose={closeAgent}
            showToast={showToast}
          />
        </div>

        {/* Toast Notification */}
        <Toast
          message={toast.message}
          type={toast.type}
          isVisible={toast.isVisible}
          onClose={closeToast}
          subtitle={toast.subtitle}
        />

        {/* Keyboard Shortcut Helper */}
        <KeyboardShortcutHelper openAgent={openAgent} />
      </div>
    </Router>
  );
}

export default App;
