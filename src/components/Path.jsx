import * as THREE from 'three'

export default function Path({ points }) {
  if (!points || points.length < 2) return null

  const lineGeometry = new THREE.BufferGeometry().setFromPoints(points)

  return (
    <line geometry={lineGeometry}>
      <lineBasicMaterial color="hotpink" linewidth={2} />
    </line>
  )
}