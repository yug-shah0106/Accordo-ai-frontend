import { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import { authApi } from "../api";
import RequisitionDoughnutChart from "./Graphs/DonutGraph";
import LineGraphSaving from "./Graphs/LineGraphSaving";
import Bargraph from "./Graphs/Bargraph";
import LineGraphrequisitions from "./Graphs/LineGraphRequisition";
import BudgetCards from "./BudgetCards";
import SelectField from "./SelectField";
import { FiBarChart2 } from "react-icons/fi";

interface ChartDataset {
  label: string;
  data: number[];
  borderColor: string;
  backgroundColor: string;
  tension: number;
}

interface LineChartData {
  labels: string[];
  datasets: ChartDataset[];
}

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  BarElement,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const durationOptions: Array<{ label: string; value: string }> = [
    { label: "30 Days", value: "30 Days" },
    { label: "60 Days", value: "60 Days" },
    { label: "1 Year", value: "1 Year" },
    { label: "5 Years", value: "5 Years" },
  ];

  const [, setLineData] = useState<LineChartData>({
    labels: [],
    datasets: [
      {
        label: "2024 Requisitions",
        data: Array(13).fill(0),
        borderColor: "#FF4C61",
        backgroundColor: "rgba(255, 76, 97, 0.2)",
        tension: 0.4,
      },
      {
        label: "2025 Requisitions",
        data: Array(13).fill(0),
        borderColor: "#4C7AFF",
        backgroundColor: "rgba(76, 122, 255, 0.2)",
        tension: 0.4,
      },
    ],
  });

  const companyId = localStorage.getItem("%companyId%");
  const generateMonthLabels = () => {
    const labels = [];
    const startYear = 2024;
    const startMonth = 9;

    for (let i = 0; i < 13; i++) {
      const currentMonth = (startMonth + i) % 12;
      const currentYear = startYear + Math.floor((startMonth + i) / 12);

      const monthName = new Date(currentYear, currentMonth).toLocaleString(
        "default",
        { month: "short" }
      );
      const yearMonth = `${monthName} ${currentYear}`;
      labels.push(yearMonth);
    }
    return labels;
  };
  const getDashBoardData = async () => {
    try {
      const response = await authApi.get(`/requisition/get-all`, {
        params: {
          page: 1,
          limit: 10,
          projectid: "",
          companyid: companyId,
        },
      });

      const requisitions = response.data.data;
      const monthlyCounts2024: number[] = Array(13).fill(0);
      const monthlyCounts2025: number[] = Array(13).fill(0);

      requisitions.forEach((req: any) => {
        const reqDate = new Date(req.createdAt);
        const createdYear = reqDate.getFullYear();
        const createdMonth = reqDate.getMonth();

        let index = createdMonth;

        if (createdYear === 2024) {
          monthlyCounts2024[index]++;
        } else if (createdYear === 2025) {
          monthlyCounts2025[index]++;
        }
      });

      setLineData((prevData) => ({
        ...prevData,
        labels: generateMonthLabels(),
        datasets: [
          { ...prevData.datasets[0], data: monthlyCounts2024 },
          { ...prevData.datasets[1], data: monthlyCounts2025 },
        ],
      }));
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    }
  };
  // const processRequisitions = (requisitions) => {
  //   // Days of the week
  //   const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  //   const weeklyRequisitions = [0, 0, 0, 0, 0, 0, 0]; // Initialize the array to store requisitions counts for each day of the week

  //   // Loop through each requisition
  //   requisitions.forEach((requisition) => {
  //     const createdAt = new Date(requisition.createdAt); // Convert the createdAt to Date object
  //     const dayIndex = createdAt.getDay(); // Get the index for the day of the week (0-Sunday, 6-Saturday)
  //     weeklyRequisitions[dayIndex] += 1; // Increment the count for the corresponding day
  //   });

  //   return weeklyRequisitions;
  // };

  useEffect(() => {
    getDashBoardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyId]);

  // Chart options (unused but kept for reference)
  // const options = {
  //   scales: {
  //     x: {
  //       position: "bottom",
  //       grid: {
  //         drawOnChartArea: false,
  //         display: true,
  //       },
  //     },
  //     y: {
  //       beginAtZero: true,
  //       grid: {
  //         drawOnChartArea: true,
  //       },
  //     },
  //   },
  // };

  const budgetData = [
    { title: "Total Budget", amount: "$53,009.89", avatarLetter: "B" },
    { title: "Actual", amount: "$45,500.00", avatarLetter: "A" },
    { title: "Total Savings", amount: "$7,509.89", avatarLetter: "S" },
  ];

  const rfqItems = [
    { id: "RFQ001", amount: "$500" },
    { id: "RFQ002", amount: "$500" },
  ];

  return (
    <div className="bg-white rounded-lg  shadow-md pt-6 pb-0">
      <div className="mb-4">
        <h1 className="text-xl font-semibold text-gray-800 flex items-center px-6 gap-2">
          <FiBarChart2 className="text-xl" />
          Dashboard
        </h1>
      </div>
      <hr />

      <div className="flex justify-between pt-6 px-6 pb-0">
        <p className="text-xl font-medium">Overview</p>
        {/* <p className="flex items-center gap-2">
          Last 30 days <MdKeyboardArrowDown />
        </p> */}
        {/* @ts-ignore - SelectField is a JS component without proper TS definitions */}
        <SelectField
          // label="Duration"
          name="duration"
          placeholder="Select Duration"
          options={durationOptions as any}
          optionKey="label"
          optionValue="value"
          // register={register}
          // error={errors.projectId}
          wholeInputClassName={`-my-1`}
        />
      </div>

      <div className="">
        {/* {["Total Budget", "Actual", "Total Savings"].map((title, index) => (
          <div
            key={index}
            className="border rounded-lg shadow-sm pt-4 px-4 pb-0 flex flex-col justify-between"
          >
            <p className="text-gray-500 font-medium lg:text-xl md:text-md">
              {title}
            </p>
            <h2 className="lg:text-xl md:text-sm font-semibold text-gray-800 ">
              $53,009.89
            </h2>
            <div className="flex justify-between lg:px-2 pt-4 ">
              <p className="flex items-center gap-2 lg:text-lg md:text-sm">
                <MdOutlineArrowOutward className="text-[#1A932E]" />
                RFQ001
              </p>
              <p className="lg:text-lg md:text-sm">$500</p>
            </div>
            <div className="flex justify-between lg:px-2">
              <p className="flex items-center gap-2 lg:text-lg md:text-sm">
                <MdOutlineArrowOutward className="text-[#1A932E]" />
                RFQ002
              </p>
              <p className="lg:text-lg md:text-sm">$500</p>
            </div>
          </div>
        ))} */}
        <BudgetCards budgetData={budgetData} rfqItems={rfqItems} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 pt-6 px-6 pb-0">
        <div>
          <LineGraphrequisitions />
        </div>
        <div className="bg-white border  rounded-lg shadow-sm pt-4 px-4 pb-0">
          <h3 className="text-gray-600 font-medium mb-2 block text-center ">
            Analytics
          </h3>
          <div className="flex justify-center">
            <RequisitionDoughnutChart />
          </div>
        </div>

        <div>
          <Bargraph />
        </div>
        <div className="bg-white border rounded-lg shadow-sm pt-6 px-6 pb-0">
          <LineGraphSaving />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
