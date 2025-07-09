import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native'
import React, { useCallback } from 'react'
import ThemedView from '../../../components/views/themedView'
import { styles } from '../../../components/themes/styles'
import ActionButton from '../../../components/common/actionButton'
import { ArrowLeft, ArrowLeftFromLine, ArrowRightFromLine, Check, ChevronLeft, DollarSign, Euro, LogOut, PoundSterlingIcon, X } from 'lucide-react-native'
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
import { account } from '../../../lib/appwrite'
import ThemedButton from '../../../components/common/themedButton'
import { Colors } from '../../../components/themes/colors'
import { router, useFocusEffect } from 'expo-router'
import { useUser } from '../../../hooks/useUser'
import { updateUserCollectData, updateUserEmail, updateUserName, updateUserPreferredCurrency, updateUserProfilePic } from '../../../lib/updateUser'
import EnterPasswordModal from '../../../components/modals/enterPasswordModal'
import { uploadUserProfilePic } from '../../../lib/userProfilePic'

const AccountSettingsView = () => {
  const {setGesturesEnabled, logout} = useUser();
  
  const [userCodeShareModalVisible, setUserCodeShareModalVisible] = React.useState(false);
  const [passwordModalVisible, setPasswordModalVisible] = React.useState(false);
  const [password, setPassword] = React.useState('');

  const [name, setName] = React.useState(userDetails.userProfile.name || '');

  const [email, setEmail] = React.useState(userDetails.userProfile.email || '');
  const [newEmail, setNewEmail] = React.useState(userDetails.userProfile.email || '');
  const [isEmailChanged, setIsEmailChanged] = React.useState(false);

  const [profilePicSelect, setProfilePicSelect] = React.useState(null);

  const [preferredCurrency, setPreferredCurrency] = React.useState(userDetails.userProfile.preferredCurrency || 'USD');

  const [collectData, setCollectData] = React.useState(userDetails.userProfile.collectData);

  useFocusEffect(useCallback(() => {
    setGesturesEnabled(true);
  }, []));

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
      const profilePicUpload = await uploadUserProfilePic(profilePicSelect);
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

    const updatePrefCurrencyRes = await updateUserPreferredCurrency(preferredCurrency);
    if (updatePrefCurrencyRes.code) {
      Alert.alert("Failed to update preferred currency", updatePrefCurrencyRes.message || 'Something went wrong.');
      return;
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
              onKeyboardSubmit={() => {
                if (newEmail !== email) {
                  setNewEmail(email)
                  setPasswordModalVisible(true);
                  setIsEmailChanged(true);
                }
              }}
            />
            <ThemedButton 
              text={newEmail === email ? "Verify" : ''}
              icon={newEmail !== email && <ArrowRightFromLine style={{right: 5}} strokeWidth={2.5} />}
              isPrimary={true}
              isRound={false}
              sizeY={48}
              sizeX={70}
              fontSize={16}
              disablePrimaryGlow={true}
              onPress={() => {
                if (newEmail !== email) {
                  setNewEmail(email);
                  setPasswordModalVisible(true);
                  setIsEmailChanged(true);
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
              onPress={() => {
                account.updatePassword('new-password');
              }}
            />
          </HorizontalView>

          <Separator />
          
          <HorizontalView style={settingStyles.horizontalView}>
            <ThemedText fontSize={19} fontWeight="Medium">Preferred Currency:</ThemedText>
            <HorizontalView style={{gap: 5, alignItems: 'center'}}>
              <ActionButton 
                isPrimary={preferredCurrency === 'USD'}
                isRound={false}
                size={44}
                icon={<DollarSign strokeWidth={2.5} />}
                onPress={() => setPreferredCurrency('USD')}
              />
              <ActionButton 
                isPrimary={preferredCurrency === 'EUR'}
                isRound={false}
                size={44}
                icon={<Euro strokeWidth={2.5} />}
                onPress={() => setPreferredCurrency('EUR')}
              />
              <ActionButton 
                isPrimary={preferredCurrency === 'GBP'}
                isRound={false}
                size={44}
                icon={<PoundSterlingIcon strokeWidth={2.5} />}
                onPress={() => setPreferredCurrency('GBP')}
              />
            </HorizontalView>
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
              >click here</ThemedText>
            </HorizontalView>
          </View>
        </ScrollView>
      </View>

      <ShareUserCodeModal 
        userCode={userDetails.userProfile.userCode}
        visible={userCodeShareModalVisible}
        onClose={() => setUserCodeShareModalVisible(false)}
      />
      <EnterPasswordModal 
        visible={passwordModalVisible}
        onClose={() => {
          setIsEmailChanged(false)
          setPasswordModalVisible(false)
        }}
        onSubmit={(pass) => {
          setPassword(pass)
          setPasswordModalVisible(false);
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