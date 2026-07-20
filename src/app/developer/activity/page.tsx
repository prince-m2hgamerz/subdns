"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, Activity } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface ActivityItem {
  id: string;
  action: string;
  details: string | null;
  ipAddress: string | null;
  createdAt: string;
}

export default function DeveloperActivity() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivity().finally(() => setLoading(false));
  }, []);

  const fetchActivity = async () => {
    const res = await fetch("/api/activity?limit=50");
    if (res.ok) {
      const data = await res.json();
      setActivities(data.activities ?? []);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Activity Logs</h1>
        <p className="text-sm text-muted-foreground">Recent API requests and account activity</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Activity Logs</CardTitle>
          <CardDescription>Recent API requests and account activity</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : activities.length === 0 ? (
            <div className="py-12 text-center">
              <Activity className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">No activity recorded yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {activities.map((a) => (
                <div key={a.id} className="flex items-start justify-between rounded-lg border px-4 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{a.action}</p>
                    {a.details && (
                      <p className="text-xs text-muted-foreground truncate">{a.details}</p>
                    )}
                  </div>
                  <div className="shrink-0 text-right ml-4">
                    <p className="text-xs text-muted-foreground">{formatDate(a.createdAt)}</p>
                    {a.ipAddress && (
                      <p className="text-[10px] text-muted-foreground">{a.ipAddress}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
