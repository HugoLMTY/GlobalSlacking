const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

chrome.runtime.onMessage.addListener((request, sender, sendResponse) =>
{
    if (request.action !== 'go') return;
    sendResponse({ status: 'started' });
    run();
});

async function run()
{
    const isActive = true;
    const selectors = {
        type: 'lg:truncate',
        typeText: 'lg:activity-row-single-support-height',
        fill: {
            title: 'p.font-bold',
            questions: 'lg:mb-6',
            showAnswer: 'span.mr-2',
            correctAnswer: 'bg-success-05',
            validate: [
                'button.button-solid-primary-large',
                'button.button-outline-primary-large'
            ],
            validateInner: {
                next: 'Valider',
                end: 'Terminer'
            }
        },
        text: {
            title: 'p.font-bold',
            questions: 'w-full relative card',
            showAnswer: 'span.mr-4',
            correctAnswer: 'bg-success-05',
            validate: [
                'button.button-solid-primary-large',
                'button.button-outline-primary-large'
            ],
            validateInner: {
                next: 'Suivant',
                end: 'Terminer'
            }
        }
    }

    const pickAnswer = async ({ question, type }) =>
    {
        const isFill = type === 'fill'

        //? Scroll to the next question
        const el = isFill ? question : document
        if (isFill) el.scrollIntoView({ block: 'center' });
        await sleep(1000);

        el.querySelector(selectors[type].showAnswer).click();
        await sleep(1000);

        //? Pick answer + hide correction (for detection in text stuff)
        question.getElementsByClassName(selectors[type].correctAnswer)[0]?.click();
        el.querySelector(selectors[type].showAnswer).click();

        return await sleep(420);;
    }

    console.log('Starting...');

    document.documentElement.style.scrollBehavior = 'smooth';
    window.scrollTo(0, 0);

    //? Set the type (for the selectors) + questions
    const type = document.getElementsByClassName(selectors.typeText).length > 0 ? 'text' : 'fill';
    const questions = document.getElementsByClassName(selectors[type].questions);

    //? Wait for page load (a la louche, force a toi si t'as pas de co)
    await sleep(1690);
    console.log('Picking answers...');

    for (let i = 0; i < questions.length; i++) {
        await pickAnswer({ question: questions[i], type });
        console.log(`Answered ${i + 1}/${questions.length}`);
        await sleep(690);
    }

    const getValidateButton = () => { let el; selectors[type].validate.forEach(selector => { const qs = document.querySelector(selector); if (qs) return el = qs; }); return el; };
    const validateButton = getValidateButton();

    window.scrollTo(0, 0);
    // validateButton.scrollIntoView();

    if ([selectors[type].validateInner.next, 'Valider'].includes(validateButton.innerText)) {
        //? Smooth UX
        await sleep(2100);
        console.log('Next page...');
        if (isActive) {
            validateButton.click();
            return run();
        }
    } else {
        console.log('Done !');
        return chrome.runtime.sendMessage({ action: 'stop' });
    }
};