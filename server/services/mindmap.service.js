import logger from '../utils/logger.js';
import { aiManager } from './aiProviders/index.js';

export const generateMindMapData = async (text, topicTitle = 'Research Node') => {
  try {
    logger.info(`[MindMap] Generating concept map for: ${topicTitle}`);

    const prompt = `Analyze the following text and extract the core concepts, theories, and supporting details. 
Construct a hierarchical mind map network represented as JSON containing 'nodes' and 'links'.
Each node must have: 'id' (unique string), 'label' (short title, 1-4 words), and 'type' ('root' | 'category' | 'detail').
Each link must have: 'source' (id of parent node) and 'target' (id of child node).

Ensure there is exactly one 'root' node representing "${topicTitle}".
Keep categories to 3-5 main branches.
Return ONLY valid JSON. No markdown blocks.

Text content:
${text.substring(0, 10000)}`;

    const result = await aiManager.generateText({
      prompt,
      model: 'gemini-1.5-flash',
      feature: 'research-mindmap'
    });

    let mindmap;
    try {
      const cleanJson = result.content
        .replace(/```json/gi, '')
        .replace(/```/gi, '')
        .trim();
      mindmap = JSON.parse(cleanJson);
    } catch (e) {
      logger.warn('[MindMap] JSON parser failed on LLM output. Using structured fallback.');
      // Fail-safe default schema structure
      mindmap = {
        nodes: [
          { id: 'root', label: topicTitle, type: 'root' },
          { id: 'concept1', label: 'Key Themes', type: 'category' },
          { id: 'concept2', label: 'Methodology', type: 'category' },
          { id: 'concept3', label: 'Further Scope', type: 'category' },
          { id: 'detail1', label: 'Primary Data', type: 'detail' },
          { id: 'detail2', label: 'Evaluation Metrics', type: 'detail' }
        ],
        links: [
          { source: 'root', target: 'concept1' },
          { source: 'root', target: 'concept2' },
          { source: 'root', target: 'concept3' },
          { source: 'concept1', target: 'detail1' },
          { source: 'concept2', target: 'detail2' }
        ]
      };
    }

    return mindmap;
  } catch (error) {
    logger.error(`[MindMap] Error generating data: ${error.message}`);
    throw error;
  }
};
