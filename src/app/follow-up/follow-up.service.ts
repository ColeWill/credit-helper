import { Injectable, inject } from '@angular/core';
import {
  Firestore, collection, collectionData, query, where, Timestamp,
} from '@angular/fire/firestore';
import { AuthService } from '../auth/auth.service';
import { Dispute } from '../models';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class FollowUpService {
  private firestore = inject(Firestore);
  private auth = inject(AuthService);

  getOverdue(): Observable<Dispute[]> {
    const col = collection(this.firestore, `users/${this.auth.uid}/disputes`);
    const q = query(col, where('status', '==', 'sent'), where('dueAt', '<', Timestamp.now()));
    return collectionData(q, { idField: 'id' }) as Observable<Dispute[]>;
  }

  canEscalate(dispute: Dispute): boolean {
    return dispute.status === 'verified';
  }

  canFollowUp(dispute: Dispute): boolean {
    return dispute.status === 'sent' && this.isOverdue(dispute);
  }

  isOverdue(dispute: Dispute): boolean {
    if (!dispute.dueAt) return false;
    return dispute.dueAt.toDate().getTime() < Date.now();
  }
}
