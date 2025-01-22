import React, { useEffect, useState } from "react";
import { FaEdit, FaSearch } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import "./style.css";
import axios from "axios";
import { formatIndianPrice } from "../../utils/helper";
import PaginationComponent from "../Pagination";
import Loader from "../Loader";


const AbnormalLossPage = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [newLossModal, setNewLossModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [reload, setReload] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPage, setTotalPage] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const [lossDetails, setLossDetails] = useState({
    orderId: "",
    issueType: "return",
    details: "",
    dateReported: "",
  });

  const [lossesDetails, setLossesDetails] = useState([]);


  const handleEditClick = (loss) => {

    const obj = {
      orderId: loss.orderId,
      issueType: loss.issueType === "Return" ? "return" : "weight Discrepancy",
      details: loss.details,
      dateReported: loss.dateReported,
    }

    setLossDetails(obj);
    setModalOpen(true);
  };

  const handleAddNewClick = () => {
    setLossDetails({ orderId: "", issueType: "return", details: "", dateReported: new Date().toISOString().slice(0, 10) });
    setNewLossModal(true);
  };

  const handleSave = async () => {
    // Save functionality will go here
    setModalOpen(false);
    setIsLoading(true);
    try {
      if (lossDetails.issueType === "return") {
        const body = {
          orderId: lossDetails.orderId,
          returnDetails: lossDetails.details,
        }
        await axios.post("https://lagaffe-backend.onrender.com/abnormalLoss/edit-return", body, {
          headers: {
            'Content-Type': 'application/json',
          },
        })
      }
      else {
        const body = {
          orderId: lossDetails.orderId,
          weightDiscrepancy: lossDetails.details,
        }

        await axios.post("https://lagaffe-backend.onrender.com/abnormalLoss/edit-weight-discrepancy", body, {
          headers: {
            'Content-Type': 'application/json',
          },
        })
      }

      setIsLoading(false);
      setReload(!reload);
    } catch (error) {
      console.log(error);
      setIsLoading(true);
    }
  };

  const handleNewSave = async () => {
    if (!lossDetails.orderId || !lossDetails.details) {
      alert("Fill all feild!");
      return;
    }
    setIsLoading(true);
    try {
      const body = {
        orderId: lossDetails.orderId,
        issueType: lossDetails.issueType === "return" ? "return" : "weight_discrepancy",
        dateReported: lossDetails.dateReported,
      }
      if (lossDetails.issueType === "return") {
        body.returnDetails = Number(lossDetails.details);
      }
      else {
        body.weightDiscrepancy = Number(lossDetails.details);
      }

      console.log(body)
      const response = await axios.post("https://lagaffe-backend.onrender.com/abnormalLoss/add-abnormal-loss", body, {
        headers: {
          'Content-Type': 'application/json',
        },
      })

      console.log(response.data);
      if (!response.data.success) {
        alert(response.data.message);
      }
      setReload(!reload);
      setIsLoading(false);
    } catch (error) {
      console.log(error);
      setIsLoading(true);
    }
    setNewLossModal(false);
  };

  const closeModal = () => {
    setModalOpen(false);
    setNewLossModal(false);
  };


  const handleDelete = async (orderId) => {
    try {
      await axios.post("https://lagaffe-backend.onrender.com/abnormalLoss/delete", { orderId }, {
        headers: {
          'Content-Type': 'application/json',
        },
      })
      setReload(!reload);
    } catch (error) {
      console.log(error);
    }
  }

  function pageChange(value) {
    setPage(value);
  }

  useEffect(() => {
    async function fetDetails() {
      const SKIP = (page - 1) * 10;
      setIsLoading(true);
      try {
        let response;
        if (selectedFilter === "all") {
          response = await axios.get(`https://lagaffe-backend.onrender.com/abnormalLoss/all-losses?skip=${SKIP}`, {
            headers: {
              'Content-Type': 'application/json',
            },
          })

        }
        else if (selectedFilter === "return") {
          response = await axios.get(`https://lagaffe-backend.onrender.com/abnormalLoss/returns?skip=${SKIP}`, {
            headers: {
              'Content-Type': 'application/json',
            },
          })
        }
        else if (selectedFilter === "weight Discrepancy") {
          response = await axios.get(`https://lagaffe-backend.onrender.com/abnormalLoss/weight-discrepancy?skip=${SKIP}`, {
            headers: {
              'Content-Type': 'application/json',
            },
          })
        }
        if (response.data.success) {
          setTotalPage(Math.ceil(response.data.total / 10));
          console.log("total", response.data.total);
          const dataArray = response.data.data.map((item) => {
            const obj = {
              orderId: item.orderId,
              issueType: item.issueType === "return" ? "Return" : "Weight Discrepancy",
              details: item.issueType === "return" ? item.returnDetails : item.weightDiscrepancy,
              dateReported: item.dateReported.substring(0, 10),
            }
            return obj;
          })
          setLossesDetails(dataArray);
          setTotalPage(Math.ceil(response.data.total / 10));
        }
        else {
          setLossesDetails([]);
        }
        setIsLoading(false);
      } catch (error) {
        console.log(error);
        setIsLoading(true);
      }
    }

    fetDetails();
  }, [page, selectedFilter, reload])

  const filteredLosses = lossesDetails.filter(
    (loss) => loss.orderId.toLowerCase().includes(searchQuery.toLowerCase())
  ).sort((a,b) => new Date(b.dateReported) - new Date(a.dateReported));

  return (
    <div className="abnormal-loss-page">
      <h1 className="title">Abnormal Losses</h1>

      <div className="filter-container">
        <div className="dropdown-container">
          <label htmlFor="filter-select" style={{ color: "#fff", marginRight: "10px" }}>
            Filter By:
          </label>
          <select
            id="filter-select"
            className="filter-dropdown"
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value)}
          >
            <option value="all">All</option>
            <option value="return">Return</option>
            <option value="weight Discrepancy">Weight Discrepancy</option>
          </select>
        </div>

        <div className="search-filter-container">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search by Order ID"
            className="search-input-feild"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {
        isLoading ? <Loader /> : <button className="add-button" onClick={handleAddNewClick}>
          + Add New Loss
        </button>
      }

      {
        !isLoading && <div className="losses-list">
        {filteredLosses.length > 0 ? (
          filteredLosses.map((loss, index) => (
            <div className="loss-item" key={index}>
              <span>{loss.orderId}</span>
              <span>{loss.issueType}</span>
              <span>₹{formatIndianPrice(loss.details)}</span>
              <span>{loss.dateReported}</span>
              <FaEdit className="edit-icon" onClick={() => handleEditClick(loss)} />
              <MdDelete className="delete-icon" onClick={() => handleDelete(loss.orderId)} />
            </div>
          ))
        ) : (
          <p>No records found.</p>
        )}
      </div>
      }


      

      {/* Edit Modal */}
      {modalOpen && (
        <div className="modal">
          <div className="modal-content">
            <span className="close-btn" onClick={closeModal}>&times;</span>
            <h3>Edit Loss</h3>
            <label>Order ID</label>
            <input
              type="text"
              value={lossDetails.orderId}
              onChange={(e) => setLossDetails({ ...lossDetails, orderId: e.target.value })}
              disabled="true"
            />
            <label>Issue Type</label>
            <select
              value={lossDetails.issueType}
              onChange={(e) => setLossDetails({ ...lossDetails, issueType: e.target.value })}
              disabled="true"
            >
              <option value="return">Return</option>
              <option value="weight Discrepancy">Weight Discrepancy</option>
            </select>
            <label>
              {lossDetails.issueType === "return" ? "Return Details" : "Weight Discrepancy Details"}
            </label>
            <input
              type="number"
              value={lossDetails.details}
              onChange={(e) => setLossDetails({ ...lossDetails, details: e.target.value })}
              placeholder="Enter Amount"
            />
            <label>Date</label>
            <input
              type="date"
              value={lossDetails.dateReported}
              onChange={(e) => setLossDetails({ ...lossDetails, dateReported: e.target.value })}
              disabled="true"
            />
            <button className="save-btn" onClick={handleSave}>
              Save
            </button>
          </div>
        </div>
      )}

      {/* Add New Loss Modal */}
      {newLossModal && (
        <div className="modal">
          <div className="modal-content">
            <span className="close-btn" onClick={closeModal}>&times;</span>
            <h3>Add New Abnormal Loss</h3>
            <label>Order ID</label>
            <input
              type="text"
              value={lossDetails.orderId || '#'}
              onChange={(e) => setLossDetails({ ...lossDetails, orderId: e.target.value })}
            />
            <label>Issue Type</label>
            <select
              value={lossDetails.issueType}
              onChange={(e) => setLossDetails({ ...lossDetails, issueType: e.target.value })}
            >
              <option value="return">Return</option>
              <option value="weight Discrepancy">Weight Discrepancy</option>
            </select>
            <label>
              {lossDetails.issueType === "return" ? "Return Amount" : "Weight Discrepancy Amount"}
            </label>
            <input
              type="number"
              value={lossDetails.details}
              onChange={(e) => setLossDetails({ ...lossDetails, details: e.target.value })}
              placeholder="Enter amount"
            />
            <label>Date</label>
            <input
              type="date"
              value={lossDetails.dateReported}
              onChange={(e) => setLossDetails({ ...lossDetails, dateReported: e.target.value })}
            />
            <button className="save-btn" onClick={handleNewSave}>
              Save
            </button>
          </div>
        </div>
      )}


      <div className="pagination-container">
        <PaginationComponent page={page} totalPages={totalPage} pageChange={pageChange} />
      </div>


    </div>
  );
};

export default AbnormalLossPage;
