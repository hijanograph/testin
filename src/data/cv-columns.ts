import * as cv from './cv.md';

export type CvColumn = { kind: 'exp' | 'edu' | 'skills'; html: string };

export async function getCvColumns(): Promise<CvColumn[]> {
  const html = await cv.compiledContent();

  return html
    .split(/(?=<h2)/)
    .filter((col) => col.trim())
    .map((col) => {
      const kind = /^<h2[^>]*>\s*Habilidades/i.test(col)
        ? 'skills'
        : /^<h2[^>]*>\s*Educaci/i.test(col)
          ? 'edu'
          : 'exp';

      if (kind !== 'skills') {
        col = col.replace(
          /(<h3[^>]*>[\s\S]*?<\/h3>)\s*<p><em>([\s\S]*?)<\/em><\/p>/g,
          '<em class="cv__date">$2</em>$1',
        );
      }
      if (kind === 'edu') {
        col = col.replace(/<h3([^>]*)>([^<]*?) - ([^<]*?)<\/h3>/g, '<h3$1>$2</h3><p>$3</p>');
      }
      return { kind, html: col };
    });
}