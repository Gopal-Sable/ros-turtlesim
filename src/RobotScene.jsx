// src/RobotScene.jsx
import React, { useRef, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

function PathVisualizer({ path }) {
    return (
        <>
            {/* Waypoint spheres */}
            {path.map((point, idx) => (
                <mesh key={idx} position={[point.x, 0.1, point.y]}>
                    <sphereGeometry args={[0.15, 8, 8]} />
                    <meshStandardMaterial color="blue" />
                </mesh>
            ))}

            {/* Line strip connecting points */}
            {path.length >= 2 && (
                <line>
                    <bufferGeometry attach="geometry">
                        <bufferAttribute
                            attach="attributes-position"
                            count={path.length}
                            array={
                                new Float32Array(
                                    path.flatMap((p) => [p.x, 0.1, p.y])
                                )
                            }
                            itemSize={3}
                        />
                    </bufferGeometry>
                    <lineBasicMaterial color="cyan" linewidth={2} />
                </line>
            )}
        </>
    );
}

export default function RobotScene({ path }) {
    return (
        <Canvas camera={{ position: [0, 10, 10], fov: 50 }}>
            <ambientLight intensity={0.4} />
            <directionalLight position={[5, 10, 5]} />
            <gridHelper args={[20, 20]} />
            <OrbitControls />
            <PathVisualizer path={path} />
        </Canvas>
    );
}
