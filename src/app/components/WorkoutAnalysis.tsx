'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Target, CheckCircle2, AlertTriangle } from 'lucide-react';

interface MuscleGroupVolume {
  muscleGroup: string;
  actualSets: number;
  targetMin: number;
  targetMax: number;
  deficit: number;
  surplus: number;
}

interface Analysis {
  muscleGroupVolumes: MuscleGroupVolume[];
  overallScore: number;
  totalWorkouts: number;
  recommendations?: string[];
}

interface WorkoutAnalysisProps {
  analysis?: Analysis;
  detailed?: boolean;
}

export function WorkoutAnalysis({ analysis, detailed = false }: WorkoutAnalysisProps) {
  if (!analysis) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Workout Analysis
          </CardTitle>
          <CardDescription>
            No analysis data available
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-slate-500">
            Connect to Hevy to see your workout analysis
          </div>
        </CardContent>
      </Card>
    );
  }

  const getStatusColor = (volume: MuscleGroupVolume) => {
    if (volume.deficit > 0) return 'text-red-500';
    if (volume.surplus > 5) return 'text-yellow-500';
    return 'text-green-500';
  };

  const getStatusIcon = (volume: MuscleGroupVolume) => {
    if (volume.deficit > 0) return <AlertTriangle className="h-4 w-4" />;
    return <CheckCircle2 className="h-4 w-4" />;
  };

  const getProgressColor = (volume: MuscleGroupVolume) => {
    if (volume.deficit > 0) return 'bg-red-500';
    if (volume.surplus > 5) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const calculateProgress = (volume: MuscleGroupVolume) => {
    return Math.min((volume.actualSets / volume.targetMin) * 100, 100);
  };

  const priorityMuscles = analysis.muscleGroupVolumes
    .filter(v => v.deficit > 0)
    .sort((a, b) => b.deficit - a.deficit)
    .slice(0, 3);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Workout Analysis
            <Badge variant={analysis.overallScore >= 70 ? "default" : "destructive"}>
              {analysis.overallScore}% Complete
            </Badge>
          </CardTitle>
          <CardDescription>
            Weekly volume targets vs actual performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Overall Progress Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Overall Progress</span>
                <span>{analysis.overallScore}%</span>
              </div>
              <Progress 
                value={analysis.overallScore} 
                className="h-2"
              />
            </div>

            {/* Priority Areas (if any deficits) */}
            {priorityMuscles.length > 0 && (
              <div className="mt-6">
                <h4 className="text-sm font-medium mb-3 text-slate-700 dark:text-slate-300">
                  Priority Areas
                </h4>
                <div className="grid gap-2">
                  {priorityMuscles.map((volume) => (
                    <div 
                      key={volume.muscleGroup}
                      className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800"
                    >
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                        <span className="font-medium text-sm">
                          {volume.muscleGroup.toLowerCase()}
                        </span>
                      </div>
                      <Badge variant="destructive" className="text-xs">
                        -{volume.deficit} sets
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Muscle Group Breakdown */}
            {detailed && (
              <div className="mt-6">
                <h4 className="text-sm font-medium mb-4 text-slate-700 dark:text-slate-300">
                  Detailed Breakdown
                </h4>
                <div className="space-y-3">
                  {analysis.muscleGroupVolumes.map((volume) => (
                    <div key={volume.muscleGroup} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={getStatusColor(volume)}>
                            {getStatusIcon(volume)}
                          </div>
                          <span className="font-medium text-sm">
                            {volume.muscleGroup.toLowerCase()}
                          </span>
                        </div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">
                          {volume.actualSets}/{volume.targetMin} sets
                        </div>
                      </div>
                      <Progress 
                        value={calculateProgress(volume)}
                        className="h-2"
                      />
                      {volume.deficit > 0 && (
                        <div className="text-xs text-red-600 dark:text-red-400">
                          Need {volume.deficit} more sets
                        </div>
                      )}
                      {volume.surplus > 5 && (
                        <div className="text-xs text-yellow-600 dark:text-yellow-400">
                          {volume.surplus} sets over target
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations */}
            {analysis.recommendations && analysis.recommendations.length > 0 && (
              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <h4 className="text-sm font-medium mb-2 text-blue-700 dark:text-blue-300">
                  Recommendations
                </h4>
                <ul className="space-y-1">
                  {analysis.recommendations.map((rec, index) => (
                    <li key={index} className="text-sm text-blue-600 dark:text-blue-400">
                      • {rec}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
