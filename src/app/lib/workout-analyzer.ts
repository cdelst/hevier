// Workout analysis service - analyzes last 7 days against reference requirements
import {
	WorkoutSession,
	WeeklyAnalysis,
	MuscleGroupVolume,
	MuscleGroup,
	Exercise
} from '@/app/types';
import { ReferenceChartService } from './reference-chart';

class WorkoutAnalyzerService {
	private referenceChart: ReferenceChartService;

	constructor() {
		this.referenceChart = new ReferenceChartService();
	}

	/**
	 * Analyze workouts from the last 7 days and calculate volume per muscle group
	 */
	analyzeWeeklyVolume(workouts: WorkoutSession[]): WeeklyAnalysis {
		const weekStart = new Date();
		weekStart.setDate(weekStart.getDate() - 7);
		weekStart.setHours(0, 0, 0, 0);

		const weekEnd = new Date();
		weekEnd.setHours(23, 59, 59, 999);

		// Filter workouts to last 7 days
		const weeklyWorkouts = workouts.filter(workout =>
			workout.date >= weekStart && workout.date <= weekEnd
		);

		// Calculate volume per muscle group
		const muscleGroupVolumes = this.calculateMuscleGroupVolumes(weeklyWorkouts);

		// Calculate overall score based on how well targets were met
		const overallScore = this.calculateOverallScore(muscleGroupVolumes);

		// Generate recommendations
		const recommendations = this.generateRecommendations(muscleGroupVolumes);

		return {
			id: crypto.randomUUID(),
			userId: 'user', // Single user app
			weekStart,
			weekEnd,
			totalWorkouts: weeklyWorkouts.length,
			muscleGroupVolumes,
			overallScore,
			recommendations,
			createdAt: new Date(),
		};
	}

	/**
	 * Calculate volume (sets) per muscle group from workouts
	 */
	private calculateMuscleGroupVolumes(workouts: WorkoutSession[]): MuscleGroupVolume[] {
		// Initialize volume tracking for all muscle groups
		const volumeMap = new Map<MuscleGroup, {
			actualSets: number;
			exercises: Set<string>;
			lastWorkedDate?: Date;
		}>();

		// Get all muscle groups from reference chart
		const allMuscleGroups = this.referenceChart.getAllMuscleGroupTargets();

		allMuscleGroups.forEach(({ muscleGroup }) => {
			volumeMap.set(muscleGroup, {
				actualSets: 0,
				exercises: new Set<string>(),
				lastWorkedDate: undefined,
			});
		});

		// Process each workout to count sets per muscle group
		workouts.forEach(workout => {
			workout.exercises.forEach(exercise => {
				exercise.muscleGroups.forEach(muscleGroup => {
					const current = volumeMap.get(muscleGroup);
					if (current) {
						// Count all non-warmup sets
						const workingSets = exercise.sets.filter(set => !set.isWarmup).length;
						current.actualSets += workingSets;
						current.exercises.add(exercise.name);

						// Track most recent workout date for this muscle group
						if (!current.lastWorkedDate || workout.date > current.lastWorkedDate) {
							current.lastWorkedDate = workout.date;
						}
					}
				});
			});
		});

		// Convert to MuscleGroupVolume array with targets and deficits
		return allMuscleGroups.map(({ muscleGroup, minSets, maxSets }) => {
			const data = volumeMap.get(muscleGroup)!;
			const deficit = minSets - data.actualSets;
			const priorityScore = this.referenceChart.calculateMuscleGroupPriority(muscleGroup, deficit);

			return {
				muscleGroup,
				actualSets: data.actualSets,
				targetMin: minSets,
				targetMax: maxSets,
				deficit,
				lastWorkedDate: data.lastWorkedDate,
				exercisesPerformed: Array.from(data.exercises),
				priorityScore,
			};
		});
	}

	/**
	 * Calculate overall score (0-100) based on how well weekly targets were met
	 */
	private calculateOverallScore(muscleGroupVolumes: MuscleGroupVolume[]): number {
		let totalScore = 0;
		let weightedTotal = 0;

		muscleGroupVolumes.forEach(volume => {
			// Weight based on target volume (higher volume groups are more important)
			const weight = volume.targetMin;

			// Calculate score for this muscle group (0-100)
			let score: number;
			if (volume.actualSets >= volume.targetMin) {
				// Met minimum target
				if (volume.targetMax && volume.actualSets > volume.targetMax) {
					// Over maximum target - slightly reduce score
					const overAge = (volume.actualSets - volume.targetMax) / volume.targetMax;
					score = Math.max(90, 100 - (overAge * 20));
				} else {
					// In optimal range
					score = 100;
				}
			} else {
				// Below minimum target
				const completionRatio = volume.actualSets / volume.targetMin;
				score = completionRatio * 80; // Max 80 points if below target
			}

			totalScore += score * weight;
			weightedTotal += weight;
		});

		return Math.round(totalScore / weightedTotal);
	}

	/**
	 * Generate recommendations based on analysis
	 */
	private generateRecommendations(muscleGroupVolumes: MuscleGroupVolume[]): string[] {
		const recommendations: string[] = [];

		// Find muscle groups with significant deficits
		const deficits = muscleGroupVolumes
			.filter(volume => volume.deficit > 0)
			.sort((a, b) => b.priorityScore - a.priorityScore);

		if (deficits.length === 0) {
			recommendations.push("Great job! You've met all your weekly volume targets.");

			// Check for potential overtraining
			const overtrained = muscleGroupVolumes.filter(volume =>
				volume.targetMax && volume.actualSets > volume.targetMax * 1.2
			);

			if (overtrained.length > 0) {
				recommendations.push(
					`Consider reducing volume for: ${overtrained.map(v => v.muscleGroup).join(', ')}`
				);
			}
		} else {
			// Prioritize top deficits
			const topDeficits = deficits.slice(0, 3);

			recommendations.push(
				`Priority muscle groups to focus on: ${topDeficits.map(v => v.muscleGroup).join(', ')}`
			);

			topDeficits.forEach(volume => {
				if (volume.deficit >= volume.targetMin * 0.5) {
					// Major deficit (50%+ of target missing)
					recommendations.push(
						`${volume.muscleGroup}: Major deficit of ${volume.deficit} sets - consider adding a dedicated workout`
					);
				} else {
					// Minor deficit
					recommendations.push(
						`${volume.muscleGroup}: Add ${volume.deficit} sets this week`
					);
				}
			});
		}

		// Check for muscle groups not worked in >5 days
		const stale = muscleGroupVolumes.filter(volume => {
			if (!volume.lastWorkedDate) return true;
			const daysSince = (Date.now() - volume.lastWorkedDate.getTime()) / (1000 * 60 * 60 * 24);
			return daysSince > 5;
		});

		if (stale.length > 0) {
			recommendations.push(
				`Haven't trained in 5+ days: ${stale.map(v => v.muscleGroup).join(', ')}`
			);
		}

		return recommendations;
	}

	/**
	 * Get detailed breakdown of a specific muscle group's training
	 */
	getMuscleGroupBreakdown(
		muscleGroup: MuscleGroup,
		workouts: WorkoutSession[]
	): {
		totalSets: number;
		exerciseBreakdown: Array<{
			exerciseName: string;
			sets: number;
			lastPerformed: Date;
			totalReps: number;
			averageWeight?: number;
		}>;
		weeklyDistribution: Array<{
			date: Date;
			sets: number;
			exercises: string[];
		}>;
	} {
		const weekStart = new Date();
		weekStart.setDate(weekStart.getDate() - 7);

		const relevantWorkouts = workouts.filter(workout =>
			workout.date >= weekStart
		);

		const exerciseMap = new Map<string, {
			sets: number;
			lastPerformed: Date;
			totalReps: number;
			totalWeight: number;
			weightedSets: number;
		}>();

		const dailyBreakdown: Array<{
			date: Date;
			sets: number;
			exercises: string[];
		}> = [];

		relevantWorkouts.forEach(workout => {
			let workoutSets = 0;
			const workoutExercises: string[] = [];

			workout.exercises.forEach(exercise => {
				if (exercise.muscleGroups.includes(muscleGroup)) {
					const workingSets = exercise.sets.filter(set => !set.isWarmup);
					const setsCount = workingSets.length;

					if (setsCount > 0) {
						workoutSets += setsCount;
						workoutExercises.push(exercise.name);

						// Update exercise tracking
						const current = exerciseMap.get(exercise.name) || {
							sets: 0,
							lastPerformed: workout.date,
							totalReps: 0,
							totalWeight: 0,
							weightedSets: 0,
						};

						current.sets += setsCount;
						current.lastPerformed = workout.date;
						current.totalReps += workingSets.reduce((sum, set) => sum + set.reps, 0);

						// Calculate weighted average for weight
						workingSets.forEach(set => {
							if (set.weight) {
								current.totalWeight += set.weight * set.reps;
								current.weightedSets += set.reps;
							}
						});

						exerciseMap.set(exercise.name, current);
					}
				}
			});

			if (workoutSets > 0) {
				dailyBreakdown.push({
					date: workout.date,
					sets: workoutSets,
					exercises: workoutExercises,
				});
			}
		});

		return {
			totalSets: Array.from(exerciseMap.values()).reduce((sum, ex) => sum + ex.sets, 0),
			exerciseBreakdown: Array.from(exerciseMap.entries()).map(([name, data]) => ({
				exerciseName: name,
				sets: data.sets,
				lastPerformed: data.lastPerformed,
				totalReps: data.totalReps,
				averageWeight: data.weightedSets > 0 ? data.totalWeight / data.weightedSets : undefined,
			})).sort((a, b) => b.sets - a.sets),
			weeklyDistribution: dailyBreakdown.sort((a, b) => a.date.getTime() - b.date.getTime()),
		};
	}

	/**
	 * Predict recovery status for muscle groups
	 */
	predictRecoveryStatus(workouts: WorkoutSession[]): Array<{
		muscleGroup: MuscleGroup;
		recoveryStatus: 'FRESH' | 'RECOVERED' | 'FATIGUED' | 'OVERREACHED';
		daysSinceLastWorked: number;
		recommendedAction: 'TRAIN' | 'LIGHT_WORK' | 'REST';
	}> {
		const now = new Date();

		return this.referenceChart.getAllMuscleGroupTargets().map(({ muscleGroup }) => {
			// Find most recent workout for this muscle group
			let lastWorkedDate: Date | null = null;
			let recentVolume = 0;

			// Look at last 3 days for fatigue assessment
			const recentWorkouts = workouts.filter(workout => {
				const daysAgo = (now.getTime() - workout.date.getTime()) / (1000 * 60 * 60 * 24);
				return daysAgo <= 3;
			});

			recentWorkouts.forEach(workout => {
				workout.exercises.forEach(exercise => {
					if (exercise.muscleGroups.includes(muscleGroup)) {
						const workingSets = exercise.sets.filter(set => !set.isWarmup).length;
						recentVolume += workingSets;

						if (!lastWorkedDate || workout.date > lastWorkedDate) {
							lastWorkedDate = workout.date;
						}
					}
				});
			});

			const daysSinceLastWorked = lastWorkedDate
				? (now.getTime() - lastWorkedDate.getTime()) / (1000 * 60 * 60 * 24)
				: 999;

			// Determine recovery status based on days since last worked and recent volume
			let recoveryStatus: 'FRESH' | 'RECOVERED' | 'FATIGUED' | 'OVERREACHED';
			let recommendedAction: 'TRAIN' | 'LIGHT_WORK' | 'REST';

			if (daysSinceLastWorked >= 7) {
				recoveryStatus = 'FRESH';
				recommendedAction = 'TRAIN';
			} else if (daysSinceLastWorked >= 2) {
				recoveryStatus = 'RECOVERED';
				recommendedAction = 'TRAIN';
			} else if (recentVolume > this.referenceChart.getWeeklyTargets(muscleGroup).min * 0.7) {
				recoveryStatus = 'OVERREACHED';
				recommendedAction = 'REST';
			} else {
				recoveryStatus = 'FATIGUED';
				recommendedAction = 'LIGHT_WORK';
			}

			return {
				muscleGroup,
				recoveryStatus,
				daysSinceLastWorked: Math.floor(daysSinceLastWorked),
				recommendedAction,
			};
		});
	}
}

export { WorkoutAnalyzerService };
