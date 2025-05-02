import { useState, useEffect, useRef } from "react";
import ROSLIB from "roslib";

export default function ControlPanel({ ros }) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordedCommands, setRecordedCommands] = useState([]);
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

    // Normalize time differences
    const baseTime = recordedCommands[0]?.timestamp || Date.now();
    const normalized = recordedCommands.map((cmd, idx) => ({
      ...cmd,
      delay: idx === 0 ? 0 : cmd.timestamp - recordedCommands[idx - 1].timestamp,
    }));

    setRecordedCommands(normalized);
    console.log("Final Recorded Commands:", normalized);
  };

  const executeCommands = (index) => {
    if (index >= recordedCommands.length) {
      setIsPlaying(false);
      sendCommand(0, 0, false);
      return;
    }

    const cmd = recordedCommands[index];
    sendCommand(cmd.linear, cmd.angular, false);

    const delay = recordedCommands[index + 1]?.delay || 1000;
    commandIndexRef.current = index + 1;

    playbackTimeoutRef.current = setTimeout(() => {
      executeCommands(commandIndexRef.current);
    }, delay);
  };

  const playRecording = () => {
    if (recordedCommands.length === 0 || isPlaying) return;

    setIsPlaying(true);
    commandIndexRef.current = 0;
    executeCommands(0);
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
        <button onClick={() => sendCommand(1.0, 0.0)}>Forward</button>
        <button onClick={() => sendCommand(-1.0, 0.0)}>Backward</button>
        <button onClick={() => sendCommand(0.0, 1.0)}>Left</button>
        <button onClick={() => sendCommand(0.0, -1.0)}>Right</button>
        <button onClick={() => sendCommand(0.0, 0.0)}>Stop</button>
      </div>

      <div className="record-playback">
        {!isRecording ? (
          <button onClick={startRecording} disabled={isPlaying}>
            Start Recording
          </button>
        ) : (
          <button onClick={stopRecording}>Stop Recording</button>
        )}

        <button onClick={playRecording} disabled={isRecording || isPlaying}>
          Play
        </button>
        <button onClick={stopPlayback} disabled={!isPlaying}>
          Stop Playback
        </button>
      </div>

      <p>Status: {isRecording ? "Recording" : isPlaying ? "Playing" : "Idle"}</p>
      <p>Commands: {recordedCommands.length}</p>
    </div>
  );
}
