import { Share, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import BigText from '../components/common/bigText'
import ThemedView from '../components/views/themedView'
import FixedCenterView from '../components/views/fixedCenterView'
import ThemedButton from '../components/common/themedButton'
import { ArrowRight, BanIcon, Check, CheckCheck, PiIcon, Share2, ShareIcon, X } from 'lucide-react-native'
import { router } from 'expo-router'
import ActionButton from '../components/common/actionButton'
import HorizontalView from '../components/views/horizontalView'
import VerticalView from '../components/views/verticalView'
import InputField from '../components/common/inputField'
import CurvedLine from '../components/special/curveLine'
import FixedBottomView from '../components/views/fixedBottomView'

const themePlayground = () => {
  const [isPrimary, setIsPrimary] = React.useState(true);

  return (
    <ThemedView>
      <CurvedLine text='This is curvy 😋'/>
      <CurvedLine flipY/>
      
      <FixedCenterView yOffset={260}>
        <BigText>BIG Text</BigText>
      
        <ThemedButton
          text='Hi'
          sizeX={100}
          sizeY={50}
          isRound={false}
          isPrimary={true}
          loadingOnPress={true}
          size={65}
          icon={<X strokeWidth={2.5} />}
        />

        <ActionButton 
          isRound={true}
          isPrimary={false}
          size={45}
          loadingOnPress={true}
          icon={<PiIcon strokeWidth={2.5} />}
        />
      </FixedCenterView>


      <FixedBottomView>
        <VerticalView style={{gap: 10}}>
          <InputField 
            keyboard='email'
            placeholder='k_preslav@icloud.com'
            autoCapitalize='none'
          />

          <InputField 
            keyboard='password'
            placeholder='••••••••••••'
            autoCapitalize='none'
            isSecret={true}
          />
        </VerticalView>
        <HorizontalView style={{marginTop: 20, marginBottom: 20, gap: 20}}>
          <ActionButton 
            isRound={true}
            isPrimary={isPrimary}
            size={65}
            loadingOnPress={true}
            onPress={() => setIsPrimary(!isPrimary)}
            icon={isPrimary ? <Check strokeWidth={2.5} /> : <X strokeWidth={2.5} />}
          />
          <ActionButton 
            isRound={true}
            isPrimary={false}
            size={65}
            icon={<X strokeWidth={2.5} />}
          />

          <ActionButton 
            isRound={false}
            isPrimary={true}
            size={65}
            icon={<X strokeWidth={2.5} />}
          />
          <ActionButton 
            isRound={false}
            isPrimary={false}
            loadingOnPress={true}
            size={65}
            icon={<Check strokeWidth={2.5} />}
          />
        </HorizontalView>
        
        <VerticalView style={{gap: 10}}>          
          <ThemedButton
            text="Let's go"
            loadingOnPress={true}
            enableHaptic={true}
            onPress={() => console.log('Button Pressed')}
            icon={<ArrowRight strokeWidth={2.5} />}
          />

          <ThemedButton
            isPrimary={false}
            loadingOnPress={true}
            enableHaptic={true}
            icon={<ShareIcon strokeWidth={2.5} />}
          />
        </VerticalView>
      </FixedBottomView>
    </ThemedView>
  )
}

export default themePlayground