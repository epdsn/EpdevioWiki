import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { WikiService } from '../../services/wiki.service';
import { AuthService } from '../../services/auth.service';
import type { WikiProject, WikiCategory, WikiPage } from '../../models/wiki.model';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <aside class="sidebar">
      <div class="sidebar-header">
        <h2>EPDevio Wiki</h2>
        @if (auth.isLoggedIn()) {
          <span class="user-badge">{{ auth.getUsername() }}</span>
          <button class="btn-logout" (click)="logout()">Logout</button>
        } @else {
          <a routerLink="/login" class="btn-login">Login</a>
        }
      </div>

      <nav class="nav">
        @for (project of wiki.projects(); track project.id) {
          <div class="project-block">
            <div class="project-header" (click)="toggleProject(project.id)">
              <span class="project-title">{{ project.title }}</span>
              <span class="expand-icon">{{ expandedProjects.has(project.id) ? '▼' : '▶' }}</span>
            </div>
            @if (expandedProjects.has(project.id)) {
              <div class="categories">
                @if (project.gitRepo) {
                  <a [href]="project.gitRepo" target="_blank" rel="noopener" class="git-link">
                    📦 Repository
                  </a>
                }
                @for (cat of project.categories; track cat.id) {
                  <div class="category-block">
                    <div class="category-header">{{ cat.title }}</div>
                    <div class="pages">
                      @for (page of cat.pages; track page.id) {
                        <a
                          [routerLink]="['/wiki', project.id, cat.id, page.id]"
                          routerLinkActive="active"
                          class="page-link"
                        >
                          {{ page.title }}
                        </a>
                      }
                      @if (auth.isLoggedIn()) {
                        <button class="btn-add-page" (click)="openAddPage(project.id, cat.id)">+ Page</button>
                      }
                    </div>
                  </div>
                }
                @if (auth.isLoggedIn()) {
                  <button class="btn-add-cat" (click)="openAddCategory(project.id)">+ Category</button>
                }
              </div>
            }
          </div>
        }

        @if (auth.isLoggedIn() && wiki.projects().length > 0) {
          <div class="add-section">
            <button class="btn-add" (click)="showAddProject = true">+ Add Project</button>
          </div>
        }
      </nav>

      @if (showAddProject) {
        <div class="modal-overlay" (click)="closeModals()">
          <div class="modal" (click)="$event.stopPropagation()">
            <h3>Add Project</h3>
            <div class="field">
              <label>Title</label>
              <input [(ngModel)]="newProjectTitle" placeholder="Project name" />
            </div>
            <div class="field">
              <label>Git Repo URL (optional)</label>
              <input [(ngModel)]="newProjectGitRepo" placeholder="https://github.com/..." />
            </div>
            <div class="modal-actions">
              <button class="btn-secondary" (click)="closeModals()">Cancel</button>
              <button class="btn-primary" (click)="addProject()">Add</button>
            </div>
          </div>
        </div>
      }
      @if (showAddCategory) {
        <div class="modal-overlay" (click)="closeModals()">
          <div class="modal" (click)="$event.stopPropagation()">
            <h3>Add Category</h3>
            <div class="field">
              <label>Title</label>
              <input [(ngModel)]="newCategoryTitle" placeholder="Category name" />
            </div>
            <div class="modal-actions">
              <button class="btn-secondary" (click)="closeModals()">Cancel</button>
              <button class="btn-primary" (click)="addCategory()">Add</button>
            </div>
          </div>
        </div>
      }
      @if (showAddPage) {
        <div class="modal-overlay" (click)="closeModals()">
          <div class="modal" (click)="$event.stopPropagation()">
            <h3>Add Page</h3>
            <div class="field">
              <label>Title</label>
              <input [(ngModel)]="newPageTitle" placeholder="Page name" />
            </div>
            <div class="field">
              <label>Content (Markdown)</label>
              <textarea [(ngModel)]="newPageContent" placeholder="# Heading&#10;&#10;Your content..." rows="5"></textarea>
            </div>
            <div class="modal-actions">
              <button class="btn-secondary" (click)="closeModals()">Cancel</button>
              <button class="btn-primary" (click)="addPage()">Add</button>
            </div>
          </div>
        </div>
      }
    </aside>
  `,
  styles: [`
    .sidebar {
      width: 280px;
      min-width: 280px;
      background: #0f172a;
      color: #e2e8f0;
      height: 100vh;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
    }
    .sidebar-header {
      padding: 1.25rem;
      border-bottom: 1px solid rgba(255,255,255,0.08);
      display: flex;
      align-items: center;
      gap: 0.5rem;
      flex-wrap: wrap;
    }
    .sidebar-header h2 {
      margin: 0;
      font-size: 1.1rem;
      font-weight: 700;
      color: #f8fafc;
      flex: 1;
    }
    .user-badge {
      font-size: 0.75rem;
      background: rgba(59, 130, 246, 0.3);
      padding: 0.2rem 0.5rem;
      border-radius: 4px;
    }
    .btn-logout, .btn-login {
      font-size: 0.8rem;
      padding: 0.35rem 0.6rem;
      background: transparent;
      color: #94a3b8;
      border: 1px solid rgba(255,255,255,0.15);
      border-radius: 6px;
      cursor: pointer;
      text-decoration: none;
    }
    .btn-logout:hover, .btn-login:hover { background: rgba(255,255,255,0.08); color: #e2e8f0; }
    .nav { padding: 0.75rem; flex: 1; }
    .project-block { margin-bottom: 0.5rem; }
    .project-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.5rem 0.75rem;
      cursor: pointer;
      border-radius: 6px;
      font-weight: 600;
      font-size: 0.95rem;
    }
    .project-header:hover { background: rgba(255,255,255,0.06); }
    .expand-icon { font-size: 0.7rem; color: #94a3b8; }
    .categories { padding-left: 0.75rem; margin-top: 0.25rem; }
    .git-link {
      display: block;
      font-size: 0.8rem;
      color: #60a5fa;
      text-decoration: none;
      padding: 0.35rem 0;
      margin-bottom: 0.25rem;
    }
    .git-link:hover { text-decoration: underline; }
    .category-block { margin-bottom: 0.5rem; }
    .category-header {
      font-size: 0.75rem;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      padding: 0.35rem 0;
    }
    .pages { display: flex; flex-direction: column; }
    .page-link {
      font-size: 0.85rem;
      color: #cbd5e1;
      text-decoration: none;
      padding: 0.4rem 0.75rem;
      border-radius: 6px;
      margin-left: -0.75rem;
    }
    .page-link:hover, .page-link.active { background: rgba(59, 130, 246, 0.2); color: #60a5fa; }
    .add-section { padding-top: 0.75rem; }
    .btn-add {
      width: 100%;
      padding: 0.5rem;
      background: rgba(59, 130, 246, 0.2);
      color: #60a5fa;
      border: 1px dashed rgba(59, 130, 246, 0.5);
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.85rem;
    }
    .btn-add:hover { background: rgba(59, 130, 246, 0.3); }
    .btn-add-page, .btn-add-cat {
      font-size: 0.8rem;
      padding: 0.35rem 0.75rem;
      background: transparent;
      color: #60a5fa;
      border: 1px dashed rgba(59, 130, 246, 0.4);
      border-radius: 6px;
      cursor: pointer;
      margin-left: -0.75rem;
      text-align: left;
      width: calc(100% + 0.75rem);
    }
    .btn-add-page:hover, .btn-add-cat:hover { background: rgba(59, 130, 246, 0.15); }
    .btn-add-cat { margin: 0.5rem 0 0 0.75rem; width: auto; }
    .field textarea {
      width: 100%; padding: 0.5rem; border: 1px solid rgba(255,255,255,0.15);
      border-radius: 6px; background: #0f172a; color: #e2e8f0;
      font-family: inherit; resize: vertical;
    }
    .modal-overlay {
      position: fixed; inset: 0; background: rgba(0,0,0,0.5);
      display: flex; align-items: center; justify-content: center;
      z-index: 100;
    }
    .modal {
      background: #1e293b; border-radius: 12px; padding: 1.5rem;
      width: 90%; max-width: 400px;
    }
    .modal h3 { margin: 0 0 1rem; color: #f8fafc; }
    .field { margin-bottom: 1rem; }
    .field label { display: block; font-size: 0.8rem; color: #94a3b8; margin-bottom: 0.25rem; }
    .field input {
      width: 100%; padding: 0.5rem; border: 1px solid rgba(255,255,255,0.15);
      border-radius: 6px; background: #0f172a; color: #e2e8f0;
    }
    .modal-actions { display: flex; gap: 0.5rem; justify-content: flex-end; margin-top: 1rem; }
    .btn-secondary { padding: 0.5rem 1rem; background: transparent; color: #94a3b8; border: 1px solid rgba(255,255,255,0.15); border-radius: 6px; cursor: pointer; }
    .btn-primary { padding: 0.5rem 1rem; background: #3b82f6; color: white; border: none; border-radius: 6px; cursor: pointer; }
  `],
})
export class SidebarComponent {
  wiki = inject(WikiService);
  auth = inject(AuthService);
  expandedProjects = new Set<string>();
  showAddProject = false;
  newProjectTitle = '';
  newProjectGitRepo = '';
  showAddCategory = false;
  showAddPage = false;
  addCategoryProjectId = '';
  addPageProjectId = '';
  addPageCategoryId = '';
  newCategoryTitle = '';
  newPageTitle = '';
  newPageContent = '';

  constructor() {
    // Expand first project by default
    const projects = this.wiki.projects();
    if (projects.length > 0) {
      this.expandedProjects.add(projects[0].id);
    }
  }

  toggleProject(id: string): void {
    if (this.expandedProjects.has(id)) {
      this.expandedProjects.delete(id);
    } else {
      this.expandedProjects.add(id);
    }
    this.expandedProjects = new Set(this.expandedProjects);
  }

  logout(): void {
    this.auth.logout();
  }

  addProject(): void {
    if (!this.newProjectTitle.trim()) return;
    this.wiki.addProject({
      title: this.newProjectTitle.trim(),
      gitRepo: this.newProjectGitRepo.trim() || undefined,
      categories: [],
    });
    this.newProjectTitle = '';
    this.newProjectGitRepo = '';
    this.showAddProject = false;
    this.expandedProjects.add(this.wiki.projects().at(-1)!.id);
  }

  openAddCategory(projectId: string): void {
    this.addCategoryProjectId = projectId;
    this.newCategoryTitle = '';
    this.showAddCategory = true;
  }

  addCategory(): void {
    if (!this.newCategoryTitle.trim()) return;
    this.wiki.addCategory(this.addCategoryProjectId, {
      title: this.newCategoryTitle.trim(),
      pages: [],
    });
    this.showAddCategory = false;
    this.expandedProjects.add(this.addCategoryProjectId);
  }

  openAddPage(projectId: string, categoryId: string): void {
    this.addPageProjectId = projectId;
    this.addPageCategoryId = categoryId;
    this.newPageTitle = '';
    this.newPageContent = '';
    this.showAddPage = true;
  }

  addPage(): void {
    if (!this.newPageTitle.trim()) return;
    this.wiki.addPage(this.addPageProjectId, this.addPageCategoryId, {
      title: this.newPageTitle.trim(),
      content: this.newPageContent.trim() || undefined,
    });
    this.showAddPage = false;
  }

  closeModals(): void {
    this.showAddProject = false;
    this.showAddCategory = false;
    this.showAddPage = false;
  }
}
