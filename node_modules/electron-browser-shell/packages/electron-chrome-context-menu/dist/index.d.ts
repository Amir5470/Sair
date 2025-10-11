import { Menu, MenuItem } from 'electron';
declare const LABELS: {
    openInNewTab: (type: 'link' | Electron.ContextMenuParams['mediaType']) => string;
    openInNewWindow: (type: 'link' | Electron.ContextMenuParams['mediaType']) => string;
    copyAddress: (type: 'link' | Electron.ContextMenuParams['mediaType']) => string;
    undo: string;
    redo: string;
    cut: string;
    copy: string;
    delete: string;
    paste: string;
    selectAll: string;
    back: string;
    forward: string;
    reload: string;
    inspect: string;
    addToDictionary: string;
    exitFullScreen: string;
    emoji: string;
};
type ChromeContextMenuLabels = typeof LABELS;
interface ChromeContextMenuOptions {
    /** Context menu parameters emitted from the WebContents 'context-menu' event. */
    params: Electron.ContextMenuParams;
    /** WebContents which emitted the 'context-menu' event. */
    webContents: Electron.WebContents;
    /** Handler for opening links. */
    openLink: (url: string, disposition: 'default' | 'foreground-tab' | 'background-tab' | 'new-window', params: Electron.ContextMenuParams) => void;
    /** Chrome extension menu items. */
    extensionMenuItems?: MenuItem[];
    /** Labels used to create menu items. Replace this if localization is needed. */
    labels?: ChromeContextMenuLabels;
    /**
     * @deprecated Use 'labels' instead.
     */
    strings?: ChromeContextMenuLabels;
}
export declare const buildChromeContextMenu: (opts: ChromeContextMenuOptions) => Menu;
export default buildChromeContextMenu;
