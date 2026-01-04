interface BreadcrumbItem {
  label: string;
  onClick?: () => void;
}

interface BreadcrumbProps {
  breadcrumbItems: BreadcrumbItem[];
}

const Breadcrumb = ({ breadcrumbItems }: BreadcrumbProps) => {
    return (
        <div className="bg-blue-100 px-4 py-2 rounded-lg inline-flex items-center space-x-2 text-blue-600">
            {breadcrumbItems?.map((item: BreadcrumbItem, index: number) => (
                <div key={index} className="flex items-center gap-2">
                    <span
                        className={`text-sm cursor-pointer hover:underline ${index === breadcrumbItems.length - 1 ? "font-bold text-blue-900" : ""
                            }`}
                        onClick={item.onClick}
                    >
                        {item.label}
                    </span>
                    {index < breadcrumbItems.length - 1 && (
                        <span className="text-gray-400">{">"}</span>
                    )}
                </div>
            ))}
        </div>
    );
};

export default Breadcrumb;  