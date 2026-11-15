export interface Artist { id: string; username: string; avatar?: string }
export interface Song { id: string; name: string; thumbnail: string; track: string; genre: string; duration?: number; description?: string; likes: number; plays: number; license?: string; createdAt?: string; artist: Artist | null }
export interface Playlist { id: string; name: string; desc: string; isPublic: boolean; owner: { id: string; username: string }; songCount: number; songs?: Song[]; updatedAt: string }
export interface Me { id: string; username: string; email: string; avatar?: string; bio?: string; isAdmin: boolean; favoriteGenres: string[]; privacy: { showActivity: boolean; showPlaylists: boolean }; likedSongIds: string[]; followingIds: string[]; followers: number; following: number }
