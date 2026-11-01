export interface WorkItemSection {
  heading: string;
  body: string;
}

export interface WorkItem {
  slug: string;
  title: string;
  /** Short bold description shown in the card body */
  description: string;
  coverImage: string;
  coverImageAlt: string;
  year: string;
  readTime: string;
  /** Number shown on shoulder panel, e.g. 1 → "(1)" */
  index: number;
  /** CSS color for shoulder background on hover */
  shoulderHoverBg: string;
  /** CSS color for shoulder text on hover */
  shoulderHoverText: string;
  role: string;
  client?: string;
  duration?: string;
  sections?: WorkItemSection[];
}

export const workItems: WorkItem[] = [
  {
    slug: 'unblok',
    title: 'Unblok',
    description: 'Coaching and facilitating creativity with Unblok',
    coverImage: '/images/SnNolg0LpTc99fGRTJMVegUsM-a08d86ce.avif',
    coverImageAlt: 'Unblok creative facilitation platform interface',
    year: '2025',
    readTime: '15 mins read',
    index: 1,
    shoulderHoverBg: 'rgb(255, 200, 70)',
    shoulderHoverText: 'rgb(0, 0, 0)',
    role: 'Product Designer & Facilitator',
    client: 'Unblok',
    duration: '4 months',
    sections: [
      { heading: 'The Vision', body: 'Unblok empowers teams to overcome creative blocks through guided facilitation frameworks, micro-exercises, and collaborative workspace tools.' },
      { heading: 'Co-Design & Prototyping', body: 'Iterated through multiple rounds of interactive prototypes with remote workshop leaders.' },
      { heading: 'Outcomes', body: 'Delivered an engaging web application that reduced workshop prep time by 40%.' },
    ],
  },
  {
    slug: 'hse',
    title: 'HSECare',
    description: 'A better healthcare communication system for the Irish with HSECare',
    coverImage: '/images/caP2VLW43rqNG2CPqKyrwRboC4Q-82bdb0ef.avif',
    coverImageAlt: 'HSECare healthcare communication platform',
    year: '2025',
    readTime: '15 mins read',
    index: 2,
    shoulderHoverBg: 'rgb(2, 89, 76)',
    shoulderHoverText: 'rgb(247, 247, 247)',
    role: 'Senior UX & Service Designer',
    client: 'HSE Ireland',
    duration: '5 months',
    sections: [
      { heading: 'The Public Health Challenge', body: 'Navigating public healthcare communications in Ireland presented high cognitive load for patients.' },
      { heading: 'Service Mapping & Accessibility', body: 'Mapped patient and clinician journeys, designed with WCAG 2.2 AA standards.' },
      { heading: 'Key Results', body: 'Decreased missed appointments by 28% in pilot areas.' },
    ],
  },
  {
    slug: 'cardoctor',
    title: 'CarDoctor',
    description: 'Design (rescue) CarDoctor to boost revenue to $1M',
    coverImage: '/images/aI8VV0tWLOHWyjHjV0PCmajNS4-babac17c.avif',
    coverImageAlt: 'CarDoctor app interface showing workshop booking flow',
    year: '2024',
    readTime: '20 mins read',
    index: 3,
    shoulderHoverBg: 'rgb(86, 49, 225)',
    shoulderHoverText: 'rgb(247, 247, 247)',
    role: 'Lead UX Designer',
    client: 'CarDoctor',
    duration: '6 months',
    sections: [
      { heading: 'Overview & Challenge', body: 'CarDoctor was struggling with user drop-off during the workshop booking flow. The goal was to redesign the mobile experience to streamline service booking and establish trust with first-time car owners.' },
      { heading: 'Research & Discovery', body: 'Conducted user interviews with 15 car owners and 5 auto repair shop managers. Key friction points: ambiguous pricing, no real-time scheduling, and complex diagnostics forms.' },
      { heading: 'Solution & Impact', body: 'Redesigned the booking flow into an intuitive 3-step process with transparent pricing and instant garage availability. Post-launch, revenue hit $1M.' },
    ],
  },
  {
    slug: 'cardoctor-ds',
    title: 'CarDoctor Design System',
    description: "Transforming CarDoctor's Design System for 2x agility in 4 months",
    coverImage: '/images/M0C6CJBEbpXmm7Ox7lkhr2iyeg-83ced1ce.avif',
    coverImageAlt: 'CarDoctor design system component library',
    year: '2024',
    readTime: '10 mins read',
    index: 4,
    shoulderHoverBg: 'rgb(105, 122, 255)',
    shoulderHoverText: 'rgb(247, 247, 247)',
    role: 'Design System Lead',
    client: 'CarDoctor',
    duration: '4 months',
    sections: [
      { heading: 'Background & Audit', body: 'Inconsistencies across iOS, Android, and web were slowing release cycles. We needed a unified token system and a robust, accessible component library.' },
      { heading: 'Architecture & Tokens', body: 'Built multi-tiered design tokens for typography, spacing, semantic colors, and elevation. Figma components mapped 1:1 to React Native and Web.' },
      { heading: 'Adoption & Speed', body: 'Engineers reported 2× feature delivery velocity within 4 months of rollout.' },
    ],
  },
  {
    slug: 'breadslice',
    title: 'Breadslice',
    description: '2.5 years, 1 designer and a stillborn Breadslice',
    coverImage: '/images/YIJk6tddnSL6CvqmnWqsCegyc-e30040b1.avif',
    coverImageAlt: 'Breadslice food delivery app interface',
    year: '2021',
    readTime: '10 mins read',
    index: 5,
    shoulderHoverBg: 'rgb(61, 61, 61)',
    shoulderHoverText: 'rgb(247, 247, 247)',
    role: 'Solo Product Designer & Co-founder',
    client: 'Breadslice',
    duration: '2.5 years',
    sections: [
      { heading: 'The Journey & Reflections', body: 'A retrospective on building a food delivery and local bakery platform from concept to MVP.' },
      { heading: 'Design Strategy & Brand', body: 'Crafted the entire brand identity, mobile app, merchant dashboard, and courier routing flows from zero to one.' },
      { heading: 'Key Takeaways', body: 'Gained experience across end-to-end product architecture, customer acquisition, and knowing when to pivot.' },
    ],
  },
];
