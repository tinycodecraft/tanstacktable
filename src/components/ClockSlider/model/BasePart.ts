import { IClockCore, IClockInstance, IKnotInstance, IKnotProps, IKnotTemplateProps, IStrokeProps } from 'src/config/types'
import { ClockPart } from './ClockPart'
import { Vector3 } from 'mz-math'
import { KnotPart } from './KnotPart'
import { RopePart } from './RopePart'

export abstract class BasePart {
  protected readonly name: string
  protected constructor(thisname: string) {
    this.name = thisname
  }
  public static getClockPart(clockinfo:Partial<IClockInstance>, knotRadius: number|undefined, step: number|undefined, arrowStep: number|undefined, top: number, left: number): ClockPart {
    return new ClockPart(clockinfo, knotRadius, step, arrowStep, top, left)
  }

  public static getKnotPart(clockpart: ClockPart, knots: IKnotProps[], knotTemplate: IKnotTemplateProps): KnotPart {
    return new KnotPart(clockpart, knots, knotTemplate)
  }

  public static getRopePart(clockcore: IClockCore, knots: IKnotInstance[]) {
    return new RopePart(clockcore, knots)
  }

  public static createStroke(startDeg: number, endDeg: number, radius: number): IStrokeProps {
    const circumference = 2 * Math.PI * radius
    const angleDiff = endDeg - startDeg
    const strokeOffset = -(startDeg / 360) * circumference
    const strokeDasharray = (angleDiff / 360) * circumference
    const complement = circumference - strokeDasharray
    return {
      strokeDasharray: [strokeDasharray, complement].join(' '),
      strokeOffset,
    }
  }
}
