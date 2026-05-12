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

    <!-- Error View -->
    <div id="error-view" class="hidden space-y-6 mt-4">
      <div class="bg-red-50 dark:bg-red-900/20 p-4 rounded-2xl flex items-start gap-3 border border-red-100 dark:border-red-900/30">
        <i data-lucide="camera-off" class="w-5 h-5 text-red-500 mt-0.5"></i>
        <div>
          <h3 class="text-sm font-bold text-red-800 dark:text-red-200">Camera Access Denied</h3>
          <p id="error-text" class="text-xs text-red-600 dark:text-red-300 mt-1">Please ensure camera permissions are granted in your browser settings to use the scanner.</p>
        </div>
      </div>
      
      <button id="retry-camera" class="w-full btn-primary flex items-center justify-center gap-2 mt-8">
        <i data-lucide="camera" class="w-4 h-4"></i> Try Again
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
          <label class="p-2 rounded-full bg-black/40 backdrop-blur-md hover:bg-black/60 transition-colors cursor-pointer">
            <i data-lucide="image" class="w-5 h-5"></i>
            <input type="file" id="scan-file" accept="image/*" class="hidden">
          </label>
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
  const errorView = document.getElementById('error-view');
  const errorText = document.getElementById('error-text');
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
      errorView.classList.add('hidden');
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

      const getBestCamera = async () => {
        try {
          const cameras = await Html5Qrcode.getCameras();
          if (!cameras || cameras.length === 0) return { facingMode: currentFacingMode };

          // If we are looking for front camera, just use facingMode
          if (currentFacingMode === "user") return { facingMode: "user" };

          // Filter for back cameras
          const backCameras = cameras.filter(c => 
            c.label.toLowerCase().includes('back') || 
            c.label.toLowerCase().includes('rear') ||
            c.label.toLowerCase().includes('environment') ||
            c.label.toLowerCase().includes('wide') ||
            c.label.toLowerCase().includes('ultra')
          );

          if (backCameras.length === 0) return { facingMode: "environment" };

          // Look for wide-angle specifically as requested
          const wideCamera = backCameras.find(c => 
            c.label.toLowerCase().includes('wide') || 
            c.label.toLowerCase().includes('ultra')
          );

          return wideCamera ? wideCamera.id : backCameras[0].id;
        } catch (e) {
          return { facingMode: currentFacingMode };
        }
      };

      try {
        const cameraSelector = await getBestCamera();
        
        await html5QrCode.start(
          cameraSelector,
          {
            fps: 25,
            qrbox: (viewfinderWidth, viewfinderHeight) => {
              const size = Math.min(viewfinderWidth, viewfinderHeight) * 0.7;
              return { width: size, height: size };
            },
            experimentalFeatures: {
              useBarCodeDetectorIfSupported: true
            }
          },
          (decodedText) => {
            if (decodedText === lastResult) return;
            lastResult = decodedText;

            stopScanner().then(() => {
              showResult(decodedText, 'QR Code');
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
        if (
          errorMessage.includes("interrupted by a new load request") || 
          errorMessage.includes("interrupted because the media was removed") ||
          errorMessage.includes("play() request was interrupted")
        ) {
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
                fps: 25,
                qrbox: (viewfinderWidth, viewfinderHeight) => {
                  const size = Math.min(viewfinderWidth, viewfinderHeight) * 0.7;
                  return { width: size, height: size };
                },
                experimentalFeatures: {
                  useBarCodeDetectorIfSupported: true
                }
              },
              (decodedText) => {
                if (decodedText === lastResult) return;
                lastResult = decodedText;

                stopScanner().then(() => {
                  showResult(decodedText, 'QR Code');
                });
              },
              () => {}
            );
            isScanning = true;
          } else {
            throw new Error("No cameras found.");
          }
        } catch (fallbackErr) {
          const fallbackErrorString = String(fallbackErr).toLowerCase();
          if (
            fallbackErrorString.includes("interrupted by a new load request") || 
            fallbackErrorString.includes("interrupted because the media was removed") ||
            fallbackErrorString.includes("play() request was interrupted")
          ) {
            console.warn("Camera fallback start was interrupted (normal during rapid switching)");
            return;
          }

          console.error("Camera fallback start error:", fallbackErr);
          let errMsg = "Could not start camera. Please ensure permissions are granted.";
          
          if (fallbackErrorString.includes("not allowed") || fallbackErrorString.includes("permission denied")) {
            errMsg = "Camera access was denied. Please allow camera permissions, or try opening the app in a New Tab if you are in a preview.";
          } else if (fallbackErrorString.includes("not found") || fallbackErrorString.includes("no camera")) {
            errMsg = "No camera found on your device.";
          }
          
          scannerView.classList.add('hidden');
          errorView.classList.remove('hidden');
          errorText.innerText = errMsg;
          app.refreshIcons();
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
            errorMessage.includes("MediaStreamTrack") ||
            errorMessage.includes("interrupted because the media was removed") ||
            errorMessage.includes("play() request was interrupted")
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

  function showResult(text, formatName) {
    if (typeof app.addRecord === 'function') {
      app.addRecord('scan', formatName || 'QR Code', text);
    }

    resultView.classList.remove('hidden');
    resultText.innerText = text;

    // Reset button
    openLinkBtn.className = 'flex-1 btn-primary flex items-center justify-center gap-2 hidden';
    openLinkBtn.onclick = null;

    let actionLabel = '';
    let actionIcon = '';
    let actionUrl = '';

    const textUpper = text.toUpperCase();

    if (textUpper.startsWith('HTTP://') || textUpper.startsWith('HTTPS://')) {
      actionLabel = 'Open Link';
      actionIcon = 'external-link';
      actionUrl = text;
    } else if (textUpper.startsWith('TEL:')) {
      actionLabel = 'Call Number';
      actionIcon = 'phone';
      actionUrl = text;
    } else if (textUpper.startsWith('MAILTO:')) {
      actionLabel = 'Send Email';
      actionIcon = 'mail';
      actionUrl = text;
    } else if (textUpper.startsWith('SMSTO:')) {
      actionLabel = 'Send SMS';
      actionIcon = 'message-square';
      actionUrl = text;
    } else if (textUpper.startsWith('GEO:')) {
      actionLabel = 'Open Maps';
      actionIcon = 'map-pin';
      // Convert geo:lat,lng to a google maps link for better web support
      const coords = text.substring(4).split('?')[0]; // simple parsing
      actionUrl = `https://www.google.com/maps/search/?api=1&query=${coords}`;
    } else if (textUpper.startsWith('WIFI:')) {
      // Browsers can't easily auto-connect to wifi, but we can offer to copy password or alert
      actionLabel = 'WiFi Network';
      actionIcon = 'wifi';
      actionUrl = null;
      openLinkBtn.onclick = () => {
        alert('Browsers do not support automatic WiFi connection. Please copy the password from the text above and connect via your device settings.');
      };
    } else if (textUpper.startsWith('BEGIN:VCARD')) {
      actionLabel = 'Save Contact';
      actionIcon = 'user';
      // To "save" a vcard on web, we download it as a .vcf file
      actionUrl = null;
      openLinkBtn.onclick = () => {
        const blob = new Blob([text], { type: 'text/vcard' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'contact.vcf';
        a.click();
        URL.revokeObjectURL(url);
      };
    }

    if (actionLabel) {
      openLinkBtn.innerHTML = `<i data-lucide="${actionIcon}" class="w-4 h-4"></i> ${actionLabel}`;
      openLinkBtn.classList.remove('hidden');
      if (actionUrl) {
         openLinkBtn.onclick = () => window.open(actionUrl, '_blank');
      }
    } else {
      // Just a text search fallback
      openLinkBtn.innerHTML = `<i data-lucide="search" class="w-4 h-4"></i> Search`;
      openLinkBtn.classList.remove('hidden');
      openLinkBtn.onclick = () => window.open(`https://www.google.com/search?q=${encodeURIComponent(text)}`, '_blank');
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

  const fileInput = document.getElementById('scan-file');
  fileInput.addEventListener('change', async (e) => {
    if (e.target.files.length == 0) return;
    const file = e.target.files[0];
    
    if (!html5QrCode) {
      html5QrCode = new Html5Qrcode("reader", {
        formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE]
      });
    }

    try {
      if (isScanning) await stopScanner();
      const decodedText = await html5QrCode.scanFileV2(file);
      showResult(decodedText.decodedText, decodedText?.result?.format?.formatName || 'QR Code');
    } catch (err) {
      console.error(err);
      alert('Could not detect a QR code in the selected image.');
    } finally {
      fileInput.value = ''; // Reset
    }
  });

  document.getElementById('scan-again').addEventListener('click', () => {
    startScanner();
  });

  document.getElementById('retry-camera').addEventListener('click', () => {
    startScanner();
  });

  document.getElementById('copy-result').addEventListener('click', () => {
    navigator.clipboard.writeText(resultText.innerText);
    alert('Copied to clipboard!');
  });

  startScanner();
  app.refreshIcons();
}
