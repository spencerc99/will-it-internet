// ABOUTME: Component that plays a random Spotify playlist or album that hasn't been played recently
// ABOUTME: Tracks play history in localStorage and persists access token

import React, { useState, useEffect } from "react";
import SpotifyWebApi from "spotify-web-api-js";

interface MusicItem {
  id: string;
  name: string;
  uri: string;
  type: "playlist" | "album";
  images?: Array<{ url: string }>;
  tracks: {
    total: number;
  };
  artist?: string;
}

interface PlayHistory {
  [itemId: string]: number;
}

const RandomPlaylistPlayer: React.FC = () => {
  const [accessToken, setAccessToken] = useState("");
  const [items, setItems] = useState<MusicItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<MusicItem | null>(null);
  const [playHistory, setPlayHistory] = useState<PlayHistory>({});
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const spotifyApiRef = React.useRef(new SpotifyWebApi());

  useEffect(() => {
    const savedToken = localStorage.getItem("spotify_token");
    const savedHistory = localStorage.getItem("playlist_play_history");

    if (savedToken) {
      setAccessToken(savedToken);
      spotifyApiRef.current.setAccessToken(savedToken);
      setIsAuthenticated(true);
      loadItems(savedToken);
    }

    if (savedHistory) {
      setPlayHistory(JSON.parse(savedHistory));
    }
  }, []);

  const saveCredentials = async () => {
    if (!accessToken.trim()) {
      alert("Please enter your access token");
      return;
    }

    localStorage.setItem("spotify_token", accessToken);
    spotifyApiRef.current.setAccessToken(accessToken);
    setIsAuthenticated(true);
    await loadItems(accessToken);
  };

  const loadItems = async (token: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const api = new SpotifyWebApi();
      api.setAccessToken(token);

      const [playlistsResponse, albumsResponse] = await Promise.all([
        api.getUserPlaylists({ limit: 50 }),
        api.getMySavedAlbums({ limit: 50 }),
      ]);

      const playlists: MusicItem[] = (playlistsResponse.items as any[])
        .filter((p: any) => p.tracks.total > 5)
        .map((p: any) => ({
          id: p.id,
          name: p.name,
          uri: p.uri,
          type: "playlist" as const,
          images: p.images,
          tracks: p.tracks,
        }));

      const albums: MusicItem[] = (albumsResponse.items as any[])
        .filter((item: any) => item.album.tracks.total > 5)
        .map((item: any) => ({
          id: item.album.id,
          name: item.album.name,
          uri: item.album.uri,
          type: "album" as const,
          images: item.album.images,
          tracks: item.album.tracks,
          artist: item.album.artists[0]?.name,
        }));

      setItems([...playlists, ...albums]);
      setIsLoading(false);
    } catch (err: any) {
      setError(err.message || "Failed to load music");
      setIsLoading(false);
    }
  };

  const selectRandom = () => {
    if (items.length === 0) {
      alert("No items found");
      return;
    }

    const now = Date.now();
    const oneDayAgo = now - 24 * 60 * 60 * 1000;

    const unplayedRecently = items.filter(
      (item) => !playHistory[item.id] || playHistory[item.id] < oneDayAgo
    );

    const eligible = unplayedRecently.length > 0 ? unplayedRecently : items;
    const randomIndex = Math.floor(Math.random() * eligible.length);
    const selected = eligible[randomIndex];

    setSelectedItem(selected);
  };

  const playSelected = async () => {
    if (!selectedItem) {
      alert("No item selected");
      return;
    }

    try {
      await spotifyApiRef.current.play({
        context_uri: selectedItem.uri,
      });

      const newHistory = {
        ...playHistory,
        [selectedItem.id]: Date.now(),
      };
      setPlayHistory(newHistory);
      localStorage.setItem("playlist_play_history", JSON.stringify(newHistory));

      alert(`Now playing: ${selectedItem.name}`);
    } catch (err: any) {
      if (err.status === 404) {
        alert(
          "No active device found. Please open Spotify on your phone or computer first!"
        );
      } else {
        alert("Failed to play: " + (err.message || "Unknown error"));
      }
    }
  };

  const clearHistory = () => {
    setPlayHistory({});
    localStorage.removeItem("playlist_play_history");
    alert("Play history cleared!");
  };

  const logout = () => {
    localStorage.removeItem("spotify_token");
    setIsAuthenticated(false);
    setAccessToken("");
    setItems([]);
    setSelectedItem(null);
  };

  if (!isAuthenticated) {
    return (
      <div
        style={{
          color: "black",
          minHeight: "100vh",
          background: "#F5F5DC",
          padding: "20px",
          fontFamily: '"Courier New", monospace',
        }}
      >
        <div
          style={{
            maxWidth: "600px",
            margin: "0 auto",
            border: "4px ridge #0000CC",
            background: "#fff",
            boxShadow: "6px 6px 0px #999",
          }}
        >
          <div
            style={{
              background: "#0000CC",
              color: "#FFFF00",
              padding: "10px",
              textAlign: "center",
              fontWeight: "bold",
              fontSize: "18px",
              letterSpacing: "2px",
              borderBottom: "3px solid #FF0000",
            }}
          >
            ♫ WILL IT INTERNET 04 ♫
          </div>

          <div style={{ padding: "20px" }}>
            <p style={{ marginBottom: "15px", fontSize: "14px" }}>
              <strong>ENTER SPOTIFY ACCESS TOKEN:</strong>
            </p>

            <input
              type="password"
              value={accessToken}
              onChange={(e) => setAccessToken(e.target.value)}
              placeholder="ACCESS TOKEN"
              style={{
                width: "100%",
                padding: "8px",
                border: "2px solid #000",
                fontFamily: '"Courier New", monospace',
                fontSize: "12px",
                marginBottom: "15px",
              }}
            />

            <button
              onClick={saveCredentials}
              style={{
                width: "100%",
                padding: "10px",
                background: "#FF6600",
                color: "#fff",
                border: "3px outset #FF8800",
                fontFamily: '"Courier New", monospace',
                fontWeight: "bold",
                fontSize: "14px",
                cursor: "pointer",
                letterSpacing: "1px",
              }}
            >
              ☞ CONNECT ☜
            </button>

            <div
              style={{
                marginTop: "15px",
                padding: "10px",
                border: "1px solid #ccc",
                background: "#f9f9f9",
                fontSize: "11px",
                lineHeight: "1.6",
              }}
            >
              <strong>INSTRUCTIONS:</strong>
              <br />
              Get token from:{" "}
              <a
                href="https://developer.spotify.com/console/put-play/"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "#0000ff" }}
              >
                Spotify Console
              </a>
              <br />
              Required scopes: user-modify-playback-state,
              playlist-read-private, user-library-read
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#F5F5DC",
          padding: "20px",
          fontFamily: '"Courier New", monospace',
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            border: "4px double #FF00FF",
            padding: "20px",
            background: "#FFFFCC",
            textAlign: "center",
            fontWeight: "bold",
            boxShadow: "5px 5px 0px #999",
          }}
        >
          ⌛ LOADING... PLEASE WAIT... ⌛
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#F5F5DC",
          padding: "20px",
          fontFamily: '"Courier New", monospace',
        }}
      >
        <div
          style={{
            maxWidth: "600px",
            margin: "0 auto",
            border: "4px solid #ff0000",
            background: "#fff",
            boxShadow: "6px 6px 0px #999",
          }}
        >
          <div
            style={{
              background: "#ff0000",
              color: "#FFFF00",
              padding: "10px",
              textAlign: "center",
              fontWeight: "bold",
              borderBottom: "3px solid #000",
            }}
          >
            ⚠️ ERROR ⚠️
          </div>
          <div style={{ padding: "20px" }}>
            <p style={{ marginBottom: "15px" }}>{error}</p>
            <button
              onClick={() => loadItems(accessToken)}
              style={{
                padding: "8px 16px",
                background: "#0000CC",
                color: "#fff",
                border: "3px outset #6666FF",
                fontFamily: '"Courier New", monospace',
                cursor: "pointer",
                marginRight: "10px",
                fontWeight: "bold",
              }}
            >
              RETRY
            </button>
            <button
              onClick={logout}
              style={{
                padding: "8px 16px",
                background: "#CC0000",
                color: "#fff",
                border: "3px outset #FF0000",
                fontFamily: '"Courier New", monospace',
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              LOGOUT
            </button>
          </div>
        </div>
      </div>
    );
  }

  const playlists = items.filter((i) => i.type === "playlist");
  const albums = items.filter((i) => i.type === "album");

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#F5F5DC",
        padding: "20px",
        fontFamily: '"Courier New", monospace',
      }}
    >
      <div
        style={{
          maxWidth: "800px",
          margin: "0 auto",
        }}
      >
        <div
          style={{
            border: "4px ridge #FF00FF",
            background: "#fff",
            marginBottom: "20px",
            boxShadow: "5px 5px 0px #999",
          }}
        >
          <div
            style={{
              background: "#0000CC",
              color: "#FFFF00",
              padding: "10px",
              textAlign: "center",
              fontWeight: "bold",
              fontSize: "18px",
              letterSpacing: "2px",
              borderBottom: "3px solid #FF0000",
            }}
          >
            ♫ WILL IT INTERNET 04 ♫
          </div>

          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: "12px",
            }}
          >
            <tbody>
              <tr style={{ background: "#FFFFCC" }}>
                <td
                  style={{
                    padding: "8px",
                    borderBottom: "2px solid #FF6600",
                    fontWeight: "bold",
                    width: "40%",
                  }}
                >
                  TOTAL PLAYLISTS:
                </td>
                <td
                  style={{
                    padding: "8px",
                    borderBottom: "2px solid #FF6600",
                  }}
                >
                  {playlists.length}
                </td>
              </tr>
              <tr style={{ background: "#CCFFCC" }}>
                <td
                  style={{
                    padding: "8px",
                    borderBottom: "2px solid #FF6600",
                    fontWeight: "bold",
                  }}
                >
                  TOTAL ALBUMS:
                </td>
                <td
                  style={{
                    padding: "8px",
                    borderBottom: "2px solid #FF6600",
                  }}
                >
                  {albums.length}
                </td>
              </tr>
              <tr style={{ background: "#FFCCFF" }}>
                <td
                  style={{
                    padding: "8px",
                    fontWeight: "bold",
                  }}
                >
                  FILTER:
                </td>
                <td
                  style={{
                    padding: "8px",
                  }}
                >
                  &gt;5 TRACKS ONLY
                </td>
              </tr>
            </tbody>
          </table>

          <div
            style={{
              padding: "15px",
              borderTop: "3px solid #FF00FF",
              display: "flex",
              gap: "10px",
              flexWrap: "wrap",
              background: "#F0F0F0",
            }}
          >
            <button
              onClick={selectRandom}
              style={{
                padding: "10px 20px",
                background: "#FF00FF",
                color: "#fff",
                border: "3px outset #FF66FF",
                fontFamily: '"Courier New", monospace',
                fontWeight: "bold",
                cursor: "pointer",
                fontSize: "14px",
              }}
            >
              RANDOM
            </button>
            {/* <button
              onClick={clearHistory}
              style={{
                padding: "10px 20px",
                background: "#00CC00",
                color: "#fff",
                border: "3px outset #00FF00",
                fontFamily: '"Courier New", monospace',
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              CLEAR HISTORY
            </button> */}
            <button
              onClick={logout}
              style={{
                padding: "10px 20px",
                background: "#CC0000",
                color: "#fff",
                border: "3px outset #FF0000",
                fontFamily: '"Courier New", monospace',
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              LOGOUT
            </button>
          </div>
        </div>

        {selectedItem && (
          <div
            style={{
              border: "3px solid #FF00FF",
              background: "#FFFFCC",
              marginBottom: "20px",
            }}
          >
            <div
              style={{
                background: "#FF00FF",
                color: "#FFFF00",
                padding: "8px",
                fontWeight: "bold",
                textAlign: "center",
                borderBottom: "3px solid #FF6600",
              }}
            >
              ★ SELECTED {selectedItem.type.toUpperCase()} ★
            </div>
            <div style={{ padding: "15px" }}>
              <div
                style={{
                  display: "flex",
                  gap: "15px",
                  marginBottom: "15px",
                  alignItems: "flex-start",
                }}
              >
                {selectedItem.images && selectedItem.images[0] && (
                  <img
                    src={selectedItem.images[0].url}
                    alt={selectedItem.name}
                    style={{
                      width: "100px",
                      height: "100px",
                      border: "2px solid #000",
                    }}
                  />
                )}
                <div style={{ flex: 1 }}>
                  <table
                    style={{
                      width: "100%",
                      fontSize: "12px",
                    }}
                  >
                    <tbody>
                      <tr>
                        <td
                          style={{
                            padding: "4px 8px 4px 0",
                            fontWeight: "bold",
                            width: "100px",
                          }}
                        >
                          NAME:
                        </td>
                        <td style={{ padding: "4px 0" }}>
                          {selectedItem.name}
                        </td>
                      </tr>
                      {selectedItem.artist && (
                        <tr>
                          <td
                            style={{
                              padding: "4px 8px 4px 0",
                              fontWeight: "bold",
                            }}
                          >
                            ARTIST:
                          </td>
                          <td style={{ padding: "4px 0" }}>
                            {selectedItem.artist}
                          </td>
                        </tr>
                      )}
                      <tr>
                        <td
                          style={{
                            padding: "4px 8px 4px 0",
                            fontWeight: "bold",
                          }}
                        >
                          TRACKS:
                        </td>
                        <td style={{ padding: "4px 0" }}>
                          {selectedItem.tracks.total}
                        </td>
                      </tr>
                      {playHistory[selectedItem.id] && (
                        <tr>
                          <td
                            style={{
                              padding: "4px 8px 4px 0",
                              fontWeight: "bold",
                            }}
                          >
                            LAST PLAYED:
                          </td>
                          <td style={{ padding: "4px 0" }}>
                            {new Date(
                              playHistory[selectedItem.id]
                            ).toLocaleDateString()}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
              <button
                onClick={playSelected}
                style={{
                  width: "100%",
                  padding: "12px",
                  background: "#0000CC",
                  color: "#FFFF00",
                  border: "4px outset #6666FF",
                  fontFamily: '"Courier New", monospace',
                  fontWeight: "bold",
                  fontSize: "16px",
                  cursor: "pointer",
                  letterSpacing: "2px",
                }}
              >
                ▶ PLAY NOW ◀
              </button>
            </div>
          </div>
        )}

        {!selectedItem && (
          <div
            style={{
              border: "3px dashed #0000CC",
              padding: "40px",
              textAlign: "center",
              background: "#E6E6FA",
              color: "#0000CC",
              fontWeight: "bold",
            }}
          >
            NO SONG PLAYING...
          </div>
        )}

        <div
          style={{
            border: "3px solid #00CC00",
            background: "#fff",
            marginTop: "20px",
            boxShadow: "4px 4px 0px #999",
          }}
        >
          <div
            style={{
              background: "#00CC00",
              padding: "8px",
              fontWeight: "bold",
              fontSize: "12px",
              borderBottom: "3px solid #FF6600",
              color: "#fff",
            }}
          >
            LIBRARY
          </div>
          <div
            style={{
              maxHeight: "300px",
              overflowY: "auto",
              fontSize: "11px",
            }}
          >
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
              }}
            >
              <thead>
                <tr style={{ background: "#FFCCFF" }}>
                  <th
                    style={{
                      padding: "6px",
                      textAlign: "left",
                      borderBottom: "2px solid #FF00FF",
                      position: "sticky",
                      top: 0,
                      background: "#FFCCFF",
                    }}
                  >
                    TYPE
                  </th>
                  <th
                    style={{
                      padding: "6px",
                      textAlign: "left",
                      borderBottom: "2px solid #FF00FF",
                      position: "sticky",
                      top: 0,
                      background: "#FFCCFF",
                    }}
                  >
                    NAME
                  </th>
                  <th
                    style={{
                      padding: "6px",
                      textAlign: "right",
                      borderBottom: "2px solid #FF00FF",
                      position: "sticky",
                      top: 0,
                      background: "#FFCCFF",
                    }}
                  >
                    TRACKS
                  </th>
                  <th
                    style={{
                      padding: "6px",
                      textAlign: "right",
                      borderBottom: "2px solid #FF00FF",
                      position: "sticky",
                      top: 0,
                      background: "#FFCCFF",
                    }}
                  >
                    PLAYED
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => (
                  <tr
                    key={item.id}
                    style={{
                      background: idx % 2 === 0 ? "#fff" : "#f9f9f9",
                      borderBottom: "1px solid #ddd",
                    }}
                  >
                    <td style={{ padding: "4px 6px" }}>
                      {item.type === "playlist" ? "PL" : "AL"}
                    </td>
                    <td
                      style={{
                        padding: "4px 6px",
                        maxWidth: "200px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {item.name}
                      {item.artist && ` - ${item.artist}`}
                    </td>
                    <td
                      style={{
                        padding: "4px 6px",
                        textAlign: "right",
                      }}
                    >
                      {item.tracks.total}
                    </td>
                    <td
                      style={{
                        padding: "4px 6px",
                        textAlign: "right",
                      }}
                    >
                      {playHistory[item.id]
                        ? new Date(playHistory[item.id]).toLocaleDateString()
                        : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RandomPlaylistPlayer;
