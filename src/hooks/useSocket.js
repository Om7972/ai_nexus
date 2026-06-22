import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { io } from 'socket.io-client';
import {
  setActiveUsers,
  updateCursorPosition,
  updateDocumentContent,
  addComment,
  updateComment,
  setSocketConnected,
} from '../store/slices/collaborationSlice';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/**
 * Custom hook for managing Socket.IO connection for real-time collaboration
 * @param {string} documentId - The document ID to join
 * @param {boolean} enabled - Whether to enable the socket connection
 */
export const useSocket = (documentId, enabled = true) => {
  const dispatch = useDispatch();
  const socketRef = useRef(null);
  const token = useSelector((state) => state.auth.token);
  const userId = useSelector((state) => state.auth.user?._id);

  useEffect(() => {
    if (!enabled || !documentId || !token) return;

    // Initialize Socket.IO connection
    const socket = io(API_URL, {
      auth: { token },
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    // Connection events
    socket.on('connect', () => {
      console.log('✅ Socket connected');
      dispatch(setSocketConnected(true));
      
      // Join document room
      if (documentId) {
        socket.emit('join-document', documentId);
      }
    });

    socket.on('disconnect', () => {
      console.log('❌ Socket disconnected');
      dispatch(setSocketConnected(false));
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error.message);
      dispatch(setSocketConnected(false));
    });

    // Document events
    socket.on('active-users', (users) => {
      dispatch(setActiveUsers(users));
    });

    socket.on('document-change', ({ content, userId: changeUserId }) => {
      // Only update if change came from another user
      if (changeUserId !== userId) {
        dispatch(updateDocumentContent({ documentId, content }));
      }
    });

    socket.on('cursor-position', ({ userId: cursorUserId, position }) => {
      if (cursorUserId !== userId) {
        dispatch(updateCursorPosition({ userId: cursorUserId, position }));
      }
    });

    // Comment events
    socket.on('new-comment', (comment) => {
      dispatch(addComment(comment));
    });

    socket.on('resolve-comment', ({ commentId, resolvedBy, resolvedAt }) => {
      dispatch(updateComment({ 
        _id: commentId, 
        isResolved: true, 
        resolvedBy, 
        resolvedAt 
      }));
    });

    // Cleanup on unmount or when documentId/token changes
    return () => {
      if (socket) {
        socket.emit('leave-document', documentId);
        socket.disconnect();
      }
    };
  }, [documentId, token, enabled, dispatch, userId]);

  // Helper methods
  const emitDocumentChange = (content) => {
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('document-change', { documentId, content, userId });
    }
  };

  const emitCursorPosition = (position) => {
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('cursor-position', { documentId, position, userId });
    }
  };

  const emitTyping = (isTyping) => {
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('typing', { documentId, isTyping, userId });
    }
  };

  const emitNewComment = (comment) => {
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('new-comment', { documentId, comment });
    }
  };

  const emitResolveComment = (commentId) => {
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('resolve-comment', { documentId, commentId, userId });
    }
  };

  return {
    socket: socketRef.current,
    emitDocumentChange,
    emitCursorPosition,
    emitTyping,
    emitNewComment,
    emitResolveComment,
  };
};

export default useSocket;
