
function obfuscateId(id, length = 10) {
  const chars = id.split('');
  for (let i = chars.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }

  const shuffled = chars.join('');
  const randomSuffix = Math.random().toString(36).substring(2, 6);
  return (shuffled + randomSuffix).substring(0, length);
}

export { obfuscateId };



