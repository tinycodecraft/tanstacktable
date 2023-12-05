import React, { useCallback, useEffect, useRef, useState, MouseEvent as ReactMouseEvent } from 'react'
import { ClockPart } from './model/ClockPart'
import { RopePart } from './model/RopePart'
import { IAnimateProps, IKnotInstance, IRopeProps, IStrokeProps } from 'src/config/types'
import { KnotPart } from './model/KnotPart'
import { IAnimationResult, animate, mod } from 'mz-math'
import { RNDCLK_DF_ANIMATION_DURATION, RNDCLK_DF_ROPE_BG_COLOR } from 'src/config/constants'
import { createStrokeFromKnots, getAnimationProgressAngle, getMouseInAngle, getStrokeColor } from 'src/config/geometries'
import { valueOr } from 'src/config/methods'

interface IRopeLineProps extends IRopeProps, IAnimateProps {
  disabled?: boolean
  clockPart: ClockPart
  knotPart: KnotPart
  top: number
  left: number
  setKnot: (itClock: ClockPart, itKnots: KnotPart, knot: IKnotInstance, newAngleDeg: number, isdisabled?: boolean) => void
}

export const RopeLine = (props: IRopeLineProps) => {
  const {
    hideRope,
    rangeDragging,
    animateOnClick,
    animationDuration,
    top,
    left,
    clockPart,
    knotPart,
    setKnot,
    disabled,
    ropeBgColor,
    ropeBgColorDisabled,
    ropeBgColorHover,
  } = props
  const [animation, setAnimation] = useState<IAnimationResult | null>(null)
  const [strokeColor, setStrokeColor] = useState(RNDCLK_DF_ROPE_BG_COLOR)
  const [mouseOvered, setMouseOvered] = useState(false)
  const [stroke, setStroke] = useState<IStrokeProps>(knotPart.stroke)
  const rangeDraggingLastAngle = useRef<number>()
  const animationClosestKnot = useRef<IKnotInstance | null>(null)
  const animationSourceDegrees = useRef(0)
  const animationTargetDegrees = useRef(0)
  const [cx, cy, radius] = clockPart.clockCoordinates

  const onMouseUp = () => {
    window.removeEventListener('mousemove', onValueChange)
    window.removeEventListener('mouseup', onValueChange)

    rangeDraggingLastAngle.current = undefined
  }

  const onMouseDown = (evt: ReactMouseEvent) => {
    if (!rangeDragging || disabled || knotPart.knots.length <= 1) return

    onValueChange(evt)

    window.addEventListener('mousemove', onValueChange)
    window.addEventListener('mouseup', onMouseUp)
  }
  const onMouseOver = () => setMouseOvered(true)
  const onMouseOut = () => setMouseOvered(false)

  const onValueChange = useCallback(
    (evt: MouseEvent | ReactMouseEvent) => {
      if (disabled || !rangeDragging || !knotPart) return
      const beginEndKnots = knotPart.getMostApartKnots(clockPart.angleStart)
      if (!beginEndKnots) return
      const [beginKnot, endKnot] = beginEndKnots
      const mouseDegrees = getMouseInAngle([left, top], [evt.clientX, evt.clientY], clockPart.clockCoordinates)
      if (rangeDraggingLastAngle.current === undefined) {
        rangeDraggingLastAngle.current = mouseDegrees
        return
      }
      const diff = mouseDegrees - rangeDraggingLastAngle.current
      if (diff === 0 || Math.abs(diff) < clockPart.stepAngle) return
      setKnot(clockPart, knotPart, beginKnot, mod(beginKnot.angleDeg + diff, 360))
      setKnot(clockPart, knotPart, endKnot, mod(endKnot.angleDeg + diff, 360))
      rangeDraggingLastAngle.current = mouseDegrees
    },
    [clockPart, knotPart, left, top, disabled, rangeDragging],
  )

  const onClick = useCallback(
    (evt: ReactMouseEvent) => {
      if (!clockPart || clockPart.disabled || (animation && animation.isAnimating())) return
      console.log(`rope line click event ...`)

      const degrees = getMouseInAngle([left, top], [evt.clientX, evt.clientY], clockPart.clockCoordinates)

      const closestPointer = knotPart.getClosestKnot(degrees, clockPart.clockCoordinates)

      if (!closestPointer) return

      if (animateOnClick) {
        animationClosestKnot.current = closestPointer
        animationSourceDegrees.current = closestPointer.angleDeg
        animationTargetDegrees.current = degrees
        animation?.start()
      } else {
        setKnot(clockPart, knotPart, closestPointer, degrees, disabled)
      }
    },
    [top, left, clockPart, knotPart],
  )
  // clockpart changed when top left changed
  useEffect(() => {
    setStrokeColor(getStrokeColor(mouseOvered, disabled, ropeBgColorDisabled, ropeBgColor, ropeBgColorHover))
    if (knotPart) {
      // try to fix knot part properties update by using innert knot update event to fix knotpart properties (using Object.assign)
      setStroke({...knotPart.stroke})

    }
  }, [disabled, ropeBgColorDisabled, ropeBgColor, ropeBgColorHover, mouseOvered, knotPart])

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
          if (!animationClosestKnot.current) return
          const currentDegrees = getAnimationProgressAngle(
            progress,
            animationSourceDegrees.current,
            animationTargetDegrees.current,
            clockPart.angleStart,
          )
          if (currentDegrees) setKnot(clockPart, knotPart, animationClosestKnot.current, currentDegrees, disabled)
        },
        duration: valueOr(animationDuration, RNDCLK_DF_ANIMATION_DURATION),
      })

      setAnimation(_animation)
    },
    // eslint-disable-next-line
    [animateOnClick, animationDuration],
  )

  return (
    <>
      {valueOr(!hideRope, true) && (
        <circle
          data-type='connection'
          className='mz-round-slider-connection'
          cx={cx}
          cy={cy}
          r={radius}
          strokeDasharray={stroke.strokeDasharray}
          strokeDashoffset={stroke.strokeOffset}
          stroke={strokeColor}
          strokeWidth={clockPart.thickness}
          fill='none'
          shapeRendering='geometricPrecision'
          strokeLinecap='round'
          cursor={disabled ? 'default' : 'pointer'}
          onClick={onClick}
          onMouseDown={onMouseDown}
          onMouseOver={onMouseOver}
          onMouseOut={onMouseOut}
          style={{
            transition: '0.2s stroke',
          }}
        />
      )}
    </>
  )
}
