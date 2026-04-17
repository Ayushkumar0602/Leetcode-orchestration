/**
 * useSEO.js
 * Dynamically updates document <title>, meta tags, OG tags, Twitter card,
 * canonical URL, and optionally injects JSON-LD structured data.
 * Call this hook at the top of each page component.
 */
import { useEffect } from 'react';

const BASE_URL = 'https://whizan.xyz';
const DEFAULT_IMAGE = `${BASE_URL}/og-image.png`;
const SITE_NAME = 'Whizan AI';
const TWITTER_SITE = '@whizanHQ';
const DEFAULT_LOCALE = 'en_US';

/**
 * @param {object} options
 * @param {string}  options.title        - Full page title (without site suffix)
 * @param {string}  options.description  - Meta description (120-160 chars)
 * @param {string}  [options.canonical]  - Canonical path e.g. '/dsaquestion'
 * @param {string}  [options.keywords]   - Comma-separated keywords
 * @param {string}  [options.image]      - OG image URL (absolute)
 * @param {string}  [options.type]       - OG type, default 'website'
 * @param {string}  [options.imageAlt]   - OG/Twitter image alt text
 * @param {object|object[]} [options.jsonLd] - JSON-LD object(s) to inject
 * @param {string}  [options.robots]     - robots content, default 'index, follow'
 * @param {string}  [options.twitterCard] - Twitter card type
 * @param {string}  [options.locale]     - Open Graph locale
 */
export function useSEO({
    title,
    description,
    canonical,
    keywords,
    image = DEFAULT_IMAGE,
    type = 'website',
    imageAlt,
    jsonLd = null,
    robots = 'index, follow',
    twitterCard = 'summary_large_image',
    locale = DEFAULT_LOCALE,
}) {
    useEffect(() => {
        if (!title) return;

        const fullTitle = title.includes(SITE_NAME) ? title : `${title} – ${SITE_NAME}`;
        const canonicalUrl = canonical
            ? canonical.startsWith('http')
                ? canonical
                : `${BASE_URL}${canonical.startsWith('/') ? canonical : `/${canonical}`}`
            : null;
        const resolvedImage = image?.startsWith('http')
            ? image
            : `${BASE_URL}${image?.startsWith('/') ? image : `/${image}`}`;

        // ── Title ──
        document.title = fullTitle;

        // ── Helper to upsert a <meta> tag ──
        const setMeta = (selector, attr, content) => {
            let el = document.querySelector(selector);
            if (!content) {
                el?.remove();
                return;
            }
            if (!el) {
                el = document.createElement('meta');
                const [attrName, attrValue] = attr.split('=');
                el.setAttribute(attrName, attrValue.replace(/"/g, ''));
                document.head.appendChild(el);
            }
            el.setAttribute('content', content);
        };

        // ── Helper to upsert a <link> tag ──
        const setLink = (rel, href) => {
            let el = document.querySelector(`link[rel="${rel}"]`);
            if (!href) {
                el?.remove();
                return;
            }
            if (!el) {
                el = document.createElement('link');
                el.setAttribute('rel', rel);
                document.head.appendChild(el);
            }
            el.setAttribute('href', href);
        };

        // Primary meta
        setMeta('meta[name="description"]', 'name=description', description);
        setMeta('meta[name="keywords"]', 'name=keywords', keywords);
        setMeta('meta[name="robots"]', 'name=robots', robots);

        // Open Graph
        setMeta('meta[property="og:title"]', 'property=og:title', fullTitle);
        setMeta('meta[property="og:description"]', 'property=og:description', description);
        setMeta('meta[property="og:type"]', 'property=og:type', type);
        setMeta('meta[property="og:site_name"]', 'property=og:site_name', SITE_NAME);
        setMeta('meta[property="og:locale"]', 'property=og:locale', locale);
        setMeta('meta[property="og:image"]', 'property=og:image', resolvedImage);
        setMeta('meta[property="og:image:alt"]', 'property=og:image:alt', imageAlt || fullTitle);
        setMeta('meta[property="og:url"]', 'property=og:url', canonicalUrl);

        // Twitter
        setMeta('meta[name="twitter:card"]', 'name=twitter:card', twitterCard);
        setMeta('meta[name="twitter:site"]', 'name=twitter:site', TWITTER_SITE);
        setMeta('meta[name="twitter:title"]', 'name=twitter:title', fullTitle);
        setMeta('meta[name="twitter:description"]', 'name=twitter:description', description);
        setMeta('meta[name="twitter:image"]', 'name=twitter:image', resolvedImage);
        setMeta('meta[name="twitter:image:alt"]', 'name=twitter:image:alt', imageAlt || fullTitle);

        // Canonical
        setLink('canonical', canonicalUrl);

        // JSON-LD — inject or update
        document.querySelectorAll('script[data-seo-jsonld]').forEach((el) => el.remove());
        const jsonLdEntries = Array.isArray(jsonLd) ? jsonLd.filter(Boolean) : jsonLd ? [jsonLd] : [];
        jsonLdEntries.forEach((entry, index) => {
            const scriptEl = document.createElement('script');
            scriptEl.type = 'application/ld+json';
            scriptEl.setAttribute('data-seo-jsonld', `true-${index}`);
            scriptEl.textContent = JSON.stringify(entry);
            document.head.appendChild(scriptEl);
        });
    }, [title, description, canonical, keywords, image, type, imageAlt, robots, twitterCard, locale, jsonLd]);
}
