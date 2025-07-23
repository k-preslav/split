import { View } from 'react-native'
import React from 'react'
import { Colors } from '../themes/colors'
import { getStyles } from '../themes/styles'

const VerticalView = ({style, ...props}) => {
  const styles = getStyles()

  return (
    <View 
      style={[styles.verticalView, style]}
      {...props}
    />
  )
}

export default VerticalView