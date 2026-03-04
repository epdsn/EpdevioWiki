import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, of } from 'rxjs';
import type { WikiConfig, WikiProject, WikiCategory, WikiPage } from '../models/wiki.model';

const CONFIG_KEY = 'epdevio_wiki_config';

@Injectable({ providedIn: 'root' })
export class WikiService {
  private config = signal<WikiConfig>({ projects: [] });
  private contentCache = new Map<string, string>();

  projects = computed(() => this.config().projects);

  constructor(private http: HttpClient) {
    this.loadConfig();
  }

  private loadConfig(): void {
    const stored = localStorage.getItem(CONFIG_KEY);
    if (stored) {
      try {
        this.config.set(JSON.parse(stored));
      } catch {
        this.loadDefaultConfig();
      }
    } else {
      this.loadDefaultConfig();
    }
  }

  private loadDefaultConfig(): void {
    this.http
      .get<WikiConfig>('wiki/config.json')
      .pipe(
        catchError(() => of(this.getDefaultStructure())),
        map((c) => c ?? this.getDefaultStructure())
      )
      .subscribe((cfg) => {
        this.config.set(cfg);
        localStorage.setItem(CONFIG_KEY, JSON.stringify(cfg));
      });
  }

  private getDefaultStructure(): WikiConfig {
    return {
      projects: [
        {
          id: 'sample',
          title: 'Sample Project',
          description: 'Example project documentation',
          gitRepo: 'https://github.com/example/sample-project',
          categories: [
            {
              id: 'overview',
              title: 'Overview',
              pages: [
                {
                  id: 'readme',
                  title: 'Getting Started',
                  file: 'wiki/projects/sample/overview/readme.md',
                },
                {
                  id: 'architecture',
                  title: 'Architecture',
                  file: 'wiki/projects/sample/overview/architecture.md',
                },
              ],
            },
          ],
        },
      ],
    };
  }

  getPageContent(projectId: string, categoryId: string, pageId: string): string | null {
    const project = this.config().projects.find((p) => p.id === projectId);
    if (!project) return null;
    const category = project.categories.find((c) => c.id === categoryId);
    if (!category) return null;
    const page = category.pages.find((p) => p.id === pageId);
    if (!page) return null;

    if (page.content) return page.content;

    const cacheKey = `${projectId}/${categoryId}/${pageId}`;
    if (this.contentCache.has(cacheKey)) {
      return this.contentCache.get(cacheKey) ?? null;
    }
    return null; // Loaded async via loadPageContent
  }

  loadPageContent(
    projectId: string,
    categoryId: string,
    pageId: string
  ): Promise<string> {
    const project = this.config().projects.find((p) => p.id === projectId);
    if (!project) return Promise.resolve('# Page Not Found');
    const category = project.categories.find((c) => c.id === categoryId);
    if (!category) return Promise.resolve('# Category Not Found');
    const page = category.pages.find((p) => p.id === pageId);
    if (!page) return Promise.resolve('# Page Not Found');

    if (page.content) return Promise.resolve(page.content);

    const filePath = page.file;
    if (!filePath) return Promise.resolve('# No content');

    const cacheKey = `${projectId}/${categoryId}/${pageId}`;
    if (this.contentCache.has(cacheKey)) {
      return Promise.resolve(this.contentCache.get(cacheKey)!);
    }

    const url = filePath.startsWith('http') ? filePath : `/${filePath}`;
    return this.http
      .get(url, { responseType: 'text' })
      .pipe(
        catchError(() => of('# Failed to load content')),
        map((content) => {
          this.contentCache.set(cacheKey, content);
          return content;
        })
      )
      .toPromise()
      .then((c) => c ?? '# Failed to load content');
  }

  getPage(projectId: string, categoryId: string, pageId: string): WikiPage | null {
    const project = this.config().projects.find((p) => p.id === projectId);
    const category = project?.categories.find((c) => c.id === categoryId);
    return category?.pages.find((p) => p.id === pageId) ?? null;
  }

  addProject(project: Omit<WikiProject, 'id'>): void {
    const id = this.slugify(project.title);
    const newProject: WikiProject = {
      ...project,
      id,
      categories: project.categories ?? [],
    };
    const cfg = { ...this.config(), projects: [...this.config().projects, newProject] };
    this.config.set(cfg);
    this.persistConfig(cfg);
  }

  addCategory(projectId: string, category: Omit<WikiCategory, 'id'>): void {
    const id = this.slugify(category.title);
    const newCategory: WikiCategory = { ...category, id, pages: category.pages ?? [] };
    const cfg = { ...this.config() };
    const project = cfg.projects.find((p) => p.id === projectId);
    if (project) {
      project.categories = [...(project.categories ?? []), newCategory];
      this.config.set(cfg);
      this.persistConfig(cfg);
    }
  }

  addPage(projectId: string, categoryId: string, page: Omit<WikiPage, 'id'>): void {
    const id = this.slugify(page.title);
    const newPage: WikiPage = { ...page, id };
    const cfg = { ...this.config() };
    const project = cfg.projects.find((p) => p.id === projectId);
    const category = project?.categories.find((c) => c.id === categoryId);
    if (category) {
      category.pages = [...(category.pages ?? []), newPage];
      this.config.set(cfg);
      this.persistConfig(cfg);
    }
  }

  updatePageContent(
    projectId: string,
    categoryId: string,
    pageId: string,
    content: string
  ): void {
    const page = this.getPage(projectId, categoryId, pageId);
    if (!page) return;
    page.content = content;
    this.contentCache.set(`${projectId}/${categoryId}/${pageId}`, content);
    this.config.update((c) => ({ ...c }));
    this.persistConfig(this.config());
  }

  private persistConfig(cfg: WikiConfig): void {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(cfg));
  }

  private slugify(s: string): string {
    return s
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
  }
}
