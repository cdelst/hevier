// Hevy API integration service
import {
	HevyWorkout,
	HevyUserProfile,
	WorkoutSession,
	Exercise,
	ExerciseSet,
	MuscleGroup
} from '@/app/types';

const HEVY_API_BASE = 'https://api.hevyapp.com/v1';

class HevyAPIError extends Error {
	constructor(
		message: string,
		public status?: number,
		public code?: string
	) {
		super(message);
		this.name = 'HevyAPIError';
	}
}

class HevyAPIService {
	private apiToken: string;

	constructor(apiToken?: string) {
		this.apiToken = apiToken || process.env.HEVY_API_TOKEN || '';

		if (!this.apiToken) {
			throw new HevyAPIError('Hevy API token not provided');
		}
	}

	/**
	 * Make authenticated request to Hevy API using API token
	 */
	private async makeAuthenticatedRequest(endpoint: string, options: RequestInit = {}): Promise<Response> {
		const response = await fetch(`${HEVY_API_BASE}${endpoint}`, {
			...options,
			headers: {
				'api-key': this.apiToken, // Assuming header name - may need adjustment based on actual API
				'Content-Type': 'application/json',
				...options.headers,
			},
		});

		if (!response.ok) {
			throw new HevyAPIError(
				`API request failed: ${response.statusText}`,
				response.status
			);
		}

		return response;
	}

	/**
	 * Get user profile from Hevy
	 */
	async getUserProfile(): Promise<HevyUserProfile> {
		const response = await this.makeAuthenticatedRequest('/user/profile');
		return response.json();
	}

	/**
	 * Get user workouts from Hevy
	 */
	async getWorkouts(
		limit: number = 50,
		offset: number = 0,
		startDate?: Date,
		endDate?: Date
	): Promise<HevyWorkout[]> {
		const params = new URLSearchParams({
			limit: limit.toString(),
			offset: offset.toString(),
		});

		if (startDate) {
			params.append('start_date', startDate.toISOString());
		}
		if (endDate) {
			params.append('end_date', endDate.toISOString());
		}

		const response = await this.makeAuthenticatedRequest(
			`/workouts?${params.toString()}`
		);

		const data = await response.json();
		return data.workouts || [];
	}

	/**
	 * Get recent workouts (last 7-14 days)
	 */
	async getRecentWorkouts(days: number = 7): Promise<HevyWorkout[]> {
		const endDate = new Date();
		const startDate = new Date();
		startDate.setDate(startDate.getDate() - days);

		return this.getWorkouts(100, 0, startDate, endDate);
	}

	/**
 * Convert Hevy workout to internal WorkoutSession format
 */
	convertHevyWorkout(hevyWorkout: HevyWorkout): WorkoutSession {
		const exercises: Exercise[] = hevyWorkout.exercises.map(hevyExercise => ({
			id: crypto.randomUUID(),
			hevyExerciseId: hevyExercise.id,
			name: hevyExercise.title,
			muscleGroups: this.inferMuscleGroups(hevyExercise.title), // Will need mapping logic
			sets: hevyExercise.sets.map(set => ({
				reps: set.reps || 0,
				weight: set.weight_kg,
				rpe: set.rpe,
				isWarmup: set.type === 'warmup',
			} as ExerciseSet)),
			notes: hevyExercise.notes,
		}));

		return {
			id: crypto.randomUUID(),
			userId: 'user', // Single user app
			hevyWorkoutId: hevyWorkout.id,
			date: new Date(hevyWorkout.start_time),
			type: this.inferWorkoutType(exercises), // Will need logic to determine type
			name: hevyWorkout.title,
			exercises,
			duration: hevyWorkout.end_time
				? (new Date(hevyWorkout.end_time).getTime() - new Date(hevyWorkout.start_time).getTime()) / 1000 / 60
				: undefined,
			isCompleted: true,
			createdAt: new Date(),
			updatedAt: new Date(),
		};
	}

	/**
	 * Infer muscle groups from exercise name
	 * This is a placeholder - we'll need a proper mapping system
	 */
	private inferMuscleGroups(exerciseName: string): MuscleGroup[] {
		const name = exerciseName.toLowerCase();
		const muscleGroups: MuscleGroup[] = [];

		// Basic keyword matching - this will need to be more sophisticated
		if (name.includes('bench') || name.includes('chest') || name.includes('push up')) {
			muscleGroups.push('CHEST');
		}
		if (name.includes('row') || name.includes('pull') || name.includes('lat')) {
			muscleGroups.push('BACK');
		}
		if (name.includes('squat') || name.includes('leg press')) {
			muscleGroups.push('QUADS');
		}
		if (name.includes('deadlift') || name.includes('rdl')) {
			muscleGroups.push('HAMSTRINGS');
		}
		if (name.includes('shoulder') || name.includes('press') || name.includes('raise')) {
			muscleGroups.push('SHOULDERS');
		}
		if (name.includes('curl') && name.includes('bicep')) {
			muscleGroups.push('BICEPS');
		}
		if (name.includes('tricep') || name.includes('pushdown') || name.includes('dip')) {
			muscleGroups.push('TRICEPS');
		}

		// Default to chest if no matches (shouldn't happen in production)
		return muscleGroups.length > 0 ? muscleGroups : ['CHEST'];
	}

	/**
	 * Infer workout type from exercises
	 * This is a placeholder - we'll need better logic
	 */
	private inferWorkoutType(exercises: Exercise[]): 'PUSH' | 'PULL' | 'LEGS' | 'UPPER' | 'LOWER' | 'FULL_BODY' {
		const muscleGroups = exercises.flatMap(ex => ex.muscleGroups);

		const hasPush = muscleGroups.some(mg => ['CHEST', 'SHOULDERS', 'TRICEPS'].includes(mg));
		const hasPull = muscleGroups.some(mg => ['BACK', 'BICEPS'].includes(mg));
		const hasLegs = muscleGroups.some(mg => ['QUADS', 'HAMSTRINGS', 'GLUTES', 'CALVES'].includes(mg));

		if (hasLegs && !hasPush && !hasPull) return 'LEGS';
		if (hasPush && !hasPull && !hasLegs) return 'PUSH';
		if (hasPull && !hasPush && !hasLegs) return 'PULL';
		if ((hasPush || hasPull) && !hasLegs) return 'UPPER';
		if (hasLegs && !(hasPush && hasPull)) return 'LOWER';

		return 'FULL_BODY';
	}
}

export { HevyAPIError, HevyAPIService };
