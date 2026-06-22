# 📚 Knowledge Vault - Complete Documentation

A production-ready document management and RAG (Retrieval-Augmented Generation) system for ai_nexus platform.

## 🚀 Features

### Document Management
- ✅ **Multi-format Support**: PDF, DOCX, TXT, CSV
- ✅ **Drag-and-Drop Upload**: Intuitive file uploader with preview
- ✅ **Collections**: Personal, Workspace, Shared
- ✅ **File Operations**: Upload, rename, delete, reprocess
- ✅ **Processing Status**: Real-time tracking (pending, processing, completed, failed)
- ✅ **Metadata Extraction**: Page count, word count, author, etc.
- ✅ **Tags & Search**: Organize and find files easily

### Semantic Search
- ✅ **Vector Embeddings**: OpenAI text-embedding-ada-002
- ✅ **Similarity Search**: Cosine similarity scoring
- ✅ **Source Citations**: Track where information comes from
- ✅ **Threshold Filtering**: Configurable relevance threshold
- ✅ **Multi-file Search**: Search across selected or all documents

### RAG-Powered Chat
- ✅ **Context-Aware**: Answers based on your documents
- ✅ **Source Citations**: Every answer shows sources
- ✅ **Session Management**: Continue conversations
- ✅ **Token Tracking**: Monitor API usage
- ✅ **Smart Chunking**: Semantic text splitting

### Architecture
- ✅ **Service Layer**: Clean separation of concerns
- ✅ **Async Processing**: Non-blocking file processing
- ✅ **Caching**: Embedding cache for performance
- ✅ **Error Handling**: Comprehensive error management
- ✅ **MongoDB**: Efficient document storage with indexes

## 📦 Installation

### Backend Dependencies

The following packages are required and have been installed:

```bash
cd server
npm install pdf-parse mammoth papaparse
```

**Package Purposes:**
- `pdf-parse` - Extract text from PDF files
- `mammoth` - Extract text from DOCX files
- `papaparse` - Parse CSV files

### Frontend Dependencies

All required packages are already installed:
- `react-dropzone` - Drag-and-drop file upload
- `axios` - HTTP requests
- `framer-motion` - Animations

## 🏗️ Architecture

### Backend Structure

```
server/
├── models/
│   ├── KnowledgeFile.js        # File metadata
│   ├── Chunk.js                # Text chunks
│   ├── Embedding.js            # Vector embeddings
│   └── ChatSession.js          # Chat history
├── services/
│   ├── textExtractor.js        # Extract text from files
│   ├── chunkingService.js      # Split text into chunks
│   ├── embeddingService.js     # Generate embeddings
│   ├── knowledgeProcessingService.js  # Main processing
│   └── ragService.js           # RAG pipeline
├── controllers/
│   └── knowledgeController.js  # API handlers
├── routes/
│   └── knowledgeRoutes.js      # API routes
└── middlewares/
    └── knowledgeUpload.js      # File upload handler
```

### Frontend Structure

```
src/
├── components/
│   └── knowledge/
│       ├── FileUploader.jsx    # Drag-and-drop uploader
│       ├── FileCard.jsx        # File display card
│       └── ChatInterface.jsx   # Chat UI
├── pages/
│   └── knowledge-vault.jsx     # Main page
└── store/
    └── slices/
        └── knowledgeSlice.js   # Redux state
```

## 🔄 Processing Pipeline

### Upload Flow

```
1. User uploads file
   ↓
2. File saved to disk
   ↓
3. KnowledgeFile record created (status: pending)
   ↓
4. Async processing starts
   ↓
5. Text extraction (PDF/DOCX/TXT/CSV)
   ↓
6. Text chunking (semantic splitting)
   ↓
7. Chunk records created
   ↓
8. Generate embeddings (batch processing)
   ↓
9. Embedding records created
   ↓
10. File status updated (completed)
```

### RAG Pipeline

```
1. User asks question
   ↓
2. Generate query embedding
   ↓
3. Semantic search (cosine similarity)
   ↓
4. Retrieve top N chunks (default: 5)
   ↓
5. Build context from chunks
   ↓
6. Create LLM prompt with context
   ↓
7. Call LLM API
   ↓
8. Return answer with source citations
   ↓
9. Save to chat session
```

## 📊 Database Schema

### KnowledgeFile Collection

```javascript
{
  _id: ObjectId,
  filename: String,           // Stored filename
  originalName: String,       // User's filename
  fileType: String,          // pdf, docx, txt, csv
  fileSize: Number,          // Bytes
  filePath: String,          // Server path
  collection: String,        // personal, workspace, shared
  owner: ObjectId,           // User reference
  sharedWith: [{
    user: ObjectId,
    permission: String       // view, edit
  }],
  metadata: {
    pageCount: Number,
    wordCount: Number,
    author: String,
    createdDate: Date,
    language: String
  },
  processingStatus: String,  // pending, processing, completed, failed
  processingError: String,
  chunkCount: Number,
  embeddingModel: String,
  totalTokens: Number,
  tags: [String],
  isPublic: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Chunk Collection

```javascript
{
  _id: ObjectId,
  file: ObjectId,            // KnowledgeFile reference
  content: String,           // Text content (max 8000 chars)
  chunkIndex: Number,        // Order in document
  startOffset: Number,
  endOffset: Number,
  tokenCount: Number,
  metadata: {
    pageNumber: Number,
    sectionTitle: String,
    paragraphIndex: Number
  },
  embedding: ObjectId,       // Embedding reference
  createdAt: Date,
  updatedAt: Date
}
```

### Embedding Collection

```javascript
{
  _id: ObjectId,
  chunk: ObjectId,           // Chunk reference
  file: ObjectId,            // KnowledgeFile reference
  vector: [Number],          // 1536 dimensions
  model: String,             // text-embedding-ada-002
  dimensions: Number,        // 1536
  createdAt: Date,
  updatedAt: Date
}
```

### ChatSession Collection

```javascript
{
  _id: ObjectId,
  user: ObjectId,            // User reference
  files: [ObjectId],         // KnowledgeFile references
  title: String,
  messages: [{
    role: String,            // user, assistant, system
    content: String,
    sources: [{
      chunk: ObjectId,
      file: ObjectId,
      similarity: Number,
      content: String
    }],
    timestamp: Date,
    tokenUsage: {
      prompt: Number,
      completion: Number,
      total: Number
    }
  }],
  totalTokens: Number,
  model: String,             // gpt-4
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

## 🔌 API Endpoints

### File Operations

**Upload File**
```http
POST /api/v1/knowledge/upload
Content-Type: multipart/form-data
Authorization: Bearer {token}

Form Data:
- file: File (required)
- collection: String (personal, workspace, shared)
- tags: JSON array of strings

Response:
{
  "success": true,
  "message": "File uploaded successfully",
  "data": { ...file object }
}
```

**Get Files**
```http
GET /api/v1/knowledge/files?page=1&limit=20&collection=personal&status=completed
Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": [ ...files ],
  "pagination": {
    "total": 50,
    "page": 1,
    "limit": 20,
    "pages": 3
  }
}
```

**Get Single File**
```http
GET /api/v1/knowledge/files/:id
Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": { ...file object }
}
```

**Update File**
```http
PATCH /api/v1/knowledge/files/:id
Authorization: Bearer {token}
Content-Type: application/json

Body:
{
  "originalName": "New name.pdf",
  "collection": "workspace",
  "tags": ["important", "project-x"],
  "isPublic": false
}

Response:
{
  "success": true,
  "data": { ...updated file }
}
```

**Delete File**
```http
DELETE /api/v1/knowledge/files/:id
Authorization: Bearer {token}

Response:
{
  "success": true,
  "message": "File deleted successfully"
}
```

**Reprocess File**
```http
POST /api/v1/knowledge/files/:id/reprocess
Authorization: Bearer {token}

Response:
{
  "success": true,
  "message": "File reprocessing started"
}
```

### Search & Chat

**Semantic Search**
```http
POST /api/v1/knowledge/search
Authorization: Bearer {token}
Content-Type: application/json

Body:
{
  "query": "What is machine learning?",
  "fileIds": ["file_id_1", "file_id_2"],  // Optional
  "limit": 10,                             // Optional, default: 10
  "threshold": 0.7                         // Optional, default: 0.7
}

Response:
{
  "success": true,
  "data": [
    {
      "chunkId": "...",
      "fileId": "...",
      "filename": "ml-guide.pdf",
      "content": "Machine learning is...",
      "similarity": 0.89,
      "metadata": { ... }
    }
  ]
}
```

**Chat with Documents**
```http
POST /api/v1/knowledge/chat
Authorization: Bearer {token}
Content-Type: application/json

Body:
{
  "message": "Explain the main concepts",
  "sessionId": "...",      // Optional, for continuing conversation
  "fileIds": ["..."]       // Optional, specific files to query
}

Response:
{
  "success": true,
  "data": {
    "answer": "The main concepts are...",
    "sources": [
      {
        "chunkId": "...",
        "fileId": "...",
        "filename": "...",
        "content": "...",
        "similarity": 0.85
      }
    ],
    "tokenUsage": {
      "prompt": 250,
      "completion": 150,
      "total": 400
    },
    "sessionId": "..."
  }
}
```

**Get Chat Sessions**
```http
GET /api/v1/knowledge/chat/sessions?limit=20
Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": [ ...chat sessions ]
}
```

**Get Chat Session**
```http
GET /api/v1/knowledge/chat/sessions/:id
Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": { ...chat session with full message history }
}
```

**Delete Chat Session**
```http
DELETE /api/v1/knowledge/chat/sessions/:id
Authorization: Bearer {token}

Response:
{
  "success": true,
  "message": "Chat session deleted"
}
```

**Get Statistics**
```http
GET /api/v1/knowledge/stats
Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": {
    "totalFiles": 25,
    "totalChunks": 450,
    "totalTokens": 125000,
    "byStatus": {
      "pending": 1,
      "processing": 2,
      "completed": 22,
      "failed": 0
    },
    "byCollection": {
      "personal": 15,
      "workspace": 8,
      "shared": 2
    },
    "byType": {
      "pdf": 18,
      "docx": 5,
      "txt": 1,
      "csv": 1
    }
  }
}
```

## 🎯 Usage Examples

### 1. Upload a Document

```javascript
// Frontend
const file = document.querySelector('input[type="file"]').files[0];
await dispatch(uploadFile({ 
  file, 
  collection: 'personal',
  tags: ['research', 'ai']
}));
```

### 2. Search Documents

```javascript
// Semantic search
const results = await dispatch(searchKnowledge({
  query: 'What is neural network architecture?',
  fileIds: ['file_id_1', 'file_id_2'],
  limit: 5,
  threshold: 0.7
}));

// Results will show relevant chunks with similarity scores
```

### 3. Chat with Documents

```javascript
// Start a chat
const response = await dispatch(chatWithKnowledge({
  message: 'Summarize the main points from these documents',
  fileIds: ['file_id_1', 'file_id_2']
}));

// Continue conversation
const response2 = await dispatch(chatWithKnowledge({
  message: 'Can you elaborate on the first point?',
  sessionId: response.sessionId,
  fileIds: ['file_id_1', 'file_id_2']
}));
```

## ⚙️ Configuration

### OpenAI API Key

Add to `server/.env`:

```env
OPENAI_API_KEY=sk-your-api-key-here
```

**Note**: Without an API key, the system uses mock embeddings and responses for development.

### Chunking Configuration

In `chunkingService.js`, adjust:

```javascript
// Default settings
const chunkSize = 1000;      // Characters per chunk
const overlap = 200;         // Character overlap between chunks
const strategy = 'semantic'; // 'semantic' or 'fixed'
```

### Embedding Configuration

In `embeddingService.js`:

```javascript
this.model = 'text-embedding-ada-002';  // OpenAI model
this.dimensions = 1536;                 // Vector dimensions
```

### Search Configuration

In RAG service:

```javascript
const defaultLimit = 5;        // Top N results
const defaultThreshold = 0.7;  // Minimum similarity (0-1)
```

## 🔒 Security

### Authentication
- All routes require JWT authentication
- User can only access their own files
- Public files are accessible to all users
- Shared files respect permissions

### File Upload
- File type validation (PDF, DOCX, TXT, CSV only)
- File size limit: 50MB
- Sanitized filenames
- Secure file storage

### API Security
- Rate limiting: 100 requests/15 min (standard)
- Input validation with Zod
- MongoDB injection prevention
- Error message sanitization

### Data Privacy
- Files stored per user
- Embeddings linked to files and users
- Chat sessions are private
- No cross-user data leakage

## 📈 Performance

### Optimizations

1. **Batch Embedding Generation**
   - Process up to 20 chunks per API call
   - Reduces API calls by 95%

2. **Embedding Cache**
   - In-memory cache for repeated queries
   - Reduces API costs

3. **Database Indexes**
   ```javascript
   // KnowledgeFile indexes
   { owner: 1, createdAt: -1 }
   { collection: 1, owner: 1 }
   { processingStatus: 1 }
   
   // Embedding indexes
   { file: 1 }
   { chunk: 1 }
   
   // Chunk indexes
   { file: 1, chunkIndex: 1 }
   ```

4. **Async Processing**
   - File processing happens in background
   - Non-blocking API responses

### Scalability

- **Horizontal Scaling**: Stateless API design
- **Database Sharding**: MongoDB supports sharding
- **Caching Layer**: Redis can be added for distributed caching
- **CDN**: Static files can be served via CDN

## 🧪 Testing

### Test Upload

1. Start backend: `cd server && npm run dev`
2. Start frontend: `npm start`
3. Navigate to `/knowledge-vault`
4. Click "Upload" tab
5. Drag and drop a PDF file
6. Check processing status in "Files" tab

### Test Search

1. Wait for file processing to complete
2. Go to "Search" tab
3. Enter query: "What is this document about?"
4. View semantic search results with similarity scores

### Test Chat

1. Go to "Chat" tab
2. Ask: "Summarize the key points"
3. View AI response with source citations
4. Continue conversation

## 🐛 Troubleshooting

### File Upload Fails

**Issue**: File upload returns error

**Solutions**:
- Check file size (max 50MB)
- Verify file type (PDF, DOCX, TXT, CSV)
- Ensure `uploads/knowledge` directory exists
- Check disk space

### Processing Stuck

**Issue**: File stuck in "processing" status

**Solutions**:
- Check server logs for errors
- Verify file is readable
- Check OpenAI API key (if using real embeddings)
- Try reprocessing: `POST /api/knowledge/files/:id/reprocess`

### Search Returns No Results

**Issue**: Semantic search returns empty

**Solutions**:
- Ensure files are "completed" status
- Check if files have chunks (chunkCount > 0)
- Lower similarity threshold (try 0.5)
- Verify embeddings were generated

### Chat Not Working

**Issue**: Chat returns generic response

**Solutions**:
- Check OpenAI API key configuration
- Verify files are processed (status: completed)
- Ensure embeddings exist
- Check server logs for API errors

## 🚀 Production Deployment

### Environment Variables

```env
# Required
MONGODB_URI=mongodb://production-host:27017/ai_nexus
JWT_SECRET=your_production_secret
OPENAI_API_KEY=sk-your-production-key

# Optional
NODE_ENV=production
PORT=5000
```

### Pre-deployment Checklist

- [ ] Set production MongoDB URI
- [ ] Configure OpenAI API key
- [ ] Set secure JWT secret
- [ ] Enable HTTPS
- [ ] Configure CORS for production domain
- [ ] Set up file storage (consider S3)
- [ ] Configure rate limiting
- [ ] Set up monitoring (PM2, New Relic)
- [ ] Enable logging aggregation
- [ ] Set up backups

### Recommended Infrastructure

```
┌─────────────┐
│   Nginx     │ (Reverse proxy, SSL)
└──────┬──────┘
       │
┌──────▼──────┐
│  Node.js    │ (API server)
│  Cluster    │ (Multiple instances)
└──────┬──────┘
       │
┌──────▼──────┐
│  MongoDB    │ (Replica set)
│  Atlas      │ (Managed)
└─────────────┘
```

## 💡 Best Practices

### For Users

1. **Organize Files**: Use collections and tags
2. **Check Processing**: Wait for "completed" status
3. **Specific Queries**: Better search results
4. **Cite Sources**: Verify AI responses against sources
5. **Delete Unused**: Keep vault clean

### For Developers

1. **Error Handling**: Always wrap async operations
2. **Validation**: Validate all inputs
3. **Logging**: Log important events
4. **Testing**: Test with various file types
5. **Monitoring**: Track API usage and costs

## 🔮 Future Enhancements

Potential improvements (not yet implemented):

- [ ] Vector database (Pinecone, Weaviate)
- [ ] OCR for scanned PDFs
- [ ] Multi-language support
- [ ] Collaborative annotations
- [ ] Workflow automation
- [ ] Export chat transcripts
- [ ] Advanced analytics
- [ ] Bulk operations
- [ ] File versioning
- [ ] Integration with external storage (S3, Google Drive)

## 📄 License

Part of ai_nexus platform. All rights reserved.

---

**Built with ❤️ using React, Node.js, MongoDB, and OpenAI**
