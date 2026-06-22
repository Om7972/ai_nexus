import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { updateDocument } from '../../store/slices/collaborationSlice';
import { useSocket } from '../../hooks/useSocket';
import { FiSave, FiUsers, FiMessageSquare } from 'react-icons/fi';
import debounce from 'lodash/debounce';

const DocumentEditor = ({ document }) => {
  const dispatch = useDispatch();
  const [content, setContent] = useState(document?.content || '');
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(new Date());
  
  const { emitDocumentChange, emitCursorPosition, emitTyping } = useSocket(document?._id, true);

  // Update content when document changes
  useEffect(() => {
    setContent(document?.content || '');
  }, [document?._id]);

  // Debounced save to server
  const debouncedSave = useCallback(
    debounce(async (documentId, newContent) => {
      setIsSaving(true);
      try {
        await dispatch(updateDocument({ 
          documentId, 
          updates: { content: newContent } 
        })).unwrap();
        setLastSaved(new Date());
      } catch (error) {
        console.error('Failed to save document:', error);
      } finally {
        setIsSaving(false);
      }
    }, 2000),
    [dispatch]
  );

  // Handle content change
  const handleContentChange = (e) => {
    const newContent = e.target.value;
    setContent(newContent);
    
    // Emit real-time change
    emitDocumentChange(newContent);
    
    // Save to server (debounced)
    debouncedSave(document._id, newContent);
    
    // Emit typing indicator
    emitTyping(true);
    setTimeout(() => emitTyping(false), 1000);
  };

  // Handle cursor movement
  const handleCursorMove = (e) => {
    const position = e.target.selectionStart;
    emitCursorPosition({ line: 0, column: position });
  };

  return (
    <div className="h-full flex flex-col bg-white/5 backdrop-blur-xl">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <div className="flex-1">
          <h2 className="text-xl font-semibold text-white">{document.title}</h2>
          <p className="text-sm text-gray-400 mt-1">
            {isSaving ? 'Saving...' : `Last saved ${lastSaved.toLocaleTimeString()}`}
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Active Users */}
          <div className="flex items-center gap-2">
            <FiUsers className="w-4 h-4 text-gray-400" />
            <div className="flex -space-x-2">
              {document.activeUsers?.slice(0, 3).map((activeUser, i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 border-2 border-gray-900 flex items-center justify-center text-xs text-white font-medium"
                  title={activeUser.user?.name}
                >
                  {activeUser.user?.name?.charAt(0) || '?'}
                </div>
              ))}
            </div>
          </div>

          {/* Comments Button */}
          <button className="p-2 hover:bg-white/10 rounded-lg transition-all">
            <FiMessageSquare className="w-5 h-5 text-gray-400" />
          </button>

          {/* Manual Save Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => debouncedSave(document._id, content)}
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg text-white font-medium hover:shadow-lg transition-all disabled:opacity-50"
          >
            <FiSave className="w-4 h-4" />
            {isSaving ? 'Saving...' : 'Save'}
          </motion.button>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-hidden">
        <textarea
          value={content}
          onChange={handleContentChange}
          onSelect={handleCursorMove}
          onClick={handleCursorMove}
          onKeyUp={handleCursorMove}
          placeholder="Start typing..."
          className="w-full h-full p-6 bg-transparent text-white resize-none outline-none font-mono"
          style={{ fontSize: '16px', lineHeight: '1.6' }}
        />
      </div>

      {/* Footer - Document Info */}
      <div className="flex items-center justify-between p-4 border-t border-white/10 text-sm text-gray-400">
        <div>Version {document.version}</div>
        <div>{content.length} characters</div>
        <div>Type: {document.type}</div>
      </div>
    </div>
  );
};

export default DocumentEditor;
