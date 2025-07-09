import { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, Clock, Activity, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CardHeader, CardContent } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { TimelineUser, DayEvents } from '@/pages/Timeline';

interface UserTimelineProps {
  user: TimelineUser;
}

export function UserTimeline({ user }: UserTimelineProps) {
  const [timelineData, setTimelineData] = useState<DayEvents[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedDays, setExpandedDays] = useState<Set<number>>(new Set([0, 1]));

  useEffect(() => {
    // Mock timeline data - will be replaced with actual PostHog integration
    const mockTimelineData: DayEvents[] = [
      {
        day: 0,
        date: user.signupDate,
        hasActivity: true,
        events: [
          {
            id: '1',
            eventName: 'signed_up',
            timestamp: user.signupDate,
            properties: { source: 'landing_page' }
          },
          {
            id: '2',
            eventName: 'visited_dashboard',
            timestamp: new Date(new Date(user.signupDate).getTime() + 5 * 60 * 1000).toISOString(),
            properties: { page: '/dashboard' }
          },
          {
            id: '3',
            eventName: 'clicked_create_project',
            timestamp: new Date(new Date(user.signupDate).getTime() + 15 * 60 * 1000).toISOString(),
            properties: { button_location: 'main_cta' }
          }
        ]
      },
      {
        day: 1,
        date: new Date(new Date(user.signupDate).getTime() + 24 * 60 * 60 * 1000).toISOString(),
        hasActivity: true,
        events: [
          {
            id: '4',
            eventName: 'returned_to_app',
            timestamp: new Date(new Date(user.signupDate).getTime() + 24 * 60 * 60 * 1000).toISOString(),
            properties: { source: 'email_link' }
          },
          {
            id: '5',
            eventName: 'clicked_invite_team',
            timestamp: new Date(new Date(user.signupDate).getTime() + 24 * 60 * 60 * 1000 + 10 * 60 * 1000).toISOString(),
            properties: { team_size: 1 }
          }
        ]
      },
      {
        day: 2,
        date: new Date(new Date(user.signupDate).getTime() + 48 * 60 * 60 * 1000).toISOString(),
        hasActivity: false,
        events: []
      },
      {
        day: 3,
        date: new Date(new Date(user.signupDate).getTime() + 72 * 60 * 60 * 1000).toISOString(),
        hasActivity: true,
        events: [
          {
            id: '6',
            eventName: 'opened_dashboard',
            timestamp: new Date(new Date(user.signupDate).getTime() + 72 * 60 * 60 * 1000).toISOString(),
            properties: { referrer: 'direct' }
          }
        ]
      },
      {
        day: 4,
        date: new Date(new Date(user.signupDate).getTime() + 96 * 60 * 60 * 1000).toISOString(),
        hasActivity: false,
        events: []
      },
      {
        day: 5,
        date: new Date(new Date(user.signupDate).getTime() + 120 * 60 * 60 * 1000).toISOString(),
        hasActivity: false,
        events: []
      },
      {
        day: 6,
        date: new Date(new Date(user.signupDate).getTime() + 144 * 60 * 60 * 1000).toISOString(),
        hasActivity: false,
        events: []
      }
    ];

    setTimeout(() => {
      setTimelineData(mockTimelineData);
      setLoading(false);
    }, 300);
  }, [user]);

  const toggleDay = (day: number) => {
    const newExpanded = new Set(expandedDays);
    if (newExpanded.has(day)) {
      newExpanded.delete(day);
    } else {
      newExpanded.add(day);
    }
    setExpandedDays(newExpanded);
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric'
    });
  };

  const getEventIcon = (eventName: string) => {
    if (eventName.includes('signup') || eventName.includes('signed_up')) return '🎉';
    if (eventName.includes('dashboard') || eventName.includes('visit')) return '📊';
    if (eventName.includes('click')) return '👆';
    if (eventName.includes('invite') || eventName.includes('team')) return '👥';
    if (eventName.includes('return')) return '🔄';
    return '⭐';
  };

  const formatEventName = (eventName: string) => {
    return eventName
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const getLastActiveDay = () => {
    const activeDays = timelineData.filter(day => day.hasActivity);
    return activeDays.length > 0 ? Math.max(...activeDays.map(day => day.day)) : -1;
  };

  const lastActiveDay = getLastActiveDay();
  const isChurnRisk = lastActiveDay >= 0 && lastActiveDay < 6 && (6 - lastActiveDay) > 2;

  return (
    <>
      <CardHeader className="border-b">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <span className="text-xl">{getEventIcon('signup')}</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold">
                  {user.name || user.email.split('@')[0]}
                </h3>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>Joined {formatDate(user.signupDate)}</span>
              </div>
              {lastActiveDay >= 0 && (
                <div className="flex items-center gap-1">
                  <Activity className="w-4 h-4" />
                  <span>Last active Day {lastActiveDay}</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Badge variant={user.isActive ? 'default' : 'secondary'}>
              {user.isActive ? 'Active' : 'Inactive'}
            </Badge>
            {isChurnRisk && (
              <Badge variant="destructive" className="gap-1">
                <AlertCircle className="w-3 h-3" />
                Churn Risk
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <ScrollArea className="h-[calc(100vh-280px)]">
          {loading ? (
            <div className="p-6 space-y-4">
              {[...Array(7)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-16 bg-muted rounded-lg" />
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 space-y-2">
              {timelineData.map((dayData, index) => (
                <Collapsible
                  key={dayData.day}
                  open={expandedDays.has(dayData.day)}
                  onOpenChange={() => toggleDay(dayData.day)}
                >
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="ghost"
                      className={`
                        w-full justify-between p-4 h-auto hover:bg-muted/50
                        ${!dayData.hasActivity ? 'opacity-60' : ''}
                        ${dayData.day === lastActiveDay && isChurnRisk ? 'border-l-4 border-l-destructive' : ''}
                      `}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`
                          w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                          ${dayData.hasActivity ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}
                        `}>
                          {dayData.day}
                        </div>
                        <div className="text-left">
                          <div className="font-medium">Day {dayData.day}</div>
                          <div className="text-sm text-muted-foreground">
                            {formatDate(dayData.date)}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {dayData.hasActivity ? (
                          <Badge variant="outline" className="text-xs">
                            {dayData.events.length} events
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-xs">
                            No activity
                          </Badge>
                        )}
                        {expandedDays.has(dayData.day) ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </div>
                    </Button>
                  </CollapsibleTrigger>

                  {dayData.hasActivity && (
                    <CollapsibleContent className="px-4 pb-2">
                      <div className="ml-11 space-y-2">
                        {dayData.events.map((event) => (
                          <div
                            key={event.id}
                            className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                          >
                            <span className="text-lg">{getEventIcon(event.eventName)}</span>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-medium text-sm">
                                  {formatEventName(event.eventName)}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {formatTime(event.timestamp)}
                                </span>
                              </div>
                              {event.properties && Object.keys(event.properties).length > 0 && (
                                <div className="text-xs text-muted-foreground">
                                  {Object.entries(event.properties).map(([key, value]) => (
                                    <span key={key} className="mr-3">
                                      {key}: {String(value)}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CollapsibleContent>
                  )}

                  {!dayData.hasActivity && expandedDays.has(dayData.day) && (
                    <CollapsibleContent className="px-4 pb-2">
                      <div className="ml-11 p-4 text-center text-muted-foreground">
                        <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-muted flex items-center justify-center">
                          <span className="text-2xl opacity-50">😴</span>
                        </div>
                        <p className="text-sm">No activity on this day</p>
                      </div>
                    </CollapsibleContent>
                  )}
                </Collapsible>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </>
  );
}