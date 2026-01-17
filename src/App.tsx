import { ReactFlow, Controls, Background, MiniMap } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Button, ConfigProvider } from 'antd';
import { toJS } from 'mobx';
import { observer } from 'mobx-react-lite';
import { RootStore, RootStoreContext, useStore } from './stores/RootStore';
import { appTheme } from './theme';
import styles from './App.module.less';
import './styles/global.less';
import { nodeTypes } from './components/nodes';
import { NodePalette } from './components/NodePalette';
import type { FlowNode, FlowEdge } from './types/flow';

// Instantiate RootStore once
const rootStore = new RootStore();

const Editor = observer(() => {
  const { workflowStore, uiStore } = useStore();
  
  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 24, height: 24, background: 'linear-gradient(to bottom left, #fd5d93, #ec250d)', borderRadius: 4 }}></div>
          <h1>Flodai 工作台</h1>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <Button ghost>撤销</Button>
          <Button type="primary" style={{ background: 'var(--lc-primary-gradient)', border: 'none' }}>
            运行工作流
          </Button>
        </div>
      </header>

      {/* Main Layout */}
      <div className={styles.main}>
        {/* Sidebar */}
        <aside className={styles.sidebar} style={{ width: uiStore.sidebarWidth }}>
          <NodePalette />
        </aside>

        {/* Canvas */}
        <div className={styles.canvas}>
          <ReactFlow<FlowNode, FlowEdge>
            nodes={toJS(workflowStore.nodes) as FlowNode[]}
            edges={toJS(workflowStore.edges) as FlowEdge[]}
            onNodesChange={workflowStore.onNodesChange}
            onEdgesChange={workflowStore.onEdgesChange}
            onConnect={workflowStore.onConnect}
            nodeTypes={nodeTypes}
            colorMode="dark"
            fitView
          >
            <Background color="#333" gap={20} />
            <Controls style={{ fill: '#fff' }} />
            <MiniMap style={{ backgroundColor: '#27293d' }} nodeColor="#fd5d93" />
          </ReactFlow>
        </div>

        {/* Inspector */}
        <aside className={styles.inspector}>
          <div style={{ padding: 20 }}>
            <h2 style={{ fontSize: 16, color: 'var(--lc-text-secondary)', margin: 0 }}>属性</h2>
            <div style={{ marginTop: 20, color: '#fff' }}>
              选择一个节点以编辑。
            </div>
          </div>
        </aside>
      </div>

      {/* Console Panel */}
      <div className={`${styles.console} ${!uiStore.isConsoleOpen ? styles.collapsed : ''}`}>
        <div className={styles.consoleHeader} onClick={() => uiStore.toggleConsole()}>
          <span>系统控制台</span>
          <div style={{ color: 'var(--lc-text-secondary)' }}>
            {uiStore.isConsoleOpen ? '▼' : '▲'}
          </div>
        </div>
        {uiStore.isConsoleOpen && (
          <div className={styles.consoleBody}>
            <div className={`${styles.logLine} info`}>[10:00:01] 系统已初始化。</div>
            <div className={`${styles.logLine} success`}>[10:00:02] Rust 后端已连接。</div>
            <div className={styles.logLine}>[10:00:02] 准备执行工作流。</div>
          </div>
        )}
      </div>
    </div>
  );
});

function App() {
  return (
    <ConfigProvider theme={appTheme}>
      <RootStoreContext.Provider value={rootStore}>
        <Editor />
      </RootStoreContext.Provider>
    </ConfigProvider>
  );
}

export default App;
