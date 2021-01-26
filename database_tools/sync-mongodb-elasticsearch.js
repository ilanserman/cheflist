const config = require('../config');
const flatMap = require('array.prototype.flatmap').shim();
const MongoClient = require("mongodb").MongoClient;
const { Client } = require('@elastic/elasticsearch')

const esclient = new Client({
  node: config.elasticsearchUrl,
  auth: {
    username: 'cheflist',
    password: 'Elastic$1'
  }
})

async function sync() {
  const mongoclient = await MongoClient.connect(config.mongoUrl, { useUnifiedTopology: true })
  .catch(err => { console.log(err); });
  if (!mongoclient) {
    return console.log('No client');
  }
  const db = mongoclient.db('cheflist');
  await db.command({ ping:1 })
  console.log("MongoDB ElasticSearch sync: connected MongoDB server")

  try {

    //Get all documents from mongoDB database
    const docs = await db.collection('products').find({})
    if ((await docs.count()) === 0) {
      return console.log("No documents in collection found!");
    }
    console.log('Docs in mongodb collection:' , await docs.count());

    //Delete all docs in ES index
    console.log('Will delete the index and delete all docs in index');
    const indexExists = await esclient.indices.exists({ index: 'products'})
    if(indexExists.body) {
      const deleteIndex = await esclient.indices.delete({index:'products'});
      if(deleteIndex.errors)
      console.error(deleteIndex.errors);
    };

    //Create a new index
    console.log('Creating new ES index...')
    const createIndex = await esclient.indices.create({
      index: 'products',
      body: {
        "settings": {
          "number_of_shards": 1,
          "analysis": {
            "filter": {
              "autocomplete_filter": {
                "type":     "edge_ngram",
                "min_gram": 3,
                "max_gram": 20
              }
            },
            "analyzer": {
              "autocomplete": {
                "type":      "custom",
                "tokenizer": "standard",
                "filter": [
                  "lowercase",
                  "autocomplete_filter"
                ]
              }
            }
          }
        },
        "mappings": {
          "properties": {
            "id": { "type": 'text' },
            "name": { "type": 'text', "analyzer": "autocomplete" }
          }
        }
      }
    });
    if(createIndex.error) {
      console.error(createIndex.error);
    }

    //Insert all documents into ES
    console.log('Will now insert all docs into ES');
    var all_docs = [];
    const cursor = await db.collection('products').find({})
    await cursor.forEach((doc)=>{
      doc = JSON.parse(JSON.stringify(doc).split('"_id":').join('"id":'));
      all_docs.push(doc);
    })

    const body = await all_docs.flatMap( doc => [{ index: { _index: 'products' } }, doc]);
    const { body: bulkResponse } = await esclient.bulk({ refresh: true, body });

    if (bulkResponse.errors) {
      const erroredDocuments = []
      // The items array has the same order of the dataset we just indexed.
      // The presence of the `error` key indicates that the operation
      // that we did for the document has failed.
      bulkResponse.items.forEach((action, i) => {
        const operation = Object.keys(action)[0]
        if (action[operation].error) {
          erroredDocuments.push({
            // If the status is 429 it means that you can retry the document,
            // otherwise it's very likely a mapping error, and you should
            // fix the document before to try it again.
            status: action[operation].status,
            error: action[operation].error,
            operation: body[i * 2],
            document: body[i * 2 + 1]
          })
        }
      })
      console.log(erroredDocuments)
    }

    const { body: count } = await esclient.count({ index: 'products' });
    console.log('count:',count);


  } catch(err) {
    console.error(err);
  } finally {
    await mongoclient.close();
  }

}

sync();
