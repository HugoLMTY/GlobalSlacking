const els = {
    message: document.querySelector('#message'),
    runBtn: document.querySelector('#runBtn'),
    timer: document.querySelector('#timer'),
    timerContainer: document.querySelector('#timerContainer'),
}

const { storage, action, tabs, notifications } = chrome
const { setBadgeText } = action
const { local } = storage

const tquery = { active: true, currentWindow: true }

const setMsg = (msg) => els.message.textContent = msg;
const setTimer = (time) => els.timer.textContent = time;
const hideEl = (el) => el.style.display = 'none';
const showEl = (el) => el.style.display = 'flex';

const sso = 'https://auth.global-exam.com/sso/cas/ynov/10018';
const errMsg = 'y\'a une erreur la refresh un coup pour voir';

const timerLoop = async () =>
{
    const { start } = await local.get(['start']);
    setTimer(Math.round((Date.now() - start) / 1000));
    setInterval(async () =>
    {
        const { status } = await local.get(['status']);
        if (status === 'on') {
            setBadgeText({ text: 'ON' });
            setTimer(Math.round((Date.now() - start) / 1000));
        }
        else {
            setBadgeText({ text: '' });
            els.timerContainer.style.background = '#81ca5a';
            setTimer('Done !');
        }
    }, 1000);
}

//? Check la source
tabs.query(tquery, (tabs) =>
{
    const [tab] = tabs;
    if (!tab || !(tab.url.includes('/training/activity') && !tab.url.endsWith('/result'))) {
        return (hideEl(els.runBtn), setMsg('t pas au bon endroit boloss'));
    }

    // local.get(['status'], async (result) =>
    // {
    //     if (result.status === 'on') {
    //         showEl(els.timerContainer);
    //         return timerLoop();
    //     }
    // })

});

//? Set le click
els.runBtn.addEventListener('click', async () =>
{
    try {
        local.get(['status'], async (result) =>
        {
            // if (result.status === 'on') return setMsg('ca tourne deja du calme');

            setMsg('');
            const [tab] = await tabs.query(tquery);
            const { status } = await tabs.sendMessage(tab.id, { action: 'go' });

            if (!tab) return setMsg(errMsg);

            if (status === 'started') {
                const start = Date.now();
                local.set({ status: 'on', start });

                hideEl(els.runBtn);
                showEl(els.timerContainer);
                return timerLoop();
            }
        })
    } catch (err) {
        setMsg(errMsg);
    }
})