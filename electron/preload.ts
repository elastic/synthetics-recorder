import type { IElectronAPI } from '../common/types';
import { contextBridge, ipcRenderer } from 'electron';

const electronAPI: IElectronAPI = {
    exportScript: async (contents) => { 
        return await ipcRenderer.invoke('export-script', contents);
    }
}

contextBridge.exposeInMainWorld('electronAPI', electronAPI);
