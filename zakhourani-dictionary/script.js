// Main application logic
class DictionaryApp {
    constructor() {
        this.currentFilter = 'all';
        this.currentSearchTerm = '';
        this.words = window.zakhouraniDict.words;
        this.init();
    }

    init() {
        this.cacheElements();
        this.attachEventListeners();
        this.updateWordCount();
        this.displayAllWords();
    }

    cacheElements() {
        this.searchInput = document.getElementById('searchInput');
        this.searchBtn = document.getElementById('searchBtn');
        this.resultsContainer = document.getElementById('results');
        this.filterBtns = document.querySelectorAll('.filter-btn');
        this.showAllBtn = document.getElementById('showAllBtn');
        this.randomWordBtn = document.getElementById('randomWordBtn');
        this.wordCountSpan = document.getElementById('wordCount');
    }

    attachEventListeners() {
        this.searchBtn.addEventListener('click', () => this.handleSearch());
        this.searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleSearch();
        });
        
        this.filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => this.handleFilter(e));
        });
        
        this.showAllBtn.addEventListener('click', () => this.displayAllWords());
        this.randomWordBtn.addEventListener('click', () => this.displayRandomWord());
        
        // Real-time search as you type (optional)
        this.searchInput.addEventListener('input', () => {
            this.currentSearchTerm = this.searchInput.value;
            this.applyFilters();
        });
    }

    handleSearch() {
        this.currentSearchTerm = this.searchInput.value;
        this.applyFilters();
    }

    handleFilter(e) {
        // Update active button styling
        this.filterBtns.forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');
        
        this.currentFilter = e.target.dataset.filter;
        this.applyFilters();
    }

    applyFilters() {
        let filteredWords = [...this.words];
        
        // Apply type filter
        if (this.currentFilter !== 'all') {
            filteredWords = filteredWords.filter(word => word.type === this.currentFilter);
        }
        
        // Apply search filter
        if (this.currentSearchTerm.trim() !== '') {
            const searchTerm = this.currentSearchTerm.toLowerCase();
            filteredWords = filteredWords.filter(word => 
                word.term.toLowerCase().includes(searchTerm) ||
                word.definition.toLowerCase().includes(searchTerm) ||
                (word.example && word.example.toLowerCase().includes(searchTerm))
            );
        }
        
        this.displayResults(filteredWords);
    }

    displayResults(words) {
        if (words.length === 0) {
            this.resultsContainer.innerHTML = `
                <div class="no-results">
                    <p>😕 No words found matching your criteria</p>
                    <small>Try a different search term or clear the filters</small>
                </div>
            `;
            return;
        }
        
        this.resultsContainer.innerHTML = words.map(word => this.createWordCard(word)).join('');
    }

    createWordCard(word) {
        return `
            <div class="word-card">
                <div class="word-term">
                    ${this.escapeHtml(word.term)}
                    <span class="word-type">${word.type}</span>
                </div>
                <div class="word-definition">
                    ${this.escapeHtml(word.definition)}
                </div>
                ${word.example ? `<div class="word-example">📝 Example: ${this.escapeHtml(word.example)}</div>` : ''}
            </div>
        `;
    }

    displayAllWords() {
        this.currentSearchTerm = '';
        this.currentFilter = 'all';
        this.searchInput.value = '';
        
        // Reset filter buttons
        this.filterBtns.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.filter === 'all') btn.classList.add('active');
        });
        
        this.displayResults(this.words);
    }

    displayRandomWord() {
        const randomIndex = Math.floor(Math.random() * this.words.length);
        const randomWord = this.words[randomIndex];
        this.resultsContainer.innerHTML = this.createWordCard(randomWord);
        
        // Optional: Scroll to the result
        this.resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    updateWordCount() {
        if (this.wordCountSpan) {
            this.wordCountSpan.textContent = window.zakhouraniDict.totalWords;
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize the app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new DictionaryApp();
});
