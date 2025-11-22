
import React, { useEffect, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import axios from "axios";
import "./MyAttendance.css";

function MyAttendanceCalendar({ employeeId }) {
  const [attendance, setAttendance] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [weeklyOff, setWeeklyOff] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [regularizations, setRegularizations] = useState([]);
  const [summary, setSummary] = useState({
    leave: 0,
    present: 0,
    regularized: 0,
    holidays: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [attRes, leaveRes, weeklyRes, holidayRes, regRes] = await Promise.all([
          axios.get(` https://api-nodelinux-be-b8cpf8cbe8f4f5b0.centralus-01.azurewebsites.net/attendance/${employeeId}`),
          axios.get(` https://api-nodelinux-be-b8cpf8cbe8f4f5b0.centralus-01.azurewebsites.net/leave/my/${employeeId}`),
          axios.get(` https://api-nodelinux-be-b8cpf8cbe8f4f5b0.centralus-01.azurewebsites.net/admin/weeklyoff/${new Date().getFullYear()}`),
          axios.get(` https://api-nodelinux-be-b8cpf8cbe8f4f5b0.centralus-01.azurewebsites.net/getHolidays`),
          axios.get(` https://api-nodelinux-be-b8cpf8cbe8f4f5b0.centralus-01.azurewebsites.net/attendance/regularization/my/${employeeId}`),
        ]);

        setWeeklyOff(weeklyRes.data.data?.saturdays || []);
        setHolidays(holidayRes.data || []);
        setLeaves(leaveRes.data);
        setRegularizations(regRes.data);

        // Expand approved leaves by date
        const expandedLeaves = [];
        leaveRes.data.forEach((leave) => {
          if (leave.status === "approved") {
            let current = new Date(leave.dateFrom);
            const to = new Date(leave.dateTo);
            while (current <= to) {
              expandedLeaves.push({
                date: new Date(current),
                dayStatus: "Leave",
                leaveType: leave.leaveType,
              });
              current.setDate(current.getDate() + 1);
            }
          }
        });

        // Expand approved regularizations
        const expandedRegularizations = regRes.data
          .filter((r) => r.status === "Approved")
          .map((r) => ({
            date: new Date(r.date),
            dayStatus: "Regularized",
            checkIn: r.requestedCheckIn,
            checkOut: r.requestedCheckOut,
          }));

        // Merge attendance + leaves + regularizations
        const merged = [...attRes.data, ...expandedLeaves, ...expandedRegularizations];
        setAttendance(merged);
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };

    fetchData();
  }, [employeeId]);

  // --- Helper functions ---
  const isHoliday = (date) =>
    holidays.some((h) => new Date(h.date).toDateString() === date.toDateString());

  const isWeeklyOff = (date) => {
    if (date.getDay() === 0) return true; // Sunday
    if (date.getDay() === 6) {
      const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
      let count = 0;
      for (let d = new Date(firstDay); d <= date; d.setDate(d.getDate() + 1)) {
        if (d.getDay() === 6) count++;
      }
      return weeklyOff.includes(count);
    }
    return false;
  };

  // --- Prioritize what to show on the same day ---
  const attendanceMap = {};
  attendance.forEach((rec) => {
    const dateKey = new Date(rec.date).toDateString();
    const existing = attendanceMap[dateKey];

    if (!existing) attendanceMap[dateKey] = rec;
    else {
      if (rec.dayStatus === "Leave") attendanceMap[dateKey] = rec;
      else if (rec.dayStatus === "Regularized" && existing.dayStatus !== "Leave")
        attendanceMap[dateKey] = rec;
      else if (
        (rec.dayStatus === "Present" || rec.dayStatus === "Full Day") &&
        !["Leave", "Regularized"].includes(existing.dayStatus)
      )
        attendanceMap[dateKey] = rec;
    }
  });

  // --- Calendar coloring ---
  const tileClassName = ({ date, view }) => {
    if (view !== "month") return "";
    const rec = attendanceMap[date.toDateString()];

    if (isHoliday(date)) return "holiday-day";
    if (isWeeklyOff(date)) return "weekly-off-day";
    if (rec) {
      if (rec.dayStatus === "Regularized") return "regularized-day";
      if (rec.dayStatus === "Leave") return "leave-day";
      if (rec.dayStatus === "Present" || rec.dayStatus === "Full Day")
        return "present-day";
      if (rec.dayStatus === "Half Day") return "halfday-day";
    }
    return "";
  };

  // --- Monthly summary ---
  useEffect(() => {
    const now = new Date();
    const month = now.getMonth();
    const year = now.getFullYear();

    let leaveCount = 0,
      presentCount = 0,
      regularizedCount = 0,
      holidayCount = 0;

    attendance.forEach((rec) => {
      const d = new Date(rec.date);
      if (d.getMonth() === month && d.getFullYear() === year) {
        if (rec.dayStatus === "Leave") leaveCount++;
        if (rec.dayStatus === "Regularized") regularizedCount++;
        if (rec.dayStatus === "Present" || rec.dayStatus === "Full Day")
          presentCount++;
      }
    });

    holidays.forEach((h) => {
      const d = new Date(h.date);
      if (d.getMonth() === month && d.getFullYear() === year) holidayCount++;
    });

    setSummary({ leave: leaveCount, present: presentCount, regularized: regularizedCount, holidays: holidayCount });
  }, [attendance, holidays]);

  // --- Render UI ---
  return (
    // <div className="card shadow-sm mt-3 h-100 border-0">
    //   <h4 className="text-center mt-1" style={{ color: "#3A5FBE" }}>
    //     Attendance Calendar
    //   </h4>

    //   <div
    //     style={{
    //       width: "100%",
    //       maxWidth: "350px",
    //       margin: "0 auto",
    //       backgroundColor: "#FFFFFF",
    //     }}
    //   >
    //     <Calendar
    //       tileClassName={tileClassName}
    //       defaultActiveStartDate={
    //         new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    //       }
    //     />
    //   </div>

    //   <div
    //     className="d-flex justify-content-center mt-3 flex-wrap"
    //     style={{ gap: "20px" }}
    //   >
    //     <span><span className="legend-box present"></span> Present</span>
    //     <span><span className="legend-box regularized"></span> Regularized</span>
    //     <span><span className="legend-box leave"></span> Leave</span>
    //     <span><span className="legend-box holiday"></span> Holiday</span>
    //     <span><span className="legend-box weekend"></span> Weekly Off</span>
    //   </div>
    // </div>

    <div className="card shadow-sm mt-3 h-100 border-0">
      <h4 className="text-center mt-3" style={{ color: "#3A5FBE",fontSize: "25px" }}>
        Attendance Calendar
      </h4>

      <div
        style={{
          width: "100%",
          maxWidth: "350px",
          margin: "0 auto",
          backgroundColor: "#FFFFFF",
        }}
      >
        <Calendar
          tileClassName={tileClassName}
          defaultActiveStartDate={
            new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          }
        />
      </div>

      <div
        className="d-flex justify-content-center mt-3 flex-wrap"
        style={{ gap: "20px" }}
      >
        <span><span className="legend-box present"></span> Present</span>
        {/* <span><span className="legend-box regularized"></span> Regularized</span> */}
        <span><span className="legend-box leave"></span> Leave</span>
        <span><span className="legend-box holiday"></span> Holiday</span>
        {/* <span><span className="legend-box weekend"></span> Weekly Off</span> */}
      

      </div>
    </div>
  );
}

export default MyAttendanceCalendar;
