import { Share, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import BigText from '../components/common/bigText'
import ThemedView from '../components/views/themedView'
import ShiftUpCenterView from '../components/views/shiftUpCenterView'
import BigButton from '../components/common/bigButton'
import { ArrowRight, BanIcon, PiIcon, Share2, ShareIcon } from 'lucide-react-native'
import { router } from 'expo-router'

const themePlayground = () => {
  const [isPrimary, setIsPrimary] = React.useState(false);

  return (
    <ThemedView>
      <ShiftUpCenterView>
        <BigText>Welcome 👋</BigText>
      </ShiftUpCenterView>
      
      <BigButton
        loadingOnPress={true}
        enableHaptic={true}
        onPress={() => console.log('Button Pressed')}
        icon={<ArrowRight strokeWidth={2.5} />}
      >
        Let's go
      </BigButton>

      <BigButton
        isPrimary={isPrimary}
        loadingOnPress={true}
        enableHaptic={true}
        onPress={() => setIsPrimary(!isPrimary)}
        icon={<ShareIcon strokeWidth={2.5} />}
      >
        Share
      </BigButton>
    </ThemedView>
  )
}

export default themePlayground