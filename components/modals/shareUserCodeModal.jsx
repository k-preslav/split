import { View, Text, Image } from 'react-native'
import React from 'react'
import ThemedModal from './themedModal'
import ThemedText from '../common/themedText'
import QRCodeStyled from 'react-native-qrcode-styled';
import { Colors } from '../themes/colors';
import BigButton from '../common/bigButton';
import { Forward } from 'lucide-react-native';

const ShareUserCodeModal = ({visible=true, userCode='no code', onClose}) => {
  return (
    <ThemedModal height='50%' visible={visible} onClose={onClose}>
      <View style={{position: 'absolute', top: 90, right: 30}}>
        <ThemedText
          fontWeight={'Medium'}
          fontSize={24}
          style={{
            textAlign: 'center',
          }}
        >{'S\nC\nA\nN\n\nM\nE'}</ThemedText>
      </View>
      <View style={shareCodeStayle.qrCodeContainer}>
        <QRCodeStyled 
          data={userCode}
          pieceSize={12.5}
          pieceScale={1.02}
          pieceLiquidRadius={5}
          outerEyesOptions={{
            borderRadius: 24,
          }}
          errorCorrectionLevel={'H'}
        />
      </View>

      <View style={shareCodeStayle.fixedBottom}>
        <BigButton 
          icon={<Forward strokeWidth={2.5} />}
          style={{width: '93%', height: 80}}
        >Share</BigButton>
      </View>
    </ThemedModal>
  )
}

export default ShareUserCodeModal

const shareCodeStayle = {
  qrCodeContainer: {
    backgroundColor: Colors.light,
    padding: 1,
    borderRadius: 30,
    width: '80%',
    height: '75%', 
    alignContent: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fixedBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
  }
}