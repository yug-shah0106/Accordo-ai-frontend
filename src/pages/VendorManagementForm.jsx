import React, { useState } from "react";
import CreateProductForm from "../components/vendor/CreateProductForm";
import Sidebar from "../components/vendor/Sidebar";

const VendorManagementForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    brand: "",
    category: "",
    gstType: "",
    tds: "",
    type: "",
    uom: "",
  });

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

 
  const handleSave = (data) => {
    console.log("Product saved:", data); 
    alert("Product saved: " + JSON.stringify(data, null, 2)); 
  };

  const handleClose = () => {
    console.log("Form closed");
  };

  return (
    <div className="flex w-full bg-gray-100">
      <Sidebar />
      <div className="w-9/12 mx-auto p-8">
        <CreateProductForm
          formData={formData} 
          setFormData={setFormData} 
          onSave={handleSave} 
          onClose={handleClose} 
        />
      </div>
    </div>
  );
};

export default VendorManagementForm;

