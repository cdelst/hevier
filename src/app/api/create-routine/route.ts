import { NextRequest, NextResponse } from 'next/server';
import { getHevyExerciseId as getExerciseId } from '../../lib/exercise-mapping.js';
import { roundToGymWeight, lbsToKg } from '../../lib/weight-utils.js';

/**
 * API endpoint to create Hevy routines from UI suggestions
 * This bridges the UI components to the routine creation logic
 */
export async function POST(request: NextRequest) {
	try {
		const { suggestion, dryRun = false } = await request.json();

		if (!suggestion) {
			return NextResponse.json(
				{ success: false, error: 'Suggestion data is required' },
				{ status: 400 }
			);
		}

		console.log(`🏋️ Creating ${dryRun ? '(DRY RUN)' : ''} routine: ${suggestion.workoutType} for ${suggestion.date}`);

		// Get API token from environment
		const apiToken = process.env.HEVY_API_TOKEN;
		if (!apiToken) {
			return NextResponse.json(
				{ success: false, error: 'HEVY_API_TOKEN not configured' },
				{ status: 500 }
			);
		}

		// Convert suggestion format to Hevy API format with progressive sets
		const routinePayload = {
			routine: {
				title: `${suggestion.date} - ${suggestion.workoutType}`,
				exercises: suggestion.exercises.map((exercise: any, index: number) => {
					const exerciseId = getExerciseId(exercise.exerciseName);
					if (!exerciseId) return null; // Skip unmapped exercises

					// Use progressive sets if available, otherwise create uniform sets
					let sets;
					if (exercise.progressiveSets && exercise.progressiveSets.length > 0) {
						// Progressive sets with calculated weights and reps  
						sets = exercise.progressiveSets.map((progressiveSet: any) => ({
							type: "normal",
							// Round to practical gym increments (lbs) then convert to kg for Hevy API
							weight_kg: lbsToKg(roundToGymWeight(progressiveSet.suggestedWeight)),
							reps: progressiveSet.targetReps,
							// Note: RPE and rest time can't be set in routine templates, only actual workouts
						}));
					} else {
						// Fallback to uniform sets for exercises without strength data
						sets = Array.from({ length: exercise.suggestedSets }, (_, setIndex) => ({
							type: "normal",
							weight_kg: null, // User will need to set weight manually
							reps: exercise.suggestedReps.min + Math.floor((exercise.suggestedReps.max - exercise.suggestedReps.min) * setIndex / (exercise.suggestedSets - 1)) || exercise.suggestedReps.min
						}));
					}

					return {
						exercise_template_id: exerciseId,
						superset_id: null,
						rest_seconds: exercise.progressiveSets?.[0]?.restSeconds || exercise.restTime || 120,
						sets
					};
				}).filter((ex: any) => ex !== null), // Filter out unmapped exercises
				folder_id: null
			}
		};

		console.log(`📝 Routine payload prepared with ${routinePayload.routine.exercises.length} exercises`);

		if (dryRun) {
			// Return the payload without making the API call
			return NextResponse.json({
				success: true,
				dryRun: true,
				payload: routinePayload,
				message: `DRY RUN: Routine "${routinePayload.routine.title}" would be created with ${routinePayload.routine.exercises.length} exercises`
			});
		}

		// Make actual API call to create routine in Hevy
		const response = await fetch('https://api.hevyapp.com/v1/routines', {
			method: 'POST',
			headers: {
				'api-key': apiToken,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(routinePayload)
		});

		if (!response.ok) {
			const errorText = await response.text();
			console.error(`❌ Hevy API error: ${response.status} ${response.statusText} - ${errorText}`);

			return NextResponse.json({
				success: false,
				error: `Failed to create routine in Hevy: ${response.status} ${response.statusText}`,
				details: errorText
			}, { status: response.status });
		}

		const result = await response.json();
		console.log(`✅ Routine created successfully: ${result.id || 'Unknown ID'}`);

		return NextResponse.json({
			success: true,
			routineId: result.id,
			title: routinePayload.routine.title,
			exerciseCount: routinePayload.routine.exercises.length,
			message: `Routine "${routinePayload.routine.title}" created successfully in Hevy!`
		});

	} catch (error) {
		console.error('❌ Create routine API error:', error);

		return NextResponse.json({
			success: false,
			error: 'Failed to create routine',
			message: error instanceof Error ? error.message : 'Unknown error'
		}, { status: 500 });
	}
}

// Handle preflight CORS requests
export async function OPTIONS() {
	return NextResponse.json(
		{ message: 'Routine creation API ready' },
		{ status: 200 }
	);
}
