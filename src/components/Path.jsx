import { useMemo } from "react";
import { Line } from "@react-three/drei";
import * as THREE from 'three'


export default function Path({ points }) {
    const linePoints = points.length >= 2
    ? points.flatMap((p) => [p.x, p.y, p.z ?? 0])
    : null;
  
  return (
    <>
      {linePoints && linePoints.length % 3 === 0 && (
        <Line points={linePoints} color="hotpink" lineWidth={2} />
      )}
    </>
  );
}
