import React, { useEffect, useRef, useState } from 'react'
import { IClockInstance, IData, IKnotInstance, IRoundClockProps } from 'src/config/types'
import { ClockPart } from './model/ClockPart'
import { KnotPart } from './model/KnotPart'
import { isNumber } from 'mz-math'
import { RNDCLK_DF_KNOT_BORDER, RNDCLK_DF_KNOT_RADIUS, RNDCLK_DF_MAX, RNDCLK_DF_MIN, OUTLINENONE_CSS } from 'src/config/constants'
import { numberOr } from 'src/config/methods'
import { getMaxRadius } from 'src/config/geometries'

export const ClockSlider = (props: IRoundClockProps) => {
  const [data, setData] = useState<IData | null>(null)
  
  const [clockPart, setClockPart] = useState<ClockPart | null>(null)
  const [knotPart, setKnotPart] = useState<KnotPart | null>(null)
  const [selectedPointerId, setSelectedPointerId] = useState('')

  const prevAngleDegRef = useRef<number | null>(null)
  const svgRef = useRef<SVGSVGElement>(null)

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
    if (!svgRef || !svgRef.current) return
    const { left, top } = svgRef.current.getBoundingClientRect()
    const clockPart = ClockPart.getClockPart(
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
    
    setClockPart(clockPart)

    const haschanged = JSON.stringify(data) !== JSON.stringify(clockPart.data)
    if (haschanged) {
      setData(clockPart.data)
    }
  }, [data, props, svgRef])
  useEffect(() => {
    if (clockPart) {
      const knotPart = KnotPart.getKnotPart(clockPart, props.knots || [], props)
      setKnotPart(knotPart)
      
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
