# 🚀 Knowledge Vault - Quick Start Guide

## What Was Built

A complete **RAG-powered Knowledge Vault** with:

✅ **Document Upload** - PDF, DOCX, TXT, CSV support
✅ **Text Extraction** - Automated text extraction from all formats
✅ **Smart Chunking** - Semantic text splitting for better context
✅ **Vector Embeddings** - OpenAI embeddings for semantic search
✅ **Semantic Search** - Find relevant information across documents
✅ **RAG Chat** - AI-powered Q&A with source citations
✅ **Collections** - Personal, Workspace, Shared organization
✅ **File Management** - Upload, rename, delete, reprocess
✅ **Processing Pipeline** - Async background processing
✅ **Beautiful UI** - Modern glassmorphism design with animations

## 📂 Files Created

### Backend (12 files)

```
server/
├── models/
│   ├── KnowledgeFile.js        ✅ File metadata model
│   ├── Chunk.js                ✅ Text chunks model
│   ├── Embedding.js            ✅ Vector embeddings model
│   └── ChatSession.js          ✅ Chat history model
├── services/
│   ├── textExtractor.js        ✅ PDF/DOCX/TXT/CSV extraction
│   ├── chunkingService.js      ✅ Text chunking logic
│   ├── embeddingService.js     ✅ OpenAI embedding generation
│   ├── knowledgeProcessingService.js  ✅ Main processor
│   └── ragService.js           ✅ RAG pipeline
├── controllers/
│   └── knowledgeController.js  ✅ API endpoints
├── routes/
│   └── knowledgeRoutes.js      ✅ Route definitions
└── middlewares/
    └── knowledgeUpload.js      ✅ File upload handler
```

### Frontend (4 files)

```
src/
├── components/knowledge/
│   ├── FileUploader.jsx        ✅ Drag-and-drop uploader
│   ├── FileCard.jsx            ✅ File display component
│   └── ChatInterface.jsx       ✅ Chat UI
├── pages/
│   └── knowledge-vault.jsx     ✅ Main page
└── store/slices/
    └── knowledgeSlice.js       ✅ Redux state management
```

### Configuration

- ✅ Updated `server/app.js` - Added knowledge routes
- ✅ Updated `src/store/index.js` - Added knowledge reducer
- ✅ Updated `src/Routes.jsx` - Added /knowledge-vault route
- ✅ Installed npm packages: `pdf-parse`, `mammoth`, `papaparse`

## 🎯 How to Use

### 1. Start the Servers

**Backend:**
```bash
cd server
npm run dev
```

**Frontend:**
```bash
npm start
```

### 2. Access Knowledge Vault

Navigate to: `http://localhost:3000/knowledge-vault`

Or add to your dashboard navigation:
```jsx
<Link to="/knowledge-vault">
  <FileText size={24} />
  <span>Knowledge Vault</span>
</Link>
```

### 3. Upload Your First Document

1. Click **"Upload"** tab
2. Drag and drop a PDF, DOCX, TXT, or CSV file
3. File will be uploaded and processed automatically
4. Go to **"Files"** tab to see processing status

### 4. Try Semantic Search

1. Wait for file to show "Completed" status
2. Click **"Search"** tab
3. Enter a question: "What are the main topics?"
4. View results with similarity scores and source excerpts

### 5. Chat with Your Documents

1. Click **"Chat"** tab
2. Ask: "Summarize the key points from my documents"
3. Get AI-powered answer with source citations
4. Continue the conversation!

## 🔑 API Key Configuration

### For Production Use

Add to `server/.env`:

```env
OPENAI_API_KEY=sk-your-openai-api-key-here
```

**Get API Key**: https://platform.openai.com/api-keys

### For Development

Without an API key, the system uses mock embeddings and responses. This is fine for testing the UI and flow, but won't give real AI results.

## 📋 Supported File Formats

| Format | Extension | Max Size | Features |
|--------|-----------|----------|----------|
| PDF | .pdf | 50MB | Text extraction, page count |
| Word | .docx | 50MB | Text extraction, word count |
| Text | .txt | 50MB | Plain text, line count |
| CSV | .csv | 50MB | Structured data, row count |

## 🔄 Processing Flow

```
Upload File
    ↓
Extract Text (PDF/DOCX/TXT/CSV)
    ↓
Split into Chunks (1000 chars, semantic)
    ↓
Generate Embeddings (OpenAI)
    ↓
Store in Database
    ↓
Ready for Search & Chat!
```

Processing happens in the background. Status updates:
- **Pending** → Just uploaded
- **Processing** → Extracting and chunking
- **Completed** → Ready to use
- **Failed** → Check logs for errors

## 💬 Chat Features

### Source Citations

Every answer includes sources:
- Which document
- Similarity score
- Relevant excerpt

### Conversation Memory

Chat maintains context:
- Previous questions
- Previous answers
- Current session

### Smart Context

RAG pipeline:
1. Finds relevant chunks
2. Injects into LLM prompt
3. Generates answer
4. Cites sources

## 🎨 UI Features

### Files Tab
- Grid or list view
- Filter by collection, status, type
- File cards with metadata
- Quick actions (rename, delete)
- Processing status indicators

### Upload Tab
- Drag-and-drop interface
- Multi-file upload
- Progress indicators
- Success/error notifications
- Supported format hints

### Search Tab
- Natural language queries
- Similarity scoring
- Source highlighting
- Result ranking

### Chat Tab
- Message history
- Source citations
- Token usage tracking
- Copy responses
- Typing indicators

## 📊 Statistics Dashboard

View at a glance:
- Total files
- Total chunks
- Total tokens
- By status
- By collection
- By type

## 🔧 Common Tasks

### Rename a File

1. Go to Files tab
2. Click "..." menu on file card
3. Select "Rename"
4. Enter new name
5. Click "Save"

### Delete a File

1. Go to Files tab
2. Click "..." menu on file card
3. Select "Delete"
4. Confirm deletion

Note: This deletes the file, all chunks, embeddings, and references.

### Reprocess a File

If processing failed:

```bash
# Via API
POST /api/v1/knowledge/files/:id/reprocess
```

This will:
- Delete old chunks and embeddings
- Re-extract text
- Re-chunk content
- Re-generate embeddings

### Search Specific Files

In Chat or Search tab:
1. Select files you want to query
2. Your search/chat will only use those files

## 🎓 Tips & Best Practices

### Uploading

✅ **DO:**
- Use descriptive filenames
- Add relevant tags
- Choose correct collection
- Upload clean, readable documents

❌ **DON'T:**
- Upload password-protected PDFs
- Upload scanned images without OCR
- Upload extremely large files (>50MB)
- Upload corrupted files

### Searching

✅ **DO:**
- Ask specific questions
- Use natural language
- Try different phrasings
- Check similarity scores

❌ **DON'T:**
- Use very short queries (1-2 words)
- Expect perfect answers from minimal context
- Ignore similarity scores
- Search before processing completes

### Chatting

✅ **DO:**
- Provide context in your question
- Cite sources in important work
- Continue conversations for follow-ups
- Review sources for accuracy

❌ **DON'T:**
- Treat answers as 100% accurate
- Use for critical decisions without verification
- Share sensitive information
- Expect perfect grammar/formatting

## 🐛 Troubleshooting

### Upload Not Working

**Problem:** File won't upload

**Check:**
- File size < 50MB?
- Correct format (PDF, DOCX, TXT, CSV)?
- Internet connection?
- Server running?

**Solution:**
```bash
# Restart server
cd server
npm run dev
```

### Processing Failed

**Problem:** File stuck in "failed" status

**Check:**
- Check server console for errors
- Try simpler file first
- Verify file is readable

**Solution:**
```bash
# Reprocess the file
POST /api/v1/knowledge/files/:id/reprocess
```

### Search Returns Nothing

**Problem:** Search finds no results

**Check:**
- File processing completed?
- ChunkCount > 0?
- Embeddings generated?

**Solution:**
- Lower similarity threshold to 0.5
- Try broader queries
- Check if file has extractable text

### Chat Not Responding

**Problem:** Chat shows generic responses

**Check:**
- OpenAI API key configured?
- Files processed?
- Embeddings exist?

**Solution:**
1. Add API key to `.env`
2. Restart server
3. Try again

## 📈 Performance Tips

### For Better Results

1. **Quality Documents**: Upload well-formatted, clean documents
2. **Specific Questions**: Better questions = better answers
3. **Verify Sources**: Always check citations
4. **Chunk Size**: Default 1000 chars works well for most cases

### For Cost Optimization

1. **Batch Uploads**: Upload multiple files at once
2. **Caching**: Embedding cache reduces API calls
3. **Filter Files**: Search specific files, not all
4. **Monitor Tokens**: Track usage in chat responses

## 🔐 Security Notes

- Files are private by default
- JWT authentication required
- No cross-user access
- Rate limiting enabled
- Input validation active
- File type restrictions enforced

## 🚀 Next Steps

Now that you have Knowledge Vault running:

1. **Upload documents** - Start building your knowledge base
2. **Try search** - Test semantic search capabilities
3. **Chat with docs** - Experience RAG in action
4. **Organize files** - Use collections and tags
5. **Monitor usage** - Check statistics dashboard

## 📚 Additional Resources

- **Full Documentation**: `KNOWLEDGE_VAULT_README.md`
- **API Reference**: See README for all endpoints
- **Architecture**: See README for detailed diagrams
- **OpenAI Docs**: https://platform.openai.com/docs

## ⚠️ Important Notes

### Development vs Production

**Development (Without API Key):**
- Uses mock embeddings
- Uses mock AI responses
- Good for testing UI/UX
- No real semantic search
- No real AI chat

**Production (With API Key):**
- Real OpenAI embeddings
- Real GPT-4 responses
- Actual semantic search
- Accurate source matching
- Costs apply per token

### API Costs

OpenAI API costs (approximate):
- **Embeddings**: $0.0001 per 1K tokens
- **GPT-4**: $0.03 per 1K prompt tokens, $0.06 per 1K completion tokens

Example:
- 100-page PDF → ~100,000 tokens → ~$0.01 to embed
- 10 chat messages → ~5,000 tokens → ~$0.15-0.30

Monitor usage in chat responses!

## ✅ Success Checklist

- [ ] Backend server running
- [ ] Frontend server running
- [ ] Can access `/knowledge-vault`
- [ ] Can upload a file
- [ ] File processes successfully
- [ ] Can search documents
- [ ] Can chat with documents
- [ ] Source citations appear
- [ ] Can rename/delete files

## 🎉 You're Ready!

You now have a fully functional Knowledge Vault with:
- ✅ Document management
- ✅ Semantic search
- ✅ RAG-powered chat
- ✅ Source citations
- ✅ Beautiful UI

**Start uploading and exploring!**

---

Need help? Check `KNOWLEDGE_VAULT_README.md` for detailed documentation.

Built with ❤️ by Kiro AI
