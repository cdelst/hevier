'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function SettingsPage() {
	const [apiToken, setApiToken] = useState('');
	const [preferences, setPreferences] = useState({
		splitPreference: 'PPL',
		primaryGoal: 'HYPERTROPHY',
		workoutDaysPerWeek: 5,
		experienceLevel: 'INTERMEDIATE',
	});
	const [webhookUrl, setWebhookUrl] = useState('');
	const [saving, setSaving] = useState(false);

	const handleSave = async () => {
		setSaving(true);
		// In a real app, you'd save these to your backend/localStorage
		setTimeout(() => setSaving(false), 1000);
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
			<div className="container mx-auto px-4 py-8 max-w-2xl">
				{/* Header */}
				<header className="mb-8">
					<nav className="flex items-center space-x-4 mb-6">
						<Link
							href="/"
							className="text-purple-400 hover:text-purple-300 font-medium"
						>
							← Dashboard
						</Link>
						<span className="text-slate-500">/</span>
						<span className="text-white">Settings</span>
					</nav>

					<h1 className="text-4xl font-bold text-white mb-2">
						⚙️ Settings
					</h1>
					<p className="text-slate-300">
						Configure your Hevier experience and integrations
					</p>
				</header>

				<div className="space-y-8">
					{/* Hevy Integration */}
					<SettingsCard title="🔗 Hevy Integration" description="Connect your Hevy account for workout data">
						<div className="space-y-4">
							<div>
								<label className="block text-sm font-medium text-slate-300 mb-2">
									API Token
								</label>
								<input
									type="password"
									value={apiToken}
									onChange={(e) => setApiToken(e.target.value)}
									placeholder="Enter your Hevy API token"
									className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:border-purple-500 focus:outline-none"
								/>
								<p className="text-xs text-slate-500 mt-2">
									Get your API token from your Hevy account settings
								</p>
							</div>

							<div>
								<label className="block text-sm font-medium text-slate-300 mb-2">
									Webhook URL
								</label>
								<div className="flex">
									<input
										type="text"
										value={webhookUrl || `${window.location.origin}/api/webhook/hevy`}
										onChange={(e) => setWebhookUrl(e.target.value)}
										className="flex-1 bg-slate-800 border border-slate-600 rounded-l-lg px-4 py-3 text-white focus:border-purple-500 focus:outline-none"
										readOnly
									/>
									<button
										onClick={() => navigator.clipboard.writeText(`${window.location.origin}/api/webhook/hevy`)}
										className="bg-purple-600 hover:bg-purple-700 border border-purple-600 rounded-r-lg px-4 py-3 text-white text-sm transition-colors"
									>
										Copy
									</button>
								</div>
								<p className="text-xs text-slate-500 mt-2">
									Configure this URL in your Hevy webhook settings for real-time updates
								</p>
							</div>

							<TestConnectionButton />
						</div>
					</SettingsCard>

					{/* Workout Preferences */}
					<SettingsCard title="🏋️ Workout Preferences" description="Customize your training recommendations">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
								<label className="block text-sm font-medium text-slate-300 mb-2">
									Split Preference
								</label>
								<select
									value={preferences.splitPreference}
									onChange={(e) => setPreferences({ ...preferences, splitPreference: e.target.value })}
									className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 text-white focus:border-purple-500 focus:outline-none"
								>
									<option value="PPL">Push/Pull/Legs</option>
									<option value="UPPER_LOWER">Upper/Lower</option>
									<option value="FULL_BODY">Full Body</option>
								</select>
							</div>

							<div>
								<label className="block text-sm font-medium text-slate-300 mb-2">
									Primary Goal
								</label>
								<select
									value={preferences.primaryGoal}
									onChange={(e) => setPreferences({ ...preferences, primaryGoal: e.target.value })}
									className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 text-white focus:border-purple-500 focus:outline-none"
								>
									<option value="STRENGTH">Strength</option>
									<option value="HYPERTROPHY">Hypertrophy</option>
									<option value="MIXED">Mixed</option>
								</select>
							</div>

							<div>
								<label className="block text-sm font-medium text-slate-300 mb-2">
									Workout Days per Week
								</label>
								<select
									value={preferences.workoutDaysPerWeek}
									onChange={(e) => setPreferences({ ...preferences, workoutDaysPerWeek: parseInt(e.target.value) })}
									className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 text-white focus:border-purple-500 focus:outline-none"
								>
									<option value={3}>3 Days</option>
									<option value={4}>4 Days</option>
									<option value={5}>5 Days</option>
									<option value={6}>6 Days</option>
								</select>
							</div>

							<div>
								<label className="block text-sm font-medium text-slate-300 mb-2">
									Experience Level
								</label>
								<select
									value={preferences.experienceLevel}
									onChange={(e) => setPreferences({ ...preferences, experienceLevel: e.target.value })}
									className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 text-white focus:border-purple-500 focus:outline-none"
								>
									<option value="BEGINNER">Beginner</option>
									<option value="INTERMEDIATE">Intermediate</option>
									<option value="ADVANCED">Advanced</option>
								</select>
							</div>
						</div>
					</SettingsCard>

					{/* Reference Chart Info */}
					<SettingsCard title="📊 Training Targets" description="Weekly volume recommendations">
						<div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
							<div className="bg-slate-700/30 rounded p-3">
								<div className="text-slate-300 mb-1">Chest</div>
								<div className="text-white font-medium">12-20 sets/week</div>
							</div>
							<div className="bg-slate-700/30 rounded p-3">
								<div className="text-slate-300 mb-1">Back</div>
								<div className="text-white font-medium">12-24 sets/week</div>
							</div>
							<div className="bg-slate-700/30 rounded p-3">
								<div className="text-slate-300 mb-1">Shoulders</div>
								<div className="text-white font-medium">15-21 sets/week</div>
							</div>
							<div className="bg-slate-700/30 rounded p-3">
								<div className="text-slate-300 mb-1">Biceps</div>
								<div className="text-white font-medium">12-20 sets/week</div>
							</div>
							<div className="bg-slate-700/30 rounded p-3">
								<div className="text-slate-300 mb-1">Triceps</div>
								<div className="text-white font-medium">9-15 sets/week</div>
							</div>
							<div className="bg-slate-700/30 rounded p-3">
								<div className="text-slate-300 mb-1">Legs</div>
								<div className="text-white font-medium">12-18 sets/week</div>
							</div>
						</div>
					</SettingsCard>

					{/* App Info */}
					<SettingsCard title="ℹ️ About Hevier" description="Intelligent workout analysis and suggestions">
						<div className="space-y-3 text-sm text-slate-300">
							<div className="flex justify-between">
								<span>Version</span>
								<span className="text-white">1.0.0</span>
							</div>
							<div className="flex justify-between">
								<span>Data Source</span>
								<span className="text-purple-400">Hevy API</span>
							</div>
							<div className="flex justify-between">
								<span>Analysis Engine</span>
								<span className="text-green-400">Active</span>
							</div>
							<div className="flex justify-between">
								<span>Real-time Updates</span>
								<span className="text-green-400">Webhook Enabled</span>
							</div>
						</div>
					</SettingsCard>

					{/* Save Button */}
					<div className="flex justify-center">
						<button
							onClick={handleSave}
							disabled={saving}
							className={`px-8 py-3 rounded-lg font-medium transition-all ${saving
								? 'bg-slate-600 text-slate-400 cursor-not-allowed'
								: 'bg-purple-600 hover:bg-purple-700 text-white hover:shadow-lg hover:shadow-purple-500/25'
								}`}
						>
							{saving ? 'Saving...' : 'Save Settings'}
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}

function SettingsCard({ title, description, children }: {
	title: string;
	description: string;
	children: React.ReactNode;
}) {
	return (
		<div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-6">
			<div className="mb-4">
				<h2 className="text-lg font-semibold text-white mb-1">{title}</h2>
				<p className="text-sm text-slate-400">{description}</p>
			</div>
			{children}
		</div>
	);
}

function TestConnectionButton() {
	const [testing, setTesting] = useState(false);
	const [result, setResult] = useState<string | null>(null);

	const testConnection = async () => {
		setTesting(true);
		setResult(null);

		try {
			// Test the webhook endpoint
			const response = await fetch('/api/webhook/hevy', {
				method: 'OPTIONS'
			});

			if (response.ok) {
				setResult('✅ Connection successful!');
			} else {
				setResult('❌ Connection failed');
			}
		} catch (error) {
			setResult('❌ Connection error');
		} finally {
			setTesting(false);
		}
	};

	return (
		<div className="flex items-center space-x-4">
			<button
				onClick={testConnection}
				disabled={testing}
				className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${testing
					? 'bg-slate-600 text-slate-400 cursor-not-allowed'
					: 'bg-blue-600 hover:bg-blue-700 text-white'
					}`}
			>
				{testing ? 'Testing...' : 'Test Connection'}
			</button>

			{result && (
				<span className={`text-sm ${result.includes('✅') ? 'text-green-400' : 'text-red-400'
					}`}>
					{result}
				</span>
			)}
		</div>
	);
}
