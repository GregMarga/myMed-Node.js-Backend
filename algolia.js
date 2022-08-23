const algoliasearch = require('algoliasearch');
const { response } = require('express');
const csv = require('csv-parser');
const fs = require('fs');


const client = algoliasearch("2BT0WK0XX3", "84f4040eebc1e09a00920164c7d7c301");

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
        index.saveObjects(enhancedResults).then((response) => { console.log('here', response) }).catch((err) => { console.log(err) })
        // console.log(results);
        // [
        //   { NAME: 'Daffy Duck', AGE: '24' },
        //   { NAME: 'Bugs Bunny', AGE: '22' }
        // ]
    });





// const record = {
//     objectID: "A00",
//     code: "A00",
//     condition: "Χολέρα"
// }
// index
//   .saveObjects([record])
//   // Wait for the indexing task to complete
//   // https://www.algolia.com/doc/api-reference/api-methods/wait-task/
//   .wait()
//   .then((response) => {
//     console.log(response);
//     // Search the index for "Fo"
//     // https://www.algolia.com/doc/api-reference/api-methods/search/
//     index.search("Fo").then((objects) => console.log(objects)).catch();
//   }) ;



// index.search('conditions').then(({ hits }) => console.log(hits[0])).catch((err) => { console.log(err) });