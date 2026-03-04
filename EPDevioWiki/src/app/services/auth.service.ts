import { Injectable, signal, computed } from '@angular/core';

const AUTH_KEY = 'epdevio_wiki_auth';
const USERS_KEY = 'epdevio_wiki_users';

export interface WikiUser {
  username: string;
  password: string; // In production, use hashed passwords
  displayName: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private currentUser = signal<string | null>(localStorage.getItem(AUTH_KEY));

  isLoggedIn = computed(() => !!this.currentUser());

  getUsername(): string | null {
    return this.currentUser();
  }

  login(username: string, password: string): boolean {
    const users = this.getUsers();
    const user = users.find(
      (u) => u.username === username && u.password === password
    );
    if (user) {
      this.currentUser.set(username);
      localStorage.setItem(AUTH_KEY, username);
      return true;
    }
    return false;
  }

  logout(): void {
    this.currentUser.set(null);
    localStorage.removeItem(AUTH_KEY);
  }

  register(username: string, password: string, displayName: string): boolean {
    const users = this.getUsers();
    if (users.some((u) => u.username === username)) return false;
    users.push({ username, password, displayName });
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    return true;
  }

  private getUsers(): WikiUser[] {
    const stored = localStorage.getItem(USERS_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return [];
      }
    }
    // Default admin user for first-time setup
    const defaultUsers: WikiUser[] = [
      { username: 'admin', password: 'admin', displayName: 'Admin' },
    ];
    localStorage.setItem(USERS_KEY, JSON.stringify(defaultUsers));
    return defaultUsers;
  }
}
