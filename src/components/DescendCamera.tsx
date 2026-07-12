'use client';

import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Vector3 } from 'three';

const SYSTEM_POS = new Vector3(0, 46, 84);
// Far enough back that the ring system fits in frame with the world.
const HERO_POS = new Vector3(0, 1.3, 6.1);
const ORIGIN = new Vector3(0, 0, 0);

interface Props {
  descended: boolean;
  /** Reduced motion: cut, never fly. A camera move IS motion. */
  still: boolean;
}

/**
 * System <-> hero, in one uninterrupted move.
 *
 * The fly is the whole emotional payload of descend mode, so it is also the
 * first thing to go when someone asks their OS for reduced motion: `still` cuts
 * straight to the destination. A camera tween is motion, and a vestibular-
 * sensitive viewer never agreed to be flown anywhere.
 */
export function DescendCamera({ descended, still }: Props) {
  const { camera } = useThree();
  const target = useRef(new Vector3());

  useFrame((_, delta) => {
    target.current.copy(descended ? HERO_POS : SYSTEM_POS);

    if (still) {
      camera.position.copy(target.current);
    } else {
      // Frame-rate independent easing: a 30fps machine and a 144fps machine take
      // the same wall-clock time to arrive.
      const t = 1 - Math.pow(0.0015, delta);
      camera.position.lerp(target.current, t);
    }
    camera.lookAt(ORIGIN);
  });

  return null;
}
