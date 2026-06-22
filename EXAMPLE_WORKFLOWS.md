# 📋 Example Workflows for AI Agent Builder

## Example 1: Simple Content Generator

### Workflow Structure
```
[User Input] → [Prompt Node] → [LLM Node] → [Output]
```

### Node Configurations

**User Input Node**
```json
{
  "label": "Content Parameters",
  "schema": {
    "type": "object",
    "properties": {
      "topic": { "type": "string" },
      "tone": { "type": "string" },
      "length": { "type": "string" }
    }
  }
}
```

**Prompt Node**
```json
{
  "label": "Generate Prompt",
  "promptTemplate": "Write a {{length}} article about {{topic}} in a {{tone}} tone.",
  "variables": [
    { "name": "topic", "source": "input.topic" },
    { "name": "tone", "source": "input.tone" },
    { "name": "length", "source": "input.length" }
  ]
}
```

**LLM Node**
```json
{
  "label": "Generate Content",
  "model": "gpt-4",
  "promptSource": "node_2.prompt",
  "temperature": 0.7,
  "maxTokens": 2000
}
```

**Output Node**
```json
{
  "label": "Final Content",
  "outputSource": "node_3.response"
}
```

### Test Input
```json
{
  "topic": "Artificial Intelligence in Healthcare",
  "tone": "professional",
  "length": "medium-length"
}
```

---

## Example 2: Smart Email Classifier

### Workflow Structure
```
[User Input] → [LLM Node] → [Condition Node]
                               ├─ True → [Output: Urgent]
                               └─ False → [Output: Normal]
```

### Node Configurations

**User Input Node**
```json
{
  "label": "Email Content",
  "schema": {
    "type": "object",
    "properties": {
      "subject": { "type": "string" },
      "body": { "type": "string" }
    }
  }
}
```

**LLM Node**
```json
{
  "label": "Analyze Email",
  "model": "gpt-3.5-turbo",
  "promptSource": "Analyze this email and respond with only 'urgent' or 'normal': Subject: {{input.subject}} Body: {{input.body}}",
  "temperature": 0.3,
  "maxTokens": 50
}
```

**Condition Node**
```json
{
  "label": "Check Priority",
  "leftOperand": "node_2.response",
  "operator": "contains",
  "rightOperand": "urgent"
}
```

**Output Node (True)**
```json
{
  "label": "Urgent Email",
  "outputSource": "{ \"priority\": \"urgent\", \"email\": input }"
}
```

**Output Node (False)**
```json
{
  "label": "Normal Email",
  "outputSource": "{ \"priority\": \"normal\", \"email\": input }"
}
```

---

## Example 3: Image + Caption Generator

### Workflow Structure
```
[User Input] → [Prompt Node] → [Image Gen Node] → [LLM Node] → [Output]
```

### Node Configurations

**User Input Node**
```json
{
  "label": "Image Description",
  "schema": {
    "type": "object",
    "properties": {
      "description": { "type": "string" },
      "style": { "type": "string" }
    }
  }
}
```

**Prompt Node**
```json
{
  "label": "Create Image Prompt",
  "promptTemplate": "A {{style}} style image of {{description}}, highly detailed, 4k resolution",
  "variables": [
    { "name": "description", "source": "input.description" },
    { "name": "style", "source": "input.style" }
  ]
}
```

**Image Generation Node**
```json
{
  "label": "Generate Image",
  "model": "dall-e-3",
  "prompt": "node_2.prompt",
  "size": "1024x1024"
}
```

**LLM Node**
```json
{
  "label": "Generate Caption",
  "model": "gpt-4",
  "promptSource": "Write a creative caption for an image of: {{input.description}}",
  "temperature": 0.8,
  "maxTokens": 100
}
```

**Output Node**
```json
{
  "label": "Image & Caption",
  "outputSource": "{ \"image\": node_3.imageUrl, \"caption\": node_4.response }"
}
```

### Test Input
```json
{
  "description": "a cat astronaut floating in space",
  "style": "photorealistic"
}
```

---

## Example 4: Multi-Language Translator

### Workflow Structure
```
[User Input] → [Prompt Node] → [LLM Node 1] → [LLM Node 2] → [Output]
```

### Node Configurations

**User Input Node**
```json
{
  "label": "Translation Request",
  "schema": {
    "type": "object",
    "properties": {
      "text": { "type": "string" },
      "targetLanguages": { "type": "array" }
    }
  }
}
```

**Prompt Node**
```json
{
  "label": "Create Translation Prompt",
  "promptTemplate": "Translate the following text to {{language}}: {{text}}",
  "variables": [
    { "name": "text", "source": "input.text" },
    { "name": "language", "source": "input.targetLanguages[0]" }
  ]
}
```

**LLM Node 1**
```json
{
  "label": "Spanish Translation",
  "model": "gpt-4",
  "promptSource": "node_2.prompt",
  "temperature": 0.3,
  "maxTokens": 500
}
```

**LLM Node 2**
```json
{
  "label": "Verify Translation",
  "model": "gpt-4",
  "promptSource": "Review this translation for accuracy and suggest improvements: {{node_3.response}}",
  "temperature": 0.5,
  "maxTokens": 500
}
```

**Output Node**
```json
{
  "label": "Final Translation",
  "outputSource": "{ \"original\": input.text, \"translated\": node_3.response, \"review\": node_4.response }"
}
```

---

## Example 5: API Data Enrichment

### Workflow Structure
```
[User Input] → [API Request] → [LLM Node] → [Output]
```

### Node Configurations

**User Input Node**
```json
{
  "label": "Search Query",
  "schema": {
    "type": "object",
    "properties": {
      "query": { "type": "string" }
    }
  }
}
```

**API Request Node**
```json
{
  "label": "Fetch Data",
  "url": "https://api.example.com/search?q={{input.query}}",
  "method": "GET",
  "headers": {
    "Authorization": "Bearer YOUR_API_KEY",
    "Content-Type": "application/json"
  }
}
```

**LLM Node**
```json
{
  "label": "Summarize Results",
  "model": "gpt-4",
  "promptSource": "Summarize these search results in a clear and concise way: {{node_2.data}}",
  "temperature": 0.7,
  "maxTokens": 500
}
```

**Output Node**
```json
{
  "label": "Enriched Data",
  "outputSource": "{ \"rawData\": node_2.data, \"summary\": node_3.response }"
}
```

---

## Example 6: Content Moderation Pipeline

### Workflow Structure
```
[User Input] → [LLM Node] → [Condition Node]
                               ├─ True → [API Request] → [Output: Flagged]
                               └─ False → [Output: Approved]
```

### Node Configurations

**User Input Node**
```json
{
  "label": "User Comment",
  "schema": {
    "type": "object",
    "properties": {
      "userId": { "type": "string" },
      "comment": { "type": "string" }
    }
  }
}
```

**LLM Node**
```json
{
  "label": "Analyze Content",
  "model": "gpt-4",
  "promptSource": "Analyze this comment for harmful content. Respond with only 'safe' or 'unsafe': {{input.comment}}",
  "temperature": 0.1,
  "maxTokens": 10
}
```

**Condition Node**
```json
{
  "label": "Check Safety",
  "leftOperand": "node_2.response",
  "operator": "contains",
  "rightOperand": "unsafe"
}
```

**API Request Node (True branch)**
```json
{
  "label": "Log Violation",
  "url": "https://api.example.com/moderation/flag",
  "method": "POST",
  "headers": {
    "Content-Type": "application/json"
  },
  "bodySource": "{ \"userId\": input.userId, \"comment\": input.comment, \"reason\": node_2.response }"
}
```

**Output Node (True)**
```json
{
  "label": "Content Flagged",
  "outputSource": "{ \"status\": \"flagged\", \"reason\": node_2.response }"
}
```

**Output Node (False)**
```json
{
  "label": "Content Approved",
  "outputSource": "{ \"status\": \"approved\", \"comment\": input.comment }"
}
```

---

## Example 7: Personalized Recommendation Engine

### Workflow Structure
```
[User Input] → [API Request] → [Prompt Node] → [LLM Node] → [Output]
```

### Node Configurations

**User Input Node**
```json
{
  "label": "User Profile",
  "schema": {
    "type": "object",
    "properties": {
      "userId": { "type": "string" },
      "preferences": { "type": "array" }
    }
  }
}
```

**API Request Node**
```json
{
  "label": "Fetch User History",
  "url": "https://api.example.com/users/{{input.userId}}/history",
  "method": "GET",
  "headers": {
    "Authorization": "Bearer YOUR_API_KEY"
  }
}
```

**Prompt Node**
```json
{
  "label": "Create Recommendation Prompt",
  "promptTemplate": "Based on this user's preferences {{preferences}} and history {{history}}, recommend 5 items.",
  "variables": [
    { "name": "preferences", "source": "input.preferences" },
    { "name": "history", "source": "node_2.data" }
  ]
}
```

**LLM Node**
```json
{
  "label": "Generate Recommendations",
  "model": "gpt-4",
  "promptSource": "node_3.prompt",
  "temperature": 0.8,
  "maxTokens": 1000
}
```

**Output Node**
```json
{
  "label": "Personalized Results",
  "outputSource": "{ \"userId\": input.userId, \"recommendations\": node_4.response }"
}
```

---

## Example 8: Advanced Document Analysis

### Workflow Structure
```
[User Input] → [LLM 1: Extract] → [LLM 2: Summarize] → [LLM 3: Sentiment] → [Output]
```

### Node Configurations

**User Input Node**
```json
{
  "label": "Document Text",
  "schema": {
    "type": "object",
    "properties": {
      "document": { "type": "string" }
    }
  }
}
```

**LLM Node 1**
```json
{
  "label": "Extract Key Points",
  "model": "gpt-4",
  "promptSource": "Extract the main key points from this document: {{input.document}}",
  "temperature": 0.3,
  "maxTokens": 500
}
```

**LLM Node 2**
```json
{
  "label": "Create Summary",
  "model": "gpt-4",
  "promptSource": "Summarize these key points in 2-3 sentences: {{node_2.response}}",
  "temperature": 0.5,
  "maxTokens": 200
}
```

**LLM Node 3**
```json
{
  "label": "Analyze Sentiment",
  "model": "gpt-4",
  "promptSource": "Analyze the sentiment of this document. Respond with positive, negative, or neutral and a confidence score: {{input.document}}",
  "temperature": 0.2,
  "maxTokens": 100
}
```

**Output Node**
```json
{
  "label": "Complete Analysis",
  "outputSource": "{ \"keyPoints\": node_2.response, \"summary\": node_3.response, \"sentiment\": node_4.response }"
}
```

---

## Tips for Creating Workflows

### 1. Start Simple
Begin with 3-4 nodes and test thoroughly before adding complexity.

### 2. Use Descriptive Labels
Give each node a clear, descriptive name like "Extract Customer Email" instead of "Node 1".

### 3. Test Incrementally
Test each node individually before connecting the full workflow.

### 4. Handle Errors
Always consider what happens if a node fails and add condition nodes for error handling.

### 5. Optimize Prompts
Spend time crafting good prompts - they're the key to quality results.

### 6. Version Control
Save versions before major changes so you can rollback if needed.

### 7. Monitor Executions
Check the logs regularly to understand how your workflow performs.

### 8. Use Variables
Leverage the variable system in Prompt Nodes for dynamic content.

---

## Common Patterns

### Pattern: Error Handling
```
[Node] → [Condition: Check Success]
           ├─ True → [Continue Workflow]
           └─ False → [Error Output]
```

### Pattern: Parallel Processing
```
[User Input] → [Node A]
            → [Node B]
            → [Node C] → [Merge Results] → [Output]
```

### Pattern: Retry Logic
```
[API Request] → [Condition: Check Status]
                 ├─ Success → [Output]
                 └─ Fail → [Retry API Request]
```

### Pattern: Data Validation
```
[User Input] → [LLM: Validate] → [Condition]
                                   ├─ Valid → [Process]
                                   └─ Invalid → [Error]
```

---

## Need Help?

Refer to the main documentation in `AGENT_BUILDER_README.md` for more details on each node type and configuration options.

Happy workflow building! 🚀
