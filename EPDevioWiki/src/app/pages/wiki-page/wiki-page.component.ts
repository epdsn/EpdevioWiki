import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { WikiViewerComponent } from '../../components/wiki-viewer/wiki-viewer.component';

@Component({
  selector: 'app-wiki-page',
  standalone: true,
  imports: [WikiViewerComponent],
  template: `
    @if (projectId() && categoryId() && pageId()) {
      <app-wiki-viewer
        [projectId]="projectId()!"
        [categoryId]="categoryId()!"
        [pageId]="pageId()!"
      />
    }
  `,
})
export class WikiPageComponent {
  private route = inject(ActivatedRoute);
  projectId = signal<string | null>(null);
  categoryId = signal<string | null>(null);
  pageId = signal<string | null>(null);

  constructor() {
    const snap = this.route.snapshot.paramMap;
    this.projectId.set(snap.get('projectId'));
    this.categoryId.set(snap.get('categoryId'));
    this.pageId.set(snap.get('pageId'));
    this.route.paramMap.subscribe((params) => {
      this.projectId.set(params.get('projectId'));
      this.categoryId.set(params.get('categoryId'));
      this.pageId.set(params.get('pageId'));
    });
  }
}
