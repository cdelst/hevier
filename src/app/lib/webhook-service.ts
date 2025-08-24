// Webhook management service for Hevy integration
import { HevyAPIService } from './hevy-api';

export interface WebhookSubscription {
	id: string;
	url: string;
	events: string[];
	active: boolean;
	createdAt: Date;
}

export class WebhookService {
	private hevyAPI: HevyAPIService;
	private baseUrl: string;

	constructor(apiToken?: string, baseUrl?: string) {
		this.hevyAPI = new HevyAPIService(apiToken);
		this.baseUrl = baseUrl || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
	}

	/**
	 * Subscribe to Hevy webhooks
	 */
	async subscribeToWebhooks(): Promise<WebhookSubscription> {
		const webhookUrl = `${this.baseUrl}/api/webhook/hevy`;

		console.log(`🔔 Subscribing to Hevy webhooks at: ${webhookUrl}`);

		try {
			// Note: This is a hypothetical endpoint - adjust based on actual Hevy API
			const response = await fetch('https://api.hevyapp.com/v1/webhooks', {
				method: 'POST',
				headers: {
					'api-key': process.env.HEVY_API_TOKEN || '',
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					url: webhookUrl,
					events: ['workout.created', 'workout.updated'],
				}),
			});

			if (!response.ok) {
				throw new Error(`Failed to subscribe to webhooks: ${response.statusText}`);
			}

			const webhookData = await response.json();

			return {
				id: webhookData.id || 'unknown',
				url: webhookUrl,
				events: ['workout.created'],
				active: true,
				createdAt: new Date(),
			};

		} catch (error) {
			console.error('❌ Failed to subscribe to webhooks:', error);
			throw error;
		}
	}

	/**
	 * Unsubscribe from Hevy webhooks
	 */
	async unsubscribeFromWebhooks(webhookId: string): Promise<void> {
		console.log(`🔕 Unsubscribing from webhook: ${webhookId}`);

		try {
			const response = await fetch(`https://api.hevyapp.com/v1/webhooks/${webhookId}`, {
				method: 'DELETE',
				headers: {
					'api-key': process.env.HEVY_API_TOKEN || '',
				},
			});

			if (!response.ok) {
				throw new Error(`Failed to unsubscribe from webhook: ${response.statusText}`);
			}

			console.log('✅ Successfully unsubscribed from webhook');

		} catch (error) {
			console.error('❌ Failed to unsubscribe from webhook:', error);
			throw error;
		}
	}

	/**
	 * List active webhook subscriptions
	 */
	async listWebhooks(): Promise<WebhookSubscription[]> {
		try {
			const response = await fetch('https://api.hevyapp.com/v1/webhooks', {
				headers: {
					'api-key': process.env.HEVY_API_TOKEN || '',
				},
			});

			if (!response.ok) {
				throw new Error(`Failed to list webhooks: ${response.statusText}`);
			}

			const webhooks = await response.json();

			return webhooks.map((webhook: any) => ({
				id: webhook.id,
				url: webhook.url,
				events: webhook.events || ['workout.created'],
				active: webhook.active !== false,
				createdAt: new Date(webhook.created_at || Date.now()),
			}));

		} catch (error) {
			console.error('❌ Failed to list webhooks:', error);
			return [];
		}
	}

	/**
	 * Test webhook endpoint
	 */
	async testWebhook(): Promise<boolean> {
		const testUrl = `${this.baseUrl}/api/webhook/hevy`;

		console.log(`🧪 Testing webhook endpoint: ${testUrl}`);

		try {
			const response = await fetch(testUrl, {
				method: 'OPTIONS',
			});

			const isWorking = response.ok;

			if (isWorking) {
				console.log('✅ Webhook endpoint is responding');
			} else {
				console.log('❌ Webhook endpoint is not responding');
			}

			return isWorking;

		} catch (error) {
			console.error('❌ Webhook test failed:', error);
			return false;
		}
	}

	/**
	 * Validate webhook payload signature (if Hevy provides HMAC signing)
	 */
	validateWebhookSignature(payload: string, signature: string, secret: string): boolean {
		// Implementation would depend on Hevy's signing method
		// This is a placeholder for when/if they implement webhook signatures

		// Example HMAC-SHA256 validation:
		// const crypto = require('crypto');
		// const expectedSignature = crypto
		//   .createHmac('sha256', secret)
		//   .update(payload)
		//   .digest('hex');
		// return signature === expectedSignature;

		return true; // For now, assume all webhooks are valid
	}

	/**
	 * Get webhook URL for Hevy configuration
	 */
	getWebhookUrl(): string {
		return `${this.baseUrl}/api/webhook/hevy`;
	}

	/**
	 * Generate setup instructions for configuring Hevy webhooks
	 */
	getSetupInstructions(): {
		webhookUrl: string;
		steps: string[];
		curlExample: string;
	} {
		const webhookUrl = this.getWebhookUrl();

		return {
			webhookUrl,
			steps: [
				'Copy the webhook URL below',
				'Log into your Hevy account or developer dashboard',
				'Navigate to webhook settings or integrations',
				'Add a new webhook subscription',
				'Paste the webhook URL and select "workout.created" event',
				'Save the webhook configuration',
				'Test by completing a workout in Hevy',
			],
			curlExample: `curl -X POST https://api.hevyapp.com/v1/webhooks \\
  -H "api-key: YOUR_HEVY_API_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "url": "${webhookUrl}",
    "events": ["workout.created"]
  }'`,
		};
	}
}
