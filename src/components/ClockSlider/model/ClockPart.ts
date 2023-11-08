import { IClockInstance } from 'src/config/types'
import { BasePart } from './BasePart'
import { valueOr } from 'src/config/methods'
import { getClockCenter } from 'src/config/geometries'
import {
  RNDCLK_DF_PATH_BORDER,
  RNDCLK_DF_PATH_END_ANGLE,
  RNDCLK_DF_PATH_RADIUS,
  RNDCLK_DF_PATH_START_ANGLE,
  RNDCLK_DF_PATH_THICKNESS,
} from 'src/config/constants'

export class ClockPart extends BasePart {
  _i: IClockInstance
  constructor(clockInfo: IClockInstance, knotRadius: number) {
    super('ClockPart')
    this._i = clockInfo
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
    if (this._i.endAngleDeg < this._i.startAngleDeg) {
      this._i.endAngleDeg += 360
    }
  }
}
