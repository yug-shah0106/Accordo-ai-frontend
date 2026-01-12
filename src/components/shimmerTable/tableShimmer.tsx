import "./shimmer.css"

const TableShimmer = ({span}) => {
  return (
    <td className="line loading-shimmer" colSpan={span}></td>
  )
}

export default TableShimmer