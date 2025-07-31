import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from 'react';
import Fuse from 'fuse.js';
import { AqXClose, AqSearchSm } from '@airqo/icons-react';
import PropTypes from 'prop-types';

const TopBarSearch = React.memo(
  ({
    data = [],
    onSearch,
    onClearSearch = () => {},
    searchKeys = ['name'],
    placeholder = 'Search...',
    className = '',
    debounceTime = 300,
    customWidth = 'max-w-[192px]',
    disabled = false,
  }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const inputRef = useRef(null);
    const debounceRef = useRef(null);
    const fuseRef = useRef(null);
    const mountedRef = useRef(true);
    const suggestionsRef = useRef(null);

    useEffect(() => {
      return () => {
        mountedRef.current = false;
        if (debounceRef.current) clearTimeout(debounceRef.current);
      };
    }, []);

    // Enhanced search configuration
    // --- FIX: Handle empty searchKeys correctly for Fuse.js ---
    const fuseOptions = useMemo(() => {
      // If searchKeys is an empty array, Fuse will search all top-level object properties by default.
      // We only map keys if the array is provided and not empty.
      const keysToUse =
        Array.isArray(searchKeys) && searchKeys.length > 0 ? searchKeys : [];

      return {
        keys: keysToUse.map((key) => ({
          name: key,
          weight: key === 'name' ? 2 : 1,
        })),
        threshold: 0.3,
        distance: 100,
        minMatchCharLength: 1,
        shouldSort: true,
        includeScore: true,
        includeMatches: true,
        ignoreLocation: true, // Often better for general text search
        findAllMatches: false,
      };
    }, [searchKeys]);
    // --- END FIX ---

    useEffect(() => {
      if (!Array.isArray(data) || data.length === 0) {
        fuseRef.current = null;
        return;
      }
      try {
        fuseRef.current = new Fuse(data, fuseOptions);
      } catch (err) {
        console.warn('Fuse initialization error:', err);
        fuseRef.current = null;
      }
    }, [data, fuseOptions]);

    const executeSearch = useCallback(
      (value) => {
        // --- IMPROVEMENT: Check fuseRef existence ---
        if (!mountedRef.current || !fuseRef.current) {
          // If Fuse isn't ready, return empty results
          onSearch({ results: [], term: value.trim() });
          return;
        }
        // --- END IMPROVEMENT ---
        const trimmed = value.trim();
        // --- CHANGE: Always call onSearch with term, even if empty ---
        // This allows parent to know the term changed
        if (trimmed.length === 0) {
          // Inform parent search was cleared, including the term
          onSearch({ results: [], term: trimmed });
          return;
        }
        try {
          const results = fuseRef.current.search(trimmed, { limit: 50 });
          // --- CHANGE: Pass an object with results and term ---
          onSearch({ results, term: trimmed });
        } catch (err) {
          console.warn('Search error:', err);
          // --- CHANGE: Pass an object with results and term ---
          onSearch({ results: [], term: trimmed });
        }
      },
      [onSearch], // Removed fuseRef from deps as it's checked inside
    );

    const handleSearch = useCallback(
      (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        setShowSuggestions(value.length > 0 && !disabled);
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
          if (mountedRef.current) {
            executeSearch(value);
          }
        }, debounceTime);
      },
      [executeSearch, debounceTime, disabled],
    );

    const clearSearch = useCallback(() => {
      if (!mountedRef.current) return;
      if (debounceRef.current) clearTimeout(debounceRef.current);
      setSearchTerm('');
      setShowSuggestions(false);
      // --- CHANGE: Pass an object with results and term ---
      onSearch({ results: [], term: '' });
      onClearSearch();
      if (inputRef.current) inputRef.current.focus();
    }, [onSearch, onClearSearch]);

    const handleSuggestionClick = useCallback(
      (suggestion) => {
        setSearchTerm(suggestion);
        setShowSuggestions(false);
        executeSearch(suggestion);
      },
      [executeSearch],
    );

    const handleKeyDown = useCallback(
      (e) => {
        if (e.key === 'Escape') {
          if (searchTerm) {
            e.preventDefault();
            clearSearch();
          } else {
            setShowSuggestions(false);
          }
        } else if (e.key === 'Enter') {
          e.preventDefault();
          setShowSuggestions(false);
          if (debounceRef.current) clearTimeout(debounceRef.current);
          executeSearch(searchTerm);
        }
      },
      [searchTerm, clearSearch, executeSearch],
    );

    useEffect(() => {
      const handleClickOutside = (event) => {
        if (
          suggestionsRef.current &&
          !suggestionsRef.current.contains(event.target) &&
          inputRef.current &&
          !inputRef.current.contains(event.target)
        ) {
          setShowSuggestions(false);
        }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () =>
        document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // --- IMPROVEMENT: Dynamic Suggestions using Fuse ---
    // Filter suggestions based on current input using Fuse for accuracy
    const filteredSuggestions = useMemo(() => {
      if (!fuseRef.current || !searchTerm || searchTerm.trim().length < 2) {
        return [];
      }

      try {
        // Perform a search for suggestions based on the current term
        const suggestionResults = fuseRef.current.search(searchTerm.trim(), {
          limit: 3,
        });
        const uniqueSuggestions = new Set();

        suggestionResults.forEach((result) => {
          // Iterate through the keys Fuse is configured to search
          const keysToCheck =
            fuseOptions.keys.length > 0
              ? fuseOptions.keys.map((k) => k.name)
              : Object.keys(result.item || {});

          keysToCheck.forEach((key) => {
            const value = result.item?.[key];
            if (typeof value === 'string') {
              const lowerValue = value.toLowerCase();
              const lowerTerm = searchTerm.trim().toLowerCase();

              // Add the full value if it starts with the term
              if (lowerValue.startsWith(lowerTerm)) {
                uniqueSuggestions.add(value);
              }
              // Add matching words from the value
              const words = value.split(/\s+/);
              words.forEach((word) => {
                if (word.toLowerCase().startsWith(lowerTerm)) {
                  uniqueSuggestions.add(word);
                }
              });
            }
          });
        });

        return Array.from(uniqueSuggestions).slice(0, 3);
      } catch (e) {
        console.warn('Error generating dynamic suggestions:', e);
        return [];
      }
    }, [searchTerm, fuseRef, fuseOptions.keys]);
    // --- END IMPROVEMENT ---

    return (
      <div
        className={`relative ${customWidth} ${className}`}
        ref={suggestionsRef}
      >
        <div className="relative">
          <AqSearchSm className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-primary" />
          <input
            ref={inputRef}
            type="text"
            placeholder={disabled ? 'Search disabled' : placeholder}
            value={searchTerm}
            onChange={handleSearch}
            onKeyDown={handleKeyDown}
            onFocus={() =>
              !disabled && searchTerm.length > 0 && setShowSuggestions(true)
            }
            disabled={disabled}
            className={`
            w-full h-9 text-sm rounded-xl border transition-colors
            pl-12 pr-10 bg-transparent outline-none
            ${
              disabled
                ? 'border-gray-300 text-gray-400 cursor-not-allowed bg-gray-50'
                : 'border-primary text-primary dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20'
            }
          `}
            autoComplete="off"
            spellCheck="false"
          />
          {searchTerm && !disabled && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-primary hover:bg-primary/10 rounded-full p-0.5 transition-colors"
              aria-label="Clear search"
            >
              <AqXClose className="w-full h-full" />
            </button>
          )}
        </div>
        {showSuggestions && filteredSuggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
            {filteredSuggestions.map((suggestion, index) => (
              <button
                key={index}
                type="button"
                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-100 dark:border-gray-600 last:border-b-0"
                onClick={() => handleSuggestionClick(suggestion)}
              >
                <div className="flex items-center space-x-2">
                  <span className="truncate">{suggestion}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  },
);

TopBarSearch.displayName = 'TopBarSearch';
TopBarSearch.propTypes = {
  data: PropTypes.array,
  onSearch: PropTypes.func.isRequired,
  onClearSearch: PropTypes.func,
  searchKeys: PropTypes.array,
  placeholder: PropTypes.string,
  className: PropTypes.string,
  debounceTime: PropTypes.number,
  customWidth: PropTypes.string,
  disabled: PropTypes.bool,
};

export default TopBarSearch;
