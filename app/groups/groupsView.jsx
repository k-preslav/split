import { FlatList, View, Dimensions } from 'react-native';
import React, { useCallback, useEffect, useState, useRef } from 'react';
import { router, useFocusEffect } from 'expo-router';
import { useUser } from '../../hooks/useUser';
import { getGroupsByOwnerId } from '../../lib/groupsApi';
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

const { width } = Dimensions.get('window');

const Groups = () => {
  const { setGesturesEnabled, logout } = useUser();
  const [groups, setGroups] = useState([]);
  const [activeGroupIndex, setActiveGroupIndex] = useState(0);
  const [activeGroup, setActiveGroup] = useState(null);

  const [createEditGroupModalVisible, setCreateEditGroupModalVisible] = useState(false);

  const flatListRef = useRef(null);
  const scrollPosition = useRef(0);
  const previousScrollPosition = useRef(0);

  useFocusEffect(useCallback(() => {
    setGesturesEnabled(false);
  }, []));

  useEffect(() => {
    const fetchGroups = async () => {
      const userGroups = [
        {
          $id: 'group1',
          name: 'Netflix Split',
          ownerId: 'user123',
          members: [
            { userCode: 'm6r3dd', paid: true },
            { userCode: 'vir7jp', paid: true },
            { userCode: 'q5cd80', paid: false }
          ],
        },
        {
          $id: 'group2',
          name: 'Spotify Family',
          ownerId: 'user456',
          members: [
            { userCode: 'q5cd80', paid: true },
            { userCode: 'm6r3dd', paid: false }
          ],
        }
      ];
      setGroups(userGroups);
    };

    fetchGroups();
  }, []);

  const handleGroupChange = (group, index) => {
    setActiveGroup(group);
  };

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
      handleGroupChange(groups[newIndex], newIndex);
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

      <FlatList
        ref={flatListRef}
        data={groups}
        keyExtractor={(item) => item.$id}
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
        <NameBar fontSize={18} name={groups[activeGroupIndex]?.name  || '-'}/>
        <GroupPageIndicator pagesCount={groups.length} activePage={activeGroupIndex}/>
      </FixedBottomView>
      <FixedBottomView style={{height: 'auto'}}>
        <ThemedButton isPrimary={false}/>
      </FixedBottomView>

      <CreateEditGroupModal 
        visible={createEditGroupModalVisible} 
        onClose={() => setCreateEditGroupModalVisible(false)}
      />
    </ThemedView>
  );
};

export default Groups;