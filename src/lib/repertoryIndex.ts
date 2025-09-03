export type MateriaEntry = {
  source: string;
  remedy: string | null;
  snippet: string;
  index: number;
};

let cache: MateriaEntry[] | null = null;

async function fetchText(path: string): Promise<string> {
  const res = await fetch(path, { cache: 'force-cache' });
  if (!res.ok) throw new Error(`Failed to fetch ${path}`);
  return await res.text();
}

function tokenize(text: string): string[] {
  return text.split(/\n{2,}/g).map(s => s.trim()).filter(Boolean);
}

function guessRemedy(block: string): string | null {
  const firstLine = block.split(/\n/)[0]?.trim() || '';
  if (!firstLine) return null;
  // Heuristic: remedy names are often Title Case and short
  if (/^[A-Z][A-Za-z\-\s]{2,40}$/.test(firstLine)) return firstLine;
  // Fallback: first two words title-cased
  const m = firstLine.match(/^[A-Za-z][^,.]{1,60}/);
  return m ? m[0].trim() : null;
}

function buildEntries(text: string, source: string): MateriaEntry[] {
  const blocks = tokenize(text);
  const entries: MateriaEntry[] = [];
  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];
    const remedy = guessRemedy(block);
    const snippet = block.replace(/\s+/g, ' ').slice(0, 400);
    entries.push({ source, remedy, snippet, index: i });
  }
  return entries;
}

export async function getMateriaIndex(): Promise<MateriaEntry[]> {
  if (cache) return cache;
  const sources = [
    '/data/Boerickes_Materia_Medica.txt',
    '/data/Kents_Lectures_On_Materia_Medica.txt',
    '/data/materia-medica.txt',
  ];
  const texts = await Promise.allSettled(sources.map(fetchText));
  const all: MateriaEntry[] = [];
  texts.forEach((r, idx) => {
    if (r.status === 'fulfilled') {
      all.push(...buildEntries(r.value, sources[idx]));
    }
  });
  cache = all;
  return all;
}

export async function searchMateria(query: string, limit = 50): Promise<MateriaEntry[]> {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const idx = await getMateriaIndex();
  const scored = idx
    .map((e) => {
      const text = `${e.remedy || ''} ${e.snippet}`.toLowerCase();
      const pos = text.indexOf(q);
      if (pos === -1) return { e, score: -1 };
      // simple score: earlier match and remedy-name match boost
      let score = 10000 - pos;
      if (e.remedy && e.remedy.toLowerCase().includes(q)) score += 5000;
      return { e, score };
    })
    .filter((s) => s.score >= 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((s) => s.e);
  return scored;
}
