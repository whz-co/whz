// Main Application - Orchestrates everything
class ZakhouraniApp {
    constructor() {
        this.batchLoader = new BatchLoader();
        this.searchEngine = null;
        this.uiHandler = new UIHandler();
        this.currentFilters = {
            language: 'en',
            dialect: 'sorani',
            type: 'all',
            sortBy: 'term'
        };
        this.init();
    }
    
    async init() {
        this.showWelcome();
        this.setupEventListeners();
        
        // Start loading batches
        this.batchLoader.onProgress((loaded, total) => {
            if (loaded === total) {
                this.onAllBatchesLoaded();
            }
        });
        
        await this.batchLoader.loadAllBatches();
    }
    
    onAllBatchesLoaded() {
        console.log('All batches loaded, initializing search engine...');
        this.searchEngine = new SearchEngine(this.batchLoader);
        this.searchEngine.buildIndex();
        
        // Update total count display
        const totalCountElem = document.getElementById('totalCount');
        if (totalCountElem) {
            totalCountElem.textContent = this.batchLoader.allWords.length.toLocaleString();
        }
        
        // Show initial words
        this.showAllWords();
    }
    
    setupEventListeners() {
        // Search input with debounce
        const searchInput = document.getElementById('searchInput');
        let debounceTimer;
        
        searchInput.addEventListener('input', (e) => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                this.performSearch();
            }, 300);
        });
        
        // Search button
        document.getElementById('searchBtn').addEventListener('click', () => {
            this.performSearch();
        });
        
        // Clear button
        document.getElementById('clearBtn').addEventListener('click', () => {
            searchInput.value = '';
            this.showAllWords();
        });
        
        // Language selector
        const languageSelect = document.getElementById('languageSelect');
        const dialectGroup = document.getElementById('dialectGroup');
        
        languageSelect.addEventListener('change', (e) => {
            this.currentFilters.language = e.target.value;
            dialectGroup.style.display = e.target.value === 'ku' ? 'flex' : 'none';
            
            // Set RTL for Arabic/Kurdish
            const app = document.getElementById('app');
            if (e.target.value === 'ar' || e.target.value === 'ku') {
                app.setAttribute('dir', 'rtl');
            } else {
                app.setAttribute('dir', 'ltr');
            }
            
            this.performSearch();
        });
        
        // Dialect selector
        document.getElementById('dialectSelect').addEventListener('change', (e) => {
            this.currentFilters.dialect = e.target.value;
            this.performSearch();
        });
        
        // Type filter
        document.getElementById('typeFilter').addEventListener('change', (e) => {
            this.currentFilters.type = e.target.value;
            this.performSearch();
        });
        
        // Sort by
        document.getElementById('sortBy').addEventListener('change', (e) => {
            this.currentFilters.sortBy = e.target.value;
            this.performSearch();
        });
        
        // Random word button
        document.getElementById('randomWordBtn').addEventListener('click', () => {
            this.showRandomWord();
        });
        
        // Show all button
        document.getElementById('showAllBtn').addEventListener('click', () => {
            this.showAllWords();
        });
        
        // Export button
        document.getElementById('exportBtn').addEventListener('click', () => {
            this.exportResults();
        });
        
        // Scroll to top
        document.getElementById('scrollTopBtn').addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
        
        // Pagination
        document.getElementById('prevPage').addEventListener('click', () => {
            this.uiHandler.prevPage();
        });
        
        document.getElementById('nextPage').addEventListener('click', () => {
            this.uiHandler.nextPage();
        });
    }
    
    performSearch() {
        const query = document.getElementById('searchInput').value;
        
        if (!query || query.trim() === '') {
            this.showAllWords();
            return;
        }
        
        const results = this.batchLoader.searchInLoaded(query, this.currentFilters);
        this.uiHandler.displayResults(results, this.currentFilters);
    }
    
    showAllWords() {
        const allWords = this.batchLoader.allWords;
        this.uiHandler.displayResults(allWords, this.currentFilters);
    }
    
    showRandomWord() {
        const randomWord = this.batchLoader.getRandomWord();
        if (randomWord) {
            this.uiHandler.displayResults([randomWord], this.currentFilters);
        }
    }
    
    exportResults() {
        const results = this.uiHandler.currentResults;
        const dataStr = JSON.stringify(results, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `zakhourani-dictionary-export-${Date.now()}.json`;
        link.click();
        URL.revokeObjectURL(url);
    }
    
    showWelcome() {
        const container = document.getElementById('resultsContainer');
        container.innerHTML = `
            <div class="welcome-message">
                <div class="welcome-icon">📚</div>
                <h3>Zakhourani Dictionary</h3>
                <p>Loading 41,000+ words from 100 batches...</p>
                <small>Please wait while the dictionary loads</small>
            </div>
        `;
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.app = new ZakhouraniApp();
});
