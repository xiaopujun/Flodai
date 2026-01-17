import { Collapse } from 'antd';
import styles from '../App.module.less';

type NodeCategoryId =
  | 'triggers'
  | 'ai'
  | 'io'
  | 'integrations'
  | 'code'
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
    id: 'ai',
    label: 'AI 生成与理解',
    items: [
      {
        id: 'ai-generator',
        label: 'AI 生成器',
        nodeType: 'aiNode',
      },
    ],
  },
  {
    id: 'io',
    label: 'IO 与文件操作',
    items: [
      {
        id: 'file-reader',
        label: '文件读取',
        nodeType: 'fileNode',
      },
    ],
  },
  {
    id: 'integrations',
    label: '数据源与集成',
    items: [],
  },
  {
    id: 'code',
    label: '代码与执行',
    items: [
      {
        id: 'python-script',
        label: 'Python 脚本',
        nodeType: 'pythonScriptNode',
      },
    ],
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

export function NodePalette() {
  return (
    <Collapse
      className={styles.paletteCollapse}
      bordered={false}
      defaultActiveKey={['triggers', 'ai', 'io', 'code']}
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
                >
                  {item.label}
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

