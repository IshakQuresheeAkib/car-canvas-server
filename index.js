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

        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    }finally {}
}
run().catch(console.dir);


app.get('/',(req,res)=>{
    res.send('SERVER IS RUNNING APPROPRIATELY!')
})



app.listen(port,()=>{
    console.log('Running on port:',port);
})