import axios from 'axios';
import WorkflowExecution from '../models/WorkflowExecution.js';

/**
 * Main workflow execution engine
 * Traverses nodes and executes them in order based on connections
 */
export async function executeWorkflow(workflow, execution, input) {
  try {
    // Update execution status
    execution.status = 'running';
    execution.startTime = new Date();
    await execution.save();

    await execution.addLog(null, 'System', 'info', 'Workflow execution started');

    const { nodes, edges } = workflow;
    const context = { input };
    const executedNodes = new Set();

    // Find start node (User Input or first node)
    const startNode = nodes.find(n => n.type === 'userInput') || nodes[0];

    if (!startNode) {
      throw new Error('No start node found');
    }

    // Execute workflow recursively
    await executeNode(startNode, nodes, edges, context, execution, executedNodes);

    // Complete execution
    await execution.complete(context.output);
    await execution.addLog(null, 'System', 'success', 'Workflow execution completed');

  } catch (error) {
    console.error('Workflow execution error:', error);
    error.nodeId = error.nodeId || null;
    await execution.complete(null, error);
    await execution.addLog(error.nodeId, 'System', 'error', `Workflow execution failed: ${error.message}`);
  }
}

/**
 * Execute a single node and its connected nodes
 */
async function executeNode(node, allNodes, allEdges, context, execution, executedNodes) {
  // Avoid circular execution
  if (executedNodes.has(node.id)) {
    return;
  }

  executedNodes.add(node.id);

  try {
    await execution.addLog(node.id, node.data.label || node.type, 'info', `Executing node: ${node.data.label || node.type}`);

    // Update node execution status
    await execution.updateNodeExecution(node.id, {
      nodeId: node.id,
      nodeName: node.data.label || node.type,
      nodeType: node.type,
      status: 'running',
      startTime: new Date()
    });

    let nodeOutput;

    // Execute node based on type
    switch (node.type) {
      case 'userInput':
        nodeOutput = await executeUserInputNode(node, context, execution);
        break;
      case 'promptNode':
        nodeOutput = await executePromptNode(node, context, execution);
        break;
      case 'llmNode':
        nodeOutput = await executeLLMNode(node, context, execution);
        break;
      case 'imageGeneration':
        nodeOutput = await executeImageGenerationNode(node, context, execution);
        break;
      case 'conditionNode':
        nodeOutput = await executeConditionNode(node, context, execution);
        break;
      case 'apiRequest':
        nodeOutput = await executeAPIRequestNode(node, context, execution);
        break;
      case 'outputNode':
        nodeOutput = await executeOutputNode(node, context, execution);
        break;
      default:
        throw new Error(`Unknown node type: ${node.type}`);
    }

    // Store node output in context
    context[node.id] = nodeOutput;

    // Update node execution status
    await execution.updateNodeExecution(node.id, {
      status: 'completed',
      endTime: new Date(),
      output: nodeOutput
    });

    await execution.addLog(node.id, node.data.label || node.type, 'success', 'Node executed successfully');

    // Find and execute connected nodes
    const outgoingEdges = allEdges.filter(edge => edge.source === node.id);

    for (const edge of outgoingEdges) {
      // Handle condition node branching
      if (node.type === 'conditionNode') {
        const shouldExecute = edge.sourceHandle === nodeOutput.branch;
        if (!shouldExecute) {
          continue;
        }
      }

      const nextNode = allNodes.find(n => n.id === edge.target);
      if (nextNode) {
        await executeNode(nextNode, allNodes, allEdges, context, execution, executedNodes);
      }
    }

  } catch (error) {
    error.nodeId = node.id;
    
    await execution.updateNodeExecution(node.id, {
      status: 'failed',
      endTime: new Date(),
      error: error.message
    });

    await execution.addLog(node.id, node.data.label || node.type, 'error', `Node execution failed: ${error.message}`);
    
    throw error;
  }
}

/**
 * Node execution functions
 */

async function executeUserInputNode(node, context, execution) {
  const { input } = context;
  await execution.addLog(node.id, node.data.label, 'info', `User input received`);
  return input;
}

async function executePromptNode(node, context, execution) {
  const { promptTemplate, variables } = node.data;
  
  // Replace variables in template
  let prompt = promptTemplate || '';
  
  if (variables && Array.isArray(variables)) {
    variables.forEach(variable => {
      const value = getNestedValue(context, variable.source) || variable.defaultValue || '';
      prompt = prompt.replace(new RegExp(`{{${variable.name}}}`, 'g'), value);
    });
  }

  await execution.addLog(node.id, node.data.label, 'info', `Prompt generated: ${prompt.substring(0, 100)}...`);
  
  return { prompt };
}

async function executeLLMNode(node, context, execution) {
  const { model, temperature = 0.7, maxTokens = 1000, promptSource } = node.data;
  
  // Get prompt from previous node
  const prompt = getNestedValue(context, promptSource) || '';

  if (!prompt) {
    throw new Error('No prompt provided for LLM node');
  }

  await execution.addLog(node.id, node.data.label, 'info', `Sending request to ${model}`);

  // Mock LLM response (in production, integrate with actual AI services)
  // This would call OpenAI, Anthropic, etc.
  const response = await callLLMService(model, prompt, temperature, maxTokens);

  await execution.addLog(node.id, node.data.label, 'success', `LLM response received (${response.length} chars)`);

  return { response, model, prompt };
}

async function executeImageGenerationNode(node, context, execution) {
  const { prompt: promptSource, model = 'dall-e-3', size = '1024x1024' } = node.data;
  
  const prompt = getNestedValue(context, promptSource) || '';

  if (!prompt) {
    throw new Error('No prompt provided for image generation');
  }

  await execution.addLog(node.id, node.data.label, 'info', `Generating image with ${model}`);

  // Mock image generation (integrate with DALL-E, Midjourney, Stable Diffusion, etc.)
  const imageUrl = await generateImage(prompt, model, size);

  await execution.addLog(node.id, node.data.label, 'success', `Image generated successfully`);

  return { imageUrl, prompt, model };
}

async function executeConditionNode(node, context, execution) {
  const { leftOperand, operator, rightOperand } = node.data;
  
  const leftValue = getNestedValue(context, leftOperand);
  const rightValue = rightOperand;

  let result = false;

  switch (operator) {
    case 'equals':
      result = leftValue == rightValue;
      break;
    case 'notEquals':
      result = leftValue != rightValue;
      break;
    case 'contains':
      result = String(leftValue).includes(rightValue);
      break;
    case 'greaterThan':
      result = parseFloat(leftValue) > parseFloat(rightValue);
      break;
    case 'lessThan':
      result = parseFloat(leftValue) < parseFloat(rightValue);
      break;
    case 'isEmpty':
      result = !leftValue || leftValue.length === 0;
      break;
    default:
      result = false;
  }

  const branch = result ? 'true' : 'false';

  await execution.addLog(node.id, node.data.label, 'info', `Condition evaluated to: ${branch}`);

  return { result, branch };
}

async function executeAPIRequestNode(node, context, execution) {
  const { url, method = 'GET', headers = {}, body, bodySource } = node.data;
  
  let requestBody = body;
  
  if (bodySource) {
    requestBody = getNestedValue(context, bodySource);
  }

  await execution.addLog(node.id, node.data.label, 'info', `Making ${method} request to ${url}`);

  try {
    const config = {
      method,
      url,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    if (method !== 'GET' && requestBody) {
      config.data = requestBody;
    }

    const response = await axios(config);

    await execution.addLog(node.id, node.data.label, 'success', `API request successful (status: ${response.status})`);

    return {
      status: response.status,
      data: response.data,
      headers: response.headers
    };
  } catch (error) {
    throw new Error(`API request failed: ${error.message}`);
  }
}

async function executeOutputNode(node, context, execution) {
  const { outputSource } = node.data;
  
  const output = getNestedValue(context, outputSource) || context;

  await execution.addLog(node.id, node.data.label, 'info', 'Setting workflow output');

  // Store final output in context
  context.output = output;

  return output;
}

/**
 * Helper functions
 */

function getNestedValue(obj, path) {
  if (!path) return obj;
  
  return path.split('.').reduce((current, key) => {
    return current?.[key];
  }, obj);
}

async function callLLMService(model, prompt, temperature, maxTokens) {
  // Mock implementation - integrate with actual AI services
  // In production, add OpenAI, Anthropic, Google AI, etc.
  
  await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
  
  return `This is a mock response from ${model}. Prompt was: "${prompt.substring(0, 50)}..."`;
}

async function generateImage(prompt, model, size) {
  // Mock implementation - integrate with actual image generation services
  // In production, add DALL-E, Midjourney, Stable Diffusion, etc.
  
  await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API delay
  
  return `https://via.placeholder.com/${size}?text=Generated+Image`;
}
