const keywordToImageMap = {
  netflix: 'groupImage_netflix',
  spotify: 'groupImage_spotify',
  
  youtube: 'groupImage_youtube',
  yt: 'groupImage_youtube',
  // add more as needed

  gaybois: 'groupImage_twogayskissing',
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