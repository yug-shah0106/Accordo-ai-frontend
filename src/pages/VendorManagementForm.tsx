import CreateProductForm from "../components/vendor/CreateProductForm";
import Sidebar from "../components/vendor/Sidebar";

const VendorManagementForm = () => {
  return (
    <div className="flex w-full bg-gray-100 dark:bg-dark-bg">
      <Sidebar />
      <div className="w-9/12 mx-auto pt-8 px-8 pb-0 dark:text-dark-text">
        <CreateProductForm />
      </div>
    </div>
  );
};

export default VendorManagementForm;

