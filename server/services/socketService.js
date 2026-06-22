import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import CollabDocument from '../models/CollabDocument.js';
import CollabComment from '../models/CollabComment.js';

class SocketService {
  constructor() {
    this.io = null;
    this.users = new Map(); // socketId -> { userId, documentId, userName }
  }

  initialize(server) {
    this.io = new Server(server, {
      cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        credentials: true
      }
    });

    // Authentication middleware
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token;
        
        if (!token) {
          return next(new Error('Authentication error'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.userId = decoded.id;
        socket.userName = decoded.name;
        
        next();
      } catch (error) {
        next(new Error('Authentication error'));
      }
    });

    this.io.on('connection', (socket) => {
      console.log(`User connected: ${socket.userId}`);

      // Join document room
      socket.on('join-document', async (documentId) => {
        try {
          socket.join(`document:${documentId}`);
          socket.documentId = documentId;

          // Add user to active users
          const document = await CollabDocument.findById(documentId);
          if (document) {
            await document.addActiveUser(socket.userId, socket.id);

            // Get updated active users
            const activeUsers = await CollabDocument.findById(documentId)
              .populate('activeUsers.user', 'name email avatar')
              .select('activeUsers');

            // Broadcast to all users in the document
            this.io.to(`document:${documentId}`).emit('active-users', activeUsers.activeUsers);
          }

          // Store user info
          this.users.set(socket.id, {
            userId: socket.userId,
            userName: socket.userName,
            documentId
          });

          console.log(`User ${socket.userId} joined document ${documentId}`);
        } catch (error) {
          console.error('Error joining document:', error);
        }
      });

      // Leave document room
      socket.on('leave-document', async (documentId) => {
        try {
          socket.leave(`document:${documentId}`);

          // Remove user from active users
          const document = await CollabDocument.findById(documentId);
          if (document) {
            await document.removeActiveUser(socket.userId);

            // Get updated active users
            const activeUsers = await CollabDocument.findById(documentId)
              .populate('activeUsers.user', 'name email avatar')
              .select('activeUsers');

            // Broadcast to remaining users
            this.io.to(`document:${documentId}`).emit('active-users', activeUsers.activeUsers);
          }

          this.users.delete(socket.id);
          console.log(`User ${socket.userId} left document ${documentId}`);
        } catch (error) {
          console.error('Error leaving document:', error);
        }
      });

      // Document content change
      socket.on('document-change', async (data) => {
        const { documentId, content, delta } = data;

        try {
          // Broadcast change to other users (not sender)
          socket.to(`document:${documentId}`).emit('document-change', {
            userId: socket.userId,
            userName: socket.userName,
            content,
            delta,
            timestamp: Date.now()
          });

          // Optionally save to database (debounced on client side)
          if (data.shouldSave) {
            await CollabDocument.findByIdAndUpdate(documentId, {
              content,
              'metadata.lastEditedBy': socket.userId,
              'metadata.lastEditedAt': new Date(),
              'metadata.wordCount': content.split(/\s+/).length,
              'metadata.characterCount': content.length
            });
          }
        } catch (error) {
          console.error('Error handling document change:', error);
        }
      });

      // Cursor position change
      socket.on('cursor-position', async (data) => {
        const { documentId, cursor, selection } = data;

        try {
          // Update cursor in database
          const document = await CollabDocument.findById(documentId);
          if (document) {
            await document.updateCursor(socket.userId, cursor, selection);
          }

          // Broadcast to other users
          socket.to(`document:${documentId}`).emit('cursor-position', {
            userId: socket.userId,
            userName: socket.userName,
            cursor,
            selection,
            timestamp: Date.now()
          });
        } catch (error) {
          console.error('Error updating cursor:', error);
        }
      });

      // New comment
      socket.on('new-comment', async (data) => {
        const { documentId, commentData } = data;

        try {
          const comment = await CollabComment.create(commentData);
          const populatedComment = await CollabComment.findById(comment._id)
            .populate('author', 'name email avatar')
            .populate('mentions', 'name email');

          // Broadcast to all users in document
          this.io.to(`document:${documentId}`).emit('new-comment', populatedComment);
        } catch (error) {
          console.error('Error creating comment:', error);
        }
      });

      // Comment resolved
      socket.on('resolve-comment', async (data) => {
        const { documentId, commentId } = data;

        try {
          const comment = await CollabComment.findById(commentId);
          if (comment) {
            await comment.resolve(socket.userId);
            const updatedComment = await CollabComment.findById(commentId)
              .populate('author', 'name email avatar')
              .populate('resolvedBy', 'name email');

            // Broadcast to all users
            this.io.to(`document:${documentId}`).emit('comment-resolved', updatedComment);
          }
        } catch (error) {
          console.error('Error resolving comment:', error);
        }
      });

      // Typing indicator
      socket.on('typing', (data) => {
        const { documentId, isTyping } = data;
        socket.to(`document:${documentId}`).emit('user-typing', {
          userId: socket.userId,
          userName: socket.userName,
          isTyping
        });
      });

      // Handle disconnect
      socket.on('disconnect', async () => {
        const userInfo = this.users.get(socket.id);
        
        if (userInfo && userInfo.documentId) {
          try {
            const document = await CollabDocument.findById(userInfo.documentId);
            if (document) {
              await document.removeActiveUser(socket.userId);

              // Get updated active users
              const activeUsers = await CollabDocument.findById(userInfo.documentId)
                .populate('activeUsers.user', 'name email avatar')
                .select('activeUsers');

              // Broadcast to remaining users
              this.io.to(`document:${userInfo.documentId}`).emit('active-users', activeUsers.activeUsers);
            }
          } catch (error) {
            console.error('Error handling disconnect:', error);
          }
        }

        this.users.delete(socket.id);
        console.log(`User disconnected: ${socket.userId}`);
      });
    });

    console.log('Socket.IO service initialized');
  }

  // Emit notification to specific user
  emitToUser(userId, event, data) {
    // Find all sockets for this user
    for (const [socketId, userInfo] of this.users.entries()) {
      if (userInfo.userId === userId) {
        this.io.to(socketId).emit(event, data);
      }
    }
  }

  // Emit to document room
  emitToDocument(documentId, event, data) {
    this.io.to(`document:${documentId}`).emit(event, data);
  }

  // Get active users in document
  getActiveUsers(documentId) {
    const activeUsers = [];
    for (const [socketId, userInfo] of this.users.entries()) {
      if (userInfo.documentId === documentId) {
        activeUsers.push({
          userId: userInfo.userId,
          userName: userInfo.userName
        });
      }
    }
    return activeUsers;
  }
}

// Singleton instance
const socketService = new SocketService();

export default socketService;
