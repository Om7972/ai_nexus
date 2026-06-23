import axios from 'axios';
import WorkflowExecution from '../models/WorkflowExecution.js';
import { aiManager } from './aiProviders/index.js';
import emailService from './emailService.js';
import logger from '../utils/logger.js';

/**
 * Main workflow execution engine
 * Traverses nodes and executes them in order based on connections
 */
export async function executeWorkflow(workflow, execution, input) {
  try {
    execution.status = 'running';
    execution.startTime = new Date();
    execution.metadata = { tokensUsed: 0, totalNodesExecuted: 0 };
    await execution.save();

    await execution.addLog(null, 'System', 'info', 'Workflow execution started');

    const { nodes, edges } = workflow;
    const context = { input, global: {} };
    const executedNodes = new Set();

    // Find start node: either an explicit 'userInput' node, or the first node in the graph
    const startNode = nodes.find(n => n.type === 'userInput') || nodes[0];

    if (!startNode) {
      throw new Error('No start node found in workflow.');
    }

    // Execute workflow recursively/sequentially
    await executeNode(startNode, nodes, edges, context, execution, executedNodes);

    // Finalize execution
    const totalDuration = new Date() - execution.startTime;
    execution.status = 'completed';
    execution.endTime = new Date();
    execution.duration = totalDuration;
    execution.output = context.output || context[nodes[nodes.length - 1]?.id] || context;
    await execution.save();

    await execution.addLog(null, 'System', 'success', `Workflow execution completed in ${totalDuration}ms. Total tokens: ${execution.metadata.tokensUsed || 0}`);

  } catch (error) {
    logger.error('Workflow execution failed:', error);
    const totalDuration = new Date() - execution.startTime;
    
    execution.status = 'failed';
    execution.endTime = new Date();
    execution.duration = totalDuration;
    execution.error = {
      message: error.message,
      stack: error.stack,
      nodeId: error.nodeId || null
    };
    await execution.save();
    
    await execution.addLog(error.nodeId || null, 'System', 'error', `Workflow execution failed: ${error.message}`);
  }
}

/**
 * Execute a single node and recursively process downstream nodes
 */
async function executeNode(node, allNodes, allEdges, context, execution, executedNodes) {
  if (executedNodes.has(node.id)) {
    return; // Prevent circular dependencies / Infinite loops
  }

  executedNodes.add(node.id);
  const maxRetries = node.data?.retries || 3;
  let attempts = 0;
  let success = false;
  let nodeOutput = null;

  await execution.updateNodeExecution(node.id, {
    nodeId: node.id,
    nodeName: node.data?.label || node.type,
    nodeType: node.type,
    status: 'running',
    startTime: new Date()
  });

  while (attempts < maxRetries && !success) {
    attempts++;
    try {
      if (attempts > 1) {
        await execution.addLog(node.id, node.data?.label || node.type, 'warning', `Retry attempt ${attempts}/${maxRetries} for node ${node.id}`);
      } else {
        await execution.addLog(node.id, node.data?.label || node.type, 'info', `Executing node ${node.id} (${node.type})`);
      }

      // Execute node based on type
      switch (node.type) {
        case 'userInput':
          nodeOutput = await executeUserInputNode(node, context, execution);
          break;
        case 'textGenerator':
        case 'llmNode':
          nodeOutput = await executeTextGeneratorNode(node, context, execution);
          break;
        case 'imageGenerator':
        case 'imageGeneration':
          nodeOutput = await executeImageGeneratorNode(node, context, execution);
          break;
        case 'ocr':
          nodeOutput = await executeOCRNode(node, context, execution);
          break;
        case 'summarizer':
          nodeOutput = await executeSummarizerNode(node, context, execution);
          break;
        case 'translator':
          nodeOutput = await executeTranslatorNode(node, context, execution);
          break;
        case 'dataAnalyzer':
          nodeOutput = await executeDataAnalyzerNode(node, context, execution);
          break;
        case 'emailSender':
          nodeOutput = await executeEmailSenderNode(node, context, execution);
          break;
        case 'webSearch':
          nodeOutput = await executeWebSearchNode(node, context, execution);
          break;
        case 'delay':
          nodeOutput = await executeDelayNode(node, context, execution);
          break;
        case 'conditionNode':
          nodeOutput = await executeConditionNode(node, context, execution);
          break;
        case 'exportNode':
        case 'outputNode':
          nodeOutput = await executeExportNode(node, context, execution);
          break;
        default:
          throw new Error(`Unsupported node type: ${node.type}`);
      }

      success = true;
    } catch (err) {
      if (attempts >= maxRetries) {
        err.nodeId = node.id;
        await execution.updateNodeExecution(node.id, {
          status: 'failed',
          endTime: new Date(),
          error: err.message
        });
        await execution.addLog(node.id, node.data?.label || node.type, 'error', `Execution failed after ${maxRetries} attempts: ${err.message}`);
        throw err;
      }
    }
  }

  // Update success status
  const nodeEndTime = new Date();
  const nodeDuration = nodeEndTime - (execution.nodeExecutions.find(n => n.nodeId === node.id)?.startTime || nodeEndTime);

  await execution.updateNodeExecution(node.id, {
    status: 'completed',
    endTime: nodeEndTime,
    duration: nodeDuration,
    output: nodeOutput
  });

  await execution.addLog(node.id, node.data?.label || node.type, 'success', `Node completed successfully in ${nodeDuration}ms`);

  // Save outputs in context
  context[node.id] = nodeOutput;
  execution.metadata.totalNodesExecuted = (execution.metadata.totalNodesExecuted || 0) + 1;
  await execution.save();

  // Route to outgoing connections
  const outgoingEdges = allEdges.filter(edge => edge.source === node.id);

  for (const edge of outgoingEdges) {
    // Branching conditional check
    if (node.type === 'conditionNode') {
      const matchBranch = nodeOutput.branch; // 'true' or 'false'
      if (edge.sourceHandle !== matchBranch) {
        continue; // Skip the inactive branch
      }
    }

    const nextNode = allNodes.find(n => n.id === edge.target);
    if (nextNode) {
      await executeNode(nextNode, allNodes, allEdges, context, execution, executedNodes);
    }
  }
}

/**
 * Node Implementations
 */

async function executeUserInputNode(node, context, execution) {
  const data = getNestedValue(context, node.data?.inputSource || 'input');
  return data;
}

async function executeTextGeneratorNode(node, context, execution) {
  const prompt = resolveTemplate(node.data?.prompt || '', context);
  const model = node.data?.model || 'gemini-1.5-pro';

  const res = await aiManager.generateText({
    prompt,
    model,
    tone: node.data?.tone,
    length: node.data?.length,
    userId: execution.owner,
    feature: 'workflows'
  });

  if (res.tokensUsed) {
    execution.metadata.tokensUsed = (execution.metadata.tokensUsed || 0) + res.tokensUsed;
  }

  return { text: res.content, tokensUsed: res.tokensUsed, model: res.model };
}

async function executeImageGeneratorNode(node, context, execution) {
  const prompt = resolveTemplate(node.data?.prompt || '', context);
  const model = node.data?.model || 'dall-e-3';
  const size = node.data?.size || '1024x1024';

  const res = await aiManager.generateImage({
    prompt,
    model,
    resolution: size,
    userId: execution.owner,
    feature: 'workflows'
  });

  return { imageUrl: res.imageUrl || res.url || res };
}

async function executeOCRNode(node, context, execution) {
  const source = getNestedValue(context, node.data?.imageSource);
  if (!source) {
    throw new Error('OCR source file or image URL not found.');
  }

  await execution.addLog(node.id, 'OCR', 'info', 'Performing text extraction (OCR)');
  // Emulate OCR using Gemini Vision or a mock depending on the input type
  const prompt = 'Extract all readable text from this image exactly as it appears.';
  const res = await aiManager.generateText({
    prompt: `${prompt}\n[Source: ${JSON.stringify(source)}]`,
    model: 'gemini-1.5-pro',
    userId: execution.owner,
    feature: 'workflows'
  });

  return { text: res.content };
}

async function executeSummarizerNode(node, context, execution) {
  const textToSummarize = resolveTemplate(node.data?.text || '{{input}}', context);
  const detail = node.data?.detailLevel || 'concise';

  const prompt = `Summarize the following text in a ${detail} manner:\n\n${textToSummarize}`;
  const res = await aiManager.generateText({
    prompt,
    model: 'gemini-1.5-pro',
    userId: execution.owner,
    feature: 'workflows'
  });

  return { summary: res.content };
}

async function executeTranslatorNode(node, context, execution) {
  const textToTranslate = resolveTemplate(node.data?.text || '{{input}}', context);
  const targetLanguage = node.data?.targetLanguage || 'Spanish';

  const prompt = `Translate the following text to ${targetLanguage}. Maintain tone and formatting:\n\n${textToTranslate}`;
  const res = await aiManager.generateText({
    prompt,
    model: 'gemini-1.5-pro',
    userId: execution.owner,
    feature: 'workflows'
  });

  return { translatedText: res.content, language: targetLanguage };
}

async function executeDataAnalyzerNode(node, context, execution) {
  const data = resolveTemplate(node.data?.data || '{{input}}', context);

  const prompt = `Analyze the following data and extract key findings, trends, and summary metrics. Format in clear markdown:\n\n${data}`;
  const res = await aiManager.generateText({
    prompt,
    model: 'gemini-1.5-pro',
    userId: execution.owner,
    feature: 'workflows'
  });

  return { analysis: res.content };
}

async function executeEmailSenderNode(node, context, execution) {
  const recipient = resolveTemplate(node.data?.recipient || '', context);
  const subject = resolveTemplate(node.data?.subject || 'AI Nexus Alert', context);
  const body = resolveTemplate(node.data?.body || '', context);

  if (!recipient) {
    throw new Error('Recipient email is required for Email Sender node');
  }

  await emailService.sendEmail({
    to: recipient,
    subject: subject,
    html: `<div style="font-family: sans-serif; line-height: 1.5; color: #333;">${body.replace(/\n/g, '<br/>')}</div>`
  });

  return { sent: true, recipient, subject };
}

async function executeWebSearchNode(node, context, execution) {
  const query = resolveTemplate(node.data?.query || '', context);
  if (!query) throw new Error('Query string is required for Web Search Node');

  // Simulated search API returning Google Search snippets using fallback
  const prompt = `Search web for: "${query}". Provide 3 realistic search snippet results with titles and URLs. Format as JSON.`;
  const res = await aiManager.generateText({
    prompt,
    model: 'gemini-1.5-pro',
    userId: execution.owner,
    feature: 'workflows'
  });

  let results;
  try {
    results = JSON.parse(res.content.replace(/```json/g, '').replace(/```/g, '').trim());
  } catch (e) {
    results = [{ title: `Search Result: ${query}`, snippet: res.content, url: 'https://example.com' }];
  }

  return { query, results };
}

async function executeDelayNode(node, context, execution) {
  const ms = parseInt(node.data?.duration || 1000);
  await execution.addLog(node.id, 'Delay', 'info', `Waiting for ${ms}ms...`);
  await new Promise(resolve => setTimeout(resolve, ms));
  return { delayed: true, duration: ms };
}

async function executeConditionNode(node, context, execution) {
  const left = resolveTemplate(node.data?.leftOperand || '', context);
  const operator = node.data?.operator || 'equals';
  const right = resolveTemplate(node.data?.rightOperand || '', context);

  let result = false;
  switch (operator) {
    case 'equals':
      result = String(left).trim() === String(right).trim();
      break;
    case 'notEquals':
      result = String(left).trim() !== String(right).trim();
      break;
    case 'contains':
      result = String(left).toLowerCase().includes(String(right).toLowerCase());
      break;
    case 'greaterThan':
      result = parseFloat(left) > parseFloat(right);
      break;
    case 'lessThan':
      result = parseFloat(left) < parseFloat(right);
      break;
    case 'isEmpty':
      result = !left || String(left).trim().length === 0;
      break;
  }

  const branch = result ? 'true' : 'false';
  return { result, branch, operands: { left, operator, right } };
}

async function executeExportNode(node, context, execution) {
  const exportData = getNestedValue(context, node.data?.exportSource);
  const format = node.data?.format || 'json';

  let outputContent;
  if (format === 'json') {
    outputContent = JSON.stringify(exportData || context, null, 2);
  } else {
    // CSV fallback
    outputContent = String(exportData || context);
  }

  context.output = outputContent;
  return { output: outputContent, format };
}

/**
 * Utility Functions
 */

function resolveTemplate(template, context) {
  if (typeof template !== 'string') return template;
  return template.replace(/\{\{([^}]+)\}\}/g, (_, path) => {
    const value = getNestedValue(context, path.trim());
    return value !== undefined ? (typeof value === 'object' ? JSON.stringify(value) : value) : '';
  });
}

function getNestedValue(obj, path) {
  if (!path || path === 'input') return obj.input;
  
  return path.split('.').reduce((current, key) => {
    return current?.[key];
  }, obj);
}
