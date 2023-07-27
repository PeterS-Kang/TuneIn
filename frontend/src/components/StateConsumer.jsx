import { useEffect } from "react";

export const StateConsumer = ({playerDevice, errorState, useWebPlaybackSDKReady, playbackState, accessToken}) => {

    useEffect(() => {
      if (playerDevice?.device_id === undefined) return;

      sessionStorage.setItem("deviceID", playerDevice?.device_id)

      // https://developer.spotify.com/documentation/web-api/reference/#endpoint-transfer-a-users-playback
      fetch(`https://api.spotify.com/v1/me/player`, {
        method: "PUT",
        body: JSON.stringify({ device_ids: [playerDevice.device_id], play: true }),
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });
    }, [playerDevice?.device_id]);

  }

  
  
