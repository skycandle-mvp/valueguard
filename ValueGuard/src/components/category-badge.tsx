import { Badge } from '@/components/ui/badge';
import { CategoryIcons, CategoryLabels } from '@/components/icons';

type CategoryBadgeProps = {
  category: string;
  className?: string;
};

export function CategoryBadge({ category, className }: CategoryBadgeProps) {
  const Icon =
    CategoryIcons[category as keyof typeof CategoryIcons] ||
    CategoryIcons['Other'];
  const label = CategoryLabels[category] || category;

  return (
    <Badge variant="secondary" className={className}>
      <Icon className="h-3 w-3 mr-1.5" />
      {label}
    </Badge>
  );
}
