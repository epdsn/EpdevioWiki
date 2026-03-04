export interface WikiPage {
  id: string;
  title: string;
  file?: string; // Path to .md file in assets
  content?: string; // Inline content
  gitRepo?: string;
}

export interface WikiCategory {
  id: string;
  title: string;
  pages: WikiPage[];
}

export interface WikiProject {
  id: string;
  title: string;
  description?: string;
  gitRepo?: string;
  categories: WikiCategory[];
}

export interface WikiConfig {
  projects: WikiProject[];
}
