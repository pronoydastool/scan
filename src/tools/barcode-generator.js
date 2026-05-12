import JsBarcode from 'jsbarcode';

export function init(container, app) {
  container.innerHTML = `
    <div class="space-y-6">
      <div class="space-y-2">
        <label class="text-xs font-bold text-slate-400 uppercase tracking-wider">Format</label>
        <select id="barcode-format" class="input-field">
          <option value="CODE128">CODE128 (Standard)</option>
          <option value="EAN13">EAN13 (Product)</option>
          <option value="UPC">UPC</option>
          <option value="CODE39">CODE39</option>
          <option value="ITF14">ITF14</option>
          <option value="MSI">MSI</option>
          <option value="pharmacode">Pharmacode</option>
        </select>
      </div>

      <div class="space-y-2">
        <label class="text-xs font-bold text-slate-400 uppercase tracking-wider">Content</label>
        <input type="text" id="barcode-input" placeholder="Enter value..." class="input-field">
        <p id="barcode-error" class="hidden text-xs text-red-500 mt-1"></p>
      </div>

      <div class="bg-slate-100 dark:bg-slate-800/50 p-4 rounded-2xl space-y-4 border border-slate-200 dark:border-slate-700">
        <h3 class="text-sm font-bold flex items-center gap-2"><i data-lucide="settings" class="w-4 h-4"></i> Display Options</h3>
        
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="text-xs font-bold text-slate-400 uppercase tracking-wider">Line Color</label>
            <div class="flex items-center gap-2 mt-1">
              <input type="color" id="barcode-color" value="#000000" class="w-8 h-8 rounded cursor-pointer border-0 p-0 bg-transparent">
              <span class="text-xs font-mono" id="barcode-color-val">#000000</span>
            </div>
          </div>
          <div>
            <label class="text-xs font-bold text-slate-400 uppercase tracking-wider flex justify-between items-center">
              Text
              <div class="flex items-center gap-1 normal-case text-[10px] font-normal text-slate-500">
                <input type="checkbox" id="barcode-hide-text" class="w-3 h-3 cursor-pointer">
                <label for="barcode-hide-text" class="cursor-pointer">Hide</label>
              </div>
            </label>
            <input type="text" id="barcode-custom-text" placeholder="Custom label (optional)" class="input-field mt-1">
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="text-xs font-bold text-slate-400 uppercase tracking-wider">Line Width</label>
            <input type="range" id="barcode-width" min="1" max="4" value="2" class="w-full accent-indigo-600 mt-2">
          </div>
          <div>
            <label class="text-xs font-bold text-slate-400 uppercase tracking-wider">Height</label>
            <input type="range" id="barcode-height" min="40" max="150" value="100" class="w-full accent-indigo-600 mt-2">
          </div>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-3">
        <button id="gen-barcode" class="btn-primary">Generate</button>
        <button id="clear-barcode" class="btn-secondary">Clear</button>
      </div>

      <div id="barcode-result" class="hidden space-y-4">
        <div class="result-container bg-white">
          <svg id="barcode-svg"></svg>
        </div>
        
        <div class="flex gap-2">
          <button id="download-barcode" class="w-full btn-secondary flex items-center justify-center gap-2">
            <i data-lucide="download" class="w-4 h-4"></i> Save Image
          </button>
        </div>
      </div>
    </div>
  `;

  const input = document.getElementById('barcode-input');
  const formatSelect = document.getElementById('barcode-format');
  const genBtn = document.getElementById('gen-barcode');
  const clearBtn = document.getElementById('clear-barcode');
  const resultDiv = document.getElementById('barcode-result');
  const errorMsg = document.getElementById('barcode-error');
  const svg = document.getElementById('barcode-svg');

  // Sync color text
  document.getElementById('barcode-color').addEventListener('input', (e) => {
    document.getElementById('barcode-color-val').innerText = e.target.value;
  });

  function clearError() {
    errorMsg.classList.add('hidden');
    errorMsg.innerText = '';
    input.classList.remove('border-red-500', 'focus:ring-red-500');
  }

  function showError(msg) {
    errorMsg.classList.remove('hidden');
    errorMsg.innerText = msg;
    input.classList.add('border-red-500', 'focus:ring-red-500');
    resultDiv.classList.add('hidden');
  }

  input.addEventListener('input', clearError);
  formatSelect.addEventListener('change', clearError);

  genBtn.addEventListener('click', () => {
    const text = input.value.trim();
    if (!text) {
      showError('Please enter some text');
      return;
    }

    clearError();

    try {
      const lineColor = document.getElementById('barcode-color').value;
      const width = parseInt(document.getElementById('barcode-width').value);
      const height = parseInt(document.getElementById('barcode-height').value);
      const customText = document.getElementById('barcode-custom-text').value.trim();
      const hideText = document.getElementById('barcode-hide-text').checked;

      let currentFormat = formatSelect.value;
      
      const tryGenerate = (format) => {
        let modifiedText = text;
        if (format === 'EAN13' && modifiedText.length === 13) modifiedText = modifiedText.substring(0, 12);
        else if (format === 'UPC' && modifiedText.length === 12) modifiedText = modifiedText.substring(0, 11);
        
        JsBarcode(svg, modifiedText, {
          format: format,
          lineColor: lineColor,
          width: width,
          height: height,
          displayValue: !hideText,
          text: customText || undefined,
          valid: function(valid) {
            if (!valid) {
              throw new Error(`Invalid format`);
            }
          }
        });
      };

      try {
        tryGenerate(currentFormat);
      } catch (e) {
        // Fallback to auto-detecting a working format
        const fallbacks = [];
        if (/^\d{12}$/.test(text)) fallbacks.push('UPC');
        if (/^\d{13}$/.test(text)) fallbacks.push('EAN13');
        if (/^\d+$/.test(text)) fallbacks.push('ITF14', 'MSI');
        fallbacks.push('CODE128', 'CODE39'); // Universal fallbacks
        
        let successFormat = null;
        for (const fb of fallbacks) {
          if (fb === currentFormat) continue;
          try {
            tryGenerate(fb);
            successFormat = fb;
            break;
          } catch(err2) {
            // continue trying
          }
        }
        
        if (successFormat) {
          formatSelect.value = successFormat;
          showError(`"${text}" is not valid for ${currentFormat}. Auto-switched to ${successFormat}.`);
          // clear error after 3 seconds
          setTimeout(() => clearError(), 3000);
        } else {
          throw new Error(`"${text}" is not valid for format ${currentFormat} and could not be auto-formatted.`);
        }
      }

      resultDiv.classList.remove('hidden');
      if (typeof app.addRecord === 'function') {
        app.addRecord('generate', formatSelect.value, text);
      }
      app.refreshIcons();

    } catch (err) {
      console.error(err);
      const message = typeof err === 'string' ? err : (err.message || 'Validation failed');
      showError(message);
    }
  });

  clearBtn.addEventListener('click', () => {
    input.value = '';
    clearError();
    resultDiv.classList.add('hidden');
  });

  document.getElementById('download-barcode').addEventListener('click', () => {
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const svgSize = svg.getBBox();
    canvas.width = svgSize.width + 20;
    canvas.height = svgSize.height + 20;
    const ctx = canvas.getContext("2d");
    const img = document.createElement("img");
    img.setAttribute("src", "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData))));
    
    img.onload = function() {
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 10, 10);
      const pngUrl = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.href = pngUrl;
      downloadLink.download = "barcode.png";
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    };
  });
}
