'use client';
import Link from 'next/link';
import { notFound, useParams } from 'next/navigation';
import { incidents } from '@/lib/data';
import { RequestReviewForm } from '@/components/request-review-form';
import { Comments } from '@/components/comments';
import { useEffect, useState } from 'react';
import type { Incident } from '@/lib/types';
import { db } from '@/lib/firebase/client';
import { doc, onSnapshot } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { CategoryBadge } from '@/components/category-badge';
import { UserAvatar } from '@/components/user-avatar';
import { Separator } from '@/components/ui/separator';

export default function IncidentPage() {
  const params = useParams<{ id: string }>();
  const [incident, setIncident] = useState<Incident | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!params.id) return;

    const staticIncident = incidents.find((i) => i.id === params.id);
    if (staticIncident) {
        setIncident(staticIncident);
    }
    
    const unsub = onSnapshot(doc(db, "incidents", params.id), (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        const date = data.date?.toDate ? data.date.toDate().toISOString() : new Date().toISOString();
        setIncident({...(data as Incident), date });
      } else {
        if (!staticIncident) notFound();
      }
      setLoading(false);
    });
    
    return () => unsub();

  }, [params.id]);

  if (loading) {
    return <IncidentPageSkeleton />;
  }
  
  if (!incident) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <article className="font-serif">
          <header className="mb-12 text-center">
            <div className="flex flex-wrap gap-2 justify-center mb-4">
              {incident.categories.map((category) => (
                <CategoryBadge key={category} category={category} />
              ))}
            </div>
            <h1 className="text-4xl md:text-6xl font-bold font-headline text-foreground mb-6">
              {incident.title}
            </h1>
            <div className="flex items-center justify-center gap-3 text-sm text-muted-foreground">
                <UserAvatar user={incident.user || null} className="h-8 w-8"/>
                <div>
                  <span>由 {incident.user?.displayName || '匿名贡献者'} 发布</span>
                  <span className='mx-2'>&bull;</span>
                   <Link href={`/company/${incident.companyName}`} className="hover:underline">
                      {incident.companyName}
                    </Link>
                </div>
            </div>
          </header>
          
          <div className="prose prose-lg prose-p:font-serif max-w-none text-foreground/80 dark:prose-invert mx-auto">
            <p className="text-lg leading-relaxed">{incident.description}</p>
          </div>
        </article>

        <Separator className="my-16" />

        <Comments incidentId={incident.id} />
        
        <Separator className="my-16" />

        <RequestReviewForm incidentId={incident.id} />
      </div>
    </div>
  );
}

function IncidentPageSkeleton() {
  return (
     <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto">
         <header className="mb-12 text-center">
            <div className="flex flex-wrap gap-2 justify-center mb-4">
              <Skeleton className="h-6 w-24 rounded-full" />
              <Skeleton className="h-6 w-28 rounded-full" />
            </div>
            <Skeleton className="h-12 w-3/4 mx-auto mb-6" />
            <div className="flex items-center justify-center gap-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-5 w-56" />
            </div>
          </header>
          
          <div className="space-y-4 max-w-2xl mx-auto">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-5/6" />
          </div>
      </div>
    </div>
  )
}
