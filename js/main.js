// ============================================
// ZAKHOURANI DICTIONARY - MAIN APPLICATION
// FIXED VERSION - With proper initialization
// ============================================

// Global variables
let dictionaryApp = null;

// Main Dictionary Class
class ZakhouraniDictionary {
    constructor() {
        this.allWords = [];
        this.loadedBatches = new Set();
        this.totalBatches = 100;
        this.currentResults = [];
        this.currentPage = 1;
        this.wordsPerPage = 20;
        this.currentFilters = {
            language: 'en',
            dialect: 'sorani',
            type: 'all',
            sortBy: 'term'
        };
        
        this.init();
    }
    
    async init() {
        console.log('🚀 Initializing Zakhourani Dictionary...');
        this.displayWelcome();
        this.setupEventListeners();
        
        // Start loading batches immediately
        await this.loadAllBatches();
    }
    
    displayWelcome() {
        const container = document.getElementById('resultsContainer');
        if (container) {
            container.innerHTML = `
                <div class="welcome-message">
                    <div class="welcome-icon">📚</div>
                    <h3>Loading Dictionary...</h3>
                    <p>Please wait while we load 41,000+ words</p>
                    <div class="loading-spinner">
                        <div class="spinner"></div>
                    </div>
                </div>
            `;
        }
    }
    
    async loadAllBatches() {
        console.log('📚 Starting to load batches...');
        
        // Try to load batch 001 first (the one you created)
        await this.loadBatch(1);
        
        // Then load remaining batches in background
        for (let i = 2; i <= this.totalBatches; i++) {
            setTimeout(() => {
                this.loadBatch(i);
            }, i * 100);
        }
    }
    
    async loadBatch(batchId) {
        if (this.loadedBatches.has(batchId)) {
            console.log(`Batch ${batchId} already loaded`);
            return;
        }
        
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            const batchFile = `js/data/batch-${String(batchId).padStart(3, '0')}.js`;
            script.src = batchFile;
            
            script.onload = () => {
                const batchData = window[`DICT_BATCH_${batchId}`];
                if (batchData && batchData.words) {
                    this.allWords.push(...batchData.words);
                    this.loadedBatches.add(batchId);
                    console.log(`✅ Loaded batch ${batchId}: ${batchData.words.length} words`);
                    this.updateStats();
                    
                    // If this is the first batch, display the words
                    if (batchId === 1) {
                        this.displayAllWords();
                    }
                    resolve(batchData);
                } else {
                    console.warn(`⚠️ Batch ${batchId} not found or invalid`);
                    resolve(null);
                }
            };
            
            script.onerror = () => {
                console.warn(`⚠️ Could not load batch ${batchId} - file not found`);
                resolve(null);
            };
            
            document.head.appendChild(script);
        });
    }
    
    updateStats() {
        const loadedCountElem = document.getElementById('loadedCount');
        const batchCountElem = document.getElementById('batchCount');
        const progressFill = document.getElementById('progressFill');
        const loadPercentage = document.getElementById('loadPercentage');
        
        if (loadedCountElem) {
            loadedCountElem.textContent = this.allWords.length.toLocaleString();
        }
        
        if (batchCountElem) {
            batchCountElem.textContent = `${this.loadedBatches.size} / ${this.totalBatches}`;
        }
        
        const percentage = (this.loadedBatches.size / this.totalBatches) * 100;
        if (progressFill) {
            progressFill.style.width = `${percentage}%`;
        }
        if (loadPercentage) {
            loadPercentage.textContent = `${Math.round(percentage)}%`;
        }
        
        console.log(`📊 Stats: ${this.allWords.length} words from ${this.loadedBatches.size} batches`);
    }
    
    setupEventListeners() {
        // Search input
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            let debounceTimer;
            searchInput.addEventListener('input', (e) => {
                clearTimeout(debounceTimer);
                debounceTimer = setTimeout(() => {
                    this.performSearch();
                }, 300);
            });
        }
        
        // Search button
        const searchBtn = document.getElementById('searchBtn');
        if (searchBtn) {
            searchBtn.addEventListener('click', () => {
                this.performSearch();
            });
        }
        
        // Clear button
        const clearBtn = document.getElementById('clearBtn');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                const searchInput = document.getElementById('searchInput');
                if (searchInput) searchInput.value = '';
                this.displayAllWords();
            });
        }
        
        // Language selector
        const languageSelect = document.getElementById('languageSelect');
        if (languageSelect) {
            languageSelect.addEventListener('change', (e) => {
                this.currentFilters.language = e.target.value;
                const dialectGroup = document.getElementById('dialectGroup');
                if (dialectGroup) {
                    dialectGroup.style.display = e.target.value === 'ku' ? 'flex' : 'none';
                }
                this.applyFiltersAndDisplay();
            });
        }
        
        // Dialect selector
        const dialectSelect = document.getElementById('dialectSelect');
        if (dialectSelect) {
            dialectSelect.addEventListener('change', (e) => {
                this.currentFilters.dialect = e.target.value;
                this.applyFiltersAndDisplay();
            });
        }
        
        // Type filter
        const typeFilter = document.getElementById('typeFilter');
        if (typeFilter) {
            typeFilter.addEventListener('change', (e) => {
                this.currentFilters.type = e.target.value;
                this.applyFiltersAndDisplay();
            });
        }
        
        // Sort by
        const sortBy = document.getElementById('sortBy');
        if (sortBy) {
            sortBy.addEventListener('change', (e) => {
                this.currentFilters.sortBy = e.target.value;
                this.applyFiltersAndDisplay();
            });
        }
        
        // Random word button
        const randomBtn = document.getElementById('randomWordBtn');
        if (randomBtn) {
            randomBtn.addEventListener('click', () => {
                this.showRandomWord();
            });
        }
        
        // Show all button
        const showAllBtn = document.getElementById('showAllBtn');
        if (showAllBtn) {
            showAllBtn.addEventListener('click', () => {
                this.displayAllWords();
            });
        }
        
        // Export button
        const exportBtn = document.getElementById('exportBtn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                this.exportResults();
            });
        }
        
        // Scroll to top
        const scrollTopBtn = document.getElementById('scrollTopBtn');
        if (scrollTopBtn) {
            scrollTopBtn.addEventListener('click', () => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        }
        
        // Pagination buttons
        const prevPage = document.getElementById('prevPage');
        const nextPage = document.getElementById('nextPage');
        if (prevPage) {
            prevPage.addEventListener('click', () => this.prevPage());
        }
        if (nextPage) {
            nextPage.addEventListener('click', () => this.nextPage());
        }
    }
    
    performSearch() {
        const searchInput = document.getElementById('searchInput');
        if (!searchInput) return;
        
        const query = searchInput.value.trim();
        
        if (query === '') {
            this.displayAllWords();
            return;
        }
        
        console.log(`🔍 Searching for: "${query}"`);
        
        const results = this.allWords.filter(word => {
            const termMatch = word.term.toLowerCase().includes(query.toLowerCase());
            const defMatch = word.definition.toLowerCase().includes(query.toLowerCase());
            const arabicMatch = word.arabic && word.arabic.includes(query);
            const soraniMatch = word.kurdish?.sorani && word.kurdish.sorani.includes(query);
            const badiniMatch = word.kurdish?.badini && word.kurdish.badini.includes(query);
            
            return termMatch || defMatch || arabicMatch || soraniMatch || badiniMatch;
        });
        
        console.log(`📊 Found ${results.length} results for "${query}"`);
        this.currentResults = this.applyFilters(results);
        this.currentPage = 1;
        this.displayResults(this.currentResults);
    }
    
    applyFilters(words) {
        let filtered = [...words];
        
        // Apply type filter
        if (this.currentFilters.type !== 'all') {
            filtered = filtered.filter(w => w.type === this.currentFilters.type);
        }
        
        // Apply sorting
        if (this.currentFilters.sortBy === 'term') {
            filtered.sort((a, b) => a.term.localeCompare(b.term));
        } else if (this.currentFilters.sortBy === 'term-desc') {
            filtered.sort((a, b) => b.term.localeCompare(a.term));
        } else if (this.currentFilters.sortBy === 'type') {
            filtered.sort((a, b) => a.type.localeCompare(b.type));
        }
        
        return filtered;
    }
    
    applyFiltersAndDisplay() {
        this.currentResults = this.applyFilters(this.allWords);
        this.currentPage = 1;
        this.displayResults(this.currentResults);
    }
    
    displayAllWords() {
        console.log(`📚 Displaying all ${this.allWords.length} words`);
        this.currentResults = this.applyFilters(this.allWords);
        this.currentPage = 1;
        this.displayResults(this.currentResults);
        
        // Clear search input
        const searchInput = document.getElementById('searchInput');
        if (searchInput) searchInput.value = '';
    }
    
    displayResults(words) {
        const container = document.getElementById('resultsContainer');
        if (!container) return;
        
        if (words.length === 0) {
            container.innerHTML = `
                <div class="no-results">
                    <div class="no-results-icon">🔍</div>
                    <h3>No words found</h3>
                    <p>Try a different search term</p>
                    <small>💡 Tip: Try searching for "Aardvark" or "سلام"</small>
                </div>
            `;
            this.updatePagination(0);
            return;
        }
        
        // Paginate
        const start = (this.currentPage - 1) * this.wordsPerPage;
        const end = start + this.wordsPerPage;
        const pageWords = words.slice(start, end);
        
        // Render cards
        container.innerHTML = pageWords.map(word => this.createWordCard(word)).join('');
        this.updatePagination(words.length);
    }
    
    createWordCard(word) {
        // Get translation based on current language
        let translationHtml = '';
        
        if (this.currentFilters.language === 'ar') {
            translationHtml = `
                <div class="translation-section">
                    <div class="translation-item">
                        <span class="translation-label">🇸🇦 العربية:</span>
                        <span class="translation-text">${this.escapeHtml(word.arabic)}</span>
                    </div>
                </div>
            `;
        } else if (this.currentFilters.language === 'ku') {
            const kurdishText = this.currentFilters.dialect === 'sorani' ? 
                word.kurdish?.sorani : word.kurdish?.badini;
            const dialectName = this.currentFilters.dialect === 'sorani' ? 'سۆرانی' : 'بدینی';
            translationHtml = `
                <div class="translation-section">
                    <div class="translation-item">
                        <span class="translation-label">🏴 کوردی (${dialectName}):</span>
                        <span class="translation-text">${this.escapeHtml(kurdishText || 'N/A')}</span>
                    </div>
                </div>
            `;
        }
        
        const synonymsHtml = word.synonyms && word.synonyms.length > 0 ? 
            `<div class="word-synonyms"><strong>📚 Synonyms:</strong> ${word.synonyms.join(', ')}</div>` : '';
        
        const antonymsHtml = word.antonyms && word.antonyms.length > 0 ? 
            `<div class="word-synonyms"><strong>⚠️ Antonyms:</strong> ${word.antonyms.join(', ')}</div>` : '';
        
        return `
            <div class="word-card">
                <div class="word-header">
                    <div>
                        <span class="word-term">${this.escapeHtml(word.term)}</span>
                        ${word.pronunciation ? `<span class="word-pronunciation">${word.pronunciation}</span>` : ''}
                    </div>
                    <span class="word-type">${word.type}</span>
                </div>
                
                ${translationHtml}
                
                <div class="word-definition">
                    <strong>📖 Definition:</strong> ${this.escapeHtml(word.definition)}
                </div>
                
                ${word.example ? `
                    <div class="word-example">
                        <strong>💡 Example:</strong> ${this.escapeHtml(word.example)}
                    </div>
                ` : ''}
                
                ${synonymsHtml}
                ${antonymsHtml}
                
                ${word.etymology ? `
                    <div class="word-etymology">
                        <strong>📜 Etymology:</strong> ${word.etymology}
                    </div>
                ` : ''}
            </div>
        `;
    }
    
    updatePagination(totalResults) {
        const paginationDiv = document.getElementById('pagination');
        const pageInfo = document.getElementById('pageInfo');
        const prevBtn = document.getElementById('prevPage');
        const nextBtn = document.getElementById('nextPage');
        
        const totalPages = Math.ceil(totalResults / this.wordsPerPage);
        
        if (totalPages > 1 && paginationDiv) {
            paginationDiv.style.display = 'flex';
            if (pageInfo) {
                pageInfo.textContent = `Page ${this.currentPage} of ${totalPages} (${totalResults} results)`;
            }
            if (prevBtn) prevBtn.disabled = this.currentPage === 1;
            if (nextBtn) nextBtn.disabled = this.currentPage === totalPages;
        } else if (paginationDiv) {
            paginationDiv.style.display = 'none';
        }
    }
    
    nextPage() {
        const totalPages = Math.ceil(this.currentResults.length / this.wordsPerPage);
        if (this.currentPage < totalPages) {
            this.currentPage++;
            this.displayResults(this.currentResults);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }
    
    prevPage() {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.displayResults(this.currentResults);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }
    
    showRandomWord() {
        if (this.allWords.length === 0) {
            console.warn('No words loaded yet');
            return;
        }
        const randomIndex = Math.floor(Math.random() * this.allWords.length);
        const randomWord = this.allWords[randomIndex];
        this.displayResults([randomWord]);
    }
    
    exportResults() {
        const dataStr = JSON.stringify(this.currentResults, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `zakhourani-export-${Date.now()}.json`;
        link.click();
        URL.revokeObjectURL(url);
    }
    
    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM ready, initializing dictionary...');
    dictionaryApp = new ZakhouraniDictionary();
});
