import { useCallback, useEffect, useState } from "react";
import { checkApi, checkDatabase } from "../services/healthService";

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

// Tests React -> Express and React -> Express -> MongoDB Atlas.
// Runs on mount; call recheck() to repeat.
export default function useApiHealth() {
  const [api, setApi] = useState(initial);
  const [db, setDb] = useState(initial);

  const recheck = useCallback(async () => {
    setApi(initial);
    setDb(initial);
    // Independent checks: a failing database must not hide a healthy API.
    await Promise.all([
      runCheck(checkApi).then(setApi),
      runCheck(checkDatabase).then(setDb),
    ]);
  }, []);

  useEffect(() => {
    recheck();
  }, [recheck]);

  const loading = api.status === "loading" || db.status === "loading";
  const allOk = api.status === "ok" && db.status === "ok";

  return { api, db, loading, allOk, recheck };
}
