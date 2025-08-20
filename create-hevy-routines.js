#!/usr/bin/env node
/**
 * Hevier AI Routine Creator
 * 
 * Generates workout suggestions using the Hevier AI system and creates corresponding
 * routines in the Hevy app using the official hevy-client library.
 * 
 * Usage:
 *   npx tsx create-hevy-routines.js           # Create routines in Hevy
 *   npx tsx create-hevy-routines.js --dry-run # Preview mode (no routines created)
 *   npx tsx create-hevy-routines.js --preview # Alternative preview flag
 * 
 * Environment Variables:
 *   DRY_RUN=true                              # Enable preview mode via env var
 */

import crypto from 'crypto';
import dotenv from 'dotenv';
import { HevyClient } from 'hevy-client';
import { ReferenceChartService } from './src/app/lib/reference-chart.ts';
import { WorkoutAnalyzerService } from './src/app/lib/workout-analyzer.ts';
import { WorkoutSuggestionService } from './src/app/lib/workout-suggestion.ts';
import { getHevyExerciseId, getMuscleGroupsForExercise } from './src/app/lib/exercise-mapping.ts';

// Load environment variables
dotenv.config({ path: '.env.local' });

class HevierRoutineCreator {
	constructor() {
		this.hevyApiToken = process.env.HEVY_API_TOKEN;
		if (!this.hevyApiToken) {
			throw new Error('HEVY_API_TOKEN not found in environment variables');
		}

		console.log(`🔑 Using API token: ${this.hevyApiToken.substring(0, 8)}...${this.hevyApiToken.substring(this.hevyApiToken.length - 4)}`);

		// Check for dry run mode
		this.dryRun = process.env.DRY_RUN === 'true' || process.argv.includes('--dry-run') || process.argv.includes('--preview');

		if (this.dryRun) {
			console.log('🔍 DRY RUN MODE - No routines will be created in Hevy');
		}

		// Initialize Hevy client - try different initialization methods
		try {
			// Method 1: Object with apiKey
			this.hevyClient = new HevyClient({ apiKey: this.hevyApiToken });
		} catch (error1) {
			try {
				// Method 2: Just the token string
				this.hevyClient = new HevyClient(this.hevyApiToken);
			} catch (error2) {
				// Method 3: Object with token
				this.hevyClient = new HevyClient({ token: this.hevyApiToken });
			}
		}

		// Initialize Hevier services
		this.referenceChart = new ReferenceChartService();
		this.analyzer = new WorkoutAnalyzerService(this.referenceChart);
		this.suggestionService = new WorkoutSuggestionService(this.referenceChart);

		console.log('🚀 Hevier AI Routine Creator initialized');
	}

	/**
	 * Make a custom API request to Hevy
	 */
	async makeHevyRequest(endpoint, options = {}) {
		const url = `https://api.hevyapp.com/v1${endpoint}`;
		const response = await fetch(url, {
			...options,
			headers: {
				'api-key': this.hevyApiToken,
				'Content-Type': 'application/json',
				...options.headers
			}
		});

		if (!response.ok) {
			throw new Error(`${response.status} ${response.statusText}: ${await response.text()}`);
		}

		return response.json();
	}

	/**
	 * Test connection to Hevy API
	 */
	async testConnection() {
		try {
			console.log('🔗 Testing Hevy API connection...');
			const data = await this.makeHevyRequest('/workouts?pageSize=1');
			console.log('✅ Successfully connected to Hevy API');
			console.log(`📊 Found ${data.workouts.length} workout(s) in response`);
			return true;
		} catch (error) {
			console.error('❌ Failed to connect to Hevy API:', error.message);
			return false;
		}
	}

	/**
	 * Get user's recent workout data for analysis using the unified API service
	 */
	async getUserWorkoutData() {
		try {
			console.log('📊 Fetching recent workout data from unified API service...');

			// Call our unified workout API service
			const apiUrl = 'http://localhost:3000/api/workouts';
			console.log(`🔗 Calling unified API: ${apiUrl}`);

			const response = await fetch(apiUrl, {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
				},
			});

			if (!response.ok) {
				const errorText = await response.text();
				throw new Error(`API call failed: ${response.status} ${response.statusText} - ${errorText}`);
			}

			const result = await response.json();

			if (!result.success) {
				throw new Error(`API returned error: ${result.message || result.error}`);
			}

			const { workouts, analysis, metadata } = result.data;

			console.log(`📈 Unified API results:`);
			console.log(`   • ${workouts.length} workouts from ${metadata.dateRange.start} to ${metadata.dateRange.end}`);
			console.log(`   • ${metadata.pagesProcessed} pages processed`);
			console.log(`   • Overall score: ${analysis.overallScore}%`);

			// Convert date strings to Date objects for script compatibility
			const convertedWorkouts = workouts.map(workout => ({
				...workout,
				date: new Date(workout.date)
			}));

			if (convertedWorkouts.length > 0) {
				console.log('📋 Sample workout:', JSON.stringify(convertedWorkouts[0], null, 2));
			}

			return convertedWorkouts;
		} catch (error) {
			console.error('❌ Error fetching workout data from unified API:', error.message);
			throw error;
		}
	}

	/**
	 * Convert Hevy workouts to our internal format
	 */
	convertHevyWorkouts(hevyWorkouts) {
		return hevyWorkouts.map(workout => {
			const exercises = workout.exercises.map(exercise => {
				// Get muscle groups for this exercise
				const muscleGroups = getMuscleGroupsForExercise(exercise.exercise_template_id) || [];

				return {
					id: exercise.exercise_template_id,
					name: exercise.title,
					muscleGroups: muscleGroups,
					sets: exercise.sets.length,
					totalVolume: exercise.sets.reduce((total, set) => {
						return total + (set.weight_kg || 0) * (set.reps || 0);
					}, 0)
				};
			});

			return {
				id: workout.id,
				date: new Date(workout.start_time.split('T')[0]), // Convert to Date object
				exercises: exercises,
				totalDuration: workout.end_time ?
					Math.round((new Date(workout.end_time) - new Date(workout.start_time)) / 60000) : 0
			};
		});
	}

	/**
	 * Custom workout analysis for demo/testing (uses all workout data instead of just last 7 days)
	 */
	analyzeWorkoutDataCustom(workouts) {
		console.log(`📊 Analyzing ${workouts.length} workouts with custom date range...`);

		// Calculate muscle group volumes from all workouts
		const muscleGroupTotals = {};

		// Initialize all muscle groups to 0
		const muscleGroups = ['CHEST', 'BACK', 'SHOULDERS', 'BICEPS', 'TRICEPS', 'QUADS', 'HAMSTRINGS', 'GLUTES', 'CALVES', 'ABS', 'FOREARMS', 'NECK', 'CARDIO'];
		muscleGroups.forEach(group => {
			muscleGroupTotals[group] = 0;
		});

		// Count sets per muscle group from all workouts
		workouts.forEach(workout => {
			workout.exercises.forEach(exercise => {
				exercise.muscleGroups.forEach(muscleGroup => {
					if (muscleGroupTotals[muscleGroup] !== undefined) {
						muscleGroupTotals[muscleGroup] += exercise.sets;
					}
				});
			});
		});

		// Get targets from reference chart and build volume analysis
		const muscleGroupVolumes = muscleGroups.map(muscleGroup => {
			const target = this.referenceChart.getWeeklyTargets(muscleGroup);
			const actualSets = muscleGroupTotals[muscleGroup] || 0;

			return {
				muscleGroup,
				actualSets,
				targetMin: target.min,
				targetMax: target.max || target.min,
				deficit: Math.max(0, target.min - actualSets),
				surplus: Math.max(0, actualSets - (target.max || target.min))
			};
		});

		return {
			id: crypto.randomUUID(),
			userId: 'user',
			weekStart: new Date(Math.min(...workouts.map(w => w.date.getTime()))),
			weekEnd: new Date(Math.max(...workouts.map(w => w.date.getTime()))),
			totalWorkouts: workouts.length,
			muscleGroupVolumes,
			overallScore: 70, // Mock score for demo
			recommendations: ['Focus on chest and legs', 'Add more cardio']
		};
	}

	/**
	 * Determine the next workout in Push/Pull/Legs rotation based on recent workouts
	 * Uses majority muscle groups and reference cheatsheet categories
	 */
	determineNextPPLWorkout(workouts) {
		// Get the most recent workouts sorted by date
		const recentWorkouts = workouts
			.sort((a, b) => b.date.getTime() - a.date.getTime())
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
				const sets = exercise.sets || 1;
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

			const daysSince = Math.floor((new Date() - workout.date) / (1000 * 60 * 60 * 24));

			console.log(`📊 Workout ${workout.date.toISOString().split('T')[0]}: ${workoutType} (${daysSince} days ago)`);
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

		// Return the workout type that's been longest since last done
		if (lastPushDays >= lastPullDays && lastPushDays >= lastLegsDays) {
			return 'PUSH';
		} else if (lastPullDays >= lastLegsDays) {
			return 'PULL';
		} else {
			return 'LEGS';
		}
	}

	/**
	 * Generate a specific workout for the given type with intelligent accessories
	 */
	generateSpecificWorkout(workoutType, weeklyAnalysis) {
		const exercises = [];
		let estimatedDuration = 0;

		// Define core exercises for each workout type based on reference cheatsheet
		const coreExercises = {
			'PUSH': [
				// CHEST - Horizontal Press (Strength)
				{
					category: 'HORIZONTAL PRESS',
					options: ['bench press', 'push up', 'dumbbell press'],
					sets: 4, reps: { min: 5, max: 15 }, rest: 180,
					muscleGroups: ['CHEST', 'TRICEPS', 'SHOULDERS'], priority: 'HIGH'
				},
				// CHEST - Incline Press (Strength) 
				{
					category: 'INCLINE PRESS',
					options: ['incline bench press', 'decline pushup', 'incline dumbbell press'],
					sets: 3, reps: { min: 5, max: 15 }, rest: 150,
					muscleGroups: ['CHEST', 'SHOULDERS', 'TRICEPS'], priority: 'MEDIUM'
				},
				// SHOULDERS - Overhead Press (Strength)
				{
					category: 'OVERHEAD PRESS',
					options: ['overhead press', 'military press', 'dumbbell shoulder press'],
					sets: 3, reps: { min: 5, max: 15 }, rest: 120,
					muscleGroups: ['SHOULDERS', 'TRICEPS'], priority: 'MEDIUM'
				},
				// SHOULDERS - Lateral Head Isolation (Hypertrophy)
				{
					category: 'LATERAL HEAD ISOLATION',
					options: ['dumbbell lateral raise', 'cable lateral raise', 'machine lateral raise'],
					sets: 3, reps: { min: 12, max: 30 }, rest: 90,
					muscleGroups: ['SHOULDERS'], priority: 'LOW'
				},
				// CHEST - Isolation (Hypertrophy) - More pushing focused
				{
					category: 'CHEST ISOLATION',
					options: ['chest fly', 'pec deck', 'cable crossover'],
					sets: 3, reps: { min: 12, max: 30 }, rest: 90,
					muscleGroups: ['CHEST'], priority: 'LOW'
				},
				// TRICEPS - Push-focused movements (Hypertrophy)
				{
					category: 'TRICEP PUSH MOVEMENT',
					options: ['tricep dips', 'close grip bench press', 'push up'],
					sets: 3, reps: { min: 8, max: 15 }, rest: 90,
					muscleGroups: ['TRICEPS', 'CHEST'], priority: 'MEDIUM'
				}
			],
			'PULL': [
				// BACK - Vertical Pull (Strength)
				{
					category: 'VERTICAL PULL',
					options: ['lat pulldown', 'pull up', 'chin up'],
					sets: 4, reps: { min: 5, max: 15 }, rest: 180,
					muscleGroups: ['BACK', 'BICEPS'], priority: 'HIGH'
				},
				// BACK - Horizontal Pull (Strength)
				{
					category: 'HORIZONTAL PULL',
					options: ['barbell row', 'seated cable row', 'dumbbell row'],
					sets: 4, reps: { min: 5, max: 15 }, rest: 150,
					muscleGroups: ['BACK', 'BICEPS'], priority: 'HIGH'
				},
				// BICEPS - Main Biceps Curl (Strength)
				{
					category: 'MAIN BICEPS CURL',
					options: ['barbell curl', 'dumbbell curl', 'ez-bar curl'],
					sets: 3, reps: { min: 5, max: 15 }, rest: 120,
					muscleGroups: ['BICEPS'], priority: 'MEDIUM'
				},
				// BICEPS - Brachialis Focus (Hypertrophy)
				{
					category: 'BRACHIALIS CURL',
					options: ['hammer curl', 'reverse curl', 'neutral grip curl'],
					sets: 3, reps: { min: 12, max: 30 }, rest: 90,
					muscleGroups: ['BICEPS'], priority: 'LOW'
				},
				// BACK - Isolation (Hypertrophy)
				{
					category: 'BACK ISOLATION',
					options: ['pullover', 'face pull', 'reverse fly'],
					sets: 3, reps: { min: 12, max: 30 }, rest: 90,
					muscleGroups: ['BACK', 'SHOULDERS'], priority: 'LOW'
				}
			],
			'LEGS': [
				// QUADS - Lower Body Compound (Strength)
				{
					category: 'LOWER BODY COMPOUND',
					options: ['squat', 'leg press', 'hack squat'],
					sets: 4, reps: { min: 5, max: 15 }, rest: 180,
					muscleGroups: ['QUADS', 'GLUTES'], priority: 'HIGH'
				},
				// HAMSTRINGS - Hip Hinge Movement (Strength)
				{
					category: 'HIP HINGE MOVEMENT',
					options: ['Romanian deadlift', 'stiff leg deadlift', 'good mornings'],
					sets: 4, reps: { min: 5, max: 15 }, rest: 150,
					muscleGroups: ['HAMSTRINGS', 'GLUTES'], priority: 'HIGH'
				},
				// QUADS - Isolation (Hypertrophy)
				{
					category: 'QUAD ISOLATION',
					options: ['leg extensions', 'sissy squats'],
					sets: 3, reps: { min: 12, max: 30 }, rest: 90,
					muscleGroups: ['QUADS'], priority: 'MEDIUM'
				},
				// HAMSTRINGS - Isolation (Hypertrophy)
				{
					category: 'HAMSTRING ISOLATION',
					options: ['machine hamstring curl', 'nordic hamstring curl', 'lying leg curl'],
					sets: 3, reps: { min: 12, max: 30 }, rest: 90,
					muscleGroups: ['HAMSTRINGS'], priority: 'MEDIUM'
				},
				// GLUTES - Compound Lift (Strength)
				{
					category: 'GLUTE COMPOUND',
					options: ['hip thrust', 'glute bridge', 'Bulgarian split squat'],
					sets: 3, reps: { min: 5, max: 15 }, rest: 120,
					muscleGroups: ['GLUTES'], priority: 'MEDIUM'
				}
			]
		};

		// Select exercises based on priority and random selection within categories
		const availableCategories = [...coreExercises[workoutType]];
		const selectedExercises = [];

		// Sort by priority (HIGH -> MEDIUM -> LOW)
		availableCategories.sort((a, b) => {
			const priorityOrder = { 'HIGH': 0, 'MEDIUM': 1, 'LOW': 2 };
			return priorityOrder[a.priority] - priorityOrder[b.priority];
		});

		// Always include the first HIGH priority exercise
		const primaryCategory = availableCategories[0];
		const primaryExercise = primaryCategory.options[Math.floor(Math.random() * primaryCategory.options.length)];
		selectedExercises.push({
			name: primaryExercise,
			category: primaryCategory.category,
			sets: primaryCategory.sets,
			reps: primaryCategory.reps,
			rest: primaryCategory.rest,
			muscleGroups: primaryCategory.muscleGroups,
			priority: primaryCategory.priority
		});

		// Select 3-4 more exercises from remaining categories, prioritizing compound movements
		const remainingCategories = availableCategories.slice(1);
		const targetExerciseCount = Math.min(4, availableCategories.length);

		// Add at least one more HIGH priority if available
		const highPriorityRemaining = remainingCategories.filter(cat => cat.priority === 'HIGH');
		if (highPriorityRemaining.length > 0 && selectedExercises.length < targetExerciseCount) {
			const category = highPriorityRemaining[0];
			const exerciseName = category.options[Math.floor(Math.random() * category.options.length)];
			selectedExercises.push({
				name: exerciseName,
				category: category.category,
				sets: category.sets,
				reps: category.reps,
				rest: category.rest,
				muscleGroups: category.muscleGroups,
				priority: category.priority
			});
		}

		// Fill remaining slots with random selection from all categories
		const usedCategories = selectedExercises.map(ex => ex.category);
		const unusedCategories = remainingCategories.filter(cat => !usedCategories.includes(cat.category));

		while (selectedExercises.length < targetExerciseCount && unusedCategories.length > 0) {
			const randomIndex = Math.floor(Math.random() * unusedCategories.length);
			const category = unusedCategories[randomIndex];
			const exerciseName = category.options[Math.floor(Math.random() * category.options.length)];

			selectedExercises.push({
				name: exerciseName,
				category: category.category,
				sets: category.sets,
				reps: category.reps,
				rest: category.rest,
				muscleGroups: category.muscleGroups,
				priority: category.priority
			});

			unusedCategories.splice(randomIndex, 1);
		}

		// Create exercise objects
		selectedExercises.forEach((exercise, index) => {
			exercises.push({
				id: crypto.randomUUID(),
				exerciseName: exercise.name,
				muscleGroups: exercise.muscleGroups,
				suggestedSets: exercise.sets,
				suggestedReps: exercise.reps,
				estimatedRestTime: exercise.rest,
				reason: `${workoutType} - ${exercise.category}`,
				priority: exercise.priority,
				alternatives: []
			});
			estimatedDuration += exercise.sets * 2 + (exercise.sets - 1) * (exercise.rest / 60);
		});

		console.log(`🏋️ Selected ${workoutType} exercises:`);
		selectedExercises.forEach(ex => {
			console.log(`   • ${ex.name} (${ex.category}) - ${ex.sets} sets`);
		});

		// Randomly add intelligent accessories based on deficits
		this.addRandomIntelligentAccessories(exercises, weeklyAnalysis);

		// Calculate final duration
		estimatedDuration = exercises.reduce((total, ex) => {
			return total + ex.suggestedSets * 2 + (ex.suggestedSets - 1) * (ex.estimatedRestTime / 60);
		}, 0);

		const focusMuscleGroups = [...new Set(exercises.flatMap(ex => ex.muscleGroups))];

		return {
			id: crypto.randomUUID(),
			workoutType,
			estimatedDuration: Math.round(estimatedDuration),
			exercises,
			focusMuscleGroups: focusMuscleGroups.slice(0, 4), // Limit to 4 main focus areas
			notes: `${workoutType} workout with intelligent accessories based on volume analysis`,
			difficultyLevel: 'MODERATE',
			equipment: ['Barbell', 'Dumbbell', 'Cable', 'Machine']
		};
	}

	/**
	 * Add random intelligent accessories based on weekly analysis deficits
	 */
	addRandomIntelligentAccessories(exercises, weeklyAnalysis) {
		const addedAccessories = [];

		// 70% chance to add cardio warmup if deficit
		const cardioVolume = weeklyAnalysis.muscleGroupVolumes.find(v => v.muscleGroup === 'CARDIO');
		const cardioDeficit = cardioVolume ? Math.max(0, cardioVolume.targetMin - cardioVolume.actualSets) : 3;

		if (cardioDeficit > 0 && Math.random() < 0.7) {
			const cardioOptions = ['light treadmill walk', 'stationary bike', 'elliptical'];
			const selectedCardio = cardioOptions[Math.floor(Math.random() * cardioOptions.length)];

			exercises.unshift({
				id: crypto.randomUUID(),
				exerciseName: selectedCardio,
				muscleGroups: ['CARDIO'],
				suggestedSets: 1,
				suggestedReps: { min: 5, max: 10 },
				estimatedRestTime: 0,
				reason: `Cardio deficit: ${cardioDeficit} sessions needed`,
				priority: 'LOW',
				alternatives: cardioOptions.filter(c => c !== selectedCardio)
			});
			addedAccessories.push('cardio warmup');
		}

		// 60% chance to add abs if deficit >= 2
		const absVolume = weeklyAnalysis.muscleGroupVolumes.find(v => v.muscleGroup === 'ABS');
		const absDeficit = absVolume ? Math.max(0, absVolume.targetMin - absVolume.actualSets) : 6;

		if (absDeficit >= 2 && Math.random() < 0.6) {
			const absOptions = ['plank', 'crunch', 'hanging leg raise', 'bicycle crunch'];
			const selectedAbs = absOptions[Math.floor(Math.random() * absOptions.length)];

			exercises.push({
				id: crypto.randomUUID(),
				exerciseName: selectedAbs,
				muscleGroups: ['ABS'],
				suggestedSets: Math.min(3, Math.ceil(absDeficit / 2)),
				suggestedReps: { min: 12, max: 20 },
				estimatedRestTime: 60,
				reason: `Abs deficit: ${absDeficit} sets needed`,
				priority: 'LOW',
				alternatives: absOptions.filter(a => a !== selectedAbs)
			});
			addedAccessories.push('abs');
		}

		// 50% chance to add forearms if deficit >= 2  
		const forearmsVolume = weeklyAnalysis.muscleGroupVolumes.find(v => v.muscleGroup === 'FOREARMS');
		const forearmsDeficit = forearmsVolume ? Math.max(0, forearmsVolume.targetMin - forearmsVolume.actualSets) : 6;

		if (forearmsDeficit >= 2 && Math.random() < 0.5) {
			const forearmOptions = ['wrist curl', 'farmer walk', 'dead hang'];
			const selectedForearm = forearmOptions[Math.floor(Math.random() * forearmOptions.length)];

			exercises.push({
				id: crypto.randomUUID(),
				exerciseName: selectedForearm,
				muscleGroups: ['FOREARMS'],
				suggestedSets: Math.min(3, Math.ceil(forearmsDeficit / 2)),
				suggestedReps: { min: 15, max: 25 },
				estimatedRestTime: 60,
				reason: `Forearms deficit: ${forearmsDeficit} sets needed`,
				priority: 'LOW',
				alternatives: forearmOptions.filter(f => f !== selectedForearm)
			});
			addedAccessories.push('forearms');
		}

		// 40% chance to add calves (always add if big deficit)
		const calvesVolume = weeklyAnalysis.muscleGroupVolumes.find(v => v.muscleGroup === 'CALVES');
		const calvesDeficit = calvesVolume ? Math.max(0, calvesVolume.targetMin - calvesVolume.actualSets) : 6;

		if (calvesDeficit >= 2 && (Math.random() < 0.4 || calvesDeficit >= 4)) {
			exercises.push({
				id: crypto.randomUUID(),
				exerciseName: 'standing calf raise',
				muscleGroups: ['CALVES'],
				suggestedSets: Math.min(4, Math.ceil(calvesDeficit / 2)),
				suggestedReps: { min: 15, max: 25 },
				estimatedRestTime: 60,
				reason: `Calves deficit: ${calvesDeficit} sets needed`,
				priority: 'LOW',
				alternatives: ['seated calf raise', 'calf press']
			});
			addedAccessories.push('calves');
		}

		// 30% chance to add neck if big deficit
		const neckVolume = weeklyAnalysis.muscleGroupVolumes.find(v => v.muscleGroup === 'NECK');
		const neckDeficit = neckVolume ? Math.max(0, neckVolume.targetMin - neckVolume.actualSets) : 18;

		if (neckDeficit >= 6 && Math.random() < 0.3) {
			const neckOptions = ['neck curl', 'neck extension'];
			const selectedNeck = neckOptions[Math.floor(Math.random() * neckOptions.length)];

			exercises.push({
				id: crypto.randomUUID(),
				exerciseName: selectedNeck,
				muscleGroups: ['NECK'],
				suggestedSets: Math.min(3, Math.ceil(neckDeficit / 6)),
				suggestedReps: { min: 12, max: 20 },
				estimatedRestTime: 45,
				reason: `Neck deficit: ${neckDeficit} sets needed`,
				priority: 'LOW',
				alternatives: neckOptions.filter(n => n !== selectedNeck)
			});
			addedAccessories.push('neck');
		}

		// Add workout-specific isolation exercises based on the workout type
		this.addWorkoutSpecificAccessories(exercises, addedAccessories, weeklyAnalysis);

		console.log(`🎲 Randomly added accessories: ${addedAccessories.join(', ') || 'none'}`);
		return addedAccessories;
	}

	/**
	 * Add workout-specific isolation accessories
	 */
	addWorkoutSpecificAccessories(exercises, addedAccessories, weeklyAnalysis) {
		// Get current exercise names to avoid duplicates
		const currentExerciseNames = exercises.map(ex => ex.exerciseName.toLowerCase());

		// PUSH specific accessories
		if (exercises.some(ex => ex.muscleGroups.some(mg => ['CHEST', 'SHOULDERS', 'TRICEPS'].includes(mg)))) {
			// 40% chance to add lateral raise for shoulders
			if (Math.random() < 0.4 && !currentExerciseNames.includes('lateral raise')) {
				exercises.push({
					id: crypto.randomUUID(),
					exerciseName: 'lateral raise',
					muscleGroups: ['SHOULDERS'],
					suggestedSets: 3,
					suggestedReps: { min: 12, max: 15 },
					estimatedRestTime: 60,
					reason: 'Push isolation for shoulders',
					priority: 'LOW',
					alternatives: ['front raise', 'rear delt fly']
				});
				addedAccessories.push('lateral raise');
			}

			// 35% chance to add tricep isolation if not enough tricep work
			if (Math.random() < 0.35 && !currentExerciseNames.some(name => name.includes('tricep'))) {
				const tricepOptions = ['tricep extension', 'skullcrusher', 'close grip bench press'];
				const selectedTricep = tricepOptions[Math.floor(Math.random() * tricepOptions.length)];

				exercises.push({
					id: crypto.randomUUID(),
					exerciseName: selectedTricep,
					muscleGroups: ['TRICEPS'],
					suggestedSets: 3,
					suggestedReps: { min: 8, max: 15 },
					estimatedRestTime: 90,
					reason: 'Push isolation for triceps',
					priority: 'LOW',
					alternatives: tricepOptions.filter(t => t !== selectedTricep)
				});
				addedAccessories.push('tricep isolation');
			}
		}

		// PULL specific accessories
		if (exercises.some(ex => ex.muscleGroups.some(mg => ['BACK', 'BICEPS'].includes(mg)))) {
			// 35% chance to add face pull or rear delt work for posterior chain balance
			if (Math.random() < 0.35) {
				const rearDeltOptions = ['face pull', 'rear delt fly'];
				const selectedRearDelt = rearDeltOptions[Math.floor(Math.random() * rearDeltOptions.length)];

				exercises.push({
					id: crypto.randomUUID(),
					exerciseName: selectedRearDelt,
					muscleGroups: ['SHOULDERS', 'BACK'],
					suggestedSets: 3,
					suggestedReps: { min: 15, max: 20 },
					estimatedRestTime: 60,
					reason: 'Pull accessory for posterior chain',
					priority: 'LOW',
					alternatives: rearDeltOptions.filter(r => r !== selectedRearDelt)
				});
				addedAccessories.push('rear delt');
			}

			// 30% chance to add extra bicep isolation
			if (Math.random() < 0.3 && !currentExerciseNames.some(name => name.includes('curl'))) {
				const bicepOptions = ['hammer curl', 'concentration curl', 'preacher curl'];
				const selectedBicep = bicepOptions[Math.floor(Math.random() * bicepOptions.length)];

				exercises.push({
					id: crypto.randomUUID(),
					exerciseName: selectedBicep,
					muscleGroups: ['BICEPS'],
					suggestedSets: 2,
					suggestedReps: { min: 12, max: 15 },
					estimatedRestTime: 60,
					reason: 'Pull isolation for biceps',
					priority: 'LOW',
					alternatives: bicepOptions.filter(b => b !== selectedBicep)
				});
				addedAccessories.push('bicep isolation');
			}
		}

		// LEGS specific accessories  
		if (exercises.some(ex => ex.muscleGroups.some(mg => ['QUADS', 'HAMSTRINGS', 'GLUTES'].includes(mg)))) {
			// 50% chance to add calf raises if not already added
			if (Math.random() < 0.5 && !currentExerciseNames.some(name => name.includes('calf'))) {
				exercises.push({
					id: crypto.randomUUID(),
					exerciseName: 'standing calf raise',
					muscleGroups: ['CALVES'],
					suggestedSets: 4,
					suggestedReps: { min: 15, max: 25 },
					estimatedRestTime: 60,
					reason: 'Leg accessory for calves',
					priority: 'LOW',
					alternatives: ['seated calf raise', 'calf press']
				});
				addedAccessories.push('calves');
			}
		}
	}

	/**
	 * Generate workout suggestions for the next few days
	 */
	async generateWorkoutSuggestions(workoutData) {
		try {
			console.log('🧠 Analyzing workout history and generating suggestions...');
			console.log('Workout data type:', typeof workoutData);
			console.log('Workout data is array:', Array.isArray(workoutData));
			console.log('Workout data length:', workoutData?.length);

			// For testing, modify the analyzer to use a wider date range
			// Create a custom analysis for the demo data
			const weeklyAnalysis = this.analyzeWorkoutDataCustom(workoutData);

			console.log('\n📊 Weekly Volume Analysis:');
			weeklyAnalysis.muscleGroupVolumes.forEach(volume => {
				const status = volume.actualSets >= volume.targetMin ? '✅' : '⚠️';
				console.log(`${status} ${volume.muscleGroup}: ${volume.actualSets}/${volume.targetMin} sets`);
			});

			// Determine the next workout type based on PPL rotation
			const nextWorkoutType = this.determineNextPPLWorkout(workoutData);
			console.log(`🎯 Determined next workout type: ${nextWorkoutType}`);

			// Generate preferences for the determined workout type
			const preferences = {
				splitPreference: 'PPL', // Push/Pull/Legs
				primaryGoal: 'HYPERTROPHY',
				workoutDaysPerWeek: 6
			};

			// Generate specific workout based on determined type
			const suggestion = this.generateSpecificWorkout(nextWorkoutType, weeklyAnalysis);

			// Set the date for tomorrow
			const tomorrow = new Date();
			tomorrow.setDate(tomorrow.getDate() + 1);
			suggestion.date = tomorrow.toISOString().split('T')[0];
			suggestion.workoutType = nextWorkoutType;

			const suggestions = [suggestion];

			return suggestions;
		} catch (error) {
			console.error('❌ Error generating suggestions:', error.message);
			throw error;
		}
	}

	/**
	 * Create a routine in Hevy from a workout suggestion
	 */
	async createHevyRoutine(suggestion) {
		try {
			const routineName = `${suggestion.date} - ${suggestion.workoutType} (Hevier AI)`;
			console.log(`\n🏗️ Creating routine: ${routineName}`);

			// Build exercise data for Hevy
			const exercises = [];

			for (const exercise of suggestion.exercises) {
				// Get Hevy exercise ID
				let hevyExerciseId = getHevyExerciseId(exercise.exerciseName);

				if (!hevyExerciseId) {
					console.log(`⚠️ Could not find Hevy ID for "${exercise.exerciseName}", skipping...`);
					continue;
				}

				// Create sets data
				const sets = [];
				for (let i = 0; i < exercise.suggestedSets; i++) {
					sets.push({
						type: 'normal',
						weight_kg: null, // User will fill in
						reps: exercise.suggestedReps.min || 10
					});
				}

				exercises.push({
					exercise_template_id: hevyExerciseId,
					superset_id: null,
					rest_seconds: exercise.estimatedRestTime || 120,
					sets: sets
				});

				console.log(`  ✓ ${exercise.exerciseName} (${exercise.suggestedSets} sets)`);
			}

			if (exercises.length === 0) {
				console.log('❌ No valid exercises found, skipping routine creation');
				return null;
			}

			// Create the routine payload (wrap in 'routine' object as required by API)
			const routineData = {
				routine: {
					title: routineName,
					exercises: exercises,
					folder_id: null // Set to null or omit folder_id
				}
			};

			if (this.dryRun) {
				console.log(`📝 DRY RUN: Would create routine with ${exercises.length} exercises...`);
				console.log(`🔍 Routine payload:`);
				console.log(JSON.stringify(routineData, null, 2));
				console.log(`✅ DRY RUN: Routine would be created successfully`);
				return { id: 'dry-run-id', title: routineData.routine.title, success: true, dryRun: true };
			} else {
				console.log(`📝 Creating routine with ${exercises.length} exercises...`);
				const result = await this.makeHevyRequest('/routines', {
					method: 'POST',
					body: JSON.stringify(routineData)
				});

				console.log(`✅ Successfully created routine: ${result.title}`);
				console.log(`🔗 Routine ID: ${result.id}`);

				return result;
			}
		} catch (error) {
			console.error(`❌ Error creating routine for ${suggestion.date}:`, error.message);
			if (error.response?.data) {
				console.error('API Error Details:', error.response.data);
			}
			return null;
		}
	}

	/**
	 * Main execution function
	 */
	async run() {
		try {
			console.log('🎯 Starting Hevier AI Routine Creation Process\n');

			// Test API connection
			const connected = await this.testConnection();
			if (!connected) {
				process.exit(1);
			}

			// Get user workout data
			const workoutData = await this.getUserWorkoutData();

			// Generate suggestions
			const suggestions = await this.generateWorkoutSuggestions(workoutData);

			console.log(`\n🎯 Generated workout suggestion:`);
			const suggestion = suggestions[0];
			console.log(`\n📅 ${suggestion.date} - ${suggestion.workoutType} Day`);
			console.log(`   Duration: ~${suggestion.estimatedDuration} minutes`);
			console.log(`   Exercises: ${suggestion.exercises.length}`);
			console.log(`   Focus: ${suggestion.focusMuscleGroups.join(', ')}`);
			if (suggestion.notes) {
				console.log(`   Notes: ${suggestion.notes}`);
			}

			// Show exercise breakdown
			console.log(`\n📋 Exercise Breakdown:`);
			suggestion.exercises.forEach((exercise, index) => {
				const repsText = exercise.suggestedReps.min === exercise.suggestedReps.max ?
					`${exercise.suggestedReps.min} reps` :
					`${exercise.suggestedReps.min}-${exercise.suggestedReps.max} reps`;
				console.log(`   ${index + 1}. ${exercise.exerciseName} - ${exercise.suggestedSets} sets x ${repsText}`);
			});

			// Create routine in Hevy (or preview in dry run mode)
			if (this.dryRun) {
				console.log('\n🔍 Dry run - Preview only, no routine will be created...');
			} else {
				console.log('\n🚀 Creating routine in Hevy...');
			}
			const result = await this.createHevyRoutine(suggestion);

			if (result) {
				if (result.dryRun) {
					console.log(`\n🔍 DRY RUN COMPLETE - Workout routine preview generated!`);
					console.log(`📋 This routine would be created in Hevy:`);
					console.log(`  • ${result.title}`);
					console.log(`\n💡 To actually create this routine, run without --dry-run flag`);
				} else {
					console.log(`\n🎉 Successfully created your workout routine!`);
					console.log(`📱 Your new routine is now available in the Hevy app:`);
					console.log(`  • ${result.title || suggestion.date + ' - ' + suggestion.workoutType + ' (Hevier AI)'}`);
				}
			} else {
				console.log(`\n❌ Failed to create routine in Hevy`);
			}

		} catch (error) {
			console.error('\n💥 Fatal error:', error.message);
			process.exit(1);
		}
	}
}

// Run the routine creator if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
	const creator = new HevierRoutineCreator();
	creator.run().catch(error => {
		console.error('Unhandled error:', error);
		process.exit(1);
	});
}

export { HevierRoutineCreator };
