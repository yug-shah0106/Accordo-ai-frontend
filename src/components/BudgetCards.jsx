import { Avatar } from "@mui/material";
import { MdOutlineArrowOutward } from "react-icons/md";
import { blue, green, red } from "@mui/material/colors";

const BudgetCards = ({ budgetData, rfqItems }) => {
  // Define color mapping based on card title
  const colorMapping = {
    "Total Budget": { border: "border-blue-400", bg: blue[400] },
    Actual: { border: "border-green-400", bg: green[400] },
    "Total Savings": { border: "border-red-400", bg: red[400] },
  };

  return (
    <div style={{marginLeft:10,marginRight:10}} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 px-1">
      {budgetData.map((item, index) => (
        <div
          key={index}
          className={`border ${
            colorMapping[item.title]?.border
          } rounded-[14px] shadow-sm p-4`}
        >
          {/* Circular Icon with Letter */}
          <div className="flex items-center space-x-3 mb-2">
            <Avatar sx={{ bgcolor: colorMapping[item?.title]?.bg }}>
              {item?.avatarLetter}
            </Avatar>
            <p style={{fontSize:12}} className="text-gray-700  font-medium lg:text-xl md:text-sm">
              {item.title}
            </p>
          </div>

          {/* Amount */}
          <h2 style={{fontSize:14}} className="lg:text-2xl md:text-lg lg:px-2 font-bold text-gray-900">
            {item.amount}
          </h2>

          {/* RFQ Items */}
          <div className="pt-4 space-y-2">
            {rfqItems.map((rfq, i) => (
              <div key={i} className="flex justify-between lg:px-2">
                <p style={{fontSize:14}} className="flex items-center gap-2 lg:text-base md:text-sm">
                  <MdOutlineArrowOutward className="text-green-600" />
                  {rfq.id}
                </p>
                <p style={{fontSize:14}} className="lg:text-base md:text-sm font-semibold">
                  {rfq.amount}
                </p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default BudgetCards;
