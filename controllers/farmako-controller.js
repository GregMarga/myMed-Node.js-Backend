const algoliasearch = require('algoliasearch');
const { response } = require('express');
const mongoose = require('mongoose');
const HttpError = require('../models/http-error');


const client = algoliasearch(process.env.ALGOLIA_DRUGS_APP, process.env.ALGOLIA_DRUGS_API_KEY);

const index = client.initIndex("drugs");

let atcHits = [];
let tempAtcHits = [];

const drugNameHits = async (req, res, next) => {
    const drugName = req.params.name;
    index.setSettings({
        searchableAttributes: [
            'name'
        ]
    })
    index
        .search(drugName)
        .then(({ hits }) => {
            console.log(hits[0]);
            res.json(hits.slice(0, 4));
        })
        .catch((err) => console.log(err));
}

const drugATCNameHits = async (req, res, next) => {
    const drugName = req.params.name;
    console.log(drugName)
    index.setSettings({
        searchableAttributes: [
            'ATC_name'
        ]
    })
    index.search(drugName)
        .then(({ hits }) => {
            // for (let i=0;i<hits.length;i++){
            //     if (!tempAtcHits.includes(hits[i].ATC_name)){
            //         tempAtcHits=[...tempAtcHits,hits[i].ATC_name];
            //         atcHits=[...atcHits,hits[i]]
            //     }
            // }
            // console.log(atcHits)
            console.log(hits)
            res.json(hits.slice(0, 4));
        })
        .catch((err) => console.log(err));
}

exports.drugATCNameHits = drugATCNameHits;
exports.drugNameHits = drugNameHits;