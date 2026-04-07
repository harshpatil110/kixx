import React, { Suspense, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stage, useGLTF, Html, Center } from '@react-three/drei';

/**
 * Inner mesh component — loaded separately so Suspense can catch the
 * async GLTF load without blocking the entire Canvas from rendering.
 */
function Model({ modelPath }) {
  const { scene } = useGLTF(modelPath);
  return <primitive object={scene} />;
}

/**
 * Minimal loading indicator rendered inside the WebGL scene via <Html>.
 */
function Loader() {
  return (
    <Html center>
      <div className="flex flex-col items-center gap-3 select-none pointer-events-none">
        <div className="w-6 h-6 border-2 border-stone-900 border-t-transparent rounded-full animate-spin" />
        <span className="font-label text-[0.625rem] uppercase tracking-[0.3em] text-stone-500">
          Loading Model…
        </span>
      </div>
    </Html>
  );
}

/**
 * ModelViewer
 * Accepts a `modelPath` prop — an absolute-from-public path like `/3d-models/model1.glb`.
 * Renders an interactive WebGL canvas with ambient orbit controls and neutral studio lighting.
 */
export default function ModelViewer({ modelPath }) {
  return (
    <div className="w-full h-full" style={{ minHeight: '500px' }}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 45 }}
        style={{ background: '#F7F5F0' }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 2]}
      >
        {/* Neutral Studio Lighting */}
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 10, 5]} intensity={1.2} castShadow />
        <directionalLight position={[-5, -5, -5]} intensity={0.3} />

        {/* Suspense boundary so the rest of the scene renders while GLTF streams */}
        <Suspense fallback={<Loader />}>
          <Stage
            environment="city"
            intensity={0.5}
            adjustCamera={false}
            shadows={false}
          >
            <Center>
              <Model modelPath={modelPath} />
            </Center>
          </Stage>
        </Suspense>

        <OrbitControls
          enablePan={false}
          enableZoom={true}
          minDistance={2}
          maxDistance={10}
          autoRotate={true}
          autoRotateSpeed={0.8}
        />
      </Canvas>
    </div>
  );
}

// Preload hint — useGLTF caches by URL, so hot-loading works across re-renders.
// This is a no-op if the path hasn't been used yet; safe to call unconditionally.
useGLTF.preload('/3d-models/model1.glb');
useGLTF.preload('/3d-models/model2.glb');
useGLTF.preload('/3d-models/model3.glb');
useGLTF.preload('/3d-models/model4.glb');
