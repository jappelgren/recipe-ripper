import axios from "axios";
import * as fs from 'fs';
import { load } from "cheerio";

const getRecipe = async (url) => {
    try {
        console.info(`Attempting to scrape recipe from ${url}`);

        const html = await axios.get(url);
        const $ = load(html.data);
        const ldJson = url.includes('saveur') ?
            $("script[type='application/ld+json']")[1].children[0].data :
            $("script[type='application/ld+json']")[0].children[0].data;
        const result = JSON.parse(ldJson);

        recipeJsonToMarkDown(result);

    } catch (error) {
        console.error(error.message);
        throw new Error(error);
    }
};

const recipeJsonToMarkDown = (recipeJson) => {
    recipeJson.name ? '' : recipeJson = recipeJson[0];

    let { description, name, recipeIngredient, recipeInstructions } = recipeJson;

    const fileName = name.replace(/ /g, '-').toLowerCase() + '.md';

    recipeInstructions = recipeInstructions.map((instruction, i) => `${i + 1}. ${instruction.text}` + '\n').join('');


    const markDown = '' +
        `# ${name}` + '\n' +
        `${description}` + '\n' +
        `${recipeIngredient.map((ingredient) => `- ${ingredient}` + '\n').join('')}` + '\n' +
        `${recipeInstructions}`;

    fs.writeFile(`./output/${fileName}`, markDown, error => {
        if (error) {
            console.error(err.message);
            throw new Error(err);
        }
    });
    console.info(`Recipe saved in output folder as ${fileName}`);
};

const args = process.argv;

if (args.length < 3) {
    console.error(`Must provide at least one url as argument when starting process.`);
    process.exit(1);
}

for (let i = 2; i < args.length; i++) {
    getRecipe(args[i]);
}