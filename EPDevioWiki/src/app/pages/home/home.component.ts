import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { WikiService } from '../../services/wiki.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="home">
      <div class="hero">
        <h1>EPDevio Wiki</h1>
        <p class="tagline">High-level software documentation for your projects</p>
      </div>
      <div class="features">
        <div class="feature-card">
          <span class="icon">📝</span>
          <h3>Markdown</h3>
          <p>Write docs in Markdown with full syntax support</p>
        </div>
        <div class="feature-card">
          <span class="icon">📊</span>
          <h3>Mermaid Diagrams</h3>
          <p>Flowcharts, sequence diagrams, and more</p>
        </div>
        <div class="feature-card">
          <span class="icon">🔗</span>
          <h3>Git Links</h3>
          <p>Link directly to your repositories</p>
        </div>
      </div>
      @if (wiki.projects().length > 0) {
        <div class="quick-nav">
          <p>Select a project from the left menu to get started.</p>
        </div>
      } @else {
        <div class="empty-state">
          <p>No projects yet. Log in and add your first project!</p>
        </div>
      }
    </div>
  `,
  styles: [`
    .home {
      padding: 2rem;
      max-width: 900px;
      margin: 0 auto;
    }
    .hero {
      text-align: center;
      margin-bottom: 3rem;
    }
    .hero h1 {
      font-size: 2.5rem;
      color: #f8fafc;
      margin: 0 0 0.5rem;
      font-weight: 700;
    }
    .tagline {
      color: #94a3b8;
      font-size: 1.1rem;
      margin: 0;
    }
    .features {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }
    .feature-card {
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 12px;
      padding: 1.5rem;
    }
    .feature-card .icon { font-size: 2rem; display: block; margin-bottom: 0.5rem; }
    .feature-card h3 { color: #e2e8f0; margin: 0 0 0.5rem; font-size: 1.1rem; }
    .feature-card p { color: #94a3b8; margin: 0; font-size: 0.9rem; }
    .quick-nav, .empty-state {
      text-align: center;
      color: #94a3b8;
      padding: 2rem;
    }
  `],
})
export class HomeComponent {
  wiki = inject(WikiService);
}
