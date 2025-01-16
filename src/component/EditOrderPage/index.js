import React, { useEffect, useState } from "react";
import "./style.css";
import { useParams } from "react-router-dom";
import axios from "axios";
import { formatIndianPrice } from "../../utils/helper";
import { useNavigate } from "react-router-dom";
import Loader from "../Loader";

const api = axios.create({
  baseURL: "https://lagaffes.com/wp-json/wc/v3/", // Base URL of WooCommerce API
  auth: {
    username: "ck_f789aaa539b67800d63b1c7e96d1a5956ffcef75", // Replace with your WooCommerce Consumer Key
    password: "cs_d94289340a3278ad5d8a85aab9eb84d4781b2d83", // Replace with your WooCommerce Consumer Secret
  },
});

const EditOrderPage = () => {
  const [isNewOrder, setIsNewOrder] = useState(false);
  const [orderDetails, setOrderDetails] = useState({
    orderId: "",
    customerName: "",
    items: [],
    shippingAmount: "",
    totalAmount: "",
  })
  const [isLoading, setIsLoading] = useState(false);

  const { id } = useParams();
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setOrderDetails((prevDetails) => ({
      ...prevDetails,
      [name]: value,
    }));
  };

  const handleItemChange = (index, e) => {
    const { name, value } = e.target;
    setOrderDetails((prevDetails) => {
      const updatedItems = [...prevDetails.items];
      updatedItems[index] = { ...updatedItems[index], [name]: value };
      return { ...prevDetails, items: updatedItems };
    });
  };

  const handleAddItem = () => {
    setOrderDetails((prevDetails) => ({
      ...prevDetails,
      items: [
        ...prevDetails.items,
        { id: Date.now(), sku: "", name: "", quantity: 1, price: 0 },
      ],
    }));
  };

  const handleRemoveItem = (index) => {
    setOrderDetails((prevDetails) => {
      const updatedItems = prevDetails.items.filter((_, i) => i !== index);
      return { ...prevDetails, items: updatedItems };
    });
  };

  const findItems = async (sku) => {
    try {
      setIsLoading(true);
      const response = await api.get("products", { params: { sku } });
  
      return {
        name: response.data[0].name,
        price: response.data[0].price,
      };
    } catch (error) {
      console.error("Error fetching item details:", error);
      throw new Error("Invalid SKU");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSaveClick = async () => {
    setIsLoading(true);
    const finalOrder = JSON.parse(JSON.stringify(orderDetails));
  
    try {
      const items = await Promise.all(
        finalOrder.items.map(async (item) => {
          try {
            const details = await findItems(item.sku);
            return {
              sku: item.sku,
              name: details.name,
              quantity: item.quantity,
              price: details.price,
            };
          } catch (error) {
            alert("Invalid SKU: " + item.sku);
            throw new Error("Invalid SKU detected"); // Stop further execution on error
          }
        })
      );
  
      finalOrder.items = items;
  
      const url = isNewOrder ? "https://lagaffe-backend.onrender.com/order/add-order" : "https://lagaffe-backend.onrender.com/order/edit-order";
  
      await axios.post(url, finalOrder, {
        headers: { 'Content-Type': 'application/json' },
      });
  
      navigate(`/order-details/${id}`);
    } catch (error) {
      console.error("Error saving order or processing items:", error);
    } finally {
      setIsLoading(false);
    }
  };

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

              const allItems = orderData.data.data.items.map((item) => {
                const itemObj = {
                  sku: item.sku.substring(0, 6),
                  name: item.name,
                  quantity: item.quantity,
                  price: item.price,
                }
                return itemObj;
              })


              const obj = {
                orderId: `#${data.id}`,
                customerName: orderData.data.data.customerName,
                items: allItems,
                shippingAmount: formatIndianPrice(orderData.data.data.shippingAmount),
                totalAmount: Number(orderData.data.data.totalAmount),
              }
              setOrderDetails(obj);
              setIsNewOrder(false);
            }
            else {

              const allItems = data.line_items.map((item) => {
                const itemObj = {
                  sku: item.sku.substring(0, 6),
                  name: item.name,
                  quantity: item.quantity,
                  price: item.price,
                }
                return itemObj;
              })

              const obj = {
                orderId: `#${data.id}`,
                customerName: `${data.billing.first_name} ${data.billing.last_name}`,
                items: allItems,
                shippingAmount: "0",
                totalAmount: Number(data.total),
              }
              setOrderDetails(obj);
              setIsNewOrder(true);
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
    <div className="edit-order-page">
      <h1 className="title" style={{ marginTop: "5rem" }}>
        Edit Order
      </h1>
      <div className="edit-order-form">
        <div className="form-group">
          <label>Order ID:</label>
          <input type="text" value={`#${id}`} readOnly />
        </div>
        <div className="form-group">
          <label>Customer Name:</label>
          <input
            type="text"
            name="customerName"
            value={orderDetails.customerName}
            onChange={handleInputChange}
          />
        </div>
        <div className="form-group">
          <label>Sale Price:</label>
          <input
            type="number"
            name="totalAmount"
            value={orderDetails.totalAmount}
            onChange={handleInputChange}
          />
        </div>
        <div className="form-group">
          <label>Shipping Amount:</label>
          <input
            type="number"
            name="shippingAmount"
            value={orderDetails.shippingAmount}
            onChange={handleInputChange}
          />
        </div>

        <h2>Items</h2>
        {orderDetails.items.map((item, index) => (
          <div key={item.id} className="form-group item-group">
            <label>SKU:</label>
            <input
              type="text"
              name="sku"
              value={item.sku.substring(0, 6)}
              onChange={(e) => handleItemChange(index, e)}
            />
            <label>Quantity:</label>
            <input
              type="number"
              name="quantity"
              value={item.quantity}
              onChange={(e) => handleItemChange(index, e)}
            />
            <button className="remove-btn" onClick={() => handleRemoveItem(index)}>
              Remove
            </button>
          </div>
        ))}
        <button className="add-item-btn" onClick={handleAddItem}>
          Add Item
        </button>

        <button className="save-btn" onClick={handleSaveClick}>
          Save
        </button>
      </div>
    </div>
  );
};

export default EditOrderPage;