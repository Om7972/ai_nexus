# 🚀 Quick Start: AI Agent Builder

## What Was Built

A complete **AI Agent Builder** module with:

✅ **Frontend** (React 18 + Vite + Redux Toolkit + Tailwind + Framer Motion)
- Drag-and-drop workflow canvas with React Flow
- 7 node types (User Input, Prompt, LLM, Image Gen, Condition, API, Output)
- Real-time execution logs
- Version history management
- Modern glassmorphism UI

✅ **Backend** (Node.js + Express + MongoDB)
- Complete REST API for workflows
- Workflow execution engine
- 3 MongoDB models (Workflow, WorkflowExecution, WorkflowVersion)
- JWT authentication & rate limiting
- Real-time execution tracking

## 📂 Files Created

### Frontend
```
src/
├── components/workflow/
│   ├── CustomNode.jsx              ✅ Custom workflow nodes
│   ├── NodeConfigPanel.jsx         ✅ Node configuration UI
│   ├── NodePalette.jsx             ✅ Draggable node palette
│   ├── WorkflowSidebar.jsx         ✅ Workflow management sidebar
│   └── ExecutionLogsPanel.jsx      ✅ Real-time logs viewer
├── pages/
│   ├── agent-builder.jsx           ✅ Main workflow builder
│   └── workflows-list.jsx          ✅ Workflows list page
└── store/slices/
    └── workflowSlice.js            ✅ Redux state management
```

### Backend
```
server/
├── models/
│   ├── Workflow.js                 ✅ Workflow schema
│   ├── WorkflowExecution.js        ✅ Execution tracking
│   └── WorkflowVersion.js          ✅ Version control
├── controllers/
│   └── workflowController.js       ✅ API controllers
├── routes/
│   └── workflowRoutes.js           ✅ API routes
├── services/
│   └── workflowEngine.js           ✅ Execution engine
└── utils/
    └── AppError.js                 ✅ Error handling
```

### Configuration
- ✅ Updated `server/app.js` - Added workflow routes
- ✅ Updated `src/store/index.js` - Added workflow reducer
- ✅ Updated `src/Routes.jsx` - Added new routes
- ✅ Installed `reactflow` npm package
- ✅ Installed `axios` in server

## 🎯 How to Use

### 1. Start the Backend

```bash
cd server
npm run dev
```

Server runs on `http://localhost:5000`

### 2. Start the Frontend

```bash
# In project root
npm start
```

Frontend runs on `http://localhost:3000`

### 3. Access the AI Agent Builder

Navigate to:
- **Workflows List**: `http://localhost:3000/workflows`
- **Agent Builder**: `http://localhost:3000/agent-builder`

Or add a link from your main dashboard.

## 🎨 Building Your First Workflow

### Step 1: Create New Workflow
1. Go to `/workflows`
2. Click "New Workflow"
3. You'll be redirected to the canvas

### Step 2: Add Nodes
Drag these nodes from the left palette:
1. **User Input** - Starting point
2. **Prompt Node** - Create a prompt
3. **LLM Node** - Get AI response
4. **Output Node** - Final output

### Step 3: Connect Nodes
- Click and drag from the bottom circle of one node
- Drop on the top circle of the next node
- Nodes will auto-connect with animated lines

### Step 4: Configure Nodes

**Prompt Node:**
```
Template: "Write a {{style}} poem about {{topic}}"
Variables:
- name: style, source: input.style
- name: topic, source: input.topic
```

**LLM Node:**
```
Model: GPT-4
Prompt Source: [previous_node_id].prompt
Temperature: 0.7
Max Tokens: 1000
```

**Output Node:**
```
Output Source: [llm_node_id].response
```

### Step 5: Save & Execute
1. Click "Save Workflow"
2. Click "Execute Workflow"
3. Enter input: `{"style": "romantic", "topic": "sunset"}`
4. View logs in real-time

## 🔄 Workflow Patterns

### Pattern 1: Simple AI Chat
```
User Input → Prompt Node → LLM Node → Output
```

### Pattern 2: Conditional Flow
```
User Input → LLM Node → Condition Node
                            ├─ True → Output A
                            └─ False → Output B
```

### Pattern 3: Multi-Step AI
```
User Input → Prompt 1 → LLM 1 → Prompt 2 → LLM 2 → Output
```

### Pattern 4: AI + API Integration
```
User Input → LLM Node → API Request → Output
```

### Pattern 5: Image Generation
```
User Input → Prompt Node → Image Gen Node → Output
```

## 🎮 Available Node Types

| Node | Purpose | Key Config |
|------|---------|-----------|
| 🧑 User Input | Receives workflow input | Input schema |
| 💬 Prompt Node | Creates dynamic prompts | Template + Variables |
| 🧠 LLM Node | Calls AI models | Model, Temperature, Tokens |
| 🖼️ Image Gen | Generates images | Model, Size, Prompt |
| 🔀 Condition | Branches logic | Operator, Operands |
| 🌐 API Request | HTTP requests | URL, Method, Headers |
| ✅ Output | Final result | Output source |

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/workflows` | Create workflow |
| GET | `/api/v1/workflows` | List workflows |
| GET | `/api/v1/workflows/:id` | Get workflow |
| PATCH | `/api/v1/workflows/:id` | Update workflow |
| DELETE | `/api/v1/workflows/:id` | Delete workflow |
| POST | `/api/v1/workflows/:id/duplicate` | Duplicate workflow |
| POST | `/api/v1/workflows/:id/execute` | Execute workflow |
| GET | `/api/v1/workflows/:id/versions` | Version history |
| GET | `/api/v1/workflows/executions/:id` | Execution details |

## 🎨 UI Features

### Glassmorphism Design
- Frosted glass effect with backdrop blur
- Semi-transparent backgrounds
- Smooth gradients
- Modern dark theme

### Animations
- Framer Motion for smooth transitions
- Node drag animations
- Panel slide-ins
- Hover effects

### Responsive
- Works on desktop, tablet, mobile
- Adaptive layouts
- Touch-friendly controls

## 🔧 Configuration

### Adding Navigation Link

Add this to your main dashboard:

```jsx
<Link to="/workflows" className="...">
  <GitBranch size={24} />
  <span>AI Agent Builder</span>
</Link>
```

### Environment Variables

Already configured in `server/.env`:
```
MONGODB_URI=mongodb://localhost:27017/ai_nexus
JWT_SECRET=your_jwt_secret
PORT=5000
```

## 🐛 Troubleshooting

### Issue: "Cannot find module 'reactflow'"
**Solution**: Run `npm install reactflow` in project root

### Issue: "Workflow not saving"
**Solution**: Check if backend is running and MongoDB is connected

### Issue: "Nodes not draggable"
**Solution**: Ensure React Flow wrapper has dimensions (check CSS)

### Issue: "Execution stuck in pending"
**Solution**: Check server logs, ensure execution engine is running

## 🚀 Production Integration Notes

### Current Implementation (Mock)
The execution engine uses mock responses for:
- LLM calls (returns simulated text)
- Image generation (returns placeholder URLs)

### Production Integration Required
To integrate real AI services:

1. **OpenAI GPT**
```javascript
// In workflowEngine.js, replace callLLMService()
import OpenAI from 'openai';
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
```

2. **Anthropic Claude**
```javascript
import Anthropic from '@anthropic-ai/sdk';
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
```

3. **Google Gemini**
```javascript
import { GoogleGenerativeAI } from '@google/generative-ai';
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
```

4. **DALL-E / Stable Diffusion**
```javascript
// Add image generation API integrations
```

## 📊 Database Collections

The module creates these MongoDB collections:
- `workflows` - Workflow definitions
- `workflowexecutions` - Execution records
- `workflowversions` - Version history

## ✨ Key Features

✅ **Drag & Drop** - Intuitive node-based workflow builder
✅ **Real-time Logs** - Watch execution happen live
✅ **Version Control** - Save and restore workflow versions
✅ **Node Library** - 7 pre-built node types
✅ **Visual Connections** - See data flow between nodes
✅ **Execution Engine** - Robust workflow orchestration
✅ **Error Handling** - Graceful error recovery
✅ **Authentication** - JWT-secured endpoints
✅ **Rate Limiting** - Production-ready API protection
✅ **Pagination** - Efficient workflow listing
✅ **Search & Filter** - Find workflows easily
✅ **Duplicate** - Copy workflows instantly
✅ **Dark Mode** - Easy on the eyes

## 🎯 Next Steps

1. ✅ **Test the Module**
   - Create a workflow
   - Execute it
   - View logs
   - Check version history

2. 🔧 **Integrate Real AI Services**
   - Add OpenAI API key
   - Replace mock implementations
   - Test with real models

3. 🎨 **Customize**
   - Add custom nodes
   - Modify UI colors
   - Add more node types

4. 🚀 **Deploy**
   - Set up production MongoDB
   - Configure environment variables
   - Deploy backend and frontend

## 📚 Resources

- React Flow Docs: https://reactflow.dev/
- Framer Motion: https://www.framer.com/motion/
- Tailwind CSS: https://tailwindcss.com/
- MongoDB: https://www.mongodb.com/docs/

## 🎉 Success!

You now have a complete AI Agent Builder module integrated into ai_nexus!

**Try it out**: `/workflows` or `/agent-builder`

---

Built with ❤️ by Kiro AI
