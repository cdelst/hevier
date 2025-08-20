// Hevy webhook endpoint for real-time workout notifications
import { NextRequest, NextResponse } from 'next/server';
import { HevyAPIService } from '@/app/lib/hevy-api';
import { WorkoutAnalyzerService } from '@/app/lib/workout-analyzer';
import { WorkoutSuggestionService } from '@/app/lib/workout-suggestion';

interface HevyWebhookPayload {
	id: string;
	payload: {
		workoutId: string;
	};
}

// In-memory storage for demo - in production, use Firebase/database
let recentWorkouts: any[] = [];
let lastAnalysis: any = null;
let lastSuggestion: any = null;

export async function POST(request: NextRequest) {
	try {
		console.log('🔔 Webhook received from Hevy');

		// Parse the webhook payload
		const webhookData: HevyWebhookPayload = await request.json();

		console.log('📦 Webhook payload:', {
			id: webhookData.id,
			workoutId: webhookData.payload.workoutId,
		});

		// Validate webhook payload
		if (!webhookData.payload?.workoutId) {
			console.error('❌ Invalid webhook payload - missing workoutId');
			return NextResponse.json(
				{ error: 'Invalid payload' },
				{ status: 400 }
			);
		}

		// Initialize services
		const hevyAPI = new HevyAPIService(process.env.HEVY_API_TOKEN);
		const analyzer = new WorkoutAnalyzerService();
		const suggestionEngine = new WorkoutSuggestionService();

		// Fetch the specific workout that was just completed
		console.log(`🔄 Fetching workout details for: ${webhookData.payload.workoutId}`);

		// Note: This assumes Hevy API has an endpoint to get a specific workout
		// We might need to adjust this based on actual Hevy API structure
		const response = await fetch(
			`https://api.hevyapp.com/v1/workouts/${webhookData.payload.workoutId}`,
			{
				headers: {
					'api-key': process.env.HEVY_API_TOKEN || '',
				},
			}
		);

		if (!response.ok) {
			console.error('❌ Failed to fetch workout from Hevy API');
			return NextResponse.json(
				{ error: 'Failed to fetch workout' },
				{ status: 500 }
			);
		}

		const hevyWorkout = await response.json();
		console.log(`✅ Fetched workout: ${hevyWorkout.title}`);

		// Convert to internal format
		const workoutSession = hevyAPI.convertHevyWorkout(hevyWorkout);

		// Add to our workout history (in production, save to database)
		recentWorkouts.unshift(workoutSession);

		// Keep only last 30 workouts for analysis
		if (recentWorkouts.length > 30) {
			recentWorkouts = recentWorkouts.slice(0, 30);
		}

		console.log('🔄 Re-analyzing weekly volume with new workout...');

		// Re-analyze weekly volume with the new workout
		const weeklyAnalysis = analyzer.analyzeWeeklyVolume(recentWorkouts);
		lastAnalysis = weeklyAnalysis;

		console.log(`📊 New analysis: ${weeklyAnalysis.overallScore}/100 score`);

		// Generate updated workout suggestions
		const preferences = {
			splitPreference: 'PPL' as const,
			primaryGoal: 'HYPERTROPHY' as const,
			workoutDaysPerWeek: 5,
		};

		const newSuggestion = suggestionEngine.generateTodaysSuggestion(
			recentWorkouts,
			preferences
		);
		lastSuggestion = newSuggestion;

		console.log(`🎯 Updated suggestion: ${newSuggestion.workoutType} workout`);

		// Log key insights
		const deficits = weeklyAnalysis.muscleGroupVolumes
			.filter(v => v.deficit > 0)
			.sort((a, b) => b.deficit - a.deficit)
			.slice(0, 3);

		if (deficits.length > 0) {
			console.log('💪 Top volume deficits:',
				deficits.map(d => `${d.muscleGroup}: ${d.deficit} sets`).join(', ')
			);
		}

		// In production, you might want to:
		// 1. Save workout to Firebase/database
		// 2. Send push notification to user
		// 3. Update dashboard data in real-time
		// 4. Trigger email summary if significant changes

		const responseData = {
			status: 'success',
			message: 'Workout processed successfully',
			data: {
				workoutId: webhookData.payload.workoutId,
				workoutType: workoutSession.type,
				exerciseCount: workoutSession.exercises.length,
				analysis: {
					overallScore: weeklyAnalysis.overallScore,
					totalWorkouts: weeklyAnalysis.totalWorkouts,
					topDeficits: deficits.map(d => ({
						muscleGroup: d.muscleGroup,
						deficit: d.deficit,
					})),
				},
				nextSuggestion: {
					workoutType: newSuggestion.workoutType,
					difficulty: newSuggestion.difficultyLevel,
					duration: newSuggestion.estimatedDuration,
				},
			},
		};

		console.log('✅ Webhook processing complete');

		// Return 200 OK as required by Hevy
		return NextResponse.json(responseData, { status: 200 });

	} catch (error) {
		console.error('❌ Webhook processing error:', error);

		return NextResponse.json(
			{
				error: 'Internal server error',
				message: error instanceof Error ? error.message : 'Unknown error'
			},
			{ status: 500 }
		);
	}
}

// GET endpoint to retrieve current analysis and suggestions (for dashboard)
export async function GET() {
	try {
		const response = {
			currentAnalysis: lastAnalysis,
			currentSuggestion: lastSuggestion,
			recentWorkouts: recentWorkouts.slice(0, 10), // Last 10 workouts
			lastUpdated: new Date().toISOString(),
		};

		return NextResponse.json(response);

	} catch (error) {
		console.error('❌ GET endpoint error:', error);

		return NextResponse.json(
			{ error: 'Failed to retrieve data' },
			{ status: 500 }
		);
	}
}

// For testing webhook locally
export async function OPTIONS() {
	return NextResponse.json(
		{ message: 'Hevy webhook endpoint ready' },
		{
			status: 200,
			headers: {
				'Allow': 'POST, GET, OPTIONS',
				'Access-Control-Allow-Origin': '*',
				'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
				'Access-Control-Allow-Headers': 'Content-Type',
			},
		}
	);
}
