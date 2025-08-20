// Workout suggestion engine based on push/pull/legs splits and volume analysis
import {
	WorkoutSuggestion,
	ExerciseSuggestion,
	WorkoutType,
	MuscleGroup,
	WeeklyAnalysis,
	MuscleGroupVolume,
	GoalType,
	SplitType,
	WorkoutSession
} from '@/app/types';
import { ReferenceChartService } from './reference-chart';
import { WorkoutAnalyzerService } from './workout-analyzer';

class WorkoutSuggestionService {
	private referenceChart: ReferenceChartService;
	private analyzer: WorkoutAnalyzerService;

	constructor() {
		this.referenceChart = new ReferenceChartService();
		this.analyzer = new WorkoutAnalyzerService();
	}

	/**
	 * Generate workout suggestion for today based on recent training and split preference
	 */
	generateTodaysSuggestion(
		recentWorkouts: WorkoutSession[],
		preferences: {
			splitPreference: SplitType;
			primaryGoal: GoalType;
			workoutDaysPerWeek: number;
		}
	): WorkoutSuggestion {
		// Analyze current training state
		const weeklyAnalysis = this.analyzer.analyzeWeeklyVolume(recentWorkouts);
		const recoveryStatus = this.analyzer.predictRecoveryStatus(recentWorkouts);

		// Determine optimal workout type for today
		const workoutType = this.determineOptimalWorkoutType(
			recentWorkouts,
			preferences.splitPreference,
			recoveryStatus
		);

		// Get muscle groups that need attention
		const priorityMuscleGroups = this.getPriorityMuscleGroups(
			weeklyAnalysis.muscleGroupVolumes,
			workoutType
		);

		// Generate exercise suggestions
		const exerciseSuggestions = this.generateExerciseSuggestions(
			priorityMuscleGroups,
			preferences.primaryGoal,
			weeklyAnalysis.muscleGroupVolumes
		);

		// Estimate workout duration
		const estimatedDuration = this.estimateWorkoutDuration(exerciseSuggestions);

		return {
			id: crypto.randomUUID(),
			userId: 'user', // Single user app
			targetDate: new Date(),
			workoutType,
			estimatedDuration,
			exercises: exerciseSuggestions,
			focusMuscleGroups: priorityMuscleGroups,
			difficultyLevel: this.calculateDifficultyLevel(exerciseSuggestions, weeklyAnalysis.overallScore),
			notes: this.generateWorkoutNotes(workoutType, priorityMuscleGroups, weeklyAnalysis),
			createdAt: new Date(),
		};
	}

	/**
	 * Determine the optimal workout type for today based on recent training
	 */
	private determineOptimalWorkoutType(
		recentWorkouts: WorkoutSession[],
		splitPreference: SplitType,
		recoveryStatus: Array<{
			muscleGroup: MuscleGroup;
			recoveryStatus: 'FRESH' | 'RECOVERED' | 'FATIGUED' | 'OVERREACHED';
			daysSinceLastWorked: number;
			recommendedAction: 'TRAIN' | 'LIGHT_WORK' | 'REST';
		}>
	): WorkoutType {
		// Get last 3 workouts to determine pattern
		const lastThreeWorkouts = recentWorkouts
			.sort((a, b) => b.date.getTime() - a.date.getTime())
			.slice(0, 3);

		if (splitPreference === 'PPL') {
			return this.determinePPLWorkout(lastThreeWorkouts, recoveryStatus);
		} else if (splitPreference === 'UPPER_LOWER') {
			return this.determineUpperLowerWorkout(lastThreeWorkouts, recoveryStatus);
		} else {
			return 'FULL_BODY';
		}
	}

	/**
	 * Determine next workout in Push/Pull/Legs rotation
	 */
	private determinePPLWorkout(
		lastWorkouts: WorkoutSession[],
		recoveryStatus: Array<{
			muscleGroup: MuscleGroup;
			recommendedAction: 'TRAIN' | 'LIGHT_WORK' | 'REST';
		}>
	): WorkoutType {
		if (lastWorkouts.length === 0) {
			return 'PUSH'; // Default start with push
		}

		const lastWorkout = lastWorkouts[0];
		const daysSinceLastWorkout = (Date.now() - lastWorkout.date.getTime()) / (1000 * 60 * 60 * 24);

		// If it's been more than 2 days, prioritize muscle groups that need work
		if (daysSinceLastWorkout > 2) {
			const pushMuscles = ['CHEST', 'SHOULDERS', 'TRICEPS'] as MuscleGroup[];
			const pullMuscles = ['BACK', 'BICEPS'] as MuscleGroup[];
			const legMuscles = ['QUADS', 'HAMSTRINGS', 'GLUTES', 'CALVES'] as MuscleGroup[];

			const pushScore = this.calculateMuscleGroupScore(pushMuscles, recoveryStatus);
			const pullScore = this.calculateMuscleGroupScore(pullMuscles, recoveryStatus);
			const legScore = this.calculateMuscleGroupScore(legMuscles, recoveryStatus);

			if (legScore >= pushScore && legScore >= pullScore) return 'LEGS';
			if (pullScore >= pushScore) return 'PULL';
			return 'PUSH';
		}

		// Follow rotation based on last workout
		switch (lastWorkout.type) {
			case 'PUSH': return 'PULL';
			case 'PULL': return 'LEGS';
			case 'LEGS': return 'PUSH';
			default: return 'PUSH';
		}
	}

	/**
	 * Determine next workout in Upper/Lower rotation
	 */
	private determineUpperLowerWorkout(
		lastWorkouts: WorkoutSession[],
		recoveryStatus: Array<{
			muscleGroup: MuscleGroup;
			recommendedAction: 'TRAIN' | 'LIGHT_WORK' | 'REST';
		}>
	): WorkoutType {
		if (lastWorkouts.length === 0) {
			return 'UPPER'; // Default start with upper
		}

		const lastWorkout = lastWorkouts[0];
		const daysSinceLastWorkout = (Date.now() - lastWorkout.date.getTime()) / (1000 * 60 * 60 * 24);

		// If it's been more than 1 day, check which needs more work
		if (daysSinceLastWorkout > 1) {
			const upperMuscles = ['CHEST', 'BACK', 'SHOULDERS', 'BICEPS', 'TRICEPS'] as MuscleGroup[];
			const lowerMuscles = ['QUADS', 'HAMSTRINGS', 'GLUTES', 'CALVES'] as MuscleGroup[];

			const upperScore = this.calculateMuscleGroupScore(upperMuscles, recoveryStatus);
			const lowerScore = this.calculateMuscleGroupScore(lowerMuscles, recoveryStatus);

			return lowerScore > upperScore ? 'LOWER' : 'UPPER';
		}

		// Alternate based on last workout
		return lastWorkout.type === 'UPPER' || lastWorkout.type === 'PUSH' || lastWorkout.type === 'PULL'
			? 'LOWER'
			: 'UPPER';
	}

	/**
	 * Calculate priority score for a group of muscle groups
	 */
	private calculateMuscleGroupScore(
		muscleGroups: MuscleGroup[],
		recoveryStatus: Array<{
			muscleGroup: MuscleGroup;
			recommendedAction: 'TRAIN' | 'LIGHT_WORK' | 'REST';
		}>
	): number {
		return muscleGroups.reduce((score, muscle) => {
			const status = recoveryStatus.find(s => s.muscleGroup === muscle);
			if (!status) return score;

			switch (status.recommendedAction) {
				case 'TRAIN': return score + 100;
				case 'LIGHT_WORK': return score + 50;
				case 'REST': return score + 0;
				default: return score;
			}
		}, 0) / muscleGroups.length;
	}

	/**
	 * Get priority muscle groups for a given workout type
	 */
	private getPriorityMuscleGroups(
		muscleGroupVolumes: MuscleGroupVolume[],
		workoutType: WorkoutType
	): MuscleGroup[] {
		let relevantMuscles: MuscleGroup[];

		switch (workoutType) {
			case 'PUSH':
				relevantMuscles = ['CHEST', 'SHOULDERS', 'TRICEPS'];
				break;
			case 'PULL':
				relevantMuscles = ['BACK', 'BICEPS', 'FOREARMS'];
				break;
			case 'LEGS':
				relevantMuscles = ['QUADS', 'HAMSTRINGS', 'GLUTES', 'CALVES'];
				break;
			case 'UPPER':
				relevantMuscles = ['CHEST', 'BACK', 'SHOULDERS', 'BICEPS', 'TRICEPS'];
				break;
			case 'LOWER':
				relevantMuscles = ['QUADS', 'HAMSTRINGS', 'GLUTES', 'CALVES'];
				break;
			case 'FULL_BODY':
				relevantMuscles = ['CHEST', 'BACK', 'SHOULDERS', 'QUADS', 'HAMSTRINGS'];
				break;
			default:
				relevantMuscles = ['CHEST', 'BACK', 'SHOULDERS'];
		}

		// Sort by priority score (highest deficit/priority first)
		const priorityMuscles = muscleGroupVolumes
			.filter(volume => relevantMuscles.includes(volume.muscleGroup))
			.sort((a, b) => b.priorityScore - a.priorityScore)
			.map(volume => volume.muscleGroup);

		return priorityMuscles.slice(0, 4); // Top 4 priority muscles
	}

	/**
	 * Generate exercise suggestions for the workout
	 */
	private generateExerciseSuggestions(
		priorityMuscleGroups: MuscleGroup[],
		primaryGoal: GoalType,
		muscleGroupVolumes: MuscleGroupVolume[]
	): ExerciseSuggestion[] {
		const suggestions: ExerciseSuggestion[] = [];

		// Start with compound movements for primary muscle groups
		const primaryMuscles = priorityMuscleGroups.slice(0, 2);

		primaryMuscles.forEach(muscleGroup => {
			const volume = muscleGroupVolumes.find(v => v.muscleGroup === muscleGroup);
			if (!volume) return;

			// Get strength exercises first (compound movements)
			const strengthExercises = this.referenceChart.getExercisesForMuscleGroup(muscleGroup, 'STRENGTH');

			if (strengthExercises.length > 0) {
				const exercise = strengthExercises[0]; // Take first compound exercise
				suggestions.push({
					exerciseName: exercise.example_exercises[0], // Use first example
					referenceCategory: exercise.name,
					muscleGroups: [muscleGroup],
					suggestedSets: Math.min(Math.max(2, Math.ceil(volume.deficit / 2)), 4),
					suggestedReps: {
						min: exercise.rep_range.min || 5,
						max: exercise.rep_range.max || 15,
					},
					priority: volume.deficit > volume.targetMin * 0.3 ? 'HIGH' : 'MEDIUM',
					reason: volume.deficit > 0
						? `${muscleGroup} deficit of ${volume.deficit} sets`
						: `Maintain ${muscleGroup} volume`,
					alternatives: exercise.example_exercises.slice(1, 3),
				});
			}
		});

		// Add isolation/accessory work for all priority muscle groups
		priorityMuscleGroups.forEach(muscleGroup => {
			const volume = muscleGroupVolumes.find(v => v.muscleGroup === muscleGroup);
			if (!volume) return;

			// Skip if we already have an exercise for this muscle group
			if (suggestions.some(s => s.muscleGroups.includes(muscleGroup))) return;

			const preferredTag = primaryGoal === 'STRENGTH' ? 'STRENGTH' : 'HYPERTROPHY';
			const exercises = this.referenceChart.getExercisesForMuscleGroup(muscleGroup, preferredTag);

			if (exercises.length > 0) {
				const exercise = exercises[0];
				suggestions.push({
					exerciseName: exercise.example_exercises[0],
					referenceCategory: exercise.name,
					muscleGroups: [muscleGroup],
					suggestedSets: Math.min(Math.max(1, Math.ceil(volume.deficit / 2)), 3),
					suggestedReps: {
						min: exercise.rep_range.min || 12,
						max: exercise.rep_range.max || 30,
					},
					priority: volume.deficit > 0 ? 'MEDIUM' : 'LOW',
					reason: volume.deficit > 0
						? `${muscleGroup} needs ${volume.deficit} more sets`
						: `Accessory work for ${muscleGroup}`,
					alternatives: exercise.example_exercises.slice(1, 3),
				});
			}
		});

		// Sort by priority
		return suggestions.sort((a, b) => {
			const priorityOrder = { 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 };
			return priorityOrder[b.priority] - priorityOrder[a.priority];
		}).slice(0, 6); // Limit to 6 exercises max
	}

	/**
	 * Estimate workout duration based on exercises
	 */
	private estimateWorkoutDuration(exercises: ExerciseSuggestion[]): number {
		// Base time per exercise: setup + execution + rest
		const baseTimePerExercise = 8; // minutes
		const totalExercises = exercises.length;
		const totalSets = exercises.reduce((sum, ex) => sum + ex.suggestedSets, 0);

		// Warm-up and cool-down
		const warmupCooldown = 10; // minutes

		// Rest time between sets (estimate 2-3 minutes per set)
		const restTime = totalSets * 2.5; // minutes

		return Math.round(warmupCooldown + (totalExercises * baseTimePerExercise) + restTime);
	}

	/**
	 * Calculate difficulty level based on volume and current state
	 */
	private calculateDifficultyLevel(
		exercises: ExerciseSuggestion[],
		overallScore: number
	): 'LIGHT' | 'MODERATE' | 'INTENSE' {
		const totalSets = exercises.reduce((sum, ex) => sum + ex.suggestedSets, 0);
		const highPriorityCount = exercises.filter(ex => ex.priority === 'HIGH').length;

		// If overall score is low (lots of deficits), workout will be more intense
		if (overallScore < 50 && totalSets > 15) return 'INTENSE';
		if (overallScore < 70 && totalSets > 12) return 'MODERATE';
		if (totalSets <= 8) return 'LIGHT';
		if (totalSets <= 12) return 'MODERATE';

		return 'INTENSE';
	}

	/**
	 * Generate contextual notes for the workout
	 */
	private generateWorkoutNotes(
		workoutType: WorkoutType,
		focusMuscleGroups: MuscleGroup[],
		analysis: WeeklyAnalysis
	): string {
		const notes: string[] = [];

		// Workout type context
		const typeNotes = {
			'PUSH': 'Focus on chest, shoulders, and triceps. Start with compound pressing movements.',
			'PULL': 'Emphasize back and biceps. Begin with heavy pulling exercises.',
			'LEGS': 'Target lower body comprehensively. Start with squats or similar compound movement.',
			'UPPER': 'Full upper body session. Balance pushing and pulling movements.',
			'LOWER': 'Complete lower body training. Include both quad and hamstring-dominant exercises.',
			'FULL_BODY': 'Hit all major muscle groups. Keep intensity moderate to allow recovery.',
		};

		notes.push(typeNotes[workoutType]);

		// Deficit-specific guidance
		const majorDeficits = focusMuscleGroups.slice(0, 2);
		if (majorDeficits.length > 0) {
			notes.push(`Priority focus: ${majorDeficits.join(' and ')} need extra attention.`);
		}

		// Recovery guidance
		if (analysis.overallScore < 60) {
			notes.push('You have several muscle groups behind target volume. Consider adding intensity.');
		} else if (analysis.overallScore > 90) {
			notes.push('Great job meeting targets! Focus on quality over quantity today.');
		}

		return notes.join(' ');
	}

	/**
	 * Generate multiple workout options for the user to choose from
	 */
	generateWorkoutOptions(
		recentWorkouts: WorkoutSession[],
		preferences: {
			splitPreference: SplitType;
			primaryGoal: GoalType;
			workoutDaysPerWeek: number;
		}
	): WorkoutSuggestion[] {
		const weeklyAnalysis = this.analyzer.analyzeWeeklyVolume(recentWorkouts);
		const recoveryStatus = this.analyzer.predictRecoveryStatus(recentWorkouts);

		const options: WorkoutSuggestion[] = [];

		// Option 1: Optimal suggestion (primary recommendation)  
		const primarySuggestion = this.generateTodaysSuggestion(recentWorkouts, preferences);
		this.addIntelligentAccessories(primarySuggestion, weeklyAnalysis);
		options.push(primarySuggestion);

		// Option 2: Alternative workout type
		const alternativeType = this.getAlternativeWorkoutType(options[0].workoutType, preferences.splitPreference);
		if (alternativeType) {
			const alternativeMuscles = this.getPriorityMuscleGroups(weeklyAnalysis.muscleGroupVolumes, alternativeType);
			const alternativeExercises = this.generateExerciseSuggestions(
				alternativeMuscles,
				preferences.primaryGoal,
				weeklyAnalysis.muscleGroupVolumes
			);

			options.push({
				id: crypto.randomUUID(),
				userId: 'user',
				targetDate: new Date(),
				workoutType: alternativeType,
				estimatedDuration: this.estimateWorkoutDuration(alternativeExercises),
				exercises: alternativeExercises,
				focusMuscleGroups: alternativeMuscles,
				difficultyLevel: this.calculateDifficultyLevel(alternativeExercises, weeklyAnalysis.overallScore),
				notes: `Alternative ${alternativeType} workout option.`,
				createdAt: new Date(),
			});
		}

		// Option 3: Light/Recovery workout
		const lightExercises = this.generateLightWorkoutExercises(weeklyAnalysis.muscleGroupVolumes);
		options.push({
			id: crypto.randomUUID(),
			userId: 'user',
			targetDate: new Date(),
			workoutType: 'FULL_BODY',
			estimatedDuration: 30,
			exercises: lightExercises,
			focusMuscleGroups: lightExercises.flatMap(ex => ex.muscleGroups).slice(0, 3),
			difficultyLevel: 'LIGHT',
			notes: 'Light recovery workout focusing on mobility and activation.',
			createdAt: new Date(),
		});

		return options;
	}

	/**
	 * Get alternative workout type for variety
	 */
	private getAlternativeWorkoutType(primaryType: WorkoutType, splitPreference: SplitType): WorkoutType | null {
		if (splitPreference === 'PPL') {
			switch (primaryType) {
				case 'PUSH': return 'LEGS';
				case 'PULL': return 'PUSH';
				case 'LEGS': return 'PULL';
				default: return null;
			}
		} else if (splitPreference === 'UPPER_LOWER') {
			return primaryType === 'UPPER' ? 'LOWER' : 'UPPER';
		}

		return null;
	}

	/**
	 * Generate light workout exercises for recovery days
	 */
	private generateLightWorkoutExercises(muscleGroupVolumes: MuscleGroupVolume[]): ExerciseSuggestion[] {
		// Focus on muscle groups that haven't been worked recently
		const staleMuscles = muscleGroupVolumes
			.filter(volume => !volume.lastWorkedDate ||
				(Date.now() - volume.lastWorkedDate.getTime()) / (1000 * 60 * 60 * 24) > 3
			)
			.slice(0, 4);

		return staleMuscles.map(volume => ({
			exerciseName: `Light ${volume.muscleGroup.toLowerCase()} activation`,
			referenceCategory: 'ACTIVATION',
			muscleGroups: [volume.muscleGroup],
			suggestedSets: 2,
			suggestedReps: { min: 15, max: 25 },
			priority: 'LOW' as const,
			reason: 'Activation and recovery work',
			alternatives: ['Bodyweight movement', 'Light resistance'],
		}));
	}

	/**
	 * Intelligently add cardio (beginning), abs/forearms/neck (end) based on volume deficits
	 */
	private addIntelligentAccessories(
		workout: WorkoutSuggestion,
		weeklyAnalysis: WeeklyAnalysis
	): void {
		const addedAccessories: string[] = [];

		// 1. Add CARDIO warmup at beginning if deficit
		const cardioVolume = weeklyAnalysis.muscleGroupVolumes.find(v => v.muscleGroup === 'CARDIO');
		const cardioDeficit = cardioVolume ? Math.max(0, cardioVolume.targetMin - cardioVolume.actualSets) : 3; // Default need 3 sessions

		if (cardioDeficit > 0) {
			// Add light cardio warmup at the beginning
			const cardioExercise: ExerciseSuggestion = {
				id: crypto.randomUUID(),
				exerciseName: 'light treadmill walk',
				muscleGroups: ['CARDIO'],
				suggestedSets: 1,
				suggestedReps: { min: 5, max: 10 }, // 5-10 minutes
				estimatedRestTime: 0,
				reason: `Cardio deficit: Need ${Math.round(cardioDeficit)} more sessions this week`,
				priority: 'LOW',
				alternatives: ['stationary bike', 'elliptical', 'light walk']
			};

			// Insert at beginning
			workout.exercises.unshift(cardioExercise);
			addedAccessories.push('warmup cardio');
		}

		// 2. Add ABS at end if deficit
		const absVolume = weeklyAnalysis.muscleGroupVolumes.find(v => v.muscleGroup === 'ABS');
		const absDeficit = absVolume ? Math.max(0, absVolume.targetMin - absVolume.actualSets) : 6; // Default need 6 sets

		if (absDeficit >= 2) { // Only add if significant deficit
			const absExercises = this.referenceChart.getExercisesForMuscleGroup('ABS');
			const selectedAbs = absExercises[Math.floor(Math.random() * absExercises.length)];

			const absExercise: ExerciseSuggestion = {
				id: crypto.randomUUID(),
				exerciseName: selectedAbs.example_exercises[0],
				muscleGroups: ['ABS'],
				suggestedSets: Math.min(3, Math.ceil(absDeficit / 2)),
				suggestedReps: selectedAbs.rep_range.min ?
					{ min: selectedAbs.rep_range.min, max: selectedAbs.rep_range.max || 15 } :
					{ min: 12, max: 20 },
				estimatedRestTime: 60,
				reason: `Ab deficit: Need ${Math.round(absDeficit)} more sets this week`,
				priority: 'LOW',
				alternatives: selectedAbs.example_exercises.slice(1)
			};

			workout.exercises.push(absExercise);
			addedAccessories.push('abs');
		}

		// 3. Add FOREARMS at end if deficit
		const forearmsVolume = weeklyAnalysis.muscleGroupVolumes.find(v => v.muscleGroup === 'FOREARMS');
		const forearmsDeficit = forearmsVolume ? Math.max(0, forearmsVolume.targetMin - forearmsVolume.actualSets) : 6; // Default need 6 sets

		if (forearmsDeficit >= 2) {
			const forearmExercises = this.referenceChart.getExercisesForMuscleGroup('FOREARMS');
			const selectedForearm = forearmExercises.find(ex => ex.tag === 'HYPERTROPHY') || forearmExercises[0];

			const forearmExercise: ExerciseSuggestion = {
				id: crypto.randomUUID(),
				exerciseName: selectedForearm.example_exercises[0],
				muscleGroups: ['FOREARMS'],
				suggestedSets: Math.min(3, Math.ceil(forearmsDeficit / 2)),
				suggestedReps: selectedForearm.rep_range.min ?
					{ min: selectedForearm.rep_range.min, max: selectedForearm.rep_range.max || 20 } :
					{ min: 15, max: 25 },
				estimatedRestTime: 45,
				reason: `Forearm deficit: Need ${Math.round(forearmsDeficit)} more sets this week`,
				priority: 'LOW',
				alternatives: selectedForearm.example_exercises.slice(1)
			};

			workout.exercises.push(forearmExercise);
			addedAccessories.push('forearms');
		}

		// 4. Add NECK at end if deficit  
		const neckVolume = weeklyAnalysis.muscleGroupVolumes.find(v => v.muscleGroup === 'NECK');
		const neckDeficit = neckVolume ? Math.max(0, neckVolume.targetMin - neckVolume.actualSets) : 18; // Default need 18 sets

		if (neckDeficit >= 3) {
			const neckExercises = this.referenceChart.getExercisesForMuscleGroup('NECK');
			const selectedNeck = neckExercises[Math.floor(Math.random() * neckExercises.length)];

			const neckExercise: ExerciseSuggestion = {
				id: crypto.randomUUID(),
				exerciseName: selectedNeck.example_exercises[0],
				muscleGroups: ['NECK'],
				suggestedSets: Math.min(3, Math.ceil(neckDeficit / 6)), // Neck needs more sets per week
				suggestedReps: selectedNeck.rep_range.min ?
					{ min: selectedNeck.rep_range.min, max: selectedNeck.rep_range.max || 20 } :
					{ min: 12, max: 20 },
				estimatedRestTime: 45,
				reason: `Neck deficit: Need ${Math.round(neckDeficit)} more sets this week`,
				priority: 'LOW',
				alternatives: selectedNeck.example_exercises.slice(1)
			};

			workout.exercises.push(neckExercise);
			addedAccessories.push('neck');
		}

		// Update workout notes with added accessories
		if (addedAccessories.length > 0) {
			const accessoryNote = `Added: ${addedAccessories.join(', ')} based on volume deficits`;
			workout.notes = workout.notes ? `${workout.notes}. ${accessoryNote}` : accessoryNote;

			// Update estimated duration
			const accessoryTime = addedAccessories.length * 8; // ~8 minutes per accessory
			workout.estimatedDuration += accessoryTime;
		}
	}
}

export { WorkoutSuggestionService };
