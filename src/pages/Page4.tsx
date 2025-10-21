import { useState, useEffect } from "react";
import * as buddyList from "spotify-buddylist";
import { useStickyState } from "../hooks/useStickyState";

// Use types from spotify-buddylist library
type Friend = buddyList.Friend;

export default function Page4() {
  const [spDcCookie, setSpDcCookie] = useState("");
  const [accessToken, setAccessToken] = useState(""); // Generated from sp_dc, used for playback
  const [friends, setFriends] = useState<Friend[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const savedCookie = sessionStorage.getItem("spotify_cookie");

    if (savedCookie) {
      setSpDcCookie(savedCookie);
      setIsAuthenticated(true);
      loadFriendActivity(savedCookie);
    }
  }, []);

  const saveCredentials = () => {
    if (!spDcCookie.trim()) {
      alert("Please enter your sp_dc cookie");
      return;
    }

    sessionStorage.setItem("spotify_cookie", spDcCookie);
    setIsAuthenticated(true);
    loadFriendActivity(spDcCookie);
  };

  const loadFriendActivity = async (cookie: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // Get access token from sp_dc cookie using spotify-buddylist library
      const { accessToken: token } = await buddyList.getWebAccessToken(cookie);
      setAccessToken(token); // Store for playback functionality

      // Fetch friend activity using spotify-buddylist library
      const data = await buddyList.getFriendActivity(accessToken);

      const activeFriends = (data.friends || []).filter(
        (friend: Friend) => friend.track && friend.track.uri
      );

      setFriends(activeFriends);
      setIsLoading(false);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to fetch friend activity. Make sure your sp_dc cookie is valid."
      );
      setIsLoading(false);
    }
  };

  const playTrack = async (trackUri: string) => {
    try {
      const response = await fetch(
        "https://api.spotify.com/v1/me/player/play",
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            uris: [trackUri],
          }),
        }
      );

      if (!response.ok) {
        if (response.status === 404) {
          alert(
            "No active device found. Please open Spotify on your phone or computer first!"
          );
        } else {
          throw new Error("Failed to play track");
        }
      }
    } catch (err) {
      alert(
        "Failed to play track: " +
          (err instanceof Error ? err.message : "Unknown error")
      );
    }
  };

  const refreshFriends = () => {
    if (spDcCookie) {
      loadFriendActivity(spDcCookie);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-500 to-gray-900 p-5 text-white">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-center mb-2">
            🎵 Friend Activity
          </h1>
          <p className="text-center opacity-80 mb-8 text-sm">
            See what your friends are listening to right now
          </p>

          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8">
            <p className="mb-4 text-sm leading-relaxed">
              <strong>
                Enter your Spotify sp_dc cookie to see friend activity:
              </strong>
            </p>

            <div className="bg-black/20 p-4 rounded-lg mb-5 text-xs leading-loose">
              <strong>How to get your sp_dc cookie:</strong>
              <ol className="ml-5 mt-2 space-y-2">
                <li>
                  Open{" "}
                  <a
                    href="https://open.spotify.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-400 underline"
                  >
                    open.spotify.com
                  </a>{" "}
                  and log in
                </li>
                <li>Open Developer Tools (F12 or Right-click → Inspect)</li>
                <li>Go to the "Application" or "Storage" tab</li>
                <li>Click "Cookies" → "https://open.spotify.com"</li>
                <li>
                  Find{" "}
                  <code className="bg-white/20 px-2 py-0.5 rounded font-mono">
                    sp_dc
                  </code>{" "}
                  and copy its Value
                </li>
              </ol>
            </div>

            <input
              type="password"
              value={spDcCookie}
              onChange={(e) => setSpDcCookie(e.target.value)}
              placeholder="Paste your sp_dc cookie here"
              className="w-full p-3 rounded-lg mb-4 text-gray-900 font-mono text-sm"
            />

            <button
              onClick={saveCredentials}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-8 rounded-full transition-all hover:scale-105"
            >
              Connect
            </button>

            <p className="mt-4 text-xs opacity-70 text-center">
              The access token will be automatically generated from your cookie
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-500 to-gray-900 p-5 text-white">
        <div className="max-w-2xl mx-auto">
          <div className="text-center py-20 text-lg">
            Connecting to Spotify...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-500 to-gray-900 p-5 text-white">
        <div className="max-w-2xl mx-auto">
          <div className="bg-red-500/20 p-4 rounded-lg mb-5 border-l-4 border-red-500">
            <strong>Oops!</strong> {error}
          </div>
          <button
            onClick={() => window.location.reload()}
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-8 rounded-full transition-all"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-500 to-gray-900 p-5 text-white">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-2">
          🎵 Friend Activity
        </h1>
        <p className="text-center opacity-80 mb-8 text-sm">
          See what your friends are listening to right now
        </p>

        <div className="text-center p-4 bg-white/10 rounded-lg mb-5 text-sm">
          {friends.length === 0
            ? "No active listeners"
            : `${friends.length} friend${
                friends.length !== 1 ? "s" : ""
              } listening now`}
        </div>

        <button
          onClick={refreshFriends}
          className="mx-auto block bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded-full mb-5 transition-all"
        >
          ↻ Refresh
        </button>

        <div>
          {friends.length === 0 ? (
            <div className="text-center py-16 opacity-70">
              <p className="text-lg mb-2">😴 Nobody's listening right now</p>
              <p className="text-sm">
                Your friends might be offline or have their activity hidden.
              </p>
            </div>
          ) : (
            <>
              {friends.map((friend, index) => (
                <div
                  key={index}
                  onClick={() => playTrack(friend.track.uri)}
                  className="bg-white/10 backdrop-blur-lg rounded-xl p-5 mb-4 cursor-pointer transition-all hover:bg-white/15 hover:border-green-500 border-2 border-transparent hover:-translate-y-0.5 active:translate-y-0"
                >
                  <div className="flex items-center mb-2">
                    <span className="font-bold text-base flex-1">
                      {friend.user.name}
                    </span>
                    <span className="w-2 h-2 bg-green-500 rounded-full ml-2 animate-pulse"></span>
                  </div>
                  <div>
                    <div className="text-sm mb-1 font-medium">
                      {friend.track.name}
                    </div>
                    <div className="text-xs opacity-70">
                      {friend.track.artist?.name || "Unknown Artist"}
                    </div>
                    {friend.track.album && (
                      <div className="text-xs opacity-50 mt-0.5">
                        {friend.track.album.name}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div className="text-center mt-3 text-xs opacity-60">
                👆 Tap any song to play it on your Spotify
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
