import { useEffect } from "react";
import { useDispatch } from "react-redux";
import * as ROSLIB from "roslib";
import { setRos } from "../store/appConfigSlice";

export default function ROSConnection() {
    const dispatch = useDispatch();
    useEffect(() => {
        let ros = null;
        let reconnectAttempts = 0;
        const maxReconnectAttempts = 5;
        const reconnectDelay = 3000;

        const connect = () => {
            ros = new ROSLIB.Ros({
                url: "ws://localhost:9090",
            });

            ros.on("connection", () => {
                console.log("Connected to ROS");
                reconnectAttempts = 0;
                dispatch(setRos(ros));
            });

            ros.on("error", (error) => {
                console.error("ROS connection error:", error);
                if (reconnectAttempts < maxReconnectAttempts) {
                    setTimeout(connect, reconnectDelay);
                    reconnectAttempts++;
                }
            });

            ros.on("close", () => {
                console.log("ROS connection closed");
                dispatch(setRos(null));
                if (reconnectAttempts < maxReconnectAttempts) {
                    setTimeout(connect, reconnectDelay);
                    reconnectAttempts++;
                }
            });
        };

        connect();

        return () => {
            if (ros && ros.isConnected) {
                ros.close();
            }
        };
    });

    return null;
}
