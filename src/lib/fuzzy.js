const BOUNDARY = /[\s\-_./]/;

export function fuzzyMatch(query, target) {
  if (!query) return { score: 0, indices: [] };

  const q = query.toLowerCase();
  const t = target.toLowerCase();

  const indices = [];
  let score = 0;
  let ti = 0;
  let run = 0;

  for (let qi = 0; qi < q.length; qi += 1) {
    const ch = q[qi];
    let found = -1;

    for (let i = ti; i < t.length; i += 1) {
      if (t[i] !== ch) continue;
      found = i;
      break;
    }
    if (found === -1) return null;

    if (found === ti && qi > 0) {
      run += 1;
      score += 8 + run * 4;
    } else {
      run = 0;
      score += 1;
    }

    if (found === 0) score += 12;
    else if (BOUNDARY.test(target[found - 1])) score += 8;

    score -= Math.min(found - ti, 6);

    indices.push(found);
    ti = found + 1;
  }

  score -= target.length * 0.12;

  return { score, indices };
}

export function rankFiles(files, query) {
  if (!query.trim()) {
    return files.map((file) => ({ file, indices: [], score: 0 }));
  }

  const q = query.trim();
  const out = [];

  for (const file of files) {
    const byName = fuzzyMatch(q, file.name);
    const path = file.parent ? `${file.parent}/${file.name}` : file.name;
    const byPath = fuzzyMatch(q, path);

    if (!byName && !byPath) continue;

    if (byName && (!byPath || byName.score >= byPath.score - 6)) {
      out.push({ file, indices: byName.indices, score: byName.score + 6 });
    } else {
      const offset = path.length - file.name.length;
      out.push({
        file,
        indices: byPath.indices.map((i) => i - offset).filter((i) => i >= 0),
        score: byPath.score,
      });
    }
  }

  return out.sort((a, b) => b.score - a.score);
}
