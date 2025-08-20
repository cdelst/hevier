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

// Cache for the latest analysis - in production, use Firebase/database
let cachedAnalysis: any = null;
let cachedWorkouts: any[] = [];
let lastCacheUpdate: string | null = null;

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

		console.log(`🔄 New workout completed: ${webhookData.payload.workoutId}`);
		console.log('📊 Triggering fresh analysis using unified API service...');

		// Call our unified workout API service to get fresh analysis
		const baseUrl = process.env.NODE_ENV === 'production'
			? process.env.NEXT_PUBLIC_BASE_URL || 'https://your-app.com'
			: 'http://localhost:3000';

		const unifiedApiUrl = `${baseUrl}/api/workouts`;

		try {
			const analysisResponse = await fetch(unifiedApiUrl);

			if (analysisResponse.ok) {
				const result = await analysisResponse.json();

				if (result.success) {
					// Cache the fresh analysis
					cachedAnalysis = result.data.analysis;
					cachedWorkouts = result.data.workouts.slice(0, 10);
					lastCacheUpdate = new Date().toISOString();

					console.log(`✅ Fresh analysis complete:`);
					console.log(`   • ${result.data.workouts.length} workouts analyzed`);
					console.log(`   • Overall score: ${result.data.analysis.overallScore}%`);

					// Log key insights
					const deficits = result.data.analysis.muscleGroupVolumes
						.filter((v: any) => v.deficit > 0)
						.sort((a: any, b: any) => b.deficit - a.deficit)
						.slice(0, 3);

					if (deficits.length > 0) {
						console.log('💪 Top volume deficits:',
							deficits.map((d: any) => `${d.muscleGroup}: ${d.deficit} sets`).join(', ')
						);
					}
				} else {
					throw new Error(result.message || 'Unified API returned error');
				}
			} else {
				throw new Error(`Unified API call failed: ${analysisResponse.status}`);
			}
		} catch (error) {
			console.error('❌ Failed to get fresh analysis:', error);
			// Continue with webhook response even if analysis fails
		}

		// In production, you might want to:
		// 1. Save workout to Firebase/database
		// 2. Send push notification to user
		// 3. Update dashboard data in real-time
		// 4. Trigger email summary if significant changes

		// Build response data
		const responseData = {
			status: 'success',
			message: 'Workout processed successfully',
			data: {
				workoutId: webhookData.payload.workoutId,
				analysisUpdated: !!cachedAnalysis,
				cacheUpdatedAt: lastCacheUpdate,
				analysis: cachedAnalysis ? {
					overallScore: cachedAnalysis.overallScore,
					totalWorkouts: cachedAnalysis.totalWorkouts,
					topDeficits: cachedAnalysis.muscleGroupVolumes
						?.filter((v: any) => v.deficit > 0)
						?.sort((a: any, b: any) => b.deficit - a.deficit)
						?.slice(0, 3)
						?.map((d: any) => ({
							muscleGroup: d.muscleGroup,
							deficit: d.deficit,
						})) || [],
				} : null,
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

// GET endpoint to retrieve cached analysis (legacy support - prefer /api/workouts)
export async function GET() {
	try {
		console.log('⚠️ DEPRECATED: Use /api/workouts instead of webhook GET endpoint');

		// If we have cached data, return it
		if (cachedAnalysis && cachedWorkouts.length > 0) {
			const response = {
				currentAnalysis: cachedAnalysis,
				currentSuggestion: null, // TODO: Generate from unified service
				recentWorkouts: cachedWorkouts,
				lastUpdated: lastCacheUpdate || new Date().toISOString(),
				note: 'DEPRECATED: Use /api/workouts for fresh data'
			};

			return NextResponse.json(response);
		}

		// If no cached data, redirect to unified API
		return NextResponse.json(
			{
				error: 'No cached data available',
				message: 'Use /api/workouts for fresh workout analysis',
				redirect: '/api/workouts'
			},
			{ status: 404 }
		);

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
