import { View } from 'react-native'
import React from 'react'
import { Colors } from '../themes/colors'
import { styles } from '../themes/styles'

const HorizontalView = ({style, ...props}) => {
  return (
    <View 
      style={[styles.horizontalView, style]}
      {...props}
    />
  )
}

export default HorizontalView