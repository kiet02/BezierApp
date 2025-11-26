import { Gesture, GestureDetector } from 'react-native-gesture-handler';

import Animated from 'react-native-reanimated';
import React, { useRef } from 'react';
import { scheduleOnRN } from 'react-native-worklets';
import { POINT_SIZE, Segment } from '@utils/utils';

type BezierPointProps = {
  segments: Segment[];
  activeMainId: string | null;
  setActiveMainId: (id: string | null) => void;
  setSegments: React.Dispatch<React.SetStateAction<Segment[]>>;
};
export function BezierPoint({
  segments,
  activeMainId,
  setActiveMainId,
  setSegments,
}: BezierPointProps) {
  const startRef = useRef<
    Record<string, { part: 'main' | 'c1' | 'c2'; x: number; y: number }>
  >({});
  function startDrag(id: string, part: 'main' | 'c1' | 'c2') {
    const s = segments.find(p => p.id === id);
    if (!s) return;
    startRef.current[id] = {
      part,
      x: part === 'main' ? s.main.x : part === 'c1' ? s.c1.x : s.c2.x,
      y: part === 'main' ? s.main.y : part === 'c1' ? s.c1.y : s.c2.y,
    };
    setActiveMainId(id);
  }

  function moveDrag(id: string, dx: number, dy: number) {
    const start = startRef.current[id];
    if (!start) return;
    setSegments(prev =>
      prev.map(s => {
        if (s.id !== id) return s;
        if (start.part === 'main')
          return { ...s, main: { x: start.x + dx, y: start.y + dy } };
        else if (start.part === 'c1')
          return { ...s, c1: { x: start.x + dx, y: start.y + dy } };
        else return { ...s, c2: { x: start.x + dx, y: start.y + dy } };
      }),
    );
  }

  function endDrag() {
    startRef.current = {};
  }

  // gestures
  const gesturesById = segments.reduce<
    Record<string, { mainG: any; c1G: any; c2G: any }>
  >((acc, s) => {
    acc[s.id] = {
      mainG: Gesture.Pan()
        .minDistance(1)
        .onStart(() => scheduleOnRN(startDrag, s.id, 'main'))
        .onUpdate(e =>
          scheduleOnRN(moveDrag, s.id, e.translationX, e.translationY),
        )
        .onEnd(() => scheduleOnRN(endDrag)),
      c1G: Gesture.Pan()
        .minDistance(1)
        .onStart(() => scheduleOnRN(startDrag, s.id, 'c1'))
        .onUpdate(e =>
          scheduleOnRN(moveDrag, s.id, e.translationX, e.translationY),
        )
        .onEnd(() => scheduleOnRN(endDrag)),
      c2G: Gesture.Pan()
        .minDistance(1)
        .onStart(() => scheduleOnRN(startDrag, s.id, 'c2'))
        .onUpdate(e =>
          scheduleOnRN(moveDrag, s.id, e.translationX, e.translationY),
        )
        .onEnd(() => scheduleOnRN(endDrag)),
    };
    return acc;
  }, {});
  return (
    <>
      {segments.map(s => {
        const isActive = activeMainId === s.id;
        return (
          <React.Fragment key={s.id}>
            {isActive && (
              <GestureDetector gesture={gesturesById[s.id].c1G}>
                <Animated.View
                  style={{
                    position: 'absolute',
                    left: s.c1.x - POINT_SIZE / 2,
                    top: s.c1.y - POINT_SIZE / 2,
                    width: POINT_SIZE,
                    height: POINT_SIZE,
                    borderRadius: 100,
                    backgroundColor: 'yellow',
                    borderWidth: 1,
                    borderColor: 'white',
                    zIndex: 50,
                  }}
                />
              </GestureDetector>
            )}
            {isActive && (
              <GestureDetector gesture={gesturesById[s.id].c2G}>
                <Animated.View
                  style={{
                    position: 'absolute',
                    left: s.c2.x - POINT_SIZE / 2,
                    top: s.c2.y - POINT_SIZE / 2,
                    width: POINT_SIZE,
                    height: POINT_SIZE,
                    borderRadius: 100,
                    backgroundColor: 'magenta',
                    borderWidth: 1,
                    borderColor: 'white',
                    zIndex: 50,
                  }}
                />
              </GestureDetector>
            )}
            <GestureDetector gesture={gesturesById[s.id].mainG}>
              <Animated.View
                style={{
                  position: 'absolute',
                  left: s.main.x - (POINT_SIZE * 1.2) / 2,
                  top: s.main.y - (POINT_SIZE * 1.2) / 2,
                  width: POINT_SIZE * 1.2,
                  height: POINT_SIZE * 1.2,
                  borderRadius: 100,
                  backgroundColor: 'red',
                  borderWidth: 2,
                  borderColor: 'white',
                  zIndex: 60,
                }}
              />
            </GestureDetector>
          </React.Fragment>
        );
      })}
    </>
  );
}
