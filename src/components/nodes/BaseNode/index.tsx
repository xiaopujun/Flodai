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
  // Optional slot for handles if we want to pass them in
  handles?: ReactNode;
}

export const BaseNode: React.FC<BaseNodeProps> = ({
  title,
  icon,
  selected,
  children,
  headerStyle,
  className,
  handles,
}) => {
  return (
    <div className={clsx(styles.nodeContainer, selected && styles.selected, className)}>
      <div className={styles.header} style={headerStyle}>
        {icon && <span className={styles.icon}>{icon}</span>}
        <span className={styles.title}>{title}</span>
      </div>
      
      <div className={styles.body}>
        {children}
      </div>

      {/* Render handles if passed directly */}
      {handles}
    </div>
  );
};
