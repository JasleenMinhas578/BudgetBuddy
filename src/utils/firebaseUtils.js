export const snapshotToArray = (snapshot) => {
  if (snapshot.docs) {
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  }
  const result = [];
  snapshot.forEach((doc) => result.push({ id: doc.id, ...doc.data() }));
  return result;
};
