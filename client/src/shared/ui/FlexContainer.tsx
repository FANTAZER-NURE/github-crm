import React from 'react'

interface FlexContainerProps {
  children: React.ReactNode
  between?: boolean
  around?: boolean
  centered?: boolean
  centeredX?: boolean
  centeredY?: boolean
  rightAligned?: boolean
  bottomAligned?: boolean
  style?: React.CSSProperties
  className?: string
  gap?: number | string
  stretch?: boolean
  wrap?: boolean
  column?: boolean
  columnReversed?: boolean
  widthFull?: boolean
  onClick?: (e: React.MouseEvent) => void
}

export const FlexContainer = React.forwardRef(
  (
    {
      children,
      between,
      around,
      centered,
      centeredX,
      centeredY,
      rightAligned,
      bottomAligned,
      style,
      className,
      gap,
      stretch,
      wrap,
      column,
      columnReversed,
      widthFull,
      onClick,
    }: FlexContainerProps,
    ref: React.ForwardedRef<HTMLDivElement>
  ) => {
    const styles: React.CSSProperties = {
      display: 'flex',
      alignItems: 'flex-start',
      ...(between ? {justifyContent: 'space-between'} : null),
      ...(around ? {justifyContent: 'space-around'} : null),
      ...(centered ? {justifyContent: 'center', alignItems: 'center'} : null),
      ...(centeredX ? {justifyContent: 'center'} : null),
      ...(centeredY ? {alignItems: 'center'} : null),
      ...(bottomAligned ? {alignItems: 'flex-end'} : null),
      ...(rightAligned ? {justifyContent: 'flex-end'} : null),
      ...(wrap ? {flexWrap: 'wrap'} : null),
      ...(gap ? {gap} : null),
      ...(stretch ? {alignItems: 'stretch'} : null),
      ...(column ? {flexDirection: 'column'} : null),
      ...(columnReversed ? {flexDirection: 'column-reverse'} : null),
      ...(widthFull ? {width: '100%'} : null),
      ...style,
    }

    return (
      <div ref={ref} style={styles} className={className} onClick={onClick}>
        {children}
      </div>
    )
  }
)
