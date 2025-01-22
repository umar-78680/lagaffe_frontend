import React, { useEffect, useState } from "react";
import { FaEdit } from "react-icons/fa";
import { FaSearch } from "react-icons/fa";
import './style.css';
import axios from "axios";
import { formatIndianPrice } from "../../utils/helper";
import Loader from "../Loader";
import PaginationComponent from "../Pagination";
import { useNavigate } from "react-router-dom";
import { NavLink } from "react-router-dom";


const api = axios.create({
  baseURL: "https://lagaffes.com/wp-json/wc/v3/", // Base URL of WooCommerce API
  auth: {
    username: "ck_f789aaa539b67800d63b1c7e96d1a5956ffcef75", // Replace with your WooCommerce Consumer Key
    password: "cs_d94289340a3278ad5d8a85aab9eb84d4781b2d83", // Replace with your WooCommerce Consumer Secret
  },
});

const OrdersComponent = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [filterOrders, setFilterOrders] = useState([]);
  const [orders, setOrders] = useState([]);

const navigate = useNavigate();


  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true); // Show loader when fetching data
  
      try {
        // Fetch WooCommerce orders
        const wooResponse = await api.get("orders", {
          params: {
            status: "processing,completed",
            per_page: 10, // Number of orders per page
            page: page, // Current page
          },
        });
  
        const totalOrders = wooResponse.headers['x-wp-total'];
        setTotalPages(Math.ceil(totalOrders / 10));
  
        const wooOrders = wooResponse.data;
  
        // Check MongoDB one by one for each WooCommerce order ID
        const dataArray = await Promise.all(
          wooOrders.map(async (order) => {
            let mongoOrder;
  
            try {
              const mongoResponse = await axios.post("https://lagaffe-backend.onrender.com/order/find-order", { orderId: `#${order.id }`});
              // mongoOrder = mongoResponse.data.order || null; // MongoDB response for the order
              if(mongoResponse.data.success)
              {
                mongoOrder = mongoResponse.data.data || null;
              }
            } catch (error) {
              console.error(`Error checking MongoDB for order ID ${order.id}:`, error);
            }
  
            // Merge WooCommerce and MongoDB data
            return {
              orderId: `#${order.id}`,
              name: `${order.billing.first_name} ${order.billing.last_name}`,
              amount: mongoOrder ? formatIndianPrice(mongoOrder.totalAmount) : formatIndianPrice(order.total), // Use MongoDB amount if available
              orderDate: order.date_created.substring(0, 10),
              paymentMode: order.payment_method === "razorpay" ? "Prepaid" : order.payment_method,
              isShippingAdded: mongoOrder? true: false,
            };
          })
        );
  
        setOrders(dataArray);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setIsLoading(false); // Hide loader after data fetch
      }
    };
  
    fetchData();
  }, [page]);
  
  

  useEffect(() => {
    const performSearch = async () => {
      if (!searchQuery) {
        setFilterOrders(orders); // Show all orders if no search query
        return;
      }
  
      // Filter orders locally
      const filteredLocalOrders = orders.filter((order) =>
        order.orderId.toLowerCase().includes(searchQuery.toLowerCase())
      );
  
      if (filteredLocalOrders.length > 0) {
        setFilterOrders(filteredLocalOrders);
        return;
      }
  
      // Handle remote search for valid query lengths (5-6 characters)
      if (searchQuery.length < 5 || searchQuery.length > 6) {
        setFilterOrders([]); // Invalid query length, show no results
        return;
      }
  
      try {
        setIsLoading(true);
  
        const formattedQuery = searchQuery.charAt(0) === '#' ? searchQuery : `#${searchQuery}`;
        const orderData = await fetchOrderData(formattedQuery);
  
        if (orderData) {
          setFilterOrders([orderData]);
        } else {
          setFilterOrders([]); // No matching orders
        }
      } catch (error) {
        console.error("Error during search:", error);
        setFilterOrders([]);
      } finally {
        setIsLoading(false);
      }
    };
  
    const fetchOrderData = async (query) => {
      try {
        // Fetch data from the first API
        const response = await axios.post(
          "https://lagaffe-backend.onrender.com/order/find-order",
          { orderId: query },
          { headers: { 'Content-Type': 'application/json' } }
        );
  
        if (response.data.success) {
          const wooresponse = await api.get(`orders/${query.substring(1)}`);
          return processWooOrderData(wooresponse.data, response.data.data);
        }
  
        // Fallback: Fetch data directly from WooCommerce
        const fallbackResponse = await api.get(`orders/${query.substring(1)}`);
        return processWooOrderData(fallbackResponse.data);
      } catch (error) {
        console.error("Fetch order data error:", error);
        return null;
      }
    };
  
    const processWooOrderData = (wooData, additionalData = null) => {
      if (!wooData || (wooData.status !== "processing" && wooData.status !== "completed")) {
        return null; // Only show processing/completed orders
      }
  
      return {
        orderId: additionalData ? additionalData.orderId : `#${wooData.id}`,
        name: additionalData ? additionalData.customerName : `${wooData.billing.first_name} ${wooData.billing.last_name}`,
        amount: formatIndianPrice(additionalData ? additionalData.totalAmount : wooData.total),
        orderDate: wooData.date_created.substring(0, 10),
        paymentMode: wooData.payment_method === "razorpay" ? "Prepaid" : wooData.payment_method,
        isShippingAdded: additionalData ? true : false,
      };
    };
  
    performSearch();
  }, [searchQuery, orders]);
  

  function pageChange(value) {
    setPage(value);
  }

  return (
    <div className="orders-page">
      <h1 className="title">Orders</h1>

      {/* Search input */}

      <div className="search-input-container">
        <FaSearch />
        <input
          type="text"
          placeholder="Search by Order ID"
          className="search-input-feild"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>


      {
        isLoading ? <Loader /> : filterOrders.length > 0 ? <>
        <div className="orders-list">
            {filterOrders.map((order, index) => (
              <div className="order-item" key={index}>
                <span style={{color: order.isShippingAdded ? "#ffcc00" : "Red"}}>{order.orderId}</span>
                <span>{order.name}</span>
                <span>₹{order.amount}</span>
                <span>{order.orderDate}</span>
                <span>{order.paymentMode}</span>
                <NavLink to={`/order-details/${order.orderId.substring(1)}`} style={{color: "white"}}><FaEdit className="edit-icon"/></NavLink>
                
              </div>
            ))}
          </div>

          <div className="pagination-container">
            <PaginationComponent page={page} totalPages={totalPages} pageChange={pageChange} />
          </div>
        </> : <h1>No Order Found!</h1>  
      }


    </div>
  );
};

export default OrdersComponent;