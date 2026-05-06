export interface SecondaryAgency {
  key: string;
  name: string;
  method: 'online' | 'mail' | 'phone';
  url?: string;
  instructions: string;
}

export const SECONDARY_AGENCIES: SecondaryAgency[] = [
  {
    key: 'lexisnexis',
    name: 'LexisNexis',
    method: 'online',
    url: 'https://consumer.risk.lexisnexis.com/freeze',
    instructions: 'Request a security freeze online or via mail.',
  },
  {
    key: 'innovis',
    name: 'Innovis',
    method: 'online',
    url: 'https://www.innovis.com/personal/securityFreeze',
    instructions: 'Request a security freeze online.',
  },
  {
    key: 'teletrack',
    name: 'Teletrack',
    method: 'phone',
    instructions: 'Call 1-877-309-5226 to request a security freeze.',
  },
  {
    key: 'sagestream',
    name: 'SageStream',
    method: 'online',
    url: 'https://www.sagestreamllc.com/security-freeze/',
    instructions: 'Request a security freeze online.',
  },
  {
    key: 'clarity',
    name: 'Clarity Services',
    method: 'online',
    url: 'https://www.clarityservices.com/freeze',
    instructions: 'Request a security freeze online.',
  },
  {
    key: 'factortrust',
    name: 'Factor Trust',
    method: 'online',
    url: 'https://www.factortrust.com',
    instructions: 'Request a security freeze via their consumer portal.',
  },
  {
    key: 'datax',
    name: 'DataX',
    method: 'phone',
    instructions: 'Call 1-800-295-4790 to request a security freeze.',
  },
  {
    key: 'microbilt',
    name: 'Microbilt',
    method: 'mail',
    instructions: 'Download and mail their security freeze form from microbilt.com.',
  },
  {
    key: 'lci',
    name: 'Lindquist Consulting (LCI)',
    method: 'phone',
    instructions: 'Call to opt-out if you have bankruptcy-related items on your report.',
  },
];
