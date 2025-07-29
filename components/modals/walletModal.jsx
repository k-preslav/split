import { View, Text, SafeAreaView, Alert, ActivityIndicator, Animated } from 'react-native';
import React, { useCallback, useEffect } from 'react'
import ThemedModal from './themedModal'
import ThemedText from '../common/themedText'
import InputField from '../common/inputField'
import { Colors } from '../themes/colors'
import ThemedButton from '../common/themedButton'
import { ArrowRight, Bolt, Landmark } from 'lucide-react-native'
import HorizontalView from '../views/horizontalView'
import { getSymbolOfPreferredCurrency as getSymbolOfCurrency, getSymbolOfPreferredCurrency } from '../../lib/getCurrencyFromLocale'
import Separator from '../special/separator'
import { updateUserWalletSettings } from '../../lib/updateUser'
import { userDetails } from '../../lib/userDetails'
import { connectToStripe, getAccountBalance, withdrawMoney } from '../../lib/stripeApi'
import { convertToUserCurrency } from '../../lib/currencyConvert';

const WalletModal = ({ visible, onClose }) => {
  const [isWalletSetup, setIsWalletSetup] = React.useState(false);
  const [isBankAccountConnected, setIsBankAccountConnected] = React.useState(false);
  const [modalHeight, setModalHeight] = React.useState();
  const [payoutOptionIndex, setPaymentOptionIndex] = React.useState(0);

  const [walletAmount, setWalletAmount] = React.useState(-1);
  const [isWithdrawing, setIsWithdrawing] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);

  const pulseAnim = React.useRef(new Animated.Value(0)).current;

  const [withdrawMinAmount, setWithdrawMinAmount] = React.useState(20);
  useEffect(() => {
    const calcWithdrawMinAmount = async () => {
      const amount = await convertToUserCurrency(withdrawMinAmount);
      setWithdrawMinAmount(amount.toFixed(2));
    }

    calcWithdrawMinAmount();
  }, [])

  // Pulse animation logic
  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: false,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: false,
        }),
      ])
    ).start();

    return () => {
      animation?.stop();
    }
  }, [payoutOptionIndex, isWalletSetup]);

  const fetchWalletAmount = async () => {
    try {
      setIsLoading(true);
      const amount = await getAccountBalance(userDetails.userProfile?.stripeConnectId);
      
      setWalletAmount(amount || 0);
      console.log('Wallet amount fetched:', amount);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching wallet amount:', error);
      setIsLoading(false);
    }
  };

  useEffect(() => {    
    if (!visible) return;

    fetchWalletAmount();
  }, [visible, userDetails.userProfile?.stripeConnectId]);

  useEffect(() => {
    if (
      userDetails.userProfile?.userWalletBankConnected &&
      userDetails.userProfile?.walletPayoutOption !== null
    ) {
      setIsBankAccountConnected(true);
      setIsWalletSetup(true);
      setModalHeight('32%');
    }
    else {
      setIsBankAccountConnected(false);
      setIsWalletSetup(false);
      setModalHeight('33.5%');
    }
  }, [userDetails.userProfile?.userWalletBankConnected, userDetails.userProfile?.walletPayoutOption]);

  const connectBank = async () => {
    const connectSuccess = await connectToStripe();
    if (connectSuccess) {
      setIsBankAccountConnected(true);
      setModalHeight('52.5%');
    }
  };

  const setWalletSetuped = async () => {
    setIsWalletSetup(true);
    setModalHeight('32%');
  };

  const setWalletSetupedFalse = async () => {
    setIsWalletSetup(false);
    setModalHeight('52.5%');
  };

  const updateWalletSettings = async () => {
    await updateUserWalletSettings(isBankAccountConnected, payoutOptionIndex);
  };

  return (
    <ThemedModal height={modalHeight} visible={visible} onClose={onClose}>
      <View
        style={{
          position: 'absolute',
          top: 24,
          left: 0,
          right: 0,
          bottom: 0,
          paddingHorizontal: 10,
          gap: 12,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 10 }}>
          <ThemedText style={{ paddingLeft: 12, marginBottom: 10 }} fontSize={30} fontWeight='Bold'>
            {isWalletSetup ? 'Your Wallet' : 'Setup Wallet'}

            {isLoading && (
              <View style={{ paddingLeft: 10, alignItems: 'center', justifyContent: 'center' }}>
                <ActivityIndicator color={Colors.textGray}/>
              </View>
            )}
          </ThemedText>
          {!isWalletSetup && (
            <ThemedText fontSize={22} style={{ marginLeft: 3 }} color={Colors.textGray}>
              {isBankAccountConnected ? '2/2' : '1/2'}
            </ThemedText>
          )}
        </View>

        <Separator style={{ marginVertical: 4 }} />

        {isWalletSetup ? (
          <>
            <View style={{ paddingHorizontal: 12, height: 60 }}>
              <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 7 }}>
                <ThemedText fontSize={24}>{getSymbolOfCurrency()}</ThemedText>
                <View style={{ marginLeft: 5, flexDirection: 'row', alignItems: 'baseline', gap: 7 }}>
                  <ThemedText fontSize={36} fontWeight={'Medium'} animate={true}>{walletAmount > -1 ? Number(walletAmount).toFixed(2) : '-.--'}</ThemedText>
                  {walletAmount < withdrawMinAmount && (
                    <>
                    <ThemedText fontSize={24} fontWeight={'Light'} animate={true}>{isLoading ? "" : "/"}</ThemedText>
                    <ThemedText fontSize={24} animate={true}>{isLoading ? "" : withdrawMinAmount}</ThemedText>
                    </>
                  )}
                </View>
                <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-end', top: -5}}>
                  <ThemedButton
                    text='Withdraw'
                    isPrimary={walletAmount >= withdrawMinAmount && !isWithdrawing}
                    isDisabled={walletAmount < withdrawMinAmount || isWithdrawing}
                    isRound={false}
                    extraLightWhenSecondary={true}
                    fontSize={18}
                    style={{ height: 50, width: 120, paddingHorizontal: 16 }}
                    onPress={async() => {
                      if (walletAmount >= withdrawMinAmount) {
                        setIsWithdrawing(true);
                        setIsLoading(true);

                        const withdrawRes = await withdrawMoney(walletAmount, userDetails.userProfile.stripeConnectId);
                      
                        if (withdrawRes.withdrawId) {
                          Alert.alert('Success', 'Withdrawal successful!');
                          await fetchWalletAmount();
                        }

                        setIsWithdrawing(false);
                        setIsLoading(false);
                      }
                    }}
                  />
                </View>
              </View>
            </View>

            <View style={{justifyContent: 'center', alignItems: 'center', alignContent: 'center'}}>
              <ThemedButton
                isPrimary={false}
                isRound={false}
                extraLightWhenSecondary={true}
                text='Withdraw settings'
                style={{ height: 55, width: '95%' }}
                fontWeight='Medium'
                icon={<Bolt strokeWidth={2.5} />}
                onPress={setWalletSetupedFalse}
              />
            </View>
          </>
        ) : isBankAccountConnected ? (
          <View style={{ paddingHorizontal: 12, gap: 16, flex: 1 }}>
            <ThemedText fontSize={20}>How would you like to receive money?</ThemedText>
            <HorizontalView gap={10} justifyContent="center">
              <ThemedButton
                text="Stacked"
                isPrimary={payoutOptionIndex === 0}
                extraLightWhenSecondary={true}
                isRound={false}
                sizeX={'48%'}
                sizeY={70}
                fontSize={22}
                fontWeight={payoutOptionIndex === 0 ? 'Bold' : 'Medium'}
                onPress={() => setPaymentOptionIndex(0)}
              />
              <ThemedButton
                text="Instant"
                isPrimary={payoutOptionIndex === 1}
                extraLightWhenSecondary={true}
                isRound={false}
                sizeX={'48%'}
                sizeY={70}
                fontSize={21}
                fontWeight={payoutOptionIndex === 1 ? 'Bold' : 'Medium'}
                onPress={() => setPaymentOptionIndex(1)}
              />
            </HorizontalView>

            {/* Info text with pulse effect */}
            <Animated.View
              style={{
                backgroundColor: Colors.lightGray,
                padding: 10,
                borderRadius: 15,
                borderWidth: 2,
                borderColor: payoutOptionIndex === 1 ? pulseAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [Colors.lighterGray, Colors.primary],
                }) : Colors.lighterGray,
              }}
            >
              <ThemedText fontSize={18} animate={true}>
                {payoutOptionIndex === 0
                  ? `Stacked payouts are free but only sent after your wallet balance hits ${getSymbolOfPreferredCurrency()} ${withdrawMinAmount}.`
                  : 'Instant payouts have no minimum limit but include a withdraw fee paid by you!'}
              </ThemedText>
            </Animated.View>

            <View style={{ flex: 1, paddingTop: 15, gap: 12 }}>
              <ThemedButton
                text="Finish setup"
                icon={<ArrowRight strokeWidth={2.2} />}
                isPrimary={true}
                extraLightWhenSecondary={true}
                style={{ borderRadius: 99, width: '100%', height: 75 }}
                loadingOnPress={true}
                onPress={async () => {
                  await updateWalletSettings();
                  setWalletSetuped();
                }}
              />
            </View>
          </View>
        ) : (
          <View style={{ paddingHorizontal: 12, gap: 16, flex: 1 }}>
            <ThemedText fontSize={20}>To receive money, please connect your bank account.</ThemedText>
            <View style={{ flex: 1, paddingTop: 12, gap: 12 }}>
              <ThemedButton
                text="Connect bank account"
                isPrimary={true}
                extraLightWhenSecondary={true}
                isRound={false}
                sizeY={60}
                sizeX={'100%'}
                icon={<Landmark strokeWidth={2.5} style={{ marginLeft: 3 }} />}
                loadingOnPress={true}
                onPress={connectBank}
              />
            </View>
          </View>
        )}
      </View>
    </ThemedModal>
  );
};

export default WalletModal;
