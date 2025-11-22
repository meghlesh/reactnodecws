import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

function TodaysEmployeeDetails() {
  const [attendanceData, setAttendanceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { role, username, id } = useParams();
  const navigate = useNavigate();

  // ✅ Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  // ✅ Summary counts
  const [summary, setSummary] = useState({
    present: 0,
    absent: 0,
    lateCheckIn: 0,
  });

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("accessToken");
        const authAxios = axios.create({
          baseURL: " https://api-nodelinux-be-b8cpf8cbe8f4f5b0.centralus-01.azurewebsites.net",
          headers: { Authorization: `Bearer ${token}` },
        });

        const res = await authAxios.get("/attendance/today");
        const employees = res.data?.employees || [];

        // ✅ Calculate counts
        let present = 0;
        let absent = 0;
        let lateCheckIn = 0;

        employees.forEach((emp) => {
          const checkIn = emp.checkInTime ? new Date(emp.checkInTime) : null;
          const checkOut = emp.checkOutTime ? new Date(emp.checkOutTime) : null;

          if (!checkIn && !checkOut) {
            absent++;
          } else {
            present++;

            // Check if late check-in (>= 10:00 AM)
            if (checkIn) {
              const hours = checkIn.getHours();
              const minutes = checkIn.getMinutes();
              if (hours > 10 || (hours === 10 && minutes > 0)) {
                lateCheckIn++;
              }
            }
          }
        });

        setSummary({ present, absent, lateCheckIn });
        setAttendanceData(res.data);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch today's attendance.");
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, []);

  const calculateWorkingHours = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return 0;
    const diffMs = new Date(checkOut) - new Date(checkIn);
    const diffHrs = diffMs / (1000 * 60 * 60);
    return diffHrs.toFixed(2);
  };

  const getStatus = (checkIn, checkOut, workingHours) => {
    if (!checkIn && !checkOut) return "Absent";
    if (checkIn && !checkOut) return "Working";
    if (workingHours >= 8) return "Present";
    if (workingHours >= 4) return "Half Day";
    return "Absent";
  };

  if (loading) return <div
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
  </div>;

  if (error) return <p className="text-danger">{error}</p>;
  if (!attendanceData?.employees?.length)
    return <p>No attendance records for today.</p>;

  const employees = attendanceData.employees;
  const totalPages = Math.ceil(employees.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentEmployees = employees.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  console.log("currentEmployees", currentEmployees)
  return (
    <div className="p-4 max-w-6xl mx-auto">
      <h2 className="text-xl font-bold mb-4" style={{ color: "#3A5FBE", fontSize: "25px" }}>Today's Attendance Details</h2>

      {/* ✅ Summary Cards */}
      <div className="row mb-4">
        <div className="col-md-4 mb-3">
          <div className="card shadow-sm h-100 border-0">
            <div className="card-body d-flex align-items-center" style={{ gap: "20px" }}>
              <h4
                className="mb-0"
                style={{
                  fontSize: "40px",
                  backgroundColor: "#D7F5E4",
                  padding: "10px",
                  textAlign: "center",
                  minWidth: "75px",      // Fixed minimum width
                  minHeight: "75px",     // Fixed minimum height
                  display: "flex",       // Center content
                  alignItems: "center",  // Center vertically
                  justifyContent: "center", // Center horizontally
                }}
              >
                {summary.present}
              </h4>
              <p className="mb-0 fw-semibold" style={{ fontSize: "20px", color: "#3A5FBE" }}>
                Total Present Employees
              </p>
            </div>
          </div>
        </div>

        <div className="col-md-4 mb-3">
          <div className="card shadow-sm h-100 border-0">
            <div className="card-body d-flex  align-items-center" style={{ gap: "20px" }}>
              <h4
                className="mb-0"
                style={{
                  fontSize: "40px",
                  backgroundColor: "#F8D7DA",
                padding: "10px",
                  textAlign: "center",
                  minWidth: "75px",      // Fixed minimum width
                  minHeight: "75px",     // Fixed minimum height
                  display: "flex",       // Center content
                  alignItems: "center",  // Center vertically
                  justifyContent: "center", // Center horizontally
                }}
              >
                {summary.absent}
              </h4>
              <p className="mb-0 fw-semibold" style={{ fontSize: "20px", color: "#3A5FBE" }}>
                Total Absent Employees
              </p>
            </div>
          </div>
        </div>

        <div className="col-md-4 mb-3">
          <div className="card shadow-sm h-100 border-0">
            <div className="card-body d-flex align-items-center" style={{ gap: "20px" }}>
              <h4
                className="mb-0"
                style={{
                  fontSize: "40px",
                  backgroundColor: "#FFE493",
                  padding: "10px",
                  textAlign: "center",
                  minWidth: "75px",      // Fixed minimum width
                  minHeight: "75px",     // Fixed minimum height
                  display: "flex",       // Center content
                  alignItems: "center",  // Center vertically
                  justifyContent: "center", // Center horizontally
                }}
              >
                {summary.lateCheckIn}
              </h4>
              <p className="mb-0 fw-semibold" style={{ fontSize: "20px", color: "#3A5FBE" }}>
                Late Check-In
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ Attendance Table */}
      <div className="table-responsive">
        <table className="table table-hover mb-0">
          <thead className="table-light">
            <tr>
              <th style={{ fontWeight: '500', fontSize: '14px', color: '#6c757d', borderBottom: '2px solid #dee2e6', padding: '12px',  whiteSpace: 'nowrap' }}>Name</th>
              <th style={{ fontWeight: '500', fontSize: '14px', color: '#6c757d', borderBottom: '2px solid #dee2e6', padding: '12px',  whiteSpace: 'nowrap' }} >Check-In Time</th>
              <th style={{ fontWeight: '500', fontSize: '14px', color: '#6c757d', borderBottom: '2px solid #dee2e6', padding: '12px',  whiteSpace: 'nowrap' }} >Check-Out Time</th>
              <th style={{ fontWeight: '500', fontSize: '14px', color: '#6c757d', borderBottom: '2px solid #dee2e6', padding: '12px',  whiteSpace: 'nowrap' }} >Total Hours</th>
              <th style={{ fontWeight: '500', fontSize: '14px', color: '#6c757d', borderBottom: '2px solid #dee2e6', padding: '12px', whiteSpace: 'nowrap' }} >Status</th>
              <th style={{ fontWeight: '500', fontSize: '14px', color: '#6c757d', borderBottom: '2px solid #dee2e6', padding: '12px',  whiteSpace: 'nowrap' }} >Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentEmployees.map((emp) => {
              const checkIn = emp.checkInTime;
              const checkOut = emp.checkOutTime;
              const workingHours = calculateWorkingHours(checkIn, checkOut);
              const status = getStatus(checkIn, checkOut, workingHours);
              const badgeStyle = {
                base: {
                  display: 'inline-block',
                  padding: '6px 12px',
                  fontWeight: 400,
                  fontSize: '14px',
                  width: 112,
                   textAlign: "center",
                },
                Present: { background: '#d1f7df' }, // soft green
                'Half Day': { background: '#fff3cd' }, // soft yellow
                Working: { background: '#cff4fc' }, // soft cyan
                Absent: { background: '#f8d7da' }, // soft red
              };

              return (
                <tr key={emp._id}>
                  <td style={{ padding:"12px", fontSize: '14px', fontWeight: 400, color: '#212529', whiteSpace: 'nowrap', textTransform: 'capitalize', borderTop: '1px solid #e9ecef' }}>{emp.name}</td>
                  <td  style={{ padding: '12px', fontSize: '14px', borderBottom: '1px solid #dee2e6', whiteSpace: 'nowrap' }}>
                    {checkIn
                      ? new Date(checkIn).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                      : "-"}
                  </td>
                  <td style={{ padding: '12px', fontSize: '14px', borderBottom: '1px solid #dee2e6', whiteSpace: 'nowrap' }}>
                    {checkOut
                      ? new Date(checkOut).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                      : "-"}
                  </td>
                  <td  style={{ padding: '12px', fontSize: '14px', borderBottom: '1px solid #dee2e6', whiteSpace: 'nowrap' }}>{workingHours > 0 ? `${workingHours} hrs` : "-"}</td>
                  <td  style={{ padding: '12px', fontSize: '14px', borderBottom: '1px solid #dee2e6', whiteSpace: 'nowrap' }}>
                    <span
                      style={{ ...badgeStyle.base, ...(badgeStyle[status] || {}) }}
                    >
                      {status}
                    </span>
                  </td>
                  <td  style={{ padding: '12px', fontSize: '14px', borderBottom: '1px solid #dee2e6', whiteSpace: 'nowrap' }}>
                    <button
                      className="btn btn-sm"
                      style={{ backgroundColor: "#3A5FBE", color: "#fff" }} ś
                      onClick={() =>
                        navigate(`/dashboard/${role}/${username}/${id}/employeeattendance/${emp._id}`, {
                          state: { employee: emp },
                        })
                      }
                    >
                      View Attendance
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {/* ✅ Pagination */}
      <nav className="d-flex align-items-center justify-content-end mt-3 text-muted">
        <div className="d-flex align-items-center gap-3">
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

          <span style={{ fontSize: "14px", marginLeft: "16px" }}>
            {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, employees.length)} of {employees.length}
          </span>

          <div className="d-flex align-items-center" style={{ marginLeft: "16px" }}>
            <button
              className="btn btn-sm border-0"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              ‹
            </button>
            <button
              className="btn btn-sm border-0"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              ›
            </button>
          </div>
        </div>
      </nav>
    <div className="text-end mt-3">
     <button
  className="btn btn-primary mt-3"
  style={{ backgroundColor: "#3A5FBE", borderColor: "#3A5FBE" }}
  onClick={() => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1); // ✅ Go to previous pagination page
    }
  }}
>
  Back
</button>
</div>
    </div>
  );
}

export default TodaysEmployeeDetails;
