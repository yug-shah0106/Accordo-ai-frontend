import React, { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import { authApi } from "../../api";

// const LineGraphrequisitions = () => {


//   const [lineData, setLineData] = useState({
//     labels: Array.from({ length: 12 }, (_, i) =>
//       new Date(0, i).toLocaleString("default", { month: "short" })
//     ), // ["Jan", "Feb", ..., "Dec"]
//     datasets: [
//       {
//         label: "Requisitions",
//         data: Array(12).fill(0),
//         borderColor: "#4C7AFF",
//         backgroundColor: "rgba(76, 122, 255, 0.2)",
//         tension: 0.4,
//       },
//     ],
//   });
//   const companyId = localStorage.getItem("%companyId%");

//   const [selectedYear, setSelectedYear] = useState(null); // To track the selected year
//   const [availableYears, setAvailableYears] = useState([]); //
  
//   const getDashBoardData = async () => {
//     try {
//       const response = await authApi.get(`/requisition/get-all`, {
//         params: {
//           page: 1,
//           limit: 10,
//           projectid: "",
//           companyid: companyId,
//         },
//       });

//       const requisitions = response.data.data;

//       // Extract unique years from the requisitions
//       const years = [
//         ...new Set(
//           requisitions.map((req) => new Date(req.createdAt).getFullYear())
//         ),
//       ].sort((a, b) => a - b); // Sort years in ascending order

//       // Set the dynamic years in the dropdown
//       setAvailableYears(years);

//       // Set the default selected year as the first year in the list
//       if (!selectedYear) setSelectedYear(years[0]);

//       // Generate data for the selected year
//       if (selectedYear) {
//         const monthlyCounts = Array(12).fill(0); // Array for months Jan-Dec
//         requisitions.forEach((req) => {
//           const reqDate = new Date(req.createdAt);
//           if (reqDate.getFullYear() === selectedYear) {
//             const createdMonth = reqDate.getMonth(); // Jan = 0, ..., Dec = 11
//             monthlyCounts[createdMonth]++;
//           }
//         });

//         // Update the line chart data
//         setLineData((prevData) => ({
//           ...prevData,
//           datasets: [{ ...prevData.datasets[0], data: monthlyCounts }],
//         }));
//       }
//     } catch (error) {
//       console.error("Error fetching dashboard data:", error);
//     }
//   };
//   // Fetch data whenever the selected year changes
//   useEffect(() => {
//     getDashBoardData(selectedYear);
//   }, [selectedYear]);

//   // Chart options
// //   const options = {
// //     responsive: true,
// //     plugins: {
// //       tooltip: {
// //         callbacks: {
// //           label: (tooltipItem) => `${tooltipItem.raw} Requisitions`,
// //         },
// //       },
// //     },
// //     scales: {
// //       x: {
// //         title: { display: true, text: "Months" },
// //       },
// //       y: {
// //         title: { display: true, text: "Count of Requisitions" },
// //         ticks: { beginAtZero: true },
// //       },
// //     },
// //   };
//   const options = {
//     responsive: true,
//     plugins: {
//       tooltip: {
//         callbacks: {
//           label: (tooltipItem) => `${tooltipItem.raw} Requisitions`,
//         },
//       },
//     },
//     scales: {
//       x: {
//         title: { display: true, text: "Months" },
//       },
//       y: {
//         title: { display: true, text: "Count of Requisitions" },
//         ticks: { beginAtZero: true },
//       },
//     },
//   };

//   return (
//     <div className="bg-white border rounded-lg shadow-sm p-4 h-full">
//       <div className="flex items-center justify-between mb-4">
//         <h3 className="text-gray-600 font-medium">Total Requisitions</h3>
//         {/* Dropdown for selecting year */}
//         {availableYears.length > 0 && (
//           <select
//             value={selectedYear || ""}
//             onChange={(e) => setSelectedYear(Number(e.target.value))}
//             className="border border-gray-300 rounded-md p-2"
//           >
//             {availableYears.map((year) => (
//               <option key={year} value={year}>
//                 {year}
//               </option>
//             ))}
//           </select>
//         )}
//       </div>
//       {/* Line chart */}
//       <Line data={lineData} options={options} />
//     </div>
//   );
// };

// export default LineGraphrequisitions;



// import React, { useState, useEffect } from "react";
// import { Line } from "react-chartjs-2";

const LineGraphRequisitions = () => {
  // Dummy requisitions data for the last 10 years
  const dummyRequisitions = [
    { createdAt: "2024-03-01" },
    { createdAt: "2024-03-05" },
    { createdAt: "2024-03-10" },
    { createdAt: "2024-03-15" },
    { createdAt: "2024-03-18" },
    { createdAt: "2024-03-20" },
    { createdAt: "2024-03-25" },
    { createdAt: "2024-03-30" },
    { createdAt: "2023-12-10" },
    { createdAt: "2023-06-12" },
    { createdAt: "2023-07-19" },
    { createdAt: "2022-05-15" },
    { createdAt: "2022-09-25" },
    { createdAt: "2021-04-08" },
    { createdAt: "2021-11-20" },
    { createdAt: "2020-01-15" },
    { createdAt: "2020-06-30" },
    { createdAt: "2019-02-10" },
    { createdAt: "2019-08-05" },
    { createdAt: "2018-03-12" },
    { createdAt: "2018-12-25" },
    { createdAt: "2017-07-09" },
    { createdAt: "2017-10-19" },
    { createdAt: "2016-05-23" },
    { createdAt: "2016-08-14" },
    { createdAt: "2015-03-05" },
    { createdAt: "2015-09-21" },
    { createdAt: "2014-02-28" },
    { createdAt: "2014-12-11" },
  ];

  const [lineData, setLineData] = useState({
    labels: [],
    datasets: [
      {
        label: "Requisitions",
        data: [],
        borderColor: "#4C7AFF",
        backgroundColor: "rgba(76, 122, 255, 0.2)",
        tension: 0.4,
      },
    ],
  });

  const [filterType, setFilterType] = useState("Y"); // Default to Day (D)

  // Helper function to get date range for the last 30 days
  const getLast30Days = () => {
    const days = [];
    const today = new Date();

    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      days.push(date.toISOString().slice(0, 10)); // Format: YYYY-MM-DD
    }
    return days;
  };

  // Group and process data based on filter type (D, M, Y)
  const filterData = (requisitions, type) => {
    let labels = [];
    let dataCounts = [];

    if (type === "D") {
      // Generate last 30 days as labels
      labels = getLast30Days();
      dataCounts = Array(labels.length).fill(0);

      // Map requisitions to last 30 days
      requisitions.forEach((req) => {
        const reqDate = req.createdAt.slice(0, 10);
        const dayIndex = labels.indexOf(reqDate);
        if (dayIndex !== -1) {
          dataCounts[dayIndex]++;
        }
      });
    } else if (type === "M") {
      // Group by month
      const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      labels = months;
      dataCounts = Array(12).fill(0);

      requisitions.forEach((req) => {
        const reqDate = new Date(req.createdAt);
        const month = reqDate.getMonth(); // 0-11
        dataCounts[month]++;
      });
    } else if (type === "Y") {
      // Group by year for the last 10 years
      const currentYear = new Date().getFullYear();
      const years = Array.from({ length: 10 }, (_, i) => currentYear - i);
      labels = years.map((year) => year.toString()).reverse();
      dataCounts = Array(10).fill(0);

      requisitions.forEach((req) => {
        const year = new Date(req.createdAt).getFullYear();
        const yearIndex = years.indexOf(year);
        if (yearIndex !== -1) {
          dataCounts[yearIndex]++;
        }
      });
    }

    // Update chart data
    setLineData({
      labels,
      datasets: [
        {
          label: "Requisitions",
          data: dataCounts,
          borderColor: "#4C7AFF",
          backgroundColor: "rgba(76, 122, 255, 0.2)",
          tension: 0.4,
        },
      ],
    });
  };

  // Process data when component mounts or filterType changes
  useEffect(() => {
    filterData(dummyRequisitions, filterType);
  }, [filterType]);

  // Handle filter change (D, M, Y)
  const handleFilterChange = (type) => {
    setFilterType(type);
  };

  // Chart options with fix for y-axis negative values
  const options = {
    responsive: true,
    plugins: {
      tooltip: {
        callbacks: {
          label: (tooltipItem) => `${tooltipItem.raw} Requisitions`,
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text:
            filterType === "D" ? "Last 30 Days" : filterType === "M" ? "Months" : "Years",
        },
      },
      y: {
        title: {
          display: true,
          text: "Count of Requisitions",
        },
        ticks: {
          beginAtZero: true, // 👈 Ensures y-axis starts from 0
          suggestedMin: 0,  // 👈 Prevents negative values on y-axis
        },
      },
    },
  };

  return (
    <div className="bg-white border rounded-lg shadow-sm p-4 h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-gray-600 font-medium">Total Requisitions</h3>
        {/* Filter buttons: D, M, Y */}
        <div className="flex space-x-2">
          <button
            className={`px-3 py-1 text-sm rounded ${filterType === "D" ? "bg-blue-500 text-white" : "bg-gray-200"
              }`}
            onClick={() => handleFilterChange("D")}
          >
            D
          </button>
          <button
            className={`px-3 py-1 text-sm rounded ${filterType === "M" ? "bg-blue-500 text-white" : "bg-gray-200"
              }`}
            onClick={() => handleFilterChange("M")}
          >
            M
          </button>
          <button
            className={`px-3 py-1 text-sm rounded ${filterType === "Y" ? "bg-blue-500 text-white" : "bg-gray-200"
              }`}
            onClick={() => handleFilterChange("Y")}
          >
            Y
          </button>
        </div>
      </div>
      <Line data={lineData} options={options} />
    </div>
  );
};

export default LineGraphRequisitions;
