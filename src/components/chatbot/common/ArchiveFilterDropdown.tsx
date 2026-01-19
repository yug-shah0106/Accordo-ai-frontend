import { ArchiveFilter } from "../../../types/chatbot";

interface ArchiveFilterDropdownProps {
  value: ArchiveFilter;
  onChange: (value: ArchiveFilter) => void;
  className?: string;
}

export default function ArchiveFilterDropdown({
  value,
  onChange,
  className = "",
}: ArchiveFilterDropdownProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as ArchiveFilter)}
      className={`border border-gray-300 dark:border-dark-border px-4 pt-2 pb-0 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-dark-surface text-gray-700 dark:text-dark-text ${className}`}
    >
      <option value="active">Active</option>
      <option value="archived">Archived</option>
      <option value="all">All</option>
    </select>
  );
}
