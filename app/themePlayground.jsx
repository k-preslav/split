import { Share, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import BigText from '../components/common/bigText'
import ThemedView from '../components/views/themedView'
import ShiftUpCenterView from '../components/views/shiftUpCenterView'
import PrimaryButton from '../components/common/primaryButton'
import { ArrowRight, BanIcon, PiIcon, Share2, ShareIcon } from 'lucide-react-native'
import { router } from 'expo-router'
import SecondaryButton from '../components/common/secondaryButton'

const themePlayground = () => {
  return (
    <ThemedView>
      <ShiftUpCenterView>
        <BigText>Welcome 👋</BigText>
      </ShiftUpCenterView>
      
      <PrimaryButton
        loadingOnPress={true}
        enableHaptic={true}
        onPress={() => console.log('Button Pressed')}
        icon={<ArrowRight strokeWidth={2.5} />}
      >
        Let's go
      </PrimaryButton>

      <SecondaryButton
        loadingOnPress={true}
        enableHaptic={true}
        onPress={() => console.log('Button Pressed')}
        icon={<ShareIcon strokeWidth={2.5} />}
      >
        Share
      </SecondaryButton>
    </ThemedView>
  )
}

export default themePlayground