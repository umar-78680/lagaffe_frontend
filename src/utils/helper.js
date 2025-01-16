import axios from "axios";

const api = axios.create({
  baseURL: 'https://lagaffes.com/wp-json/wc/v3/',
  auth: {
    username: 'ck_f789aaa539b67800d63b1c7e96d1a5956ffcef75', // customer key
    password: 'cs_d94289340a3278ad5d8a85aab9eb84d4781b2d83' // secret key
  }
});


export function formatIndianPrice(price) {
  if (price === undefined || price === null) {
    return "Invalid Price"; // Return a placeholder or an empty string if the price is invalid
  }

  const priceStr = price.toString(); // Ensure it's a string
  const formattedPrice = priceStr.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return formattedPrice;
}


export const getDateRange = (dateType, customRange = {}) => {
  const now = new Date();
  let startDate, endDate;

  if (dateType === 'today') {
    startDate = new Date(now);
    endDate = new Date(now);
  } else if (dateType === 'last7') {
    startDate = new Date(now);
    startDate.setDate(now.getDate() - 6);
    endDate = new Date(now);
  } else if (dateType === 'thisMonth') {
    // Change: Start from the beginning of the current year
    startDate = new Date(Date.UTC(now.getFullYear(), 0, 1)); 
    endDate = new Date(now);
  } else if (dateType === 'lastMonth') {
    const prevMonth = now.getMonth() - 1;
    startDate = new Date(Date.UTC(now.getFullYear(), prevMonth, 1));
    endDate = new Date(Date.UTC(now.getFullYear(), prevMonth + 1, 0));
  } else if (dateType === 'custom') {
    console.log(customRange);
    startDate = new Date(customRange.startDate);
    endDate = new Date(customRange.endDate);
  }

  
  endDate.setHours(23, 59, 59, 999);
  return { startDate, endDate };
};



export const fetchOrdersByDate = async (startDate, endDate, status, value) => {
  let allOrders = [];
  let page = 1;
  const perPage = 100;

  try {
      let response;
      do {
          response = await api.get('orders', {
              params: {
                  status: status,
                  per_page: perPage,
                  page,
              },
          });

          const filteredPageOrders = response.data.filter(order => {
              const orderDate = new Date(order[value]);
              const orderDateOnly = orderDate.toISOString().split('T')[0];
              const startDateOnly = startDate.toISOString().split('T')[0];
              const endDateOnly = endDate.toISOString().split('T')[0];
              return orderDateOnly >= startDateOnly && orderDateOnly <= endDateOnly;
          });

          allOrders = [...allOrders, ...filteredPageOrders];
          page++;
      } while (response.data.length === perPage);

      return allOrders;
  } catch (error) {
      console.error('Error fetching orders:', error);
      throw error;
  }
};