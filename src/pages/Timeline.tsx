import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { UserList } from '@/components/timeline/UserList';
import { UserTimeline } from '@/components/timeline/UserTimeline';

export interface TimelineUser {
  id: string;
  email: string;
  name?: string;
  signupDate: string;
  lastActive?: string;
  isActive: boolean;
}

export interface TimelineEvent {
  id: string;
  eventName: string;
  timestamp: string;
  properties?: Record<string, any>;
}

export interface DayEvents {
  day: number;
  date: string;
  events: TimelineEvent[];
  hasActivity: boolean;
}

export default function Timeline() {
  const [selectedUser, setSelectedUser] = useState<TimelineUser | null>(null);

  return (
    <div className="h-full">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">User Timeline</h1>
        <p className="text-muted-foreground">
          Track what new users did in their first 7 days based on PostHog events
        </p>
      </div>

      <div className="grid grid-cols-12 gap-6 h-[calc(100vh-200px)]">
        {/* Left Sidebar - User List */}
        <div className="col-span-4">
          <Card className="h-full">
            <UserList 
              selectedUser={selectedUser}
              onUserSelect={setSelectedUser}
            />
          </Card>
        </div>

        {/* Right Panel - Timeline View */}
        <div className="col-span-8">
          <Card className="h-full">
            {selectedUser ? (
              <UserTimeline user={selectedUser} />
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                    <span className="text-2xl">👤</span>
                  </div>
                  <h3 className="text-lg font-medium mb-2">Select a User</h3>
                  <p>Choose a user from the left panel to view their 7-day timeline</p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}