import { useState } from "react";
import { MdKeyboardArrowRight, MdOutlineKeyboardArrowDown } from "react-icons/md";
import { RiDeleteBin6Line } from "react-icons/ri";
import { HiPlus } from "react-icons/hi";
import InputField from "../InputField";
import SelectField from "../SelectField";
import {
  AddressData,
  ADDRESS_LABELS,
  COUNTRIES,
  getStatesForCountry,
} from "../../types/address";

interface AddressSectionProps {
  addresses: AddressData[];
  onChange: (addresses: AddressData[]) => void;
  errors?: Record<string, string>;
}

const AddressSection = ({ addresses, onChange, errors }: AddressSectionProps) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(
    addresses.length > 0 ? 0 : null
  );

  const toggleAccordion = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const handleAddAddress = () => {
    const newAddress: AddressData = {
      label: "Branch Office",
      address: "",
      city: "",
      state: "",
      country: "India",
      postalCode: "",
      isDefault: addresses.filter((a) => !a._delete).length === 0,
    };
    const updatedAddresses = [...addresses, newAddress];
    onChange(updatedAddresses);
    setExpandedIndex(updatedAddresses.length - 1);
  };

  const handleDeleteAddress = (index: number) => {
    const address = addresses[index];
    const activeAddresses = addresses.filter((a) => !a._delete);

    // Cannot delete the last remaining address
    if (activeAddresses.length <= 1) {
      return;
    }

    let updatedAddresses: AddressData[];

    if (address.id) {
      // Mark existing address for deletion
      updatedAddresses = addresses.map((addr, i) =>
        i === index ? { ...addr, _delete: true } : addr
      );
    } else {
      // Remove new address directly
      updatedAddresses = addresses.filter((_, i) => i !== index);
    }

    // If deleted address was primary, set first remaining address as primary
    const remaining = updatedAddresses.filter((a) => !a._delete);
    if (address.isDefault && remaining.length > 0) {
      const firstRemainingIndex = updatedAddresses.findIndex((a) => !a._delete);
      updatedAddresses = updatedAddresses.map((addr, i) =>
        i === firstRemainingIndex ? { ...addr, isDefault: true } : addr
      );
    }

    onChange(updatedAddresses);

    // Adjust expanded index if necessary
    if (expandedIndex !== null && expandedIndex >= updatedAddresses.length) {
      setExpandedIndex(Math.max(0, updatedAddresses.length - 1));
    }
  };

  const handleFieldChange = (
    index: number,
    field: keyof AddressData,
    value: string | boolean
  ) => {
    const updatedAddresses = addresses.map((addr, i) => {
      if (i === index) {
        const updated = { ...addr, [field]: value };

        // If country changes, reset state
        if (field === "country") {
          updated.state = "";
        }

        // If setting as primary, unset other primaries
        if (field === "isDefault" && value === true) {
          return updated;
        }

        return updated;
      }

      // If another address is being set as primary, unset this one
      if (field === "isDefault" && value === true) {
        return { ...addr, isDefault: false };
      }

      return addr;
    });

    onChange(updatedAddresses);
  };

  const getDisplayLabel = (address: AddressData): string => {
    if (address.label === "Custom" && address.customLabel) {
      return address.customLabel;
    }
    return address.label || "New Address";
  };

  const activeAddresses = addresses.filter((a) => !a._delete);
  const canDelete = activeAddresses.length > 1;

  return (
    <div className="mb-8 pt-6 border-t border-gray-200">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Company Addresses</h3>
          <p className="text-sm text-gray-600 mt-1">
            Manage your company office locations
          </p>
        </div>
        <button
          type="button"
          onClick={handleAddAddress}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          <HiPlus className="w-4 h-4" />
          Add Address
        </button>
      </div>

      {errors?.addresses && (
        <p className="text-red-500 text-sm mb-4">{errors.addresses}</p>
      )}

      {activeAddresses.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
          <p className="text-gray-500">No addresses added yet.</p>
          <button
            type="button"
            onClick={handleAddAddress}
            className="mt-2 text-blue-600 hover:text-blue-700 font-medium"
          >
            Add your first address
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {addresses.map((address, index) => {
            if (address._delete) return null;

            const stateOptions = getStatesForCountry(address.country);
            const isExpanded = expandedIndex === index;

            return (
              <div
                key={address.id ?? `new-${index}`}
                className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden"
              >
                {/* Accordion Header */}
                <button
                  type="button"
                  onClick={() => toggleAccordion(index)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-gray-900">
                      {getDisplayLabel(address)}
                    </span>
                    {address.isDefault && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                        Primary
                      </span>
                    )}
                    {address.city && (
                      <span className="text-sm text-gray-500">
                        {address.city}
                        {address.state && `, ${address.state}`}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {canDelete && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteAddress(index);
                        }}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                        title="Delete address"
                      >
                        <RiDeleteBin6Line className="w-4 h-4" />
                      </button>
                    )}
                    {isExpanded ? (
                      <MdOutlineKeyboardArrowDown className="w-6 h-6 text-gray-400" />
                    ) : (
                      <MdKeyboardArrowRight className="w-6 h-6 text-gray-400" />
                    )}
                  </div>
                </button>

                {/* Accordion Content */}
                {isExpanded && (
                  <div className="p-4 border-t border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Primary Selection */}
                      <div className="col-span-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="primaryAddress"
                            checked={address.isDefault}
                            onChange={() =>
                              handleFieldChange(index, "isDefault", true)
                            }
                            className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700">
                            Set as primary address
                          </span>
                        </label>
                      </div>

                      {/* Label Dropdown */}
                      <SelectField
                        label="Address Label"
                        name={`address-label-${index}`}
                        value={address.label}
                        onChange={(e) =>
                          handleFieldChange(index, "label", e.target.value)
                        }
                        options={ADDRESS_LABELS}
                        wholeInputClassName="!my-0"
                      />

                      {/* Custom Label Input */}
                      {address.label === "Custom" && (
                        <InputField
                          label="Custom Label"
                          name={`custom-label-${index}`}
                          placeholder="Enter custom label"
                          type="text"
                          value={address.customLabel || ""}
                          onChange={(e) =>
                            handleFieldChange(index, "customLabel", e.target.value)
                          }
                          className="text-sm text-gray-900"
                        />
                      )}

                      {/* Street Address */}
                      <div className={address.label === "Custom" ? "" : "col-span-2"}>
                        <InputField
                          label="Street Address"
                          name={`street-${index}`}
                          placeholder="Enter street address"
                          type="text"
                          value={address.address}
                          onChange={(e) =>
                            handleFieldChange(index, "address", e.target.value)
                          }
                          className="text-sm text-gray-900"
                          required
                        />
                      </div>

                      {/* City */}
                      <InputField
                        label="City"
                        name={`city-${index}`}
                        placeholder="Enter city"
                        type="text"
                        value={address.city}
                        onChange={(e) =>
                          handleFieldChange(index, "city", e.target.value)
                        }
                        className="text-sm text-gray-900"
                      />

                      {/* Country Dropdown */}
                      <SelectField
                        label="Country"
                        name={`country-${index}`}
                        value={address.country}
                        onChange={(e) =>
                          handleFieldChange(index, "country", e.target.value)
                        }
                        options={COUNTRIES}
                        wholeInputClassName="!my-0"
                      />

                      {/* State Dropdown */}
                      {stateOptions.length > 0 ? (
                        <SelectField
                          label="State / Province"
                          name={`state-${index}`}
                          value={address.state}
                          onChange={(e) =>
                            handleFieldChange(index, "state", e.target.value)
                          }
                          options={stateOptions}
                          placeholder="Select state"
                          wholeInputClassName="!my-0"
                        />
                      ) : (
                        <InputField
                          label="State / Province"
                          name={`state-${index}`}
                          placeholder="Enter state"
                          type="text"
                          value={address.state}
                          onChange={(e) =>
                            handleFieldChange(index, "state", e.target.value)
                          }
                          className="text-sm text-gray-900"
                        />
                      )}

                      {/* Postal Code */}
                      <InputField
                        label="Postal Code"
                        name={`postalCode-${index}`}
                        placeholder="Enter postal code"
                        type="text"
                        value={address.postalCode}
                        onChange={(e) =>
                          handleFieldChange(index, "postalCode", e.target.value)
                        }
                        className="text-sm text-gray-900"
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AddressSection;
