import { FlatList, View, Dimensions, ActivityIndicator, Animated, Easing, Modal } from 'react-native'
import React, { useCallback, useEffect, useState, useRef, useMemo, act } from 'react'
import { router, useFocusEffect } from 'expo-router'
import { useUser } from '../../hooks/useUser'
import { getGroupImageUrl, getGroupsByOwnerId, getMemberGroupsByUserCode } from '../../lib/groupsApi'
import ThemedView from '../../components/views/themedView'
import GroupComponent from '../../components/groups/groupComponent'
import ActionButton from '../../components/common/actionButton'
import HorizontalView from '../../components/views/horizontalView'
import ThemedButton from '../../components/common/themedButton'
import FixedTopView from '../../components/views/fixedTopView'
import FixedCenterView from '../../components/views/fixedCenterView'
import { Bolt, Calendar, CalendarSync, Check, Clock, Crown, Plus, Settings, Settings2, User, User2, UserCog } from 'lucide-react-native'
import AnchorView from '../../components/views/anchorView'
import UserCode from '../../components/user/userCode'
import UserCodeShare from '../../components/user/userCodeShare'
import FixedBottomView from '../../components/views/fixedBottomView'
import GroupPageIndicator from '../../components/groups/groupPageIndicator'
import NameBar from '../../components/common/nameBar'
import { userDetails } from '../../lib/userDetails'
import CreateEditGroupModal from '../../components/modals/createEditGroupModal'
import ThemedText from '../../components/common/themedText'
import { Colors } from '../../components/themes/colors'
import { getUserProfileByCode, getUserProfileById } from '../../lib/getUser'
import { friendIconStyles } from '../../components/groups/orbitingFriendsIcon'
import GroupActionsPanel from '../../components/groups/groupActionsPanel'
import { client } from '../../lib/appwrite'
import { useIsFocused } from '@react-navigation/native'
import PaymentModal from '../../components/modals/paymentModal'
import { LinearGradient } from 'expo-linear-gradient'
import ReactNativeModal from 'react-native-modal'
import { Portal, PortalProvider } from '@gorhom/portal'

const { width } = Dimensions.get('window')

const Groups = () => {
  const { setGesturesEnabled, logout } = useUser()
  const [groups, setGroups] = useState([])
  const [activeGroupIndex, setActiveGroupIndex] = useState(0)

  const [isFirstFetch, setIsFirstFetch] = useState(true)
  const [isFetchingGroups, setIsFetchingGroups] = useState(true)
  const [showLoadingText, setShowLoadingText] = useState(false)
  const [userHasNoGroups, setUserHasNoGroups] = useState(false)
  const [showTopCreateGroupButton, setShowTopCreateGroupButton] = useState(false)

  // Add animated value for loading text
  const loadingTextOpacity = useRef(new Animated.Value(0)).current;

  const [createEditGroupModalVisible, setCreateEditGroupModalVisible] = useState(false)
  const justCreatedGroupRef = useRef(false)
  
  const flatListRef = useRef(null)
  const previousScrollPosition = useRef(0)

  const liveUpdateSubRef = useRef(null)

  const slideLeftAnim = useRef(new Animated.Value(300)).current;

  // No groups pop up animation
  const noGroupsScale = useRef(new Animated.Value(0.7)).current;
  const noGroupsOpacity = useRef(new Animated.Value(0)).current;

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
      isSubscription: group.paymentOptionIndex === 1,
      isMonthly: group.billingOptionIndex === 0,
      createdAt: new Date(group.$createdAt) || null,
      groupCurrency: group.groupCurrency || 'EUR',
    };
  };

  const fetchLock = useRef(false);
  const fetchGroups = async () => {
    if (fetchLock.current) return;
    fetchLock.current = true;

    setIsFetchingGroups(true);
    setUserHasNoGroups(false);
    
    // Replace setTimeout with animated fade-in
    const loadingTextTimeout = setTimeout(() => {
      setShowLoadingText(true);
      Animated.timing(loadingTextOpacity, {
        toValue: 1,
        duration: 300,
        easing: Easing.ease,
        useNativeDriver: true,
      }).start();
    }, 1000);

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

      if (justCreatedGroupRef.current) {
        justCreatedGroupRef.current = false;

        const lastOwnedIndex = enrichedGroups
          .map((group, idx) => ({ ...group, idx }))
          .filter(group => group.ownerId === userDetails.userProfile.userId)
          .map(g => g.idx)
          .pop();

        const targetIndex = lastOwnedIndex ?? 0;

        setTimeout(() => {
          console.log('Scrolling to index:', targetIndex);
          try {
            flatListRef.current?.scrollToIndex({ index: targetIndex, animated: true });
            setActiveGroupIndex(targetIndex);
          } catch (error) {
            console.warn('Failed scrolling to index:', error);
            flatListRef.current?.scrollToIndex({ index: 0, animated: true });
            setActiveGroupIndex(0);
          }
        }, 0);
      }
    } catch (err) {
      console.error('Error fetching groups:', err);
    } finally {
      // Add fade-out animation when hiding loading text
      Animated.timing(loadingTextOpacity, {
        toValue: 0,
        duration: 250,
        easing: Easing.ease,
        useNativeDriver: true,
      }).start(() => {
        setShowLoadingText(false);
      });

      setIsFetchingGroups(false);
      clearTimeout(loadingTextTimeout);

      setIsFirstFetch(false);
      fetchLock.current = false;
    }
  };

  const isFocused = useIsFocused();
  useEffect(() => {
    if (!isFocused) return;

    setGesturesEnabled(false);
    setActiveGroupIndex(0);

    setShowTopCreateGroupButton(false);

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
        const payload = res?.payload;
        if (!payload || !payload.$id) {
          console.warn('Received malformed Appwrite realtime payload:', res);
          return;
        }

        // Membership check
        const userCode = userDetails?.userProfile?.userCode;
        const userId = userDetails?.userProfile?.userId;
        const isMember =
          payload.ownerId === userId ||
          (Array.isArray(payload.friendsCodes) && payload.friendsCodes.includes(userCode));

        if (!isMember) {
          // User is not a member of this group, ignore update
          return;
        }

        const groupId = payload.$id;

        if (!groupId) return;

        let updatedGroupIndex = groups.indexOf(groups.find(group => group.groupId === groupId))
        console.log('Updated group index:', updatedGroupIndex, "Active:", activeGroupIndex);
        
        if (res.events.includes('databases.*.collections.*.documents.*.delete')) {
          updatedGroupIndex -= 1;
        }

        await fetchGroups().then(() => {
          if (updatedGroupIndex > -1) {
            setTimeout(() => {
              const idx = updatedGroupIndex === activeGroupIndex ? activeGroupIndex : updatedGroupIndex;

              try {
                flatListRef.current?.scrollToIndex({ index: idx, animated: true });
              } catch (error) {
                flatListRef.current?.scrollToIndex({ index: 0, animated: true });
                setActiveGroupIndex(0);
                console.warn('Failed scrolling to index:', error);
              }
            }, 350);
          }
          
          setShowLoadingText(false);
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

  useEffect(() => {
    if (groups.length > 0) {
      slideLeftAnim.setValue(300);

      setTimeout(() => setShowTopCreateGroupButton(true), 100);

      setTimeout(() => {
        Animated.timing(slideLeftAnim, {
          toValue: 0,
          duration: 700,
          easing: Easing.out(Easing.exp),
          useNativeDriver: true,
        }).start();
      }, 100);
    }
  }, [groups.length > 0]);

  useEffect(() => {
    if (userHasNoGroups) {
      noGroupsScale.setValue(0.7);
      noGroupsOpacity.setValue(0);
      
      setTimeout(() => {
        Animated.parallel([
          Animated.timing(noGroupsScale, {
            toValue: 1,
            duration: 400,
            easing: Easing.out(Easing.circle),
            useNativeDriver: true,
          }),
          Animated.timing(noGroupsOpacity, {
            toValue: 1,
            duration: 500,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
        ]).start();
      }, 100);
    }
  }, [userHasNoGroups]);

  const nameBarTranslateY = useRef(new Animated.Value(350)).current;
  const nameBarOpacity = useRef(new Animated.Value(0)).current;

  const [canShowNamebar, setCanShowNamebar] = useState(false);

  useEffect(() => {
    setCanShowNamebar(true);
    nameBarTranslateY.setValue(350);
    nameBarOpacity.setValue(0);

    setTimeout(() => {
      Animated.parallel([
        Animated.timing(nameBarOpacity, {
          toValue: 1,
          duration: 480,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(nameBarTranslateY, {
          toValue: 0,
          duration: 450,
          easing: Easing.out(Easing.back(0.5)),
          useNativeDriver: true,
        })
      ]).start();
    }, 150);
  }, [groups.length > 0]);
  useEffect(() => {
    if (isFetchingGroups && isFirstFetch) {
      setCanShowNamebar(false);
      nameBarTranslateY.setValue(350);
      nameBarOpacity.setValue(0);
    }
  }, [isFetchingGroups])

  return (
    <ThemedView>
      <FixedTopView style={{ marginTop: 5 }}>
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
              <UserCode fontSize={20} userCode={userDetails?.userProfile?.userCode || "------"} />
            </HorizontalView>
          </AnchorView>

          <AnchorView>
            <HorizontalView style={{ gap: 5 }}>
              {groups.length > 0 && showTopCreateGroupButton && (
                <Animated.View
                  style={{
                    transform: [{ translateX: slideLeftAnim }],
                    opacity: slideLeftAnim.interpolate({
                      inputRange: [0, 50],
                      outputRange: [1, 0],
                      extrapolate: 'clamp'
                    })
                  }}
                >
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
                </Animated.View>
              )}

              <ActionButton
                icon={<User2 strokeWidth={2.5} />}
                size={44}
                isPrimary={false}
                isRound={false}
                onPress={async () => {
                  router.push('/user/account/accountSettingsView');
                  setTimeout(() => setGroups([]), 350);
                }}
              />
            </HorizontalView>
          </AnchorView>
        </View>
      </FixedTopView>
              
      {(showLoadingText) ? (
        <Animated.View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            opacity: loadingTextOpacity,
          }}
        >
          <ActivityIndicator size="small" color={Colors.light}/>
          <ThemedText fontSize={16} color={Colors.textGray} style={{ marginTop: 10 }}>
            Getting groups...
          </ThemedText>
        </Animated.View>
      ) : userHasNoGroups ? (
        <Animated.View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            gap: 8,
            opacity: noGroupsOpacity,
            transform: [{ scale: noGroupsScale }],
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
        </Animated.View>
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
            {groups.length > 0 && canShowNamebar && (
              <>
                <Animated.View style={{
                  transform: [{ translateY: nameBarTranslateY }],
                  opacity: nameBarOpacity,
                }}>
                  <NameBar
                    fontSize={18}
                    name={groups[activeGroupIndex]?.groupName || '-'}
                    icon={
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3.5 }}>
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
                        {groups[activeGroupIndex]?.isSubscription && (
                          <View style={friendIconStyles.badge}>
                            <Calendar width={18} color={Colors.light} strokeWidth={2.2}/>
                          </View>
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
                </Animated.View>
              </>
            )}
          </FixedBottomView>

          {/* GroupActionsPanel at the bottom */}
          {groups.length > 0 && (
            <FixedBottomView style={{ height: '28%' }}>
              <GroupActionsPanel
                group={groups[activeGroupIndex]}
                isUserOwner={isUserOwner()}
                hasUserPaid={hasUserPaid()}
                onClose={() => setCreateEditGroupModalVisible(false)}
              />
            </FixedBottomView>
          )}
        </>
      )}

      {/* Create/Edit Group Modal */}
      <CreateEditGroupModal
        visible={createEditGroupModalVisible}
        onSubmit={async () => {
          justCreatedGroupRef.current = true;
          await fetchGroups();
        }}
        onClose={() => setCreateEditGroupModalVisible(false)}
      />
    </ThemedView>
  );
};

export default Groups;