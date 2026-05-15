import { Briefcase, CheckCircle, ListChecks } from "@phosphor-icons/react";
import { useAuth } from '@/features/auth';
import { getUserDisplayName } from '@/shared/lib/utils';
import { BentoGrid, BentoCard } from "@/shared/ui/Bento";
import { PageHeader } from '@/components/layout/PageHeader';
import { PageContainer } from '@/components/layout/PageContainer';

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
    <PageContainer maxWidth="xl">
      <PageHeader 
        title={`Welcome back, ${getUserDisplayName(user)}`}
        description="Here's what's happening with your projects today."
      />

      <BentoGrid>
        {stats.map((stat) => (
          <BentoCard key={stat.label} span={4}>
            <div className="flex items-center justify-between h-full">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                <p className="text-3xl font-bold mt-2 text-foreground">{stat.value}</p>
              </div>
              <div className={`${stat.bgColor} p-3 rounded-lg`}>
                <stat.icon size={28} weight="bold" className={stat.color} />
              </div>
            </div>
          </BentoCard>
        ))}

        {/* Placeholder for Recent Activity */}
        <BentoCard span={12} className="py-16 border-dashed relative z-10">
          <div className="flex items-center justify-center gap-8 max-w-xl mx-auto px-6">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center shrink-0 ring-1 ring-border/50">
              <ListChecks size={32} className="text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-xl text-foreground tracking-tight">No recent activity</h3>
              <p className="text-muted-foreground leading-relaxed">
                When you start working on projects, your recent activity will show up here.
              </p>
            </div>
          </div>
        </BentoCard>
      </BentoGrid>
    </PageContainer>
  );
}
