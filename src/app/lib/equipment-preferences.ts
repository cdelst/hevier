import { EquipmentType, EquipmentPreferences, MuscleGroup } from '../types/index.js';

/**
 * Equipment preference service for intelligent exercise selection
 */

// Exercise to equipment mapping for better exercise selection
export const EXERCISE_EQUIPMENT_MAP: Record<string, { equipment: EquipmentType[], muscleGroups: MuscleGroup[] }> = {
	// PUSH - Chest Movements
	'bench press': { equipment: ['BARBELL'], muscleGroups: ['CHEST', 'TRICEPS', 'SHOULDERS'] },
	'dumbbell bench press': { equipment: ['DUMBBELL'], muscleGroups: ['CHEST', 'TRICEPS', 'SHOULDERS'] },
	'dumbbell flyes': { equipment: ['DUMBBELL'], muscleGroups: ['CHEST'] },
	'incline bench press': { equipment: ['BARBELL'], muscleGroups: ['CHEST', 'SHOULDERS', 'TRICEPS'] },
	'incline dumbbell press': { equipment: ['DUMBBELL'], muscleGroups: ['CHEST', 'SHOULDERS', 'TRICEPS'] },
	'decline bench press': { equipment: ['BARBELL'], muscleGroups: ['CHEST', 'TRICEPS'] },
	'decline dumbbell press': { equipment: ['DUMBBELL'], muscleGroups: ['CHEST', 'TRICEPS'] },
	'dumbbell pullover': { equipment: ['DUMBBELL'], muscleGroups: ['CHEST', 'BACK'] },
	'chest dips': { equipment: ['BODYWEIGHT'], muscleGroups: ['CHEST', 'TRICEPS'] },
	'push ups': { equipment: ['BODYWEIGHT'], muscleGroups: ['CHEST', 'TRICEPS', 'SHOULDERS'] },
	'cable chest fly': { equipment: ['CABLE'], muscleGroups: ['CHEST'] },
	'cable chest press': { equipment: ['CABLE'], muscleGroups: ['CHEST', 'TRICEPS', 'SHOULDERS'] },
	'incline push ups': { equipment: ['BODYWEIGHT'], muscleGroups: ['CHEST', 'SHOULDERS', 'TRICEPS'] },
	'decline push ups': { equipment: ['BODYWEIGHT'], muscleGroups: ['CHEST', 'TRICEPS'] },

	// PUSH - Shoulder Movements  
	'overhead press': { equipment: ['BARBELL'], muscleGroups: ['SHOULDERS', 'TRICEPS'] },
	'dumbbell shoulder press': { equipment: ['DUMBBELL'], muscleGroups: ['SHOULDERS', 'TRICEPS'] },
	'dumbbell lateral raise': { equipment: ['DUMBBELL'], muscleGroups: ['SHOULDERS'] },
	'dumbbell front raise': { equipment: ['DUMBBELL'], muscleGroups: ['SHOULDERS'] },
	'dumbbell rear delt fly': { equipment: ['DUMBBELL'], muscleGroups: ['SHOULDERS'] },
	'arnold press': { equipment: ['DUMBBELL'], muscleGroups: ['SHOULDERS', 'TRICEPS'] },
	'seated dumbbell press': { equipment: ['DUMBBELL'], muscleGroups: ['SHOULDERS', 'TRICEPS'] },
	'cable lateral raise': { equipment: ['CABLE'], muscleGroups: ['SHOULDERS'] },
	'cable rear delt fly': { equipment: ['CABLE'], muscleGroups: ['SHOULDERS'] },
	'cable shoulder press': { equipment: ['CABLE'], muscleGroups: ['SHOULDERS', 'TRICEPS'] },
	'cable front raise': { equipment: ['CABLE'], muscleGroups: ['SHOULDERS'] },
	'cable upright row': { equipment: ['CABLE'], muscleGroups: ['SHOULDERS'] },

	// PUSH - Tricep Movements
	'close grip bench press': { equipment: ['BARBELL'], muscleGroups: ['TRICEPS', 'CHEST'] },
	'dumbbell tricep extension': { equipment: ['DUMBBELL'], muscleGroups: ['TRICEPS'] },
	'overhead dumbbell extension': { equipment: ['DUMBBELL'], muscleGroups: ['TRICEPS'] },
	'tricep dips': { equipment: ['BODYWEIGHT'], muscleGroups: ['TRICEPS'] },
	'dips': { equipment: ['BODYWEIGHT'], muscleGroups: ['TRICEPS', 'CHEST'] },
	'diamond push ups': { equipment: ['BODYWEIGHT'], muscleGroups: ['TRICEPS', 'CHEST'] },
	'cable tricep pushdown': { equipment: ['CABLE'], muscleGroups: ['TRICEPS'] },
	'cable overhead tricep extension': { equipment: ['CABLE'], muscleGroups: ['TRICEPS'] },
	'cable tricep kickback': { equipment: ['CABLE'], muscleGroups: ['TRICEPS'] },

	// PULL - Back Movements
	'barbell row': { equipment: ['BARBELL'], muscleGroups: ['BACK', 'BICEPS'] },
	'dumbbell row': { equipment: ['DUMBBELL'], muscleGroups: ['BACK', 'BICEPS'] },
	'single arm dumbbell row': { equipment: ['DUMBBELL'], muscleGroups: ['BACK', 'BICEPS'] },
	'chest supported dumbbell row': { equipment: ['DUMBBELL'], muscleGroups: ['BACK', 'BICEPS'] },
	'dumbbell reverse fly': { equipment: ['DUMBBELL'], muscleGroups: ['BACK', 'SHOULDERS'] },
	'pull ups': { equipment: ['BODYWEIGHT'], muscleGroups: ['BACK', 'BICEPS'] },
	'chin ups': { equipment: ['BODYWEIGHT'], muscleGroups: ['BACK', 'BICEPS'] },
	'lat pulldown': { equipment: ['CABLE'], muscleGroups: ['BACK', 'BICEPS'] },
	'cable row': { equipment: ['CABLE'], muscleGroups: ['BACK', 'BICEPS'] },
	'face pull': { equipment: ['CABLE'], muscleGroups: ['BACK', 'SHOULDERS'] },

	// PULL - Bicep Movements
	'barbell curl': { equipment: ['BARBELL'], muscleGroups: ['BICEPS'] },
	'dumbbell curl': { equipment: ['DUMBBELL'], muscleGroups: ['BICEPS'] },
	'hammer curl': { equipment: ['DUMBBELL'], muscleGroups: ['BICEPS', 'FOREARMS'] },
	'concentration curl': { equipment: ['DUMBBELL'], muscleGroups: ['BICEPS'] },
	'alternating dumbbell curl': { equipment: ['DUMBBELL'], muscleGroups: ['BICEPS'] },
	'cable curl': { equipment: ['CABLE'], muscleGroups: ['BICEPS'] },

	// LEGS - Quad Dominant
	'squat': { equipment: ['BARBELL'], muscleGroups: ['QUADS', 'GLUTES'] },
	'goblet squat': { equipment: ['DUMBBELL'], muscleGroups: ['QUADS', 'GLUTES'] },
	'dumbbell squat': { equipment: ['DUMBBELL'], muscleGroups: ['QUADS', 'GLUTES'] },
	'bulgarian split squat': { equipment: ['DUMBBELL'], muscleGroups: ['QUADS', 'GLUTES'] },
	'dumbbell lunge': { equipment: ['DUMBBELL'], muscleGroups: ['QUADS', 'GLUTES'] },
	'walking dumbbell lunge': { equipment: ['DUMBBELL'], muscleGroups: ['QUADS', 'GLUTES'] },
	'dumbbell step up': { equipment: ['DUMBBELL'], muscleGroups: ['QUADS', 'GLUTES'] },
	'leg press': { equipment: ['MACHINE'], muscleGroups: ['QUADS', 'GLUTES'] },

	// LEGS - Hip Dominant  
	'deadlift': { equipment: ['BARBELL'], muscleGroups: ['HAMSTRINGS', 'GLUTES', 'BACK'] },
	'romanian deadlift': { equipment: ['BARBELL'], muscleGroups: ['HAMSTRINGS', 'GLUTES'] },
	'dumbbell deadlift': { equipment: ['DUMBBELL'], muscleGroups: ['HAMSTRINGS', 'GLUTES'] },
	'dumbbell romanian deadlift': { equipment: ['DUMBBELL'], muscleGroups: ['HAMSTRINGS', 'GLUTES'] },
	'single leg dumbbell deadlift': { equipment: ['DUMBBELL'], muscleGroups: ['HAMSTRINGS', 'GLUTES'] },
	'dumbbell sumo deadlift': { equipment: ['DUMBBELL'], muscleGroups: ['HAMSTRINGS', 'GLUTES'] },

	// LEGS - Calves
	'calf raise': { equipment: ['BODYWEIGHT'], muscleGroups: ['CALVES'] },
	'dumbbell calf raise': { equipment: ['DUMBBELL'], muscleGroups: ['CALVES'] },
	'seated calf raise': { equipment: ['DUMBBELL'], muscleGroups: ['CALVES'] },

	// Accessory Movements
	'dumbbell shrug': { equipment: ['DUMBBELL'], muscleGroups: ['NECK'] },
	'farmer walk': { equipment: ['DUMBBELL'], muscleGroups: ['FOREARMS', 'NECK'] },
	'dumbbell wrist curl': { equipment: ['DUMBBELL'], muscleGroups: ['FOREARMS'] },
	'plank': { equipment: ['BODYWEIGHT'], muscleGroups: ['ABS'] },
	'russian twist': { equipment: ['BODYWEIGHT'], muscleGroups: ['ABS'] },
	'dumbbell russian twist': { equipment: ['DUMBBELL'], muscleGroups: ['ABS'] }
};

/**
 * Get equipment preferences (updated to use user's preferred array format)
 */
export function getDefaultEquipmentPreferences(): EquipmentPreferences {
	return {
		availableEquipment: ['BARBELL', 'DUMBBELL', 'CABLE', 'MACHINE', 'BODYWEIGHT'],
		pushMovements: ['CABLE', 'DUMBBELL', 'BODYWEIGHT'], // User preference: cable, dumbbell, bodyweight for push
		pullMovements: ['CABLE', 'DUMBBELL', 'BARBELL', 'MACHINE', 'BODYWEIGHT'], // Good for pull movements
		legMovements: ['BARBELL', 'DUMBBELL', 'MACHINE'], // Mixed for legs
		preferCompound: true,
		preferUnilateral: true, // Dumbbells excel at unilateral work
		preferFreeWeights: true
	};
}

/**
 * Get dumbbell alternatives for common barbell push exercises
 */
export function getDumbbellAlternatives(exercise: string): string[] {
	const alternatives: Record<string, string[]> = {
		'bench press': ['dumbbell bench press', 'dumbbell flyes'],
		'incline bench press': ['incline dumbbell press', 'incline dumbbell flyes'],
		'decline bench press': ['decline dumbbell press'],
		'overhead press': ['dumbbell shoulder press', 'seated dumbbell press', 'arnold press'],
		'close grip bench press': ['dumbbell tricep extension', 'overhead dumbbell extension'],
		'barbell row': ['dumbbell row', 'single arm dumbbell row', 'chest supported dumbbell row'],
		'barbell curl': ['dumbbell curl', 'hammer curl', 'alternating dumbbell curl'],
		'squat': ['goblet squat', 'dumbbell squat', 'bulgarian split squat'],
		'deadlift': ['dumbbell deadlift', 'dumbbell romanian deadlift'],
		'romanian deadlift': ['dumbbell romanian deadlift', 'single leg dumbbell deadlift']
	};

	return alternatives[exercise.toLowerCase()] || [];
}

/**
 * Filter exercises based on equipment preferences (now supports arrays)
 */
export function filterExercisesByEquipment(
	exercises: string[],
	preferences: EquipmentPreferences,
	movementType: 'PUSH' | 'PULL' | 'LEGS'
): string[] {
	const movementPreference = movementType === 'PUSH' ? preferences.pushMovements :
		movementType === 'PULL' ? preferences.pullMovements :
			preferences.legMovements;

	if (movementPreference === 'ANY') {
		return exercises;
	}

	if (movementPreference === 'MIXED') {
		return exercises; // Include all exercises
	}

	// Handle array of preferred equipment types
	const preferredEquipment = Array.isArray(movementPreference) ? movementPreference : [movementPreference];

	const filtered = exercises.filter(exercise => {
		const equipmentInfo = EXERCISE_EQUIPMENT_MAP[exercise.toLowerCase()];
		if (!equipmentInfo) return true; // Include unknown exercises

		// Check if exercise uses any of the preferred equipment types
		return equipmentInfo.equipment.some(equipment =>
			preferredEquipment.includes(equipment)
		);
	});

	// If filtering leaves us with no exercises, fall back to original list
	return filtered.length > 0 ? filtered : exercises;
}

/**
 * Get equipment type for an exercise
 */
export function getEquipmentForExercise(exerciseName: string): EquipmentType[] {
	const equipmentInfo = EXERCISE_EQUIPMENT_MAP[exerciseName.toLowerCase()];
	return equipmentInfo ? equipmentInfo.equipment : ['BARBELL']; // Default fallback
}

/**
 * Score exercises based on equipment preferences (higher score = better match, now supports arrays)
 */
export function scoreExerciseByEquipment(
	exerciseName: string,
	preferences: EquipmentPreferences,
	movementType: 'PUSH' | 'PULL' | 'LEGS'
): number {
	const equipmentInfo = EXERCISE_EQUIPMENT_MAP[exerciseName.toLowerCase()];
	if (!equipmentInfo) return 0.5; // Neutral score for unknown exercises

	let score = 0.5; // Base score

	const movementPreference = movementType === 'PUSH' ? preferences.pushMovements :
		movementType === 'PULL' ? preferences.pullMovements :
			preferences.legMovements;

	// Handle special cases
	if (movementPreference === 'ANY') {
		score += 0.1; // Slight bonus for any equipment
	} else if (movementPreference === 'MIXED') {
		score += 0.2; // Moderate bonus for mixed equipment
	} else {
		// Handle array of preferred equipment types
		const preferredEquipment = Array.isArray(movementPreference) ? movementPreference : [movementPreference];

		// Calculate equipment preference score based on matches AND priority order
		const matchingEquipment = equipmentInfo.equipment.filter(equipment =>
			preferredEquipment.includes(equipment)
		);

		if (matchingEquipment.length > 0) {
			// Base equipment bonus (0.3 for any match)
			score += 0.3;

			// Priority bonus based on order in preference array (earlier = higher bonus)
			let priorityBonus = 0;
			matchingEquipment.forEach(equipment => {
				const priorityIndex = preferredEquipment.indexOf(equipment);
				if (priorityIndex !== -1) {
					// First choice gets +0.2, second gets +0.15, third gets +0.1, etc.
					const indexBonus = Math.max(0.2 - (priorityIndex * 0.05), 0.05);
					priorityBonus = Math.max(priorityBonus, indexBonus);
				}
			});
			score += priorityBonus;

			// Additional bonus for multiple matching equipment types (up to 0.1 more)
			if (matchingEquipment.length > 1) {
				score += Math.min(matchingEquipment.length * 0.05, 0.1);
			}

			// Special bonuses for specific equipment combinations
			if (matchingEquipment.includes('DUMBBELL') && matchingEquipment.includes('CABLE')) {
				score += 0.05; // Great combo for varied training
			}

			if (matchingEquipment.includes('BODYWEIGHT') && preferredEquipment.includes('BODYWEIGHT')) {
				score += 0.1; // Extra bonus for bodyweight when preferred
			}
		}
	}

	// Bonus scoring for other preferences
	if (preferences.preferFreeWeights &&
		(equipmentInfo.equipment.includes('DUMBBELL') || equipmentInfo.equipment.includes('BARBELL'))) {
		score += 0.1;
	}

	if (preferences.preferUnilateral && exerciseName.toLowerCase().includes('single')) {
		score += 0.2;
	}

	if (preferences.preferCompound && equipmentInfo.muscleGroups.length >= 2) {
		score += 0.1;
	}

	return Math.min(score, 1.0); // Cap at 1.0
}
