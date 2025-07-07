import React from 'react';
import { Modal, View } from 'react-native';
import { styles } from '../themes/styles';
import ActionButton from '../common/actionButton';
import { X } from 'lucide-react-native';
import ReactNativeModal from 'react-native-modal';

const ThemedModal = ({ visible, onClose, height, children }) => { 
  return (
    <Modal
      visible={visible}
      animationType='slide'
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalBox, { height: height || '50%' }]}>
          {children}
          <View style={{ position: 'absolute', top: 10, right: 10 }}>
            <ActionButton
              isPrimary={false}
              extraLightWhenSecondary={true}
              icon={<X strokeWidth={2.5} />}
              onPress={onClose}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default ThemedModal;