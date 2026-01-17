import { makeAutoObservable } from 'mobx';
import { RootStore } from './RootStore';
import { OnNodesChange, OnEdgesChange, applyNodeChanges, applyEdgeChanges, addEdge, Connection } from '@xyflow/react';
import type { FlowNode, FlowEdge, AINodeData, FileNodeData } from '../types/flow';

export class WorkflowStore {
  rootStore: RootStore;
  
  nodes: FlowNode[] = [
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

  edges: FlowEdge[] = [
    { id: 'e1-2', source: 'ai-1', target: 'file-1', animated: true, style: { stroke: '#fd5d93' } }
  ];

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this);
  }

  onNodesChange: OnNodesChange<FlowNode> = (changes) => {
    this.nodes = applyNodeChanges(changes, this.nodes);
  };

  onEdgesChange: OnEdgesChange<FlowEdge> = (changes) => {
    this.edges = applyEdgeChanges(changes, this.edges);
  };

  onConnect = (connection: Connection) => {
    this.edges = addEdge(connection, this.edges);
  };

  updateNodeData(id: string, data: Partial<AINodeData> | Partial<FileNodeData>) {
    this.nodes = this.nodes.map(node => {
      if (node.id === id) {
        return { ...node, data: { ...node.data, ...data } } as FlowNode;
      }
      return node;
    });
  }
}
