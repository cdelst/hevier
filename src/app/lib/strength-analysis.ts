import { WorkoutSession, Exercise, ExerciseSet, HevySet } from '../types/index.js';
import { roundToGymWeight, kgToLbs, lbsToKg } from './weight-utils.js';

// RPE-based calculations for strength analysis
export interface StrengthData {
	exerciseId: string;
	exerciseName: string;
	estimated1RM: number;
	recentBest: {
		weight: number;
		reps: number;
		rpe?: number;
		date: Date;
	};
	averageIntensity: number; // Average % of 1RM used
	volumeProgression: number; // Recent volume trend
	strengthProgression: number; // Recent strength trend
	confidenceScore: number; // 0-1, based on data quality and recency
}

export interface ProgressiveSet {
	setNumber: number;
	targetReps: number;
	suggestedWeight: number;
	targetRPE: number;
	restSeconds: number;
	notes?: string;
}

export class StrengthAnalysisService {

	/**
	 * Calculate estimated 1RM using Epley formula with RPE adjustment
	 */
	private calculate1RM(weight: number, reps: number, rpe?: number): number {
		if (reps <= 1) return weight;

		// Base Epley formula: 1RM = weight × (1 + reps/30)
		let estimated1RM = weight * (1 + (reps / 30));

		// Adjust for RPE if available
		if (rpe && rpe < 10) {
			// RPE adjustment: each point below 10 = ~1 rep in reserve
			const repsInReserve = 10 - rpe;
			const adjustedReps = reps + repsInReserve;
			estimated1RM = weight * (1 + (adjustedReps / 30));
		}

		return Math.round(estimated1RM * 10) / 10; // Round to 1 decimal
	}



	/**
	 * Calculate working weight for a target rep range and RPE
	 */
	private calculateWorkingWeight(oneRM: number, targetReps: number, targetRPE: number = 8): number {
		// Calculate base percentage for rep range
		let percentage: number;

		if (targetReps <= 3) percentage = 0.90;      // 90% for 1-3 reps
		else if (targetReps <= 5) percentage = 0.85; // 85% for 4-5 reps  
		else if (targetReps <= 8) percentage = 0.80; // 80% for 6-8 reps
		else if (targetReps <= 12) percentage = 0.70; // 70% for 9-12 reps
		else percentage = 0.65;                       // 65% for 12+ reps

		// Adjust for target RPE
		const rpeAdjustment = (10 - targetRPE) * 0.025; // ~2.5% per RPE point
		percentage -= rpeAdjustment;

		// Ensure reasonable bounds
		percentage = Math.max(0.5, Math.min(0.95, percentage));

		const workingWeight = oneRM * percentage;
		return roundToGymWeight(workingWeight); // Round to practical gym increments
	}

	/**
	 * Analyze strength data for a specific exercise
	 */
	analyzeExerciseStrength(exerciseId: string, exerciseName: string, workouts: WorkoutSession[]): StrengthData | null {
		// Find all instances of this exercise in recent workouts
		const exerciseInstances: Array<{
			exercise: Exercise,
			date: Date,
			sets: ExerciseSet[]
		}> = [];

		workouts.forEach(workout => {
			workout.exercises.forEach(exercise => {
				if (exercise.hevyExerciseId === exerciseId || exercise.name === exerciseName) {
					exerciseInstances.push({
						exercise,
						date: workout.date,
						sets: exercise.sets
					});
				}
			});
		});

		if (exerciseInstances.length === 0) return null;

		// Calculate 1RM estimates for each working set (convert to lbs for calculations)
		const oneRMEstimates: Array<{
			estimate: number;
			weight: number;
			reps: number;
			rpe?: number;
			date: Date;
		}> = [];

		exerciseInstances.forEach(instance => {
			instance.sets.forEach(set => {
				if (!set.isWarmup && set.weight && set.reps > 0) {
					// Convert weight from kg (Hevy API) to lbs for calculations
					const weightInLbs = kgToLbs(set.weight);
					const estimate = this.calculate1RM(weightInLbs, set.reps, set.rpe);
					oneRMEstimates.push({
						estimate,
						weight: weightInLbs, // Store in lbs
						reps: set.reps,
						rpe: set.rpe,
						date: instance.date
					});
				}
			});
		});

		if (oneRMEstimates.length === 0) return null;

		// Calculate weighted average 1RM (more recent = higher weight)
		const now = new Date();
		let weightedSum = 0;
		let totalWeight = 0;

		oneRMEstimates.forEach(estimate => {
			const daysSince = (now.getTime() - estimate.date.getTime()) / (1000 * 60 * 60 * 24);
			const recencyWeight = Math.exp(-daysSince / 30); // Exponential decay, 30-day half-life

			weightedSum += estimate.estimate * recencyWeight;
			totalWeight += recencyWeight;
		});

		const estimated1RM = weightedSum / totalWeight;

		// Find recent best performance (heaviest weight × reps in last 30 days)
		const recentEstimates = oneRMEstimates.filter(e => {
			const daysSince = (now.getTime() - e.date.getTime()) / (1000 * 60 * 60 * 24);
			return daysSince <= 30;
		});

		const recentBest = recentEstimates.reduce((best, current) => {
			const currentScore = current.weight * current.reps;
			const bestScore = best.weight * best.reps;
			return currentScore > bestScore ? current : best;
		});

		// Calculate average intensity and progressions
		const recentWorkingWeights = recentEstimates.map(e => e.weight);
		const averageIntensity = recentWorkingWeights.length > 0
			? recentWorkingWeights.reduce((a, b) => a + b, 0) / recentWorkingWeights.length / estimated1RM
			: 0.75;

		// Simple strength progression (compare first half vs second half of recent data)
		let strengthProgression = 0;
		if (oneRMEstimates.length >= 4) {
			const sorted = oneRMEstimates.sort((a, b) => a.date.getTime() - b.date.getTime());
			const firstHalf = sorted.slice(0, Math.floor(sorted.length / 2));
			const secondHalf = sorted.slice(Math.floor(sorted.length / 2));

			const firstAvg = firstHalf.reduce((sum, e) => sum + e.estimate, 0) / firstHalf.length;
			const secondAvg = secondHalf.reduce((sum, e) => sum + e.estimate, 0) / secondHalf.length;

			strengthProgression = (secondAvg - firstAvg) / firstAvg;
		}

		// Calculate confidence score based on data quality
		const dataPoints = oneRMEstimates.length;
		const recency = Math.min(30, (now.getTime() - recentBest.date.getTime()) / (1000 * 60 * 60 * 24)) / 30;
		const rpeDataQuality = oneRMEstimates.filter(e => e.rpe).length / oneRMEstimates.length;

		const confidenceScore = Math.min(1, (
			(Math.min(dataPoints, 10) / 10) * 0.4 +     // 40% for data quantity
			(1 - recency) * 0.4 +                        // 40% for recency
			rpeDataQuality * 0.2                         // 20% for RPE data quality
		));

		return {
			exerciseId,
			exerciseName,
			estimated1RM,
			recentBest: {
				weight: recentBest.weight,
				reps: recentBest.reps,
				rpe: recentBest.rpe,
				date: recentBest.date
			},
			averageIntensity,
			volumeProgression: 0, // TODO: Implement volume progression calculation
			strengthProgression,
			confidenceScore
		};
	}

	/**
	 * Generate progressive set structure with decreasing reps and increasing weights
	 */
	generateProgressiveSets(
		strengthData: StrengthData,
		totalSets: number = 4,
		startReps: number = 12,
		endReps: number = 6
	): ProgressiveSet[] {
		const sets: ProgressiveSet[] = [];
		const { estimated1RM, averageIntensity, confidenceScore } = strengthData;

		// If confidence is low, use more conservative approach
		const conservativeMultiplier = confidenceScore < 0.5 ? 0.9 : 1.0;
		const adjustedOneRM = estimated1RM * conservativeMultiplier;

		for (let setNum = 1; setNum <= totalSets; setNum++) {
			// Linear progression from start reps to end reps
			const progress = (setNum - 1) / (totalSets - 1);
			const targetReps = Math.round(startReps - (startReps - endReps) * progress);

			// Progressive RPE: start easier, finish harder
			const baseRPE = 7;
			const targetRPE = Math.min(9, baseRPE + progress * 2);

			// Calculate weight for this set
			const suggestedWeight = this.calculateWorkingWeight(adjustedOneRM, targetReps, targetRPE);

			// Progressive rest times (heavier sets need more rest)
			const restSeconds = Math.round(90 + progress * 90); // 90s to 180s

			// Add notes for specific sets
			let notes: string | undefined;
			if (setNum === 1) notes = "Warm up, focus on form";
			else if (setNum === totalSets) notes = "Last set - push to failure if possible";
			else if (targetRPE >= 8.5) notes = "Heavy set - maintain form";

			sets.push({
				setNumber: setNum,
				targetReps,
				suggestedWeight,
				targetRPE: Math.round(targetRPE * 10) / 10,
				restSeconds,
				notes
			});
		}

		return sets;
	}

	/**
	 * Analyze strength for all exercises from workout history
	 */
	analyzeAllExercises(workouts: WorkoutSession[]): Map<string, StrengthData> {
		const exerciseMap = new Map<string, StrengthData>();

		// Collect all unique exercises
		const uniqueExercises = new Map<string, string>(); // id -> name

		workouts.forEach(workout => {
			workout.exercises.forEach(exercise => {
				if (exercise.hevyExerciseId) {
					uniqueExercises.set(exercise.hevyExerciseId, exercise.name);
				}
			});
		});

		// Analyze each exercise
		uniqueExercises.forEach((name, id) => {
			const strengthData = this.analyzeExerciseStrength(id, name, workouts);
			if (strengthData && strengthData.confidenceScore > 0.1) {
				exerciseMap.set(id, strengthData);
			}
		});

		return exerciseMap;
	}

	/**
	 * Get strength data for a specific exercise, with fallback estimation
	 */
	getExerciseStrengthData(
		exerciseId: string,
		exerciseName: string,
		strengthMap: Map<string, StrengthData>
	): StrengthData {
		const existing = strengthMap.get(exerciseId);
		if (existing) return existing;

		// Fallback: create conservative estimate based on exercise type
		const estimated1RM = this.estimateInitial1RM(exerciseName);

		return {
			exerciseId,
			exerciseName,
			estimated1RM,
			recentBest: {
				weight: estimated1RM * 0.7,
				reps: 8,
				date: new Date()
			},
			averageIntensity: 0.75,
			volumeProgression: 0,
			strengthProgression: 0,
			confidenceScore: 0.1 // Very low confidence for estimates
		};
	}

	/**
 * Conservative initial 1RM estimates for new exercises (based on average gym-goer)
 * Returns estimates in pounds
 */
	private estimateInitial1RM(exerciseName: string): number {
		const name = exerciseName.toLowerCase();

		// Conservative estimates in lbs for intermediate lifter
		if (name.includes('bench press') || name.includes('bench')) return 175;
		if (name.includes('squat')) return 225;
		if (name.includes('deadlift')) return 265;
		if (name.includes('row') || name.includes('pull up') || name.includes('lat pulldown')) return 155;
		if (name.includes('shoulder press') || name.includes('overhead press')) return 110;
		if (name.includes('curl') || name.includes('bicep')) return 65;
		if (name.includes('tricep') || name.includes('dip')) return 90;
		if (name.includes('leg press')) return 330;
		if (name.includes('leg curl') || name.includes('leg extension')) return 130;

		// Default conservative estimate
		return 90;
	}
}
