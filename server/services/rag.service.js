import logger from '../utils/logger.js';
import ResearchSource from '../models/ResearchSource.js';

export const retrieveContext = async (query, activeSourceIds) => {
  try {
    if (!activeSourceIds || activeSourceIds.length === 0) {
      return '';
    }

    logger.info(`[RAG] Retrieving context for query: "${query}" across ${activeSourceIds.length} sources`);
    const sources = await ResearchSource.find({ _id: { $in: activeSourceIds } });

    const keywords = query.toLowerCase().split(/\s+/).filter(w => w.length > 3);
    const passages = [];

    for (const source of sources) {
      if (!source.rawContent) continue;

      // Split source content into paragraphs or chunks of roughly 500 characters
      const paragraphs = source.rawContent.split(/\n+/).filter(p => p.trim().length > 40);

      for (const para of paragraphs) {
        let score = 0;
        const lowerPara = para.toLowerCase();

        // Calculate matching score
        keywords.forEach(keyword => {
          if (lowerPara.includes(keyword)) {
            score += 1;
          }
        });

        if (score > 0) {
          passages.push({
            text: para.trim(),
            sourceTitle: source.title,
            sourceId: source._id,
            score
          });
        }
      }
    }

    // Sort passages by score and grab top 4
    passages.sort((a, b) => b.score - a.score);
    const topPassages = passages.slice(0, 4);

    if (topPassages.length === 0) {
      // Return first paragraph of each source if no keywords matched
      return sources.map(s => `[Source: ${s.title}]\n${s.rawContent.substring(0, 300)}...`).join('\n\n');
    }

    return topPassages
      .map(p => `[Context from source: ${p.sourceTitle}]\n${p.text}`)
      .join('\n\n');
  } catch (error) {
    logger.error(`[RAG] Error retrieving context: ${error.message}`);
    return '';
  }
};
