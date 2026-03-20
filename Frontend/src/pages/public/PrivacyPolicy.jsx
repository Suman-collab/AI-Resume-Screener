import LegalDocument from '../../components/LegalDocument';

const sections = [
  {
    heading: 'Information we collect',
    paragraphs: [
      'When you create an account, we may collect details such as your name, email address, role, resumes, job descriptions, and application activity.',
      'We may also collect technical information needed to operate the product, such as request logs, session details, and device or browser information.',
    ],
  },
  {
    heading: 'How we use information',
    paragraphs: [
      'We use submitted information to authenticate users, process applications, analyze resumes, rank candidates, and improve the quality of platform features.',
      'Your data may also be used to troubleshoot issues, prevent abuse, and maintain service security.',
    ],
  },
  {
    heading: 'Sharing and processors',
    paragraphs: [
      'We do not sell personal data. Information may be processed by service providers that support hosting, databases, authentication, analytics, or AI-powered analysis.',
      'These providers only receive the information needed to perform their services for the platform.',
    ],
  },
  {
    heading: 'Retention and security',
    paragraphs: [
      'We keep information for as long as it is needed to provide the service, comply with legal obligations, resolve disputes, or enforce platform policies.',
      'We use reasonable technical and organizational measures to protect stored information, but no system can guarantee absolute security.',
    ],
  },
  {
    heading: 'Your choices',
    paragraphs: [
      'You can choose what information you upload and may stop using the platform at any time. If you need account or data assistance, contact the platform team.',
      'Please avoid uploading sensitive personal information unless it is necessary for your hiring or job search workflow.',
    ],
  },
];

const PrivacyPolicy = () => {
  return (
    <LegalDocument
      title="Privacy Policy"
      subtitle="This policy explains what information ATS Analyzer handles, why it is used, and the choices available to users."
      lastUpdated="March 15, 2026"
      sections={sections}
    />
  );
};

export default PrivacyPolicy;
