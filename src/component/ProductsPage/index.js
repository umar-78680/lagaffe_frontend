import React, { useEffect, useState } from "react";
import axios from "axios";
import "./style.css"; // Make sure to create and include this CSS file
import Loader from "../Loader"; // Import your custom Loader component
import { formatIndianPrice } from "../../utils/helper.js"; // Utility for price formatting
import { NavLink, useNavigate } from "react-router-dom";
import Pagination from "../Pagination/index.js";


const api = axios.create({
  baseURL: "https://lagaffes.com/wp-json/wc/v3/", // Base URL of WooCommerce API
  auth: {
    username: "ck_f789aaa539b67800d63b1c7e96d1a5956ffcef75", // Replace with your WooCommerce Consumer Key
    password: "cs_d94289340a3278ad5d8a85aab9eb84d4781b2d83", // Replace with your WooCommerce Consumer Secret
  },
});

const ProductsPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true); // Show loader when fetching data
      try {
        const response = await api.get("products", {
          params: {
            per_page: 10, // Number of products per page
            page: page, // Current page
          },
        });

        const totalProducts = response.headers['x-wp-total'];

        setTotalPages(Math.ceil(totalProducts / 10));

        const data = response.data;

        const dataArray = data.map((product) => ({
          name: product.name,
          sku: product.sku,
          price: product.price,
          image: product.images,
        }));

        setProducts(dataArray);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setIsLoading(false); // Hide loader after data fetch
      }
    };

    fetchData();
  }, [page]);

  useEffect(() => {
    const performSearch = async () => {
      if (searchTerm) {
        const matchedProducts = products.filter(
          (product) =>
            product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.sku.toLowerCase().includes(searchTerm.toLowerCase())
        );

        if (matchedProducts.length === 0) {
          try {
            setIsLoading(true);

            if (searchTerm.length >= 4) {

              try {
                const response = await api.get("products", {
                  params: { sku: `LG${searchTerm}` },
                });
                const data = response.data;

                if (data.length > 0) {
                  setFilteredProducts([
                    {
                      name: data[0].name,
                      sku: data[0].sku,
                      price: data[0].price,
                      image: data[0].images,
                    },
                  ]);
                }
              } catch (error) {
                console.log(error);
              }


            } else {
              setFilteredProducts([]); // No products found
            }
          } catch (error) {
            console.error("Error during search:", error);
            setFilteredProducts([]);
          } finally {
            setIsLoading(false); // Hide loader after search
          }
        } else {
          setFilteredProducts(matchedProducts);
        }
      } else {
        setFilteredProducts(products); // Show all products if no search term
      }
    };

    performSearch();
  }, [searchTerm, products]);


  function pageChange(value) {
    setPage(value);
  }


  return (
    <div className="product-page">
      <h1 className="title">Our Products</h1>
      <input
        type="text"
        className="search-bar"
        placeholder="Search by Name or SKU..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {
        isLoading ? (
          <Loader />
        ) : (
          <>
            <div className="product-grid">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product, i) => (
                  <NavLink to={`/product-details/${product.sku}`}>
                    <div
                      className="product-card"
                      key={i}
                    >
                      <img
                        src={product.image[0]?.src || "/placeholder-image.jpg"}
                        alt={product.name}
                        className="product-image"
                      />
                      <div className="product-info">
                        <h2 className="product-name">{product.name}</h2>
                        <p className="product-sku">SKU: {product.sku}</p>
                        <p className="product-price">
                          ₹{formatIndianPrice(product.price)}
                        </p>
                      </div>
                    </div>
                  </NavLink>

                ))
              ) : (
                <h1 className="no-item">No Product Found!</h1>
              )}
            </div>
            <div className="pagination-container">
              <Pagination page={page} totalPages={totalPages} pageChange={pageChange} />
            </div>


          </>
        )
      }




    </div>
  );
};

export default ProductsPage;
