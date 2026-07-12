'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { BackSide, Color, DoubleSide, type Group, type Mesh, type ShaderMaterial } from 'three';
import type { PlanetDNA } from '@/lib/planetDNA';

/**
 * ONE world, in full.
 *
 * This is the entire spectacle budget, spent on a single planet — because at
 * system scale a planet is 12 to 58 pixels, and shoreline foam, cloud shadows
 * and city lights are all smaller than the anti-aliasing. Rendering this stack
 * 84 times would pay for detail that is physically invisible.
 *
 * Descending into one world is choosing one world to work on. The spectacle is
 * the reward for focusing, which is the whole thesis of the product.
 *
 * Layers: surface (terrain + ocean + ice + lava + night cities) · clouds ·
 * atmosphere rim · rings · moons · quest beacons.
 */

/** Shared GLSL: value-noise fbm on the sphere's own normal, so it never seams. */
const NOISE = /* glsl */ `
  vec3 hash3(vec3 p) {
    p = vec3(dot(p, vec3(127.1, 311.7, 74.7)),
             dot(p, vec3(269.5, 183.3, 246.1)),
             dot(p, vec3(113.5, 271.9, 124.6)));
    return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
  }

  float noise(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    vec3 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(mix(dot(hash3(i + vec3(0,0,0)), f - vec3(0,0,0)),
                       dot(hash3(i + vec3(1,0,0)), f - vec3(1,0,0)), u.x),
                   mix(dot(hash3(i + vec3(0,1,0)), f - vec3(0,1,0)),
                       dot(hash3(i + vec3(1,1,0)), f - vec3(1,1,0)), u.x), u.y),
               mix(mix(dot(hash3(i + vec3(0,0,1)), f - vec3(0,0,1)),
                       dot(hash3(i + vec3(1,0,1)), f - vec3(1,0,1)), u.x),
                   mix(dot(hash3(i + vec3(0,1,1)), f - vec3(0,1,1)),
                       dot(hash3(i + vec3(1,1,1)), f - vec3(1,1,1)), u.x), u.y), u.z);
  }

  float fbm(vec3 p, int octaves) {
    float total = 0.0;
    float amp = 0.5;
    for (int i = 0; i < 6; i++) {
      if (i >= octaves) break;
      total += noise(p) * amp;
      p *= 2.02;
      amp *= 0.5;
    }
    return total;
  }
`;

const SURFACE_VERT = /* glsl */ `
  varying vec3 vNormalW;
  varying vec3 vPos;
  void main() {
    vNormalW = normalize(mat3(modelMatrix) * normal);
    vPos = normal;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const SURFACE_FRAG = /* glsl */ `
  uniform vec3 uLand;
  uniform vec3 uBand;
  uniform vec3 uOcean;
  uniform vec3 uLightDir;
  uniform float uLandmass;
  uniform float uRugged;
  uniform float uScale;
  uniform float uIce;
  uniform float uStorms;
  uniform float uLava;
  uniform float uCityLights;
  uniform float uBarren;
  uniform float uFrozen;
  uniform float uHasBand;
  uniform float uSeed;
  uniform float uTime;

  varying vec3 vNormalW;
  varying vec3 vPos;

  ${NOISE}

  void main() {
    vec3 p = vPos * uScale + uSeed;

    // Continents. Higher landmass -> more of the sphere sits above sea level.
    float h = fbm(p, 5) + uLandmass - 0.5;
    // Mountains only bite where there is already land.
    h += fbm(p * 3.1, 4) * uRugged * 0.35 * step(0.0, h);

    float land = smoothstep(0.0, 0.03, h);

    // Ocean: deep in the basins, bright over the shelves. Kept DARK on purpose —
    // see below.
    float depth = clamp(-h * 4.0, 0.0, 1.0);
    vec3 ocean = mix(uOcean * 1.5, uOcean * 0.28, depth);

    // Shoreline. The single cheapest trick that reads as "a real planet".
    float shore = smoothstep(0.06, 0.0, abs(h)) * (1.0 - uFrozen);
    ocean += vec3(0.35, 0.75, 0.85) * shore * 0.55;

    // Land: the biome band from the repo's second language, layered over the
    // primary biome colour. 65 of 84 worlds have a real language mix.
    float bands = fbm(p * 1.7 + 11.0, 3);
    vec3 landCol = mix(uLand, uBand, smoothstep(0.0, 0.35, bands) * uHasBand * 0.65);

    // CONTINENTS MUST READ. A "living-mirror" world's biome colour is blue, and
    // a blue continent on a blue ocean is mush — you cannot see the land at all.
    // Pull land 40% toward warm terrain so it always separates from water, while
    // still carrying enough of the biome hue to identify the world at a glance.
    landCol = mix(landCol, vec3(0.66, 0.58, 0.40), 0.55);

    // Altitude shading: peaks go pale, lowlands go dark.
    landCol = mix(landCol * 0.75, landCol * 1.7, smoothstep(0.0, 0.4, h));

    // A world with no README has no map: bleached, featureless, unsurveyed.
    landCol = mix(landCol, vec3(0.42, 0.40, 0.38), uBarren * 0.75);

    // Lava seams follow open issues. Ridge noise makes them crack, not blob.
    float seam = 1.0 - abs(fbm(p * 2.4 - 5.0, 4)) * 6.0;
    seam = clamp(seam, 0.0, 1.0);
    vec3 lava = vec3(1.0, 0.35, 0.05) * pow(seam, 3.0) * uLava * land;

    vec3 surface = mix(ocean, landCol, land);

    // Ice caps, and an archived world ices over entirely.
    float lat = abs(vPos.y);
    float ice = smoothstep(1.0 - uIce - 0.12, 1.0 - uIce + 0.04, lat);
    ice = max(ice, uFrozen * 0.55);
    surface = mix(surface, vec3(0.86, 0.92, 0.97), clamp(ice, 0.0, 1.0));

    // Lighting. One key light; the terminator is where the cities wake up.
    float lambert = dot(normalize(vNormalW), normalize(uLightDir));
    float day = smoothstep(-0.12, 0.35, lambert);

    vec3 col = surface * (0.08 + day * 1.05) + lava * (1.0 - day * 0.5);

    // Night-side cities. Stars max out at 3 across this whole universe, so only
    // a handful of worlds ever earn this. That rarity is the point.
    float night = 1.0 - day;
    float cities = step(0.55, fbm(p * 7.0 + 3.0, 3) + 0.5) * land * night;
    col += vec3(1.0, 0.85, 0.55) * cities * uCityLights * 0.9;

    // Storm bands: open issues, drifting.
    float storm = fbm(p * 2.0 + vec3(uTime * 0.02, 0.0, 0.0), 3);
    col = mix(col, col * 0.55 + vec3(0.18), smoothstep(0.2, 0.6, storm) * uStorms * day * 0.6);

    gl_FragColor = vec4(col, 1.0);
  }
`;

const CLOUD_VERT = SURFACE_VERT;

const CLOUD_FRAG = /* glsl */ `
  uniform vec3 uLightDir;
  uniform float uTime;
  uniform float uStorms;
  uniform float uSeed;
  varying vec3 vNormalW;
  varying vec3 vPos;

  ${NOISE}

  void main() {
    // Clouds drift at their own rate: parallax against the surface below.
    vec3 p = vPos * 2.6 + uSeed + vec3(uTime * 0.012, 0.0, uTime * 0.005);
    float c = fbm(p, 4) + 0.5;
    // Clouds must VEIL the world, not replace it. The first pass covered so much
    // of the sphere that the mottling you saw was cloud, not continents — the
    // terrain shader was doing its job and nobody could see it.
    float cover = mix(0.58, 0.80, uStorms);
    float a = smoothstep(cover, cover + 0.22, c);

    float day = smoothstep(-0.2, 0.4, dot(normalize(vNormalW), normalize(uLightDir)));
    vec3 col = mix(vec3(0.35, 0.38, 0.45), vec3(1.0), day);

    gl_FragColor = vec4(col, a * 0.5);
  }
`;

const ATMO_VERT = SURFACE_VERT;

/** Fresnel rim. The biggest "wow per instruction" in the whole shader stack. */
const ATMO_FRAG = /* glsl */ `
  uniform vec3 uColor;
  uniform vec3 uLightDir;
  varying vec3 vNormalW;
  varying vec3 vPos;
  void main() {
    vec3 view = normalize(cameraPosition);
    float rim = 1.0 - abs(dot(normalize(vNormalW), normalize(view)));
    // A tight, faint rim reads as air. A wide, opaque one reads as a blue donut
    // stuck to the planet — which is exactly what the first pass rendered.
    rim = pow(rim, 4.5);
    float day = smoothstep(-0.45, 0.5, dot(normalize(vNormalW), normalize(uLightDir)));
    gl_FragColor = vec4(uColor, rim * (0.05 + day * 0.45));
  }
`;

interface Props {
  dna: PlanetDNA;
  /** Reduced motion: nothing spins, nothing drifts, nothing pulses. */
  still: boolean;
}

const LIGHT_DIR: [number, number, number] = [1, 0.35, 0.6];

export function HeroPlanet({ dna, still }: Props) {
  const worldRef = useRef<Group>(null);
  const cloudRef = useRef<Mesh>(null);
  const surfaceMat = useRef<ShaderMaterial>(null);
  const cloudMat = useRef<ShaderMaterial>(null);

  const surfaceUniforms = useMemo(
    () => ({
      uLand: { value: new Color(dna.landColor) },
      uBand: { value: new Color(dna.bandColor ?? dna.landColor) },
      uOcean: { value: new Color(dna.oceanColor) },
      uLightDir: { value: LIGHT_DIR },
      uLandmass: { value: dna.landmass },
      uRugged: { value: dna.ruggedness },
      uScale: { value: dna.continentScale },
      uIce: { value: dna.iceCaps },
      uStorms: { value: dna.storms },
      uLava: { value: dna.lava },
      uCityLights: { value: dna.cityLights },
      uBarren: { value: dna.barren ? 1 : 0 },
      uFrozen: { value: dna.frozen ? 1 : 0 },
      uHasBand: { value: dna.bandColor ? 1 : 0 },
      uSeed: { value: (dna.seed % 1000) / 100 },
      uTime: { value: 0 },
    }),
    [dna]
  );

  const cloudUniforms = useMemo(
    () => ({
      uLightDir: { value: LIGHT_DIR },
      uTime: { value: 0 },
      uStorms: { value: dna.storms },
      uSeed: { value: (dna.seed % 997) / 100 },
    }),
    [dna]
  );

  useFrame((state, delta) => {
    if (still) return;
    if (worldRef.current) worldRef.current.rotation.y += delta * (dna.frozen ? 0 : 0.045);
    if (cloudRef.current) cloudRef.current.rotation.y += delta * 0.012; // parallax
    if (surfaceMat.current) surfaceMat.current.uniforms.uTime.value = state.clock.elapsedTime;
    if (cloudMat.current) cloudMat.current.uniforms.uTime.value = state.clock.elapsedTime;
  });

  const beacons = useMemo(
    () =>
      Array.from({ length: dna.beacons }, (_, i) => {
        const phi = Math.acos(1 - (2 * (i + 0.5)) / Math.max(dna.beacons, 1));
        const theta = Math.PI * (1 + Math.sqrt(5)) * i;
        return [
          Math.sin(phi) * Math.cos(theta),
          Math.sin(phi) * Math.sin(theta),
          Math.cos(phi),
        ] as [number, number, number];
      }),
    [dna.beacons]
  );

  const moons = useMemo(
    () =>
      Array.from({ length: dna.moons }, (_, i) => ({
        distance: 2.4 + i * 0.42,
        speed: 0.22 - i * 0.02,
        phase: (i / Math.max(dna.moons, 1)) * Math.PI * 2,
        tilt: (i % 2 === 0 ? 1 : -1) * (0.15 + i * 0.08),
      })),
    [dna.moons]
  );

  return (
    <group rotation={[0, 0, dna.axialTilt]}>
      <group ref={worldRef}>
        {/* Surface: terrain, ocean, shoreline, ice, lava seams, night cities. */}
        <mesh>
          <icosahedronGeometry args={[1.5, 32]} />
          <shaderMaterial
            ref={surfaceMat}
            vertexShader={SURFACE_VERT}
            fragmentShader={SURFACE_FRAG}
            uniforms={surfaceUniforms}
          />
        </mesh>

        {/* Quest beacons: one light per unfinished task, with a beam to the sky. */}
        {beacons.map((dir, i) => (
          <group key={i} position={[dir[0] * 1.5, dir[1] * 1.5, dir[2] * 1.5]}>
            <mesh>
              <sphereGeometry args={[0.045, 8, 8]} />
              <meshBasicMaterial color="#fde68a" />
            </mesh>
            <mesh position={[dir[0] * 0.35, dir[1] * 0.35, dir[2] * 0.35]}>
              <sphereGeometry args={[0.018, 6, 6]} />
              <meshBasicMaterial color="#fde68a" transparent opacity={0.45} />
            </mesh>
          </group>
        ))}
      </group>

      {/* Clouds drift at their own speed — parallax against the surface. */}
      <mesh ref={cloudRef}>
        <sphereGeometry args={[1.56, 64, 64]} />
        <shaderMaterial
          ref={cloudMat}
          vertexShader={CLOUD_VERT}
          fragmentShader={CLOUD_FRAG}
          uniforms={cloudUniforms}
          transparent
          depthWrite={false}
        />
      </mesh>

      {/* Atmosphere rim. */}
      <mesh scale={1.09}>
        <sphereGeometry args={[1.5, 48, 48]} />
        <shaderMaterial
          vertexShader={ATMO_VERT}
          fragmentShader={ATMO_FRAG}
          uniforms={{
            uColor: { value: new Color(dna.frozen ? '#93c5fd' : dna.landColor) },
            uLightDir: { value: LIGHT_DIR },
          }}
          transparent
          side={BackSide}
          depthWrite={false}
        />
      </mesh>

      {/* Rings: earned by written lore, or by shipping a release. Tilted well off
          the camera plane — edge-on, a ring is a one-pixel scratch, not a ring. */}
      {dna.rings > 0 && (
        <mesh rotation={[Math.PI / 3.1, 0, 0.42]}>
          <ringGeometry args={[1.95, 2.65, 96]} />
          <meshBasicMaterial
            color={dna.landColor}
            transparent
            opacity={dna.rings * 0.22}
            side={DoubleSide}
            depthWrite={false}
          />
        </mesh>
      )}

      {/* Moons: open pull requests. Work in flight, orbiting the world. */}
      {moons.map((moon, i) => (
        <Moon key={i} {...moon} still={still} />
      ))}

      {/* Release flare. Two worlds in the universe have ever earned this. */}
      {dna.celebration > 0 && (
        <mesh scale={1.3}>
          <sphereGeometry args={[1.5, 32, 32]} />
          <meshBasicMaterial
            color="#fff7ed"
            transparent
            opacity={dna.celebration * 0.12}
            side={BackSide}
            depthWrite={false}
          />
        </mesh>
      )}
    </group>
  );
}

function Moon({
  distance,
  speed,
  phase,
  tilt,
  still,
}: {
  distance: number;
  speed: number;
  phase: number;
  tilt: number;
  still: boolean;
}) {
  const ref = useRef<Group>(null);
  useFrame((state, delta) => {
    if (still || !ref.current) return;
    ref.current.rotation.y += speed * delta;
  });
  return (
    <group ref={ref} rotation={[tilt, phase, 0]}>
      <mesh position={[distance, 0, 0]}>
        <icosahedronGeometry args={[0.11, 2]} />
        <meshStandardMaterial color="#cbd5e1" roughness={0.9} />
      </mesh>
    </group>
  );
}
