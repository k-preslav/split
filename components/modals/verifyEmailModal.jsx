import { View } from 'react-native';
import React from 'react';
import ThemedModal from './themedModal';
import ThemedText from '../common/themedText';
import { userDetails } from '../../lib/userDetails';
import Separator from '../special/separator';
import ThemedButton from '../common/themedButton';
import { isVerified, sendVerify } from '../../lib/appwrite';
import { Colors } from '../themes/colors';

const VerifyEmailModal = ({ visible, onClose, overrideEmail }) => {
  const [canResend, setCanResend] = React.useState(false);
  const [resendTimeout, setResendTimeout] = React.useState(59);
  const [verifiedStatus, setVerifiedStatus] = React.useState(false);
  const intervalRef = React.useRef(null);

  const checkVerificationStatus = async () => {
    const verified = await isVerified();
    setVerifiedStatus(verified);
    if (verified) {
      clearInterval(intervalRef.current);
      setInterval(() => onClose(), 500);
    }
  };

  // Start checking verification when modal is visible
  React.useEffect(() => {
    if (visible) {
      checkVerificationStatus();
      intervalRef.current = setInterval(() => {
        checkVerificationStatus();
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [visible]);

  // Handle resend cooldown
  React.useEffect(() => {
    let timer;
    if (!canResend && resendTimeout > 0) {
      timer = setTimeout(() => setResendTimeout((prev) => prev - 1), 1000);
    } else if (resendTimeout === 0) {
      setCanResend(true);
    }
    return () => clearTimeout(timer);
  }, [canResend, resendTimeout]);

  // Reset resend timer when modal opens
  React.useEffect(() => {
    setCanResend(false);
    setResendTimeout(59);
  }, [visible]);

  const sendEmailVerification = async () => {
    setCanResend(false);
    setResendTimeout(59);
    const res = await sendVerify();
    if (res) {
      console.log('Verification email sent successfully.');
    } else {
      console.error('Failed to send verification email.');
    }
  };

  return (
    <ThemedModal visible={visible} onClose={onClose} height={'37%'}>
      <View
        style={{
          position: 'absolute',
          top: 21,
          left: 0,
          right: 0,
          bottom: 0,
          paddingHorizontal: 10,
          gap: 12,
        }}
      >
        <View style={{ flexDirection: 'row', paddingHorizontal: 12 }}>
          <ThemedText fontSize={32} fontWeight={'Medium'}>
            Verify your email
          </ThemedText>
        </View>

        <Separator />
        <View style={{ paddingHorizontal: 12, gap: 10 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <ThemedText fontSize={16}>Verification sent to:</ThemedText>
            <ThemedText
              fontWeight={'Medium'}
              numberOfLines={1}
              ellipsizeMode="middle"
              style={{ flexShrink: 1 }}
            >
              {overrideEmail ? overrideEmail : userDetails.userProfile?.email}
            </ThemedText>
          </View>

          <ThemedButton
            text={canResend ? `Resend` : `Resend in ${resendTimeout}s`}
            style={{ width: '100%', height: 45 }}
            isRound={false}
            isPrimary={canResend}
            extraLightWhenSecondary={true}
            isDisabled={!canResend}
            fontSize={16}
            onPress={() => {
              if (canResend) {
                sendEmailVerification();
              }
            }}
          />

          <Separator />

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <ThemedText fontSize={20} fontWeight={'Medium'}>
              Status:
            </ThemedText>
            <ThemedText
              fontSize={17}
              fontWeight={'Bold'}
              style={{
                backgroundColor: verifiedStatus ? Colors.primary : Colors.lightGray,
                color: verifiedStatus ? "#000000" : Colors.textLight,
                paddingVertical: 10,
                paddingHorizontal: 12,
                flex: 1,
                textAlign: 'center',
                borderRadius: 12,
                borderColor: verifiedStatus ? Colors.primary : Colors.lighterGray,
                borderWidth: 1,
                shadowColor: Colors.primary,
                shadowOpacity: verifiedStatus ? 0.25 : 0,
                shadowRadius: 15,
                shadowOffset: { width: 0, height: 0 },
                elevation: 5,
              }}
            >
              {verifiedStatus ? 'Email Verified' : 'Not verified'}
            </ThemedText>
          </View>
        </View>
      </View>
    </ThemedModal>
  );
};

export default VerifyEmailModal;