import { View, Text, Alert, TouchableWithoutFeedback } from 'react-native';
import React, { useEffect, useState } from 'react';
import ThemedModal from './themedModal';
import { CardField, CardFieldInput, CardForm, PaymentSheet, useStripe } from '@stripe/stripe-react-native';
import FixedBottomView from '../views/fixedBottomView';
import ThemedButton from '../common/themedButton';
import ThemedText from '../common/themedText';
import { userDetails } from '../../lib/userDetails';
import HorizontalView from '../views/horizontalView';
import { deviceInfo } from '../../global/deviceInfo';
import { Colors } from '../themes/colors';
import { getCurrencyFromLocale, getSymbolOfPreferredCurrency } from '../../lib/getCurrencyFromLocale';
import Separator from '../special/separator';
import ActionButton from '../common/actionButton';
import { Check, CheckCheck, CheckCircle, CheckCircle2, CheckLine, CheckSquare, CheckSquare2, ChevronDown, ChevronRight } from 'lucide-react-native';
import { scale } from 'react-native-size-matters';
import { fetchStripeCustomerId } from '../../lib/stripeApi';
import FeeInfoModal from './feeInfoModal';
import { calculateProfit, calculateTotalPaymentAmount } from '../../lib/paymentFee';
import { updateGroup } from '../../lib/groupsApi';

const PaymentModal = ({originalPaymentAmount, groupId, isVisible, onClose, onSuccess}) => {
  const [isLoading, setIsLoading] = useState(false);
  
  const { createPaymentMethod, confirmPayment } = useStripe();
  const [cardDetails, setCardDetails] = useState(null);

  const [paymentMethodIndex, setPaymentMethodIndex] = useState(0);
  
  const [showPayButtonSuccess, setShowPayButtonSuccess] = useState(false);

  const [modalHeight, setModalHeight] = useState('52%');

  const [fullPaymentAmount, setFullPaymentAmount] = useState(0);
  useEffect(() => {
    const calculateAmount = async () => {
      const amount = await calculateTotalPaymentAmount(originalPaymentAmount);
      setFullPaymentAmount(amount);      
    };

    calculateAmount();
  }, [originalPaymentAmount]);

  const [feeInfoModalVisible, setFeeInfoModalVisible] = useState(false);

  useEffect(() => {
    setModalHeight(paymentMethodIndex === 0 ? '45%' : '33.5%');
  }, [paymentMethodIndex]);

  const close = (ignore) => {
    onClose?.(ignore);

    setShowPayButtonSuccess(false);
    setCardDetails(null);
    setPaymentMethodIndex(0);
    setFeeInfoModalVisible(false);
  }

  const fetchPaymentSecret = async (customerId) => {
    try {
      const res = await fetch('https://splitapi.loophole.site/payments/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          amount: Math.round(fullPaymentAmount * 100),
          customerId: customerId,
          currency: getCurrencyFromLocale()
        }),
      });
      const data = await res.json();

      return data.clientSecret;
    } catch (error) {
      console.error('Error fetching payment secret:', error);
      Alert.alert('Error', 'Something went wrong. Please try again later.');
      return null;
    }
  };

  const handlePayment = async () => {
    if (!cardDetails?.complete) {
      Alert.alert('Error', 'Please enter complete card details');
      return;
    }

    setIsLoading(true);

    const customerId = await fetchStripeCustomerId();

    const clientSecret = await fetchPaymentSecret(customerId);
    if (!clientSecret) {
      setIsLoading(false);

      console.error('Failed to get client secret');
      Alert.alert('Error', 'Something went wrong. Please try again later.');
      return;
    }

    const { error: confirmError } = await confirmPayment(clientSecret, {
      paymentMethodType: 'Card',
      paymentMethodData: {
        billingDetails: {
          name: userDetails.userProfile?.name || 'Anonymous',
          email: userDetails.userProfile?.email || '',
        },
      },
    });

    setIsLoading(false);

    if (confirmError) {
      Alert.alert('Payment failed', confirmError.message);
      console.log('confirmPayment error:', confirmError);
    } else {
      setShowPayButtonSuccess(true);
      setFeeInfoModalVisible(false);
      setTimeout(async () => {
        const profit = await calculateProfit(originalPaymentAmount);
        await updateGroup(groupId, { profitPerTransaction: profit });

        onSuccess?.();
        close(false);
      }, 1250);
    }
  };

  return (
    <ThemedModal visible={isVisible} height={modalHeight} onClose={() => close(true)}>
      <View style={{
        position: 'absolute',
        top: 20,
        left: 0,
        right: 0,
        bottom: 0,
        paddingHorizontal: 10,
        gap: 12,
      }}>
        <ThemedText style={{ paddingLeft: 12, marginBottom: 10 }} fontSize={30} fontWeight='Bold'>
          Pay your split
        </ThemedText>

        <HorizontalView style={{ gap: 5 }}>
          <ThemedButton
            text="By Card"
            isPrimary={paymentMethodIndex === 0}
            extraLightWhenSecondary={true}
            isRound={false}
            sizeX={180}
            sizeY={70}
            fontSize={20}
            fontWeight={paymentMethodIndex === 0 ? 'Bold' : 'Medium'}
            onPress={() => setPaymentMethodIndex(0)}
          />
          <ThemedButton
            text={deviceInfo.devicePlatform === 'ios' ? 'Apple Pay' : 'Google Pay'}
            isPrimary={paymentMethodIndex !== 0}
            extraLightWhenSecondary={true}
            isRound={false}
            sizeX={180}
            sizeY={70}
            fontSize={20}
            fontWeight={paymentMethodIndex !== 0 ? 'Bold' : 'Medium'}
            onPress={() => {
              const isApplePay = deviceInfo.devicePlatform === 'ios';
              setPaymentMethodIndex(isApplePay ? 1 : 2);
            }}
          />
        </HorizontalView>

        {paymentMethodIndex === 0 && (
          <>
            <Separator style={{ marginVertical: 0 }} />
            <HorizontalView style={{ justifyContent: 'center', alignItems: 'center', gap: 6 }}>
              <CardField
                onFocus={() => setModalHeight('62.5%')}
                onBlur={() => setModalHeight('45%')}
                postalCodeEnabled={false}
                onCardChange={(details) => {
                  setCardDetails(details);
                }}
                style={{
                  width: '82%',
                  height: 50,
                  backgroundColor: Colors.lightGray,
                  borderRadius: 15,
                  borderColor: Colors.lighterGray,
                  borderWidth: 1
                }}
              />
              <ActionButton 
                isRound={false}
                isPrimary={false}
                extraLightWhenSecondary={true}
                size={50}
                icon={<ChevronRight strokeWidth={2.5}/>}
              />
            </HorizontalView>
          </>
        )}
      </View>

      <FixedBottomView style={{paddingBottom: 10 }}>
        <ThemedText
          fontSize={14}
          fontWeight={'Regular'}
          color={Colors.textGray}
          style={{
            marginBottom: 8,
            textDecorationLine: 'underline',
           }}
           onPress={() => {
            setFeeInfoModalVisible(true);
           }}>
          A fee is added to the share.
        </ThemedText>

        <ThemedButton
          text={showPayButtonSuccess ? "" : `Pay Now - ${getSymbolOfPreferredCurrency()} ${fullPaymentAmount || '0.00'}`}
          icon={showPayButtonSuccess ? <CheckCheck strokeWidth={2.35} /> : null}
          overrideIconSize={40}
          isDisabled={!cardDetails?.complete || isLoading || showPayButtonSuccess}
          isPrimary={(cardDetails?.complete && !isLoading && !showPayButtonSuccess) || false}
          extraLightWhenSecondary={true}
          loadingOnPress={true}
          style={{ width: '100%', height: 75, borderRadius: 99 }}
          onPress={handlePayment}
        />
      </FixedBottomView>
      
      {isVisible && (
        <FeeInfoModal 
          originalPaymentAmount={originalPaymentAmount}
          totalPaymentAmount={fullPaymentAmount}
          visible={feeInfoModalVisible}
          onClose={() => setFeeInfoModalVisible(false)}
        />
      )}
    </ThemedModal>
  );
};

export default PaymentModal;
