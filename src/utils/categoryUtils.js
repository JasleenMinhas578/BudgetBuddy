export const validCategory = (c) =>
  c && c !== 'undefined' && c !== 'null' && typeof c === 'string' && c.trim() !== '';
