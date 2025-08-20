#!/usr/bin/env node

// Standalone demonstration of Hevier webhook processing
// This shows how the webhook workflow operates without Next.js dependencies

import dotenv from 'dotenv';
import { HevyAPIService } from './src/app/lib/hevy-api.ts';
import { ReferenceChartService } from './src/app/lib/reference-chart.ts';
import { WorkoutAnalyzerService } from './src/app/lib/workout-analyzer.ts';
import { WorkoutSuggestionService } from './src/app/lib/workout-suggestion.ts';

// Load environment variables
dotenv.config({ path: '.env.local' });

console.log('🎯 Hevier Webhook Processing Demo');
console.log('==================================\n');

// Mock webhook payload (what Hevy would send)
const mockWebhookPayload = {
	id: "webhook-demo-" + Date.now(),
	payload: {
		workoutId: "demo-workout-123"
	}
};

console.log('📩 Simulating webhook received from Hevy:');
console.log(JSON.stringify(mockWebhookPayload, null, 2));

async function processWebhookDemo() {
	try {
		// Initialize services (same as webhook endpoint)
		const hevyAPI = new HevyAPIService(process.env.HEVY_API_TOKEN);
		const analyzer = new WorkoutAnalyzerService();
		const suggestionEngine = new WorkoutSuggestionService();

		console.log('\n🔄 Processing webhook payload...');

		// In real webhook, we'd fetch the specific workout from Hevy API
		// For demo, we'll use mock workout data
		console.log(`🔍 Would fetch workout: ${mockWebhookPayload.payload.workoutId}`);

		// Create mock workout session (representing what we'd get from Hevy)
		const mockNewWorkout = {
			id: 'new-workout-' + Date.now(),
			userId: 'user',
			hevyWorkoutId: mockWebhookPayload.payload.workoutId,
			date: new Date(), // Just completed
			type: 'PUSH',
			name: 'Evening Push Session',
			exercises: [
				{
					id: 'ex1',
					name: 'Bench Press',
					muscleGroups: ['CHEST', 'SHOULDERS', 'TRICEPS'],
					sets: [
						{ reps: 8, weight: 80, isWarmup: false },
						{ reps: 8, weight: 85, isWarmup: false },
						{ reps: 6, weight: 90, isWarmup: false },
						{ reps: 5, weight: 95, isWarmup: false },
					]
				},
				{
					id: 'ex2',
					name: 'Incline Dumbbell Press',
					muscleGroups: ['CHEST', 'SHOULDERS'],
					sets: [
						{ reps: 10, weight: 35, isWarmup: false },
						{ reps: 9, weight: 35, isWarmup: false },
						{ reps: 8, weight: 35, isWarmup: false },
					]
				},
				{
					id: 'ex3',
					name: 'Cable Lateral Raise',
					muscleGroups: ['SHOULDERS'],
					sets: [
						{ reps: 15, weight: 12, isWarmup: false },
						{ reps: 12, weight: 15, isWarmup: false },
						{ reps: 10, weight: 18, isWarmup: false },
					]
				}
			],
			duration: 75, // 75 minutes
			isCompleted: true,
			createdAt: new Date(),
			updatedAt: new Date(),
		};

		console.log(`✅ Mock workout processed: ${mockNewWorkout.name}`);
		console.log(`   - Exercises: ${mockNewWorkout.exercises.length}`);
		console.log(`   - Duration: ${mockNewWorkout.duration} minutes`);
		console.log(`   - Type: ${mockNewWorkout.type}`);

		// Fetch existing workout history (from previous API calls)
		console.log('\n🔄 Fetching recent workout history...');

		let recentWorkouts = [];

		try {
			const hevyWorkouts = await hevyAPI.getRecentWorkouts(14); // Last 14 days
			recentWorkouts = hevyWorkouts.map(hw => hevyAPI.convertHevyWorkout(hw));
			console.log(`📊 Found ${recentWorkouts.length} recent workouts from Hevy`);
		} catch (error) {
			console.log(`⚠️  Could not fetch from Hevy API: ${error.message}`);
			console.log('📝 Using mock data for demonstration...');

			// Use mock data for demo
			recentWorkouts = [
				{
					id: 'old-1',
					userId: 'user',
					date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
					type: 'PULL',
					exercises: [
						{
							id: 'ex-old-1',
							name: 'Pull-ups',
							muscleGroups: ['BACK', 'BICEPS'],
							sets: [
								{ reps: 10, isWarmup: false },
								{ reps: 8, isWarmup: false },
								{ reps: 6, isWarmup: false },
							]
						}
					],
					isCompleted: true,
					createdAt: new Date(),
					updatedAt: new Date(),
				}
			];
		}

		// Add the new workout to history
		recentWorkouts.unshift(mockNewWorkout);

		console.log('\n📊 Re-analyzing weekly volume with new workout...');

		// Analyze weekly volume with updated data
		const weeklyAnalysis = analyzer.analyzeWeeklyVolume(recentWorkouts);

		console.log(`\n🎯 Updated Weekly Analysis:`);
		console.log(`   Overall Score: ${weeklyAnalysis.overallScore}/100`);
		console.log(`   Total Workouts: ${weeklyAnalysis.totalWorkouts}`);

		// Show top volume updates
		const significantChanges = weeklyAnalysis.muscleGroupVolumes
			.filter(v => v.actualSets > 0 || v.deficit > 5)
			.sort((a, b) => b.actualSets - a.actualSets)
			.slice(0, 5);

		if (significantChanges.length > 0) {
			console.log('\n💪 Volume Updates:');
			significantChanges.forEach(volume => {
				const status = volume.deficit <= 0 ? '✅' : '⚠️';
				console.log(`   ${status} ${volume.muscleGroup}: ${volume.actualSets}/${volume.targetMin} sets`);
			});
		}

		// Generate updated suggestions
		console.log('\n🔄 Generating updated workout suggestions...');

		const preferences = {
			splitPreference: 'PPL',
			primaryGoal: 'HYPERTROPHY',
			workoutDaysPerWeek: 5
		};

		const newSuggestion = suggestionEngine.generateTodaysSuggestion(
			recentWorkouts,
			preferences
		);

		console.log(`\n🏋️ Next Suggested Workout: ${newSuggestion.workoutType}`);
		console.log(`   Duration: ${newSuggestion.estimatedDuration} minutes`);
		console.log(`   Difficulty: ${newSuggestion.difficultyLevel}`);
		console.log(`   Focus Areas: ${newSuggestion.focusMuscleGroups.slice(0, 3).join(', ')}`);

		if (newSuggestion.exercises.length > 0) {
			console.log('\n📋 Top Exercise Recommendations:');
			newSuggestion.exercises.slice(0, 3).forEach((exercise, i) => {
				const priority = exercise.priority === 'HIGH' ? '🔴' : '🟡';
				console.log(`   ${priority} ${exercise.exerciseName}`);
				console.log(`      ${exercise.suggestedSets} sets × ${exercise.suggestedReps.min}-${exercise.suggestedReps.max} reps`);
				console.log(`      ${exercise.reason}`);
			});
		}

		// Show recommendations
		if (weeklyAnalysis.recommendations.length > 0) {
			console.log('\n🧠 AI Recommendations:');
			weeklyAnalysis.recommendations.slice(0, 3).forEach(rec => {
				console.log(`   • ${rec}`);
			});
		}

		console.log('\n✅ Webhook processing complete!');
		console.log('\n🎯 Summary of what happened:');
		console.log('   1. Received webhook notification from Hevy');
		console.log('   2. Fetched new workout details');
		console.log('   3. Added to workout history');
		console.log('   4. Re-analyzed weekly volume vs targets');
		console.log('   5. Generated updated workout suggestions');
		console.log('   6. Ready to display new recommendations to user');

		return {
			status: 'success',
			analysis: weeklyAnalysis,
			suggestion: newSuggestion,
			workoutProcessed: mockNewWorkout,
		};

	} catch (error) {
		console.error('\n❌ Webhook processing error:', error.message);
		throw error;
	}
}

// Run the demo
processWebhookDemo()
	.then((result) => {
		console.log('\n🎉 Webhook demo completed successfully!');
		console.log(`   Analysis score: ${result.analysis.overallScore}/100`);
		console.log(`   Next workout: ${result.suggestion.workoutType}`);
	})
	.catch((error) => {
		console.error('\n💥 Demo failed:', error.message);
		process.exit(1);
	});
