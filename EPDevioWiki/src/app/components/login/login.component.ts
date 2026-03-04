import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="login-container">
      <div class="login-card">
        <h1>EPDevio Wiki</h1>
        <p class="subtitle">Sign in to edit documentation</p>

        @if (errorMessage()) {
          <div class="error-msg">{{ errorMessage() }}</div>
        }

        <form (ngSubmit)="onSubmit()" class="login-form">
          <div class="field">
            <label for="username">Username</label>
            <input
              id="username"
              type="text"
              [(ngModel)]="username"
              name="username"
              placeholder="Enter username"
              autocomplete="username"
            />
          </div>
          <div class="field">
            <label for="password">Password</label>
            <input
              id="password"
              type="password"
              [(ngModel)]="password"
              name="password"
              placeholder="Enter password"
              autocomplete="current-password"
            />
          </div>
          <button type="submit" class="btn-primary" [disabled]="loading()">
            {{ loading() ? 'Signing in...' : 'Sign In' }}
          </button>
        </form>

        <p class="hint">Default: admin / admin</p>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
    }
    .login-card {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      padding: 2.5rem;
      width: 100%;
      max-width: 360px;
      backdrop-filter: blur(10px);
    }
    h1 {
      margin: 0 0 0.25rem;
      font-size: 1.75rem;
      color: #e8e8e8;
      font-weight: 600;
    }
    .subtitle {
      margin: 0 0 1.5rem;
      color: #9ca3af;
      font-size: 0.9rem;
    }
    .error-msg {
      background: rgba(239, 68, 68, 0.2);
      border: 1px solid rgba(239, 68, 68, 0.5);
      color: #fca5a5;
      padding: 0.5rem 0.75rem;
      border-radius: 6px;
      font-size: 0.875rem;
      margin-bottom: 1rem;
    }
    .login-form { display: flex; flex-direction: column; gap: 1rem; }
    .field { display: flex; flex-direction: column; gap: 0.375rem; }
    .field label {
      font-size: 0.8rem;
      color: #9ca3af;
      font-weight: 500;
    }
    .field input {
      padding: 0.625rem 0.875rem;
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 8px;
      background: rgba(0, 0, 0, 0.2);
      color: #e8e8e8;
      font-size: 0.95rem;
    }
    .field input:focus {
      outline: none;
      border-color: #3b82f6;
    }
    .field input::placeholder { color: #6b7280; }
    .btn-primary {
      padding: 0.75rem 1rem;
      background: #3b82f6;
      color: white;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      font-size: 0.95rem;
    }
    .btn-primary:hover:not(:disabled) { background: #2563eb; }
    .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
    .hint {
      margin: 1.25rem 0 0;
      font-size: 0.75rem;
      color: #6b7280;
    }
  `],
})
export class LoginComponent {
  username = '';
  password = '';
  errorMessage = signal('');
  loading = signal(false);

  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  onSubmit(): void {
    this.errorMessage.set('');
    if (!this.username.trim() || !this.password) {
      this.errorMessage.set('Please enter username and password');
      return;
    }
    this.loading.set(true);
    const ok = this.auth.login(this.username.trim(), this.password);
    this.loading.set(false);
    if (ok) {
      this.router.navigate(['/']);
    } else {
      this.errorMessage.set('Invalid username or password');
    }
  }
}
