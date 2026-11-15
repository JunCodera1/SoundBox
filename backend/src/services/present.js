// Shapes returned to clients (never leak password, email of others, etc.).
export const publicUser = (u) =>
  u && {
    id: String(u._id), username: u.username, avatar: u.avatar, bio: u.bio,
    followers: u.followers?.length ?? 0, following: u.following?.length ?? 0,
  };

export const selfUser = (u) => ({
  ...publicUser(u), email: u.email, isAdmin: u.isAdmin, favoriteGenres: u.favoriteGenres,
  privacy: u.privacy, likedSongIds: (u.likedSongs || []).map(String),
  followingIds: (u.following || []).map(String),
});

export const songDto = (s) => ({
  id: String(s._id), name: s.name, thumbnail: s.thumbnail, track: s.track, genre: s.genre,
  duration: s.duration, description: s.description, likes: s.likes, plays: s.plays, license: s.license,
  createdAt: s.createdAt,
  artist: s.artist && s.artist.username ? { id: String(s.artist._id), username: s.artist.username, avatar: s.artist.avatar } : s.artist ? { id: String(s.artist) } : null,
});

export const playlistDto = (p, { withSongs = false } = {}) => ({
  id: String(p._id), name: p.name, desc: p.desc, thumbnail: p.thumbnail, isPublic: p.isPublic,
  owner: p.owner?.username ? { id: String(p.owner._id), username: p.owner.username } : { id: String(p.owner) },
  songCount: p.songs.length, updatedAt: p.updatedAt,
  ...(withSongs ? { songs: p.songs.filter((s) => s && s.name).map(songDto) } : {}),
});
