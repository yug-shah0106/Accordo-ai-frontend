import React, { useEffect, useState } from 'react'
import { authApi } from '../../api';
import { Bar } from 'react-chartjs-2';

// const Bargraph = () => {

//     const [barData, setBarData] = useState({
//         labels: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
//         datasets: [
//           {
//             label: "Requisitions",
//             data: [0, 0, 0, 0, 0, 0, 0], // Initial empty data for requisitions
//             backgroundColor: "#4F6FF5",
//             borderRadius: 5,
//             barThickness: 20,
//           },
//         ],
//       });
//   const companyId = localStorage.getItem('%companyId%')






//     const getDashBoardData = async () => {
//         try {
//           const response = await authApi.get(`/requisition/get-all`, {
//             params: {
//               page: 1,
//               limit: 10,
//               projectid: "",
//               companyid: companyId, 
//             },
//           });

//           const requisitions = response.data.data; // Assuming the API returns a list of requisitions
//           const monthlyCounts2024 = Array(13).fill(0); // Array to store counts for each month from Oct 2024 to Oct 2025
//           const monthlyCounts2025 = Array(13).fill(0); // Array to store counts for each month from Oct 2024 to Oct 2025

//           // Iterate through the requisitions and count them by year and month
//           requisitions.forEach((req) => {
//             const reqDate = new Date(req.createdAt);
//             const createdYear = reqDate.getFullYear();
//             const createdMonth = reqDate.getMonth(); // Get the month (0-11)

//             // Adjust the month to start from October (0 => Oct, 1 => Nov, ..., 11 => Sep, 12 => Oct)
//             let index = createdMonth - 9; // Adjust index for Oct 2024 to Oct 2025
//             if (index < 0) index += 12; // Handle wrap-around from October 2024 to September 2025

//             // Count requisitions for each year (2024 and 2025)
//             if (createdYear === 2024) {
//               monthlyCounts2024[index]++;
//             } else if (createdYear === 2025) {
//               monthlyCounts2025[index]++;
//             }
//           });
//           const categorySavings = {};

//         requisitions.forEach((req) => {
//           const category = req.category;
//           const savings = req.savingsInPrice || 0;

//           if (categorySavings[category]) {
//             categorySavings[category] += savings; // Accumulate savingsInPrice for the same category
//           } else {
//             categorySavings[category] = savings; // Initialize savings for a new category
//           }
//         });

//         const categories = Object.keys(categorySavings); // Get all unique categories
//         const savingsData = categories.map((category) => categorySavings[category]); // Map savings to corresponding categories

//         setBarData({
//           labels: categories, // Set category names as labels
//           datasets: [
//             {
//               label: "Category Savings",
//               data: savingsData, // Set savings data for each category
//               backgroundColor: "#4F6FF5",
//               borderRadius: 5,
//               barThickness: 20,
//             },
//           ],
//         });
//         } catch (error) {
//           console.error("Error fetching dashboard data:", error);
//         }
//       };


//       useEffect(() => {

//         getDashBoardData()
//       }, []);

//       const barOptions = {
//         responsive: true,
//         plugins: {
//           legend: {
//             display: false,
//           },
//           tooltip: {
//             enabled: true,
//           },
//         },
//         scales: {
//           x: {
//             grid: {
//               display: false,
//             },
//           },
//           y: {
//             beginAtZero: true,
//             grid: {
//               drawBorder: false,
//             },
//           },
//         },
//       };


//   return (
//     <div>
//         <div className="bg-white border rounded-lg shadow-sm p-6">
//           <h3 className="text-gray-600 font-medium mb-4">
//             Category wise savings
//           </h3>
//           <div className="flex justify-end space-x-2 mb-4">
//             <button className="px-2 py-1 text-sm bg-gray-200 rounded">D</button>
//             <button className="px-2 py-1 text-sm bg-gray-200 rounded">M</button>
//             <button className="px-2 py-1 text-sm bg-gray-200 rounded">Y</button>
//           </div>
//           <Bar data={barData} options={barOptions} />
//         </div>



//     </div>
//   )
// }

// export default Bargraph




const Bargraph = () => {
  // Generate random dummy data for the last 10 years
  const generateDummyData = () => {
    const categories = ["IT", "HR", "Marketing", "Finance", "Operations"];
    const startYear = new Date().getFullYear() - 9; // 10 years back
    const data = [];

    for (let year = startYear; year <= new Date().getFullYear(); year++) {
      for (let i = 0; i < 12; i++) {
        // Add random requisitions per month
        const numRequisitions = Math.floor(Math.random() * 3) + 1;
        for (let j = 0; j < numRequisitions; j++) {
          const randomCategory =
            categories[Math.floor(Math.random() * categories.length)];
          const randomDay = Math.floor(Math.random() * 28) + 1; // Random day in the month
          const randomSavings = Math.floor(Math.random() * 3000) + 500; // Random savings

          data.push({
            createdAt: `${year}-${String(i + 1).padStart(2, "0")}-${String(
              randomDay
            ).padStart(2, "0")}`,
            category: randomCategory,
            savingsInPrice: randomSavings,
          });
        }
      }
    }
    return data;
  };

  // Dummy requisitions generated
  const dummyRequisitions = generateDummyData();

  const [barData, setBarData] = useState({
    labels: [],
    datasets: [
      {
        label: "Requisitions",
        data: [],
        backgroundColor: "#4F6FF5",
        borderRadius: 5,
        barThickness: 20,
      },
    ],
  });

  const [filterType, setFilterType] = useState("Y"); // Default to Yearly view

  // Dummy companyId for testing
  const companyId = "dummyCompanyId";

  const getDashBoardData = async () => {
    try {
      // Commented out API call for testing
      // const response = await authApi.get(`/requisition/get-all`, {
      //   params: {
      //     page: 1,
      //     limit: 10,
      //     projectid: "",
      //     companyid: companyId,
      //   },
      // });

      // Using dummy data for now
      const requisitions = dummyRequisitions;

      // Filter data based on selected filter
      filterData(requisitions, filterType);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    }
  };

  // Filter data based on the selected filter type
  const filterData = (requisitions, type) => {
    let groupedData = {};
    let labels = [];

    if (type === "D") {
      // Group by day of the week
      labels = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ];
      requisitions.forEach((req) => {
        const day = new Date(req.createdAt).getDay();
        if (!groupedData[day]) {
          groupedData[day] = 0;
        }
        groupedData[day] += req.savingsInPrice || 0;
      });

      setBarData({
        labels,
        datasets: [
          {
            label: "Daily Savings",
            data: labels.map((_, i) => groupedData[i] || 0),
            backgroundColor: "#4F6FF5",
            borderRadius: 5,
            barThickness: 20,
          },
        ],
      });
    } else if (type === "M") {
      // Group by month
      labels = [
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
      requisitions.forEach((req) => {
        const month = new Date(req.createdAt).getMonth();
        if (!groupedData[month]) {
          groupedData[month] = 0;
        }
        groupedData[month] += req.savingsInPrice || 0;
      });

      setBarData({
        labels,
        datasets: [
          {
            label: "Monthly Savings",
            data: labels.map((_, i) => groupedData[i] || 0),
            backgroundColor: "#36A2EB",
            borderRadius: 5,
            barThickness: 20,
          },
        ],
      });
    } else if (type === "Y") {
      // Group by year for the last 10 years
      requisitions.forEach((req) => {
        const year = new Date(req.createdAt).getFullYear();
        if (!groupedData[year]) {
          groupedData[year] = 0;
        }
        groupedData[year] += req.savingsInPrice || 0;
      });

      labels = Object.keys(groupedData).sort((a, b) => a - b);
      setBarData({
        labels,
        datasets: [
          {
            label: "Yearly Savings",
            data: labels.map((year) => groupedData[year] || 0),
            backgroundColor: "#FFCE56",
            borderRadius: 5,
            barThickness: 20,
          },
        ],
      });
    }
  };

  // Fetch data on component mount and when filterType changes
  useEffect(() => {
    getDashBoardData();
  }, [filterType]);

  // Handle filter change
  const handleFilterChange = (type) => {
    setFilterType(type);
  };

  const barOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: true,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          drawBorder: false,
        },
      },
    },
  };

  return (
    <div>
      <div className="bg-white border rounded-lg shadow-sm p-6">
        <h3 className="text-gray-600 font-medium mb-4">Category-wise Savings</h3>
        <div className="flex justify-end space-x-2 mb-4">
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
        <Bar data={barData} options={barOptions} />
      </div>
    </div>
  );
};

export default Bargraph;
