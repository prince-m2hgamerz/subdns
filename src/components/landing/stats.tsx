"use client";

import { useState, useEffect } from "react";

export function Stats() {
  const [data, setData] = useState({ subdomains: 0, dnsRecords: 0, users: 0, uptime: 99.9 });

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/stats/public");
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch { /* silent */ }
    }
    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const stats = [
    { label: "Subdomains Created", value: data.subdomains.toLocaleString() },
    { label: "DNS Records Managed", value: data.dnsRecords.toLocaleString() },
    { label: "Active Users", value: data.users.toLocaleString() },
    { label: "Uptime", value: `${data.uptime}%` },
  ];

  return (
    <section className="section-pad border-t border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-4xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="glass glass-hover rounded-2xl p-8 text-center">
              <div className="text-4xl font-bold tracking-tight text-[#FFFFFF] sm:text-5xl">
                {stat.value}
              </div>
              <div className="mt-2 text-sm text-[#888888]">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
