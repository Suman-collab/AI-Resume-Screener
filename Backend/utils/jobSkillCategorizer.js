const { normalizeRequiredSkills } = require('./skillNormalizer');

const CATEGORY_KEYS = {
  programmingLanguages: 'Programming Languages',
  frameworksLibraries: 'Frameworks & Libraries',
  databases: 'Databases',
  cloudDevOps: 'Cloud & DevOps',
  toolsPlatforms: 'Tools & Platforms',
  methodologies: 'Methodologies & Concepts',
  softSkills: 'Soft Skills',
  otherSkills: 'Other Skills',
};

const CATEGORY_ALIASES = {
  programmingLanguages: /(programming\s+languages?|languages?)$/i,
  frameworksLibraries: /(frameworks?|libraries|frameworks?\s*&\s*libraries)$/i,
  databases: /(databases?|data\s+stores?)$/i,
  cloudDevOps: /(cloud|devops|cloud\s*&\s*devops|infrastructure|platforms?)$/i,
  toolsPlatforms: /(tools?|platforms?|tooling)$/i,
  methodologies: /(concepts?|methodologies|architecture|patterns?)$/i,
  softSkills: /(soft\s+skills?|behaviou?r(al)?\s+skills?)$/i,
  otherSkills: /(skills?|requirements?)$/i,
};

const SKILL_PATTERNS = {
  programmingLanguages: [
    ['JavaScript', /\bjavascript\b|\bjs\b/i],
    ['TypeScript', /\btypescript\b|\bts\b/i],
    ['Python', /\bpython\b/i],
    ['Java', /\bjava\b/i],
    ['C++', /\bc\+\+\b/i],
    ['C#', /\bc#\b|c-sharp/i],
    ['Go', /\bgolang\b|\bgo\b/i],
    ['PHP', /\bphp\b/i],
    ['Ruby', /\bruby\b/i],
    ['Swift', /\bswift\b/i],
    ['Kotlin', /\bkotlin\b/i],
    ['Rust', /\brust\b/i],
    ['SQL', /\bsql\b/i],
  ],
  frameworksLibraries: [
    ['React', /\breact(?:\.js)?\b/i],
    ['Next.js', /\bnext\.?js\b/i],
    ['Angular', /\bangular\b/i],
    ['Vue.js', /\bvue(?:\.js)?\b/i],
    ['Node.js', /\bnode(?:\.js)?\b/i],
    ['Express.js', /\bexpress(?:\.js)?\b/i],
    ['Django', /\bdjango\b/i],
    ['Flask', /\bflask\b/i],
    ['FastAPI', /\bfastapi\b/i],
    ['Spring Boot', /\bspring\s+boot\b/i],
    ['.NET', /\b\.net\b|\bdotnet\b/i],
    ['TensorFlow', /\btensorflow\b/i],
    ['PyTorch', /\bpytorch\b/i],
  ],
  databases: [
    ['MongoDB', /\bmongodb\b/i],
    ['PostgreSQL', /\bpostgres(?:ql)?\b/i],
    ['MySQL', /\bmysql\b/i],
    ['Redis', /\bredis\b/i],
    ['Oracle', /\boracle\b/i],
    ['SQLite', /\bsqlite\b/i],
    ['DynamoDB', /\bdynamodb\b/i],
    ['Elasticsearch', /\belastic(?:search)?\b/i],
  ],
  cloudDevOps: [
    ['AWS', /\baws\b|amazon web services/i],
    ['Azure', /\bazure\b/i],
    ['Google Cloud', /\bgcp\b|google cloud/i],
    ['Docker', /\bdocker\b/i],
    ['Kubernetes', /\bkubernetes\b|\bk8s\b/i],
    ['Terraform', /\bterraform\b/i],
    ['CI/CD', /\bci\/cd\b|\bcontinuous integration\b|\bcontinuous deployment\b/i],
  ],
  toolsPlatforms: [
    ['Git', /\bgit\b/i],
    ['GitHub', /\bgithub\b/i],
    ['GitLab', /\bgitlab\b/i],
    ['Jira', /\bjira\b/i],
    ['Postman', /\bpostman\b/i],
    ['Figma', /\bfigma\b/i],
    ['Linux', /\blinux\b/i],
  ],
  methodologies: [
    ['REST APIs', /\brest(?:ful)?\s+apis?\b|\brest\b/i],
    ['Microservices', /\bmicroservices?\b/i],
    ['System Design', /\bsystem design\b/i],
    ['OOP', /\boop\b|object oriented/i],
    ['Data Structures', /\bdata structures?\b/i],
    ['Algorithms', /\balgorithms?\b/i],
    ['Agile', /\bagile\b/i],
    ['Machine Learning', /\bmachine learning\b/i],
    ['NLP', /\bnlp\b|natural language processing/i],
    ['RAG', /\brag\b|retrieval augmented generation/i],
  ],
  softSkills: [
    ['Communication', /\bcommunication\b/i],
    ['Teamwork', /\bteamwork\b|\bcollaboration\b/i],
    ['Leadership', /\bleadership\b/i],
    ['Problem Solving', /\bproblem solving\b/i],
    ['Analytical Thinking', /\banalytical\b/i],
    ['Time Management', /\btime management\b/i],
  ],
};

const EMPTY_CATEGORIES = () => ({
  programmingLanguages: [],
  frameworksLibraries: [],
  databases: [],
  cloudDevOps: [],
  toolsPlatforms: [],
  methodologies: [],
  softSkills: [],
  otherSkills: [],
});

const addUnique = (collection, value) => {
  if (!value) {
    return;
  }

  if (!collection.some((item) => item.toLowerCase() === value.toLowerCase())) {
    collection.push(value);
  }
};

const getCategoryFromHeading = (heading) =>
  Object.entries(CATEGORY_ALIASES).find(([, regex]) => regex.test(heading || ''))?.[0] || null;

const categorizeKnownSkills = (text, categories) => {
  Object.entries(SKILL_PATTERNS).forEach(([category, patterns]) => {
    patterns.forEach(([label, regex]) => {
      if (regex.test(text)) {
        addUnique(categories[category], label);
      }
    });
  });
};

const categorizeExplicitSkill = (skill, categories) => {
  let matched = false;

  Object.entries(SKILL_PATTERNS).forEach(([category, patterns]) => {
    patterns.forEach(([label, regex]) => {
      if (regex.test(skill)) {
        matched = true;
        addUnique(categories[category], label);
      }
    });
  });

  if (!matched) {
    addUnique(categories.otherSkills, skill);
  }
};

const extractHeadingCategories = (description, categories) => {
  description.split(/\r?\n/).forEach((line) => {
    const match = line.match(/^\s*([A-Za-z/&\s]+?)\s*[:\-]\s*(.+)\s*$/);
    if (!match) {
      return;
    }

    const [, heading, content] = match;
    const categoryKey = getCategoryFromHeading(heading);

    if (!categoryKey) {
      return;
    }

    normalizeRequiredSkills(content).forEach((skill) => addUnique(categories[categoryKey], skill));
  });
};

const flattenCategories = (categories) => {
  const allSkills = [];

  Object.keys(CATEGORY_KEYS).forEach((categoryKey) => {
    categories[categoryKey].forEach((skill) => addUnique(allSkills, skill));
  });

  return allSkills;
};

const categorizeJobSkills = (description = '', requiredSkills = []) => {
  const categories = EMPTY_CATEGORIES();
  const normalizedSkills = normalizeRequiredSkills(requiredSkills);
  const combinedText = `${description}\n${normalizedSkills.join(', ')}`;

  extractHeadingCategories(description, categories);
  categorizeKnownSkills(combinedText, categories);
  normalizedSkills.forEach((skill) => categorizeExplicitSkill(skill, categories));

  return categories;
};

const normalizeSkillCategories = (skillCategories = {}) => {
  const categories = EMPTY_CATEGORIES();

  Object.keys(CATEGORY_KEYS).forEach((categoryKey) => {
    normalizeRequiredSkills(skillCategories[categoryKey] || []).forEach((skill) => addUnique(categories[categoryKey], skill));
  });

  return categories;
};

module.exports = {
  CATEGORY_KEYS,
  categorizeJobSkills,
  flattenCategories,
  normalizeSkillCategories,
};
