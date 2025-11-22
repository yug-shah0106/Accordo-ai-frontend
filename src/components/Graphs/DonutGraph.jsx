import { useState, useEffect } from "react";
import { Doughnut } from "react-chartjs-2";

const RequisitionDoughnutChart = () => {
  // Dummy data for testing
  const dummyRequisitions = [
    { status: "Created" },
    { status: "Created" },
    { status: "Fulfilled" },
    { status: "Fulfilled" },
    { status: "Pending" },
    { status: "Rejected" },
  ];

  const [doughnutData, setDoughnutData] = useState({
    labels: ["Open Negotiation", "Closed Negotiation", "Remaining"],
    datasets: [
      {
        data: [0, 0, 0],
        backgroundColor: ["#4CAF50", "#2196F3", "#F0F0F0"],
        hoverBackgroundColor: ["#45A049", "#1976D2", "#b0b0b0"],
      },
    ],
  });

  // Dummy companyId for testing
  const companyId = "dummyCompanyId";

  const fetchRequisitionData = async () => {
    try {
      // Commented out API call
      // const response = await authApi.get(`/requisition/get-all`, {
      //   params: {
      //     page: 1,
      //     limit: 10,
      //     projectid: "",
      //     companyid: companyId,
      //   },
      // });

      // Use dummy data instead of API response
      const requisitions = dummyRequisitions;

      let openCount = 0;
      let closedCount = 0;
      let remainingCount = 0;

      // Loop through the dummy requisitions and categorize
      requisitions.forEach((req) => {
        if (req.status === "Created") {
          openCount++; // Count "Created" status as "Open Negotiation"
        } else if (req.status === "Fulfilled") {
          closedCount++; // Count "Fulfilled" status as "Closed Negotiation"
        } else {
          remainingCount++; // Any other status will be considered "Remaining"
        }
      });

      // Update the doughnut chart data with the new counts
      setDoughnutData({
        labels: ["Open Negotiation", "Closed Negotiation", "Remaining"],
        datasets: [
          {
            data: [openCount, closedCount, remainingCount],
            backgroundColor: ["#4CAF50", "#2196F3", "#F0F0F0"],
            hoverBackgroundColor: ["#45A049", "#1976D2", "#b0b0b0"],
          },
        ],
      });
    } catch (error) {
      console.error("Error fetching requisition data:", error);
    }
  };

  // Fetch requisition data on component load
  useEffect(() => {
    fetchRequisitionData();
  }, [companyId]);

  return (
    <div className="w-fit">
      <Doughnut data={doughnutData} />
    </div>
  );
};

export default RequisitionDoughnutChart;
