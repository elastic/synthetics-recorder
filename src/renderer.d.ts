import type { IElectronAPI } from "../common/types"

declare global {
  interface Window {
    electronAPI: IElectronAPI
  }
}
