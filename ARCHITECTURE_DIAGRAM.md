# 🏗️ AI Agent Builder - Architecture Diagram

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         AI AGENT BUILDER                             │
└─────────────────────────────────────────────────────────────────────┘

┌────────────────────────────┐          ┌────────────────────────────┐
│       FRONTEND (React)     │          │    BACKEND (Node.js)       │
│                            │          │                            │
│  ┌──────────────────────┐  │          │  ┌──────────────────────┐  │
│  │   Workflows List     │  │          │  │   Workflow Routes    │  │
│  │  - Search/Filter     │  │          │  │  - Authentication    │  │
│  │  - Create/Delete     │  │          │  │  - Validation        │  │
│  │  - Pagination        │  │          │  │  - Rate Limiting     │  │
│  └──────────────────────┘  │          │  └──────────────────────┘  │
│           │                 │          │           │                 │
│           ▼                 │          │           ▼                 │
│  ┌──────────────────────┐  │   HTTP   │  ┌──────────────────────┐  │
│  │   Agent Builder      │  │  ◄─────► │  │  Workflow Controller │  │
│  │  - React Flow Canvas │  │   REST   │  │  - CRUD Operations   │  │
│  │  - Node Palette      │  │    API   │  │  - Execute Workflow  │  │
│  │  - Config Panel      │  │          │  │  - Version Control   │  │
│  │  - Logs Panel        │  │          │  └──────────────────────┘  │
│  │  - Sidebar           │  │          │           │                 │
│  └──────────────────────┘  │          │           ▼                 │
│           │                 │          │  ┌──────────────────────┐  │
│           ▼                 │          │  │  Workflow Engine     │  │
│  ┌──────────────────────┐  │          │  │  - Node Traversal    │  │
│  │   Redux Store        │  │          │  │  - Data Flow         │  │
│  │  - workflowSlice     │  │          │  │  - Execution Logs    │  │
│  │  - State Management  │  │          │  │  - Error Handling    │  │
│  └──────────────────────┘  │          │  └──────────────────────┘  │
│                            │          │           │                 │
└────────────────────────────┘          └───────────┼─────────────────┘
                                                    │
                                                    ▼
                                        ┌────────────────────────┐
                                        │   MongoDB Database     │
                                        │                        │
                                        │  ┌──────────────────┐  │
                                        │  │   Workflows      │  │
                                        │  │  - Definition    │  │
                                        │  │  - Nodes/Edges   │  │
                                        │  └──────────────────┘  │
                                        │                        │
                                        │  ┌──────────────────┐  │
                                        │  │   Executions     │  │
                                        │  │  - Logs          │  │
                                        │  │  - Status        │  │
                                        │  └──────────────────┘  │
                                        │                        │
                                        │  ┌──────────────────┐  │
                                        │  │   Versions       │  │
                                        │  │  - History       │  │
                                        │  │  - Snapshots     │  │
                                        │  └──────────────────┘  │
                                        └────────────────────────┘
```

## Component Hierarchy

```
┌─────────────────────────────────────────────────────────────────┐
│                        agent-builder.jsx                         │
│                    (Main Container Component)                    │
│                                                                  │
│  ┌────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │  NodePalette   │  │   React Flow    │  │ WorkflowSidebar │  │
│  │                │  │                 │  │                 │  │
│  │  - User Input  │  │  Canvas Area    │  │  - Save         │  │
│  │  - Prompt      │  │  - Nodes        │  │  - Rename       │  │
│  │  - LLM         │  │  - Edges        │  │  - Duplicate    │  │
│  │  - Image Gen   │  │  - Controls     │  │  - Delete       │  │
│  │  - Condition   │  │  - Minimap      │  │  - Execute      │  │
│  │  - API         │  │  - Background   │  │  - Versions     │  │
│  │  - Output      │  │                 │  │  - Stats        │  │
│  └────────────────┘  └─────────────────┘  └─────────────────┘  │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │              NodeConfigPanel (Overlay)                      │ │
│  │              - Dynamic config based on node type            │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │            ExecutionLogsPanel (Bottom Drawer)               │ │
│  │            - Real-time logs                                 │ │
│  │            - Node execution status                          │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow Diagram

```
┌──────────────┐
│     User     │
└──────┬───────┘
       │
       ▼
┌──────────────────────────────────────────────────────────────┐
│                     USER ACTIONS                              │
│                                                               │
│  Create  │  Drag   │ Connect │ Configure │  Save  │ Execute  │
│ Workflow │  Nodes  │  Nodes  │   Nodes   │Workflow│ Workflow │
└────┬─────┴────┬────┴────┬────┴─────┬─────┴───┬────┴────┬────┘
     │          │         │          │         │         │
     ▼          ▼         ▼          ▼         ▼         ▼
┌─────────────────────────────────────────────────────────────┐
│                    REDUX ACTIONS                             │
│                                                              │
│ createWorkflow  updateNodes  updateEdges  saveWorkflow      │
│                              executeWorkflow                 │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                     API CALLS                                │
│                                                              │
│  POST /workflows       PATCH /workflows/:id                 │
│  POST /workflows/:id/execute                                │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                BACKEND PROCESSING                            │
│                                                              │
│  Validate ──► Process ──► Execute ──► Log ──► Respond       │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                DATABASE OPERATIONS                           │
│                                                              │
│  Save Workflow  │  Create Execution  │  Update Status       │
└─────────────────┴────────────────────┴─────────────────────┘
```

## Execution Flow

```
┌───────────────────────────────────────────────────────────────┐
│                  WORKFLOW EXECUTION FLOW                       │
└───────────────────────────────────────────────────────────────┘

1. User Clicks "Execute" Button
   │
   ▼
2. Prompt for Input Data
   │
   ▼
3. Dispatch executeWorkflow Action
   │
   ▼
4. POST /api/v1/workflows/:id/execute
   │
   ▼
5. Backend: Create WorkflowExecution Record
   │
   ▼
6. Backend: Start Workflow Engine
   │
   ├─► Find Start Node (User Input)
   │
   ├─► Execute Node
   │   │
   │   ├─► Log: "Executing node"
   │   ├─► Process node based on type
   │   ├─► Generate output
   │   └─► Store in context
   │
   ├─► Find Connected Nodes
   │
   ├─► For Each Connected Node:
   │   │
   │   ├─► Check conditions (if Condition Node)
   │   ├─► Execute node
   │   ├─► Pass data from previous nodes
   │   └─► Continue recursively
   │
   └─► Reach Output Node
       │
       ▼
7. Store Final Output
   │
   ▼
8. Update Execution Status
   │
   ▼
9. Return Execution ID to Frontend
   │
   ▼
10. Frontend: Start Polling
    │
    ├─► GET /executions/:id every 2 seconds
    ├─► Update logs panel
    ├─► Update node status
    └─► Stop when complete/failed
    │
    ▼
11. Show Final Results
```

## Node Type Processing

```
┌──────────────────────────────────────────────────────────────┐
│                   NODE TYPE PROCESSING                        │
└──────────────────────────────────────────────────────────────┘

User Input Node
│
├─► Receive: input
└─► Output: input data
    │
    ▼
Prompt Node
│
├─► Receive: input or previous node output
├─► Process: Replace {{variables}} in template
└─► Output: { prompt: "filled template" }
    │
    ▼
LLM Node
│
├─► Receive: prompt from previous node
├─► Process: Call AI model API (or mock)
└─► Output: { response: "AI generated text", model, prompt }
    │
    ▼
Image Generation Node
│
├─► Receive: prompt from previous node
├─► Process: Call image generation API (or mock)
└─► Output: { imageUrl: "url", prompt, model }
    │
    ▼
Condition Node
│
├─► Receive: data from previous node
├─► Process: Evaluate condition (equals, contains, etc.)
└─► Output: { result: true/false, branch: "true"/"false" }
    │
    ├─► Branch: true  ──► Follow "true" handle
    └─► Branch: false ──► Follow "false" handle
    │
    ▼
API Request Node
│
├─► Receive: data for request body
├─► Process: Make HTTP request
└─► Output: { status, data, headers }
    │
    ▼
Output Node
│
├─► Receive: data from previous node
├─► Process: Extract specified output
└─► Output: Final workflow result
```

## Security Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                     SECURITY LAYERS                           │
└──────────────────────────────────────────────────────────────┘

Frontend Request
    │
    ├─► Include JWT Token in Authorization Header
    │
    ▼
┌─────────────────────────────────────────────┐
│              Backend Security               │
│                                             │
│  1. Helmet (Security Headers)               │
│     └─► XSS Protection                      │
│     └─► CSRF Protection                     │
│     └─► Content Security Policy            │
│                                             │
│  2. CORS (Cross-Origin)                     │
│     └─► Allowed Origins                     │
│     └─► Credentials                         │
│                                             │
│  3. Rate Limiting                           │
│     └─► 100 req/15min (public)             │
│     └─► 1000 req/15min (authenticated)     │
│                                             │
│  4. JWT Authentication                      │
│     └─► Verify Token                        │
│     └─► Check Expiration                    │
│     └─► Extract User                        │
│                                             │
│  5. Input Validation (Zod)                  │
│     └─► Schema Validation                   │
│     └─► Type Checking                       │
│     └─► Sanitization                        │
│                                             │
│  6. MongoDB Sanitization                    │
│     └─► Prevent NoSQL Injection            │
│                                             │
│  7. Error Handling                          │
│     └─► Never Expose Stack Traces          │
│     └─► Generic Error Messages             │
└─────────────────────────────────────────────┘
    │
    ▼
Process Request
```

## State Management Flow

```
┌──────────────────────────────────────────────────────────────┐
│                   REDUX STATE FLOW                            │
└──────────────────────────────────────────────────────────────┘

Component Dispatches Action
    │
    ▼
┌─────────────────────────────────┐
│        workflowSlice            │
│                                 │
│  State:                         │
│  ├─ workflows: []               │
│  ├─ currentWorkflow: null       │
│  ├─ currentExecution: null      │
│  ├─ versions: []                │
│  ├─ pagination: {}              │
│  ├─ loading: false              │
│  └─ error: null                 │
│                                 │
│  Actions:                       │
│  ├─ fetchWorkflows (async)      │
│  ├─ createWorkflow (async)      │
│  ├─ updateWorkflow (async)      │
│  ├─ deleteWorkflow (async)      │
│  ├─ executeWorkflow (async)     │
│  ├─ fetchExecution (async)      │
│  └─ updateCurrentNodes (sync)   │
└─────────────────────────────────┘
    │
    ├─► Async Thunk makes API call
    │
    ├─► Updates loading state
    │
    ├─► On Success: Update state
    │
    ├─► On Error: Set error state
    │
    └─► Component Re-renders
```

## Database Schema Relationships

```
┌─────────────────────────────────────────────────────────────┐
│                 DATABASE RELATIONSHIPS                       │
└─────────────────────────────────────────────────────────────┘

┌──────────────┐
│     User     │
│  _id         │
│  email       │
│  name        │
└──────┬───────┘
       │
       │ owner (1:N)
       │
       ▼
┌──────────────────┐
│    Workflow      │
│  _id             │
│  name            │
│  nodes: []       │
│  edges: []       │
│  owner: User._id │
│  version         │
│  status          │
└──────┬───────────┘
       │
       ├──────────────────────┐
       │                      │
       │ (1:N)                │ (1:N)
       ▼                      ▼
┌──────────────────┐   ┌─────────────────┐
│ WorkflowVersion  │   │WorkflowExecution│
│  _id             │   │  _id            │
│  workflow        │   │  workflow       │
│  version         │   │  owner          │
│  nodes: []       │   │  status         │
│  edges: []       │   │  logs: []       │
│  changeLog       │   │  output         │
└──────────────────┘   └─────────────────┘

Indexes:
- workflows: owner, createdAt
- executions: workflow, createdAt
- versions: workflow, version
```

## File Dependencies

```
Frontend Dependencies
├── react (core)
├── react-dom
├── redux & @reduxjs/toolkit
├── react-router-dom
├── reactflow ◄─── Added for workflow canvas
├── framer-motion (animations)
├── tailwindcss (styling)
├── lucide-react (icons)
└── axios (API calls)

Backend Dependencies
├── express (server)
├── mongoose (database)
├── jsonwebtoken (auth)
├── bcryptjs (passwords)
├── zod (validation)
├── axios ◄─── Added for API requests
├── express-rate-limit
├── helmet (security)
├── winston (logging)
└── cors
```

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                  DEPLOYMENT DIAGRAM                          │
└─────────────────────────────────────────────────────────────┘

┌───────────────┐
│   Browser     │
└───────┬───────┘
        │
        │ HTTPS
        ▼
┌─────────────────────┐
│   Frontend Server   │
│   (Nginx/Vercel)    │
│   - React App       │
│   - Static Files    │
└───────┬─────────────┘
        │
        │ REST API
        ▼
┌─────────────────────┐
│   Backend Server    │
│   (Node.js/Express) │
│   - API Endpoints   │
│   - Workflow Engine │
│   - Auth Middleware │
└───────┬─────────────┘
        │
        │ Mongoose
        ▼
┌─────────────────────┐
│   MongoDB Atlas     │
│   - Workflows       │
│   - Executions      │
│   - Versions        │
└─────────────────────┘
```

---

## Key Architecture Decisions

### 1. React Flow for Canvas
**Why**: Industry-standard for node-based editors, handles complex interactions

### 2. Redux Toolkit for State
**Why**: Centralized state management, DevTools support, async handling

### 3. MongoDB for Storage
**Why**: Flexible schema for dynamic node data, good for nested documents

### 4. Service Layer Pattern
**Why**: Separates business logic from API routes, easier testing

### 5. Real-time Polling
**Why**: Simple implementation, works with existing REST API

### 6. JWT Authentication
**Why**: Stateless, scalable, already implemented in ai_nexus

---

This architecture provides a **solid foundation** for the AI Agent Builder while remaining flexible for future enhancements like WebSocket real-time updates, workflow sharing, and advanced analytics.
