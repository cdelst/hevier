// Test script to simulate Hevy webhook calls for development
import fetch from 'node-fetch';

const WEBHOOK_URL = 'http://localhost:3000/api/webhook/hevy';

// Simulate a Hevy webhook payload
const mockWebhookPayload = {
	id: "webhook-test-" + Date.now(),
	payload: {
		workoutId: "f1085cdb-32b2-4003-967d-53a3af8eaecb" // Mock workout ID
	}
};

async function testWebhook() {
	console.log('🧪 Testing Hevy webhook endpoint...');
	console.log('📡 Webhook URL:', WEBHOOK_URL);
	console.log('📦 Payload:', JSON.stringify(mockWebhookPayload, null, 2));

	try {
		// Test the OPTIONS endpoint first
		console.log('\n1️⃣ Testing OPTIONS request...');
		const optionsResponse = await fetch(WEBHOOK_URL, {
			method: 'OPTIONS'
		});

		if (optionsResponse.ok) {
			console.log('✅ OPTIONS request successful');
			const optionsData = await optionsResponse.json();
			console.log('   Response:', optionsData);
		} else {
			console.log('❌ OPTIONS request failed:', optionsResponse.status);
		}

		// Test the webhook POST
		console.log('\n2️⃣ Testing webhook POST request...');
		const response = await fetch(WEBHOOK_URL, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(mockWebhookPayload)
		});

		console.log('📊 Response Status:', response.status);

		if (response.ok) {
			const responseData = await response.json();
			console.log('✅ Webhook processed successfully!');
			console.log('📋 Response Data:');
			console.log(JSON.stringify(responseData, null, 2));
		} else {
			const errorData = await response.json();
			console.log('❌ Webhook failed:', errorData);
		}

		// Test the GET endpoint to see stored data
		console.log('\n3️⃣ Testing GET request to view stored data...');
		const getResponse = await fetch(WEBHOOK_URL, {
			method: 'GET'
		});

		if (getResponse.ok) {
			const getData = await getResponse.json();
			console.log('✅ GET request successful');
			console.log('📊 Stored Data:');
			console.log(`   Analysis Score: ${getData.currentAnalysis?.overallScore || 'N/A'}`);
			console.log(`   Next Workout: ${getData.currentSuggestion?.workoutType || 'N/A'}`);
			console.log(`   Recent Workouts: ${getData.recentWorkouts?.length || 0}`);
		} else {
			console.log('❌ GET request failed:', getResponse.status);
		}

	} catch (error) {
		console.error('❌ Test failed with error:', error.message);
		console.log('\n💡 Make sure your Next.js dev server is running:');
		console.log('   npm run dev');
	}
}

// Run the test
testWebhook()
	.then(() => console.log('\n✅ Webhook test completed!'))
	.catch(error => console.error('\n❌ Test error:', error));
