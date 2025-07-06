import { View, Text, Image, Share, Alert } from 'react-native'
import React from 'react'
import ThemedModal from './themedModal'
import ThemedText from '../common/themedText'
import QRCodeStyled from 'react-native-qrcode-styled';
import { Colors } from '../themes/colors';
import BigButton from '../common/bigButton';
import { Check, Copy, CopyCheck, CopyMinus, Forward } from 'lucide-react-native';
import HorizontalView from '../views/horizontalView';
import ActionButton from '../common/actionButton';
import * as Clipboard from 'expo-clipboard';

const ShareUserCodeModal = ({visible=true, userCode='no code', onClose}) => {
  const [codeCopied, setCodeCopied] = React.useState(false);

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
        <HorizontalView style={{gap: 5}}>
          <ActionButton 
            icon={codeCopied ? <Check strokeWidth={2.5}/> : <Copy strokeWidth={2.5} />}
            size={80}
            onPress={async() => {
              await Clipboard.setStringAsync(userCode);
              setCodeCopied(true);

              setTimeout(() => {
                setCodeCopied(false);
              }, 1500);
            }}
          />
          <BigButton 
            icon={<Forward strokeWidth={2.5} />}
            style={{width: '72%', height: 80}}
            loadingOnPress={true}
            onPress={handleShareExternal}
          >Share</BigButton>
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
    paddingBottom: 15,
    alignItems: 'center',
    justifyContent: 'center',
  }
}