import Sidebar from "../components/vendor/Sidebar";
import ProductManagement from "../components/vendor/ProductManagement";

const VendorManagement = () => {
  return (
    <div className="flex w-full bg-gray-100 dark:bg-dark-bg">
      <Sidebar />
      <ProductManagement />
    </div>
  );
};

export default VendorManagement;
