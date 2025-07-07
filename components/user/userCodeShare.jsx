import { View, Text } from 'react-native'
import React from 'react'
import HorizontalView from '../views/horizontalView';
import UserCode from './userCode';
import ActionButton from '../common/actionButton';
import { ShareIcon } from 'lucide-react-native';

const UserCodeShare = ({userCode, onShare}) => {
  return (
    <HorizontalView style={{marginTop: 10, gap: 5}}>
      <UserCode fontSize={20} userCode={userCode}></UserCode>
      <ActionButton
        icon={<ShareIcon strokeWidth={2.5} />}
        size={40}
        isPrimary={false}
        isRound={false}
        loadingOnPress={true}
        onPress={() => {
          onShare?.();
        }}
      />
    </HorizontalView>
  )
}

export default UserCodeShare