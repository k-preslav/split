import { Button, Image, SafeAreaView, StyleSheet, Text, View } from 'react-native'
import { styles } from '../../components/themes/styles'
import { router, useFocusEffect } from 'expo-router'
import { useCallback, useEffect, useState } from 'react'
import { useUser } from '../../hooks/useUser'
import { createNewGroup, getGroupsByOwnerId } from '../../lib/groupsApi'
import { userDetails } from '../../lib/userDetails'
import ThemedView from '../../components/views/themedView'
import { getUserProfilePicImg, getUserProfilePicUrl } from '../../lib/userProfilePic'

const Groups = () => {
  const {setGesturesEnabled, logout} = useUser();
  const [groups, setGroups] = useState([]);
  const [pic, setPic] = useState(null);

  const fetchGroups = async () => {
    const url = await getUserProfilePicUrl(userDetails.userProfile.profilePicId);
    setPic(url);

    try {
      //const groups = await getGroupsByOwnerId(userDetails.userProfile.userId);
      //setGroups(groups);
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
      <Image 
        source={{ uri: pic }}
        style={{ width: 150, height: 150, borderRadius: 75 }}
      />

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