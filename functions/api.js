import express from "express";
import ServerlessHttp from "serverless-http";
import cors from "cors";
import * as bodyParser from "body-parser";

const app = express();

app.use(cors("*"));

app.use(bodyParser.json());


async function translate(text, targetLanguage) {
    console.log(text, targetLanguage);
    let enText = text;
    let toLang = targetLanguage;

    let text2 = `f.req=[[["MkEWBc","[[\\"${enText}\\",\\"en\\",\\"${toLang}\\",1],[]]",null,"generic"]]]&`;
    let encodedText = encodeURI(text2);
    searchSrting = encodedText.replaceAll(",", "%2C");
    try {
        let response = await fetch(
            "https://translate.google.com/_/TranslateWebserverUi/data/batchexecute",
            {
                method: "POST",
                mode: "no-cors",
                headers: {
                    Host: "translate.google.com",
                    "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
                },
                body: searchSrting,
            }
        );
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        let result = await response.text();
        let resultPro = result.replace(/\\/g, '');
        let transTag = resultPro.slice(resultPro.indexOf(`[[[null,null,null,null,null,[["`) + 31, resultPro.indexOf(`",null,null,null,null,null,"`));

        return transTag

    } catch (error) {
        console.error("Translation error:", error);
        return "Translation failed.";
    }
};

app.post("/.netlify/functions/api", async (req, res) => {
    let request = JSON.parse(req.body);
    console.log(request)

    let translated = await translate(request.question, request.targetLanguage);
    console.log(translated);

    res.send(translated);
});

const handler = ServerlessHttp(app);

module.exports.handler = async (event, context) => {
    const result = await handler(event, context);
    return result;
};
