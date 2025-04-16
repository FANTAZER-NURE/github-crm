import React, {useRef, useState} from 'react'
import styles from './Avatar.module.scss'
import {Colors, Icon} from '@blueprintjs/core'
import cls from 'classnames'
import { IconNames } from '@blueprintjs/icons'
import { useIntersectionOnce } from '../hooks/use-intersection'

interface Props {
  url: string
  width?: number
  height?: number
  rounded?: boolean
  fallbackContent?: React.ReactNode
  darkBackground?: boolean
  imageClassnames?: string
}


export const Avatar = ({
  url,
  width,
  height,
  rounded,
  fallbackContent,
  darkBackground = true,
  imageClassnames,
}: Props) => {
  const [loaded, setLoaded] = useState(false)
  const w = width || 100
  const h = height || 100
  const radius = rounded ? w : 0


  const ref = useRef<HTMLSpanElement | null>(null)

  const isVisible = useIntersectionOnce(ref)

  return (
    <span
      className={styles.wrapper}
      ref={ref}
      style={{
        width: `${w}px`,
        height: `${h}px`,
        borderRadius: radius,
        backgroundColor: darkBackground ? Colors.DARK_GRAY5 : undefined,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {!loaded ? (
        fallbackContent ? (
          fallbackContent
        ) : (
          <Icon icon={IconNames.USER} />
        )
      ) : null}
      {isVisible ? (
        <img
          src={url}
          alt=""
          className={cls(imageClassnames, !loaded ? styles.hidden : '')}
          onLoad={() => setLoaded(true)}
        />
      ) : null}
    </span>
  );
}
