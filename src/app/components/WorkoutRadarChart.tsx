'use client';

import { useMemo } from 'react';
import {
	RadarChart,
	PolarGrid,
	PolarAngleAxis,
	PolarRadiusAxis,
	Radar,
	ResponsiveContainer,
	Legend,
	Tooltip
} from 'recharts';

interface MuscleGroupVolume {
	muscleGroup: string;
	actualSets: number;
	targetMin: number;
	targetMax: number;
	deficit: number;
	surplus: number;
}

interface WorkoutRadarChartProps {
	muscleGroupVolumes: MuscleGroupVolume[];
	className?: string;
}

// Custom tooltip component
const CustomTooltip = ({ active, payload, label }: any) => {
	if (active && payload && payload.length) {
		const data = payload[0].payload;
		const completionColor = getCompletionColor(data.completionPercent);

		return (
			<div className="bg-white/98 dark:bg-slate-900/98 backdrop-blur-md border border-slate-200/80 dark:border-slate-700/80 rounded-xl p-4 shadow-2xl min-w-[200px]">
				<div className="flex items-center gap-2 mb-3">
					<div
						className="w-3 h-3 rounded-full"
						style={{ backgroundColor: completionColor }}
					/>
					<p className="font-bold text-slate-900 dark:text-slate-100 capitalize text-lg">
						{formatMuscleGroup(label)}
					</p>
				</div>
				<div className="space-y-2 text-sm">
					<div className="flex justify-between items-center">
						<span className="text-slate-600 dark:text-slate-400">Sets</span>
						<span className="font-semibold text-slate-900 dark:text-slate-100">
							{data.actualSets}/{data.targetMin}
						</span>
					</div>
					<div className="flex justify-between items-center">
						<span className="text-slate-600 dark:text-slate-400">Completion</span>
						<span
							className="font-bold"
							style={{ color: completionColor }}
						>
							{data.completionPercent}%
						</span>
					</div>
					{data.deficit > 0 && (
						<div className="pt-1 border-t border-slate-200 dark:border-slate-700">
							<p className="text-red-500 dark:text-red-400 text-center font-medium">
								Need {data.deficit} more sets
							</p>
						</div>
					)}
					{data.surplus > 0 && (
						<div className="pt-1 border-t border-slate-200 dark:border-slate-700">
							<p className="text-emerald-500 dark:text-emerald-400 text-center font-medium">
								+{data.surplus} sets over target
							</p>
						</div>
					)}
				</div>
			</div>
		);
	}
	return null;
};

// Custom tick formatter for angles  
const formatMuscleGroup = (tickItem: string) => {
	// Convert muscle group names to shorter, more readable format
	const shortNames: Record<string, string> = {
		'CHEST': 'Chest',
		'BACK': 'Back',
		'SHOULDERS': 'Shoulders',
		'BICEPS': 'Biceps',
		'TRICEPS': 'Triceps',
		'QUADS': 'Quads',
		'HAMSTRINGS': 'Hams',
		'GLUTES': 'Glutes',
		'CALVES': 'Calves',
		'ABS': 'Core',
		'FOREARMS': 'Forearms',
		'NECK': 'Neck',
		'CARDIO': 'Cardio'
	};

	return shortNames[tickItem] || tickItem.toLowerCase();
};

// Custom tick component for better control
const CustomAngleTick = (props: any) => {
	const { payload, x, y, textAnchor } = props;
	return (
		<g transform={`translate(${x},${y})`}>
			<text
				x={0}
				y={0}
				dy={6}
				textAnchor={textAnchor}
				fontSize="14"
				fontWeight="800"
				fill="#000000"
				stroke="#ffffff"
				strokeWidth="3"
				style={{ paintOrder: 'stroke fill' }}
				className="dark:fill-white dark:stroke-slate-900"
			>
				{formatMuscleGroup(payload.value)}
			</text>
		</g>
	);
};

// Get dynamic color based on completion percentage
const getCompletionColor = (completionPercent: number) => {
	if (completionPercent >= 100) return '#10b981'; // emerald-500 - complete
	if (completionPercent >= 80) return '#06b6d4';  // cyan-500 - close  
	if (completionPercent >= 60) return '#f59e0b';  // amber-500 - fair
	return '#ef4444'; // red-500 - needs work
};

export function WorkoutRadarChart({ muscleGroupVolumes, className = '' }: WorkoutRadarChartProps) {
	const chartData = useMemo(() => {
		const data = muscleGroupVolumes
			.filter(volume => volume.muscleGroup !== 'CARDIO') // Filter out cardio for cleaner radar
			.map(volume => {
				const completionPercent = Math.min(
					Math.round((volume.actualSets / volume.targetMin) * 100),
					120 // Cap at 120% for visual clarity
				);

				return {
					muscleGroup: volume.muscleGroup,
					completionPercent,
					actualSets: volume.actualSets,
					targetMin: volume.targetMin,
					targetMax: volume.targetMax,
					deficit: volume.deficit,
					surplus: volume.surplus,
					fill: getCompletionColor(completionPercent)
				};
			});

		// Debug: Log the chart data to see what muscle groups we have
		console.log('Radar Chart Data:', data);
		return data;
	}, [muscleGroupVolumes]);

	const maxValue = 120; // Max radius value

	return (
		<div className={`w-full ${className}`}>
			<div className="h-[500px] bg-gradient-to-br from-slate-50/30 via-slate-50/10 to-slate-100/20 dark:from-slate-900/40 dark:via-slate-800/20 dark:to-slate-900/30 rounded-2xl p-4 shadow-inner backdrop-blur-sm">
				<ResponsiveContainer width="100%" height="100%">
					<RadarChart
						data={chartData}
						margin={{ top: 80, right: 100, bottom: 80, left: 100 }}
					>
						<defs>
							<radialGradient id="radarFillGradient" cx="50%" cy="50%" r="50%">
								<stop offset="0%" stopColor="rgba(59, 130, 246, 0.15)" />
								<stop offset="100%" stopColor="rgba(59, 130, 246, 0.05)" />
							</radialGradient>
							<filter id="glow">
								<feGaussianBlur stdDeviation="2" result="coloredBlur" />
								<feMerge>
									<feMergeNode in="coloredBlur" />
									<feMergeNode in="SourceGraphic" />
								</feMerge>
							</filter>
						</defs>

						{/* Styled polar grid */}
						<PolarGrid
							stroke="rgb(148 163 184 / 0.4)"
							strokeWidth={1}
							className="dark:stroke-slate-500/40"
							radialLines={true}
						/>

						{/* Enhanced angle axis */}
						<PolarAngleAxis
							dataKey="muscleGroup"
							tick={<CustomAngleTick />}
							axisLine={false}
						/>

						{/* Radius axis with better styling */}
						<PolarRadiusAxis
							angle={90}
							domain={[0, maxValue]}
							tick={{
								fontSize: 11,
								fill: '#334155',
								fontWeight: 500,
								filter: 'drop-shadow(0 1px 2px rgb(0 0 0 / 0.1))'
							}}
							className="dark:fill-slate-200"
							tickFormatter={(value) => `${value}%`}
							axisLine={false}
						/>

						{/* Target reference circle at 100% */}
						<Radar
							name="Target (100%)"
							dataKey={() => 100}
							stroke="#10b981"
							fill="transparent"
							strokeWidth={2}
							strokeDasharray="8,4"
							dot={false}
							opacity={0.7}
						/>

						{/* Main completion radar with enhanced styling */}
						<Radar
							name="Your Progress"
							dataKey="completionPercent"
							stroke="#3b82f6"
							fill="url(#radarFillGradient)"
							fillOpacity={0.8}
							strokeWidth={3}
							dot={(props) => {
								const { cx, cy, payload, index } = props;
								const color = getCompletionColor(payload?.completionPercent || 0);
								const muscleGroup = payload?.muscleGroup || `muscle-${index}`;
								return (
									<g key={`radar-dot-${muscleGroup}`}>
										{/* Static ring for emphasis */}
										<circle
											key={`ring-${muscleGroup}`}
											cx={cx}
											cy={cy}
											r={8}
											fill="none"
											stroke={color}
											strokeWidth={1}
											opacity={0.2}
										/>
										{/* Main dot */}
										<circle
											key={`dot-${muscleGroup}`}
											cx={cx}
											cy={cy}
											r={6}
											fill={color}
											stroke="white"
											strokeWidth={2}
											filter="url(#glow)"
											className="drop-shadow-lg cursor-pointer transition-opacity duration-200 hover:opacity-80"
										/>
									</g>
								);
							}}
						/>

						<Tooltip content={<CustomTooltip />} />
						<Legend
							wrapperStyle={{
								paddingTop: '30px',
								fontSize: '13px',
								fontWeight: 500
							}}
							iconType="circle"
						/>
					</RadarChart>
				</ResponsiveContainer>
			</div>

			{/* Enhanced Status Legend */}
			<div className="mt-8 p-6 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl border border-slate-200/70 dark:border-slate-700/70 shadow-lg">
				<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
					<div className="flex items-center gap-3 p-3 bg-emerald-50/80 dark:bg-emerald-900/20 rounded-xl">
						<div className="w-4 h-4 rounded-full bg-emerald-500 shadow-sm"></div>
						<div>
							<div className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">Complete</div>
							<div className="text-xs text-emerald-600 dark:text-emerald-500">100%+</div>
						</div>
					</div>
					<div className="flex items-center gap-3 p-3 bg-cyan-50/80 dark:bg-cyan-900/20 rounded-xl">
						<div className="w-4 h-4 rounded-full bg-cyan-500 shadow-sm"></div>
						<div>
							<div className="text-sm font-semibold text-cyan-700 dark:text-cyan-400">Close</div>
							<div className="text-xs text-cyan-600 dark:text-cyan-500">80-99%</div>
						</div>
					</div>
					<div className="flex items-center gap-3 p-3 bg-amber-50/80 dark:bg-amber-900/20 rounded-xl">
						<div className="w-4 h-4 rounded-full bg-amber-500 shadow-sm"></div>
						<div>
							<div className="text-sm font-semibold text-amber-700 dark:text-amber-400">Fair</div>
							<div className="text-xs text-amber-600 dark:text-amber-500">60-79%</div>
						</div>
					</div>
					<div className="flex items-center gap-3 p-3 bg-red-50/80 dark:bg-red-900/20 rounded-xl">
						<div className="w-4 h-4 rounded-full bg-red-500 shadow-sm"></div>
						<div>
							<div className="text-sm font-semibold text-red-700 dark:text-red-400">Needs Work</div>
							<div className="text-xs text-red-600 dark:text-red-500">&lt;60%</div>
						</div>
					</div>
				</div>
			</div>

			{/* Enhanced Summary Stats */}
			<div className="mt-6 grid grid-cols-3 gap-6">
				<div className="text-center p-4 bg-emerald-50/60 dark:bg-emerald-900/20 rounded-xl border border-emerald-200/50 dark:border-emerald-700/30">
					<div className="text-2xl font-bold text-emerald-700 dark:text-emerald-400 mb-1">
						{chartData.filter(d => d.completionPercent >= 100).length}
					</div>
					<div className="text-sm font-medium text-emerald-600 dark:text-emerald-500">Complete</div>
					<div className="text-xs text-emerald-500 dark:text-emerald-400 mt-1">Muscle Groups</div>
				</div>
				<div className="text-center p-4 bg-cyan-50/60 dark:bg-cyan-900/20 rounded-xl border border-cyan-200/50 dark:border-cyan-700/30">
					<div className="text-2xl font-bold text-cyan-700 dark:text-cyan-400 mb-1">
						{chartData.filter(d => d.completionPercent >= 80 && d.completionPercent < 100).length}
					</div>
					<div className="text-sm font-medium text-cyan-600 dark:text-cyan-500">Close</div>
					<div className="text-xs text-cyan-500 dark:text-cyan-400 mt-1">Almost There</div>
				</div>
				<div className="text-center p-4 bg-red-50/60 dark:bg-red-900/20 rounded-xl border border-red-200/50 dark:border-red-700/30">
					<div className="text-2xl font-bold text-red-700 dark:text-red-400 mb-1">
						{chartData.filter(d => d.completionPercent < 80).length}
					</div>
					<div className="text-sm font-medium text-red-600 dark:text-red-500">Behind</div>
					<div className="text-xs text-red-500 dark:text-red-400 mt-1">Need Focus</div>
				</div>
			</div>
		</div>
	);
}
