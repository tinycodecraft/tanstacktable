import React, { useEffect, useRef, useState } from 'react'
import { IClockInstance, IData, IKnotInstance, IRoundClockProps } from 'src/config/types'
import { ClockPart } from './model/ClockPart'
import { KnotPart } from './model/KnotPart'
import { isAngleBetween, isNumber, mod } from 'mz-math'
import { RNDCLK_DF_KNOT_BORDER, RNDCLK_DF_KNOT_RADIUS, RNDCLK_DF_MAX, RNDCLK_DF_MIN, OUTLINENONE_CSS } from 'src/config/constants'
import { numberOr } from 'src/config/methods'
import { checkAngleInArc, getMaxRadius, getSteppedAngle } from 'src/config/geometries'

export const ClockSlider = (props: IRoundClockProps) => {
  const [data, setData] = useState<IData | null>(null)

  const [clockPart, setClockPart] = useState<ClockPart | null>(null)
  const [knotPart, setKnotPart] = useState<KnotPart | null>(null)
  const [selectedPointerId, setSelectedPointerId] = useState('')

  const prevAngleDegRef = useRef<number | null>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const { left, top } = !svgRef || !svgRef.current ? { left: 0, top: 0 } : svgRef.current.getBoundingClientRect()

  useEffect(() => {
    const clearSelectedPointer = (evt: MouseEvent) => {
      const $target = evt.target as HTMLElement
      const $pointer = $target.closest('[data-type="pointer"]')
      if ($pointer) return

      setSelectedPointerId('')
    }

    document.addEventListener('mousedown', clearSelectedPointer)

    return () => {
      document.removeEventListener('mousedown', clearSelectedPointer)
    }
  }, [])

  useEffect(() => {
    const myclockPart = ClockPart.getClockPart(
      {
        min: numberOr(props.min, RNDCLK_DF_MIN),
        max: numberOr(props.max, RNDCLK_DF_MAX),
        border: props.pathBorder,
        data: props.data,
        round: props.round,
        startAngleDeg: props.pathStartAngle,
        endAngleDeg: props.pathEndAngle,
        radius: props.pathRadius,
        thickness: props.pathThickness,
        disabled: props.disabled,
      },
      getMaxRadius(props.knots || [], RNDCLK_DF_KNOT_RADIUS, RNDCLK_DF_KNOT_BORDER),
      props.step,
      props.arrowStep,
      top,
      left,
    )

    setClockPart(myclockPart)

    const haschanged = JSON.stringify(data) !== JSON.stringify(myclockPart.data)
    if (haschanged) {
      setData(myclockPart.data)
    }
  }, [data, props, left, top])

  useEffect(() => {
    if (clockPart) {
      const myknotPart = KnotPart.getKnotPart(clockPart, props.knots || [], props)
      setKnotPart(myknotPart)
    }
  }, [
    props.knotRadius,
    props.pathBgColor,
    props.knotBgColor,
    props.knotBgColorSelected,
    props.knotBgColorDisabled,
    props.knotBorder,
    props.knotBorderColor,
    props.disabled,
    props.knots,
    props.knotRadius,
    props.knotBgColor,
    props.knotBgColorSelected,
    props.knotBgColorDisabled,
    props.knotBorder,
    props.knotBorderColor,
    props.disabled,
    props.pathStartAngle,
    props.pathEndAngle,
    data,
  ])

  const refreshKnot = (knot: IKnotInstance, newAngleDeg: number): void => {
    if (props.disabled || !knotPart || !knotPart.knots || knot.disabled || !clockPart) return
    newAngleDeg = getSteppedAngle(newAngleDeg, clockPart.stepAngle, clockPart.angleStart, clockPart.angleEnd)
    if(clockPart.isClosed && mod(newAngleDeg,360) === mod(clockPart.angleEnd,360))
    {
      newAngleDeg = clockPart.angleStart;
    }
    if(knot.angleDeg ===newAngleDeg)
    {
      // please update (actually no update)
      return
    }
    const handleOverlap = !props.knotsOverlap //if not allow overlap => do following
    if(handleOverlap){

      const [ length, prevAngle, nextAngle] = knotPart.getAdjacentKnotInfo(knot.index)
      if(length ===2 && (prevAngle ===nextAngle))
      {
        const splitPointDeg = prevAngle
        if(prevAngleDegRef.current ===null)
        {
          prevAngleDegRef.current = newAngleDeg
        }
        else{
          const SAFE_ANGLE = 150;

          let t1 = splitPointDeg - SAFE_ANGLE;
          let t2 = splitPointDeg - 0.001;

          if(t1 < 0) t1 += 360;
          if(t2 < 0) t2 += 360;

          const clockwiseNew = checkAngleInArc(splitPointDeg + 0.001, splitPointDeg + SAFE_ANGLE, newAngleDeg);
          const clockwisePrev = checkAngleInArc(t1, t2, prevAngleDegRef.current);
          const clockwise = clockwiseNew && clockwisePrev;

          let t3 = splitPointDeg - SAFE_ANGLE;
          let t4 = splitPointDeg - 0.001;          

        }
      }

    }

  }

  return (
    <>
      {clockPart && (
        <svg
          ref={svgRef}
          xmlns='http://www.w3.org/2000/svg'
          width={clockPart.size}
          height={clockPart.size}
          tabIndex={0}
          focusable={true}
          aria-disabled={props.disabled ? true : undefined}
          style={props.svgBgColor ? { ...OUTLINENONE_CSS, backgroundColor: props.svgBgColor } : OUTLINENONE_CSS}
          className={`mz-round-slider ${props.disabled ? 'mz-round-slider-disabled' : ''}`}
        >
          {props.SvgDefs && <defs>{props.SvgDefs}</defs>}
        </svg>
      )}
    </>
  )
}
