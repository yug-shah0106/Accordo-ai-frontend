import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Button from '../components/Button';
import { FiChevronDown, FiChevronUp, FiFilter, FiSearch, FiFileText, FiRefreshCw } from 'react-icons/fi';
import { FaMedal, FaCrown, FaGem, FaAward, FaStar, FaCheckCircle } from 'react-icons/fa';
import { authApi } from '../api';
import toast from 'react-hot-toast';

const GroupSummary = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sortConfig, setSortConfig] = useState({ key: 'agreedAmount', direction: 'asc' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [procurementData, setProcurementData] = useState({
    companies: [],
    filters: {
      status: ['All', 'In Progress', 'Completed', 'Pending'],
      dateRange: ['Last 7 days', 'Last 30 days', 'Last 90 days']
    }
  });

  // Get requisitionId from URL query parameters
  const getRequisitionId = () => {
    const urlParams = new URLSearchParams(location.search);
    return urlParams.get('requisitionId') || urlParams.get('id');
  };

  // Fetch single requisition data
  const fetchRequisitionData = async () => {
    try {
      setLoading(true);
      setError(null);
      const requisitionId = getRequisitionId();
      
      if (!requisitionId) {
        setError('Requisition ID is required in the URL parameters');
        toast.error('Requisition ID is required in the URL parameters');
        return;
      }

      const response = await authApi.get(`/requisition/get/${requisitionId}`);
      const requisition = response.data.data;

      // Get contracts that have finalContractDetails object values and status is Accepted or Rejected
      const contractsWithFinalDetails = requisition.Contract?.filter(contract => 
        contract.finalContractDetails && 
        contract.finalContractDetails.trim() !== '' &&
        contract.finalContractDetails !== 'null' &&
        contract.finalContractDetails !== '{}' &&
        (contract.status === 'Accepted' || contract.status === 'Rejected')
      ) || [];

      if (contractsWithFinalDetails.length === 0) {
        setError('No contracts with Accepted or Rejected status found for this requisition');
        toast.error('No contracts with Accepted or Rejected status found');
        return;
      }

      // Transform contract data to match the expected format
      const transformedCompanies = contractsWithFinalDetails.map((contract, index) => {
        // Use requisition's totalPrice for totalAmount
        const totalAmount = parseFloat(requisition.totalPrice) || 0;
        
        // Calculate amounts from final contract details
        const finalContractDetails = contract.finalContractDetails ? JSON.parse(contract.finalContractDetails) : {};
        const products = finalContractDetails.products || [];
        
        // Get agreed amount directly from finalContractDetails
        const agreedAmount = parseFloat(finalContractDetails.price) || 
                           parseFloat(finalContractDetails.totalPrice) || 
                           parseFloat(finalContractDetails.agreedAmount) ||
                           products.reduce((sum, product) => 
                             sum + (parseFloat(product.quotedPrice) * parseFloat(product.quantity)), 0) || 0;
        
        const savings = parseFloat(totalAmount) - parseFloat(agreedAmount);
        const savingsPercentage = parseFloat(totalAmount) > 0 ? ((parseFloat(savings) / parseFloat(totalAmount)) * 100) : 0;

        // Debug logging
        console.log('Contract calculation:', {
          contractId: contract.id,
          vendorName: contract.Vendor?.name,
          totalAmount,
          agreedAmount,
          savings,
          savingsPercentage,
          finalContractDetails
        });

        // Get delivery date from finalContractDetails
        const deliveryDate = finalContractDetails.deliveryDate || 
                           finalContractDetails.additionalTerms?.deliveryDate ||
                           contract.updatedAt ? new Date(contract.updatedAt).toISOString().split('T')[0] : 
                           new Date().toISOString().split('T')[0];

        return {
          id: contract.id,
          companyName: contract.Vendor?.name || `Vendor ${contract.vendorId}`,
          totalAmount: totalAmount,
          agreedAmount: agreedAmount,
          status: contract.finalStatus || contract.status,
          savings: savings,
          savingsPercentage: savingsPercentage,
          items: products.length,
          lastUpdated: deliveryDate,
          vendorId: contract.vendorId,
          contractStatus: contract.status
        };
      });

      setProcurementData(prev => ({
        ...prev,
        companies: transformedCompanies
      }));

    } catch (error) {
      console.error('Error fetching requisition data:', error);
      const errorMessage = error.response?.data?.message || 'Failed to fetch requisition data';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequisitionData();
  }, [location.search]);

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Sort and rank companies based on savings
  const sortedAndRankedCompanies = useMemo(() => {
    const sorted = [...procurementData.companies].sort((a, b) => {
      if (sortConfig.key === 'totalAmount') {
        return sortConfig.direction === 'asc' ? a.totalAmount - b.totalAmount : b.totalAmount - a.totalAmount;
      }
      if (sortConfig.key === 'savings') {
        return sortConfig.direction === 'asc' ? a.savings - b.savings : b.savings - a.savings;
      }
      if (sortConfig.key === 'agreedAmount') {
        return sortConfig.direction === 'asc' ? a.agreedAmount - b.agreedAmount : b.agreedAmount - a.agreedAmount;
      }
      return 0;
    });

    // Add rank based on savings
    return sorted.map((company, index) => ({
      ...company,
      rank: index + 1
    }));
  }, [procurementData.companies, sortConfig]);

  const getRankIcon = (rank) => {
    // Top 3 ranks get special medals
    if (rank === 1) {
      return <FaCrown className="text-yellow-500 w-8 h-8 opacity-20" />;
    }
    if (rank === 2) {
      return <FaGem className="text-blue-500 w-8 h-8 opacity-20" />;
    }
    if (rank === 3) {
      return <FaMedal className="text-amber-700 w-8 h-8 opacity-20" />;
    }
    
    // Ranks 4-10 get awards
    if (rank <= 10) {
      return <FaAward className="text-purple-600 w-8 h-8 opacity-20" />;
    }
    
    // Ranks 11-20 get stars
    if (rank <= 20) {
      return <FaStar className="text-green-500 w-8 h-8 opacity-20" />;
    }
    
    // All other ranks get check circles
    return <FaCheckCircle className="text-gray-400 w-8 h-8 opacity-20" />;
  };

  const getRankColor = (rank) => {
    if (rank === 1) return "text-yellow-500";
    if (rank === 2) return "text-blue-500";
    if (rank === 3) return "text-amber-700";
    if (rank <= 10) return "text-purple-600";
    if (rank <= 20) return "text-green-500";
    return "text-gray-400";
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm pt-6 px-6 pb-0 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Contract Summary</h1>
            <p className="mt-1 text-gray-600">
              {loading ? 'Loading...' : `Contracts with Accepted/Rejected Status (${procurementData.companies.length})`}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search vendors..."
                className="pl-10 pr-4 pt-2 pb-0 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              />
              <FiSearch className="absolute left-3 top-3 text-gray-400" />
            </div>
            <button className="p-2 text-gray-600 hover:text-gray-900" disabled={loading}>
              <FiFilter className="w-5 h-5" />
            </button>
            <button
              onClick={fetchRequisitionData}
              disabled={loading}
              className="p-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Refresh data"
            >
              <FiRefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="bg-white rounded-lg shadow-sm pt-12 px-12 pb-0">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <span className="ml-3 text-gray-600">Loading requisition data...</span>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-white rounded-lg shadow-sm pt-6 px-6 pb-0 mb-6">
          <div className="bg-red-50 border border-red-200 rounded-lg pt-4 px-4 pb-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error loading data</h3>
                  <p className="mt-1 text-sm text-red-700">{error}</p>
                </div>
              </div>
              <button
                onClick={fetchRequisitionData}
                disabled={loading}
                className="ml-4 flex-shrink-0 bg-red-100 hover:bg-red-200 text-red-800 px-3 pt-2 pb-0 rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FiRefreshCw className={`w-4 h-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
                Retry
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && procurementData.companies.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm pt-12 px-12 pb-0">
          <div className="text-center">
            <FiFileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No requisition found</h3>
            <p className="mt-1 text-sm text-gray-500">
              The requested requisition could not be found or may not exist.
            </p>
          </div>
        </div>
      )}

      {/* Procurement Table */}
      {!loading && procurementData.companies.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 pt-3 pb-0 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rank
                </th>
                <th className="px-6 pt-3 pb-0 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vendor Name
                </th>
                <th 
                  className="px-6 pt-3 pb-0 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('totalAmount')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Total Amount</span>
                    {sortConfig.key === 'totalAmount' && (
                      sortConfig.direction === 'asc' ? <FiChevronUp /> : <FiChevronDown />
                    )}
                  </div>
                </th>
                <th 
                  className="px-6 pt-3 pb-0 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('agreedAmount')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Agreed Amount</span>
                    {sortConfig.key === 'agreedAmount' && (
                      sortConfig.direction === 'asc' ? <FiChevronUp /> : <FiChevronDown />
                    )}
                  </div>
                </th>
                <th 
                  className="px-6 pt-3 pb-0 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('savings')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Savings</span>
                    {sortConfig.key === 'savings' && (
                      sortConfig.direction === 'asc' ? <FiChevronUp /> : <FiChevronDown />
                    )}
                  </div>
                </th>
                {/* <th className="px-6 pt-3 pb-0 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Items
                </th> */}
                <th className="px-6 pt-3 pb-0 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Agreed Delivery Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedAndRankedCompanies.map((company) => (
                <tr key={company.id} className="hover:bg-gray-50">
                  <td className="px-6 pt-4 pb-0 whitespace-nowrap text-sm text-gray-900">
                    <div className="relative flex items-center justify-center w-12 h-12">
                      {getRankIcon(company.rank)}
                      <span className={`absolute text-lg font-bold ${getRankColor(company.rank)}`}>
                        {company.rank}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 pt-4 pb-0 whitespace-nowrap text-sm font-medium text-gray-900">
                    {company.companyName}
                  </td>
                  <td className="px-6 pt-4 pb-0 whitespace-nowrap text-sm text-gray-900">
                    ₹{company.totalAmount.toLocaleString('en-IN')}
                  </td>
                  <td className="px-6 pt-4 pb-0 whitespace-nowrap text-sm text-gray-900">
                    ₹{company.agreedAmount.toLocaleString('en-IN')}
                  </td>
                  <td className="px-6 pt-4 pb-0 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className={`text-sm font-medium ${company.savings >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        ₹{company.savings.toLocaleString('en-IN')}
                      </span>
                      <span className={`text-xs ${company.savingsPercentage >= 0 ? 'text-gray-500' : 'text-red-500'}`}>
                        {company.savingsPercentage.toFixed(2)}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 pt-4 pb-0 whitespace-nowrap text-sm text-gray-500">
                    {company.lastUpdated}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default GroupSummary; 