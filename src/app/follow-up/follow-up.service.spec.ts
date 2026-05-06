import { TestBed } from '@angular/core/testing';
import { Firestore } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { FollowUpService } from './follow-up.service';
import { Dispute } from '../models';
import { Timestamp } from '@angular/fire/firestore';

describe('FollowUpService', () => {
  let service: FollowUpService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        FollowUpService,
        { provide: Firestore, useValue: {} },
        { provide: Auth, useValue: { onAuthStateChanged: () => () => {} } },
      ],
    });
    service = TestBed.inject(FollowUpService);
  });

  describe('isOverdue', () => {
    it('returns true when dueAt is in the past', () => {
      const past = Timestamp.fromDate(new Date(Date.now() - 1000));
      expect(service.isOverdue({ dueAt: past } as Dispute)).toBeTrue();
    });

    it('returns false when dueAt is in the future', () => {
      const future = Timestamp.fromDate(new Date(Date.now() + 1000000));
      expect(service.isOverdue({ dueAt: future } as Dispute)).toBeFalse();
    });

    it('returns false when no dueAt', () => {
      expect(service.isOverdue({} as Dispute)).toBeFalse();
    });
  });

  describe('canEscalate', () => {
    it('returns true only for verified status', () => {
      expect(service.canEscalate({ status: 'verified' } as Dispute)).toBeTrue();
      expect(service.canEscalate({ status: 'sent' } as Dispute)).toBeFalse();
      expect(service.canEscalate({ status: 'pending' } as Dispute)).toBeFalse();
    });
  });

  describe('canFollowUp', () => {
    it('returns true for overdue sent dispute', () => {
      const past = Timestamp.fromDate(new Date(Date.now() - 1000));
      expect(
        service.canFollowUp({ status: 'sent', dueAt: past } as Dispute),
      ).toBeTrue();
    });

    it('returns false for non-overdue sent dispute', () => {
      const future = Timestamp.fromDate(new Date(Date.now() + 1000000));
      expect(
        service.canFollowUp({ status: 'sent', dueAt: future } as Dispute),
      ).toBeFalse();
    });

    it('returns false for responded dispute even if overdue', () => {
      const past = Timestamp.fromDate(new Date(Date.now() - 1000));
      expect(
        service.canFollowUp({ status: 'responded', dueAt: past } as Dispute),
      ).toBeFalse();
    });
  });
});
