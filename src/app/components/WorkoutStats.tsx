'use client';

import { useState } from 'react';

interface MuscleGroupVolume {
	muscleGroup: string;
	actualSets: number;
	targetMin: number;
	targetMax?: number;
	deficit: number;
	lastWorkedDate?: Date;
	exercisesPerformed: string[];
	priorityScore: number;
}

interface WorkoutStatsProps {
	muscleGroupVolumes: MuscleGroupVolume[];
}

export default function WorkoutStats({ muscleGroupVolumes }: WorkoutStatsProps) {
	const [selectedMuscle, setSelectedMuscle] = useState<string | null>(null);

	const sortedByDeficit = muscleGroupVolumes
		.filter(v => v.deficit !== 0)
		.sort((a, b) => b.deficit - a.deficit);

	const topDeficits = sortedByDeficit.filter(v => v.deficit > 0).slice(0, 5);
	const completed = muscleGroupVolumes.filter(v => v.deficit <= 0);

	return (
		<div className="space-y-6">
			{/* Overview Cards */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
				<StatsCard
					title="Major Deficits"
					value={topDeficits.length}
					subtitle="Muscle groups behind target"
					color="text-red-400"
					bgColor="bg-red-900/20"
				/>
				<StatsCard
					title="Targets Met"
					value={completed.length}
					subtitle="On track muscle groups"
					color="text-green-400"
					bgColor="bg-green-900/20"
				/>
				<StatsCard
					title="Total Volume"
					value={muscleGroupVolumes.reduce((sum, v) => sum + v.actualSets, 0)}
					subtitle="Sets completed this week"
					color="text-purple-400"
					bgColor="bg-purple-900/20"
				/>
			</div>

			{/* Detailed Breakdown */}
			<div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-6">
				<h3 className="text-lg font-semibold text-white mb-4">Detailed Volume Breakdown</h3>

				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
					{/* Priority Deficits */}
					{topDeficits.length > 0 && (
						<div>
							<h4 className="text-md font-medium text-red-300 mb-3 flex items-center">
								🚨 Priority Deficits
							</h4>
							<div className="space-y-3">
								{topDeficits.map(volume => (
									<MuscleGroupCard
										key={volume.muscleGroup}
										volume={volume}
										onClick={() => setSelectedMuscle(
											selectedMuscle === volume.muscleGroup ? null : volume.muscleGroup
										)}
										isSelected={selectedMuscle === volume.muscleGroup}
									/>
								))}
							</div>
						</div>
					)}

					{/* Completed Targets */}
					{completed.length > 0 && (
						<div>
							<h4 className="text-md font-medium text-green-300 mb-3 flex items-center">
								✅ Targets Met
							</h4>
							<div className="space-y-3">
								{completed.slice(0, 5).map(volume => (
									<MuscleGroupCard
										key={volume.muscleGroup}
										volume={volume}
										onClick={() => setSelectedMuscle(
											selectedMuscle === volume.muscleGroup ? null : volume.muscleGroup
										)}
										isSelected={selectedMuscle === volume.muscleGroup}
									/>
								))}
							</div>
						</div>
					)}
				</div>
			</div>

			{/* Selected Muscle Details */}
			{selectedMuscle && (
				<MuscleGroupDetails
					volume={muscleGroupVolumes.find(v => v.muscleGroup === selectedMuscle)!}
					onClose={() => setSelectedMuscle(null)}
				/>
			)}
		</div>
	);
}

function StatsCard({ title, value, subtitle, color, bgColor }: {
	title: string;
	value: number;
	subtitle: string;
	color: string;
	bgColor: string;
}) {
	return (
		<div className={`${bgColor} backdrop-blur-sm border border-slate-700 rounded-lg p-4`}>
			<div className="text-center">
				<div className={`text-2xl font-bold ${color} mb-1`}>{value}</div>
				<div className="text-white font-medium text-sm mb-1">{title}</div>
				<div className="text-slate-400 text-xs">{subtitle}</div>
			</div>
		</div>
	);
}

function MuscleGroupCard({ volume, onClick, isSelected }: {
	volume: MuscleGroupVolume;
	onClick: () => void;
	isSelected: boolean;
}) {
	const isDeficit = volume.deficit > 0;
	const percentage = Math.min((volume.actualSets / volume.targetMin) * 100, 100);

	return (
		<div
			onClick={onClick}
			className={`cursor-pointer transition-all duration-200 rounded-lg p-3 ${isSelected
				? 'bg-slate-700 border border-purple-500'
				: 'bg-slate-800/30 border border-slate-600 hover:bg-slate-700/50'
				}`}
		>
			<div className="flex justify-between items-start mb-2">
				<span className="text-white font-medium text-sm">{volume.muscleGroup}</span>
				<span className={`text-xs px-2 py-1 rounded ${isDeficit ? 'bg-red-900/50 text-red-300' : 'bg-green-900/50 text-green-300'
					}`}>
					{isDeficit ? `-${volume.deficit}` : '✓'}
				</span>
			</div>

			<div className="flex justify-between items-center text-xs text-slate-400 mb-2">
				<span>{volume.actualSets}/{volume.targetMin} sets</span>
				<span>{Math.round(percentage)}%</span>
			</div>

			<div className="w-full bg-slate-600 rounded-full h-1.5">
				<div
					className={`h-1.5 rounded-full transition-all duration-300 ${isDeficit ? 'bg-red-500' : 'bg-green-500'
						}`}
					style={{ width: `${percentage}%` }}
				/>
			</div>

			{volume.lastWorkedDate && (
				<div className="text-xs text-slate-500 mt-1">
					Last: {new Date(volume.lastWorkedDate).toLocaleDateString()}
				</div>
			)}
		</div>
	);
}

function MuscleGroupDetails({ volume, onClose }: {
	volume: MuscleGroupVolume;
	onClose: () => void;
}) {
	return (
		<div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
			<div className="bg-slate-800 border border-slate-700 rounded-lg p-6 max-w-md w-full">
				<div className="flex justify-between items-start mb-4">
					<h3 className="text-lg font-semibold text-white">{volume.muscleGroup}</h3>
					<button
						onClick={onClose}
						className="text-slate-400 hover:text-white text-xl leading-none"
					>
						×
					</button>
				</div>

				<div className="space-y-4">
					{/* Progress */}
					<div>
						<div className="flex justify-between text-sm mb-2">
							<span className="text-slate-300">Weekly Volume</span>
							<span className="text-white">{volume.actualSets}/{volume.targetMin} sets</span>
						</div>
						<div className="w-full bg-slate-700 rounded-full h-3">
							<div
								className={`h-3 rounded-full ${volume.deficit <= 0 ? 'bg-green-500' : 'bg-red-500'
									}`}
								style={{ width: `${Math.min((volume.actualSets / volume.targetMin) * 100, 100)}%` }}
							/>
						</div>
					</div>

					{/* Priority Score */}
					<div className="flex justify-between">
						<span className="text-slate-300">Priority Score</span>
						<span className="text-white">{Math.round(volume.priorityScore)}/100</span>
					</div>

					{/* Last Worked */}
					{volume.lastWorkedDate && (
						<div className="flex justify-between">
							<span className="text-slate-300">Last Trained</span>
							<span className="text-white">
								{new Date(volume.lastWorkedDate).toLocaleDateString()}
							</span>
						</div>
					)}

					{/* Exercises Performed */}
					{volume.exercisesPerformed.length > 0 && (
						<div>
							<h4 className="text-slate-300 text-sm mb-2">Recent Exercises</h4>
							<div className="flex flex-wrap gap-2">
								{volume.exercisesPerformed.slice(0, 6).map((exercise, i) => (
									<span
										key={i}
										className="text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded"
									>
										{exercise}
									</span>
								))}
							</div>
						</div>
					)}

					{/* Status */}
					<div className={`p-3 rounded-lg ${volume.deficit <= 0 ? 'bg-green-900/30' : 'bg-red-900/30'
						}`}>
						<div className={`text-sm font-medium ${volume.deficit <= 0 ? 'text-green-300' : 'text-red-300'
							}`}>
							{volume.deficit <= 0 ? '✅ Target Met' : `⚠️ ${volume.deficit} Sets Behind`}
						</div>
						<div className="text-xs text-slate-400 mt-1">
							{volume.deficit <= 0
								? 'Great job! You\'ve hit your weekly target.'
								: `Add ${volume.deficit} more sets to meet your weekly goal.`
							}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
