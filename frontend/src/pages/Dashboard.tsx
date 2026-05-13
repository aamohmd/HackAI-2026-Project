import { Briefcase, CheckCircle, ListChecks } from "@phosphor-icons/react";
import { useAuth } from '@/hooks/useAuth';
import { getUserDisplayName } from '@/shared/lib/utils';

export default function DashboardPage() {
  const { user } = useAuth();

  const stats = [
    {
      label: 'Total Projects',
      value: '12',
      icon: Briefcase,
      color: 'text-sky-500',
      bgColor: 'bg-sky-500/10',
    },
    {
      label: 'Active Tasks',
      value: '5',
      icon: ListChecks,
      color: 'text-amber-500',
      bgColor: 'bg-amber-500/10',
    },
    {
      label: 'Completed',
      value: '48',
      icon: CheckCircle,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10',
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Welcome back, {getUserDisplayName(user)}
        </h1>
        <p className="text-muted-foreground mt-1">
          Here's what's happening with your projects today.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {stats.map((stat) => (
          <div 
            key={stat.label} 
            className="p-6 bg-card border border-border rounded-lg shadow-sm transition-all hover:border-primary/50 hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                <p className="text-3xl font-bold mt-2 text-foreground">{stat.value}</p>
              </div>
              <div className={`${stat.bgColor} p-3 rounded-lg`}>
                <stat.icon size={28} weight="bold" className={stat.color} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Placeholder for Recent Activity */}
      <div className="bg-card border border-border rounded-lg p-8 border-dashed flex flex-col items-center justify-center text-center">
        <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
          <ListChecks size={24} className="text-muted-foreground" />
        </div>
        <h3 className="font-semibold text-lg">No recent activity</h3>
        <p className="text-muted-foreground max-w-xs mt-1">
          When you start working on projects, your recent activity will show up here.
        </p>
      </div>
    </div>
  );
}
