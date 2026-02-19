import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Clock, TrendingUp, FileText, Image, BarChart3, Users, Folder } from 'lucide-react';
import { performSearch, clearSearchResults, addToSearchHistory } from '../store/slices/searchSlice';

const GlobalSearch = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { searchResults, searchHistory, recentSearches, loading } = useSelector((state) => state.search);
  const { profile } = useSelector((state) => state.userProfile);
  
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchInputRef = useRef(null);

  // Mock search suggestions based on query
  const getSearchSuggestions = (searchQuery) => {
    if (!searchQuery) return [];
    
    const suggestions = [
      { type: 'project', label: `Projects containing "${searchQuery}"`, icon: Folder },
      { type: 'document', label: `Documents with "${searchQuery}"`, icon: FileText },
      { type: 'image', label: `Images tagged "${searchQuery}"`, icon: Image },
      { type: 'analysis', label: `Analysis results for "${searchQuery}"`, icon: BarChart3 },
      { type: 'user', label: `Users matching "${searchQuery}"`, icon: Users },
    ];
    
    return suggestions.filter(suggestion => 
      suggestion.label.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  // Mock trending searches
  const trendingSearches = [
    'AI text generation',
    'Image processing',
    'Data analysis',
    'Machine learning',
    'Natural language processing'
  ];

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev < searchResults.length + getSearchSuggestions(query).length - 1 
              ? prev + 1 
              : prev
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
          break;
        case 'Enter':
          e.preventDefault();
          handleResultSelect(selectedIndex);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, searchResults, query, onClose]);

  const handleSearch = async (searchQuery) => {
    if (!searchQuery.trim()) return;

    setQuery(searchQuery);
    setShowSuggestions(false);
    
    try {
      await dispatch(performSearch(searchQuery)).unwrap();
      dispatch(addToSearchHistory(searchQuery));
    } catch (error) {
      console.error('Search failed:', error);
    }
  };

  const handleResultSelect = (index) => {
    if (index === -1) return;

    const suggestions = getSearchSuggestions(query);
    const totalItems = suggestions.length + searchResults.length;

    if (index < suggestions.length) {
      // Handle suggestion selection
      const suggestion = suggestions[index];
      handleSearch(suggestion.label);
    } else {
      // Handle result selection
      const resultIndex = index - suggestions.length;
      const result = searchResults[resultIndex];
      
      if (result) {
        navigate(result.url);
        onClose();
        setQuery('');
        setSelectedIndex(-1);
      }
    }
  };

  const handleSuggestionClick = (suggestion) => {
    handleSearch(suggestion);
  };

  const handleHistoryClick = (historyItem) => {
    setQuery(historyItem);
    handleSearch(historyItem);
  };

  const clearSearch = () => {
    setQuery('');
    setSelectedIndex(-1);
    setShowSuggestions(true);
    dispatch(clearSearchResults());
  };

  const renderSearchResults = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-500">Searching...</span>
        </div>
      );
    }

    if (searchResults.length === 0 && query) {
      return (
        <div className="text-center py-8">
          <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No results found for "{query}"</p>
          <p className="text-sm text-gray-400 mt-2">Try different keywords or check your spelling</p>
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {searchResults.map((result, index) => {
          const Icon = getResultIcon(result.type);
          const isSelected = selectedIndex === (getSearchSuggestions(query).length + index);
          
          return (
            <motion.div
              key={result.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`p-3 rounded-lg cursor-pointer transition-colors ${
                isSelected 
                  ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800' 
                  : 'hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
              onClick={() => handleResultSelect(getSearchSuggestions(query).length + index)}
            >
              <div className="flex items-center space-x-3">
                <Icon className="w-5 h-5 text-gray-400" />
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-900 dark:text-white truncate">
                    {result.title}
                  </h4>
                  <p className="text-sm text-gray-500 truncate">{result.description}</p>
                </div>
                <span className="text-xs text-gray-400 capitalize">{result.type}</span>
              </div>
            </motion.div>
          );
        })}
      </div>
    );
  };

  const renderSuggestions = () => {
    const suggestions = getSearchSuggestions(query);
    
    return (
      <div className="space-y-2">
        {suggestions.map((suggestion, index) => {
          const Icon = suggestion.icon;
          const isSelected = selectedIndex === index;
          
          return (
            <motion.div
              key={suggestion.type}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`p-3 rounded-lg cursor-pointer transition-colors ${
                isSelected 
                  ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800' 
                  : 'hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
              onClick={() => handleSuggestionClick(suggestion.label)}
            >
              <div className="flex items-center space-x-3">
                <Icon className="w-5 h-5 text-gray-400" />
                <span className="text-gray-700 dark:text-gray-300">{suggestion.label}</span>
              </div>
            </motion.div>
          );
        })}
      </div>
    );
  };

  const renderSearchHistory = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-900 dark:text-white flex items-center">
          <Clock className="w-4 h-4 mr-2" />
          Recent Searches
        </h3>
        <button
          onClick={() => dispatch(clearSearchResults())}
          className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
        >
          Clear all
        </button>
      </div>
      
      <div className="space-y-2">
        {recentSearches.slice(0, 5).map((search, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="flex items-center space-x-3 p-2 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
            onClick={() => handleHistoryClick(search)}
          >
            <Clock className="w-4 h-4 text-gray-400" />
            <span className="text-gray-700 dark:text-gray-300">{search}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );

  const renderTrendingSearches = () => (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-gray-900 dark:text-white flex items-center">
        <TrendingUp className="w-4 h-4 mr-2" />
        Trending Searches
      </h3>
      
      <div className="flex flex-wrap gap-2">
        {trendingSearches.map((search, index) => (
          <motion.button
            key={index}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => handleSearch(search)}
            className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            {search}
          </motion.button>
        ))}
      </div>
    </div>
  );

  const getResultIcon = (type) => {
    switch (type) {
      case 'project': return Folder;
      case 'document': return FileText;
      case 'image': return Image;
      case 'analysis': return BarChart3;
      case 'user': return Users;
      default: return FileText;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={onClose}
          />
          
          {/* Search Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="fixed top-4 left-1/2 transform -translate-x-1/2 w-full max-w-2xl z-50"
          >
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700">
              {/* Search Input */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={query}
                    onChange={(e) => {
                      setQuery(e.target.value);
                      setShowSuggestions(true);
                      setSelectedIndex(-1);
                      if (e.target.value.trim()) {
                        handleSearch(e.target.value);
                      } else {
                        dispatch(clearSearchResults());
                      }
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    placeholder="Search projects, documents, images, users..."
                    className="w-full pl-10 pr-10 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-white"
                  />
                  {query && (
                    <button
                      onClick={clearSearch}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Search Content */}
              <div className="max-h-96 overflow-y-auto p-4">
                {!query && showSuggestions ? (
                  <div className="space-y-6">
                    {recentSearches.length > 0 && renderSearchHistory()}
                    {renderTrendingSearches()}
                  </div>
                ) : query ? (
                  <div className="space-y-4">
                    {showSuggestions && renderSuggestions()}
                    {renderSearchResults()}
                  </div>
                ) : null}
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-b-lg">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center space-x-4">
                    <span>Press Enter to search</span>
                    <span>•</span>
                    <span>Esc to close</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span>Powered by AI Nexus</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default GlobalSearch; 