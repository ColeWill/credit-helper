import { Component, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProfileService } from './profile.service';

@Component({
  selector: 'app-profile-form',
  imports: [FormsModule],
  template: `
    <div class="container">
      <h2>Your Personal Information</h2>
      <p class="note">This information is used to generate your dispute letters. Your SSN is encrypted before storage.</p>

      @if (saved()) { <p class="success">Profile saved!</p> }
      @if (error()) { <p class="error">{{ error() }}</p> }

      <form (ngSubmit)="onSave()">
        <label>Full Legal Name
          <input [(ngModel)]="form.name" name="name" required />
        </label>

        <label>Current Address
          <input [(ngModel)]="form.currentAddress" name="currentAddress" required placeholder="123 Main St, City, ST 12345" />
        </label>

        <label>Previous Addresses (one per line)
          <textarea [(ngModel)]="previousAddressesText" name="prevAddresses" rows="3" placeholder="456 Old St, City, ST&#10;789 Prior Ave, City, ST"></textarea>
        </label>

        <label>Phone Number
          <input [(ngModel)]="form.phone" name="phone" type="tel" />
        </label>

        <label>Date of Birth
          <input [(ngModel)]="form.dob" name="dob" type="date" required />
        </label>

        <label>Last 4 of SSN
          <input [(ngModel)]="form.ssnLast4" name="ssnLast4" maxlength="4" pattern="[0-9]{4}" required placeholder="1234" />
        </label>

        <label>Full SSN (encrypted — leave blank to keep existing)
          <input [(ngModel)]="fullSSN" name="fullSSN" type="password" maxlength="9" pattern="[0-9]{9}" placeholder="123456789" autocomplete="off" />
        </label>

        <div class="actions">
          <button type="submit" [disabled]="loading()">
            {{ loading() ? 'Saving...' : 'Save Profile' }}
          </button>
          <button type="button" (click)="goBack()">Back to Dashboard</button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .container { max-width: 600px; margin: 2rem auto; padding: 1.5rem; }
    form { display: flex; flex-direction: column; gap: 1rem; }
    label { display: flex; flex-direction: column; gap: .25rem; font-weight: 500; }
    input, textarea { padding: .6rem; border: 1px solid #ccc; border-radius: 4px; font-size: 1rem; }
    .actions { display: flex; gap: 1rem; margin-top: .5rem; }
    button { padding: .7rem 1.5rem; border: none; border-radius: 4px; cursor: pointer; }
    button[type=submit] { background: #1a73e8; color: white; }
    button[type=button] { background: #eee; }
    .success { color: green; } .error { color: red; }
    .note { color: #666; font-size: .9rem; margin-bottom: 1rem; }
    button:disabled { opacity: .6; cursor: not-allowed; }
  `],
})
export class ProfileFormComponent implements OnInit {
  private profileService = inject(ProfileService);
  private router = inject(Router);

  form = { name: '', currentAddress: '', phone: '', dob: '', ssnLast4: '' };
  previousAddressesText = '';
  fullSSN = '';
  loading = signal(false);
  saved = signal(false);
  error = signal('');

  async ngOnInit() {
    const profile = await this.profileService.getProfile();
    if (profile) {
      this.form = {
        name: profile.name,
        currentAddress: profile.currentAddress,
        phone: profile.phone,
        dob: profile.dob,
        ssnLast4: profile.ssnLast4,
      };
      this.previousAddressesText = (profile.previousAddresses ?? []).join('\n');
    }
  }

  async onSave() {
    this.loading.set(true);
    this.error.set('');
    this.saved.set(false);
    try {
      await this.profileService.saveProfile({
        ...this.form,
        previousAddresses: this.previousAddressesText.split('\n').map(s => s.trim()).filter(Boolean),
        fullSSN: this.fullSSN || undefined,
      });
      this.fullSSN = '';
      this.saved.set(true);
    } catch (e: any) {
      this.error.set(e.message ?? 'Save failed');
    } finally {
      this.loading.set(false);
    }
  }

  goBack() { this.router.navigate(['/dashboard']); }
}
