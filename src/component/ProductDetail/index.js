import React, { useEffect, useState } from 'react';
import SwipeableViews from 'react-swipeable-views';
import { Button, Collapse, Typography, Box } from '@mui/material';
import { FaChevronCircleDown } from "react-icons/fa";
import { FaArrowCircleUp } from "react-icons/fa";
import './style.css';
import { useParams } from 'react-router-dom';
import axios from "axios";
import { formatIndianPrice } from '../../utils/helper';
import Loader from '../Loader';
import { useNavigate } from 'react-router-dom';

const api = axios.create({
    baseURL: "https://lagaffes.com/wp-json/wc/v3/",
    auth: {
        username: "ck_f789aaa539b67800d63b1c7e96d1a5956ffcef75",
        password: "cs_d94289340a3278ad5d8a85aab9eb84d4781b2d83",
    },
});

const ProductDetail = () => {
    const [showDetails, setShowDetails] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [product, setProduct] = useState({});

    const [isLoading, setIsLoading] = useState(false);

    const { sku } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        async function fetchData() {
            try {
                setIsLoading(true);
                const response = await api.get("products", {
                    params: { sku: sku },
                });

                const body = {
                    sku
                };

                const productdetails = await axios.post("https://lagaffe-backend.onrender.com/product/product-details", body, {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                // Define the default costing sequence as you want
                let costingArray = [
                    { label: 'Total Cost', amount: 0 },
                    { label: 'cost', amount: 0 },
                    { label: 'import', amount: 0 },
                    { label: 'shoot', amount: 0 },
                    { label: 'packaging', amount: 0 },
                    { label: 'misc', amount: 0 },
                    { label: 'gst', amount: 0 },
                    { label: 'stocking', amount: 0 }

                ];

                let totalCost = 0;
                let stock = 0;

                if (productdetails.data.success) {
                    const costingData = productdetails.data.data.costing;
                    stock = productdetails.data.data.stock
                    const keys = Object.keys(costingData);

                    keys.forEach(key => {
                        if (key !== "_id") {
                            totalCost += costingData[key];

                            // Update the respective entry in the costingArray
                            const index = costingArray.findIndex(item => item.label === key);
                            if (index !== -1) {
                                costingArray[index].amount = formatIndianPrice(costingData[key]);
                            }
                        }
                    });

                    // Update 'Total Cost'
                    
                    costingArray[0].amount = formatIndianPrice(totalCost.toFixed(2));


                    console.log(costingArray);
                }

                const product = {
                    name: response.data[0].name,
                    stock: stock,
                    price: response.data[0].price,
                    images: response.data[0].images || [],
                    costingDetails: costingArray,
                };

                setProduct(product);
                setIsLoading(false);

            } catch (error) {
                console.log(error);
                setIsLoading(true);
            }
        }

        fetchData();
    }, [sku]);



    // Handle the carousel image change
    const handleImageChange = (index) => {
        setCurrentImageIndex(index);
    };

    if (isLoading) {
        return (
            <div className='loader'>
                <Loader />
            </div>

        )
    }

    return (
        <div className="product-details">
            {/* Image Carousel using Material-UI Swipeable Views */}
            <div className="carousel-container">
                <SwipeableViews index={currentImageIndex} onChangeIndex={handleImageChange}>
                    {product.images && product.images.length > 0 ? (
                        product.images.map((image, index) => (
                            <div key={index} className="carousel-image">
                                <img src={image.src} alt={`Product Image ${index + 1}`} />
                            </div>
                        ))
                    ) : (
                        <Typography variant="body1">No images available for this product.</Typography>
                    )}
                </SwipeableViews>

                {/* Carousel controls */}
                <div className="carousel-controls">
                    <Button onClick={() => handleImageChange(currentImageIndex === 0 ? product.images.length - 1 : currentImageIndex - 1)} className="carousel-btn" variant="outlined">◀</Button>
                    <Button onClick={() => handleImageChange(currentImageIndex === product.images.length - 1 ? 0 : currentImageIndex + 1)} className="carousel-btn" variant="outlined">▶</Button>
                </div>
            </div>

            {/* Product Details */}
            <div className="product-info">
                <Typography variant="h4" className="title">{product.name}</Typography>
                <Typography variant="h4" className="title">{sku}</Typography>
                <Typography variant="h5" className="stock" style={{ color: product.stock > 10 ? "#ffcc00" : "Red" }}>Stock: {product.stock}</Typography>
                <Typography variant="h5" className="product-price">₹{formatIndianPrice(product.price)}</Typography>
            </div>

            {/* Costing Details */}
            <div className="costing-details">
                <div className="costing-header">
                    <Typography variant="h5">Costing Details</Typography>
                </div>

                {/* Only show total cost initially */}
                <Box className="costing-summary">
                    <Typography variant="h6">{product.costingDetails && product.costingDetails[0].label}</Typography>
                    <Typography variant="h6">₹{product.costingDetails && product.costingDetails[0].amount}</Typography>

                    {showDetails ? (
                        <FaArrowCircleUp onClick={() => setShowDetails(!showDetails)} className='arrow-toggle' />
                    ) : (
                        <FaChevronCircleDown onClick={() => setShowDetails(!showDetails)} className='arrow-toggle' />
                    )}

                    {/* Full Costing Details (Collapsing behavior) */}
                    <Collapse in={showDetails}>
                        <div className="costing-full-details">
                            {product.costingDetails && product.costingDetails.slice(1).map((cost, index) => (
                                <Box key={index} className="costing-item">
                                    <Typography variant="subtitle1">{cost.label}</Typography>
                                    <Typography variant="body1">₹{cost.amount}</Typography>
                                </Box>
                            ))}
                        </div>
                    </Collapse>
                </Box>
            </div>

            <Button className="edit-product-btn" variant="contained" onClick={() => navigate(`/edit-product/${sku}`)}>Edit Product</Button>
        </div>
    );
};

export default ProductDetail;
