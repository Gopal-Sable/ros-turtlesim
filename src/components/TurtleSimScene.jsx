import { useEffect } from "react";
import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Text, Grid } from "@react-three/drei";
import Turtle from "./Turtle";
import Path from "./Path";
import ROSLIB from "roslib";
import { useDispatch, useSelector } from "react-redux";
import { setPlaybackDirection, setTurtlePos } from "../store/appConfigSlice";

export default function TurtleSimScene() {
    const dispatch = useDispatch();
    // add this to path marker
    const { pathPoints, playbackDirection, status, ros } = useSelector(
        (store) => store.appConfig
    );

    ////
    useEffect(() => {
        if (!ros || !ros.isConnected) return;

        const poseSubscriber = new ROSLIB.Topic({
            ros: ros,
            name: "/turtle1/pose",
            messageType: "turtlesim/Pose",
        });

        poseSubscriber.subscribe((message) => {
            const newPoint = new THREE.Vector3(
                message.x - 5.5,
                5.5 - message.y,
                0
            );
            const vectorPoints = {
                x: message.x - 5.5,
                y: 5.5 - message.y,
                z: 0,
                theta: message.theta,
            };
            dispatch(setTurtlePos(vectorPoints));
        });

        return () => {
            poseSubscriber.unsubscribe();
        };
    }, [ros]);

    const handleNodeClick = (direction) => {
        dispatch(setPlaybackDirection(direction));
    };

    return (
        <Canvas camera={{ position: [0, 0, 15], fov: 50 }}>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} />
            <Grid args={[12, 12]} rotation={[Math.PI / 2, 0, 0]} />

            <Turtle />
            <Path />

            {/* Start Node */}

            {/* <PathMarker start={true} />
            <PathMarker start={false} /> */}
            {pathPoints[0] && (
                <mesh
                    position={pathPoints[0]}
                    onClick={() => handleNodeClick(true)}
                >
                    <sphereGeometry args={[0.3, 32, 32]} />
                    <meshStandardMaterial
                        color={playbackDirection ? "yellow" : "black"}
                        emissive="black"
                        emissiveIntensity={0.5}
                    />
                </mesh>
            )}

            {/* End Node */}
            {pathPoints[pathPoints.length - 1] && status !== "recording" && (
                <mesh
                    position={pathPoints[pathPoints.length - 1]}
                    onClick={() => handleNodeClick(false)}
                >
                    <sphereGeometry args={[0.3, 32, 32]} />
                    <meshStandardMaterial
                        color={!playbackDirection ? "yellow" : "black"}
                        emissive="black"
                        emissiveIntensity={0.5}
                    />
                </mesh>
            )}

            <OrbitControls />
        </Canvas>
    );
}
