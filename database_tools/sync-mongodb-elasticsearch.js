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

async function sync() {
  const mongoclient = await MongoClient.connect(config.mongoUrl, { useUnifiedTopology: true })
  .catch(err => { console.log(err); });
  if (!mongoclient)
    return console.log('No client');
  const db = mongoclient.db('cheflist');
  await db.command({ ping:1 })
  console.log("MongoDB ElasticSearch sync: connected MongoDB server")

  try {
    console.log('Will delete all docs in index');
    esclient.deleteByQuery({
      index: 'products',
      conflicts: 'proceed',
      body: { query: { match_all: {} } }
    }, (err, response)=> {
      console.log('Elasticsearch delete status code:', response.statusCode);
    });

    const docs = await db.collection('products').find({})
    if ((await docs.count()) === 0) {
      console.log("No documents found!");
    }
    console.log('Docs in mongodb collection:' , await docs.count());

    //Implement upsert docs into ES

  } catch(err) {
    console.error(err);
  } finally {
    await mongoclient.close();
  }


}

sync();
