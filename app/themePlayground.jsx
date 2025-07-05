import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import BigText from '../components/common/bigText'
import ThemedView from '../components/views/themedView'
import ShiftUpCenterView from '../components/views/shiftUpCenterView'
import PrimaryButton from '../components/common/primaryButton'
import { ArrowRight } from 'lucide-react-native'
import { router } from 'expo-router'

const themePlayground = () => {
  return (
    <ThemedView>
      <ShiftUpCenterView>
        <BigText>Welcome 🎉</BigText>
      </ShiftUpCenterView>
      
      <PrimaryButton
        loadingOnPress={true}
        enableHaptic={true}
        onPress={() => console.log('Button Pressed')}
        icon={<ArrowRight strokeWidth={2.5} />}
      >
        Let's go
      </PrimaryButton>
    </ThemedView>
  )
}

export default themePlayground