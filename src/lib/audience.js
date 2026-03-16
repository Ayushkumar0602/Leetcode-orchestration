export function campaignAppliesToUser(campaign, { uid, profile }) {
  const t = campaign?.target || { kind: "all" };
  if (!t || t.kind === "all") return true;

  if (t.kind === "uids") {
    const uids = Array.isArray(t.uids) ? t.uids : [];
    return uids.includes(uid);
  }

  if (t.kind === "segment") {
    const seg = t.segment || {};
    // Supported segments (simple + fast): plan filter
    if (seg.plan && seg.plan !== "all") {
      const userPlan = profile?.plan || "Spark";
      if (userPlan !== seg.plan) return false;
    }
    return true;
  }

  return true;
}

