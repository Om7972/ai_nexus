import Memory from '../models/Memory.js';
import Conversation from '../models/Conversation.js';
import Goal from '../models/Goal.js';
import MemoryProject from '../models/MemoryProject.js';
import Insight from '../models/Insight.js';
import { createMemory, autoRememberInformation } from '../services/memory.service.js';
import { searchUserMemories } from '../services/semanticSearch.service.js';
import { generateWeeklyInsight, generateGoalActionSuggestions } from '../services/insight.service.js';
import { generateEmbedding } from '../services/embedding.service.js';
import catchAsync from '../utils/catchAsync.js';

// ── MEMORIES ─────────────────────────────────────────────────────────────────

export const handleCreateMemory = catchAsync(async (req, res) => {
  const { category, content, tags, favorite, metadata } = req.body;
  const memory = await createMemory(req.user.id, {
    category,
    content,
    tags,
    favorite,
    metadata
  });

  res.status(201).json({
    success: true,
    data: memory
  });
});

export const handleGetMemories = catchAsync(async (req, res) => {
  const { category, search, favorite, tag } = req.query;
  const filter = { user: req.user.id };

  if (category) filter.category = category;
  if (favorite) filter.favorite = favorite === 'true';
  if (tag) filter.tags = tag;
  if (search) {
    filter.$text = { $search: search };
  }

  const memories = await Memory.find(filter).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    data: memories
  });
});

export const handleDeleteMemory = catchAsync(async (req, res) => {
  const memory = await Memory.findOneAndDelete({
    _id: req.params.id,
    user: req.user.id
  });

  if (!memory) {
    return res.status(404).json({
      success: false,
      message: 'Memory not found or unauthorized'
    });
  }

  res.status(200).json({
    success: true,
    message: 'Memory cleared successfully'
  });
});

export const handleSearchMemories = catchAsync(async (req, res) => {
  const { query, category, limit } = req.body;
  
  if (!query) {
    return res.status(400).json({
      success: false,
      message: 'Query string is required'
    });
  }

  const memories = await searchUserMemories({
    userId: req.user.id,
    query,
    category,
    limit: limit ? Number(limit) : 10
  });

  res.status(200).json({
    success: true,
    data: memories
  });
});

// ── GOALS ────────────────────────────────────────────────────────────────────

export const handleCreateGoal = catchAsync(async (req, res) => {
  const { title, dueDate, progress, status } = req.body;
  
  let goal = await Goal.create({
    user: req.user.id,
    title,
    dueDate,
    progress,
    status
  });

  // Automatically suggest next steps
  const updatedGoal = await generateGoalActionSuggestions(req.user.id, goal._id);
  if (updatedGoal) {
    goal = updatedGoal;
  }

  res.status(201).json({
    success: true,
    data: goal
  });
});

export const handleGetGoals = catchAsync(async (req, res) => {
  const goals = await Goal.find({ user: req.user.id }).sort({ createdAt: -1 });
  res.status(200).json({
    success: true,
    data: goals
  });
});

export const handleUpdateGoal = catchAsync(async (req, res) => {
  const { progress, status, title } = req.body;
  const goal = await Goal.findOneAndUpdate(
    { _id: req.params.id, user: req.user.id },
    { progress, status, title },
    { new: true }
  );

  if (!goal) {
    return res.status(404).json({
      success: false,
      message: 'Goal not found'
    });
  }

  // Refresh actions if status changes or requested
  await generateGoalActionSuggestions(req.user.id, goal._id);

  res.status(200).json({
    success: true,
    data: goal
  });
});

// ── PROJECTS ─────────────────────────────────────────────────────────────────

export const handleCreateProject = catchAsync(async (req, res) => {
  const { name, description, status, tags } = req.body;
  
  const project = await MemoryProject.create({
    user: req.user.id,
    name,
    description,
    status,
    tags
  });

  res.status(201).json({
    success: true,
    data: project
  });
});

export const handleGetProjects = catchAsync(async (req, res) => {
  const projects = await MemoryProject.find({ user: req.user.id }).sort({ createdAt: -1 });
  res.status(200).json({
    success: true,
    data: projects
  });
});

// ── INSIGHTS ─────────────────────────────────────────────────────────────────

export const handleGetInsights = catchAsync(async (req, res) => {
  let insights = await Insight.find({ user: req.user.id }).sort({ createdAt: -1 });
  
  // If no insights exist, run a weekly one on-the-fly
  if (insights.length === 0) {
    try {
      const freshInsight = await generateWeeklyInsight(req.user.id);
      insights = [freshInsight];
    } catch (e) {
      // Return empty array
    }
  }

  res.status(200).json({
    success: true,
    data: insights
  });
});

export const handleTriggerSummary = catchAsync(async (req, res) => {
  const insight = await generateWeeklyInsight(req.user.id);
  res.status(200).json({
    success: true,
    data: insight
  });
});
