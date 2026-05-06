import { Component, inject, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DisputeService } from './dispute.service';
import { Bureau, DisputeType } from '../models';

@Component({
  selector: 'app-dispute-form',
  imports: [FormsModule],
  template: `
    <div class="form-card">
      <h3>Add Dispute Item</h3>
      @if (error()) { <p class="error">{{ error() }}</p> }
      <form (ngSubmit)="onSubmit()">
        <label>Bureau
          <select [(ngModel)]="bureau" name="bureau" required>
            <option value="">Select bureau</option>
            <option value="Experian">Experian</option>
            <option value="TransUnion">TransUnion</option>
            <option value="Equifax">Equifax</option>
          </select>
        </label>
        <label>Account Name
          <input [(ngModel)]="accountName" name="accountName" required placeholder="e.g. Capital One" />
        </label>
        <label>Account Number (last 4)
          <input [(ngModel)]="accountNumber" name="accountNumber" required placeholder="****1234" maxlength="8" />
        </label>
        <label>Dispute Type
          <select [(ngModel)]="disputeType" name="disputeType" required>
            <option value="">Select type</option>
            <option value="not_mine">Not Mine</option>
            <option value="inaccurate">Inaccurate Information</option>
            <option value="no_permissible_purpose">No Permissible Purpose</option>
            <option value="medical_debt">Medical Debt</option>
            <option value="late_payment">Late Payment</option>
            <option value="hard_inquiry">Unauthorized Hard Inquiry</option>
          </select>
        </label>
        <div class="actions">
          <button type="submit" [disabled]="loading()">{{ loading() ? 'Adding...' : 'Add Dispute' }}</button>
          <button type="button" (click)="cancelled.emit()">Cancel</button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .form-card { background: #f8f9fa; border: 1px solid #e0e0e0; border-radius: 8px; padding: 1.5rem; margin: 1rem 0; }
    form { display: flex; flex-direction: column; gap: .75rem; }
    label { display: flex; flex-direction: column; gap: .25rem; font-size: .9rem; font-weight: 500; }
    input, select { padding: .6rem; border: 1px solid #ccc; border-radius: 4px; font-size: .95rem; }
    .actions { display: flex; gap: .75rem; margin-top: .5rem; }
    button { padding: .6rem 1.2rem; border: none; border-radius: 4px; cursor: pointer; }
    button[type=submit] { background: #1a73e8; color: white; }
    button[type=button] { background: #eee; }
    .error { color: red; font-size: .85rem; }
    button:disabled { opacity: .6; }
  `],
})
export class DisputeFormComponent {
  private disputeService = inject(DisputeService);

  added = output<void>();
  cancelled = output<void>();

  bureau: Bureau | '' = '';
  accountName = '';
  accountNumber = '';
  disputeType: DisputeType | '' = '';
  loading = signal(false);
  error = signal('');

  async onSubmit() {
    if (!this.bureau || !this.disputeType) return;
    this.loading.set(true);
    this.error.set('');
    try {
      await this.disputeService.add({
        bureau: this.bureau,
        accountName: this.accountName,
        accountNumber: this.accountNumber,
        type: this.disputeType,
        status: 'pending',
        round: 1,
      });
      this.added.emit();
      this.bureau = '';
      this.accountName = '';
      this.accountNumber = '';
      this.disputeType = '';
    } catch (e: any) {
      this.error.set(e.message ?? 'Failed to add dispute');
    } finally {
      this.loading.set(false);
    }
  }
}
