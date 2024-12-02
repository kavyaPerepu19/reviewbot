const mongoose = require('mongoose');
const cors = require('cors');
const express = require('express');
const userModel = require('../schemas/loginSchemas');
const signRouter = express.Router();
signRouter.use(cors());
signRouter.use(express.json());



signRouter.post('/signup', async(req,res)=>{
    const {username,password} = req.body;
    const newUser = new userModel({
        username,
        password
    });
    

    try{
        await newUser.save();
        console.log("User created successfully!");
        res.status(201).send("User created successfully!");
    }
    catch(err){
        console.error("Error creating user:", err);
        res.status(500).send("Error creating user");
    }

})


module.exports = signRouter;