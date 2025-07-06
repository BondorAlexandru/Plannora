import React from 'react';

export interface BudgetImpact {
  vendor: {
    id: string;
    name: string;
    price: number;
  };
  impact: string;
  isPositive: boolean;
}

export interface BudgetSuggestion {
  category: string;
  suggestion: string;
  minPrice: number;
  action?: () => void;
}

interface BudgetInsightsProps {
  budget: number;
  currentTotal: number;
  percentUsed: number;
  budgetRemaining: number;
  isOverBudget: boolean;
  budgetImpact?: BudgetImpact | null;
  showBudgetAlert?: boolean;
  budgetSuggestions?: BudgetSuggestion[];
  onAdjustBudget?: () => void;
  title?: string;
  className?: string;
  isCollapsible?: boolean;
}

const BudgetInsights: React.FC<BudgetInsightsProps> = ({
  budget,
  currentTotal,
  percentUsed,
  budgetRemaining,
  isOverBudget,
  budgetImpact,
  showBudgetAlert = false,
  budgetSuggestions = [],
  onAdjustBudget,
  title = "Budget Summary",
  className = "",
  isCollapsible = true,
}) => {
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  if (budget <= 0) {
    return null;
  }

  const getBudgetColor = () => {
    if (percentUsed <= 70) return "bg-green-500";
    if (percentUsed <= 90) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getTextColor = () => {
    if (isOverBudget) return "text-red-500";
    return "text-green-500";
  };

  return (
    <div className={`bg-white rounded-xl shadow-lg p-6 ${className}`}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm text-gray-600">Your Budget</p>
            <p className="text-xl font-bold text-blue-600">
              ${budget.toLocaleString()}
            </p>
          </div>
          {isCollapsible && (
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="bg-gray-100 p-2 rounded-full hover:bg-gray-200 transition-colors"
              aria-label={isCollapsed ? "Expand budget panel" : "Collapse budget panel"}
            >
              {isCollapsed ? (
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Always visible budget progress bar */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <p className="text-sm text-gray-600">
            Current: ${currentTotal.toLocaleString()}
          </p>
          <p className="text-sm text-gray-600">
            Remaining: ${budgetRemaining.toLocaleString()}
          </p>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4">
          <div
            className={`h-4 rounded-full transition-all duration-300 ${getBudgetColor()}`}
            style={{ width: `${Math.min(percentUsed, 100)}%` }}
          />
        </div>
        <div className="flex justify-between text-xs mt-1 text-gray-500">
          <span>0%</span>
          <span>50%</span>
          <span>100%</span>
        </div>
        <div className="text-center mt-2">
          <span className={`text-sm font-medium ${getTextColor()}`}>
            {percentUsed.toFixed(1)}% used
          </span>
        </div>
      </div>

      {/* Collapsible content */}
      <div className={`transition-all duration-300 overflow-hidden ${
        isCollapsed ? 'max-h-0 opacity-0' : 'max-h-[2000px] opacity-100'
      }`}>
        {/* Detailed budget breakdown */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Current Total</p>
            <p className={`text-lg font-bold ${getTextColor()}`}>
              ${currentTotal.toLocaleString()}
            </p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Remaining</p>
            <p className={`text-lg font-bold ${getTextColor()}`}>
              ${budgetRemaining.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Budget impact alert */}
        {budgetImpact && (
          <div
            className={`rounded-lg p-4 mb-4 flex items-start ${
              budgetImpact.isPositive
                ? "bg-green-50 border border-green-100"
                : "bg-yellow-50 border border-yellow-100"
            }`}
          >
            <span className="mr-2 text-lg">
              {budgetImpact.isPositive ? "✅" : "⚠️"}
            </span>
            <div className="flex-1">
              <p
                className={`font-medium ${
                  budgetImpact.isPositive ? "text-green-700" : "text-yellow-700"
                }`}
              >
                {budgetImpact.vendor.name}
              </p>
              <p
                className={`text-sm ${
                  budgetImpact.isPositive ? "text-green-600" : "text-yellow-600"
                }`}
              >
                {budgetImpact.impact}
              </p>
            </div>
          </div>
        )}

        {/* Over budget alert */}
        {isOverBudget && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <div className="flex items-start">
              <span className="text-red-500 mr-2 text-lg">🚨</span>
              <div className="flex-1">
                <p className="text-red-700 font-medium">Over Budget!</p>
                <p className="text-red-600 text-sm">
                  Your selections exceed your budget by ${(currentTotal - budget).toLocaleString()}.
                  Consider removing some vendors or adjusting your budget.
                </p>
                {onAdjustBudget && (
                  <button
                    onClick={onAdjustBudget}
                    className="mt-2 bg-red-100 hover:bg-red-200 text-red-700 py-1 px-3 rounded-md text-sm transition-colors"
                  >
                    Adjust Budget
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Budget alert */}
        {showBudgetAlert && !isOverBudget && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <div className="flex items-start">
              <span className="text-yellow-500 mr-2 text-lg">⚠️</span>
              <div>
                <p className="text-yellow-700 font-medium">Budget Warning</p>
                <p className="text-yellow-600 text-sm">
                  You're using {percentUsed.toFixed(1)}% of your budget!
                  Choose remaining services carefully.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Budget suggestions */}
        {budgetSuggestions.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-blue-800 mb-3 flex items-center">
              <span className="mr-2">💡</span>
              Budget Insights
            </h3>
            <div className="space-y-3">
              {budgetSuggestions.map((suggestion, index) => (
                <div key={index} className="flex items-start">
                  <div className="flex-1">
                    <p className="font-medium text-gray-800 capitalize">
                      {suggestion.category}
                    </p>
                    <p className="text-sm text-gray-600">
                      {suggestion.suggestion}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Starting from ${suggestion.minPrice.toLocaleString()}
                    </p>
                  </div>
                  {suggestion.action && (
                    <button
                      onClick={suggestion.action}
                      className="text-sm text-blue-600 hover:text-blue-800 font-medium underline"
                    >
                      View Options
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BudgetInsights; 