import React, { useEffect, useState } from "react";
import axios from "axios";
import AllRequest from "../All/AllRequest";

function EmployeeMyRegularization({ employeeId, refreshKey }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // 🔹 Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const res = await axios.get(
          ` https://api-nodelinux-be-b8cpf8cbe8f4f5b0.centralus-01.azurewebsites.net/attendance/regularization/my/${employeeId}`
        );
        // ✅ Sort newest first (based on createdAt or request date)
        const sortedData = res.data.sort(
          (a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date)
        );

        setRequests(sortedData);
        console

        //setRequests(res.data);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch regularization requests.");
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [employeeId, refreshKey]);




  const formatToIST = (utcDateString) => {
  const date = new Date(utcDateString);
  return date.toLocaleTimeString("en-IN", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};


  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this request?")) return;

    try {
      await axios.delete(` https://api-nodelinux-be-b8cpf8cbe8f4f5b0.centralus-01.azurewebsites.net/attendance/regularization/${id}`);
      setRequests(requests.filter((req) => req._id !== id));
    } catch (err) {
      console.error("Delete failed", err);
      alert("Failed to delete request.");
    }
  };


  // 🔹 Filter only valid regularizations
  const filteredRequests = requests.filter(
    (req) => req.regularizationRequest && req.regularizationRequest.status !== null
  );

  // 🔹 Pagination logic
  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
  const indexOfLastItem = Math.min(currentPage * itemsPerPage, filteredRequests.length);
  const indexOfFirstItem = (currentPage - 1) * itemsPerPage;
  const currentRequests = filteredRequests.slice(indexOfFirstItem, indexOfLastItem);

  // Prevent invalid page after filtering
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const handlePageChange = (pageNumber) => {
    if (pageNumber < 1 || pageNumber > totalPages) return;
    setCurrentPage(pageNumber);
  };

  console.log("currentRequests",currentRequests)
  // if (loading) return <p>Loading...</p>;

  if (loading) {
    return (
      <div
        className="d-flex flex-column justify-content-center align-items-center mt-5"
        // style={{ minHeight: "100vh" }}
        style={{
          height: "100vh", // Changed from minHeight to height
          width: "100%",
          position: "absolute",
          top: 0,
          left: 0
        }}
      >
        <div
          className="spinner-grow"
          role="status"
          style={{ width: "4rem", height: "4rem", color: "#3A5FBE" }}
        >
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3 fw-semibold" style={{ color: "#3A5FBE" }}>
          Loading ...
        </p>
      </div>
    );
  }

  if (error) return <p className="text-danger">{error}</p>;
  if (filteredRequests.length === 0) return <p>No regularization requests found.</p>;

  return (
    <div className="card shadow-sm border-0">
      <div className="table-responsive">
        <table className="table table-hover mb-0">
          <thead className="table-light">
            <tr>
              <th style={{ fontWeight: '500', fontSize: '14px', color: '#6c757d', borderBottom: '2px solid #dee2e6', padding: '12px', whiteSpace: 'nowrap' }}>Date</th>
              <th style={{ fontWeight: '500', fontSize: '14px', color: '#6c757d', borderBottom: '2px solid #dee2e6', padding: '12px', whiteSpace: 'nowrap' }}>Check-In</th>
              <th style={{ fontWeight: '500', fontSize: '14px', color: '#6c757d', borderBottom: '2px solid #dee2e6', padding: '12px', whiteSpace: 'nowrap' }}>Check-Out</th>
              <th style={{ fontWeight: '500', fontSize: '14px', color: '#6c757d', borderBottom: '2px solid #dee2e6', padding: '12px', whiteSpace: 'nowrap' }}>Mode</th>
              <th style={{ fontWeight: '500', fontSize: '14px', color: '#6c757d', borderBottom: '2px solid #dee2e6', padding: '12px', whiteSpace: 'nowrap' }}>Status</th>
              <th style={{ fontWeight: '500', fontSize: '14px', color: '#6c757d', borderBottom: '2px solid #dee2e6', padding: '12px', whiteSpace: 'nowrap' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {currentRequests.map((req, index) => {
              const checkInTime = req.checkIn || req?.regularizationRequest?.checkIn;
              const checkOutTime = req.checkOut || req?.regularizationRequest?.checkOut;

              return (
                <tr key={index}>
                  <td style={{ padding: '12px', verticalAlign: 'middle', fontSize: '14px', borderBottom: '1px solid #dee2e6', whiteSpace: 'nowrap' }}>
                    {new Date(req.date).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td style={{ padding: '12px', verticalAlign: 'middle', fontSize: '14px', borderBottom: '1px solid #dee2e6', whiteSpace: 'nowrap' }}>{formatToIST(checkInTime)}</td>
                  <td style={{ padding: '12px', verticalAlign: 'middle', fontSize: '14px', borderBottom: '1px solid #dee2e6', whiteSpace: 'nowrap' }}>{formatToIST(checkOutTime)}</td>
                  <td style={{ padding: '12px', verticalAlign: 'middle', fontSize: '14px', borderBottom: '1px solid #dee2e6', whiteSpace: 'nowrap' }}>{req.mode}</td>
                  <td style={{ padding: '12px', verticalAlign: 'middle', fontSize: '14px', borderBottom: '1px solid #dee2e6', whiteSpace: 'nowrap' }}>
                    {req?.regularizationRequest?.status === "Approved" ? (
                      <span style={{ backgroundColor: '#d1f2dd', padding: '8px 16px', borderRadius: '4px', fontSize: '13px', fontWeight: '500', display: 'inline-block', width: "100px", textAlign: "center" }}>
                        Approved
                      </span>
                    ) : req?.regularizationRequest?.status === "Rejected" ? (
                      <span style={{ backgroundColor: '#f8d7da', padding: '8px 16px', borderRadius: '4px', fontSize: '13px', fontWeight: '500', display: 'inline-block', width: "100px", textAlign: "center" }}>
                        Rejected
                      </span>
                    ) : req?.regularizationRequest?.status === "Pending" ? (
                      <span style={{ backgroundColor: '#FFE493', padding: '8px 16px', borderRadius: '4px', fontSize: '13px', fontWeight: '500', display: 'inline-block', width: "100px", textAlign: "center" }}>
                        Pending
                      </span>
                    ) : (
                      <span className="badge bg-secondary-subtle text-dark px-3 py-2">
                        N/A
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '12px', verticalAlign: 'middle', fontSize: '14px', borderBottom: '1px solid #dee2e6', whiteSpace: 'nowrap' }}>
                    <button
                      className="btn btn-sm"
                      style={{
                        backgroundColor: "#3A5FBE",
                        color: "white",
                        borderColor: "#3A5FBE",
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(req._id);
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* 🔹 Pagination Controls */}
      <nav className="d-flex align-items-center justify-content-end mt-3 text-muted">
        <div className="d-flex align-items-center gap-3">
          {/* Rows per page */}
          <div className="d-flex align-items-center">
            <span style={{ fontSize: "14px", marginRight: "8px" }}>Rows per page:</span>
            <select
              className="form-select form-select-sm"
              style={{ width: "auto", fontSize: "14px" }}
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
            </select>
          </div>

          {/* Range display */}
          <span style={{ fontSize: "14px", marginLeft: "16px" }}>
            {indexOfFirstItem + 1}-{indexOfLastItem} of {filteredRequests.length}
          </span>

          {/* Arrows */}
          <div className="d-flex align-items-center" style={{ marginLeft: "16px" }}>
            <button
              className="btn btn-sm border-0"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              style={{ fontSize: "18px", padding: "2px 8px" }}
            >
              ‹
            </button>
            <button
              className="btn btn-sm border-0"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              style={{ fontSize: "18px", padding: "2px 8px" }}
            >
              ›
            </button>
          </div>
        </div>
      </nav>
      <div
        className="text-end"
        style={{

          marginRight: "10px"
        }}
      >
        <button
          className="btn btn-primary mb-2"
          style={{ backgroundColor: "#3A5FBE", borderColor: "#3A5FBE" }}
          onClick={() => window.history.go(-1)}
        >
          Back
        </button>
      </div>
    </div>
  );
}

export default EmployeeMyRegularization;
