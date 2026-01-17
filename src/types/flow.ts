import type { Node, Edge, NodeProps } from '@xyflow/react';

export interface AINodeData extends Record<string, unknown> {
  model?: string;
  prompt?: string;
  output?: string;
  isStreaming?: boolean;
}

export interface FileNodeData extends Record<string, unknown> {
  path?: string;
  mode?: 'read' | 'write';
  content?: string;
}

export interface TriggerNodeData extends Record<string, unknown> {
  label: string;
}

export interface PythonScriptNodeData extends Record<string, unknown> {
  label: string;
}

export type AINode = Node<AINodeData, 'aiNode'>;
export type FileNode = Node<FileNodeData, 'fileNode'>;
export type TriggerNode = Node<TriggerNodeData, 'triggerNode'>;
export type PythonScriptNode = Node<PythonScriptNodeData, 'pythonScriptNode'>;

export type FlowNode = AINode | FileNode | TriggerNode | PythonScriptNode;
export type FlowEdge = Edge;

export type AINodeProps = NodeProps<AINode>;
export type FileNodeProps = NodeProps<FileNode>;
