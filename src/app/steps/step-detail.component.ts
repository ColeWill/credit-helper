import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { STEPS } from './steps.config';
import { ProgressService } from './progress.service';
import { DisputeService } from '../disputes/dispute.service';
import { DisputeFormComponent } from '../disputes/dispute-form.component';
import { DisputeListComponent } from '../disputes/dispute-list.component';
import { SecondaryBureauChecklistComponent } from './secondary-bureau-checklist.component';
import { StepProgress, Dispute, Bureau } from '../models';

const BUREAUS: Bureau[] = ['Experian', 'TransUnion', 'Equifax'];
const LETTER_STEPS = ['step3', 'step4', 'step6', 'step7'];

@Component({
  selector: 'app-step-detail',
  imports: [RouterLink, DisputeFormComponent, DisputeListComponent, SecondaryBureauChecklistComponent],
  template: `
    <div class="container">
      <a routerLink="/dashboard" class="back-link">← Back to Dashboard</a>

      @if (step) {
        <div class="step-header">
          <div>
            <span class="step-num">Step {{ step.number }}</span>
            <h2>{{ step.title }}</h2>
          </div>
          <div class="status-controls">
            <span class="badge" [class]="progress().status">{{ statusLabel(progress().status) }}</span>
            @if (progress().status === 'not_started') {
              <button (click)="setStatus('in_progress')">Start Step</button>
            }
            @if (progress().status === 'in_progress') {
              <button (click)="setStatus('complete')">Mark Complete</button>
            }
          </div>
        </div>

        <div class="step-details">
          <p>{{ step.description }}</p>
          <p class="detail-text">{{ step.details }}</p>
        </div>

        @if (step.id === 'step1') {
          <app-secondary-bureau-checklist (allComplete)="setStatus('complete')" />
        }

        @if (showDisputeSection()) {
          <div class="disputes-section">
            <div class="section-header">
              <h3>Dispute Items</h3>
              <button (click)="showForm.set(!showForm())">
                {{ showForm() ? 'Cancel' : '+ Add Dispute' }}
              </button>
            </div>

            @if (showForm()) {
              <app-dispute-form (added)="showForm.set(false)" (cancelled)="showForm.set(false)" />
            }

            <app-dispute-list [disputes]="disputes()" />
          </div>

          @if (disputes().length > 0) {
            <div class="letters-section">
              <h3>Generate Letters</h3>
              <div class="letter-buttons">
                @for (bureau of bureaus; track bureau) {
                  @let bureauDisputes = disputesByBureau(bureau);
                  @if (bureauDisputes.length > 0) {
                    <button (click)="generateLetter(bureau)">
                      Generate {{ letterTypeLabel() }} — {{ bureau }}
                    </button>
                  }
                }
              </div>
            </div>
          }
        }
      } @else {
        <p>Step not found.</p>
      }
    </div>
  `,
  styles: [`
    .container { max-width: 800px; margin: 0 auto; padding: 1.5rem; }
    .back-link { color: #1a73e8; text-decoration: none; font-size: .9rem; }
    .step-header { display: flex; justify-content: space-between; align-items: flex-start; margin: 1rem 0; flex-wrap: wrap; gap: 1rem; }
    .step-num { font-size: .85rem; color: #888; display: block; }
    h2 { margin: .25rem 0 0; }
    .status-controls { display: flex; gap: .75rem; align-items: center; }
    .badge { padding: .3rem .7rem; border-radius: 12px; font-size: .8rem; font-weight: 600; }
    .badge.not_started { background: #f1f3f4; color: #666; }
    .badge.in_progress { background: #e8f0fe; color: #1a73e8; }
    .badge.complete { background: #e6f4ea; color: #34a853; }
    button { padding: .5rem 1rem; border: 1px solid #ccc; border-radius: 4px; cursor: pointer; background: white; }
    .step-details { background: #f8f9fa; border-radius: 8px; padding: 1rem; margin-bottom: 1.5rem; }
    .step-details p { margin: .25rem 0; }
    .detail-text { color: #555; font-size: .9rem; }
    .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
    h3 { margin: 0; }
    .disputes-section, .letters-section { margin-top: 1.5rem; }
    .letter-buttons { display: flex; gap: .75rem; flex-wrap: wrap; }
    .letter-buttons button { background: #1a73e8; color: white; border-color: #1a73e8; }
  `],
})
export class StepDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private progressService = inject(ProgressService);
  private disputeService = inject(DisputeService);

  step = STEPS.find(s => s.id === this.route.snapshot.paramMap.get('stepId'));
  progress = signal<StepProgress>({ status: 'not_started' });
  disputes = toSignal(this.disputeService.getAll(), { initialValue: [] as Dispute[] });
  showForm = signal(false);
  bureaus = BUREAUS;

  showDisputeSection = () => this.step && LETTER_STEPS.includes(this.step.id);

  async ngOnInit() {
    if (this.step) {
      const prog = await this.progressService.getStepProgress(this.step.id);
      this.progress.set(prog);
    }
  }

  async setStatus(status: 'in_progress' | 'complete') {
    await this.progressService.updateStepStatus(this.step!.id, status);
    this.progress.update(p => ({ ...p, status }));
  }

  statusLabel(status: string): string {
    return { not_started: 'Not Started', in_progress: 'In Progress', complete: 'Complete' }[status] ?? status;
  }

  disputesByBureau(bureau: Bureau): Dispute[] {
    return this.disputes().filter(d => d.bureau === bureau);
  }

  letterTypeLabel(): string {
    const map: Record<string, string> = {
      step3: 'Personal Info Update Letter',
      step4: 'Round 1 Letter',
      step6: 'Dispute Letter',
      step7: 'Follow-up Letter',
    };
    return map[this.step?.id ?? ''] ?? 'Letter';
  }

  letterType(): string {
    const map: Record<string, string> = {
      step3: 'personal_info_update',
      step4: 'round1',
      step6: 'round1',
      step7: 'follow_up',
    };
    return map[this.step?.id ?? ''] ?? 'round1';
  }

  generateLetter(bureau: Bureau) {
    const disputeIds = this.disputesByBureau(bureau).map(d => d.id!).join(',');
    this.router.navigate(['/letters', 'new'], {
      queryParams: { type: this.letterType(), bureau, disputeIds },
    });
  }
}
