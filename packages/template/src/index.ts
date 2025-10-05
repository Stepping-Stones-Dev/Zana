// Public entry point for @zana/template
// Intentionally minimal; add and export real functionality as needed.

export interface TemplateStatus {
  ready: boolean;
  name: string;
}

export function status(): TemplateStatus {
  return { ready: true, name: '@zana/template' };
}
