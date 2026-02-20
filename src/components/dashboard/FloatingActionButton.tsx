import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, FileText, MessageSquare } from 'lucide-react';

const FloatingActionButton = () => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const actions = [
    {
      label: 'New Requisition',
      icon: FileText,
      onClick: () => navigate('/requisition-management/create-requisition'),
    },
    {
      label: 'Start Negotiation',
      icon: MessageSquare,
      onClick: () => navigate('/chatbot/requisitions'),
    },
  ];

  return (
    <div ref={containerRef} className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
      {open && (
        <div className="flex flex-col gap-2 mb-2">
          {actions.map((action) => (
            <button
              key={action.label}
              onClick={() => {
                action.onClick();
                setOpen(false);
              }}
              className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-lg shadow-lg hover:bg-gray-50 dark:hover:bg-dark-bg transition-colors whitespace-nowrap"
            >
              <action.icon className="w-4 h-4 text-primary-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-dark-text">
                {action.label}
              </span>
            </button>
          ))}
        </div>
      )}
      <button
        onClick={() => setOpen(!open)}
        className="w-12 h-12 rounded-full bg-primary-500 hover:bg-primary-600 text-white shadow-lg flex items-center justify-center transition-all"
        aria-label="Quick actions"
      >
        <Plus
          className={`w-6 h-6 transition-transform duration-200 ${open ? 'rotate-45' : ''}`}
        />
      </button>
    </div>
  );
};

export default FloatingActionButton;
