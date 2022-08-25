const algoliasearch = require('algoliasearch');
const { response } = require('express');
const csv = require('csv-parser');
const fs = require('fs');


const client = algoliasearch(process.env.ALGOLIA_CONDITIONS_APP,process.env.ALGOLIA_CONDITIONS_API_KEY );

const index = client.initIndex("conditions");

const results = [];
const enhancedResults = [];
let test

fs.createReadStream('conditions.csv')
    .pipe(csv(['code', 'condition']))
    .on('data', (data) => results.push(data))
    .on('end', () => {
        for (let i = 0; i < results.length; i++) {
            let temp = { ...results[i], objectID: results[i].code }
            enhancedResults.push(temp)
        }
        test = enhancedResults.slice(0, 5);
        console.log(test);
        // index.saveObjects(enhancedResults).then((response) => { console.log('here', response) }).catch((err) => { console.log(err) })
        // console.log(results);
        // [
        //   { NAME: 'Daffy Duck', AGE: '24' },
        //   { NAME: 'Bugs Bunny', AGE: '22' }
        // ]
    });


