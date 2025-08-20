'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navigation from './Navigation';

interface DashboardData {
	analysis?: any;
	suggestion?: any;
	recentWorkouts?: any[];
	loading: boolean;
	lastUpdated?: string;
}

export default function WorkoutDashboard() {
	const [data, setData] = useState<DashboardData>({ loading: true });
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		loadDashboardData();

		// Poll for updates every 30 seconds
		const interval = setInterval(loadDashboardData, 30000);
		return () => clearInterval(interval);
	}, []);

	const loadDashboardData = async () => {
		try {
			// Try to get data from webhook endpoint first (if available)
			const response = await fetch('/api/webhook/hevy');

			if (response.ok) {
				const webhookData = await response.json();
				setData({
					analysis: webhookData.currentAnalysis,
					suggestion: webhookData.currentSuggestion,
					recentWorkouts: webhookData.recentWorkouts,
					loading: false,
					lastUpdated: webhookData.lastUpdated,
				});
			} else {
				// Fallback to direct API calls if webhook data not available
				await loadFallbackData();
			}

			setError(null);
		} catch (err) {
			console.error('Failed to load dashboard data:', err);
			setError('Failed to load workout data');
			await loadFallbackData();
		}
	};

	const loadFallbackData = async () => {
		try {
			// This would normally use your services directly
			// For now, show loading state
			setData({
				loading: false,
				analysis: null,
				suggestion: null,
				recentWorkouts: [],
			});
		} catch (err) {
			setData({ loading: false });
		}
	};

	if (data.loading) {
		return <LoadingDashboard />;
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
			<div className="container mx-auto px-4 py-8">
				{/* Header */}
				<header className="mb-8">
					<div className="flex items-center justify-between">
						<div>
							<h1 className="text-4xl font-bold text-white mb-2">
								Hevier <span className="text-purple-400">Workout Intelligence</span>
							</h1>
							<p className="text-slate-300">
								Smart training recommendations powered by your Hevy data
							</p>
						</div>
						<div className="flex items-center space-x-4">
							<div className="flex items-center text-sm text-slate-400">
								<div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
								Live Updates
							</div>
							{data.lastUpdated && (
								<div className="text-xs text-slate-500">
									Updated: {new Date(data.lastUpdated).toLocaleTimeString()}
								</div>
							)}
						</div>
					</div>
				</header>

				{error && <ErrorBanner error={error} onRetry={loadDashboardData} />}

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
					{/* Weekly Analysis */}
					<div className="lg:col-span-2">
						<WeeklyAnalysisCard analysis={data.analysis} />
					</div>

					{/* Today's Suggestion */}
					<div>
						<TodaysSuggestionCard suggestion={data.suggestion} />
					</div>

					{/* Volume Progress */}
					<div className="lg:col-span-2">
						<VolumeProgressCard analysis={data.analysis} />
					</div>

					{/* Recent Workouts */}
					<div>
						<RecentWorkoutsCard workouts={data.recentWorkouts || []} />
					</div>
				</div>
			</div>
		</div>
	);
}

function LoadingDashboard() {
	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
			<div className="container mx-auto px-4 py-8">
				<div className="animate-pulse">
					<div className="h-8 bg-slate-700 rounded w-64 mb-2"></div>
					<div className="h-4 bg-slate-700 rounded w-96 mb-8"></div>

					<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
						<div className="lg:col-span-2 h-64 bg-slate-800 rounded-lg"></div>
						<div className="h-64 bg-slate-800 rounded-lg"></div>
						<div className="lg:col-span-2 h-48 bg-slate-800 rounded-lg"></div>
						<div className="h-48 bg-slate-800 rounded-lg"></div>
					</div>
				</div>
			</div>
		</div>
	);
}

function ErrorBanner({ error, onRetry }: { error: string; onRetry: () => void }) {
	return (
		<div className="bg-red-900/50 border border-red-500 rounded-lg p-4 mb-6">
			<div className="flex items-center justify-between">
				<div className="flex items-center">
					<div className="text-red-400 mr-3">⚠️</div>
					<span className="text-red-200">{error}</span>
				</div>
				<button
					onClick={onRetry}
					className="text-red-300 hover:text-red-100 underline"
				>
					Retry
				</button>
			</div>
		</div>
	);
}

function WeeklyAnalysisCard({ analysis }: { analysis?: any }) {
	if (!analysis) {
		return (
			<div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-6">
				<h2 className="text-xl font-semibold text-white mb-4">📊 Weekly Analysis</h2>
				<div className="text-slate-400 text-center py-8">
					<div className="text-4xl mb-2">🔄</div>
					<p>Connect to Hevy to see your weekly analysis</p>
				</div>
			</div>
		);
	}

	const scoreColor = analysis.overallScore >= 80
		? 'text-green-400'
		: analysis.overallScore >= 60
			? 'text-yellow-400'
			: 'text-red-400';

	return (
		<div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-6">
			<h2 className="text-xl font-semibold text-white mb-4">📊 Weekly Analysis</h2>

			{/* Overall Score */}
			<div className="text-center mb-6">
				<div className={`text-5xl font-bold ${scoreColor} mb-2`}>
					{analysis.overallScore}/100
				</div>
				<div className="text-slate-300">Overall Training Score</div>
			</div>

			{/* Quick Stats */}
			<div className="grid grid-cols-2 gap-4 mb-6">
				<div className="text-center">
					<div className="text-2xl font-bold text-white">{analysis.totalWorkouts}</div>
					<div className="text-sm text-slate-400">Workouts</div>
				</div>
				<div className="text-center">
					<div className="text-2xl font-bold text-purple-400">
						{analysis.muscleGroupVolumes?.filter((v: any) => v.deficit <= 0).length || 0}
					</div>
					<div className="text-sm text-slate-400">Targets Met</div>
				</div>
			</div>

			{/* Recommendations */}
			{analysis.recommendations && analysis.recommendations.length > 0 && (
				<div>
					<h3 className="text-sm font-semibold text-slate-300 mb-3">🧠 AI Recommendations</h3>
					<div className="space-y-2">
						{analysis.recommendations.slice(0, 3).map((rec: string, i: number) => (
							<div key={i} className="text-sm text-slate-300 bg-slate-700/30 rounded p-2">
								• {rec}
							</div>
						))}
					</div>
				</div>
			)}
		</div>
	);
}

function TodaysSuggestionCard({ suggestion }: { suggestion?: any }) {
	if (!suggestion) {
		return (
			<div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-6">
				<h2 className="text-xl font-semibold text-white mb-4">🎯 Today's Workout</h2>
				<div className="text-slate-400 text-center py-8">
					<div className="text-4xl mb-2">💤</div>
					<p>No workout suggestions available</p>
				</div>
			</div>
		);
	}

	const difficultyColors = {
		'LIGHT': 'text-green-400 bg-green-900/30',
		'MODERATE': 'text-yellow-400 bg-yellow-900/30',
		'INTENSE': 'text-red-400 bg-red-900/30',
	};

	return (
		<div className="bg-gradient-to-br from-purple-900/50 to-blue-900/50 backdrop-blur-sm border border-purple-500/30 rounded-lg p-6">
			<h2 className="text-xl font-semibold text-white mb-4">🎯 Today's Workout</h2>

			{/* Workout Type */}
			<div className="text-center mb-6">
				<div className="text-3xl font-bold text-purple-300 mb-1">
					{suggestion.workoutType}
				</div>
				<div className="text-slate-300">{suggestion.estimatedDuration} minutes</div>
				<div className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mt-2 ${difficultyColors[suggestion.difficultyLevel as keyof typeof difficultyColors] || 'text-slate-400'
					}`}>
					{suggestion.difficultyLevel}
				</div>
			</div>

			{/* Focus Areas */}
			{suggestion.focusMuscleGroups && (
				<div className="mb-4">
					<h3 className="text-sm font-semibold text-slate-300 mb-2">Focus Areas</h3>
					<div className="flex flex-wrap gap-2">
						{suggestion.focusMuscleGroups.slice(0, 4).map((muscle: string) => (
							<span key={muscle} className="px-2 py-1 bg-slate-700 rounded text-xs text-slate-300">
								{muscle}
							</span>
						))}
					</div>
				</div>
			)}

			{/* Top Exercises */}
			{suggestion.exercises && suggestion.exercises.length > 0 && (
				<div>
					<h3 className="text-sm font-semibold text-slate-300 mb-3">Top Exercises</h3>
					<div className="space-y-3">
						{suggestion.exercises.slice(0, 3).map((exercise: any, i: number) => (
							<div key={i} className="bg-slate-800/50 rounded p-3">
								<div className="flex items-center justify-between mb-1">
									<span className="text-white font-medium text-sm">
										{exercise.exerciseName}
									</span>
									<span className={`text-xs px-2 py-1 rounded ${exercise.priority === 'HIGH' ? 'bg-red-900/50 text-red-300' :
										exercise.priority === 'MEDIUM' ? 'bg-yellow-900/50 text-yellow-300' :
											'bg-gray-700 text-gray-300'
										}`}>
										{exercise.priority}
									</span>
								</div>
								<div className="text-xs text-slate-400 mb-1">
									{exercise.suggestedSets} sets × {exercise.suggestedReps.min}-{exercise.suggestedReps.max} reps
								</div>
								<div className="text-xs text-slate-500">{exercise.reason}</div>
							</div>
						))}
					</div>
				</div>
			)}
		</div>
	);
}

function VolumeProgressCard({ analysis }: { analysis?: any }) {
	if (!analysis?.muscleGroupVolumes) {
		return (
			<div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-6">
				<h2 className="text-xl font-semibold text-white mb-4">💪 Volume Progress</h2>
				<div className="text-slate-400 text-center py-8">No volume data available</div>
			</div>
		);
	}

	const sortedVolumes = analysis.muscleGroupVolumes
		.filter((v: any) => v.targetMin > 0)
		.sort((a: any, b: any) => b.actualSets - a.actualSets)
		.slice(0, 8);

	return (
		<div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-6">
			<h2 className="text-xl font-semibold text-white mb-4">💪 Volume Progress</h2>

			<div className="space-y-4">
				{sortedVolumes.map((volume: any) => {
					const percentage = Math.min((volume.actualSets / volume.targetMin) * 100, 100);
					const isComplete = volume.actualSets >= volume.targetMin;

					return (
						<div key={volume.muscleGroup}>
							<div className="flex justify-between items-center mb-1">
								<span className="text-sm font-medium text-white">{volume.muscleGroup}</span>
								<span className="text-xs text-slate-400">
									{volume.actualSets}/{volume.targetMin}
									{volume.targetMax && ` (max ${volume.targetMax})`}
								</span>
							</div>
							<div className="w-full bg-slate-700 rounded-full h-2">
								<div
									className={`h-2 rounded-full transition-all duration-500 ${isComplete ? 'bg-green-500' : 'bg-purple-500'
										}`}
									style={{ width: `${percentage}%` }}
								></div>
							</div>
							{volume.deficit > 0 && (
								<div className="text-xs text-red-400 mt-1">
									-{volume.deficit} sets remaining
								</div>
							)}
						</div>
					);
				})}
			</div>
		</div>
	);
}

function RecentWorkoutsCard({ workouts }: { workouts: any[] }) {
	return (
		<div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-6">
			<h2 className="text-xl font-semibold text-white mb-4">📅 Recent Workouts</h2>

			{workouts.length === 0 ? (
				<div className="text-slate-400 text-center py-8">
					<div className="text-4xl mb-2">📋</div>
					<p>No recent workouts found</p>
				</div>
			) : (
				<div className="space-y-3">
					{workouts.slice(0, 5).map((workout: any, i: number) => (
						<div key={i} className="bg-slate-700/30 rounded p-3">
							<div className="flex justify-between items-start mb-1">
								<span className="text-white font-medium text-sm">
									{workout.name || workout.type}
								</span>
								<span className="text-xs text-slate-400">
									{new Date(workout.date).toLocaleDateString()}
								</span>
							</div>
							<div className="text-xs text-slate-400">
								{workout.exercises?.length || 0} exercises
								{workout.duration && ` • ${workout.duration}min`}
							</div>
							{workout.type && (
								<div className="text-xs text-purple-400 mt-1">
									{workout.type}
								</div>
							)}
						</div>
					))}
				</div>
			)}
		</div>
	);
}
