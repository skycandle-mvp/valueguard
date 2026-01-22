import { notFound } from 'next/navigation';
import { incidents, companies } from '@/lib/data';
import Link from 'next/link';
import { IncidentCard } from '@/components/incident-card';
import { Button } from '@/components/ui/button';
import { Flag } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { CategoryBadge } from '@/components/category-badge';

export default function CompanyPage({ params }: { params: { name: string } }) {
  const companyName = decodeURIComponent(params.name);
  const company = companies.find(
    (c) => c.name.toLowerCase() === companyName.toLowerCase()
  );

  if (!company) {
    notFound();
  }

  const companyIncidents = incidents.filter(
    (i) => i.companyId === company.id
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold font-headline">{company.name}</h1>
          <p className="text-lg text-muted-foreground mt-1">
            档案
          </p>
        </header>

        <section className="mb-12">
           <Card className="text-center p-6 bg-secondary/50 border-0 rounded-lg">
             <h3 className="text-sm font-semibold text-muted-foreground tracking-widest uppercase">价值契合评分</h3>
             <p className="text-6xl font-bold text-primary mt-2">68</p>
             <p className="text-xs text-muted-foreground mt-2">基于 {companyIncidents.length} 起已报告事件</p>
           </Card>
        </section>

        <main>
          <h2 className="text-2xl font-bold font-headline mb-8 text-left">
            事件时间线
          </h2>
          {companyIncidents.length > 0 ? (
            <div className="relative space-y-12 before:absolute before:left-3 before:top-5 before:h-full before:w-0.5 before:bg-border/70 before:content-['']">
              {companyIncidents.map((incident) => (
                <div key={incident.id} className="relative pl-10">
                    <div className="absolute left-0 top-5 flex items-center">
                        <span className="h-6 w-6 rounded-full bg-background border-2 border-primary flex items-center justify-center">
                            <span className="h-2 w-2 rounded-full bg-primary"></span>
                        </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-1" suppressHydrationWarning>
                        {new Date(incident.date).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long' })}
                    </p>
                    <h3 className="font-headline text-2xl font-bold mb-2">
                        <Link href={`/incident/${incident.id}`} className="hover:text-primary transition-colors">{incident.title}</Link>
                    </h3>
                    <div className="flex flex-wrap gap-2 mb-3">
                        {incident.categories.map((category) => (
                            <CategoryBadge key={category} category={category} />
                        ))}
                    </div>
                     <p className="text-muted-foreground text-sm line-clamp-2">
                        {incident.description}
                    </p>
                </div>
              ))}
            </div>
          ) : (
             <div className="text-center py-16 px-6 border border-dashed rounded-lg">
                <p className="text-muted-foreground">
                    暂无该公司的事件报告。
                </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export async function generateStaticParams() {
  return companies.map((company) => ({
    name: company.name,
  }));
}
