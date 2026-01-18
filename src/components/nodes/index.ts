import type { NodeTypes } from '@xyflow/react';
import { AINode } from './AINode';
import { TriggerNode } from './TriggerNode';

export const nodeTypes: NodeTypes = {
  aiNode: AINode,
  triggerNode: TriggerNode,
};

export { AINode, TriggerNode };
export * from './BaseNode';
