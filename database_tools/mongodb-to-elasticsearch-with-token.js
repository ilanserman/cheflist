//Simple NodeJS app for detecting and applying changes in collection in MongoDB with ElasticSearch in real time
//Later implement tokens for resuming in case something failed

const config = require('../config');
const MongoClient = require("mongodb").MongoClient
const { Client } = require('@elastic/elasticsearch')

const esclient = new Client({
  node: config.elasticsearchUrl,
  auth: {
    username: 'cheflist',
    password: 'Elastic$1'
  }
})


async function init() {
  const mongoclient = await MongoClient.connect(config.mongoUrl, { useUnifiedTopology: true })
  .catch(err => { console.log(err); });

  if (!mongoclient)
    return console.log('No client');

  try {

    const db = mongoclient.db('cheflist');
    await db.command({ ping:1 })
    console.log("MongoDB ElasticSearch sync: connected MongoDB server")

    //Wait for changes with operations insert, update or replace and update ES database
    async function getUpsertChangeStream() {
      const changeStream = (await db.collection('products')).watch([
        {
          "$match": {
            "operationType": {
              "$in": ["insert", "update", "replace"]
            }
          }
        },
        {
          "$project": {
            "documentKey": false
          }
        }
      ], {"fullDocument": "updateLookup"});
      return changeStream;
    }

    async function getDeleteChangeStream() {
      const changeStream = (await db.collection('products')).watch([
        {
          "$match": {
            "operationType": {
              "$in": ["delete"]
            }
          }
        },
        {
          "$project": {
            "documentKey": true
          }
        }
      ]);
      return changeStream;
    }

    const upsertChangeStream = await getUpsertChangeStream();
    upsertChangeStream.on("change", async change => {
      console.log("Pushing document to Elasticsearch, id:", change.fullDocument._id);
      change.fullDocument.id = change.fullDocument._id;
      Reflect.deleteProperty(change.fullDocument, "_id");
      const response = await esclient.index({
        "id": change.fullDocument.id,
        "index": "products",
        "body": change.fullDocument,
        "type": "doc"
      });
      console.log("Document upserted, status code:", response.statusCode);
    });
    upsertChangeStream.on("error", error => {
      console.error(error);
    });


    const deleteChangeStream = await getDeleteChangeStream();
    deleteChangeStream.on("change", async change => {
      console.log("Deleting data from ElasticSearch, id", change.documentKey._id);
      const response = await esclient.delete({
        "id": change.documentKey._id,
        "index": "products",
        "type": "doc"
      });
      console.log("Document successsfully deleted, status code: ", response.statusCode);
    });
    deleteChangeStream.on("error", error => {
      console.error(error);
    });

  } catch(err) {
    console.log(err);
  }

}

init();
