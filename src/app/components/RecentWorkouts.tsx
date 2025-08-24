'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { WorkoutDetailModal } from './WorkoutDetailModal';
import {
	Calendar,
	Clock,
	Dumbbell,
	TrendingUp,
	ChevronRight,
	Activity,
	Target
} from 'lucide-react';

interface DetailedExercise {
	id: string;
	name: string;
	muscleGroups: string[];
	sets: number;
	totalVolume: number;
}

interface Workout {
	id: string;
	date: string;
	exercises: DetailedExercise[];
	totalDuration: number;
	type?: string;
	totalSets?: number;
}

interface RecentWorkoutsProps {
	workouts?: Workout[];
}

export function RecentWorkouts({ workouts }: RecentWorkoutsProps) {
	const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);
	const [isModalOpen, setIsModalOpen] = useState(false);

	const handleWorkoutClick = (workout: Workout) => {
		setSelectedWorkout(workout);
		setIsModalOpen(true);
	};

	const handleCloseModal = () => {
		setIsModalOpen(false);
		setSelectedWorkout(null);
	};

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
			case 'PUSH': return 'bg-gradient-to-br from-red-500 to-red-600';
			case 'PULL': return 'bg-gradient-to-br from-blue-500 to-blue-600';
			case 'LEGS': return 'bg-gradient-to-br from-green-500 to-green-600';
			default: return 'bg-gradient-to-br from-slate-500 to-slate-600';
		}
	};

	const getWorkoutTypeBadgeColor = (type: string) => {
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
		<>
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Calendar className="h-5 w-5" />
						Recent Workouts
					</CardTitle>
					<CardDescription>
						Click on any workout to view detailed breakdown
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						{workouts.map((workout) => {
							const totalSets = workout.exercises.reduce((sum, ex) => sum + ex.sets, 0);
							const totalVolume = workout.exercises.reduce((sum, ex) => sum + ex.totalVolume, 0);
							const uniqueMuscleGroups = [...new Set(workout.exercises.flatMap(ex => ex.muscleGroups))];
							const workoutType = workout.type || 'MIXED';

							return (
								<div
									key={workout.id}
									onClick={() => handleWorkoutClick(workout)}
									className="group flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 hover:shadow-md hover:scale-[1.02] transition-all duration-200 cursor-pointer"
								>
									<div className="flex-shrink-0">
										<div className={`w-12 h-12 rounded-lg ${getWorkoutTypeColor(workoutType)} flex items-center justify-center shadow-sm`}>
											<Dumbbell className="h-6 w-6 text-white" />
										</div>
									</div>

									<div className="flex-1 min-w-0">
										<div className="flex items-center gap-2 mb-2">
											<Badge className={getWorkoutTypeBadgeColor(workoutType)}>
												{workoutType}
											</Badge>
											<span className="text-sm font-medium text-slate-500 dark:text-slate-400">
												{formatDate(workout.date)}
											</span>
										</div>

										<div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-slate-600 dark:text-slate-400 mb-3">
											<div className="flex items-center gap-1">
												<Clock className="h-3 w-3" />
												<span>{workout.totalDuration || 'N/A'} min</span>
											</div>
											<div className="flex items-center gap-1">
												<TrendingUp className="h-3 w-3" />
												<span>{totalSets} sets</span>
											</div>
											<div className="flex items-center gap-1">
												<Activity className="h-3 w-3" />
												<span>{workout.exercises.length} exercises</span>
											</div>
											<div className="flex items-center gap-1">
												<Target className="h-3 w-3" />
												<span>{uniqueMuscleGroups.length} muscle groups</span>
											</div>
										</div>

										<div className="text-xs text-slate-500 dark:text-slate-400">
											<div className="mb-1">
												<span className="font-medium">Exercises:</span> {workout.exercises.slice(0, 3).map(ex => ex.name).join(', ')}
												{workout.exercises.length > 3 && ` +${workout.exercises.length - 3} more`}
											</div>
											<div>
												<span className="font-medium">Total Volume:</span> {Math.round(totalVolume)} kg
											</div>
										</div>
									</div>

									<ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 group-hover:translate-x-1 transition-all duration-200" />
								</div>
							);
						})}

						{/* Enhanced 14-Day Summary */}
						<div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
							<div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
								<div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
									<div className="text-lg font-bold text-blue-700 dark:text-blue-400">
										{workouts.length}
									</div>
									<div className="text-blue-600 dark:text-blue-500">Workouts</div>
								</div>
								<div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
									<div className="text-lg font-bold text-purple-700 dark:text-purple-400">
										{workouts.reduce((total, w) => total + (w.totalDuration || 0), 0)}
									</div>
									<div className="text-purple-600 dark:text-purple-500">Total Minutes</div>
								</div>
								<div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
									<div className="text-lg font-bold text-green-700 dark:text-green-400">
										{Math.round(workouts.reduce((total, w) => total + w.exercises.reduce((sum, ex) => sum + ex.totalVolume, 0), 0))}
									</div>
									<div className="text-green-600 dark:text-green-500">Total Volume (kg)</div>
								</div>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>

			<WorkoutDetailModal
				workout={selectedWorkout}
				isOpen={isModalOpen}
				onClose={handleCloseModal}
			/>
		</>
	);
}
