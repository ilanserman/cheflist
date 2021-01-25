const config = require('../config');
const { MongoClient } = require("mongodb");

const mongoClient = new MongoClient(config.mongoUrl, { useUnifiedTopology: true });

async function init() {
  // Connect the client to the server
  await mongoClient.connect();
  // Establish and verify connection
  await mongoClient.db("cheflist").command({ ping: 1 });
  console.log("MongoDB ElasticSearch sync: Connected successfully to MongoDB server");
  
  async function getUpsertChangeStream() {
    const changeStream = (await getCollection("somecollection")).watch([
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
    const changeStream = (await getCollection("someCollection")).watch([
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

  //Wait for changes with operations insert, update or replace and update ES database
  const upsertChangeStream = await getUpsertChangeStream();
  upsertChangeStream.on("change", async change => {
    console.log("Pushing data to elasticsearch with id", change.fullDocument._id);
    change.fullDocument.id = change.fullDocument._id;
    Reflect.deleteProperty(change.fullDocument, "_id");
    const response = await client.index({
      "id": change.fullDocument.id,
      "index": "someindexname",
      "body": change.fullDocument,
      "type": "doc"
    });
    console.log("document upserted successsfully with status code", response.statusCode);
  });

  upsertChangeStream.on("error", error => {
    console.error(error);
  });

  //Wait for changes with delete operation and update ES database
  const deleteChangeStream = await getDeleteChangeStream();
  deleteChangeStream.on("change", async change => {
    console.log("Deleting data from elasticsearch with id", change.documentKey._id);
    const response = await client.delete({
      "id": change.documentKey._id,
      "index": "someindex",
      "type": "doc"
    });
    console.log("document deleted successsfully with status code", response.statusCode);
  });

  deleteChangeStream.on("error", error => {
    console.error(error);
  });
}

//Initialize connection to databases and watch and update
init();
