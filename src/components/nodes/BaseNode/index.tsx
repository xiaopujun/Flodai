import React, { ReactNode } from 'react';
import clsx from 'clsx';
import styles from './BaseNode.module.less';

export interface BaseNodeProps {
  title: string;
  icon?: ReactNode;
  selected?: boolean;
  children?: ReactNode;
  headerStyle?: React.CSSProperties;
  className?: string;
  handles?: ReactNode;
  compact?: boolean;
}

export const BaseNode: React.FC<BaseNodeProps> = ({
  title,
  icon,
  selected,
  children,
  headerStyle,
  className,
  handles,
  compact,
}) => {
  return (
    <div className={clsx(styles.nodeContainer, compact && styles.compact, selected && styles.selected, className)}>
      <div className={styles.header} style={headerStyle}>
        {icon && <span className={styles.icon}>{icon}</span>}
        <span className={styles.title}>{title}</span>
      </div>

      {!compact && <div className={styles.body}>{children}</div>}

      {handles}
    </div>
  );
};
