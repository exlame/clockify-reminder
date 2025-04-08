export interface IElectronAPI {
    openPopup: () => Promise<void>,
  }
  
  declare global {
    interface Window {
      electronAPI: IElectronAPI
    }
  }