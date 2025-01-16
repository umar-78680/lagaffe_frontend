import React, { use, useEffect, useState } from 'react';
import { Button, Box, Typography } from '@mui/material';
import './style.css';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Loader from '../Loader';

const api = axios.create({
    baseURL: "https://lagaffes.com/wp-json/wc/v3/",
    auth: {
        username: "ck_f789aaa539b67800d63b1c7e96d1a5956ffcef75",
        password: "cs_d94289340a3278ad5d8a85aab9eb84d4781b2d83",
    },
});


const EditProduct = () => {
    // State to manage form inputs
    const [importCharges, setImportCharges] = useState(0);
    const [packagingCost, setPackagingCost] = useState(0);
    const [stock, setStock] = useState(0);
    const [productCost, setProductCost] = useState(0);
    const [shoot, setShoot] = useState(0);
    const [misc, setMisc] = useState(0);
    const [gst, setGst] = useState(0);
    const [stocking, setStocking] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [isNewProduct, setIsNewProduct] = useState(true);

    const { sku } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        async function fetchData() {
            try {

                setIsLoading(true);
                const body = {
                    sku
                };

                const response = await axios.post("https://lagaffe-backend.onrender.com/product/product-details", body, {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                if (response.data.success) {
                    setProductCost(response.data.data.costing.cost);
                    setImportCharges(response.data.data.costing.import);
                    setPackagingCost(response.data.data.costing.packaging);
                    setShoot(response.data.data.costing.shoot);
                    setMisc(response.data.data.costing.misc);
                    setStock(response.data.data.stock);
                    setGst(response.data.data.costing.gst);
                    setStocking(response.data.data.costing.stocking);
                    setIsNewProduct(false);
                }
                else {
                    setIsNewProduct(true);
                }
                setIsLoading(false);
            } catch (error) {
                console.log(error);
                setIsLoading(true);
            }

        }
        fetchData();
    }, [sku])

    // Handle form submit (for saving data)
    async function handleSave() {
        setIsLoading(true);
        const obj = {
            sku: sku,
            stock: stock,
            costing: {
                cost: productCost,
                import: importCharges,
                shoot: shoot,
                packaging: packagingCost,
                misc: misc,
                gst: gst,
                stocking: stocking,
            }
        }


        if (isNewProduct) {
            try {
                const response = await axios.post("https://lagaffe-backend.onrender.com/product/add-product", obj, {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
                setIsLoading(false);

                navigate(`/product-details/${sku}`);
            } catch (error) {
                console.log(error);
                setIsLoading(true);
            }
        }
        else {
            try {
                const response = await axios.post("https://lagaffe-backend.onrender.com/product/edit-product", obj, {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
                setIsLoading(false);

                navigate(`/product-details/${sku}`);
            } catch (error) {
                console.log(error);
                setIsLoading(true);
            }
        }
    };

    if (isLoading) {
        <div className='loader'>
            <Loader />
        </div>
    }

    return (
        <div className="edit-product-container">
            <Typography variant="h4" className="edit-product-title">Edit {sku}</Typography>

            <form className="edit-product-form">

                <Box className="form-field">
                    <Typography variant="h6">Product Cost</Typography>
                    <input
                        value={productCost}
                        onChange={(e) => setProductCost(e.target.value)}
                        className="form-input"
                        type="number"
                        placeholder="Enter Product Cost"
                    />
                </Box>


                {/* Import Charges Input */}
                <Box className="form-field">
                    <Typography variant="h6">Import Charges</Typography>
                    <input
                        value={importCharges}
                        onChange={(e) => setImportCharges(e.target.value)}
                        className="form-input"
                        type="number"
                        placeholder="Enter Import Charges"
                    />
                </Box>

                <Box className="form-field">
                    <Typography variant="h6">Stocking</Typography>
                    <input
                        value={stocking}
                        onChange={(e) => setStocking(e.target.value)}
                        className="form-input"
                        type="number"
                        placeholder="Enter Stocking"
                    />
                </Box>

                <Box className="form-field">
                    <Typography variant="h6">Shoot Charges</Typography>
                    <input
                        value={shoot}
                        onChange={(e) => setShoot(e.target.value)}
                        className="form-input"
                        type="number"
                        placeholder="Enter Shoot Charges"
                    />
                </Box>

                <Box className="form-field">
                    <Typography variant="h6">GST Charges</Typography>
                    <input
                        value={gst}
                        onChange={(e) => setGst(e.target.value)}
                        className="form-input"
                        type="number"
                        placeholder="Enter GST Charges"
                    />
                </Box>

                <Box className="form-field">
                    <Typography variant="h6">Packaging Cost</Typography>
                    <input
                        value={packagingCost}
                        onChange={(e) => setPackagingCost(e.target.value)}
                        className="form-input"
                        type="number"
                        placeholder="Enter Packaging Cost"
                    />
                </Box>



                <Box className="form-field">
                    <Typography variant="h6">Misc Charges</Typography>
                    <input
                        value={misc}
                        onChange={(e) => setMisc(e.target.value)}
                        className="form-input"
                        type="number"
                        placeholder="Enter Misc Charges"
                    />
                </Box>

                {/* Stock Input */}
                <Box className="form-field">
                    <Typography variant="h6">Stock</Typography>
                    <input
                        value={stock}
                        onChange={(e) => setStock(e.target.value)}
                        className="form-input"
                        type="number"
                        placeholder="Enter Stock"
                    />
                </Box>

                {/* Save Button */}
                <Button
                    onClick={handleSave}
                    className="save-button"
                    variant="contained"
                    fullWidth
                >
                    Save Changes
                </Button>
            </form>
        </div>
    );
};

export default EditProduct;
