"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildChromeContextMenu = void 0;
const electron_1 = require("electron");
const LABELS = {
    openInNewTab: (type) => `Open ${type} in new tab`,
    openInNewWindow: (type) => `Open ${type} in new window`,
    copyAddress: (type) => `Copy ${type} address`,
    undo: 'Undo',
    redo: 'Redo',
    cut: 'Cut',
    copy: 'Copy',
    delete: 'Delete',
    paste: 'Paste',
    selectAll: 'Select All',
    back: 'Back',
    forward: 'Forward',
    reload: 'Reload',
    inspect: 'Inspect',
    addToDictionary: 'Add to dictionary',
    exitFullScreen: 'Exit full screen',
    emoji: 'Emoji',
};
const getBrowserWindowFromWebContents = (webContents) => {
    return electron_1.BrowserWindow.getAllWindows().find((win) => {
        if (win.webContents === webContents)
            return true;
        let browserViews;
        if ('getBrowserViews' in win) {
            browserViews = win.getBrowserViews();
        }
        else if ('getBrowserView' in win) {
            // @ts-ignore
            browserViews = [win.getBrowserView()];
        }
        else {
            browserViews = [];
        }
        return browserViews.some((view) => view.webContents === webContents);
    });
};
const buildChromeContextMenu = (opts) => {
    const { params, webContents, openLink, extensionMenuItems } = opts;
    const labels = opts.labels || opts.strings || LABELS;
    const menu = new electron_1.Menu();
    const append = (opts) => menu.append(new electron_1.MenuItem(opts));
    const appendSeparator = () => menu.append(new electron_1.MenuItem({ type: 'separator' }));
    if (params.linkURL) {
        append({
            label: labels.openInNewTab('link'),
            click: () => {
                openLink(params.linkURL, 'default', params);
            },
        });
        append({
            label: labels.openInNewWindow('link'),
            click: () => {
                openLink(params.linkURL, 'new-window', params);
            },
        });
        appendSeparator();
        append({
            label: labels.copyAddress('link'),
            click: () => {
                electron_1.clipboard.writeText(params.linkURL);
            },
        });
        appendSeparator();
    }
    else if (params.mediaType !== 'none') {
        // TODO: Loop, Show controls
        append({
            label: labels.openInNewTab(params.mediaType),
            click: () => {
                openLink(params.srcURL, 'default', params);
            },
        });
        append({
            label: labels.copyAddress(params.mediaType),
            click: () => {
                electron_1.clipboard.writeText(params.srcURL);
            },
        });
        appendSeparator();
    }
    if (params.isEditable) {
        if (params.misspelledWord) {
            for (const suggestion of params.dictionarySuggestions) {
                append({
                    label: suggestion,
                    click: () => webContents.replaceMisspelling(suggestion),
                });
            }
            if (params.dictionarySuggestions.length > 0)
                appendSeparator();
            append({
                label: labels.addToDictionary,
                click: () => webContents.session.addWordToSpellCheckerDictionary(params.misspelledWord),
            });
        }
        else {
            if (electron_1.app.isEmojiPanelSupported() &&
                !['number', 'tel', 'other'].includes(params.inputFieldType)) {
                append({
                    label: labels.emoji,
                    click: () => electron_1.app.showEmojiPanel(),
                });
                appendSeparator();
            }
            append({
                label: labels.redo,
                enabled: params.editFlags.canRedo,
                click: () => webContents.redo(),
            });
            append({
                label: labels.undo,
                enabled: params.editFlags.canUndo,
                click: () => webContents.undo(),
            });
        }
        appendSeparator();
        append({
            label: labels.cut,
            enabled: params.editFlags.canCut,
            click: () => webContents.cut(),
        });
        append({
            label: labels.copy,
            enabled: params.editFlags.canCopy,
            click: () => webContents.copy(),
        });
        append({
            label: labels.paste,
            enabled: params.editFlags.canPaste,
            click: () => webContents.paste(),
        });
        append({
            label: labels.delete,
            enabled: params.editFlags.canDelete,
            click: () => webContents.delete(),
        });
        appendSeparator();
        if (params.editFlags.canSelectAll) {
            append({
                label: labels.selectAll,
                click: () => webContents.selectAll(),
            });
            appendSeparator();
        }
    }
    else if (params.selectionText) {
        append({
            label: labels.copy,
            click: () => {
                electron_1.clipboard.writeText(params.selectionText);
            },
        });
        appendSeparator();
    }
    if (menu.items.length === 0) {
        const browserWindow = getBrowserWindowFromWebContents(webContents);
        // TODO: Electron needs a way to detect whether we're in HTML5 full screen.
        // Also need to properly exit full screen in Blink rather than just exiting
        // the Electron BrowserWindow.
        if (browserWindow === null || browserWindow === void 0 ? void 0 : browserWindow.fullScreen) {
            append({
                label: labels.exitFullScreen,
                click: () => browserWindow.setFullScreen(false),
            });
            appendSeparator();
        }
        append({
            label: labels.back,
            enabled: webContents.canGoBack(),
            click: () => webContents.goBack(),
        });
        append({
            label: labels.forward,
            enabled: webContents.canGoForward(),
            click: () => webContents.goForward(),
        });
        append({
            label: labels.reload,
            click: () => webContents.reload(),
        });
        appendSeparator();
    }
    if (extensionMenuItems) {
        extensionMenuItems.forEach((item) => menu.append(item));
        if (extensionMenuItems.length > 0)
            appendSeparator();
    }
    append({
        label: labels.inspect,
        click: () => {
            var _a;
            webContents.inspectElement(params.x, params.y);
            if (!webContents.isDevToolsFocused()) {
                (_a = webContents.devToolsWebContents) === null || _a === void 0 ? void 0 : _a.focus();
            }
        },
    });
    return menu;
};
exports.buildChromeContextMenu = buildChromeContextMenu;
exports.default = exports.buildChromeContextMenu;
