import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import ThemedView from '../components/views/themedView'
import ThemedButton from '../components/common/themedButton'
import { chargeSubscriptionPayment } from '../lib/stripeApi'

const SubscriptionPlayground = () => {
  return (
    <ThemedView>
      <ThemedButton
        text="Test charge"
        loadingOnPress={true}
        onPress={async () => {
          const res = await chargeSubscriptionPayment(1)
          if (res) {
            console.log('Subscription payment successful:', res);
          }
        }}
      />
    </ThemedView>
  )
}

export default SubscriptionPlayground

const styles = StyleSheet.create({})