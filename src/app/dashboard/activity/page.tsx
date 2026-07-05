"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ActivityItem {
  id: string;
  event: string;
  metadata: string | null;
  ip: string | null;
  userAgent: string | null;
  createdAt: string;
}

export default function ActivityPage() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchActivity = useCallback(async () => {
    try {
      const res = await fetch("/api/activity");
      if (!res.ok) throw new Error("Failed to load");
      const data = await res.json();
      setActivities(data.activities);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchActivity();
  }, [fetchActivity]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Activity</h1>
        <p className="text-sm text-muted-foreground">Your recent events and changes</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Event Log</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="py-8 text-center text-sm text-muted-foreground">Loading...</p>
          ) : activities.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No activity yet.
            </p>
          ) : (
            <div className="space-y-2">
              {activities.map((event) => (
                <div
                  key={event.id}
                  className="flex flex-wrap items-center gap-2 justify-between rounded-lg border border-border px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{event.event}</p>
                    <p className="mt-0.5 break-words text-xs text-muted-foreground">
                      {event.ip ? `IP: ${event.ip}` : ""}
                      {event.metadata
                        ? ` | ${JSON.stringify(event.metadata).slice(0, 80)}`
                        : ""}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(event.createdAt).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
