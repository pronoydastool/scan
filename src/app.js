import { createIcons, Home, Grid, History, Settings, Moon, Sun, ArrowLeft, Search, QrCode, Scan, ScanLine, Barcode, Binary, ShieldCheck, Type, Copy, Share2, Download, Trash2, Info, ExternalLink, CheckCircle, X, Camera, Zap, CameraOff, AlertCircle } from 'lucide';
import toolsData from './data/tools.json';

// Initialize Lucide icons
const icons = { Home, Grid, History, Settings, Moon, Sun, ArrowLeft, Search, QrCode, Scan, ScanLine, Barcode, Binary, ShieldCheck, Type, Copy, Share2, Download, Trash2, Info, ExternalLink, CheckCircle, X, Camera, Zap, CameraOff, AlertCircle };

/**
 * CodeTools Main Application Logic
 */
class CodeToolsApp {
  constructor() {
    this.currentPage = 'home';
    this.history = JSON.parse(localStorage.getItem('ct_history') || '[]');
    this.records = JSON.parse(localStorage.getItem('ct_records') || '[]');
    this.settings = JSON.parse(localStorage.getItem('ct_settings') || '{"darkMode": false}');
    
    // Globally suppress "play() request was interrupted" errors
    window.addEventListener('unhandledrejection', (event) => {
      const errString = String(event.reason).toLowerCase();
      if (errString.includes("interrupted by a new load request") || errString.includes("interrupted because the media was removed")) {
        event.preventDefault();
      }
    });

    this.init();
  }

  init() {
    this.setupEventListeners();
    this.applySettings();
    this.renderPage('home');
    this.refreshIcons();
  }

  setupEventListeners() {
    // Navigation
    document.querySelectorAll('[data-nav]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const page = e.currentTarget.getAttribute('data-nav');
        this.renderPage(page);
      });
    });

    // Theme Toggle
    document.getElementById('theme-toggle').addEventListener('click', () => {
      this.toggleDarkMode();
    });

    // Close Tool Overlay
    document.getElementById('close-tool').addEventListener('click', () => {
      this.closeTool();
    });
  }

  applySettings() {
    if (this.settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }

  toggleDarkMode() {
    this.settings.darkMode = !this.settings.darkMode;
    localStorage.setItem('ct_settings', JSON.stringify(this.settings));
    this.applySettings();
  }

  refreshIcons() {
    createIcons({ icons });
  }

  renderPage(page) {
    this.currentPage = page;
    const mainContent = document.getElementById('main-content');
    const pageTitle = document.getElementById('page-title');
    
    // Update Nav UI
    document.querySelectorAll('[data-nav]').forEach(btn => {
      const btnPage = btn.getAttribute('data-nav');
      if (btnPage === page) {
        btn.classList.add('text-indigo-600');
        btn.classList.remove('text-slate-400');
      } else {
        btn.classList.remove('text-indigo-600');
        btn.classList.add('text-slate-400');
      }
    });

    switch(page) {
      case 'home':
        pageTitle.innerText = 'CodeTools';
        this.renderHome(mainContent);
        break;
      case 'tools':
        pageTitle.innerText = 'All Tools';
        this.renderTools(mainContent);
        break;
      case 'history':
        pageTitle.innerText = 'History';
        this.renderHistory(mainContent);
        break;
      case 'settings':
        pageTitle.innerText = 'Settings';
        this.renderSettings(mainContent);
        break;
    }
    this.refreshIcons();
  }

  renderHome(container) {
    const recentTools = this.history.slice(0, 4);
    
    container.innerHTML = `
      <div class="p-4 space-y-6">
        <!-- Hero Section -->
        <div class="bg-indigo-600 rounded-3xl p-6 text-white shadow-xl shadow-indigo-100 dark:shadow-none">
          <h2 class="text-2xl font-bold mb-1">Welcome back!</h2>
          <p class="text-indigo-100 text-sm">What would you like to build today?</p>
          <div class="mt-6 relative">
            <i data-lucide="search" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-300"></i>
            <input type="text" id="tool-search" placeholder="Search tools..." class="w-full bg-indigo-500/30 border border-indigo-400/30 rounded-xl py-2 pl-10 pr-4 text-white placeholder:text-indigo-200 outline-none focus:bg-indigo-500/50 transition-all">
          </div>
        </div>

        <!-- Recent Tools -->
        ${recentTools.length > 0 ? `
          <section>
            <h3 class="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3 px-1">Recently Used</h3>
            <div class="grid grid-cols-2 gap-3">
              ${recentTools.map(item => this.createToolCard(toolsData.find(t => t.id === item.toolId))).join('')}
            </div>
          </section>
        ` : ''}

        <!-- Categories Preview -->
        <section>
          <div class="flex items-center justify-between mb-3 px-1">
            <h3 class="text-sm font-bold text-slate-400 uppercase tracking-wider">Popular Tools</h3>
            <button data-nav="tools" class="text-xs font-bold text-indigo-600">View All</button>
          </div>
          <div class="grid grid-cols-2 gap-3">
            ${toolsData.slice(0, 4).map(tool => this.createToolCard(tool)).join('')}
          </div>
        </section>
      </div>
    `;

    // Search functionality
    const searchInput = document.getElementById('tool-search');
    searchInput.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase();
      if (query.length > 1) {
        const results = toolsData.filter(t => t.title.toLowerCase().includes(query) || t.category.toLowerCase().includes(query));
        this.renderSearchResults(results);
      } else if (query.length === 0) {
        this.renderHome(container);
      }
    });

    this.attachToolListeners();
  }

  renderSearchResults(results) {
    const container = document.getElementById('main-content');
    const searchVal = document.getElementById('tool-search').value;
    
    container.innerHTML = `
      <div class="p-4 space-y-6">
        <div class="bg-indigo-600 rounded-3xl p-6 text-white">
          <div class="relative">
            <i data-lucide="search" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-300"></i>
            <input type="text" id="tool-search" value="${searchVal}" placeholder="Search tools..." class="w-full bg-indigo-500/30 border border-indigo-400/30 rounded-xl py-2 pl-10 pr-4 text-white placeholder:text-indigo-200 outline-none focus:bg-indigo-500/50 transition-all">
          </div>
        </div>
        <section>
          <h3 class="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3 px-1">Search Results (${results.length})</h3>
          <div class="grid grid-cols-2 gap-3">
            ${results.map(tool => this.createToolCard(tool)).join('')}
          </div>
        </section>
      </div>
    `;

    const searchInput = document.getElementById('tool-search');
    searchInput.focus();
    searchInput.setSelectionRange(searchVal.length, searchVal.length);
    searchInput.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase();
      const newResults = toolsData.filter(t => t.title.toLowerCase().includes(query) || t.category.toLowerCase().includes(query));
      this.renderSearchResults(newResults);
    });

    this.attachToolListeners();
    this.refreshIcons();
  }

  renderTools(container) {
    const categories = [...new Set(toolsData.map(t => t.category))];
    
    container.innerHTML = `
      <div class="p-4 space-y-8">
        ${categories.map(cat => `
          <section>
            <h3 class="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 px-1">${cat}</h3>
            <div class="grid grid-cols-2 gap-3">
              ${toolsData.filter(t => t.category === cat).map(tool => this.createToolCard(tool)).join('')}
            </div>
          </section>
        `).join('')}
      </div>
    `;
    this.attachToolListeners();
  }

  renderHistory(container) {
    let filter = 'all'; // all, scanned, generated, favorites
    
    // Quick inline render wrapper
    const renderContent = () => {
      let filteredRecords = this.records;
      if (filter === 'scanned') filteredRecords = this.records.filter(r => r.type === 'scan');
      if (filter === 'generated') filteredRecords = this.records.filter(r => r.type === 'generate');
      if (filter === 'favorites') filteredRecords = this.records.filter(r => r.isFavorite);

      if (this.records.length === 0) {
        container.innerHTML = `
          <div class="flex flex-col items-center justify-center h-full p-10 text-center opacity-50">
            <i data-lucide="history" class="w-16 h-16 mb-4"></i>
            <p>No history yet. Start scanning or generating to see them here!</p>
          </div>
        `;
        this.refreshIcons();
        return;
      }

      container.innerHTML = `
        <div class="p-4 space-y-6">
          <div class="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
            <button class="filter-btn px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-colors ${filter==='all' ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}" data-filter="all">All</button>
            <button class="filter-btn px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-colors ${filter==='scanned' ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}" data-filter="scanned">Scanned</button>
            <button class="filter-btn px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-colors ${filter==='generated' ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}" data-filter="generated">Generated</button>
            <button class="filter-btn px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-colors ${filter==='favorites' ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}" data-filter="favorites">Favorites</button>
          </div>
          
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-sm font-bold text-slate-400 uppercase tracking-wider">Your Records</h3>
            <div class="flex gap-4">
              <button id="export-history" class="text-xs font-bold text-indigo-500 flex items-center gap-1">
                <i data-lucide="download" class="w-3 h-3"></i> Export
              </button>
              <button id="clear-records" class="text-xs font-bold text-red-500 flex items-center gap-1">
                <i data-lucide="trash-2" class="w-3 h-3"></i> Clear All
              </button>
            </div>
          </div>

          <div class="space-y-3">
            ${filteredRecords.length === 0 ? '<p class="text-xs text-slate-400">No records found for this category.</p>' : ''}
            ${filteredRecords.map((record) => {
              const rIndex = this.records.indexOf(record);
              const iconName = record.type === 'scan' ? 'scan' : 'edit-3';
              return `
                <div class="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center gap-4">
                  <div class="w-10 h-10 ${record.type === 'scan' ? 'bg-green-50 text-green-600 dark:bg-green-900/30' : 'bg-blue-50 text-blue-600 dark:bg-blue-900/30'} rounded-xl flex items-center justify-center">
                    <i data-lucide="${iconName}" class="w-5 h-5"></i>
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2">
                       <span class="text-[10px] font-bold text-slate-400 uppercase bg-slate-100 dark:bg-slate-700 px-1.5 rounded">${record.format}</span>
                       <h4 class="font-bold text-sm truncate">${record.data}</h4>
                    </div>
                    <p class="text-[10px] text-slate-400 mt-1">${new Date(record.timestamp).toLocaleString()}</p>
                  </div>
                  <div class="flex gap-2">
                    <button class="p-2 ${record.isFavorite ? 'text-yellow-500' : 'text-slate-300'} hover:text-yellow-500 transition-colors" onclick="window.app.toggleFavorite(${rIndex})">
                      <i data-lucide="star" class="w-4 h-4 ${record.isFavorite ? 'fill-current' : ''}"></i>
                    </button>
                    <button class="p-2 text-slate-300 hover:text-indigo-500 transition-colors" onclick="window.app.copyRecord('${btoa(unescape(encodeURIComponent(record.data)))}')">
                      <i data-lucide="copy" class="w-4 h-4"></i>
                    </button>
                    <button class="p-2 text-slate-300 hover:text-red-500 transition-colors" onclick="window.app.deleteRecord(${rIndex})">
                      <i data-lucide="trash-2" class="w-4 h-4"></i>
                    </button>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;

      document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          filter = e.currentTarget.getAttribute('data-filter');
          renderContent();
        });
      });

      document.getElementById('clear-records').addEventListener('click', () => {
        if (confirm('Are you sure you want to clear all records?')) {
          this.records = [];
          localStorage.setItem('ct_records', JSON.stringify(this.records));
          renderContent();
        }
      });
      
      document.getElementById('export-history').addEventListener('click', () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.records, null, 2));
        const dlAnchorElem = document.createElement('a');
        dlAnchorElem.setAttribute("href", dataStr);
        dlAnchorElem.setAttribute("download", "codetools-history.json");
        dlAnchorElem.click();
      });

      this.refreshIcons();
    };

    renderContent();
  }

  renderSettings(container) {
    container.innerHTML = `
      <div class="p-4 space-y-6">
        <section class="bg-white dark:bg-slate-800 rounded-3xl p-2 shadow-sm border border-slate-100 dark:border-slate-700">
          <div class="p-4 flex items-center justify-between border-b border-slate-50 dark:border-slate-700">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center text-indigo-600">
                <i data-lucide="moon" class="w-4 h-4"></i>
              </div>
              <span class="font-bold text-sm">Dark Mode</span>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" id="dark-mode-toggle" class="sr-only peer" ${this.settings.darkMode ? 'checked' : ''}>
              <div class="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
            </label>
          </div>
          <div class="p-4 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 bg-red-50 dark:bg-red-900/30 rounded-lg flex items-center justify-center text-red-600">
                <i data-lucide="trash-2" class="w-4 h-4"></i>
              </div>
              <span class="font-bold text-sm">Clear App Data</span>
            </div>
            <button id="reset-app" class="text-xs font-bold text-red-500">Reset</button>
          </div>
        </section>

        <section class="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 text-center">
          <div class="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">CT</div>
          <h3 class="font-bold text-lg">CodeTools v1.0.0</h3>
          <p class="text-slate-400 text-xs mb-6">Your all-in-one developer utility belt.</p>
          <div class="flex flex-col gap-2">
            <button class="btn-secondary flex items-center justify-center gap-2">
              <i data-lucide="info" class="w-4 h-4"></i> About Developer
            </button>
            <button class="btn-secondary flex items-center justify-center gap-2">
              <i data-lucide="share-2" class="w-4 h-4"></i> Share App
            </button>
          </div>
        </section>
      </div>
    `;

    document.getElementById('dark-mode-toggle').addEventListener('change', () => this.toggleDarkMode());
    document.getElementById('reset-app').addEventListener('click', () => {
      if (confirm('This will clear all history and settings. Continue?')) {
        localStorage.clear();
        window.location.reload();
      }
    });
    this.refreshIcons();
  }

  createToolCard(tool) {
    if (!tool) return '';
    return `
      <button data-tool="${tool.id}" class="tool-card bg-white dark:bg-slate-800 p-4 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col items-start gap-3 text-left w-full">
        <div class="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center text-indigo-600">
          <i data-lucide="${tool.icon}" class="w-5 h-5"></i>
        </div>
        <div>
          <h4 class="font-bold text-sm">${tool.title}</h4>
          <p class="text-[10px] text-slate-400 line-clamp-1">${tool.description}</p>
        </div>
      </button>
    `;
  }

  attachToolListeners() {
    document.querySelectorAll('[data-tool]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const toolId = e.currentTarget.getAttribute('data-tool');
        this.openTool(toolId);
      });
    });
  }

  async openTool(toolId) {
    const tool = toolsData.find(t => t.id === toolId);
    const overlay = document.getElementById('tool-overlay');
    const toolTitle = document.getElementById('tool-title');
    const toolContent = document.getElementById('tool-content');

    toolTitle.innerText = tool.title;
    overlay.classList.remove('translate-x-full');
    
    // Add to history
    this.addToHistory(toolId);

    // Dynamic import of tool module
    try {
      const module = await import(`./tools/${toolId}.js`);
      module.init(toolContent, this);
      this.refreshIcons();
    } catch (err) {
      console.error('Failed to load tool:', err);
      toolContent.innerHTML = `<p class="text-red-500">Error loading tool: ${err.message}</p>`;
    }
  }

  closeTool() {
    const overlay = document.getElementById('tool-overlay');
    overlay.classList.add('translate-x-full');
    // Clean up any active scanners or intervals if needed
    if (window.activeScanner) {
      window.activeScanner.stop();
      window.activeScanner = null;
    }
  }

  addRecord(type, format, data) {
    const entry = {
      type, // 'scan' or 'generate'
      format, // 'QR' or 'CODE128' etc
      data,
      timestamp: new Date().toISOString(),
      isFavorite: false
    };
    // if duplicate exists, just bring to front
    this.records = this.records.filter(r => !(r.data === data && r.format === format));
    this.records.unshift(entry);
    if (this.records.length > 100) this.records.pop(); // keep last 100
    localStorage.setItem('ct_records', JSON.stringify(this.records));
  }

  toggleFavorite(index) {
    if(this.records[index]) {
      this.records[index].isFavorite = !this.records[index].isFavorite;
      localStorage.setItem('ct_records', JSON.stringify(this.records));
      if (this.currentPage === 'history') {
        this.renderHistory(document.getElementById('main-content'));
      }
    }
  }

  copyRecord(b64Data) {
    const dataStr = decodeURIComponent(escape(atob(b64Data)));
    navigator.clipboard.writeText(dataStr);
    alert('Copied to clipboard!');
  }

  deleteRecord(index) {
    this.records.splice(index, 1);
    localStorage.setItem('ct_records', JSON.stringify(this.records));
    if (this.currentPage === 'history') {
      this.renderHistory(document.getElementById('main-content'));
    }
  }

  addToHistory(toolId) {
    const entry = {
      toolId,
      timestamp: new Date().toISOString()
    };
    // Remove existing entry for same tool to move it to top
    this.history = this.history.filter(item => item.toolId !== toolId);
    this.history.unshift(entry);
    // Keep only last 20 items
    if (this.history.length > 20) this.history.pop();
    localStorage.setItem('ct_history', JSON.stringify(this.history));
  }

  deleteHistoryItem(index) {
    this.history.splice(index, 1);
    localStorage.setItem('ct_history', JSON.stringify(this.history));
    this.renderHistory(document.getElementById('main-content'));
  }
}

// Initialize the app
window.app = new CodeToolsApp();
