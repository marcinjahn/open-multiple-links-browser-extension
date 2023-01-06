export type CommandToBackground = 'ENABLE_CONTEXT_MENU' | 'DISABLE_CONTEXT_MENU';
export type CommandToContent = 'CONTEXT_MENU_CLICKED';

interface CommandBody {
    command: CommandToBackground | CommandToContent;
}

export class FromContentScript {
    public static async sendToBackground(command: CommandToBackground) {
        return new Promise((resolve, _) => {
            const payload: CommandBody = { command };
            
            chrome.runtime.sendMessage(payload, function (_) {
                resolve(true);
            });
        });
    }
    
    public static listenToBackground<R>(expectedCommand: CommandToContent, action: () => Promise<R>) {
        CommonCommunication.listen<R>(expectedCommand, action);
    }
}

export class FromBackgroundScript {
    public static async sendToContentScript<R>(tabId: number, command: CommandToContent): Promise<R> {
        const payload: CommandBody = { command };
        
        return await chrome.tabs.sendMessage(tabId, payload);
    }

    public static listenToContentScript<R>(expectedCommand: CommandToBackground, action: () => Promise<R>) {
        CommonCommunication.listen<R>(expectedCommand, action);
    }
}

class CommonCommunication {
    static listen<R>(expectedCommand: CommandToBackground | CommandToContent, action: () => Promise<R>) {
        chrome.runtime.onMessage.addListener(
            (command: CommandBody, _, sendResponse) => {
                if (command?.command !== expectedCommand) {
                    return;
                }

                action().then((response: R) =>  {
                    sendResponse(response);
                });
                
                return true;
            }
        );
    }
}