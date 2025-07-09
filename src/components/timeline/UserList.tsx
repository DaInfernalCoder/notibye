import { useState, useEffect } from 'react';
import { Search, Clock, User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CardHeader, CardContent } from '@/components/ui/card';
import { TimelineUser } from '@/pages/Timeline';

interface UserListProps {
  selectedUser: TimelineUser | null;
  onUserSelect: (user: TimelineUser) => void;
}

export function UserList({ selectedUser, onUserSelect }: UserListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<TimelineUser[]>([]);
  const [loading, setLoading] = useState(true);

  // Mock data for now - will be replaced with actual PostHog integration
  useEffect(() => {
    const mockUsers: TimelineUser[] = [
      {
        id: '1',
        email: 'john.doe@example.com',
        name: 'John Doe',
        signupDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        lastActive: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        isActive: true
      },
      {
        id: '2',
        email: 'jane.smith@example.com', 
        name: 'Jane Smith',
        signupDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        lastActive: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        isActive: true
      },
      {
        id: '3',
        email: 'mike.johnson@example.com',
        signupDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
        lastActive: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        isActive: false
      },
      {
        id: '4',
        email: 'sarah.wilson@example.com',
        name: 'Sarah Wilson',
        signupDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        isActive: true
      }
    ];

    setTimeout(() => {
      setUsers(mockUsers);
      setLoading(false);
    }, 500);
  }, []);

  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return 'Yesterday';
    return `${diffInDays} days ago`;
  };

  return (
    <>
      <CardHeader className="pb-4">
        <div>
          <h3 className="text-lg font-semibold">New Users</h3>
          <p className="text-sm text-muted-foreground">Last 7 days</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <ScrollArea className="h-[calc(100vh-320px)]">
          {loading ? (
            <div className="p-4 space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="flex items-center gap-3 p-3">
                    <div className="w-10 h-10 bg-muted rounded-full" />
                    <div className="flex-1">
                      <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                      <div className="h-3 bg-muted rounded w-1/2" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-2">
              {filteredUsers.map((user) => (
                <div
                  key={user.id}
                  onClick={() => onUserSelect(user)}
                  className={`
                    flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors hover:bg-muted/50
                    ${selectedUser?.id === user.id ? 'bg-muted' : ''}
                  `}
                >
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium truncate">
                        {user.name || user.email.split('@')[0]}
                      </p>
                      <Badge variant={user.isActive ? 'default' : 'secondary'} className="text-xs">
                        {user.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Clock className="w-3 h-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        Joined {formatRelativeTime(user.signupDate)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}

              {filteredUsers.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <User className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No users found</p>
                </div>
              )}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </>
  );
}