export interface AppConfig {
  name: string;
  version: string;
  organization: string;
  brandVersionLabel: string;
}

export const APP_CONFIG: AppConfig = {
  name: 'WorkPulse',
  version: (import.meta.env?.VITE_APP_VERSION as string) || 'v1.5',
  organization: 'Dutamedia',
  get brandVersionLabel(): string {
    return `${this.name} ${this.version} · ${this.organization}`;
  },
};

