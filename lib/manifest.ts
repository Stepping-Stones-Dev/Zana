export interface ManifestEntry {
  name: string;
  url: string;
  module: string;
}

export const loadManifest = async (): Promise<ManifestEntry[]> => import('./manifest.json');
