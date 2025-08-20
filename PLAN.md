# Hevier - Workout Tracker & Suggestion App

## Project Overview

**Goal**: Build a smart workout tracker and suggester that integrates with Hevy API to analyze the last 7 days of workouts and suggest optimal routines based on push/pull/legs splits and weekly volume requirements.

**Current Stack**: 
- Next.js 15 (App Router)
- Firebase (Hosting via App Hosting, future: Firestore, Auth)
- TypeScript
- React 19

## Core Features

### 1. Hevy API Integration
- **Authentication**: API token-based authentication (personal use)  
- **Data Fetching**: Pull workout history from last 7-14 days
- **Workout Parsing**: Map Hevy exercises to reference chart categories
- **Real-time Updates**: Webhook notifications for instant workout sync 🔔
- **Webhook Endpoint**: `/api/webhook/hevy` receives POST notifications when workouts are completed

### 2. Workout Analysis Engine
- **Volume Tracking**: Calculate sets per week for each muscle group
- **Progress Monitoring**: Compare actual vs. target volumes from reference chart
- **Recovery Analysis**: Track workout frequency and muscle group recovery
- **Deficit Detection**: Identify undertrained muscle groups

### 3. Smart Suggestion System
- **Push/Pull/Legs Split**: Intelligent workout suggestions based on split
- **Volume Balancing**: Prioritize muscle groups with volume deficits
- **Exercise Selection**: Choose from reference chart based on STRENGTH/HYPERTROPHY tags
- **Rep Range Optimization**: Suggest appropriate rep ranges for goals

### 4. User Interface
- **Dashboard**: Weekly volume overview with progress indicators
- **Today's Workout**: AI-generated workout suggestion for current day
- **History View**: 7-day workout history with analysis
- **Settings**: Configure goals, preferences, and Hevy connection

## Technical Architecture

### Data Models

#### User Profile (Single User App)
```typescript
interface UserProfile {
  id: string;
  hevyApiToken?: string;
  preferences: {
    primaryGoal: 'STRENGTH' | 'HYPERTROPHY' | 'MIXED';
    workoutDays: number; // 3-6 days per week
    splitPreference: 'PPL' | 'UPPER_LOWER' | 'FULL_BODY';
  };
  createdAt: Date;
  lastSync: Date;
}
```

#### Workout Session
```typescript
interface WorkoutSession {
  id: string;
  userId: string;
  hevyWorkoutId?: string;
  date: Date;
  type: 'PUSH' | 'PULL' | 'LEGS' | 'UPPER' | 'LOWER' | 'FULL';
  exercises: Exercise[];
  duration?: number;
  notes?: string;
}
```

#### Exercise
```typescript
interface Exercise {
  hevyExerciseId?: string;
  name: string;
  muscleGroups: MuscleGroup[];
  category: string; // From reference chart
  sets: ExerciseSet[];
}

interface ExerciseSet {
  reps: number;
  weight?: number;
  rpe?: number; // Rate of Perceived Exertion
}
```

#### Weekly Analysis
```typescript
interface WeeklyAnalysis {
  userId: string;
  weekStart: Date;
  muscleGroupVolumes: {
    [key in MuscleGroup]: {
      actualSets: number;
      targetMin: number;
      targetMax: number;
      deficit: number;
      exercises: string[];
    }
  };
  suggestions: WorkoutSuggestion[];
  overallScore: number; // 0-100
}
```

### API Structure

#### Hevy Integration Service
- `setApiToken()`: Configure API token for authentication
- `syncWorkouts()`: Fetch and store recent workouts
- `mapHevyExercise()`: Map Hevy exercise to reference chart
- `parseWorkoutData()`: Convert Hevy format to internal format

#### Analysis Service
- `calculateWeeklyVolume()`: Analyze last 7 days
- `identifyDeficits()`: Find undertrained muscle groups
- `generateSuggestions()`: Create workout recommendations
- `optimizeExerciseSelection()`: Choose exercises based on goals

#### Suggestion Engine
- `determinWorkoutType()`: Push/Pull/Legs for today
- `selectExercises()`: Choose exercises for session
- `calculateTargetVolume()`: Set/rep recommendations
- `balanceMuscleGroups()`: Ensure balanced development

## Reference Chart Integration

The `reference_cheatsheet.json` defines:
- **Muscle Groups**: 15 categories (CHEST, BACK, SHOULDERS, etc.)
- **Weekly Targets**: Min/max sets per week for each muscle group
- **Exercise Categories**: STRENGTH (5-15 reps), HYPERTROPHY (12-30 reps), OPTIONAL
- **Exercise Examples**: Specific movements for each category

### Key Muscle Group Targets
- **High Volume**: Neck (18+ sets), Shoulders (15-21 sets), Back (12-24 sets)
- **Moderate Volume**: Chest, Biceps, Quads, Hamstrings (12-18 sets)
- **Lower Volume**: Triceps (9-15 sets), Glutes (6-12 sets), Abs (6-12 sets)

## Development Phases

### Phase 1: Foundation (Week 1) ✅
- [x] ~~Project setup and architecture~~
- [x] ~~Reference chart integration~~
- [x] ~~TypeScript types and data models~~  
- [x] ~~Hevy API service (token-based auth)~~
- [x] ~~Workout analyzer service~~
- [x] ~~Workout suggestion engine~~
- [x] ~~Webhook endpoint for real-time notifications~~ 🔔
- [ ] Firebase setup (Firestore for data persistence) - Optional
- [ ] Basic UI components and routing

### Phase 2: Hevy Integration (Week 2)
- [ ] Hevy OAuth implementation
- [ ] Workout data fetching and parsing
- [ ] Exercise mapping to reference chart
- [ ] Data persistence in Firestore

### Phase 3: Analysis Engine (Week 3)
- [ ] Weekly volume calculation
- [ ] Muscle group deficit detection
- [ ] Push/Pull/Legs split logic
- [ ] Exercise selection algorithms

### Phase 4: UI Development (Week 4)
- [ ] Dashboard with weekly overview
- [ ] Today's workout suggestion page
- [ ] Workout history and analysis
- [ ] Settings and preferences

### Phase 5: Enhancement (Week 5)
- [ ] Notification system
- [ ] Advanced analytics
- [ ] Export/sharing features
- [ ] Mobile responsiveness

### Phase 6: Testing & Deployment (Week 6)
- [ ] Unit and integration testing
- [ ] User acceptance testing
- [ ] Performance optimization
- [ ] Production deployment

## Hevy API Integration Details

### Authentication Flow (Simplified for Personal Use)
1. User enters Hevy API token in settings
2. Token stored in environment variables or local config
3. API token used for all Hevy API requests
4. Fetch initial workout data

### Webhook Integration (Real-time Updates) 🔔
1. Configure webhook URL in Hevy: `https://yourapp.com/api/webhook/hevy`
2. Hevy sends POST notification when workout is completed
3. App automatically fetches new workout details
4. Re-analyzes weekly volume and updates suggestions instantly
5. User sees updated recommendations immediately

### Data Sync Strategy
- **Initial Sync**: Last 30 days of workouts
- **Regular Sync**: Check for new workouts every 6 hours
- **Incremental Updates**: Only fetch workouts since last sync
- **Backup Strategy**: Store raw Hevy data for re-processing

### Exercise Mapping
Map Hevy exercise names to reference chart categories using:
- **Exact Matching**: Direct name matches
- **Keyword Matching**: Search for key terms in exercise names
- **Manual Mapping**: User-corrected mappings stored persistently
- **AI Assistance**: Use LLM for ambiguous exercise classification

## Success Metrics

### User Engagement
- Daily active users
- Workout tracking frequency
- Suggestion acceptance rate

### Accuracy Metrics
- Exercise mapping accuracy (>95%)
- Volume calculation precision
- User satisfaction with suggestions

### Technical Metrics
- API response times (<500ms)
- Data sync reliability (99.9%)
- App performance scores

## Deployment Strategy

### Firebase App Hosting
- **Staging**: Automatic deployments from `develop` branch
- **Production**: Manual deployments from `main` branch
- **Environment Variables**: Hevy API keys, Firebase config
- **Custom Domain**: Configure once ready for production

### Monitoring
- Firebase Analytics for user behavior
- Error tracking with Firebase Crashlytics
- Performance monitoring for Core Web Vitals
- Custom metrics for workout analysis accuracy

## Future Enhancements

### Advanced Features
- **AI Coach**: Personalized training advice
- **Progress Photos**: Visual progress tracking
- **Community**: Share workouts and compete
- **Wearable Integration**: Heart rate, sleep data

### Integrations
- **MyFitnessPal**: Nutrition tracking
- **Strava**: Cardio activity sync
- **Apple Health/Google Fit**: Comprehensive health data

---

## Current Status: Phase 1 Complete + Real-time Webhooks! 
**Last Updated**: December 2024  
**Next Milestone**: Build core UI components and dashboard

### Phase 1 Completed ✅
- ✅ TypeScript types and data models
- ✅ Hevy API integration service
- ✅ Reference chart parsing utilities  
- ✅ Workout analysis engine
- ✅ Workout suggestion system
- ✅ **Real-time webhook integration** 🔔
- ✅ Architecture simplified for single-user app

### Real-time Capabilities Added 🚀
- **Instant Notifications**: Get notified the moment you complete a workout
- **Automatic Analysis**: Weekly volume recalculated immediately
- **Updated Suggestions**: New workout recommendations generated in real-time
- **Zero Delay**: No more waiting for periodic syncs!

### Research Findings
- **Hevy API**: Uses API token authentication (personal use) - much simpler than OAuth
- **Reference Chart**: Comprehensive workout structure with 15 muscle groups and weekly volume targets
- **Current Stack**: Next.js 15 + Firebase App Hosting already configured
- **Architecture**: Single-user app significantly simplifies data models and authentication

## Notes
- Reference chart provides comprehensive exercise database
- Hevy API rate limits and authentication requirements need investigation
- Consider user privacy and data security throughout development
- Plan for offline functionality in future versions
