import { Vector2, mod, radiansToDegrees, setDecimalPlaces, v2Sub } from 'mz-math'

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

const getMouseInAngle = (anchor: Vector2, mousePos: Vector2, center: Vector2, clockRadius: number): number => {
  const mouseVector = v2Sub(v2Sub(mousePos, anchor), center)
  let angleRad = Math.atan2(mouseVector[1] / clockRadius, mouseVector[0] / clockRadius)
  if (angleRad < 0) {
    angleRad += 2 * Math.PI
  }
  return radiansToDegrees(angleRad)
}

const getSteppedAngle=(angleDeg: number, step:number, startAngle:number,endAngle: number ): number => {
  if((mod(angleDeg, 360) === mod(startAngle, 360)) ||
  (mod(angleDeg, 360) === mod(endAngle, 360))) return angleDeg;
return step === 0 ? 0 : Math.round(angleDeg / step) * step;
}



export { getClockCenter,getMouseInAngle,getSteppedAngle }
