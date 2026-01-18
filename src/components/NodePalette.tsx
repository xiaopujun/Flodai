import { Collapse } from 'antd';
import styles from '../App.module.less';
import { PlayCircle } from 'lucide-react';

export interface NodePaletteDragPayload {
  nodeType: string;
  label: string;
}

type NodeCategoryId =
  | 'triggers'
  | 'integrations'
  | 'transform'
  | 'state'
  | 'output'
  | 'human'
  | 'tools';

interface NodePaletteItem {
  id: string;
  label: string;
  nodeType: string;
}

interface NodeCategory {
  id: NodeCategoryId;
  label: string;
  items: NodePaletteItem[];
}

const nodePaletteCategories: NodeCategory[] = [
  {
    id: 'triggers',
    label: '触发与控制',
    items: [
      {
        id: 'trigger-node',
        label: '触发器',
        nodeType: 'triggerNode',
      },
    ],
  },
  {
    id: 'integrations',
    label: '数据源与集成',
    items: [],
  },
  {
    id: 'transform',
    label: '数据处理与转换',
    items: [],
  },
  {
    id: 'state',
    label: '状态与上下文',
    items: [],
  },
  {
    id: 'output',
    label: '通知与输出',
    items: [],
  },
  {
    id: 'human',
    label: '用户交互',
    items: [],
  },
  {
    id: 'tools',
    label: '工具与调试',
    items: [],
  },
];

function renderNodeIcon(nodeType: string) {
  switch (nodeType) {
    case 'triggerNode':
      return <PlayCircle size={16} />;
    default:
      return null;
  }
}

export function NodePalette({
  enablePointerDrag,
  onStartDrag,
}: {
  enablePointerDrag?: boolean;
  onStartDrag?: (payload: NodePaletteDragPayload, event: React.PointerEvent) => void;
}) {
  return (
    <Collapse
      className={styles.paletteCollapse}
      bordered={false}
      defaultActiveKey={['triggers']}
      items={nodePaletteCategories.map((category) => ({
        key: category.id,
        label: category.label,
        children: (
          <div className={styles.categoryBody}>
            {category.items.length > 0 ? (
              category.items.map((item) => (
                <div
                  key={item.id}
                  className={styles.nodeItem}
                  data-nodetype={item.nodeType}
                  draggable={!enablePointerDrag}
                  onDragStart={(event) => {
                    if (enablePointerDrag) return;
                    const payload = JSON.stringify({ nodeType: item.nodeType, label: item.label });
                    event.dataTransfer.setData('application/flodai-node', payload);
                    event.dataTransfer.setData('text/plain', payload);
                    event.dataTransfer.effectAllowed = 'move';
                  }}
                  onPointerDown={(event) => {
                    if (!enablePointerDrag) return;
                    onStartDrag?.({ nodeType: item.nodeType, label: item.label }, event);
                  }}
                >
                  <span className={styles.nodeItemIcon}>{renderNodeIcon(item.nodeType)}</span>
                  <span className={styles.nodeItemLabel}>{item.label}</span>
                </div>
              ))
            ) : (
              <div className={styles.emptyCategory}>暂无节点</div>
            )}
          </div>
        ),
      }))}
    />
  );
}
