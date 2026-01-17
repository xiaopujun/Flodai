import { createContext, useContext } from 'react';
import { WorkflowStore } from './WorkflowStore';
import { UIStore } from './UIStore';

export class RootStore {
  workflowStore: WorkflowStore;
  uiStore: UIStore;

  constructor() {
    this.workflowStore = new WorkflowStore(this);
    this.uiStore = new UIStore(this);
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
