import "./shimmer.css"

interface TableShimmerProps {
  span: number;
}

const TableShimmer = ({ span }: TableShimmerProps) => {
  return (
    <td className="line loading-shimmer" colSpan={span}></td>
  )
}

export default TableShimmer