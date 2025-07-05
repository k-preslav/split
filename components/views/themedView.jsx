import { View } from 'react-native'
import React from 'react'
import { styles } from '../themes/styles'
import { SafeAreaView } from 'react-native-safe-area-context'

const ThemedView = ({...props}) => {
  return (
    <SafeAreaView 
      style={styles.container}
      {...props}
    />
  )
}

export default ThemedView