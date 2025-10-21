declare module "spotify-buddylist" {
  export interface WebAccessTokenResponse {
    accessToken: string;
    accessTokenExpirationTimestampMs: number;
    isAnonymous: boolean;
  }

  export interface Track {
    uri: string;
    name: string;
    imageUrl?: string;
    album?: {
      uri: string;
      name: string;
    };
    artist?: {
      uri: string;
      name: string;
    };
    context?: {
      uri: string;
      name: string;
      index: number;
    };
  }

  export interface Friend {
    timestamp: number;
    user: {
      uri: string;
      name: string;
      imageUrl?: string;
    };
    track: Track;
  }

  export interface FriendActivity {
    friends: Friend[];
  }

  /**
   * Get a web access token from an sp_dc cookie
   * @param spDcCookie The sp_dc cookie value from Spotify
   * @returns Promise with access token details
   */
  export function getWebAccessToken(
    spDcCookie: string
  ): Promise<WebAccessTokenResponse>;

  /**
   * Get friend activity from Spotify
   * @param accessToken The access token obtained from getWebAccessToken
   * @returns Promise with friend activity data
   */
  export function getFriendActivity(
    accessToken: string
  ): Promise<FriendActivity>;
}

