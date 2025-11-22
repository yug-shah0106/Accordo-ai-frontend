import { useRef } from "react";
import { MdOutlineDelete } from "react-icons/md";
import { useNavigate } from "react-router-dom";

const Modal = ({
  heading,
  body,
  onClose,
  onAction,
  actionText = "Accept",
  cancelText = "Cancel",
  handleClose,
  showCancelButton = true,
  actionButtonColor = "blue",
  size = "medium",
  additionalClasses = "",
  wholeModalStyle = "",
  btnsStyle = "",
  isDeleteIcon,
}) => {
  const ref = useRef();
  const navigate = useNavigate();
  const handleAction = () => {
    if (onAction) {
      onAction();
    }
    onClose();
  };

  const getModalSize = () => {
    switch (size) {
      case "small":
        return "w-64";
      case "large":
        return "w-[32rem]";
      default:
        return "w-96";
    }
  };

  const handleClickOutside = (event) => {
    if (ref.current && !ref.current.contains(event.target)) {
      handleClose();
    }
  };

  return (
    <div
      className={`fixed inset-0 flex z-50 items-center justify-center bg-gray-900 bg-opacity-50 ${wholeModalStyle}`}
      onClick={(e) => {
        handleClickOutside(e);
      }}
    >
      <div
        className={`bg-white p-6 rounded-lg relative ${getModalSize()} ${additionalClasses}`}
        ref={ref}
      >
        {/* Delete Icon (if applicable) */}
        {isDeleteIcon && (
          <div className="absolute -top-7 left-[50%] translate-x-[-50%] p-3 rounded-full bg-[#EF2D2E] text-white flex justify-center items-center text-2xl">
            <MdOutlineDelete />
          </div>
        )}

        {/* {
          heading === "Benchmark Details" && <button
            onClick={() => { navigate(`edit-requisition/102`) }}
            className="absolute mr-7  top-3 right-3 px-3 py-1 w-16 h-7  bg-gray-200 text-gray-700 text-xs font-medium rounded-md hover:bg-gray-300"
          >
            Edit
          </button>
        } */}

        <h2 className="text-2xl font-semibold mb-4">{heading}</h2>

        {typeof body === "string" ? (
          <p className="text-sm mb-6">{body}</p>
        ) : (
          <div className="mb-6">{body}</div>
        )}

        {/* Action Buttons */}
        <div className={`flex justify-end gap-4 ${btnsStyle}`}>
          {showCancelButton && (
            <button
              onClick={handleClose || onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-100"
            >
              {cancelText}
            </button>
          )}
          {onAction && (
            <button
              onClick={handleAction}
              className={`px-4 py-2 bg-${actionButtonColor}-500 text-white rounded-md hover:bg-${actionButtonColor}-600`}
            >
              {actionText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Modal;
