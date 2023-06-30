const express = require('express');
const cors = require('cors');
const {MongoClient,ServerApiVersion,ObjectId} = require('mongodb');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET);

const port = process.env.PORT || 5000;

const app = express();

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.3zndhpn.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});
async function run() {
  try {
    const usersCollection = client.db('mensParlour').collection('users');
    
    app.post('/users',async(req,res)=>{
        const user = req.body;
        const filter = {email: user?.email};
        const oldUser = await usersCollection.findOne(filter);
        if(!oldUser) {
          const result = await usersCollection.insertOne(user);
          res.send(result);
        }else{
          res.status(400).json({message: 'User already exists'});
        }
    }) 

    app.get('/users',async(req,res)=>{
      const query = {};
      const users = await usersCollection.find(query).toArray();
      res.send(users);
    });

    app.get('users/admin/:email',async(req,res)=>{
      const email = req.params.email;
      const query = {email};
      const user = await usersCollection.findOne(query);
      res.send({isAdmin: user?.role === 'admin'});
    })
} finally {
    
  }
}
run().catch(console.dir);
app.get('/',async(req,res) =>{
  res.send('Mens Parlour Server running');
})

app.listen(port,()=> console.log(`Mens Parlour Server running on ${port}`))