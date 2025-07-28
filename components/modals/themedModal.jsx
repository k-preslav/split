import React from 'react';
import { Animated, Dimensions, Easing, Modal, View } from 'react-native';
import { getStyles } from '../themes/styles';
import ActionButton from '../common/actionButton';
import { X } from 'lucide-react-native';
import ReactNativeModal from 'react-native-modal';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const ThemedModal = ({
  visible,
  onClose,
  height = '50%',
  children,
  closeButtonPosition = 'right',
}) => {
  const screenHeight = Dimensions.get('window').height;
  const animatedHeight = React.useRef(new Animated.Value(0)).current;

  const insets = useSafeAreaInsets();
  const styles = getStyles();

  React.useEffect(() => {
    const numeric = typeof height === 'string' && height.endsWith('%')
      ? parseFloat(height) / 100
      : 0.5;

    const targetHeight = numeric * screenHeight;

    Animated.timing(animatedHeight, {
      toValue: targetHeight,
      duration: 225,
      useNativeDriver: false,
      easing: Easing.out(Easing.ease),
    }).start();
  }, [height]);

  return (
    <ReactNativeModal
      visible={visible}
      animationType='slide'
      transparent={true}
      onRequestClose={onClose}
      hardwareAccelerated={true}
      deviceWidth={'100%'}
      
    >
      <View style={styles.modalOverlay}>
        <Animated.View style={[styles.modalBox, { height: animatedHeight }]}>
          {children}

          <View style={{
            position: 'absolute',
            top: 10,
            [closeButtonPosition]: 10,
          }}>
            <ActionButton
              isPrimary={false}
              extraLightWhenSecondary={true}
              icon={<X strokeWidth={2.5} />}
              onPress={onClose}
            />
          </View>
        </Animated.View>
      </View>
    </ReactNativeModal>
  );
};

export default ThemedModal;
