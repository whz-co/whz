// Advanced Search Engine for 41,000+ words
class SearchEngine {
    constructor(batchLoader) {
        this.batchLoader = batchLoader;
        this.searchIndex = new Map();
        this.isIndexed = false;
    }
    
    buildIndex() {
        console.log('Building search index...');
        const words = this.batchLoader.allWords;
        
        words.forEach((word, index) => {
            // Index by term
            const termKey = word.term.toLowerCase();
            if (!this.searchIndex.has(termKey)) {
                this.searchIndex.set(termKey, []);
            }
            this.searchIndex.get(termKey).push(index);
            
            // Index by first letter for quick filtering
            const firstLetter = word.term[0].toLowerCase();
            if (!this.searchIndex.has(`letter:${firstLetter}`)) {
                this.searchIndex.set(`letter:${firstLetter}`, []);
            }
            this.searchIndex.get(`letter:${firstLetter}`).push(index);
        });
        
        this.isIndexed = true;
        console.log(`Search index built with ${this.searchIndex.size} keys`);
    }
    
    search(query, filters) {
        if (!this.isIndexed && this.batchLoader.allWords.length > 0) {
            this.buildIndex();
        }
        
        return this.batchLoader.searchInLoaded(query, filters);
    }
    
    getSuggestions(prefix, limit = 10) {
        const prefixLower = prefix.toLowerCase();
        const suggestions = [];
        
        for (let [key, indices] of this.searchIndex) {
            if (key.startsWith(prefixLower) && key !== `letter:${prefixLower}`) {
                const word = this.batchLoader.allWords[indices[0]];
                if (word && suggestions.length < limit) {
                    suggestions.push({
                        term: word.term,
                        type: word.type
                    });
                }
            }
        }
        
        return suggestions;
    }
}
