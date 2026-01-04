interface BadgeProps {
  status: string;
  color?: string;
}

type StatusColor = "Created" | "Fulfilled" | "Cancelled" | "active" | "inactive" | "Rejected" | "Accepted";

const Badge = ({ status, color }: BadgeProps) => {
  const statusColors: Record<StatusColor, string> = {
    Created: "#B24D00",
    Fulfilled: "#009A4F",
    Cancelled: "#EF2D2E",
    active:"#009A4F",
    inactive:"#EF2D2E",
    Rejected:"#EF2D2E",
    Accepted:"#009A4F",
  };

  const badgeColor = color || statusColors[status as StatusColor] || "#B0BEC5";

  return (
    <span
      className={`px-3 inline-block  py-2  rounded-full`}
      style={{
        color: badgeColor,
        backgroundColor: `${badgeColor + "20"}`,
      }}
    >
      {status}
    </span>
  );
};

export default Badge;
