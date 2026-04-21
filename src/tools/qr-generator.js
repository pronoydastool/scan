import QRCodeStyling from 'qr-code-styling';

export function init(container, app) {
  container.innerHTML = `
    <div class="space-y-6">
      <!-- Type Selector -->
      <div class="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
        <button data-type="text" class="qr-type-btn active px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold whitespace-nowrap transition-colors">Text / URL</button>
        <button data-type="wifi" class="qr-type-btn px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-sm font-bold whitespace-nowrap transition-colors">WiFi</button>
        <button data-type="vcard" class="qr-type-btn px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-sm font-bold whitespace-nowrap transition-colors">Contact</button>
      </div>

      <!-- Dynamic Inputs -->
      <div id="input-text" class="qr-input-group space-y-2">
        <label class="text-xs font-bold text-slate-400 uppercase tracking-wider">Content</label>
        <textarea id="qr-text-val" placeholder="Enter text or URL..." class="input-field h-24 resize-none"></textarea>
      </div>

      <div id="input-wifi" class="qr-input-group space-y-3 hidden">
        <div>
          <label class="text-xs font-bold text-slate-400 uppercase tracking-wider">Network Name (SSID)</label>
          <input type="text" id="wifi-ssid" class="input-field mt-1" placeholder="WiFi Name">
        </div>
        <div>
          <label class="text-xs font-bold text-slate-400 uppercase tracking-wider">Password</label>
          <input type="text" id="wifi-pass" class="input-field mt-1" placeholder="Password">
        </div>
        <div>
          <label class="text-xs font-bold text-slate-400 uppercase tracking-wider">Encryption</label>
          <select id="wifi-type" class="input-field mt-1">
            <option value="WPA">WPA/WPA2</option>
            <option value="WEP">WEP</option>
            <option value="nopass">None</option>
          </select>
        </div>
      </div>

      <div id="input-vcard" class="qr-input-group space-y-3 hidden">
        <div>
          <label class="text-xs font-bold text-slate-400 uppercase tracking-wider">Full Name</label>
          <input type="text" id="vcard-name" class="input-field mt-1" placeholder="John Doe">
        </div>
        <div>
          <label class="text-xs font-bold text-slate-400 uppercase tracking-wider">Phone Number</label>
          <input type="tel" id="vcard-phone" class="input-field mt-1" placeholder="+1 234 567 8900">
        </div>
        <div>
          <label class="text-xs font-bold text-slate-400 uppercase tracking-wider">Email</label>
          <input type="email" id="vcard-email" class="input-field mt-1" placeholder="john@example.com">
        </div>
      </div>

      <!-- Customization -->
      <div class="bg-slate-100 dark:bg-slate-800/50 p-4 rounded-2xl space-y-4 border border-slate-200 dark:border-slate-700">
        <h3 class="text-sm font-bold flex items-center gap-2"><i data-lucide="settings" class="w-4 h-4"></i> Customization</h3>
        
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="text-xs font-bold text-slate-400 uppercase tracking-wider">QR Color</label>
            <div class="flex items-center gap-2 mt-1">
              <input type="color" id="color-dots" value="#000000" class="w-8 h-8 rounded cursor-pointer border-0 p-0 bg-transparent">
              <span class="text-xs font-mono" id="color-dots-val">#000000</span>
            </div>
          </div>
          <div>
            <label class="text-xs font-bold text-slate-400 uppercase tracking-wider">Background</label>
            <div class="flex items-center gap-2 mt-1">
              <input type="color" id="color-bg" value="#ffffff" class="w-8 h-8 rounded cursor-pointer border-0 p-0 bg-transparent">
              <span class="text-xs font-mono" id="color-bg-val">#ffffff</span>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="text-xs font-bold text-slate-400 uppercase tracking-wider">Pattern</label>
            <select id="style-dots" class="input-field mt-1 py-2 text-sm px-2">
              <option value="square">Square</option>
              <option value="dots">Dots</option>
              <option value="rounded">Rounded</option>
              <option value="classy">Classy</option>
              <option value="classy-rounded">Classy Rounded</option>
              <option value="extra-rounded">Extra Rounded</option>
            </select>
          </div>
          <div>
            <label class="text-xs font-bold text-slate-400 uppercase tracking-wider">Corners</label>
            <select id="style-corners" class="input-field mt-1 py-2 text-sm px-2">
              <option value="square">Square</option>
              <option value="dot">Dot</option>
              <option value="extra-rounded">Rounded</option>
            </select>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-3">
        <button id="gen-qr" class="btn-primary">Generate</button>
        <button id="clear-qr" class="btn-secondary">Clear</button>
      </div>

      <!-- Result -->
      <div id="qr-result" class="hidden space-y-4">
        <div class="result-container">
          <div id="qr-canvas-container" class="bg-white p-2 rounded-xl flex items-center justify-center w-full overflow-hidden"></div>
        </div>
        
        <div class="flex gap-2">
          <button id="download-qr" class="w-full btn-secondary flex items-center justify-center gap-2">
            <i data-lucide="download" class="w-4 h-4"></i> Save Image
          </button>
        </div>
      </div>
    </div>
  `;

  let currentType = 'text';
  let qrCodeInstance = null;

  // Tab switching
  document.querySelectorAll('.qr-type-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.qr-type-btn').forEach(b => {
        b.classList.remove('bg-indigo-600', 'text-white');
        b.classList.add('bg-slate-100', 'dark:bg-slate-800', 'text-slate-600', 'dark:text-slate-300');
      });
      e.target.classList.remove('bg-slate-100', 'dark:bg-slate-800', 'text-slate-600', 'dark:text-slate-300');
      e.target.classList.add('bg-indigo-600', 'text-white');

      currentType = e.target.getAttribute('data-type');
      document.querySelectorAll('.qr-input-group').forEach(el => el.classList.add('hidden'));
      document.getElementById(`input-${currentType}`).classList.remove('hidden');
    });
  });

  // Color pickers update text
  document.getElementById('color-dots').addEventListener('input', (e) => {
    document.getElementById('color-dots-val').innerText = e.target.value;
  });
  document.getElementById('color-bg').addEventListener('input', (e) => {
    document.getElementById('color-bg-val').innerText = e.target.value;
  });

  const genBtn = document.getElementById('gen-qr');
  const clearBtn = document.getElementById('clear-qr');
  const resultDiv = document.getElementById('qr-result');
  const canvasContainer = document.getElementById('qr-canvas-container');

  genBtn.addEventListener('click', () => {
    let data = '';
    
    if (currentType === 'text') {
      data = document.getElementById('qr-text-val').value.trim();
      if (!data) return alert('Please enter some text or URL');
    } else if (currentType === 'wifi') {
      const ssid = document.getElementById('wifi-ssid').value.trim();
      const pass = document.getElementById('wifi-pass').value.trim();
      const type = document.getElementById('wifi-type').value;
      if (!ssid) return alert('Please enter a WiFi Network Name');
      data = `WIFI:T:${type};S:${ssid};P:${pass};;`;
    } else if (currentType === 'vcard') {
      const name = document.getElementById('vcard-name').value.trim();
      const phone = document.getElementById('vcard-phone').value.trim();
      const email = document.getElementById('vcard-email').value.trim();
      if (!name && !phone && !email) return alert('Please enter at least one contact detail');
      data = `BEGIN:VCARD\nVERSION:3.0\nFN:${name}\nTEL:${phone}\nEMAIL:${email}\nEND:VCARD`;
    }

    try {
      canvasContainer.innerHTML = '';
      
      qrCodeInstance = new QRCodeStyling({
        width: 260,
        height: 260,
        data: data,
        margin: 5,
        dotsOptions: {
          color: document.getElementById('color-dots').value,
          type: document.getElementById('style-dots').value
        },
        backgroundOptions: {
          color: document.getElementById('color-bg').value,
        },
        cornersSquareOptions: {
          type: document.getElementById('style-corners').value
        }
      });

      qrCodeInstance.append(canvasContainer);
      resultDiv.classList.remove('hidden');
      app.refreshIcons();
    } catch (err) {
      console.error(err);
      alert('Failed to generate QR code');
    }
  });

  clearBtn.addEventListener('click', () => {
    document.getElementById('qr-text-val').value = '';
    document.getElementById('wifi-ssid').value = '';
    document.getElementById('wifi-pass').value = '';
    document.getElementById('vcard-name').value = '';
    document.getElementById('vcard-phone').value = '';
    document.getElementById('vcard-email').value = '';
    resultDiv.classList.add('hidden');
  });

  document.getElementById('download-qr').addEventListener('click', () => {
    if (qrCodeInstance) {
      qrCodeInstance.download({ name: "codetools-qr", extension: "png" });
    }
  });

  app.refreshIcons();
}
