export function init(container, app) {
  container.innerHTML = `
    <div class="space-y-6">
      <div class="space-y-2">
        <label class="text-xs font-bold text-slate-400 uppercase tracking-wider">Input</label>
        <textarea id="text-input" placeholder="Enter text or binary..." class="input-field h-32 resize-none"></textarea>
      </div>

      <div class="grid grid-cols-2 gap-3">
        <button id="to-binary" class="btn-secondary text-xs">Text to Binary</button>
        <button id="from-binary" class="btn-secondary text-xs">Binary to Text</button>
        <button id="to-ascii" class="btn-secondary text-xs">Text to ASCII</button>
        <button id="from-ascii" class="btn-secondary text-xs">ASCII to Text</button>
      </div>

      <div id="text-result-box" class="hidden space-y-2">
        <label class="text-xs font-bold text-slate-400 uppercase tracking-wider">Result</label>
        <div class="relative">
          <textarea id="text-output" readonly class="input-field h-32 resize-none bg-slate-50 dark:bg-slate-900/50 font-mono text-sm"></textarea>
          <button id="copy-text" class="absolute right-2 top-2 p-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-100 dark:border-slate-700">
            <i data-lucide="copy" class="w-4 h-4"></i>
          </button>
        </div>
      </div>
    </div>
  `;

  const input = document.getElementById('text-input');
  const output = document.getElementById('text-output');
  const resultBox = document.getElementById('text-result-box');

  function showResult(val) {
    output.value = val;
    resultBox.classList.remove('hidden');
    app.refreshIcons();
  }

  document.getElementById('to-binary').addEventListener('click', () => {
    const res = input.value.split('').map(char => char.charCodeAt(0).toString(2).padStart(8, '0')).join(' ');
    showResult(res);
  });

  document.getElementById('from-binary').addEventListener('click', () => {
    try {
      const res = input.value.split(' ').map(bin => String.fromCharCode(parseInt(bin, 2))).join('');
      showResult(res);
    } catch (e) { alert('Invalid binary input'); }
  });

  document.getElementById('to-ascii').addEventListener('click', () => {
    const res = input.value.split('').map(char => char.charCodeAt(0)).join(' ');
    showResult(res);
  });

  document.getElementById('from-ascii').addEventListener('click', () => {
    try {
      const res = input.value.split(' ').map(code => String.fromCharCode(parseInt(code))).join('');
      showResult(res);
    } catch (e) { alert('Invalid ASCII input'); }
  });

  document.getElementById('copy-text').addEventListener('click', () => {
    navigator.clipboard.writeText(output.value);
    alert('Copied!');
  });
}
