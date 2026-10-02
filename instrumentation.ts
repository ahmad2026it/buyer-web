export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  const { startIndexNowScheduler } = await import("./lib/indexnowSync");
  startIndexNowScheduler();
}
