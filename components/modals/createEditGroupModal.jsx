import { View, Text, Alert, Image, Keyboard, ActivityIndicator, ScrollView, Dimensions, PixelRatio } from 'react-native'
import {ReactNativeModal} from 'react-native-modal'
import React, { useEffect } from 'react'
import ThemedModal from './themedModal'
import ActionButton from '../common/actionButton'
import { Check, ChevronRight, QrCode, Trash2, Upload } from 'lucide-react-native'
import ThemedText from '../common/themedText'
import Separator from '../special/separator'
import HorizontalView from '../views/horizontalView'
import InputField from '../common/inputField'
import { Colors, colorScheme, getGradientColorsSecondary } from '../themes/colors'
import ThemedButton from '../common/themedButton'
import { selectImage } from '../../lib/imageSelect'
import { getUserProfileByCode } from '../../lib/getUser'
import { getUserProfilePicUrl } from '../../lib/userProfilePic'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { createNewGroup, tryFindGroupImageByGroupName, uploadGroupImage } from '../../lib/groupsApi'
import { userDetails } from '../../lib/userDetails'
import { router } from 'expo-router'
import { getSymbolOfPreferredCurrency } from '../../lib/getCurrencyFromLocale'
import UserIcon from '../user/userIcon'
import { BlurView } from 'expo-blur'
import { LinearGradient } from 'expo-linear-gradient'
import { Camera, CameraView, useCameraPermissions } from 'expo-camera'
import Constants from 'expo-constants';
import { calculateTotalPaymentAmount } from '../../lib/paymentFee'
import Animated, { configureReanimatedLogger, useSharedValue, withTiming, useAnimatedStyle, Easing } from 'react-native-reanimated'

const CreateEditGroupModal = ({ visible, onSubmit, onClose }) => {
  const [scrollY, setScrollY] = React.useState(0);
  const scrollGradientOpacity = React.useMemo(() => {
    const min = 0;
    const max = 10;

    // Clamp scrollY to the range
    const clamped = Math.max(min, Math.min(scrollY, max));

    // Normalize to range [0, 1]
    const normalized = (clamped - min) / (max - min);

    return normalized;
  }, [scrollY]);

  const [groupName, setGroupName] = React.useState('New group')
  const [groupNameTemp, setGroupNameTemp] = React.useState('')

  const [groupImage, setGroupImage] = React.useState(null)
  const [groupImageFile, setGroupImageFile] = React.useState(null)

  const [groupImagePadding, setGroupImagePadding] = React.useState(0)
 
  const [fullAmount, setFullAmout] = React.useState(0.0)
  const [fullAmountTemp, setFullAmoutTemp] = React.useState(null)

  const [paymentOptionIndex, setPaymentOptionIndex] = React.useState(0)
  const [billingDateOption, setBillingDateOption] = React.useState(0)
  
  const [friendCodeInput, setFriendCodeInput] = React.useState('')
  const [friends, setFriends] = React.useState([])
  const [isAddingFriend, setIsAddingFriend] = React.useState(false)
  const [forceShowFriendCodeInput, setForceShowFriendCodeInput] = React.useState(false)

  const [friendShare, setFriendShare] = React.useState(0.0)
  
  const gradientColors = getGradientColorsSecondary();
  
  const [qrRequested, setQrRequested] = React.useState(false);
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  
  const [modalHeight, setModalHeight] = React.useState('94.5%');
  const [modalHeightNumeric, setModalHeightNumeric] = React.useState(0);

  const [keyboardHeight, setKeyboardHeight] = React.useState(0);
  
  const [statusBarOffset, setStatusBarOffset] = React.useState(0);
  const statusBarGradOpacity = useSharedValue(0);
  const [showStatusBarGradient, setShowStatusBarGradient] = React.useState(false);

  // Add refs for positioning
  const scrollViewRef = React.useRef(null);
  const [scrollViewLayout, setScrollViewLayout] = React.useState({
    top: 0,
    bottom: 0,
    width: 0
  });

  // Function to update scroll view measurements
  const measureScrollView = () => {
    if (scrollViewRef.current && visible) {
      scrollViewRef.current.measureInWindow((x, y, width, height) => {
        setScrollViewLayout({
          top: y,
          bottom: y + height,
          width: width,
          left: x
        });
      });
    }
  };

  // Update measurements when modal becomes visible
  React.useEffect(() => {
    if (visible) {
      // Allow the modal to render first
      setTimeout(measureScrollView, 100);
    }
  }, [visible, modalHeight]);

  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', (e) => {
      setKeyboardHeight(e.endCoordinates.height);
    });
    const hideSub = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  useEffect(() => {
    if (!forceShowFriendCodeInput) {
      setModalHeight('94.5%');
      setModalHeightNumeric(Dimensions.get('window').height * 0.945); // numeric equivalent
      setShowStatusBarGradient(false);
      return;
    }

    const windowHeight = Dimensions.get('window').height;

    const friendsListHeight = (friends.length === 0 ? 1 : friends.length) * 90;
    const needsExtraHeight = paymentOptionIndex === 1;
    const adjustment = needsExtraHeight ? -keyboardHeight + 50 : -keyboardHeight - 25;

    const totalHeight = windowHeight + keyboardHeight + friendsListHeight + adjustment;
    const percentHeight = (totalHeight / windowHeight) * 100;

    setModalHeightNumeric(totalHeight);
    setModalHeight(`${percentHeight.toFixed(0)}%`);
  }, [forceShowFriendCodeInput, keyboardHeight, friends.length, paymentOptionIndex]);



  useEffect(() => {
    if (forceShowFriendCodeInput) {
      setShowStatusBarGradient(true);
    }

    const windowHeight = Dimensions.get('window').height;
    const offsetFromTop = modalHeightNumeric - windowHeight;
    setStatusBarOffset(offsetFromTop);
    
    statusBarGradOpacity.set(0);
    statusBarGradOpacity.value = withTiming(1, { duration: 500 });
  }, [modalHeightNumeric]);

  configureReanimatedLogger({
    strict: false,
  });

  const close = () => {
    setGroupNameTemp('')
    setGroupName('New group')

    setFullAmout(0.0)
    setFullAmoutTemp(null)

    setPaymentOptionIndex(0)
    setBillingDateOption(0)
    setForceShowFriendCodeInput(false)

    setFriendCodeInput('')
    setFriends([])
    setFriendShare(0)
    setIsAddingFriend(false)
    
    setGroupImageFile(null)
    setGroupImage(null)
    setGroupImagePadding(0)

    onClose?.()
  }

  const openQrScanner = async () => {
    if (!cameraPermission?.granted) {
      requestCameraPermission();

      setQrRequested(true);
    }
  }

  const addFriend = async (code) => {
    //setIsAddingFriend(true)

    if (code.length !== 6) {
      Alert.alert('Invalid code', 'Friend code must be 6 characters long.')
      setIsAddingFriend(false)
      return
    }

    const friend = await getUserProfileByCode(code)
    if (!friend) {
      Alert.alert('Friend not found', 'No user found with this code.')
      setIsAddingFriend(false)
      return
    }

    if (friends.some(f => f.userCode === friend.userCode)) {
      Alert.alert('Friend already added', 'This user is already in your group.')
      setIsAddingFriend(false)
      return
    }
    if (friend.userCode === userDetails.userProfile.userCode) {
      Alert.alert('Cannot add yourself', 'You cannot add yourself to the group.')
      setIsAddingFriend(false)
      return
    }

    let profileImgUrl = null
    if (friend.profilePicId) {
      profileImgUrl = await getUserProfilePicUrl(friend.profilePicId)
    }

    const friendData = {
      userCode: friend.userCode,
      name: friend.name,
      profileImgUrl: profileImgUrl,
    }

    setFriends((prev) => [...prev, friendData])
    setIsAddingFriend(false)
  }

  const calculateShare = () => {
    if (friends.length < 1 || fullAmount <= 0) {
      return 0;
    }

    const friendCount = friends.length + 1; // Include the user themselves in the share calculation

    const friendShare = fullAmount / friendCount;

    setFriendShare(friendShare);
    return friendShare;
  };

  React.useEffect(() => {
    calculateShare();
  }, [friends.length, fullAmount]);

  const createGroup = async () => {
    if (groupName.trim() === '') {
      Alert.alert('Group name cannot be empty.');
      return;
    }

    if (fullAmount === null || isNaN(fullAmount) || fullAmount <= 0) {
      Alert.alert('Please enter a valid full amount.');
      return;
    }

    if (friends.length === 0) {
      Alert.alert('Please add at least one friend to the group.');
      return;
    }

    if (userDetails.userProfile.userId === null) {
      Alert.alert('Owner profile not found. Please log in again.');
      
      router.push('/user/user_welcome');
      return;
    }

    if (groupImage === null) {
      Alert.alert('Please select a group image.');
      return;
    }

    let groupImageStorageFile = groupImageFile;
    if (groupImageFile === null) { // The group image is selected by the user
      groupImageStorageFile = await uploadGroupImage(groupImage)
    }

    await createNewGroup(
      groupName,
      userDetails.userProfile.userId,
      friends.map(friend => friend.userCode),
      [],
      groupImageStorageFile.$id,
      parseFloat(fullAmount),
      parseFloat(friendShare),
      parseFloat(calculateTotalPaymentAmount(friendShare)),
      paymentOptionIndex,
      billingDateOption,
    )

    onSubmit?.();
    close();
  }

  const expandedHeight = 80;
  const collapsedHeight = 0; 
  const animatedHeight = useSharedValue(collapsedHeight);

  const animatedStyle = useAnimatedStyle(() => ({
    height: withTiming(animatedHeight.value, {
      duration: 150,
      easing: Easing.inOut(Easing.ease), // example easing function
    }),
  }));

  // Update height when paymentOptionIndex changes
  React.useEffect(() => {
    animatedHeight.value = paymentOptionIndex === 1 ? expandedHeight : collapsedHeight;
  }, [paymentOptionIndex]);

  return (
    <>
      <ThemedModal closeButtonPosition="left" visible={visible} onClose={close} height={modalHeight}>
        { showStatusBarGradient && visible && (
          <LinearGradient
            colors={[gradientColors[0], gradientColors[2]]}
            opacity={statusBarGradOpacity.get()}
            start={{ x: 0, y: 1 }}
            end={{ x: 0, y: 0 }}
            style={{
              position: 'absolute',
              top: statusBarOffset,
              left: 0,
              right: 0,
              height: 150,
              zIndex: 9999,
            }}
          />
        )}

        <View
          style={{
            position: 'absolute',
            top: 10,
            right: 10,
          }}
        >
          <ActionButton
            isPrimary={true}
            extraLightWhenSecondary={true}
            icon={<Check strokeWidth={2.5} />}
            loadingOnPress={true}
            onPress={async() => await createGroup()}
          />
        </View>

        {/* Group name centered */}
        <View
          style={{
            position: 'absolute',
            top: 23,
            left: 0,
            right: 0,
            alignItems: 'center',
          }}
        >
          <ThemedText fontSize={28} fontWeight={'Medium'}>
            {groupName}
          </ThemedText>
        </View>

        <View
          style={{
            flex: 1,
            alignItems: 'center',
            marginTop: 65,
            gap: 8,
          }}
        >
          <Separator />

          {/* Group image + name input */}
          <HorizontalView style={{ gap: 20 }}>
            <ActionButton
              icon={
                groupImage ? (
                  <Image
                    source={{ uri: groupImage }}
                    style={{
                      width: 82,
                      height: 82,
                      borderRadius: 99,
                      padding: groupImagePadding,
                    }}
                  />
                ) : (
                  <Upload strokeWidth={2.5} />
                )
              }
              extraLightWhenSecondary={true}
              size={82}
              isPrimary={false}
              isRound={true}
              loadingOnPress={true}
              onPress={async () => {
                const img = await selectImage()
                if (img) {
                  setGroupImage(img)
                  setGroupImagePadding(0)
                  setGroupImageFile(null);
                }
              }}
            />

            <InputField
              style={{
                width: '60%',
                height: 60,
                backgroundColor: Colors.lightGray,
              }}
              extraLightBorder={true}
              placeholder={'Group name'}
              maxLength={15}
              value={groupNameTemp}
              onChangeText={setGroupNameTemp}
              autoCapitalize={'words'}
              onBlur={async() => {             
                setGroupName(groupNameTemp)
                const matchImage = await tryFindGroupImageByGroupName(groupNameTemp);

                const handleSetImg = () => {
                  setGroupImagePadding(12);
                  setGroupImage(matchImage.uri);
                  setGroupImageFile(matchImage.file);
                }

                if (matchImage) {
                  if (groupImage && !groupImageFile)
                  {
                    Alert.alert(
                      "Group Image Available",
                      "We've found an image that matches your group name. Would you like to use this image for your group?",
                      [
                        {
                          text: "No, thanks",
                          style: "cancel",
                        },
                        {
                          text: "Yes, use it",
                          onPress: () => {
                            handleSetImg();
                          },
                        },
                      ]
                    )
                  }
                  else {
                    handleSetImg();
                  }
                }
              }}
              fontSize={20}
            />
          </HorizontalView>

          <Separator />

          {/* Full amount input */}
          <HorizontalView style={{ gap: 20 }}>
            <ThemedText fontSize={26} fontWeight={'Medium'}>
              Full amount:
            </ThemedText>
            <InputField
              style={{
                width: '50%',
                height: 60,
                backgroundColor: Colors.lightGray,
              }}
              extraLightBorder={true}
              placeholder={`${getSymbolOfPreferredCurrency()} 0.00`}
              keyboardType="decimal-pad"
              value={fullAmountTemp}
              onChangeText={setFullAmoutTemp}
              onBlur={() => {
                const input = fullAmountTemp?.replace(',', '.').replace(getSymbolOfPreferredCurrency(), '') || '0.0'
                const num = parseFloat(input)
                if (num === 0) {
                  return
                }

                const formatted = (Math.ceil(num * 10) / 10).toFixed(2)

                setFullAmout(formatted)
                setFullAmoutTemp(`${getSymbolOfPreferredCurrency()} ${formatted}`)

                calculateShare()
              }}
              fontSize={20}
            />
          </HorizontalView>

          {/* Payment options */}
          <HorizontalView style={{ gap: 10, marginTop: 5 }}>
            <ThemedButton
              text="One time"
              isPrimary={paymentOptionIndex === 0}
              extraLightWhenSecondary={true}
              isRound={false}
              sizeX={170}
              sizeY={70}
              fontSize={22}
              fontWeight={paymentOptionIndex === 0 ? 'Bold' : 'Medium'}
              onPress={() => setPaymentOptionIndex(0)}
            />
            <ThemedButton
              text="Subscription"
              isPrimary={paymentOptionIndex === 1}
              extraLightWhenSecondary={true}
              isRound={false}
              sizeX={175}
              sizeY={70}
              fontSize={21}
              fontWeight={paymentOptionIndex === 1 ? 'Bold' : 'Medium'}
              onPress={() => setPaymentOptionIndex(1)}
            />
          </HorizontalView>

          {/* Animated container for "Every month" and "Every year" buttons */}
          <Animated.View style={[animatedStyle, { marginTop: 5 }]}>
            <HorizontalView style={{ gap: 10 }}>
              <ThemedButton
                text="Every month"
                isPrimary={billingDateOption === 0}
                extraLightWhenSecondary={true}
                isRound={false}
                sizeX={170}
                sizeY={70}
                fontSize={20}
                fontWeight={billingDateOption === 0 ? 'Bold' : 'Medium'}
                onPress={() => setBillingDateOption(0)}
              />
              <ThemedButton
                text="Every year"
                isPrimary={billingDateOption === 1}
                extraLightWhenSecondary={true}
                isRound={false}
                sizeX={175}
                sizeY={70}
                fontSize={21}
                fontWeight={billingDateOption === 1 ? 'Bold' : 'Medium'}
                onPress={() => setBillingDateOption(1)}
              />
            </HorizontalView>
          </Animated.View>

          <Separator />

      {/* Friends input */}
      <HorizontalView style={{ gap: 20, marginBottom: 5, paddingHorizontal: 10 }}>
        <ThemedText fontSize={26} fontWeight={'Medium'}>
          Friends:
        </ThemedText>

        <InputField
          style={{
            flex: 1,
            height: 60,
            marginRight: -10,
            backgroundColor: Colors.lightGray,
          }}
          extraLightBorder={true}
          maxLength={6}
          fontSize={20}
          placeholder="Friend code"
          value={friendCodeInput}
          onChangeText={setFriendCodeInput}
          onBlur={() => {
            // Don't add friend if there's no input
            if (!friendCodeInput?.length) {
              setForceShowFriendCodeInput(false);
              return;
            }
            
            // Only process on blur when not coming from button press
            setTimeout(() => {
              // Check if friendCodeInput has been cleared (which would indicate the button handler ran)
              if (friendCodeInput && friendCodeInput.length > 0) {
                addFriend(friendCodeInput);
                setFriendCodeInput('');
              }
            
              setForceShowFriendCodeInput(false);
            }, 100);
          }}
          onFocus={() => {
            setForceShowFriendCodeInput(true);
          }}
          />
        <ActionButton
          loadingOnPress={true}
          disablePrimaryGlow={true}
          size={60}
          icon={
            friendCodeInput?.length > 0 ? (
              <ChevronRight strokeWidth={2.5} />
            ) : (
              <QrCode strokeWidth={2.5} />
            )
          }
          onPress={async () => {
            Keyboard.dismiss()
            if (friendCodeInput?.length > 0) {
              const codeToAdd = friendCodeInput;
              setFriendCodeInput(''); // Clear immediately to prevent double addition
              await addFriend(codeToAdd);
            } else {
              await openQrScanner();
            }
          }}
          />
      </HorizontalView>

      {/* Scrollable friend list */}
      <View 
        style={{ flex: 1, paddingHorizontal: 5, width:'100%', backgroundColor: Colors.backgroundSecondary }}
        ref={scrollViewRef}
        onLayout={measureScrollView}
      >
        <ScrollView
          contentContainerStyle={{ paddingBottom: 16 }}
          style={{ backgroundColor: Colors.backgroundSecondary }}
          keyboardShouldPersistTaps="handled"
          onScroll={(event) => setScrollY(event.nativeEvent.contentOffset.y)}
        >
          {isAddingFriend ? (
            <View
            style={{
              width: '100%',
              height: 100,
              backgroundColor: Colors.lightGray,
              borderRadius: 10,
                justifyContent: 'center',
                alignItems: 'center',
              }}
              >
              <ActivityIndicator size="large" color={Colors.white} />
            </View>
          ) : friends.length > 0 ? (
            friends.map((friend, index) => (
              <View
              key={friend?.userCode || index}
              style={{
                width: '100%',
                height: 80,
                marginBottom: 8,
                backgroundColor: Colors.lightGray,
                borderRadius: 15,
                justifyContent: 'center',
                borderWidth: 1,
                borderColor: Colors.lighterGray,
              }}
              >
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    position: 'relative',
                    paddingHorizontal: 10,
                    height: '100%',
                    width: '100%',
                  }}
                  >
                  {/* Left group: image + name */}
                  <View style={{ flexDirection: 'row', alignItems: 'center', flexShrink: 1 }}>
                    <View style={{ 
                      width: 64, 
                      height: 64, 
                      marginRight: 10, 
                      left: -3,
                      shadowColor: 'black',
                      shadowOpacity: 0.2,
                      shadowRadius: 10,
                      shadowOffset: { width: 0, height: 0 },
                      overflow: 'visible',
                    }}>
                      <UserIcon
                        user={friend}
                        nameBarPosition='none'
                      />
                    </View>

                    <ThemedText fontSize={20} fontWeight="Medium" style={{ flexShrink: 1 }}>
                      {friend.name}
                    </ThemedText>
                  </View>

                  {/* Trash button and split amount aligned right */}
                  <ThemedText
                    fontSize={20}
                    fontWeight="Regular"
                    color={'#626262'}
                    style={{
                      position: 'absolute',
                      marginLeft: '51%',
                    }}
                    >
                    {
                      parseFloat(friendShare) > 0 ? `${getSymbolOfPreferredCurrency()} ${parseFloat(friendShare).toFixed(2)}` : ''
                    }
                  </ThemedText>
                  <ActionButton
                    icon={<Trash2 strokeWidth={2.5} />}
                    isPrimary={false}
                    isRound={false}
                    size={60}
                    style={{
                      backgroundColor: Colors.red,
                      marginLeft: 'auto',
                    }}
                    onPress={() => {
                      setFriends((prev) => prev.filter((_, i) => i !== index))
                    }}
                    />
                </View>
              </View>
            ))
          ) : (
            <View
            style={{
              width: '100%',
              height: 80,
              backgroundColor: Colors.lightGray,
              borderRadius: 10,
              justifyContent: 'center',
              alignItems: 'center',
              borderWidth: 1,
              borderColor: Colors.lighterGray,
              shadowColor: 'black',
              shadowOpacity: 0.1,
              shadowRadius: 15,
              shadowOffset: { width: 0, height: 10 },
            }}
            >
              <ThemedText fontSize={20} fontWeight="Medium">
                No friends added
              </ThemedText>
            </View>
          )}
        </ScrollView>
        
        {/* Gradients moved inside the modal but positioned absolutely within the scrollview container */}
        {colorScheme === 'dark' && (
          <LinearGradient
            colors={gradientColors}
            start={{ x: 0, y: 1 }}
            end={{ x: 0, y: 0 }}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 65,
              opacity: scrollGradientOpacity,
              pointerEvents: 'none',
            }}
          />
        )}
        
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 40,
            pointerEvents: 'none',
          }}
        />
      </View>
      </View>
    </ThemedModal>
    </>
  )
}

export default CreateEditGroupModal