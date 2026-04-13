// Batch Loader - Dynamically loads 100 batch files
class BatchLoader {
    constructor() {
        this.loadedBatches = new Map();
        this.loadedCount = 0;
        this.totalBatches = DICT_CONFIG.totalBatches;
        this.allWords = [];
        this.isComplete = false;
        this.loadCallbacks = [];
    }
    
    async loadAllBatches() {
        console.log(`Starting to load ${this.totalBatches} batches...`);
        
        // Load batches in groups to avoid overwhelming the browser
        const batchGroups = this.groupBatches(10); // Load 10 at a time
        
        for (const group of batchGroups) {
            await this.loadBatchGroup(group);
            this.updateProgress();
        }
        
        this.isComplete = true;
        console.log(`All ${this.totalBatches} batches loaded! Total words: ${this.allWords.length}`);
        return this.allWords;
    }
    
    groupBatches(groupSize) {
        const groups = [];
        for (let i = 0; i < this.totalBatches; i += groupSize) {
            groups.push(DICT_CONFIG.batches.slice(i, i + groupSize));
        }
        return groups;
    }
    
    async loadBatchGroup(batches) {
        const promises = batches.map(batch => this.loadSingleBatch(batch));
        await Promise.all(promises);
    }
    
    loadSingleBatch(batch) {
        return new Promise((resolve, reject) => {
            if (this.loadedBatches.has(batch.id)) {
                resolve(this.loadedBatches.get(batch.id));
                return;
            }
            
            const script = document.createElement('script');
            script.src = `js/data/${batch.file}`;
            script.onload = () => {
                const batchData = window[`DICT_BATCH_${batch.id}`];
                if (batchData && batchData.words) {
                    this.loadedBatches.set(batch.id, batchData.words);
                    this.allWords.push(...batchData.words);
                    this.loadedCount++;
                    resolve(batchData.words);
                } else {
                    reject(new Error(`Failed to load batch ${batch.id}`));
                }
            };
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }
    
    updateProgress() {
        const percentage = (this.loadedCount / this.totalBatches) * 100;
        const progressFill = document.getElementById('progressFill');
        const loadPercentage = document.getElementById('loadPercentage');
        const loadedCount = document.getElementById('loadedCount');
        const batchCount = document.getElementById('batchCount');
        
        if (progressFill) progressFill.style.width = `${percentage}%`;
        if (loadPercentage) loadPercentage.textContent = `${Math.round(percentage)}%`;
        if (loadedCount) loadedCount.textContent = this.allWords.length.toLocaleString();
        if (batchCount) batchCount.textContent = this.loadedCount;
        
        // Trigger callbacks
        this.loadCallbacks.forEach(cb => cb(this.loadedCount, this.totalBatches));
    }
    
    onProgress(callback) {
        this.loadCallbacks.push(callback);
    }
    
    searchInLoaded(query, filters) {
        if (!query || query.trim() === '') {
            return this.filterWords(this.allWords, filters);
        }
        
        const searchTerm = query.toLowerCase();
        const results = this.allWords.filter(word => {
            return word.term.toLowerCase().includes(searchTerm) ||
                   word.definition.toLowerCase().includes(searchTerm) ||
                   (word.arabic && word.arabic.includes(searchTerm)) ||
                   (word.kurdish && (
                       word.kurdish.sorani.includes(searchTerm) ||
                       word.kurdish.badini.includes(searchTerm)
                   ));
        });
        
        return this.filterWords(results, filters);
    }
    
    filterWords(words, filters) {
        let result = [...words];
        
        if (filters.type && filters.type !== 'all') {
            result = result.filter(w => w.type === filters.type);
        }
        
        if (filters.sortBy === 'term') {
            result.sort((a, b) => a.term.localeCompare(b.term));
        } else if (filters.sortBy === 'term-desc') {
            result.sort((a, b) => b.term.localeCompare(a.term));
        } else if (filters.sortBy === 'type') {
            result.sort((a, b) => a.type.localeCompare(b.type));
        }
        
        return result;
    }
    
    getRandomWord() {
        if (this.allWords.length === 0) return null;
        const randomIndex = Math.floor(Math.random() * this.allWords.length);
        return this.allWords[randomIndex];
    }
}
