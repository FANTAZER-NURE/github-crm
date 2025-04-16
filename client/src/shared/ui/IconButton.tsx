import React from 'react';
import styles from './IconButton.module.scss';
import { Icon, IconProps } from '@blueprintjs/core';
import classNames from 'classnames';

interface Props {
  onClick?: React.MouseEventHandler;
}

export const IconButton = (props: Props & IconProps) => {
  const { onClick, ...rest } = props;

  return (
    <Icon
      {...rest}
      className={classNames(props.className, styles.iconBtn)}
      onClick={onClick}
    />
  );
};
