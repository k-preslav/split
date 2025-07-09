import { FlatList, View, Dimensions, ActivityIndicator } from 'react-native';
import React, { useCallback, useEffect, useState, useRef } from 'react';
import { router, useFocusEffect } from 'expo-router';
import { useUser } from '../../hooks/useUser';
import { getGroupImageUrl, getGroupsByOwnerId, getMemberGroupsByUserCode } from '../../lib/groupsApi';
import ThemedView from '../../components/views/themedView';
import GroupComponent from '../../components/groups/groupComponent';
import ActionButton from '../../components/common/actionButton';
import HorizontalView from '../../components/views/horizontalView';
import ThemedButton from '../../components/common/themedButton';
import FixedTopView from '../../components/views/fixedTopView';
import FixedCenterView from '../../components/views/fixedCenterView';
import { Bolt, Check, Clock, Crown, Plus, Settings, Settings2, User, User2, UserCog } from 'lucide-react-native';
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
import { getUserProfileByCode, getUserProfileById } from '../../lib/getUser';
import { friendIconStyles } from '../../components/groups/orbitingFriendsIcon';

const { width } = Dimensions.get('window');

const Groups = () => {
  const { setGesturesEnabled, logout } = useUser();
  const [groups, setGroups] = useState([]);
  const [activeGroupIndex, setActiveGroupIndex] = useState(0);
  const [isFetchingGroups, setIsFetchingGroups] = useState(true);
  const [showLoadingText, setShowLoadingText] = useState(false);

  const [createEditGroupModalVisible, setCreateEditGroupModalVisible] = useState(false);
  const [justCreatedGroup, setJustCreatedGroup] = useState(false);

  const flatListRef = useRef(null);
  const scrollPosition = useRef(0);
  const previousScrollPosition = useRef(0);

  const fetchLock = useRef(false);
  const fetchGroups = async () => {
    if (fetchLock.current) return;
    fetchLock.current = true;

    setIsFetchingGroups(true);
    const showLoadingTimeout = setTimeout(() => {
      setShowLoadingText(true);
    }, 1000);

    try {
      let baseGroups = await getGroupsByOwnerId(userDetails.userProfile.userId);
      baseGroups.push(...(await getMemberGroupsByUserCode(userDetails.userProfile.userCode)));

      if (!baseGroups || baseGroups.length === 0) {
        setGroups([]);
        return;
      }

      const enrichedGroups = await Promise.all(
        baseGroups.map(async (group) => {
          const friendProfiles = await Promise.all(
            group.friendsCodes.map(code => getUserProfileByCode(code))
          );

          const ownerProfile = await getUserProfileById(group.ownerId);
          ownerProfile.owner = true;
          friendProfiles.push(ownerProfile);

          const allFriendProfiles = friendProfiles.map(friend => ({
            ...friend,
            paid: group.paidFriendsCodes.includes(friend.userCode),
          }));

          let groupImageUrl = null;
          if (group.groupImageId) {
            groupImageUrl = await getGroupImageUrl(group.groupImageId);
          }

          return {
            groupId: group.$id,
            ownerId: group.ownerId,
            groupName: group.groupName,
            friendProfiles: allFriendProfiles,
            paidFriendsCodes: group.paidFriendsCodes,
            groupImageUrl,
          };
        })
      );

      setGroups(enrichedGroups);

      if (justCreatedGroup) {
        setJustCreatedGroup(false);

        const lastOwnedIndex = enrichedGroups
          .map((group, idx) => ({ ...group, idx }))
          .filter(group => group.ownerId === userDetails.userProfile.userId)
          .map(g => g.idx)
          .pop();

        const targetIndex = lastOwnedIndex ?? 0;
        setActiveGroupIndex(targetIndex);

        setTimeout(() => {
          flatListRef.current?.scrollToIndex({ index: targetIndex, animated: false });
        }, 50);
      }
    } catch (err) {
      console.error('Error fetching groups:', err);
    } finally {
      setIsFetchingGroups(false);
      clearTimeout(showLoadingTimeout);
      fetchLock.current = false;
    }
  };

  const isMounted = useRef(false);
  useFocusEffect(
    useCallback(() => {
      let cancelled = false;

      const load = async () => {
        if (!cancelled) {
          isMounted.current = true;
          await fetchGroups();
        }
      };

      load();

      return () => {
        cancelled = true;
      };
    }, [])
  );

  const isUserOwner = () => {
    return groups[activeGroupIndex].ownerId === userDetails.userProfile.userId
  }

  const hasUserPaid = () => {
    return groups[activeGroupIndex].paidFriendsCodes.includes(userDetails.userProfile.userCode)
  }

  const handleScroll = (event) => {
    const { contentOffset } = event.nativeEvent;
    const currentPosition = contentOffset.x;

    // Determine direction
    const goingForward = currentPosition > previousScrollPosition.current;
    const offset = goingForward ? width * 0.925 : width * 0.075;

    const newIndex = Math.floor((currentPosition + offset) / width);

    previousScrollPosition.current = currentPosition;

    if (
      newIndex !== activeGroupIndex &&
      newIndex >= 0 &&
      newIndex < groups.length
    ) {
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
                  fontSize={15}
                  onPress={() => setCreateEditGroupModalVisible(true)}
                />
              )}

              <ActionButton 
                icon={<User2 strokeWidth={2.5} />}
                size={44}
                isPrimary={false}
                isRound={false}
                onPress={async() => {
                  router.push('/user/account/accountSettingsView');
                }}
              />
            </HorizontalView>
          </AnchorView>
        </View>
      </FixedTopView>
              
      {(showLoadingText) ? (
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

          <FixedBottomView style={{ position: 'absolute', height: '50%' }}>
            <NameBar
              fontSize={18}
              name={groups[activeGroupIndex]?.groupName || '-'}
              icon={
                <View
                  style={[
                    friendIconStyles.badge,
                    {
                      backgroundColor: 
                        (isUserOwner()  || hasUserPaid())
                        ? Colors.primary
                        : Colors.lightGray,
                      shadowColor:
                        (isUserOwner()  || hasUserPaid())
                        ? Colors.primary
                        : 'black',
                      transform: [{
                        scale: (isUserOwner() || hasUserPaid()) ? 0.85 : 1
                      }],
                    },
                  ]}
                >
                  {isUserOwner() ? (
                    <Crown width={18} strokeWidth={2.5} />
                  ) : hasUserPaid() ? (
                    <Check width={18} strokeWidth={3} />
                  ) : (
                    <Clock width={18} strokeWidth={2.25} color={Colors.light} />
                  )}
                </View>
              }
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
          setJustCreatedGroup(true);
          await fetchGroups();
        }}
        onClose={() => setCreateEditGroupModalVisible(false)}
      />
    </ThemedView>
  );
};

export default Groups;