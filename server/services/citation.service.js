import logger from '../utils/logger.js';

export const generateCitations = (meta) => {
  try {
    const title = meta.title || 'Untitled Source';
    const authorsList = meta.authors || ['Unknown Author'];
    const publisher = meta.publisher || 'Web Repository';
    const year = meta.publishYear || new Date().getFullYear().toString();
    const url = meta.url || '';

    // Standardize author name representations
    const formattedAuthors = authorsList.map(a => {
      const parts = a.trim().split(/\s+/);
      if (parts.length > 1) {
        return {
          first: parts[0],
          last: parts[parts.length - 1],
          initials: `${parts[0][0]}.`
        };
      }
      return { first: '', last: parts[0], initials: '' };
    });

    // APA style
    // Last, F. I., & Last2, F. I. (Year). Title. Publisher. URL
    let apa = '';
    if (formattedAuthors.length > 0) {
      apa = formattedAuthors.map(a => a.last + (a.initials ? `, ${a.initials}` : '')).join(', & ');
    }
    apa += ` (${year}). *${title}*. ${publisher}.`;
    if (url) apa += ` Retrieved from ${url}`;

    // MLA style
    // Last, First, et al. Title. Publisher, Year, URL.
    let mla = '';
    if (formattedAuthors.length > 0) {
      const firstAuthor = formattedAuthors[0];
      mla = firstAuthor.last + (firstAuthor.first ? `, ${firstAuthor.first}` : '');
      if (formattedAuthors.length > 1) {
        mla += ', et al';
      }
    }
    mla += `. *${title}*. ${publisher}, ${year}`;
    if (url) mla += `, ${url}`;
    mla += '.';

    // Chicago style
    // Last, First. Title. Publisher, Year. URL.
    let chicago = '';
    if (formattedAuthors.length > 0) {
      const firstAuthor = formattedAuthors[0];
      chicago = firstAuthor.last + (firstAuthor.first ? `, ${firstAuthor.first}` : '');
    }
    chicago += `. *${title}*. ${publisher}, ${year}.`;
    if (url) chicago += ` ${url}`;

    // IEEE style
    // [1] F. Initial. Last, "Title," Publisher, Year. [Online]. Available: URL.
    let ieee = '';
    if (formattedAuthors.length > 0) {
      ieee = formattedAuthors.map(a => (a.initials ? `${a.initials} ` : '') + a.last).join(', ');
    }
    ieee += `, "${title}," ${publisher}, ${year}.`;
    if (url) ieee += ` [Online]. Available: ${url}.`;

    return {
      apa,
      mla,
      chicago,
      ieee
    };
  } catch (error) {
    logger.error(`[Citation] Error generating citations: ${error.message}`);
    return {
      apa: meta.title || 'Error parsing citation',
      mla: meta.title || 'Error parsing citation',
      chicago: meta.title || 'Error parsing citation',
      ieee: meta.title || 'Error parsing citation'
    };
  }
};
