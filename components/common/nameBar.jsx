import { View, Text } from 'react-native'
import React from 'react'
import ThemedText from './themedText'
import { Colors } from '../themes/colors'
import HorizontalView from '../views/horizontalView'

const NameBar = ({name='-', fontSize=22, icon, style, ...props}) => {
  const nameBarStyles = getNameBarStyles();

  return (
    <View style={[nameBarStyles.container, style]} {...props}>
      <HorizontalView>
        <ThemedText fontSize={fontSize} fontWeight={"Medium"}>{name}</ThemedText>
        {icon && (
          <View style={{ marginLeft: 5, marginRight: -7 }}>
            {icon}
          </View>
        )}
      </HorizontalView>
    </View>
  )
}

export default NameBar

const getNameBarStyles = () => ({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.backgroundSecondary,
    paddingVertical: 7,
    paddingHorizontal: 15,
    borderRadius: 99,
    borderWidth: 1,
    borderColor: Colors.lightGray,
  },
});