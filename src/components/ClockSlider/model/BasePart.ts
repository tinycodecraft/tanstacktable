import { IClockInstance } from "src/config/types";
import { ClockPart } from "./ClockPart";

export abstract class BasePart {
    protected readonly name: string
    protected constructor(thisname: string){
        this.name = thisname;
    }
    public static getClockPart(clockinfo:IClockInstance,knotRadius:number): ClockPart{
        return new ClockPart(clockinfo,knotRadius);
    }

}