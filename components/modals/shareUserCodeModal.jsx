import { View, Text, Image, Share, Alert, Dimensions } from 'react-native'
import React from 'react'
import ThemedModal from './themedModal'
import ThemedText from '../common/themedText'
import QRCodeStyled from 'react-native-qrcode-styled';
import { Colors } from '../themes/colors';
import ThemedButton from '../common/themedButton';
import { Check, Copy, CopyCheck, CopyMinus, Forward } from 'lucide-react-native';
import HorizontalView from '../views/horizontalView';
import ActionButton from '../common/actionButton';
import * as Clipboard from 'expo-clipboard';
import { moderateScale, moderateVerticalScale, scale } from 'react-native-size-matters';
import { deviceInfo } from '../../global/deviceInfo';

const ShareUserCodeModal = ({visible=true, userCode='no code', onClose}) => {
  const [codeCopied, setCodeCopied] = React.useState(false);

  const { width, height } = Dimensions.get('window');
  const pieceSize = width < 250 ? 7 : width < 350 ? 11 : width > 390 ? 12 : 13;
  const modalHeight = width < 350 ? '56%' : '50%'
  const qrContainerWidth = width < 350 ? '79%' : '82%';
  const scanMeFontSize = width < 350 ? 17 : 22;

  const handleShareExternal = async () => {
    try {
      await Share.share({
        message: userCode,
      });
    }
    catch (error) {
      Alert.alert("Something went wrong.");
      console.error('Error sharing user code:', error);
    }
  }

  return (
    <ThemedModal height={modalHeight} visible={visible} onClose={onClose}>
      <View style={{position: 'absolute', top: 90, right: 30}}>
        <ThemedText
          fontWeight={'Medium'}
          fontSize={scanMeFontSize}
          style={{
            textAlign: 'center',
          }}
        >{'S\nC\nA\nN\n\nM\nE'}</ThemedText>
      </View>
      <View style={[shareCodeStayle.qrCodeContainer, {width: qrContainerWidth}]}>
        <QRCodeStyled 
          data={userCode}
          pieceSize={pieceSize}
          pieceScale={1.02}
          pieceLiquidRadius={5}
          outerEyesOptions={{
            borderRadius: 24,
          }}
          errorCorrectionLevel={'H'}
        />
      </View>

      <View style={shareCodeStayle.fixedBottom}>
        <HorizontalView style={{gap: 5}}>
          <ActionButton 
            icon={codeCopied ? <Check strokeWidth={2.5}/> : <Copy strokeWidth={2.5} />}
            size={moderateVerticalScale(70)}
            onPress={async() => {

              await Clipboard.setStringAsync(userCode);
              setCodeCopied(true);

              setTimeout(() => {
                setCodeCopied(false);
              }, 1500);
            }}
          />
          <ThemedButton 
            text='Share'
            isPrimary={true}
            isRound={true}
            icon={<Forward strokeWidth={2.5} />}
            style={{width: '72%', height: moderateVerticalScale(70), borderRadius: 99}}
            loadingOnPress={true}
            onPress={handleShareExternal}
          />
        </HorizontalView>
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
    width: '82%',
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
    paddingBottom: deviceInfo.devicePlatform === 'ios' && deviceInfo.devicePlatformVersion < 19 ? 23 : 20,
    alignItems: 'center',
    justifyContent: 'center',
  }
}