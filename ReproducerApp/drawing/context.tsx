import React, {createContext, useContext, useState} from 'react';
import {ToolConfig, Tools} from './Toolbar.tsx';

export const ToolbarContext = createContext<{toolbar: ToolConfig, updateConfig: (key: string, value: any) => void}>({
    toolbar: {activeTool: Tools.None, color: '#000000', strokeWidth: 3},
    updateConfig: () => {},
});

export const ToolbarProvider = ({children}: {children: React.ReactNode}) => {
    const [toolbar, setToolbar] = useState<ToolConfig>({activeTool: Tools.None, color: '#000000', strokeWidth: 3});

    const updateConfig = (key: string, value: any) => {
        setToolbar({...toolbar, [key]: value});
    };

    return (
        <ToolbarContext.Provider value={{toolbar, updateConfig}}>
            {children}
        </ToolbarContext.Provider>
    );
};

export const useToolbar = () => useContext(ToolbarContext);
