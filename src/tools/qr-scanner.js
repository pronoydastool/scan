import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';

export function init(container, app) {
  container.innerHTML = `
    <!-- Result View (Hidden initially) -->
    <div id="result-view" class="hidden space-y-6 mt-4">
      <div class="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-2xl flex items-start gap-3">
        <i data-lucide="check-circle" class="w-5 h-5 text-green-500 mt-0.5"></i>
        <p class="text-xs text-indigo-900/70 dark:text-indigo-200/70">Scan successful!</p>
      </div>

      <div class="result-container items-start text-left">
        <label class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Scanned Result</label>
        <p id="result-text" class="text-sm break-all font-mono bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg w-full border border-slate-100 dark:border-slate-700"></p>
      </div>

      <div class="flex gap-2">
        <button id="copy-result" class="flex-1 btn-secondary flex items-center justify-center gap-2">
          <i data-lucide="copy" class="w-4 h-4"></i> Copy
        </button>
        <button id="open-link" class="flex-1 btn-primary flex items-center justify-center gap-2 hidden">
          <i data-lucide="external-link" class="w-4 h-4"></i> Open Link
        </button>
      </div>

      <button id="scan-again" class="w-full btn-primary flex items-center justify-center gap-2 mt-8">
        <i data-lucide="scan" class="w-4 h-4"></i> Scan Again
      </button>
    </div>

    <!-- Fullscreen Scanner UI -->
    <div id="scanner-view" class="fixed inset-0 z-[60] bg-black flex flex-col hidden">
      <!-- Top Bar -->
      <div class="absolute top-0 left-0 right-0 p-4 pt-6 flex justify-between items-center z-20 text-white bg-gradient-to-b from-black/60 to-transparent">
        <button id="close-scanner-btn" class="p-2 rounded-full bg-black/40 backdrop-blur-md hover:bg-black/60 transition-colors">
          <i data-lucide="x" class="w-6 h-6"></i>
        </button>
        <div class="flex gap-4">
          <button id="toggle-torch" class="p-2 rounded-full bg-black/40 backdrop-blur-md hover:bg-black/60 transition-colors hidden">
            <i data-lucide="zap" class="w-5 h-5"></i>
          </button>
          <button id="switch-camera" class="p-2 rounded-full bg-black/40 backdrop-blur-md hover:bg-black/60 transition-colors">
            <i data-lucide="camera" class="w-5 h-5"></i>
          </button>
        </div>
      </div>

      <!-- Camera Feed -->
      <div id="reader" class="absolute inset-0 w-full h-full bg-black"></div>

      <!-- Overlay (Visual Guide) -->
      <div class="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center overflow-hidden">
        <div class="mb-8 flex flex-col items-center gap-3">
          <div class="flex gap-3 bg-black/40 backdrop-blur-md px-4 py-2 rounded-full">
            <i data-lucide="barcode" class="w-5 h-5 text-white"></i>
            <i data-lucide="qr-code" class="w-5 h-5 text-white"></i>
          </div>
          <p class="text-white font-medium text-sm tracking-wide drop-shadow-md">Align the QR or Barcode within the frame</p>
        </div>

        <div class="scan-box">
          <div class="scan-corner tl"></div>
          <div class="scan-corner tr"></div>
          <div class="scan-corner bl"></div>
          <div class="scan-corner br"></div>
          <div class="scan-line"></div>
        </div>
      </div>

      <!-- Bottom Bar -->
      <div class="absolute bottom-0 left-0 right-0 p-8 flex justify-center z-20 bg-gradient-to-t from-black/80 to-transparent">
        <button id="cancel-scanning-btn" class="px-6 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white rounded-full font-medium transition-colors border border-white/30 pointer-events-auto">
          Cancel Scanning
        </button>
      </div>
    </div>
  `;

  const scannerView = document.getElementById('scanner-view');
  const resultView = document.getElementById('result-view');
  const resultText = document.getElementById('result-text');
  const openLinkBtn = document.getElementById('open-link');

  let html5QrCode;
  let isScanning = false;
  let isTorchOn = false;
  let transitionPromise = Promise.resolve();
  let currentFacingMode = "environment";
  let lastResult = null;

  const torchBtn = document.getElementById('toggle-torch');

  function startScanner() {
    transitionPromise = transitionPromise.then(async () => {
      scannerView.classList.remove('hidden');
      resultView.classList.add('hidden');
      torchBtn.classList.add('hidden');
      isTorchOn = false;
      lastResult = null;
      resultText.innerText = "";

      // Cleanup existing state if necessary
      if (html5QrCode) {
        if (isScanning) {
          try {
            await html5QrCode.stop().catch(() => {});
          } catch (e) {}
          isScanning = false;
        }
        // If the container was removed/replaced, we might need to clear and re-instantiate
        const readerEl = document.getElementById('reader');
        if (!readerEl || !readerEl.contains(document.querySelector('video'))) {
           try { await html5QrCode.clear(); } catch(e) {}
           html5QrCode = null;
        }
      }

      if (!html5QrCode) {
        const readerEl = document.getElementById('reader');
        if (!readerEl) return; // Tool was likely closed
        
        html5QrCode = new Html5Qrcode("reader", {
          formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE]
        });
      }

      try {
        await html5QrCode.start(
          { 
            facingMode: currentFacingMode,
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
          {
            fps: 20,
            qrbox: { width: 250, height: 250 },
            experimentalFeatures: {
              useBarCodeDetectorIfSupported: true
            }
          },
          (decodedText) => {
            if (decodedText === lastResult) return;
            lastResult = decodedText;

            stopScanner().then(() => {
              showResult(decodedText);
            });
          },
          () => {
            // Ignore parse errors
          }
        );
        isScanning = true;

        // Check if torch is supported
        const capabilities = html5QrCode.getRunningTrackCapabilities();
        if (capabilities.torch) {
          torchBtn.classList.remove('hidden');
        }
      } catch (err) {
        const errorMessage = err?.message || err || "";
        if (errorMessage.includes("interrupted by a new load request") || errorMessage.includes("interrupted because the media was removed")) {
          console.warn("Camera start was interrupted (normal during rapid switching)");
          return;
        }
        
        console.warn("Camera start error with facingMode, trying fallback:", err);
        try {
          // Re-initialize to clear any stuck transition state
          if (html5QrCode) {
            try { await html5QrCode.clear(); } catch(e) {}
          }
          html5QrCode = new Html5Qrcode("reader", {
            formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE]
          });
          const cameras = await Html5Qrcode.getCameras();
          if (cameras && cameras.length > 0) {
            // Try to find a back camera in the list
            let backCamera = cameras.find(c => 
              c.label.toLowerCase().includes('back') || 
              c.label.toLowerCase().includes('rear') ||
              c.label.toLowerCase().includes('environment')
            );
            
            const cameraId = backCamera ? backCamera.id : cameras[0].id;
            
            await html5QrCode.start(
              cameraId,
              { 
                fps: 20,
                qrbox: { width: 250, height: 250 },
                experimentalFeatures: { useBarCodeDetectorIfSupported: true }
              },
              (decodedText) => {
                if (decodedText === lastResult) return;
                lastResult = decodedText;

                stopScanner().then(() => {
                  showResult(decodedText);
                });
              },
              () => {}
            );
            isScanning = true;
          } else {
            throw new Error("No cameras found.");
          }
        } catch (fallbackErr) {
          console.error("Camera fallback start error:", fallbackErr);
          alert("Could not start camera. Please ensure permissions are granted.");
          app.closeTool();
        }
      }
    });
    return transitionPromise;
  }

  function stopScanner() {
    transitionPromise = transitionPromise.then(async () => {
      const readerExists = document.getElementById('reader');
      if (html5QrCode && isScanning && readerExists) {
        try {
          await html5QrCode.stop();
        } catch (err) {
          // Ignore specific race condition errors from html5-qrcode
          const errorMessage = err?.message || err || "";
          if (
            errorMessage.includes("parameter 1 is not of type 'Node'") ||
            errorMessage.includes("removeChild") ||
            errorMessage.includes("MediaStreamTrack")
          ) {
            // Silently ignore internal cleanup errors
          } else {
            console.warn("Camera stop warning:", err);
          }
        }
        isScanning = false;
      }
      if (scannerView) scannerView.classList.add('hidden');
    });
    return transitionPromise;
  }

  function showResult(text) {
    resultView.classList.remove('hidden');
    resultText.innerText = text;

    if (text.startsWith('http://') || text.startsWith('https://')) {
      openLinkBtn.classList.remove('hidden');
      openLinkBtn.onclick = () => window.open(text, '_blank');
    } else {
      openLinkBtn.classList.add('hidden');
    }
    app.refreshIcons();
  }

  window.activeScanner = {
    stop: () => {
      stopScanner();
    }
  };

  document.getElementById('close-scanner-btn').addEventListener('click', () => {
    stopScanner();
    app.closeTool();
  });

  document.getElementById('cancel-scanning-btn').addEventListener('click', () => {
    stopScanner();
    app.closeTool();
  });

  document.getElementById('toggle-torch').addEventListener('click', async () => {
    if (isScanning && html5QrCode) {
      try {
        isTorchOn = !isTorchOn;
        await html5QrCode.applyVideoConstraints({
          advanced: [{ torch: isTorchOn }]
        });
        torchBtn.classList.toggle('bg-yellow-400', isTorchOn);
        torchBtn.classList.toggle('text-black', isTorchOn);
      } catch (err) {
        console.error("Error toggling torch:", err);
      }
    }
  });

  document.getElementById('switch-camera').addEventListener('click', () => {
    currentFacingMode = currentFacingMode === "environment" ? "user" : "environment";
    if (isScanning) {
      stopScanner().then(() => {
        startScanner();
      });
    }
  });

  document.getElementById('scan-again').addEventListener('click', () => {
    startScanner();
  });

  document.getElementById('copy-result').addEventListener('click', () => {
    navigator.clipboard.writeText(resultText.innerText);
    alert('Copied to clipboard!');
  });

  startScanner();
  app.refreshIcons();
}
