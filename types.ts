export enum CoordSystem {
  CARTESIAN = 'cartesian', // z = f(x, y)
  SPHERICAL = 'spherical', // r = f(theta, phi)
  CYLINDRICAL = 'cylindrical', // z = f(r, theta)
}

export interface GraphItem {
  id: string;
  expression: string;
  type: CoordSystem;
  visible: boolean;
  color: string;
  error?: string;
}

export interface ViewSettings {
  grid: boolean;
  axes: boolean;
  autoRotate: boolean;
  wireframe: boolean;
}

export const COLORS = [
  '#c74440', // Red
  '#2d70b3', // Blue
  '#388c46', // Green
  '#6042a6', // Purple
  '#fa7e19', // Orange
  '#000000', // Black
];