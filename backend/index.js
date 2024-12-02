const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
// const axios = require('axios');
const dotenv = require("dotenv");
const scrapeRouter = require('./routes/flip');
dotenv.config();
const logRouter = require('./routes/log');
const signRouter = require('./routes/sign');



const app = express();
const db= async () =>{
    // console.log(process.env.DB_URI)
try {
    await mongoose.connect(process.env.DB_URI );
    
    console.log("Connected to the database");
}
catch (error) {
    console.log("Error connecting to the database");
}
}


db();

app.use(cors());    
app.use('/api',logRouter);
app.use('/api',signRouter);
app.use('/api',scrapeRouter);

app.listen(8000, () => {
    console.log("Server is running on port 8000");
});