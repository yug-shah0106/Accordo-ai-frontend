import { useState } from "react";
import { HiDotsHorizontal } from "react-icons/hi";
import { Link } from "react-router-dom";
import TableShimmer from "./shimmerTable/tableShimmer";
import Badge from "./badge";
import toast from "react-hot-toast";
import { FiCopy } from "react-icons/fi";
import { formatDate } from "../utils/utils";
import { Menu, MenuItem, IconButton } from "@mui/material";
import type { TableProps } from "./Table.types";

const Table = ({
  data,
  columns,
  actions,
  onRowClick,
  loading = false,
  style = "",
  currentPage = 1,
  itemsPerPage = 10,
}: TableProps) => {
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const [menuRow, setMenuRow] = useState<any | null>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, row: any) => {
    event.stopPropagation();
    setMenuAnchor(event.currentTarget);
    setMenuRow(row);
  };

  const handleMenuClose = (event: React.MouseEvent) => {
    event.stopPropagation();
    setMenuAnchor(null);
    setMenuRow(null);
  };

  const handleCopy = (link: string) => {
    navigator.clipboard
      .writeText(link)
      .then(() => {
        toast.success("Link copied to clipboard!");
      })
      .catch((error) => {
        console.error("Failed to copy the link:", error);
      });
  };

  // in case of coping is not wroking in https:// use below function

  // const handleCopy = (link) => {
  //   if (!navigator.clipboard) {
  //     console.warn("Clipboard API not available or blocked.");
  //     fallbackCopyText(link);
  //     return;
  //   }

  //   navigator.clipboard
  //     .writeText(link)
  //     .then(() => {
  //       console.log("Link copied successfully!");
  //       toast.success("Link copied to clipboard!");
  //     })
  //     .catch((error) => {
  //       console.error("Error copying link:", error);
  //       fallbackCopyText(link);
  //     });
  // };

  // Fallback in case Clipboard API is not available
  // const fallbackCopyText = (text) => {
  //   const textarea = document.createElement("textarea");
  //   textarea.value = text;
  //   document.body.appendChild(textarea);
  //   textarea.select();
  //   try {
  //     document.execCommand("copy");
  //     toast.success("Link copied using fallback method!");
  //   } catch (err) {
  //     console.error("Fallback copy failed:", err);
  //   }
  //   document.body.removeChild(textarea);
  // };

  return (
    <div className="overflow-y-auto max-h-[calc(100vh-300px)]">
      <table className="w-full bg-white font-normal rounded-lg text-sm">
        <thead className={`sticky top-0 bg-white z-10 ${style}`}>
          <tr className="text-gray-400">
            <th className="px-4 py-2 text-left font-normal">S.No</th>
            {columns.map((col, index) => (
              <th key={index} className="px-4 py-2 text-center font-normal">
                {col?.header ?? col}
              </th>
            ))}
            <th className="px-4 py-2 text-left font-normal">Action</th>
          </tr>
        </thead>
        <tbody className="text-center">
          {!loading ? (
            Array.isArray(data) && data.length > 0 ? (
              data.map((row, index) => (
                <tr
                  key={index}
                  className="text-[#18100E] border-t hover:bg-gray-50 cursor-pointer"
                  onClick={() => onRowClick(row)}
                >
                  <td className="px-4 py-2 text-justify">
                    {index + 1 + (currentPage - 1) * itemsPerPage}
                  </td>
                  {columns.map((col, colIndex) => (
                    <td key={colIndex} className="px-4 py-2">
                      {col?.header === "Project ID" ||
                      col?.header === "RFQ ID" ? (
                        typeof row[col?.accessor ?? col] === "string" ? (
                          row[col?.accessor ?? col]?.slice(-12)
                        ) : typeof row[col?.accessor ?? col] === "object" &&
                          !Array.isArray(row[col?.accessor ?? col]) ? (
                          row?.[col?.accessor]?.[col?.accessorKey]?.slice(-12)
                        ) : (
                          "-"
                        )
                      ) : col?.header === "GST %" ? (
                        row.gstType === "GST" ? (
                          `${row[col?.accessor] || " "} %`
                        ) : (
                          "-"
                        )
                      ) : col?.header === "Tenure" ? (
                        `${row[col?.accessor ?? col]} ${
                          row[col?.accessor ?? col] <= 1 ? "day" : "days"
                        }`
                      ) : col?.isRating ? (
                        `${
                          col.isRating(index) === undefined
                            ? "-"
                            : col.isRating(index)
                        } / 10`
                      ) : col?.isLink ? (
                        <div className="flex  gap-x-3">
                          <p className="truncate  w-[10rem]">
                            {`${col?.isLink}${row[col?.accessor ?? col]}`}
                          </p>
                          <FiCopy
                            className="w-4 h-4 cursor-pointer"
                            onClick={() =>
                              handleCopy(
                                `${col?.isLink}${row[col?.accessor ?? col]}`
                              )
                            }
                          />
                        </div>
                      ) : col.isBadge ? (
                        <div className="text-center">
                          <Badge
                            status={
                              typeof row[col?.accessor ?? col] === "object"
                                ? row[col?.accessor ?? col]?.status ?? "default"
                                : row[col?.accessor ?? col]
                            }
                          />
                        </div>
                      ) : (col?.header === "Created At" ||
                          col?.header === "Created On" ||
                          col?.header === "PO Generated At") &&
                        typeof row[col?.accessor ?? col] === "string" &&
                        !isNaN(Date.parse(row[col?.accessor ?? col])) ? (
                        formatDate(row[col?.accessor ?? col]?.split("T")?.[0])
                      ) : typeof row[col?.accessor ?? col] === "string" ||
                        typeof row[col?.accessor ?? col] === "number" ? (
                        row[col?.accessor ?? col]
                      ) : typeof row[col?.accessor ?? col] === "string" &&
                        !isNaN(Date.parse(row[col?.accessor ?? col])) ? (
                        formatDate(row[col?.accessor ?? col]?.split("T")?.[0])
                      ) : typeof row[col?.accessor ?? col] === "object" &&
                        !Array.isArray(row[col?.accessor ?? col]) ? (
                        row?.[col?.accessor]?.[col?.accessorKey]
                      ) : (
                        <ul>
                          {row[col?.accessor ?? col]?.length > 1 ? (
                            <li
                              key={
                                row[col?.accessor ?? col][0]?.userId || colIndex
                              }
                            >
                              {
                                row[col?.accessor ?? col][0]?.[
                                  `${col?.accessorKey}` || "User"
                                ]?.[`${col?.accessorSubKey}` || "name"]
                              }{" "}
                              {row[col?.accessor ?? col]?.length > 1 && (
                                <div className="relative inline-block group">
                                  <p className="text-[#234BF3] inline-block cursor-pointer">
                                    + {row[col?.accessor ?? col].length - 1}{" "}
                                    others
                                  </p>
                                  <div className="absolute left-0 mt-1 w-max max-w-xs z-10 hidden group-hover:block bg-white border border-gray-200 shadow-md rounded-md text-sm pt-2 px-2 pb-0">
                                    {row[col?.accessor ?? col]
                                      .slice(1)
                                      .map((i, vendorIndex) => (
                                        <p
                                          key={vendorIndex}
                                          className="text-gray-700 truncate"
                                        >
                                          {
                                            i?.[
                                              `${col?.accessorKey}` || "User"
                                            ]?.[
                                              `${col?.accessorSubKey}` || "name"
                                            ]
                                          }
                                        </p>
                                      ))}
                                  </div>
                                </div>
                              )}
                            </li>
                          ) : (
                            row[col?.accessor ?? col]?.map((i) => (
                              <li className="" key={i?.userId || colIndex}>
                                {
                                  i?.[`${col?.accessorKey}` || "User"]?.[
                                    `${col?.accessorSubKey}` || "name"
                                  ]
                                }
                              </li>
                            ))
                          )}
                        </ul>
                      )}
                    </td>
                  ))}
                  <td className="px-4 py-2">
                    <div className="relative">
                      <IconButton
                        onClick={(evnt) => {
                          evnt.stopPropagation();
                          handleMenuOpen(evnt, row);
                        }}
                      >
                        <HiDotsHorizontal className="text-xl" />
                      </IconButton>
                      {/* MUI Menu for actions */}
                      <Menu
                        anchorEl={menuAnchor}
                        open={Boolean(menuAnchor) && menuRow === row}
                        onClose={handleMenuClose}
                        anchorOrigin={{
                          vertical: "center",
                          horizontal: "center",
                        }}
                        transformOrigin={{
                          vertical: "top",
                          horizontal: "right",
                        }}
                      >
                        {actions.map((action, actionIndex) => {
                          const shouldRender = action.condition
                            ? action.condition(row)
                            : true;
                          if (!shouldRender) return null;

                          return (
                            <MenuItem
                              key={actionIndex}
                              onClick={(evnt) => {
                                evnt.stopPropagation(); // Prevent row click after selecting an option
                                if (action.type === "button") {
                                  action.onClick(row); // Perform button action
                                }
                                handleMenuClose(evnt); // Close the menu after selection
                              }}
                              className="w-full"
                              component={
                                action.type === "link" ? Link : "button"
                              }
                              to={
                                action.type === "link"
                                  ? action.link(row)
                                  : undefined
                              }
                              state={
                                action.state
                                  ? action.state === "whole"
                                    ? row
                                    : row[action.state]
                                  : null
                              }
                            >
                              {action.icon && (
                                <span className="mr-2">{action.icon}</span>
                              )}
                              {action.label}
                            </MenuItem>
                          );
                        })}
                      </Menu>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length + 2}
                  className="p-16 text-center text-md"
                >
                  No records found
                </td>
              </tr>
            )
          ) : (
            Array.from({ length: itemsPerPage }).map((_, index) => (
              <tr key={index}>
                <TableShimmer span={columns?.length + 2} />
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
