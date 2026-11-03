export type Work = {
  company: string
  year: string
  title: string
  readTime: string
  /** Omitted while the case study isn't published yet: the card shows but doesn't link anywhere. */
  href?: string
  image: string
}

export type Extra = {
  title: string
  href: string
  image: string
}

export type PlaygroundItem = {
  image: string
  caption: string
}

export const hero = {
  tagline: 'Helping teams big and small win through solid & playful UX strategies',
  since: '— since 2021',
  currentRole: 'Now at',
  currentCompany: 'IBM Ireland',
}

export const works: Work[] = [
  {
    company: 'IBM',
    year: '2026',
    title: 'Giving IBM Maximo sellers the control they need to cut 30% deal time',
    readTime: '10 mins read',
    href: 'work/mas-pricing',
    image: 'assets/images/home-works-card-mas-pricing.avif',
  },
  {
    company: 'IBM',
    year: '2026',
    title: 'Growth Assessment to improve Maximo maturity for clients',
    readTime: 'Coming soon',
    image: 'assets/images/home-works-card-maximo-growth.png',
  },
  {
    company: 'CarDoctor',
    year: '2024',
    title: 'Design (rescue) CarDoctor to boost revenue to $1M',
    readTime: '10 mins read',
    href: 'work/cardoctor',
    image: 'assets/images/shared-card-cardoctor.avif',
  },
]

export const extras: Extra[] = [
  {
    title: 'Dream hacking to unlock creativity with Unblok and Apple Watch sensors',
    href: 'work/unblok',
    image: 'assets/images/shared-card-unblok-1024w.avif',
  },
  {
    title: "Transforming CarDoctor's Design System for 2x agility within 4 months",
    href: 'work/cardoctor-ds',
    image: 'assets/images/home-readmore-card-cardoctor-ds.avif',
  },
  {
    title: '2.5 years, 1 designer and a stillborn Breadslice',
    href: 'work/breadslice',
    image: 'assets/images/shared-card-breadslice.avif',
  },
]

export const playground: PlaygroundItem[] = [
  {
    image: 'assets/images/home-playground-01.gif',
    caption:
      'Carbon Next visualization for IBM Maximo Predictive asset health and Condition insights, giving a full overview of outstanding asset issues',
  },
  {
    image: 'assets/images/home-playground-02.webp',
    caption:
      'A new expression for AI-native Maximo, designed to hide complexity until complexity becomes useful, to progressively disclose the right action, at the right time.',
  },
  {
    image: 'assets/images/home-playground-03.gif',
    caption:
      "IBM Maximo visualization for modules & AppPoints currency usage, with the aim to help sellers and customers understand what they're using and how much they cost.",
  },
  {
    image: 'assets/images/home-playground-04.avif',
    caption: "Braun Design Playbook concept, with the aim to commemorate Braun's 100th year anniversary.",
  },
  {
    image: 'assets/images/home-playground-05.gif',
    caption: 'Maturity index visualization for IBM Maximo capabilities',
  },
  {
    image: 'assets/images/home-playground-06.gif',
    caption: 'Incident rate cards with data visualization for observability, with IBM Carbon Design System',
  },
  {
    image: 'assets/images/home-playground-07.avif',
    caption:
      'Concept exploration for an architecture agency based in Maynooth, to redesign their current page for more conversions.',
  },
  {
    image: 'assets/images/shared-cards-carousel-anim.webp',
    caption: 'CarDoctor widget cards, giving users insights and notifications about car service progress.',
  },
]

export const about = {
  title: 'Me as a person',
  body: 'Everyday I overthink about how people experiences a product, push through chaos, build with AI, until I see something that finally works.',
  facts: [
    { label: 'Horoscope', value: 'Leo (7 Aug)' },
    { label: 'Illustrations', value: 'by me (yay!)' },
    { label: 'Favorites', value: 'Plushies' },
    { label: 'Fonts', value: 'Mikado' },
  ],
}

export const contact = {
  email: 'kyletrandesign@gmail.com',
  socials: [
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/kyletrandesign/' },
    { label: 'Behance', href: 'https://www.behance.net/tranquang4' },
    { label: 'Instagram', href: 'https://www.instagram.com/teaquang' },
  ],
  copyright: "(c) '26, by Kyle.",
}
