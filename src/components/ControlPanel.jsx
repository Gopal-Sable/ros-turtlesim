import { useState, useEffect, useRef } from "react";
import ROSLIB from "roslib";
import * as THREE from "three";
import { basePathURL } from "../utils/constants";
import { useDispatch, useSelector } from "react-redux";
import { addPathPoints, setPath } from "../store/appConfigSlice";
export default function ControlPanel() {
    const [isRecording, setIsRecording] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);

    const cmdVelPublisherRef = useRef(null);
    const playbackTimeoutRef = useRef(null);
    const currentPoseRef = useRef(null);

    const [savedPaths, setSavedPaths] = useState([]);
    const [selectedPath, setSelectedPath] = useState("");

    const ros = useSelector((store) => store.appConfig.ros);
    const pathPoints = useSelector((store) => store.appConfig.pathPoints);
    const playbackDirection = useSelector(
        (store) => store.appConfig.playbackDirection
    );

    const dispatch = useDispatch();

    useEffect(() => {
        if (!ros) return;

        cmdVelPublisherRef.current = new ROSLIB.Topic({
            ros,
            name: "/turtle1/cmd_vel",
            messageType: "geometry_msgs/Twist",
        });

        const poseSubscriber = new ROSLIB.Topic({
            ros,
            name: "/turtle1/pose",
            messageType: "turtlesim/Pose",
        });

        poseSubscriber.subscribe((pose) => {
            currentPoseRef.current = pose;
            if (isRecording) {
                const newPoint = new THREE.Vector3(
                    pose.x - 5.5,
                    5.5 - pose.y,
                    0
                );
                dispatch(addPathPoints(newPoint));
            }
        });
        fetch(basePathURL, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        })
            .then((res) => res.json())
            .then((data) => setSavedPaths([...data]))
            .catch((error) => console.log(error));

        return () => {
            poseSubscriber.unsubscribe();
        };
    }, [ros, isRecording]);

    const sendCommand = (linear, angular) => {
        if (!cmdVelPublisherRef.current || !ros || !ros.isConnected) return;
        const twist = new ROSLIB.Message({
            linear: { x: linear, y: 0, z: 0 },
            angular: { x: 0, y: 0, z: angular },
        });
        cmdVelPublisherRef.current.publish(twist);
    };

    const startRecording = () => {
        dispatch(setPath([]));
        setIsRecording(true);
        sendCommand(0, 0);
    };

    const stopRecording = async () => {
        setIsRecording(false);
        try {
            const res = await fetch(basePathURL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: "path_" + Date.now(),
                    path: pathPoints.map((p) => ({ x: p.x, y: p.y, z: p.z })),
                    start: 0,
                    end: pathPoints.length - 1,
                }),
            });
            const data = await res.json();
            setSavedPaths((prev) => [...prev, data]);
        } catch (error) {
            console.log(error);
        }
    };

    const teleportToNode = (node) => {
        return new Promise((resolve) => {
            if (!ros || !ros.isConnected || !node) {
                resolve(false);
                return;
            }

            const teleportService = new ROSLIB.Service({
                ros,
                name: "/turtle1/teleport_absolute",
                serviceType: "turtlesim/TeleportAbsolute",
            });

            const request = new ROSLIB.ServiceRequest({
                x: node.x + 5.5,
                y: 5.5 - node.y,
                theta: pathPoints[0]?.theta || 0,
            });

            teleportService.callService(request, (response) => {
                currentPoseRef.current = {
                    x: node.x + 5.5,
                    y: 5.5 - node.y,
                    theta: pathPoints[0]?.theta || 0,
                };
                resolve(true);
            });
        });
    };
    const executePath = async () => {
        if (!ros?.isConnected || isPlaying) {
            return;
        }

        setIsPlaying(true);
        clearTimeout(playbackTimeoutRef.current);

        try {
            let pathSegment;
            const pathEndIdx = pathPoints.length - 1;
            const startIdx = 0;
            if (playbackDirection) {
                pathSegment =
                    startIdx < pathEndIdx
                        ? pathPoints.slice(startIdx, pathEndIdx + 1)
                        : pathPoints.slice(pathEndIdx, startIdx + 1).reverse();
            } else {
                pathSegment =
                    startIdx < pathEndIdx
                        ? pathPoints.slice(startIdx, pathEndIdx + 1).reverse()
                        : pathPoints.slice(pathEndIdx, startIdx + 1);
            }

            await teleportToNode({
                ...pathSegment[0],
                theta: pathSegment[0].theta || 0,
            });

            await followRosPath(pathSegment);
        } catch (error) {
            console.error("Path execution failed:", error);
        } finally {
            setIsPlaying(false);
        }
    };

    const followRosPath = async (pathSegment) => {
        if (!pathSegment || pathSegment.length < 2) return;

        const pointThreshold = 0.21;
        const commandDelay = 1;
        const maxLinearSpeed = 8.0;
        const maxAngularSpeed = 2.0;

        for (let i = 0; i < pathSegment.length - 1; i++) {
            const targetPoint = pathSegment[i + 1];
            let distance = Infinity;
            let angleDiff = Infinity;

            while (distance > pointThreshold) {
                const currentPose = currentPoseRef.current;
                if (!currentPose) break;

                const currentRosX = currentPose.x;
                const currentRosY = currentPose.y;
                const targetRosX = targetPoint.x + 5.5;
                const targetRosY = 5.5 - targetPoint.y;

                const dx = targetRosX - currentRosX;
                const dy = targetRosY - currentRosY;
                distance = Math.sqrt(dx * dx + dy * dy);
                const targetAngle = Math.atan2(dy, dx);

                angleDiff = targetAngle - currentPose.theta;
                angleDiff = ((angleDiff + Math.PI) % (2 * Math.PI)) - Math.PI;

                if (Math.abs(angleDiff) > 0.1) {
                    const angular =
                        Math.sign(angleDiff) *
                        Math.min(maxAngularSpeed, Math.abs(angleDiff));
                    sendCommand(0, angular);
                } else {
                    const linear = Math.min(maxLinearSpeed, distance);
                    sendCommand(linear, 0);
                }
                await new Promise((resolve) => {
                    playbackTimeoutRef.current = setTimeout(
                        resolve,
                        commandDelay
                    );
                });
            }
        }
        sendCommand(0, 0);
    };
    return (
        <div className="control-panel">
            <div className="movement-controls">
                <button
                    onClick={() => sendCommand(1.0, 0)}
                    disabled={isPlaying}
                >
                    Forward
                </button>
                <button
                    onClick={() => sendCommand(-1.0, 0)}
                    disabled={isPlaying}
                >
                    Backward
                </button>
                <button
                    onClick={() => sendCommand(0, 1.0)}
                    disabled={isPlaying}
                >
                    Left
                </button>
                <button
                    onClick={() => sendCommand(0, -1.0)}
                    disabled={isPlaying}
                >
                    Right
                </button>
            </div>

            <div className="recording-controls">
                {!isRecording ? (
                    <button onClick={startRecording} disabled={isPlaying}>
                        Start Recording
                    </button>
                ) : (
                    <button onClick={stopRecording}>Stop Recording</button>
                )}
            </div>
            <div className="show-paths">
                <select
                    name="selectPath"
                    id="selectPath"
                    value={selectedPath}
                    onChange={(e) => {
                        if (isPlaying) return;
                        const pathId = e.target.value;
                        setSelectedPath(pathId);

                        fetch(`${basePathURL}/${pathId}`)
                            .then((res) => res.json())
                            .then((data) => {
                                if (!data.path)
                                    throw new Error("Invalid path data");

                                // Convert path points to THREE.Vector3 array
                                const vectorPoints = data.path.map(
                                    (p) => new THREE.Vector3(p.x, p.y, p.z)
                                );
                                dispatch(setPath(vectorPoints));
                            })
                            .catch((error) => {
                                console.error("Error loading path:", error);
                                // Reset to empty path if loading fails
                                dispatch(setPath([]));
                            });
                    }}
                >
                    <option>Select Path</option>
                    {savedPaths.map(({ _id, name }) => {
                        return (
                            <option key={_id} value={_id}>
                                {name}
                            </option>
                        );
                    })}
                </select>
            </div>
            <div className="path-execution">
                <button onClick={executePath} disabled={isRecording}>
                    Execute Path
                </button>
            </div>
        </div>
    );
}
