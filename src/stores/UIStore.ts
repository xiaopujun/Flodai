import { makeAutoObservable } from 'mobx';
import { RootStore } from './RootStore';

export class UIStore {
  rootStore: RootStore;
  isConsoleOpen: boolean = true;
  sidebarWidth: number = 260;

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this);
  }

  toggleConsole() {
    this.isConsoleOpen = !this.isConsoleOpen;
  }
}
