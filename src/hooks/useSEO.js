/**
 * useSEO.js
 * Dynamically updates document <title>, meta tags, OG tags, Twitter card,
 * canonical URL, and optionally injects JSON-LD structured data.
 * Call this hook at the top of each page component.
 */
import { useEffect } from 'react';

const BASE_URL = 'https://codearena.in';
const DEFAULT_IMAGE = `${BASE_URL}/og-image.png`;
const SITE_NAME = 'CodeArena';

/**
 * @param {object} options
 * @param {string}  options.title        - Full page title (without site suffix)
 * @param {string}  options.description  - Meta description (120-160 chars)
 * @param {string}  [options.canonical]  - Canonical path e.g. '/dsaquestion'
 * @param {string}  [options.image]      - OG image URL (absolute)
 * @param {string}  [options.type]       - OG type, default 'website'
 * @param {object}  [options.jsonLd]     - JSON-LD object to inject (optional)
 * @param {string}  [options.robots]     - robots content, default 'index, follow'
 */
export function useSEO({
    title,
    description,
    canonical,
    image = DEFAULT_IMAGE,
    type = 'website',
    jsonLd = null,
    robots = 'index, follow',
}) {
    useEffect(() => {
        if (!title) return;

        const fullTitle = title.includes(SITE_NAME) ? title : `${title} – ${SITE_NAME}`;

        // ── Title ──
        document.title = fullTitle;

        // ── Helper to upsert a <meta> tag ──
        const setMeta = (selector, attr, content) => {
            if (!content) return;
            let el = document.querySelector(selector);
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
            if (!href) return;
            let el = document.querySelector(`link[rel="${rel}"]`);
            if (!el) {
                el = document.createElement('link');
                el.setAttribute('rel', rel);
                document.head.appendChild(el);
            }
            el.setAttribute('href', href);
        };

        // Primary meta
        setMeta('meta[name="description"]', 'name=description', description);
        setMeta('meta[name="robots"]', 'name=robots', robots);

        // Open Graph
        setMeta('meta[property="og:title"]', 'property=og:title', fullTitle);
        setMeta('meta[property="og:description"]', 'property=og:description', description);
        setMeta('meta[property="og:type"]', 'property=og:type', type);
        setMeta('meta[property="og:image"]', 'property=og:image', image);
        if (canonical) {
            const ogUrl = `${BASE_URL}${canonical}`;
            setMeta('meta[property="og:url"]', 'property=og:url', ogUrl);
        }

        // Twitter
        setMeta('meta[name="twitter:title"]', 'name=twitter:title', fullTitle);
        setMeta('meta[name="twitter:description"]', 'name=twitter:description', description);
        setMeta('meta[name="twitter:image"]', 'name=twitter:image', image);

        // Canonical
        if (canonical) {
            setLink('canonical', `${BASE_URL}${canonical}`);
        }

        // JSON-LD — inject or update
        if (jsonLd) {
            const existingScript = document.querySelector('script[data-seo-jsonld]');
            const scriptEl = existingScript || document.createElement('script');
            scriptEl.type = 'application/ld+json';
            scriptEl.setAttribute('data-seo-jsonld', 'true');
            scriptEl.textContent = JSON.stringify(jsonLd);
            if (!existingScript) document.head.appendChild(scriptEl);
        }
    }, [title, description, canonical, image, type, robots, jsonLd]);
}
