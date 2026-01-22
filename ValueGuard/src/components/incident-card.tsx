import Link from 'next/link';
import type { Incident } from '@/lib/types';
import { CategoryBadge } from './category-badge';
import { ArrowRight } from 'lucide-react';
import { Separator } from './ui/separator';
import { UserAvatar } from './user-avatar';

type IncidentCardProps = {
  incident: Incident;
};

export function IncidentCard({ incident }: IncidentCardProps) {
  return (
    <Link href={`/incident/${incident.id}`} className="block group">
      <article>
        <header className="mb-4">
            <div className="flex flex-wrap gap-2 mb-3">
              {incident.categories.map((category) => (
                <CategoryBadge key={category} category={category} />
              ))}
            </div>
            <h2 className="text-3xl lg:text-4xl font-headline font-bold text-foreground group-hover:text-primary transition-colors duration-300">
              {incident.title}
            </h2>
            <div className="flex items-center gap-3 text-sm text-muted-foreground mt-2">
              <UserAvatar user={incident.user || null} className="h-6 w-6"/>
              <div>
                由 <span className="font-semibold text-foreground/80">{incident.user?.displayName || '匿名'}</span> 发布于 <span className="font-semibold text-foreground/80">{incident.companyName}</span> &bull; <span suppressHydrationWarning>{new Date(incident.date).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
            </div>
        </header>
        <p className="text-foreground/70 line-clamp-3 mb-4 font-serif text-lg">
          {incident.description}
        </p>
        <div className="flex items-center text-sm font-semibold text-primary">
          阅读完整故事 <ArrowRight className="ml-1.5 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
        </div>
        <Separator className="mt-16"/>
      </article>
    </Link>
  );
}
