import { useCallback, useEffect, useState } from "react";
import { checkApi, checkDatabase, checkAuthSession } from "../services/healthService";

const initial = { status: "loading", data: null, message: "", ms: null };

// Runs one check and measures how long the round-trip took.
async function runCheck(fn) {
  const start = performance.now();
  try {
    const res = await fn();
    return {
      status: "ok",
      data: res.data,
      message: res.message,
      ms: Math.round(performance.now() - start),
    };
  } catch (err) {
    return {
      status: "error",
      data: null,
      message: err.message || "Unknown error",
      ms: Math.round(performance.now() - start),
    };
  }
}

// Tests React -> Express, MongoDB Atlas, and authenticated JWT session.
// Runs on mount; call recheck() to repeat.
export default function useApiHealth() {
  const [api, setApi] = useState(initial);
  const [db, setDb] = useState(initial);
  const [auth, setAuth] = useState(initial);

  const recheck = useCallback(async () => {
    setApi(initial);
    setDb(initial);
    setAuth(initial);
    // Independent checks: a failing check must not hide others.
    await Promise.all([
      runCheck(checkApi).then(setApi),
      runCheck(checkDatabase).then(setDb),
      runCheck(checkAuthSession).then(setAuth),
    ]);
  }, []);

  useEffect(() => {
    recheck();
  }, [recheck]);

  const loading = api.status === "loading" || db.status === "loading" || auth.status === "loading";
  const allOk = api.status === "ok" && db.status === "ok" && auth.status === "ok";

  return { api, db, auth, loading, allOk, recheck };
}

