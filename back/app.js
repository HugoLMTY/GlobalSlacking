const express = require('express');
const app = express();
const port = 3000;
const bodyParser = require('body-parser');

const { Configuration, OpenAIApi } = require('openai');

const config = new Configuration({
    apiKey: "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"
});
const openai = new OpenAIApi(config);

require('dotenv').config();
app.use(bodyParser.json());
app.use((req, res, next) =>
{
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});


app.get('/:prompt', async (req, res) =>
{
    try {
        const prompt = req.params.prompt
            .replace('_', ' ')
            .replace('_n_', '\n')
            .replace('_question_mark_', '?');

        // const prompt = "Quelle_réponse correspond grammaticalement, sans contexte au trou noté ------- dans le texte suivant _question_mark_The hostess is required to ------- people according to their reservations.A. sit, B. seat, C. stand, D. hire";
        console.log({ prompt })
        const response = await openai.createCompletion({
            model: 'text-davinci-003',
            prompt,
            temperature: 0.7,
        });

        console.log({ r: response.data.choices })
        const answer = response.data.choices[0].text
        console.log({ answer })

        res.send({ answer })

    } catch (err) {
        console.log(err.response);
        res.send(false);
    }
});

app.listen(port);