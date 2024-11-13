import {Button, View} from 'react-native';
import {TapGestureHandler} from 'react-native-gesture-handler';
import React from 'react';
import {useToolbar} from './context.tsx';

export enum Tools {
    Pencil,
    Eraser,
    Rectangle,
    Circle,
    None
}

export interface ToolConfig {
    activeTool: Tools;
    strokeWidth: number;
    color: string;
}

export const Toolbar = ({onClear}: { onClear?: () => unknown}) => {
    const {toolbar, updateConfig} = useToolbar();

    const onChangeTool = (tool: Tools) => () => {
        updateConfig('activeTool', toolbar.activeTool === tool ? Tools.None : tool);
    };

    return (
        <View style={{display: 'flex', justifyContent: 'space-between', flexDirection: 'row', alignItems: 'flex-end'}}>
            <TapGestureHandler>
                <Button title={'Pen'} onPress={onChangeTool(Tools.Pencil)} color={toolbar.activeTool === Tools.Pencil ? 'blue' : 'gray'} />
            </TapGestureHandler>
            <TapGestureHandler>
                <Button title={'Rect'} onPress={onChangeTool(Tools.Rectangle)} color={toolbar.activeTool === Tools.Rectangle ? 'blue' : 'gray'} />
            </TapGestureHandler>
            <TapGestureHandler>
                <Button title={'Circle'} onPress={onChangeTool(Tools.Circle)} color={toolbar.activeTool === Tools.Circle ? 'blue' : 'gray'} />
            </TapGestureHandler>
            <TapGestureHandler>
                <Button title={'Erase'} onPress={onChangeTool(Tools.Eraser)} color={toolbar.activeTool === Tools.Eraser ? 'blue' : 'gray'} />
            </TapGestureHandler>
            <View style={{flex: 1}} />
            <TapGestureHandler>
                <Button title={'Clear'} onPress={() => onClear?.()} />
            </TapGestureHandler>
        </View>
    );
};
