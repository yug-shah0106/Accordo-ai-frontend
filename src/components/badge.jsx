import React from "react";

const Badge = ({ status, color }) => {
  const statusColors = {
    Created: "#B24D00",
    Fulfilled: "#009A4F",
    Cancelled: "#EF2D2E",
    active:"#009A4F",
    inactive:"#EF2D2E",
    Rejected:"#EF2D2E",
    Accepted:"#009A4F",
    // default: "#B0BEC5",
  };

  const badgeColor = color || statusColors[status] || "#B0BEC5";

  return (
    <span
      className={`px-3 inline-block  py-2  rounded-full`}
      style={{
        color: badgeColor,
        backgroundColor: `${badgeColor + "20"}`,
      }}
    >
      {status}
    </span>
  );
};

export default Badge;
