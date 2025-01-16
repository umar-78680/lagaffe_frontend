import React, { useEffect, useState } from "react";
import { FaEdit } from "react-icons/fa";
import "./style.css";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { formatIndianPrice } from "../../utils/helper";
import Loader from "../Loader";


const api = axios.create({
  baseURL: "https://lagaffes.com/wp-json/wc/v3/", // Base URL of WooCommerce API
  auth: {
    username: "ck_f789aaa539b67800d63b1c7e96d1a5956ffcef75", // Replace with your WooCommerce Consumer Key
    password: "cs_d94289340a3278ad5d8a85aab9eb84d4781b2d83", // Replace with your WooCommerce Consumer Secret
  },
});

const OrderDetailsPage = () => {

  const [order, setOrder] = useState({
    orderId: "",
    name: "",
    email: "",
    phone: "",
    shippingAdress: {
      address: "",
      city: "",
      state: "",
      pincode: "",
    },
    amount: "",
    status: "",
    paymentMode: "",
    shippingAmount: 0,
    items: [], // Initialize items as an empty array
  });
  const [isLoading, setIsLoading] = useState(false);

  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchDetails() {

      try {
        setIsLoading(true);
        const response = await api.get(`orders/${id}`);
        const data = response.data;


        if (data.id) {

          try {
            const body = { orderId: `#${id}` };
            const orderData = await axios.post("https://lagaffe-backend.onrender.com/order/find-order", body, {
              headers: {
                'Content-Type': 'application/json',
              },
            })

            if (orderData.data.success) {
              const obj = {
                orderId: `#${data.id}`,
                name: orderData.data.data.customerName,
                email: data.billing.email,
                phone: data.billing.phone,
                shippingAdress: {
                  address: data.billing.address_1,
                  city: data.billing.city,
                  state: data.billing.state,
                  pincode: data.billing.postcode,
                },
                amount: formatIndianPrice(orderData.data.data.totalAmount),
                status: data.status,
                paymentMode: data.payment_method === "razorpay" ? "Prepaid" : data.payment_method,
                shippingAmount: formatIndianPrice(orderData.data.data.shippingAmount),
                items: orderData.data.data.items,
              }
              setOrder(obj);
            }
            else {
              const obj = {
                orderId: `#${data.id}`,
                name: `${data.billing.first_name} ${data.billing.last_name}`,
                email: data.billing.email,
                phone: data.billing.phone,
                shippingAdress: {
                  address: data.billing.address_1,
                  city: data.billing.city,
                  state: data.billing.state,
                  pincode: data.billing.postcode,
                },
                amount: formatIndianPrice(data.total),
                status: data.status,
                paymentMode: data.payment_method === "razorpay" ? "Prepaid" : data.payment_method,
                shippingAmount: "0",
                items: data.line_items,
              }
              setOrder(obj);
              
            }
            setIsLoading(false);
          } catch (error) {
            console.log(error);
            setIsLoading(true);
          }

        }
      } catch (error) {
        console.log(error);
        setIsLoading(true);
      }
    }

    fetchDetails();
  }, [id])


  if (isLoading) {
    return (
        <div className='loader'>
            <Loader />
        </div>

    )
}


  return (
    <div className="order-details-page">
      <h1 className="title">Order Details</h1>
      <div className="order-summary">
        <p><strong>Order ID:</strong> {order.orderId}</p>
        <p><strong>Customer Name:</strong> {order.name}</p>
        <p><strong>Email:</strong> {order.email}</p>
        <p><strong>Phone:</strong> {order.phone}</p>
        <ul>
          <h2>Shipping Address</h2>
          <li><b>Address: </b>{order.shippingAdress.address}</li>
          <li><b>City: </b>{order.shippingAdress.city}</li>
          <li><b>State: </b>{order.shippingAdress.state}</li>
          <li><b>Pincode: </b>{order.shippingAdress.pincode}</li>
        </ul>
        <p><strong>Status:</strong> {order.status}</p>
        <p><strong>Shipping Amount:</strong> ₹{order.shippingAmount}</p>
        <p><strong>Payment Method:</strong> {order.paymentMode}</p>
      </div>
      <div className="order-items-section">
        <h2>Items Purchased</h2>
        <div className="order-items">
          {order.items.length > 0 ? (
            order.items.map((item, index) => (
              <div className="order-item" key={index}>
                <span className="item-name">{item.name}</span>
                <span className="item-qty">Quantity: {item.quantity}</span>
                <span className="item-price">Price: ₹{formatIndianPrice(item.price)}</span>
              </div>
            ))
          ) : (
            <p>No items found.</p>
          )}
        </div>
        <div className="order-total">
          <strong>Sale Price:</strong> ₹{formatIndianPrice(order.amount)}
        </div>
      </div>
      <button className="edit-btn" onClick={() => navigate(`/edit-order/${id}`)}>
        <FaEdit /> Edit Order
      </button>
    </div>
  );
};

export default OrderDetailsPage;
