(async () => {
  const fetch = (await import('node-fetch')).default;
  globalThis.fetch = fetch; 
})();

const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const cors = require('cors');
const ProductModel = require('../schemas/productSchemas')
const { HfInference } = require('@huggingface/inference');
const client = new HfInference("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");
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

        // console.log('Response from Flask:', flaskResponse.data);

      const pDetails = flaskResponse.data.product_details;
      const high = flaskResponse.data.highlights;


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
      const reviews = flaskResponse.data.reviews;
      // console.log("Reviews:", reviews);
      let summarizeResponse = null;
      let sentimentResponse = null;

      try{
         summarizeResponse = await axios.post(
          'http://localhost:8000/api/summarize',
          { reviews },
          { headers: { 'Content-Type': 'application/json' } }
          
      );
      console.log("summarized");
      }
      catch{
        console.log("error in summarizing");
      }

      try{
        sentimentResponse = await axios.post(
          'http://localhost:8000/api/senti',
          { reviews },
          { headers: { 'Content-Type': 'application/json' } }
      );
      console.log("sentiment analyzed");
      }
      catch{
        console.log("error in sentiment analysis");
      }

    console.log("Product Details:", pDetails);
    console.log("Summary:", summarizeResponse.data.summary);
    console.log("Sentiment:", sentimentResponse.data);
    console.log("Highlights:", high);

      res.status(200).json({
          productDetails: pDetails,
          summary: summarizeResponse.data.summary,
          sentiment: sentimentResponse.data,
          high: high
      });
 

      
  } catch (error) {
      console.error('Error communicating with Flask server:', error.message);
      res.status(500).json({ error: 'Error communicating with Flask server' });
  }
});


scrapeRouter.post("/summarize", async (req, res) => {
  console.log("Received request to summarize:");
  const { reviews } = req.body;

  if (!reviews || !Array.isArray(reviews)) {
      return res.status(400).json({ error: "Invalid input. Expected an array of reviews." });
  }

  try {
      const reviewTexts = reviews.map((review) => review.review).join(' '); 

      // console.log("Full review text for summarization:\n");
    
      const chatCompletion = await client.chatCompletion({
          model: "mistralai/Mistral-7B-Instruct-v0.3",
          messages: [
          {
              role: "user",
              content: `Please provide a  summary of the following reviews in 75 words:\n\n${reviewTexts}`,
          },
          ],
          max_tokens: 400, 
});


const summary = chatCompletion.choices[0].message.content;

return res.json({ summary });
} catch (error) {
console.error("Error processing reviews:", error);
return res.status(500).json({ error: "Failed to process reviews" });
}
});



scrapeRouter.post('/senti', async (req, res) => {
  console.log("Received request for sentii:");
  const { reviews } = req.body;

  if (!reviews || !Array.isArray(reviews)) {
      return res.status(400).json({ error: "Invalid input. Expected an array of reviews." });
  }

  try {
      const reviewTexts = reviews.map((review) => review.review);
      // console.log(reviewTexts);
      const response = await axios.post('http://localhost:5000/senti', {reviewTexts} , {
          headers: {
              'Content-Type': 'application/json',  
          }
      });

      const positiveCount = response.data.positive;
      const negativeCount = response.data.negative;
      // console.log("Sentiment Analysis Response:", response.data);

      res.status(200).json({
          positive: positiveCount,
          negative: negativeCount
      });
  } catch (error) {
      console.error("Error during sentiment analysis:", error);
      res.status(500).json({ error: "Failed to process sentiment analysis." });
  }
});



scrapeRouter.post('/chat', async (req, res) => {
  console.log('POST /chat called with data:');
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
      
      console.log('Response from Flask:');
      res.status(flaskResponse.status).json(flaskResponse.data);
  } catch (error) {
      console.error('Error communicating with Flask server:', error.message);
      res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = scrapeRouter;