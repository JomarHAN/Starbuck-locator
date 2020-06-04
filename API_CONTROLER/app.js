const express = require('express');
const app = express();
const port = 3000;
const Stores = require('./api/models/stores');
const GoogleMapsService = require('./api/service/googleService');
const googleService = new GoogleMapsService()
require('dotenv').config()

const mongoose = require('mongoose');
const { default: Axios } = require('axios');
mongoose.connect('mongodb+srv://starbuck_locator:KtzJ27KmqXoV6AIt@cluster0-fujkr.mongodb.net/test?retryWrites=true&w=majority', {
    useNewUrlParser: true, 
    useUnifiedTopology: true,
    useCreateIndex: true
});

app.use(express.json({limit:'50mb'}))
app.use((req,res,next)=>{
    res.setHeader('Access-Control-Allow-Origin','*');
    next()
})

app.post('/api/stores',(req,res)=>{
    let dbStores = [];
    var storeData = req.body;
    storeData.forEach((store)=>{
        dbStores.push({
            storeName: store.name,
            phoneNumber: store.phoneNumber,
            address: store.address,
            openStatusText: store.openStatusText,
            addressLines: store.addressLines,
            location: {
                type:'Point',
                coordinates:[
                    store.coordinates.longitude,
                    store.coordinates.latitude
                ]
            }
        })
    })
    Stores.create(dbStores,(err,stores)=>{
        if (err) {
            res.status(500).send(err)
        } else{
            res.status(200).send(stores)
        }
    })
})

app.delete('/api/stores',(req,res)=>{
    Stores.deleteMany({},(err)=>{
        res.status(500).send(err)
    })
})

app.get('/api/stores',(req,res)=>{
    const zipCode = req.query.zip_code;
    googleService.getCoordinates(zipCode)
    .then((coordinates)=>{
        Stores.find({
            location: {
                $near: {
                    $maxDistance: 6436,
                    $geometry: {
                        type: "Point",
                        coordinates: coordinates
                    }
                }
            }
        },(err,stores)=>{
            if (err) {
                res.status(500).send(err)
            } else{
                res.status(200).send(stores)
            }
        })
    })
})

app.listen(port,()=>console.log(`Google Maps listening on http://localhost:${port}`))