import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { UserProfile } from '@/lib/types';
import { cn } from '@/lib/utils';

interface UserAvatarProps {
  user: UserProfile | null;
  className?: string;
}

export function UserAvatar({ user, className }: UserAvatarProps) {
  const fallback = user?.displayName
    ? user.displayName.charAt(0).toUpperCase()
    : user?.email?.charAt(0).toUpperCase() || 'U';

  return (
    <Avatar className={cn('bg-muted', className)}>
      <AvatarImage src={user?.photoURL || ''} alt={user?.displayName || '用户'} />
      <AvatarFallback>{fallback}</AvatarFallback>
    </Avatar>
  );
}
