import { Alert, Linking } from "react-native";
import { userDetails } from "./userDetails";
import * as WebBrowser from 'expo-web-browser';
import { updateUserStipeConnectId, updateUserStripeCustomerId } from "./updateUser";
import { fetchUserProfile } from "./getUser";

export async function connectToStripe() {
  try {
    await fetchUserProfile(userDetails.userProfile.userId);

    console.log('Connecting to Stripe...');
    const connectAccountId = userDetails?.userProfile?.stripeConnectId || null;

    const response = await fetch('http://192.168.0.105:3000/payments/create-stripe-connect-account', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: userDetails?.userProfile?.email || '',
        existingAccountId: connectAccountId,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to create Stripe account');
    }

    const connectedAccountId = data.accountId;
    await updateUserStipeConnectId(connectedAccountId);

    const onboardingUrl = data.onboardingUrl;
    if (onboardingUrl) {
      const result = await WebBrowser.openAuthSessionAsync(onboardingUrl, 'splitapp://stripe-connected');

      if (result.type === 'success') {
        console.log('Stripe account was connected!');
        return true;
      }
    } else {
      Alert.alert('Error', 'No onboarding URL received.');
      return false;
    }
  } catch (error) {
    console.error('Stripe onboarding error:', error);
    Alert.alert('Error', error.message || 'Something went wrong.');
    return false;
  }
}

export async function createTransfer(amount, stripeAccountId) {
  try {
    const amountInCents = Math.round(amount * 100);

    console.log('Creating transfer to Stripe account:', stripeAccountId);
    const response = await fetch('https://splitapi.loophole.site/payments/create-transfer', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        accountId: stripeAccountId,
        amount: amountInCents,
      }),
    });

    const data = await response.json();
    console.log('Stripe transfer response:', data);

    if (!response.ok) {
      throw new Error(data.error || 'Failed to create Stripe transfer');
    }

    return data;
  } catch (error) {
    console.error('Stripe transfer error:', error);
    Alert.alert('Error', error.message || 'Something went wrong while creating the transfer.');
    return null;
  }
}

export async function withdrawMoney(amount, stripeAccountId) {
  try {
    const amountInCents = Math.round(amount * 100);

    console.log('Withdrawing money from Stripe account:', stripeAccountId);
    const response = await fetch('https://splitapi.loophole.site/payments/create-withdraw', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        accountId: stripeAccountId,
        amount: amountInCents,
      }),
    });

    const data = await response.json();
    console.log('Stripe withdrawal response:', data);

    if (!response.ok) {
      throw new Error(data.error || 'Failed to withdraw money from Stripe account');
    }

    return data;
  } catch (error) {
    console.error('Stripe withdrawal error:', error);
    Alert.alert('Error', error.message || 'Something went wrong while withdrawing money.');
    return null;
  }
}

export async function fetchStripeCustomerId() {
  let customerId = userDetails?.userProfile?.stripeCustomerId;
  if (!customerId) {
    console.log('Creating new Stripe customer...');

    const response = await fetch('https://splitapi.loophole.site/payments/create-customer', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: userDetails?.userProfile?.email || '',
        userId: userDetails?.userProfile?.userId || '',
      }),
    });

    const data = await response.json();
    console.log('Stripe customer creation response:', data);

    if (response.ok) {
      customerId = data.customerId;
      await updateUserStripeCustomerId(customerId);
    } else {
      console.error('Failed to create Stripe customer:', data.error);
    }
  }

  return customerId;
}

export async function chargeSubscriptionPayment(amount) {
  if (!amount) {
    console.error('No amount provided for subscription payment');
    return null;
  }

  const customerId = userDetails?.userProfile?.stripeCustomerId;
  if (!customerId) {
    console.error('No Stripe customer ID found, cannot charge subscription payment');
    return null;
  }

  try {
    const response = await fetch('https://splitapi.loophole.site/payments/charge-subscription-payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: Math.round(amount * 100),
        customerId: customerId,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to charge subscription payment');
    }

    return data;
  } catch (error) {
    console.error('Stripe subscription payment error:', error);
    Alert.alert('Error', error.message || 'Something went wrong while charging the subscription payment.');
    return null;
  }
}

export async function getAccountBalance(stripeAccountId) {
  if (!stripeAccountId) {
    console.warn('No Stripe account ID provided, cannot fetch balance.');
    return null;
  }

  try {
    const response = await fetch('https://splitapi.loophole.site/payments/get-account-balance', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ accountId: stripeAccountId }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch Stripe account balance');
    }

    const amountInCents = data.available || 0;
    const amount = Math.round(amountInCents) / 100;

    return amount;
  } catch (error) {
    console.error('Stripe account balance error:', error);
    Alert.alert('Error', error.message || 'Something went wrong while fetching the account balance.');
    return null;
  }
}