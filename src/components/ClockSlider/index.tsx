import React, { useCallback, useEffect, useRef, useState } from 'react'
import { IAnchorProps, IData, IKnotInstance, IRoundClockProps } from 'src/config/types'
import { ClockPart } from './model/ClockPart'
import { KnotPart } from './model/KnotPart'
import { mod } from 'mz-math'
import { RNDCLK_DF_KNOT_BORDER, RNDCLK_DF_KNOT_RADIUS, RNDCLK_DF_MAX, RNDCLK_DF_MIN, OUTLINENONE_CSS } from 'src/config/constants'
import { numberOr } from 'src/config/methods'
import { checkAngleInArc, getClosestEdge, getKnotsProps, getMaxRadius, getSteppedAngle } from 'src/config/geometries'
import { ClockFace } from './ClockFace'

export const ClockSlider = (props: IRoundClockProps) => {
  const [data, setData] = useState<IData | null>(null)

  const [clockPart, setClockPart] = useState<ClockPart | null>(null)
  const [knotPart, setKnotPart] = useState<KnotPart | null>(null)
  const [selectedPointerId, setSelectedPointerId] = useState('')
  const { animateOnClick, animationDuration, pathBgColor, pathBorderColor } = props
  const svgRef = useRef<SVGSVGElement|null>(null)
  const prevAngleDegRef = useRef<number | null>(null)
  
  const [anchor, setAnchor] = useState<IAnchorProps>( { left: 0, top: 0 } )

  const measuredRef = useCallback((node: SVGSVGElement)=> {
    if(node!=null)
    {
      setAnchor(node.getBoundingClientRect())
      svgRef.current = node;
      console.log(`the anchor svg is detected!`)
    }

  },[]);

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
  }, [anchor])

  useEffect(() => {
    const { top, left } = anchor
    console.log(`creating clock part with top: ${top},left: ${left}`)
    const myclockPart = new ClockPart(
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
  }, [data, props,anchor])

  useEffect(() => {
    if (clockPart !== null) {
      console.log(`try to create the knotpart`)
      const myknotPart = new KnotPart(clockPart, props.knots || [], props)
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
    clockPart,
    data,

  ])

  const focusKnot = (id: string, svgElement: SVGSVGElement | null) => {
    setSelectedPointerId(id)
    if (svgElement != null) {
      // eslint-disable-next-line @typescript-eslint/non-nullable-type-assertion-style
      const $pointer = svgElement.querySelector(`[data-id="${id}"]`) as HTMLElement
      if ($pointer) {
        $pointer.focus()
      }
    }
  }

  const refreshKnot = (itClock: ClockPart, itKnots: KnotPart, knot: IKnotInstance, newAngleDeg: number, isdisabled?: boolean): void => {
    if (!isdisabled && itClock !== null && knotPart !== null && knot !== null && !knot.disabled) {
      newAngleDeg = getSteppedAngle(newAngleDeg, itClock.stepAngle, itClock.angleStart, itClock.angleEnd)
      if (itClock.isClosed && mod(newAngleDeg, 360) === mod(itClock.angleEnd, 360)) {
        newAngleDeg = itClock.angleStart
      }
      if (knot.angleDeg === newAngleDeg) {
        // please update (actually no update)
        // focus has setpointer-id
        focusKnot(knot.id, svgRef.current)
        return
      }
      const handleOverlap = !props.knotsOverlap // if not allow overlap => do following

      if (handleOverlap) {
        // eslint-disable-next-line prefer-const
        let [length, prevAngle, nextAngle] = knotPart.getAdjacentKnotInfo(knot.index, [itClock.angleStart, itClock.angleEnd], itClock.isClosed)

        if (length === 2 && prevAngle === nextAngle) {
          const splitPointDeg = prevAngle
          if (prevAngleDegRef.current === null) {
            prevAngleDegRef.current = newAngleDeg
          } else {
            // Clockwise: new angle in (splitPointDeg, splitPointDeg + 90]
            // Clockwise: prev angle in [splitPointDeg - 90, splitPointDeg)
            // CounterClockwise: new angle in [splitPointDeg - 90, splitPointDeg)
            // CounterClockwise: prev angle in (splitPointDeg, splitPointDeg + 90]
            const SAFE_ANGLE = 150

            let t1 = splitPointDeg - SAFE_ANGLE
            let t2 = splitPointDeg - 0.001

            if (t1 < 0) t1 += 360
            if (t2 < 0) t2 += 360

            const clockwiseNew = checkAngleInArc(splitPointDeg + 0.001, splitPointDeg + SAFE_ANGLE, newAngleDeg)
            const clockwisePrev = checkAngleInArc(t1, t2, prevAngleDegRef.current)
            const clockwise = clockwiseNew && clockwisePrev

            let t3 = splitPointDeg - SAFE_ANGLE
            let t4 = splitPointDeg - 0.001

            if (t3 < 0) t3 += 360
            if (t4 < 0) t4 += 360

            const counterClockwiseNew = checkAngleInArc(t3, t4, newAngleDeg)
            const counterClockwisePrev = checkAngleInArc(splitPointDeg + 0.001, splitPointDeg + SAFE_ANGLE, prevAngleDegRef.current)
            const counterClockwise = counterClockwiseNew && counterClockwisePrev

            if (clockwise || counterClockwise) {
              renewKnots(itKnots, itClock, knot, splitPointDeg)

              // please update (actually no update)
              return
            }

            if (newAngleDeg !== splitPointDeg) {
              prevAngleDegRef.current = newAngleDeg
            }
          }
        }

        if (nextAngle <= prevAngle) {
          nextAngle += 360
        } else {
          if (mod(prevAngle, 360) <= mod(nextAngle, 360)) {
            prevAngle = mod(prevAngle, 360)
            nextAngle = mod(nextAngle, 360)
          }
        }

        if (!checkAngleInArc(prevAngle, nextAngle, newAngleDeg)) {
          newAngleDeg = getClosestEdge(prevAngle, nextAngle, newAngleDeg, itClock.clockCoordinates)
        }
      }

      renewKnots(itKnots, itClock, knot, newAngleDeg)
      // please update ( actually no update)
    }
  }

  const renewKnots = (itKnots: KnotPart, itClock: ClockPart, knot: IKnotInstance, newAngleDeg: number) => {
    if (itKnots !== null && itClock !== null) {
      const newKnots = itKnots.getNewKnots(knot.index, newAngleDeg)
      if (newKnots !== null) {
        itKnots.knots = newKnots
        setKnotPart(knotPart)
        if (typeof props.onChange === 'function') {
          const newKnotProps = getKnotsProps(itClock, newKnots)
          props.onChange(newKnotProps)
        }
      }

      focusKnot(knot.id, svgRef.current)
    }
  }

  return (
    <>
      {clockPart && knotPart && (
        <svg
          ref={measuredRef}
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

          <ClockFace
            clockPart={clockPart}
            knotPart={knotPart}
            disabled={props.disabled}
            setKnot={refreshKnot}
            animateOnClick={animateOnClick}
            animationDuration={animationDuration}
            anchor={anchor}
            pathBgColor={pathBgColor}
            pathBorderColor={pathBorderColor}
          />
        </svg>
      )}
    </>
  )
}
