import {StyleSheet, View, ViewStyle} from 'react-native';
import {BlendMode, Canvas, createPicture, Picture, Skia, SkPaint, SkPath} from '@shopify/react-native-skia';
import React, {forwardRef, useImperativeHandle} from 'react';
import {runOnJS, useSharedValue} from 'react-native-reanimated';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';
import {PaintStyle} from '@shopify/react-native-skia/src/skia/types/Paint/Paint.ts';
import {Tools} from './Toolbar.tsx';
import {useToolbar} from './context.tsx';

const rec = Skia.PictureRecorder();
rec.beginRecording(Skia.XYWHRect(0, 0, 1, 1));
const emptyPicture = rec.finishRecordingAsPicture();

type PathTypes = 'erase' | 'draw';

interface Element {
    path: SkPath;
    paint: SkPaint;
    type: PathTypes;
}

export interface AnnotationPathEntry {
    path: string;
    color: number[];
    width: number;
    type: PathTypes;
}

export type Annotations = AnnotationPathEntry[];

interface Props {
    style?: ViewStyle;
    finishedDrawing?: () => unknown;
}

export interface DrawBoardType {
    getAnnotations: () => Annotations;
    loadAnnotations: (annotations: Annotations) => void;
    clear: () => void;
}

const DrawBoardInner = forwardRef<DrawBoardType, Props>(({style, finishedDrawing}, ref) => {
    const path = useSharedValue<Element>({path: Skia.Path.Make(), paint: Skia.Paint(), type: 'draw'});
    const allPaths = useSharedValue<Element[]>([]);
    const lastTouch = useSharedValue<{x: number; y: number}>({x: 0, y: 0});
    const {toolbar} = useToolbar();
    const allPicture = useSharedValue(emptyPicture);
    const currentPicture = useSharedValue(emptyPicture);

    const updateAllPicture = (paths: Element[]) => {
        'worklet';
        allPicture.value = createPicture(canvas => {
            paths.forEach(path => canvas.drawPath(path.path, path.paint));
        });
    };

    const serializeAnnotations = () => allPaths.value.map(p => ({path: p.path.toSVGString(), color: Array.from(p.paint.getColor()), width: p.paint.getStrokeWidth(), type: p.type})) as AnnotationPathEntry[];

    const initAnnotations = (annotations?: Annotations) => {
        if(!annotations) {
            return;
        }
        const elements = annotations.map((p) => ({
            path: Skia.Path.MakeFromSVGString(p.path),
            paint: makePaint(p),
            type: p.type,
        }) as Element);
        allPaths.value = elements;
        updateAllPicture(elements);
    };

    useImperativeHandle(ref, () => ({
        getAnnotations: serializeAnnotations,
        loadAnnotations: initAnnotations,
        clear: () => {
            allPaths.value = [];
            allPicture.value = createPicture(() => {});
            currentPicture.value = createPicture(() => {});
        },
    }));

    const makePaint = (p: AnnotationPathEntry): SkPaint => {
        const paint = Skia.Paint();
        paint.setStrokeWidth(p.width);
        paint.setStyle(PaintStyle.Stroke);
        paint.setColor(Skia.Color(new Float32Array(p.color ?? [0, 0, 0, 1])));
        if (p.type === 'erase') {
            paint.setBlendMode(BlendMode.Clear);
        }
        return paint;
    };

    const panGesture = Gesture.Pan()
        .maxPointers(1)
        .minDistance(0)
        .averageTouches(true)
        .enabled(toolbar.activeTool !== Tools.None)
        .onStart(e => {
            const newPath = Skia.Path.Make();
            newPath.moveTo(e.x, e.y);
            if (toolbar.activeTool === Tools.Pencil || toolbar.activeTool === Tools.Eraser) {
                newPath.lineTo(e.x, e.y);
            }
            const newPaint = Skia.Paint();
            newPaint.setStyle(PaintStyle.Stroke);
            newPaint.setColor(Skia.Color(toolbar.color));
            newPaint.setStrokeWidth(toolbar.strokeWidth);
            if (toolbar.activeTool === Tools.Eraser) {
                newPaint.setBlendMode(BlendMode.Clear);
            } else {
                newPaint.setBlendMode(BlendMode.Src);
            }
            path.value = {
                path: newPath,
                paint: newPaint,
                type: toolbar.activeTool === Tools.Eraser ? 'erase' : 'draw',
            };
            lastTouch.value = {x: e.x, y: e.y};
        })
        .onUpdate(e => {
            if (toolbar.activeTool === Tools.Rectangle) {
                path.value.path.reset();
                path.value.path.addRect({
                    x: lastTouch.value.x,
                    y: lastTouch.value.y,
                    width: e.x - lastTouch.value.x,
                    height: e.y - lastTouch.value.y,
                });
            } else if (toolbar.activeTool === Tools.Circle) {
                path.value.path.reset();
                path.value.path.addCircle(lastTouch.value.x, lastTouch.value.y, Math.sqrt(Math.pow(e.x - lastTouch.value.x, 2) + Math.pow(e.y - lastTouch.value.y, 2)));
            } else {
                path.value.path.lineTo(e.x, e.y);
            }
            currentPicture.value = createPicture(
                canvas => {
                    canvas.drawPath(path.value.path, path.value.paint);
                }
            );
        })
        .onEnd(() => {
            allPaths.value.push(path.value);
            updateAllPicture(allPaths.value);
            path.value = {path: Skia.Path.Make(), paint: Skia.Paint(), type: 'draw'};
            if (finishedDrawing) {
                runOnJS(finishedDrawing)();
            }
        });

    return (
        <View style={[style, {pointerEvents: toolbar.activeTool === Tools.None ? 'none' : 'auto'}]}>
            <View style={styles.container}>
                <GestureDetector gesture={panGesture}>
                    <Canvas style={styles.canvas}>
                        <Picture picture={allPicture} />
                        <Picture picture={currentPicture} />
                    </Canvas>
                </GestureDetector>
            </View>
        </View>
    );
});

DrawBoardInner.displayName = 'DrawBoard';

export const DrawBoard = React.memo(DrawBoardInner);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        position: 'relative',
    },
    canvas: {
        position: 'absolute',
        width: '100%',
        height: '100%',
    },
});
