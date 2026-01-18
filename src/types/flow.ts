import type { Node, Edge, NodeProps } from '@xyflow/react';

export type NodeKind = 'trigger' | 'conversationAI' | 'file' | 'pythonScript';

export type PortKind = 'control' | 'data';

export type DataType = 'any' | 'string' | 'json' | 'messages' | 'binary' | 'number' | 'boolean';

export interface InputPort {
  id: string;
  key: string;
  label: string;
  kind: PortKind;
  dataType?: DataType;
  required?: boolean;
}

export interface OutputPort {
  id: string;
  key: string;
  label: string;
  kind: PortKind;
  dataType?: DataType;
}

export interface BaseNodeData {
  [key: string]: unknown;
  kind: NodeKind;
  name: string;
  description?: string;
  inputs: InputPort[];
  outputs: OutputPort[];
}

export interface TriggerNodeConfig {
  mode: 'manual' | 'scheduleOnce';
  scheduleTime?: string;
  initialPayload?: string;
  enabled: boolean;
  lastRunAt?: string;
}

export interface TriggerNodeData extends BaseNodeData {
  kind: 'trigger';
  config: TriggerNodeConfig;
}

export interface ConversationAIConfig {
  modelId: string;
  systemPrompt: string;
  historyPolicy: 'none' | 'node';
  temperature?: number;
  maxTokens?: number;
}

export interface ConversationAINodeData extends BaseNodeData {
  kind: 'conversationAI';
  config: ConversationAIConfig;
}

export interface FileNodeConfig {
  mode: 'read' | 'write';
  pathTemplate: string;
}

export interface FileNodeData extends BaseNodeData {
  kind: 'file';
  config: FileNodeConfig;
  content?: string;
}

export interface PythonScriptNodeConfig {
  label: string;
  scriptPath: string;
  entryFunction?: string;
}

export interface PythonScriptNodeData extends BaseNodeData {
  kind: 'pythonScript';
  config: PythonScriptNodeConfig;
}

export type AINodeData = ConversationAINodeData;

export type AINode = Node<AINodeData, 'aiNode'>;
export type FileNode = Node<FileNodeData, 'fileNode'>;
export type TriggerNode = Node<TriggerNodeData, 'triggerNode'>;
export type PythonScriptNode = Node<PythonScriptNodeData, 'pythonScriptNode'>;

export type FlowNode = AINode | FileNode | TriggerNode | PythonScriptNode;
export type FlowEdge = Edge;

export type AINodeProps = NodeProps<AINode>;
export type FileNodeProps = NodeProps<FileNode>;
export type TriggerNodeProps = NodeProps<TriggerNode>;
export type PythonScriptNodeProps = NodeProps<PythonScriptNode>;
