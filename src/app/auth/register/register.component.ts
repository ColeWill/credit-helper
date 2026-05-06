import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-register',
  imports: [FormsModule, RouterLink],
  template: `
    <div class="auth-container">
      <h1>Credit Helper</h1>
      <h2>Create Account</h2>

      @if (error()) {
        <p class="error">{{ error() }}</p>
      }

      <form (ngSubmit)="onRegister()">
        <input type="email" [(ngModel)]="email" name="email" placeholder="Email" required />
        <input type="password" [(ngModel)]="password" name="password" placeholder="Password (min 6 chars)" required minlength="6" />
        <button type="submit" [disabled]="loading()">
          {{ loading() ? 'Creating account...' : 'Create Account' }}
        </button>
      </form>

      <p>Already have an account? <a routerLink="/login">Sign In</a></p>
    </div>
  `,
  styles: [`
    .auth-container { max-width: 400px; margin: 80px auto; padding: 2rem; text-align: center; }
    form { display: flex; flex-direction: column; gap: 1rem; margin: 1rem 0; }
    input { padding: .75rem; border: 1px solid #ccc; border-radius: 4px; font-size: 1rem; }
    button { padding: .75rem; background: #1a73e8; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 1rem; }
    .error { color: red; margin-bottom: 1rem; }
    button:disabled { opacity: .6; cursor: not-allowed; }
  `],
})
export class RegisterComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  email = '';
  password = '';
  loading = signal(false);
  error = signal('');

  async onRegister() {
    this.loading.set(true);
    this.error.set('');
    try {
      await this.auth.register(this.email, this.password);
      this.router.navigate(['/dashboard']);
    } catch (e: any) {
      this.error.set(e.message ?? 'Registration failed');
    } finally {
      this.loading.set(false);
    }
  }
}
