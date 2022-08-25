const algoliasearch = require('algoliasearch');
const { response } = require('express');
const csv = require('csv-parser');
const fs = require('fs');


const client = algoliasearch(process.env.ALGOLIA_DRUGS_APP, process.env.ALGOLIA_DRUGS_API_KEY);

const index = client.initIndex("drugs");

const results = [];
const enhancedResults = [];
let test

fs.createReadStream('farmaka.csv')
    .pipe(csv(['A/A', 'objectID', 'name', 'ifet', 'endeiksi', 'ATC', 'ATC_name', 'date', 'endDate', 'end yc', 'date last_move', 'percription_type', 'fpa', 'rebate', 'max_stock', 'min_stock', 'average_delivery', 'average_price', 'buy_price', 'supply', 'discount']))
    .on('data', (data) => results.push(data))
    .on('end', () => {
        for (let i = 1; i < results.length; i++) {
            if (results[i].objectID!=='') {
                let temp = { objectID: results[i].objectID, name: results[i].name, ATC_name: results[i].ATC_name }
                enhancedResults.push(temp)
            }
        }
        test = enhancedResults.slice(0, 5);
        // console.log(enhancedResults);
        // index.saveObjects(enhancedResults).then((response) => { console.log('here', response) }).catch((err) => { console.log(err) })
  
    });

