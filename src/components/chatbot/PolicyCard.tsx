/**
 * PolicyCard Component
 * Displays vendor policy information (HARD/SOFT/WALK_AWAY)
 */

import { VendorPolicyType } from '../../types';

interface PolicyCardProps {
  policy: VendorPolicyType;
  description?: string;
}

export default function PolicyCard({ policy, description }: PolicyCardProps) {
  const getPolicyColor = () => {
    switch (policy) {
      case 'HARD':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'SOFT':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'WALK_AWAY':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getPolicyDescription = () => {
    if (description) return description;

    switch (policy) {
      case 'HARD':
        return 'Vendor has minimal flexibility. Expect tough negotiations with small concessions.';
      case 'SOFT':
        return 'Vendor is flexible and willing to negotiate. Good opportunity for favorable terms.';
      case 'WALK_AWAY':
        return 'Vendor is unlikely to meet our requirements. May need to walk away.';
      default:
        return 'Policy type unknown';
    }
  };

  return (
    <div className="rounded-lg border bg-white p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Vendor Policy</h3>

      <div className={`inline-flex items-center px-4 py-2 rounded-full font-medium border mb-4 ${getPolicyColor()}`}>
        {policy}
      </div>

      <p className="text-sm text-gray-600 leading-relaxed">
        {getPolicyDescription()}
      </p>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          Policy determines negotiation strategy and concession patterns
        </p>
      </div>
    </div>
  );
}
