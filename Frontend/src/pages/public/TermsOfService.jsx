import LegalDocument from '../../components/LegalDocument';

const sections = [
  {
    heading: 'Using the platform',
    paragraphs: [
      'ATS Analyzer helps job seekers review resumes and helps recruiters evaluate applications. You may use the platform only for lawful hiring, job search, and resume analysis activities.',
      'You agree not to misuse the service, interfere with normal operation, upload harmful files, or submit content that violates another person\'s rights.',
    ],
  },
  {
    heading: 'Accounts and access',
    paragraphs: [
      'You are responsible for keeping your account credentials secure and for all activity that happens under your account.',
      'If you believe your account has been accessed without permission, notify the team and change your password as soon as possible.',
    ],
  },
  {
    heading: 'Uploaded content',
    paragraphs: [
      'You retain ownership of resumes, job descriptions, and other content you upload. By uploading content, you allow the platform to process it for resume analysis, matching, ranking, and application workflows.',
      'You should only upload information that you have the right to share and that is necessary for recruiting or job application purposes.',
    ],
  },
  {
    heading: 'Service availability',
    paragraphs: [
      'We may update, improve, or temporarily suspend parts of the service as we maintain the platform. Features that rely on AI or third-party services may occasionally be unavailable or return imperfect results.',
      'You should review important hiring or career decisions independently and not rely only on automated output.',
    ],
  },
  {
    heading: 'Termination',
    paragraphs: [
      'We may suspend or remove access if an account is used in a way that creates risk for other users, violates these terms, or harms the platform.',
      'You may stop using the service at any time.',
    ],
  },
];

const TermsOfService = () => {
  return (
    <LegalDocument
      title="Terms of Service"
      subtitle="These terms explain the basic rules for using ATS Analyzer, including account use, uploaded content, and service expectations."
      lastUpdated="March 15, 2026"
      sections={sections}
    />
  );
};

export default TermsOfService;
