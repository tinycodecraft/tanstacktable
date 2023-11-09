import { IClockInstance, IKnotInstance, IKnotProps, IStrokeProps } from "src/config/types";
import { ClockPart } from "./ClockPart";
import { Vector3 } from "mz-math";
import { KnotPart } from "./KnotPart";

export abstract class BasePart {
    protected readonly name: string
    protected constructor(thisname: string){
        this.name = thisname;
    }
    public static getClockPart(clockinfo:IClockInstance,knotRadius:number,step:number, arrowStep:number,top:number,left:number): ClockPart{
        return new ClockPart(clockinfo,knotRadius,step,arrowStep,top,left);
    }

    public static createStroke(startDeg:number, endDeg:number,radius: number): IStrokeProps {
        const circumference = 2 * Math.PI * radius;
        const angleDiff = endDeg - startDeg;
        const strokeOffset = -(startDeg / 360) * circumference;
        const strokeDasharray = (angleDiff / 360) * circumference;
        const complement = circumference - strokeDasharray;        
        return {
            strokeDasharray: [ strokeDasharray, complement].join(' '),
            strokeOffset

        }
    }

    public static getClosestKnot(knots:IKnotInstance,mouseAngle:number, clockCoordinates: Vector3 ): IKnotInstance {

    }

}