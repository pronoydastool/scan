import QRCodeStyling from 'qr-code-styling';

export function init(container, app) {
  container.innerHTML = `
    <div class="space-y-6">
      <!-- Type Selector -->
      <div class="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
        <button data-type="text" class="qr-type-btn active px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold whitespace-nowrap transition-colors">Text / URL</button>
        <button data-type="wifi" class="qr-type-btn px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-bold whitespace-nowrap transition-colors">WiFi</button>
        <button data-type="vcard" class="qr-type-btn px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-bold whitespace-nowrap transition-colors">Contact</button>
        <button data-type="phone" class="qr-type-btn px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-bold whitespace-nowrap transition-colors">Phone</button>
        <button data-type="email" class="qr-type-btn px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-bold whitespace-nowrap transition-colors">Email</button>
        <button data-type="sms" class="qr-type-btn px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-bold whitespace-nowrap transition-colors">SMS</button>
        <button data-type="location" class="qr-type-btn px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-bold whitespace-nowrap transition-colors">Location</button>
      </div>

      <!-- Dynamic Inputs -->
      <div id="input-text" class="qr-input-group space-y-2">
        <label class="text-xs font-bold text-slate-400 uppercase tracking-wider">Content / Note / Link</label>
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

      <div id="input-phone" class="qr-input-group space-y-3 hidden">
        <label class="text-xs font-bold text-slate-400 uppercase tracking-wider">Phone Number</label>
        <input type="tel" id="phone-val" class="input-field" placeholder="+1 234 567 8900">
      </div>

      <div id="input-email" class="qr-input-group space-y-3 hidden">
        <div>
          <label class="text-xs font-bold text-slate-400 uppercase tracking-wider">Email Address</label>
          <input type="email" id="email-val" class="input-field mt-1" placeholder="recipient@example.com">
        </div>
        <div>
          <label class="text-xs font-bold text-slate-400 uppercase tracking-wider">Subject</label>
          <input type="text" id="email-subject" class="input-field mt-1" placeholder="Optional Subject">
        </div>
      </div>

      <div id="input-sms" class="qr-input-group space-y-3 hidden">
        <div>
          <label class="text-xs font-bold text-slate-400 uppercase tracking-wider">Phone Number</label>
          <input type="tel" id="sms-phone" class="input-field mt-1" placeholder="+1 234 567 8900">
        </div>
        <div>
          <label class="text-xs font-bold text-slate-400 uppercase tracking-wider">Message</label>
          <textarea id="sms-msg" class="input-field mt-1 h-20 resize-none" placeholder="Hello..."></textarea>
        </div>
      </div>

      <div id="input-location" class="qr-input-group space-y-3 hidden">
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="text-xs font-bold text-slate-400 uppercase tracking-wider">Latitude</label>
            <input type="number" id="loc-lat" class="input-field mt-1" placeholder="37.7749">
          </div>
          <div>
            <label class="text-xs font-bold text-slate-400 uppercase tracking-wider">Longitude</label>
            <input type="number" id="loc-lng" class="input-field mt-1" placeholder="-122.4194">
          </div>
        </div>
      </div>

      <!-- Customization -->
      <div class="bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <!-- Tabs -->
        <div class="flex gap-2 overflow-x-auto p-4 border-b border-slate-200 dark:border-slate-700 hide-scrollbar bg-slate-100/50 dark:bg-slate-800/50">
          <button class="custom-tab-btn active px-3 py-1.5 bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300 rounded-lg text-xs font-bold whitespace-nowrap transition-colors" data-target="panel-body">Body Shape</button>
          <button class="custom-tab-btn px-3 py-1.5 bg-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 rounded-lg text-xs font-bold whitespace-nowrap transition-colors" data-target="panel-eye-ext">Eye Frame</button>
          <button class="custom-tab-btn px-3 py-1.5 bg-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 rounded-lg text-xs font-bold whitespace-nowrap transition-colors" data-target="panel-eye-int">Eye Center</button>
          <button class="custom-tab-btn px-3 py-1.5 bg-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 rounded-lg text-xs font-bold whitespace-nowrap transition-colors" data-target="panel-colors">Colors & Logo</button>
        </div>

        <div class="p-4">
          <!-- Body Panel -->
          <div id="panel-body" class="custom-panel grid grid-cols-4 sm:grid-cols-6 gap-2">
            <button data-val="square" class="shape-btn shape-body active border border-indigo-500 ring-2 ring-indigo-200 dark:ring-indigo-900 bg-white dark:bg-slate-800 rounded-xl aspect-square flex items-center justify-center text-slate-800 dark:text-slate-200">
               <svg viewBox="0 0 24 24" class="w-8 h-8 fill-current"><path d="M2 2h9v9H2zM13 2h9v9h-9zM2 13h9v9H2zM13 13h9v9h-9z"/></svg>
            </button>
            <button data-val="dots" class="shape-btn shape-body border border-slate-200 dark:border-slate-700 hover:border-indigo-300 bg-white dark:bg-slate-800 rounded-xl aspect-square flex items-center justify-center text-slate-800 dark:text-slate-200">
               <svg viewBox="0 0 24 24" class="w-8 h-8 fill-current"><circle cx="6.5" cy="6.5" r="4.5"/><circle cx="17.5" cy="6.5" r="4.5"/><circle cx="6.5" cy="17.5" r="4.5"/><circle cx="17.5" cy="17.5" r="4.5"/></svg>
            </button>
            <button data-val="rounded" class="shape-btn shape-body border border-slate-200 dark:border-slate-700 hover:border-indigo-300 bg-white dark:bg-slate-800 rounded-xl aspect-square flex items-center justify-center text-slate-800 dark:text-slate-200">
               <svg viewBox="0 0 24 24" class="w-8 h-8 fill-current"><rect x="2" y="2" width="9" height="9" rx="2"/><rect x="13" y="2" width="9" height="9" rx="2"/><rect x="2" y="13" width="9" height="9" rx="2"/><rect x="13" y="13" width="9" height="9" rx="2"/></svg>
            </button>
            <button data-val="extra-rounded" class="shape-btn shape-body border border-slate-200 dark:border-slate-700 hover:border-indigo-300 bg-white dark:bg-slate-800 rounded-xl aspect-square flex items-center justify-center text-slate-800 dark:text-slate-200">
               <svg viewBox="0 0 24 24" class="w-8 h-8 fill-current"><rect x="2" y="2" width="9" height="9" rx="4.5"/><rect x="13" y="2" width="9" height="9" rx="4.5"/><rect x="2" y="13" width="9" height="9" rx="4.5"/><rect x="13" y="13" width="9" height="9" rx="4.5"/></svg>
            </button>
            <button data-val="classy" class="shape-btn shape-body border border-slate-200 dark:border-slate-700 hover:border-indigo-300 bg-white dark:bg-slate-800 rounded-xl aspect-square flex items-center justify-center text-slate-800 dark:text-slate-200">
               <svg viewBox="0 0 24 24" class="w-8 h-8 fill-current"><path d="M2.5 2.5h8v8h-8zM13.5 2.5h8v8h-8zM2.5 13.5h8v8h-8zM13.5 13.5h8v8h-8z"/><path d="M6 10h12v4H6z"/><path d="M10 6h4v12h-4z"/></svg>
            </button>
            <button data-val="classy-rounded" class="shape-btn shape-body border border-slate-200 dark:border-slate-700 hover:border-indigo-300 bg-white dark:bg-slate-800 rounded-xl aspect-square flex items-center justify-center text-slate-800 dark:text-slate-200">
               <svg viewBox="0 0 24 24" class="w-8 h-8 fill-current"><rect x="2.5" y="2.5" width="8" height="8" rx="2"/><rect x="13.5" y="2.5" width="8" height="8" rx="2"/><rect x="2.5" y="13.5" width="8" height="8" rx="2"/><rect x="13.5" y="13.5" width="8" height="8" rx="2"/><path d="M6 10h12v4H6z"/><path d="M10 6h4v12h-4z"/></svg>
            </button>
          </div>

          <!-- Eye Frame Panel -->
          <div id="panel-eye-ext" class="custom-panel grid grid-cols-4 sm:grid-cols-6 gap-2 hidden">
             <button data-val="square" class="shape-btn shape-eye-ext active border border-indigo-500 ring-2 ring-indigo-200 dark:ring-indigo-900 bg-white dark:bg-slate-800 rounded-xl aspect-square flex items-center justify-center text-slate-800 dark:text-slate-200">
               <svg viewBox="0 0 24 24" class="w-10 h-10 fill-current"><path fill-rule="evenodd" clip-rule="evenodd" d="M3 3h18v18H3V3zm4 4v10h10V7H7z"/></svg>
             </button>
             <button data-val="dot" class="shape-btn shape-eye-ext border border-slate-200 dark:border-slate-700 hover:border-indigo-300 bg-white dark:bg-slate-800 rounded-xl aspect-square flex items-center justify-center text-slate-800 dark:text-slate-200">
               <svg viewBox="0 0 24 24" class="w-10 h-10 fill-current"><path fill-rule="evenodd" clip-rule="evenodd" d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 4c-3.314 0-6 2.686-6 6s2.686 6 6 6 6-2.686 6-6-2.686-6-6-6z"/></svg>
             </button>
             <button data-val="extra-rounded" class="shape-btn shape-eye-ext border border-slate-200 dark:border-slate-700 hover:border-indigo-300 bg-white dark:bg-slate-800 rounded-xl aspect-square flex items-center justify-center text-slate-800 dark:text-slate-200">
               <svg viewBox="0 0 24 24" class="w-10 h-10 fill-current"><path fill-rule="evenodd" clip-rule="evenodd" d="M7 3C4.79 3 3 4.79 3 7v10c0 2.21 1.79 4 4 4h10c2.21 0 4-1.79 4-4V7c0-2.21-1.79-4-4-4H7zm0 4c-1.105 0-2 .895-2 2v6c0 1.105.895 2 2 2h10c1.105 0 2-.895 2-2V9c0-1.105-.895-2-2-2H7z"/></svg>
             </button>
          </div>

          <!-- Eye Center Panel -->
          <div id="panel-eye-int" class="custom-panel grid grid-cols-4 sm:grid-cols-6 gap-2 hidden">
             <button data-val="square" class="shape-btn shape-eye-int active border border-indigo-500 ring-2 ring-indigo-200 dark:ring-indigo-900 bg-white dark:bg-slate-800 rounded-xl aspect-square flex items-center justify-center text-slate-800 dark:text-slate-200">
               <svg viewBox="0 0 24 24" class="w-10 h-10 fill-current"><path d="M6 6h12v12H6z"/></svg>
             </button>
             <button data-val="dot" class="shape-btn shape-eye-int border border-slate-200 dark:border-slate-700 hover:border-indigo-300 bg-white dark:bg-slate-800 rounded-xl aspect-square flex items-center justify-center text-slate-800 dark:text-slate-200">
               <svg viewBox="0 0 24 24" class="w-10 h-10 fill-current"><circle cx="12" cy="12" r="6"/></svg>
             </button>
          </div>

          <!-- Colors & Logo Panel -->
          <div id="panel-colors" class="custom-panel space-y-4 hidden">
             <div class="grid grid-cols-2 gap-4">
               <div>
                 <label class="text-xs font-bold text-slate-400 uppercase tracking-wider">QR Color 1</label>
                 <div class="flex items-center gap-2 mt-1">
                   <input type="color" id="color-dots" value="#000000" class="w-8 h-8 rounded cursor-pointer border-0 p-0 bg-transparent">
                   <span class="text-xs font-mono" id="color-dots-val">#000000</span>
                 </div>
               </div>
               <div>
                 <label class="text-xs font-bold text-slate-400 uppercase tracking-wider">QR Color 2 (Gradient)</label>
                 <div class="flex items-center gap-2 mt-1">
                   <input type="color" id="color-dots2" value="#000000" class="w-8 h-8 rounded cursor-pointer border-0 p-0 bg-transparent">
                   <span class="text-xs font-mono" id="color-dots2-val">#000000</span>
                 </div>
               </div>
             </div>

             <div class="grid grid-cols-2 gap-4">
               <div>
                 <label class="text-xs font-bold text-slate-400 uppercase tracking-wider flex justify-between items-center">
                   Background
                   <div class="flex items-center gap-1 normal-case text-[10px] font-normal text-slate-500">
                     <input type="checkbox" id="bg-transparent" class="w-3 h-3 cursor-pointer">
                     <label for="bg-transparent" class="cursor-pointer">Transparent</label>
                   </div>
                 </label>
                 <div class="flex items-center gap-2 mt-1">
                   <input type="color" id="color-bg" value="#ffffff" class="w-8 h-8 rounded cursor-pointer border-0 p-0 bg-transparent">
                   <span class="text-xs font-mono" id="color-bg-val">#ffffff</span>
                 </div>
               </div>
               <div>
                 <label class="text-xs font-bold text-slate-400 uppercase tracking-wider flex justify-between items-center">
                   Logo
                   <button id="clear-logo" class="hidden text-red-500 text-[10px] normal-case bg-transparent border-0 p-0 hover:underline">Clear</button>
                 </label>
                 <div class="mt-1">
                   <input type="file" id="logo-upload" accept="image/*" class="text-xs text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer w-full">
                 </div>
               </div>
             </div>
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
        
        <div class="flex items-center gap-2">
          <select id="export-format" class="input-field flex-1 text-sm py-2">
            <option value="png">PNG</option>
            <option value="jpeg">JPG</option>
            <option value="svg">SVG</option>
            <option value="webp">WEBP</option>
          </select>
          <button id="download-qr" class="flex-[2] btn-secondary flex items-center justify-center gap-2">
            <i data-lucide="download" class="w-4 h-4"></i> Save
          </button>
        </div>
      </div>
    </div>
  `;

  let currentType = 'text';
  let qrCodeInstance = null;
  let logoDataUrl = null;

  let shapeBody = 'square';
  let shapeEyeExt = 'square';
  let shapeEyeInt = 'square';

  // Customization Tabs
  document.querySelectorAll('.custom-tab-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.custom-tab-btn').forEach(b => {
        b.classList.remove('active', 'bg-indigo-100', 'text-indigo-700', 'dark:bg-indigo-900/50', 'dark:text-indigo-300');
        b.classList.add('bg-transparent', 'text-slate-500', 'dark:text-slate-400');
      });
      const targetBtn = e.currentTarget;
      targetBtn.classList.remove('bg-transparent', 'text-slate-500', 'dark:text-slate-400');
      targetBtn.classList.add('active', 'bg-indigo-100', 'text-indigo-700', 'dark:bg-indigo-900/50', 'dark:text-indigo-300');

      document.querySelectorAll('.custom-panel').forEach(el => el.classList.add('hidden'));
      document.getElementById(targetBtn.getAttribute('data-target')).classList.remove('hidden');
    });
  });

  // Shape selection
  document.querySelectorAll('.shape-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const targetBtn = e.currentTarget;
      const type = targetBtn.classList.contains('shape-body') ? 'body' :
                   targetBtn.classList.contains('shape-eye-ext') ? 'eye-ext' : 'eye-int';
      
      document.querySelectorAll(`.shape-${type}`).forEach(b => {
        b.classList.remove('active', 'border-indigo-500', 'ring-2', 'ring-indigo-200', 'dark:ring-indigo-900');
        b.classList.add('border-slate-200', 'dark:border-slate-700');
      });

      targetBtn.classList.remove('border-slate-200', 'dark:border-slate-700');
      targetBtn.classList.add('active', 'border-indigo-500', 'ring-2', 'ring-indigo-200', 'dark:ring-indigo-900');

      const val = targetBtn.getAttribute('data-val');
      if (type === 'body') shapeBody = val;
      if (type === 'eye-ext') shapeEyeExt = val;
      if (type === 'eye-int') shapeEyeInt = val;
    });
  });

  // File upload for Logo
  document.getElementById('logo-upload').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        logoDataUrl = event.target.result;
        document.getElementById('clear-logo').classList.remove('hidden');
      };
      reader.readAsDataURL(file);
    }
  });

  document.getElementById('clear-logo').addEventListener('click', () => {
    logoDataUrl = null;
    document.getElementById('logo-upload').value = '';
    document.getElementById('clear-logo').classList.add('hidden');
  });

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
  document.getElementById('color-dots2').addEventListener('input', (e) => {
    document.getElementById('color-dots2-val').innerText = e.target.value;
  });
  document.getElementById('color-bg').addEventListener('input', (e) => {
    document.getElementById('color-bg-val').innerText = e.target.value;
  });
  document.getElementById('bg-transparent').addEventListener('change', (e) => {
    const colorBgContainer = document.getElementById('color-bg').parentElement;
    if (e.target.checked) {
      colorBgContainer.classList.add('opacity-50', 'pointer-events-none');
    } else {
      colorBgContainer.classList.remove('opacity-50', 'pointer-events-none');
    }
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
    } else if (currentType === 'phone') {
      const phone = document.getElementById('phone-val').value.trim();
      if (!phone) return alert('Please enter a phone number');
      data = `tel:${phone}`;
    } else if (currentType === 'email') {
      const email = document.getElementById('email-val').value.trim();
      const subject = document.getElementById('email-subject').value.trim();
      if (!email) return alert('Please enter an email address');
      data = `mailto:${email}${subject ? `?subject=${encodeURIComponent(subject)}` : ''}`;
    } else if (currentType === 'sms') {
      const phone = document.getElementById('sms-phone').value.trim();
      const msg = document.getElementById('sms-msg').value.trim();
      if (!phone) return alert('Please enter a phone number');
      data = `smsto:${phone}:${msg}`;
    } else if (currentType === 'location') {
      const lat = document.getElementById('loc-lat').value.trim();
      const lng = document.getElementById('loc-lng').value.trim();
      if (!lat || !lng) return alert('Please enter latitude and longitude');
      data = `geo:${lat},${lng}`;
    }

    try {
      canvasContainer.innerHTML = '';
      
      const dotsColor1 = document.getElementById('color-dots').value;
      const dotsColor2 = document.getElementById('color-dots2').value;
      const isGradient = dotsColor1 !== dotsColor2;
      
      const isTransparent = document.getElementById('bg-transparent').checked;
      const bgColor = document.getElementById('color-bg').value;

      let dotsOptions = {
        type: shapeBody
      };

      if (isGradient) {
        dotsOptions.gradient = {
          type: "linear",
          rotation: Math.PI / 4,
          colorStops: [{ offset: 0, color: dotsColor1 }, { offset: 1, color: dotsColor2 }]
        };
      } else {
        dotsOptions.color = dotsColor1;
      }
      
      // Configure Logo Options if present
      let imageOptions = {};
      let image = undefined;
      if (logoDataUrl) {
         image = logoDataUrl;
         imageOptions = {
           crossOrigin: "anonymous",
           margin: 10,
           imageSize: 0.4,
           hideBackgroundDots: true
         };
      }

      qrCodeInstance = new QRCodeStyling({
        width: 300,
        height: 300,
        data: data,
        margin: 10,
        image: image,
        imageOptions: imageOptions,
        dotsOptions: dotsOptions,
        backgroundOptions: {
          color: isTransparent ? "transparent" : bgColor,
        },
        cornersSquareOptions: {
          type: shapeEyeExt,
          color: dotsColor1
        },
        cornersDotOptions: {
          type: shapeEyeInt,
          color: dotsColor1
        }
      });

      qrCodeInstance.append(canvasContainer);
      resultDiv.classList.remove('hidden');
      if (typeof app.addRecord === 'function') {
        app.addRecord('generate', 'QR', data);
      }
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
      const format = document.getElementById('export-format').value;
      // Convert to jpg via qr-code-styling internal mapping if needed
      qrCodeInstance.download({ name: `code-tools-qr`, extension: format });
    }
  });

  app.refreshIcons();
}
