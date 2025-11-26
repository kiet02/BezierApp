export const POINT_SIZE = 12;

export type Pt = { x: number; y: number };
export type Segment = {
  id: string;
  main: Pt;
  c1: Pt; // control 1
  c2: Pt; // control 2
};

export function uid() {
  return String(Date.now()) + Math.floor(Math.random() * 9999);
}

export function distance(p1: Pt, p2: Pt) {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

// tính độ dài cubic Bezier bằng method sampling
export function cubicBezierLength(p0: Pt, c1: Pt, c2: Pt, p3: Pt, steps = 30) {
  let prev = p0;
  let length = 0;
  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    const x =
      Math.pow(1 - t, 3) * p0.x +
      3 * Math.pow(1 - t, 2) * t * c1.x +
      3 * (1 - t) * t * t * c2.x +
      t * t * t * p3.x;
    const y =
      Math.pow(1 - t, 3) * p0.y +
      3 * Math.pow(1 - t, 2) * t * c1.y +
      3 * (1 - t) * t * t * c2.y +
      t * t * t * p3.y;
    length += distance(prev, { x, y });
    prev = { x, y };
  }
  return length;
}

// midpoint để hiển thị length
export function cubicBezierMidPoint(p0: Pt, c1: Pt, c2: Pt, p3: Pt) {
  const t = 0.5;
  const x =
    Math.pow(1 - t, 3) * p0.x +
    3 * Math.pow(1 - t, 2) * t * c1.x +
    3 * (1 - t) * t * t * c2.x +
    t * t * t * p3.x;
  const y =
    Math.pow(1 - t, 3) * p0.y +
    3 * Math.pow(1 - t, 2) * t * c1.y +
    3 * (1 - t) * t * t * c2.y +
    t * t * t * p3.y;
  return { x, y };
}
