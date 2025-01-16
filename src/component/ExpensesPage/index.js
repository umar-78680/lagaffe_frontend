import React, { useEffect, useState } from "react";
import { FaEdit } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { formatIndianPrice } from "../../utils/helper";
import "./style.css";
import axios from "axios";

const ExpensesPage = () => {
  const [filter, setFilter] = useState("thisMonth");
  const [expenses, setExpenses] = useState([]);
  const [editExpense, setEditExpense] = useState(null);
  const [newExpense, setNewExpense] = useState({ title: "", amount: "", dateReported: "" });
  const [modalOpen, setModalOpen] = useState(false);
  const [newExpenseModal, setNewExpenseModal] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPage, setTotalPage] = useState(0);
  const [reload, setReload] = useState(false);

  const calculateDateRange = (filter) => {
    let start, end;

    switch (filter) {
      case "thisMonth": {
        const now = new Date();
        start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0, 0)); // Start of the month in UTC
        end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0, 23, 59, 59, 999)); // End of the month in UTC
        break;
      }
      case "lastMonth": {
        const now = new Date();
        start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1, 0, 0, 0, 0)); // Start of last month in UTC
        end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 0, 23, 59, 59, 999)); // End of last month in UTC
        break;
      }
      case "thisYear": {
        const now = new Date();
        start = new Date(Date.UTC(now.getUTCFullYear(), 0, 1, 0, 0, 0, 0)); // Start of the year in UTC
        end = new Date(Date.UTC(now.getUTCFullYear(), 11, 31, 23, 59, 59, 999)); // End of the year in UTC
        break;
      }
      case "lastYear": {
        const now = new Date();
        start = new Date(Date.UTC(now.getUTCFullYear() - 1, 0, 1, 0, 0, 0, 0)); // Start of last year in UTC
        end = new Date(Date.UTC(now.getUTCFullYear() - 1, 11, 31, 23, 59, 59, 999)); // End of last year in UTC
        break;
      }
      default:
        return [null, null];
    }

    // Return the dates in ISO 8601 format
    return [start.toISOString(), end.toISOString()];
  };


  const handleEdit = async (id, title, amount) => {
    const obj = { id, title, amount };
    setEditExpense(obj);
    setModalOpen(true);

  };

  const handleSaveEdit = async () => {
    try {
      await axios.post("https://lagaffe-backend.onrender.com/expense/edit-expense", { id: editExpense.id, title: editExpense.title, amount: editExpense.amount }, {
        headers: {
          'Content-Type': 'application/json',
        },
      })
    } catch (error) {
      console.log(error);
    }

    setModalOpen(false);
    setReload(!reload);
    setEditExpense(null);
  };

  const handleAddExpense = async () => {

    if (!newExpense.title || !newExpense.amount || !newExpense.dateReported) {
      alert("Please fill all fields!");
      return;
    }
    const date = new Date(newExpense.dateReported);
    const dateWithTime = new Date(date.setHours(new Date().getHours(), new Date().getMinutes(), new Date().getSeconds()));

    const body = {
      title: newExpense.title,
      amount: newExpense.amount,
      dateReported: dateWithTime.toISOString(),
    }

    try {
      await axios.post("https://lagaffe-backend.onrender.com/expense/add-expense", body, {
        headers: {
          'Content-Type': 'application/json',
        },
      })
    } catch (error) {
      console.log(error);
    }

    setNewExpense({ title: "", amount: "", dateReported: "" });
    setReload(!reload);
    setNewExpenseModal(false);
  };

  const handleDelete = async (id) => {

    try {
      await axios.post("https://lagaffe-backend.onrender.com/expense/delete-expense", { id }, {
        headers: {
          'Content-Type': 'application/json',
        },
      })
    } catch (error) {
      console.log(error);
    }

    setReload(!reload);
  };

  const closeModal = () => {
    setModalOpen(false);
    setNewExpenseModal(false);
  };

  useEffect(() => {
    async function fetchDetails() {
      const [start, end] = calculateDateRange(filter);
      try {
        const body = {
          startDate: start,
          endDate: end
        }

        const response = await axios.post("https://lagaffe-backend.onrender.com/expense/all-expenses?skip=0", body, {
          headers: {
            'Content-Type': 'application/json',
          },
        })

        if (response.data.success) {
          setExpenses(response.data.data);
        }
        else {
          setExpenses([]);
        }

      } catch (error) {
        console.log(error);
      }
    }
    fetchDetails();
  }, [filter, page, totalPage, reload])

  return (
    <div className="expenses-page">
      <h1 className="title">Expenses</h1>

      <div className="filter-container">
        <select
          className="filter-dropdown"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="thisMonth">This Month</option>
          <option value="lastMonth">Last Month</option>
          <option value="thisYear">This Year</option>
          <option value="lastYear">Last Year</option>
        </select>
      </div>

      <button className="add-button" onClick={() => setNewExpenseModal(true)}>
        + Add New Expense
      </button>

      <div className="expenses-list">
        {expenses.length > 0 ? (
          expenses.map((expense, i) => (
            <div className="expense-item" key={i}>
              <span>{expense.title}</span>
              <span>₹{formatIndianPrice(expense.amount)}</span>
              <span>{expense.dateReported.substring(0, 10)}</span>
              <FaEdit className="edit-icon" onClick={() => handleEdit(expense._id, expense.title, expense.amount)} />
              <MdDelete className="delete-icon" onClick={() => handleDelete(expense._id)} />
            </div>
          ))
        ) : (
          <p>No expenses found.</p>
        )}
      </div>

      {/* Edit Modal */}
      {modalOpen && (
        <div className="modal">
          <div className="modal-content">
            <span className="close-btn" onClick={closeModal}>&times;</span>
            <h3>Edit Expense</h3>
            <label>Title</label>
            <input
              type="text"
              value={editExpense.title}
              onChange={(e) => setEditExpense({ ...editExpense, title: e.target.value })}
            />
            <label>Amount</label>
            <input
              type="number"
              value={editExpense.amount}
              onChange={(e) => setEditExpense({ ...editExpense, amount: e.target.value })}
            />
            <button className="save-btn" onClick={handleSaveEdit}>
              Save
            </button>
          </div>
        </div>
      )}

      {/* Add New Expense Modal */}
      {newExpenseModal && (
        <div className="modal">
          <div className="modal-content">
            <span className="close-btn" onClick={closeModal}>&times;</span>
            <h3>Add New Expense</h3>
            <label>Title</label>
            <input
              type="text"
              value={newExpense.title}
              onChange={(e) => setNewExpense({ ...newExpense, title: e.target.value })}
            />
            <label>Amount</label>
            <input
              type="number"
              value={newExpense.amount}
              onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
            />
            <label>Date</label>
            <input
              type="date"
              value={newExpense.dateReported}
              onChange={(e) => setNewExpense({ ...newExpense, dateReported: e.target.value })}
            />
            <button className="save-btn" onClick={handleAddExpense}>
              Save
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpensesPage;




// this month
// const startOfMonth = new Date();
// startOfMonth.setDate(1);
// startOfMonth.setHours(0, 0, 0, 0);
// const endOfMonth = new Date(startOfMonth);
// endOfMonth.setMonth(endOfMonth.getMonth() + 1);
// endOfMonth.setMilliseconds(-1);


// last Month
// const now = new Date();
// const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0, 0);
// const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

// This Year
// const now = new Date();
// const startOfYear = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);
// const endOfYear = new Date(now.getFullYear() + 1, 0, 0, 23, 59, 59, 999);

// last Year
// const now = new Date();
// const startOfLastYear = new Date(now.getFullYear() - 1, 0, 1, 0, 0, 0, 0);
// const endOfLastYear = new Date(now.getFullYear(), 0, 0, 23, 59, 59, 999);