// Reference chart utilities for workout requirements and exercise mapping
import { ReferenceChart, MuscleGroup, ExerciseTag, ReferenceMuscleGroup } from '@/app/types';
import referenceData from '../../../reference_cheatsheet.json';

class ReferenceChartService {
	private chart: ReferenceChart;

	constructor() {
		this.chart = referenceData as ReferenceChart;
	}

	/**
	 * Get weekly set targets for a muscle group
	 */
	getWeeklyTargets(muscleGroup: MuscleGroup): { min: number; max?: number } {
		const muscleGroupData = this.chart.CHART[muscleGroup];
		return {
			min: muscleGroupData.sets_per_week.min,
			max: muscleGroupData.sets_per_week.max,
		};
	}

	/**
	 * Get all exercises for a muscle group
	 */
	getExercisesForMuscleGroup(muscleGroup: MuscleGroup, tag?: ExerciseTag) {
		const muscleGroupData = this.chart.CHART[muscleGroup];

		if (tag) {
			return muscleGroupData.exercises.filter(ex => ex.tag === tag);
		}

		return muscleGroupData.exercises;
	}

	/**
	 * Get exercise examples for a specific exercise category
	 */
	getExerciseExamples(muscleGroup: MuscleGroup, exerciseName: string): string[] {
		const exercises = this.getExercisesForMuscleGroup(muscleGroup);
		const exercise = exercises.find(ex => ex.name === exerciseName);
		return exercise?.example_exercises || [];
	}

	/**
	 * Find which muscle groups an exercise belongs to based on name matching
	 */
	findMuscleGroupsForExercise(exerciseName: string): MuscleGroup[] {
		const matchedGroups: MuscleGroup[] = [];
		const lowerName = exerciseName.toLowerCase();

		for (const [muscleGroupKey, muscleGroupData] of Object.entries(this.chart.CHART)) {
			const muscleGroup = muscleGroupKey as MuscleGroup;

			// Check if exercise name matches any example exercises
			for (const exercise of muscleGroupData.exercises) {
				for (const example of exercise.example_exercises) {
					if (this.isExerciseMatch(lowerName, example.toLowerCase())) {
						matchedGroups.push(muscleGroup);
						break;
					}
				}
				if (matchedGroups.includes(muscleGroup)) break;
			}
		}

		return matchedGroups;
	}

	/**
	 * Get recommended rep range for an exercise based on muscle group and tag
	 */
	getRepRange(muscleGroup: MuscleGroup, exerciseName: string): { min: number; max: number } {
		const exercises = this.getExercisesForMuscleGroup(muscleGroup);
		const exercise = exercises.find(ex =>
			ex.example_exercises.some(example =>
				this.isExerciseMatch(exerciseName.toLowerCase(), example.toLowerCase())
			)
		);

		if (exercise && exercise.rep_range.min !== undefined && exercise.rep_range.max !== undefined) {
			return {
				min: exercise.rep_range.min,
				max: exercise.rep_range.max,
			};
		}

		// Default to hypertrophy range
		return { min: 12, max: 30 };
	}

	/**
	 * Get exercise tag (STRENGTH, HYPERTROPHY, OPTIONAL) for an exercise
	 */
	getExerciseTag(muscleGroup: MuscleGroup, exerciseName: string): ExerciseTag {
		const exercises = this.getExercisesForMuscleGroup(muscleGroup);
		const exercise = exercises.find(ex =>
			ex.example_exercises.some(example =>
				this.isExerciseMatch(exerciseName.toLowerCase(), example.toLowerCase())
			)
		);

		return exercise?.tag || 'HYPERTROPHY';
	}

	/**
	 * Get all muscle groups with their weekly targets
	 */
	getAllMuscleGroupTargets(): Array<{
		muscleGroup: MuscleGroup;
		minSets: number;
		maxSets?: number;
		note?: string;
	}> {
		return Object.entries(this.chart.CHART).map(([key, data]) => ({
			muscleGroup: key as MuscleGroup,
			minSets: data.sets_per_week.min,
			maxSets: data.sets_per_week.max,
			note: data.sets_per_week.note,
		}));
	}

	/**
	 * Get exercises by tag across all muscle groups
	 */
	getExercisesByTag(tag: ExerciseTag): Array<{
		muscleGroup: MuscleGroup;
		exerciseName: string;
		examples: string[];
		repRange: { min?: number; max?: number; optional?: boolean };
	}> {
		const results: Array<{
			muscleGroup: MuscleGroup;
			exerciseName: string;
			examples: string[];
			repRange: { min?: number; max?: number; optional?: boolean };
		}> = [];

		for (const [muscleGroupKey, muscleGroupData] of Object.entries(this.chart.CHART)) {
			const muscleGroup = muscleGroupKey as MuscleGroup;

			for (const exercise of muscleGroupData.exercises) {
				if (exercise.tag === tag) {
					results.push({
						muscleGroup,
						exerciseName: exercise.name,
						examples: exercise.example_exercises,
						repRange: exercise.rep_range,
					});
				}
			}
		}

		return results;
	}

	/**
	 * Suggest exercises for a muscle group based on deficit and preferences
	 */
	suggestExercisesForDeficit(
		muscleGroup: MuscleGroup,
		deficit: number,
		preferredTag: ExerciseTag = 'HYPERTROPHY'
	): Array<{
		exerciseName: string;
		examples: string[];
		suggestedSets: number;
		repRange: { min: number; max: number };
		tag: ExerciseTag;
	}> {
		const exercises = this.getExercisesForMuscleGroup(muscleGroup);

		// Prioritize preferred tag exercises
		const sortedExercises = exercises.sort((a, b) => {
			if (a.tag === preferredTag && b.tag !== preferredTag) return -1;
			if (b.tag === preferredTag && a.tag !== preferredTag) return 1;
			return 0;
		});

		const suggestions = sortedExercises.map(exercise => ({
			exerciseName: exercise.name,
			examples: exercise.example_exercises,
			suggestedSets: Math.min(Math.ceil(deficit / exercises.length), 4), // Distribute deficit, max 4 sets
			repRange: {
				min: exercise.rep_range.min || 12,
				max: exercise.rep_range.max || 30,
			},
			tag: exercise.tag,
		}));

		return suggestions.slice(0, 3); // Return top 3 suggestions
	}

	/**
	 * Check if an exercise name matches a reference exercise
	 * Uses fuzzy matching for better accuracy
	 */
	private isExerciseMatch(exerciseName: string, referenceName: string): boolean {
		// Exact match
		if (exerciseName === referenceName) return true;

		// Contains match
		if (exerciseName.includes(referenceName) || referenceName.includes(exerciseName)) {
			return true;
		}

		// Keyword matching for compound exercises
		const exerciseWords = exerciseName.split(' ').filter(word => word.length > 2);
		const referenceWords = referenceName.split(' ').filter(word => word.length > 2);

		// If at least 60% of words match
		const matchingWords = exerciseWords.filter(word =>
			referenceWords.some(refWord => refWord.includes(word) || word.includes(refWord))
		);

		return (matchingWords.length / Math.max(exerciseWords.length, referenceWords.length)) >= 0.6;
	}

	/**
	 * Get detailed information about a muscle group
	 */
	getMuscleGroupInfo(muscleGroup: MuscleGroup) {
		const data = this.chart.CHART[muscleGroup];
		return {
			muscleGroup,
			weeklyTarget: data.sets_per_week,
			exercises: data.exercises,
			totalExerciseTypes: data.exercises.length,
			strengthExercises: data.exercises.filter(ex => ex.tag === 'STRENGTH').length,
			hypertrophyExercises: data.exercises.filter(ex => ex.tag === 'HYPERTROPHY').length,
			optionalExercises: data.exercises.filter(ex => ex.tag === 'OPTIONAL').length,
		};
	}

	/**
	 * Calculate priority score for a muscle group based on deficit and importance
	 */
	calculateMuscleGroupPriority(muscleGroup: MuscleGroup, deficit: number): number {
		const targets = this.getWeeklyTargets(muscleGroup);
		const relativeDeficit = deficit / targets.min;

		// Higher priority muscle groups (based on weekly volume requirements)
		const highPriorityGroups: MuscleGroup[] = ['BACK', 'SHOULDERS', 'NECK'];
		const mediumPriorityGroups: MuscleGroup[] = ['CHEST', 'QUADS', 'HAMSTRINGS', 'BICEPS'];

		let basePriority = 50; // Default priority

		if (highPriorityGroups.includes(muscleGroup)) {
			basePriority = 80;
		} else if (mediumPriorityGroups.includes(muscleGroup)) {
			basePriority = 65;
		}

		// Adjust based on deficit (0-100 scale)
		const deficitBonus = Math.min(relativeDeficit * 30, 50);

		return Math.min(basePriority + deficitBonus, 100);
	}
}

export { ReferenceChartService };
