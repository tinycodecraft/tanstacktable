import React, { useCallback, useEffect, useRef, useState } from 'react'
import { IAnchorProps, IData, IKnotInstance, IRopeProps, IRoundClockProps, ITicksProps } from 'src/config/types'
import { ClockPart } from './model/ClockPart'
import { KnotPart } from './model/KnotPart'
import { mod } from 'mz-math'
import { RNDCLK_DF_KNOT_BORDER, RNDCLK_DF_KNOT_RADIUS, RNDCLK_DF_MAX, RNDCLK_DF_MIN, OUTLINENONE_CSS } from 'src/config/constants'
import { numberOr, valueOr } from 'src/config/methods'
import { checkAngleInArc, createStrokeFromKnots, getClosestEdge, getKnotsProps, getMaxRadius, getSteppedAngle } from 'src/config/geometries'
import { ClockFace } from './ClockFace'
import { TickMarks } from './TickMarks'
import { RopeLine } from './RopeLine'
import { KnotDot } from './KnotDot'
import { useResizeObserver, useTimeout, useToggle } from '@mantine/hooks'

export const ClockSlider = (props: IRoundClockProps) => {
  const [clockPart, setClockPart] = useState<ClockPart | null>(null)
  const [knotPart, setKnotPart] = useState<KnotPart | null>(null)
  const [selectedKnotId, setSelectedKnotId] = useState('')
  const { animateOnClick, animationDuration, pathBgColor, pathBorderColor } = props
  const [svgRef, svgRect] = useResizeObserver()
  const prevAngleDegRef = useRef<number | null>(null)

  const [anchor, setAnchor] = useState<IAnchorProps>({ left: 0, top: 0 })
  const [timerOn, toggleTimer] = useToggle()
  const { start: startAnchor, clear: clearAnchor } = useTimeout(() => {
    if (svgRef.current) {
      
      setAnchor(svgRef.current?.getBoundingClientRect())
      clearAnchor()
    }
  }, 1000)

  useEffect(()=> {
    console.log(`inner parent level, knot part changed!`)

  },[knotPart])
  useEffect(() => {
    if (anchor) {
      const { top, left } = anchor
      if (!timerOn && !(top || left)) {
        startAnchor()
        const newleft = svgRef.current?.getBoundingClientRect().left
        const newtop = svgRef.current?.getBoundingClientRect().top
        if (top !== newtop || left !== newleft) {
          
          toggleTimer()
        }
      }
      
      // knotPart is not formed yet, so max knotradius need knottemplate values from props
      const maxKnotRadius = getMaxRadius(
        props.knots || [],
        valueOr(props.knotRadius, RNDCLK_DF_KNOT_RADIUS),
        valueOr(props.knotBorder, RNDCLK_DF_KNOT_BORDER),
      )
      
      const myclockPart = new ClockPart(
        {
          min: numberOr(props.min, RNDCLK_DF_MIN),
          max: numberOr(props.max, RNDCLK_DF_MAX),
          border: props.pathBorder,
          data: props.data,
          round: props.round,
          clockAngleShift: props.clockAngleShift,
          startAngleDeg: props.pathStartAngle,
          endAngleDeg: props.pathEndAngle,
          radius: props.pathRadius,
          thickness: props.pathThickness,
          disabled: props.disabled,
        },
        maxKnotRadius,
        props.step,
        props.arrowStep,
        top,
        left,
      )

      setClockPart(myclockPart)

      const myknotPart = new KnotPart(myclockPart, props.knots || [], props)
      setKnotPart(myknotPart)
    }
  }, [
    anchor,
    props.ticksCount,
    props.min,
    props.max,
    props.data,
    props.pathStartAngle,
    props.pathEndAngle,
    props.enableTicks,
    props.step,
    props.arrowStep,
    props.ticksGroupSize,
    props.clockAngleShift,
    svgRect,
  ])

  useEffect(() => {
    const clearSelectedPointer = (evt: MouseEvent) => {
      const $target = evt.target as HTMLElement
      const $pointer = $target.closest('[data-type="pointer"]')
      if ($pointer) return

      setSelectedKnotId('')
    }
    document.addEventListener('mousedown', clearSelectedPointer)

    return () => {
      document.removeEventListener('mousedown', clearSelectedPointer)
    }
  }, [anchor])

  const focusKnot = (id: string, svgElement: SVGSVGElement | null) => {
    setSelectedKnotId(id)
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
        console.log(`inner parent update knotpart...`)  
        setKnotPart(Object.assign( Object.create(itKnots),{ knots: newKnots, stroke: createStrokeFromKnots(itClock.core,newKnots)}))
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
          {props.svgDefs && <defs>{props.svgDefs}</defs>}

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
          <TickMarks clockPart={clockPart} {...(props as ITicksProps)} />
          <RopeLine
            clockPart={clockPart}
            knotPart={knotPart}
            left={anchor.left}
            top={anchor.top}
            setKnot={refreshKnot}
            animateOnClick={props.animateOnClick}
            animationDuration={props.animationDuration}
            disabled={props.disabled}
            hideRope={props.hideRope}
            rangeDragging={props.rangeDragging}
            ropeBgColor={props.ropeBgColor}
            ropeBgColorDisabled={props.ropeBgColorDisabled}
            ropeBgColorHover={props.ropeBgColorHover}
          />

          {knotPart.knots.map((knot) => {
            return (
              <KnotDot
                clockPart={clockPart}
                knot={knot}
                knotPart={knotPart}
                left={anchor.left}
                top={anchor.top}
                selectedKnotId={selectedKnotId}
                setKnot={refreshKnot}
                disabled={props.disabled}
                key={knot.id}
                keyboardDisabled={props.keyboardDisabled}
                mouseWheelDisabled={props.mousewheelDisabled}
              />
            )
          })}
        </svg>
      )}
    </>
  )
}
