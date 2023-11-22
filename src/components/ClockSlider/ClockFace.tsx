import React, {  useEffect, useRef, useState } from 'react'
import { ClockPart } from './model/ClockPart'
import { KnotPart } from './model/KnotPart'
import { IAnimationResult, animate, newId } from 'mz-math'
import { IKnotInstance } from 'src/config/types'
import { getAnimationProgressAngle, getMouseInAngle } from 'src/config/geometries'
import { RNDCLK_DF_ANIMATION_DURATION, RNDCLK_DF_PATH_BG_COLOR, RNDCLK_DF_PATH_BORDER_COLOR } from 'src/config/constants'
import { valueOr } from 'src/config/methods'
import { InnerFace } from './InnerFace'

interface IClockFaceProps {
  clockPart: ClockPart
  knotPart: KnotPart
  animateOnClick?: boolean
  animationDuration?: number
  pathBorderColor?: string
  pathBgColor?: string
  pathInnerBgColor?: string
  setKnot: (knot: IKnotInstance, newAngleDeg: number) => void
  left?: number
  top?: number
}

export const ClockFace = (props: IClockFaceProps) => {
  const { clockPart, knotPart, setKnot, animateOnClick, animationDuration, top, left, pathBgColor, pathBorderColor, pathInnerBgColor } = props
  const [animation, setAnimation] = useState<IAnimationResult | null>(null)
  const [maskId] = useState(newId())
  const animationClosestPointer = useRef<IKnotInstance | null>(null)
  const animationSourceDegrees = useRef(0)
  const animationTargetDegrees = useRef(0)
  const {strokeDasharray, strokeOffset} = clockPart.stroke
  const [cx, cy, radius] = clockPart.clockCoordinates

  const onClick = (evt: React.MouseEvent<SVGAElement, MouseEvent>) => {
    if (!clockPart || clockPart.disabled || (animation && animation.isAnimating()) || !top || !left) return

    const degrees = getMouseInAngle([left, top], [evt.clientX, evt.clientY], clockPart.clockCoordinates)

    const closestPointer = knotPart.getClosestKnot(degrees, clockPart.clockCoordinates)

    if (!closestPointer) return

    if (animateOnClick) {
      animationClosestPointer.current = closestPointer
      animationSourceDegrees.current = closestPointer.angleDeg
      animationTargetDegrees.current = degrees
      animation?.start()
    } else {
      setKnot(closestPointer, degrees)
    }
  }
  useEffect(
    () => {
      if (animation) {
        animation.stop()
      }

      if (!animateOnClick) {
        setAnimation(null)
        return
      }

      const _animation = animate({
        callback: (progress) => {
          if (!animationClosestPointer.current) return
          const currentDegrees = getAnimationProgressAngle(
            progress,
            animationSourceDegrees.current,
            animationTargetDegrees.current,
            clockPart.angleStart,
          )
          if (currentDegrees) setKnot(animationClosestPointer.current, currentDegrees)
        },
        duration: valueOr(animationDuration, RNDCLK_DF_ANIMATION_DURATION),
      })

      setAnimation(_animation)
    },
    // eslint-disable-next-line
    [animateOnClick, animationDuration],
  )

  return (
    <g onClick={onClick}>
      {pathInnerBgColor && <InnerFace maskId={maskId} clockPart={clockPart} pathInnerBgColor={pathInnerBgColor} />}

      {clockPart.border > 0 && (
        <circle
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeOffset}
          cx={cx}
          cy={cy}
          r={radius}
          stroke={valueOr(pathBorderColor, RNDCLK_DF_PATH_BORDER_COLOR)}
          strokeWidth={clockPart.thickness + clockPart.border * 2}
          fill='none'
          shapeRendering='geometricPrecision'
          strokeLinecap='round'
          cursor='pointer'
          data-type='path-border'
          className='mz-round-slider-path-border'
        />
      )}
      <circle
        strokeDasharray={strokeDasharray}
        strokeDashoffset={strokeOffset}
        cx={cx}
        cy={cy}
        r={radius}
        stroke={valueOr(pathBgColor, RNDCLK_DF_PATH_BG_COLOR)}
        strokeWidth={clockPart.thickness}
        fill='none'
        shapeRendering='geometricPrecision'
        strokeLinecap='round'
        cursor='pointer'
        data-type='path'
        className='mz-round-slider-path'
      />
    </g>
  )
}
