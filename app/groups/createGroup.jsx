import { Button, Modal, SafeAreaView, StyleSheet, Text, TextInput, View, TouchableOpacity, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from 'react-native'
import React, { useState, useRef, useEffect, useCallback } from 'react'
import { styles } from '../../components/themes/styles'
import { useUser } from '../../hooks/useUser';
import { router, useFocusEffect } from 'expo-router';
import { getUserProfileByCode } from '../../lib/getUser';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { createNewGroup } from '../../lib/groupsApi';
import { userDetails } from '../../lib/userDetails';
import { account } from '../../lib/appwrite';

const createGroup = () => {
  const insets = useSafeAreaInsets();

  const [modalVisible, setModalVisible] = useState(false);
  const [friendCode, setFriendCode] = useState('');
  const [groupName, setGroupName] = useState('');
  const inputRef = useRef(null);

  const { setGesturesEnabled } = useUser();

  useFocusEffect(useCallback(() => {
    setGesturesEnabled(true);
  }, []))

  // Focus the input when modal becomes visible
  useEffect(() => {
    if (modalVisible && inputRef.current) {
      // Short delay to ensure modal is fully rendered
      setTimeout(() => {
        inputRef.current.focus();
      }, 10);
    }
  }, [modalVisible]);

  const [friends, setFriends] = useState([]);

  const handleSubmit = async () => {
    // Process the input number here
    const friend = await getUserProfileByCode(friendCode.toLocaleLowerCase());
    if (!friend) {
      alert("Friend not found. Please check the code and try again.");
      setFriendCode('');
      return;
    }

    if (friend.userCode === userDetails.userProfile.userCode) {
      alert("You cannot add yourself as a friend.");
      setFriendCode('');
      return;
    }

    friends.push(friend);
    console.log("Friend added:", friend.username);

    closeModal();
  }

  const closeModal = () => {
    setModalVisible(false);
    setFriendCode('');
  }

  return (
    <SafeAreaView style={styles.container}>
      {friends.map((friend, index) => (
          <Text key={friend+index}>{friend.username}</Text>
      ))}

      <View style={styles.almostCenter}>
        <TextInput 
          style={styles.input}
          placeholder="Group name"
          value={groupName}
          onChangeText={setGroupName}
          keyboardType="default"
          maxLength={32}
        />

        <Button 
          title="Add a friend"
          onPress={() => setModalVisible(true)}
        />

        <Modal
          animationType="none"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => closeModal()}
        >
          <KeyboardAvoidingView 
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1 }}
            keyboardVerticalOffset={-125}
          >
            <TouchableWithoutFeedback onPress={() => {
              closeModal();
              Keyboard.dismiss();
            }}>
              <View style={localStyles.centeredView}>
                <View style={localStyles.modalView}>
                  <Text style={localStyles.modalText}>Enter friend code:</Text>
                  
                  <TextInput
                    ref={inputRef}
                    style={localStyles.input}
                    onChangeText={setFriendCode}
                    value={friendCode}
                    keyboardType="default"
                    placeholder="A3B2C1"
                    autoCapitalize="none"
                    maxLength={6}
                  />
                  
                  <View style={localStyles.buttonContainer}>
                    <TouchableOpacity
                      style={[localStyles.button, localStyles.buttonCancel]}
                      onPress={() => closeModal()}
                    >
                      <Text style={localStyles.textStyle}>Cancel</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={[localStyles.button, localStyles.buttonSubmit]}
                      onPress={handleSubmit}
                    >
                      <Text style={localStyles.textStyle}>Submit</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </KeyboardAvoidingView>
        </Modal>
      </View>

      <View style={{
        position: 'absolute',
        bottom: insets.bottom + 130,
      }}>
        <Button title="Create group" onPress={async() => {
          const friendsCodes = friends.map(friend => friend.userCode);
          await createNewGroup(groupName, userDetails.userProfile.userId, friendsCodes).then((res) => {
            if (res) {
              router.push('/groups/groupsView');
            }
          });
        }} />
      </View>
    </SafeAreaView>
  )
}

const localStyles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)'
  },
  modalView: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold'
  },
  input: {
    height: 40,
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: 20,
    paddingHorizontal: 10
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%'
  },
  button: {
    borderRadius: 10,
    padding: 10,
    elevation: 2,
    minWidth: 100
  },
  buttonSubmit: {
    backgroundColor: '#2196F3',
  },
  buttonCancel: {
    backgroundColor: '#f44336',
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center'
  }
});

export default createGroup