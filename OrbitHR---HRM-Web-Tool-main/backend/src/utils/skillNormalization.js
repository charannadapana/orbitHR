export function normalizeSkillName(value = '') {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '')
    .trim();
}

export function normalizeSkillLabel(value = '') {
  return String(value).trim().replace(/\s+/g, ' ');
}

export function findSimilarSkills(skills = [], query = '') {
  const normalizedQuery = normalizeSkillName(query);
  if (!normalizedQuery) {
    return [];
  }

  return skills.filter((skill) => {
    const normalizedName = skill.normalizedName || normalizeSkillName(skill.name);
    return normalizedName.includes(normalizedQuery) || normalizedQuery.includes(normalizedName);
  });
}
