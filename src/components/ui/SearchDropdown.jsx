import React, { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Search, Clock, TrendingUp, FileText, Image, BarChart3, Users } from 'lucide-react';
import { addToRecentSearches } from '../../store/slices/searchSlice';

const SearchDropdown = ({ suggestions, onSelect, onClose }) => {
  const dispatch = useDispatch();
  const dropdownRef = useRef(null);
  const { recentSearches, popularSearches } = useSelector(state => state.search);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  const handleSuggestionClick = (suggestion) => {
    dispatch(addToRecentSearches({ query: suggestion, timestamp: new Date().toISOString() }));
    onSelect(suggestion);
  };

  const handleRecentSearchClick = (search) => {
    onSelect(search.query);
  };

  const handlePopularSearchClick = (search) => {
    dispatch(addToRecentSearches({ query: search, timestamp: new Date().toISOString() }));
    onSelect(search);
  };

  const getSuggestionIcon = (type) => {
    switch (type) {
      case 'project':
        return <FileText className="h-4 w-4 text-blue-500" />;
      case 'image':
        return <Image className="h-4 w-4 text-green-500" />;
      case 'analysis':
        return <BarChart3 className="h-4 w-4 text-purple-500" />;
      case 'user':
        return <Users className="h-4 w-4 text-orange-500" />;
      default:
        return <Search className="h-4 w-4 text-gray-400" />;
    }
  };

  return (
    <div 
      ref={dropdownRef}
      className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 max-h-96 overflow-y-auto"
    >
      {/* Search Suggestions */}
      {suggestions.length > 0 && (
        <div className="p-2">
          <div className="text-xs font-medium text-gray-500 dark:text-gray-400 px-3 py-1">
            Suggestions
          </div>
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => handleSuggestionClick(suggestion.query || suggestion)}
              className="w-full flex items-center space-x-3 px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
            >
              {getSuggestionIcon(suggestion.type)}
              <span className="flex-1 truncate">{suggestion.query || suggestion}</span>
              {suggestion.type && (
                <span className="text-xs text-gray-500 dark:text-gray-500 capitalize">
                  {suggestion.type}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Recent Searches */}
      {recentSearches.length > 0 && (
        <div className="p-2 border-t border-gray-200 dark:border-gray-700">
          <div className="text-xs font-medium text-gray-500 dark:text-gray-400 px-3 py-1">
            Recent searches
          </div>
          {recentSearches.slice(0, 5).map((search, index) => (
            <button
              key={index}
              onClick={() => handleRecentSearchClick(search)}
              className="w-full flex items-center space-x-3 px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
            >
              <Clock className="h-4 w-4 text-gray-400" />
              <span className="flex-1 truncate">{search.query}</span>
            </button>
          ))}
        </div>
      )}

      {/* Popular Searches */}
      <div className="p-2 border-t border-gray-200 dark:border-gray-700">
        <div className="text-xs font-medium text-gray-500 dark:text-gray-400 px-3 py-1">
          Popular searches
        </div>
        <div className="grid grid-cols-2 gap-1">
          {popularSearches.slice(0, 6).map((search, index) => (
            <button
              key={index}
              onClick={() => handlePopularSearchClick(search)}
              className="flex items-center space-x-2 px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
            >
              <TrendingUp className="h-4 w-4 text-gray-400" />
              <span className="truncate">{search}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="p-2 border-t border-gray-200 dark:border-gray-700">
        <div className="text-xs font-medium text-gray-500 dark:text-gray-400 px-3 py-1">
          Quick actions
        </div>
        <div className="grid grid-cols-2 gap-1">
          <button className="flex items-center space-x-2 px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors">
            <FileText className="h-4 w-4 text-blue-500" />
            <span>New Project</span>
          </button>
          <button className="flex items-center space-x-2 px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors">
            <Image className="h-4 w-4 text-green-500" />
            <span>Upload Image</span>
          </button>
          <button className="flex items-center space-x-2 px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors">
            <BarChart3 className="h-4 w-4 text-purple-500" />
            <span>Data Analysis</span>
          </button>
          <button className="flex items-center space-x-2 px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors">
            <Users className="h-4 w-4 text-orange-500" />
            <span>Team Members</span>
          </button>
        </div>
      </div>

      {/* Search Tips */}
      <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
        <div className="text-xs text-gray-500 dark:text-gray-400">
          <div className="font-medium mb-1">Search tips:</div>
          <div className="space-y-1">
            <div>• Use quotes for exact phrases</div>
            <div>• Add filters like "type:project" or "status:active"</div>
            <div>• Search by date with "created:last-week"</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchDropdown; 