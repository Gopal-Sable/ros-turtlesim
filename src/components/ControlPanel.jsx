import { useState, useEffect, useRef } from "react";
import ROSLIB from "roslib";

export default function ControlPanel({ ros }) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordedCommands, setRecordedCommands] = useState([]);
  const [playbackDirection, setPlaybackDirection] = useState("forward");
  const cmdVelPublisherRef = useRef(null);
  const playbackTimeoutRef = useRef(null);
  const commandIndexRef = useRef(0);

  // Initialize ROS publisher
  useEffect(() => {
    if (!ros) return;

    cmdVelPublisherRef.current = new ROSLIB.Topic({
      ros: ros,
      name: "/turtle1/cmd_vel",
      messageType: "geometry_msgs/Twist",
    });

    return () => {
      clearTimeout(playbackTimeoutRef.current);
    };
  }, [ros]);

  const sendCommand = (linear, angular, save = true) => {
    if (!cmdVelPublisherRef.current) return;

    const twist = new ROSLIB.Message({
      linear: { x: linear, y: 0, z: 0 },
      angular: { x: 0, y: 0, z: angular },
    });

    cmdVelPublisherRef.current.publish(twist);

    if (isRecording && save) {
      setRecordedCommands((prev) => [
        ...prev,
        { linear, angular, timestamp: Date.now() },
      ]);
    }
  };

  const startRecording = () => {
    setIsRecording(true);
    setIsPlaying(false);
    setRecordedCommands([]);
    sendCommand(0, 0, false); 
  };

  const stopRecording = () => {
    setIsRecording(false);

    const normalized = recordedCommands.map((cmd, idx) => {
      const delay =
        idx === 0
          ? 0
          : Math.max(50, cmd.timestamp - recordedCommands[idx - 1].timestamp);
      return { ...cmd, delay };
    });

    setRecordedCommands(normalized);
    console.log("Final Recorded Commands:", normalized);
  };

  const executeCommands = (index, direction) => {
    const isReverse = direction === "reverse";
    const isFinished = isReverse
      ? index < 0
      : index >= recordedCommands.length;

    if (isFinished) {
      setIsPlaying(false);
      sendCommand(0, 0, false);
      return;
    }

    const cmd = recordedCommands[index];
    const linear = isReverse ? -cmd.linear : cmd.linear;
    const angular = isReverse ? -cmd.angular : cmd.angular;
    sendCommand(linear, angular, false);

    const nextIndex = isReverse ? index - 1 : index + 1;
    commandIndexRef.current = index;

    const delay = cmd.delay ?? 1000;

    playbackTimeoutRef.current = setTimeout(() => {
      executeCommands(nextIndex, direction);
    }, delay);
  };

  const playRecording = (direction = "forward") => {
    if (recordedCommands.length === 0 || isPlaying) return;

    setIsPlaying(true);
    setPlaybackDirection(direction);

    const startIndex =
      direction === "reverse"
        ? recordedCommands.length - 1
        : 0;

    commandIndexRef.current = startIndex;
    executeCommands(startIndex, direction);
  };

  const stopPlayback = () => {
    clearTimeout(playbackTimeoutRef.current);
    setIsPlaying(false);
    sendCommand(0, 0, false);
  };

  return (
    <div className="controls">
      <h2>Control Panel</h2>

      <div className="buttons">
        <button onClick={() => sendCommand(1.0, 0.0)} disabled={isPlaying}>
          Forward
        </button>
        <button onClick={() => sendCommand(-1.0, 0.0)} disabled={isPlaying}>
          Backward
        </button>
        <button onClick={() => sendCommand(0.0, 1.0)} disabled={isPlaying}>
          Left
        </button>
        <button onClick={() => sendCommand(0.0, -1.0)} disabled={isPlaying}>
          Right
        </button>
        <button onClick={() => sendCommand(0.0, 0.0)} disabled={isPlaying}>
          Stop
        </button>
      </div>

      <div className="record-playback">
        {!isRecording ? (
          <button onClick={startRecording} disabled={isPlaying}>
            Start Recording
          </button>
        ) : (
          <button onClick={stopRecording}>Stop Recording</button>
        )}

        <button
          onClick={() => playRecording("forward")}
          disabled={
            isRecording || isPlaying || recordedCommands.length === 0
          }
        >
          Play Forward
        </button>
        <button
          onClick={() => playRecording("reverse")}
          disabled={
            isRecording || isPlaying || recordedCommands.length === 0
          }
        >
          Play Backward
        </button>
        <button onClick={stopPlayback} disabled={!isPlaying}>
          Stop Playback
        </button>
      </div>

      <div className="status">
        <p>
          Status:{" "}
          {isRecording
            ? "Recording"
            : isPlaying
            ? `Playing ${playbackDirection}`
            : "Idle"}
        </p>
        <p>Commands: {recordedCommands.length}</p>
        {isPlaying && (
          <p>
            Current: {commandIndexRef.current + 1}/{recordedCommands.length}
          </p>
        )}
      </div>
    </div>
  );
}
