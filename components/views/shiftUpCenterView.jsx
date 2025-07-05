import { View } from 'react-native'
import React from 'react'
import { Colors } from '../themes/colors'
import { styles } from '../themes/styles'

const ShiftUpCenterView = ({...props}) => {
  return (
    <View 
      style={styles.containerShiftUp}
      {...props}
    />
  )
}

export default ShiftUpCenterView