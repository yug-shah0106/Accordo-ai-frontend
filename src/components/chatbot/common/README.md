# Common Chatbot Components

This directory contains reusable UI components for the chatbot module's archive functionality.

## Components

### ConfirmDialog

A reusable confirmation dialog with dark mode support.

**Props:**
- `isOpen: boolean` - Controls dialog visibility
- `title: string` - Dialog title
- `message: string` - Dialog message content
- `confirmText?: string` - Custom confirm button text (default: "Confirm")
- `cancelText?: string` - Custom cancel button text (default: "Cancel")
- `confirmButtonClass?: string` - Custom CSS classes for confirm button (default: blue button)
- `onConfirm: () => void` - Callback when confirm is clicked
- `onCancel: () => void` - Callback when cancel or close is triggered

**Features:**
- Modal overlay with centered dialog
- Close on Escape key press
- Close on overlay click
- Dark mode support
- Custom button styling for danger actions (e.g., delete, archive)
- Prevents body scroll when open

**Example Usage:**
```tsx
import { ConfirmDialog } from '@/components/chatbot/common';

function MyComponent() {
  const [isOpen, setIsOpen] = useState(false);

  const handleArchive = () => {
    // Archive logic here
    setIsOpen(false);
  };

  return (
    <>
      <button onClick={() => setIsOpen(true)}>Archive</button>

      <ConfirmDialog
        isOpen={isOpen}
        title="Archive Requisition"
        message="Are you sure you want to archive this requisition? All associated deals will also be archived."
        confirmText="Archive"
        cancelText="Cancel"
        confirmButtonClass="bg-orange-500 hover:bg-orange-600 text-white"
        onConfirm={handleArchive}
        onCancel={() => setIsOpen(false)}
      />
    </>
  );
}
```

**Danger Action Example:**
```tsx
<ConfirmDialog
  isOpen={showDelete}
  title="Delete Deal"
  message="This action cannot be undone. Are you sure?"
  confirmText="Delete"
  confirmButtonClass="bg-red-500 hover:bg-red-600 text-white"
  onConfirm={handleDelete}
  onCancel={() => setShowDelete(false)}
/>
```

### ArchiveFilterDropdown

A dropdown select component for filtering by archive status.

**Props:**
- `value: ArchiveFilter` - Current filter value ('active' | 'archived' | 'all')
- `onChange: (value: ArchiveFilter) => void` - Callback when selection changes
- `className?: string` - Additional CSS classes for positioning

**Features:**
- Three filter options: Active (default), Archived, All
- Dark mode support
- Consistent styling with other filter dropdowns
- Accepts className for custom positioning

**Example Usage:**
```tsx
import { ArchiveFilterDropdown } from '@/components/chatbot/common';
import { ArchiveFilter } from '@/types/chatbot';

function RequisitionsList() {
  const [archiveFilter, setArchiveFilter] = useState<ArchiveFilter>('active');

  const handleFilterChange = (newFilter: ArchiveFilter) => {
    setArchiveFilter(newFilter);
    // Refetch data with new filter
  };

  return (
    <div className="flex gap-4">
      <ArchiveFilterDropdown
        value={archiveFilter}
        onChange={handleFilterChange}
        className="w-40"
      />
    </div>
  );
}
```

## API Service Methods

### Archive Requisition
```typescript
import { chatbotService } from '@/services/chatbot.service';

// Archive a requisition (cascades to all deals)
const result = await chatbotService.archiveRequisition(rfqId);
console.log(`Archived requisition with ${result.data.archivedDealsCount} deals`);
```

### Unarchive Requisition
```typescript
// Unarchive a requisition (optionally unarchive deals)
const result = await chatbotService.unarchiveRequisition(rfqId, true);
console.log(`Unarchived requisition with ${result.data.unarchivedDealsCount} deals`);

// Unarchive requisition but keep deals archived
const result2 = await chatbotService.unarchiveRequisition(rfqId, false);
```

### Query with Archive Filter
```typescript
// Get requisitions with archive filter
const { data } = await chatbotService.getRequisitionsWithDeals({
  archived: 'active', // or 'archived' or 'all'
  page: 1,
  limit: 10,
});

// Get deals for a requisition with archive filter
const { data: dealsData } = await chatbotService.getRequisitionDeals(rfqId, {
  archived: 'archived',
  status: 'ACCEPTED',
});
```

## Type Definitions

```typescript
export type ArchiveFilter = 'active' | 'archived' | 'all';

export interface RequisitionsQueryParams {
  projectId?: number;
  status?: 'active' | 'completed' | 'all';
  archived?: ArchiveFilter;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: 'createdAt' | 'deadline' | 'vendorCount' | 'completionPercentage';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface RequisitionDealsQueryParams {
  status?: DealStatus;
  archived?: ArchiveFilter;
  sortBy?: 'status' | 'lastActivity' | 'utilityScore' | 'vendorName';
  sortOrder?: 'asc' | 'desc';
}
```

## Full Example: Requisitions List with Archive

```tsx
import { useState, useEffect } from 'react';
import { ConfirmDialog, ArchiveFilterDropdown } from '@/components/chatbot/common';
import { chatbotService } from '@/services/chatbot.service';
import { ArchiveFilter } from '@/types/chatbot';
import toast from 'react-hot-toast';

function RequisitionsPage() {
  const [requisitions, setRequisitions] = useState([]);
  const [archiveFilter, setArchiveFilter] = useState<ArchiveFilter>('active');
  const [confirmArchive, setConfirmArchive] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadRequisitions();
  }, [archiveFilter]);

  const loadRequisitions = async () => {
    setLoading(true);
    try {
      const { data } = await chatbotService.getRequisitionsWithDeals({
        archived: archiveFilter,
        page: 1,
        limit: 20,
      });
      setRequisitions(data.requisitions);
    } catch (error) {
      toast.error('Failed to load requisitions');
    } finally {
      setLoading(false);
    }
  };

  const handleArchive = async () => {
    if (!confirmArchive) return;

    try {
      const result = await chatbotService.archiveRequisition(confirmArchive);
      toast.success(`Archived requisition with ${result.data.archivedDealsCount} deals`);
      setConfirmArchive(null);
      loadRequisitions(); // Refresh list
    } catch (error) {
      toast.error('Failed to archive requisition');
    }
  };

  const handleUnarchive = async (rfqId: number) => {
    try {
      const result = await chatbotService.unarchiveRequisition(rfqId, true);
      toast.success(`Unarchived requisition with ${result.data.unarchivedDealsCount} deals`);
      loadRequisitions();
    } catch (error) {
      toast.error('Failed to unarchive requisition');
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Requisitions</h1>

        <ArchiveFilterDropdown
          value={archiveFilter}
          onChange={setArchiveFilter}
          className="w-40"
        />
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="space-y-4">
          {requisitions.map((req) => (
            <div key={req.id} className="p-4 border rounded-lg">
              <h3>{req.title}</h3>
              <p>{req.rfqNumber}</p>

              {req.archivedAt ? (
                <button
                  onClick={() => handleUnarchive(req.id)}
                  className="mt-2 px-3 py-1 bg-green-500 text-white rounded"
                >
                  Unarchive
                </button>
              ) : (
                <button
                  onClick={() => setConfirmArchive(req.id)}
                  className="mt-2 px-3 py-1 bg-orange-500 text-white rounded"
                >
                  Archive
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        isOpen={confirmArchive !== null}
        title="Archive Requisition"
        message="Are you sure you want to archive this requisition? All associated deals will also be archived."
        confirmText="Archive"
        confirmButtonClass="bg-orange-500 hover:bg-orange-600 text-white"
        onConfirm={handleArchive}
        onCancel={() => setConfirmArchive(null)}
      />
    </div>
  );
}
```

## Styling

All components support dark mode using Tailwind CSS dark mode classes:
- `dark:bg-dark-surface` - Dark mode background
- `dark:border-dark-border` - Dark mode borders
- `dark:text-dark-text` - Dark mode primary text
- `dark:text-dark-text-secondary` - Dark mode secondary text

Components follow the existing design system:
- Consistent padding: `px-4 pt-2 pb-0`
- Border radius: `rounded-md`
- Focus ring: `focus:ring-2 focus:ring-blue-500`
- Transition effects on hover states
