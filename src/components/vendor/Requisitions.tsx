import { Link } from "react-router-dom";

function Requisitions({isOpen, toggleMenu}) {
  const data = [
    { venderId: "Printer", Quantity: 14 },
    { venderId: "Printer", Quantity: 14 },
    { venderId: "Printer", Quantity: 14 },
  ];

  return (
    <div className="bg-[#D3DBFD1A] overflow-y-scroll hide-scrollbar">
      <div
        className={`hamburger-icon ${isOpen ? "open" : ""} ml-auto m-4`}
        onClick={toggleMenu}
      >
        <div></div>
        <div></div>
        <div></div>
      </div>

      <p className="text-[#18100E] text-center font-medium mb-4 lg:text-lg pt-2">
        Requisitions
      </p>
      <p className="text-[#18100E] font-semibold mb-4 px-4">Products</p>

      <table className="table-auto w-full text-left mb-3">
        <thead>
          <tr className="border-t border-[#D1CFCF]">
            <th className="text-sm font-semibold px-4 py-2">Vendor Id</th>
            <th className="text-sm font-semibold px-4 py-2">Quantity</th>
          </tr>
        </thead>
        <tbody>
          {data.map((value, i) => {
            return (
              <tr key={i} className="border-t border-[#D1CFCF]">
                <td className="text-sm font-medium px-4 py-2">
                  {value.venderId}
                </td>
                <td className="text-sm font-medium px-4 py-2">
                  {value.Quantity}
                </td>
              </tr>
            );
          })}
          <tr className="border-b border-[#D1CFCF]"></tr>
        </tbody>
      </table>

      <div className="pt-4 font-medium text-base px-4">
        <p className="text-black mb-2 border-b text-base border-gray-300 pb-4">
          Final Contract
        </p>
        <div className="">
          <p className="mb-5">
            <strong className="block text-gray-800 font-normal">
              Contract value:
            </strong>
            $25,254
          </p>
          <p className="mb-5">
            <strong className="block text-gray-800 font-normal">
              Contract Length
            </strong>
            120 days
          </p>
          <p className="mb-5 text-justify">
            <strong className="block text-gray-800 font-normal">
              Payment Terms
            </strong>
            Lorem ipsum dolor Consectetur eit utsnim ad minim veniam quis
            exercitation.
          </p>
          <p className="mb-5 text-justify">
            <strong className="block text-gray-800 font-normal">
              Warranty
            </strong>
            Lorem ipsum dolor Consectetur eit utsnim ad minim veniam quis
            exercitation.
          </p>
        </div>
        <Link
          to="/verifyOtp"
          className="bg-[#009A4F] w-1/3 md:w-1/2 text-white mx-auto block font-medium py-2 px-4 rounded mt-4 text-center">
          Verify
        </Link>
      </div>
    </div>
  );
}

export default Requisitions;
