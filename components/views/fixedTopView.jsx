import { View } from 'react-native'
import React from 'react'
import { Colors } from '../themes/colors'
import { styles } from '../themes/styles' 

const FixedTopView = ({style, ...props}) => {
  return (
    <View 
      style={[styles.fixedTop, style]}
      {...props}
    />
  )
}

export default FixedTopView