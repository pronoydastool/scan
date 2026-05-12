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

      <div id="gs1-country-container" class="hidden result-container items-start text-left mt-4" style="margin-top: 1rem;">
        <label class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Product Origin (GS1)</label>
        <div class="flex items-center gap-2 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg w-full border border-slate-100 dark:border-slate-700">
          <i data-lucide="globe" class="w-4 h-4 text-slate-500"></i>
          <span id="gs1-country-text" class="text-sm font-medium text-slate-800 dark:text-slate-200"></span>
        </div>
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
          <label class="p-2 rounded-full bg-black/40 backdrop-blur-md hover:bg-black/60 transition-colors cursor-pointer pointer-events-auto">
            <i data-lucide="image" class="w-5 h-5"></i>
            <input type="file" id="scan-file" accept="image/*" class="hidden">
          </label>
          <button id="toggle-torch" class="p-2 rounded-full bg-black/40 backdrop-blur-md hover:bg-black/60 transition-colors hidden pointer-events-auto">
            <i data-lucide="zap" class="w-5 h-5"></i>
          </button>
          <button id="switch-camera" class="p-2 rounded-full bg-black/40 backdrop-blur-md hover:bg-black/60 transition-colors pointer-events-auto">
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
          </div>
          <p class="text-white font-medium text-sm tracking-wide drop-shadow-md">Align the Barcode within the frame</p>
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
  const torchBtn = document.getElementById('toggle-torch');

  let html5QrCode;
  let isScanning = false;
  let isTorchOn = false;
  let transitionPromise = Promise.resolve();
  let currentFacingMode = "environment";
  let lastResult = null;
  let candidateResult = null;
  let consecutiveScans = 0;

  // Support ALL formats available in the library natively
  const barcodeFormats = Object.values(Html5QrcodeSupportedFormats).filter(f => typeof f === 'number');

  function startScanner() {
    transitionPromise = transitionPromise.then(async () => {
      scannerView.classList.remove('hidden');
      resultView.classList.add('hidden');
      errorView.classList.add('hidden');
      torchBtn.classList.add('hidden');
      isTorchOn = false;
      lastResult = null;
      candidateResult = null;
      consecutiveScans = 0;
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
          formatsToSupport: barcodeFormats
        });
      }

      try {
        const config = {
          fps: 15,
          disableFlip: false, // 2D codes sometimes need mirroring check
          qrbox: (viewfinderWidth, viewfinderHeight) => {
            // Versatile box for both 2D and 1D barcodes (matching visual guide)
            const width = Math.min(viewfinderWidth * 0.9, 450);
            const height = Math.min(viewfinderHeight * 0.4, 200);
            return { width, height };
          },
          experimentalFeatures: {
            useBarCodeDetectorIfSupported: true
          }
        };

        await html5QrCode.start(
          { 
            facingMode: currentFacingMode
          },
          config,
          (decodedText, decodedResult) => {
            if (decodedText === lastResult) return;
            
            if (candidateResult === decodedText) {
              consecutiveScans++;
            } else {
              candidateResult = decodedText;
              consecutiveScans = 1;
            }

            if (consecutiveScans >= 2) {
              lastResult = decodedText;
              stopScanner().then(() => {
                showResult(decodedText, decodedResult?.result?.format?.formatName || 'Barcode');
              });
            }
          },
          () => {}
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
            formatsToSupport: barcodeFormats
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
              config,
              (decodedText, decodedResult) => {
                if (decodedText === lastResult) return;
                
                if (candidateResult === decodedText) {
                  consecutiveScans++;
                } else {
                  candidateResult = decodedText;
                  consecutiveScans = 1;
                }

                if (consecutiveScans >= 2) {
                  lastResult = decodedText;
                  stopScanner().then(() => {
                    showResult(decodedText, decodedResult?.result?.format?.formatName || 'Barcode');
                  });
                }
              },
              () => {}
            );
            isScanning = true;
          } else {
            throw new Error("No cameras found.");
          }
        } catch (fallbackErr) {
          const fallbackErrorString = String(fallbackErr).toLowerCase();
          if (fallbackErrorString.includes("interrupted by a new load request") || fallbackErrorString.includes("interrupted because the media was removed")) {
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

  function getGS1Country(barcode) {
    const digits = barcode.replace(/\D/g, '');
    if (digits.length < 8) return null;
    
    let prefixStr = "";
    if (digits.length === 12) {
      prefixStr = "0" + digits.substring(0, 2);
    } else if (digits.length === 13 || digits.length === 8) {
      prefixStr = digits.substring(0, 3);
    } else {
      return null;
    }
    
    const prefix = parseInt(prefixStr, 10);
    if (isNaN(prefix)) return null;
  
    if (prefix >= 0 && prefix <= 139) return "US / Canada";
    if (prefix >= 200 && prefix <= 299) return "Restricted circulation";
    if (prefix >= 300 && prefix <= 379) return "France";
    if (prefix === 380) return "Bulgaria";
    if (prefix === 383) return "Slovenia";
    if (prefix === 385) return "Croatia";
    if (prefix === 387) return "Bosnia and Herzegovina";
    if (prefix === 389) return "Montenegro";
    if (prefix === 390) return "Kosovo";
    if (prefix >= 400 && prefix <= 440) return "Germany";
    if (prefix >= 450 && prefix <= 459) return "Japan";
    if (prefix >= 460 && prefix <= 469) return "Russia";
    if (prefix === 470) return "Kyrgyzstan";
    if (prefix === 471) return "Taiwan";
    if (prefix === 474) return "Estonia";
    if (prefix === 475) return "Latvia";
    if (prefix === 476) return "Azerbaijan";
    if (prefix === 477) return "Lithuania";
    if (prefix === 478) return "Uzbekistan";
    if (prefix === 479) return "Sri Lanka";
    if (prefix === 480) return "Philippines";
    if (prefix === 481) return "Belarus";
    if (prefix === 482) return "Ukraine";
    if (prefix === 484) return "Moldova";
    if (prefix === 485) return "Armenia";
    if (prefix === 486) return "Georgia";
    if (prefix === 487) return "Kazakhstan";
    if (prefix === 488) return "Tajikistan";
    if (prefix === 489) return "Hong Kong";
    if (prefix >= 490 && prefix <= 499) return "Japan";
    if (prefix >= 500 && prefix <= 509) return "United Kingdom";
    if (prefix >= 520 && prefix <= 521) return "Greece";
    if (prefix === 528) return "Lebanon";
    if (prefix === 529) return "Cyprus";
    if (prefix === 530) return "Albania";
    if (prefix === 531) return "North Macedonia";
    if (prefix === 535) return "Malta";
    if (prefix === 539) return "Ireland";
    if (prefix >= 540 && prefix <= 549) return "Belgium / Luxembourg";
    if (prefix === 560) return "Portugal";
    if (prefix === 569) return "Iceland";
    if (prefix >= 570 && prefix <= 579) return "Denmark / Faroe Islands / Greenland";
    if (prefix === 590) return "Poland";
    if (prefix === 594) return "Romania";
    if (prefix === 599) return "Hungary";
    if (prefix >= 600 && prefix <= 601) return "South Africa";
    if (prefix === 603) return "Ghana";
    if (prefix === 604) return "Senegal";
    if (prefix === 608) return "Bahrain";
    if (prefix === 609) return "Mauritius";
    if (prefix === 611) return "Morocco";
    if (prefix === 613) return "Algeria";
    if (prefix === 615) return "Nigeria";
    if (prefix === 616) return "Kenya";
    if (prefix === 618) return "Ivory Coast";
    if (prefix === 619) return "Tunisia";
    if (prefix === 620) return "Tanzania";
    if (prefix === 621) return "Syria";
    if (prefix === 622) return "Egypt";
    if (prefix === 624) return "Libya";
    if (prefix === 625) return "Jordan";
    if (prefix === 626) return "Iran";
    if (prefix === 627) return "Kuwait";
    if (prefix === 628) return "Saudi Arabia";
    if (prefix === 629) return "United Arab Emirates";
    if (prefix >= 640 && prefix <= 649) return "Finland";
    if (prefix >= 690 && prefix <= 699) return "China";
    if (prefix >= 700 && prefix <= 709) return "Norway";
    if (prefix === 729) return "Israel";
    if (prefix >= 730 && prefix <= 739) return "Sweden";
    if (prefix === 740) return "Guatemala";
    if (prefix === 741) return "El Salvador";
    if (prefix === 742) return "Honduras";
    if (prefix === 743) return "Nicaragua";
    if (prefix === 744) return "Costa Rica";
    if (prefix === 745) return "Panama";
    if (prefix === 746) return "Dominican Republic";
    if (prefix === 750) return "Mexico";
    if (prefix >= 754 && prefix <= 755) return "Canada";
    if (prefix === 759) return "Venezuela";
    if (prefix >= 760 && prefix <= 769) return "Switzerland / Liechtenstein";
    if (prefix >= 770 && prefix <= 771) return "Colombia";
    if (prefix === 773) return "Uruguay";
    if (prefix === 775) return "Peru";
    if (prefix === 777) return "Bolivia";
    if (prefix >= 778 && prefix <= 779) return "Argentina";
    if (prefix === 780) return "Chile";
    if (prefix === 784) return "Paraguay";
    if (prefix === 786) return "Ecuador";
    if (prefix >= 789 && prefix <= 790) return "Brazil";
    if (prefix >= 800 && prefix <= 839) return "Italy / San Marino / Vatican City";
    if (prefix >= 840 && prefix <= 849) return "Spain / Andorra";
    if (prefix === 850) return "Cuba";
    if (prefix === 858) return "Slovakia";
    if (prefix === 859) return "Czech Republic";
    if (prefix === 860) return "Serbia";
    if (prefix === 865) return "Mongolia";
    if (prefix === 867) return "North Korea";
    if (prefix >= 868 && prefix <= 869) return "Turkey";
    if (prefix >= 870 && prefix <= 879) return "Netherlands";
    if (prefix === 880) return "South Korea";
    if (prefix === 884) return "Cambodia";
    if (prefix === 885) return "Thailand";
    if (prefix === 888) return "Singapore";
    if (prefix === 890) return "India";
    if (prefix === 893) return "Vietnam";
    if (prefix === 896) return "Pakistan";
    if (prefix === 899) return "Indonesia";
    if (prefix >= 900 && prefix <= 919) return "Austria";
    if (prefix >= 930 && prefix <= 939) return "Australia";
    if (prefix >= 940 && prefix <= 949) return "New Zealand";
    if (prefix === 955) return "Malaysia";
    if (prefix === 958) return "Macau";
    
    return null;
  }

  function showResult(text, formatName) {
    if (typeof app.addRecord === 'function') {
      app.addRecord('scan', formatName || 'Barcode', text);
    }
    
    resultView.classList.remove('hidden');
    resultText.innerText = text;

    const gs1CountryContainer = document.getElementById('gs1-country-container');
    const gs1CountryText = document.getElementById('gs1-country-text');
    
    // Process GS1 Country
    const formatNameUpper = (formatName || '').toUpperCase();
    const isEAN_UPC = formatNameUpper.includes('EAN') || formatNameUpper.includes('UPC') || formatNameUpper.includes('CODE');
    
    let countryOrigin = null;
    
    // We try to extract country if format makes sense
    if (isEAN_UPC || text.replace(/\D/g, '').length >= 8) {
       countryOrigin = getGS1Country(text);
    }

    if (countryOrigin) {
       gs1CountryText.innerText = countryOrigin;
       gs1CountryContainer.classList.remove('hidden');
    } else {
       gs1CountryContainer.classList.add('hidden');
    }

    // Reset button
    openLinkBtn.className = 'flex-1 btn-primary flex items-center justify-center gap-2 hidden';
    openLinkBtn.onclick = null;

    let actionLabel = '';
    let actionIcon = '';
    let actionUrl = '';

    const textUpper = text.toUpperCase();

    // Check for standard URL/Actions
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
      const coords = text.substring(4).split('?')[0]; 
      actionUrl = `https://www.google.com/maps/search/?api=1&query=${coords}`;
    } else if (textUpper.startsWith('WIFI:')) {
       actionLabel = 'WiFi Network';
       actionIcon = 'wifi';
       actionUrl = null;
       openLinkBtn.onclick = () => {
         alert('Browsers do not support automatic WiFi connection. Please copy the password from the text above and connect via your device settings.');
       };
    } else if (textUpper.startsWith('BEGIN:VCARD')) {
       actionLabel = 'Save Contact';
       actionIcon = 'user';
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
    } else if (/^\d+$/.test(text) && text.length >= 8 && text.length <= 14) {
       // Heuristic for Product Barcodes (UPC/EAN)
       actionLabel = 'Search Product';
       actionIcon = 'shopping-bag';
       actionUrl = `https://www.google.com/search?q=${encodeURIComponent(text)}+product`;
    }

    if (actionLabel) {
      openLinkBtn.innerHTML = `<i data-lucide="${actionIcon}" class="w-4 h-4"></i> ${actionLabel}`;
      openLinkBtn.classList.remove('hidden');
      if (actionUrl) {
         openLinkBtn.onclick = () => window.open(actionUrl, '_blank');
      }
    } else {
      // General Web Search fallback
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
        formatsToSupport: barcodeFormats
      });
    }

    try {
      if (isScanning) await stopScanner();
      const decodedText = await html5QrCode.scanFileV2(file);
      showResult(decodedText.decodedText, decodedText?.result?.format?.formatName || 'Barcode');
    } catch (err) {
      console.error(err);
      alert('Could not detect a barcode in the selected image.');
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
