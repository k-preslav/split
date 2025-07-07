import { View, Text, Alert, Image, Keyboard, ActivityIndicator, ScrollView } from 'react-native'
import React from 'react'
import ThemedModal from './themedModal'
import ActionButton from '../common/actionButton'
import { Check, ChevronRight, QrCode, Trash2, Upload } from 'lucide-react-native'
import ThemedText from '../common/themedText'
import Separator from '../special/separator'
import HorizontalView from '../views/horizontalView'
import InputField from '../common/inputField'
import { Colors } from '../themes/colors'
import ThemedButton from '../common/themedButton'
import { selectImage } from '../../lib/imageSelect'
import { getUserProfileByCode } from '../../lib/getUser'
import { getUserProfilePicUrl } from '../../lib/userProfilePic'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const CreateEditGroupModal = ({ visible, onSubmit, onClose }) => {
  const [groupName, setGroupName] = React.useState('New group')
  const [groupNameTemp, setGroupNameTemp] = React.useState('')

  const [groupImage, setGroupImage] = React.useState(null)

  const [fullAmmount, setFullAmmout] = React.useState(0.0)
  const [fullAmmountTemp, setFullAmmoutTemp] = React.useState(null)

  const [paymentOptionIndex, setPaymentOptionIndex] = React.useState(0)
  const [billingDateOption, setBillingDateOption] = React.useState(0)

  const [friendCodeInput, setFriendCodeInput] = React.useState('')
  const [friends, setFriends] = React.useState([])
  const [isAddingFriend, setIsAddingFriend] = React.useState(false)

  const close = () => {
    setGroupNameTemp('')
    setGroupName('New group')

    setGroupImage(null)
    setFullAmmout(0.0)
    setFullAmmoutTemp(null)

    setPaymentOptionIndex(0)
    setBillingDateOption(0)

    setFriendCodeInput('')
    setFriends([])

    onClose?.()
  }

  const addFriend = async (code) => {
    //setIsAddingFriend(true)

    const friend = await getUserProfileByCode(code)
    if (!friend) {
      Alert.alert('Friend not found', 'No user found with this code.')
      setIsAddingFriend(false)
      return
    }

    const profileImgUrl = await getUserProfilePicUrl(friend.profilePicId)

    const friendData = {
      userCode: friend.userCode,
      name: friend.name,
      profileImgUrl: profileImgUrl,
    }

    setFriends((prev) => [...prev, friendData])
    setIsAddingFriend(false)
  }

  const calculateShare = () => {
    if (friends.length <= 1 || fullAmmount <= 0) {
      return 0
    }
    const share = fullAmmount / friends.length
    const fee = share * 0.2

    const result = Math.ceil((share + fee) * 100) / 100;
    return result
  }

  return (
    <ThemedModal closeButtonPosition="left" visible={visible} onClose={close} height={'95%'}>
      {/* Close button */}
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
          onPress={close}
        />
      </View>

      {/* Group name centered */}
      <View
        style={{
          position: 'absolute',
          top: 22,
          left: 0,
          right: 0,
          alignItems: 'center',
        }}
      >
        <ThemedText fontSize={30} fontWeight={'Medium'}>
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
                    borderRadius: 65,
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
              }
            }}
          />

          <InputField
            style={{
              width: '60%',
              height: 60,
              backgroundColor: Colors.lightGray,
            }}
            placeholder={'Group name'}
            value={groupNameTemp}
            onChangeText={setGroupNameTemp}
            onKeyboardSubmit={() => setGroupName(groupNameTemp)}
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
            placeholder="$0.0"
            keyboardType="decimal-pad"
            value={fullAmmountTemp}
            onChangeText={setFullAmmoutTemp}
            onKeyboardSubmit={() => {
              const input = fullAmmountTemp?.replace(',', '.') || '0.0'
              const num = parseFloat(input)
              if (num === 0) {
                return
              }

              const formatted = (Math.ceil(num * 10) / 10).toFixed(1)

              setFullAmmout(formatted)
              setFullAmmoutTemp(formatted)
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

        {paymentOptionIndex === 1 && (
          <HorizontalView style={{ gap: 10, marginTop: 5 }}>
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
        )}

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
          maxLength={6}
          placeholder="Friend code"
          value={friendCodeInput}
          onChangeText={setFriendCodeInput}
          onKeyboardSubmit={() => {
            if (friendCodeInput?.length === 6) {
              addFriend(friendCodeInput)
            }
            setFriendCodeInput('')
          }}
          fontSize={20}
          />
        <ActionButton
          loadingOnPress={true}
          size={60}
          icon={
            friendCodeInput?.length === 6 ? (
              <ChevronRight strokeWidth={2.5} />
            ) : (
              <QrCode strokeWidth={2.5} />
            )
          }
          onPress={async () => {
            Keyboard.dismiss()
            if (friendCodeInput?.length === 6) {
              await addFriend(friendCodeInput)
              setFriendCodeInput('')
            } else {
              console.log('Opening QR scanner')
            }
          }}
          />
      </HorizontalView>

      {/* Scrollable friend list */}
      <View style={{ flex: 1, paddingHorizontal: 5, width:'100%'}}>
        <ScrollView
          contentContainerStyle={{ paddingBottom: 16 }}
          keyboardShouldPersistTaps="handled"
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
                    <View
                      style={{
                        width: 64,
                        height: 64,
                        borderRadius: 30,
                        shadowColor: 'black',
                        shadowOpacity: 0.2,
                        shadowRadius: 10,
                        shadowOffset: { width: 0, height: 0 },
                        elevation: 5,
                        overflow: 'visible',
                        marginRight: 15,
                      }}
                      >
                      <Image
                        source={{ uri: friend.profileImgUrl }}
                        style={{
                          width: 64,
                          height: 64,
                          borderRadius: 30,
                        }}
                        />
                    </View>

                    <ThemedText fontSize={20} fontWeight="Medium" style={{ flexShrink: 1 }}>
                      {friend.name}
                    </ThemedText>
                  </View>

                  {/* Bill in absolute center */}
                  <ThemedText
                    fontSize={20}
                    fontWeight="Regular"
                    color={'#626262'}
                    style={{
                      position: 'absolute',
                      left: '50%',
                      transform: [{ translateX: 35 }],
                    }}
                    >
                    {calculateShare() ? `$${calculateShare().toFixed(1)}` : ''}
                  </ThemedText>

                  {/* Trash button aligned right */}
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
            }}
            >
              <ThemedText fontSize={20} fontWeight="Medium">
                No friends added
              </ThemedText>
            </View>
          )}
        </ScrollView>
      </View>
      
      </View>

      {/* Footer info */}
      <View
        style={{
          padding: 10,
          alignItems: 'center',
        }}
      >
        <ThemedText fontSize={12} fontWeight={'Regular'} color={Colors.textGray}>
          A 20% fee is added to each friend's share.
        </ThemedText>
      </View>
    </ThemedModal>
  )
}

export default CreateEditGroupModal