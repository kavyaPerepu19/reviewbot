const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const cors = require('cors');
const ProductModel = require('../schemas/productSchemas')


const scrapeRouter = express.Router();



scrapeRouter.use(cors());
scrapeRouter.use(bodyParser.urlencoded({ extended: true }));
scrapeRouter.use(bodyParser.json());


scrapeRouter.post('/scrape', async (req, res) => {
  console.log('POST /scrape called with URL:', req.body.url); 
  const { url } = req.body;

  if (!url) {
      return res.status(400).json({ error: "URL not provided" });
  }

  

  try {
      const flaskResponse = await axios.post(
          'http://localhost:5000/scrape',
          new URLSearchParams({ url }), {
              headers: {
                  'Content-Type': 'application/x-www-form-urlencoded',
              },
          }
      );

        console.log('Response from Flask:', flaskResponse.data);

      const pDetails = flaskResponse.data.product_details;


      const newProduct = new ProductModel({
        productName: pDetails.name,
        productPrice: pDetails.price,
        productImage: pDetails.image,
        productRating: pDetails.rating,
        productLink: url,
      });
      
      try{
        await newProduct.save();
        console.log("product created successfully")
      }
      catch{
        console.log("error creating new product");
      }
    
      res.status(flaskResponse.status).json(flaskResponse.data);
  } catch (error) {
      console.error('Error communicating with Flask server:', error.message);
      res.status(500).json({ error: 'Error communicating with Flask server' });
  }
});




scrapeRouter.post('/chat', async (req, res) => {
  console.log('POST /chat called with data:', req.body.scraped_data);
  const { query,scraped_data } = req.body;

  if (!scraped_data || !query) {
      return res.status(400).json({ error: 'Data or query not provided' });
  }

  try {
      const flaskResponse = await axios.post(
          'http://localhost:5000/query',
          {
              query: query, 
              scraped_data: scraped_data
          },
          {
              headers: {
                  'Content-Type': 'application/json', 
              },
          }
      );
      
      console.log('Response from Flask:', flaskResponse.data);
      res.status(flaskResponse.status).json(flaskResponse.data);
  } catch (error) {
      console.error('Error communicating with Flask server:', error.message);
      res.status(500).json({ error: 'Internal server error' });
  }
});


module.exports = scrapeRouter;