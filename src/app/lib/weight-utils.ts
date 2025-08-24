/**
 * Weight calculation utilities for practical gym programming (US/Imperial system)
 */

/**
 * Convert pounds to kilograms
 * @param lbs - Weight in pounds
 * @returns Weight in kilograms
 */
export function lbsToKg(lbs: number): number {
	return lbs * 0.453592;
}

/**
 * Convert kilograms to pounds
 * @param kg - Weight in kilograms  
 * @returns Weight in pounds
 */
export function kgToLbs(kg: number): number {
	return kg * 2.20462;
}

/**
 * Round weight to practical US gym increments based on weight ranges
 * This ensures weights are realistic for standard US gym plate systems
 * 
 * Weight Rounding Logic (in pounds):
 * - Under 45 lbs: Round to nearest 2.5 lbs (e.g., 25, 27.5, 30, 32.5, 35 lbs)
 * - 45-135 lbs: Round to nearest 5 lbs (e.g., 45, 50, 55, 60, 65 lbs)  
 * - Over 135 lbs: Round to nearest 10 lbs (e.g., 140, 150, 160, 170 lbs)
 * 
 * @param weight - The raw calculated weight in lbs
 * @returns Rounded weight suitable for US gym use
 */
export function roundToGymWeight(weight: number): number {
	// Handle edge cases
	if (weight <= 0) return 0;

	// Round to practical US gym increments
	if (weight < 45) {
		return Math.round(weight / 2.5) * 2.5; // Round to nearest 2.5 lbs
	} else if (weight < 135) {
		return Math.round(weight / 5) * 5; // Round to nearest 5 lbs
	} else {
		return Math.round(weight / 10) * 10; // Round to nearest 10 lbs
	}
}

/**
 * Format weight for display with appropriate precision
 * @param weight - Weight in lbs
 * @returns Formatted weight string (e.g., "45 lbs", "22.5 lbs")
 */
export function formatWeight(weight: number): string {
	if (weight === 0) return 'Bodyweight';
	if (weight % 1 === 0) {
		return `${weight} lbs`; // Whole numbers without decimal
	} else {
		return `${weight.toFixed(1)} lbs`; // One decimal place for fractional weights
	}
}

/**
 * Calculate plate loading for a given weight (US 45lb barbell system)
 * Useful for displaying how to load the bar
 * @param weight - Total weight in lbs
 * @param barbellWeight - Weight of the barbell (default: 45 lbs)
 * @returns Object with plate breakdown
 */
export function calculatePlateLoading(weight: number, barbellWeight: number = 45): {
	plates: { weight: number; count: number }[];
	perSide: { weight: number; count: number }[];
	totalPlateWeight: number;
} {
	const plateWeight = weight - barbellWeight;
	const perSideWeight = plateWeight / 2;

	// Standard US plate sizes in lbs
	const availablePlates = [45, 35, 25, 10, 5, 2.5];

	const plates: { weight: number; count: number }[] = [];
	const perSide: { weight: number; count: number }[] = [];
	let remainingWeight = perSideWeight;

	for (const plateSize of availablePlates) {
		if (remainingWeight >= plateSize) {
			const count = Math.floor(remainingWeight / plateSize);
			if (count > 0) {
				plates.push({ weight: plateSize, count: count * 2 }); // Total plates
				perSide.push({ weight: plateSize, count }); // Per side
				remainingWeight -= plateSize * count;
			}
		}
	}

	return {
		plates,
		perSide,
		totalPlateWeight: plateWeight
	};
}

/**
 * Validate that a weight is achievable with standard US gym equipment
 * @param weight - Target weight in lbs
 * @param barbellWeight - Weight of barbell (default: 45 lbs)
 * @param minPlateSize - Smallest available plate (default: 2.5 lbs)
 * @returns true if weight is achievable
 */
export function isValidGymWeight(
	weight: number,
	barbellWeight: number = 45,
	minPlateSize: number = 2.5
): boolean {
	if (weight < barbellWeight) return false;

	const plateWeight = weight - barbellWeight;
	const perSideWeight = plateWeight / 2;

	// Check if per-side weight is a multiple of minimum plate size
	return Math.abs(perSideWeight % minPlateSize) < 0.01;
}
