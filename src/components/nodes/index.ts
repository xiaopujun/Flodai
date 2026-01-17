import type { NodeTypes } from '@xyflow/react';
import { AINode } from './AINode';
import { FileNode } from './FileNode';

export const nodeTypes: NodeTypes = {
  aiNode: AINode,
  fileNode: FileNode,
};

export { AINode, FileNode };
export * from './BaseNode';
