import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Color, Object3D, Vector3, type InstancedMesh } from 'three'
import type { ThemeDef } from '../themes/types'

const COUNT = 380
const dummy = new Object3D()

interface Particle {
  pos: Vector3
  vel: Vector3
  spin: number
  angVel: number
  life: number
}

/** GPU-instanced confetti burst. Mounted only during victory (and not under reduced motion). */
export function Confetti({ theme }: { theme: ThemeDef }) {
  const mesh = useRef<InstancedMesh>(null)
  const colors = useMemo(() => theme.palette.map((c) => new Color(c)), [theme])

  const particles = useMemo<Particle[]>(
    () =>
      Array.from({ length: COUNT }, () => ({
        pos: new Vector3(),
        vel: new Vector3(),
        spin: 0,
        angVel: 0,
        life: 0,
      })),
    [],
  )

  // Burst on mount.
  useEffect(() => {
    particles.forEach((p) => {
      p.pos.set((Math.random() - 0.5) * 0.6, -0.1 + Math.random() * 0.3, (Math.random() - 0.5) * 0.6)
      const ang = Math.random() * Math.PI * 2
      const up = 2.4 + Math.random() * 2.6
      const out = 0.8 + Math.random() * 1.8
      p.vel.set(Math.cos(ang) * out, up, Math.sin(ang) * out)
      p.spin = Math.random() * Math.PI
      p.angVel = (Math.random() - 0.5) * 8
      p.life = 1
    })
    if (mesh.current) {
      particles.forEach((_, i) => mesh.current!.setColorAt(i, colors[i % colors.length]))
      if (mesh.current.instanceColor) mesh.current.instanceColor.needsUpdate = true
    }
  }, [particles, colors])

  useFrame((_, delta) => {
    if (!mesh.current) return
    const dt = Math.min(delta, 0.05)
    particles.forEach((p, i) => {
      if (p.life > 0) {
        p.vel.y -= 6 * dt // gravity
        p.vel.multiplyScalar(0.98) // drag
        p.pos.addScaledVector(p.vel, dt)
        p.spin += p.angVel * dt
        p.life -= dt * 0.32
      }
      const s = Math.max(0, p.life) * 0.09
      dummy.position.copy(p.pos)
      dummy.rotation.set(p.spin, p.spin * 0.7, p.spin * 1.3)
      dummy.scale.setScalar(s)
      dummy.updateMatrix()
      mesh.current!.setMatrixAt(i, dummy.matrix)
    })
    mesh.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, COUNT]} position={[0, -0.1, 0]}>
      <planeGeometry args={[1, 1.6]} />
      <meshBasicMaterial toneMapped={false} side={2} />
    </instancedMesh>
  )
}
