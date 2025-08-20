'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
	Calendar,
	Clock,
	Dumbbell,
	TrendingUp,
	ChevronRight
} from 'lucide-react';

interface Workout {
	date: string;
	type: string;
	duration: number;
	exercises: string[];
	totalSets: number;
}

interface RecentWorkoutsProps {
	workouts?: Workout[];
}

export function RecentWorkouts({ workouts }: RecentWorkoutsProps) {
	if (!workouts || workouts.length === 0) {
		return (
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Calendar className="h-5 w-5" />
						Recent Workouts
					</CardTitle>
					<CardDescription>
						Your workout history
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="text-center py-8 text-slate-500">
						No recent workouts found
					</div>
				</CardContent>
			</Card>
		);
	}

	const getWorkoutTypeColor = (type: string) => {
		switch (type.toUpperCase()) {
			case 'PUSH': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300';
			case 'PULL': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
			case 'LEGS': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
			default: return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
		}
	};

	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		const today = new Date();
		const diffTime = Math.abs(today.getTime() - date.getTime());
		const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

		if (diffDays === 1) return 'Today';
		if (diffDays === 2) return 'Yesterday';
		if (diffDays <= 7) return `${diffDays - 1} days ago`;

		return date.toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric'
		});
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Calendar className="h-5 w-5" />
					Recent Workouts
				</CardTitle>
				<CardDescription>
					Your latest workout sessions
				</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="space-y-4">
					{workouts.map((workout, index) => (
						<div
							key={index}
							className="group flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
						>
							<div className="flex-shrink-0">
								<div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
									<Dumbbell className="h-6 w-6 text-white" />
								</div>
							</div>

							<div className="flex-1 min-w-0">
								<div className="flex items-center gap-2 mb-1">
									<Badge className={getWorkoutTypeColor(workout.type)}>
										{workout.type}
									</Badge>
									<span className="text-sm text-slate-500 dark:text-slate-400">
										{formatDate(workout.date)}
									</span>
								</div>

								<div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400 mb-2">
									<div className="flex items-center gap-1">
										<Clock className="h-3 w-3" />
										<span>{workout.duration} min</span>
									</div>
									<div className="flex items-center gap-1">
										<TrendingUp className="h-3 w-3" />
										<span>{workout.totalSets} sets</span>
									</div>
								</div>

								<div className="text-xs text-slate-500 dark:text-slate-400">
									{workout.exercises.slice(0, 3).join(', ')}
									{workout.exercises.length > 3 && ` +${workout.exercises.length - 3} more`}
								</div>
							</div>

							<ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors" />
						</div>
					))}

					{/* 14-Day Summary */}
					<div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
						<div className="flex items-center justify-between text-sm">
							<span className="text-slate-600 dark:text-slate-400">Last 14 Days</span>
							<div className="flex items-center gap-4">
								<span className="text-slate-900 dark:text-slate-100 font-medium">
									{workouts.length} workouts
								</span>
								<span className="text-slate-900 dark:text-slate-100 font-medium">
									{workouts.reduce((total, w) => total + w.duration, 0)} min total
								</span>
							</div>
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
