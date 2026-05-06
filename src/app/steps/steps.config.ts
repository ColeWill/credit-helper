export interface StepConfig {
  id: string;
  number: number;
  title: string;
  description: string;
  details: string;
}

export const STEPS: StepConfig[] = [
  {
    id: 'step1',
    number: 1,
    title: 'Freeze Secondary Credit Bureaus',
    description: 'Freeze your files with secondary consumer reporting agencies before disputing with the major bureaus.',
    details: 'Prevents major bureaus from easily verifying information through secondary agencies. Must be completed before sending dispute letters.',
  },
  {
    id: 'step2',
    number: 2,
    title: 'Pull Your Credit Reports',
    description: 'Obtain current credit reports from Experian, TransUnion, and Equifax.',
    details: 'Visit AnnualCreditReport.com to get free reports. Review each report carefully and note every negative item.',
  },
  {
    id: 'step3',
    number: 3,
    title: 'Update Personal Information',
    description: 'Send a Personal Information Update Letter to all three bureaus.',
    details: 'Demand deletion of outdated addresses, old phone numbers, incorrect name variations, employer entries, and unnecessary SSN/DOB display.',
  },
  {
    id: 'step4',
    number: 4,
    title: 'Send Round 1 Dispute Letters',
    description: 'Send formal Round 1 Letters demanding physical verification of each negative account.',
    details: 'Under FCRA Section 609(a)(1)(A), bureaus must provide the original signed consumer contract. Any unverifiable account must be deleted.',
  },
  {
    id: 'step5',
    number: 5,
    title: 'Send via Certified Mail',
    description: 'All letters must be sent via Certified Mail with Return Receipt (Green Card).',
    details: 'Do NOT sign the letters. Include copies of photo ID, Social Security card, and a utility bill. Keep all tracking numbers.',
  },
  {
    id: 'step6',
    number: 6,
    title: 'Handle Specific Negative Items',
    description: 'Use tailored dispute letters for collections, medical debt, late payments, and hard inquiries.',
    details: 'Collections: cite 15 USC 1681b(2). Medical: cite No Surprises Act. Late payments: cite 15 USC 1666b(a). Hard inquiries: demand proof of authorization.',
  },
  {
    id: 'step7',
    number: 7,
    title: 'Follow Up and Escalate',
    description: 'Track 30-day response windows and escalate non-compliant bureaus.',
    details: 'No response after 30 days: send follow-up letter. "Frivolous" response: send rebuttal. Verified but inaccurate: send reinvestigation letter. Final: file FTC complaint or intent to sue.',
  },
];
