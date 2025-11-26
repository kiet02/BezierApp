import { BezierCanvas } from '@screen/BezierCanvas';
import { BezierPoint } from '@screen/BezierPoint';
import { Segment, uid } from '@utils/utils';
import React, { useState } from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function App() {
  const [segments, setSegments] = useState<Segment[]>(() => {
    const baseX = 80;
    const baseY = 220;
    return [
      {
        id: uid(),
        main: { x: baseX, y: baseY },
        c1: { x: baseX + 40, y: baseY - 80 },
        c2: { x: baseX + 120, y: baseY - 80 },
      },
      {
        id: uid(),
        main: { x: baseX + 180, y: baseY - 40 },
        c1: { x: baseX + 120, y: baseY - 40 },
        c2: { x: baseX + 240, y: baseY - 40 },
      },
    ];
  });

  const [activeMainId, setActiveMainId] = useState<string | null>(null);

  function addMainPoint() {
    const last = segments[segments.length - 1];
    const nx = (last?.main.x ?? 120) + 10;
    const ny = last?.main.y ?? 20;
    const newSeg: Segment = {
      id: uid(),
      main: { x: nx, y: ny },
      c1: { x: nx - 60, y: ny - 40 },
      c2: { x: nx + 60, y: ny - 40 },
    };
    setSegments(p => [...p, newSeg]);
  }

  function removeLast() {
    if (segments.length <= 1) return;
    setSegments(p => p.slice(0, p.length - 1));
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={{ flex: 1, backgroundColor: '#0a0a0a' }}>
        <BezierCanvas segments={segments} activeMainId={activeMainId} />

        <BezierPoint
          segments={segments}
          activeMainId={activeMainId}
          setActiveMainId={setActiveMainId}
          setSegments={setSegments}
        />

        <View
          style={{
            position: 'absolute',
            right: 14,
            bottom: 18,
            flexDirection: 'column',
            gap: 10,
          }}
        >
          <TouchableOpacity
            onPress={addMainPoint}
            style={{
              width: 56,
              height: 56,
              borderRadius: 28,
              backgroundColor: '#06b6d4',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 8,
              shadowColor: '#000',
              shadowOpacity: 0.25,
              shadowRadius: 6,
            }}
          >
            <Text style={{ color: 'white', fontSize: 28 }}>+</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={removeLast}
            style={{
              width: 56,
              height: 56,
              borderRadius: 28,
              backgroundColor: '#ef4444',
              justifyContent: 'center',
              alignItems: 'center',
              shadowColor: '#000',
              shadowOpacity: 0.25,
              shadowRadius: 6,
            }}
          >
            <Text style={{ color: 'white', fontSize: 24 }}>−</Text>
          </TouchableOpacity>
        </View>
      </View>
    </GestureHandlerRootView>
  );
}
