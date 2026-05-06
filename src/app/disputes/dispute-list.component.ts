import { Component, inject, input } from '@angular/core';
import { Router } from '@angular/router';
import { DisputeService } from './dispute.service';
import { Dispute, Bureau, DisputeStatus } from '../models';
import { LetterService } from '../letters/letter.service';
import { ProfileService } from '../profile/profile.service';

const BUREAUS: Bureau[] = ['Experian', 'TransUnion', 'Equifax'];

const DISPUTE_TYPE_LABELS: Record<string, string> = {
  not_mine: 'Not Mine',
  inaccurate: 'Inaccurate',
  no_permissible_purpose: 'No Permissible Purpose',
  medical_debt: 'Medical Debt',
  late_payment: 'Late Payment',
  hard_inquiry: 'Hard Inquiry',
};

@Component({
  selector: 'app-dispute-list',
  template: `
    <div class="dispute-list">
      @for (bureau of bureaus; track bureau) {
        @let bureauDisputes = disputesByBureau(bureau);
        @if (bureauDisputes.length > 0) {
          <div class="bureau-group">
            <h4>{{ bureau }}</h4>
            @for (d of bureauDisputes; track d.id) {
              <div class="dispute-item" [class.overdue]="disputeService.isOverdue(d)">
                <div class="dispute-info">
                  <strong>{{ d.accountName }}</strong>
                  <span class="account-num">{{ d.accountNumber }}</span>
                  <span class="type-label">{{ typeLabel(d.type) }}</span>
                </div>
                <div class="dispute-meta">
                  <span class="badge" [class]="d.status">{{ d.status }}</span>
                  @if (d.dueAt && d.status === 'sent') {
                    @let days = disputeService.daysUntilDue(d);
                    <span class="countdown" [class.overdue]="(days ?? 0) < 0">
                      {{ (days ?? 0) < 0 ? 'Overdue by ' + (days! * -1) + 'd' : days + 'd left' }}
                    </span>
                  }
                </div>
                <div class="dispute-actions">
                  @if (d.status === 'pending') {
                    <button (click)="updateStatus(d, 'sent')">Mark Sent</button>
                  }
                  @if (d.status === 'sent') {
                    <button (click)="updateStatus(d, 'responded')">Mark Responded</button>
                  }
                  @if (d.status === 'responded') {
                    <button (click)="updateStatus(d, 'verified')">Mark Verified</button>
                    <button (click)="updateStatus(d, 'resolved')">Mark Resolved</button>
                  }
                  @if (d.status === 'verified') {
                    <button (click)="updateStatus(d, 'escalated')">Escalate</button>
                  }
                  <button class="delete-btn" (click)="delete(d)">✕</button>
                </div>
              </div>
            }
          </div>
        }
      }
      @if (disputes().length === 0) {
        <p class="empty">No disputes added yet. Click "Add Dispute" to get started.</p>
      }
    </div>
  `,
  styles: [`
    .bureau-group { margin-bottom: 1.5rem; }
    h4 { font-size: .95rem; color: #555; border-bottom: 1px solid #eee; padding-bottom: .25rem; margin-bottom: .75rem; }
    .dispute-item { display: flex; flex-wrap: wrap; gap: .5rem; align-items: center; padding: .75rem; border: 1px solid #e0e0e0; border-radius: 6px; margin-bottom: .5rem; background: white; }
    .dispute-item.overdue { border-color: #ea4335; background: #fff8f7; }
    .dispute-info { flex: 1; min-width: 200px; display: flex; flex-direction: column; gap: .15rem; }
    .account-num { font-size: .8rem; color: #888; }
    .type-label { font-size: .8rem; color: #555; }
    .dispute-meta { display: flex; gap: .5rem; align-items: center; }
    .badge { padding: .2rem .5rem; border-radius: 10px; font-size: .75rem; font-weight: 600; }
    .badge.pending { background: #f1f3f4; color: #666; }
    .badge.sent { background: #e8f0fe; color: #1a73e8; }
    .badge.responded { background: #fce8e6; color: #ea4335; }
    .badge.verified { background: #fff3e0; color: #f57c00; }
    .badge.escalated { background: #fce8e6; color: #c62828; }
    .badge.resolved { background: #e6f4ea; color: #34a853; }
    .countdown { font-size: .8rem; font-weight: 600; color: #1a73e8; }
    .countdown.overdue { color: #ea4335; }
    .dispute-actions { display: flex; gap: .4rem; flex-wrap: wrap; }
    button { padding: .3rem .7rem; border: 1px solid #ccc; border-radius: 4px; cursor: pointer; font-size: .8rem; background: white; }
    button:hover { background: #f1f3f4; }
    .delete-btn { color: #ea4335; border-color: #ea4335; }
    .empty { color: #888; font-style: italic; }
  `],
})
export class DisputeListComponent {
  disputes = input.required<Dispute[]>();
  disputeService = inject(DisputeService);

  bureaus = BUREAUS;

  disputesByBureau(bureau: Bureau): Dispute[] {
    return this.disputes().filter(d => d.bureau === bureau);
  }

  typeLabel(type: string): string {
    return DISPUTE_TYPE_LABELS[type] ?? type;
  }

  async updateStatus(dispute: Dispute, status: DisputeStatus) {
    await this.disputeService.updateStatus(dispute.id!, status);
  }

  async delete(dispute: Dispute) {
    if (confirm(`Delete dispute for ${dispute.accountName}?`)) {
      await this.disputeService.delete(dispute.id!);
    }
  }
}
