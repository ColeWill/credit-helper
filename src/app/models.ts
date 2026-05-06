import { Timestamp } from '@angular/fire/firestore';

export type StepStatus = 'not_started' | 'in_progress' | 'complete';
export type DisputeStatus = 'pending' | 'sent' | 'responded' | 'verified' | 'escalated' | 'resolved';
export type Bureau = 'Experian' | 'TransUnion' | 'Equifax';
export type DisputeType =
  | 'not_mine'
  | 'inaccurate'
  | 'no_permissible_purpose'
  | 'medical_debt'
  | 'late_payment'
  | 'hard_inquiry';

export interface UserProfile {
  name: string;
  currentAddress: string;
  previousAddresses: string[];
  phone: string;
  dob: string;
  ssnLast4: string;
  encryptedSSN?: string;
  encryptionIV?: string;
}

export interface StepProgress {
  status: StepStatus;
  startedAt?: Timestamp;
  completedAt?: Timestamp;
  checklistItems?: Record<string, boolean>;
}

export interface Dispute {
  id?: string;
  bureau: Bureau;
  accountName: string;
  accountNumber: string;
  type: DisputeType;
  status: DisputeStatus;
  round: number;
  sentAt?: Timestamp;
  dueAt?: Timestamp;
  responseAt?: Timestamp;
  createdAt?: Timestamp;
}

export interface LetterMeta {
  id?: string;
  type: string;
  bureau: Bureau;
  generatedAt: Timestamp;
  disputeIds: string[];
}
