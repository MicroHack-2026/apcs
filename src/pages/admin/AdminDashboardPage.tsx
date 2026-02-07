import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { LayoutShell } from "@/components/LayoutShell";
import { useAdminStats, useRecentActivity, useUpcomingAppointments } from "@/hooks/useStats";
import { generateChartData } from "@/lib/mockData";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Pie,
  PieChart,
  XAxis,
} from "recharts";
import { Map, type MapRef, type MapMarker } from "@/components/ui/map";
import { useContainers } from "@/hooks/useContainers";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
  TrendingUp,
  TrendingDown,
  Box,
  CalendarCheck,
  Building2,
  ScanLine,
  CheckCircle2,
  AlertCircle,
  Info,
  ArrowRight,
} from "lucide-react";

/* ─── Chart configs ──────────────────────────────────────── */

const areaChartConfig = {
  appointments: {
    label: "Appointments",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

const barChartConfig = {
  arrived: {
    label: "Arrived",
    color: "hsl(var(--chart-2))",
  },
  notArrived: {
    label: "Not Arrived",
    color: "hsl(var(--chart-3))",
  },
} satisfies ChartConfig;

const pieChartConfig = {
  value: {
    label: "Count",
  },
  arrived: {
    label: "Arrived",
    color: "hsl(var(--chart-2))",
  },
  notArrived: {
    label: "Not Arrived",
    color: "hsl(var(--chart-3))",
  },
  scheduled: {
    label: "Scheduled",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

/* ─── Animated counter hook ──────────────────────────────── */

function useAnimatedNumber(target: number, duration = 800) {
  const [display, setDisplay] = useState(0);
  const prevRef = useRef(0);

  useEffect(() => {
    const from = prevRef.current;
    const diff = target - from;
    if (diff === 0) return;

    const start = performance.now();

    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(from + diff * eased);
      setDisplay(current);

      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        prevRef.current = target;
      }
    };

    requestAnimationFrame(tick);
  }, [target, duration]);

  return display;
}

/* ─── Stagger animation wrapper ──────────────────────────── */

function StaggerItem({ index, children, className }: { index: number; children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn("opacity-0 translate-y-3", className)}
      style={{
        animation: `section-fade-in 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards`,
        animationDelay: `${index * 80}ms`,
      }}
    >
      {children}
    </div>
  );
}

/* ─── Main Dashboard ─────────────────────────────────────── */

export default function AdminDashboardPage() {
  const { data: stats, isLoading: statsLoading } = useAdminStats();
  const { data: recentActivity = [], isLoading: activityLoading } = useRecentActivity();
  const { data: upcomingAppointments = [] } = useUpcomingAppointments();
  const { data: containers = [] } = useContainers();

  const [chartData, setChartData] = useState(() => generateChartData(14));
  const [chartRange, setChartRange] = useState<7 | 14 | 30>(14);
  const [secondsAgo, setSecondsAgo] = useState(0);
  const [liveKpi, setLiveKpi] = useState<typeof stats | null>(null);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const kpiRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mapRef = useRef<MapRef>(null);

  const isLoading = statsLoading || activityLoading;

  useEffect(() => {
    if (stats && !liveKpi) setLiveKpi({ ...stats });
  }, [stats, liveKpi]);

  useEffect(() => {
    setChartData(generateChartData(chartRange));
  }, [chartRange]);

  const nudgeKpi = useCallback(() => {
    setLiveKpi((prev) => {
      if (!prev) return prev;
      const nudge = (v: number) => v + (Math.random() > 0.6 ? 1 : 0);
      return {
        ...prev,
        totalContainers: nudge(prev.totalContainers),
        appointmentsScheduled: Math.random() > 0.5 ? nudge(prev.appointmentsScheduled) : prev.appointmentsScheduled,
        arrivedCount: Math.random() > 0.5 ? nudge(prev.arrivedCount) : prev.arrivedCount,
      };
    });
    setChartData((prev) => {
      const updated = [...prev];
      const last = { ...updated[updated.length - 1] };
      last.appointments += Math.random() > 0.6 ? 1 : 0;
      last.arrived += Math.random() > 0.5 ? 1 : 0;
      updated[updated.length - 1] = last;
      return updated;
    });
    setSecondsAgo(0);
  }, []);

  useEffect(() => {
    kpiRef.current = setInterval(nudgeKpi, 5000);
    tickRef.current = setInterval(() => setSecondsAgo((s) => s + 1), 1000);
    return () => {
      if (kpiRef.current) clearInterval(kpiRef.current);
      if (tickRef.current) clearInterval(tickRef.current);
    };
  }, [nudgeKpi]);

  const kpi = liveKpi || stats;

  // Pie data for ChartContainer
  const pieData = useMemo(() => {
    if (!kpi) return [];
    return [
      { status: "arrived", value: kpi.arrivedCount, fill: "var(--color-arrived)" },
      { status: "notArrived", value: kpi.notArrivedCount, fill: "var(--color-notArrived)" },
      { status: "scheduled", value: kpi.appointmentsScheduled, fill: "var(--color-scheduled)" },
    ];
  }, [kpi]);

  // Map markers from containers
  const mapMarkers: MapMarker[] = useMemo(() => {
    return containers
      .filter((c) => c.lat !== undefined && c.lng !== undefined)
      .map((c) => ({
        id: c.id,
        lng: c.lng!,
        lat: c.lat!,
        color: c.arrived ? "hsl(142 70% 45%)" : "hsl(0 72% 51%)",
        popup: `<strong>${c.id}</strong><br/>${c.port || "Unknown"}<br/>${c.arrived ? "✅ Arrived" : "⏳ Not Arrived"}`,
      }));
  }, [containers]);

  // Animated numbers
  const animTotal = useAnimatedNumber(kpi?.totalContainers ?? 0);
  const animArrived = useAnimatedNumber(kpi?.arrivedCount ?? 0);
  const animNotArrived = useAnimatedNumber(kpi?.notArrivedCount ?? 0);
  const animAppointments = useAnimatedNumber(kpi?.appointmentsScheduled ?? 0);
  const animEnterprises = useAnimatedNumber(kpi?.totalEnterprises ?? 0);
  const animScans = useAnimatedNumber(kpi ? Math.floor(kpi.arrivedCount * 0.8) : 0);

  if (isLoading || !kpi) {
    return (
      <LayoutShell showSidebar={true} role="ADMIN">
        <div className="py-16 text-center text-muted-foreground">
          Loading dashboard...
        </div>
      </LayoutShell>
    );
  }

  const arrivalRate = Math.round((kpi.arrivedCount / kpi.totalContainers) * 100);

  const segments = [
    { label: "Arrived", value: kpi.arrivedCount, percent: Math.round((kpi.arrivedCount / kpi.totalContainers) * 100), color: "bg-green-500" },
    { label: "Not Arrived", value: kpi.notArrivedCount, percent: Math.round((kpi.notArrivedCount / kpi.totalContainers) * 100), color: "bg-red-400" },
    { label: "Scheduled", value: kpi.appointmentsScheduled, percent: Math.round((kpi.appointmentsScheduled / kpi.totalContainers) * 100), color: "bg-indigo-500" },
    { label: "Enterprises", value: kpi.totalEnterprises, percent: Math.round((kpi.totalEnterprises / kpi.totalContainers) * 100), color: "bg-violet-500" },
  ];

  const arrivedCount = containers.filter((c) => c.arrived).length;
  const notArrivedCount = containers.filter((c) => !c.arrived).length;

  return (
    <LayoutShell showSidebar={true} role="ADMIN">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground">Real-time platform overview</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
              </span>
              Live · Updated {secondsAgo === 0 ? "just now" : `${secondsAgo}s ago`}
            </span>
          </div>
        </div>

        {/* ────────── Row 1: Three Rich Stat Cards ────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* ── Card 1: Container Overview ── */}
          <StaggerItem index={0}>
            <Card className="border-border/50 shadow-card hover:shadow-card-hover transition-shadow duration-300">
              <CardHeader className="pb-4 pt-5 px-5 flex-row items-start justify-between space-y-0">
                <div>
                  <CardTitle className="text-base font-semibold">Container Overview</CardTitle>
                  <CardDescription className="mt-0.5">Arrival status breakdown</CardDescription>
                </div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-muted-foreground/50 cursor-pointer" />
                  </TooltipTrigger>
                  <TooltipContent>Real-time container arrival tracking</TooltipContent>
                </Tooltip>
              </CardHeader>
              <CardContent className="px-5 pb-5 space-y-4">
                <div className="flex items-stretch gap-x-5">
                  {/* Arrived */}
                  <div className="flex-1 flex flex-col items-start gap-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-2xl font-bold text-foreground tabular-nums">{animArrived}</span>
                      <Badge className="bg-green-50 text-green-600 border-green-200 text-[10px] px-1.5 py-0">
                        {arrivalRate}%
                      </Badge>
                    </div>
                    <span className="text-xs text-muted-foreground font-medium">Arrived</span>
                    <div className="w-full mt-1">
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className="bg-green-500 h-full rounded-full transition-all duration-700 ease-out"
                          style={{ width: `${arrivalRate}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="w-px bg-border self-stretch" />

                  {/* Not Arrived */}
                  <div className="flex-1 flex flex-col items-start gap-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-2xl font-bold text-foreground tabular-nums">{animNotArrived}</span>
                    </div>
                    <span className="text-xs text-muted-foreground font-medium">Not Arrived</span>
                    <div className="w-full mt-1 flex gap-0.5">
                      {Array.from({ length: 24 }).map((_, i) => (
                        <div
                          key={i}
                          className={cn(
                            "h-2 flex-1 rounded-[1px] transition-colors duration-500",
                            i < Math.round(((100 - arrivalRate) / 100) * 24) ? "bg-red-400" : "bg-muted",
                          )}
                          style={{ transitionDelay: `${i * 20}ms` }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="flex items-center gap-x-4">
                  <div className="flex flex-col gap-0.5 flex-1">
                    <span className="text-[11px] text-muted-foreground">Top Port</span>
                    <span className="text-sm font-medium text-foreground">Rotterdam</span>
                  </div>
                  <div className="flex flex-col gap-0.5 flex-1">
                    <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                      Arrival Rate
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-3 w-3 text-muted-foreground/40 cursor-pointer" />
                        </TooltipTrigger>
                        <TooltipContent>Percentage of containers that have arrived</TooltipContent>
                      </Tooltip>
                    </span>
                    <span className="text-sm font-medium text-foreground">{arrivalRate}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </StaggerItem>

          {/* ── Card 2: Platform Performance ── */}
          <StaggerItem index={1}>
            <Card className="border-border/50 shadow-card hover:shadow-card-hover transition-shadow duration-300">
              <CardHeader className="pb-3 pt-5 px-5 flex-row items-start justify-between space-y-0">
                <div>
                  <CardTitle className="text-base font-semibold">Platform Performance</CardTitle>
                  <CardDescription className="mt-0.5">Today&apos;s metrics</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="px-5 pb-5 space-y-4">
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: "Containers", value: animTotal, trend: 8, dir: "up" as const },
                    { label: "Appointments", value: animAppointments, trend: 12, dir: "up" as const },
                    { label: "Enterprises", value: animEnterprises, trend: 3, dir: "down" as const },
                  ].map((item) => (
                    <div key={item.label} className="flex flex-col items-start">
                      <span className="text-xl font-bold text-foreground tabular-nums">{item.value}</span>
                      <span className="text-[11px] text-muted-foreground font-medium mb-1">{item.label}</span>
                      <span
                        className={cn(
                          "flex items-center gap-0.5 text-[11px] font-semibold",
                          item.dir === "up" ? "text-green-500" : "text-destructive",
                        )}
                      >
                        {item.dir === "up" ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {item.dir === "up" ? "+" : "-"}{item.trend}%
                      </span>
                    </div>
                  ))}
                </div>

                <Separator />

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-foreground">Arrival Pipeline</span>
                    <span className="text-xs font-semibold text-foreground tabular-nums">{arrivalRate}%</span>
                  </div>
                  <Progress value={arrivalRate} className="h-2 bg-muted [&>div]:bg-primary" />
                </div>

                <Separator />

                <div>
                  <p className="text-sm font-medium text-foreground mb-2">Recent Activity</p>
                  <ul className="space-y-1.5">
                    {recentActivity.slice(0, 3).map((a) => (
                      <li key={a.id} className="flex items-center justify-between gap-2 text-sm">
                        <span className="flex items-center gap-1.5 min-w-0">
                          <CheckCircle2 className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                          <span className="text-xs text-foreground truncate">{a.message}</span>
                        </span>
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0 flex-shrink-0">
                          {a.timestamp}
                        </Badge>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </StaggerItem>

          {/* ── Card 3: Operations Summary (dark) ── */}
          <StaggerItem index={2}>
            <Card className="bg-zinc-900 border-0 shadow-xl text-white hover:shadow-2xl transition-shadow duration-300">
              <CardHeader className="pb-2 pt-5 px-5 space-y-0">
                <CardTitle className="text-base font-semibold text-zinc-400">Operations</CardTitle>
              </CardHeader>
              <CardContent className="px-5 pb-5">
                <div className="flex items-end gap-2 mb-4">
                  <span className="text-3xl font-bold tracking-tight text-white tabular-nums">
                    {animTotal.toLocaleString()}
                  </span>
                  <span className="text-sm font-semibold text-green-400 mb-0.5">+8.2%</span>
                </div>
                <p className="text-xs text-zinc-500 mb-5">Total containers across all ports</p>

                <div className="border-b border-zinc-700 mb-5" />

                <div className="flex items-center gap-1 w-full mb-3">
                  {segments.map((seg) => (
                    <div
                      key={seg.label}
                      className="space-y-2"
                      style={{ width: `${seg.percent}%`, minWidth: "16%" }}
                    >
                      <div
                        className={cn(seg.color, "h-2.5 w-full rounded-sm transition-all duration-700")}
                        style={{
                          animation: "section-fade-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards",
                        }}
                      />
                      <div className="flex flex-col items-start">
                        <span className="text-[10px] text-zinc-500 font-medium">{seg.label}</span>
                        <span className="text-sm font-semibold text-white tabular-nums">{seg.percent}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </StaggerItem>
        </div>

        {/* ────────── Row 2: Quick KPI Tiles ────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { icon: Box, label: "Containers", value: animTotal, color: "text-foreground" },
            { icon: CheckCircle2, label: "Arrived", value: animArrived, color: "text-green-600" },
            { icon: AlertCircle, label: "Not Arrived", value: animNotArrived, color: "text-red-500" },
            { icon: CalendarCheck, label: "Appointments", value: animAppointments, color: "text-indigo-500" },
            { icon: Building2, label: "Enterprises", value: animEnterprises, color: "text-violet-500" },
            { icon: ScanLine, label: "Scans Today", value: animScans, color: "text-amber-500" },
          ].map((item, i) => (
            <StaggerItem key={item.label} index={i + 3} className="group">
              <div className="bg-white border border-border/50 rounded-xl p-4 shadow-card hover:shadow-card-hover transition-all duration-200 cursor-default">
                <div className="flex items-center gap-2 mb-2">
                  <item.icon className={cn("w-4 h-4", item.color)} strokeWidth={1.8} />
                  <span className="text-[11px] text-muted-foreground font-medium">{item.label}</span>
                </div>
                <span className={cn("text-2xl font-bold tabular-nums", item.color)}>{item.value}</span>
              </div>
            </StaggerItem>
          ))}
        </div>

        {/* ────────── Row 3: Charts ────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

          {/* ── Appointments per Day — Area Chart ── */}
          <StaggerItem index={9}>
            <Card className="border-border/50 shadow-card">
              <CardHeader className="pb-2 pt-5 px-5 flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle className="text-base font-semibold">Appointments per Day</CardTitle>
                  <CardDescription>
                    Showing appointment trends for the last {chartRange} days
                  </CardDescription>
                </div>
                <div className="flex gap-1">
                  {([7, 14, 30] as const).map((d) => (
                    <button
                      key={d}
                      onClick={() => setChartRange(d)}
                      className={cn(
                        "px-2.5 py-1 text-xs rounded-md transition-colors",
                        chartRange === d
                          ? "bg-primary text-white"
                          : "text-muted-foreground hover:bg-secondary"
                      )}
                    >
                      {d}d
                    </button>
                  ))}
                </div>
              </CardHeader>
              <CardContent className="px-5 pb-2">
                <ChartContainer config={areaChartConfig}>
                  <AreaChart
                    accessibilityLayer
                    data={chartData}
                    margin={{ left: 12, right: 12 }}
                  >
                    <CartesianGrid vertical={false} />
                    <XAxis
                      dataKey="date"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      tickFormatter={(value) => value.slice(0, 6)}
                    />
                    <ChartTooltip
                      cursor={false}
                      content={<ChartTooltipContent indicator="line" />}
                    />
                    <Area
                      dataKey="appointments"
                      type="natural"
                      fill="var(--color-appointments)"
                      fillOpacity={0.4}
                      stroke="var(--color-appointments)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ChartContainer>
              </CardContent>
              <CardFooter className="px-5 pb-4">
                <div className="flex w-full items-start gap-2 text-sm">
                  <div className="grid gap-2">
                    <div className="flex items-center gap-2 font-medium leading-none">
                      Trending up by 5.2% this period <TrendingUp className="h-4 w-4" />
                    </div>
                    <div className="text-muted-foreground leading-none">
                      Last {chartRange} days of appointments
                    </div>
                  </div>
                </div>
              </CardFooter>
            </Card>
          </StaggerItem>

          {/* ── Arrived vs Not Arrived — Bar Chart ── */}
          <StaggerItem index={10}>
            <Card className="border-border/50 shadow-card">
              <CardHeader className="pb-2 pt-5 px-5 space-y-0">
                <CardTitle className="text-base font-semibold">Arrived vs Not Arrived</CardTitle>
                <CardDescription>Last 7 days comparison</CardDescription>
              </CardHeader>
              <CardContent className="px-5 pb-2">
                <ChartContainer config={barChartConfig}>
                  <BarChart accessibilityLayer data={chartData.slice(-7)}>
                    <CartesianGrid vertical={false} />
                    <XAxis
                      dataKey="date"
                      tickLine={false}
                      tickMargin={10}
                      axisLine={false}
                      tickFormatter={(value) => value.slice(0, 6)}
                    />
                    <ChartTooltip
                      cursor={false}
                      content={<ChartTooltipContent indicator="dashed" />}
                    />
                    <Bar dataKey="arrived" fill="var(--color-arrived)" radius={4} />
                    <Bar dataKey="notArrived" fill="var(--color-notArrived)" radius={4} />
                  </BarChart>
                </ChartContainer>
              </CardContent>
              <CardFooter className="flex-col items-start gap-2 text-sm px-5 pb-4">
                <div className="flex gap-2 font-medium leading-none">
                  Arrivals up by 8.1% this week <TrendingUp className="h-4 w-4" />
                </div>
                <div className="text-muted-foreground leading-none">
                  Showing daily container arrival data
                </div>
              </CardFooter>
            </Card>
          </StaggerItem>

          {/* ── Status Distribution — Pie Chart with Labels ── */}
          <StaggerItem index={11}>
            <Card className="flex flex-col border-border/50 shadow-card">
              <CardHeader className="items-center pb-0 pt-5 px-5">
                <CardTitle className="text-base font-semibold">Status Distribution</CardTitle>
                <CardDescription>Current container statuses</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 pb-0 px-5">
                <ChartContainer
                  config={pieChartConfig}
                  className="[&_.recharts-pie-label-text]:fill-foreground mx-auto aspect-square max-h-[250px] pb-0"
                >
                  <PieChart>
                    <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                    <Pie data={pieData} dataKey="value" label nameKey="status" />
                  </PieChart>
                </ChartContainer>
              </CardContent>
              <CardFooter className="flex-col gap-2 text-sm px-5 pb-4">
                <div className="flex items-center gap-2 font-medium leading-none">
                  {arrivalRate}% arrival rate across all containers <TrendingUp className="h-4 w-4" />
                </div>
                <div className="text-muted-foreground leading-none">
                  {kpi.totalContainers} total containers tracked
                </div>
              </CardFooter>
            </Card>
          </StaggerItem>

          {/* ── Upcoming Appointments ── */}
          <StaggerItem index={12}>
            <Card className="border-border/50 shadow-card">
              <CardHeader className="pb-3 pt-5 px-5 flex-row items-center justify-between space-y-0">
                <CardTitle className="text-base font-semibold">Upcoming Appointments</CardTitle>
                <Badge variant="secondary" className="text-[10px]">
                  {upcomingAppointments.length} scheduled
                </Badge>
              </CardHeader>
              <CardContent className="px-5 pb-2">
                <div className="divide-y divide-border">
                  {upcomingAppointments.slice(0, 5).map((apt) => (
                    <div key={apt.id} className="flex items-center justify-between py-3 gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-8 w-8 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
                          <CalendarCheck className="w-4 h-4 text-indigo-500" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{apt.container}</p>
                          <p className="text-xs text-muted-foreground truncate">{apt.company}</p>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-medium text-foreground tabular-nums">{apt.time}</p>
                        <p className="text-xs text-muted-foreground">{apt.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="px-5 pb-4 pt-0">
                <Button variant="ghost" size="sm" className="w-full text-xs text-muted-foreground hover:text-foreground gap-1">
                  View all appointments <ArrowRight className="w-3 h-3" />
                </Button>
              </CardFooter>
            </Card>
          </StaggerItem>
        </div>

        {/* ────────── Row 4: Container Map ────────── */}
        <StaggerItem index={13}>
          <Card className="border-border/50 shadow-card overflow-hidden">
            <CardHeader className="pb-2 pt-5 px-5 flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="text-base font-semibold">Container Locations</CardTitle>
                <CardDescription>
                  {arrivedCount} arrived · {notArrivedCount} in transit
                </CardDescription>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
                  <span className="text-muted-foreground">Arrived</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                  <span className="text-muted-foreground">Not Arrived</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-0 pb-0">
              <div className="h-[400px] w-full">
                <Map
                  ref={mapRef}
                  center={[20, 30]}
                  zoom={1.8}
                  markers={mapMarkers}
                  className="rounded-none rounded-b-lg"
                />
              </div>
            </CardContent>
          </Card>
        </StaggerItem>
      </div>
    </LayoutShell>
  );
}
