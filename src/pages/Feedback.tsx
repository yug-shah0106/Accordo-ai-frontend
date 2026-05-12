import { MessageSquare } from 'lucide-react';
/**
 * Feedback Page
 * Placeholder page for the Feedback feature
 */


const Feedback = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] pt-8 px-8 pb-0">
      <div className="text-center max-w-md">
        <div className="mb-6 flex justify-center">
          <div className="p-6 bg-blue-100 dark:bg-blue-900/30 rounded-full">
            <MessageSquare className="text-6xl text-blue-600 dark:text-blue-400" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-gray-800 dark:text-dark-text mb-4">
          Feedback
        </h1>
        <p className="text-gray-600 dark:text-dark-text-secondary mb-6">
          We value your feedback! This feature is coming soon.
          You'll be able to share your thoughts and suggestions to help us improve the platform.
        </p>
        <div className="inline-flex items-center px-4 pt-2 pb-0 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-lg text-sm font-medium">
          <span className="mr-2">🚧</span>
          Coming Soon
        </div>
      </div>
    </div>
  );
};

export default Feedback;
