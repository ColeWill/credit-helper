import { Injectable, inject } from '@angular/core';
import {
  Firestore, collection, collectionData, doc, addDoc, updateDoc, deleteDoc, Timestamp,
} from '@angular/fire/firestore';
import { AuthService } from '../auth/auth.service';
import { Dispute, DisputeStatus } from '../models';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class DisputeService {
  private firestore = inject(Firestore);
  private auth = inject(AuthService);

  private col() {
    return collection(this.firestore, `users/${this.auth.uid}/disputes`);
  }

  getAll(): Observable<Dispute[]> {
    return collectionData(this.col(), { idField: 'id' }) as Observable<Dispute[]>;
  }

  async add(dispute: Omit<Dispute, 'id'>): Promise<void> {
    await addDoc(this.col(), { ...dispute, createdAt: Timestamp.now() });
  }

  async updateStatus(id: string, status: DisputeStatus): Promise<void> {
    const ref = doc(this.firestore, `users/${this.auth.uid}/disputes/${id}`);
    const update: any = { status };
    if (status === 'sent') {
      update.sentAt = Timestamp.now();
      update.dueAt = Timestamp.fromDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000));
    }
    if (status === 'responded') update.responseAt = Timestamp.now();
    await updateDoc(ref, update);
  }

  async delete(id: string): Promise<void> {
    await deleteDoc(doc(this.firestore, `users/${this.auth.uid}/disputes/${id}`));
  }

  daysUntilDue(dispute: Dispute): number | null {
    if (!dispute.dueAt) return null;
    const ms = dispute.dueAt.toDate().getTime() - Date.now();
    return Math.ceil(ms / (1000 * 60 * 60 * 24));
  }

  isOverdue(dispute: Dispute): boolean {
    const days = this.daysUntilDue(dispute);
    return days !== null && days < 0 && dispute.status === 'sent';
  }
}
