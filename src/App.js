import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Homepage from './component/Homepage';
import ProductsPage from './component/ProductsPage';
import OrdersPage from './component/OrdersPage';
import AbnormalLossPage from './component/AbnormalLossPage';
import ExpensesPage from './component/ExpensesPage';
import "./App.css"
import Navbar from './component/Navbar';
import ProductDetail from './component/ProductDetail';
import EditProduct from './component/EditProduct';
import OrderDetails from './component/OrderDetails';
import EditOrderPage from './component/EditOrderPage';


const App = () => {
  return (

    <Router>
      <div className="app">
        <Navbar />
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/abnormal-loss" element={<AbnormalLossPage />} />
          <Route path="/expenses" element={<ExpensesPage />} />
          <Route path="/product-details/:sku" element={<ProductDetail />} />
          <Route path="/edit-product/:sku" element={<EditProduct />} />
          <Route path="/order-details/:id" element={<OrderDetails />} />
          <Route path="/edit-order/:id" element={<EditOrderPage />} />
        </Routes>
      </div>
    </Router>


  );
};

export default App;