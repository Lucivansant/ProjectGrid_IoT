interface StatItem {
  title: string;
  value?: string;
  change?: string;
  changeType?: string | "positive" | "warning"; // Flexibilizado
  icon?: string;
  color?: string;
  customContent?: React.ReactNode; // Permite injetar componentes complexos
}

interface StatsGridProps {
  stats: StatItem[];
}

export function StatsGrid({ stats }: StatsGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {stats.map((stat, index) => (
        <div
          key={index}
          className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-lg transition-all duration-300 min-h-[120px]"
        >
          {stat.customContent ? (
            stat.customContent
          ) : (
            <>
              <div className="flex items-center justify-between mb-3">
                <div
                  className={`w-12 h-12 bg-${stat.color}-100 rounded-lg flex items-center justify-center`}
                >
                  <svg
                    className={`w-6 h-6 text-${stat.color}-600`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d={stat.icon}
                    />
                  </svg>
                </div>
                <div
                  className={`flex items-center gap-1 text-sm font-medium ${
                    stat.changeType === "positive"
                      ? "text-green-600"
                      : "text-yellow-600"
                  }`}
                >
                  <span>{stat.change}</span>
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                    />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">
                {stat.value}
              </h3>
              <p className="text-gray-600 text-sm">{stat.title}</p>
            </>
          )}
        </div>
      ))}
    </div>
  );
}
