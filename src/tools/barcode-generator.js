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
      JsBarcode(svg, text, {
        format: formatSelect.value,
        lineColor: "#000",
        width: 2,
        height: 100,
        displayValue: true,
        valid: function(valid) {
          if (!valid) {
            throw new Error(`"${text}" is not valid for format ${formatSelect.value}`);
          }
        }
      });
      resultDiv.classList.remove('hidden');
      app.refreshIcons();
    } catch (err) {
      console.error(err);
      // JsBarcode throws strings or Error objects
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
