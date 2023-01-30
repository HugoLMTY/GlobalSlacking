const { runtime, action, storage } = chrome
const { onInstalled, onMessage } = runtime

onInstalled.addListener(() =>
{
    action.setBadgeText({ text: '', });
    storage.local.set({ status: 'off' });
});

onMessage.addListener((request, sender, sendResponse) =>
{
    switch (request.action) {
        case 'stop':
            storage.local.set({ status: 'done' });
            sendResponse({ status: 'done' });
            break;

        case 'error':
            storage.local.set({ status: 'off' });
            sendResponse({ status: 'ended' });
            break;
    }
});
