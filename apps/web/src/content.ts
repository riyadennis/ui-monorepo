// Personal site content, ported from https://www.riyadennis.com/

export const profile = {
  name: 'Riya Dennis',
  tagline: 'Backend systems engineer — Go & Kubernetes',
  bio: `I have over 12 years of experience in designing and developing backend systems for web and mobile applications. The technologies I am passionate about are Go and Kubernetes which enable me to engineer solutions that are highly performant and scalable, and can be developed efficiently and deployed to the cloud. I am an avid learner and am continuously looking for opportunities to learn new technologies and approaches. I am also committed to sharing my knowledge and actively mentor and coach junior members of my team and organization. Culture and collaboration are the key values I stand for. I believe with the right people and technology we can make the world a better place.`,
};

export const skills: string[] = [
  'Go',
  'Kubernetes',
  'Kafka',
  'PostgreSQL',
  'Argo CD',
  'Docker Compose',
  'Microservices',
  'AWS',
  'CI/CD (SonarQube, CircleCI, Helm)',
  'Test-driven development',
];

export interface Experience {
  company: string;
  role: string;
  period: string;
  description: string;
}

export const experience: Experience[] = [
  {
    company: 'Integrate',
    role: 'Senior Software Engineer',
    period: 'March 2020',
    description:
      "Worked on migrating Integrate's event management platform from a monolith to micro services architecture. Services are deployed in AWS and developed in Kubernetes cluster from local to production. Followed best practices in the industry like ninety percent test coverage, CI, CD using tools like SonarQube, CircleCI, Helm to develop and deliver software.",
  },
  {
    company: 'Yoti',
    role: 'Software Engineer',
    period: 'July 2018',
    description:
      "Worked on Yoti's backend system that enables users to prove their digital identity. My focus was mainly on integrating API's of identity providers to secure services written in Golang running on Docker and Kubernetes using a micro services architecture.",
  },
  {
    company: "Sainsbury's",
    role: 'Software Engineer',
    period: '2015',
    description:
      "Worked on the micro services of an in house smart checkout project called smartshop for Sainsbury's. I was actively involved in the full life cycle of the product from its pilot state in two stores to a full fledged application.",
  },
  {
    company: 'Premier IT',
    role: 'Web Developer',
    period: '2013',
    description:
      'Developed PReP (revalidation management system) and HeART (e-Portfolio system for healthcare professionals).',
  },
  {
    company: 'Flubit',
    role: 'Web Developer',
    period: '2012',
    description:
      'Developed Automated Product Match, Merchant Application Integration, Customer Email Notification Service and Flubit Admin Center.',
  },
  {
    company: 'Infowave Knowledgeware',
    role: 'Web Developer',
    period: '2008',
    description:
      'Involved in a migration project for a content management system from a PHP framework called CodeIgniter to Yii. Designed database schema for the new application and wrote the SOAP API’s for a Flex-based front end client.',
  },
];

export interface Project {
  title: string;
  description: string;
  tech: string[];
  href?: string;
  /** Internal route for an interactive demo. */
  demo?: string;
}

export const projects: Project[] = [
  {
    title: 'pbac',
    description:
      'Policy-based access control service in Go. Stores structured policy definitions, compiles them to Rego v1, and evaluates them with OPA over a REST + GraphQL API.',
    tech: ['Go', 'chi', 'PostgreSQL', 'OPA / Rego', 'GraphQL'],
    href: 'https://github.com/riyadennis/pbac',
    demo: '/playground/pbac',
  },
  {
    title: 'ui-monorepo',
    description:
      'This site. An npm-workspaces monorepo with a Vite + React app and shared TypeScript packages for a design system, a Rego builder, and a typed pbac API client.',
    tech: ['TypeScript', 'React', 'Vite', 'npm workspaces'],
    href: 'https://github.com/riyadennis/ui-monorepo',
  },
  {
    title: 'Rego generator',
    description:
      'An interactive builder that generates idiomatic Rego v1 policy source from allow/deny conditions, powered by the @ui-monorepo/rego package.',
    tech: ['TypeScript', 'React', 'Rego'],
    demo: '/playground/rego',
  },
  {
    title: 'pbac policy playground',
    description:
      'A live UI over the pbac REST API: build a structured policy definition and create, list, evaluate, and delete policies against the running service.',
    tech: ['React', 'REST', 'OPA / Rego'],
    demo: '/playground/pbac',
  },
];

export interface Post {
  title: string;
  date: string;
  summary?: string;
  href: string;
}

export const posts: Post[] = [
  {
    title: 'Striving for perfection every day',
    date: '2022-09-13',
    summary: 'Striving for perfection every day.',
    href: 'https://www.riyadennis.com/blog/732bbe72283',
  },
  {
    title: 'Event Driven Systems',
    date: '2021-08-06',
    href: 'https://www.riyadennis.com/blog/event-driven-systems',
  },
  {
    title: 'Go core values',
    date: '2021-06-29',
    href: 'https://www.riyadennis.com/blog/go-core-values',
  },
];

export interface SocialLink {
  label: string;
  href: string;
}

export const socials: SocialLink[] = [
  { label: 'GitHub', href: 'https://github.com/riyadennis' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/riya-dennis-b631a026/' },
  { label: 'Twitter', href: 'https://twitter.com/riyadennis' },
  { label: 'Goodreads', href: 'https://www.goodreads.com/review/list/56127657-riya' },
];
