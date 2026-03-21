import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { X, ExternalLink, Sparkles, Megaphone, Zap, Bell } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";
import { listenActiveCampaigns, listenCampaignReceipts, setCampaignReceipt } from "../lib/notifications";
import { listenForegroundFcmMessages, registerFcmToken } from "../lib/fcm";
import "../NotificationSystem.css";

const TOAST_DURATION = 8000;

/* ═══ Toast Component ═══ */
function Toast({ id, title, message, imageUrl, htmlContent, ctaText, onClose, onOpen, duration = TOAST_DURATION }) {
  const [progress, setProgress] = useState(100);
  const startRef = useRef(Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      const elapsed = Date.now() - startRef.current;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);
      if (remaining <= 0) { onClose(); clearInterval(timer); }
    }, 50);
    return () => clearInterval(timer);
  }, [duration, onClose]);

  return (
    <motion.div className="notif-toast"
      initial={{ x: 100, opacity: 0, scale: 0.9 }}
      animate={{ x: 0, opacity: 1, scale: 1 }}
      exit={{ x: 100, opacity: 0, scale: 0.9 }}
      transition={{ type: "spring", damping: 25, stiffness: 350 }}>
      <div className="notif-toast-header">
        <div className="notif-toast-icon">
          <Sparkles size={16} color="#c084fc" />
        </div>
        <div className="notif-toast-body" style={{ minWidth: 0, overflow: "hidden" }}>
          {htmlContent ? (
            <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
          ) : (
            <>
              <div className="notif-toast-title">{title}</div>
              <div className="notif-toast-msg">{message}</div>
            </>
          )}
        </div>
        <button className="notif-btn notif-btn-ghost notif-btn-icon notif-btn-sm"
          style={{ width: 30, height: 30, flexShrink: 0 }}
          onClick={onClose} aria-label="Close">
          <X size={14} />
        </button>
      </div>
      {!htmlContent && imageUrl && (
        <img src={imageUrl} alt="" style={{ width: "100%", height: 100, objectFit: "cover", borderRadius: 10, marginTop: 10, border: "1px solid rgba(255,255,255,0.06)" }} />
      )}
      <div className="notif-toast-actions">
        {!htmlContent && ctaText && <button className="notif-btn notif-btn-primary notif-btn-sm" onClick={onOpen}>{ctaText}</button>}
        <button className="notif-btn notif-btn-blue notif-btn-sm" onClick={onOpen}>
          Open <ExternalLink size={12} />
        </button>
      </div>
      <div className="notif-toast-progress" style={{ width: `${progress}%` }} />
    </motion.div>
  );
}

/* ═══ Popup Modal Component ═══ */
function PopupModal({ campaign, onClose, onAction }) {
  return (
    <motion.div className="notif-overlay"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}>
      <motion.div className="notif-popup-card"
        initial={{ scale: 0.85, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.85, y: 30 }}
        transition={{ type: "spring", damping: 25, stiffness: 350 }}
        onClick={(e) => e.stopPropagation()}>
        <button className="notif-popup-close" onClick={onClose} aria-label="Close">
          <X size={16} />
        </button>
        {campaign.htmlContent ? (
          <div style={{ width: "100%", overflow: "hidden", marginTop: 16 }} dangerouslySetInnerHTML={{ __html: campaign.htmlContent }} />
        ) : (
          <>
            {campaign.imageUrl && <img src={campaign.imageUrl} alt="" className="notif-popup-image" />}
            <div className="notif-popup-title">{campaign.title || "Notification"}</div>
            <div className="notif-popup-message">{campaign.message || ""}</div>
          </>
        )}
        <div className="notif-popup-actions">
          {!campaign.htmlContent && campaign.ctaText && (
            <button className="notif-btn notif-btn-primary"
              onClick={() => onAction(campaign.ctaLink || campaign.link)}>
              {campaign.ctaText}
            </button>
          )}
          {!campaign.htmlContent && campaign.ctaSecondaryText && (
            <button className="notif-btn notif-btn-ghost"
              onClick={() => onAction(campaign.ctaSecondaryLink || campaign.link)}>
              {campaign.ctaSecondaryText}
            </button>
          )}
          {!campaign.htmlContent && !campaign.ctaText && campaign.link && (
            <button className="notif-btn notif-btn-primary"
              onClick={() => onAction(campaign.link)}>
              View Details <ExternalLink size={14} />
            </button>
          )}
          {!campaign.htmlContent && !campaign.ctaText && !campaign.link && (
            <button className="notif-btn notif-btn-ghost" onClick={onClose}>
              Got it
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ═══ Banner Component ═══ */
function BannerNotification({ campaign, onClose, onAction }) {
  return (
    <motion.div className="notif-banner-toast"
      initial={{ y: -60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -60, opacity: 0 }}
      transition={{ type: "spring", damping: 25, stiffness: 350 }}>
      <div className="notif-banner-toast-content">
        <div style={{ width: 36, height: 36, borderRadius: 12, background: "rgba(168,85,247,0.18)", border: "1px solid rgba(168,85,247,0.25)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Megaphone size={16} color="#c084fc" />
        </div>
        <div className="notif-banner-toast-text">
          {campaign.htmlContent ? (
            <div dangerouslySetInnerHTML={{ __html: campaign.htmlContent }} />
          ) : (
            <>
              <h4>{campaign.title || "Announcement"}</h4>
              <p>{campaign.message || ""}</p>
            </>
          )}
        </div>
      </div>
      <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
        {!campaign.htmlContent && (campaign.ctaText || campaign.link) && (
          <button className="notif-btn notif-btn-primary notif-btn-sm"
            onClick={() => onAction(campaign.ctaLink || campaign.link)}>
            {campaign.ctaText || "View"}
          </button>
        )}
        <button className="notif-btn notif-btn-ghost notif-btn-icon notif-btn-sm"
          style={{ width: 32, height: 32 }}
          onClick={onClose} aria-label="Close">
          <X size={14} />
        </button>
      </div>
    </motion.div>
  );
}

/* ═══ Announcement Overlay Component ═══ */
function AnnouncementOverlay({ campaign, onClose, onAction }) {
  return (
    <motion.div className="notif-announcement-overlay"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}>
      <motion.div className="notif-announcement-card"
        initial={{ scale: 0.8, y: 40 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.8, y: 40 }}
        transition={{ type: "spring", damping: 22, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}>
        <button className="notif-popup-close" onClick={onClose} aria-label="Close">
          <X size={16} />
        </button>
        <div style={{ width: 56, height: 56, borderRadius: 18, background: "linear-gradient(135deg, rgba(236,72,153,0.18), rgba(168,85,247,0.15))", border: "1px solid rgba(236,72,153,0.22)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
          <Zap size={26} color="#f472b6" />
        </div>
        {campaign.htmlContent ? (
          <div style={{ width: "100%", overflow: "hidden", marginBottom: 20 }} dangerouslySetInnerHTML={{ __html: campaign.htmlContent }} />
        ) : (
          <>
            {campaign.imageUrl && <img src={campaign.imageUrl} alt="" className="notif-announcement-card-image" />}
            <div className="notif-announcement-card-title">{campaign.title || "Announcement"}</div>
            <div className="notif-announcement-card-msg">{campaign.message || ""}</div>
          </>
        )}
        <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
          {!campaign.htmlContent && campaign.ctaText && (
            <button className="notif-btn notif-btn-primary"
              onClick={() => onAction(campaign.ctaLink || campaign.link)}>
              {campaign.ctaText}
            </button>
          )}
          {!campaign.htmlContent && campaign.ctaSecondaryText && (
            <button className="notif-btn notif-btn-ghost"
              onClick={() => onAction(campaign.ctaSecondaryLink || campaign.link)}>
              {campaign.ctaSecondaryText}
            </button>
          )}
          {!campaign.htmlContent && !campaign.ctaText && (
            <button className="notif-btn notif-btn-ghost" onClick={onClose}>
              Dismiss
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ═══ Main NotificationPopupManager ═══ */
export default function NotificationPopupManager() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const uid = currentUser?.uid;

  const [campaigns, setCampaigns] = useState([]);
  const [receipts, setReceipts] = useState(new Map());
  const [toasts, setToasts] = useState([]);
  const [activePopup, setActivePopup] = useState(null);
  const [activeBanner, setActiveBanner] = useState(null);
  const [activeAnnouncement, setActiveAnnouncement] = useState(null);
  const shownRef = useRef(new Set());
  const [userProfile, setUserProfile] = useState(null);

  // Fetch user profile
  useEffect(() => {
    if (!uid) return;
    getDoc(doc(db, "userProfiles", uid)).then(snap => {
      setUserProfile(snap.exists() ? snap.data() : {});
    }).catch(() => setUserProfile({}));
  }, [uid]);

  // Register FCM token
  useEffect(() => {
    if (!currentUser) return;
    registerFcmToken(currentUser).catch(() => {});
  }, [currentUser]);

  // Listen to campaigns and receipts
  useEffect(() => {
    if (!uid) return;
    const unsub1 = listenActiveCampaigns({}, setCampaigns);
    const unsub2 = listenCampaignReceipts(uid, setReceipts);
    return () => { unsub1?.(); unsub2?.(); };
  }, [uid]);

  // FCM foreground messages
  useEffect(() => {
    let unsub = () => {};
    (async () => {
      unsub = await listenForegroundFcmMessages((payload) => {
        const title = payload?.notification?.title || payload?.data?.title || "Notification";
        const message = payload?.notification?.body || payload?.data?.body || "";
        const link = payload?.data?.link || "/notifications";
        const id = payload?.data?.id || `fcm_${Date.now()}`;
        setToasts((prev) => [{ id, title, message, link, _kind: "fcm" }, ...prev].slice(0, 3));
      });
    })();
    return () => unsub?.();
  }, []);

  const handleDismiss = useCallback(async (campaignId) => {
    if (!uid || !campaignId) return;
    await setCampaignReceipt(uid, campaignId, { dismissedAt: new Date().toISOString(), readAt: new Date().toISOString() }).catch(() => {});
  }, [uid]);

  const handleAction = useCallback(async (campaignId, link) => {
    if (uid && campaignId) {
      await setCampaignReceipt(uid, campaignId, { clickedAt: new Date().toISOString(), readAt: new Date().toISOString() }).catch(() => {});
    }
    if (link) {
      if (link.startsWith("http")) window.open(link, "_blank");
      else navigate(link);
    }
  }, [uid, navigate]);

  // Process campaigns by display type
  useEffect(() => {
    if (!uid || campaigns.length === 0 || userProfile === null) return;

    for (const c of campaigns) {
      const display = c.display || c.type || "feed";
      const r = receipts.get(c.id) || {};
      if (r.dismissedAt) continue;

      const key = `${display}_${c.id}`;
      if (shownRef.current.has(key)) continue;

      // Target Audience Filter
      const target = c.target || { kind: "all" };
      if (target.kind === "individual") {
        if (!target.userIds || !target.userIds.includes(uid)) continue;
      } else if (target.kind === "group" && target.groups) {
        const plan = (userProfile.plan || "free").toLowerCase();
        const role = (userProfile.role || "user").toLowerCase();
        const isAdmin = userProfile.isAdmin === true;
        const isBeta = userProfile.isBeta === true;
        let match = false;
        target.groups.forEach(g => {
            const group = String(g).toLowerCase();
            if (plan === group || role === group) match = true;
            if (group === "admin" && isAdmin) match = true;
            if (group === "beta" && isBeta) match = true;
        });
        if (!match) continue;
      }

      // Target Page Filter
      if (c.targetPage) {
          const path = location.pathname;
          if (!path.startsWith(c.targetPage)) continue;
      }

      const priority = c.priority || 1;

      if (display === "popup") {
        shownRef.current.add(key);
        setTimeout(() => setActivePopup(c), 0);
        setCampaignReceipt(uid, c.id, { shownAt: new Date().toISOString(), firstSeenAt: new Date().toISOString() }).catch(() => {});
        break;
      } else if (display === "banner") {
        shownRef.current.add(key);
        setTimeout(() => setActiveBanner(c), 0);
        setCampaignReceipt(uid, c.id, { shownAt: new Date().toISOString(), firstSeenAt: new Date().toISOString() }).catch(() => {});
        break;
      } else if (display === "announcement") {
        shownRef.current.add(key);
        setTimeout(() => setActiveAnnouncement(c), 0);
        setCampaignReceipt(uid, c.id, { shownAt: new Date().toISOString(), firstSeenAt: new Date().toISOString() }).catch(() => {});
        break;
      } else if (display === "feed") {
        // Feed types show as toasts only if high priority
        if (priority >= 3 && !shownRef.current.has(key)) {
          shownRef.current.add(key);
          setTimeout(() => {
            setToasts((prev) => [{
              id: `campaign_${c.id}`, title: c.title || "Notification",
              message: c.message || "", link: c.link || "/notifications",
              imageUrl: c.imageUrl, htmlContent: c.htmlContent, ctaText: c.ctaText,
              _kind: "campaign", campaignId: c.id,
            }, ...prev].slice(0, 3));
          }, 0);
          setCampaignReceipt(uid, c.id, { shownAt: new Date().toISOString(), firstSeenAt: new Date().toISOString() }).catch(() => {});
        }
      }
    }
  }, [uid, campaigns, receipts]);

  if (!currentUser) return null;

  return (
    <>
      {/* Toast Stack */}
      <div className="notif-toast-stack">
        <AnimatePresence>
          {toasts.map((t) => (
            <Toast key={t.id} id={t.id} title={t.title} message={t.message}
              imageUrl={t.imageUrl} htmlContent={t.htmlContent} ctaText={t.ctaText}
              onClose={async () => {
                setToasts((prev) => prev.filter((x) => x.id !== t.id));
                if (t._kind === "campaign" && t.campaignId) await handleDismiss(t.campaignId);
              }}
              onOpen={async () => {
                setToasts((prev) => prev.filter((x) => x.id !== t.id));
                await handleAction(t.campaignId, t.link || "/notifications");
              }}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Popup Modal */}
      <AnimatePresence>
        {activePopup && (
          <PopupModal key={`popup_${activePopup.id}`} campaign={activePopup}
            onClose={() => { handleDismiss(activePopup.id); setActivePopup(null); }}
            onAction={(link) => { handleAction(activePopup.id, link); setActivePopup(null); }}
          />
        )}
      </AnimatePresence>

      {/* Banner */}
      <AnimatePresence>
        {activeBanner && (
          <BannerNotification key={`banner_${activeBanner.id}`} campaign={activeBanner}
            onClose={() => { handleDismiss(activeBanner.id); setActiveBanner(null); }}
            onAction={(link) => { handleAction(activeBanner.id, link); setActiveBanner(null); }}
          />
        )}
      </AnimatePresence>

      {/* Announcement Overlay */}
      <AnimatePresence>
        {activeAnnouncement && (
          <AnnouncementOverlay key={`ann_${activeAnnouncement.id}`} campaign={activeAnnouncement}
            onClose={() => { handleDismiss(activeAnnouncement.id); setActiveAnnouncement(null); }}
            onAction={(link) => { handleAction(activeAnnouncement.id, link); setActiveAnnouncement(null); }}
          />
        )}
      </AnimatePresence>
    </>
  );
}
