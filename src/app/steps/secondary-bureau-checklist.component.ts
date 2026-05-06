import { Component, inject, signal, OnInit, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ProgressService } from './progress.service';
import { SECONDARY_AGENCIES } from './secondary-agencies.config';

@Component({
  selector: 'app-secondary-bureau-checklist',
  imports: [FormsModule],
  template: `
    <div class="checklist">
      <div class="checklist-header">
        <h3>Secondary Bureau Freeze Checklist</h3>
        <span class="progress-text">{{ completedCount() }} / {{ agencies.length }} completed</span>
      </div>
      <div class="progress-bar">
        <div class="progress-fill" [style.width.%]="(completedCount() / agencies.length) * 100"></div>
      </div>

      @for (agency of agencies; track agency.key) {
        <div class="agency-item" [class.checked]="checked()[agency.key]">
          <label>
            <input type="checkbox"
              [checked]="checked()[agency.key]"
              (change)="toggle(agency.key, $any($event.target).checked)" />
            <div class="agency-info">
              <strong>{{ agency.name }}</strong>
              <span class="method-badge" [class]="agency.method">{{ agency.method }}</span>
              <p>{{ agency.instructions }}</p>
              @if (agency.url) {
                <a [href]="agency.url" target="_blank" rel="noopener">Visit Website →</a>
              }
            </div>
          </label>
        </div>
      }
    </div>
  `,
  styles: [`
    .checklist { margin-top: 1rem; }
    .checklist-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: .5rem; }
    h3 { margin: 0; }
    .progress-text { font-size: .9rem; color: #555; }
    .progress-bar { height: 6px; background: #eee; border-radius: 3px; margin-bottom: 1rem; }
    .progress-fill { height: 100%; background: #34a853; border-radius: 3px; transition: width .3s; }
    .agency-item { border: 1px solid #e0e0e0; border-radius: 6px; padding: .75rem 1rem; margin-bottom: .5rem; background: white; }
    .agency-item.checked { background: #f0faf0; border-color: #34a853; }
    label { display: flex; gap: .75rem; align-items: flex-start; cursor: pointer; }
    input[type=checkbox] { margin-top: .2rem; width: 1rem; height: 1rem; flex-shrink: 0; }
    .agency-info { flex: 1; }
    .agency-info strong { display: block; margin-bottom: .2rem; }
    .agency-info p { margin: .2rem 0; font-size: .85rem; color: #555; }
    .agency-info a { font-size: .85rem; color: #1a73e8; }
    .method-badge { display: inline-block; padding: .1rem .4rem; border-radius: 8px; font-size: .7rem; font-weight: 600; margin-left: .5rem; }
    .method-badge.online { background: #e8f0fe; color: #1a73e8; }
    .method-badge.mail { background: #fff3e0; color: #f57c00; }
    .method-badge.phone { background: #e6f4ea; color: #34a853; }
  `],
})
export class SecondaryBureauChecklistComponent implements OnInit {
  private progressService = inject(ProgressService);

  allComplete = output<void>();

  agencies = SECONDARY_AGENCIES;
  checked = signal<Record<string, boolean>>({});

  completedCount = () => Object.values(this.checked()).filter(Boolean).length;

  async ngOnInit() {
    const progress = await this.progressService.getStepProgress('step1');
    this.checked.set(progress.checklistItems ?? {});
  }

  async toggle(key: string, value: boolean) {
    this.checked.update(c => ({ ...c, [key]: value }));
    await this.progressService.updateChecklistItem('step1', key, value);

    if (this.completedCount() === this.agencies.length) {
      await this.progressService.updateStepStatus('step1', 'complete');
      this.allComplete.emit();
    } else if (this.completedCount() > 0) {
      await this.progressService.updateStepStatus('step1', 'in_progress');
    }
  }
}
