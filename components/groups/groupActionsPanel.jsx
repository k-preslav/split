import { View, Text, BackHandler, ActivityIndicator } from 'react-native'
import React, { useEffect, useState } from 'react'
import { styles } from '../themes/styles'
import ThemedButton from '../common/themedButton'
import FixedBottomView from '../views/fixedBottomView'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import ThemedText from '../common/themedText'
import FixedTopView from '../views/fixedTopView'
import HorizontalView from '../views/horizontalView'
import { userDetails } from '../../lib/userDetails'
import { getSymbolOfPreferredCurrency } from '../../lib/getCurrencyFromLocale'
import ActionButton from '../common/actionButton'
import { Ban, Edit, Pencil } from 'lucide-react-native'
import { Colors } from '../themes/colors'
import { databases } from '../../lib/appwrite'
import ProgressBar from '../special/progressBar'

const GroupActionsPanel = ({group, hasUserPaid, isUserOwner}) => {
  const insets = useSafeAreaInsets();
  const [isLoading, setIsLoading] = React.useState(false);

  const [panelWidth, setPanelWidth] = useState(0);

  useEffect(() => {
    if (!group) {
      setIsLoading(true);
    } else {
      setIsLoading(false);
    }
  }, [group])

  const handleSetPaid = async() => {
    try {
      await databases.updateDocument(
        process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID,
        process.env.EXPO_PUBLIC_APPWRITE_GROUPS_COLLECTION_ID,
        group.groupId,
        {
          paidFriendsCodes: [
            ...group.paidFriendsCodes,
            userDetails.userProfile.userCode
          ],
        }
      )

      console.log('Added user code to paid friends codes.');
    } catch (error) {
      console.error('Error updating group with paid friend code:', error, error.code);
    }
  }

  return (
    <View 
      style={[styles.panel, { bottom: -insets.bottom / 2.35 }]}
      onLayout={(event) => {
        const { width } = event.nativeEvent.layout;
        setPanelWidth(width);
      }}
    >
      {isLoading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', bottom: 5 }}>
          <ActivityIndicator color={Colors.textLight}/>
        </View>
      ) : (
        <>
        <View
          style={{
            position: 'absolute',
            top: -12,
            left: 0,
            right: 0,
            flexDirection: 'row',
            justifyContent: 'flex-start',
            alignItems: 'baseline',
            gap: 7,
            padding: 22,
            zIndex: 1,
          }}
        >
          <ThemedText
            fontSize={24}
            fontWeight="Regular"
          >{getSymbolOfPreferredCurrency()}</ThemedText>
          <ThemedText
            fontSize={36}
            fontWeight="Bold"
          >10</ThemedText>
          <ThemedText
            fontSize={24}
            fontWeight="Light"
          >/</ThemedText>
          <ThemedText
            fontSize={24}
            fontWeight="Regular"
          >{group?.payAmount}</ThemedText>
        </View>

        <View
          style={{
            position: 'absolute',
            top: -12,
            right: -12,
            flexDirection: 'row',
            justifyContent: 'flex-start',
            alignItems: 'baseline',
            gap: 7,
            padding: 22,
            zIndex: 1,
          }}
        >
          <HorizontalView style={{ gap: 8 }}>
            <ActionButton 
              isPrimary={false}
              showStroke={false}
              icon={<Ban strokeWidth={3} />}
              size={52}
              overrideBackgroundColor={Colors.red}
              />
            <ActionButton
              isPrimary={false}
              extraLightWhenSecondary={true}
              icon={<Pencil strokeWidth={2.5} />}
              size={52}
            />
          </HorizontalView>
        </View>

        <View style={{ position:'absolute', width: '100%', paddingHorizontal: 5, paddingTop: 75 }}>
          <ProgressBar 
            progress={0.5}
          />
        </View>

        <FixedBottomView>
          <ThemedText
            fontSize={12}
            fontWeight={"Regular"}
            color={Colors.textGray}
            style={{ marginBottom: 10, textAlign: 'center' }}
          >A payout is expected to take a few day to be processed</ThemedText>
          <ThemedButton 
            style={{ width: '100%' }} 
            isPrimary={!hasUserPaid}
            extraLightWhenSecondary={true}
            isDisabled={hasUserPaid}
            text={isUserOwner ? "Collect money" : hasUserPaid ? "Already paid" : "Pay split"}
            onPress={() => {
              handleSetPaid();
            }}  
          />
        </FixedBottomView>
        </>
      )}
    </View>
  );
};


export default GroupActionsPanel