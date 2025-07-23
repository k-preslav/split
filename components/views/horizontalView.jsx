import { View } from 'react-native'
import React from 'react'
import { Colors } from '../themes/colors'
import { getStyles } from '../themes/styles'

const HorizontalView = ({style, ...props}) => {
  const styles = getStyles();

  return (
    <View 
      style={[styles.horizontalView, style]}
      {...props}
    />
  )
}

export default HorizontalView