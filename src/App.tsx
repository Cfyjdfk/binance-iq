import React, { useState, useEffect, useRef } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import FAQ from "./components/FAQ";
import Resources from "./components/Resources";
import LaunchpoolPage from "./components/LaunchpoolPage";
import Agent from "./components/Agent";
import Toast from "./components/Toast";
import KeyboardShortcutHelper from "./components/KeyboardShortcutHelper";
import "./App.css";
// Import scrollbar styling
import "./components/scrollbar.css";

function App() {
  const [isAgentOpen, setIsAgentOpen] = useState(false);
  const [toast, setToast] = useState({
    message: "",
    type: "success" as "success" | "error" | "info",
    isVisible: false
  });

  // MUTEX SYSTEM: Create a system that prevents Agent from opening when Binance IQ is present
  const mutexRef = useRef({
    isBinanceIQOpen: false,                // Tracks if Binance IQ is open
    isLocked: false,                       // Prevents operations when locked
    lastBinanceIQCloseTime: 0,             // When was the last Binance IQ closed
    lastAgentOpenTime: 0,                  // When was the last Agent opened
    cooldownPeriod: 1000,                  // Cooldown period in ms after closing Binance IQ
    isScanning: false                      // Flag to prevent concurrent scans
  });

  // The most direct approach to identify Binance IQ popups
  const scanForBinanceIQPopups = () => {
    // If we're already scanning, don't start another scan
    if (mutexRef.current.isScanning) return null;
    
    try {
      mutexRef.current.isScanning = true;
      
      let popupFound = false;
      let popupElements: HTMLElement[] = [];
      
      // 1. Check for any dialog-like elements in the DOM that aren't ours
      const potentialPopups = document.querySelectorAll(
        '.modal, [role="dialog"], .popup, .dialog, .popover, .dropdown-menu, .overlay, ' +
        '[class*="modal"], [class*="popup"], [class*="dialog"], [class*="overlay"], ' + 
        '[aria-modal="true"], [data-role="dialog"], ' +
        // Add more Binance-specific selectors
        '.bn-modal, .bnc-modal, [class*="Popup"], [class*="Dialog"], .css-.*' 
      );
      
      Array.from(potentialPopups).forEach(element => {
        if (!(element instanceof HTMLElement)) return;
        
        // Skip our own Agent modal and components
        if (element.closest('.agent-container') || 
            element.classList.contains('toast-notification') || 
            element.closest('.keyboard-shortcut-helper')) return;
        
        // Check if the element is visible - more thoroughly
        const style = getComputedStyle(element);
        const rect = element.getBoundingClientRect();
        
        // More comprehensive visibility check
        const isVisible = style.display !== 'none' && 
                          style.visibility !== 'hidden' && 
                          parseFloat(style.opacity) > 0 &&
                          rect.width > 0 && 
                          rect.height > 0 &&
                          document.body.contains(element);
        
        if (isVisible) {
          console.log("Found popup element:", element);
          popupFound = true;
          popupElements.push(element);
        }
      });
      
      // 2. Check for fixed/absolute positioned elements that might be dialogs
      const positionedElements = document.querySelectorAll(
        '[style*="position: fixed"], [style*="position:fixed"], [style*="position: absolute"], ' +
        '[style*="z-index"]'
      );
      
      Array.from(positionedElements).forEach(element => {
        if (!(element instanceof HTMLElement)) return;
        
        // Skip our own Agent modal and components
        if (element.closest('.agent-container') || 
            element.classList.contains('toast-notification') || 
            element.closest('.keyboard-shortcut-helper')) return;
        
        // Skip elements that we've already identified
        if (popupElements.includes(element)) return;
        
        // Check if it's sizeable (small elements are likely not popups)
        const rect = element.getBoundingClientRect();
        if (rect.width < 100 || rect.height < 100) return;
        
        // For fixed/absolute elements, require them to be in the viewport and reasonably sized
        const isInViewport = 
          rect.top < window.innerHeight &&
          rect.left < window.innerWidth &&
          rect.bottom > 0 &&
          rect.right > 0;
        
        const style = getComputedStyle(element);
        
        // More comprehensive visibility check 
        const isVisible = style.display !== 'none' && 
                          style.visibility !== 'hidden' && 
                          parseFloat(style.opacity) > 0 &&
                          isInViewport &&
                          document.body.contains(element);
        
        // Check if it potentially has a high z-index
        const zIndex = parseInt(style.zIndex, 10);
        const hasHighZIndex = !isNaN(zIndex) && zIndex > 100;
        
        if (isVisible && hasHighZIndex) {
          console.log("Found positioned popup:", element);
          popupFound = true;
          popupElements.push(element);
        }
      });
      
      // Immediately update the mutex state - important!
      mutexRef.current.isBinanceIQOpen = popupFound;
      
      if (popupFound) {
        console.log(`Found ${popupElements.length} Binance popups`);
      }
      
      // Return the result
      return { popupFound, popupElements };
    } catch (error) {
      console.error("Error scanning for popups:", error);
      return { popupFound: false, popupElements: [] };
    } finally {
      mutexRef.current.isScanning = false;
    }
  };

  // Actively close any Binance IQ popups
  const closeBinanceIQPopups = () => {
    try {
      // First scan for popups
      const scan = scanForBinanceIQPopups();
      if (!scan || !scan.popupFound || scan.popupElements.length === 0) {
        console.log("No popups found to close");
        return false;
      }
      
      console.log(`Attempting to close ${scan.popupElements.length} popups`);
      
      // Try multiple approaches to close each popup
      let anyPopupClosed = false;
      
      // Force modal backdrop removal if it exists (common in Bootstrap and similar libraries)
      const modalBackdrops = document.querySelectorAll('.modal-backdrop, .backdrop, .overlay');
      Array.from(modalBackdrops).forEach(backdrop => {
        if (backdrop instanceof HTMLElement) {
          backdrop.remove();
        }
      });
      
      scan.popupElements.forEach(popup => {
        // 1. Try to find and click close buttons
        let buttonClicked = false;
        
        // Look for close buttons - expanded list with Binance-specific selectors
        const closeSelectors = [
          'button.close', 
          '[aria-label="Close"]', 
          '[aria-label="close"]',
          '.close-button',
          '.btn-close',
          'button.btn-close',
          'button[title*="lose"]',
          '.modal-close',
          'button.modal-close',
          'button[class*="close"]',
          // Add Binance-specific selectors
          '.bn-modal-close',
          '.close-icon',
          '[data-bn-type="close"]',
          '[class*="CloseIcon"]'
        ];
        
        Array.from(closeSelectors).forEach(selector => {
          try {
            const closeButtons = popup.querySelectorAll(selector);
            
            Array.from(closeButtons).forEach(button => {
              if (button instanceof HTMLElement && !buttonClicked) {
                console.log("Clicking close button:", button);
                // Try both click() and a simulated click event
                try {
                  button.click();
                } catch (e) {
                  // Fallback to dispatching a click event
                  const clickEvent = new MouseEvent('click', {
                    bubbles: true,
                    cancelable: true,
                    view: window
                  });
                  button.dispatchEvent(clickEvent);
                }
                buttonClicked = true;
                anyPopupClosed = true;
              }
            });
            
            if (buttonClicked) return false; // break the loop
          } catch (e) {
            // Continue to the next selector
          }
        });
        
        // If no button was clicked, try looking for "X" or "✕" text or SVG icons
        if (!buttonClicked) {
          // Check for elements containing X-like characters
          const allElements = popup.querySelectorAll('*');
          
          Array.from(allElements).forEach(element => {
            if (element instanceof HTMLElement && !buttonClicked) {
              const text = element.textContent || '';
              if (text.includes('×') || text.includes('✕') || text.includes('X') || 
                  text.includes('Close') || text.includes('close')) {
                console.log("Clicking element with close text:", element);
                try {
                  element.click();
                } catch (e) {
                  // Fallback to dispatching a click event
                  const clickEvent = new MouseEvent('click', {
                    bubbles: true,
                    cancelable: true,
                    view: window
                  });
                  element.dispatchEvent(clickEvent);
                }
                buttonClicked = true;
                anyPopupClosed = true;
              }
            }
          });
          
          // Also look for SVG close icons
          const svgElements = popup.querySelectorAll('svg');
          Array.from(svgElements).forEach(svg => {
            if (!buttonClicked && svg.parentElement) {
              // SVGs are often used for close icons
              console.log("Clicking potential SVG close icon");
              try {
                svg.parentElement.click();
              } catch (e) {
                // Fallback to dispatching a click event
                const clickEvent = new MouseEvent('click', {
                  bubbles: true,
                  cancelable: true,
                  view: window
                });
                svg.parentElement.dispatchEvent(clickEvent);
              }
              buttonClicked = true;
              anyPopupClosed = true;
            }
          });
        }
        
        // If still no success, try to hide it with CSS
        if (!buttonClicked) {
          try {
            console.log("Force-hiding popup with CSS");
            // Apply CSS to force-hide the popup
            popup.style.setProperty('display', 'none', 'important');
            popup.style.setProperty('visibility', 'hidden', 'important');
            popup.style.setProperty('opacity', '0', 'important');
            popup.style.setProperty('pointer-events', 'none', 'important');
            popup.style.setProperty('z-index', '-1', 'important');
            
            // Sometimes removing from DOM is more effective
            if (popup.parentNode) {
              popup.parentNode.removeChild(popup);
            }
            
            anyPopupClosed = true;
          } catch (e) {
            console.warn("Failed to hide popup with CSS:", e);
          }
        }
      });
      
      // Double-check that we actually closed all popups
      const postScan = scanForBinanceIQPopups();
      if (postScan && postScan.popupFound) {
        console.log("Some popups remain after closing attempt, forcing another approach");
        // Force body to reset modal state (used by many frameworks)
        document.body.classList.remove('modal-open');
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
      }
      
      // If we closed anything, update the mutex
      if (anyPopupClosed) {
        console.log("Successfully closed popups");
        mutexRef.current.isBinanceIQOpen = false;
        mutexRef.current.lastBinanceIQCloseTime = Date.now();
        return true;
      }
      
      return false;
    } catch (error) {
      console.error("Error closing popups:", error);
      // Update the mutex anyway to prevent Agent from opening
      mutexRef.current.lastBinanceIQCloseTime = Date.now();
      return false;
    }
  };

  // Command pattern: Attempt to open Agent with safety checks
  const attemptOpenAgent = () => {
    try {
      // 1. Lock the mutex during this operation
      if (mutexRef.current.isLocked) return false;
      mutexRef.current.isLocked = true;
      
      try {
        // 2. If Agent is already open, do nothing
        if (isAgentOpen) return false;
        
        // 3. Scan for Binance IQ popups
        const scan = scanForBinanceIQPopups();
        
        // 4. If Binance IQ is open, try to close it, but don't open Agent
        if (scan && scan.popupFound) {
          closeBinanceIQPopups();
          return false;
        }
        
        // 5. Check if we're in the cooldown period after closing Binance IQ
        const now = Date.now();
        if (now - mutexRef.current.lastBinanceIQCloseTime < mutexRef.current.cooldownPeriod) {
          return false; // Still in cooldown, don't open
        }
        
        // 6. All clear - open Agent
        mutexRef.current.lastAgentOpenTime = now;
        setIsAgentOpen(true);
        return true;
      } finally {
        // Always unlock the mutex
        mutexRef.current.isLocked = false;
      }
    } catch (error) {
      console.error("Error in attemptOpenAgent:", error);
      mutexRef.current.isLocked = false;
      return false;
    }
  };

  // Command pattern: Handle keyboard shortcut
  const handleKeyboardShortcut = async (e: KeyboardEvent) => {
    try {
      // Only process cmd+k (Mac) or ctrl+k (Windows/Linux)
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        console.log("Cmd+K shortcut detected");
        
        // Check if text is selected - let default behavior handle it
        const selection = window.getSelection();
        const hasTextSelected = selection && selection.toString().trim().length > 0;
        
        // Check if text is selected in an input element
        const activeElement = document.activeElement;
        let inputHasSelection = false;
        
        if (activeElement instanceof HTMLInputElement || activeElement instanceof HTMLTextAreaElement) {
          inputHasSelection = activeElement.selectionStart !== activeElement.selectionEnd;
        }
        
        // If text is selected, don't interfere
        if (hasTextSelected || inputHasSelection) {
          console.log("Text selection detected, allowing default behavior");
          return;
        }
        
        // Prevent default behavior AFTER selection checks
        e.preventDefault();
        e.stopPropagation();
        
        // CRITICAL: Create a mutex lock to prevent race conditions
        if (mutexRef.current.isLocked) {
          console.log("Mutex is locked, ignoring shortcut");
          return;
        }
        
        // Lock the mutex
        mutexRef.current.isLocked = true;
        
        try {
          // **Perform an AGGRESSIVE scan first**
          console.log("Cmd+K: Scanning for Binance popups");
          const scan = scanForBinanceIQPopups();
          
          // DECISION LOGIC: Strict priority order
          
          // 1. If Binance IQ popup is detected, ALWAYS close it and NEVER open Agent
          if (scan && scan.popupFound) {
            console.log("Cmd+K: Binance popup found, closing it");
            await new Promise<void>((resolve) => {
              // Close the popups
              closeBinanceIQPopups();
              
              // Force update the mutex state
              mutexRef.current.isBinanceIQOpen = false;
              mutexRef.current.lastBinanceIQCloseTime = Date.now();
              
              // Delay slightly to ensure closures are processed
              setTimeout(resolve, 50);
            });
            
            console.log("Cmd+K: Popup closing complete, NOT opening Agent");
            return; // EXIT - do not proceed to opening Agent
          }
          
          // 2. If the Agent is already open, close it
          if (isAgentOpen) {
            console.log("Cmd+K: Agent is open, closing it");
            setIsAgentOpen(false);
            return;
          }
          
          // 3. Double-check cooldown period before opening Agent
          const now = Date.now();
          const timeSinceLastClose = now - mutexRef.current.lastBinanceIQCloseTime;
          
          if (timeSinceLastClose < mutexRef.current.cooldownPeriod) {
            console.log(`Cmd+K: In cooldown period (${timeSinceLastClose}ms < ${mutexRef.current.cooldownPeriod}ms)`);
            return;
          }
          
          // 4. Perform one final scan before opening Agent
          const finalScan = scanForBinanceIQPopups();
          if (finalScan && finalScan.popupFound) {
            console.log("Cmd+K: Popup detected in final check, not opening Agent");
            closeBinanceIQPopups();
            return;
          }
          
          // 5. Safe to open Agent - all conditions have been checked
          console.log("Cmd+K: All checks passed, opening Agent");
          mutexRef.current.lastAgentOpenTime = now;
          setIsAgentOpen(true);
        } finally {
          // Always unlock the mutex when done
          mutexRef.current.isLocked = false;
        }
      }
    } catch (error) {
      console.error("Error handling keyboard shortcut:", error);
      // Make sure to unlock the mutex in case of error
      mutexRef.current.isLocked = false;
    }
  };

  // Monitor system to ensure Agent and Binance IQ never coexist
  useEffect(() => {
    // Register keyboard shortcut
    document.addEventListener('keydown', handleKeyboardShortcut, {
      capture: true,   // Intercept early
      passive: false   // Allow preventDefault
    });
    
    // Create an aggressive watcher to ensure Agent and Binance IQ don't coexist
    const popupWatcher = setInterval(() => {
      try {
        // Skip if mutex is locked (operation in progress)
        if (mutexRef.current.isLocked) return;
        
        // Perform an aggressive scan
        const scan = scanForBinanceIQPopups();
        
        // CASE 1: If Agent is open AND Binance IQ is detected, close Agent immediately
        if (isAgentOpen && scan && scan.popupFound) {
          console.log("PopupWatcher: Binance popup detected while Agent is open! Closing Agent");
          setIsAgentOpen(false);
          return;
        }
        
        // CASE 2: If popups are detected even without Agent, track this in the mutex state
        if (scan && scan.popupFound) {
          console.log("PopupWatcher: Binance popup detected");
          // Update the mutex if needed
          if (!mutexRef.current.isBinanceIQOpen) {
            mutexRef.current.isBinanceIQOpen = true;
          }
          
          // Dynamically apply the binance-scrollbar class to all popup content elements
          if (scan.popupElements && scan.popupElements.length > 0) {
            scan.popupElements.forEach(popup => {
              // Find scrollable containers within the popup
              const scrollableElements = popup.querySelectorAll('div');
              Array.from(scrollableElements).forEach(elem => {
                if (elem instanceof HTMLElement) {
                  const style = getComputedStyle(elem);
                  // Check if this element has scrollable content
                  if (style.overflow === 'auto' || style.overflow === 'scroll' ||
                      style.overflowY === 'auto' || style.overflowY === 'scroll') {
                    // Add our custom scrollbar class
                    elem.classList.add('binance-scrollbar');
                  }
                }
              });
            });
          }
        }
      } catch (error) {
        console.error("Error in popup watcher:", error);
      }
    }, 100); // Check very frequently
    
    // Cleanup
    return () => {
      document.removeEventListener('keydown', handleKeyboardShortcut, { capture: true });
      clearInterval(popupWatcher);
    };
  }, [isAgentOpen]);

  // Public functions exposed to components
  
  const openAgent = () => {
    // Use the command pattern for better control
    attemptOpenAgent();
  };

  const closeAgent = () => {
    setIsAgentOpen(false);
  };

  const showToast = (message: string, type: "success" | "error" | "info") => {
    setToast({ message, type, isVisible: true });
  };

  const closeToast = () => {
    setToast(prev => ({ ...prev, isVisible: false }));
  };

  return (
    <Router>
      <div className="min-h-screen bg-binance-dark">
        <Navbar openAgent={openAgent} />
        <Routes>
          <Route path="/launchpool" element={<LaunchpoolPage />} />
          <Route path="/" element={
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
          } />
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
        />

        {/* Keyboard Shortcut Helper */}
        <KeyboardShortcutHelper openAgent={openAgent} />
      </div>
    </Router>
  );
}

export default App;
