import { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartOptions,
  TooltipItem,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Types
interface SavingRequisition {
  createdAt: string;
  category: string;
  savingsInPrice: number;
}

interface LineChartDataset {
  label: string;
  data: number[];
  fill: boolean;
  borderColor: string;
  tension: number;
}

interface LineChartData {
  labels: string[];
  datasets: LineChartDataset[];
}

type FilterType = 'D' | 'M' | 'Y';

// const LineGraphSaving = () => {
//   const [SavingLineGraph, setSavingLineGraph] = useState({
//     labels: [],
//     datasets: [],
//   });
//   const companyId = localStorage.getItem("%companyId%");
//   // Fetch and prepare the data
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

//       const savingsByCategoryAndMonth = {};

//       const months = [
//         "Jan",
//         "Feb",
//         "Mar",
//         "Apr",
//         "May",
//         "Jun",
//         "Jul",
//         "Aug",
//         "Sep",
//         "Oct",
//         "Nov",
//         "Dec",
//       ];

//       requisitions.forEach((req) => {
//         const reqDate = new Date(req.createdAt);
//         const createdYear = reqDate.getFullYear();
//         const createdMonth = reqDate.getMonth();

//         if (req.savingsInPrice === null) return;

//         const category = req.category;

//         if (!savingsByCategoryAndMonth[category]) {
//           savingsByCategoryAndMonth[category] = Array(12).fill(0);
//         }

//         savingsByCategoryAndMonth[category][createdMonth] += req.savingsInPrice;
//       });

//       const lineChartLabels = months;
//       const categoryData = Object.keys(savingsByCategoryAndMonth).map(
//         (category) => ({
//           label: category,
//           data: savingsByCategoryAndMonth[category],
//           fill: false,
//           borderColor: "#4F6FF5",
//           tension: 0.4,
//         })
//       );

//       setSavingLineGraph({
//         labels: lineChartLabels,
//         datasets: categoryData,
//       });
//     } catch (error) {
//       console.error("Error fetching dashboard data:", error);
//     }
//   };

//   // Fetch data when the component mounts
//   useEffect(() => {
//     getDashBoardData();
//   }, []);

//   // Line chart options
//   const chartOptions = {
//     responsive: true,
//     plugins: {
//       tooltip: {
//         callbacks: {
//           label: function (tooltipItem) {
//             return `$${tooltipItem.raw.toFixed(2)}`;
//           },
//         },
//       },
//     },
//     scales: {
//       x: {
//         title: {
//           display: true,
//           text: "Month",
//         },
//       },
//       y: {
//         title: {
//           display: true,
//           text: "Savings in Price",
//         },
//         ticks: {
//           beginAtZero: true,
//         },
//       },
//     },
//   };

//   return (
//     <div>
//       <h2>Saving Line Graph</h2>
//       <Line data={SavingLineGraph} options={chartOptions} />
//     </div>
//   );
// };

// export default LineGraphSaving;









const LineGraphSaving = () => {
  // Dummy data for testing
  const dummyRequisitions: SavingRequisition[] = [
    { createdAt: "2024-01-15", category: "IT", savingsInPrice: 1500 },
    { createdAt: "2024-02-20", category: "HR", savingsInPrice: 1000 },
    { createdAt: "2023-03-10", category: "Marketing", savingsInPrice: 2500 },
    { createdAt: "2023-04-25", category: "IT", savingsInPrice: 2000 },
    { createdAt: "2024-05-05", category: "HR", savingsInPrice: 1200 },
    { createdAt: "2023-06-18", category: "Finance", savingsInPrice: 1800 },
    { createdAt: "2024-07-10", category: "Marketing", savingsInPrice: 3000 },
    { createdAt: "2023-08-12", category: "HR", savingsInPrice: 800 },
    { createdAt: "2024-09-30", category: "IT", savingsInPrice: 2200 },
    { createdAt: "2023-10-15", category: "Finance", savingsInPrice: 1700 },
  ];

  const [SavingLineGraph, setSavingLineGraph] = useState<LineChartData>({
    labels: [],
    datasets: [],
  });

  const [filterType, setFilterType] = useState<FilterType>("D"); // Default to Day (D)

  // Fetch and prepare the data
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

      // Filter and group data based on selected filter type
      filterData(requisitions, filterType);
    } catch (error) {
      // Error handling - no console.log
    }
  };

  // Filter requisitions data based on the selected filter type
  const filterData = (requisitions: SavingRequisition[], type: FilterType): void => {
    const savingsByCategoryAndTime: Record<string, number[]> = {};
    let labels: string[] = [];

    if (type === "D") {
      // Group by day of the month
      labels = Array.from({ length: 31 }, (_, i) => `${i + 1}`); // 1-31 days

      requisitions.forEach((req) => {
        const reqDate = new Date(req.createdAt);
        const day = reqDate.getDate() - 1; // 0-based index
        const category = req.category;

        if (!savingsByCategoryAndTime[category]) {
          savingsByCategoryAndTime[category] = Array(31).fill(0);
        }

        savingsByCategoryAndTime[category][day] += req.savingsInPrice || 0;
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
        const reqDate = new Date(req.createdAt);
        const month = reqDate.getMonth(); // 0-based index
        const category = req.category;

        if (!savingsByCategoryAndTime[category]) {
          savingsByCategoryAndTime[category] = Array(12).fill(0);
        }

        savingsByCategoryAndTime[category][month] += req.savingsInPrice || 0;
      });
    } else if (type === "Y") {
      // Group by year
      const years = [
        ...new Set(requisitions.map((req) => new Date(req.createdAt).getFullYear())),
      ].sort(); // Sort years for consistency
      labels = years.map((year) => year.toString()); // Ensure string type for labels

      requisitions.forEach((req) => {
        const year = new Date(req.createdAt).getFullYear();
        const category = req.category;

        if (!savingsByCategoryAndTime[category]) {
          savingsByCategoryAndTime[category] = Array(years.length).fill(0);
        }

        const yearIndex = years.indexOf(year);
        if (yearIndex !== -1) {
          savingsByCategoryAndTime[category][yearIndex] += req.savingsInPrice || 0;
        }
      });
    }

    const categoryData: LineChartDataset[] = Object.keys(savingsByCategoryAndTime).map(
      (category, index) => ({
        label: category,
        data: savingsByCategoryAndTime[category],
        fill: false,
        borderColor: getRandomColor(index), // Dynamic color for each category
        tension: 0.4,
      })
    );

    setSavingLineGraph({
      labels,
      datasets: categoryData,
    });
  };

  // Generate random colors for the line chart
  const getRandomColor = (index: number): string => {
    const colors = [
      "#4F6FF5",
      "#FF6384",
      "#36A2EB",
      "#FFCE56",
      "#4CAF50",
      "#9C27B0",
      "#FF9800",
    ];
    return colors[index % colors.length];
  };

  // Fetch data when the component mounts and when filterType changes
  useEffect(() => {
    getDashBoardData();
  }, [filterType]);

  // Handle filter change
  const handleFilterChange = (type: FilterType): void => {
    setFilterType(type);
  };

  // Line chart options
  const chartOptions: ChartOptions<'line'> = {
    responsive: true,
    plugins: {
      tooltip: {
        callbacks: {
          label: function (tooltipItem: TooltipItem<'line'>) {
            const value = tooltipItem.raw as number;
            return `$${value.toFixed(2)}`; // Format savings as $
          },
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: filterType === "D" ? "Day" : filterType === "M" ? "Month" : "Year",
        },
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Savings in Price ($)",
        },
      },
    },
  };

  return (
    <div>
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-gray-600 font-medium">Category-wise Savings Trend</h3>
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
        <Line data={SavingLineGraph} options={chartOptions} />
      </div>
    </div>
  );
};

export default LineGraphSaving;
