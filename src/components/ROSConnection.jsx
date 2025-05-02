import { useEffect } from 'react'
import * as ROSLIB from 'roslib'

export default function ROSConnection({ setRos }) {
  useEffect(() => {
    const ros = new ROSLIB.Ros({
      url: 'ws://localhost:9090'
    })

    ros.on('connection', () => {
      console.log('Connected to ROS')
      setRos(ros)
    })

    ros.on('error', (error) => {
      console.log('Error connecting to ROS: ', error)
    })

    ros.on('close', () => {
      console.log('Connection to ROS closed')
      setRos(null)
    })

    return () => {
      ros.close()
    }
  }, [setRos])

  return null
}