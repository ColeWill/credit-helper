import { DisputeService } from './dispute.service';
import { Dispute } from '../models';
import { Timestamp } from '@angular/fire/firestore';

describe('DisputeService', () => {
  let service: DisputeService;

  beforeEach(() => {
    service = new (DisputeService as any)();
    (service as any).firestore = {};
    (service as any).auth = { uid: 'test-uid' };
  });

  describe('daysUntilDue', () => {
    it('returns null when no dueAt', () => {
      const d = { status: 'sent' } as Dispute;
      expect(service.daysUntilDue(d)).toBeNull();
    });

    it('returns positive days for future due date', () => {
      const future = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);
      const d = { status: 'sent', dueAt: Timestamp.fromDate(future) } as Dispute;
      expect(service.daysUntilDue(d)).toBeGreaterThan(0);
    });

    it('returns negative days for past due date', () => {
      const past = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000);
      const d = { status: 'sent', dueAt: Timestamp.fromDate(past) } as Dispute;
      expect(service.daysUntilDue(d)).toBeLessThan(0);
    });
  });

  describe('isOverdue', () => {
    it('returns true for sent dispute past due date', () => {
      const past = new Date(Date.now() - 1000);
      const d = { status: 'sent', dueAt: Timestamp.fromDate(past) } as Dispute;
      expect(service.isOverdue(d)).toBeTrue();
    });

    it('returns false for non-sent dispute even if past due', () => {
      const past = new Date(Date.now() - 1000);
      const d = { status: 'responded', dueAt: Timestamp.fromDate(past) } as Dispute;
      expect(service.isOverdue(d)).toBeFalse();
    });

    it('returns false for future due date', () => {
      const future = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000);
      const d = { status: 'sent', dueAt: Timestamp.fromDate(future) } as Dispute;
      expect(service.isOverdue(d)).toBeFalse();
    });
  });
});
