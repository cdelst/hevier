// Example usage of the Hevier workout tracking and suggestion system
// This demonstrates how all the services work together

import dotenv from 'dotenv';
import { HevyAPIService } from './src/app/lib/hevy-api.ts';
import { ReferenceChartService } from './src/app/lib/reference-chart.ts';
import { WorkoutAnalyzerService } from './src/app/lib/workout-analyzer.ts';
import { WorkoutSuggestionService } from './src/app/lib/workout-suggestion.ts';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function exampleWorkflow() {
	// Initialize services
	const hevyAPI = new HevyAPIService(process.env.HEVY_API_TOKEN);
	const referenceChart = new ReferenceChartService();
	const analyzer = new WorkoutAnalyzerService();
	const suggestionEngine = new WorkoutSuggestionService();

	try {
		console.log('🔄 Fetching recent workouts from Hevy...');

		// 1. Fetch recent workouts from Hevy API
		const hevyWorkouts = await hevyAPI.getRecentWorkouts(7); // Last 7 days

		console.log(`✅ Found ${hevyWorkouts.length} workouts from Hevy`);

		// 2. Convert Hevy workouts to internal format
		const workoutSessions = hevyWorkouts.map(hevyWorkout =>
			hevyAPI.convertHevyWorkout(hevyWorkout)
		);

		console.log('🔄 Analyzing workout volume against reference targets...');

		// 3. Analyze weekly volume
		const weeklyAnalysis = analyzer.analyzeWeeklyVolume(workoutSessions);

		console.log(`📊 Weekly Analysis Results:`);
		console.log(`- Total Workouts: ${weeklyAnalysis.totalWorkouts}`);
		console.log(`- Overall Score: ${weeklyAnalysis.overallScore}/100`);
		console.log(`- Recommendations: ${weeklyAnalysis.recommendations.join(', ')}`);

		// 4. Show muscle group breakdowns
		console.log('\n💪 Muscle Group Volume Analysis:');
		weeklyAnalysis.muscleGroupVolumes
			.filter(volume => volume.deficit !== 0)
			.sort((a, b) => b.priorityScore - a.priorityScore)
			.slice(0, 5)
			.forEach(volume => {
				const status = volume.deficit > 0 ? '❌' : '✅';
				console.log(`${status} ${volume.muscleGroup}: ${volume.actualSets}/${volume.targetMin} sets (${volume.deficit > 0 ? '+' + Math.abs(volume.deficit) : volume.deficit} deficit)`);
			});

		// 5. Get recovery status for planning
		const recoveryStatus = analyzer.predictRecoveryStatus(workoutSessions);
		console.log('\n🔄 Recovery Status:');
		recoveryStatus
			.filter(status => status.recommendedAction !== 'REST')
			.slice(0, 5)
			.forEach(status => {
				console.log(`- ${status.muscleGroup}: ${status.recoveryStatus} (${status.daysSinceLastWorked}d ago) → ${status.recommendedAction}`);
			});

		// 6. Generate today's workout suggestion
		console.log('\n🏋️ Generating today\'s workout suggestion...');

		const preferences = {
			splitPreference: 'PPL', // Push/Pull/Legs
			primaryGoal: 'HYPERTROPHY',
			workoutDaysPerWeek: 5
		};

		const todaysSuggestion = suggestionEngine.generateTodaysSuggestion(
			workoutSessions,
			preferences
		);

		console.log(`\n🎯 Today's Suggested Workout: ${todaysSuggestion.workoutType}`);
		console.log(`⏱️  Estimated Duration: ${todaysSuggestion.estimatedDuration} minutes`);
		console.log(`💪 Focus Areas: ${todaysSuggestion.focusMuscleGroups.join(', ')}`);
		console.log(`🔥 Difficulty: ${todaysSuggestion.difficultyLevel}`);
		console.log(`📝 Notes: ${todaysSuggestion.notes}`);

		console.log('\n📋 Suggested Exercises:');
		todaysSuggestion.exercises.forEach((exercise, index) => {
			const priority = exercise.priority === 'HIGH' ? '🔴' : exercise.priority === 'MEDIUM' ? '🟡' : '🟢';
			console.log(`${priority} ${index + 1}. ${exercise.exerciseName}`);
			console.log(`   ${exercise.suggestedSets} sets × ${exercise.suggestedReps.min}-${exercise.suggestedReps.max} reps`);
			console.log(`   Reason: ${exercise.reason}`);
			if (exercise.alternatives && exercise.alternatives.length > 0) {
				console.log(`   Alternatives: ${exercise.alternatives.join(', ')}`);
			}
			console.log('');
		});

		// 7. Show multiple workout options
		console.log('🔄 Generating workout options...');
		const workoutOptions = suggestionEngine.generateWorkoutOptions(workoutSessions, preferences);

		console.log(`\n🎯 Available Workout Options:`);
		workoutOptions.forEach((option, index) => {
			console.log(`${index + 1}. ${option.workoutType} (${option.difficultyLevel}) - ${option.estimatedDuration}min`);
			console.log(`   Focus: ${option.focusMuscleGroups.slice(0, 3).join(', ')}`);
			console.log(`   Exercises: ${option.exercises.length}`);
			console.log('');
		});

		// 8. Demo reference chart utilities
		console.log('📚 Reference Chart Examples:');
		const chestTargets = referenceChart.getWeeklyTargets('CHEST');
		console.log(`- Chest weekly target: ${chestTargets.min}-${chestTargets.max || chestTargets.min} sets`);

		const shoulderExercises = referenceChart.getExercisesForMuscleGroup('SHOULDERS', 'STRENGTH');
		console.log(`- Shoulder strength exercises: ${shoulderExercises.map(ex => ex.name).join(', ')}`);

		const exerciseMuscles = referenceChart.findMuscleGroupsForExercise('bench press');
		console.log(`- "Bench press" targets: ${exerciseMuscles.join(', ')}`);

	} catch (error) {
		console.error('❌ Error in workflow:', error.message);

		// Demo with mock data if API fails
		console.log('\n🔄 Running demo with mock data...');

		const mockWorkouts = [
			{
				id: '1',
				userId: 'user',
				hevyWorkoutId: 'hevy_1',
				date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
				type: 'PUSH',
				name: 'Push Day',
				exercises: [
					{
						id: 'ex1',
						name: 'Bench Press',
						muscleGroups: ['CHEST', 'SHOULDERS', 'TRICEPS'],
						sets: [
							{ reps: 8, weight: 80 },
							{ reps: 8, weight: 80 },
							{ reps: 6, weight: 85 },
						]
					}
				],
				isCompleted: true,
				createdAt: new Date(),
				updatedAt: new Date(),
			}
		];

		const mockAnalysis = analyzer.analyzeWeeklyVolume(mockWorkouts);
		console.log(`Mock Analysis: Score ${mockAnalysis.overallScore}/100`);

		const mockSuggestion = suggestionEngine.generateTodaysSuggestion(mockWorkouts, preferences);
		console.log(`Mock Suggestion: ${mockSuggestion.workoutType} with ${mockSuggestion.exercises.length} exercises`);
	}
}

// Run the example
if (import.meta.url === `file://${process.argv[1]}`) {
	exampleWorkflow()
		.then(() => console.log('\n✅ Example workflow completed!'))
		.catch(error => console.error('❌ Workflow failed:', error));
}

export { exampleWorkflow };
