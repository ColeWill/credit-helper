import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LetterService, LetterType } from './letter.service';
import { ProfileService } from '../profile/profile.service';
import { DisputeService } from '../disputes/dispute.service';
import { Bureau } from '../models';

@Component({
  selector: 'app-letter-preview',
  template: `
    <div class="container">
      <div class="toolbar no-print">
        <button (click)="activeTab.set('preview')" [class.active]="activeTab() === 'preview'">Preview</button>
        <button (click)="activeTab.set('text')" [class.active]="activeTab() === 'text'">Plain Text</button>
        <button (click)="print()">🖨 Print</button>
        <button (click)="copy()">📋 {{ copied() ? 'Copied!' : 'Copy Text' }}</button>
      </div>

      @if (loading()) {
        <p>Generating letter...</p>
      } @else if (error()) {
        <p class="error">{{ error() }}</p>
      } @else {
        @if (activeTab() === 'preview') {
          <div class="letter-preview" [innerHTML]="html()"></div>
        } @else {
          <pre class="plain-text">{{ plainText() }}</pre>
        }
      }
    </div>
  `,
  styles: [`
    .container { max-width: 800px; margin: 2rem auto; padding: 1rem; }
    .toolbar { display: flex; gap: .5rem; margin-bottom: 1.5rem; flex-wrap: wrap; }
    button { padding: .5rem 1rem; border: 1px solid #ccc; border-radius: 4px; cursor: pointer; background: white; }
    button.active { background: #1a73e8; color: white; border-color: #1a73e8; }
    .letter-preview { border: 1px solid #ccc; padding: 2rem; font-family: 'Times New Roman', serif; line-height: 1.6; }
    .plain-text { white-space: pre-wrap; font-family: monospace; background: #f8f9fa; padding: 1.5rem; border: 1px solid #e0e0e0; border-radius: 4px; }
    .error { color: red; }
    @media print {
      .no-print { display: none; }
      .letter-preview { border: none; padding: 0; }
    }
  `],
})
export class LetterPreviewComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private letterService = inject(LetterService);
  private profileService = inject(ProfileService);
  private disputeService = inject(DisputeService);

  activeTab = signal<'preview' | 'text'>('preview');
  html = signal('');
  plainText = signal('');
  loading = signal(true);
  error = signal('');
  copied = signal(false);

  async ngOnInit() {
    const params = this.route.snapshot.queryParams;
    const type = params['type'] as LetterType;
    const bureau = params['bureau'] as Bureau;
    const disputeIds: string[] = params['disputeIds'] ? params['disputeIds'].split(',') : [];

    try {
      const profile = await this.profileService.getProfile();
      if (!profile) throw new Error('Please complete your profile first.');

      const ssn = await this.profileService.getDecryptedSSN() ?? `***-**-${profile.ssnLast4}`;
      const allDisputes = await new Promise<any[]>(resolve => {
        this.disputeService.getAll().subscribe(d => resolve(d));
      });
      const disputes = disputeIds.length
        ? allDisputes.filter(d => disputeIds.includes(d.id))
        : allDisputes.filter(d => d.bureau === bureau);

      let letterHtml = '';
      switch (type) {
        case 'personal_info_update':
          letterHtml = this.letterService.generatePersonalInfoUpdateLetter(profile, bureau, ssn); break;
        case 'round1':
          letterHtml = this.letterService.generateRound1Letter(profile, bureau, disputes, ssn); break;
        case 'follow_up':
          letterHtml = this.letterService.generateFollowUpLetter(profile, bureau, disputes, ssn); break;
        case 'reinvestigation':
          letterHtml = this.letterService.generateReinvestigationLetter(profile, bureau, disputes, ssn); break;
        case 'escalation':
          letterHtml = this.letterService.generateEscalationLetter(profile, bureau, disputes, ssn); break;
        default:
          throw new Error('Unknown letter type');
      }

      this.html.set(letterHtml);
      this.plainText.set(this.letterService.htmlToPlainText(letterHtml));
      await this.letterService.saveLetterMeta(type, bureau, disputeIds);
    } catch (e: any) {
      this.error.set(e.message ?? 'Failed to generate letter');
    } finally {
      this.loading.set(false);
    }
  }

  print() { window.print(); }

  async copy() {
    await navigator.clipboard.writeText(this.plainText());
    this.copied.set(true);
    setTimeout(() => this.copied.set(false), 2000);
  }
}
