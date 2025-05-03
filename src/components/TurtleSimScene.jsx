import { useEffect } from 'react'
import * as THREE from 'three'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Text, Grid } from '@react-three/drei'
import Turtle from './Turtle'
import Path from './Path'
import ROSLIB from 'roslib'

export default function TurtleSimScene({ ros, turtlePos, setTurtlePos, pathPoints, setPathPoints }) {
  useEffect(() => {
    if (!ros) return

    const poseSubscriber = new ROSLIB.Topic({
      ros: ros,
      name: '/turtle1/pose',
      messageType: 'turtlesim/Pose'
    })

    poseSubscriber.subscribe((message) => {
      setTurtlePos({
        x: message.x - 5.5,
        y: 5.5 - message.y,
        z: 0,
        theta: message.theta // Add theta to the position state
      })
      setPathPoints(prev => [...prev, new THREE.Vector3(message.x - 5.5, 5.5 - message.y, 0)])
    })

    return () => {
      poseSubscriber.unsubscribe()
    }
  }, [ros, setTurtlePos, setPathPoints])

  return (
    <Canvas camera={{ position: [0, 0, 15], fov: 75 }}>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      
      <Grid args={[11, 11]} rotation={[Math.PI/2, 0, 0]} />
      
      <Turtle position={[turtlePos.x, turtlePos.y, turtlePos.z]} rotation={[0, 0, turtlePos.theta]} />
      <Path points={pathPoints} />
      
      <OrbitControls />
      
      <Text position={[0, -6, 0]} fontSize={0.5} color="black">
        Turtlesim in R3F
      </Text>
    </Canvas>
  )
}