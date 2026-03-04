import { Component, Input, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MarkdownComponent } from 'ngx-markdown';
import { WikiService } from '../../services/wiki.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-wiki-viewer',
  standalone: true,
  imports: [CommonModule, MarkdownComponent],
  template: `
    <div class="wiki-viewer">
      @if (loading()) {
        <div class="loading">Loading...</div>
      } @else if (content()) {
        @if (isEditing()) {
          <div class="edit-area">
            <textarea
              [value]="content()"
              (input)="editedContent.set($any($event.target).value)"
              class="edit-textarea"
            ></textarea>
            <div class="edit-actions">
              <button class="btn-secondary" (click)="cancelEdit()">Cancel</button>
              <button class="btn-primary" (click)="saveEdit()">Save</button>
            </div>
          </div>
        } @else {
          <div class="content-area">
            @if (gitRepo()) {
              <a [href]="gitRepo()" target="_blank" rel="noopener" class="git-badge">📦 View on Git</a>
            }
            @if (canEdit()) {
              <button class="btn-edit" (click)="startEdit()">Edit</button>
            }
            <markdown [data]="content()!" [mermaid]="true"></markdown>
          </div>
        }
      } @else {
        <div class="empty">Select a page from the menu</div>
      }
    </div>
  `,
  styles: [`
    .wiki-viewer {
      flex: 1;
      overflow-y: auto;
      padding: 2rem;
    }
    .loading, .empty {
      color: #94a3b8;
      text-align: center;
      padding: 3rem;
    }
    .content-area {
      max-width: 800px;
      margin: 0 auto;
    }
    .git-badge {
      display: inline-block;
      padding: 0.35rem 0.75rem;
      background: rgba(59, 130, 246, 0.2);
      color: #60a5fa;
      text-decoration: none;
      border-radius: 6px;
      font-size: 0.85rem;
      margin-bottom: 1rem;
    }
    .git-badge:hover { background: rgba(59, 130, 246, 0.3); }
    .btn-edit {
      float: right;
      padding: 0.35rem 0.75rem;
      background: transparent;
      color: #94a3b8;
      border: 1px solid rgba(255,255,255,0.15);
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.85rem;
    }
    .btn-edit:hover { background: rgba(255,255,255,0.06); color: #e2e8f0; }
    .edit-area { max-width: 800px; margin: 0 auto; }
    .edit-textarea {
      width: 100%;
      min-height: 400px;
      padding: 1rem;
      border: 1px solid rgba(255,255,255,0.15);
      border-radius: 8px;
      background: #0f172a;
      color: #e2e8f0;
      font-family: 'Consolas', 'Monaco', monospace;
      font-size: 0.9rem;
      resize: vertical;
    }
    .edit-textarea:focus { outline: none; border-color: #3b82f6; }
    .edit-actions { display: flex; gap: 0.5rem; margin-top: 1rem; }
    .btn-secondary { padding: 0.5rem 1rem; background: transparent; color: #94a3b8; border: 1px solid rgba(255,255,255,0.15); border-radius: 6px; cursor: pointer; }
    .btn-primary { padding: 0.5rem 1rem; background: #3b82f6; color: white; border: none; border-radius: 6px; cursor: pointer; }
    :host ::ng-deep .markdown {
      color: #e2e8f0;
      line-height: 1.7;
    }
    :host ::ng-deep .markdown h1, :host ::ng-deep .markdown h2, :host ::ng-deep .markdown h3 { color: #f8fafc; }
    :host ::ng-deep .markdown a { color: #60a5fa; }
    :host ::ng-deep .markdown code { background: rgba(0,0,0,0.3); padding: 0.15rem 0.4rem; border-radius: 4px; }
    :host ::ng-deep .markdown pre { background: #0f172a; padding: 1rem; border-radius: 8px; overflow-x: auto; }
    :host ::ng-deep .markdown pre code { background: none; padding: 0; }
    :host ::ng-deep .markdown .mermaid { background: #fff; padding: 1rem; border-radius: 8px; margin: 1rem 0; }
  `],
})
export class WikiViewerComponent implements OnInit {
  @Input({ required: true }) projectId!: string;
  @Input({ required: true }) categoryId!: string;
  @Input({ required: true }) pageId!: string;

  private wiki = inject(WikiService);
  private auth = inject(AuthService);

  content = signal<string | null>(null);
  loading = signal(true);
  isEditing = signal(false);
  editedContent = signal('');

  gitRepo = signal<string | undefined>(undefined);

  ngOnInit(): void {
    this.loadContent();
  }

  private loadContent(): void {
    this.content.set(null);
    this.loading.set(true);
    const page = this.wiki.getPage(this.projectId, this.categoryId, this.pageId);
    if (page?.gitRepo) this.gitRepo.set(page.gitRepo);
    const project = this.wiki.projects().find((p) => p.id === this.projectId);
    if (project?.gitRepo) this.gitRepo.set(project.gitRepo);

    this.wiki.loadPageContent(this.projectId, this.categoryId, this.pageId).then((c) => {
      this.content.set(c);
      this.editedContent.set(c);
      this.loading.set(false);
    });
  }

  canEdit(): boolean {
    return this.auth.isLoggedIn();
  }

  startEdit(): void {
    this.editedContent.set(this.content() ?? '');
    this.isEditing.set(true);
  }

  cancelEdit(): void {
    this.isEditing.set(false);
  }

  saveEdit(): void {
    const text = this.editedContent();
    this.wiki.updatePageContent(this.projectId, this.categoryId, this.pageId, text);
    this.content.set(text);
    this.isEditing.set(false);
  }
}
