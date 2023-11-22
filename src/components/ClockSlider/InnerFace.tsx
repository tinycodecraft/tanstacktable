import React, { useEffect, useState } from 'react'
import { ClockPart } from './model/ClockPart'
import { KnotPart } from './model/KnotPart'
import { mod, convertRange, circleMovement, degreesToRadians, Vector2 } from 'mz-math'

import { valueOr } from 'src/config/methods'

interface IInnerFaceProps {
  clockPart: ClockPart
  
  pathInnerBgColor?: string
  maskId: string
}

export const InnerFace = (props: IInnerFaceProps) => {
  const { clockPart, pathInnerBgColor, maskId } = props
  const [startPoint, setStartPoint] = useState<Vector2>([0, 0])
  const [endPoint, setEndPoint] = useState<Vector2>([0, 0])
  const [largeArcFlag, setLargeArcFlag] = useState(0)
  const [pathInnerBgFull, setPathInnerBgFull] = useState(false)
  const [cx, cy, radius] = clockPart.clockCoordinates
  const { strokeDasharray, strokeOffset } = clockPart.stroke

  useEffect(() => {
    if (mod(clockPart.angleStart, 360) === mod(clockPart.angleEnd, 360)) {
      setPathInnerBgFull(true)
      return
    }

    setPathInnerBgFull(valueOr(pathInnerBgFull, false))
  }, [pathInnerBgFull, clockPart.angleStart, clockPart.angleEnd])

  useEffect(() => {
    const startAngleDeg = convertRange(clockPart.angleStart, 0, Math.PI * 2, 0, Math.PI)
    setStartPoint(circleMovement([cx, cy], degreesToRadians(startAngleDeg), radius))

    const endAngleDeg = convertRange(clockPart.angleEnd, 0, Math.PI * 2, 0, Math.PI)
    setEndPoint(circleMovement([cx, cy], degreesToRadians(endAngleDeg), radius))

    const largeArcFlag = clockPart.angleEnd - clockPart.angleStart <= 180 ? 1 : 0
    setLargeArcFlag(largeArcFlag)
  }, [cx, cy, clockPart.angleEnd, radius, clockPart.angleStart])

  return (
    <>
      {!pathInnerBgFull && (
        <mask id={maskId}>
          <path fill='black' d={`M ${startPoint[0]} ${startPoint[1]} A ${radius} ${radius} 1 ${largeArcFlag} 0 ${endPoint[0]} ${endPoint[1]}`} />
          <path
            fill='white'
            d={`M ${startPoint[0]} ${startPoint[1]} A ${radius} ${radius} 0 ${largeArcFlag === 1 ? 0 : 1} 1 ${endPoint[0]} ${endPoint[1]}`}
          />
        </mask>
      )}

      <circle
        strokeDasharray={strokeDasharray}
        strokeDashoffset={strokeOffset}
        cx={cx}
        cy={cy}
        r={radius}
        stroke={'transparent'}
        strokeWidth={clockPart.thickness}
        fill={pathInnerBgColor}
        shapeRendering='geometricPrecision'
        strokeLinecap='round'
        data-type='path-inner'
        className='mz-round-slider-path-inner'
        mask={pathInnerBgFull ? '' : `url(#${maskId})`}
      />
    </>
  )
}
