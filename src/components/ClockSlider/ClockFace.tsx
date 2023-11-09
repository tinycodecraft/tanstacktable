import React, { useRef, useState } from 'react'
import { ClockPart } from './model/ClockPart'
import { KnotPart } from './model/KnotPart'
import { IAnimationResult, newId } from 'mz-math'
import { IKnotInstance } from 'src/config/types'
import { getMouseInAngle } from 'src/config/geometries'

interface IClockFaceProps {
  clockPart: ClockPart
  knotPart: KnotPart
  animateOnClick?: boolean
  setKnot: (knot: IKnotInstance, newAngleDeg: number)=> void,
  left?: number
  top?: number
}

export const ClockFace = (props: IClockFaceProps) => {
  const { clockPart, knotPart,setKnot,animateOnClick,top,left } = props
  const [ animation, setAnimation ] = useState<IAnimationResult|null>(null);
  const [ maskId ] = useState(newId());
  const animationClosestPointer = useRef<IKnotInstance|null>(null);
  const animationSourceDegrees = useRef(0);
  const animationTargetDegrees = useRef(0);

  const onClick = (evt: MouseEvent) => {
    if(!clockPart || clockPart.disabled || (animation && animation.isAnimating()) || !top || !left) return;

    const degrees = getMouseInAngle(
        [left,top],
        [evt.clientX,evt.clientY],
        clockPart.clockCoordinates
    );

    const closestPointer = knotPart.getClosestKnot(
        
        degrees,
        clockPart.clockCoordinates
    );

    if(!closestPointer) return;

    if(animateOnClick) {
        animationClosestPointer.current = closestPointer;
        animationSourceDegrees.current = closestPointer.angleDeg;
        animationTargetDegrees.current = degrees;
        animation?.start();
    }
    else{
        setKnot(closestPointer, degrees);
    }
};
  return (
    <g>

    </g>
  )
}
