// Custom hook for managing search history
import { useState, useEffect } from 'react';

const useSearchHistory = (key = 'searchHistory', maxItems = 5) => {
    const [searchHistory, setSearchHistory] = useState(() => {
        const savedHistory = localStorage.getItem(key);
        return savedHistory ? JSON.parse(savedHistory) : [];
    });

    useEffect(() => {
        localStorage.setItem(key, JSON.stringify(searchHistory));
    }, [searchHistory, key]);

    const addToHistory = (searchTerm) => {
        if (!searchTerm.trim()) return;

        setSearchHistory(prevHistory => {
            const newHistory = [
                searchTerm,
                ...prevHistory.filter(item => item !== searchTerm)
            ].slice(0, maxItems);

            return newHistory;
        });
    };

    const clearHistory = () => {
        setSearchHistory([]);
        localStorage.removeItem(key);
    };

    const removeFromHistory = (searchTerm) => {
        setSearchHistory(prevHistory =>
            prevHistory.filter(item => item !== searchTerm)
        );
    };

    return {
        searchHistory,
        addToHistory,
        clearHistory,
        removeFromHistory
    };
};

export default useSearchHistory;