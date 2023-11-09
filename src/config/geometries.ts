import { Vector2, Vector3, mod, radiansToDegrees, setDecimalPlaces, v2Sub } from 'mz-math'
import { IKnotCore } from './types'
import { valueOr } from './methods'

const getClockCenter = (circleRadius: number, maxPointerRadius: number, circleThickness: number, circleBorder: number): Vector2 => {
  const size = getClockSize(circleRadius, maxPointerRadius, circleThickness, circleBorder)

  const val = setDecimalPlaces(size / 2, 2)

  return [val, val]
}

const getClockSize = (circleRadius: number, maxPointerRadius: number, circleThickness: number, circleBorder: number): number => {
  const thickness = circleThickness + circleBorder * 2
  const diff = Math.max(0, maxPointerRadius * 2 - thickness)
  return circleRadius * 2 + thickness + diff
}
// anchor is the left and top of whole clock
const getMouseInAngle = (anchor: Vector2, mousePos: Vector2, clockCoordinates: Vector3): number => {
  const mouseVector = v2Sub(v2Sub(mousePos, anchor), [clockCoordinates[0],clockCoordinates[1]])
  let angleRad = Math.atan2(mouseVector[1] / clockCoordinates[2], mouseVector[0] / clockCoordinates[2] )
  if (angleRad < 0) { 
    angleRad += 2 * Math.PI
  }
  return radiansToDegrees(angleRad)
}

const getAnglesInDiff = (startAngle: number, endAngle: number): number => {
  if (endAngle < startAngle) {
    endAngle += 360
  }

  const diff = endAngle - startAngle
  const diffMod = mod(diff, 360)

  return diffMod === 0 && diff > 0 ? 360 : diffMod
}

const getSteppedAngle = (angleDeg: number, step: number, startAngle: number, endAngle: number): number => {
  if (mod(angleDeg, 360) === mod(startAngle, 360) || mod(angleDeg, 360) === mod(endAngle, 360)) return angleDeg
  return step === 0 ? 0 : Math.round(angleDeg / step) * step
}

const getMaxRadius = (knotCores: IKnotCore[], radiusDefault: number, borderDefault: number): number => {
  if (knotCores.length <= 0) return 0
  return knotCores
    .map((e) => valueOr(e.radius, radiusDefault) + valueOr(e.border, borderDefault) / 2)
    .reduce((prev, cur) => Math.max(prev, cur), -Infinity)
}

export { getClockCenter, getMouseInAngle, getSteppedAngle, getAnglesInDiff, getMaxRadius }
