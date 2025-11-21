import * as THREE from 'three';
import * as math from 'mathjs';
import { CoordSystem } from '../types';

// Resolution of the grid
const SEGMENTS = 100; 

const preprocessEquation = (expression: string): string => {
  // 1. Normalize symbols to variables for mathjs
  let expr = expression
    .replace(/θ/g, 'theta')
    .replace(/φ/g, 'phi')
    .replace(/π/g, 'pi');

  // 2. Handle Absolute Value |x| -> abs(x)
  // We loop to handle cases like |x| + |y| properly
  let prev = "";
  while (prev !== expr) {
    prev = expr;
    expr = expr.replace(/\|([^|]+)\|/g, 'abs($1)');
  }

  // 3. Handle trig powers: sin^2(x) -> (sin(x))^2
  // Matches: func^n( simple_chars )
  // e.g. sin^2(theta), cos^2(2*x)
  // Note: This simple regex does not handle nested parentheses inside the function arg
  const trigFuncs = 'sin|cos|tan|csc|sec|cot|sinh|cosh|tanh';
  const powerRegex = new RegExp(`\\b(${trigFuncs})\\^(\\d+)\\s*\\(([^()]+)\\)`, 'gi');
  expr = expr.replace(powerRegex, '($1($3))^$2');

  return expr;
};

export const generateGeometry = (
  expression: string,
  type: CoordSystem
): THREE.BufferGeometry => {
  const geometry = new THREE.BufferGeometry();
  
  // Pre-process the equation to handle symbols and special syntax
  const safeExpression = preprocessEquation(expression);

  // Safe compile
  let compiled: math.EvalFunction;
  try {
    compiled = math.compile(safeExpression);
  } catch (e) {
    throw new Error("Invalid syntax");
  }

  const vertices: number[] = [];
  const indices: number[] = [];
  const uvs: number[] = [];

  if (type === CoordSystem.CARTESIAN) {
    // Domain: x [-10, 10], y [-10, 10]
    const range = 10;
    const step = (range * 2) / SEGMENTS;

    for (let i = 0; i <= SEGMENTS; i++) {
      for (let j = 0; j <= SEGMENTS; j++) {
        const x = -range + i * step;
        const y = -range + j * step;
        
        let z = 0;
        try {
            // Evaluate z = f(x,y)
            const scope = { x, y, t: Date.now() / 1000 };
            const result = compiled.evaluate(scope);
            z = typeof result === 'number' ? result : 0;
            if (!isFinite(z) || isNaN(z)) z = 0;
            if (z > 20) z = 20;
            if (z < -20) z = -20;
        } catch (e) {
            z = 0;
        }

        vertices.push(x, z, y); // Swap Y and Z for Three.js (Y is up)
        uvs.push(i / SEGMENTS, j / SEGMENTS);
      }
    }
  } else if (type === CoordSystem.SPHERICAL) {
    // Updated Convention: Physics/ISO
    // r = f(theta, phi)
    // Theta (θ): Polar angle [0, pi] (Angle from Up axis)
    // Phi (φ): Azimuthal angle [0, 2pi] (Angle around Up axis)
    
    const phiMax = Math.PI * 2; // Azimuth
    const thetaMax = Math.PI;   // Polar
    
    for (let i = 0; i <= SEGMENTS; i++) {
      for (let j = 0; j <= SEGMENTS; j++) {
        // i maps to phi (azimuth)
        const phi = (i / SEGMENTS) * phiMax;
        // j maps to theta (polar)
        const theta = (j / SEGMENTS) * thetaMax;

        let r = 0;
        try {
          const scope = { theta, phi, t: Date.now() / 1000 };
          const result = compiled.evaluate(scope);
          r = typeof result === 'number' ? result : 0;
          if (!isFinite(r) || isNaN(r)) r = 0;
        } catch (e) {
          r = 0;
        }

        // Spherical to Cartesian conversion (Three.js Y-up):
        // x = r * sin(theta) * cos(phi)
        // z = r * sin(theta) * sin(phi)  (Depth)
        // y = r * cos(theta)             (Up)

        const x = r * Math.sin(theta) * Math.cos(phi);
        const y = r * Math.cos(theta);
        const z = r * Math.sin(theta) * Math.sin(phi);

        vertices.push(x, y, z);
        uvs.push(i / SEGMENTS, j / SEGMENTS);
      }
    }
  } else if (type === CoordSystem.CYLINDRICAL) {
    // Domain: r [0, 10], theta [0, 2pi]
    const rMax = 10;
    const thetaMax = Math.PI * 2;

    for (let i = 0; i <= SEGMENTS; i++) {
      for (let j = 0; j <= SEGMENTS; j++) {
        // i maps to r
        const r = (i / SEGMENTS) * rMax;
        // j maps to theta
        const theta = (j / SEGMENTS) * thetaMax;

        let height = 0; // z value
        try {
            const scope = { r, theta, t: Date.now() / 1000 };
            const result = compiled.evaluate(scope);
            height = typeof result === 'number' ? result : 0;
            if (!isFinite(height) || isNaN(height)) height = 0;
             if (height > 20) height = 20;
             if (height < -20) height = -20;
        } catch (e) {
            height = 0;
        }

        const x = r * Math.cos(theta);
        const y = height;
        const z = r * Math.sin(theta);

        vertices.push(x, y, z);
        uvs.push(i / SEGMENTS, j / SEGMENTS);
      }
    }
  }

  // Generate indices for grid mesh
  for (let i = 0; i < SEGMENTS; i++) {
    for (let j = 0; j < SEGMENTS; j++) {
      const a = i * (SEGMENTS + 1) + j;
      const b = i * (SEGMENTS + 1) + j + 1;
      const c = (i + 1) * (SEGMENTS + 1) + j;
      const d = (i + 1) * (SEGMENTS + 1) + j + 1;

      indices.push(a, b, d);
      indices.push(a, d, c);
    }
  }

  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();

  return geometry;
};