/**
 * Advanced Workout Generator Service
 * 
 * This service contains the sophisticated workout generation logic extracted from
 * the standalone script. It provides advanced PPL analysis, intelligent exercise
 * selection, and comprehensive accessory management.
 */

import { WorkoutSession, Exercise, MuscleGroup, WorkoutSuggestion, ExerciseSuggestion, WorkoutType, ProgressiveSet, StrengthData, EquipmentPreferences, EquipmentType } from '../types/index.js';
import { ReferenceChartService } from './reference-chart.js';
import { getHevyExerciseId, getMuscleGroupsForExercise } from './exercise-mapping.js';
import { StrengthAnalysisService } from './strength-analysis.js';
import { getDefaultEquipmentPreferences, filterExercisesByEquipment, scoreExerciseByEquipment, getDumbbellAlternatives, getEquipmentForExercise } from './equipment-preferences.js';
import crypto from 'crypto';

export interface WeeklyAnalysis {
	muscleGroupVolumes: Array<{
		muscleGroup: MuscleGroup;
		actualSets: number;
		targetMin: number;
		targetMax: number;
		deficit: number;
	}>;
	overallScore: number;
}

export interface ExerciseOption {
	category: string;
	options: string[];
	sets: number;
	reps: { min: number; max: number };
	rest: number;
	muscleGroups: string[];
	priority: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface GeneratedExercise {
	exerciseName: string;
	muscleGroups: string[];
	suggestedSets: number;
	suggestedReps: { min: number; max: number };
	restTime: number;
	priority: string;
	category?: string;
	isAccessory?: boolean;
}

export class AdvancedWorkoutGenerator {
	private referenceChart: ReferenceChartService;
	private strengthAnalysis: StrengthAnalysisService;
	private equipmentPreferences: EquipmentPreferences;

	constructor(equipmentPreferences?: EquipmentPreferences) {
		this.referenceChart = new ReferenceChartService();
		this.strengthAnalysis = new StrengthAnalysisService();
		this.equipmentPreferences = equipmentPreferences || getDefaultEquipmentPreferences();
	}

	/**
	 * Advanced PPL workout type determination using 60% threshold and history analysis
	 */
	determineNextPPLWorkout(workouts: WorkoutSession[]): string {
		// Get the most recent workouts sorted by date
		const recentWorkouts = workouts
			.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
			.slice(0, 10); // Look at more workouts to get better history

		// Define muscle group mappings for PPL based on reference cheatsheet
		const pushMuscles = ['CHEST', 'SHOULDERS', 'TRICEPS'];
		const pullMuscles = ['BACK', 'BICEPS'];
		const legMuscles = ['QUADS', 'HAMSTRINGS', 'GLUTES', 'CALVES'];

		// Classify each workout based on majority muscle groups
		const workoutTypes = recentWorkouts.map(workout => {
			const muscleGroupCounts = { PUSH: 0, PULL: 0, LEGS: 0, OTHER: 0 };

			// Count sets per muscle group category
			workout.exercises.forEach(exercise => {
				const sets = Array.isArray(exercise.sets) ? exercise.sets.length : (exercise.sets || 1);
				exercise.muscleGroups.forEach(muscle => {
					if (pushMuscles.includes(muscle)) {
						muscleGroupCounts.PUSH += sets;
					} else if (pullMuscles.includes(muscle)) {
						muscleGroupCounts.PULL += sets;
					} else if (legMuscles.includes(muscle)) {
						muscleGroupCounts.LEGS += sets;
					} else {
						muscleGroupCounts.OTHER += sets;
					}
				});
			});

			// Determine workout type based on majority sets
			const total = muscleGroupCounts.PUSH + muscleGroupCounts.PULL + muscleGroupCounts.LEGS;
			const maxCount = Math.max(muscleGroupCounts.PUSH, muscleGroupCounts.PULL, muscleGroupCounts.LEGS);

			let workoutType = 'MIXED';
			if (total > 0 && maxCount / total > 0.6) { // At least 60% of sets from one category
				if (maxCount === muscleGroupCounts.PUSH) workoutType = 'PUSH';
				else if (maxCount === muscleGroupCounts.PULL) workoutType = 'PULL';
				else if (maxCount === muscleGroupCounts.LEGS) workoutType = 'LEGS';
			}

			const daysSince = Math.floor((new Date().getTime() - new Date(workout.date).getTime()) / (1000 * 60 * 60 * 24));

			console.log(`📊 Workout ${workout.date}: ${workoutType} (${daysSince} days ago)`);
			console.log(`   Push: ${muscleGroupCounts.PUSH}, Pull: ${muscleGroupCounts.PULL}, Legs: ${muscleGroupCounts.LEGS} sets`);

			return { type: workoutType, daysSince, date: workout.date };
		});

		// Find when each type was last done (only count clearly categorized workouts)
		let lastPushDays = Infinity;
		let lastPullDays = Infinity;
		let lastLegsDays = Infinity;

		workoutTypes.forEach(workout => {
			if (workout.type === 'PUSH' && workout.daysSince < lastPushDays) {
				lastPushDays = workout.daysSince;
			}
			if (workout.type === 'PULL' && workout.daysSince < lastPullDays) {
				lastPullDays = workout.daysSince;
			}
			if (workout.type === 'LEGS' && workout.daysSince < lastLegsDays) {
				lastLegsDays = workout.daysSince;
			}
		});

		console.log(`📅 Days since last workouts - Push: ${lastPushDays === Infinity ? 'Never' : lastPushDays}, Pull: ${lastPullDays === Infinity ? 'Never' : lastPullDays}, Legs: ${lastLegsDays === Infinity ? 'Never' : lastLegsDays}`);

		// Follow proper PPL sequence: Push → Pull → Legs → repeat
		// Find the most recent clearly categorized workout
		const recentCategorizedWorkouts = workoutTypes.filter(w => w.type !== 'MIXED');

		if (recentCategorizedWorkouts.length === 0) {
			// No clear categorized workouts, start with PUSH
			return 'PUSH';
		}

		// Get the most recent workout type
		const mostRecentWorkout = recentCategorizedWorkouts
			.sort((a, b) => a.daysSince - b.daysSince)[0];

		console.log(`🎯 Last workout was ${mostRecentWorkout.type}, following PPL sequence...`);

		// Follow proper sequence
		switch (mostRecentWorkout.type) {
			case 'PUSH':
				return 'PULL';
			case 'PULL':
				return 'LEGS';
			case 'LEGS':
				return 'PUSH';
			default:
				return 'PUSH';
		}
	}

	/**
	 * Generate comprehensive workout with intelligent exercise selection
	 */
	generateAdvancedWorkout(workoutType: string, weeklyAnalysis: WeeklyAnalysis): GeneratedExercise[] {
		const exercises: GeneratedExercise[] = [];

		// Get core exercises for the workout type
		const coreExercises = this.getCoreExercisesForType(workoutType);

		// Add core exercises with priority-based selection and equipment preferences
		coreExercises.forEach(exerciseOption => {
			// Select exercise based on priority, availability, and equipment preferences
			const selectedExercise = this.selectExerciseFromOptions(exerciseOption, workoutType);
			if (selectedExercise) {
				exercises.push(selectedExercise);
			}
		});

		// Add intelligent accessories based on volume deficits
		const accessoryExercises = this.addIntelligentAccessories(exercises, weeklyAnalysis);
		exercises.push(...accessoryExercises);

		// Add workout-specific accessories
		const specificAccessories = this.addWorkoutSpecificAccessories(exercises, workoutType, weeklyAnalysis);
		exercises.push(...specificAccessories);

		return exercises;
	}

	/**
	 * Get core exercise definitions for each workout type
	 */
	private getCoreExercisesForType(workoutType: string): ExerciseOption[] {
		const coreExercises = {
			'PUSH': [
				{
					category: 'HORIZONTAL PRESS',
					options: ['bench press', 'push up', 'dumbbell press'],
					sets: 4, reps: { min: 5, max: 15 }, rest: 180,
					muscleGroups: ['CHEST', 'TRICEPS', 'SHOULDERS'], priority: 'HIGH' as const
				},
				{
					category: 'INCLINE PRESS',
					options: ['incline bench press', 'decline pushup', 'incline dumbbell press'],
					sets: 3, reps: { min: 5, max: 15 }, rest: 150,
					muscleGroups: ['CHEST', 'SHOULDERS', 'TRICEPS'], priority: 'MEDIUM' as const
				},
				{
					category: 'OVERHEAD PRESS',
					options: ['overhead press', 'military press', 'dumbbell shoulder press'],
					sets: 3, reps: { min: 5, max: 15 }, rest: 120,
					muscleGroups: ['SHOULDERS', 'TRICEPS'], priority: 'MEDIUM' as const
				},
				{
					category: 'LATERAL HEAD ISOLATION',
					options: ['dumbbell lateral raise', 'cable lateral raise', 'machine lateral raise'],
					sets: 3, reps: { min: 12, max: 30 }, rest: 90,
					muscleGroups: ['SHOULDERS'], priority: 'LOW' as const
				},
				{
					category: 'CHEST ISOLATION',
					options: ['chest fly', 'pec deck', 'cable crossover'],
					sets: 3, reps: { min: 12, max: 30 }, rest: 90,
					muscleGroups: ['CHEST'], priority: 'LOW' as const
				},
				{
					category: 'TRICEP PUSH MOVEMENT',
					options: ['tricep dips', 'close grip bench press', 'push up'],
					sets: 3, reps: { min: 8, max: 15 }, rest: 90,
					muscleGroups: ['TRICEPS', 'CHEST'], priority: 'MEDIUM' as const
				}
			],
			'PULL': [
				{
					category: 'VERTICAL PULL',
					options: ['lat pulldown', 'pull up', 'chin up'],
					sets: 4, reps: { min: 5, max: 15 }, rest: 180,
					muscleGroups: ['BACK', 'BICEPS'], priority: 'HIGH' as const
				},
				{
					category: 'HORIZONTAL PULL',
					options: ['barbell row', 'seated cable row', 'dumbbell row'],
					sets: 4, reps: { min: 5, max: 15 }, rest: 150,
					muscleGroups: ['BACK', 'BICEPS'], priority: 'HIGH' as const
				},
				{
					category: 'MAIN BICEPS CURL',
					options: ['barbell curl', 'dumbbell curl', 'ez-bar curl'],
					sets: 3, reps: { min: 5, max: 15 }, rest: 120,
					muscleGroups: ['BICEPS'], priority: 'MEDIUM' as const
				},
				{
					category: 'BRACHIALIS CURL',
					options: ['hammer curl', 'reverse curl', 'neutral grip curl'],
					sets: 3, reps: { min: 12, max: 30 }, rest: 90,
					muscleGroups: ['BICEPS'], priority: 'LOW' as const
				},
				{
					category: 'BACK ISOLATION',
					options: ['pullover', 'face pull', 'reverse fly'],
					sets: 3, reps: { min: 12, max: 30 }, rest: 90,
					muscleGroups: ['BACK', 'SHOULDERS'], priority: 'LOW' as const
				}
			],
			'LEGS': [
				{
					category: 'LOWER BODY COMPOUND',
					options: ['squat', 'leg press', 'hack squat'],
					sets: 4, reps: { min: 5, max: 15 }, rest: 180,
					muscleGroups: ['QUADS', 'GLUTES'], priority: 'HIGH' as const
				},
				{
					category: 'HIP HINGE MOVEMENT',
					options: ['Romanian deadlift', 'stiff leg deadlift', 'good mornings'],
					sets: 4, reps: { min: 5, max: 15 }, rest: 150,
					muscleGroups: ['HAMSTRINGS', 'GLUTES'], priority: 'HIGH' as const
				},
				{
					category: 'UNILATERAL MOVEMENT',
					options: ['Bulgarian split squat', 'walking lunges', 'step ups'],
					sets: 3, reps: { min: 8, max: 15 }, rest: 120,
					muscleGroups: ['QUADS', 'GLUTES'], priority: 'MEDIUM' as const
				},
				{
					category: 'KNEE DOMINANT ISOLATION',
					options: ['leg extension', 'leg curl', 'sissy squat'],
					sets: 3, reps: { min: 12, max: 30 }, rest: 90,
					muscleGroups: ['QUADS', 'HAMSTRINGS'], priority: 'LOW' as const
				},
				{
					category: 'HIP DOMINANT ISOLATION',
					options: ['glute bridge', 'hip thrust', 'glute kickbacks'],
					sets: 3, reps: { min: 12, max: 30 }, rest: 90,
					muscleGroups: ['GLUTES'], priority: 'LOW' as const
				}
			]
		};

		return coreExercises[workoutType as keyof typeof coreExercises] || [];
	}

	/**
	 * Select exercise from options with intelligent mapping and equipment preferences
	 */
	private selectExerciseFromOptions(exerciseOption: ExerciseOption, workoutType: string): GeneratedExercise | null {
		// Determine movement type for equipment preferences
		const movementType = workoutType === 'PUSH' ? 'PUSH' :
			workoutType === 'PULL' ? 'PULL' : 'LEGS';

		// Score each option based on equipment preferences and Hevy availability
		const scoredOptions = exerciseOption.options.map(option => {
			const hevyId = getHevyExerciseId(option);
			const equipmentScore = scoreExerciseByEquipment(option, this.equipmentPreferences, movementType);
			const availabilityScore = hevyId ? 1.0 : 0.0; // Prefer exercises available in Hevy

			// Look for equipment alternatives if this workout type has specific preferences
			let alternativeOptions = [option];

			// Get preferred equipment types for this movement
			const movementPreference = movementType === 'PUSH' ? this.equipmentPreferences.pushMovements :
				movementType === 'PULL' ? this.equipmentPreferences.pullMovements :
					this.equipmentPreferences.legMovements;

			// If we have specific equipment preferences (array), look for alternatives
			if (Array.isArray(movementPreference)) {
				if (movementPreference.includes('DUMBBELL')) {
					const dumbbellAlternatives = getDumbbellAlternatives(option);
					if (dumbbellAlternatives.length > 0) {
						alternativeOptions = [...dumbbellAlternatives, option]; // Try dumbbell alternatives first
					}
				}
				// Could add more alternative systems here (cable alternatives, bodyweight alternatives, etc.)
			}

			// Find best alternative with Hevy ID
			for (const altOption of alternativeOptions) {
				const altHevyId = getHevyExerciseId(altOption);
				if (altHevyId) {
					const altEquipmentScore = scoreExerciseByEquipment(altOption, this.equipmentPreferences, movementType);
					return {
						exerciseName: altOption,
						totalScore: (altEquipmentScore * 0.7) + (1.0 * 0.3), // 70% equipment preference, 30% availability
						hevyId: altHevyId
					};
				}
			}

			// Fall back to original option
			return {
				exerciseName: option,
				totalScore: (equipmentScore * 0.7) + (availabilityScore * 0.3),
				hevyId
			};
		});

		// Sort by score (highest first) and select the best option
		scoredOptions.sort((a, b) => b.totalScore - a.totalScore);
		const bestOption = scoredOptions[0];

		if (bestOption) {
			return {
				exerciseName: bestOption.exerciseName,
				muscleGroups: exerciseOption.muscleGroups,
				suggestedSets: exerciseOption.sets,
				suggestedReps: exerciseOption.reps,
				restTime: exerciseOption.rest,
				priority: exerciseOption.priority,
				category: exerciseOption.category,
				isAccessory: false
			};
		}

		// Final fallback
		return {
			exerciseName: exerciseOption.options[0],
			muscleGroups: exerciseOption.muscleGroups,
			suggestedSets: exerciseOption.sets,
			suggestedReps: exerciseOption.reps,
			restTime: exerciseOption.rest,
			priority: exerciseOption.priority,
			category: exerciseOption.category,
			isAccessory: false
		};
	}

	/**
	 * Add intelligent accessories based on volume deficits
	 */
	private addIntelligentAccessories(exercises: GeneratedExercise[], weeklyAnalysis: WeeklyAnalysis): GeneratedExercise[] {
		const accessories: GeneratedExercise[] = [];
		const addedAccessories: Set<string> = new Set();

		// Check each muscle group for deficits and add accessories accordingly
		weeklyAnalysis.muscleGroupVolumes.forEach(volume => {
			const deficit = volume.deficit;
			const muscleGroup = volume.muscleGroup;

			// Add cardio (70% chance at beginning)
			if (muscleGroup === 'CARDIO' && deficit > 0 && Math.random() < 0.7 && !addedAccessories.has('cardio')) {
				accessories.unshift({ // Add at beginning
					exerciseName: 'treadmill',
					muscleGroups: ['CARDIO'],
					suggestedSets: 1,
					suggestedReps: { min: 15, max: 30 }, // minutes
					restTime: 0,
					priority: 'CARDIO',
					isAccessory: true
				});
				addedAccessories.add('cardio');
			}

			// Add abs (60% chance if deficit)
			if (muscleGroup === 'ABS' && deficit > 2 && Math.random() < 0.6 && !addedAccessories.has('abs')) {
				accessories.push({
					exerciseName: 'plank',
					muscleGroups: ['ABS'],
					suggestedSets: 3,
					suggestedReps: { min: 30, max: 60 }, // seconds
					restTime: 60,
					priority: 'ACCESSORY',
					isAccessory: true
				});
				addedAccessories.add('abs');
			}

			// Add forearms (50% chance if deficit)
			if (muscleGroup === 'FOREARMS' && deficit > 1 && Math.random() < 0.5 && !addedAccessories.has('forearms')) {
				accessories.push({
					exerciseName: 'wrist curl',
					muscleGroups: ['FOREARMS'],
					suggestedSets: 2,
					suggestedReps: { min: 15, max: 25 },
					restTime: 45,
					priority: 'ACCESSORY',
					isAccessory: true
				});
				addedAccessories.add('forearms');
			}

			// Add calves (40% chance if deficit, 100% if big deficit)
			if (muscleGroup === 'CALVES' && deficit > 0 && !addedAccessories.has('calves')) {
				const chance = deficit > 3 ? 1.0 : 0.4;
				if (Math.random() < chance) {
					accessories.push({
						exerciseName: 'calf raises',
						muscleGroups: ['CALVES'],
						suggestedSets: 3,
						suggestedReps: { min: 15, max: 25 },
						restTime: 60,
						priority: 'ACCESSORY',
						isAccessory: true
					});
					addedAccessories.add('calves');
				}
			}

			// Add neck (30% chance if big deficit)
			if (muscleGroup === 'NECK' && deficit > 2 && Math.random() < 0.3 && !addedAccessories.has('neck')) {
				accessories.push({
					exerciseName: 'neck curls',
					muscleGroups: ['NECK'],
					suggestedSets: 2,
					suggestedReps: { min: 12, max: 20 },
					restTime: 60,
					priority: 'ACCESSORY',
					isAccessory: true
				});
				addedAccessories.add('neck');
			}
		});

		return accessories;
	}

	/**
	 * Add workout-specific accessories
	 */
	private addWorkoutSpecificAccessories(exercises: GeneratedExercise[], workoutType: string, weeklyAnalysis: WeeklyAnalysis): GeneratedExercise[] {
		const accessories: GeneratedExercise[] = [];
		const existingExercises = new Set(exercises.map(ex => ex.exerciseName.toLowerCase()));

		if (workoutType === 'PUSH') {
			// Add lateral raise if not already included (60% chance)
			if (!existingExercises.has('lateral raise') && Math.random() < 0.6) {
				accessories.push({
					exerciseName: 'lateral raise',
					muscleGroups: ['SHOULDERS'],
					suggestedSets: 3,
					suggestedReps: { min: 12, max: 20 },
					restTime: 60,
					priority: 'ISOLATION',
					isAccessory: true
				});
			}
			// Add tricep isolation (50% chance)
			if (Math.random() < 0.5) {
				accessories.push({
					exerciseName: 'tricep extension',
					muscleGroups: ['TRICEPS'],
					suggestedSets: 3,
					suggestedReps: { min: 10, max: 15 },
					restTime: 60,
					priority: 'ISOLATION',
					isAccessory: true
				});
			}
		} else if (workoutType === 'PULL') {
			// Add face pull/rear delt work (70% chance)
			if (Math.random() < 0.7) {
				accessories.push({
					exerciseName: 'face pull',
					muscleGroups: ['BACK', 'SHOULDERS'],
					suggestedSets: 3,
					suggestedReps: { min: 15, max: 20 },
					restTime: 60,
					priority: 'ISOLATION',
					isAccessory: true
				});
			}
			// Add bicep isolation (60% chance)
			if (Math.random() < 0.6) {
				accessories.push({
					exerciseName: 'hammer curl',
					muscleGroups: ['BICEPS'],
					suggestedSets: 3,
					suggestedReps: { min: 10, max: 15 },
					restTime: 60,
					priority: 'ISOLATION',
					isAccessory: true
				});
			}
		} else if (workoutType === 'LEGS') {
			// Add calf raises (80% chance)
			if (Math.random() < 0.8) {
				accessories.push({
					exerciseName: 'calf raises',
					muscleGroups: ['CALVES'],
					suggestedSets: 4,
					suggestedReps: { min: 15, max: 25 },
					restTime: 60,
					priority: 'ISOLATION',
					isAccessory: true
				});
			}
		}

		return accessories;
	}

	/**
	 * Convert API workout data to detailed WorkoutSession format for strength analysis
	 */
	private convertToDetailedWorkouts(apiWorkouts: any[]): WorkoutSession[] {
		return apiWorkouts.map(workout => ({
			id: workout.id,
			userId: 'current-user',
			hevyWorkoutId: workout.id,
			date: new Date(workout.date),
			type: 'MIXED' as WorkoutType,
			name: `Workout ${workout.date}`,
			exercises: workout.exercises.map((exercise: any) => ({
				id: exercise.id || crypto.randomUUID(),
				hevyExerciseId: exercise.id,
				name: exercise.name,
				muscleGroups: exercise.muscleGroups,
				sets: (exercise.detailedSets || []).map((set: any) => ({
					reps: set.reps,
					weight: set.weight,
					rpe: set.rpe,
					isWarmup: set.isWarmup,
					restTime: 120
				})),
				notes: exercise.notes
			})),
			duration: workout.totalDuration,
			isCompleted: true,
			createdAt: new Date(),
			updatedAt: new Date()
		}));
	}

	/**
	 * Create a complete workout suggestion with strength analysis and progressive sets
	 */
	generateWorkoutSuggestion(workouts: WorkoutSession[] | any[], weeklyAnalysis: WeeklyAnalysis): WorkoutSuggestion {
		// Convert API data to detailed format if needed
		const detailedWorkouts = Array.isArray(workouts) && workouts.length > 0 && !workouts[0].exercises?.[0]?.sets?.[0]?.weight
			? this.convertToDetailedWorkouts(workouts)
			: workouts as WorkoutSession[];

		// Analyze strength data from workout history
		const strengthMap = this.strengthAnalysis.analyzeAllExercises(detailedWorkouts);

		// Determine next workout type using advanced PPL logic
		const workoutType = this.determineNextPPLWorkout(detailedWorkouts) as WorkoutType;

		// Generate exercises using advanced selection
		const generatedExercises = this.generateAdvancedWorkout(workoutType, weeklyAnalysis);

		// Convert GeneratedExercise[] to ExerciseSuggestion[] with progressive sets
		const exercises: ExerciseSuggestion[] = generatedExercises.map(exercise => {
			// Get or estimate strength data for this exercise
			const exerciseId = getHevyExerciseId(exercise.exerciseName) || crypto.randomUUID();
			const strengthData = strengthMap.get(exerciseId) ||
				this.strengthAnalysis.getExerciseStrengthData(exerciseId, exercise.exerciseName, strengthMap);

			// Generate progressive sets
			const progressiveSets = this.strengthAnalysis.generateProgressiveSets(
				strengthData,
				exercise.suggestedSets,
				exercise.suggestedReps.max, // Start with higher reps
				exercise.suggestedReps.min  // End with lower reps
			);

			return {
				exerciseName: exercise.exerciseName,
				referenceCategory: exercise.category || 'UNKNOWN',
				muscleGroups: exercise.muscleGroups as MuscleGroup[],
				suggestedSets: exercise.suggestedSets,
				suggestedReps: exercise.suggestedReps,
				priority: exercise.priority as 'HIGH' | 'MEDIUM' | 'LOW',
				reason: exercise.isAccessory
					? `Accessory work for ${exercise.muscleGroups.join(', ')}`
					: `Core ${workoutType} movement targeting ${exercise.muscleGroups.join(', ')}`,
				alternatives: getDumbbellAlternatives(exercise.exerciseName),
				// NEW: Progressive sets with calculated weights
				progressiveSets,
				strengthData,
				estimatedDuration: Math.ceil(progressiveSets.reduce((sum, set) => sum + set.restSeconds, 0) / 60 + 2), // minutes
				equipment: getEquipmentForExercise(exercise.exerciseName),
				notes: strengthData.confidenceScore < 0.3
					? 'Conservative weights - limited data available'
					: exercise.isAccessory ? 'Accessory exercise' : undefined
			};
		});

		// Set date for tomorrow
		const tomorrow = new Date();
		tomorrow.setDate(tomorrow.getDate() + 1);

		return {
			id: `hevier-${Date.now()}`,
			userId: 'current-user', // TODO: Get actual user ID
			targetDate: tomorrow,
			workoutType: workoutType,
			estimatedDuration: this.calculateEstimatedDuration(generatedExercises),
			exercises: exercises,
			focusMuscleGroups: this.getFocusMuscleGroups(workoutType),
			difficultyLevel: 'MODERATE',
			notes: `AI-generated ${workoutType} workout with advanced PPL analysis`,
			createdAt: new Date()
		};
	}

	/**
	 * Calculate estimated workout duration
	 */
	private calculateEstimatedDuration(exercises: GeneratedExercise[]): number {
		let totalDuration = 0;

		exercises.forEach(exercise => {
			// Estimate time per set (including rest)
			const timePerSet = exercise.restTime + 60; // 60 seconds per set + rest
			totalDuration += exercise.suggestedSets * timePerSet;
		});

		// Add warm-up and cool-down time
		totalDuration += 10 * 60; // 10 minutes

		return Math.round(totalDuration / 60); // Convert to minutes
	}

	/**
	 * Get focus muscle groups for the workout type
	 */
	private getFocusMuscleGroups(workoutType: string): MuscleGroup[] {
		const focusMuscleGroups = {
			'PUSH': ['CHEST', 'SHOULDERS', 'TRICEPS'] as MuscleGroup[],
			'PULL': ['BACK', 'BICEPS'] as MuscleGroup[],
			'LEGS': ['QUADS', 'HAMSTRINGS', 'GLUTES', 'CALVES'] as MuscleGroup[]
		};

		return focusMuscleGroups[workoutType as keyof typeof focusMuscleGroups] || ['CHEST'] as MuscleGroup[];
	}
}
