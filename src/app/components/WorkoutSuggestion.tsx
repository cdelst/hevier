'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
	Play,
	Clock,
	Dumbbell,
	Target,
	Calendar,
	ChevronRight,
	Loader2,
	CheckCircle2,
	ExternalLink
} from 'lucide-react';

interface Exercise {
	exerciseName: string;
	suggestedSets: number;
	suggestedReps: { min: number; max: number };
	reason?: string;
	priority?: string;
}

interface Suggestion {
	workoutType: string;
	date: string;
	exercises: Exercise[];
	estimatedDuration: number;
	focus: string[];
	notes?: string;
}

interface WorkoutSuggestionProps {
	suggestion?: Suggestion;
}

export function WorkoutSuggestion({ suggestion }: WorkoutSuggestionProps) {
	const [isCreating, setIsCreating] = useState(false);
	const [created, setCreated] = useState(false);

	if (!suggestion) {
		return (
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Play className="h-5 w-5" />
						Next Workout
					</CardTitle>
					<CardDescription>
						No workout suggestion available
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="text-center py-8 text-slate-500">
						Generate a new workout suggestion
					</div>
				</CardContent>
			</Card>
		);
	}

	const handleCreateRoutine = async (dryRun = false) => {
		setIsCreating(true);
		try {
			// Call the Hevy routine creation API
			const response = await fetch('/api/create-routine', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					suggestion,
					dryRun
				})
			});

			if (response.ok) {
				const result = await response.json();
				console.log(dryRun ? '🔍 Routine preview:' : '✅ Routine created:', result);

				if (!dryRun && result.success) {
					setCreated(true);
				}
			} else {
				throw new Error(`Failed to create routine: ${response.status}`);
			}
		} catch (error) {
			console.error('Failed to create routine:', error);
			alert('Failed to create routine. Please try again.');
		} finally {
			setIsCreating(false);
		}
	};

	const getWorkoutTypeColor = (type: string) => {
		switch (type.toUpperCase()) {
			case 'PUSH': return 'bg-red-500';
			case 'PULL': return 'bg-blue-500';
			case 'LEGS': return 'bg-green-500';
			default: return 'bg-slate-500';
		}
	};

	const getPriorityColor = (priority: string) => {
		switch (priority?.toLowerCase()) {
			case 'high': return 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20';
			case 'medium': return 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20';
			default: return 'border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/20';
		}
	};

	return (
		<div className="space-y-6">
			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<div>
							<CardTitle className="flex items-center gap-2">
								<div className={`p-2 rounded-lg ${getWorkoutTypeColor(suggestion.workoutType)}`}>
									<Dumbbell className="h-4 w-4 text-white" />
								</div>
								{suggestion.workoutType} Day
								<Badge variant="outline">
									{suggestion.date}
								</Badge>
							</CardTitle>
							<CardDescription className="mt-1">
								AI-generated workout optimized for your current progress
							</CardDescription>
						</div>
					</div>
				</CardHeader>
				<CardContent>
					<div className="space-y-6">
						{/* Workout Overview */}
						<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
							<div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
								<Clock className="h-5 w-5 text-slate-500" />
								<div>
									<p className="text-sm text-slate-600 dark:text-slate-400">Duration</p>
									<p className="font-semibold">{suggestion.estimatedDuration} min</p>
								</div>
							</div>

							<div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
								<Target className="h-5 w-5 text-slate-500" />
								<div>
									<p className="text-sm text-slate-600 dark:text-slate-400">Exercises</p>
									<p className="font-semibold">{suggestion.exercises?.length || 0} exercises</p>
								</div>
							</div>

							<div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
								<Dumbbell className="h-5 w-5 text-slate-500" />
								<div>
									<p className="text-sm text-slate-600 dark:text-slate-400">Focus</p>
									<p className="font-semibold">{suggestion.focus?.join(', ') || suggestion.focusAreas?.join(', ') || 'Mixed'}</p>
								</div>
							</div>
						</div>

						{/* Exercise List */}
						<div>
							<h4 className="text-lg font-semibold mb-4 text-slate-800 dark:text-slate-200">
								Exercise Breakdown
							</h4>
							<div className="space-y-3">
								{(suggestion.exercises || []).map((exercise, index) => (
									<div
										key={index}
										className={`p-4 rounded-lg border ${getPriorityColor(exercise?.priority)}`}
									>
										<div className="flex items-center justify-between mb-2">
											<div className="flex items-center gap-3">
												<span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 text-xs font-medium">
													{index + 1}
												</span>
												<h5 className="font-medium text-slate-900 dark:text-slate-100 capitalize">
													{exercise?.exerciseName || 'Unknown Exercise'}
												</h5>
												{exercise?.priority === 'high' && (
													<Badge variant="destructive" className="text-xs">
														Priority
													</Badge>
												)}
											</div>
											<div className="text-sm font-mono text-slate-600 dark:text-slate-400">
												{exercise?.suggestedSets || 3} × {exercise?.suggestedReps?.min || 8}
												{exercise?.suggestedReps?.min !== exercise?.suggestedReps?.max &&
													`-${exercise?.suggestedReps?.max || 12}`
												} reps
											</div>
										</div>
										{exercise?.reason && (
											<p className="text-xs text-slate-500 dark:text-slate-400 ml-9">
												{exercise.reason}
											</p>
										)}
									</div>
								))}
							</div>
						</div>

						{/* Notes */}
						{suggestion.notes && (
							<div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
								<p className="text-sm text-blue-700 dark:text-blue-300">
									<strong>Note:</strong> {suggestion.notes}
								</p>
							</div>
						)}

						{/* Action Buttons */}
						<div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
							<Button
								onClick={() => handleCreateRoutine(true)}
								variant="outline"
								disabled={isCreating}
								className="flex-1"
							>
								{isCreating ? (
									<Loader2 className="h-4 w-4 mr-2 animate-spin" />
								) : (
									<Target className="h-4 w-4 mr-2" />
								)}
								Preview Routine
							</Button>

							<Button
								onClick={() => handleCreateRoutine(false)}
								disabled={isCreating || created}
								className="flex-1"
							>
								{isCreating ? (
									<Loader2 className="h-4 w-4 mr-2 animate-spin" />
								) : created ? (
									<CheckCircle2 className="h-4 w-4 mr-2" />
								) : (
									<ExternalLink className="h-4 w-4 mr-2" />
								)}
								{created ? 'Created in Hevy' : 'Create in Hevy'}
							</Button>
						</div>

						{created && (
							<div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
								<div className="flex items-center gap-2 text-green-700 dark:text-green-300">
									<CheckCircle2 className="h-4 w-4" />
									<span className="text-sm font-medium">
										Routine successfully created in your Hevy app!
									</span>
								</div>
							</div>
						)}
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
