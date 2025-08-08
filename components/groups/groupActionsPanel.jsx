import { View, Text, BackHandler, ActivityIndicator, Alert } from 'react-native'
import React, { useEffect, useState } from 'react'
import { getStyles } from '../themes/styles'
import ThemedButton from '../common/themedButton'
import FixedBottomView from '../views/fixedBottomView'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import ThemedText from '../common/themedText'
import FixedTopView from '../views/fixedTopView'
import HorizontalView from '../views/horizontalView'
import { userDetails } from '../../lib/userDetails'
import { getSymbolOfPreferredCurrency } from '../../lib/getCurrencyFromLocale'
import ActionButton from '../common/actionButton'
import { Ban, Edit, Pencil, Wallet } from 'lucide-react-native'
import { Colors } from '../themes/colors'
import { databases, isVerified, sendVerify } from '../../lib/appwrite'
import ProgressBar from '../special/progressBar'
import PaymentModal from '../modals/paymentModal'
import WalletModal from '../modals/walletModal'
import { fetchUserProfile } from '../../lib/getUser'
import { createTransfer } from '../../lib/stripeApi'
import { updateGroup } from '../../lib/groupsApi'
import VerifyEmailModal from '../modals/verifyEmailModal'
import dayjs from 'dayjs'
import Animated, { useAnimatedStyle, useSharedValue, withTiming, Easing } from 'react-native-reanimated'
import { convertToUserCurrency } from '../../lib/currencyConvert'

const GroupActionsPanel = ({ group, hasUserPaid, isUserOwner }) => {
  const insets = useSafeAreaInsets();
  const [isLoading, setIsLoading] = React.useState(false);

  const [panelWidth, setPanelWidth] = useState(0);
  const [buttonAcceptsPress, setButtonAcceptsPress] = useState(true);

  const [payModalVisible, setPayModalVisible] = useState(false);
  const [walletModalVisible, setWalletModalVisible] = useState(false);

  const [isWalletSetup, setIsWalletSetup] = useState(userDetails.userProfile?.userWalletBankConnected && userDetails.userProfile?.walletPayoutOption !== null);

  const [verifyModalVisible, setVerifyModalVisible] = useState(false);
  const [verified, setVerified] = React.useState(false);

  const calcSplitAmount = async () => {
    const amount = group?.splitAmount || 0;
    const convertedAmount = await convertToUserCurrency(amount);
    
    setSplitAmount(convertedAmount.toFixed(2));
  }
  useEffect(() => {
    calcSplitAmount();
  }, [group?.splitAmount]);

  const styles = getStyles();

  // Slide-up animation shared value
  const translateY = useSharedValue(300);

  const slideUpAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  // Trigger the slide-up animation when the component is mounted
  useEffect(() => {
    translateY.value = 300;
    
    setTimeout(() => {
      translateY.value = withTiming(0, {
        duration: 350,
        easing: Easing.out(Easing.back(1.5))
      });
    }, 100);
  }, []);

  const refreshUserProfile = async () => {
    await fetchUserProfile(userDetails.userProfile.userId);
    setIsWalletSetup(userDetails.userProfile?.userWalletBankConnected && userDetails.userProfile?.walletPayoutOption !== null);
  };

  useEffect(() => {
    async function checkVerification() {
      const result = await isVerified();
      setVerified(result);
      console.log('Email verification status:', result);
    }
    checkVerification();
  }, [verifyModalVisible]);

  useEffect(() => {
    if (!group) {
      setIsLoading(true);
    } else {
      setTimeout(() => {
        setIsLoading(false);
      }, 300);
    }
  }, [group])

  function getNextChargeDate(billingDate, isMonthly) {
    const now = dayjs();
    const chargeDay = dayjs(billingDate).date();

    let nextCharge;

    if (isMonthly) {
      const nextMonth = now.month() === 11 ? 0 : now.month() + 1;
      const nextYear = now.month() === 11 ? now.year() + 1 : now.year();

      nextCharge = dayjs().year(nextYear).month(nextMonth).date(chargeDay);
    } else {
      // Yearly billing — next charge is same month/day, next year
      nextCharge = dayjs(billingDate).year(now.year() + 1);
    }

    // For monthly charges, just show day and month; for yearly show the year too
    const format = isMonthly ? 'D MMM' : 'D MMM YYYY';
    return `Next charge: ${nextCharge.format(format)}`;
  }

  const handleSetPaid = async() => {
    try {
      const updatedPaidFriendsCodes = [
        ...group.paidFriendsCodes,
        userDetails.userProfile.userCode
      ];

      const allFriendsPaid = updatedPaidFriendsCodes.length === group.membersProfiles.length - 1;
      const updateData = {
        paidFriendsCodes: updatedPaidFriendsCodes
      };
      
      if (allFriendsPaid) {
        updateData.allFriendsPaidDate = new Date().toISOString();
      }

      await databases.updateDocument(
        process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID,
        process.env.EXPO_PUBLIC_APPWRITE_GROUPS_COLLECTION_ID,
        group.groupId,
        updateData
      )

      setTimeout(() => {
        setButtonAcceptsPress(true);
      }, 1000);

      console.log('Added user code to paid friends codes.');
      if (allFriendsPaid) {
        console.log('All friends have paid, added allFriendsPaidDate.');
      }
    } catch (error) {
      console.error('Error updating group with paid friend code:', error, error.code);
    }
  }

  const handleCollectMoney = async() => {
    if (!isUserOwner) {
      console.warn('Only the group owner can collect money from friends.');
      return;
    }
    if (!isWalletSetup) {
      console.warn('Wallet is not setup, cannot collect money.');
      return;
    }
    if (group.paidFriendsCodes.length !== group.membersProfiles.length - 1) {
      console.warn('Not all friends have paid, cannot collect money.');
      Alert.alert(
        "Cannot collect money",
        "Not all friends have paid their share."
      );
      return;
    }
    if (!canCollectMoney()) {
      console.warn('Cannot collect money yet, waiting period not over.');
      Alert.alert(
        "Waiting period in progress",
        `Money will be available ${getCollectDateString().toLowerCase()}.`
      );
      return;
    }

    try {
      const transferRes = await createTransfer(
        group.splitAmount * group.friendsCodes.length,
        userDetails.userProfile.stripeConnectId
      )

      if (transferRes.transferId) {
        await updateGroup(group.groupId, {
          isMoneyCollected: true
        });
      }
    } catch (error) {
      console.error('Error collecting money from friends:', error, error.code);
    }
  }

  const handleDropout = async() => {
    try {
      if ((group.membersProfiles.length - 2) <= 0) {
        await handleDelete();
        return;
      }

      await databases.updateDocument(
        process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID,
        process.env.EXPO_PUBLIC_APPWRITE_GROUPS_COLLECTION_ID,
        group.groupId,
        {
          splitAmount: group.payAmount / (group.membersProfiles.length - 2),
          friendsCodes: group.friendsCodes.filter(code => code !== userDetails.userProfile.userCode),
          paidFriendsCodes: group.paidFriendsCodes.filter(code => code !== userDetails.userProfile.userCode),
        }
      )

      console.log('User has dropped out of the group.');
    } catch (error) {
      console.error('Error updating group on dropout:', error, error.code);
    }
  }

  const handleDelete = async () => {
    try {
      await databases.deleteDocument(
        process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID,
        process.env.EXPO_PUBLIC_APPWRITE_GROUPS_COLLECTION_ID,
        group.groupId
      );

      console.log('Group deleted successfully.');
    } catch (error) {
      console.error('Error deleting group:', error, error.code);
    }
  }
  const calculatePaidAmount = () => {
    if (!group || !group.payAmount) return 0;

    const countOfPaidFriends = group.membersProfiles.filter(friend => friend.paid).length;

    const totalPaid = (countOfPaidFriends * group.splitAmount) + group.splitAmount;
    return totalPaid;
  }

  const getSplitProgress = () => {
    if (!group || !group.payAmount) return 0;

    const progress = calculatePaidAmount() / group.payAmount;
    const progressCeil = Math.ceil(progress * 100) / 100; // Round to 2 decimal places
    return Math.min(progressCeil, 1); // Ensure progress does not exceed 100%
  }

  // Function to check if the 7-day waiting period has passed
  const canCollectMoney = () => {
    // If all friends have paid (check via split progress) but no allFriendsPaidDate is set,
    // we should still enforce the waiting period
    if (getSplitProgress() >= 1 && !group?.allFriendsPaidDate) {
      return false; // Enforce waiting period even if date wasn't set correctly
    }
    
    if (!group?.allFriendsPaidDate) return false;
    
    const paidDate = new Date(group.allFriendsPaidDate);
    const waitPeriod = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
    const collectDate = new Date(paidDate.getTime() + waitPeriod);
    const now = new Date();
    
    return now >= collectDate;
  }
  
  const getCollectDateString = () => {
    let paidDate;
    
    // If allFriendsPaidDate isn't set but all have paid, use current date as the base
    if (!group?.allFriendsPaidDate && getSplitProgress() >= 1) {
      paidDate = new Date();
    } else if (group?.allFriendsPaidDate) {
      paidDate = new Date(group.allFriendsPaidDate);
    } else {
      return "Collect date unavailable";
    }
    
    const waitPeriod = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
    const collectDate = new Date(paidDate.getTime() + waitPeriod);
    
    // Format date as "8 Aug" (day month)
    const day = collectDate.getDate();
    const month = collectDate.toLocaleString('en-US', { month: 'short' });
    
    return `Collect after ${day} ${month}`;
  }

  return (
    <Animated.View
      style={[
        styles.panel,
        { bottom: -insets.bottom / 2.35 },
        slideUpAnimatedStyle, // Add the animated style here
      ]}
      onLayout={(event) => {
        const { width } = event.nativeEvent.layout;
        setPanelWidth(width);
      }}
    >
      {isLoading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', bottom: 5 }}>
          <ActivityIndicator color={Colors.textLight} />
        </View>
      ) : (
        <>
        <View
          style={{
            position: 'absolute',
            top: -8,
            left: 0,
            right: 0,
            flexDirection: 'row',
            justifyContent: 'flex-start',
            alignItems: 'baseline',
            gap: 7,
            padding: 22,
            zIndex: 1,
          }}
        >
          {getSplitProgress() < 1 ? (
            <View style={{ flexDirection: 'row', alignItems: 'baseline', flexWrap: 'nowrap', gap: 2 }}>
            <ThemedText fontSize={24} fontWeight="Regular">
              {getSymbolOfPreferredCurrency(group?.groupCurrency)}
            </ThemedText>

            <ThemedText
              fontSize={36}
              fontWeight="Bold"
              style={{ marginHorizontal: 4 }}
              numberOfLines={1}
            >
              {calculatePaidAmount() > 0 ? calculatePaidAmount().toFixed(2) : '-'}
            </ThemedText>

            <ThemedText fontSize={24} fontWeight="Light" marginRight={4}>
              /
            </ThemedText>

            <ThemedText fontSize={24} fontWeight="Regular" style={{ flexShrink: 1, maxWidth: 100 }}>
              {group?.payAmount}
            </ThemedText>
          </View>
          ) : (
            <ThemedText
              fontSize={28}
              fontWeight="Bold"
              color={Colors.light}
              style={{
                top: 5,
                // shadowColor: Colors.primary,
                // shadowOpacity: 0.3,
                // shadowRadius: 15,
                // shadowOffset: { width: 0, height: 0 },
                // elevation: 5,
              }}
            >Everyone paid</ThemedText>
          )}
        </View>

        <View
          style={{
            position: 'absolute',
            top: -12,
            right: -12,
            flexDirection: 'row',
            justifyContent: 'flex-start',
            alignItems: 'baseline',
            gap: 7,
            padding: 22,
            zIndex: 1,
          }}
        >
          <HorizontalView style={{ gap: 8 }}>
            <ActionButton 
              isPrimary={false}
              showStroke={false}
              icon={<Ban strokeWidth={3} />}
              size={52}
              overrideBackgroundColor={Colors.red}
              overiddeIconColor={'#F1F1E8'}
              onPress={() => {
                if (isUserOwner) {
                  Alert.alert(
                    "Delete group", 
                    "Are you sure you want to delete this group? You will not be able to recieve the money from your friends.", 
                    [
                      {
                        text: "Cancel",
                        style: "cancel"
                      },
                      {
                        text: "Delete",
                        style: "destructive",
                        onPress: async() => {
                          await handleDelete();
                        }
                      }
                    ]
                  )
                } else {
                  Alert.alert(
                    "Drop out of group", 
                    "Are you sure you want to drop out of this group?", 
                    [
                      {
                        text: "Cancel",
                        style: "cancel"
                      },
                      {
                        text: "Drop out",
                        style: "destructive",
                        onPress: async() => {
                          await handleDropout();
                        }
                      }
                    ]
                  )
                }
              }}
            />
          </HorizontalView>
        </View>

        <View style={{ position:'absolute', width: '100%', paddingHorizontal: 5, paddingTop: 75 }}>
          <ProgressBar 
            progress={getSplitProgress()}
          />
        </View>

        <FixedBottomView>
          <ThemedText
            fontSize={12}
            fontWeight={"Regular"}
            color={Colors.textGray}
            style={{ marginBottom: 10, textAlign: 'center' }}
          >{
            isUserOwner 
              ? getSplitProgress() < 1 
                ? "Please wait for your friends to pay their share."
                : group?.isMoneyCollected 
                  ? "You have collected the money"
                  : canCollectMoney()
                    ? "You can now collect the money"
                    : "Money will be available for collection soon"
              : hasUserPaid 
                ? "You have paid your share :D"
                : `Pay your share of ${getSymbolOfPreferredCurrency()} ${group?.splitAmount.toFixed(2) || '-'} (excl. fee).`
          }</ThemedText>
          
          <HorizontalView style={{gap: 8}}>
            <ThemedButton
              loadingOnPress={getSplitProgress() >= 1 && buttonAcceptsPress}
              style={{ width: group?.isMoneyCollected && isUserOwner ? '79%' : '100%' }} 
              isPrimary={
                // Owner, and hasn't setup wallet yet → highlight
                (isUserOwner && !isWalletSetup) ||

                // Owner, split is complete, and money is NOT collected → highlight
                (isUserOwner && getSplitProgress() >= 1 && !group?.isMoneyCollected && buttonAcceptsPress && canCollectMoney()) ||

                // Not owner and hasn't paid yet → highlight
                (!isUserOwner && !hasUserPaid && buttonAcceptsPress)
              }
              extraLightWhenSecondary={true}
              animateBackground={!buttonAcceptsPress}
              isDisabled={
                (isUserOwner && group?.isMoneyCollected) ||
                (isUserOwner && isWalletSetup && getSplitProgress() < 1) ||
                (isUserOwner && !canCollectMoney() && getSplitProgress() >= 1 && !group?.isMoneyCollected) ||
                (!isUserOwner && hasUserPaid) ||
                !buttonAcceptsPress
              }
              text={
                isUserOwner
                  ? (
                      isWalletSetup
                        ? (
                            getSplitProgress() >= 1
                              ? (
                                  group?.isMoneyCollected
                                    ? "Collected in Wallet"
                                    : (!verified) 
                                      ? "Verify email" 
                                      : (!canCollectMoney())
                                        ? getCollectDateString()
                                        : "Collect money"
                                )
                              : "Waiting for friends"
                          )
                        : (verified ? "Setup wallet" : "Verify email")
                    )
                  : (
                      hasUserPaid
                        ? group?.createdAt ? getNextChargeDate(group?.createdAt, group?.isMonthly) : "Already paid"
                        : (verified ? "Pay split" : "Verify email to pay")
                    )
              }
              onPress={async() => {
                if (!buttonAcceptsPress) return;

                setButtonAcceptsPress(false);

                if (!verified) {
                  await sendVerify();
                  setVerifyModalVisible(true);
                  setButtonAcceptsPress(true);
                  return;
                }

                if (isUserOwner) {
                  if (isWalletSetup) {
                    if (getSplitProgress() >= 1) {
                      await handleCollectMoney();

                      setTimeout(() => {
                        setButtonAcceptsPress(true);
                      }, 1000);
                    }
                  } else {
                    setWalletModalVisible(true);
                  }
                } else {
                  setPayModalVisible(true);
                }
              }}  
            />

            {isUserOwner && getSplitProgress() >= 1 && group?.isMoneyCollected && (
              <ActionButton 
                icon={<Wallet strokeWidth={2.5} />}
                onPress={() => {
                  setWalletModalVisible(true);
                }}
              /> 
            )}
          </HorizontalView>
        </FixedBottomView>
        </>
      )}

      <WalletModal
        visible={walletModalVisible}
        onClose={(success) => {
          setWalletModalVisible(false);
          refreshUserProfile();

          if (!success) {
            setButtonAcceptsPress(true);
          }
        }}
      />

      <PaymentModal
        groupId={group?.groupId}
        originalPaymentAmount={group?.splitAmount}
        isVisible={payModalVisible}
        onClose={(ignore) => 
        {
          setPayModalVisible(false);
          
          if (ignore) 
            setButtonAcceptsPress(true);
        }}
        onSuccess={handleSetPaid}
      />

      <VerifyEmailModal
        visible={verifyModalVisible}
        onClose={() => setVerifyModalVisible(false)}
      />
    </Animated.View>
  );
};


export default GroupActionsPanel