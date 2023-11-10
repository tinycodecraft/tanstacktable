/* eslint-disable camelcase */
import { IKnotBagInstance, IKnotInstance, IKnotProps, IKnotTemplateProps } from 'src/config/types'
import { BasePart } from './BasePart'
import { ClockPart } from './ClockPart'
import { Vector3, circleMovement, convertRange, degreesToRadians, mod, v2Distance } from 'mz-math'
import { noEmptyOr, valueOr } from 'src/config/methods'
import {
  RNDCLK_DF_KNOT_BG_COLOR,
  RNDCLK_DF_KNOT_BG_COLOR_DISABLED,
  RNDCLK_DF_KNOT_BG_COLOR_SELECTED,
  RNDCLK_DF_KNOT_BORDER,
  RNDCLK_DF_KNOT_BORDER_COLOR,
  RNDCLK_DF_KNOT_RADIUS,
} from 'src/config/constants'
import { getSteppedAngle } from 'src/config/geometries'

export class KnotPart extends BasePart {
  _i: IKnotBagInstance
  constructor(clock: ClockPart, knots: IKnotProps[], knotTemplate: IKnotTemplateProps) {
    super('KnotBag')
    const knotvalues: IKnotInstance[] = []
    const angle = mod(clock.angleStart, 360)
    const radius = valueOr(knotTemplate.knotRadius, RNDCLK_DF_KNOT_RADIUS)
    const bgColor = valueOr(knotTemplate.knotBgColor, RNDCLK_DF_KNOT_BG_COLOR)
    const bgColorSelected = valueOr(knotTemplate.knotBgColorSelected, RNDCLK_DF_KNOT_BG_COLOR_SELECTED)
    const bgColorDisabled = valueOr(knotTemplate.knotBgColorDisabled, RNDCLK_DF_KNOT_BG_COLOR_DISABLED)
    const bgColorHover = valueOr(knotTemplate.knotBgColorHover, bgColorSelected)
    const border = valueOr(knotTemplate.knotBorder, RNDCLK_DF_KNOT_BORDER)
    const borderColor = valueOr(knotTemplate.knotBorderColor, RNDCLK_DF_KNOT_BORDER_COLOR)
    const disabled = clock.disabled

    if (!knots || knots.length <= 0) {
      knotvalues.push({
        id: '0',
        index: 0,
        radius,
        angleDeg: angle,
        prevAngleDeg: angle,
        bgColor,
        bgColorSelected,
        bgColorDisabled,
        bgColorHover,
        border,
        borderColor,
        disabled,


      } )
    } else {
      for (let i = 0; i < knots.length; i++) {
        const knot = knots[i]
        const radius_i = valueOr(knot.radius, radius)
        const bgColor_i = valueOr(knot.bgColor, bgColor)
        const bgColorSelected_i = valueOr(knot.bgColorSelected, bgColorSelected)
        const bgColorDisabled_i = valueOr(knot.bgColorDisabled, bgColorDisabled)
        const bgColorHover_i = valueOr(knot.bgColorHover, bgColorHover)
        const border_i = valueOr(knot.border, border)
        const borderColor_i = valueOr(knot.borderColor, borderColor)
        const disabled_i = valueOr(knot.disabled, disabled)
        const angleDeg = knot.value && clock.value2angle(knot.value)
        let angleAfterStep = angleDeg && getSteppedAngle(angleDeg, clock.stepAngle, clock.angleStart, clock.angleEnd)

        if (angleAfterStep && clock.isClosed && mod(angleAfterStep, 360) === mod(clock.angleEnd, 360)) {
          angleAfterStep = clock.angleStart
        }

        knotvalues.push({
          id: i.toString(),
          index: i,
          radius: radius_i,
          angleDeg: noEmptyOr(angleAfterStep),
          prevAngleDeg: noEmptyOr(angleAfterStep),
          bgColor: bgColor_i,
          bgColorSelected: bgColorSelected_i,
          bgColorDisabled: bgColorDisabled_i,
          bgColorHover: bgColorHover_i,
          border: border_i,
          borderColor: borderColor_i,
          disabled: disabled_i,
          ariaLabel: knot.ariaLabel,
        })
      }
    }

    this._i = {
      knots: knotvalues,
      maxRadius: knotvalues.map((e) => e.radius  + e.border/2).reduce((prev, cur) => Math.max(prev, cur), -Infinity),
    }
  }

  // clockCoordinates is cx,cy,radius
  public getClosestKnot(mouseAngle: number, clockCoordinates: Vector3): IKnotInstance | undefined {
    if (!this._i.knots || this._i.knots.length <= 0) return undefined
    if (this._i.knots.length === 1) return this._i.knots[0]
    const angleRad = convertRange(degreesToRadians(mouseAngle), 0, Math.PI * 2, 0, Math.PI)
    const mouseKnotOnArc = circleMovement([clockCoordinates[0], clockCoordinates[1]], angleRad, clockCoordinates[2])
    let min: number | undefined = undefined
    let closestKnot: IKnotInstance | undefined = undefined
    const validKnots = this._i.knots.filter((e) => !e.disabled)
    for (const knot of validKnots) {
      const knotAngleRad = convertRange(degreesToRadians(knot.angleDeg), 0, Math.PI * 2, 0, Math.PI)
      const knotOnArc = circleMovement([clockCoordinates[0], clockCoordinates[1]], knotAngleRad, clockCoordinates[2])
      const distance = v2Distance(mouseKnotOnArc, knotOnArc)
      if (min === undefined || distance < min) {
        min = distance
        closestKnot = knot
      }
    }

    if (closestKnot) return { ...closestKnot }

    return undefined
  }

  // that return mouse drag nearest angle if the drag exceeds the arc itself
  public getClosestEdge(startAngle:number, endAngle:number,currentKnot: IKnotInstance, clockCoordinates: Vector3) : number {

    const angleRad = convertRange(degreesToRadians(currentKnot.angleDeg), 0, Math.PI * 2, 0, Math.PI); // [0, Math.PI*2] ---> [0, Math.PI]
    const currentPointOnArc = circleMovement([ clockCoordinates[0], clockCoordinates[1] ], angleRad, clockCoordinates[2]);

    const startAngleRad = convertRange(degreesToRadians(startAngle), 0, Math.PI * 2, 0, Math.PI); // [0, Math.PI*2] ---> [0, Math.PI]
    const startPointOnArc = circleMovement([  clockCoordinates[0], clockCoordinates[1] ], startAngleRad, clockCoordinates[2]);

    const endAngleRad = convertRange(degreesToRadians(endAngle), 0, Math.PI * 2, 0, Math.PI); // [0, Math.PI*2] ---> [0, Math.PI]
    const endPointOnArc = circleMovement([  clockCoordinates[0], clockCoordinates[1] ], endAngleRad, clockCoordinates[2]);

    const distance1 = v2Distance(currentPointOnArc, startPointOnArc);
    const distance2 = v2Distance(currentPointOnArc, endPointOnArc);

    return distance1 <= distance2 ? startAngle : endAngle;
  }

  // try to return length , prevAngle, nextAngle
  public getAdjacentKnotInfo(index: number) : Vector3 {

    const length = this._i.knots.length;
    const prevIndex = mod(index-1,length)
    const nextIndex = mod(index+1, length)
    const prevAngle = this._i.knots[prevIndex].angleDeg
    const nextAngle = this._i.knots[nextIndex].angleDeg
    return [length,prevIndex,nextIndex]

  }
  
  public get knots(): IKnotInstance[] {
    return [...this._i.knots]
  }

}
