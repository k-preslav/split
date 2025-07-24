import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native'
import React, { useCallback, useEffect } from 'react'
import ThemedView from '../../../components/views/themedView'
import { styles } from '../../../components/themes/styles'
import ActionButton from '../../../components/common/actionButton'
import { ArrowLeft, ArrowLeftFromLine, ArrowRightFromLine, Check, ChevronLeft, DollarSign, Euro, LogOut, PoundSterlingIcon, Wallet, WalletCards, X } from 'lucide-react-native'
import { scale } from 'react-native-size-matters'
import HorizontalView from '../../../components/views/horizontalView'
import ThemedText from '../../../components/common/themedText'
import Separator from '../../../components/special/separator'
import UserIcon from '../../../components/user/userIcon'
import { userDetails } from '../../../lib/userDetails'
import NameBar from '../../../components/common/nameBar'
import InputField from '../../../components/common/inputField'
import UserCodeShare from '../../../components/user/userCodeShare'
import VerticalView from '../../../components/views/verticalView'
import ShareUserCodeModal from '../../../components/modals/shareUserCodeModal'
import { account, isVerified, sendChangePassword, sendVerify } from '../../../lib/appwrite'
import ThemedButton from '../../../components/common/themedButton'
import { Colors, getGradientColors } from '../../../components/themes/colors'
import { router, useFocusEffect } from 'expo-router'
import { useUser } from '../../../hooks/useUser'
import { updateUserCollectData, updateUserEmail, updateUserName, updateUserProfilePic, updateUserShouldBeLoggedOut } from '../../../lib/updateUser'
import EnterPasswordModal from '../../../components/modals/enterPasswordModal'
import { uploadUserProfilePic } from '../../../lib/userProfilePic'
import { DELETE_USER_RES_CODES, deleteUser } from '../../../lib/userDelete'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { BlurView } from 'expo-blur'
import { LinearGradient } from 'expo-linear-gradient'
import WalletModal from '../../../components/modals/walletModal'
import VerifyEmailModal from '../../../components/modals/verifyEmailModal'

const AccountSettingsView = () => {
  const {setGesturesEnabled, logout} = useUser();

  const [walletModalVisible, setWalletModalVisible] = React.useState(false);
  
  const [userCodeShareModalVisible, setUserCodeShareModalVisible] = React.useState(false);
  const [passwordModalVisible, setPasswordModalVisible] = React.useState(false);
  const [password, setPassword] = React.useState('');
  
  const [name, setName] = React.useState(userDetails.userProfile.name || '');
  
  const [email, setEmail] = React.useState(userDetails.userProfile.email || '');
  const [newEmail, setNewEmail] = React.useState(userDetails.userProfile.email || '');
  const [isEmailChanged, setIsEmailChanged] = React.useState(false);
  
  const [profilePicOriginal, setProfilePicOriginal] = React.useState(userDetails.userProfile.profilePicId || null);
  const [profilePicSelect, setProfilePicSelect] = React.useState(null);

  const [collectData, setCollectData] = React.useState(userDetails.userProfile.collectData);
  
  const [wantsToDeleteAccount, setWantsToDeleteAccount] = React.useState(false);

  const [verified, setVerified] = React.useState(false);
  const [verificationModalVisible, setVerificationModalVisible] = React.useState(false);

  const gradientColors = getGradientColors();

  useFocusEffect(useCallback(() => {
    setGesturesEnabled(true);
  }, []));

  const checkVerification = async () => {
    const isVerifiedRes = await isVerified();
    setVerified(isVerifiedRes);
  };

  useEffect(() => {
    checkVerification();
  }, [verificationModalVisible]);

  const applyChangesAndClose = async () => {
    const updateNameRes = await updateUserName(name);
    if (updateNameRes.code) {
      Alert.alert("Failed to update name", updateNameRes.message || 'Something went wrong.');
      return;
    }

    if (isEmailChanged) {
      const emailUpdateRes = await updateUserEmail(newEmail, password);
      if (emailUpdateRes.code) {
        if (emailUpdateRes.code !== 409) { // email is the same, so what?
          Alert.alert("Failed to update email", emailUpdateRes.message || 'Something went wrong.');
          return;
        }
      }
    }

    if (profilePicSelect) {
      const profilePicUpload = await uploadUserProfilePic(profilePicSelect, profilePicOriginal);
      if (!profilePicUpload) {
        Alert.alert("Failed to upload profile picture", "Please try again.");
        return;
      }

      const profilePicId = profilePicUpload?.$id;
      const profilePicUpdateRes = await updateUserProfilePic(profilePicId);
      if (!profilePicUpdateRes) {
        Alert.alert("Failed to update profile picture", profilePicUpdateRes?.message || 'Something went wrong.');
        return;
      }
    }

    const updateCollectData = await updateUserCollectData(collectData);
    if (updateCollectData.code) {
      Alert.alert("Failed to update collect data preference", updateCollectData.message || 'Something went wrong.');
      return;
    }

    router.replace('/');
  }

  return (
    <ThemedView style={{
      flex: 1,
      width: '100%',
      paddingHorizontal: 16,
      gap: 10,
      justifyContent: 'flex-start',
      alignItems: 'flex-start',
    }}>
      <HorizontalView style={{
        width: '100%'
      }}>
        <ActionButton 
          isPrimary={false}
          overrideIconSize={28}
          icon={<ChevronLeft style={{right: 1}} strokeWidth={2.5} />}
          onPress={() => router.back()}
        />
        <ThemedText
          fontSize={24}
          fontWeight={'Medium'}
        >Account Settings</ThemedText>

        <ActionButton 
          icon={<Check strokeWidth={2.7}/>}
          loadingOnPress={true}
          onPress={async () => await applyChangesAndClose()}
        />
      </HorizontalView>

      <Separator />

      <HorizontalView style={[settingStyles.horizontalView, {height: 120}]}>
        <View style={{
          width: 120,
          height: 120
        }}>
          <UserIcon 
            enableSelectImage={true}
            onImageSelected={(image) => setProfilePicSelect(image)}
            nameBarPosition='none'
            user={userDetails.userProfile}/>
        </View>

        <VerticalView style={{
          width: '100%',
          height: '100%',
          justifyContent: 'center',
          alignItems: 'flex-start',
          gap: 3,
        }}>
          <InputField 
            placeholder='-'
            autoCapitalize='words'
            style={{
              height: 45,
            }}
            value={name}
            onChangeText={setName}
          />
          <UserCodeShare 
            userCode={userDetails.userProfile.userCode}
            onShare={() => setUserCodeShareModalVisible(true)}
          />
        </VerticalView>
      </HorizontalView>

      <Separator />

      <View style={{ flex: 1, width: '100%' }}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ gap: 12 }}
        >
          <HorizontalView style={[settingStyles.horizontalView, {gap: 5}]}>
            <ThemedText fontSize={20} fontWeight="Medium">Email:</ThemedText>
            <InputField 
              placeholder="-"
              autoCapitalize="none"
              keyboard="email"
              width={200}
              fontSize={16}
              value={email}
              onChangeText={setEmail}
              onKeyboardSubmit={async() => {
                if (newEmail !== email) {
                  setNewEmail(email)

                  if (email !== userDetails.userProfile.email) {
                    setVerified(false);
                    setPasswordModalVisible(true);
                    setIsEmailChanged(true);
                  }
                  else {
                    await checkVerification();
                  }
                }
              }}
            />
            <ThemedButton 
              text={newEmail === email ? (verified ? "Verified" : "Verify") : ''}
              icon={newEmail !== email && <ArrowRightFromLine style={{right: 5}} strokeWidth={2.5} />}
              isPrimary={!verified || newEmail !== email}
              isRound={false}
              sizeY={48}
              sizeX={70}
              fontSize={verified ? 12 : 16}
              disablePrimaryGlow={true}
              loadingOnPress={!verified}
              isDisabled={verified && newEmail === email}
              onPress={async() => {
                if (newEmail !== email) {
                  setNewEmail(email);

                  if (email !== userDetails.userProfile.email) {
                    setVerified(false);
                    setPasswordModalVisible(true);
                    setIsEmailChanged(true);
                  }
                  else {
                    await checkVerification();
                  }
                } else if (!verified) {
                  await sendVerify();
                  setVerificationModalVisible(true);
                }
              }}
            />
          </HorizontalView>

          <HorizontalView style={settingStyles.horizontalView}>
            <ThemedText fontSize={20} fontWeight="Medium">Password:</ThemedText>
            <ThemedButton 
              text="Change Password"
              isPrimary={false}
              sizeY={50}
              sizeX={235}
              fontSize={16}
              onPress={async() => {
                await sendChangePassword();
                Alert.alert("Password change email sent", "Please check your inbox and follow the instructions to change your password.");

                updateUserShouldBeLoggedOut(true);
                setTimeout(() => {
                  userDetails._isAfterPasswordChange = true;
                  router.navigate('/user/user_welcome');
                }, 3000);
              }}
            />
          </HorizontalView>

          <Separator />
          
          <HorizontalView style={{paddingHorizontal: 7}}>
            <ThemedButton
              text='Wallet' 
              isPrimary={false}
              isRound={false}
              sizeY={50}
              sizeX={'100%'}
              icon={<Wallet strokeWidth={2.5} style={{marginLeft: 3}} />}
              onPress={() => setWalletModalVisible(true)}
            />
          </HorizontalView>

          <Separator />

          <HorizontalView style={settingStyles.horizontalView}>
            <ThemedText fontSize={20} fontWeight="Medium">Collect anonymous data:</ThemedText>
            <HorizontalView style={{gap: 5, alignItems: 'center'}}>
              <ActionButton 
                isPrimary={collectData === true}
                isRound={false}
                size={44}
                icon={<Check strokeWidth={3} />}
                onPress={() => setCollectData(true)}
              />
              <ActionButton 
                isPrimary={collectData === false}
                isRound={false}
                size={44}
                icon={<X strokeWidth={2.5} />}
                onPress={() => setCollectData(false)}
              />
            </HorizontalView>
          </HorizontalView>
          <HorizontalView style={{flex: 1, justifyContent: 'space-around'}}>
            <ThemedButton 
              text='Privacy Policy'
              isPrimary={false}
              isRound={false}
              fontSize={18}
              fontWeight='Medium'
              sizeX={170}
              sizeY={50}
            />
            <ThemedButton 
              text='Terms of Service'
              isPrimary={false}
              isRound={false}
              fontSize={18}
              fontWeight='Medium'
              sizeX={170}
              sizeY={50}
            />
          </HorizontalView>

          <Separator />
          <View style={{width: '100%', alignItems: 'center'}}>
            <ThemedButton 
              text='Log out'
              isPrimary={false}
              isRound={false}
              fontSize={18}
              sizeX={"96%"}
              sizeY={50}
              icon={<LogOut strokeWidth={2.5} />}
              onPress={async () => {
                Alert.alert(
                  "Log out", "Are you sure you want to log out?",
                  [
                    {
                      text: "Cancel",
                      style: "cancel"
                    },
                    {
                      text: "Log out",
                      onPress: async () => {
                        await logout();
                        router.replace('/user/user_welcome');
                      }
                    }
                  ]
                )
              }}
            />
            <HorizontalView style={{gap: 3.5, marginTop: 14}}>
              <ThemedText
                fontSize={14}
                fontWeight="Regular"
              >If you want to delete your account, you can</ThemedText>
              <ThemedText
                fontSize={14}
                color={Colors.red}
                style={{textDecorationLine: 'underline'}}
                fontWeight="Regular"
                onPress={() => {
                  Alert.alert("Are you sure?", "This action cannot be undone. Your account will be permanently deleted.", [
                    {
                      text: "Cancel",
                      style: "cancel"
                    },
                    {
                      text: "Delete Account",
                      style: "destructive",
                      onPress: () => {
                        setWantsToDeleteAccount(true);
                        setPasswordModalVisible(true);
                      }
                    }
                  ])
                }}
              >click here</ThemedText>
            </HorizontalView>
          </View>
        </ScrollView>
        <LinearGradient
          colors={gradientColors}
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 40,
            zIndex: 10,
          }}
          pointerEvents="none"
        />
      </View>
      
      <VerifyEmailModal 
        visible={verificationModalVisible}
        onClose={() => setVerificationModalVisible(false)}
        overrideEmail={newEmail}
      />
      <WalletModal 
        visible={walletModalVisible}
        onClose={() => setWalletModalVisible(false)}
      />
      <ShareUserCodeModal 
        userCode={userDetails.userProfile.userCode}
        visible={userCodeShareModalVisible}
        onClose={() => setUserCodeShareModalVisible(false)}
      />
      <EnterPasswordModal 
        visible={passwordModalVisible}
        onClose={() => {
          if (!wantsToDeleteAccount) {
            setIsEmailChanged(false)
          }

          setWantsToDeleteAccount(false)
          setPasswordModalVisible(false)
        }}
        onSubmit={async(pass) => {
          setPassword(pass)
          
          if (wantsToDeleteAccount) {
            const deleteResponse = await deleteUser(pass);

            if (deleteResponse === DELETE_USER_RES_CODES.INCORRECT_PASSWORD) {
              Alert.alert("Cannot delete account", "The password you provided is incorrect.")
            }
            else if (deleteResponse === DELETE_USER_RES_CODES.NO_USER_ID) {
              Alert.alert("Cannot delete account", "No user ID found in user details, cannot delete account.")
            }
            else if (deleteResponse === DELETE_USER_RES_CODES.SUCCESS) {
              Alert.alert("Sad to see you go 😔", "Your account has been successfully deleted.");
            }
            else {
              Alert.alert("Error deleting account", "Something went wrong. Guess you will stick with us for a while longer.");
            }
          }

          setPasswordModalVisible(false);
          router.replace('/user/user_welcome');
        }}
      />
    </ThemedView>
  )
}

export default AccountSettingsView

const settingStyles = StyleSheet.create({
  horizontalView: {
    width: '95%',
    paddingHorizontal: 10,
    gap: 10,
    justifyContent: 'space-between',
  }
})