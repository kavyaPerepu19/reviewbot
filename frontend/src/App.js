import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './Components/Navbar';
import Home from './Components/Home';
import ChatBot from './Components/ChatBot';
import Login from './Components/Login';
import Error from './Components/Error';
import Signup from './Components/Signup';
import LinkInput from './Components/LinkInput';
import ProductDetail from './Components/Product';
import { AuthProvider } from './context/AuthContext';

const App = () => {
  const [product, setProduct] = useState({
    image: "https://rukminim2.flixcart.com/image/416/416/xif0q/mobile/h/d/9/-original-imagtc2qzgnnuhxh.jpeg?q=70&crop=false",
    name: "Apple iPhone 15 (Black, 128 GB)",
    price: "₹57,749",
    rating: "4.6",
    positiveReviews: 300,
    negativeReviews: 45,
    reviewSummary: "Great performance, sleek design, but a bit pricey.",
    features: [
      "128 GB Storage",
      "A16 Bionic Chip",
      "6.1-inch Super Retina Display",
      "12 MP Dual-Camera System",
      "Face ID"
    ]
  });
  

  return (
    <div style={{ backgroundColor: '#F1F5F9' }}>
      <AuthProvider>
        <Router>
          <Navbar />
          <div className="App-header">
            <Routes>
              <Route path="/ChatBot" element={<ChatBot />} />
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/link" element={<LinkInput setProduct={setProduct} />} /> 
              <Route path="/product" element={<ProductDetail product={product} />} />
              <Route path="*" element={<Error />} />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </div>
  );
};

export default App;