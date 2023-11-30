import {
  RNDCLK_DF_TICKS_ENABLED,
  RNDCLK_DF_TICKS_WIDTH,
  RNDCLK_DF_TICKS_VALUES_DISTANCE,
  RNDCLK_DF_TICKS_COLOR,
  RNDCLK_DF_TICKS_VALUES_FONT_SIZE,
  RNDCLK_DF_TICKS_GROUP_SIZE,
  RNDCLK_DF_TICKS_HEIGHT,
  RNDCLK_DF_TICKS_VALUES_COLOR,
  RNDCLK_DF_TEXT_FONT_SIZE,
} from 'src/config/constants'
import { IMarkInstance, IMarkProps, IMarkTemplateProps, ITicksProps } from 'src/config/types'
import { ClockPart } from './ClockPart'
import { valueOr } from 'src/config/methods'
import { circleMovement, convertRange, degreesToRadians, setDecimalPlaces, v2MulScalar, v2Normalize } from 'mz-math'

export class MarkPart {
  _i: IMarkInstance
  _t: IMarkTemplateProps
  constructor(clockPart: ClockPart, markTemplate: ITicksProps) {
    let marksCount = valueOr(markTemplate.ticksCount, 0)
    const data = clockPart.data
    const [cx, cy, radius] = clockPart.clockCoordinates
    if (!marksCount) {
      if (data.data && data.data.length > 0) {
        marksCount = data.data.length
      } else {
        marksCount = data.max
      }
    }

    const marksHeight = valueOr(markTemplate.ticksHeight, RNDCLK_DF_TICKS_HEIGHT)
    this._t = {
      ticksCount: marksCount,
      enableTicks: valueOr(markTemplate.enableTicks, RNDCLK_DF_TICKS_ENABLED),
      ticksWidth: valueOr(markTemplate.ticksWidth, RNDCLK_DF_TICKS_WIDTH),
      ticksHeight: marksHeight,
      longerTicksHeight: valueOr(markTemplate.longerTicksHeight, marksHeight * 2),
      ticksDistanceToPanel: valueOr(markTemplate.ticksDistanceToPanel, 0),
      tickValuesDistance: valueOr(markTemplate.tickValuesDistance, RNDCLK_DF_TICKS_VALUES_DISTANCE),
      ticksColor: valueOr(markTemplate.ticksColor, RNDCLK_DF_TICKS_COLOR),
      tickValuesColor: valueOr(markTemplate.tickValuesColor, RNDCLK_DF_TICKS_VALUES_COLOR),
      tickValuesFontSize: valueOr(markTemplate.tickValuesFontSize, RNDCLK_DF_TICKS_VALUES_FONT_SIZE),
      
      ticksGroupSize: valueOr(markTemplate.ticksGroupSize, RNDCLK_DF_TICKS_GROUP_SIZE),
      longerTickValuesOnly: valueOr(markTemplate.longerTickValuesOnly, true),
      showTickValues: valueOr(markTemplate.showTickValues, true),
      tickValuesPrefix: valueOr(markTemplate.tickValuesPrefix,''),
      tickValuesSuffix: valueOr(markTemplate.tickValuesSuffix,''),
    }

    const marks: IMarkProps[] = []
    const deltaAngle = Math.abs(clockPart.angleEnd - clockPart.angleStart)
    const oneMarkAngleSize = marksCount === 0 ? 0 : deltaAngle / marksCount
    let count = marksCount

    if (!data.isClosedShape) {
      count++
    }
    const ticksSettings = this._t
    for (let i = 0; i < count; i++) {
      const currentAngle = clockPart.angleStart + i * oneMarkAngleSize
      const angleRad = convertRange(degreesToRadians(currentAngle), 0, Math.PI * 2, 0, Math.PI) // [0, Math.PI*2] ---> [0, Math.PI]

      let [x, y] = circleMovement([cx, cy], angleRad, radius)

      const isLonger = ticksSettings.ticksGroupSize !== undefined && i % ticksSettings.ticksGroupSize === 0

      let desiredDistance = ticksSettings.ticksHeight

      if (isLonger) {
        desiredDistance = ticksSettings.longerTicksHeight
      }

      const normalizedDirectionVector = v2Normalize([cx - x, cy - y])
      const tickEndVector = v2MulScalar(normalizedDirectionVector, desiredDistance)

      const tickStartVector = v2MulScalar(normalizedDirectionVector, ticksSettings.ticksDistanceToPanel + clockPart.thickness / 2)
      x += tickStartVector[0]
      y += tickStartVector[1]

      const x1 = x + tickEndVector[0]
      const y1 = y + tickEndVector[1]

      // ------- Define tick value. ---------------------
      let markValue: string | undefined = undefined
      if (
        ticksSettings.showTickValues &&
        (!ticksSettings.longerTickValuesOnly || (ticksSettings.longerTickValuesOnly && (isLonger || ticksSettings.ticksGroupSize === undefined)))
      ) {
        let value: string | number = convertRange(i, 0, marksCount, data.min, data.max)

        if (data.data.length > 0) {
          const index = Math.round(value)
          value = data.data[index]
        } else {
          value = setDecimalPlaces(value, data.round)
        }

        markValue = (value ?? '').toString()
      }

      let textX = 0
      let textY = 0
      const showText = markValue !== undefined

      if (showText) {
        const _tickValuesDistance = valueOr(desiredDistance + ticksSettings.tickValuesDistance, desiredDistance * 1.5)
        const tickTextVector = v2MulScalar(normalizedDirectionVector, _tickValuesDistance)
        textX = x + tickTextVector[0]
        textY = y + tickTextVector[1]
      }

      marks.push({
        x,
        y,
        x1,
        y1,
        textX,
        textY,
        isLonger,
        markValue,
        showText,
      })
    }

    this._i = {
      marks: marks,
    }
  }

  public get enableTicks(): boolean {
    return this._t.enableTicks
  }

  public get marks() : IMarkProps[] {
    return this._i.marks
  }

  public get marksSettings(): IMarkTemplateProps {
    return this._t
  }
}
