import { AppRegistryClient, appRegistry } from '@airqo/app-store-modules';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const mockRegistryClient: AppRegistryClient = {
  async listApps(params) {
    await delay(150);
    const search = params?.search?.toLowerCase();
    const category = params?.category?.toLowerCase();
    const target = params?.target?.toLowerCase();

    return appRegistry.map(entry => entry.manifest).filter(app => {
      const matchesSearch = !search
        ? true
        : app.name.toLowerCase().includes(search) ||
          app.description.toLowerCase().includes(search);
      const matchesCategory = category
        ? app.category.toLowerCase() === category
        : true;
      const matchesTarget = target
        ? app.targets.some(t => t.toLowerCase() === target)
        : true;
      return matchesSearch && matchesCategory && matchesTarget;
    });
  },
  async getApp(id: string) {
    await delay(120);
    return appRegistry.map(entry => entry.manifest).find(app => app.id === id) ?? null;
  },
  async listInstalled() {
    await delay(80);
    return [];
  },
  async installApp() {
    await delay(80);
  },
  async uninstallApp() {
    await delay(80);
  },
};

export const getAppById = (id: string) =>
  appRegistry.find(entry => entry.manifest.id === id)?.manifest;
