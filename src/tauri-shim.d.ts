declare module '@tauri-apps/plugin-dialog' {
  export function open(options?: {
    directory?: boolean;
    multiple?: boolean;
    defaultPath?: string;
    filters?: Array<{ name: string; extensions: string[] }>;
  }): Promise<string | string[] | null>;
}

declare module '@tauri-apps/plugin-store' {
  export class Store {
    static load(
      path: string,
      options?: {
        autoSave?: boolean | number;
      }
    ): Promise<Store>;

    set<T>(key: string, value: T): Promise<void>;
    get<T>(key: string): Promise<T | null>;
    save(): Promise<void>;
  }
}
