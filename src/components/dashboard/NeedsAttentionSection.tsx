import { AlertTriangle, Clock, AlertOctagon, UserX, ExternalLink } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type {
  NeedsAttention,
  StalledNegotiation,
  ApproachingDeadline,
  EscalatedDeal,
  UnresponsiveVendor,
} from '../../types/dashboard';

interface NeedsAttentionSectionProps {
  attention: NeedsAttention | undefined;
}

/**
 * Navigate to the best available page for a deal/vendor.
 * If dealId + vendorId are present, go to the specific deal negotiation room.
 * Otherwise fall back to the requisition deals page.
 */
const openItem = (rfqId: number | undefined, vendorId: number | undefined, dealId: string | undefined) => {
  if (rfqId && vendorId && dealId) {
    window.open(`/chatbot/requisitions/${rfqId}/vendors/${vendorId}/deals/${dealId}`, '_blank');
  } else if (rfqId) {
    window.open(`/chatbot/requisitions/${rfqId}`, '_blank');
  }
};

const StalledCard = ({ items }: { items: StalledNegotiation[] }) => (
  <div className="border border-amber-200 dark:border-amber-800/40 bg-amber-50/50 dark:bg-amber-900/10 rounded-xl p-4">
    <div className="flex items-center gap-2 mb-3">
      <Clock className="w-4 h-4 text-amber-600" />
      <h4 className="text-sm font-semibold text-amber-800 dark:text-amber-400">
        Stalled Negotiations
      </h4>
      <span className="text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-1.5 py-0.5 rounded-full">
        {items.length}
      </span>
    </div>
    {items.length === 0 ? (
      <p className="text-xs text-gray-400 dark:text-dark-text-secondary">Nothing here</p>
    ) : (
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item.dealId} className="flex items-center justify-between group">
            <div className="min-w-0">
              <p className="text-sm text-gray-800 dark:text-dark-text truncate">{item.title}</p>
              <p className="text-xs text-gray-500 dark:text-dark-text-secondary">
                {item.vendorName} &middot; {item.daysSinceActivity}d inactive
              </p>
            </div>
            <button
              onClick={() => openItem(item.rfqId, item.vendorId, item.dealId)}
              className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-amber-100 dark:hover:bg-amber-900/30"
            >
              <ExternalLink className="w-3.5 h-3.5 text-amber-600" />
            </button>
          </li>
        ))}
      </ul>
    )}
  </div>
);

const DeadlineCard = ({ items }: { items: ApproachingDeadline[] }) => (
  <div className="border border-red-200 dark:border-red-800/40 bg-red-50/50 dark:bg-red-900/10 rounded-xl p-4">
    <div className="flex items-center gap-2 mb-3">
      <AlertTriangle className="w-4 h-4 text-red-600" />
      <h4 className="text-sm font-semibold text-red-800 dark:text-red-400">
        Approaching Deadlines
      </h4>
      <span className="text-xs bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-1.5 py-0.5 rounded-full">
        {items.length}
      </span>
    </div>
    {items.length === 0 ? (
      <p className="text-xs text-gray-400 dark:text-dark-text-secondary">Nothing here</p>
    ) : (
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item.dealId} className="flex items-center justify-between group">
            <div className="min-w-0">
              <p className="text-sm text-gray-800 dark:text-dark-text truncate">{item.title}</p>
              <p className="text-xs text-gray-500 dark:text-dark-text-secondary">
                {item.daysRemaining}d remaining
              </p>
            </div>
            <button
              onClick={() => openItem(item.rfqId, item.vendorId, item.dealId)}
              className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30"
            >
              <ExternalLink className="w-3.5 h-3.5 text-red-600" />
            </button>
          </li>
        ))}
      </ul>
    )}
  </div>
);

const EscalatedCard = ({ items }: { items: EscalatedDeal[] }) => (
  <div className="border border-orange-200 dark:border-orange-800/40 bg-orange-50/50 dark:bg-orange-900/10 rounded-xl p-4">
    <div className="flex items-center gap-2 mb-3">
      <AlertOctagon className="w-4 h-4 text-orange-600" />
      <h4 className="text-sm font-semibold text-orange-800 dark:text-orange-400">
        Escalated Deals
      </h4>
      <span className="text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 px-1.5 py-0.5 rounded-full">
        {items.length}
      </span>
    </div>
    {items.length === 0 ? (
      <p className="text-xs text-gray-400 dark:text-dark-text-secondary">Nothing here</p>
    ) : (
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item.dealId} className="flex items-center justify-between group">
            <div className="min-w-0">
              <p className="text-sm text-gray-800 dark:text-dark-text truncate">{item.title}</p>
              <p className="text-xs text-gray-500 dark:text-dark-text-secondary">
                {item.vendorName} &middot; {item.reason}
              </p>
            </div>
            <button
              onClick={() => openItem(item.rfqId, item.vendorId, item.dealId)}
              className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-orange-100 dark:hover:bg-orange-900/30"
            >
              <ExternalLink className="w-3.5 h-3.5 text-orange-600" />
            </button>
          </li>
        ))}
      </ul>
    )}
  </div>
);

const UnresponsiveCard = ({ items }: { items: UnresponsiveVendor[] }) => (
  <div className="border border-gray-200 dark:border-dark-border bg-gray-50/50 dark:bg-dark-bg rounded-xl p-4">
    <div className="flex items-center gap-2 mb-3">
      <UserX className="w-4 h-4 text-gray-600 dark:text-gray-400" />
      <h4 className="text-sm font-semibold text-gray-800 dark:text-dark-text">
        Unresponsive Vendors
      </h4>
      <span className="text-xs bg-gray-100 dark:bg-dark-border text-gray-600 dark:text-dark-text-secondary px-1.5 py-0.5 rounded-full">
        {items.length}
      </span>
    </div>
    {items.length === 0 ? (
      <p className="text-xs text-gray-400 dark:text-dark-text-secondary">Nothing here</p>
    ) : (
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={`${item.vendorId}-${item.dealId}`} className="flex items-center justify-between group">
            <div className="min-w-0">
              <p className="text-sm text-gray-800 dark:text-dark-text truncate">{item.vendorName}</p>
              <p className="text-xs text-gray-500 dark:text-dark-text-secondary">
                {item.daysSinceNotification}d since notification
                {item.lastNotifiedAt && (
                  <> &middot; notified {formatDistanceToNow(new Date(item.lastNotifiedAt), { addSuffix: true })}</>
                )}
              </p>
            </div>
            <button
              onClick={() => openItem(item.rfqId, item.vendorId, item.dealId)}
              className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-gray-200 dark:hover:bg-dark-border"
            >
              <ExternalLink className="w-3.5 h-3.5 text-gray-500" />
            </button>
          </li>
        ))}
      </ul>
    )}
  </div>
);

const NeedsAttentionSection = ({ attention }: NeedsAttentionSectionProps) => {
  if (!attention) return null;

  const totalCount =
    attention.stalledNegotiations.length +
    attention.approachingDeadlines.length +
    attention.escalatedDeals.length +
    attention.unresponsiveVendors.length;

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle className="w-5 h-5 text-amber-500" />
        <h2 className="text-lg font-semibold text-gray-900 dark:text-dark-text">
          Needs Attention
        </h2>
        {totalCount > 0 && (
          <span className="text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-full font-medium">
            {totalCount}
          </span>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StalledCard items={attention.stalledNegotiations} />
        <DeadlineCard items={attention.approachingDeadlines} />
        <EscalatedCard items={attention.escalatedDeals} />
        <UnresponsiveCard items={attention.unresponsiveVendors} />
      </div>
    </div>
  );
};

export default NeedsAttentionSection;
