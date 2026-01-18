import type { Node, Edge, NodeProps } from '@xyflow/react';

export type NodeType = 'trigger';

export type PortType = 'control' | 'data';

export type DataType = 'any' | 'string' | 'json' | 'messages' | 'binary' | 'number' | 'boolean';

export interface InputPort {
  id: string;
  key: string;
  label: string;
  type: PortType;
  dataType?: DataType;
  required?: boolean;
}

export interface OutputPort {
  id: string;
  key: string;
  label: string;
  type: PortType;
  dataType?: DataType;
}

export interface BaseNodeData {
  [key: string]: unknown;
  type: NodeType;
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
  type: 'trigger';
  config: TriggerNodeConfig;
}

export type TriggerNode = Node<TriggerNodeData, 'triggerNode'>;

export type FlowNode = TriggerNode;
export type FlowEdge = Edge;

export type TriggerNodeProps = NodeProps<TriggerNode>;
