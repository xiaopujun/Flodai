import type { FC } from 'react';

export interface NodeConfigPanelInfo<C> {
    title: string;
    key: string;
    component: FC<{ config: C }>;
}

export interface NodeComponent<P, C> extends FC<P> {
    nodeType: string;
    getNodeConfig(): C;
    getConfigPanelInfo(): NodeConfigPanelInfo<C>;
    runExample?(): Promise<void>;
}

