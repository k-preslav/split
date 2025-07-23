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
import { Ban, Edit, Pencil } from 'lucide-react-native'
import { Colors } from '../themes/colors'
import { databases, isVerified, sendVerify } from '../../lib/appwrite'
import ProgressBar from '../special/progressBar'
import PaymentModal from '../modals/paymentModal'
import WalletModal from '../modals/walletModal'
import { fetchUserProfile } from '../../lib/getUser'
import { createTransfer } from '../../lib/stripeApi'
import { updateGroup } from '../../lib/groupsApi'
import VerifyEmailModal from '../modals/verifyEmailModal'

const GroupActionsPanel = ({group, hasUserPaid, isUserOwner}) => {
  const insets = useSafeAreaInsets();
  const [isLoading, setIsLoading] = React.useState(false);

  const [panelWidth, setPanelWidth] = useState(0);

  const [payModalVisible, setPayModalVisible] = useState(false);
  const [walletModalVisible, setWalletModalVisible] = useState(false);

  const [isWalletSetup, setIsWalletSetup] = useState(userDetails.userProfile?.userWalletBankConnected && userDetails.userProfile?.walletPayoutOption !== null);

  const [verifyModalVisible, setVerifyModalVisible] = useState(false);
  const [verified, setVerified] = React.useState(false);

  const styles = getStyles();

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

  const handleSetPaid = async() => {
    try {
      await databases.updateDocument(
        process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID,
        process.env.EXPO_PUBLIC_APPWRITE_GROUPS_COLLECTION_ID,
        group.groupId,
        {
          paidFriendsCodes: [
            ...group.paidFriendsCodes,
            userDetails.userProfile.userCode
          ],
        }
      )

      console.log('Added user code to paid friends codes.');
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
      await databases.updateDocument(
        process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID,
        process.env.EXPO_PUBLIC_APPWRITE_GROUPS_COLLECTION_ID,
        group.groupId,
        {
          splitAmount: calculateShare(group.membersProfiles.length - 2),
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

  const calculateSingleShare = () => {
    if (!group || !group.splitAmount) return 0;

    const singleShare = group.splitAmount / 1.2;
    return singleShare;
  }
  const calculateShare = (friendCount) => {
    if (friendCount < 1) {
      console.warn('Friend count is less than 1, returning 0 share.');
      return 0;
    }

    const rawNeeded = group.payAmount / (friendCount + 1);
    const rawFriendPayment = rawNeeded * 1.2;

    // Round up to nearest cent
    const friendPayment = Math.ceil(rawFriendPayment * 100) / 100;
    console.log('Calculated share for friend count:', friendCount, 'is:', friendPayment);
    return friendPayment;
  };

  const calculatePaidAmount = () => {
    if (!group || !group.payAmount) return 0;

    const singleShare = calculateSingleShare();
    const countOfPaidFriends = group.membersProfiles.filter(friend => friend.paid).length;

    const totalPaid = (countOfPaidFriends * singleShare) + singleShare;
    return totalPaid;
  }

  const getSplitProgress = () => {
    if (!group || !group.payAmount) return 0;

    const progress = calculatePaidAmount() / group.payAmount;
    return Math.min(progress, 1); // Ensure progress does not exceed 100%
  }

  return (
    <View 
      style={[styles.panel, { bottom: -insets.bottom / 2.35 }]}
      onLayout={(event) => {
        const { width } = event.nativeEvent.layout;
        setPanelWidth(width);
      }}
    >
      {isLoading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', bottom: 5 }}>
          <ActivityIndicator color={Colors.textLight}/>
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
            <>
            <ThemedText
                fontSize={24}
                fontWeight="Regular"
              >{getSymbolOfPreferredCurrency()}</ThemedText>
              <ThemedText
                fontSize={36}
                fontWeight="Bold"
              >{
                calculatePaidAmount() > 0 ? calculatePaidAmount().toFixed(2) : '-'
              }</ThemedText>
              <ThemedText
                fontSize={24}
                fontWeight="Light"
              >/</ThemedText>
              <ThemedText
                fontSize={24}
                fontWeight="Regular"
              >{group?.payAmount}</ThemedText>
            </>
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
            {isUserOwner && (
              <ActionButton
                isPrimary={false}
                extraLightWhenSecondary={true}
                icon={<Pencil strokeWidth={2.5} />}
                size={52}
              />

            )}
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
                : "You can now collect the money"
              : hasUserPaid 
                ? "You have paid your share :D"
                : `Pay your share of ${getSymbolOfPreferredCurrency()}${calculateSingleShare().toFixed(2) || '-'} (excl. fee).`
          }</ThemedText>
          <ThemedButton
            loadingOnPress={getSplitProgress() >= 1}
            style={{ width: '100%' }} 
            isPrimary={
              // Owner, and hasn't setup wallet yet → highlight
              (isUserOwner && !isWalletSetup) ||

              // Owner, split is complete, and money is NOT collected → highlight
              (isUserOwner && getSplitProgress() >= 1 && !group?.isMoneyCollected) ||

              // Not owner and hasn't paid yet → highlight
              (!isUserOwner && !hasUserPaid)
            }
            extraLightWhenSecondary={true}
            isDisabled={
              (isUserOwner && group?.isMoneyCollected) ||
              (isUserOwner && isWalletSetup && getSplitProgress() < 1) ||
              (!isUserOwner && hasUserPaid)
            }
            text={
              isUserOwner
                ? (
                    isWalletSetup
                      ? (
                          getSplitProgress() >= 1
                            ? (
                                group?.isMoneyCollected
                                  ? "Collected"
                                  : (verified) ? "Collect money" : "Verify email"
                              )
                            : "Waiting for friends"
                        )
                      : "Setup wallet"
                  )
                : (
                    hasUserPaid
                      ? "Already paid"
                      : (verified ? "Pay split" : "Verify email to pay")
                  )
            }
            onPress={async() => {
              if (!verified) {
                await sendVerify();
                setVerifyModalVisible(true);
                return;
              }

              if (isUserOwner) {
                if (isWalletSetup) {
                  if (getSplitProgress() >= 1) {
                    await handleCollectMoney();
                  }
                } else {
                  await fetchUserProfile(userDetails.userProfile.userId);

                  setWalletModalVisible(true);
                }
              } else {
                setPayModalVisible(true);
              }
            }}  
          /> 
        </FixedBottomView>
        </>
      )}

      <WalletModal 
        visible={walletModalVisible}
        onClose={() => {
          setWalletModalVisible(false)
          refreshUserProfile();
        }}
      />

      <PaymentModal
        paymentAmount={group?.splitAmount} 
        isVisible={payModalVisible}
        onClose={() => setPayModalVisible(false)}
        onSuccess={handleSetPaid}
      />

      <VerifyEmailModal 
        visible={verifyModalVisible}
        onClose={() => setVerifyModalVisible(false)}
      />
    </View>
  );
};


export default GroupActionsPanel