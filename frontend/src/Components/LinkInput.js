import React, { useState } from 'react';
import { Link2 } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const LinkInput = ({setProduct}) => { 
  const [url, setUrl] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const a = `${process.env.REACT_APP_API_NODE_URI}`
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new URLSearchParams();
      formData.append('url', url)
      console.log(a);

      const res = await axios.post('http://localhost:8000/api/scrape', formData, {

        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
       
      
      const { product_details, reviews } = res.data;
      console.log(product_details);
      setIsSubmitted(true);
      setProduct({
        image: product_details.image,
        name: product_details.name,
        price: product_details.price,
        rating: product_details.rating,
        reviews: reviews, 
      });
  
      

      
      
      
      console.log('Response:', res.data); 
      
      
     
    } catch (error) {
      console.error('Error:', error.response?.data || error.message);
    } finally {
      setLoading(false);
      navigate('/product'); 

      
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50 flex items-center justify-center px-4 bg-slate-100">
      <div className="max-w-xl w-full bg-white rounded-lg shadow-xl p-8">
        <div className="text-center mb-8">
          <Link2 className="h-12 w-12 text-blue-600 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Add Review Link
          </h2>
          <p className="text-gray-600">
            Enter the URL of the product or service you'd like to analyze
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-700 mb-2" htmlFor="url">
              URL
            </label>
            <input
              id="url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/product"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
            disabled={loading} 
          >
            {loading ? 'Analyzing...' : 'Analyze Reviews'}
          </button>
        </form>

        {loading && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg flex justify-center items-center">
            <div className="animate-spin h-8 w-8 border-t-4 border-blue-600 border-solid rounded-full" />
          </div>
        )}

        {isSubmitted && !loading && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-gray-700 text-center">
              Your link has been submitted for analysis.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LinkInput;
