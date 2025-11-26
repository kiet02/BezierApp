// BezierCanvas.tsx
import React, { useMemo } from 'react';
import { Platform } from 'react-native';
import {
  Canvas,
  Path,
  Points,
  Text,
  Skia,
  vec,
  matchFont,
} from '@shopify/react-native-skia';
import { cubicBezierLength, cubicBezierMidPoint, Segment } from '@utils/utils';

type BezierCanvasProps = {
  segments: Segment[];
  activeMainId: string | null;
};

export function BezierCanvas({ segments, activeMainId }: BezierCanvasProps) {
  // tạo path Bézier
  const fullPath = useMemo(() => {
    const path = Skia.Path.Make();
    if (segments.length === 0) return path;
    path.moveTo(segments[0].main.x, segments[0].main.y);
    for (let i = 0; i < segments.length - 1; i++) {
      const s = segments[i];
      const next = segments[i + 1];
      path.cubicTo(
        s.c2.x,
        s.c2.y,
        next.c1.x,
        next.c1.y,
        next.main.x,
        next.main.y,
      );
    }
    return path;
  }, [segments]);

  const fontFamily = Platform.select({ ios: 'Helvetica', default: 'Arial' });
  const font = matchFont({ fontFamily, fontSize: 14 })!;
  return (
    <Canvas style={{ flex: 1 }}>
      {/* Bézier path */}
      <Path path={fullPath} color="cyan" style="stroke" strokeWidth={3} />

      {/* Hiển thị các control lines */}
      {segments.map(s => {
        const show = activeMainId === s.id;
        return (
          <React.Fragment key={'g-' + s.id}>
            {show && (
              <>
                <Points
                  points={[vec(s.main.x, s.main.y), vec(s.c1.x, s.c1.y)]}
                  mode="polygon"
                  color="rgba(255,220,0,0.35)"
                  strokeWidth={1}
                />
                <Points
                  points={[vec(s.main.x, s.main.y), vec(s.c2.x, s.c2.y)]}
                  mode="polygon"
                  color="rgba(200,100,255,0.35)"
                  strokeWidth={1}
                />
              </>
            )}
          </React.Fragment>
        );
      })}

      {/* Đường nối các main points */}
      {segments.slice(0, -1).map((s, i) => (
        <Points
          key={'mline-' + s.id}
          points={[
            vec(s.main.x, s.main.y),
            vec(segments[i + 1].main.x, segments[i + 1].main.y),
          ]}
          mode="polygon"
          color="rgba(255,255,255,0.06)"
          strokeWidth={1}
        />
      ))}

      {/* Hiển thị độ dài segment bằng cm */}
      {segments.slice(0, -1).map((s, i) => {
        const next = segments[i + 1];
        const len =
          cubicBezierLength(s.main, s.c2, next.c1, next.main, 30) / 10;
        const mid = cubicBezierMidPoint(s.main, s.c2, next.c1, next.main);
        return (
          <Text
            key={'len-' + s.id}
            x={mid.x}
            y={mid.y}
            text={`${len.toFixed(1)} cm`}
            font={font}
            color="white"
          />
        );
      })}
    </Canvas>
  );
}
