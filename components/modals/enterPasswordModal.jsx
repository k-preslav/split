import { View, Text } from 'react-native'
import React from 'react'
import ThemedModal from './themedModal'
import ActionButton from '../common/actionButton'
import { Check } from 'lucide-react-native'
import ThemedText from '../common/themedText'
import Separator from '../special/separator'
import InputField from '../common/inputField'
import { Colors } from '../themes/colors'

const EnterPasswordModal = ({visible, onClose, onSubmit}) => {
  const [password, setPassword] = React.useState('')
  const [modalHeight, setModalHeight] = React.useState('33%')

  return (
    <ThemedModal height={modalHeight} visible={visible} onClose={onClose} closeButtonPosition='left'>
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
          onPress={() => onSubmit?.(password)}
        />
      </View>

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
          Enter Password
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

        <ThemedText
          fontSize={16}
          fontWeight={'Regular'}
          style={{
            textAlign: 'center',
            paddingHorizontal: 20,
          }}
        >Please enter your password in the field below, for security reasons</ThemedText>

        <InputField 
          placeholder='----------'
          autoCapitalize='none'
          keyboard='password'
          style={{
            width: '90%',
            marginTop: 10,
            backgroundColor: Colors.lightGray
          }}
          value={password}
          onChangeText={setPassword}
          onFocus={() => setModalHeight('70%')}
          onBlur={() => setModalHeight('33%')}
        />
      </View>
    </ThemedModal>
  )
}

export default EnterPasswordModal