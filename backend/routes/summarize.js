// (async () => {
//     const fetch = (await import('node-fetch')).default;
//     globalThis.fetch = fetch; 
// })();

// const express = require('express');
// const bodyParser = require('body-parser');
// const cors = require('cors');
// const { HfInference } = require('@huggingface/inference');
// const client = new HfInference(process.env.hf_api);
// const sumRouter = express.Router();

// sumRouter.use(cors());
// sumRouter.use(bodyParser.urlencoded({ extended: true }));
// sumRouter.use(express.json());

// sumRouter.post("/summarize", async (req, res) => {
//     console.log("Received request to summarize:");
//     const { reviews } = req.body;
  
//     if (!reviews || !Array.isArray(reviews)) {
//         return res.status(400).json({ error: "Invalid input. Expected an array of reviews." });
//     }
  
//     try {
//         const reviewTexts = reviews.map((review) => review.review).join(' '); 
        
//         // Truncate if too long (most models have token limits)
//         const maxLength = 2000; // Adjust based on your needs
//         const truncatedText = reviewTexts.length > maxLength 
//             ? reviewTexts.substring(0, maxLength) + "..." 
//             : reviewTexts;
  
//         console.log("Processing review text length:", truncatedText.length);
      
//         // Try multiple models as fallbacks
//         const models = [
//             "microsoft/DialoGPT-medium",
//             "facebook/blenderbot-400M-distill",
//             "microsoft/DialoGPT-small",
//             "google/flan-t5-base"
//         ];

//         let summary = null;
//         let lastError = null;

//         // Try chat completion first with a more reliable model
//         for (const model of models) {
//             try {
//                 console.log(`Trying model: ${model}`);
                
//                 const chatCompletion = await client.chatCompletion({
//                     model: model,
//                     messages: [
//                         {
//                             role: "user",
//                             content: `Please provide a concise summary of the following reviews in 75 words:\n\n${truncatedText}`,
//                         },
//                     ],
//                     max_tokens: 150,
//                     temperature: 0.7,
//                 });

//                 if (chatCompletion && chatCompletion.choices && chatCompletion.choices[0]) {
//                     summary = chatCompletion.choices[0].message.content;
//                     console.log(`Successfully used model: ${model}`);
//                     break;
//                 }
//             } catch (modelError) {
//                 console.log(`Model ${model} failed:`, modelError.message);
//                 lastError = modelError;
//                 continue;
//             }
//         }

//         // If chat completion fails, try text generation as fallback
//         if (!summary) {
//             console.log("Chat completion failed, trying text generation...");
            
//             try {
//                 const response = await client.textGeneration({
//                     model: "gpt2",
//                     inputs: `Summarize these reviews in 75 words: ${truncatedText}\n\nSummary:`,
//                     parameters: {
//                         max_new_tokens: 100,
//                         temperature: 0.7,
//                         do_sample: true,
//                     }
//                 });
                
//                 summary = response.generated_text.replace(`Summarize these reviews in 75 words: ${truncatedText}\n\nSummary:`, '').trim();
//             } catch (textGenError) {
//                 console.log("Text generation also failed:", textGenError.message);
//                 lastError = textGenError;
//             }
//         }

//         // If all else fails, try summarization endpoint
//         if (!summary) {
//             console.log("Trying summarization endpoint...");
            
//             try {
//                 const response = await client.summarization({
//                     model: "facebook/bart-large-cnn",
//                     inputs: truncatedText,
//                     parameters: {
//                         max_length: 100,
//                         min_length: 30,
//                     }
//                 });
                
//                 summary = response.summary_text;
//             } catch (summaryError) {
//                 console.log("Summarization endpoint failed:", summaryError.message);
//                 lastError = summaryError;
//             }
//         }

//         if (summary) {
//             return res.json({ summary: summary.trim() });
//         } else {
//             throw lastError || new Error("All summarization methods failed");
//         }

//     } catch (error) {
//         console.error("Error processing reviews:", error);
        
//         // Provide a more helpful error response
//         const errorMessage = error.message.includes('blob') 
//             ? "The AI model is currently unavailable. Please try again later."
//             : "Failed to process reviews. Please check your input and try again.";
            
//         return res.status(500).json({ 
//             error: errorMessage,
//             details: process.env.NODE_ENV === 'development' ? error.message : undefined
//         });
//     }
// });

// module.exports = sumRouter;

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const sumRouter = express.Router();

sumRouter.use(cors());
sumRouter.use(bodyParser.urlencoded({ extended: true }));
sumRouter.use(express.json());

// Simple but effective extractive summarization
function createSummary(text, targetWords = 75) {
    // Clean and split into sentences
    const sentences = text
        .replace(/\s+/g, ' ')
        .split(/[.!?]+/)
        .map(s => s.trim())
        .filter(s => s.length > 20);

    if (sentences.length === 0) return "No content to summarize.";
    if (sentences.length <= 3) return sentences.join('. ') + '.';

    // Extract key phrases and sentiment words
    const positiveWords = ['good', 'great', 'excellent', 'amazing', 'love', 'perfect', 'best', 'awesome', 'fantastic', 'wonderful'];
    const negativeWords = ['bad', 'terrible', 'awful', 'hate', 'worst', 'horrible', 'disappointing', 'poor', 'useless'];
    const importantWords = ['quality', 'price', 'service', 'delivery', 'product', 'customer', 'experience', 'recommend', 'buy', 'purchase'];

    // Score sentences based on important content
    const scoredSentences = sentences.map(sentence => {
        const words = sentence.toLowerCase().split(/\s+/);
        let score = 0;
        
        // Boost sentences with sentiment words
        score += words.filter(w => positiveWords.includes(w)).length * 2;
        score += words.filter(w => negativeWords.includes(w)).length * 2;
        score += words.filter(w => importantWords.includes(w)).length * 1.5;
        
        // Prefer sentences with moderate length
        if (sentence.length > 50 && sentence.length < 200) score += 1;
        
        return { sentence, score, length: sentence.split(' ').length };
    });

    // Select best sentences within word limit
    const selectedSentences = [];
    let currentWords = 0;
    
    scoredSentences
        .sort((a, b) => b.score - a.score)
        .forEach(item => {
            if (currentWords + item.length <= targetWords * 1.2) {
                selectedSentences.push(item.sentence);
                currentWords += item.length;
            }
        });

    return selectedSentences.slice(0, 4).join('. ') + '.';
}

// Direct API call to Hugging Face
async function callHuggingFaceAPI(text) {
    const API_KEY = process.env.hf_api;
    
    if (!API_KEY) {
        throw new Error('Hugging Face API key not configured');
    }

    // Try multiple models in order of reliability
    const models = [
        'facebook/bart-large-cnn',
        'sshleifer/distilbart-cnn-12-6',
        'google/pegasus-xsum'
    ];

    for (const model of models) {
        try {
            // console.log(`Trying direct API call to: ${model}`);
            
            const response = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${API_KEY}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    inputs: text.substring(0, 1000), // Limit input length
                    parameters: {
                        max_length: 100,
                        min_length: 30,
                        do_sample: false,
                        early_stopping: true
                    },
                    options: {
                        wait_for_model: true,
                        use_cache: true
                    }
                })
            });

            if (response.ok) {
                const result = await response.json();
                // console.log('API Response:', result);
                
                if (Array.isArray(result) && result[0]?.summary_text) {
                    console.log(`✅ Success with model: ${model}`);
                    return result[0].summary_text;
                }
            } else {
                const errorText = await response.text();
                console.log(`❌ Model ${model} failed: ${response.status} - ${errorText}`);
            }
        } catch (error) {
            console.log(`❌ Model ${model} error:`, error.message);
        }
    }
    
    return null;
}

sumRouter.post("/summarize", async (req, res) => {
    console.log("📥 Received summarization request");
    const { reviews } = req.body;
    // console.log(req.body);
  
    if (!reviews || !Array.isArray(reviews)) {
        return res.status(400).json({ error: "Invalid input. Expected an array of reviews." });
    }
  
    try {
        // Combine all reviews
        const reviewTexts = reviews
            .map(review => review.review || '')
            .filter(text => text.trim().length > 0)
            .join(' ');

        if (!reviewTexts.trim()) {
            return res.status(400).json({ error: "No valid review content found." });
        }

        // console.log(`📊 Processing ${reviews.length} reviews (${reviewTexts.length} characters)`);

        let summary = null;

        // Try Hugging Face API first
        try {
            summary = await callHuggingFaceAPI(reviewTexts);
        } catch (apiError) {
            console.log('🔄 API failed, using fallback:', apiError.message);
        }

        // Use local summarization as fallback
        if (!summary) {
            // console.log('🔄 Using local extractive summarization');
            summary = createSummary(reviewTexts);
        }

        // console.log('✅ Summary generated successfully');
        return res.json({ 
            summary: summary.trim(),
            // method: summary.includes('API') ? 'ai' : 'extractive'
        });

    } catch (error) {
        console.error("💥 Error processing reviews:", error);
        
        // Final fallback
        try {
            const reviewTexts = reviews.map(r => r.review || '').join(' ');
            const fallbackSummary = createSummary(reviewTexts);
            
            return res.json({ 
                summary: fallbackSummary,
                // method: 'fallback'
            });
        } catch (fallbackError) {
            return res.status(500).json({ 
                error: "Unable to process reviews",
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }
});

module.exports = sumRouter;