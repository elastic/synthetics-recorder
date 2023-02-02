import type { ActionContext, IElectronAPI } from '../common/types';
import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';

const electronAPI: IElectronAPI = {
    exportScript: async (contents) => {
        return await ipcRenderer.invoke('export-script', contents);
    },
    recordJourney: async (url) => {
        return await ipcRenderer.invoke('record-journey', url);
    },
    stopRecording: () => {
        ipcRenderer.send('stop-recording');
    },
    pauseRecording: () => {
        ipcRenderer.send('set-mode', 'none');
    },
    resumeRecording: () => {
        ipcRenderer.send('set-mode', 'recording');
    },
    onActionGenerated: (callback: (_event: IpcRendererEvent, actions: ActionContext[]) => void): (() => void) => {
        ipcRenderer.on('change', callback);
        return () => { ipcRenderer.removeAllListeners('change') }
    },
}

contextBridge.exposeInMainWorld('electronAPI', electronAPI);
