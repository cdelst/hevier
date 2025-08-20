'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Dumbbell, 
  Settings, 
  Zap, 
  Target,
  Clock,
  Calendar,
  Play,
  RefreshCw,
  Loader2,
  CheckCircle2
} from 'lucide-react';

interface GeneratorState {
  workoutType: 'PUSH' | 'PULL' | 'LEGS' | 'AUTO';
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  duration: 30 | 45 | 60 | 90;
  focus: string[];
  includeCardio: boolean;
  includeAccessories: boolean;
}

export function RoutineGenerator() {
  const [settings, setSettings] = useState<GeneratorState>({
    workoutType: 'AUTO',
    difficulty: 'INTERMEDIATE',
    duration: 60,
    focus: [],
    includeCardio: true,
    includeAccessories: true
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedRoutine, setGeneratedRoutine] = useState<any>(null);
  const [previewMode, setPreviewMode] = useState(true);

  const focusOptions = [
    { id: 'strength', label: 'Strength', icon: '💪' },
    { id: 'hypertrophy', label: 'Hypertrophy', icon: '📈' },
    { id: 'endurance', label: 'Endurance', icon: '🏃' },
    { id: 'power', label: 'Power', icon: '⚡' }
  ];

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      // Simulate API call to generate routine
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Mock generated routine
      setGeneratedRoutine({
        workoutType: settings.workoutType === 'AUTO' ? 'PUSH' : settings.workoutType,
        date: new Date().toLocaleDateString(),
        exercises: [
          { name: 'Bench Press', sets: 4, reps: '6-8', rest: '3 min' },
          { name: 'Incline Dumbbell Press', sets: 3, reps: '8-10', rest: '2.5 min' },
          { name: 'Shoulder Press', sets: 3, reps: '8-12', rest: '2 min' },
          { name: 'Tricep Dips', sets: 3, reps: '10-15', rest: '90s' },
          ...(settings.includeAccessories ? [
            { name: 'Lateral Raises', sets: 3, reps: '12-15', rest: '60s' },
            { name: 'Tricep Extensions', sets: 2, reps: '12-15', rest: '60s' }
          ] : []),
          ...(settings.includeCardio ? [
            { name: 'Treadmill Walk', sets: 1, reps: '5 min', rest: '0s' }
          ] : [])
        ],
        estimatedDuration: settings.duration,
        difficulty: settings.difficulty
      });
    } catch (error) {
      console.error('Failed to generate routine:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCreateRoutine = async () => {
    if (!generatedRoutine) return;
    
    setIsGenerating(true);
    try {
      // Simulate creating routine in Hevy
      await new Promise(resolve => setTimeout(resolve, 2000));
      // Success feedback would be handled here
    } catch (error) {
      console.error('Failed to create routine:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Generator Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Routine Generator
          </CardTitle>
          <CardDescription>
            Customize your workout preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Workout Type */}
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3 block">
              Workout Type
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {[
                { value: 'AUTO', label: 'Auto Detect', icon: '🤖' },
                { value: 'PUSH', label: 'Push Day', icon: '💪' },
                { value: 'PULL', label: 'Pull Day', icon: '🎯' },
                { value: 'LEGS', label: 'Leg Day', icon: '🦵' }
              ].map((type) => (
                <button
                  key={type.value}
                  onClick={() => setSettings(prev => ({ ...prev, workoutType: type.value as any }))}
                  className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                    settings.workoutType === type.value
                      ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                      : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="text-lg mb-1">{type.icon}</div>
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* Duration */}
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3 block">
              Target Duration
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[30, 45, 60, 90].map((duration) => (
                <button
                  key={duration}
                  onClick={() => setSettings(prev => ({ ...prev, duration: duration as any }))}
                  className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                    settings.duration === duration
                      ? 'border-green-500 bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                      : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  {duration} min
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty */}
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3 block">
              Difficulty Level
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'BEGINNER', label: 'Beginner', color: 'green' },
                { value: 'INTERMEDIATE', label: 'Intermediate', color: 'yellow' },
                { value: 'ADVANCED', label: 'Advanced', color: 'red' }
              ].map((level) => (
                <button
                  key={level.value}
                  onClick={() => setSettings(prev => ({ ...prev, difficulty: level.value as any }))}
                  className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                    settings.difficulty === level.value
                      ? `border-${level.color}-500 bg-${level.color}-50 text-${level.color}-700 dark:bg-${level.color}-900/30 dark:text-${level.color}-300`
                      : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  {level.label}
                </button>
              ))}
            </div>
          </div>

          {/* Focus Areas */}
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3 block">
              Training Focus
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {focusOptions.map((focus) => (
                <button
                  key={focus.id}
                  onClick={() => {
                    setSettings(prev => ({
                      ...prev,
                      focus: prev.focus.includes(focus.id)
                        ? prev.focus.filter(f => f !== focus.id)
                        : [...prev.focus, focus.id]
                    }));
                  }}
                  className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                    settings.focus.includes(focus.id)
                      ? 'border-purple-500 bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
                      : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="text-lg mb-1">{focus.icon}</div>
                  {focus.label}
                </button>
              ))}
            </div>
          </div>

          {/* Options */}
          <div className="grid grid-cols-2 gap-4">
            <label className="flex items-center gap-3 p-3 border border-slate-200 dark:border-slate-700 rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800">
              <input
                type="checkbox"
                checked={settings.includeCardio}
                onChange={(e) => setSettings(prev => ({ ...prev, includeCardio: e.target.checked }))}
                className="rounded border-slate-300"
              />
              <span className="text-sm font-medium">Include Cardio</span>
            </label>
            
            <label className="flex items-center gap-3 p-3 border border-slate-200 dark:border-slate-700 rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800">
              <input
                type="checkbox"
                checked={settings.includeAccessories}
                onChange={(e) => setSettings(prev => ({ ...prev, includeAccessories: e.target.checked }))}
                className="rounded border-slate-300"
              />
              <span className="text-sm font-medium">Include Accessories</span>
            </label>
          </div>

          {/* Generate Button */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
            <Button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Generating Routine...
                </>
              ) : (
                <>
                  <Zap className="h-5 w-5 mr-2" />
                  Generate Routine
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Generated Routine Preview */}
      {generatedRoutine && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Generated Routine
              <Badge>{generatedRoutine.workoutType}</Badge>
            </CardTitle>
            <CardDescription>
              AI-generated workout based on your preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <Clock className="h-4 w-4" />
                <span>{generatedRoutine.estimatedDuration} minutes</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <Dumbbell className="h-4 w-4" />
                <span>{generatedRoutine.exercises.length} exercises</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <Calendar className="h-4 w-4" />
                <span>{generatedRoutine.date}</span>
              </div>
            </div>

            <div className="space-y-3">
              {generatedRoutine.exercises.map((exercise: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-medium flex items-center justify-center">
                      {index + 1}
                    </span>
                    <span className="font-medium">{exercise.name}</span>
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    {exercise.sets} × {exercise.reps}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
              <Button
                onClick={() => setPreviewMode(!previewMode)}
                variant="outline"
                className="flex-1"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Generate New
              </Button>
              <Button
                onClick={handleCreateRoutine}
                disabled={isGenerating}
                className="flex-1"
              >
                {isGenerating ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Play className="h-4 w-4 mr-2" />
                )}
                Create in Hevy
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
