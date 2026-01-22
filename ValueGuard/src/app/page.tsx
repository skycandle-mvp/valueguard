'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { IncidentCard } from '@/components/incident-card';
import { incidents as staticIncidents } from '@/lib/data';
import { db } from '@/lib/firebase/client';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import type { Incident } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';

export default function Home() {
  const [searchTerm, setSearchTerm] = useState('');
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'incidents'), orderBy('date', 'desc'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const firestoreIncidents: Incident[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const date = data.date?.toDate ? data.date.toDate().toISOString() : new Date().toISOString();
        firestoreIncidents.push({ id: doc.id, ...(data as Omit<Incident, 'id' | 'date'>), date });
      });

      // Combine and deduplicate incidents, giving precedence to firestore data
      const combined = [...firestoreIncidents, ...staticIncidents];
      const uniqueIncidents = Array.from(new Map(combined.map(item => [item.id, item])).values());
      
      uniqueIncidents.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      setIncidents(uniqueIncidents);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredIncidents = useMemo(() => {
    if (!searchTerm) {
      return incidents;
    }
    const lowercasedTerm = searchTerm.toLowerCase();
    return incidents
      .filter(
        (incident) =>
          incident.title.toLowerCase().includes(lowercasedTerm) ||
          incident.companyName.toLowerCase().includes(lowercasedTerm) ||
          incident.categories.some((cat) =>
            cat.toLowerCase().includes(lowercasedTerm)
          )
      );
  }, [searchTerm, incidents]);

  return (
    <div className="bg-background text-foreground">
      <div className="container mx-auto px-4 pt-8 pb-24 max-w-3xl">
        <header className="text-center py-12 md:py-20">
          <h1 className="text-5xl md:text-7xl font-bold font-headline mb-4">
            ValueGuard
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            一个分享职场故事与企业问责的精选空间。
          </p>
        </header>
        
        <section id="actions" className="mb-20">
          <div className="flex justify-center">
            <Link href="/report">
              <Button size="lg" className="rounded-full">分享你的真实经历</Button>
            </Link>
          </div>
        </section>

        <section id="recent-incidents">
          {loading ? (
             <div className="space-y-16">
              {[...Array(3)].map((_, i) => <IncidentCardSkeleton key={i} />)}
            </div>
          ) : filteredIncidents.length > 0 ? (
            <div className="space-y-16">
              {filteredIncidents.map((incident) => (
                <IncidentCard key={incident.id} incident={incident} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 px-6 rounded-lg border border-dashed">
              <p className="text-muted-foreground">
                {searchTerm ? '未找到与搜索匹配的事件。' : '暂无事件，成为第一个分享故事的人。'}
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function IncidentCardSkeleton() {
  return (
    <article>
      <header className="mb-4">
        <div className="flex flex-wrap gap-2 mb-3">
          <Skeleton className="h-6 w-24 rounded-full" />
          <Skeleton className="h-6 w-32 rounded-full" />
        </div>
        <Skeleton className="h-10 w-3/4 mb-3" />
        <Skeleton className="h-5 w-1/2" />
      </header>
      <div className="space-y-2">
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-2/3" />
      </div>
      <div className="flex items-center text-primary font-semibold text-sm mt-4">
        <Skeleton className="h-5 w-32" />
      </div>
       <Separator className="mt-16"/>
    </article>
  )
}
