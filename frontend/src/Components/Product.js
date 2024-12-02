import React from 'react';

const ProductDetail = ({ product }) => {
  return (
    <div className="bg-slate-100 p-6 rounded-lg shadow-lg max-w-lg mx-auto my-4">
      <div className="flex flex-col items-center">
        <img
          src={product.image}
          alt={product.name}
          className="w-80 h-100 object-cover rounded-lg mb-4"
        />
        <h2 className="text-2xl font-semibold text-gray-800">{product.name}</h2>
        <p className="text-xl text-green-600 my-2">{product.price}</p>
        <div className="flex items-center mb-4">
          <span className="text-yellow-500 text-lg">{product.rating}</span>
          <span className="ml-2 text-sm text-gray-500">Rating</span>
        </div>
        
        {/* <div className="w-full mt-4">
          <h3 className="text-xl font-medium text-gray-700">Review Summary</h3>
          <div className="mt-2">
            <p className="text-sm text-gray-600">
              Positive Reviews: {product.positiveReviews} | Negative Reviews: {product.negativeReviews}
            </p>
            <p className="text-sm text-gray-600">Review Summary: {product.reviewSummary}</p>
          </div>
        </div>
        
        <div className="mt-6">
          <h3 className="text-xl font-medium text-gray-700">Features</h3>
          <ul className="list-disc list-inside mt-2">
            {product.features.map((feature, index) => (
              <li key={index} className="text-sm text-gray-600">{feature}</li>
            ))}
          </ul>
        </div> */}
      </div>
    </div>
  );
};

export default ProductDetail;
