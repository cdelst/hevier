// Unified workout API service - used by both UI and script
import { NextRequest, NextResponse } from 'next/server';
import { AdvancedWorkoutGenerator, WeeklyAnalysis } from '../../lib/advanced-workout-generator.js';
import { getMuscleGroupsForExercise, getHevyExerciseId } from '../../lib/exercise-mapping.js';
import { getDefaultEquipmentPreferences } from '../../lib/equipment-preferences.js';

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

				// Use comprehensive exercise mapping
				const muscleGroups = getMuscleGroupsForExercise(exerciseId);

				if (exerciseId && muscleGroups.length > 0) {
					console.log(`✅ Mapped exercise "${exerciseName}" (${exerciseId}) to:`, muscleGroups);
				} else if (exerciseId) {
					console.warn(`⚠️ Unknown exercise: "${exerciseName}" (${exerciseId})`);
				}

				// Convert detailed set information
				const detailedSets = (exercise.sets || []).map((set: any) => ({
					reps: set.reps || 0,
					weight: set.weight_kg || 0,
					rpe: set.rpe,
					isWarmup: set.type === 'warmup',
					setType: set.type || 'normal'
				}));

				// Filter working sets for basic counts
				const workingSets = detailedSets.filter((set: any) => !set.isWarmup);

				const totalVolume = workingSets.reduce((sum: number, set: any) => {
					return sum + (set.weight * set.reps);
				}, 0);

				return {
					id: exerciseId,
					name: exerciseName,
					muscleGroups,
					sets: workingSets.length, // Keep for backward compatibility
					detailedSets, // New: preserve all set information
					totalVolume
				};
			});

			return {
				id: hevyWorkout.id,
				date: hevyWorkout.start_time.split('T')[0], // Keep as string for now, convert in script
				exercises,
				totalDuration: Math.round((hevyWorkout.duration_seconds || 0) / 60)
			};
		});

		// Basic analysis (simplified version) - 14-day data for overall analysis
		const totalWorkouts = convertedWorkouts.length;
		const muscleGroupVolumes = calculateBasicVolumes(convertedWorkouts);
		const overallScore = calculateBasicScore(muscleGroupVolumes);

		// Calculate 7-day muscle group volumes specifically for the completion status chart
		const sevenDaysAgo = new Date();
		sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
		sevenDaysAgo.setHours(0, 0, 0, 0);

		const last7DaysWorkouts = convertedWorkouts.filter(workout => {
			const workoutDate = new Date(workout.date);
			return workoutDate >= sevenDaysAgo;
		});

		const muscleGroupVolumes7Day = calculateBasicVolumes(last7DaysWorkouts);

		console.log(`📊 7-day muscle group analysis: ${last7DaysWorkouts.length} workouts from last 7 days`);

		const analysis = {
			totalWorkouts,
			muscleGroupVolumes,
			muscleGroupVolumes7Day, // Add 7-day data for completion chart
			overallScore,
			dateRange: {
				start: cutoffDate.toISOString().split('T')[0],
				end: new Date().toISOString().split('T')[0]
			},
			dateRange7Day: {
				start: sevenDaysAgo.toISOString().split('T')[0],
				end: new Date().toISOString().split('T')[0]
			}
		};

		// Generate workout suggestions using advanced generator with dumbbell preference for push movements
		const equipmentPrefs = getDefaultEquipmentPreferences();
		const advancedGenerator = new AdvancedWorkoutGenerator(equipmentPrefs);

		// Convert simplified workouts to proper WorkoutSession format for the generator
		const workoutSessions = convertedWorkouts.map((workout: any) => ({
			...workout,
			userId: 'current-user',
			date: new Date(workout.date),
			type: 'MIXED', // Will be determined by advanced generator
			isCompleted: true,
			createdAt: new Date(),
			updatedAt: new Date()
		}));

		const weeklyAnalysis: WeeklyAnalysis = {
			muscleGroupVolumes: muscleGroupVolumes.map(volume => ({
				...volume,
				muscleGroup: volume.muscleGroup as any // Type assertion for compatibility
			})),
			overallScore
		};

		const suggestion = advancedGenerator.generateWorkoutSuggestion(workoutSessions, weeklyAnalysis);

		// Convert back to enhanced format for API response (now includes progressive sets)
		const simplifiedSuggestion = {
			workoutType: suggestion.workoutType,
			date: suggestion.targetDate.toISOString().split('T')[0],
			exercises: suggestion.exercises.map(ex => ({
				exerciseName: ex.exerciseName,
				muscleGroups: ex.muscleGroups,
				suggestedSets: ex.suggestedSets,
				suggestedReps: ex.suggestedReps,
				restTime: 120, // Default rest time for API compatibility
				// NEW: Include progressive sets and strength data
				progressiveSets: ex.progressiveSets || [],
				strengthData: ex.strengthData ? {
					estimated1RM: ex.strengthData.estimated1RM,
					confidenceScore: ex.strengthData.confidenceScore,
					recentBest: ex.strengthData.recentBest
				} : null,
				priority: ex.priority,
				reason: ex.reason,
				notes: ex.notes,
				equipment: ex.equipment || [],
				alternatives: ex.alternatives || []
			})),
			estimatedDuration: suggestion.estimatedDuration,
			focusAreas: suggestion.focusMuscleGroups,
			notes: suggestion.notes || `AI-generated ${suggestion.workoutType} workout`
		};

		console.log(`🔄 Analysis complete: ${totalWorkouts} workouts, ${overallScore}% score`);
		console.log(`🎯 Generated suggestion: ${simplifiedSuggestion.workoutType} workout for ${simplifiedSuggestion.date}`);

		return NextResponse.json({
			success: true,
			data: {
				workouts: convertedWorkouts,
				analysis,
				suggestion: simplifiedSuggestion,
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

// Old simple workout generation functions have been removed - now using AdvancedWorkoutGenerator