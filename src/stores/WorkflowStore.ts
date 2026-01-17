import { makeAutoObservable } from 'mobx';
import { RootStore } from './RootStore';
import { OnNodesChange, OnEdgesChange, applyNodeChanges, applyEdgeChanges, addEdge, Connection } from '@xyflow/react';
import type { FlowNode, FlowEdge, AINodeData, FileNodeData } from '../types/flow';

export class WorkflowStore {
  rootStore: RootStore;
  
  nodes: FlowNode[] = [];

  edges: FlowEdge[] = [];

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

  addNode(node: FlowNode) {
    this.nodes = [...this.nodes, node];
  }

  updateNodeData(id: string, data: Partial<AINodeData> | Partial<FileNodeData>) {
    this.nodes = this.nodes.map(node => {
      if (node.id === id) {
        return { ...node, data: { ...node.data, ...data } } as FlowNode;
      }
      return node;
    });
  }
}
