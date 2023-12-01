/* eslint-disable camelcase */
import { IKnotBagInstance, IKnotInstance, IKnotProps, IKnotTemplateProps } from 'src/config/types'
import { ClockPart } from './ClockPart'
import { Vector2, Vector3, circleMovement, convertRange, degreesToRadians, mod, v2Distance } from 'mz-math'
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

export class KnotPart {
  _i: IKnotBagInstance
  _t: Required<IKnotTemplateProps>
  constructor(clock: ClockPart, knots: IKnotProps[], knotTemplate: IKnotTemplateProps) {
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
    this._t = {
      knotBgColor: bgColor,
      knotBgColorDisabled: bgColorDisabled,
      knotBgColorHover: bgColorHover,
      knotBgColorSelected: bgColorSelected,
      knotBorder: border,
      knotBorderColor: borderColor,
      knotRadius: radius,
    }

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
      })
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
        const angleDeg = clock.value2angle(knot.value!==undefined ? knot.value: clock.data.min)
        let angleAfterStep = getSteppedAngle(angleDeg, clock.stepAngle, clock.angleStart, clock.angleEnd)

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
      maxRadius: knotvalues.map((e) => e.radius + e.border / 2).reduce((prev, cur) => Math.max(prev, cur), -Infinity),
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

  // try to return length , prevAngle, nextAngle
  // clockAngleInfo is from clockPart give startangle, endangle
  public getAdjacentKnotInfo(index: number, clockAngleInfo: Vector2, isclosed: boolean): Vector3 {
    const length = this._i.knots.length
    const [startAngleDeg, endAngleDeg] = clockAngleInfo
    if (isclosed) {
      const prevIndex = mod(index - 1, length)
      const nextIndex = mod(index + 1, length)
      const prevAngle = this._i.knots[prevIndex].angleDeg
      const nextAngle = this._i.knots[nextIndex].angleDeg
      return [length, prevAngle, nextAngle]
    } else {
      const prevAngle = index === 0 ? startAngleDeg : this._i.knots[index - 1].angleDeg
      const nextAngle = index === this._i.knots.length - 1 ? endAngleDeg : this._i.knots[index + 1].angleDeg
      return [length, prevAngle, nextAngle]
    }
  }

  public getNewKnots(knotIndex: number, newAngleDeg: number): IKnotInstance[] | null {
    const changed = this._i.knots[knotIndex].angleDeg !== newAngleDeg
    console.log(`try to find new knot`)
    if (changed) {
      console.log(`the new knots are changed`)
      const newKnots = [...this._i.knots]
      newKnots[knotIndex].prevAngleDeg = this._i.knots[knotIndex].angleDeg
      newKnots[knotIndex].angleDeg = newAngleDeg

      return newKnots
    }
    return null
  }

  public set knots(newKnots: IKnotInstance[]) {
    this._i = {
      knots: [...newKnots],
      maxRadius: newKnots.map((e) => e.radius + e.border / 2).reduce((prev, cur) => Math.max(prev, cur), -Infinity),
    }
  }

  public get knots(): IKnotInstance[] {
    return [...this._i.knots]
  }

  public get knotTemplate(): Required<IKnotTemplateProps> {
    return { ...this._t }
  }
}
