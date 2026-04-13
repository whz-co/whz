// UI Handler - Manages all display logic
class UIHandler {
    constructor() {
        this.currentPage = 1;
        this.currentResults = [];
        this.currentFilters = {
            language: 'en',
            dialect: 'sorani',
            type: 'all',
            sortBy: 'term'
        };
        this.wordsPerPage = 20;
    }
    
    displayResults(words, filters) {
        this.currentResults = words;
        this.currentFilters = { ...this.currentFilters, ...filters };
        this.currentPage = 1;
        this.renderCurrentPage();
    }
    
    renderCurrentPage() {
        const start = (this.currentPage - 1) * this.wordsPerPage;
        const end = start + this.wordsPerPage;
        const pageWords = this.currentResults.slice(start, end);
        
        const container = document.getElementById('resultsContainer');
        
        if (pageWords.length === 0) {
            container.innerHTML = this.getNoResultsHTML();
            document.getElementById('pagination').style.display = 'none';
            return;
        }
        
        container.innerHTML = pageWords.map(word => this.createWordCardHTML(word)).join('');
        this.updatePagination();
    }
    
    createWordCardHTML(word) {
        const translation = this.getTranslation(word);
        const typeClass = word.type;
        
        return `
            <div class="word-card" data-type="${typeClass}">
                <div class="word-header">
                    <div>
                        <span class="word-term">${this.escapeHtml(word.term)}</span>
                        ${word.pronunciation ? `<span class="word-pronunciation">${word.pronunciation}</span>` : ''}
                    </div>
                    <span class="word-type">${word.type}</span>
                </div>
                
                ${translation}
                
                <div class="word-definition">
                    <strong>📖 Definition:</strong> ${this.escapeHtml(word.definition)}
                </div>
                
                ${word.example ? `
                    <div class="word-example">
                        <strong>💡 Example:</strong> ${this.escapeHtml(word.example)}
                    </div>
                ` : ''}
                
                ${word.synonyms && word.synonyms.length ? `
                    <div class="word-synonyms">
                        <strong>📚 Synonyms:</strong> ${word.synonyms.join(', ')}
                    </div>
                ` : ''}
                
                ${word.etymology ? `
                    <div class="word-etymology">
                        <strong>📜 Etymology:</strong> ${word.etymology}
                    </div>
                ` : ''}
            </div>
        `;
    }
    
    getTranslation(word) {
        if (this.currentFilters.language === 'ar') {
            return `
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
            
            return `
                <div class="translation-section">
                    <div class="translation-item">
                        <span class="translation-label">🏴 کوردی (${dialectName}):</span>
                        <span class="translation-text">${this.escapeHtml(kurdishText || 'N/A')}</span>
                    </div>
                </div>
            `;
        }
        return '';
    }
    
    updatePagination() {
        const totalPages = Math.ceil(this.currentResults.length / this.wordsPerPage);
        const paginationDiv = document.getElementById('pagination');
        const prevBtn = document.getElementById('prevPage');
        const nextBtn = document.getElementById('nextPage');
        const pageInfo = document.getElementById('pageInfo');
        
        if (totalPages > 1) {
            paginationDiv.style.display = 'flex';
            pageInfo.textContent = `Page ${this.currentPage} of ${totalPages} (${this.currentResults.length} results)`;
            
            if (prevBtn) prevBtn.disabled = this.currentPage === 1;
            if (nextBtn) nextBtn.disabled = this.currentPage === totalPages;
        } else {
            paginationDiv.style.display = 'none';
        }
    }
    
    nextPage() {
        const totalPages = Math.ceil(this.currentResults.length / this.wordsPerPage);
        if (this.currentPage < totalPages) {
            this.currentPage++;
            this.renderCurrentPage();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }
    
    prevPage() {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.renderCurrentPage();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }
    
    getNoResultsHTML() {
        return `
            <div class="no-results">
                <div class="no-results-icon">🔍</div>
                <h3>No words found</h3>
                <p>Try a different search term or browse all words</p>
                <small>💡 Tip: Try searching for "Aardvark", "سلام", or "کوردی"</small>
            </div>
        `;
    }
    
    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    showLoading() {
        const container = document.getElementById('resultsContainer');
        container.innerHTML = `
            <div class="loading-spinner">
                <div class="spinner"></div>
                <p>Loading dictionary...</p>
            </div>
        `;
    }
}
