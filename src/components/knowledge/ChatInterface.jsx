import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send, Loader, User, Bot, FileText, ExternalLink,
  Copy, CheckCheck
} from 'lucide-react';

const ChatInterface = ({ onSendMessage, messages = [], isLoading, sources = [] }) => {
  const [input, setInput] = useState('');
  const [copiedIndex, setCopiedIndex] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input);
      setInput('');
    }
  };

  const copyToClipboard = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-md">
              <Bot size={64} className="mx-auto mb-4 text-blue-400 opacity-50" />
              <h3 className="text-xl font-bold text-white mb-2">
                Chat with Your Documents
              </h3>
              <p className="text-gray-400">
                Ask questions about your uploaded documents and get AI-powered answers with source citations.
              </p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`flex gap-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.role === 'assistant' && (
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <Bot size={20} className="text-blue-400" />
                  </div>
                )}

                <div className={`
                  max-w-3xl rounded-2xl p-4
                  ${message.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white/5 border border-white/10'
                  }
                `}>
                  <p className="whitespace-pre-wrap">{message.content}</p>

                  {/* Sources */}
                  {message.sources && message.sources.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-white/10 space-y-2">
                      <p className="text-xs font-semibold text-gray-400 mb-2">Sources:</p>
                      {message.sources.map((source, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-2 p-2 bg-white/5 rounded-lg text-sm"
                        >
                          <FileText size={14} className="text-blue-400 mt-0.5 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-gray-400 truncate">
                              {source.filename} (Similarity: {(source.similarity * 100).toFixed(0)}%)
                            </p>
                            <p className="text-xs text-gray-500 line-clamp-2 mt-1">
                              {source.content}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Token Usage */}
                  {message.tokenUsage && (
                    <div className="mt-2 text-xs text-gray-500">
                      Tokens: {message.tokenUsage.total}
                    </div>
                  )}

                  {/* Copy Button */}
                  {message.role === 'assistant' && (
                    <button
                      onClick={() => copyToClipboard(message.content, index)}
                      className="mt-2 flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors"
                    >
                      {copiedIndex === index ? (
                        <>
                          <CheckCheck size={14} />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy size={14} />
                          Copy
                        </>
                      )}
                    </button>
                  )}
                </div>

                {message.role === 'user' && (
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                    <User size={20} className="text-purple-400" />
                  </div>
                )}
              </motion.div>
            ))}

            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex gap-4"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <Bot size={20} className="text-blue-400" />
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                  <div className="flex items-center gap-2">
                    <Loader size={16} className="animate-spin text-blue-400" />
                    <span className="text-gray-400">Thinking...</span>
                  </div>
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input Area */}
      <div className="border-t border-white/10 p-4 bg-gray-900/50 backdrop-blur-sm">
        <form onSubmit={handleSubmit} className="flex gap-3">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question about your documents..."
            disabled={isLoading}
            className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-500 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-xl font-medium transition-colors flex items-center gap-2"
          >
            {isLoading ? (
              <Loader size={20} className="animate-spin" />
            ) : (
              <>
                <Send size={20} />
                <span className="hidden sm:inline">Send</span>
              </>
            )}
          </button>
        </form>

        <p className="text-xs text-gray-500 mt-2 text-center">
          AI responses are based on your uploaded documents. Verify important information.
        </p>
      </div>
    </div>
  );
};

export default ChatInterface;
