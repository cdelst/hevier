import { NextRequest, NextResponse } from 'next/server';

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

		// Convert UI suggestion format to Hevy API format
		const routinePayload = {
			routine: {
				title: `${suggestion.date} - ${suggestion.workoutType} (Hevier AI)`,
				exercises: suggestion.exercises.map((exercise: any, index: number) => ({
					exercise_template_id: getHevyExerciseId(exercise.exerciseName),
					superset_id: null,
					rest_seconds: getRestTime(exercise.exerciseName),
					sets: Array.from({ length: exercise.suggestedSets }, () => ({
						type: "normal",
						weight_kg: null,
						reps: exercise.suggestedReps.min
					}))
				})).filter((ex: any) => ex.exercise_template_id), // Filter out unmapped exercises
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

// Basic exercise name to Hevy ID mapping (simplified version)
function getHevyExerciseId(exerciseName: string): string | null {
	const exerciseMap = {
		// Push exercises
		'bench press': '79D0BB3A',
		'incline press': 'C43825EA',
		'overhead press': '7B8D84E8',
		'tricep dips': '2F8D3067',

		// Pull exercises
		'deadlift': '1234ABCD', // Replace with actual ID
		'pull ups': '5678EFGH', // Replace with actual ID
		'barbell row': '9012IJKL', // Replace with actual ID
		'bicep curl': 'MNOP3456', // Replace with actual ID

		// Leg exercises
		'squat': 'QRST7890', // Replace with actual ID
		'leg press': 'UVWX1234', // Replace with actual ID
		'leg curl': 'YZ123456', // Replace with actual ID
		'calf raise': '06745E58',

		// Accessories
		'plank': 'A41C7261',
		'neck curl': 'ABC12345', // Replace with actual ID
		'wrist curl': '1006DF48',
		'treadmill walk': '243710DE',
	};

	const mapped = exerciseMap[exerciseName.toLowerCase() as keyof typeof exerciseMap];

	if (!mapped) {
		console.warn(`⚠️ No Hevy ID found for exercise: ${exerciseName}`);
		return null;
	}

	return mapped;
}

// Get appropriate rest time for exercise type
function getRestTime(exerciseName: string): number {
	const name = exerciseName.toLowerCase();

	// Compound movements = longer rest
	if (name.includes('deadlift') || name.includes('squat') || name.includes('bench')) {
		return 180; // 3 minutes
	}

	// Isolation movements = shorter rest
	if (name.includes('curl') || name.includes('raise') || name.includes('fly')) {
		return 60; // 1 minute
	}

	// Default rest time
	return 120; // 2 minutes
}

// Handle preflight CORS requests
export async function OPTIONS() {
	return NextResponse.json(
		{ message: 'Routine creation API ready' },
		{ status: 200 }
	);
}
