import { Injectable, inject } from '@angular/core';
import {
  Firestore, doc, setDoc, getDoc, collection, collectionData, query, where, Timestamp,
} from '@angular/fire/firestore';
import { AuthService } from '../auth/auth.service';
import { StepProgress, StepStatus, Dispute } from '../models';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ProgressService {
  private firestore = inject(Firestore);
  private auth = inject(AuthService);

  private stepDoc(stepId: string) {
    return doc(this.firestore, `users/${this.auth.uid}/steps/${stepId}`);
  }

  async getStepProgress(stepId: string): Promise<StepProgress> {
    const snap = await getDoc(this.stepDoc(stepId));
    return snap.exists() ? (snap.data() as StepProgress) : { status: 'not_started' };
  }

  async updateStepStatus(stepId: string, status: StepStatus): Promise<void> {
    const update: Partial<StepProgress> = { status };
    if (status === 'in_progress') update.startedAt = Timestamp.now();
    if (status === 'complete') update.completedAt = Timestamp.now();
    await setDoc(this.stepDoc(stepId), update, { merge: true });
  }

  async updateChecklistItem(stepId: string, itemKey: string, checked: boolean): Promise<void> {
    await setDoc(this.stepDoc(stepId), { checklistItems: { [itemKey]: checked } }, { merge: true });
  }

  getDisputes(): Observable<Dispute[]> {
    const col = collection(this.firestore, `users/${this.auth.uid}/disputes`);
    return collectionData(col, { idField: 'id' }) as Observable<Dispute[]>;
  }

  getOverdueDisputes(): Observable<Dispute[]> {
    const col = collection(this.firestore, `users/${this.auth.uid}/disputes`);
    const q = query(col, where('status', '==', 'sent'), where('dueAt', '<', Timestamp.now()));
    return collectionData(q, { idField: 'id' }) as Observable<Dispute[]>;
  }
}
