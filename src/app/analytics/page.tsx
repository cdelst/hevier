'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import WorkoutStats from '../components/WorkoutStats';

export default function AnalyticsPage() {
	const [data, setData] = useState<any>(null);
	const [loading, setLoading] = useState(true);
	const [timeRange, setTimeRange] = useState('7d');

	useEffect(() => {
		loadAnalyticsData();
	}, [timeRange]);

	const loadAnalyticsData = async () => {
		try {
			console.log('📊 Loading analytics from unified workout API...');
			const response = await fetch('/api/workouts');

			if (response.ok) {
				const result = await response.json();

				if (result.success) {
					// Transform the unified API response to match expected format
					const transformedData = {
						currentAnalysis: result.data.analysis,
						recentWorkouts: result.data.workouts.slice(0, 10), // Last 10 workouts
						lastUpdated: result.data.metadata.fetchedAt,
						metadata: result.data.metadata
					};

					setData(transformedData);
					console.log(`✅ Analytics loaded: ${result.data.workouts.length} workouts, ${result.data.analysis.overallScore}% score`);
				} else {
					throw new Error(result.message || 'API returned error');
				}
			} else {
				throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
			}

			setLoading(false);
		} catch (error) {
			console.error('Failed to load analytics:', error);
			setLoading(false);
		}
	};

	if (loading) {
		return <LoadingAnalytics />;
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
			<div className="container mx-auto px-4 py-8">
				{/* Header */}
				<header className="mb-8">
					<nav className="flex items-center space-x-4 mb-6">
						<Link
							href="/"
							className="text-purple-400 hover:text-purple-300 font-medium"
						>
							← Dashboard
						</Link>
						<span className="text-slate-500">/</span>
						<span className="text-white">Analytics</span>
					</nav>

					<div className="flex items-center justify-between">
						<div>
							<h1 className="text-4xl font-bold text-white mb-2">
								📊 Workout Analytics
							</h1>
							<p className="text-slate-300">
								Deep insights into your training patterns and progress
							</p>
						</div>

						<div className="flex items-center space-x-3">
							<select
								value={timeRange}
								onChange={(e) => setTimeRange(e.target.value)}
								className="bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm"
							>
								<option value="7d">Last 7 Days</option>
								<option value="14d">Last 2 Weeks</option>
								<option value="30d">Last Month</option>
							</select>
						</div>
					</div>
				</header>

				{/* Analytics Content */}
				{data?.currentAnalysis ? (
					<div className="space-y-8">
						{/* Key Metrics */}
						<div className="grid grid-cols-1 md:grid-cols-4 gap-6">
							<MetricCard
								title="Training Score"
								value={`${data.currentAnalysis.overallScore}/100`}
								change="+12"
								icon="🎯"
								color="text-purple-400"
							/>
							<MetricCard
								title="Workouts"
								value={data.currentAnalysis.totalWorkouts.toString()}
								change="+2"
								icon="🏋️"
								color="text-blue-400"
							/>
							<MetricCard
								title="Total Sets"
								value={data.currentAnalysis.muscleGroupVolumes?.reduce((sum: number, v: any) => sum + v.actualSets, 0).toString() || "0"}
								change="+24"
								icon="💪"
								color="text-green-400"
							/>
							<MetricCard
								title="Targets Met"
								value={data.currentAnalysis.muscleGroupVolumes?.filter((v: any) => v.deficit <= 0).length.toString() || "0"}
								change="+3"
								icon="✅"
								color="text-yellow-400"
							/>
						</div>

						{/* Detailed Stats */}
						<WorkoutStats muscleGroupVolumes={data.currentAnalysis.muscleGroupVolumes || []} />

						{/* Training Schedule */}
						<TrainingScheduleCard />

						{/* Progress Chart Placeholder */}
						<div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-6">
							<h3 className="text-lg font-semibold text-white mb-4">📈 Progress Trends</h3>
							<div className="text-slate-400 text-center py-16">
								<div className="text-6xl mb-4">📊</div>
								<p className="text-lg mb-2">Progress Charts Coming Soon</p>
								<p className="text-sm">Track your volume and strength progression over time</p>
							</div>
						</div>
					</div>
				) : (
					<NoDataState />
				)}
			</div>
		</div>
	);
}

function LoadingAnalytics() {
	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
			<div className="container mx-auto px-4 py-8">
				<div className="animate-pulse space-y-8">
					<div>
						<div className="h-6 bg-slate-700 rounded w-32 mb-4"></div>
						<div className="h-10 bg-slate-700 rounded w-64 mb-2"></div>
						<div className="h-4 bg-slate-700 rounded w-96"></div>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-4 gap-6">
						{[1, 2, 3, 4].map(i => (
							<div key={i} className="h-24 bg-slate-800 rounded-lg"></div>
						))}
					</div>

					<div className="h-96 bg-slate-800 rounded-lg"></div>
				</div>
			</div>
		</div>
	);
}

function MetricCard({ title, value, change, icon, color }: {
	title: string;
	value: string;
	change: string;
	icon: string;
	color: string;
}) {
	return (
		<div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-6">
			<div className="flex items-center justify-between mb-2">
				<span className="text-2xl">{icon}</span>
				<span className="text-green-400 text-xs font-medium">
					{change}
				</span>
			</div>
			<div className={`text-2xl font-bold ${color} mb-1`}>
				{value}
			</div>
			<div className="text-slate-400 text-sm">{title}</div>
		</div>
	);
}

function TrainingScheduleCard() {
	const schedule = [
		{ day: 'Monday', type: 'PUSH', status: 'completed', exercises: 6 },
		{ day: 'Tuesday', type: 'REST', status: 'rest', exercises: 0 },
		{ day: 'Wednesday', type: 'PULL', status: 'suggested', exercises: 5 },
		{ day: 'Thursday', type: 'REST', status: 'rest', exercises: 0 },
		{ day: 'Friday', type: 'LEGS', status: 'planned', exercises: 7 },
		{ day: 'Saturday', type: 'PUSH', status: 'planned', exercises: 6 },
		{ day: 'Sunday', type: 'REST', status: 'rest', exercises: 0 },
	];

	return (
		<div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-6">
			<h3 className="text-lg font-semibold text-white mb-4">📅 Weekly Training Schedule</h3>

			<div className="grid grid-cols-7 gap-2">
				{schedule.map((day, i) => (
					<div
						key={i}
						className={`text-center p-3 rounded-lg border ${day.status === 'completed' ? 'bg-green-900/30 border-green-500/30' :
							day.status === 'suggested' ? 'bg-purple-900/30 border-purple-500/30' :
								day.status === 'planned' ? 'bg-blue-900/30 border-blue-500/30' :
									'bg-slate-700/30 border-slate-600/30'
							}`}
					>
						<div className="text-xs font-medium text-slate-300 mb-1">
							{day.day.slice(0, 3)}
						</div>
						<div className={`text-sm font-bold mb-1 ${day.status === 'completed' ? 'text-green-300' :
							day.status === 'suggested' ? 'text-purple-300' :
								day.status === 'planned' ? 'text-blue-300' :
									'text-slate-400'
							}`}>
							{day.type}
						</div>
						{day.exercises > 0 && (
							<div className="text-xs text-slate-400">
								{day.exercises} ex
							</div>
						)}
					</div>
				))}
			</div>

			<div className="flex justify-center space-x-6 mt-4 text-xs">
				<div className="flex items-center">
					<div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
					<span className="text-slate-300">Completed</span>
				</div>
				<div className="flex items-center">
					<div className="w-3 h-3 bg-purple-500 rounded-full mr-2"></div>
					<span className="text-slate-300">Suggested</span>
				</div>
				<div className="flex items-center">
					<div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
					<span className="text-slate-300">Planned</span>
				</div>
			</div>
		</div>
	);
}

function NoDataState() {
	return (
		<div className="text-center py-16">
			<div className="text-8xl mb-6">📊</div>
			<h2 className="text-2xl font-bold text-white mb-4">
				No Analytics Data Available
			</h2>
			<p className="text-slate-400 mb-8 max-w-md mx-auto">
				Complete a few workouts in Hevy to see detailed analytics and insights about your training.
			</p>
			<Link
				href="/"
				className="inline-flex items-center px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
			>
				Back to Dashboard
			</Link>
		</div>
	);
}
