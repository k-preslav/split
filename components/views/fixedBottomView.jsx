import { View } from 'react-native'
import React from 'react'
import { Colors } from '../themes/colors'
import { styles } from '../themes/styles'

const FixedBottomView = ({style, ...props}) => {
  return (
    <View 
      style={[styles.fixedBottom, style]}
      {...props}
    />
  )
}

export default FixedBottomView