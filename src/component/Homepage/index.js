// import React, { useEffect, useState } from 'react';
// import './style.css';
// import { fetchOrdersByDate, formatIndianPrice, getDateRange } from '../../utils/helper';
// import axios from 'axios';
// import Loader from '../Loader';
// import Navbar from '../Navbar';

// const Homepage = () => {
//   const [dateType, setDateType] = useState("last7");
//   const [customRange, setCustomRange] = useState({ startDate: '', endDate: '' });
//   const [isLoading, setIsLoading] = useState(false);
//   const [data, setData] = useState({});

//   const calculateGrossRevenue = async (orders) => {
//     let totalAmount = 0;

//     const promises = orders.map(async (order) => {
//       const id = `#${order.id}`;
//       const body = { orderId: id };

//       try {
//         const response = await axios.post("https://lagaffe-backend.onrender.com/order/find-order", body, {
//           headers: { 'Content-Type': 'application/json' },
//         });


//         if (response.data.success) {
//           return Number(response.data.data.totalAmount);
//         } else {
//           return Number(order.total);
//         }
//       } catch (error) {
//         console.error(`Error processing order ${id}:`, error);
//         return order.total;
//       }
//     });


//     const results = await Promise.all(promises);

//     totalAmount = results.reduce((acc, curr) => acc + curr, 0);

//     console.log("total", totalAmount);

//     return totalAmount;
//   };


//   const calculateUpcommingRevenue = async (orders) => {
//     let totalAmount = 0;

//     const promises = orders.map(async (order) => {
//       const id = `#${order.id}`;
//       const body = { orderId: id };

//       try {
//         const response = await axios.post("https://lagaffe-backend.onrender.com/order/find-order", body, {
//           headers: { 'Content-Type': 'application/json' },
//         });


//         if (response.data.success) {
//           return Number(response.data.data.totalAmount);
//         } else {
//           return Number(order.total);
//         }
//       } catch (error) {
//         console.error(`Error processing order ${id}:`, error);
//         return order.total;
//       }
//     });


//     const results = await Promise.all(promises);

//     totalAmount = results.reduce((acc, curr) => acc + curr, 0);

//     return totalAmount;
//   };

//   const findItem = async (item) => {
//     let deduction = 0;
//     const body = {
//       sku: item.sku
//     }
//     try {
//       const response = await axios.post("https://lagaffe-backend.onrender.com/product/product-details", body, {
//         headers: {
//           'Content-Type': 'application/json',
//         },
//       })
//       if (response.data.success) {
//         const obj = response.data.data.costing;

//         const keys = Object.keys(obj);

//         for (let i = 0; i < keys.length; i++) {
//           if (keys[i] !== "_id") {
//             deduction += obj[keys[i]];
//           }
//         }
//       }
//     } catch (error) {
//       console.log(error);
//     }
//     return deduction * item.quantity;
//   }

//   const findOrder = async (orderId) => {
//     let deduction = 0;
//     const body = {
//       orderId: orderId,
//     }
//     try {
//       const response = await axios.post("https://lagaffe-backend.onrender.com/order/find-order", body, {
//         headers: {
//           'Content-Type': 'application/json',
//         },
//       })
//       if (response.data.success) {
//         deduction += parseFloat(response.data.data.shippingAmount);

//         for (let i = 0; i < response.data.data.items.length; i++) {
//           const itemTotal = await findItem(response.data.data.items[i]);

//           deduction += parseFloat(itemTotal);
//         }
//       }
//     } catch (error) {
//       console.log(error);
//     }
//     return deduction;
//   }

//   const calculateGrossProfit = async (orders) => {
//     let netRevenue = 0;

//     for (const order of orders) {
//       const id = `#${order.id}`;
//       const body = { orderId: id };
//       let orderTotal = parseFloat(order.total) || 0; // Default to `order.total` initially
//       let deduction = 0;

//       try {
//         // API call to get the actual totalAmount if available
//         const response = await axios.post("https://lagaffe-backend.onrender.com/order/find-order", body, {
//           headers: { 'Content-Type': 'application/json' },
//         });

//         // Update `orderTotal` if response provides the value
//         if (response.data.success) {
//           orderTotal = response.data.data.totalAmount;
//         }
//       } catch (error) {
//         console.error(`Error fetching order data for ID ${id}:`, error);
//       }

//       // Calculate standard deductions based on payment method
//       if (order.payment_method === 'cod') {
//         const codDeduction = orderTotal * 0.01;
//         const gstOnCod = codDeduction * 0.18;
//         deduction = codDeduction + gstOnCod;
//       } else if (order.payment_method === 'razorpay') {
//         const prepaidDeduction = orderTotal * 0.02;
//         const gstOnPrepaid = prepaidDeduction * 0.18;
//         deduction = prepaidDeduction + gstOnPrepaid;
//       }

//       // Fetch additional deductions via `findOrder` (if applicable)
//       let anotherDeduction = 0;
//       try {
//         anotherDeduction = await findOrder(id);
//       } catch (error) {
//         console.error(`Error fetching additional deductions for ID ${id}:`, error);
//       }

//       // Adjust total with all deductions
//       const adjustedTotal = orderTotal - deduction - anotherDeduction;
//       netRevenue += adjustedTotal;
//     }

//     return netRevenue;
//   };


//   const calculateNetRevenue = async (orders) => {
//     return orders.reduce(async (netRevenuePromise, order) => {
//       const netRevenue = await netRevenuePromise;
//       const id = `#${order.id}`; // Generate ID
//       const body = { orderId: id };

//       try {
//         const response = await axios.post("https://lagaffe-backend.onrender.com/order/find-order", body, {
//           headers: { 'Content-Type': 'application/json' },
//         });

//         let orderTotal;

//         if (response.data.success) {
//           orderTotal = Number(response.data.data.totalAmount)
//         }
//         else {
//           orderTotal = order.total;
//         }
//         let deduction = 0;
//         if (order.payment_method === "cod") {
//           const codDeduction = orderTotal * 0.01;
//           const gstOnCod = codDeduction * 0.18;
//           deduction = codDeduction + gstOnCod;
//         } else if (order.payment_method === "razorpay") {
//           const prepaidDeduction = orderTotal * 0.02;
//           const gstOnPrepaid = prepaidDeduction * 0.18;
//           deduction = prepaidDeduction + gstOnPrepaid;
//         }

//         const adjustedTotal = orderTotal - deduction;
//         return netRevenue + adjustedTotal;

//       } catch (error) {
//         console.error(`Error processing order ${id}:`, error);
//         const fallbackOrderTotal = order.total || 0;
//         return netRevenue + fallbackOrderTotal;
//       }
//     }, Promise.resolve(0));
//   };


//   async function calculateNetProfit(grossProfit, startDate, endDate)
//   {
//     try {
//       const body = {startDate, endDate};
//       const response = await axios.post("https://lagaffe-backend.onrender.com/expense/all-expenses", body, {
//         headers: { 'Content-Type': 'application/json' },
//       });

//       if(response.data.success)
//       {
//         for(let i=0;i<response.data.data.length;i++)
//         {
//           grossProfit -= response.data.data[i].amount;
//         }
//       }
//     } catch (error) {
//       console.log(error);
//     }


//     try {
//       const body = {startDate, endDate};
//       const response = await axios.post("https://lagaffe-backend.onrender.com/abnormalLoss/all-losses-byDate", body, {
//         headers: { 'Content-Type': 'application/json' },
//       });

//       if(response.data.success)
//       {
//         for(let i=0;i<response.data.data.length;i++)
//         {
//           if(response.data.data[i].issueType === "return")
//           {
//             grossProfit -= response.data.data[i].returnDetails;
//           }
//           else
//           {
//             grossProfit -= response.data.data[i].weightDiscrepancy;
//           }
//         }
//       }
//     } catch (error) {
//       console.log(error);
//     }


//     return grossProfit;
//   }


//   const handleSubmit = async () => {
//     const { startDate, endDate } = getDateRange(dateType, customRange);

//     console.log(`Fetching orders from ${startDate.toISOString()} to ${endDate.toISOString()}`);

//     setIsLoading(true);
//     const [processingOrders, completedOrders] = await Promise.all([
//       fetchOrdersByDate(startDate, endDate, 'processing', "date_created"),
//       fetchOrdersByDate(startDate, endDate, 'completed', "date_created"),
//     ]);

//     console.log([...processingOrders, ...completedOrders]);

//     if (processingOrders.length === 0 && completedOrders.length === 0) {
//       alert('No orders found for the selected date range.');
//       const obj = {
//         grossRevenue: 0,
//         netRevenue: 0,
//         upcomingRevenue: 0,
//         grossProfit: 0,
//         netProfit: 0
//       }

//       setData(obj);
//       return;
//     }

//     let upcomingRevenue;
//     let grossProfit;
//     let netRevenue;
//     let netProfit;
//     if (processingOrders.length === 0) {
//       upcomingRevenue = 0;
//     }
//     else {
//       upcomingRevenue = await calculateUpcommingRevenue(processingOrders);
//     }

//     if (completedOrders.length === 0) {
//       grossProfit = 0;
//       netProfit = 0;
//       netRevenue = 0;
//     }
//     else {
//       grossProfit = await calculateGrossProfit(completedOrders);
//       netRevenue = await calculateNetRevenue(completedOrders);
//       netProfit = await calculateNetProfit(grossProfit, startDate, endDate);
//     }

//     const grossRevenue = await calculateGrossRevenue([...processingOrders, ...completedOrders]);

//     const obj = {
//       grossRevenue: formatIndianPrice(parseFloat(grossRevenue).toFixed(2)),
//       netRevenue: formatIndianPrice(parseFloat(netRevenue).toFixed(2)),
//       upcomingRevenue: formatIndianPrice(parseFloat(upcomingRevenue).toFixed(2)),
//       grossProfit: formatIndianPrice(parseFloat(grossProfit).toFixed(2)),
//       netProfit: formatIndianPrice(parseFloat(netProfit).toFixed(2)),
//     }

//     setData(obj);
//     setIsLoading(false);
//   };

//   useEffect(() => {

//     if (dateType !== "custom") {
//       handleSubmit();
//     }

//   }, [dateType])

//   if (isLoading) {
//     return (
//       <div className='loader'>
//         <Loader />
//       </div>

//     )
//   }
//   return (
//     <div className="homepage">
//       <main className="content">
//         <h1 className='title'>Dashboard</h1>
//         <div className="date-container">
//           <label htmlFor="date-range">Date Range:</label>
//           <select
//             id="date-range"
//             value={dateType}
//             onChange={(e) => setDateType(e.target.value)}
//           >
//             <option value="today">Today</option>
//             <option value="last7">Last 7 Days</option>
//             <option value="thisMonth">This Month</option>
//             <option value="lastMonth">Last Month</option>
//             <option value="custom">Custom Range</option>
//           </select>

//           {dateType === 'custom' && (
//             <div className="custom-range">
//               <label htmlFor="start-date">Start Date:</label>
//               <input
//                 type="date"
//                 id="start-date"
//                 value={customRange.startDate}
//                 onChange={(e) => setCustomRange({ ...customRange, startDate: e.target.value })}
//               />
//               <label htmlFor="end-date">End Date:</label>
//               <input
//                 type="date"
//                 id="end-date"
//                 value={customRange.endDate}
//                 onChange={(e) => setCustomRange({ ...customRange, endDate: e.target.value })}
//               />

//               <button className='custom-button' onClick={handleSubmit}>Apply</button>
//             </div>
//           )}
//         </div>

//         <div className="revenue-container">
//           <div className="card">
//             <div className="card-icon">Gross Revenue</div>
//             <div>₹{data.grossRevenue}</div>
//           </div>
//           <div className="card">
//             <div className="card-icon">Net Revenue</div>
//             <div>₹{data.netRevenue}</div>
//           </div>
//           <div className="card">
//             <div className="card-icon">Upcoming Revenue</div>
//             <div>₹{data.upcomingRevenue}</div>
//           </div>
//           <div className="card">
//             <div className="card-icon">Gross Profit</div>
//             <div>₹{data.grossProfit}</div>
//           </div>
//           <div className="card">
//             <div className="card-icon">Net Profit</div>
//             <div>₹{data.netProfit}</div>
//           </div>
//         </div>
//       </main>
//     </div>
//   );
// };

// export default Homepage;



import React, { useEffect, useState, useCallback } from 'react';
import './style.css';
import { fetchOrdersByDate, formatIndianPrice, getDateRange } from '../../utils/helper';
import axios from 'axios';
import Loader from '../Loader';
import Navbar from '../Navbar';

const Homepage = () => {
  const [dateType, setDateType] = useState("last7");
  const [customRange, setCustomRange] = useState({ startDate: '', endDate: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState({});

  const apiPost = useCallback(async (url, body) => {
    try {
      const response = await axios.post(url, body, {
        headers: { 'Content-Type': 'application/json' },
      });
      return response.data;
    } catch (error) {
      console.error(`Error in API call to ${url}:`, error);
      return { success: false };
    }
  }, []);

  const calculateValues = useCallback(async (orders, type) => {
    const promises = orders.map(async (order) => {
      const id = `#${order.id}`;
      const response = await apiPost("https://lagaffe-backend.onrender.com/order/find-order", { orderId: id });
      const totalAmount = response.success ? Number(response.data.totalAmount) : Number(order.total);

      if (type === 'grossRevenue' || type === 'upcomingRevenue') {
        return totalAmount;
      }

      let deduction = 0;
      if (order.payment_method === 'cod') {
        deduction = totalAmount * 0.01 * 1.18;
      } else if (order.payment_method === 'razorpay') {
        deduction = totalAmount * 0.02 * 1.18;
      }

      const netAmount = totalAmount - deduction;
      return type === 'netRevenue' ? netAmount : totalAmount - deduction - await findOrder(id);
    });

    const results = await Promise.all(promises);
    return results.reduce((acc, curr) => acc + curr, 0);
  }, [apiPost]);

  const findOrder = useCallback(async (orderId) => {
    const response = await apiPost("https://lagaffe-backend.onrender.com/order/find-order", { orderId });
    if (!response.success) return 0;

    let deduction = parseFloat(response.data.shippingAmount);
    const itemPromises = response.data.items.map(item => findItem(item));
    const itemDeductions = await Promise.all(itemPromises);
    return deduction + itemDeductions.reduce((acc, curr) => acc + curr, 0);
  }, [apiPost]);

  const findItem = useCallback(async (item) => {
    const response = await apiPost("https://lagaffe-backend.onrender.com/product/product-details", { sku: item.sku });
    if (!response.success) return 0;

    const deduction = Object.values(response.data.costing).reduce((acc, curr) => acc + (typeof curr === 'number' ? curr : 0), 0);
    return deduction * item.quantity;
  }, [apiPost]);

  const calculateNetProfit = useCallback(async (grossProfit, startDate, endDate) => {
    const expenseResponse = await apiPost("https://lagaffe-backend.onrender.com/expense/all-expenses", { startDate, endDate });
    const lossResponse = await apiPost("https://lagaffe-backend.onrender.com/abnormalLoss/all-losses-byDate", { startDate, endDate });

    if (expenseResponse.success) {
      grossProfit -= expenseResponse.data.reduce((acc, expense) => acc + expense.amount, 0);
    }

    if (lossResponse.success) {
      grossProfit -= lossResponse.data.reduce((acc, loss) => acc + (loss.issueType === "return" ? loss.returnDetails : loss.weightDiscrepancy), 0);
    }

    return grossProfit;
  }, [apiPost]);

  const handleSubmit = useCallback(async () => {
    const { startDate, endDate } = getDateRange(dateType, customRange);
    setIsLoading(true);

    const [processingOrders, completedOrders] = await Promise.all([
      fetchOrdersByDate(startDate, endDate, 'processing', "date_created"),
      fetchOrdersByDate(startDate, endDate, 'completed', "date_created"),
    ]);

    if (!processingOrders.length && !completedOrders.length) {
      alert('No orders found for the selected date range.');
      setData({ grossRevenue: 0, netRevenue: 0, upcomingRevenue: 0, grossProfit: 0, netProfit: 0 });
      setIsLoading(false);
      return;
    }

    const [grossRevenue, upcomingRevenue, grossProfit, netRevenue, netProfit] = await Promise.all([
      calculateValues([...processingOrders, ...completedOrders], 'grossRevenue'),
      calculateValues(processingOrders, 'upcomingRevenue'),
      calculateValues(completedOrders, 'grossProfit'),
      calculateValues(completedOrders, 'netRevenue'),
      calculateNetProfit(await calculateValues(completedOrders, 'grossProfit'), startDate, endDate)
    ]);

    setData({
      grossRevenue: formatIndianPrice(grossRevenue.toFixed(2)),
      netRevenue: formatIndianPrice(netRevenue.toFixed(2)),
      upcomingRevenue: formatIndianPrice(upcomingRevenue.toFixed(2)),
      grossProfit: formatIndianPrice(grossProfit.toFixed(2)),
      netProfit: formatIndianPrice(netProfit.toFixed(2)),
    });
    setIsLoading(false);
  }, [dateType, customRange, calculateValues, calculateNetProfit]);

  useEffect(() => {
    if (dateType !== "custom") {
      handleSubmit();
    }
  }, [dateType, handleSubmit]);

  if (isLoading) {
    return <div className='loader'><Loader /></div>;
  }

  return (
    <div className="homepage">
      <main className="content">
        <h1 className='title'>Dashboard</h1>
        <div className="date-container">
          <label htmlFor="date-range">Date Range:</label>
          <select id="date-range" value={dateType} onChange={(e) => setDateType(e.target.value)}>
            <option value="today">Today</option>
            <option value="last7">Last 7 Days</option>
            <option value="thisMonth">This Month</option>
            <option value="lastMonth">Last Month</option>
            <option value="custom">Custom Range</option>
          </select>

          {dateType === 'custom' && (
            <div className="custom-range">
              <label htmlFor="start-date">Start Date:</label>
              <input type="date" id="start-date" value={customRange.startDate} onChange={(e) => setCustomRange({ ...customRange, startDate: e.target.value })} />
              <label htmlFor="end-date">End Date:</label>
              <input type="date" id="end-date" value={customRange.endDate} onChange={(e) => setCustomRange({ ...customRange, endDate: e.target.value })} />
              <button className='custom-button' onClick={handleSubmit}>Apply</button>
            </div>
          )}
        </div>

        <div className="revenue-container">
          {['grossRevenue', 'netRevenue', 'upcomingRevenue', 'grossProfit', 'netProfit'].map((key) => (
            <div className="card" key={key}>
              <div className="card-icon">{key.replace(/([A-Z])/g, ' $1')}</div>
              <div>₹{data[key]}</div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Homepage;

