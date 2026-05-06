import { LetterService } from './letter.service';
import { UserProfile, Dispute } from '../models';

describe('LetterService', () => {
  let service: LetterService;

  const profile: UserProfile = {
    name: 'John Doe',
    currentAddress: '123 Main St, Springfield, IL 62701',
    previousAddresses: [],
    phone: '555-1234',
    dob: '1985-06-15',
    ssnLast4: '6789',
  };

  const disputes: Dispute[] = [
    { bureau: 'Experian', accountName: 'Capital One', accountNumber: '****1234', type: 'not_mine', status: 'pending', round: 1 },
  ];

  const ssn = '123-45-6789';

  beforeEach(() => {
    service = new (LetterService as any)();
    (service as any).firestore = {};
    (service as any).auth = { uid: 'test-uid' };
  });

  it('personal info update letter contains name and address', () => {
    const html = service.generatePersonalInfoUpdateLetter(profile, 'Experian', ssn);
    expect(html).toContain('John Doe');
    expect(html).toContain('123 Main St');
  });

  it('round1 letter contains FCRA citation', () => {
    const html = service.generateRound1Letter(profile, 'Experian', disputes, ssn);
    expect(html).toContain('609');
    expect(html).toContain('Capital One');
    expect(html).toContain(ssn);
  });

  it('follow-up letter contains 30-day violation reference', () => {
    const html = service.generateFollowUpLetter(profile, 'TransUnion', disputes, ssn);
    expect(html).toContain('30 days');
    expect(html).toContain('1681i');
  });

  it('reinvestigation letter demands verifier info', () => {
    const html = service.generateReinvestigationLetter(profile, 'Equifax', disputes, ssn);
    expect(html).toContain('1681i');
    expect(html).toContain('name, address');
  });

  it('escalation letter contains lawsuit intent', () => {
    const html = service.generateEscalationLetter(profile, 'Experian', disputes, ssn);
    expect(html).toContain('lawsuit');
    expect(html).toContain('1681n');
  });

  it('htmlToPlainText strips tags', () => {
    const text = service.htmlToPlainText('<p>Hello <strong>World</strong></p>');
    expect(text).toContain('Hello');
    expect(text).toContain('World');
    expect(text).not.toContain('<p>');
  });
});
