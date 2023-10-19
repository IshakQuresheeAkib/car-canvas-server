const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express ();

const port = process.env.PORT || 5000;

app.use(cors())
app.use(express.json())
const uri = "mongodb+srv://carCanvas:BkBDXR8mBx0cAIkW@cluster0.vuba6ki.mongodb.net/?retryWrites=true&w=majority";


const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    }
  });

async function run() {
    try {

        const productsCollection = client.db('productDB').collection('products')
        const cartsCollection = client.db('productDB').collection('carts')
        

        app.get('/products',async(req,res)=>{
            const cursor = productsCollection.find();
            const products = await cursor.toArray();
            res.send(products)
        })

        app.post('/products',async (req,res)=>{
            const product = req.body;
            const result = await productsCollection.insertOne(product)
            res.send(result);
        })

        app.get('/products/:brands',async (req,res)=>{
            const brands = req.params.brands;
            const query = {brandName: brands }
            const products = await productsCollection.find(query).toArray();
            res.send(products);

        })

        app.get('/products/update/:id',async (req,res)=>{
            const id = req.params.id;
            const query = {_id: new ObjectId(id)}
            const product = await productsCollection.findOne(query);
            res.send(product)
        })

        app.get('/product/:id',async (req,res)=>{
            const id = req.params.id;
            const query = {_id: new ObjectId(id)};
            const product  = await productsCollection.findOne(query);
            res.send(product)
            if ((await productsCollection.countDocuments(query)) === 0) {
                console.log("No documents found!");
              }
        })

        app.post('/carts',async (req,res)=>{
            const product = req.body;
            const carts = await cartsCollection.insertOne(product)
            res.send(carts);
        })

        app.get('/carts',async(req,res)=>{
            const result = await cartsCollection.find().toArray();
            res.send(result)
        })

        app.delete('/carts/:id',async(req,res)=>{
            const id = req.params.id;
            console.log(id);
            const query = {_id: id}
            const result = await cartsCollection.deleteOne(query)
            res.send(result)
            if (result.deletedCount === 1) {
                console.log("Successfully deleted one document.");
              } else {
                console.log("No documents matched the query. Deleted 0 documents.");
              }
        })

        console.log("Pinged your deployment. You successfully connected to MongoDb!");
    }finally {}
}
run().catch(console.dir);


app.get('/',(req,res)=>{
    res.send('SERVER IS RUNNING APPROPRIATELY!')
})

app.listen(port,()=>{
    console.log('Running on port:',port);
})