const keywordToImageMap = {
  netflix: 'netflix_groupImage',
  spotify: 'spotify_groupImage',
  
  youtube: 'youtube_groupImage',
  yt: 'youtube_groupImage',
  // add more as needed
};

export function findBestKeywordMatch(groupName) {
  const normalizedGroupName = groupName.toLowerCase();

  const matchedEntry = Object.entries(keywordToImageMap).find(([keyword]) => {
    const regex = new RegExp(`\\b${keyword}\\b`);
    return regex.test(normalizedGroupName);
  });

  if (matchedEntry) {
    return matchedEntry[1];
  }

  return null;
}