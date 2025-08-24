'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import {
	X,
	Calendar,
	Clock,
	Dumbbell,
	TrendingUp,
	Target,
	Zap,
	BarChart3,
	Activity
} from 'lucide-react';

interface DetailedExercise {
	id: string;
	name: string;
	muscleGroups: string[];
	sets: number;
	totalVolume: number;
}

interface DetailedWorkout {
	id: string;
	date: string;
	exercises: DetailedExercise[];
	totalDuration: number;
	type?: string;
	totalSets?: number;
}

interface WorkoutDetailModalProps {
	workout: DetailedWorkout | null;
	isOpen: boolean;
	onClose: () => void;
}

export function WorkoutDetailModal({ workout, isOpen, onClose }: WorkoutDetailModalProps) {
	if (!workout) return null;

	const getWorkoutTypeColor = (type?: string) => {
		switch (type?.toUpperCase()) {
			case 'PUSH': return 'bg-red-500';
			case 'PULL': return 'bg-blue-500';
			case 'LEGS': return 'bg-green-500';
			default: return 'bg-slate-500';
		}
	};

	const getMuscleGroupColor = (muscleGroup: string) => {
		const colors = {
			'CHEST': 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300',
			'BACK': 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300',
			'SHOULDERS': 'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300',
			'BICEPS': 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/20 dark:text-cyan-300',
			'TRICEPS': 'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-300',
			'QUADS': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300',
			'HAMSTRINGS': 'bg-teal-100 text-teal-700 dark:bg-teal-900/20 dark:text-teal-300',
			'GLUTES': 'bg-pink-100 text-pink-700 dark:bg-pink-900/20 dark:text-pink-300',
			'CALVES': 'bg-lime-100 text-lime-700 dark:bg-lime-900/20 dark:text-lime-300',
			'ABS': 'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300',
			'FOREARMS': 'bg-violet-100 text-violet-700 dark:bg-violet-900/20 dark:text-violet-300',
			'NECK': 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-300',
			'CARDIO': 'bg-rose-100 text-rose-700 dark:bg-rose-900/20 dark:text-rose-300'
		};
		return colors[muscleGroup as keyof typeof colors] || 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
	};

	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		return date.toLocaleDateString('en-US', {
			weekday: 'long',
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	};

	const formatVolume = (volume: number) => {
		if (volume >= 1000) {
			return `${(volume / 1000).toFixed(1)}k kg`;
		}
		return `${Math.round(volume)} kg`;
	};

	const totalVolume = workout.exercises.reduce((sum, ex) => sum + ex.totalVolume, 0);
	const totalSets = workout.exercises.reduce((sum, ex) => sum + ex.sets, 0);
	const uniqueMuscleGroups = [...new Set(workout.exercises.flatMap(ex => ex.muscleGroups))];

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="max-w-4xl max-h-[90vh] bg-white dark:bg-slate-900 p-0 overflow-hidden">
				<div className="flex flex-col h-[90vh]">
					{/* Header */}
					<DialogHeader className="p-6 pb-4 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900">
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-3">
								<div className={`p-3 rounded-xl ${getWorkoutTypeColor(workout.type)}`}>
									<Dumbbell className="h-6 w-6 text-white" />
								</div>
								<div>
									<DialogTitle className="text-xl font-bold">
										{workout.type || 'Mixed'} Workout
									</DialogTitle>
									<DialogDescription className="text-lg">
										{formatDate(workout.date)}
									</DialogDescription>
								</div>
							</div>
						</div>
					</DialogHeader>

					{/* Stats Cards */}
					<div className="flex-shrink-0 px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
						<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
							<div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
								<div className="p-2 bg-blue-500 rounded-lg">
									<TrendingUp className="h-4 w-4 text-white" />
								</div>
								<div>
									<div className="text-lg font-bold text-slate-900 dark:text-slate-100">{totalSets}</div>
									<div className="text-xs text-slate-500 dark:text-slate-400">Total Sets</div>
								</div>
							</div>

							<div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
								<div className="p-2 bg-purple-500 rounded-lg">
									<BarChart3 className="h-4 w-4 text-white" />
								</div>
								<div>
									<div className="text-lg font-bold text-slate-900 dark:text-slate-100">{formatVolume(totalVolume)}</div>
									<div className="text-xs text-slate-500 dark:text-slate-400">Total Volume</div>
								</div>
							</div>

							<div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
								<div className="p-2 bg-green-500 rounded-lg">
									<Activity className="h-4 w-4 text-white" />
								</div>
								<div>
									<div className="text-lg font-bold text-slate-900 dark:text-slate-100">{workout.exercises.length}</div>
									<div className="text-xs text-slate-500 dark:text-slate-400">Exercises</div>
								</div>
							</div>

							<div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
								<div className="p-2 bg-orange-500 rounded-lg">
									<Target className="h-4 w-4 text-white" />
								</div>
								<div>
									<div className="text-lg font-bold text-slate-900 dark:text-slate-100">{uniqueMuscleGroups.length}</div>
									<div className="text-xs text-slate-500 dark:text-slate-400">Muscle Groups</div>
								</div>
							</div>
						</div>
					</div>

					{/* Muscle Groups */}
					<div className="flex-shrink-0 px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
						<h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Muscle Groups Trained</h4>
						<div className="flex flex-wrap gap-2">
							{uniqueMuscleGroups.map((muscleGroup) => (
								<Badge key={muscleGroup} className={getMuscleGroupColor(muscleGroup)}>
									{muscleGroup.toLowerCase()}
								</Badge>
							))}
						</div>
					</div>

					{/* Exercise List */}
					<div className="flex-1 overflow-y-auto px-6 py-4 min-h-0">
						<h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">Exercise Breakdown</h4>
						<div className="space-y-4 pb-4">
							{workout.exercises.map((exercise, index) => (
								<div key={exercise.id} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
									<div className="flex items-start justify-between mb-3">
										<div className="flex items-center gap-3">
											<div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-500 text-white font-bold text-sm">
												{index + 1}
											</div>
											<div>
												<h5 className="font-semibold text-slate-900 dark:text-slate-100">{exercise.name}</h5>
												<div className="flex flex-wrap gap-1 mt-1">
													{exercise.muscleGroups.map((group) => (
														<Badge key={group} variant="outline" className="text-xs">
															{group.toLowerCase()}
														</Badge>
													))}
												</div>
											</div>
										</div>
										<div className="text-right">
											<div className="text-sm font-semibold text-slate-900 dark:text-slate-100">{exercise.sets} sets</div>
											<div className="text-xs text-slate-500 dark:text-slate-400">{formatVolume(exercise.totalVolume)}</div>
										</div>
									</div>
								</div>
							))}
						</div>
					</div>

					{/* Footer */}
					<div className="flex-shrink-0 px-6 py-4 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
						<div className="flex items-center justify-between">
							<div className="text-xs text-slate-500 dark:text-slate-400">
								Workout ID: {workout.id}
							</div>
							<Button onClick={onClose} variant="outline">
								Close
							</Button>
						</div>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
