'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navigation() {
	const pathname = usePathname();

	const navItems = [
		{ href: '/', label: 'Dashboard', icon: '🏠' },
		{ href: '/analytics', label: 'Analytics', icon: '📊' },
		{ href: '/settings', label: 'Settings', icon: '⚙️' },
	];

	return (
		<nav className="fixed top-0 left-0 right-0 bg-slate-900/80 backdrop-blur-sm border-b border-slate-700 z-40">
			<div className="container mx-auto px-4">
				<div className="flex items-center justify-between h-16">
					{/* Logo */}
					<Link href="/" className="flex items-center space-x-2">
						<div className="text-2xl">🏋️</div>
						<span className="text-xl font-bold text-white">Hevier</span>
					</Link>

					{/* Navigation Links */}
					<div className="hidden md:flex items-center space-x-1">
						{navItems.map((item) => (
							<Link
								key={item.href}
								href={item.href}
								className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${pathname === item.href
									? 'bg-purple-600 text-white'
									: 'text-slate-300 hover:text-white hover:bg-slate-800'
									}`}
							>
								<span>{item.icon}</span>
								<span className="font-medium">{item.label}</span>
							</Link>
						))}
					</div>

					{/* Mobile Menu Button */}
					<div className="md:hidden">
						<MobileMenu items={navItems} />
					</div>

					{/* Status Indicator */}
					<div className="hidden lg:flex items-center space-x-3">
						<div className="flex items-center text-sm text-slate-400">
							<div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
							<span>Live</span>
						</div>
					</div>
				</div>
			</div>
		</nav>
	);
}

function MobileMenu({ items }: { items: Array<{ href: string; label: string; icon: string }> }) {
	const [isOpen, setIsOpen] = useState(false);
	const pathname = usePathname();

	return (
		<>
			<button
				onClick={() => setIsOpen(!isOpen)}
				className="text-slate-300 hover:text-white p-2"
			>
				<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
					/>
				</svg>
			</button>

			{isOpen && (
				<div className="absolute top-16 left-0 right-0 bg-slate-900 border-b border-slate-700 md:hidden">
					<div className="px-4 py-2 space-y-1">
						{items.map((item) => (
							<Link
								key={item.href}
								href={item.href}
								onClick={() => setIsOpen(false)}
								className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${pathname === item.href
									? 'bg-purple-600 text-white'
									: 'text-slate-300 hover:text-white hover:bg-slate-800'
									}`}
							>
								<span>{item.icon}</span>
								<span className="font-medium">{item.label}</span>
							</Link>
						))}
					</div>
				</div>
			)}
		</>
	);
}

function useState<T>(initialState: T): [T, (value: T | ((prev: T) => T)) => void] {
	// This is a placeholder - in real React, this would be the actual useState hook
	// For now, just return the initial state and a no-op setter
	return [initialState, () => { }];
}
