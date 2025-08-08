import { View, Text } from 'react-native'
import React from 'react'
import HorizontalView from '../views/horizontalView'
import { Colors } from '../themes/colors'

const GroupPageIndicator = ({pagesCount, activePage}) => {
  return (
    <View style={{
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 2,
    }}>
      {Array.from({ length: pagesCount }, (_, index) => (
        <View
          key={index}
          style={{
            marginTop: 15,
            width: index === activePage ? 6.5 : 6,
            height: index === activePage ? 6.5 : 6,
            borderRadius: 5,
            backgroundColor: index === activePage ? Colors.primary : Colors.lightGray,
            marginHorizontal: 2,
          }}
        />
      ))}
    </View>
  )
}

export default GroupPageIndicator