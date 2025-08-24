'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Dumbbell,
  TrendingUp,
  Calendar,
  Play,
  BarChart3,
  Zap,
  Target,
  Clock,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { WorkoutAnalysis } from './components/WorkoutAnalysis';
import { WorkoutSuggestion } from './components/WorkoutSuggestion';
import { RecentWorkouts } from './components/RecentWorkouts';
import { RoutineGenerator } from './components/RoutineGenerator';

interface DashboardData {
  analysis?: any;
  suggestion?: any;
  recentWorkouts?: any[];
  loading: boolean;
  lastUpdated?: string;
}

// Determine workout type based on exercises and muscle groups
function determineWorkoutType(exercises: any[]): string {
  if (!exercises || exercises.length === 0) return 'MIXED';

  const pushMuscles = ['CHEST', 'SHOULDERS', 'TRICEPS'];
  const pullMuscles = ['BACK', 'BICEPS', 'REAR_DELTS'];
  const legMuscles = ['QUADS', 'HAMSTRINGS', 'GLUTES', 'CALVES'];

  let pushSets = 0;
  let pullSets = 0;
  let legSets = 0;
  let totalSets = 0;

  exercises.forEach(exercise => {
    const sets = exercise.sets || 0;
    const muscleGroups = exercise.muscleGroups || [];

    totalSets += sets;

    muscleGroups.forEach((muscle: string) => {
      if (pushMuscles.includes(muscle)) pushSets += sets;
      else if (pullMuscles.includes(muscle)) pullSets += sets;
      else if (legMuscles.includes(muscle)) legSets += sets;
    });
  });

  if (totalSets === 0) return 'MIXED';

  // Determine majority (>60% threshold for classification)
  const pushPercent = (pushSets / totalSets) * 100;
  const pullPercent = (pullSets / totalSets) * 100;
  const legPercent = (legSets / totalSets) * 100;

  if (pushPercent > 60) return 'PUSH';
  if (pullPercent > 60) return 'PULL';
  if (legPercent > 60) return 'LEGS';

  return 'MIXED'; // If no single type dominates
}

export default function HevierDashboard() {
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [data, setData] = useState<DashboardData>({ loading: true });

  // Load data from unified API service
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        console.log('📊 Loading dashboard from unified workout API...');
        const response = await fetch('/api/workouts');

        if (response.ok) {
          const result = await response.json();

          if (result.success) {
            // Transform unified API response to dashboard format
            const transformedWorkouts = result.data.workouts.slice(0, 10).map((workout: any) => ({
              id: workout.id,
              date: workout.date, // Keep as string
              exercises: workout.exercises, // Keep full exercise details
              totalDuration: workout.totalDuration || 0,
              type: determineWorkoutType(workout.exercises),
              totalSets: workout.exercises.reduce((total: number, ex: any) => total + (ex.sets || 0), 0)
            }));

            const dashboardData = {
              analysis: result.data.analysis,
              suggestion: result.data.suggestion, // Now using suggestions from unified API
              recentWorkouts: transformedWorkouts,
              loading: false,
              lastUpdated: result.data.metadata.fetchedAt,
            };

            setData(dashboardData);
            console.log(`✅ Dashboard loaded: ${result.data.workouts.length} workouts, ${result.data.analysis.overallScore}% score`);
          } else {
            throw new Error(result.message || 'Unified API returned error');
          }
        } else {
          throw new Error(`API call failed: ${response.status} ${response.statusText}`);
        }

        setError(null);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
        setError('Failed to load workout data');
        // Fallback to loading state instead of mock data
        setData({ loading: false });
      }
    };

    loadDashboardData();
  }, []);

  if (data.loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-pulse-slow">
              <Dumbbell className="h-12 w-12 text-blue-500" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-500 rounded-lg">
              <Dumbbell className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                Hevier AI
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                Intelligent Workout Planning & Analysis
              </p>
            </div>
          </div>

          {data.lastUpdated && (
            <div className="text-sm text-slate-500 dark:text-slate-400">
              Last updated: {new Date(data.lastUpdated).toLocaleString()}
            </div>
          )}
        </div>

        {error && (
          <Card className="mb-6 border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                <AlertTriangle className="h-4 w-4" />
                <span>{error}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    Overall Score
                  </p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {data.analysis?.overallScore || 0}%
                  </p>
                </div>
                <Target className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    Workouts Last 14 Days
                  </p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {data.analysis?.totalWorkouts || 0}
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    Next Workout
                  </p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {data.suggestion?.workoutType || 'N/A'}
                  </p>
                </div>
                <Zap className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    Est. Duration
                  </p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {data.suggestion?.estimatedDuration || 0}m
                  </p>
                </div>
                <Clock className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-6">
          <div className="flex space-x-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'analysis', label: 'Analysis', icon: TrendingUp },
              { id: 'suggestion', label: 'Next Workout', icon: Play },
              { id: 'generator', label: 'Generate Routine', icon: Dumbbell },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === tab.id
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <WorkoutAnalysis analysis={data.analysis} />
              <RecentWorkouts workouts={data.recentWorkouts} />
            </div>
          )}

          {activeTab === 'analysis' && (
            <WorkoutAnalysis analysis={data.analysis} detailed />
          )}

          {activeTab === 'suggestion' && (
            <WorkoutSuggestion suggestion={data.suggestion} />
          )}

          {activeTab === 'generator' && (
            <RoutineGenerator />
          )}
        </div>
      </div>
    </div>
  );
}