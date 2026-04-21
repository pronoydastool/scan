export function init(container, app) {
  container.innerHTML = `
    <div class="space-y-6">
      <div class="space-y-2">
        <label class="text-xs font-bold text-slate-400 uppercase tracking-wider">Input Text</label>
        <textarea id="base64-input" placeholder="Enter text to encode or decode..." class="input-field h-32 resize-none"></textarea>
      </div>

      <div class="grid grid-cols-2 gap-3">
        <button id="encode-b64" class="btn-primary">Encode</button>
        <button id="decode-b64" class="btn-secondary">Decode</button>
      </div>

      <div id="b64-result-box" class="hidden space-y-2">
        <label class="text-xs font-bold text-slate-400 uppercase tracking-wider">Result</label>
        <div class="relative">
          <textarea id="base64-output" readonly class="input-field h-32 resize-none bg-slate-50 dark:bg-slate-900/50 font-mono text-sm"></textarea>
          <button id="copy-b64" class="absolute right-2 top-2 p-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-100 dark:border-slate-700">
            <i data-lucide="copy" class="w-4 h-4"></i>
          </button>
        </div>
      </div>
    </div>
  `;

  const input = document.getElementById('base64-input');
  const output = document.getElementById('base64-output');
  const resultBox = document.getElementById('b64-result-box');
  const copyBtn = document.getElementById('copy-b64');

  document.getElementById('encode-b64').addEventListener('click', () => {
    try {
      output.value = btoa(input.value);
      resultBox.classList.remove('hidden');
      app.refreshIcons();
    } catch (e) {
      alert('Encoding failed: ' + e.message);
    }
  });

  document.getElementById('decode-b64').addEventListener('click', () => {
    try {
      output.value = atob(input.value);
      resultBox.classList.remove('hidden');
      app.refreshIcons();
    } catch (e) {
      alert('Decoding failed: Invalid Base64 string');
    }
  });

  copyBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(output.value);
    alert('Result copied!');
  });
}
