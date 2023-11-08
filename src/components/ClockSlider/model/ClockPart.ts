import { IClockInstance, IStrokeProps } from 'src/config/types'
import { BasePart } from './BasePart'
import { valueOr } from 'src/config/methods'
import { getClockCenter } from 'src/config/geometries'
import {
  RNDCLK_DF_ARROW_STEP,
  RNDCLK_DF_MAX,
  RNDCLK_DF_MIN,
  RNDCLK_DF_PATH_BORDER,
  RNDCLK_DF_PATH_END_ANGLE,
  RNDCLK_DF_PATH_RADIUS,
  RNDCLK_DF_PATH_START_ANGLE,
  RNDCLK_DF_PATH_THICKNESS,
  RNDCLK_DF_STEP,
} from 'src/config/constants'
import { convertRange, mod, setDecimalPlaces } from 'mz-math'

export class ClockPart extends BasePart {
  _i: IClockInstance
  _stroke: IStrokeProps

  constructor(clockInfo: IClockInstance, knotRadius: number, step: number, arrowStep: number, top: number, left: number) {
    super('ClockPart')
    this._i = clockInfo
    this._i.min = valueOr(this._i.min, RNDCLK_DF_MIN)
    this._i.max = valueOr(this._i.max, RNDCLK_DF_MAX)
    const fixstep = valueOr(step, RNDCLK_DF_STEP)
    const fixArrowStep = valueOr(arrowStep, RNDCLK_DF_ARROW_STEP)
    this._i.data = this._i.data || []
    if (this._i.data.length > 0) {
      const minIndex = this._i.data.findIndex((item) => item === this._i.min)
      const maxIndex = this._i.data.findIndex((item) => item === this._i.max)

      this._i.min = minIndex === -1 ? 0 : minIndex
      this._i.max = maxIndex === -1 ? this._i.data.length : maxIndex
    }
    this._i.radius = valueOr(this._i.radius, RNDCLK_DF_PATH_RADIUS)
    this._i.thickness = valueOr(this._i.thickness, RNDCLK_DF_PATH_THICKNESS)
    this._i.border = valueOr(this._i.thickness, RNDCLK_DF_PATH_BORDER)
    const grossthickness = this._i.thickness + this._i.border * 2
    const diff = Math.max(0, knotRadius * 2 - grossthickness)
    const size = this._i.radius * 2 + grossthickness + diff
    const [cx, cy] = getClockCenter(this._i.radius, knotRadius, this._i.thickness, this._i.border)
    this._i.cx = cx
    this._i.cy = cy
    this._i.size = size
    this._i.startAngleDeg = valueOr(this._i.startAngleDeg, RNDCLK_DF_PATH_START_ANGLE)
    this._i.endAngleDeg = valueOr(this._i.endAngleDeg, RNDCLK_DF_PATH_END_ANGLE)
    this._i.top = top
    this._i.left = left
    if (this._i.endAngleDeg < this._i.startAngleDeg) {
      this._i.endAngleDeg += 360
    }

    this._i.isClosedShape = mod(this._i.startAngleDeg, 360) === mod(this._i.endAngleDeg, 360)

    this._i.stepAngleDeg = (fixstep * 360) / (this._i.max - this._i.min)
    this._i.arrowStepAngleDeg = (fixArrowStep * 360) / (this._i.max - this._i.min)
    this._i.disabled = !!this._i.disabled
    // create the strock

    this._stroke = ClockPart.createStroke(this._i.startAngleDeg, this._i.endAngleDeg, this._i.radius)
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

  public isAngleInArc(currentAngle: number): boolean {
    if (this._i.endAngleDeg < this._i.startAngleDeg) {
      this._i.endAngleDeg += 360
    }
    return (
      (currentAngle >= this._i.startAngleDeg && currentAngle <= this._i.endAngleDeg) ||
      (currentAngle + 360 >= this._i.startAngleDeg && currentAngle + 360 <= this._i.endAngleDeg)
    )
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

  public get disabled(): boolean {
    return this._i.disabled
  }

  public get isClosed(): boolean {
    return this._i.isClosedShape
  }
}
