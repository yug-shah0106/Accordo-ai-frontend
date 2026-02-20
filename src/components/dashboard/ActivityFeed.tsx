import { formatDistanceToNow } from 'date-fns';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  MessageSquare,
  FileText,
  Send,
  ExternalLink,
} from 'lucide-react';
import type { ActivityItem, ActivityType } from '../../types/dashboard';

interface ActivityFeedProps {
  activities: ActivityItem[] | undefined;
}

const iconMap: Record<ActivityType, { icon: typeof CheckCircle2; bg: string; color: string }> = {
  deal_accepted: { icon: CheckCircle2, bg: 'bg-emerald-50 dark:bg-emerald-900/20', color: 'text-emerald-600' },
  deal_walked_away: { icon: XCircle, bg: 'bg-red-50 dark:bg-red-900/20', color: 'text-red-600' },
  deal_escalated: { icon: AlertTriangle, bg: 'bg-amber-50 dark:bg-amber-900/20', color: 'text-amber-600' },
  deal_started: { icon: MessageSquare, bg: 'bg-blue-50 dark:bg-blue-900/20', color: 'text-blue-600' },
  requisition_created: { icon: FileText, bg: 'bg-purple-50 dark:bg-purple-900/20', color: 'text-purple-600' },
  contract_sent: { icon: Send, bg: 'bg-indigo-50 dark:bg-indigo-900/20', color: 'text-indigo-600' },
};

const getActivityUrl = (activity: ActivityItem): string | null => {
  if (activity.entityType === 'deal' && activity.rfqId && activity.vendorId && activity.dealId) {
    return `/chatbot/requisitions/${activity.rfqId}/vendors/${activity.vendorId}/deals/${activity.dealId}`;
  }
  if (activity.entityType === 'requisition' && activity.rfqId) {
    return `/chatbot/requisitions/${activity.rfqId}`;
  }
  return null;
};

const ActivityCard = ({ activity }: { activity: ActivityItem }) => {
  const config = iconMap[activity.type] || iconMap.deal_started;
  const Icon = config.icon;
  const url = getActivityUrl(activity);

  return (
    <div className="group flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-bg transition-colors">
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${config.bg}`}>
        <Icon className={`w-4 h-4 ${config.color}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-dark-text truncate">
          {activity.title}
        </p>
        <p className="text-xs text-gray-500 dark:text-dark-text-secondary mt-0.5 line-clamp-2">
          {activity.description}
        </p>
        <p className="text-xs text-gray-400 dark:text-dark-text-secondary mt-1">
          {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
        </p>
      </div>
      {url && (
        <button
          onClick={() => window.open(url, '_blank')}
          className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-gray-200 dark:hover:bg-dark-border"
          title="View"
        >
          <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
        </button>
      )}
    </div>
  );
};

const ActivityFeed = ({ activities }: ActivityFeedProps) => {
  return (
    <div className="border border-gray-100 dark:border-dark-border rounded-xl p-5 bg-white dark:bg-dark-surface">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-dark-text mb-3">
        Recent Activity
      </h3>
      <div className="max-h-80 overflow-y-auto -mx-2 px-2 space-y-0.5">
        {!activities || activities.length === 0 ? (
          <p className="text-sm text-gray-400 dark:text-dark-text-secondary text-center py-8">
            No recent activity
          </p>
        ) : (
          activities.map((a) => <ActivityCard key={a.id} activity={a} />)
        )}
      </div>
    </div>
  );
};

export default ActivityFeed;
