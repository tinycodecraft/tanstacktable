/* eslint-disable camelcase */
import { IClockInstance, IData, IKnotBagInstance, IKnotInstance, IKnotProps, IKnotTemplateProps } from "src/config/types";
import { BasePart } from "./BasePart";
import { ClockPart } from "./ClockPart";
import { mod } from "mz-math";
import { noEmptyOr, value3Or, valueOr } from "src/config/methods";
import { RNDCLK_DF_KNOT_BG_COLOR, RNDCLK_DF_KNOT_BG_COLOR_DISABLED, RNDCLK_DF_KNOT_BG_COLOR_SELECTED, RNDCLK_DF_KNOT_BORDER, RNDCLK_DF_KNOT_BORDER_COLOR, RNDCLK_DF_KNOT_RADIUS } from "src/config/constants";
import { getSteppedAngle } from "src/config/geometries";

export class KnotPart extends BasePart {
    _i: IKnotBagInstance
    constructor(clock: ClockPart, knots: IKnotProps[], knotTemplate: IKnotTemplateProps){
        super('KnotBag')
        const knotvalues: IKnotInstance[] = []
        const angle = mod(clock.angleStart, 360)
        const radius = valueOr(knotTemplate.knotRadius,RNDCLK_DF_KNOT_RADIUS)
        const bgColor = valueOr(knotTemplate.knotBgColor,RNDCLK_DF_KNOT_BG_COLOR)
        const bgColorSelected = valueOr(knotTemplate.knotBgColorSelected,RNDCLK_DF_KNOT_BG_COLOR_SELECTED)
        const bgColorDisabled = valueOr(knotTemplate.knotBgColorDisabled, RNDCLK_DF_KNOT_BG_COLOR_DISABLED)
        const bgColorHover = valueOr(knotTemplate.knotBgColorHover, bgColorSelected)
        const border = valueOr(knotTemplate.knotBorder, RNDCLK_DF_KNOT_BORDER)
        const borderColor = valueOr(knotTemplate.knotBorderColor,RNDCLK_DF_KNOT_BORDER_COLOR)
        const disabled = clock.disabled;



        if( !knots ||  knots.length <0){

            knotvalues.push({
                id:'0',
                index: 0,
                radius,
                angleDeg:angle,
                prevAngleDeg: angle,
                bgColor,
                bgColorSelected,
                bgColorDisabled,
                bgColorHover,
                border,
                borderColor,
                disabled
            } )



        }
        else {
            for(let i = 0; i < knots.length; i++){
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
                let angleAfterStep = angleDeg && getSteppedAngle(angleDeg,clock.stepAngle,clock.angleStart, clock.angleEnd)

                if(angleAfterStep && clock.isClosed && mod(angleAfterStep,360) === mod(clock.angleEnd,360))
                {
                    angleAfterStep = clock.angleStart
                }

                knotvalues.push({
                    id: i.toString(),
                    index:i,
                    radius: radius_i,
                    angleDeg: noEmptyOr( angleAfterStep),
                    prevAngleDeg: noEmptyOr( angleAfterStep ),
                    bgColor:bgColor_i,
                    bgColorSelected: bgColorSelected_i,
                    bgColorDisabled: bgColorDisabled_i,
                    bgColorHover: bgColorHover_i,
                    border: border_i,
                    borderColor: borderColor_i,
                    disabled: disabled_i,
                    ariaLabel: knot.ariaLabel


                } )

            }
        }

        this._i={
            knots: knotvalues,
            maxRadius: knotvalues.map(e=>  (e.radius ?? 0 )+(e.border ?? 0)/2).reduce((prev,cur)=> Math.max(prev,cur),-Infinity)
        }
        
    }
}