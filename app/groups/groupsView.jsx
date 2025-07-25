import { FlatList, View, Dimensions, ActivityIndicator } from 'react-native';
import React, { useCallback, useEffect, useState, useRef, useMemo, act } from 'react';
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
import GroupActionsPanel from '../../components/groups/groupActionsPanel';
import { client } from '../../lib/appwrite';
import { useIsFocused } from '@react-navigation/native';
import PaymentModal from '../../components/modals/paymentModal';

const { width } = Dimensions.get('window');

const Groups = () => {
  const { setGesturesEnabled, logout } = useUser();
  const [groups, setGroups] = useState([]);
  const [activeGroupIndex, setActiveGroupIndex] = useState(0);

  const [isFetchingGroups, setIsFetchingGroups] = useState(true);
  const [showLoadingText, setShowLoadingText] = useState(false);
  const [userHasNoGroups, setUserHasNoGroups] = useState(false);
  
  const [createEditGroupModalVisible, setCreateEditGroupModalVisible] = useState(false);
  const [justCreatedGroup, setJustCreatedGroup] = useState(false);
  
  const flatListRef = useRef(null);
  const previousScrollPosition = useRef(0);

  const liveUpdateSubRef = useRef(null);

  const enrichGroup = async (group) => {
    const membersProfiles = await Promise.all(
      group.friendsCodes.map(code => getUserProfileByCode(code))
    );

    const ownerProfile = await getUserProfileById(group.ownerId);
    ownerProfile.owner = true;
    membersProfiles.push(ownerProfile);

    const allMembersProfiles = membersProfiles.map(friend => ({
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
      membersProfiles: allMembersProfiles,
      friendsCodes: group.friendsCodes,
      paidFriendsCodes: group.paidFriendsCodes,
      isMoneyCollected: group.isMoneyCollected || false,
      groupImageUrl,
      payAmount: group.payAmount || 0,
      splitAmount: group.splitAmount || 0,
      billingDate: new Date(group.billingDate) || null,
      isSubscription: group.paymentOptionIndex === 1,
    };
  };

  const fetchLock = useRef(false);
  const fetchGroups = async () => {
    if (fetchLock.current) return;
    fetchLock.current = true;

    setIsFetchingGroups(true);
    setUserHasNoGroups(false);
    const loadingTextTimeout = setTimeout(() => setShowLoadingText(true), 500);

    try {
      let baseGroups = await getGroupsByOwnerId(userDetails.userProfile.userId);
      baseGroups.push(...(await getMemberGroupsByUserCode(userDetails.userProfile.userCode)));

      if (!baseGroups || baseGroups.length === 0) {
        setGroups([]);
        setUserHasNoGroups(true);
        return;
      }

      const enrichedGroups = await Promise.all(
        baseGroups.map(async (group) => {
          const enriched = await enrichGroup(group);
          return {
            ...enriched,
            groupId: group.$id,
          };
        })
      );

      setGroups(enrichedGroups);
      setUserHasNoGroups(false);

      if (justCreatedGroup) {
        setJustCreatedGroup(false);

        const lastOwnedIndex = enrichedGroups
          .map((group, idx) => ({ ...group, idx }))
          .filter(group => group.ownerId === userDetails.userProfile.userId)
          .map(g => g.idx)
          .pop();

        const targetIndex = lastOwnedIndex ?? 0;

        setTimeout(() => {
          try {
            flatListRef.current?.scrollToIndex({ index: targetIndex, animated: true });
          } catch (error) {
            flatListRef.current?.scrollToIndex({ index: 0, animated: true });
            setActiveGroupIndex(0);
            console.warn('Failed scrolling to index:', error);
          }
        }, 250);
      }
    } catch (err) {
      console.error('Error fetching groups:', err);
    } finally {
      setIsFetchingGroups(false);
      setShowLoadingText(false);

      clearTimeout(loadingTextTimeout);
      setShowLoadingText(false);

      fetchLock.current = false;
    }
  };

  const isFocused = useIsFocused();
  useEffect(() => {
    if (!isFocused) return;

    setGesturesEnabled(false);

    fetchGroups();

    return () => {
      if (liveUpdateSubRef.current) {
        liveUpdateSubRef.current.forEach(unsub => unsub());
        liveUpdateSubRef.current = null;
      }
    };
  }, [isFocused]);


  useEffect(() => {
    if (liveUpdateSubRef.current) {
      liveUpdateSubRef.current.forEach(unsub => unsub());
    }

    const db = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID;
    const coll = process.env.EXPO_PUBLIC_APPWRITE_GROUPS_COLLECTION_ID;

    const unsubscribe = client.subscribe(
      `databases.${db}.collections.${coll}.documents`,
      async (res) => {
        setShowLoadingText(true);

        const payload = res?.payload;
        if (!payload || !payload.$id) {
          console.warn('Received malformed Appwrite realtime payload:', res);
          return;
        }

        const groupId = payload.$id;

        if (!groupId) return;

        let updatedGroupIndex = groups.indexOf(groups.find(group => group.groupId === groupId))
        
        if (res.events.includes('databases.*.collections.*.documents.*.delete')) {
          updatedGroupIndex -= 1;
        }

        setGroups([]);
        await fetchGroups().then(() => {
          setShowLoadingText(false);

          if (updatedGroupIndex > -1) {
            setTimeout(() => {
              try {
                flatListRef.current?.scrollToIndex({ index: updatedGroupIndex, animated: true });
              } catch (error) {
                flatListRef.current?.scrollToIndex({ index: 0, animated: true });
                setActiveGroupIndex(0);
                console.warn('Failed scrolling to index:', error);
              }
            }, 250);
          }
        });
      }
    );

    liveUpdateSubRef.current = [unsubscribe];

    return () => {
      unsubscribe();
    };
  }, [groups]);

  const isUserOwner = () => {
    const currentGroup = groups[activeGroupIndex];
    if (!currentGroup) return false;
    return currentGroup.ownerId === userDetails.userProfile.userId;
  };

  const hasUserPaid = () => {
    const currentGroup = groups[activeGroupIndex];

    if (!currentGroup) return false;
    return currentGroup.paidFriendsCodes.includes(userDetails.userProfile.userCode);
  };

  const handleScroll = (event) => {
    const { contentOffset } = event.nativeEvent;
    const currentPosition = contentOffset.x;

    // Determine direction
    const goingForward = currentPosition > previousScrollPosition.current;
    const offset = goingForward ? width * 0.97 : width * 0.03;

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
      ) : userHasNoGroups ? (
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
            getItemLayout={(data, index) => ({
              length: width,     // item width
              offset: width * index,  // item offset from the start
              index,
            })}
          />

          <FixedBottomView style={{ position: 'absolute', bottom: '35%' }}>
            {groups.length > 0 && (
              <>
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
              </>
            )}
          </FixedBottomView>
        </>
      )}

      {!userHasNoGroups && (
        <FixedBottomView style={{ height: '28%' }}>
          <GroupActionsPanel 
            group={groups[activeGroupIndex]}
            hasUserPaid={hasUserPaid()}
            isUserOwner={isUserOwner()}
          />
        </FixedBottomView>
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