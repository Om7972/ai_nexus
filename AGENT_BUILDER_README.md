# AI Agent Builder Module

A production-ready drag-and-drop AI workflow builder for ai_nexus platform.

## 🚀 Features

### Frontend Features
- **Drag-and-Drop Canvas**: Intuitive React Flow-based workflow builder
- **7 Node Types**:
  - 🧑 User Input - Receive workflow input
  - 💬 Prompt Node - Create dynamic prompts with variables
  - 🧠 LLM Node - Call AI language models (GPT-4, Claude, Gemini)
  - 🖼️ Image Generation - Generate images with DALL-E, Stable Diffusion
  - 🔀 Condition Node - Branch workflow logic
  - 🌐 API Request - Make HTTP requests to external APIs
  - ✅ Output Node - Define workflow output
- **Node Configuration Panel**: Configure each node with specific parameters
- **Real-time Execution Logs**: Monitor workflow execution with detailed logs
- **Version History**: Save and restore workflow versions
- **Workflow Management**:
  - Save/Rename workflows
  - Duplicate workflows
  - Delete workflows
  - View execution history
- **Modern UI**:
  - Glassmorphism design
  - Dark mode
  - Framer Motion animations
  - Responsive layout

### Backend Features
- **RESTful API**:
  - `POST /api/v1/workflows` - Create workflow
  - `GET /api/v1/workflows` - List workflows (with pagination)
  - `GET /api/v1/workflows/:id` - Get workflow details
  - `PATCH /api/v1/workflows/:id` - Update workflow
  - `DELETE /api/v1/workflows/:id` - Delete workflow
  - `POST /api/v1/workflows/:id/duplicate` - Duplicate workflow
  - `POST /api/v1/workflows/:id/execute` - Execute workflow
  - `GET /api/v1/workflows/:id/versions` - Get version history
  - `GET /api/v1/workflows/executions/:executionId` - Get execution details

- **Workflow Execution Engine**:
  - Traverses nodes in correct order
  - Handles data flow between nodes
  - Supports conditional branching
  - Captures execution logs
  - Error handling and recovery

- **MongoDB Collections**:
  - `Workflow` - Stores workflow definitions
  - `WorkflowExecution` - Stores execution records
  - `WorkflowVersion` - Stores version history

- **Security**:
  - JWT authentication
  - Rate limiting
  - Input validation with Zod
  - MongoDB sanitization

## 📦 Installation

### Prerequisites
- Node.js >= 18.0.0
- MongoDB
- npm or yarn

### Backend Setup

1. Navigate to server directory:
```bash
cd server
```

2. Install dependencies (if not already installed):
```bash
npm install
```

3. Environment variables are already configured in `server/.env`

4. Start the server:
```bash
npm run dev
```

Server will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to project root:
```bash
cd ..
```

2. React Flow is already installed

3. Start the development server:
```bash
npm start
```

Frontend will run on `http://localhost:3000`

## 🎯 Usage

### Creating a Workflow

1. Navigate to `/workflows` to see all workflows
2. Click "New Workflow" button
3. Drag nodes from the left palette onto the canvas
4. Connect nodes by dragging from output handle to input handle
5. Click on nodes to configure their settings
6. Save the workflow

### Configuring Nodes

#### User Input Node
- Define input schema for the workflow

#### Prompt Node
- Create prompt templates with variables
- Use `{{variable}}` syntax for dynamic values
- Map variables to outputs from previous nodes

#### LLM Node
- Select AI model (GPT-4, Claude, Gemini, etc.)
- Configure temperature (0-2)
- Set max tokens
- Specify prompt source from previous node

#### Image Generation Node
- Select model (DALL-E, Stable Diffusion)
- Choose image size
- Specify prompt source

#### Condition Node
- Define left and right operands
- Choose operator (equals, contains, greater than, etc.)
- Branch to different paths based on condition

#### API Request Node
- Set URL and HTTP method
- Add custom headers
- Configure request body
- Use outputs from previous nodes

#### Output Node
- Specify which node output to use as final result

### Executing a Workflow

1. Click "Execute Workflow" button
2. Provide input data (JSON format)
3. Monitor execution in real-time logs panel
4. View execution results when complete

### Version Control

1. Click "Version History" in the sidebar
2. View all saved versions
3. Restore any previous version
4. Each save creates a new version automatically

## 🏗️ Architecture

### Frontend Architecture

```
src/
├── components/
│   └── workflow/
│       ├── CustomNode.jsx           # Custom node component
│       ├── NodeConfigPanel.jsx      # Node configuration UI
│       ├── NodePalette.jsx          # Draggable node palette
│       ├── WorkflowSidebar.jsx      # Workflow actions sidebar
│       └── ExecutionLogsPanel.jsx   # Execution logs display
├── pages/
│   ├── agent-builder.jsx            # Main workflow builder
│   └── workflows-list.jsx           # Workflows list page
└── store/
    └── slices/
        └── workflowSlice.js         # Redux state management
```

### Backend Architecture

```
server/
├── models/
│   ├── Workflow.js                  # Workflow model
│   ├── WorkflowExecution.js         # Execution model
│   └── WorkflowVersion.js           # Version model
├── controllers/
│   └── workflowController.js        # Workflow API handlers
├── routes/
│   └── workflowRoutes.js            # API routes
└── services/
    └── workflowEngine.js            # Execution engine
```

### Execution Flow

1. User creates workflow with connected nodes
2. User clicks "Execute"
3. Backend receives workflow and input
4. Execution engine:
   - Finds start node (User Input)
   - Executes nodes in order following connections
   - Passes output from each node to connected nodes
   - Handles conditional branching
   - Logs each step
   - Returns final output

## 🎨 Styling

The module uses:
- **Tailwind CSS** for utility classes
- **Framer Motion** for animations
- **Glassmorphism** design pattern
- **Dark mode** by default
- **Gradient backgrounds**
- **Custom color scheme**:
  - Blue: Primary actions
  - Purple: Secondary actions
  - Green: Success states
  - Red: Error states
  - Yellow: Warning states

## 🔒 Security

- All routes require JWT authentication
- Rate limiting on API endpoints
- Input validation with Zod schemas
- MongoDB query sanitization
- Error handling middleware
- Secure headers with Helmet

## 📊 Database Schema

### Workflow
```javascript
{
  name: String,
  description: String,
  nodes: Array,
  edges: Array,
  owner: ObjectId (ref: User),
  status: Enum ['draft', 'active', 'archived'],
  version: Number,
  executionCount: Number,
  lastExecutedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### WorkflowExecution
```javascript
{
  workflow: ObjectId (ref: Workflow),
  workflowVersion: Number,
  owner: ObjectId (ref: User),
  status: Enum ['pending', 'running', 'completed', 'failed', 'cancelled'],
  startTime: Date,
  endTime: Date,
  duration: Number,
  input: Mixed,
  output: Mixed,
  executionLogs: Array,
  nodeExecutions: Array,
  error: Object,
  createdAt: Date
}
```

## 🧪 Testing Workflow

1. Create a simple workflow:
   - User Input → Prompt Node → LLM Node → Output Node

2. Configure nodes:
   - Prompt Node: "Write a short poem about {{topic}}"
   - LLM Node: Select GPT-4, temperature 0.7
   - Output Node: Point to LLM response

3. Execute with input:
   ```json
   { "topic": "AI and the future" }
   ```

4. View logs and output

## 🚦 API Rate Limits

- Standard: 100 requests per 15 minutes per IP
- Authenticated: 1000 requests per 15 minutes per user

## 📝 Notes

- The execution engine currently uses mock implementations for LLM and image generation
- In production, integrate with actual AI service providers:
  - OpenAI API for GPT models
  - Anthropic API for Claude
  - Google AI for Gemini
  - OpenAI DALL-E for image generation
  - Stability AI for Stable Diffusion

## 🐛 Troubleshooting

### React Flow not rendering
- Ensure `reactflow` is installed: `npm install reactflow`
- Check browser console for errors
- Verify viewport has proper dimensions

### Workflow not saving
- Check network tab for API errors
- Verify JWT token is present
- Ensure user is authenticated

### Execution fails
- Check execution logs for detailed error
- Verify node configurations are complete
- Ensure nodes are properly connected

## 🔮 Future Enhancements

- [ ] Real AI service integrations
- [ ] Workflow templates library
- [ ] Collaborative editing
- [ ] Workflow scheduling
- [ ] Webhook triggers
- [ ] Export/Import workflows
- [ ] Analytics dashboard
- [ ] Custom node creation
- [ ] Workflow marketplace

## 📄 License

Part of ai_nexus platform. All rights reserved.

## 🤝 Support

For issues or questions, please contact the development team.

---

**Built with ❤️ using React, Node.js, and MongoDB**
