import { View } from 'react-native'
import React from 'react'
import { getStyles } from '../themes/styles'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'

const ThemedView = ({style, ...props}) => {
  const insets = useSafeAreaInsets();

  const styles = getStyles();

  const customTopPadding = insets.top === 0 ? 20 : 0;
  const customBottomPadding = insets.bottom === 0 ? 20 : 0;

  return (
    <SafeAreaView 
      style={[styles.container, {
        paddingTop: customTopPadding,
        paddingBottom: customBottomPadding,
      }, style]}
      {...props}
    />
  )
}

export default ThemedView