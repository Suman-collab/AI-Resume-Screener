const CATEGORY_LABELS = [
  'programming languages',
  'programming language',
  'languages',
  'technical skills',
  'tech stack',
  'frameworks',
  'framework',
  'libraries',
  'library',
  'tools',
  'databases',
  'database',
  'skills',
];

const CATEGORY_LABEL_REGEX = new RegExp(
  `^\\s*(?:${CATEGORY_LABELS.map((label) => label.replace(/\s+/g, '\\s+')).join('|')})\\s*[:\\-]+\\s*`,
  'i'
);

const GENERIC_ONLY_REGEX = new RegExp(
  `^(?:${CATEGORY_LABELS.map((label) => label.replace(/\s+/g, '\\s+')).join('|')})$`,
  'i'
);

const SPLIT_REGEX = /\s*(?:,|\/|\||;|\n|•|\band\b)\s*/i;

const cleanSkill = (value) =>
  value
    .replace(CATEGORY_LABEL_REGEX, '')
    .replace(/^[^A-Za-z0-9+#.]+|[^A-Za-z0-9+#.]+$/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim();

const normalizeRequiredSkills = (requiredSkills = []) => {
  const source = Array.isArray(requiredSkills) ? requiredSkills : [requiredSkills];
  const normalized = [];
  const seen = new Set();

  source.forEach((entry) => {
    if (!entry || typeof entry !== 'string') {
      return;
    }

    entry
      .split(SPLIT_REGEX)
      .map(cleanSkill)
      .filter(Boolean)
      .forEach((skill) => {
        if (GENERIC_ONLY_REGEX.test(skill)) {
          return;
        }

        const key = skill.toLowerCase();
        if (seen.has(key)) {
          return;
        }

        seen.add(key);
        normalized.push(skill);
      });
  });

  return normalized;
};

const normalizeJobSkills = (job) => ({
  ...job,
  requiredSkills: normalizeRequiredSkills(job.requiredSkills),
});

module.exports = {
  normalizeRequiredSkills,
  normalizeJobSkills,
};
