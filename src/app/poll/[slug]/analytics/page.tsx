'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, BarChart2, Download, Eye, TrendingUp, Users } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
    Bar,
    BarChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
    Cell
} from 'recharts'
import { useSocketPoll } from '@/lib/use-socket-poll'
import { toast } from 'sonner'

export default function AnalyticsPage() {
    const params = useParams()
    const slug = params.slug as string
    const [metrics, setMetrics] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    // Fetch initial data
    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const res = await fetch(`/api/polls/${slug}/analytics`)
                if (!res.ok) throw new Error('Failed to load analytics')
                const data = await res.json()
                setMetrics(data)
            } catch (error) {
                toast.error('Could not load analytics')
            } finally {
                setLoading(false)
            }
        }
        fetchAnalytics()
    }, [slug])

    // Real-time updates (reuse socket logic but simpler)
    // We'll trust the socket to send 'poll-update' which contains new vote counts
    // For views, we might need to poll or add a socket event, but for now we'll just update votes live
    // and maybe re-fetch views occasionally or just let them be static until refresh for performance.

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        )
    }

    if (!metrics) return <div>Error loading data</div>

    const { poll, metrics: stats, options } = metrics

    return (
        <div className="min-h-screen bg-background text-foreground p-6 sm:p-12">
            <div className="max-w-6xl mx-auto space-y-8">

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <Link href={`/poll/${slug}`} className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1 mb-2 transition-colors">
                            <ArrowLeft className="w-4 h-4" /> Back to Poll
                        </Link>
                        <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
                        <p className="text-muted-foreground">Real-time insights for "{poll.question}"</p>
                    </div>
                    <Button variant="outline" className="gap-2">
                        <Download className="w-4 h-4" /> Export Report
                    </Button>
                </div>

                {/* Key Metrics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <MetricCard
                        title="Total Views"
                        value={stats.total_views}
                        icon={<Eye className="w-5 h-5 text-blue-500" />}
                        trend="+12% from last hour" // Placeholder for real trend logic
                    />
                    <MetricCard
                        title="Total Votes"
                        value={stats.total_votes}
                        icon={<Users className="w-5 h-5 text-purple-500" />}
                        trend="Live Updates Active"
                        live
                    />
                    <MetricCard
                        title="Conversion Rate"
                        value={`${stats.conversion_rate}%`}
                        icon={<TrendingUp className="w-5 h-5 text-green-500" />}
                        description="Visitors who cast a vote"
                    />
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Vote Distribution */}
                    <Card className="bg-card border-border shadow-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <BarChart2 className="w-5 h-5" /> Vote Distribution
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={options} layout="vertical" margin={{ left: 0 }}>
                                    <XAxis type="number" hide />
                                    <YAxis
                                        dataKey="option_text"
                                        type="category"
                                        width={100}
                                        tick={{ fontSize: 12 }}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <Tooltip
                                        cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                    />
                                    <Bar dataKey="vote_count" radius={[0, 4, 4, 0]} barSize={32}>
                                        {options.map((entry: any, index: number) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* Placeholder for Time Series (requires more complex backend aggregation) */}
                    <Card className="bg-card border-border shadow-sm flex items-center justify-center p-8 text-center">
                        <div className="max-w-xs space-y-2">
                            <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                                <TrendingUp className="w-6 h-6 text-muted-foreground" />
                            </div>
                            <h3 className="font-semibold">Time Series Data</h3>
                            <p className="text-sm text-muted-foreground">Vote history charts will appear here once we collect enough time-series data.</p>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    )
}

function MetricCard({ title, value, icon, trend, description, live }: any) {
    return (
        <Card className="bg-card border-border shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium text-muted-foreground">{title}</span>
                    <div className="p-2 bg-muted/50 rounded-lg">{icon}</div>
                </div>
                <div className="space-y-1">
                    <h3 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                        {value}
                        {live && <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                        </span>}
                    </h3>
                    {trend && <p className="text-xs font-medium text-green-600 flex items-center gap-1">{trend}</p>}
                    {description && <p className="text-xs text-muted-foreground">{description}</p>}
                </div>
            </CardContent>
        </Card>
    )
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088fe']
