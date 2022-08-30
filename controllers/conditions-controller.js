const algoliasearch = require('algoliasearch');
const { response } = require('express');


const client = algoliasearch(process.env.ALGOLIA_CONDITIONS_APP, process.env.ALGOLIA_CONDITIONS_API_KEY);

const index = client.initIndex("conditions");


const conditionHits = async (req, res, next) => {
    const conditionQuery = req.params.name;
    index
        .search(conditionQuery)
        .then(({ hits }) => {
            console.log(hits[0]);
            res.json(hits.slice(0, 9));
        })
        .catch((err) => console.log(err));
}



exports.conditionHits = conditionHits;
