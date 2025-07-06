import { Button, SafeAreaView, StyleSheet, Text, View } from 'react-native'
import { styles } from '../../components/themes/styles'
import { router, useFocusEffect } from 'expo-router'
import { useCallback, useEffect, useState } from 'react'
import { useUser } from '../../hooks/useUser'
import { createNewGroup, getGroupsByOwnerId } from '../../lib/groupsApi'
import { userDetails } from '../../lib/userDetails'
import ThemedView from '../../components/views/themedView'

const Groups = () => {
  const {setGesturesEnabled, logout} = useUser();
  const [groups, setGroups] = useState([]);

  const fetchGroups = async () => {
    try {
      const groups = await getGroupsByOwnerId(userDetails.userProfile.userId);
      setGroups(groups);
    } catch (err) {
      console.error('Error:', err);
    }
  };
  
  useFocusEffect(useCallback(() => {
    fetchGroups();
    setGesturesEnabled(false);
  }, []))

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.text}>Groups</Text>

      { groups.map((group, index) => (
        <View key={group.$id + index} style={styles.groupItem}>
          <Button 
            title={group.groupName}
            onPress={() => {
              //router.push(`/groups/groupDetails/${group.$id}`)
            }}
          />
        </View>
      ))}

      <Button 
        title="New group"
        onPress={() => {
          router.push("/groups/createGroup")
        }
      }></Button>

      <Button 
        title="Loguot"
        onPress={async () => {
          await logout();
          router.replace('/');
        }
      }></Button>
    </SafeAreaView>
  )
}

export default Groups