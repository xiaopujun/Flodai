import { createContext, useContext } from 'react';
import { WorkflowStore } from './WorkflowStore';
import { UIStore } from './UIStore';
import { ProjectStore } from './ProjectStore';

export class RootStore {
  workflowStore: WorkflowStore;
  uiStore: UIStore;
  projectStore: ProjectStore;

  constructor() {
    this.workflowStore = new WorkflowStore(this);
    this.uiStore = new UIStore(this);
    this.projectStore = new ProjectStore(this);
  }
}

export const RootStoreContext = createContext<RootStore | null>(null);

export const useStore = () => {
  const context = useContext(RootStoreContext);
  if (context === null) {
    throw new Error('useStore must be used within a RootStoreProvider');
  }
  return context;
};
