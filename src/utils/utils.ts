export const formatDate = (dateString: string | null | undefined, _formatType: string = "dd MMM yyyy"): string => {
  if (!dateString) return "-";

  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return "-"; // Return fallback if date is invalid
    }

    // Format date as "13 Jan 2025"
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "-";
  }
};
