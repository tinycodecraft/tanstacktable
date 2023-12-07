import { FilterFn } from '@tanstack/react-table'
import { RankingInfo } from '@tanstack/match-sorter-utils'
import React from 'react'

declare module '@tanstack/table-core' {
  interface FilterFns {
    fuzzy: FilterFn<unknown>
  }
  interface FilterMeta {
    itemRank: RankingInfo
  }
}
export type HuAutoRecordProps = Record<string, any>

export type CharacterType = {
  id: number
  name: string
  status: string
  species: string
  gender: string
}

export type CharacterRowType = {
  isItemLoaded: (index: number) => boolean
  items: CharacterType[]
}

export type PageInfoType = {
  count: number
  pages: number
  next: string
  prev: string
}

export type CharacterResultResponse = {
  results: CharacterType[]
  info: PageInfoType
}

export type Person = {
  firstName: string
  lastName: string
  age: number
  visits: number
  progress: number
  since: Date
  status: 'relationship' | 'complicated' | 'single'
  subRows?: Person[]
}

export const FETCHSIZE = 20

export interface IRoundClockProps extends IKnotTemplateProps, ITicksProps, IRopeProps, IAnimateProps, IKnotActionProps {
  // svg ------------------
  // A string specifying the backgroun color of the SVG.
  // The default value is undefined.
  svgBgColor?: string

  // events ---------------
  onChange?: (knots: IKnotProps[]) => void

  // data -----------------
  // A number or string representing the minimum value allowed on the slider.
  // This sets the lower limit for the slider's range.
  // The default value = 0.
  min?: number | string

  // A number or string representing the maximum value allowed on the slider.
  // This sets the upper limit for the slider's range.
  // The default value = 100.
  max?: number | string

  // A number specifying the increment or decrement value
  // when moving the slider handle.
  // This determines the granularity of the slider's values.
  // The default value = 1.
  step?: number

  // A number specifying the increment or decrement value
  // when using arrow keys to move the slider handle.
  // The default value = 1.
  arrowStep?: number

  // An array of strings or numbers representing custom data
  // associated with each position on the slider.
  // The default value = undefined.
  data?: (string | number)[]

  // A number specifying the number of decimal places
  // to round the slider's values.
  // This determines the precision of the slider's displayed values.
  // The default value = 0.
  round?: number

  // path -----------------

  // try to shift the internal start end angle
  clockAngleShift?:number

  // A number representing the starting angle of the slider path.
  // The angle is measured in degrees, and the default value = 0.
  pathStartAngle?: number

  // A number representing the ending angle of the slider path.
  // The angle is measured in degrees, and the default = 360.
  pathEndAngle?: number

  // A number specifying the radius of the slider path.
  // This determines the size of the circular track on which the slider moves.
  // The default value = 150.
  pathRadius?: number

  // A number representing the thickness or width of the slider path.
  // This determines the visual thickness of the circular track.
  // The default value = 5.
  pathThickness?: number

  // A string specifying the background color of the slider path.
  // This color is applied to the circular track
  // that represents the background of the slider.
  // The default value = #efefef.
  pathBgColor?: string

  // A string specifying the inner background color of the slider path.
  // This color is applied to the circular track inside the slider path.
  // The default value = undefined.
  pathInnerBgColor?: string

  // A boolean specifying the whether the inner background
  // will be the full circle.
  // The default value = undefine
  pathInnerBgFull?: boolean

  // A number representing the border width of the slider path.
  // This determines the width of the border around the circular track.
  // The default value = 0.
  pathBorder?: number

  // A string specifying the border color of the slider path.
  // This color is applied to the border around the circular track.
  // The default value = #444444.
  pathBorderColor?: string

  // knots -------------
  knots?: IKnotProps[]
  // A boolean value indicating whether the pointers
  // on the round slider can overlap each other.
  // The default value is false.
  knotsOverlap?: boolean
  // A ReactNode representing a custom SVG element
  // to be used as the pointer. This allows for
  // using a custom graphic or icon as the pointer,
  // instead of the default circular shape.
  // The default value is undefined.
  knotSVG?: ReactNode

  // text ------------------
  // A boolean value indicating whether to hide the text
  // displayed on the slider.
  // The default value is false.
  hideText?: boolean

  // A string specifying the prefix to be displayed
  // before the slider's value text.
  // This allows for adding additional text
  // or symbols to the displayed value.
  // The default value is undefined.
  textPrefix?: string

  // A string specifying the suffix to be displayed
  // after the slider's value text.
  // This allows for adding additional text
  // or symbols to the displayed value.
  // The default value is undefined.
  textSuffix?: string

  // A string specifying the color of the slider's value text.
  // The default value is #000.
  textColor?: string

  // A number specifying the font size of the slider's value text.
  // The default value is 16.
  textFontSize?: number

  // A string specifying the font family of the slider's value text.
  // The default value is undefined.
  textFontFamily?: string

  // A number specifying the horizontal offset of the displayed value text.
  // The default value is 0.
  textOffsetX?: number

  // A number specifying the vertical offset of the displayed value text.
  // The default value is 0.
  textOffsetY?: number

  // A string specifying the text betwen slider's pointer values (for
  // example, •, | or -).
  // The default value is undefined.
  textBetween?: string

  // disabled --------------
  // A boolean value indicating whether the round slider
  // is in a disabled state. If set to true,
  // the slider becomes non-interactive
  // and cannot be modified by the user.
  // The default value is false.
  disabled?: boolean

  // other -----------------
  svgDefs?: ReactNode
}

export interface IKnotActionProps {
  // A boolean value indicating whether keyboard interactions
  // are disabled for the round slider. If set to true,
  // the slider will not respond to keyboard inputs
  // (e.g., arrow keys) for moving the slider handle.
  // The default value is false.
  keyboardDisabled?: boolean

  // A boolean value indicating whether the round slider
  // should ignore mousewheel events. If set to true,
  // scrolling the mousewheel will not trigger any changes
  // in the slider's position or value.
  // The default value is false.
  mousewheelDisabled?: boolean
}

export interface IAnimateProps {
  // animation -------------
  // A boolean value indicating
  // whether to enable animation
  // when clicking on the slider.
  // If set to true, clicking on the slider
  // will trigger an animation effect.
  // The default value is false.
  animateOnClick?: boolean

  // A number specifying the duration
  // of the animation in milliseconds.
  // This determines the speed at which the animation is performed.
  // The default value is 200 ms.
  animationDuration?: number
}

export interface IRopeProps {
  // A boolean value indicating whether to hide the Rope line.
  // If set to true, the Rope line will not be visible.
  // The default value is false.
  hideRope?: boolean

  // A string specifying the background color of the Rope line.
  // The default value is #5daed2.
  ropeBgColor?: string

  // A string specifying the background color of the Rope line
  // when the slider is in a disabled state.
  // The default value is #97b0bb.
  ropeBgColorDisabled?: string

  // A string specifying the background color of the Rope line
  // when the slider is being hovered over.
  // The default value is equal to RopeBgColor property.
  ropeBgColorHover?: string

  // A boolean value indicating whether to enable range dragging.
  // If set to true, the slider Rope line can be dragged
  // in a circular range, allowing for continuous circular movement.
  // The default value is false.
  rangeDragging?: boolean
}

export interface ITicksProps {


  // A number specifying the total count of ticks
  // to be displayed on the slider.
  // This determines the number of evenly spaced ticks
  // along the slider's circumference.
  ticksCount?: number

  // A boolean value indicating whether to enable
  // the display of ticks (marks) on the slider.
  // If set to true, the ticks will be visible.
  // The default value is false.
  enableTicks?: boolean

  // A number specifying the width of the ticks.
  // The default value is 3.
  ticksWidth?: number

  // A number specifying the height of the regular ticks.
  // The default value is 10.
  ticksHeight?: number

  // A number specifying the height of the longer ticks.
  // This determines the vertical size of the longer tick marks,
  // which are typically used to highlight specific values.
  // The default value is ticksHeight * 2.
  longerTicksHeight?: number

  // A number specifying the distance
  // between the ticks and the slider panel.
  // This determines the gap or margin between the ticks
  // and the circular slider track.
  // The default value is 0.
  ticksDistanceToPanel?: number

  // A number specifying the distance
  // between the tick values and the slider.
  // This determines the gap or margin
  // between the tick labels and the circular slider track.
  // The default value is 15.
  tickValuesDistance?: number

  // A string specifying the color of the ticks.
  // This color is applied to the tick marks.
  // The default value is #efefef.
  ticksColor?: string

  // A string specifying the color of the tick values.
  // This color is applied to the text of the tick labels.
  // The default value is #000.
  tickValuesColor?: string

  // A number specifying the font size of the tick values.
  // This determines the size of the text used for the tick labels.
  // The default value is 12.
  tickValuesFontSize?: number

  // A string specifying the font family of the tick values.
  // This allows for customizing the font used for the tick labels.
  // The default value is undefined.
  tickValuesFontFamily?: string

  // A number specifying the number of ticks to group together.
  // This can be used to create intervals
  // or larger divisions between ticks.
  // For example, if set to 2, every second tick will be a larger tick.
  // The default value is 10.
  ticksGroupSize?: number

  // A boolean value indicating
  // whether to show tick values only for longer ticks.
  // If set to true, the tick values will be displayed
  // only for the longer tick marks.
  // This is useful for displaying labels on selected or significant ticks.
  // The default value is true.
  longerTickValuesOnly?: boolean

  // tick values -----------
  // A boolean value indicating
  // whether to show the tick values (labels) on the slider.
  // If set to true, the tick values will be displayed.
  // The default value is true.
  showTickValues?: boolean

  // A string specifying the prefix
  // to be displayed before the tick values.
  // This allows for adding additional text
  // or symbols to the displayed tick labels.
  // The default value is undefined.
  tickValuesPrefix?: string

  // A string specifying the suffix
  // to be displayed after the tick values.
  // This allows for adding additional text
  // or symbols to the displayed tick labels.
  // The default value is undefined.
  tickValuesSuffix?: string
}

export interface IKnotCore {
  // The radius of the pointer in SVG units.
  // Default value = 10.
  radius?: number
  // The width of the border around the pointer in SVG units.
  // Default value = 0.
  border?: number
}

export interface IKnotProps extends IKnotCore {
  // The value associated with the pointer.
  // This value determines the position of the pointer on the slider.
  // Default value = 0.
  value?: string | number

  // The background color of the pointer.
  // Default value = #163a86.
  bgColor?: string

  // The background color of the pointer when it is selected or active.
  // Default value = #000.
  bgColorSelected?: string

  // The background color of the pointer when it is disabled.
  // Default value = #a8a8a8.
  bgColorDisabled?: string

  // The background color of the pointer when it is hovered.
  // Default value is the same as bgColor.
  bgColorHover?: string

  // The color of the border around the pointer.
  // Default value = #000.
  borderColor?: string

  // Specifies whether the pointer is disabled or not.
  // If set to true, the pointer will be inactive and non-interactive.
  // Default value = false.
  disabled?: boolean

  // A string that describes the purpose or function of the pointer for accessibility purposes.
  // This label will be used as the aria-label attribute for the pointer element.
  // Default value = undefined.
  ariaLabel?: string
}
interface IAngleInfo {
  angleDeg: number
  index: number
}
interface KnotState {
  knots: IAngleInfo[]
  count: number
  angleShift: number
  
  push: (newknot: IAngleInfo, setCycle: React.Dispatch<React.SetStateAction<number>>) => void
  peek: (index: number) => IAngleInfo|null
  isInbound: (newknot: IAngleInfo) => boolean
  noMove: (newknot: IAngleInfo) => boolean
  getNewIndex: () => number
  setShiftOnce: (shift:number) => void  

}

export interface IKnotInstance extends Omit<Required<IKnotProps>, 'value|ariaLabel'>,IAngleInfo {
  id: string
  prevAngleDeg: number
  value?: string | number
  ariaLabel?: string
}
export interface IKnotBagInstance {
  knots: IKnotInstance[]
  maxRadius: number
}
export interface IStrokeProps {
  strokeDasharray: string
  strokeOffset: number
}

export interface IKnotTemplateProps {
  // A string specifying the background color of the pointer.
  // The default value is #163a86.
  knotBgColor?: string
  // A string specifying the background color of the pointer
  // when it is selected.
  // The default value is #000.
  knotBgColorSelected?: string
  // A string specifying the background color of the pointer
  // when it is in a disabled state.
  // The default value is #a8a8a8.
  knotBgColorDisabled?: string
  // A string specifying the background color of the pointer
  // when the user hovers the mouse cursor over it.
  // The default value is the same as pointerBgColorSelected.
  knotBgColorHover?: string
  // A number representing the border width of the pointer.
  // The default value is 0.
  knotBorder?: number
  // A string specifying the border color of the pointer.
  // The default value is #000.
  knotBorderColor?: string
  // A number specifying the radius of the pointer.
  // This determines the size of the circular shape r
  // epresenting the pointer.
  // The default value is 10.
  knotRadius?: number
}

export interface IData {
  min: number
  max: number
  stepAngleDeg: number
  arrowStepAngleDeg: number
  round: number
  data: (string | number)[]
  isClosedShape: boolean
}

export interface IClockCore {
  cx: number
  cy: number
  radius: number
  startAngleDeg: number
  endAngleDeg: number
  clockAngleShift: number
}

export interface IRopeInstance extends IClockCore {
  knots: IKnotInstance[]
}

export interface IClockInstance extends IData, IClockCore {
  size: number
  thickness: number
  border: number

  left: number
  top: number
  disabled: boolean
}

export interface IAnchorProps {
  top: number
  left: number
}

export interface IMarkProps {
  x: number
  y: number
  x1: number
  y1: number
  textX: number
  textY: number
  isLonger: boolean
  showText: boolean
  markValue?: string
}

export interface IMarkInstance {
  marks: IMarkProps[]
}

export interface IMarkTemplateProps extends Required<Omit<ITicksProps, 'tickValuesFontFamily'>> {
  tickValuesFontFamily?: string
}
