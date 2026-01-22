'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth-provider';
import { ReportIncidentForm } from '@/components/report-incident-form';
import Loading from '@/app/loading';

export default function ReportPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login?redirect=/report');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return <Loading />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold font-headline">倾诉室</h1>
          <p className="text-muted-foreground mt-2 text-lg">
            你的声音很重要，请诚信地分享你的故事。
          </p>
        </div>
        <ReportIncidentForm />
      </div>
    </div>
  );
}
