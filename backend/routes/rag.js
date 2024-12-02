const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const cors = require('cors');

const ragRouter = express.Router();

ragRouter.use(cors());
ragRouter.use(bodyParser.urlencoded({ extended: true }));
ragRouter.use(bodyParser.json());


ragRouter.post('/chat', async(req,res) =>{
    console.log(' POST /chat called with data :', req.body.data);
    const {data} = req.body;
    if(!data){
        return res.status(400).json({error: "Data not provided"});
    }
    try{
        const flaskResponse = await axios.post(
            'http://localhost:5000/chat',
            new URLSearchParams({data}),
        );
        console.log('Response from Flask:', flaskResponse.data);
        res.status(flaskResponse.status).json(flaskResponse.data);
    }catch(error){
        console.error('Error communicating with Flask server:', error.message);
        res.status(500).json({error: "Internal server error"});
    }

})