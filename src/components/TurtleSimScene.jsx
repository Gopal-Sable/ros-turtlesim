import { useEffect } from "react";
import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Text, Grid } from "@react-three/drei";
import Turtle from "./Turtle";
import Path from "./Path";
import ROSLIB from "roslib";

export default function TurtleSimScene({
    ros,
    turtlePos,
    setTurtlePos,
    pathPoints,
    setPathPoints,
    recordingStartIndex,
    recordingEndIndex,
    selectedNodes,
    setSelectedNodes,
    setPlaybackDirection,
    playbackDirection,
}) {
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
            setTurtlePos({
                x: newPoint.x,
                y: newPoint.y,
                z: 0,
                theta: message.theta,
            });
        });

        return () => {
            poseSubscriber.unsubscribe();
        };
    }, [ros, setTurtlePos]);

    const handleNodeClick = (node, type) => {
        setSelectedNodes((prev) => ({
            ...prev,
            [type]: node,
        }));
        setPlaybackDirection(() => (type === "start" ? "forward" : "backword"));
    };

    return (
        <Canvas camera={{ position: [0, 0, 15], fov: 75 }}>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} />
            <Grid args={[20, 20]} rotation={[Math.PI / 2, 0, 0]} />

            <Turtle
                position={[turtlePos.x, turtlePos.y, turtlePos.z]}
                rotation={[0, 0, turtlePos.theta]}
            />
            <Path points={pathPoints} />

            {/* Start Node */}
            {recordingStartIndex !== null &&
                pathPoints[recordingStartIndex] && (
                    <mesh
                        position={pathPoints[recordingStartIndex]}
                        onClick={() =>
                            handleNodeClick(
                                pathPoints[recordingStartIndex],
                                "start"
                            )
                        }
                    >
                        <sphereGeometry args={[0.3, 32, 32]} />
                        <meshStandardMaterial
                            color={
                                playbackDirection === "forward"
                                    ? "yellow"
                                    : "black"
                            }
                            emissive="black"
                            emissiveIntensity={0.5}
                        />
                    </mesh>
                )}

            {/* End Node */}
            {recordingEndIndex !== null && pathPoints[recordingEndIndex] && (
                <mesh
                    position={pathPoints[recordingEndIndex]}
                    onClick={() =>
                        handleNodeClick(pathPoints[recordingEndIndex], "end")
                    }
                >
                    <sphereGeometry args={[0.3, 32, 32]} />
                    <meshStandardMaterial
                        color={
                            playbackDirection === "backword" ? "yellow" : "black"
                        }
                        emissive="black"
                        emissiveIntensity={0.5}
                    />
                </mesh>
            )}

            <OrbitControls />
            <Text position={[0, -12, 0]} fontSize={0.5} color="black">
                Turtlesim Path Recorder
            </Text>
        </Canvas> 
    );
}
