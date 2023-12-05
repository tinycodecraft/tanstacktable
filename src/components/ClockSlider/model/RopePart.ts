import { IClockCore, IKnotInstance, IRopeInstance, IStrokeProps } from 'src/config/types'

import { getAnglesInDiff } from 'src/config/geometries'


export class RopePart  {
  _i: IRopeInstance
  _s: IStrokeProps
  constructor(rope: IClockCore, knots: IKnotInstance[]) {
    
    this._i = { ...rope, knots }
    // save clock-core path angles
    const pathStartAngle = this._i.startAngleDeg
    const pathEndAngle = this._i.endAngleDeg
    if (this._i.knots.length === 1) {
      // this._i.startAngleDeg should be circle pathstartangle
      this._i.endAngleDeg = this._i.knots[0].angleDeg
    } else {
      this._i.startAngleDeg = this._i.knots[0].angleDeg
      this._i.endAngleDeg = this._i.knots[this._i.knots.length - 1].angleDeg
    }

    const pathAnglesInDiff = getAnglesInDiff(pathStartAngle, pathEndAngle)

    if (this._i.startAngleDeg > this._i.endAngleDeg) {
      this._i.endAngleDeg += 360
    }
    let knotAnglesInDiff = getAnglesInDiff(this._i.startAngleDeg, this._i.endAngleDeg)
    const shouldSwitch = knotAnglesInDiff > pathAnglesInDiff
    if (shouldSwitch) {
      knotAnglesInDiff = 360 - knotAnglesInDiff
      this._i = { ...this._i, startAngleDeg: this._i.endAngleDeg, endAngleDeg: this._i.startAngleDeg }
    }

    const circumference = 2 * Math.PI * this._i.radius
    const strokeOffset = -(this._i.startAngleDeg / 360) * circumference
    const strokeDasharray = (knotAnglesInDiff / 360) * circumference
    const complement = circumference - strokeDasharray

    // console.log(`the stroke offset ${strokeOffset} with dasharray ${[strokeDasharray, complement].join(' ')}`)

    this._s = {
      strokeDasharray: [strokeDasharray, complement].join(' '),
      strokeOffset: strokeOffset,
    }
  }

  public getMostApartKnots(pathStartAngle: number): [IKnotInstance, IKnotInstance] | null {
    if (!this._i.knots || this._i.knots.length <= 0) return null
    let minDistance = undefined
    let maxDistance = undefined
    let beginKnot = null
    let endKnot = null
    for (const knot of this._i.knots) {
      const distance = getAnglesInDiff(pathStartAngle, knot.angleDeg)

      if (minDistance === undefined || distance < minDistance) {
        beginKnot = knot
        minDistance = distance
      }

      if (maxDistance === undefined || distance > maxDistance) {
        endKnot = knot
        maxDistance = distance
      }
    }

    if (beginKnot === null || endKnot === null) return null

    return [beginKnot, endKnot]
  }

  public get stroke(): IStrokeProps {
    return this._s
  }  
}
