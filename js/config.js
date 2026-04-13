// Zakhourani Dictionary Configuration
window.DICT_CONFIG = {
    version: "3.0",
    releaseDate: "2026-04-13",
    totalWords: 41000,
    totalBatches: 100,
    wordsPerBatch: 410, // Average 410 words per batch
    
    batches: Array.from({ length: 100 }, (_, i) => ({
        id: i + 1,
        name: `batch-${String(i + 1).padStart(3, '0')}`,
        file: `batch-${String(i + 1).padStart(3, '0')}.js`,
        range: getBatchRange(i + 1),
        estimatedWords: 410
    })),
    
    search: {
        debounceDelay: 300,
        maxResults: 200,
        minCharsForSearch: 1
    },
    
    ui: {
        wordsPerPage: 20,
        enableAnimations: true,
        lazyLoadThreshold: 100
    }
};

function getBatchRange(batchNum) {
    const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 
                     'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
    const start = letters[Math.floor((batchNum - 1) / 4)];
    const end = letters[Math.floor((batchNum - 1) / 4)];
    return `${start}-${end}`;
}
