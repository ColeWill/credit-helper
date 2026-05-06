import { Component, inject, signal, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { AuthService } from '../auth/auth.service';
import { ProgressService } from '../steps/progress.service';
import { STEPS } from '../steps/steps.config';
import { StepProgress, Dispute } from '../models';
import { toSignal } from '@angular/core/rxjs-interop';

interface StepViewModel {
  id: string;
  number: number;
  title: string;
  description: string;
  progress: StepProgress;
  openDisputeCount: number;
}

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink, DatePipe],
  template: `
    <div class="container">
      <header>
        <h1>Credit Repair Dashboard</h1>
        <div class="header-actions">
          <a routerLink="/profile">Edit Profile</a>
          <button (click)="logout()">Sign Out</button>
        </div>
      </header>

      @if (overdueDisputes().length > 0) {
        <div class="alert">
          <strong>⚠ {{ overdueDisputes().length }} dispute(s) need follow-up</strong>
          <a routerLink="/steps/step7">View Step 7 →</a>
        </div>
      }

      <div class="progress-summary">
        <span>{{ completedCount() }} / {{ steps.length }} steps complete</span>
        <div class="progress-bar">
          <div class="progress-fill" [style.width.%]="(completedCount() / steps.length) * 100"></div>
        </div>
      </div>

      <div class="timeline">
        @for (step of stepViewModels(); track step.id) {
          <div class="timeline-item" [class]="step.progress.status">
            <div class="timeline-marker">
              @if (step.progress.status === 'complete') { ✓ }
              @else { {{ step.number }} }
            </div>
            <div class="timeline-content">
              <div class="step-header">
                <h3>{{ step.title }}</h3>
                <span class="badge" [class]="step.progress.status">
                  {{ statusLabel(step.progress.status) }}
                </span>
              </div>
              <p>{{ step.description }}</p>
              @if (step.openDisputeCount > 0) {
                <span class="dispute-count">{{ step.openDisputeCount }} open dispute(s)</span>
              }
              @if (step.progress.completedAt) {
                <span class="date">Completed {{ step.progress.completedAt.toDate() | date }}</span>
              }
              <a [routerLink]="['/steps', step.id]" class="step-link">View Details →</a>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .container { max-width: 800px; margin: 0 auto; padding: 1.5rem; }
    header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
    .header-actions { display: flex; gap: 1rem; align-items: center; }
    .header-actions a { color: #1a73e8; text-decoration: none; }
    button { padding: .5rem 1rem; border: 1px solid #ccc; border-radius: 4px; cursor: pointer; background: white; }
    .alert { background: #fff3cd; border: 1px solid #ffc107; border-radius: 6px; padding: 1rem; margin-bottom: 1.5rem; display: flex; justify-content: space-between; align-items: center; }
    .alert a { color: #1a73e8; }
    .progress-summary { margin-bottom: 1.5rem; }
    .progress-bar { height: 8px; background: #eee; border-radius: 4px; margin-top: .5rem; }
    .progress-fill { height: 100%; background: #34a853; border-radius: 4px; transition: width .3s; }
    .timeline { position: relative; padding-left: 2.5rem; }
    .timeline::before { content: ''; position: absolute; left: 1rem; top: 0; bottom: 0; width: 2px; background: #e0e0e0; }
    .timeline-item { position: relative; margin-bottom: 2rem; }
    .timeline-marker { position: absolute; left: -2.5rem; width: 2rem; height: 2rem; border-radius: 50%; background: #e0e0e0; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: .85rem; }
    .timeline-item.complete .timeline-marker { background: #34a853; color: white; }
    .timeline-item.in_progress .timeline-marker { background: #1a73e8; color: white; }
    .timeline-content { background: white; border: 1px solid #e0e0e0; border-radius: 8px; padding: 1rem; }
    .step-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: .5rem; }
    h3 { margin: 0; font-size: 1rem; }
    p { margin: .25rem 0 .5rem; color: #555; font-size: .9rem; }
    .badge { padding: .2rem .6rem; border-radius: 12px; font-size: .75rem; font-weight: 600; white-space: nowrap; }
    .badge.not_started { background: #f1f3f4; color: #666; }
    .badge.in_progress { background: #e8f0fe; color: #1a73e8; }
    .badge.complete { background: #e6f4ea; color: #34a853; }
    .dispute-count { font-size: .8rem; color: #ea4335; margin-right: 1rem; }
    .date { font-size: .8rem; color: #888; margin-right: 1rem; }
    .step-link { font-size: .85rem; color: #1a73e8; text-decoration: none; }
  `],
})
export class DashboardComponent implements OnInit {
  private auth = inject(AuthService);
  private progress = inject(ProgressService);
  private router = inject(Router);

  steps = STEPS;
  stepViewModels = signal<StepViewModel[]>([]);
  overdueDisputes = toSignal(this.progress.getOverdueDisputes(), { initialValue: [] as Dispute[] });

  completedCount = () => this.stepViewModels().filter(s => s.progress.status === 'complete').length;

  async ngOnInit() {
    const allDisputes = await new Promise<Dispute[]>(resolve => {
      this.progress.getDisputes().subscribe(d => resolve(d));
    });

    const viewModels = await Promise.all(
      STEPS.map(async step => {
        const prog = await this.progress.getStepProgress(step.id);
        const openCount = allDisputes.filter(
          d => d.status !== 'resolved' && d.status !== 'escalated'
        ).length;
        return { ...step, progress: prog, openDisputeCount: step.id === 'step4' ? openCount : 0 };
      })
    );
    this.stepViewModels.set(viewModels);
  }

  statusLabel(status: string): string {
    return { not_started: 'Not Started', in_progress: 'In Progress', complete: 'Complete' }[status] ?? status;
  }

  async logout() {
    await this.auth.logout();
    this.router.navigate(['/login']);
  }
}
