import { Vector2, setDecimalPlaces } from "mz-math";

 const getClockCenter = (
    circleRadius: number,
    maxPointerRadius: number,
    circleThickness: number,
    circleBorder: number
) : Vector2 => {

    const size = getClockSize(
        circleRadius,
        maxPointerRadius,
        circleThickness,
        circleBorder
    );

    const val = setDecimalPlaces(size/2, 2);

    return [
        val,
        val,
    ];
};

 const getClockSize = (
    circleRadius: number,
    maxPointerRadius: number,
    circleThickness: number,
    circleBorder: number
) : number => {
    const thickness = circleThickness + circleBorder * 2;
    const diff = Math.max(0, maxPointerRadius * 2 - thickness);
    return circleRadius * 2 + thickness + diff;
};

export { getClockCenter}