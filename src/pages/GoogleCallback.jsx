import { useEffect } from "react";
const GoogleCallback = () => {
  useEffect(() => {
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    const accessToken = params.get("access_token");
    if (!accessToken) {
      window.close();
      return;
    }
    fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${accessToken}` }
    }).then((res) => res.json()).then((profile) => {
      window.opener.postMessage({
        googleId: profile.sub,
        email: profile.email,
        name: profile.name,
        avatar: profile.picture
      }, window.location.origin);
      window.close();
    });
  }, []);
  return <div className="flex items-center justify-center h-screen text-lg">Signing in with Google...</div>;
};
export {
  GoogleCallback
};
