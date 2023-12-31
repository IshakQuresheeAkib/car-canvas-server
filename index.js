const express = require('express');
const cors = require('cors');
require("dotenv").config();
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express ();

const port = process.env.PORT || 5000;

app.use(cors({
    origin:['http://localhost:5173','https://car-canvas.web.app','https://car-canvas.firebaseapp.com','http://localhost:5174'],
    credentials:true
}))

app.use(express.json())
app.use(cookieParser())
const uri = `mongodb+srv://${process.env.DB_USER}:BkBDXR8mBx0cAIkW@cluster0.vuba6ki.mongodb.net/?retryWrites=true&w=majority`;



const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    }
  });

  const dbConnect = async () => {
    try {
        client.connect()
        console.log('DB Connected Successfully✅')
    } catch (error) {
        console.log(error.name, error.message)
    }
}
dbConnect()

// middlewares
const verify = async (req,res,next)=>{
    const token = req?.cookies?.token
    console.log(token)
    if (!token) {
        return res.status(401).send({error:'Forbidden access',status:401})
    }
    jwt.verify(token,process.env.SECRET_KEY,(err,decode)=>{
        if (err) {
            console.log(err);
            return res.status(403).send({error:'wrong access',status:401})
        }
        req.decode = decode;
        next();
    })
    
}



    
        const productsCollection = client.db('productDB').collection('products')
        const cartsCollection = client.db('productDB').collection('carts')
        

        app.get('/',(req,res)=>{
            res.send('SERVER IS RUNNING APPROPRIATELY!')
        })

        // creating jwt token and save to cookies
        app.post('/jwt',async(req,res)=>{
            const body = req.body;
            const token = jwt.sign(body,process.env.SECRET_KEY,{expiresIn:'1h'})

            res.cookie('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production', 
                sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
                
            })               
            .send({message:'SUCCESS',token})
        })

        app.post('/logout',async(req,res)=>{
            const user = req.body;
            console.log(user);

                res.clearCookie(
                "token",
                {
                maxAge: 0,
                secure: process.env.NODE_ENV === "production" ? true: false,
                sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
                }
                )
                .send({message:'Logged out'})
        })

        app.post('/products',async (req,res)=>{
            const product = req.body;
            const result = await productsCollection.insertOne(product)
            res.send(result);
        })

        app.put('/products',async(req,res)=>{
            const product = req.body;
            const filter = {_id: new ObjectId(product._id)}
            const options = {upsert:true}
            const updatedProduct = {
                $set:{
                    name : product.name ,
                    brandName : product.brandName,
                    image : product.image ,
                    type : product.type ,
                    price : product.price ,
                    rating : product.rating ,
                }
            }
            const result = await productsCollection.updateOne(filter,updatedProduct,options)
            res.send(result)
        })
 
        app.get('/products/:brands',async (req,res)=>{
            const brands = req.params.brands;
            console.log(brands);
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

        app.get('/product/:id',verify,async (req,res)=>{
            const id = req.params.id;
            
            const query = {_id: new ObjectId(id)};
            const product  = await productsCollection.findOne(query);
            res.send(product)
            if ((await productsCollection.countDocuments(query)) === 0) {
                console.log("No documents found!");
              }
        })


        
        app.get('/carts',verify,async(req,res)=>{
            const userEmail = req?.query?.email;
            if (req.decode.email !== userEmail) {
                return res.status(403).send({error:'wrong email',status:401}) 
            }
            let query;
            if (userEmail) {
                query= {email: userEmail}
            }
            const result = await cartsCollection.find(query).toArray();
            res.send(result)
        })       


        app.post('/carts',async (req,res)=>{
            const product = req.body;
            // console.log(product?.email);
            const result = await cartsCollection.findOne({productId: product.productId,email:product?.email})
            console.log(result);
            if (result) {
                res.status(400).json();
            }else{
                const productDetails = await cartsCollection.insertOne(product)
                res.send(productDetails);
            }
        })

           
        app.patch('/carts',async(req,res)=>{
            const product = req.body;
                const result = await cartsCollection.findOne({_id: product._id})
                if (result) {
                    const filter = {_id: product._id}
                    const options = {upsert:true}
                    const updatedProduct = {
                        $set:{
                            name : product.name ,
                            brandName : product.brandName,
                            image : product.image ,
                            type : product.type ,
                            price : product.price ,
                            rating : product.rating ,
                        }
                    }
                    const result = await cartsCollection.updateOne(filter,updatedProduct,options)
                    res.send(result)                    
                }            
        })


        app.delete('/carts/:id',async(req,res)=>{
            const id = req.params.id;
            const query = {_id: new ObjectId(id)}
            const result = await cartsCollection.deleteOne(query)
            res.send(result)            
        })

        console.log("Pinged your deployment.You successfully connected to MongoDb!");
    



        

app.listen(port,()=>{
    console.log('Running on port:',port);
})