import React, { useEffect, useRef, useState } from 'react'
import { IAnchorProps, IKnotInstance, IRoundClockProps, ITicksProps } from 'src/config/types'
import { ClockPart } from './model/ClockPart'
import { KnotPart } from './model/KnotPart'
import { Vector2, mod } from 'mz-math'
import { RNDCLK_DF_KNOT_BORDER, RNDCLK_DF_KNOT_RADIUS, RNDCLK_DF_MAX, RNDCLK_DF_MIN, OUTLINENONE_CSS } from 'src/config/constants'
import { numberOr, useMutationObserver, valueOr } from 'src/config/methods'
import { checkAngleInArc, createStrokeFromKnots, getClosestEdge, getKnotsProps, getMaxRadius, getSteppedAngle } from 'src/config/geometries'
import { ClockFace } from './ClockFace'
import { TickMarks } from './TickMarks'
import { RopeLine } from './RopeLine'
import { KnotDot } from './KnotDot'
import { useResizeObserver } from '@mantine/hooks'
import { ReactComponent as ClockHandleSVG } from './ClockHandle.svg'
import { useKnotStore } from './model/useKnotStore'
import styled from '@emotion/styled'

export const ClockSlider = (props: IRoundClockProps) => {
  const [clockPart, setClockPart] = useState<ClockPart | null>(null)
  const [center, setCenter] = useState<Vector2 | null>(null)
  const [knotPart, setKnotPart] = useState<KnotPart | null>(null)
  const [knotAngle, setKnotAngle] = useState<number>(0)
  const [selectedKnotId, setSelectedKnotId] = useState('')
  const { animateOnClick, animationDuration, pathBgColor, pathBorderColor } = props
  const [svgRef, svgRect] = useResizeObserver()
  const prevAngleDegRef = useRef<number | null>(null)
  const [ cycles, setCycles] = useState<number>(0)
  const { push, peek, noMove, getNewIndex, setShiftOnce } = useKnotStore()

  const [anchor, setAnchor] = useState<IAnchorProps>({ left: 0, top: 0 })

  const TextSvg = styled.svg`
    & .centertext {
      width: 100px;
      height: 100px;
      position: absolute;
      top: 50%;
      left: 50%;
      margin-left: -50px;
      margin-top: -50px;
      stroke-width: 3;
      fill: none;
      stroke: #2a3fb9;
      cursor: pointer;
    }
    & .centertext.animated {
      stroke: #2a3fb9;
    }
    & .centertext.animated path {
      stroke-dasharray: 400;
      stroke-dashoffset: 400;
      transition: 1.2s ease-in;
      transform-origin: center center;
    }

    & .centertext.animated path:hover {
      transition: 1.3s ease-out;
      transform: rotate(960deg);
      stroke-dashoffset: 0;
    }
  `

  // useMutationObserver is more stable way to get anchor

  useMutationObserver(svgRef, () => {
    if (svgRef.current) {
      const { top, left } = svgRef.current.getBoundingClientRect()
      setShiftOnce(360 - (props.clockAngleShift ?? 0))
      if (anchor.top !== top || anchor.left !== left) {
        setAnchor(svgRef.current.getBoundingClientRect())
      }
      console.log(`slider position changed!`)
    }
  })

  useEffect(() => {
    if (anchor) {
      const { top, left } = anchor

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
      setCenter([myclockPart.core.cx, myclockPart.core.cy])
      setClockPart(myclockPart)

      const myknotPart = new KnotPart(myclockPart, props.knots || [], props)
      setKnotPart(myknotPart)
      setKnotAngle(myknotPart.knots[0].angleDeg - (props.clockAngleShift ?? 0))
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
    if (!isdisabled && itClock !== null && itKnots !== null && knot !== null && !knot.disabled) {
      newAngleDeg = getSteppedAngle(newAngleDeg, itClock.stepAngle, itClock.angleStart, itClock.angleEnd)
      // try to get cycle
      const tmpKnotIndex = getNewIndex()
      const tmpKnot = { angleDeg: newAngleDeg, index: tmpKnotIndex }
      if (getNewIndex() == 0) {
        push(tmpKnot,setCycles)
        console.log(`zero index`)
      } else {
        const NotMoved = noMove(tmpKnot)

        if (!NotMoved) {
          push(tmpKnot,setCycles)

          console.log(`the new knot move to ${peek(tmpKnotIndex)?.angleDeg} with index ${tmpKnotIndex}`)
        }
      }

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
        let [length, prevAngle, nextAngle] = itKnots.getAdjacentKnotInfo(knot.index, [itClock.angleStart, itClock.angleEnd], itClock.isClosed)

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
        setKnotPart(Object.assign(Object.create(itKnots), { knots: newKnots, stroke: createStrokeFromKnots(itClock.core, newKnots) }))

        setKnotAngle(newKnots[0].angleDeg - (props.clockAngleShift ?? 0))
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
          {center && (
            <g transform={`rotate(${knotAngle},${center[0]},${center[1]})`}>
              <g transform={`translate(0,-${center[0] - 25})`}>
                <svg viewBox='0 0 250 100' height={500}>
                  <ClockHandleSVG />
                </svg>
              </g>
            </g>
          )}
          {center && (
            <TextSvg viewBox='0 0 106 106'>
              <g transform={`translate(0,43)`}>
                <svg viewBox='0 0 106 106' className='centertext' height={20}>
                  <path d='M 53 53 m -50, 0 a 50,50 0 1,0 100,0 a 50,50 0 1,0 -100,0' />
                  
                </svg>

                <svg viewBox='0 0 106 106' className='centertext animated' height={20}>
                  <path d='M 53 53 m -50, 0 a 50,50 0 1,0 100,0 a 50,50 0 1,0 -100,0' />
                </svg>
                <svg viewBox='0 0 106 106' height={21}>
                <text x='50%' y='50%' dominantBaseline={`middle`} textAnchor='middle' fontSize={`2em`} stroke='#d4c436' strokeWidth={`2`} fill='#75d436'>{cycles}</text>
                </svg>
                
              </g>
            </TextSvg>
          )}

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
