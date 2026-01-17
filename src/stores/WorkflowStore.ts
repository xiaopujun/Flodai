import { makeAutoObservable } from 'mobx';
import { RootStore } from './RootStore';
import { Node, Edge, OnNodesChange, OnEdgesChange, applyNodeChanges, applyEdgeChanges, addEdge, Connection } from '@xyflow/react';

export class WorkflowStore {
  rootStore: RootStore;
  
  // Initial Nodes using our Custom Types
  nodes: Node[] = [
    { 
      id: 'ai-1', 
      type: 'aiNode',
      position: { x: 100, y: 100 }, 
      data: { 
        model: 'gpt-4o', 
        prompt: 'Write a haiku about Rust and React.',
        output: '',
        isStreaming: false
      } 
    },
    { 
      id: 'file-1', 
      type: 'fileNode',
      position: { x: 600, y: 100 }, 
      data: { 
        mode: 'write',
        path: 'C:/Users/Public/output.md',
        content: ''
      } 
    },
  ];

  edges: Edge[] = [
    { id: 'e1-2', source: 'ai-1', target: 'file-1', animated: true, style: { stroke: '#fd5d93' } }
  ];

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this);
  }

  onNodesChange: OnNodesChange = (changes) => {
    this.nodes = applyNodeChanges(changes, this.nodes);
  };

  onEdgesChange: OnEdgesChange = (changes) => {
    this.edges = applyEdgeChanges(changes, this.edges);
  };

  onConnect = (connection: Connection) => {
    this.edges = addEdge(connection, this.edges);
  };

  // Helper to update node data (will be used by components or backend)
  updateNodeData(id: string, data: Record<string, any>) {
    this.nodes = this.nodes.map(node => {
      if (node.id === id) {
        return { ...node, data: { ...node.data, ...data } };
      }
      return node;
    });
  }
}
