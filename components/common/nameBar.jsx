import { View, Text } from 'react-native'
import React from 'react'
import ThemedText from './themedText'
import { Colors } from '../themes/colors'

const NameBar = ({name='-', fontSize=22, style, ...props}) => {
  return (
    <View style={[nameBarStyles.container, style]} {...props}>
      <ThemedText fontSize={fontSize} fontWeight={"Medium"}>{name}</ThemedText>
    </View>
  )
}

export default NameBar

const nameBarStyles = {
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.backgroundSecondary,
    paddingVertical: 7,
    paddingHorizontal: 20,
    borderRadius: 99,
    borderWidth: 1,
    borderColor: Colors.lightGray,
  },
}