import mongoose from 'mongoose';
import TextGeneration from '../models/TextGeneration.js';
import ImageAsset from '../models/ImageAsset.js';
// If "Project" model does not exist or was not shared explicitly, we use a fallback mock or fetch if it exists.
// We'll safely attempt imports or fallback.
let Project;
try {
    Project = mongoose.model('Project');
} catch {
    Project = null;
}

/**
 * Returns dashboard top cards overview.
 */
export const getDashboardOverview = async (userId, startDate, endDate) => {
    const query = { user: userId };
    if (startDate && endDate) {
        query.createdAt = {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
        };
    }

    // 1. Text Generation Stats
    const textStats = await TextGeneration.aggregate([
        { $match: { user: new mongoose.Types.ObjectId(userId), ...query.createdAt ? { createdAt: query.createdAt } : {} } },
        {
            $group: {
                _id: null,
                totalRequests: { $sum: 1 },
                totalTokens: { $sum: "$tokensUsed" }
            }
        }
    ]);

    // 2. Image Generation Stats
    const imageCount = await ImageAsset.countDocuments(query);

    // 3. Active Projects (using user projects if it exists, otherwise defaulting to 0)
    let activeProjects = 0;
    if (Project) {
        activeProjects = await Project.countDocuments({ createdBy: userId, deletedAt: null });
    }

    const tRequests = textStats[0]?.totalRequests || 0;
    const tTokens = textStats[0]?.totalTokens || 0;

    return {
        totalRequests: tRequests + imageCount,
        tokensUsed: tTokens,
        activeProjects,
        imageGenerations: imageCount
    };
};

/**
 * Returns advanced arrays for rendering recharts.
 */
export const getUsageData = async (userId, startDate, endDate) => {
    const matchQuery = { user: new mongoose.Types.ObjectId(userId) };
    if (startDate && endDate) {
        matchQuery.createdAt = {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
        };
    }

    // A. Usage Over Time (Line Chart)
    const usageOverTimeText = await TextGeneration.aggregate([
        { $match: matchQuery },
        {
            $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                texts: { $sum: 1 },
                tokens: { $sum: "$tokensUsed" }
            }
        },
        { $sort: { _id: 1 } }
    ]);

    const usageOverTimeImage = await ImageAsset.aggregate([
        { $match: matchQuery },
        {
            $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                images: { $sum: 1 }
            }
        },
        { $sort: { _id: 1 } }
    ]);

    // Merge line chart dates
    const dateMap = {};
    usageOverTimeText.forEach(d => {
        dateMap[d._id] = { date: d._id, texts: d.texts, tokens: d.tokens, images: 0 };
    });
    usageOverTimeImage.forEach(d => {
        if (!dateMap[d._id]) dateMap[d._id] = { date: d._id, texts: 0, tokens: 0, images: 0 };
        dateMap[d._id].images = d.images;
    });
    const lineChartData = Object.values(dateMap).sort((a, b) => new Date(a.date) - new Date(b.date));

    // B. Model Distribution (Pie Chart)
    const textModelData = await TextGeneration.aggregate([
        { $match: matchQuery },
        {
            $group: {
                _id: "$model",
                value: { $sum: 1 }
            }
        }
    ]);
    const imageModelData = await ImageAsset.aggregate([
        { $match: matchQuery },
        {
            $group: {
                _id: "$toolUsed",
                value: { $sum: 1 }
            }
        }
    ]);

    const pieChartData = [
        ...textModelData.map(m => ({ name: m._id || 'Text Model', value: m.value })),
        ...imageModelData.map(m => ({ name: m._id || 'Image Tool', value: m.value }))
    ];

    // C. Feature Usage (Bar Chart)
    const barChartData = [
        { name: 'Text Generation', usage: textStatsFallback(matchQuery) },
        { name: 'Image Processing', usage: await ImageAsset.countDocuments({ ...matchQuery, type: 'processing' }) },
        { name: 'Image Generation', usage: await ImageAsset.countDocuments({ ...matchQuery, type: 'generation' }) }
    ];

    return {
        lineChartData,
        pieChartData,
        barChartData
    };
};

async function textStatsFallback(matchQuery) {
    return await TextGeneration.countDocuments(matchQuery);
}
