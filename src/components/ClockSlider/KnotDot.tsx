import React, { useEffect, useState, MouseEvent as ReactMouseEvent, TouchEvent as ReactTouchEvent, KeyboardEvent, useCallback, useRef } from 'react'
/* eslint-disable camelcase */
import { IKnotInstance } from 'src/config/types'
import { ClockPart } from './model/ClockPart'
import { KnotPart } from './model/KnotPart'
import { checkAngleInArc, getClosestEdge, getDotFillColor, getMouseInAngle } from 'src/config/geometries'
import { Vector2, circleMovement, convertRange, degreesToRadians } from 'mz-math'
import { RNDCLK_DF_KNOT_BG_COLOR, OUTLINENONE_CSS } from 'src/config/constants'

interface IKnotDotProps {
  knotSVG?: React.ReactNode
  disabled?: boolean
  mouseWheelDisabled?: boolean
  keyboardDisabled?: boolean
  knot: IKnotInstance
  selectedKnotId: string
  clockPart: ClockPart
  knotPart: KnotPart
  top: number
  left: number
  setKnot: (itClock: ClockPart, itKnots: KnotPart, knot: IKnotInstance, newAngleDeg: number, isdisabled?: boolean) => void
}

export const KnotDot = (props: IKnotDotProps) => {
  const { knotSVG, disabled, mouseWheelDisabled, keyboardDisabled, clockPart, knotPart, top, left, setKnot, selectedKnotId, knot } = props

  const dotRef = useRef<SVGGElement | null>(null)
  const [cx, cy, radius] = clockPart.clockCoordinates
  const [center, setCenter] = useState<Vector2 | null>(null)
  const [knotValue, setKnotValue] = useState<string>('')
  const [fillColor, setFillColor] = useState(RNDCLK_DF_KNOT_BG_COLOR)
  const [mouseOvered, setMouseOvered] = useState(false)

  const onMouseUp = () => {
    window.removeEventListener('mousemove', onValueChange)
    window.removeEventListener('mouseup', onValueChange)
  }

  const onMouseDown = (evt: ReactMouseEvent) => {
    if (disabled || knot.disabled) return

    onValueChange(evt)

    window.addEventListener('mousemove', onValueChange)
    window.addEventListener('mouseup', onMouseUp)
  }
  const onMouseOver = () => setMouseOvered(true)
  const onMouseOut = () => setMouseOvered(false)

  const onKeyDown = (evt: KeyboardEvent) => {
    if (disabled || knot.disabled || keyboardDisabled) return

    switch (evt.key) {
      case 'ArrowLeft': {
        evt.preventDefault()
        setKnot(clockPart, knotPart, knot, knot.angleDeg + clockPart.arrowStepAngle, disabled)
        break
      }

      case 'ArrowRight': {
        evt.preventDefault()
        setKnot(clockPart, knotPart, knot, knot.angleDeg + clockPart.arrowStepAngle, disabled)

        break
      }

      case 'ArrowUp': {
        evt.preventDefault()
        setKnot(clockPart, knotPart, knot, knot.angleDeg + clockPart.arrowStepAngle, disabled)

        break
      }

      case 'ArrowDown': {
        evt.preventDefault()
        setKnot(clockPart, knotPart, knot, knot.angleDeg + clockPart.arrowStepAngle, disabled)

        break
      }
    }
  }

  const onValueChange = useCallback(
    (evt: MouseEvent | ReactMouseEvent | TouchEvent | ReactTouchEvent) => {
      if (disabled || !clockPart || !knot || knot.disabled) return
      const mouseX = evt.type.indexOf('mouse') !== -1 ? (evt as MouseEvent).clientX : (evt as TouchEvent).touches[0].clientX
      const mouseY = evt.type.indexOf('mouse') !== -1 ? (evt as MouseEvent).clientY : (evt as TouchEvent).touches[0].clientY
      const mouseAngle = getMouseInAngle([left, top], [mouseX, mouseY], clockPart.clockCoordinates)
      let newAngleDeg = null
      if (!checkAngleInArc(clockPart.angleStart, clockPart.angleEnd, mouseAngle)) {
        newAngleDeg = getClosestEdge(clockPart.angleStart, clockPart.angleEnd, knot.angleDeg, clockPart.clockCoordinates)
      } else {
        newAngleDeg = mouseAngle
      }
      setKnot(clockPart, knotPart, knot, newAngleDeg, disabled)
    },
    [clockPart, knotPart, disabled, knot, setKnot],
  )

  useEffect(() => {
    setFillColor(getDotFillColor(knot, selectedKnotId, mouseOvered))
  }, [knot, selectedKnotId, mouseOvered])

  useEffect(() => {
    const value = clockPart.angle2value(knot.angleDeg)
    setKnotValue(value === undefined ? '' : value.toString())

    const angleRad = convertRange(degreesToRadians(knot.angleDeg), 0, Math.PI * 2, 0, Math.PI)
    const knotCenter = circleMovement([cx, cy], angleRad, radius)
    setCenter(knotCenter)
  }, [clockPart, knot.angleDeg])

  useEffect(() => {
    const $current = dotRef.current
    const onTouch = (evt: TouchEvent | ReactTouchEvent) => {
      if (disabled || knot.disabled) return
      evt.preventDefault()
      evt.stopPropagation()
      onValueChange(evt)
    }
    const onWheel = (evt: WheelEvent) => {
      if (disabled || knot.disabled || mouseWheelDisabled || document.activeElement !== $current) return
      evt.preventDefault()
      evt.stopPropagation()
      const scrollTop = evt.deltaY < 0
      let newAngleDeg = null
      if (scrollTop) {
        newAngleDeg = knot.angleDeg + clockPart.arrowStepAngle
      } else {
        newAngleDeg = knot.angleDeg - clockPart.arrowStepAngle
      }

      setKnot(clockPart, knotPart, knot, newAngleDeg, disabled)
    }
    $current?.addEventListener('touchmove', onTouch, { passive: false })
    $current?.addEventListener('wheel', onWheel, { passive: false })

    return () => {
      $current?.removeEventListener('touchmove', onTouch)
      $current?.removeEventListener('wheel', onWheel)
    }
  }, [center, onValueChange, clockPart.stepAngle, knot, setKnot, disabled, mouseWheelDisabled])

  return (
    <>
      {center && (
        <g
          ref={dotRef}
          transform={`translate(${center[0] - knot.radius / 2}, ${center[1] - knot.radius / 2})`}
          role='slider'
          aria-disabled={knot.disabled ? true : undefined}
          aria-valuenow={knot.angleDeg}
          aria-valuetext={knotValue}
          aria-label={knot.ariaLabel}
          data-type='pointer'
          className={`mz-round-slider-pointer ${knot.disabled ? 'mz-round-slider-pointer-disabled' : ''}`}
          data-angle={knot.angleDeg}
          data-id={knot.id}
          data-index={knot.index}
          onMouseDown={onMouseDown}
          onKeyDown={onKeyDown}
          onMouseOver={onMouseOver}
          onMouseOut={onMouseOut}
          tabIndex={0}
          cursor={knot.disabled ? 'default' : 'pointer'}
          style={OUTLINENONE_CSS}
        >
          {!knotSVG && (
            <circle
              cx={knot.radius / 2}
              cy={knot.radius / 2}
              r={knot.radius}
              fill={fillColor}
              strokeWidth={knot.border}
              stroke={knot.borderColor}
              style={{ transition: '0.3s fill' }}
            />
          )}
          {knotSVG && <g> {knotSVG} </g>}
        </g>
      )}
    </>
  )
}
