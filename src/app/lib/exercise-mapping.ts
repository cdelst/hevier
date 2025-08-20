/**
 * Comprehensive exercise mapping with muscle group analysis for all 439 Hevy exercises
 * Maps Hevy exercise IDs to their targeted muscle groups based on biomechanical analysis
 */

import { MuscleGroup } from '../types/index.js';

// Exercise ID to muscle groups mapping (for analytics and intelligent programming)
export const EXERCISE_MUSCLE_GROUPS: Record<string, MuscleGroup[]> = {
	// CHEST Primary Exercises
	'79D0BB3A': ['CHEST', 'TRICEPS', 'SHOULDERS'], // Bench Press (Barbell)
	'3601968B': ['CHEST', 'TRICEPS', 'SHOULDERS'], // Bench Press (Dumbbell)
	'0FBF7195': ['CHEST', 'TRICEPS', 'SHOULDERS'], // Bench Press (Smith Machine)
	'99C1F2AD': ['CHEST', 'TRICEPS', 'SHOULDERS'], // Bench Press (Cable)
	'50DFDFAB': ['CHEST', 'SHOULDERS', 'TRICEPS'], // Incline Bench Press (Barbell)
	'07B38369': ['CHEST', 'SHOULDERS', 'TRICEPS'], // Incline Bench Press (Dumbbell)
	'3A6FA3D1': ['CHEST', 'SHOULDERS', 'TRICEPS'], // Incline Bench Press (Smith Machine)
	'DA0F0470': ['CHEST', 'TRICEPS'], // Decline Bench Press (Barbell)
	'18487FA7': ['CHEST', 'TRICEPS'], // Decline Bench Press (Dumbbell)
	'FAF31231': ['CHEST', 'TRICEPS'], // Decline Bench Press (Machine)
	'FFC106CB': ['CHEST', 'TRICEPS'], // Decline Bench Press (Smith Machine)
	'12017185': ['CHEST'], // Chest Fly (Dumbbell)
	'e8abfab0-3ebf-40a9-9a65-9d8757e141aa': ['CHEST'], // Chest Fly (cable)
	'78683336': ['CHEST'], // Chest Fly (Machine)
	'D3E2AB55': ['CHEST'], // Incline Chest Fly (Dumbbell)
	'A351AED7': ['CHEST'], // Decline Chest Fly (Dumbbell)
	'DDB7C19F': ['CHEST'], // Chest Fly (Band)
	'720B0D70': ['CHEST', 'SHOULDERS'], // Chest Fly (Suspension)
	'9DCE2D64': ['CHEST'], // Butterfly (Pec Deck)
	'651F844C': ['CHEST'], // Cable Fly Crossovers
	'293483AD': ['CHEST'], // Low Cable Fly Crossovers
	'EAC7D9C5': ['CHEST', 'TRICEPS'], // Chest Press (Band)
	'7EB3F7C3': ['CHEST', 'TRICEPS'], // Chest Press (Machine)
	'FBF92739': ['CHEST', 'TRICEPS'], // Incline Chest Press (Machine)
	'24706DCD': ['CHEST', 'TRICEPS'], // Iso-Lateral Chest Press (Machine)
	'D53F2886': ['CHEST', 'TRICEPS'], // Floor Press (Barbell)
	'756EE329': ['CHEST', 'TRICEPS'], // Floor Press (Dumbbell)
	'867AC3B6': ['CHEST', 'TRICEPS'], // Feet Up Bench Press (Barbell)
	'F72FA239': ['CHEST', 'TRICEPS'], // Dumbbell Squeeze Press
	'BE89C631': ['CHEST', 'TRICEPS'], // Hex Press (Dumbbell)
	'982734D4': ['CHEST', 'TRICEPS'], // Plate Press
	'9373FSD1': ['CHEST'], // Plate Squeeze (Svend Press)

	// CHEST Push-up variations
	'392887AA': ['CHEST', 'TRICEPS', 'SHOULDERS'], // Push Up
	'947DAC23': ['CHEST', 'TRICEPS'], // Push Up - Close Grip
	'19372ABC': ['CHEST', 'TRICEPS', 'SHOULDERS'], // Push Up (Weighted)
	'6575F52D': ['CHEST', 'TRICEPS'], // Diamond Push Up
	'C43825EA': ['CHEST', 'SHOULDERS', 'TRICEPS'], // Decline Push Up
	'39C99849': ['CHEST', 'SHOULDERS', 'TRICEPS'], // Incline Push Ups
	'B74A95BB': ['CHEST', 'TRICEPS'], // Kneeling Push Up
	'10D76E8F': ['CHEST', 'TRICEPS'], // Clap Push Ups
	'B140095E': ['CHEST', 'TRICEPS'], // One Arm Push Up
	'0EFE8162': ['SHOULDERS', 'CHEST'], // Pike Pushup
	'90B04F96': ['SHOULDERS', 'CHEST'], // Handstand Push Up
	'31436F5D': ['CHEST', 'TRICEPS'], // Plank Pushup
	'AEA56BDC': ['CHEST', 'TRICEPS'], // Ring Push Up
	'1B89CA1B': ['BACK', 'CHEST'], // Renegade Row (Dumbbell)

	// CHEST Dips
	'6FCD7755': ['CHEST', 'TRICEPS'], // Chest Dip
	'E9E4089F': ['CHEST', 'TRICEPS'], // Chest Dip (Assisted)
	'29472BE1': ['CHEST', 'TRICEPS'], // Chest Dip (Weighted)
	'CD6DC8E5': ['TRICEPS', 'CHEST'], // Bench Dip
	'28BB4A95': ['TRICEPS', 'CHEST'], // Triceps Dip
	'4B4BF8C2': ['TRICEPS', 'CHEST'], // Triceps Dip (Assisted)
	'10347BAC': ['TRICEPS', 'CHEST'], // Triceps Dip (Weighted)
	'5122E7D9': ['TRICEPS', 'CHEST'], // Seated Dip Machine
	'A57D38D5': ['TRICEPS'], // Floor Triceps Dip
	'51A0EDAA': ['TRICEPS', 'CHEST'], // Ring Dips

	// BACK Pull-ups and Chin-ups
	'1B2B1E7C': ['BACK', 'BICEPS'], // Pull Up
	'2C37EC5E': ['BACK', 'BICEPS'], // Pull Up (Assisted)
	'56808FD2': ['BACK', 'BICEPS'], // Pull Up (Band)
	'729237D1': ['BACK', 'BICEPS'], // Pull Up (Weighted)
	'7C50F118': ['BACK', 'BICEPS'], // Wide Pull Up
	'29083183': ['BACK', 'BICEPS'], // Chin Up
	'D23C609B': ['BACK', 'BICEPS'], // Chin Up (Assisted)
	'023943F1': ['BACK', 'BICEPS'], // Chin Up (Weighted)
	'A91838C0': ['BACK', 'BICEPS'], // Kipping Pull Up
	'5F09F0FC': ['BACK', 'BICEPS'], // Ring Pull Up
	'F60BDDF8': ['BACK', 'BICEPS'], // Negative Pull Up
	'EE2938D1': ['BACK', 'BICEPS'], // Sternum Pull up (Gironda)
	'9F9C164B': ['BACK', 'BICEPS'], // Muscle Up
	'C7AE420A': ['BACK'], // Scapular Pull Ups

	// BACK Rows
	'55E6546F': ['BACK', 'BICEPS'], // Bent Over Row (Barbell)
	'23E92538': ['BACK', 'BICEPS'], // Bent Over Row (Dumbbell)
	'EA820646': ['BACK', 'BICEPS'], // Bent Over Row (Band)
	'F1E57334': ['BACK', 'BICEPS'], // Dumbbell Row
	'0393F233': ['BACK', 'BICEPS'], // Seated Cable Row - V Grip (Cable)
	'F1D60854': ['BACK', 'BICEPS'], // Seated Cable Row - Bar Grip
	'C3BCABB3': ['BACK', 'BICEPS'], // Seated Cable Row - Bar Wide Grip
	'1DF4A847': ['BACK', 'BICEPS'], // Seated Row (Machine)
	'AA1EB7D8': ['BACK', 'BICEPS'], // Iso-Lateral Row (Machine)
	'BC3492DA': ['BACK', 'BICEPS'], // Iso-Lateral High Row (Machine)
	'91FAFBA3': ['BACK', 'BICEPS'], // Iso-Lateral Low Row
	'D0C4A899': ['BACK', 'BICEPS'], // Single Arm Cable Row
	'08A2974E': ['BACK', 'BICEPS'], // T Bar Row
	'018ADC12': ['BACK', 'BICEPS'], // Pendlay Row (Barbell)
	'C732C341': ['BACK', 'BICEPS'], // Meadows Rows (Barbell)
	'D7D7FCCE': ['BACK', 'BICEPS'], // Landmine Row
	'425805F4': ['BACK', 'BICEPS'], // Inverted Row
	'8A2E6481': ['BACK', 'BICEPS'], // Low Row (Suspension)
	'05487216': ['BACK', 'BICEPS'], // Gorilla Row (Kettlebell)
	'A8814C06': ['BACK', 'QUADS', 'GLUTES'], // Squat Row
	'914F3A96': ['BACK', 'BICEPS'], // Chest Supported Incline Row (Dumbbell)

	// BACK Lat Pulldowns
	'6A6C31A5': ['BACK', 'BICEPS'], // Lat Pulldown (Cable)
	'473CF5B8': ['BACK', 'BICEPS'], // Lat Pulldown (Machine)
	'D2FE7B2E': ['BACK', 'BICEPS'], // Lat Pulldown (Band)
	'4E5257DE': ['BACK', 'BICEPS'], // Lat Pulldown - Close Grip (Cable)
	'046E25A2': ['BACK', 'BICEPS'], // Reverse Grip Lat Pulldown (Cable)
	'2EE45F81': ['BACK', 'BICEPS'], // Single Arm Lat Pulldown
	'D82EA543': ['BACK', 'BICEPS'], // Kneeling Pulldown (band)
	'72880C57': ['BACK', 'BICEPS'], // Vertical Traction (Machine)
	'5066647d-a41e-4282-a103-061a66f02d72': ['BACK', 'BICEPS'], // Vertical Row (machine)

	// BACK Pullovers
	'67280085': ['BACK', 'CHEST'], // Pullover (Dumbbell)
	'B123DD01': ['BACK', 'CHEST'], // Pullover (Machine)
	'D2387AB1': ['BACK'], // Straight Arm Lat Pulldown (Cable)
	'9273BA17': ['BACK'], // Rope Straight Arm Pulldown

	// BACK Deadlifts
	'C6272009': ['BACK', 'HAMSTRINGS', 'GLUTES'], // Deadlift (Barbell)
	'5F4E6DD3': ['BACK', 'HAMSTRINGS', 'GLUTES'], // Deadlift (Dumbbell)
	'99507114': ['BACK', 'HAMSTRINGS', 'GLUTES'], // Deadlift (Band)
	'20870ED5': ['BACK', 'HAMSTRINGS', 'GLUTES'], // Deadlift (Smith Machine)
	'B923B230': ['BACK', 'HAMSTRINGS', 'GLUTES'], // Deadlift (Trap bar)
	'2B4B7310': ['BACK', 'HAMSTRINGS', 'GLUTES'], // Romanian Deadlift (Barbell)
	'72CFFAD5': ['BACK', 'HAMSTRINGS', 'GLUTES'], // Romanian Deadlift (Dumbbell)
	'93472AC1': ['BACK', 'HAMSTRINGS', 'GLUTES'], // Single Leg Romanian Deadlift (Barbell)
	'937292AB': ['BACK', 'HAMSTRINGS', 'GLUTES'], // Single Leg Romanian Deadlift (Dumbbell)
	'2A48E443': ['BACK', 'HAMSTRINGS', 'GLUTES'], // Straight Leg Deadlift
	'D20D7BBE': ['BACK', 'HAMSTRINGS', 'GLUTES'], // Sumo Deadlift
	'FA5D0DE1': ['BACK', 'HAMSTRINGS', 'GLUTES'], // Deadlift High Pull
	'FE389074': ['BACK', 'HAMSTRINGS', 'GLUTES'], // Rack Pull

	// BACK - Rear Delts
	'E5988A0A': ['SHOULDERS', 'BACK'], // Rear Delt Reverse Fly (Dumbbell)
	'C315DC2A': ['SHOULDERS', 'BACK'], // Rear Delt Reverse Fly (Cable)
	'D8281C62': ['SHOULDERS', 'BACK'], // Rear Delt Reverse Fly (Machine)
	'B582299E': ['SHOULDERS', 'BACK'], // Chest Supported Reverse Fly (Dumbbell)
	'9264ADA1': ['SHOULDERS', 'BACK'], // Reverse Fly Single Arm (Cable)
	'BE640BA0': ['SHOULDERS', 'BACK'], // Face Pull

	// SHOULDERS - Overhead Press
	'7B8D84E8': ['SHOULDERS', 'TRICEPS'], // Overhead Press (Barbell)
	'6AC96645': ['SHOULDERS', 'TRICEPS'], // Overhead Press (Dumbbell)
	'B09A1304': ['SHOULDERS', 'TRICEPS'], // Overhead Press (Smith Machine)
	'91AF29E0': ['SHOULDERS', 'TRICEPS'], // Seated Overhead Press (Barbell)
	'9930DF71': ['SHOULDERS', 'TRICEPS'], // Seated Overhead Press (Dumbbell)
	'073032BB': ['SHOULDERS', 'TRICEPS'], // Standing Military Press (Barbell)
	'878CD1D0': ['SHOULDERS', 'TRICEPS'], // Shoulder Press (Dumbbell)
	'9237BAD1': ['SHOULDERS', 'TRICEPS'], // Seated Shoulder Press (Machine)
	'059E835D': ['SHOULDERS', 'TRICEPS'], // Shoulder Press (Machine Plates)
	'542F3CD5': ['SHOULDERS', 'TRICEPS'], // Push Press
	'A69FF221': ['SHOULDERS', 'TRICEPS'], // Arnold Press (Dumbbell)
	'6433CD93': ['SHOULDERS', 'TRICEPS'], // Kettlebell Shoulder Press
	'1837BA23': ['SHOULDERS', 'TRICEPS'], // Single Arm Landmine Press (Barbell)

	// SHOULDERS - Lateral Raises
	'422B08F1': ['SHOULDERS'], // Lateral Raise (Dumbbell)
	'BE289E45': ['SHOULDERS'], // Lateral Raise (Cable)
	'DF200976': ['SHOULDERS'], // Lateral Raise (Band)
	'D5D0354D': ['SHOULDERS'], // Lateral Raise (Machine)
	'9372FFAA': ['SHOULDERS'], // Seated Lateral Raise (Dumbbell)
	'DE68C825': ['SHOULDERS'], // Single Arm Lateral Raise (Cable)

	// SHOULDERS - Front Raises
	'8293E554': ['SHOULDERS'], // Front Raise (Dumbbell)
	'BD86EFD5': ['SHOULDERS'], // Front Raise (Barbell)
	'DBB91A3C': ['SHOULDERS'], // Front Raise (Cable)
	'47B036EF': ['SHOULDERS'], // Front Raise (Band)
	'796E8E2C': ['SHOULDERS'], // Front Raise (Suspension)
	'DBF9273A': ['SHOULDERS'], // Plate Front Raise
	'54E60954': ['SHOULDERS'], // Overhead Plate Raise
	'F21D5693': ['SHOULDERS', 'BACK'], // Chest Supported Y Raise (Dumbbell)

	// SHOULDERS - Upright Rows
	'7AB9A362': ['SHOULDERS', 'BACK'], // Upright Row (Barbell)
	'797F0782': ['SHOULDERS', 'BACK'], // Upright Row (Dumbbell)
	'286C1D0B': ['SHOULDERS', 'BACK'], // Upright Row (Cable)

	// SHOULDERS - Shrugs
	'0B841777': ['SHOULDERS', 'BACK'], // Shrug (Barbell)
	'ABEC557F': ['SHOULDERS', 'BACK'], // Shrug (Dumbbell)
	'FFABC123': ['SHOULDERS', 'BACK'], // Shrug (Cable)
	'19A38071': ['SHOULDERS', 'BACK'], // Shrug (Machine)
	'742E5BD5': ['SHOULDERS', 'BACK'], // Shrug (Smith Machine)
	'BA3DE542': ['SHOULDERS', 'BACK'], // Jump Shrug

	// BICEPS - Curls
	'A5AC6449': ['BICEPS'], // Bicep Curl (Barbell)
	'37FCC2BB': ['BICEPS'], // Bicep Curl (Dumbbell)
	'ADA8623C': ['BICEPS'], // Bicep Curl (Cable)
	'AF328E3D': ['BICEPS'], // Bicep Curl (Machine)
	'0B4C1902': ['BICEPS'], // Bicep Curl (Suspension)
	'01A35BF9': ['BICEPS'], // EZ Bar Biceps Curl
	'3BC06AD3': ['BICEPS'], // 21s Bicep Curl
	'724CDE60': ['BICEPS'], // Concentration Curl
	'B33B526E': ['BICEPS'], // Single Arm Curl (Cable)
	'2DBCA395': ['BICEPS'], // Behind the Back Curl (Cable)
	'D950429E': ['BICEPS'], // Drag Curl
	'9283ABD5': ['BICEPS'], // Plate Curl
	'234897AB': ['BICEPS'], // Rope Cable Curl
	'4E239ED8': ['BICEPS'], // Kettlebell Curl
	'72297E8C': ['BICEPS'], // Waiter Curl (Dumbbell)
	'582ADA23': ['BICEPS'], // Overhead Curl (Cable)

	// BICEPS - Hammer Curls
	'7E3BC8B6': ['BICEPS', 'FOREARMS'], // Hammer Curl (Dumbbell)
	'36E8F14E': ['BICEPS', 'FOREARMS'], // Hammer Curl (Cable)
	'1D4B3D6B': ['BICEPS', 'FOREARMS'], // Hammer Curl (Band)
	'32C4D4A2': ['BICEPS', 'FOREARMS'], // Cross Body Hammer Curl

	// BICEPS - Preacher Curls
	'4F942934': ['BICEPS'], // Preacher Curl (Barbell)
	'FAB6EB2F': ['BICEPS'], // Preacher Curl (Dumbbell)
	'1E9A6B8E': ['BICEPS'], // Preacher Curl (Machine)
	'8BAB2735': ['BICEPS'], // Seated Incline Curl (Dumbbell)
	'2348AB72': ['BICEPS'], // Spider Curl (Barbell)
	'90427D4A': ['BICEPS'], // Spider Curl (Dumbbell)
	'942BAD12': ['BICEPS'], // Pinwheel Curl (Dumbbell)

	// BICEPS - Reverse Curls
	'112FC6B7': ['BICEPS', 'FOREARMS'], // Reverse Curl (Barbell)
	'9F48F858': ['BICEPS', 'FOREARMS'], // Reverse Curl (Cable)
	'B567DD46': ['BICEPS', 'FOREARMS'], // Reverse Curl (Dumbbell)
	'1FF4097B': ['BICEPS', 'FOREARMS'], // Reverse Grip Concentration Curl

	// TRICEPS - Extensions
	'2F8D3067': ['TRICEPS'], // Triceps Extension (Barbell)
	'21310F5F': ['TRICEPS'], // Triceps Extension (Cable)
	'3765684D': ['TRICEPS'], // Triceps Extension (Dumbbell)
	'3092FADD': ['TRICEPS'], // Triceps Extension (Machine)
	'6182EE83': ['TRICEPS'], // Triceps Extension (Suspension)
	'8347DFD1': ['TRICEPS'], // Single Arm Tricep Extension (Dumbbell)
	'B5EFBF9C': ['TRICEPS'], // Overhead Triceps Extension (Cable)
	'234BC743': ['TRICEPS'], // Seated Triceps Press
	'B31EB524': ['TRICEPS'], // Wide-Elbow Triceps Press (Dumbbell)

	// TRICEPS - Pushdowns
	'93A552C6': ['TRICEPS'], // Triceps Pushdown
	'94B7239B': ['TRICEPS'], // Triceps Rope Pushdown
	'CDC472B1': ['TRICEPS'], // Triceps Pressdown
	'552AB030': ['TRICEPS'], // Single Arm Triceps Pushdown (Cable)

	// TRICEPS - Skull Crushers
	'875F585F': ['TRICEPS'], // Skullcrusher (Barbell)
	'68F8A292': ['TRICEPS'], // Skullcrusher (Dumbbell)
	'74103F24': ['TRICEPS'], // JM Press (Barbell)

	// TRICEPS - Kickbacks
	'6127A3AD': ['TRICEPS'], // Triceps Kickback (Dumbbell)
	'EC3B69A3': ['TRICEPS'], // Triceps Kickback (Cable)

	// TRICEPS - Close Grip
	'35B51B87': ['TRICEPS', 'CHEST'], // Bench Press - Close Grip (Barbell)

	// FOREARMS
	'1006DF48': ['FOREARMS'], // Seated Palms Up Wrist Curl
	'DDB29047': ['FOREARMS'], // Behind the Back Bicep Wrist Curl (Barbell)
	'9202CC23': ['FOREARMS'], // Seated Wrist Extension (Barbell)
	'50C613D0': ['FOREARMS', 'QUADS', 'GLUTES'], // Farmers Walk
	'B9380898': ['FOREARMS'], // Dead Hang
	'0E4523F4': ['FOREARMS'], // Wrist Roller

	// LEGS - Squats (Quads/Glutes primary)
	'D04AC939': ['QUADS', 'GLUTES'], // Squat (Barbell)
	'9694DA61': ['QUADS', 'GLUTES'], // Squat (Bodyweight)
	'DCFF3E9F': ['QUADS', 'GLUTES'], // Squat (Dumbbell)
	'CC35A01F': ['QUADS', 'GLUTES'], // Squat (Machine)
	'DDCC3821': ['QUADS', 'GLUTES'], // Squat (Smith Machine)
	'F1258206': ['QUADS', 'GLUTES'], // Squat (Band)
	'B82D6418': ['QUADS', 'GLUTES'], // Squat (Suspension)
	'5046D0A9': ['QUADS', 'GLUTES'], // Front Squat
	'3D0C7C75': ['QUADS', 'GLUTES'], // Goblet Squat
	'05293BCA': ['QUADS', 'GLUTES'], // Sumo Squat (Dumbbell)
	'6622E5A0': ['QUADS', 'GLUTES'], // Sumo Squat (Barbell)
	'3F5F8D40': ['QUADS', 'GLUTES'], // Sumo Squat
	'5E10D0E6': ['QUADS', 'GLUTES'], // Sumo Squat (Kettlebell)
	'A127DA73': ['QUADS', 'GLUTES'], // Kettlebell Goblet Squat
	'38FC1AB9': ['QUADS', 'GLUTES'], // Box Squat (Barbell)
	'CE1054CE': ['QUADS', 'GLUTES'], // Pause Squat (Barbell)
	'1283BBA6': ['QUADS', 'GLUTES'], // Full Squat
	'AC5A4C58': ['QUADS', 'GLUTES'], // Hack Squat
	'1E42FD5F': ['QUADS', 'GLUTES'], // Hack Squat (Machine)
	'30E293E3': ['QUADS', 'GLUTES'], // Pendulum Squat (Machine)
	'2CFED196': ['QUADS', 'GLUTES', 'SHOULDERS'], // Overhead Squat
	'40C6A9FC': ['QUADS', 'GLUTES'], // Zercher Squat
	'70D4EBBF': ['QUADS', 'GLUTES'], // Jump Squat
	'3FF6A22E': ['QUADS', 'GLUTES'], // Pistol Squat
	'5BFF35BA': ['QUADS', 'GLUTES'], // Assisted Pistol Squats
	'F5DEF1EB': ['QUADS'], // Sissy Squat (Weighted)
	'D731CCA8': ['QUADS', 'GLUTES'], // Lateral Squat

	// LEGS - Leg Press
	'C7973E0E': ['QUADS', 'GLUTES'], // Leg Press (Machine)
	'0EB695C9': ['QUADS', 'GLUTES'], // Leg Press Horizontal (Machine)
	'3FD83744': ['QUADS', 'GLUTES'], // Single Leg Press (Machine)

	// LEGS - Leg Extensions (Quads isolation)
	'75A4F6C4': ['QUADS'], // Leg Extension (Machine)
	'629AE73D': ['QUADS'], // Single Leg Extensions

	// LEGS - Leg Curls (Hamstring isolation)
	'B8127AD1': ['HAMSTRINGS'], // Lying Leg Curl (Machine)
	'11A123F3': ['HAMSTRINGS'], // Seated Leg Curl (Machine)
	'6120CAAB': ['HAMSTRINGS'], // Standing Leg Curls
	'108D7A14': ['HAMSTRINGS'], // Nordic Hamstrings Curls

	// LEGS - Lunges
	'5E1A7777': ['QUADS', 'GLUTES'], // Lunge
	'6E6EE645': ['QUADS', 'GLUTES'], // Lunge (Barbell)
	'B537D09F': ['QUADS', 'GLUTES'], // Lunge (Dumbbell)
	'C284D923': ['QUADS', 'GLUTES'], // Reverse Lunge
	'818BA121': ['QUADS', 'GLUTES'], // Reverse Lunge (Barbell)
	'FFDA283B': ['QUADS', 'GLUTES'], // Reverse Lunge (Dumbbell)
	'32HKJ34K': ['QUADS', 'GLUTES'], // Walking Lunge
	'A733CC5B': ['QUADS', 'GLUTES'], // Walking Lunge (Dumbbell)
	'5CC07A1F': ['QUADS', 'GLUTES'], // Jumping Lunge
	'F2A37357': ['QUADS', 'GLUTES'], // Lateral Lunge
	'D39EC9EB': ['QUADS', 'GLUTES'], // Curtsy Lunge (Dumbbell)
	'4C6721B9': ['QUADS', 'GLUTES', 'SHOULDERS'], // Overhead Dumbbell Lunge
	'B5D3A742': ['QUADS', 'GLUTES'], // Bulgarian Split Squat
	'20C1A3CB': ['QUADS', 'GLUTES'], // Split Squat (Dumbbell)

	// LEGS - Step Ups
	'128A2381': ['QUADS', 'GLUTES'], // Step Up
	'BF6ECE89': ['QUADS', 'GLUTES'], // Dumbbell Step Up

	// LEGS - Hip Thrust/Glute Bridge (Glute focused)
	'D57C2EC7': ['GLUTES'], // Hip Thrust (Barbell)
	'68CE0B9B': ['GLUTES'], // Hip Thrust (Machine)
	'291ABA92': ['GLUTES'], // Hip Thrust (Smith Machine)
	'92B8C7E1': ['GLUTES'], // Hip Thrust
	'487B3755': ['GLUTES'], // Single Leg Hip Thrust
	'D1CD146F': ['GLUTES'], // Single Leg Hip Thrust (Dumbbell)
	'CDA23948': ['GLUTES'], // Glute Bridge
	'CBC0D834': ['GLUTES'], // Single Leg Glute Bridge
	'912488ef-98d2-490e-bb16-daf008872197': ['GLUTES'], // Single Leg Glute Bridge (duration)
	'FBEE8279': ['GLUTES'], // Partial Glute Bridge (Barbell)
	'F6948F17': ['GLUTES'], // Frog Pumps (Dumbbell)

	// LEGS - Good Morning (Hamstrings/Glutes)
	'4180C405': ['HAMSTRINGS', 'GLUTES', 'BACK'], // Good Morning (Barbell)

	// LEGS - Belt Squat
	'3D1CDC75': ['QUADS', 'GLUTES'], // Belt Squat (Machine)

	// LEGS - Hip Abduction/Adduction (Glute focused)
	'F4B4C6EE': ['GLUTES'], // Hip Abduction (Machine)
	'8BEBFED6': ['GLUTES'], // Hip Adduction (Machine)
	'CC016611': ['GLUTES'], // Clamshell
	'EC02979E': ['GLUTES'], // Lateral Band Walks

	// LEGS - Glute Kickbacks (Glute isolation)
	'CBA02382': ['GLUTES'], // Glute Kickback (Machine)
	'987234AB': ['GLUTES'], // Glute Kickback on Floor
	'ACB2751D': ['GLUTES'], // Standing Cable Glute Kickbacks
	'1ADF8723': ['GLUTES'], // Rear Kick (Machine)

	// LEGS - Calf Raises (Calf isolation)
	'06745E58': ['CALVES'], // Standing Calf Raise
	'E53CCBE5': ['CALVES'], // Standing Calf Raise (Barbell)
	'6DA40660': ['CALVES'], // Standing Calf Raise (Dumbbell)
	'E05C2C38': ['CALVES'], // Standing Calf Raise (Machine)
	'AA52E8D2': ['CALVES'], // Standing Calf Raise (Smith)
	'238BA231': ['CALVES'], // Single Leg Standing Calf Raise
	'E51CCBE5': ['CALVES'], // Single Leg Standing Calf Raise (Barbell)
	'5DA40761': ['CALVES'], // Single Leg Standing Calf Raise (Dumbbell)
	'B05C2C29': ['CALVES'], // Single Leg Standing Calf Raise (Machine)
	'062AB91A': ['CALVES'], // Seated Calf Raise
	'91237BDD': ['CALVES'], // Calf Press (Machine)
	'47B9DF13': ['CALVES'], // Calf Extension (Machine)

	// LEGS - Glute Ham Raise (Hamstring/Glute)
	'68B83EE0': ['HAMSTRINGS', 'GLUTES'], // Glute Ham Raise

	// LEGS - Cable Pull Through (Glute/Hamstring)
	'8C331CD8': ['GLUTES', 'HAMSTRINGS', 'BACK'], // Cable Pull Through

	// LEGS - Box Jump (Explosive leg movement)
	'56092DD1': ['QUADS', 'GLUTES', 'CALVES'], // Box Jump
	'07EBC4DC': ['QUADS', 'GLUTES', 'CALVES'], // Lateral Box Jump

	// LEGS - Leg Raises (lower body)
	'DC59D143': ['GLUTES'], // Lateral Leg Raises
	'2AF8B552': ['GLUTES'], // Fire Hydrants

	// ABS - Crunches
	'DCF3B31B': ['ABS'], // Crunch
	'EB43ADD4': ['ABS'], // Crunch (Machine)
	'D928C232': ['ABS'], // Crunch (Weighted)
	'23A48484': ['ABS'], // Cable Crunch
	'A41C7261': ['ABS'], // Bicycle Crunch
	'594450D2': ['ABS'], // Bicycle Crunch Raised Legs
	'BC10A922': ['ABS'], // Decline Crunch
	'B2398CD1': ['ABS'], // Decline Crunch (Weighted)
	'7952B5CD': ['ABS'], // Reverse Crunch
	'DBE341AA': ['ABS'], // Oblique Crunch

	// ABS - Sit Ups
	'022DF610': ['ABS'], // Sit Up
	'9237BA12': ['ABS'], // Sit Up (Weighted)
	'32B0B590': ['ABS'], // Jackknife Sit Up

	// ABS - Leg Raises
	'09C9F635': ['ABS'], // Lying Leg Raise
	'BD5935CF': ['ABS'], // Lying Knee Raise
	'F8356514': ['ABS'], // Hanging Leg Raise
	'08590920': ['ABS'], // Hanging Knee Raise
	'0482DA98': ['ABS'], // Leg Raise Parallel Bars
	'98237BA2': ['ABS'], // Knee Raise Parallel Bars

	// ABS - V-Ups and Variations
	'6BE68B62': ['ABS'], // V Up
	'B94E35E1': ['ABS'], // Toes to Bar
	'A01BE509': ['ABS'], // Elbow to Knee
	'75BAC5C3': ['ABS'], // Toe Touch
	'567FB505': ['ABS'], // Heel Taps

	// ABS - Planks
	'C6C9B8A0': ['ABS'], // Plank
	'E3EDA509': ['ABS'], // Side Plank
	'99B49684': ['ABS'], // Reverse Plank

	// ABS - Dead Bug
	'D8911FC4': ['ABS'], // Dead Bug

	// ABS - Mountain Climber
	'F49E31D6': ['ABS'], // Mountain Climber

	// ABS - Russian Twist
	'BB83BDDE': ['ABS'], // Russian Twist (Bodyweight)
	'2982AA23': ['ABS'], // Russian Twist (Weighted)

	// ABS - Ab Wheel
	'99D5F10E': ['ABS'], // Ab Wheel
	'B4F2FF72': ['ABS'], // Ab Scissors

	// ABS - Cable Core
	'CC55119B': ['ABS'], // Cable Core Palloff Press
	'92D858EA': ['ABS'], // Cable Twist (Down to up)
	'A2D838BD': ['ABS'], // Cable Twist (Up to down)

	// ABS - Dragon Flag
	'AFC29472': ['ABS'], // Dragon Flag
	'B7192800': ['ABS'], // Dragonfly

	// ABS - Flutter Kicks
	'2FA77B28': ['ABS'], // Flutter Kicks

	// ABS - Hollow Rock
	'970ADF87': ['ABS'], // Hollow Rock

	// ABS - L-Sit
	'6D54A050': ['ABS'], // L-Sit Hold

	// ABS - Side Bend
	'37F9EDA7': ['ABS'], // Side Bend
	'026FD047': ['ABS'], // Side Bend (Dumbbell)
	'63410b2c-5690-4f89-bb06-06a7488c2754': ['ABS'], // Standing Side Bend
	'd8bb68ec-d1c0-484f-908b-92899717a704': ['ABS'], // Weighted Side Bend

	// ABS - Torso Rotation
	'FBB62888': ['ABS'], // Torso Rotation

	// ABS - Suspension
	'D410F649': ['ABS'], // Jack Knife (Suspension)

	// ABS - Landmine
	'923874CA': ['ABS', 'SHOULDERS'], // Landmine 180

	// ABS - Spiderman
	'C10A5AC9': ['ABS'], // Spiderman

	// ABS - Abs (generic)
	'9289aeaa-972e-4505-8556-86c4a68a0b84': ['ABS'], // Abs

	// NECK
	'22FEDCA4': ['NECK'], // Lying Neck Curls
	'31B8DA0F': ['NECK'], // Lying Neck Curls (Weighted)
	'0910BD28': ['NECK'], // Lying Neck Extension
	'D6A73CF2': ['NECK'], // Lying Neck Extension (Weighted)

	// CARDIO
	'AC1BB830': ['CARDIO'], // Running
	'243710DE': ['CARDIO'], // Treadmill
	'33EDD7DB': ['CARDIO'], // Walking
	'D8F7F851': ['CARDIO'], // Cycling
	'0222DB42': ['CARDIO'], // Rowing Machine
	'3303376C': ['CARDIO'], // Elliptical Trainer
	'43573BB8': ['CARDIO'], // Air Bike
	'B60A678F': ['CARDIO'], // Swimming
	'A0D8FA1B': ['CARDIO'], // Boxing
	'9283BABA': ['CARDIO'], // Sprints
	'5E0DDACE': ['CARDIO'], // Aerobics
	'213AB238': ['CARDIO'], // Spinning
	'040BA2E3': ['CARDIO'], // Jump Rope
	'1C34A172': ['CARDIO'], // Hiking
	'4377A52B': ['CARDIO'], // Stair Machine (Floors)
	'4377A52C': ['CARDIO'], // Stair Machine (Steps)
	'111873ad-b395-41b8-9929-f5863cd8cfd6': ['CARDIO'], // Stairmaster (calves)
	'991833C2': ['CARDIO'], // Jumping Jack
	'150E076B': ['CARDIO'], // High Knees
	'C9CCB878': ['CARDIO'], // High Knee Skips
	'023947AB': ['CARDIO'], // HIIT
	'BB792A36': ['CARDIO'], // Burpee
	'86B00DDE': ['CARDIO'], // Burpee Over the Bar
	'207DC636': ['CARDIO'], // Frog Jumps
	'E23F1F2B': ['CARDIO'], // Climbing
	'24A809EF': ['CARDIO'], // Skating
	'84325755': ['CARDIO'], // Skiing
	'911A58D3': ['CARDIO'], // Snowboarding
	'7757171F': ['CARDIO'], // Sled Push

	// Olympic Lifts - Multiple muscle groups
	'ABB00838': ['BACK', 'QUADS', 'GLUTES', 'SHOULDERS'], // Clean
	'9E09CEC3': ['BACK', 'QUADS', 'GLUTES', 'SHOULDERS'], // Clean and Jerk
	'D3095577': ['BACK', 'QUADS', 'GLUTES', 'SHOULDERS'], // Clean and Press
	'652FEA39': ['BACK', 'HAMSTRINGS', 'GLUTES'], // Clean Pull
	'BD4E7E53': ['BACK', 'QUADS', 'GLUTES', 'SHOULDERS'], // Hang Clean
	'F4E77594': ['BACK', 'QUADS', 'GLUTES', 'SHOULDERS'], // Hang Snatch
	'FB09C938': ['BACK', 'QUADS', 'GLUTES', 'SHOULDERS'], // Snatch
	'E22F9358': ['BACK', 'QUADS', 'GLUTES', 'SHOULDERS'], // Power Snatch
	'C628D768': ['BACK', 'QUADS', 'GLUTES', 'SHOULDERS'], // Power Clean
	'F3717B0E': ['BACK', 'QUADS', 'GLUTES', 'SHOULDERS'], // Dumbbell Snatch
	'E764B907': ['BACK', 'QUADS', 'GLUTES', 'SHOULDERS'], // Split Jerk
	'84A77566': ['SHOULDERS'], // Press Under
	'F99C211D': ['BACK', 'QUADS', 'GLUTES', 'SHOULDERS'], // Kettlebell Clean
	'89304423': ['BACK', 'QUADS', 'GLUTES', 'SHOULDERS'], // Kettlebell Snatch
	'9B13BA4B': ['BACK', 'QUADS', 'GLUTES', 'SHOULDERS'], // Kettlebell High Pull

	// Kettlebell Exercises
	'F8A0FCCA': ['HAMSTRINGS', 'GLUTES', 'BACK'], // Kettlebell Swing
	'5F8903BF': ['QUADS', 'GLUTES', 'SHOULDERS'], // Kettlebell Turkish Get Up
	'55BA475A': ['SHOULDERS'], // Kettlebell Around the World
	'4288G454': ['SHOULDERS'], // Kettlebell Halo
	'90E506D5': ['QUADS', 'GLUTES', 'SHOULDERS'], // Thruster (Barbell)
	'10313AFD': ['QUADS', 'GLUTES', 'SHOULDERS'], // Thruster (Kettlebell)
	'983274DD': ['QUADS', 'GLUTES', 'SHOULDERS'], // Landmine Squat and Press

	// Wall Exercises
	'A1F47ACC': ['QUADS', 'GLUTES', 'SHOULDERS'], // Wall Ball
	'C8706C80': ['QUADS', 'GLUTES'], // Wall Sit
	'78b5bec4-595a-46ba-a134-45b5e5867cfe': ['QUADS', 'GLUTES'], // Weighted Wall Sit

	// Back Extensions
	'4F5866F8': ['BACK'], // Back Extension (Hyperextension)
	'A05C064D': ['BACK'], // Back Extension (Machine)
	'091737FA': ['BACK'], // Back Extension (Weighted Hyperextension)
	'7C0028C3': ['BACK'], // Reverse Hyperextension
	'218DA87C': ['BACK'], // Superman

	// Band Pull Aparts
	'E8D86EE8': ['SHOULDERS', 'BACK'], // Band Pullaparts

	// Battle Ropes
	'084A67CA': ['CARDIO'], // Battle Ropes

	// Ball Slams
	'F51D9080': ['ABS', 'SHOULDERS'], // Ball Slams

	// Around The World
	'D4A2FE7E': ['SHOULDERS'], // Around The World

	// Bird Dog
	'BD0AD077': ['ABS', 'BACK'], // Bird Dog

	// Single Chair/Leg exercises
	'a8486b75-d199-4b43-ba07-5b91f61af8a9': ['QUADS', 'GLUTES'], // Single Leg Chair 90

	// Bodyweight holds
	'BE3615CF': ['SHOULDERS'], // Handstand Hold
	'0E608350': ['ABS', 'BACK'], // Front Lever Hold
	'30F03BF0': ['ABS', 'BACK'], // Front Lever Raise

	// Downward Dog
	'7DA843A3': ['SHOULDERS', 'BACK'], // Downward Dog

	// Toe exercises
	'89a68182-69f0-4b8a-88d0-e717a448df12': ['CALVES'], // Toe Raises

	// Shoulder Taps
	'502FCE31': ['SHOULDERS'], // Shoulder Taps

	// Stretching/Recovery
	'527DA061': ['CARDIO'], // Stretching
	'EC2510CD': ['CARDIO'], // Pilates
	'8C9D2928': ['CARDIO'], // Yoga
	'79EF4E4F': ['CARDIO'], // Warm Up

	// Zottman Curl
	'123EE239': ['BICEPS', 'FOREARMS'], // Zottman Curl (Dumbbell)
};

// Primary exercise name to Hevy ID mapping - comprehensive coverage of common exercise names
export const HEVY_EXERCISE_MAP: Record<string, string> = {
	// === CHEST EXERCISES ===
	'bench press': '79D0BB3A',
	'barbell bench press': '79D0BB3A',
	'dumbbell bench press': '3601968B',
	'incline bench press': '50DFDFAB',
	'incline dumbbell bench press': '07B38369',
	'decline bench press': 'DA0F0470',
	'decline dumbbell bench press': '18487FA7',
	'chest fly': '12017185',
	'dumbbell fly': '12017185',
	'cable fly': 'e8abfab0-3ebf-40a9-9a65-9d8757e141aa',
	'pec deck': '9DCE2D64',
	'butterfly': '9DCE2D64',
	'push up': '392887AA',
	'push ups': '392887AA',
	'pushup': '392887AA',
	'pushups': '392887AA',
	'diamond push up': '6575F52D',
	'chest dip': '6FCD7755',
	'chest dips': '6FCD7755',
	'dips': '6FCD7755',

	// === BACK EXERCISES ===
	'pull up': '1B2B1E7C',
	'pull ups': '1B2B1E7C',
	'pullup': '1B2B1E7C',
	'pullups': '1B2B1E7C',
	'chin up': '29083183',
	'chin ups': '29083183',
	'chinup': '29083183',
	'chinups': '29083183',
	'lat pulldown': '6A6C31A5',
	'cable lat pulldown': '6A6C31A5',
	'lat pull down': '6A6C31A5',
	'bent over row': '55E6546F',
	'barbell row': '55E6546F',
	'bent-over row': '55E6546F',
	'dumbbell row': 'F1E57334',
	'single arm row': 'F1E57334',
	'seated cable row': '0393F233',
	'seated row': '0393F233',
	'cable row': '0393F233',
	't bar row': '08A2974E',
	't-bar row': '08A2974E',
	'deadlift': 'C6272009',
	'conventional deadlift': 'C6272009',
	'romanian deadlift': '2B4B7310',
	'rdl': '2B4B7310',
	'stiff leg deadlift': '2B4B7310',
	'sumo deadlift': 'D20D7BBE',

	// === SHOULDER EXERCISES ===
	'overhead press': '7B8D84E8',
	'military press': '7B8D84E8',
	'standing press': '7B8D84E8',
	'shoulder press': '878CD1D0',
	'dumbbell shoulder press': '878CD1D0',
	'dumbbell press': '6AC96645',
	'lateral raise': '422B08F1',
	'side raise': '422B08F1',
	'lateral raises': '422B08F1',
	'side raises': '422B08F1',
	'front raise': '8293E554',
	'front raises': '8293E554',
	'rear delt fly': 'E5988A0A',
	'reverse fly': 'E5988A0A',
	'rear fly': 'E5988A0A',
	'arnold press': 'A69FF221',
	'face pull': 'BE640BA0',
	'face pulls': 'BE640BA0',

	// === BICEP EXERCISES ===
	'bicep curl': 'A5AC6449',
	'bicep curls': 'A5AC6449',
	'barbell curl': 'A5AC6449',
	'barbell curls': 'A5AC6449',
	'dumbbell curl': '37FCC2BB',
	'dumbbell curls': '37FCC2BB',
	'cable curl': 'ADA8623C',
	'cable curls': 'ADA8623C',
	'hammer curl': '7E3BC8B6',
	'hammer curls': '7E3BC8B6',
	'preacher curl': '4F942934',
	'preacher curls': '4F942934',
	'concentration curl': '724CDE60',
	'concentration curls': '724CDE60',
	'21s': '3BC06AD3',
	'twenty ones': '3BC06AD3',
	'curl': 'A5AC6449', // Default to barbell curl

	// === TRICEP EXERCISES ===
	'tricep extension': '2F8D3067',
	'triceps extension': '2F8D3067',
	'overhead tricep extension': '2F8D3067',
	'overhead triceps extension': '2F8D3067',
	'tricep pushdown': '93A552C6',
	'triceps pushdown': '93A552C6',
	'cable pushdown': '93A552C6',
	'rope pushdown': '94B7239B',
	'tricep rope pushdown': '94B7239B',
	'skull crusher': '875F585F',
	'skullcrusher': '875F585F',
	'lying tricep extension': '875F585F',
	'close grip bench press': '35B51B87',
	'close-grip bench press': '35B51B87',
	'cgbp': '35B51B87',
	'tricep dip': '28BB4A95',
	'triceps dip': '28BB4A95',
	'tricep dips': '28BB4A95',
	'triceps dips': '28BB4A95',

	// === LEG EXERCISES ===
	'squat': 'D04AC939',
	'back squat': 'D04AC939',
	'barbell squat': 'D04AC939',
	'squats': 'D04AC939',
	'front squat': '5046D0A9',
	'front squats': '5046D0A9',
	'goblet squat': '3D0C7C75',
	'goblet squats': '3D0C7C75',
	'leg press': 'C7973E0E',
	'leg extension': '75A4F6C4',
	'leg extensions': '75A4F6C4',
	'quad extension': '75A4F6C4',
	'leg curl': 'B8127AD1',
	'leg curls': 'B8127AD1',
	'hamstring curl': 'B8127AD1',
	'hamstring curls': 'B8127AD1',
	'lunge': '5E1A7777',
	'lunges': '5E1A7777',
	'walking lunge': '5E1A7777',
	'walking lunges': '5E1A7777',
	'reverse lunge': '5E1A7777',
	'reverse lunges': '5E1A7777',
	'bulgarian split squat': 'B5D3A742',
	'bulgarian split squats': 'B5D3A742',
	'split squat': 'B5D3A742',
	'split squats': 'B5D3A742',
	'glute bridge': 'CDA23948',
	'glute bridges': 'CDA23948',
	'hip thrust': 'D57C2EC7',
	'hip thrusts': 'D57C2EC7',
	'calf raise': '06745E58',
	'calf raises': '06745E58',
	'standing calf raise': '06745E58',
	'standing calf raises': '06745E58',
	'good morning': '4180C405',
	'good mornings': '4180C405',
	'step up': '128A2381',
	'step ups': '128A2381',
	'step-up': '128A2381',
	'step-ups': '128A2381',

	// === ABS/CORE EXERCISES ===
	'plank': 'C6C9B8A0',
	'planks': 'C6C9B8A0',
	'crunch': 'DCF3B31B',
	'crunches': 'DCF3B31B',
	'abs': '9289aeaa-972e-4505-8556-86c4a68a0b84',
	'ab workout': '9289aeaa-972e-4505-8556-86c4a68a0b84',
	'cable crunch': '23A48484',
	'cable crunches': '23A48484',
	'machine crunch': 'EB43ADD4',
	'machine crunches': 'EB43ADD4',
	'hanging leg raise': 'F8356514',
	'hanging leg raises': 'F8356514',
	'hanging knee raise': '08590920',
	'hanging knee raises': '08590920',
	'bicycle crunch': 'A41C7261',
	'bicycle crunches': 'A41C7261',
	'russian twist': 'BB83BDDE',
	'russian twists': 'BB83BDDE',
	'ab wheel': '99D5F10E',
	'ab wheel rollout': '99D5F10E',
	'sit up': '022DF610',
	'sit ups': '022DF610',
	'sit-up': '022DF610',
	'sit-ups': '022DF610',
	'leg raise': '09C9F635',
	'leg raises': '09C9F635',
	'v up': '6BE68B62',
	'v ups': '6BE68B62',
	'v-up': '6BE68B62',
	'v-ups': '6BE68B62',
	'mountain climber': 'F49E31D6',
	'mountain climbers': 'F49E31D6',

	// === FOREARM EXERCISES ===
	'wrist curl': '1006DF48',
	'wrist curls': '1006DF48',
	'reverse wrist curl': 'DDB29047',
	'reverse wrist curls': 'DDB29047',
	'farmer walk': '50C613D0',
	'farmers walk': '50C613D0',
	'farmer walks': '50C613D0',
	'farmers walks': '50C613D0',
	"farmer's walk": '50C613D0',
	"farmer's walks": '50C613D0',
	"farmers' walk": '50C613D0',
	"farmers' walks": '50C613D0',
	'dead hang': 'B9380898',
	'dead hangs': 'B9380898',
	'grip training': 'B9380898',

	// === NECK EXERCISES ===
	'neck curl': '22FEDCA4',
	'neck curls': '22FEDCA4',
	'neck flexion': '22FEDCA4',
	'neck extension': '0910BD28',
	'neck extensions': '0910BD28',
	'plate neck flexion': '31B8DA0F',
	'plate neck extension': 'D6A73CF2',
	'weighted neck curl': '31B8DA0F',
	'weighted neck extension': 'D6A73CF2',

	// === CARDIO EXERCISES ===
	'running': 'AC1BB830',
	'run': 'AC1BB830',
	'outdoor running': 'AC1BB830',
	'jogging': 'AC1BB830',
	'jog': 'AC1BB830',
	'treadmill': '243710DE',
	'treadmill running': '243710DE',
	'treadmill walk': '243710DE',
	'treadmill walking': '243710DE',
	'light treadmill walk': '243710DE',

	// Light activation exercises (map to basic exercises)
	'light chest activation': '392887AA', // Push up
	'light back activation': '425805F4', // Inverted row
	'light shoulders activation': '422B08F1', // Lateral raise
	'light biceps activation': '37FCC2BB', // Dumbbell curl
	'light legs activation': '9694DA61', // Bodyweight squat
	'glute kickbacks': 'CBA02382', // Glute Kickback (Machine)
	'glute kickback': 'CBA02382', // Glute Kickback (Machine)

	// Additional push exercises
	'tricep extension': '2F8D3067', // Triceps Extension (Barbell)
	'triceps extension': '2F8D3067', // Triceps Extension (Barbell)
	'skullcrusher': '875F585F', // Skullcrusher (Barbell)
	'skull crusher': '875F585F', // Skullcrusher (Barbell)
	'skull crushers': '875F585F', // Skullcrusher (Barbell)
	'close grip bench press': '35B51B87', // Bench Press - Close Grip (Barbell)
	'close-grip bench press': '35B51B87', // Bench Press - Close Grip (Barbell)
	'incline bench press': '50DFDFAB', // Incline Bench Press (Barbell)
	'incline press': '50DFDFAB', // Incline Bench Press (Barbell)

	// Reference cheatsheet specific exercises
	'dumbbell press': '3601968B', // Dumbbell Bench Press
	'incline dumbbell press': '07B38369', // Incline Dumbbell Bench Press
	'decline pushup': 'C43825EA', // Decline Push Up
	'military press': '7B8D84E8', // Overhead Press (Barbell) - same as military press
	'dumbbell shoulder press': '878CD1D0', // Shoulder Press (Dumbbell)
	'dumbbell lateral raise': '422B08F1', // Lateral Raise (Dumbbell) 
	'cable lateral raise': 'BE289E45', // Lateral Raise (Cable)
	'machine lateral raise': 'D5D0354D', // Lateral Raise (Machine)
	'ez-bar curl': '01A35BF9', // EZ Bar Biceps Curl
	'neutral grip curl': '37FCC2BB', // Default to dumbbell curl
	'reverse curl': '112FC6B7', // Reverse Curl (Barbell)
	'rope pushdown': '94B7239B', // Triceps Rope Pushdown
	'cable pushdown': '93A552C6', // Triceps Pushdown
	'overhead extension': '2F8D3067', // Triceps Extension (Barbell)
	'french press': '2F8D3067', // Same as triceps extension
	'hack squat': 'AC5A4C58', // Hack Squat
	'stiff leg deadlift': '2A48E443', // Straight Leg Deadlift
	'good mornings': '4180C405', // Good Morning (Barbell)
	'machine hamstring curl': 'B8127AD1', // Lying Leg Curl (Machine)
	'nordic hamstring curl': '108D7A14', // Nordic Hamstrings Curls
	'lying leg curl': 'B8127AD1', // Lying Leg Curl (Machine)
	'leg extensions': '75A4F6C4', // Leg Extension (Machine)
	'sissy squats': 'F5DEF1EB', // Sissy Squat (Weighted)
	'bulgarian split squat': 'B5D3A742', // Bulgarian Split Squat
	'pullover': '67280085', // Pullover (Dumbbell)
	'reverse fly': 'E5988A0A', // Rear Delt Reverse Fly (Dumbbell)
	'pec deck': '9DCE2D64', // Butterfly (Pec Deck)  
	'cable crossover': '651F844C', // Cable Fly Crossovers
	'tricep dips': '28BB4A95', // Triceps Dip
	'walking': '33EDD7DB',
	'walk': '33EDD7DB',
	'light walk': '33EDD7DB',
	'elliptical': '3303376C',
	'elliptical trainer': '3303376C',
	'stationary bike': '43573BB8',
	'bike': '43573BB8',
	'cycling': 'D8F7F851',
	'cycle': 'D8F7F851',
	'air bike': '43573BB8',
	'rowing': '0222DB42',
	'rowing machine': '0222DB42',
	'row machine': '0222DB42',
	'rower': '0222DB42',
	'swimming': 'B60A678F',
	'swim': 'B60A678F',
	'boxing': 'A0D8FA1B',
	'jump rope': '040BA2E3',
	'jump ropes': '040BA2E3',
	'burpee': 'BB792A36',
	'burpees': 'BB792A36',
	'aerobics': '5E0DDACE',
	'hiit': '023947AB',
	'high intensity interval training': '023947AB',
	'sprints': '9283BABA',
	'sprint': '9283BABA',
	'cardio': 'AC1BB830', // Default to running

	// === MUSCLE GROUP DEFAULTS ===
	'chest': '79D0BB3A', // Default to bench press
	'back': '55E6546F', // Default to bent over row  
	'shoulders': '422B08F1', // Default to lateral raise
	'legs': 'D04AC939', // Default to squat
	'quads': '75A4F6C4', // Default to leg extension
	'hamstrings': 'B8127AD1', // Default to leg curl
	'biceps': 'A5AC6449', // Default to barbell curl
	'triceps': '93A552C6', // Default to pushdown
	'glutes': 'CDA23948', // Default to glute bridge
	'calves': '06745E58', // Default to standing calf raise
	'forearms': '1006DF48', // Default to wrist curl
	'neck': '22FEDCA4', // Default to neck curl
	'core': 'C6C9B8A0', // Default to plank


	// === EXERCISE TYPE DEFAULTS ===
	'press': '7B8D84E8', // Default to overhead press
	'row': '55E6546F', // Default to bent over row
	'extension': '2F8D3067', // Default to tricep extension
	'fly': '12017185', // Default to chest fly
	'raise': '422B08F1', // Default to lateral raise
};

/**
 * Get the muscle groups targeted by a given Hevy exercise ID
 * @param hevyExerciseId The Hevy exercise template ID
 * @returns Array of muscle groups targeted by this exercise
 */
export function getMuscleGroupsForExercise(hevyExerciseId: string): MuscleGroup[] {
	return EXERCISE_MUSCLE_GROUPS[hevyExerciseId] || [];
}

/**
 * Get the Hevy exercise ID for a given exercise name
 * @param exerciseName The name of the exercise (case-insensitive)
 * @returns The Hevy exercise template ID, or null if not found
 */
export function getHevyExerciseId(exerciseName: string): string | null {
	const normalizedName = exerciseName.toLowerCase().trim();
	return HEVY_EXERCISE_MAP[normalizedName] || null;
}

/**
 * Get both the Hevy ID and muscle groups for an exercise name
 * @param exerciseName The name of the exercise
 * @returns Object with hevyId and muscleGroups, or null if not found
 */
export function getExerciseInfo(exerciseName: string): { hevyId: string; muscleGroups: MuscleGroup[] } | null {
	const hevyId = getHevyExerciseId(exerciseName);
	if (!hevyId) return null;

	return {
		hevyId,
		muscleGroups: getMuscleGroupsForExercise(hevyId)
	};
}
