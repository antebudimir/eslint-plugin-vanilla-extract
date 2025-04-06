import { TSESTree } from '@typescript-eslint/utils';

export interface CSSPropertyInfo {
  name: string;
  node: TSESTree.Property;
  priority: number;
  positionInGroup: number;
  group?: string;
}

export type SortRemainingProperties = 'alphabetical' | 'concentric';
