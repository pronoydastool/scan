import CryptoJS from 'crypto-js';

export function init(container, app) {
  container.innerHTML = `
    <div class="space-y-6">
      <div class="space-y-2">
        <label class="text-xs font-bold text-slate-400 uppercase tracking-wider">Input Text</label>
        <textarea id="hash-input" placeholder="Enter text to hash..." class="input-field h-32 resize-none"></textarea>
      </div>

      <div class="space-y-4">
        <div class="space-y-2">
          <label class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">MD5</label>
          <div class="flex gap-2">
            <input type="text" id="md5-out" readonly class="input-field font-mono text-xs bg-slate-50 dark:bg-slate-900/50">
            <button data-copy="md5-out" class="p-3 bg-slate-100 dark:bg-slate-700 rounded-xl"><i data-lucide="copy" class="w-4 h-4"></i></button>
          </div>
        </div>

        <div class="space-y-2">
          <label class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">SHA-1</label>
          <div class="flex gap-2">
            <input type="text" id="sha1-out" readonly class="input-field font-mono text-xs bg-slate-50 dark:bg-slate-900/50">
            <button data-copy="sha1-out" class="p-3 bg-slate-100 dark:bg-slate-700 rounded-xl"><i data-lucide="copy" class="w-4 h-4"></i></button>
          </div>
        </div>

        <div class="space-y-2">
          <label class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">SHA-256</label>
          <div class="flex gap-2">
            <input type="text" id="sha256-out" readonly class="input-field font-mono text-xs bg-slate-50 dark:bg-slate-900/50">
            <button data-copy="sha256-out" class="p-3 bg-slate-100 dark:bg-slate-700 rounded-xl"><i data-lucide="copy" class="w-4 h-4"></i></button>
          </div>
        </div>
      </div>
    </div>
  `;

  const input = document.getElementById('hash-input');
  const md5Out = document.getElementById('md5-out');
  const sha1Out = document.getElementById('sha1-out');
  const sha256Out = document.getElementById('sha256-out');

  input.addEventListener('input', () => {
    const val = input.value;
    if (!val) {
      md5Out.value = '';
      sha1Out.value = '';
      sha256Out.value = '';
      return;
    }

    md5Out.value = CryptoJS.MD5(val).toString();
    sha1Out.value = CryptoJS.SHA1(val).toString();
    sha256Out.value = CryptoJS.SHA256(val).toString();
  });

  document.querySelectorAll('[data-copy]').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-copy');
      const target = document.getElementById(targetId);
      if (target.value) {
        navigator.clipboard.writeText(target.value);
        alert('Hash copied!');
      }
    });
  });
}
