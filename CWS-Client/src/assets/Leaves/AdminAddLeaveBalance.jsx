import React, { useState, useEffect } from "react";
import axios from "axios";

function AdminAddLeaveBalance() {
  const [user, setUser] = useState(null);
  const [sl, setSl] = useState(0);
  const [cl, setCl] = useState(0);
  const [message, setMessage] = useState("");
  const [leaves, setLeaves] = useState([]);
  const [loadingLeaves, setLoadingLeaves] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [pendingRequests, setPendingRequests] = useState(0);

  // 🔹 Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  // 🔹 Fetch logged-in admin user
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;

    axios
      .get(" https://api-nodelinux-be-b8cpf8cbe8f4f5b0.centralus-01.azurewebsites.net/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setUser(res.data))
      .catch((err) => console.error("User fetch error:", err));
  }, []);

  // 🔹 Fetch all leaves
  useEffect(() => {
    axios
      .get(" https://api-nodelinux-be-b8cpf8cbe8f4f5b0.centralus-01.azurewebsites.net/leaves")
      .then((res) => {
        setLeaves(res.data);
        const pending = res.data.filter((l) => l.status === "pending").length;
        setPendingRequests(pending);
      })
      .catch((err) => console.error("Leaves fetch error:", err))
      .finally(() => setLoadingLeaves(false));
  }, []);

  // 🔹 Update leave status
  const updateStatus = async (leaveId, status) => {
    if (!user?._id) return;

    try {
      await axios.put(` 
 https://api-nodelinux-be-b8cpf8cbe8f4f5b0.centralus-01.azurewebsites.net/leave/${leaveId}/status`, {
        status,
        userId: user._id,
        role: "admin",
      });

      setLeaves((prev) =>
        prev.map((l) => (l._id === leaveId ? { ...l, status } : l))
      );

      setPendingRequests((prev) =>
        status === "approved" || status === "rejected" ? prev - 1 : prev
      );
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };




  // const grantYearly = async () => {
  //   try {
  //     const res = await axios.post("https://api-nodelinux-be-b8cpf8cbe8f4f5b0.centralus-01.azurewebsites.net/leave/grant-yearly", {
  //       sl,
  //       cl,
  //     });
  //     setMessage(res.data.message + " for " + res.data.count + " employees");

  //     // 🔁 Refresh balance from backend
  //     await fetchLeaveBalance();
  //   } catch (err) {
  //     console.error("Error granting yearly leave:", err);
  //   }
  // };

  
const [data, setData] = useState([]);
const fetchYearlySettings = async () => {
  try {
    const res = await axios.get("https://api-nodelinux-be-b8cpf8cbe8f4f5b0.centralus-01.azurewebsites.net/leave/yearly-settings");
    setData(res.data);
  } catch (err) {
    console.error("Error fetching yearly settings:", err);
  }
};

useEffect(() => {
  fetchYearlySettings();
}, []);



  const grantYearly = async () => {
  try {
    const res = await axios.post("https://api-nodelinux-be-b8cpf8cbe8f4f5b0.centralus-01.azurewebsites.net/leave/grant-yearly", {
      sl,
      cl,
    });

    // ✅ Show alert on success
    window.alert(res.data.message + " for " + res.data.count + " employees");
// ✅ Close modal box automatically
    setShowModal(false);
//refresh
fetchYearlySettings()
    // Update message in state too (if needed for UI)
    setMessage(res.data.message + " for " + res.data.count + " employees");

    // 🔁 Refresh balance from backend
    await fetchLeaveBalance();
  } catch (err) {
    console.error("Error granting yearly leave:", err);

    // ⚠️ Show error alert
    if (err.response?.data?.message) {
      window.alert("Error: " + err.response.data.message);
    } else {
      window.alert("Something went wrong while granting leaves.");
    }
  }
};


  const grantMonthly = async () => {
    try {
      const res = await axios.post("https://api-nodelinux-be-b8cpf8cbe8f4f5b0.centralus-01.azurewebsites.net/leave/grant-monthly", {
        sl,
        cl,
      });
      setMessage(res.data.message + " for " + res.data.count + " employees");
      alert(res.data.message + " for " + res.data.count + " employees")
      // 🔁 Refresh balance from backend
      await fetchLeaveBalance();
    } catch (err) {
      console.error("Error granting monthly leave:", err);
    }
  };


  const fetchLeaveBalance = async () => {
    try {
      const res = await axios.get("https://api-nodelinux-be-b8cpf8cbe8f4f5b0.centralus-01.azurewebsites.net/leave/balance");
      console.log("data", res.data

      )
      // if (res.data) {
      //   setSl(res.data.sl);
      //   setCl(res.data.cl);
      //   console.log("test sl/cl",res.data )

      // }
    } catch (err) {
      console.error("Error fetching leave balance:", err);
    }
  };


  useEffect(() => {
    fetchLeaveBalance();
  }, []);

  // 🔹 Derived counts
  const pendingLeaves = leaves.filter((l) => l.status === "pending").length;
  const approvedLeaves = leaves.filter((l) => l.status === "approved").length;
  const rejectedLeaves = leaves.filter((l) => l.status === "rejected").length;

  // 🔹 Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentLeaves = leaves.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(leaves.length / itemsPerPage);

  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

  const calculateDays = (from, to) => {
    const fromDate = new Date(from);
    const toDate = new Date(to);
    const timeDiff = toDate - fromDate; // difference in milliseconds
    const dayDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24)) + 1; // include both start & end
    return dayDiff;
  };

  const HandleDelete = async (leaveId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this leave?");
    if (!confirmDelete) return;

    try {
      await axios.delete(`https://api-nodelinux-be-b8cpf8cbe8f4f5b0.centralus-01.azurewebsites.net/leave/${leaveId}`);

      // ✅ Remove the deleted leave from state
      setLeaves((prev) => prev.filter((l) => l._id !== leaveId));

      alert("🗑️ Leave deleted successfully!");
    } catch (err) {
      console.error("Error deleting leave:", err);
      alert("❌ Failed to delete leave. Please try again.");
    }
  };


  //   const resetAllLeaves = async () => {
  //   if (!window.confirm("⚠️ Are you sure you want to reset ALL employees' leave balances to zero?")) {
  //     return;
  //   }

  //   try {
  //     const res = await axios.post("https://api-nodelinux-be-b8cpf8cbe8f4f5b0.centralus-01.azurewebsites.net/leave/reset-all");
  //     setMessage(`${res.data.message} (${res.data.count} employees affected) ✅`);
  //   } catch (err) {
  //     console.error("Error resetting leave balances:", err);
  //     setMessage("❌ Failed to reset leave balances.");
  //   }
  // };

  console.log("currentLeaves",currentLeaves)

const resetYearlySettings = async () => {
  if (
    !window.confirm(
      "⚠️ Are you sure you want to reset all yearly leave settings and employee balances?"
    )
  ) {
    return;
  }

  try {
    const res = await axios.delete("https://api-nodelinux-be-b8cpf8cbe8f4f5b0.centralus-01.azurewebsites.net/leave/reset-all");
    alert(res.data.message);
    setData([]); // clear yearly table instantly
  } catch (err) {
    console.error("Error resetting yearly settings:", err);
    alert("❌ Failed to reset yearly leave settings. Please try again.");
  }
};

  return (
    <div className="container-fluid">
      <h3 className="mb-4 fw-bold" style={{ color: "#3A5FBE", fontSize: "25px" }}>Leaves</h3>

      {/* Summary Cards */}
      <div className="row mb-4">
        <div className="col-md-4 mb-3">
          <div className="card shadow-sm border-0">
            <div className="card-body d-flex align-items-center" style={{ gap: "20px" }}>
              <h4 className="mb-0" style={{ fontSize: "40px", backgroundColor: "#D7F5E4", padding: "10px 20px" }}>
                {approvedLeaves}
              </h4>
              <p className="mb-0 fw-semibold" style={{ fontSize: "20px", color: "#3A5FBE" }}>
                Accepted Leave Requests
              </p>
            </div>
          </div>
        </div>

        <div className="col-md-4 mb-3">
          <div className="card shadow-sm border-0">
            <div className="card-body d-flex align-items-center" style={{ gap: "20px" }}>
              <h4 className="mb-0" style={{ fontSize: "40px", backgroundColor: "#F8D7DA", padding: "10px 20px" }}>
                {rejectedLeaves}
              </h4>
              <p className="mb-0 fw-semibold" style={{ fontSize: "20px", color: "#3A5FBE" }}>
                Rejected Leave Requests
              </p>
            </div>
          </div>
        </div>

        {/* <div className="col-md-3">
          <div className="card shadow-sm border-0">
            <div className="card-body d-flex align-items-center" style={{ gap: "20px" }}>
              <h4 className="mb-0" style={{ fontSize: "40px", backgroundColor: "#E2E3FF", padding: "10px 20px" }}>
                {leaves.length}
              </h4>
              <p className="mb-0 fw-semibold" style={{ fontSize: "20px", color: "#3A5FBE" }}>
                Total Leaves
              </p>
            </div>
          </div>
        </div> */}

        <div className="col-md-4 mb-3">
          <div className="card shadow-sm border-0">
            <div className="card-body d-flex align-items-center" style={{ gap: "20px" }}>
              <h4 className="mb-0" style={{ fontSize: "40px", backgroundColor: "#FFE493", padding: "10px 20px" }}>
                {pendingLeaves}
              </h4>
              <p className="mb-0 fw-semibold" style={{ fontSize: "20px", color: "#3A5FBE" }}>
                Pending Leave Requests
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Set Leave Modal */}
      <>
        <button className="btn mb-3" style={{ backgroundColor: "#3A5FBE", color: "#fff" }} onClick={() => setShowModal(true)}>
          Set Leaves
        </button>

<style>{`
  .modal-body .btn:focus {
    outline: none;
  }

  /* For all buttons in modal-footer */
  .modal-footer .btn:focus-visible {
    outline: 3px solid #3A5FBE;
    outline-offset: 2px;
    box-shadow: 0 0 0 4px rgba(58, 95, 190, 0.25);
    transform: scale(1.02);
    transition: all 0.2s ease;
  }

  /* Submit buttons (blue background) */
  .modal-footer button[type="submit"]:focus-visible,
  .modal-footer .btn[style*="backgroundColor: \"#3A5FBE\""]:focus-visible {
    outline: 3px solid #ffffff;
    outline-offset: 2px;
    box-shadow: 0 0 0 4px rgba(255, 255, 255, 0.4);
    filter: brightness(1.1);
  }

  /* Cancel button (outline style) */
  .modal-footer .btn-outline:focus-visible {
    outline: 3px solid #3A5FBE;
    outline-offset: 2px;
    box-shadow: 0 0 0 4px rgba(58, 95, 190, 0.25);
    background-color: rgba(58, 95, 190, 0.05);
  }

  /* Input fields */
  .modal-body input:focus-visible {
    outline: 2px solid #3A5FBE !important;
    outline-offset: 2px;
    border-color: #3A5FBE !important;
    box-shadow: 0 0 0 3px rgba(58, 95, 190, 0.15) !important;
  }
`}</style>
        {showModal && (
          <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header text-white" style={{ backgroundColor: "#3A5FBE" }}
                >
                  <h5 className="modal-title">Set Leaves</h5>
                  <button
                    type="button"
                    className="btn-close btn-close-white"
                    onClick={() => setShowModal(false)}
                  ></button>
                </div>
                <div className="modal-body">
                  {/* {message && <div className="alert alert-info">{message}</div>} */}
                  <label className="form-label" style={{ color: "#3A5FBF" }}>Sick Leave</label>
                  <input
                    type="number"
                    value={sl}
                    onChange={(e) => setSl(Number(e.target.value))}
                    className="form-control mb-3"
                  />
                  <label className="form-label" style={{ color: "#3A5FBF" }}>Casual Leave</label>
                  <input
                    type="number"
                    value={cl}
                    onChange={(e) => setCl(Number(e.target.value))}
                    className="form-control"
                  />
                </div>
                <div className="modal-footer">
                  <button className="btn" style={{ backgroundColor: "#3A5FBE", color: "#fff" }} onClick={grantYearly}>
                    Grant Yearly Leave
                  </button>
                  {/* <button className="btn" style={{ backgroundColor: "#3A5FBE", color: "#fff" }} onClick={grantMonthly}>
                    Grant Monthly Leave
                  </button> */}
                  <button className="btn btn-outline" style={{ borderColor: "#3A5FBE", color: "#3A5FBE" }} onClick={() => setShowModal(false)}>
                    Cancel
                  </button>

                 
                </div>
              </div>
            </div>
          </div>
        )}
      </>


  <div className="card shadow-sm p-3 mt-4">
      <h5 className="text-center">Yearly Leave Settings</h5>
      <table className="table table-bordered mt-3 text-center">
        <thead className="table-light">
          <tr>
            <th>Year</th>
            <th>Sick Leave (SL)</th>
            <th>Casual Leave (CL)</th>
            <th>Created On</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item._id}>
              <td>{item.year}</td>
              <td>{item.sl}</td>
              <td>{item.cl}</td>
              <td>{new Date(item.createdAt).toLocaleDateString()}</td>
           
           
           <td><button
    className="btn btn-danger"
    onClick={resetYearlySettings}
    style={{ backgroundColor: "#dc3545", borderColor: "#dc3545" }}
  >
    🔄 Reset Yearly Leave Settings
  </button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>


    
      {/* Leave Applications Table */}
      <>
        {loadingLeaves ? (
          // <h5>Loading leave applications...</h5>
          <div
            className="d-flex flex-column justify-content-center align-items-center"
            style={{ minHeight: "100vh" }}
          >
            <div
              className="spinner-grow"
              role="status"
              style={{ width: "4rem", height: "4rem", color: "#3A5FBE" }}
            >
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3 fw-semibold" style={{ color: "#3A5FBE" }}>Loading ...</p>
          </div>

        ) : leaves.length === 0 ? (
          <p>No leave applications found.</p>
        ) : (
          <div className="card shadow-sm border-0">
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th  style={{ fontWeight: '500', fontSize: '14px', color: '#6c757d', borderBottom: '2px solid #dee2e6', padding: '12px', whiteSpace: 'nowrap' }}>Employee</th>
                    <th  style={{ fontWeight: '500', fontSize: '14px', color: '#6c757d', borderBottom: '2px solid #dee2e6', padding: '12px', whiteSpace: 'nowrap' }}>Type</th>
                    <th style={{ fontWeight: '500', fontSize: '14px', color: '#6c757d', borderBottom: '2px solid #dee2e6', padding: '12px', whiteSpace: 'nowrap' }}>From</th>
                    <th  style={{ fontWeight: '500', fontSize: '14px', color: '#6c757d', borderBottom: '2px solid #dee2e6', padding: '12px', whiteSpace: 'nowrap' }}>To</th>
                    <th  style={{ fontWeight: '500', fontSize: '14px', color: '#6c757d', borderBottom: '2px solid #dee2e6', padding: '12px', whiteSpace: 'nowrap' }}>Days</th>
                    <th  style={{ fontWeight: '500', fontSize: '14px', color: '#6c757d', borderBottom: '2px solid #dee2e6', padding: '12px', whiteSpace: 'nowrap', maxWidth: '220px', wordBreak: 'break-word' }}>Reason</th>
                    <th  style={{ fontWeight: '500', fontSize: '14px', color: '#6c757d', borderBottom: '2px solid #dee2e6', padding: '12px', whiteSpace: 'nowrap' }}>Status</th>
                    <th  style={{ fontWeight: '500', fontSize: '14px', color: '#6c757d', borderBottom: '2px solid #dee2e6', padding: '12px', whiteSpace: 'nowrap' }} >Action</th>
                  </tr>
                </thead>
                <tbody>
                  {currentLeaves.map((l) => (
                    <tr key={l._id}>
                      <td style={{ padding: '12px', verticalAlign: 'middle', fontSize: '14px', borderBottom: '1px solid #dee2e6', whiteSpace: 'nowrap' }}>{l.employee?.name}</td>
                      <td  style={{ padding: '12px', verticalAlign: 'middle', fontSize: '14px', borderBottom: '1px solid #dee2e6', whiteSpace: 'nowrap' }}>{l.leaveType}</td>
                      <td style={{ padding: '12px', verticalAlign: 'middle', fontSize: '14px', borderBottom: '1px solid #dee2e6', whiteSpace: 'nowrap' }}>
                        {new Date(l.dateFrom).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td style={{ padding: '12px', verticalAlign: 'middle', fontSize: '14px', borderBottom: '1px solid #dee2e6', whiteSpace: 'nowrap' }}>
                        {new Date(l.dateTo).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td  style={{ padding: '12px', verticalAlign: 'middle', fontSize: '14px', borderBottom: '1px solid #dee2e6', whiteSpace: 'nowrap' }}>{calculateDays(l.dateFrom, l.dateTo)}</td>
                      <td style={{ padding: '12px', verticalAlign: 'middle', fontSize: '14px', borderBottom: '1px solid #dee2e6', whiteSpace: 'nowrap', maxWidth: '220px', wordBreak: 'break-word', overflow: 'auto' }}>{l.reason}</td>
                      <td style={{ padding: '12px', verticalAlign: 'middle', fontSize: '14px', borderBottom: '1px solid #dee2e6', whiteSpace: 'nowrap' }}>
                        {l.status === "approved" ? (
                          <span style={{ backgroundColor: '#d1f2dd', padding: '8px 16px', borderRadius: '4px', fontSize: '13px', fontWeight: '500', display: 'inline-block', width: "100px", textAlign: "center" }}>Approved</span>
                        ) : l.status === "rejected" ? (
                          <span style={{ backgroundColor: '#f8d7da', padding: '8px 16px', borderRadius: '4px', fontSize: '13px', fontWeight: '500', display: 'inline-block', width: "100px", textAlign: "center" }}>Rejected</span>
                        ) : (
                          <span style={{ backgroundColor: '#FFE493', padding: '8px 16px', borderRadius: '4px', fontSize: '13px', fontWeight: '500', display: 'inline-block', width: "100px", textAlign: "center" }}>Pending</span>
                        )}
                      </td>
                      <td style={{ padding: '12px', verticalAlign: 'middle', fontSize: '14px', borderBottom: '1px solid #dee2e6', whiteSpace: 'nowrap' }}>
                        {l.status === "pending" && user?._id ? (
                          <>
                            <button
                              className="btn btn-sm btn-outline-success me-2"
                              onClick={() => updateStatus(l._id, "approved")}
                            >
                              Approve
                            </button>
                            <button
                              className="btn btn-sm btn-outline-danger  me-2"
                              onClick={() => updateStatus(l._id, "rejected")}
                            >
                              Reject
                            </button>
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => HandleDelete(l._id, "rejected")}
                            >
                              Delete
                            </button>
                          </>
                        ) : (
                          <span className="text-muted">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 🔹 Modern Pagination Section */}
            <nav className="d-flex align-items-center justify-content-end mt-3 text-muted p-3">
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

                {/* Page range */}
                <span style={{ fontSize: "14px", marginLeft: "16px" }}>
                  {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, leaves.length)} of {leaves.length}
                </span>

                {/* Navigation arrows */}
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
          </div>
        )}
      </>

      <div className="text-end mt-3">
        <button
          className="btn btn-primary mt-3"
          style={{ backgroundColor: "#3A5FBE", borderColor: "#3A5FBE" }}
          onClick={() => window.history.go(-1)}
        >
          Back
        </button>
      </div>










     
    </div>
  );
}

export default AdminAddLeaveBalance;
