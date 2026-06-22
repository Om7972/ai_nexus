# 🏗️ Knowledge Vault - Architecture Diagram

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                      KNOWLEDGE VAULT SYSTEM                      │
└─────────────────────────────────────────────────────────────────┘

┌────────────────────────────┐         ┌────────────────────────────┐
│      FRONTEND (React)      │         │    BACKEND (Node.js)       │
│                            │         │                            │
│  ┌──────────────────────┐  │         │  ┌──────────────────────┐  │
│  │  Knowledge Vault     │  │         │  │  Knowledge Routes    │  │
│  │  - Upload Tab        │  │         │  │  - Upload            │  │
│  │  - Files Tab         │  │         │  │  - CRUD              │  │
│  │  - Search Tab        │  │         │  │  - Search            │  │
│  │  - Chat Tab          │  │  HTTP   │  │  - Chat              │  │
│  └──────────────────────┘  │  ◄────► │  └──────────────────────┘  │
│           │                 │  REST   │           │                 │
│           ▼                 │   API   │           ▼                 │
│  ┌──────────────────────┐  │         │  ┌──────────────────────┐  │
│  │  Redux Store         │  │         │  │  Processing Service  │  │
│  │  - knowledgeSlice    │  │         │  │  - Extract Text      │  │
│  │  - Files             │  │         │  │  - Chunk Text        │  │
│  │  - Search Results    │  │         │  │  - Generate Vectors  │  │
│  │  - Chat Sessions     │  │         │  │  - Store Data        │  │
│  └──────────────────────┘  │         │  └──────────────────────┘  │
│                            │         │           │                 │
│  ┌──────────────────────┐  │         │           ▼                 │
│  │  Components          │  │         │  ┌──────────────────────┐  │
│  │  - FileUploader      │  │         │  │  RAG Service         │  │
│  │  - FileCard          │  │         │  │  - Semantic Search   │  │
│  │  - ChatInterface     │  │         │  │  - Context Builder   │  │
│  └──────────────────────┘  │         │  │  - LLM Integration   │  │
│                            │         │  └──────────────────────┘  │
└────────────────────────────┘         └───────────┼─────────────────┘
                                                   │
                    ┌──────────────────────────────┼──────────────┐
                    │                              │              │
                    ▼                              ▼              ▼
        ┌────────────────────┐        ┌────────────────┐  ┌─────────────┐
        │   MongoDB          │        │  OpenAI API    │  │ File System │
        │                    │        │                │  │             │
        │  ┌──────────────┐  │        │  Embeddings    │  │  uploads/   │
        │  │ Files        │  │        │  text-embed... │  │  knowledge/ │
        │  │ Chunks       │  │        │                │  │             │
        │  │ Embeddings   │  │        │  Chat          │  │  *.pdf      │
        │  │ ChatSessions │  │        │  gpt-4         │  │  *.docx     │
        │  └──────────────┘  │        └────────────────┘  │  *.txt      │
        └────────────────────┘                            │  *.csv      │
                                                          └─────────────┘
```

## Component Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND LAYERS                           │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                        PRESENTATION                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ FileUploader │  │   FileCard   │  │ ChatInterface│          │
│  │              │  │              │  │              │          │
│  │ - Dropzone   │  │ - Metadata   │  │ - Messages   │          │
│  │ - Progress   │  │ - Actions    │  │ - Input      │          │
│  │ - Validation │  │ - Status     │  │ - Sources    │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                      CONTAINER / PAGE                            │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    knowledge-vault.jsx                    │   │
│  │                                                           │   │
│  │  - Tabs (Files, Upload, Search, Chat)                    │   │
│  │  - State Management (local)                              │   │
│  │  - Event Handlers                                        │   │
│  │  - Redux Dispatchers                                     │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                        STATE LAYER                               │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    knowledgeSlice.js                      │   │
│  │                                                           │   │
│  │  State:                                                   │   │
│  │  - files: []                                              │   │
│  │  - searchResults: []                                      │   │
│  │  - currentChat: null                                      │   │
│  │  - statistics: {}                                         │   │
│  │                                                           │   │
│  │  Actions:                                                 │   │
│  │  - uploadFile, fetchFiles, deleteFile                    │   │
│  │  - searchKnowledge, chatWithKnowledge                    │   │
│  │  - fetchStatistics                                        │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                        API LAYER                                 │
│  Axios HTTP requests to backend                                 │
└─────────────────────────────────────────────────────────────────┘
```

```
┌─────────────────────────────────────────────────────────────────┐
│                        BACKEND LAYERS                            │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                        ROUTES LAYER                              │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                   knowledgeRoutes.js                      │   │
│  │                                                           │   │
│  │  - POST /upload          → uploadFile                    │   │
│  │  - GET  /files           → getFiles                      │   │
│  │  - DELETE /files/:id     → deleteFile                    │   │
│  │  - POST /search          → searchKnowledge               │   │
│  │  - POST /chat            → chatWithKnowledge             │   │
│  │  - GET  /stats           → getStatistics                 │   │
│  │                                                           │   │
│  │  Middleware: protect (JWT), validate (Zod)               │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                      CONTROLLER LAYER                            │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                 knowledgeController.js                    │   │
│  │                                                           │   │
│  │  - Request validation                                     │   │
│  │  - Call services                                          │   │
│  │  - Format responses                                       │   │
│  │  - Error handling                                         │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                       SERVICE LAYER                              │
│  ┌──────────────────┐  ┌──────────────────┐                    │
│  │ Processing       │  │  RAG Service     │                    │
│  │ Service          │  │                  │                    │
│  │                  │  │  - Search        │                    │
│  │ - processFile    │  │  - buildContext  │                    │
│  │ - deleteFile     │  │  - chat          │                    │
│  │ - reprocessFile  │  │  - callLLM       │                    │
│  └────────┬─────────┘  └──────────────────┘                    │
│           │                                                     │
│           ▼                                                     │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────┐ │
│  │ Text Extractor   │  │  Chunking        │  │ Embedding    │ │
│  │                  │  │  Service         │  │ Service      │ │
│  │ - PDF            │  │                  │  │              │ │
│  │ - DOCX           │  │  - Semantic      │  │ - OpenAI     │ │
│  │ - TXT            │  │  - Fixed         │  │ - Caching    │ │
│  │ - CSV            │  │  - Overlap       │  │ - Batch      │ │
│  └──────────────────┘  └──────────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                        MODEL LAYER                               │
│  ┌──────────────┐  ┌──────────┐  ┌──────────┐  ┌────────────┐  │
│  │KnowledgeFile│  │  Chunk   │  │Embedding │  │ChatSession │  │
│  │             │  │          │  │          │  │            │  │
│  │- metadata   │  │- content │  │- vector  │  │- messages  │  │
│  │- status     │  │- tokens  │  │- model   │  │- sources   │  │
│  │- chunks     │  │- file    │  │- chunk   │  │- tokens    │  │
│  └──────────────┘  └──────────┘  └──────────┘  └────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow Diagrams

### Upload Flow

```
User Drops File
      │
      ▼
┌─────────────────┐
│ FileUploader    │
│ Component       │
└────────┬────────┘
         │
         │ dispatch(uploadFile)
         ▼
┌─────────────────┐
│ Redux Thunk     │
│ uploadFile      │
└────────┬────────┘
         │
         │ POST /api/v1/knowledge/upload
         ▼
┌─────────────────┐
│ Multer          │
│ Middleware      │
│ (save to disk)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ uploadFile      │
│ Controller      │
└────────┬────────┘
         │
         │ Create KnowledgeFile record
         ▼
┌─────────────────┐
│ MongoDB         │
│ (pending)       │
└────────┬────────┘
         │
         │ Trigger async processing
         ▼
┌─────────────────┐
│ Processing      │
│ Service         │
├─────────────────┤
│ 1. Extract text │
│ 2. Chunk text   │
│ 3. Generate     │
│    embeddings   │
│ 4. Store        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ MongoDB         │
│ (completed)     │
│ - Chunks        │
│ - Embeddings    │
└─────────────────┘
```

### Search Flow

```
User Enters Query
      │
      ▼
┌─────────────────┐
│ Search Input    │
└────────┬────────┘
         │
         │ dispatch(searchKnowledge)
         ▼
┌─────────────────┐
│ Redux Thunk     │
└────────┬────────┘
         │
         │ POST /api/v1/knowledge/search
         ▼
┌─────────────────┐
│ searchKnowledge │
│ Controller      │
└────────┬────────┘
         │
         │ ragService.semanticSearch()
         ▼
┌─────────────────┐
│ RAG Service     │
├─────────────────┤
│ 1. Generate     │
│    query vector │
│ 2. Find similar │
│    embeddings   │
│ 3. Score &      │
│    rank         │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Embedding       │
│ Model           │
│ (cosine sim)    │
└────────┬────────┘
         │
         │ Top N results
         ▼
┌─────────────────┐
│ Frontend        │
│ (display)       │
└─────────────────┘
```

### Chat Flow

```
User Sends Message
      │
      ▼
┌─────────────────┐
│ ChatInterface   │
└────────┬────────┘
         │
         │ dispatch(chatWithKnowledge)
         ▼
┌─────────────────┐
│ Redux Thunk     │
└────────┬────────┘
         │
         │ POST /api/v1/knowledge/chat
         ▼
┌─────────────────┐
│ chatWith...     │
│ Controller      │
└────────┬────────┘
         │
         │ ragService.chat()
         ▼
┌─────────────────┐
│ RAG Service     │
├─────────────────┤
│ 1. Search       │
│    relevant     │
│    chunks       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Semantic Search │
│ (top 5 chunks)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Build Context   │
│ - System prompt │
│ - Sources       │
│ - History       │
│ - Question      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ OpenAI API      │
│ (GPT-4)         │
└────────┬────────┘
         │
         │ AI response
         ▼
┌─────────────────┐
│ Parse & Format  │
│ - Answer        │
│ - Sources       │
│ - Tokens        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Save to Session │
│ MongoDB         │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Return to User  │
│ with citations  │
└─────────────────┘
```

## Vector Similarity Search

```
Query: "What is machine learning?"
   │
   ▼
┌────────────────────────────────────┐
│ Generate Query Embedding           │
│ Vector: [0.12, -0.45, 0.89, ...]  │
│ Dimensions: 1536                   │
└───────────────┬────────────────────┘
                │
                ▼
┌────────────────────────────────────┐
│ Fetch All Embeddings from MongoDB  │
│ Filter by fileIds (optional)       │
└───────────────┬────────────────────┘
                │
                ▼
┌────────────────────────────────────┐
│ Calculate Cosine Similarity        │
│                                    │
│ For each embedding:                │
│   similarity = dot(query, emb)     │
│              / (||query|| * ||emb||)│
└───────────────┬────────────────────┘
                │
                ▼
┌────────────────────────────────────┐
│ Filter by Threshold (0.7)          │
│ Keep only: similarity >= 0.7       │
└───────────────┬────────────────────┘
                │
                ▼
┌────────────────────────────────────┐
│ Sort by Similarity (desc)          │
│ Take Top N (default: 5)            │
└───────────────┬────────────────────┘
                │
                ▼
┌────────────────────────────────────┐
│ Return Results:                    │
│ [                                  │
│   {                                │
│     chunk: "Machine learning is...",
│     file: "ml-guide.pdf",         │
│     similarity: 0.89              │
│   },                               │
│   ...                              │
│ ]                                  │
└────────────────────────────────────┘
```

## Database Relationships

```
┌──────────────┐
│     User     │
│              │
│  _id         │
│  email       │
└──────┬───────┘
       │
       │ owner (1:N)
       │
       ▼
┌──────────────────┐
│  KnowledgeFile   │◄──────┐
│                  │       │
│  _id             │       │
│  filename        │       │
│  owner           │       │
│  processingStatus│       │
│  chunkCount      │       │
└──────┬───────────┘       │
       │                   │
       │ file (1:N)        │ file
       │                   │
       ▼                   │
┌──────────────────┐       │
│      Chunk       │       │
│                  │       │
│  _id             │       │
│  file            │───────┘
│  content         │
│  chunkIndex      │
│  tokenCount      │
└──────┬───────────┘
       │
       │ chunk (1:1)
       │
       ▼
┌──────────────────┐
│    Embedding     │
│                  │
│  _id             │
│  chunk           │
│  file            │
│  vector: [...]   │
│  dimensions      │
└──────────────────┘

┌──────────────┐
│     User     │
│              │
│  _id         │
└──────┬───────┘
       │
       │ user (1:N)
       │
       ▼
┌──────────────────┐
│   ChatSession    │
│                  │
│  _id             │
│  user            │
│  files: []       │
│  messages: []    │
│  totalTokens     │
└──────────────────┘
```

## Deployment Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                      PRODUCTION SETUP                         │
└──────────────────────────────────────────────────────────────┘

┌─────────────┐
│   Browser   │
└──────┬──────┘
       │ HTTPS
       ▼
┌─────────────────────┐
│  CDN / CloudFlare   │
│  (Static Assets)    │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│  Nginx / Apache     │
│  (Reverse Proxy)    │
│  - SSL/TLS          │
│  - Load Balancing   │
└──────┬──────────────┘
       │
       ├─────────────────┬─────────────────┐
       │                 │                 │
       ▼                 ▼                 ▼
┌────────────┐    ┌────────────┐    ┌────────────┐
│ Node.js    │    │ Node.js    │    │ Node.js    │
│ Instance 1 │    │ Instance 2 │    │ Instance 3 │
│            │    │            │    │            │
│ - API      │    │ - API      │    │ - API      │
│ - Services │    │ - Services │    │ - Services │
└─────┬──────┘    └─────┬──────┘    └─────┬──────┘
      │                 │                 │
      └─────────────────┼─────────────────┘
                        │
          ┌─────────────┼─────────────┐
          │             │             │
          ▼             ▼             ▼
   ┌────────────┐  ┌─────────┐  ┌─────────┐
   │  MongoDB   │  │ OpenAI  │  │ Redis   │
   │  Replica   │  │   API   │  │ Cache   │
   │    Set     │  │         │  │         │
   │            │  │         │  │         │
   │ - Primary  │  └─────────┘  └─────────┘
   │ - Secondary│
   │ - Arbiter  │
   └────────────┘
```

## Technology Stack

```
Frontend:
├── React 18 (UI Framework)
├── Redux Toolkit (State Management)
├── React Router DOM (Routing)
├── React Dropzone (File Upload)
├── Framer Motion (Animations)
├── Axios (HTTP Client)
├── Lucide React (Icons)
└── Tailwind CSS (Styling)

Backend:
├── Node.js 18+ (Runtime)
├── Express.js (Web Framework)
├── Mongoose (ODM)
├── Multer (File Upload)
├── pdf-parse (PDF Extraction)
├── mammoth (DOCX Extraction)
├── papaparse (CSV Parsing)
├── Zod (Validation)
├── jsonwebtoken (Auth)
├── express-rate-limit (Rate Limiting)
└── winston (Logging)

Database:
├── MongoDB (Document Store)
│   ├── KnowledgeFile Collection
│   ├── Chunk Collection
│   ├── Embedding Collection
│   └── ChatSession Collection

External APIs:
├── OpenAI Embeddings API
│   └── text-embedding-ada-002
└── OpenAI Chat API
    └── GPT-4
```

## Security Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      SECURITY LAYERS                         │
└─────────────────────────────────────────────────────────────┘

Request
   │
   ▼
┌─────────────────┐
│  HTTPS/TLS      │ ✅ Encrypted transport
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  CORS           │ ✅ Origin validation
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Rate Limiting  │ ✅ 100 req/15min
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  JWT Auth       │ ✅ Token validation
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Input          │ ✅ Zod validation
│  Validation     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  MongoDB        │ ✅ Injection prevention
│  Sanitization   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  File           │ ✅ Type & size checks
│  Validation     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Business       │ ✅ Authorization checks
│  Logic          │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Response       │ ✅ Error sanitization
└─────────────────┘
```

---

This architecture provides a robust, scalable foundation for the Knowledge Vault with clear separation of concerns, efficient data flow, and production-ready security.