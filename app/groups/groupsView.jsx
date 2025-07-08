import { FlatList, View, Dimensions, ActivityIndicator } from 'react-native';
import React, { useCallback, useEffect, useState, useRef } from 'react';
import { router, useFocusEffect } from 'expo-router';
import { useUser } from '../../hooks/useUser';
import { getGroupImageUrl, getGroupsByOwnerId } from '../../lib/groupsApi';
import ThemedView from '../../components/views/themedView';
import GroupComponent from '../../components/groups/groupComponent';
import ActionButton from '../../components/common/actionButton';
import HorizontalView from '../../components/views/horizontalView';
import ThemedButton from '../../components/common/themedButton';
import FixedTopView from '../../components/views/fixedTopView';
import FixedCenterView from '../../components/views/fixedCenterView';
import { Bolt, Plus, Settings, Settings2 } from 'lucide-react-native';
import AnchorView from '../../components/views/anchorView';
import UserCode from '../../components/user/userCode';
import UserCodeShare from '../../components/user/userCodeShare';
import FixedBottomView from '../../components/views/fixedBottomView';
import GroupPageIndicator from '../../components/groups/groupPageIndicator';
import NameBar from '../../components/common/nameBar';
import { userDetails } from '../../lib/userDetails';
import CreateEditGroupModal from '../../components/modals/createEditGroupModal';
import ThemedText from '../../components/common/themedText';
import { Colors } from '../../components/themes/colors';
import { getUserProfileByCode } from '../../lib/getUser';

const { width } = Dimensions.get('window');

const Groups = () => {
  const { setGesturesEnabled, logout } = useUser();
  const [groups, setGroups] = useState([]);
  const [activeGroupIndex, setActiveGroupIndex] = useState(0);
  const [isFetchingGroups, setIsFetchingGroups] = useState(true);

  const [createEditGroupModalVisible, setCreateEditGroupModalVisible] = useState(false);

  const flatListRef = useRef(null);
  const scrollPosition = useRef(0);
  const previousScrollPosition = useRef(0);

  const fetchGroups = async () => {
    setIsFetchingGroups(true);

    // Get base groups list
    const baseGroups = await getGroupsByOwnerId(userDetails.userProfile.userId);

    if (!baseGroups || baseGroups.length === 0) {
      setGroups([]);
      setIsFetchingGroups(false);
      return;
    }

    // For each group, fetch detailed friend profiles and group image URL
    const enrichedGroups = await Promise.all(
      baseGroups.map(async (group) => {
        // Fetch friend profiles for this group
        const friendProfiles = await Promise.all(
          group.friendsCodes.map(code => getUserProfileByCode(code))
        );

        // Add self to friends list
        friendProfiles.push(userDetails.userProfile);

        // Get group image URL if available
        let groupImageUrl = null;
        if (group.groupImageId) {
          groupImageUrl = await getGroupImageUrl(group.groupImageId);
        }

        return {
          groupId: group.$id,
          groupName: group.groupName,
          friendProfiles,
          groupImageUrl,
        };
      })
    );

    setGroups(enrichedGroups);
    setIsFetchingGroups(false);
  };


  useFocusEffect(useCallback(() => {
    setGesturesEnabled(false);
    fetchGroups();
  }, []));

  const handleScroll = (event) => {
    const { contentOffset } = event.nativeEvent;
    const currentPosition = contentOffset.x;
    
    const isScrollingForward = currentPosition > previousScrollPosition.current;
    const isScrollingBackward = currentPosition < previousScrollPosition.current;
    
    previousScrollPosition.current = scrollPosition.current;
    scrollPosition.current = currentPosition;
    
    const scrollProgress = currentPosition / width;
    const currentIndex = Math.floor(scrollProgress);
    const scrollOffset = scrollProgress - currentIndex;
    
    let newIndex = currentIndex;
    
    if (isScrollingForward && scrollOffset > 0.05) {
      newIndex = currentIndex + 1;
    }
    else if (isScrollingBackward && currentIndex > 0) {
      if (scrollOffset < 0.95) {
        newIndex = currentIndex;
      } else {
        newIndex = currentIndex - 1;
      }
    }
    
    if (newIndex !== activeGroupIndex && newIndex >= 0 && newIndex < groups.length) {
      setActiveGroupIndex(newIndex);
    }
  };

  return (
    <ThemedView>
      <FixedTopView style={{marginTop: 5}}>
        <View
          style={{
            width: '100%',
            paddingHorizontal: 10,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <AnchorView>
            <HorizontalView>
              <UserCode fontSize={20} userCode={userDetails?.userProfile?.userCode || "------"}/>
            </HorizontalView>
          </AnchorView>

          <AnchorView>
            <HorizontalView style={{ gap: 5 }}>
              {groups.length > 0 && (
                <ThemedButton
                  text="Create group"
                  icon={<Plus strokeWidth={2.5} />}
                  isRound={false}
                  isPrimary={false}
                  sizeX={145}
                  sizeY={44}
                  fontSize={16}
                  onPress={() => setCreateEditGroupModalVisible(true)}
                />
              )}

              <ActionButton 
                icon={<Bolt strokeWidth={2.5} />}
                size={44}
                isPrimary={false}
                isRound={false}
                loadingOnPress={true}
                onPress={async() => {
                  await logout();
                  router.push('/');
                }}
              />
            </HorizontalView>
          </AnchorView>
        </View>
      </FixedTopView>
              
      {(isFetchingGroups) ? (
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <ActivityIndicator size="small" color={Colors.light}/>
          <ThemedText fontSize={16} color={Colors.textGray} style={{ marginTop: 10 }}>
            Getting groups...
          </ThemedText>
        </View>
      ) : groups.length === 0 ? (
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <ThemedText fontSize={38} fontWeight="Bold">
            No groups
          </ThemedText>

          <ThemedText fontSize={24} fontWeight="Medium">
            Create your first group
          </ThemedText>

          <ActionButton
            icon={<Plus strokeWidth={3} />}
            size={82}
            style={{ marginTop: 30 }}
            onPress={() => setCreateEditGroupModalVisible(true)}
          />
        </View>
      ) : (
        <>
          <FlatList
            ref={flatListRef}
            data={groups}
            keyExtractor={(item) => item.groupId}
            horizontal
            pagingEnabled
            decelerationRate="normal"
            showsHorizontalScrollIndicator={false}
            style={{ flex: 1 }}
            initialNumToRender={groups.length}
            windowSize={3}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            renderItem={({ item, index }) => (
              <View
                style={{
                  width,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <GroupComponent
                  group={item}
                  isActive={index === activeGroupIndex}
                />
              </View>
            )}
          />

          <FixedBottomView style={{ position: 'absolute', height: '55%' }}>
            <NameBar
              fontSize={18}
              name={groups[activeGroupIndex]?.groupName || '-'}
            />
            {groups.length > 1 && (
              <GroupPageIndicator
                pagesCount={groups.length}
                activePage={activeGroupIndex}
              />
            )}
          </FixedBottomView>

          <FixedBottomView style={{ height: 'auto' }}>
            <ThemedButton isPrimary={false} />
          </FixedBottomView>
        </>
      )}

      <CreateEditGroupModal 
        visible={createEditGroupModalVisible} 
        onSubmit={async () => {
          await fetchGroups();
        }}
        onClose={() => setCreateEditGroupModalVisible(false)}
      />
    </ThemedView>
  );
};

export default Groups;