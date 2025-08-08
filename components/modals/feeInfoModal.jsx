import { View, Text } from 'react-native'
import React from 'react'
import ThemedModal from './themedModal'
import ThemedText from '../common/themedText'
import Separator from '../special/separator'
import HorizontalView from '../views/horizontalView'
import VerticalView from '../views/verticalView'
import { getSymbolOfPreferredCurrency } from '../../lib/getCurrencyFromLocale'
import { Colors } from '../themes/colors'
import { calculateSplitAppFee, calculateStripeFee } from '../../lib/paymentFee'
import { convertToUserCurrency } from '../../lib/currencyConvert'

const FeeInfoModal = ({originalPaymentAmount, totalPaymentAmount, visible, onClose}) => {
  const [stripeFee, setStripeFlatFee] = React.useState(0);
  const [splitAppFlatFee, setSplitAppFlatFee] = React.useState(0);

  React.useEffect(() => {
    const calculateFees = async () => {
      const stripeFlatFee = await convertToUserCurrency(0.50);
      const splitAppFlatFee = await convertToUserCurrency(0.15);

      setStripeFlatFee(stripeFlatFee);
      setSplitAppFlatFee(splitAppFlatFee);
    };

    calculateFees();
  }, []);

  return (
    <ThemedModal visible={visible} onClose={onClose} height='48%'>
      <View style={{
        position: 'absolute',
        top: 22,
        left: 0,
        right: 0,
        bottom: 0,
        paddingHorizontal: 10,
        gap: 4,
      }}>
        <ThemedText style={{ paddingLeft: 12, marginBottom: 10 }} fontSize={30} fontWeight='Bold'>
          Why the fee?
        </ThemedText>

        <Separator />
        <View style={{gap: 14}}>
          <HorizontalView style={{ gap: 10, alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, marginTop: 7 }}>
            <ThemedText fontSize={23} fontWeight='Medium'>Original share</ThemedText>
            <HorizontalView style={{ gap: 6, alignItems: 'center' }}>
              <ThemedText fontSize={23} fontWeight='Regular'>{getSymbolOfPreferredCurrency()}</ThemedText>
              <ThemedText fontSize={23} fontWeight='Regular'>{originalPaymentAmount?.toFixed(2) || 0}</ThemedText>
            </HorizontalView>
          </HorizontalView>

          <Separator style={{marginVertical: 5}}/>

          <HorizontalView style={{ gap: 10, alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12 }}>
            <ThemedText fontSize={23} fontWeight='Medium'>Payment fee</ThemedText>
            <HorizontalView style={{ gap: 6, alignItems: 'center' }}>
            <ThemedText fontSize={23} fontWeight='Regular'>{`1.5% + ${getSymbolOfPreferredCurrency()} ${stripeFee?.toFixed(2) || 0}`}</ThemedText>
            </HorizontalView>
          </HorizontalView>

          <HorizontalView style={{ gap: 10, alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12 }}>
            <ThemedText fontSize={23} fontWeight='Medium'>Split fee</ThemedText>
            <HorizontalView style={{ gap: 6, alignItems: 'center' }}>
              <ThemedText fontSize={23} fontWeight='Regular'>{`1.5% + ${getSymbolOfPreferredCurrency()} ${splitAppFlatFee?.toFixed(2) || 0}`}</ThemedText>
            </HorizontalView>
          </HorizontalView>

          <Separator style={{marginVertical: 2}}/>

          <HorizontalView style={{ gap: 10, alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, marginTop: 7 }}>
            <ThemedText fontSize={28} fontWeight='Medium'>Total</ThemedText>
            <HorizontalView style={{ gap: 6, alignItems: 'center' }}>
              <ThemedText fontSize={28} fontWeight='Medium'>{getSymbolOfPreferredCurrency()}</ThemedText>
              <ThemedText fontSize={28} fontWeight='Medium'>{totalPaymentAmount?.toFixed(2) || 0}</ThemedText>
            </HorizontalView>
          </HorizontalView>
        </View>
      </View>
    </ThemedModal>
  )
}

export default FeeInfoModal