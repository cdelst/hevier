// Core data types for Hevier workout tracking application

export type MuscleGroup =
	| 'CHEST'
	| 'BACK'
	| 'SHOULDERS'
	| 'BICEPS'
	| 'TRICEPS'
	| 'FOREARMS'
	| 'ABS'
	| 'NECK'
	| 'QUADS'
	| 'HAMSTRINGS'
	| 'GLUTES'
	| 'CALVES'
	| 'CARDIO';

export type ExerciseTag = 'STRENGTH' | 'HYPERTROPHY' | 'OPTIONAL' | 'CARDIO' | 'WARMUP';

export type WorkoutType = 'PUSH' | 'PULL' | 'LEGS' | 'UPPER' | 'LOWER' | 'FULL_BODY';

export type GoalType = 'STRENGTH' | 'HYPERTROPHY' | 'MIXED';

export type SplitType = 'PPL' | 'UPPER_LOWER' | 'FULL_BODY';

// Reference Chart Types (from reference_cheatsheet.json)
export interface ReferenceExercise {
	name: string;
	example_exercises: string[];
	tag: ExerciseTag;
	rep_range: {
		min?: number;
		max?: number;
		optional?: boolean;
	};
}

export interface ReferenceMuscleGroup {
	sets_per_week: {
		min: number;
		max?: number;
		unit: string;
		note?: string;
	};
	exercises: ReferenceExercise[];
}

export interface ReferenceChart {
	CHART: {
		[key in MuscleGroup]: ReferenceMuscleGroup;
	};
	LEGEND: {
		[key in ExerciseTag]: {
			description: string;
			rep_range: {
				min?: number;
				max?: number;
				optional?: boolean;
			};
			focus: string;
		};
	};
}

// User and Profile Types
export interface UserPreferences {
	primaryGoal: GoalType;
	workoutDaysPerWeek: number; // 3-6 days
	splitPreference: SplitType;
	experienceLevel: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
	availableEquipment: string[]; // e.g., ['barbell', 'dumbbells', 'cables']
}

export interface UserProfile {
	id: string;
	email?: string;
	displayName?: string;
	hevyApiToken?: string;
	preferences: UserPreferences;
	createdAt: Date;
	updatedAt: Date;
	lastHevySync?: Date;
}

// Workout and Exercise Types
export interface ExerciseSet {
	reps: number;
	weight?: number; // in kg or lbs based on user preference
	rpe?: number; // Rate of Perceived Exertion (1-10)
	restTime?: number; // in seconds
	isWarmup?: boolean;
}

export interface Exercise {
	id: string;
	hevyExerciseId?: string;
	name: string;
	muscleGroups: MuscleGroup[];
	referenceCategory?: string; // Maps to reference chart exercise name
	sets: ExerciseSet[];
	notes?: string;
	equipment?: string[];
}

export interface WorkoutSession {
	id: string;
	userId: string;
	hevyWorkoutId?: string;
	date: Date;
	type: WorkoutType;
	name?: string; // e.g., "Push Day A"
	exercises: Exercise[];
	duration?: number; // in minutes
	notes?: string;
	isCompleted: boolean;
	createdAt: Date;
	updatedAt: Date;
}

// Analysis and Suggestion Types
export interface MuscleGroupVolume {
	muscleGroup: MuscleGroup;
	actualSets: number;
	targetMin: number;
	targetMax?: number;
	deficit: number; // negative if over target
	lastWorkedDate?: Date;
	exercisesPerformed: string[];
	priorityScore: number; // 0-100, higher means needs more attention
}

export interface WeeklyAnalysis {
	id: string;
	userId: string;
	weekStart: Date;
	weekEnd: Date;
	totalWorkouts: number;
	muscleGroupVolumes: MuscleGroupVolume[];
	overallScore: number; // 0-100, based on how well targets were met
	recommendations: string[];
	createdAt: Date;
}

export interface ExerciseSuggestion {
	exerciseName: string;
	referenceCategory: string;
	muscleGroups: MuscleGroup[];
	suggestedSets: number;
	suggestedReps: {
		min: number;
		max: number;
	};
	priority: 'HIGH' | 'MEDIUM' | 'LOW';
	reason: string; // e.g., "Chest volume deficit of 5 sets"
	alternatives?: string[]; // Alternative exercise names
}

export interface WorkoutSuggestion {
	id: string;
	userId: string;
	targetDate: Date;
	workoutType: WorkoutType;
	estimatedDuration: number; // in minutes
	exercises: ExerciseSuggestion[];
	focusMuscleGroups: MuscleGroup[];
	difficultyLevel: 'LIGHT' | 'MODERATE' | 'INTENSE';
	notes?: string;
	isAccepted?: boolean;
	createdAt: Date;
}

// Hevy Integration Types
export interface HevyWorkout {
	id: string;
	title: string;
	description?: string;
	start_time: string; // ISO date string
	end_time?: string; // ISO date string
	exercises: HevyExercise[];
}

export interface HevyExercise {
	id: string;
	title: string;
	notes?: string;
	exercise_template_id?: string;
	superset_id?: string;
	sets: HevySet[];
}

export interface HevySet {
	index: number;
	type: 'normal' | 'warmup' | 'failure' | 'drop';
	weight_kg?: number;
	reps?: number;
	distance_meters?: number;
	duration_seconds?: number;
	rpe?: number;
}

// API Response Types
export interface HevyUserProfile {
	id: string;
	username: string;
	email?: string;
	created_at: string;
}

// Exercise Mapping Types (for connecting Hevy exercises to reference chart)
export interface ExerciseMapping {
	id: string;
	hevyExerciseName: string;
	referenceCategory: string;
	muscleGroups: MuscleGroup[];
	confidence: number; // 0-1, how confident we are in this mapping
	isUserConfirmed: boolean;
	createdAt: Date;
}

// Dashboard and UI Types
export interface DashboardData {
	user: UserProfile;
	currentWeekAnalysis: WeeklyAnalysis;
	todaysSuggestion?: WorkoutSuggestion;
	recentWorkouts: WorkoutSession[];
	upcomingWorkouts: WorkoutSuggestion[];
	weeklyProgress: {
		completedWorkouts: number;
		targetWorkouts: number;
		volumeCompletion: number; // percentage
	};
}

export interface NotificationSettings {
	workoutReminders: boolean;
	suggestionUpdates: boolean;
	weeklyReports: boolean;
	pushTime?: string; // HH:MM format
}

// Firebase Firestore collection names as constants
export const COLLECTIONS = {
	USERS: 'users',
	WORKOUTS: 'workouts',
	WEEKLY_ANALYSIS: 'weeklyAnalysis',
	WORKOUT_SUGGESTIONS: 'workoutSuggestions',
	EXERCISE_MAPPINGS: 'exerciseMappings',
} as const;
