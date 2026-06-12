"use client";

import { useEffect, useState } from "react";
import SectionTitle from "../Common/SectionTitle";

const YOUTUBE_CHANNEL_ID = process.env.NEXT_PUBLIC_YOUTUBE_CHANNEL_ID || "YOUR_CHANNEL_ID";
const YOUTUBE_API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;

export default function Video() {
  const [isLive, setIsLive] = useState(false);
  const [liveVideoId, setLiveVideoId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState("Checking live status...");

  useEffect(() => {
    if (!YOUTUBE_API_KEY || !YOUTUBE_CHANNEL_ID) {
      setStatusMessage("Live status unavailable. Set YouTube channel and API key.");
      return;
    }

    async function checkLiveStatus() {
      try {
        const response = await fetch(
          `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${YOUTUBE_CHANNEL_ID}&eventType=live&type=video&key=${YOUTUBE_API_KEY}`,
          { cache: "no-store" }
        );
        const data = await response.json();
        if (data?.items?.length > 0) {
          setIsLive(true);
          setLiveVideoId(data.items[0].id.videoId);
          setStatusMessage("Live now — join us on YouTube.");
        } else {
          setIsLive(false);
          setStatusMessage("We are not live right now. Check back for our next service.");
        }
      } catch (error) {
        setIsLive(false);
        setStatusMessage("Unable to verify live status at this time.");
      }
    }

    checkLiveStatus();
  }, []);

  const iframeSrc = isLive && liveVideoId
    ? `https://www.youtube.com/embed/${liveVideoId}?autoplay=0`
    : `https://www.youtube.com/embed/live_stream?channel=${YOUTUBE_CHANNEL_ID}&autoplay=0`;

  return (
    <section className="relative z-10 py-16 md:py-20 lg:py-28">
      <div className="container">
        <SectionTitle
          title="Live YouTube Production"
          paragraph="Join us for our live services and special events broadcasted directly from our church."
          center
          mb="80px"
        />
      </div>
      <div className="relative overflow-hidden">
        <div className="-mx-4 flex flex-wrap">
          <div className="w-full px-4">
            <div className="mx-auto max-w-[770px] overflow-hidden rounded-md relative">
              <div className="absolute top-4 left-4 z-10 rounded-full px-3 py-1 text-sm font-bold text-white flex items-center" style={{ backgroundColor: isLive ? "#dc2626" : "rgba(15, 23, 42, 0.85)" }}>
                {isLive ? (
                  <>
                    <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></div>
                    LIVE
                  </>
                ) : (
                  <>NOT LIVE</>
                )}
              </div>
              <div className="aspect-video">
                <iframe
                  src={iframeSrc}
                  title="Live YouTube Production"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                ></iframe>
              </div>
            </div>
            <div className="mt-4 text-center text-sm text-body-color">
              {statusMessage}
            </div>
          </div>
        </div>

        <div className="absolute right-0 bottom-0 left-0 z-[-1] h-full w-full bg-[url(/images/video/shape.svg)] bg-cover bg-center bg-no-repeat"></div>
      </div>
    </section>
  );
};
