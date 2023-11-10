import { IClockCore, IClockInstance, IData, IStrokeProps } from 'src/config/types'
import { BasePart } from './BasePart'
import { valueOr } from 'src/config/methods'
import { getClockCenter } from 'src/config/geometries'
import {
  RNDCLK_DF_ARROW_STEP,
  RNDCLK_DF_KNOT_RADIUS,
  RNDCLK_DF_MAX,
  RNDCLK_DF_MIN,
  RNDCLK_DF_PATH_BORDER,
  RNDCLK_DF_PATH_END_ANGLE,
  RNDCLK_DF_PATH_RADIUS,
  RNDCLK_DF_PATH_START_ANGLE,
  RNDCLK_DF_PATH_THICKNESS,
  RNDCLK_DF_ROUND,
  RNDCLK_DF_STEP,
} from 'src/config/constants'
import { Vector3, convertRange, mod, setDecimalPlaces } from 'mz-math'

export class ClockPart extends BasePart {
  _i: IClockInstance
  _stroke: IStrokeProps

  constructor(
    clockInfo: Partial<IClockInstance>,
    knotRadius: number | undefined,
    step: number | undefined,
    arrowStep: number | undefined,
    top: number,
    left: number,
  ) {
    super('ClockPart')

    let min = valueOr(clockInfo.min, RNDCLK_DF_MIN)
    let max = valueOr(clockInfo.max, RNDCLK_DF_MAX)
    const fixstep = valueOr(step, RNDCLK_DF_STEP)
    const fixArrowStep = valueOr(arrowStep, RNDCLK_DF_ARROW_STEP)
    const data = clockInfo.data || []
    const fixKnotRadius = valueOr(knotRadius, RNDCLK_DF_KNOT_RADIUS)
    if (clockInfo.data && clockInfo.data.length > 0) {
      const minIndex = clockInfo.data.findIndex((item) => item === min)
      const maxIndex = clockInfo.data.findIndex((item) => item === max)

      min = minIndex === -1 ? 0 : minIndex
      max = maxIndex === -1 ? clockInfo.data.length : maxIndex
    }
    const radius = valueOr(clockInfo.radius, RNDCLK_DF_PATH_RADIUS)
    const thickness = valueOr(clockInfo.thickness, RNDCLK_DF_PATH_THICKNESS)
    const border = valueOr(clockInfo.border, RNDCLK_DF_PATH_BORDER)
    const grossthickness = thickness + border * 2
    const diff = Math.max(0, fixKnotRadius * 2 - grossthickness)
    const size = radius * 2 + grossthickness + diff
    const [cx, cy] = getClockCenter(radius, fixKnotRadius, thickness, border)
    const round = valueOr(clockInfo.round, RNDCLK_DF_ROUND)

    const startAngleDeg = valueOr(clockInfo.startAngleDeg, RNDCLK_DF_PATH_START_ANGLE)
    let endAngleDeg = valueOr(clockInfo.endAngleDeg, RNDCLK_DF_PATH_END_ANGLE)
    if (endAngleDeg < startAngleDeg) {
      endAngleDeg += 360
    }

    const isClosedShape = mod(startAngleDeg, 360) === mod(endAngleDeg, 360)

    const stepAngleDeg = (fixstep * 360) / (max - min)
    const arrowStepAngleDeg = (fixArrowStep * 360) / (max - min)
    const disabled = !!clockInfo.disabled
    // create the strock

    this._i = {
      arrowStepAngleDeg,
      border,
      cx,
      cy,
      data,
      disabled,
      endAngleDeg,
      isClosedShape,
      left,
      max,
      min,
      radius,
      round,
      size,
      startAngleDeg,
      stepAngleDeg,
      thickness,
      top,
    }

    this._stroke = ClockPart.createStroke(startAngleDeg, endAngleDeg, radius)
  }
  public angle2value(angle: number): string | number {
    if (this._i.endAngleDeg < this._i.startAngleDeg) {
      this._i.endAngleDeg += 360
    }
    if (angle < this._i.startAngleDeg) {
      angle += 360
    }
    let value: string | number = convertRange(angle, this._i.startAngleDeg, this._i.endAngleDeg, this._i.min, this._i.max)

    if (this._i.data.length > 0) {
      const index = Math.round(value)
      value = this._i.data[index]
    } else {
      value = setDecimalPlaces(value, this._i.round)
    }

    return value
  }

  public value2angle(value: string | number): number {
    let _value: number
    if (this._i.endAngleDeg < this._i.startAngleDeg) {
      this._i.endAngleDeg += 360
    }

    if (this._i.data.length > 0) {
      const foundIndex = this._i.data.findIndex((item) => item === value)
      _value = foundIndex === -1 ? 0 : foundIndex
    } else {
      _value = typeof value !== 'number' ? this._i.min : value
    }
    return mod(convertRange(_value, this._i.min, this._i.max, this._i.startAngleDeg, this._i.endAngleDeg), 360)
  }


  public get arcAngle(): number {
    if (this._i.endAngleDeg < this._i.startAngleDeg) {
      this._i.endAngleDeg += 360
    }
    const diff = this._i.endAngleDeg - this._i.startAngleDeg
    const diffMod = mod(diff, 360)
    return diffMod === 0 && diff > 0 ? 360 : diffMod
  }

  public get stroke(): IStrokeProps {
    return this._stroke
  }

  public get data(): IData {
    return { ...(this._i as IData) }
  }

  public get core(): IClockCore {
    return { ...(this._i as IClockCore) }
  }

  public get border(): number {
    return this._i.border
  }

  public get angleStart(): number {
    return this._i.startAngleDeg
  }
  public get angleEnd(): number {
    return this._i.endAngleDeg
  }

  public get stepAngle(): number {
    return this._i.stepAngleDeg
  }
  public get arrowStepAngle(): number {
    return this._i.arrowStepAngleDeg
  }

  public get thickness(): number {
    return this._i.thickness
  }

  public get disabled(): boolean {
    return this._i.disabled
  }
  public get size(): number {
    return this._i.size
  }

  public get isClosed(): boolean {
    return this._i.isClosedShape
  }
  public get clockCoordinates(): Vector3 {
    return [this._i.cx, this._i.cy, this._i.radius]
  }
}
