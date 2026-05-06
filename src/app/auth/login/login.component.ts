import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterLink],
  template: `
    <div class="auth-container">
      <h1>Credit Helper</h1>
      <h2>Sign In</h2>

      @if (error()) {
        <p class="error">{{ error() }}</p>
      }

      <form (ngSubmit)="onLogin()">
        <input type="email" [(ngModel)]="email" name="email" placeholder="Email" required />
        <input type="password" [(ngModel)]="password" name="password" placeholder="Password" required />
        <button type="submit" [disabled]="loading()">
          {{ loading() ? 'Signing in...' : 'Sign In' }}
        </button>
      </form>

      <button class="google-btn" (click)="onGoogle()" [disabled]="loading()">
        Sign in with Google
      </button>

      <p>Don't have an account? <a routerLink="/register">Register</a></p>
    </div>
  `,
  styles: [`
    .auth-container { max-width: 400px; margin: 80px auto; padding: 2rem; text-align: center; }
    form { display: flex; flex-direction: column; gap: 1rem; margin: 1rem 0; }
    input { padding: .75rem; border: 1px solid #ccc; border-radius: 4px; font-size: 1rem; }
    button { padding: .75rem; border: none; border-radius: 4px; cursor: pointer; font-size: 1rem; }
    button[type=submit] { background: #1a73e8; color: white; }
    .google-btn { background: white; border: 1px solid #ccc; width: 100%; margin-bottom: 1rem; }
    .error { color: red; margin-bottom: 1rem; }
    button:disabled { opacity: .6; cursor: not-allowed; }
  `],
})
export class LoginComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  email = '';
  password = '';
  loading = signal(false);
  error = signal('');

  async onLogin() {
    this.loading.set(true);
    this.error.set('');
    try {
      await this.auth.login(this.email, this.password);
      this.router.navigate(['/dashboard']);
    } catch (e: any) {
      this.error.set(e.message ?? 'Login failed');
    } finally {
      this.loading.set(false);
    }
  }

  async onGoogle() {
    this.loading.set(true);
    this.error.set('');
    try {
      await this.auth.loginWithGoogle();
      this.router.navigate(['/dashboard']);
    } catch (e: any) {
      this.error.set(e.message ?? 'Google sign-in failed');
    } finally {
      this.loading.set(false);
    }
  }
}
