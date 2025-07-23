import { View } from 'react-native'
import React from 'react'
import { Colors } from '../themes/colors'
import { getStyles } from '../themes/styles'

const FixedBottomView = ({style, ...props}) => {
  const styles = getStyles();

  return (
    <View 
      style={[styles.fixedBottom, style]}
      {...props}
    />
  )
}

export default FixedBottomView