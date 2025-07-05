import { View } from 'react-native'
import React from 'react'
import { Colors } from '../themes/colors'
import { styles } from '../themes/styles'

const VerticalView = ({style, ...props}) => {
  return (
    <View 
      style={[styles.verticalView, style]}
      {...props}
    />
  )
}

export default VerticalView