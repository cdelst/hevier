// Unified workout API service - used by both UI and script
import { NextRequest, NextResponse } from 'next/server';
import { getMuscleGroupsForExercise, getHevyExerciseId } from '../../lib/exercise-mapping.js';

/**
 * Unified workout fetching and analysis service
 * This ensures both the UI and script use identical logic for:
 * - 14-day filtering
 * - Pagination with safety limits  
 * - Workout analysis
 */
export async function GET(request: NextRequest) {
	try {
		console.log('📊 Unified workout service: Fetching and analyzing workouts...');

		// Get API token from environment
		const apiToken = process.env.HEVY_API_TOKEN;
		if (!apiToken) {
			return NextResponse.json(
				{ error: 'HEVY_API_TOKEN not configured' },
				{ status: 500 }
			);
		}

		// Calculate the cutoff date (14 days ago)
		const cutoffDate = new Date();
		cutoffDate.setDate(cutoffDate.getDate() - 14);
		cutoffDate.setHours(0, 0, 0, 0);

		console.log(`🗓️ Fetching workouts since: ${cutoffDate.toISOString().split('T')[0]}`);

		let allRecentWorkouts: any[] = [];
		let offset = 0;
		let hasMorePages = true;
		const limit = 10;
		const maxPages = 50; // Safety limit
		let pageCount = 0;

		// Keep fetching pages until we have all workouts from the last 14 days
		while (hasMorePages && pageCount < maxPages) {
			pageCount++;
			console.log(`📄 Fetching page ${pageCount}/${maxPages} (offset ${offset})...`);

			const apiUrl = `https://api.hevyapp.com/v1/workouts?limit=${limit}&offset=${offset}`;

			try {
				const response = await fetch(apiUrl, {
					headers: {
						'api-key': apiToken,
						'Content-Type': 'application/json',
					},
				});

				if (!response.ok) {
					const errorText = await response.text();
					throw new Error(`${response.status} ${response.statusText}: ${errorText}`);
				}

				const data = await response.json();
				const workouts = data.workouts || [];

				console.log(`📦 Received ${workouts.length} workouts from page ${pageCount}`);

				if (workouts.length === 0) {
					console.log('📭 No more workouts found, stopping pagination');
					hasMorePages = false;
					break;
				}

				// Show date range for debugging
				if (workouts.length > 0) {
					const firstWorkoutDate = workouts[0].start_time.split('T')[0];
					const lastWorkoutDate = workouts[workouts.length - 1].start_time.split('T')[0];
					console.log(`📅 Page ${pageCount} workout dates: ${lastWorkoutDate} to ${firstWorkoutDate}`);
				}

				// Manual filtering - check for workouts within the last 14 days
				const recentWorkoutsFromPage = workouts.filter((workout: any) => {
					const workoutDate = new Date(workout.start_time.split('T')[0]);
					return workoutDate >= cutoffDate;
				});

				console.log(`✅ ${recentWorkoutsFromPage.length}/${workouts.length} workouts from page ${pageCount} are within last 14 days`);

				// Add the recent workouts from this page
				allRecentWorkouts.push(...recentWorkoutsFromPage);

				// Check if all workouts on this page are older than our cutoff
				const oldestWorkoutOnPage = workouts[workouts.length - 1];
				const oldestWorkoutDate = new Date(oldestWorkoutOnPage.start_time.split('T')[0]);

				if (oldestWorkoutDate < cutoffDate) {
					console.log(`🛑 All remaining workouts are older than ${cutoffDate.toISOString().split('T')[0]}, stopping pagination`);
					hasMorePages = false;
					break;
				}

				// Check pagination info
				if (data.page_info && typeof data.page_info.has_next_page === 'boolean') {
					hasMorePages = data.page_info.has_next_page;
					console.log(`📄 API indicates has_next_page: ${hasMorePages}`);
				} else {
					hasMorePages = workouts.length >= limit;
					console.log(`📄 Received ${workouts.length}/${limit} workouts, assuming has_next_page: ${hasMorePages}`);
				}

				offset += limit;

			} catch (error) {
				console.error(`❌ Error fetching workouts at offset ${offset}:`, error);
				hasMorePages = false;
			}
		}

		if (pageCount >= maxPages) {
			console.log(`⚠️ WARNING: Reached maximum page limit (${maxPages}). You may have more workouts that weren't fetched.`);
		}

		console.log(`📈 Total workouts found in the last 14 days: ${allRecentWorkouts.length}`);

		// Convert Hevy workouts to internal format using full exercise mapping
		const convertedWorkouts = allRecentWorkouts.map((hevyWorkout: any) => {

			const exercises = (hevyWorkout.exercises || []).map((exercise: any) => {
				// Use correct Hevy API fields
				const exerciseName = exercise.title || 'Unknown Exercise';
				const exerciseId = exercise.exercise_template_id;

				// Debug logging
				if (exerciseId && exerciseName !== 'Unknown Exercise') {
					console.log(`🔍 Mapping exercise: "${exerciseName}" (ID: ${exerciseId})`);
				}

				// Use embedded exercise mapping
				const muscleGroups = getMuscleGroupsFromExercise(exerciseName, exerciseId);

				if (exerciseId && muscleGroups.length > 0 && !muscleGroups.includes('UNKNOWN')) {
					console.log(`✅ Mapped exercise "${exerciseName}" (${exerciseId}) to:`, muscleGroups);
				} else if (muscleGroups.includes('UNKNOWN')) {
					console.warn(`⚠️ Unknown exercise: "${exerciseName}" (${exerciseId})`);
				}

				const sets = (exercise.sets || []).filter((set: any) => set.set_type !== 'warmup').length;

				return {
					id: exerciseId,
					name: exerciseName,
					muscleGroups,
					sets,
					totalVolume: (exercise.sets || []).reduce((sum: number, set: any) => {
						return sum + (set.weight_kg || 0) * (set.reps || 0);
					}, 0)
				};
			});

			return {
				id: hevyWorkout.id,
				date: hevyWorkout.start_time.split('T')[0], // Keep as string for now, convert in script
				exercises,
				totalDuration: Math.round((hevyWorkout.duration_seconds || 0) / 60)
			};
		});

		// Basic analysis (simplified version)
		const totalWorkouts = convertedWorkouts.length;
		const muscleGroupVolumes = calculateBasicVolumes(convertedWorkouts);
		const overallScore = calculateBasicScore(muscleGroupVolumes);

		const analysis = {
			totalWorkouts,
			muscleGroupVolumes,
			overallScore,
			dateRange: {
				start: cutoffDate.toISOString().split('T')[0],
				end: new Date().toISOString().split('T')[0]
			}
		};

		// Generate workout suggestions
		const suggestion = generateWorkoutSuggestion(convertedWorkouts, muscleGroupVolumes);

		console.log(`🔄 Analysis complete: ${totalWorkouts} workouts, ${overallScore}% score`);
		console.log(`🎯 Generated suggestion: ${suggestion.workoutType} workout for ${suggestion.date}`);

		return NextResponse.json({
			success: true,
			data: {
				workouts: convertedWorkouts,
				analysis,
				suggestion,
				metadata: {
					totalFetched: allRecentWorkouts.length,
					pagesProcessed: pageCount,
					dateRange: analysis.dateRange,
					fetchedAt: new Date().toISOString()
				}
			}
		});

	} catch (error) {
		console.error('❌ Unified workout service error:', error);

		return NextResponse.json(
			{
				success: false,
				error: 'Failed to fetch and analyze workouts',
				message: error instanceof Error ? error.message : 'Unknown error'
			},
			{ status: 500 }
		);
	}
}

// Basic exercise mapping (embedded for API route compatibility)
const BASIC_EXERCISE_MAPPING = {
	// Real exercise IDs from your Hevy workout data
	'C7973E0E': ['QUADS', 'GLUTES'], // Leg Press (Machine)
	'3601968B': ['CHEST', 'TRICEPS', 'SHOULDERS'], // Bench Press (Dumbbell)
	'D3E2AB55': ['CHEST'], // Incline Chest Fly (Dumbbell)
	'7EB3F7C3': ['CHEST', 'TRICEPS'], // Chest Press (Machine)
	'94B7239B': ['TRICEPS'], // Triceps Rope Pushdown
	'd8bb68ec-d1c0-484f-908b-92899717a704': ['ABS'], // Weighted Side Bend
	'9289aeaa-972e-4505-8556-86c4a68a0b84': ['ABS'], // Abs
	'33EDD7DB': ['CARDIO'], // Walking
	'9237BAD1': ['SHOULDERS', 'TRICEPS'], // Seated Shoulder Press (Machine)
	'6A6C31A5': ['BACK', 'BICEPS'], // Lat Pulldown (Cable)
	'0393F233': ['BACK', 'BICEPS'], // Seated Cable Row - V Grip (Cable)
	'F1E57334': ['BACK', 'BICEPS'], // Dumbbell Row
	'DDB29047': ['FOREARMS', 'BICEPS'], // Behind the Back Bicep Wrist Curl (Barbell)
	'37FCC2BB': ['BICEPS'], // Bicep Curl (Dumbbell)
	'1E9A6B8E': ['BICEPS'], // Preacher Curl (Machine)
	'2C37EC5E': ['BACK', 'BICEPS'], // Pull Up (Assisted)
	'47B9DF13': ['CALVES'], // Calf Extension (Machine)
	'527DA061': ['ABS'], // Stretching
	'651F844C': ['CHEST'], // Cable Fly Crossovers
	'582ADA23': ['BICEPS'], // Overhead Curl (Cable)

	// Keep original mapping for fallback
	'79D0BB3A': ['CHEST', 'TRICEPS', 'SHOULDERS'], // Bench Press
	'7B8D84E8': ['SHOULDERS', 'TRICEPS'], // Overhead Press
	'C43825EA': ['CHEST', 'TRICEPS'], // Push-up variations
	'12017185': ['CHEST'], // Chest Fly
	'A41C7261': ['ABS'], // Bicycle Crunch
	'1006DF48': ['FOREARMS'], // Wrist Curl
	'06745E58': ['CALVES'], // Standing Calf Raise
	'2F8D3067': ['TRICEPS'], // Tricep Extension
	'243710DE': ['CARDIO'], // Treadmill
};

// Full muscle group mapping using embedded basic mapping + fallback
function getMuscleGroupsFromExercise(exerciseName: string, exerciseId?: string): string[] {
	// First try embedded mapping by ID
	if (exerciseId && BASIC_EXERCISE_MAPPING[exerciseId as keyof typeof BASIC_EXERCISE_MAPPING]) {
		return BASIC_EXERCISE_MAPPING[exerciseId as keyof typeof BASIC_EXERCISE_MAPPING];
	}

	// Fallback to name-based mapping
	return inferMuscleGroupsFromName(exerciseName);
}

// Basic muscle group inference (fallback)
function inferMuscleGroupsFromName(exerciseName: string): string[] {
	const name = exerciseName.toLowerCase();

	// Basic mapping - fallback when full mapping fails
	if (name.includes('bench') || name.includes('chest')) return ['CHEST', 'TRICEPS'];
	if (name.includes('squat') || name.includes('leg press')) return ['QUADS', 'GLUTES'];
	if (name.includes('deadlift')) return ['BACK', 'HAMSTRINGS', 'GLUTES'];
	if (name.includes('row') || name.includes('pulldown')) return ['BACK', 'BICEPS'];
	if (name.includes('press') && name.includes('shoulder')) return ['SHOULDERS', 'TRICEPS'];
	if (name.includes('curl') && name.includes('bicep')) return ['BICEPS'];
	if (name.includes('extension') && name.includes('leg')) return ['QUADS'];
	if (name.includes('curl') && name.includes('leg')) return ['HAMSTRINGS'];
	if (name.includes('calf')) return ['CALVES'];
	if (name.includes('abs') || name.includes('crunch')) return ['ABS'];

	return ['UNKNOWN']; // Fallback
}

// Basic volume calculation (simplified)
function calculateBasicVolumes(workouts: any[]) {
	const volumes = new Map();
	const targets = {
		CHEST: { min: 12, max: 20 },
		BACK: { min: 12, max: 24 },
		SHOULDERS: { min: 15, max: 21 },
		QUADS: { min: 12, max: 18 },
		HAMSTRINGS: { min: 12, max: 12 },
		GLUTES: { min: 6, max: 12 },
		BICEPS: { min: 12, max: 18 },
		TRICEPS: { min: 9, max: 15 },
		CALVES: { min: 6, max: 12 },
		ABS: { min: 6, max: 12 },
		FOREARMS: { min: 6, max: 12 },
		NECK: { min: 18, max: 18 },
		CARDIO: { min: 3, max: 5 }
	};

	// Initialize volumes
	Object.keys(targets).forEach(muscle => {
		volumes.set(muscle, 0);
	});

	// Count sets per muscle group
	workouts.forEach(workout => {
		workout.exercises.forEach((exercise: any) => {
			exercise.muscleGroups.forEach((muscle: string) => {
				if (volumes.has(muscle)) {
					volumes.set(muscle, volumes.get(muscle) + exercise.sets);
				}
			});
		});
	});

	// Convert to array with targets and deficits
	return Object.keys(targets).map(muscle => {
		const actualSets = volumes.get(muscle) || 0;
		const target = targets[muscle as keyof typeof targets];
		const deficit = Math.max(0, target.min - actualSets);
		const surplus = Math.max(0, actualSets - target.max);

		return {
			muscleGroup: muscle,
			actualSets,
			targetMin: target.min,
			targetMax: target.max,
			deficit,
			surplus
		};
	});
}

// Basic score calculation (simplified)
function calculateBasicScore(muscleGroupVolumes: any[]): number {
	let totalScore = 0;
	let weightedTotal = 0;

	muscleGroupVolumes.forEach(volume => {
		const weight = volume.targetMin;
		let score = 0;

		if (volume.actualSets >= volume.targetMin) {
			if (volume.actualSets > volume.targetMax) {
				const overage = (volume.actualSets - volume.targetMax) / volume.targetMax;
				score = Math.max(90, 100 - (overage * 20));
			} else {
				score = 100;
			}
		} else {
			const completionRatio = volume.actualSets / volume.targetMin;
			score = completionRatio * 80;
		}

		totalScore += score * weight;
		weightedTotal += weight;
	});

	return Math.round(totalScore / weightedTotal);
}

// Generate workout suggestion based on analysis
function generateWorkoutSuggestion(workouts: any[], muscleGroupVolumes: any[]) {
	// Determine next workout type (simplified PPL logic)
	const workoutType = determineNextWorkoutType(workouts);

	// Get tomorrow's date
	const tomorrow = new Date();
	tomorrow.setDate(tomorrow.getDate() + 1);
	const dateStr = tomorrow.toISOString().split('T')[0];

	// Find top 3 deficit muscle groups
	const deficits = muscleGroupVolumes
		.filter(v => v.deficit > 0)
		.sort((a, b) => b.deficit - a.deficit)
		.slice(0, 3);

	// Generate exercises based on workout type and deficits
	const exercises = generateExercises(workoutType, deficits);

	// Calculate estimated duration (roughly 10 min per exercise + 10 min setup/warmup)
	const estimatedDuration = Math.max(30, exercises.length * 10 + 10);

	// Determine focus areas
	const focus = getFocusAreas(workoutType, deficits);

	return {
		workoutType,
		date: dateStr,
		exercises,
		estimatedDuration,
		focus,
		notes: `AI-generated ${workoutType} workout targeting your highest deficit muscle groups.`
	};
}

// Simplified PPL determination
function determineNextWorkoutType(workouts: any[]): string {
	if (workouts.length === 0) return 'PUSH';

	// Simple rotation: look at last workout and suggest next in cycle
	const lastWorkout = workouts[0]; // Most recent workout
	const lastType = classifyWorkoutType(lastWorkout.exercises);

	// PPL cycle: PUSH → PULL → LEGS → PUSH...
	switch (lastType) {
		case 'PUSH': return 'PULL';
		case 'PULL': return 'LEGS';
		case 'LEGS': return 'PUSH';
		default: return 'PUSH'; // Default if mixed/unknown
	}
}

// Classify workout type based on exercises
function classifyWorkoutType(exercises: any[]): string {
	const pushMuscles = ['CHEST', 'SHOULDERS', 'TRICEPS'];
	const pullMuscles = ['BACK', 'BICEPS'];
	const legMuscles = ['QUADS', 'HAMSTRINGS', 'GLUTES', 'CALVES'];

	let pushSets = 0, pullSets = 0, legSets = 0, totalSets = 0;

	exercises.forEach(exercise => {
		const sets = exercise.sets || 0;
		const muscleGroups = exercise.muscleGroups || [];

		totalSets += sets;

		muscleGroups.forEach((muscle: string) => {
			if (pushMuscles.includes(muscle)) pushSets += sets;
			else if (pullMuscles.includes(muscle)) pullSets += sets;
			else if (legMuscles.includes(muscle)) legSets += sets;
		});
	});

	if (totalSets === 0) return 'MIXED';

	const pushPercent = (pushSets / totalSets) * 100;
	const pullPercent = (pullSets / totalSets) * 100;
	const legPercent = (legSets / totalSets) * 100;

	if (pushPercent > 50) return 'PUSH';
	if (pullPercent > 50) return 'PULL';
	if (legPercent > 50) return 'LEGS';

	return 'MIXED';
}

// Generate exercises for the workout type
function generateExercises(workoutType: string, deficits: any[]) {
	const exercises = [];

	// Core exercises based on workout type
	switch (workoutType) {
		case 'PUSH':
			exercises.push(
				{ exerciseName: 'bench press', suggestedSets: 4, suggestedReps: { min: 5, max: 12 }, priority: 'high' },
				{ exerciseName: 'incline press', suggestedSets: 3, suggestedReps: { min: 6, max: 12 } },
				{ exerciseName: 'overhead press', suggestedSets: 3, suggestedReps: { min: 5, max: 10 } },
				{ exerciseName: 'tricep dips', suggestedSets: 3, suggestedReps: { min: 8, max: 15 } }
			);
			break;
		case 'PULL':
			exercises.push(
				{ exerciseName: 'deadlift', suggestedSets: 4, suggestedReps: { min: 3, max: 8 }, priority: 'high' },
				{ exerciseName: 'pull ups', suggestedSets: 3, suggestedReps: { min: 5, max: 12 } },
				{ exerciseName: 'barbell row', suggestedSets: 3, suggestedReps: { min: 6, max: 12 } },
				{ exerciseName: 'bicep curl', suggestedSets: 3, suggestedReps: { min: 8, max: 15 } }
			);
			break;
		case 'LEGS':
			exercises.push(
				{ exerciseName: 'squat', suggestedSets: 4, suggestedReps: { min: 5, max: 12 }, priority: 'high' },
				{ exerciseName: 'leg press', suggestedSets: 3, suggestedReps: { min: 8, max: 15 } },
				{ exerciseName: 'leg curl', suggestedSets: 3, suggestedReps: { min: 10, max: 15 } },
				{ exerciseName: 'calf raise', suggestedSets: 3, suggestedReps: { min: 12, max: 20 } }
			);
			break;
	}

	// Add deficit-focused exercises
	deficits.forEach((deficit, index) => {
		if (index < 2) { // Only add exercises for top 2 deficits
			const deficitExercise = getDeficitExercise(deficit.muscleGroup);
			if (deficitExercise) {
				exercises.push({
					...deficitExercise,
					reason: `Targeting ${deficit.muscleGroup.toLowerCase()} deficit (-${deficit.deficit} sets)`
				});
			}
		}
	});

	return exercises;
}

// Get exercise for specific deficit muscle group
function getDeficitExercise(muscleGroup: string) {
	const deficitExercises = {
		'ABS': { exerciseName: 'plank', suggestedSets: 3, suggestedReps: { min: 30, max: 60 } },
		'NECK': { exerciseName: 'neck curl', suggestedSets: 2, suggestedReps: { min: 12, max: 15 } },
		'FOREARMS': { exerciseName: 'wrist curl', suggestedSets: 2, suggestedReps: { min: 15, max: 20 } },
		'CALVES': { exerciseName: 'calf raise', suggestedSets: 3, suggestedReps: { min: 15, max: 20 } },
		'CARDIO': { exerciseName: 'treadmill walk', suggestedSets: 1, suggestedReps: { min: 10, max: 15 } },
	};

	return deficitExercises[muscleGroup as keyof typeof deficitExercises] || null;
}

// Get focus areas for the workout
function getFocusAreas(workoutType: string, deficits: any[]): string[] {
	const baseAreas = {
		'PUSH': ['CHEST', 'TRICEPS', 'SHOULDERS'],
		'PULL': ['BACK', 'BICEPS'],
		'LEGS': ['QUADS', 'HAMSTRINGS', 'GLUTES']
	};

	const focus = baseAreas[workoutType as keyof typeof baseAreas] || [];

	// Add top deficit areas
	deficits.slice(0, 2).forEach(deficit => {
		if (!focus.includes(deficit.muscleGroup)) {
			focus.push(deficit.muscleGroup);
		}
	});

	return focus;
}
