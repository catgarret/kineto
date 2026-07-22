import e from "lenis";
import t from "gsap";
import n from "gsap/ScrollTrigger.js";
//#region src/runtime.js
var r = (e) => e?.default || e?.gsap || e, i = typeof window < "u" ? window : void 0, a = i && i.gsap || r(t), o = i && i.ScrollTrigger || r(n);
function s() {
	if (!(!a || !o || typeof a.registerPlugin != "function")) try {
		a.registerPlugin(o);
	} catch {}
}
s();
function c({ gsap: e, ScrollTrigger: t } = {}) {
	e && (a = r(e)), t && (o = r(t)), s();
}
function l() {
	return a || i && i.gsap || null;
}
function u() {
	return o || i && i.ScrollTrigger || null;
}
//#endregion
//#region src/utils.js
function d() {
	if (typeof window > "u") return {
		ssr: !0,
		reducedMotion: !1,
		perf: "high",
		touch: !1,
		hasGyro: !1,
		canVibrate: !1,
		saveData: !1
	};
	let e = navigator.connection || navigator.mozConnection || navigator.webkitConnection, t = typeof window.matchMedia == "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches, n = !!e?.saveData, r = /(^|-)2g|slow-2g/.test(e?.effectiveType || ""), i = (navigator.deviceMemory || 8) < 4, a = (navigator.hardwareConcurrency || 8) < 4;
	return {
		ssr: !1,
		reducedMotion: t,
		perf: n || r ? "low" : i || a ? "mid" : "high",
		saveData: n,
		touch: "ontouchstart" in window || navigator.maxTouchPoints > 0,
		hasGyro: typeof DeviceOrientationEvent < "u",
		canVibrate: typeof navigator.vibrate == "function"
	};
}
var f = null;
function p() {
	return typeof DeviceOrientationEvent > "u" ? Promise.resolve(!1) : typeof DeviceOrientationEvent.requestPermission == "function" ? f || (f = new Promise((e) => {
		let t = !1, n = () => {
			document.removeEventListener("click", i, !0), document.removeEventListener("touchend", i, !0);
		}, r = (r) => {
			t || (t = !0, n(), e(r));
		}, i = async () => {
			try {
				let e = await DeviceOrientationEvent.requestPermission();
				e === "granted" ? r(!0) : e === "denied" && r(!1);
			} catch {}
		};
		document.addEventListener("click", i, !0), document.addEventListener("touchend", i, !0);
	}), f) : Promise.resolve(!0);
}
function m(e, t, n) {
	return e + (t - e) * n;
}
function h(e, t, n) {
	return Math.min(n, Math.max(t, e));
}
function g(e) {
	if (typeof e != "string") return e;
	let t = e.trim();
	if (t === "" || t === "true") return !0;
	if (t === "false") return !1;
	if (t === "null") return null;
	if (t !== "" && Number.isFinite(Number(t))) return Number(t);
	if (t.startsWith("{") && t.endsWith("}") || t.startsWith("[") && t.endsWith("]")) try {
		return JSON.parse(t);
	} catch {
		return e;
	}
	return e;
}
function _(e) {
	return e.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
}
function v(e, t = typeof document < "u" ? document : null) {
	return !e || !t ? [] : typeof e == "string" ? Array.from(t.querySelectorAll(e)) : typeof window < "u" && e === window || typeof document < "u" && e === document || typeof Element < "u" && e instanceof Element ? [e] : typeof NodeList < "u" && e instanceof NodeList || typeof HTMLCollection < "u" && e instanceof HTMLCollection || Array.isArray(e) || (typeof e == "object" || typeof e == "function") && typeof Symbol < "u" && typeof e[Symbol.iterator] == "function" ? Array.from(e).filter(Boolean) : [];
}
function y(e, t) {
	let n = {}, r = `kt${t[0].toUpperCase()}${t.slice(1)}`;
	for (let [t, i] of Object.entries(e.dataset || {})) {
		if (!t.startsWith("kt")) continue;
		if (t === r) {
			let e = g(i);
			e && typeof e == "object" && !Array.isArray(e) ? Object.assign(n, e) : e !== !0 && e !== "" && (n.preset = e);
			continue;
		}
		let e = t.slice(2);
		e && (n[e[0].toLowerCase() + e.slice(1)] = g(i));
	}
	return n;
}
function b() {
	return l();
}
function x() {
	return u();
}
function S(e, t, n = {}) {
	if (typeof IntersectionObserver > "u") return t(), {
		disconnect() {},
		unobserve() {}
	};
	let r = new IntersectionObserver((n) => {
		let i = n.find((t) => t.target === e) || n[0];
		i?.isIntersecting && (r.disconnect(), t(i));
	}, n);
	return r.observe(e), r;
}
function C(e, t) {
	let n = new Map(t.map((t) => [t, e.getAttribute(t)]));
	return () => {
		n.forEach((t, n) => {
			t == null ? e.removeAttribute(n) : e.setAttribute(n, t);
		});
	};
}
function w(e, t) {
	let n = new Map(t.map((t) => [t, e.style[t]]));
	return () => {
		n.forEach((t, n) => {
			e.style[n] = t;
		});
	};
}
function T(e, t, n = () => {}) {
	return {
		el: e,
		type: t,
		pause() {},
		resume() {},
		destroy: n
	};
}
var E = [
	"ㄱ",
	"ㄲ",
	"ㄴ",
	"ㄷ",
	"ㄸ",
	"ㄹ",
	"ㅁ",
	"ㅂ",
	"ㅃ",
	"ㅅ",
	"ㅆ",
	"ㅇ",
	"ㅈ",
	"ㅉ",
	"ㅊ",
	"ㅋ",
	"ㅌ",
	"ㅍ",
	"ㅎ"
], D = [
	"ㅏ",
	"ㅐ",
	"ㅑ",
	"ㅒ",
	"ㅓ",
	"ㅔ",
	"ㅕ",
	"ㅖ",
	"ㅗ",
	"ㅘ",
	"ㅙ",
	"ㅚ",
	"ㅛ",
	"ㅜ",
	"ㅝ",
	"ㅞ",
	"ㅟ",
	"ㅠ",
	"ㅡ",
	"ㅢ",
	"ㅣ"
], O = /* @__PURE__ */ ".ㄱ.ㄲ.ㄳ.ㄴ.ㄵ.ㄶ.ㄷ.ㄹ.ㄺ.ㄻ.ㄼ.ㄽ.ㄾ.ㄿ.ㅀ.ㅁ.ㅂ.ㅄ.ㅅ.ㅆ.ㅇ.ㅈ.ㅊ.ㅋ.ㅌ.ㅍ.ㅎ".split(".");
function k(e) {
	let t = e.codePointAt(0);
	if (t < 44032 || t > 55203) return null;
	let n = t - 44032, r = Math.floor(n / 588), i = Math.floor(n % 588 / 28), a = n % 28;
	return {
		cho: r,
		jung: i,
		jong: a,
		pieces: [
			E[r],
			D[i],
			...a ? [O[a]] : []
		]
	};
}
function A(e) {
	let t = k(e);
	if (!t) return [e];
	let n = [E[t.cho]], r = String.fromCharCode(44032 + t.cho * 588 + t.jung * 28);
	return n.push(r), t.jong && n.push(e), n;
}
function j(e, t = !1) {
	let n;
	if (typeof Intl < "u" && Intl.Segmenter) try {
		let t = new Intl.Segmenter(void 0, { granularity: "grapheme" });
		n = Array.from(t.segment(e), ({ segment: e }) => e);
	} catch {
		n = Array.from(e);
	}
	else n = Array.from(e);
	return t ? n.map((e) => ({
		char: e,
		pieces: k(e)?.pieces || [e],
		frames: A(e)
	})) : n;
}
function M(e, { decimals: t = 0, format: n = "", locale: r } = {}) {
	let i = Number(e);
	return Number.isFinite(i) ? n === "," || r ? new Intl.NumberFormat(r || "en-US", {
		minimumFractionDigits: t,
		maximumFractionDigits: t
	}).format(i) : i.toFixed(t) : String(e);
}
function N(e) {
	let t = String(e).trim(), n = t.match(/^#([0-9a-f]{3,8})$/i);
	if (n) {
		let e = n[1];
		(e.length === 3 || e.length === 4) && (e = [...e].map((e) => e + e).join(""));
		let t = parseInt(e.slice(0, 6), 16), r = e.length === 8 ? parseInt(e.slice(6, 8), 16) / 255 : 1;
		return {
			r: t >> 16 & 255,
			g: t >> 8 & 255,
			b: t & 255,
			a: r
		};
	}
	let r = t.match(/rgba?\(([^)]+)\)/i);
	if (r) {
		let e = r[1].split(",").map((e) => Number.parseFloat(e));
		return {
			r: e[0] || 0,
			g: e[1] || 0,
			b: e[2] || 0,
			a: e[3] == null ? 1 : e[3]
		};
	}
	return null;
}
function P(e) {
	let t = e.scrambleFade === !0, n = e.rainbow === !0 && !t;
	if (!n && !t) return null;
	let r = e.rainbowColors;
	typeof r == "string" && (r = r.split(",").map((e) => e.trim()).filter(Boolean));
	let i = Array.isArray(r) && r.length ? r.map(N).filter(Boolean) : null, a = () => {
		if (i && i.length) {
			if (i.length === 1) {
				let e = i[0];
				return `rgba(${e.r},${e.g},${e.b},${e.a})`;
			}
			let e = Math.random() * (i.length - 1), t = Math.min(i.length - 2, Math.floor(e)), n = e - t, r = i[t], a = i[t + 1], o = (e, t) => Math.round(e + (t - e) * n);
			return `rgba(${o(r.r, a.r)},${o(r.g, a.g)},${o(r.b, a.b)},${(r.a + (a.a - r.a) * n).toFixed(3)})`;
		}
		return `hsl(${Math.floor(Math.random() * 360)},92%,62%)`;
	};
	return {
		paint(e) {
			n && (e.style.color = a()), t && (e.style.opacity = (.25 + Math.random() * .75).toFixed(2));
		},
		clear(e) {
			n && (e.style.color = ""), t && (e.style.opacity = "");
		}
	};
}
//#endregion
//#region src/core.js
var F = /* @__PURE__ */ new Map(), I = /* @__PURE__ */ new Set(), L = /* @__PURE__ */ new WeakMap(), R = !1, z = !1, B = null, V = null, H = null, U = null, W = null, G = null, K = {
	smooth: !1,
	smoothOptions: {
		lerp: .08,
		wheelMultiplier: 1,
		smoothWheel: !0
	},
	respectReducedMotion: !0,
	forceReducedMotion: !1,
	performance: "auto",
	debug: !1
};
function ee(...e) {
	K.debug && console.info("[Kineto]", ...e);
}
function te(e, t, n, r) {
	let i = e || T(t, n), a = {};
	return Object.defineProperties(a, Object.getOwnPropertyDescriptors(i)), a.el = i.el || t, a.sourceEl = t, a.type = i.type || n, a.options = r, a.pause = typeof i.pause == "function" ? i.pause.bind(i) : () => {}, a.resume = typeof i.resume == "function" ? i.resume.bind(i) : () => {}, a.destroy = typeof i.destroy == "function" ? i.destroy.bind(i) : () => {}, a;
}
function q(e, t = !1) {
	let n = L.get(e);
	return !n && t && (n = /* @__PURE__ */ new Map(), L.set(e, n)), n;
}
function J(e, t, n, r) {
	let i = te(n, e, t, r), a = {
		sourceEl: e,
		name: t,
		instance: i,
		options: r,
		destroyImplementation: i.destroy,
		destroying: !1
	};
	return i.destroy = () => Y(a), I.add(a), q(e, !0).set(t, a), i;
}
function Y(e, t = !0, n = !0) {
	if (!e || !I.has(e) || e.destroying) return;
	e.destroying = !0, I.delete(e);
	let r = q(e.sourceEl);
	if (r?.delete(e.name), r?.size === 0 && L.delete(e.sourceEl), t) try {
		e.destroyImplementation();
	} catch (t) {
		console.error(`[Kineto/${e.name}] destroy() failed:`, t);
	}
	n && I.size === 0 && ae();
}
function ne(e, t) {
	return t.some((t) => typeof document < "u" && t === document || typeof window < "u" && t === window || e.sourceEl === t || e.instance.el === t || typeof t.contains == "function" && (t.contains(e.sourceEl) || t.contains(e.instance.el)));
}
function re() {
	if (R || Z.env.ssr) return;
	R = !0, oe();
	let e = b(), t = x(), n = Z.performance;
	try {
		t?.config?.({ ignoreMobileResize: !0 });
	} catch {}
	K.smooth && n !== "low" && X(e, t), W = () => {
		let e = document.hidden ? "pause" : "resume";
		I.forEach(({ instance: t, name: n }) => {
			try {
				t[e]();
			} catch (t) {
				console.error(`[Kineto/${n}] ${e}() failed:`, t);
			}
		});
	}, document.addEventListener("visibilitychange", W);
}
function X(t = b(), n = x()) {
	if (V || Z.env.ssr || !K.smooth || Z.performance === "low") return V;
	try {
		if (V = new e(K.smoothOptions), n && V.on("scroll", n.update), t?.ticker) U = (e) => V?.raf(e * 1e3), t.ticker.add(U), t.ticker.lagSmoothing(0);
		else {
			let e = (t) => {
				V?.raf(t), V && (H = requestAnimationFrame(e));
			};
			H = requestAnimationFrame(e);
		}
	} catch (e) {
		V = null, ee("Lenis initialization skipped.", e);
	}
	return V;
}
function ie() {
	let e = b();
	U && e?.ticker && e.ticker.remove(U), U = null, H && cancelAnimationFrame(H), H = null, V?.destroy?.(), V = null;
}
function ae() {
	W && typeof document < "u" && document.removeEventListener("visibilitychange", W), W = null, B && typeof document < "u" && document.removeEventListener("DOMContentLoaded", B), B = null, ie(), R = !1, z = !1;
}
function oe() {
	if (typeof document > "u" || document.getElementById("kineto-inline-fallback")) return;
	let e = document.createElement("style");
	e.id = "kineto-inline-fallback", e.textContent = "\n    @property --kt-angle { syntax: \"<angle>\"; initial-value: 0deg; inherits: false; }\n    @keyframes kt-border-spin { to { --kt-angle: 360deg; } }\n    @keyframes kt-shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }\n    @keyframes kt-aurora { to { transform: rotate(360deg); } }\n    @keyframes kt-aurora-drift { 0% { transform: translate3d(-3%,-2%,0) scale(1.06); } 100% { transform: translate3d(3%,2%,0) scale(1.12); } }\n    @keyframes kt-caret { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }\n    .kt-cursor-active, .kt-cursor-active * { cursor: none !important; }\n    .kt-cursor-scope, .kt-cursor-scope * { cursor: none !important; }\n    .kt-tw-caret { animation: kt-caret .8s step-end infinite; }\n    .kt-slide { position: relative; flex: 0 0 100%; min-width: 0; }\n    .kt-slider-wrap { position: relative; overflow: hidden; }\n    @media (prefers-reduced-motion: reduce) {\n      [data-kt-reveal], [data-kt-text-split], [data-kt-blur-text] { opacity: 1 !important; transform: none !important; filter: none !important; }\n    }\n  ", document.head.appendChild(e);
}
var Z = {
	version: "0.8.25",
	get env() {
		return G ||= d(), G;
	},
	get performance() {
		return K.performance === "auto" ? this.env.perf : K.performance;
	},
	get registry() {
		return Object.fromEntries(F);
	},
	get instanceCount() {
		return I.size;
	},
	get smoothEnabled() {
		return !!V;
	},
	get lenis() {
		return V;
	},
	config(e = {}) {
		return e.smoothOptions && (K.smoothOptions = {
			...K.smoothOptions,
			...e.smoothOptions
		}), Object.assign(K, {
			...e,
			smoothOptions: K.smoothOptions
		}), G = null, this;
	},
	setAnimationEngine: c,
	enableSmooth(e = {}) {
		return K.smooth = !0, K.smoothOptions = {
			...K.smoothOptions,
			...e
		}, R ? X() : re(), this;
	},
	disableSmooth() {
		return K.smooth = !1, ie(), this;
	},
	toggleSmooth(e, t = {}) {
		return (typeof e == "boolean" ? e : !K.smooth) ? this.enableSmooth(t) : this.disableSmooth();
	},
	scrollTo(e, t = {}) {
		return V ? (V.scrollTo(e, t), this) : (typeof e == "number" ? window.scrollTo({
			top: e,
			behavior: t.behavior || "smooth"
		}) : v(e)[0]?.scrollIntoView?.({
			behavior: t.behavior || "smooth",
			block: t.block || "start"
		}), this);
	},
	register(e, t) {
		return !e || !t || typeof t.create != "function" ? (console.warn(`[Kineto] Module "${e}" needs a create() function.`), this) : (F.set(e, t), this[e] = (t, n = {}) => this.create(e, t, n), this);
	},
	unregister(e) {
		return Array.from(I).forEach((t) => {
			t.name === e && Y(t);
		}), F.delete(e), delete this[e], this;
	},
	create(e, t, n = {}) {
		let r = F.get(e);
		if (!r) return console.warn(`[Kineto] Unknown module: ${e}`), null;
		let i = v(t);
		if (!i.length) return null;
		let a = i.map((t) => {
			let i = q(t)?.get(e);
			if (i) return i.instance;
			try {
				let i, a = K.forceReducedMotion || K.respectReducedMotion && this.env.reducedMotion, o = r.reducedMotion || r.reduced;
				return i = a ? o?.(t, n, this) || T(t, e) : this.performance === "low" && typeof r.fallback == "function" ? r.fallback(t, n, this) || T(t, e) : r.create(t, n, this), i ? J(t, e, i, n) : null;
			} catch (t) {
				return console.error(`[Kineto/${e}] create() failed:`, t), null;
			}
		}).filter(Boolean);
		return a.length && re(), a.length <= 1 ? a[0] || null : a;
	},
	scan(e = typeof document < "u" ? document : null) {
		return this.env.ssr || !e ? this : (re(), F.forEach((t, n) => {
			let r = `[data-kt-${_(n)}]`, i = [];
			typeof Element < "u" && e instanceof Element && e.matches(r) && i.push(e), typeof e.querySelectorAll == "function" && i.push(...e.querySelectorAll(r)), i.forEach((e) => this.create(n, e, y(e, n)));
		}), typeof requestAnimationFrame < "u" ? requestAnimationFrame(() => document.documentElement.classList.remove("kt-preload")) : document.documentElement.classList.remove("kt-preload"), this);
	},
	init(e = typeof document < "u" ? document : null) {
		return this.scan(e);
	},
	initModules(e) {
		return v(e).forEach((e) => this.scan(e)), this;
	},
	autoInit(e = typeof document < "u" ? document : null) {
		return this.env.ssr || !e ? this : document.readyState === "loading" ? (z || (z = !0, B = () => {
			z = !1, B = null, this.scan(e);
		}, document.addEventListener("DOMContentLoaded", B, { once: !0 })), this) : this.scan(e);
	},
	getInstance(e, t) {
		let n = v(e)[0];
		return n ? t ? q(n)?.get(t)?.instance || null : Array.from(q(n)?.values() || [], ({ instance: e }) => e) : null;
	},
	destroyModule(e, t) {
		let n = v(e);
		return n.length && Array.from(I).forEach((e) => {
			e.name === t && ne(e, n) && Y(e);
		}), this;
	},
	replay(e, t, n) {
		let r = v(e), i = [];
		Array.from(I).forEach((e) => {
			e.name === t && ne(e, r) && i.push(e);
		});
		let a = [];
		return i.forEach((e) => {
			if (!n && typeof e.instance?.replay == "function") e.instance.replay(), a.push(e.instance);
			else {
				let r = e.sourceEl, i = n || e.options;
				Y(e, !0, !1);
				let o = this.create(t, r, i);
				o && a.push(o);
			}
		}), a.length <= 1 ? a[0] || null : a;
	},
	destroy(e) {
		if (e) {
			let t = v(e);
			return Array.from(I).forEach((e) => {
				ne(e, t) && Y(e);
			}), this;
		}
		return Array.from(I).forEach((e) => Y(e)), ae(), this;
	},
	pause() {
		return I.forEach(({ instance: e }) => e.pause()), V?.stop(), this;
	},
	resume() {
		return I.forEach(({ instance: e }) => e.resume()), V?.start(), this;
	},
	refresh() {
		return x()?.refresh(), this;
	}
};
Z.core = {
	initModules: (e) => Z.initModules(e),
	destroyModule: (e, t) => Z.destroyModule(e, t),
	getInstance: (e, t) => Z.getInstance(e, t),
	replay: (e, t, n) => Z.replay(e, t, n),
	scan: (e) => Z.scan(e),
	enableSmooth: (e) => Z.enableSmooth(e),
	disableSmooth: () => Z.disableSmooth(),
	toggleSmooth: (e, t) => Z.toggleSmooth(e, t),
	scrollTo: (e, t) => Z.scrollTo(e, t)
};
//#endregion
//#region src/modules/parallax.js
var se = {
	create(e, t) {
		let n = b(), r = x();
		if (!n || !r) return this.fallback(e, t);
		let i = w(e, ["transform", "willChange"]), a = t.speed ?? .5, o = t.axis || "y", s = (t.distance ?? 200) * Math.abs(a), c = { [o]: a < 0 ? s : -s }, l = {
			[o]: a < 0 ? -s : s,
			ease: "none",
			scrollTrigger: {
				trigger: e,
				start: t.start || "top bottom",
				end: t.end || "bottom top",
				scrub: t.scrub ?? !0,
				invalidateOnRefresh: !0,
				onUpdate: t.onUpdate ? (n) => t.onUpdate(n.progress, e, n) : void 0
			}
		};
		e.style.willChange = "transform";
		let u = n.fromTo(e, c, l);
		return {
			el: e,
			type: "parallax",
			pause: () => u.pause(),
			resume: () => u.resume(),
			destroy: () => {
				u.scrollTrigger?.kill(), u.kill(), i();
			}
		};
	},
	reduced(e) {
		let t = w(e, ["transform"]), n = b();
		return n ? n.set(e, {
			x: 0,
			y: 0
		}) : e.style.transform = "none", {
			el: e,
			type: "parallax",
			pause() {},
			resume() {},
			destroy: t
		};
	},
	fallback(e) {
		let t = w(e, ["transform"]);
		return e.style.transform = "none", {
			el: e,
			type: "parallax",
			pause() {},
			resume() {},
			destroy() {
				t();
			}
		};
	}
}, ce = {
	create(e, t) {
		let n = d();
		if ((t.mode || t.preset) === "compass") {
			let r = h(Number(t.smoothing ?? t.ease ?? .08), .01, 1), i = Number(t.rotateOffset ?? 0), a = t.compassRange == null ? null : Number(t.compassRange), o = Number(t.sensitivity ?? 1), s = t.global ? window : e, c = w(e, ["transform", "willChange"]);
			e.style.willChange = "transform";
			let l = 0, u = 0, d = !0, f = null, m = t.gyro !== !1 && n.touch && n.hasGyro, g = (e) => {
				e.alpha != null && (l = -e.alpha * o);
			}, _ = (n) => {
				let r = e.getBoundingClientRect();
				if (!(!r.width || !r.height)) if (a != null) {
					let e = t.global ? {
						left: 0,
						width: window.innerWidth
					} : r;
					l = h(((n.clientX - e.left) / e.width - .5) * 2, -1, 1) * a * o;
				} else l = Math.atan2(n.clientY - (r.top + r.height / 2), n.clientX - (r.left + r.width / 2)) * 180 / Math.PI * o;
			}, v = () => {
				if (!d) return;
				let t = (l - u) % 360;
				t > 180 && (t -= 360), t < -180 && (t += 360), u += t * r, e.style.transform = `rotate(${(u + i).toFixed(3)}deg)`, f = requestAnimationFrame(v);
			};
			return m ? p().then((e) => {
				e && d && window.addEventListener("deviceorientation", g, { passive: !0 });
			}) : s.addEventListener("pointermove", _, { passive: !0 }), f = requestAnimationFrame(v), {
				el: e,
				type: "mouseParallax",
				pause: () => {
					d = !1, f != null && cancelAnimationFrame(f);
				},
				resume: () => {
					d || (d = !0, f = requestAnimationFrame(v));
				},
				destroy: () => {
					d = !1, f != null && cancelAnimationFrame(f), s.removeEventListener("pointermove", _), window.removeEventListener("deviceorientation", g), c();
				}
			};
		}
		let r = t.ease ?? .08, i = t.maxX ?? 40, a = t.maxY ?? 40, o = t.global ? window : e, s = t.gyro !== !1 && n.hasGyro && n.touch, c = Array.from(e.querySelectorAll("[data-mp-speed], [data-kt-mouse-speed]"));
		c.length || c.push(e);
		let l = c.map((e) => w(e, ["transform", "willChange"]));
		c.forEach((e) => {
			e.style.willChange = "transform";
		});
		let u = 0, f = 0, g = !0, _ = null, v = c.map(() => 0), y = c.map(() => 0), b = (n) => {
			let r = t.global ? {
				left: 0,
				top: 0,
				width: window.innerWidth,
				height: window.innerHeight
			} : e.getBoundingClientRect();
			!r.width || !r.height || (u = ((n.clientX - r.left) / r.width - .5) * 2, f = ((n.clientY - r.top) / r.height - .5) * 2);
		}, x = (e) => {
			u = h((e.gamma || 0) / 30, -1, 1), f = h((e.beta || 0) / 30, -1, 1);
		};
		s ? p().then((e) => {
			e && g && window.addEventListener("deviceorientation", x, { passive: !0 });
		}) : o.addEventListener("pointermove", b, { passive: !0 });
		let S = () => {
			g && (c.forEach((e, n) => {
				let o = Number(e.dataset.mpSpeed ?? e.dataset.ktMouseSpeed ?? t.speed ?? .05);
				v[n] = m(v[n], u * i * o, r), y[n] = m(y[n], f * a * o, r), e.style.transform = `translate3d(${v[n]}px, ${y[n]}px, 0)`;
			}), _ = requestAnimationFrame(S));
		};
		return _ = requestAnimationFrame(S), {
			el: e,
			type: "mouseParallax",
			pause: () => {
				g = !1, _ != null && cancelAnimationFrame(_);
			},
			resume: () => {
				g || (g = !0, _ = requestAnimationFrame(S));
			},
			destroy: () => {
				g = !1, _ != null && cancelAnimationFrame(_), o.removeEventListener("pointermove", b), window.removeEventListener("deviceorientation", x), l.forEach((e) => e());
			}
		};
	},
	reduced() {},
	fallback(e, t) {
		return this.create(e, {
			...t,
			gyro: !1
		});
	}
}, le = {
	fade: { opacity: 0 },
	"fade-up": {
		y: 40,
		opacity: 0
	},
	"fade-down": {
		y: -40,
		opacity: 0
	},
	"fade-left": {
		x: -40,
		opacity: 0
	},
	"fade-right": {
		x: 40,
		opacity: 0
	},
	"slide-up": {
		yPercent: 100,
		opacity: 0
	},
	"slide-down": {
		yPercent: -100,
		opacity: 0
	},
	"slide-left": {
		xPercent: -100,
		opacity: 0
	},
	"slide-right": {
		xPercent: 100,
		opacity: 0
	},
	zoom: {
		scale: .86,
		opacity: 0
	},
	"zoom-in": {
		scale: .78,
		opacity: 0
	},
	"zoom-out": {
		scale: 1.16,
		opacity: 0
	},
	blur: {
		filter: "blur(20px)",
		opacity: 0
	},
	rise: {
		y: 72,
		scale: .96,
		opacity: 0
	},
	soft: {
		y: 24,
		filter: "blur(8px)",
		opacity: 0
	},
	flip: {
		rotationX: -80,
		transformPerspective: 900,
		transformOrigin: "50% 100%",
		opacity: 0
	},
	"flip-x": {
		rotationX: -80,
		transformPerspective: 900,
		opacity: 0
	},
	"flip-y": {
		rotationY: -80,
		transformPerspective: 900,
		opacity: 0
	},
	rotate: {
		rotate: -8,
		scale: .92,
		opacity: 0
	},
	mask: {
		clipPath: "inset(0 100% 0 0)",
		opacity: 1
	},
	wipe: {
		clipPath: "inset(100% 0 0 0)",
		opacity: 1
	}
};
function ue(e, t) {
	let n = String(t.enterClass || t.activeClass || "is-inview").split(/\s+/).filter(Boolean);
	String(t.leaveClass || "").split(/\s+/).filter(Boolean).forEach((t) => e.classList.remove(t)), n.forEach((t) => e.classList.add(t)), t.onClassChange?.(!0, e);
}
function de(e, t) {
	let n = String(t.enterClass || t.activeClass || "is-inview").split(/\s+/).filter(Boolean), r = String(t.leaveClass || "").split(/\s+/).filter(Boolean);
	n.forEach((t) => e.classList.remove(t)), r.forEach((t) => e.classList.add(t)), t.onClassChange?.(!1, e);
}
var fe = {
	create(e, t = {}) {
		let n = b(), r = x(), i = t.preset || "fade-up", a = t.direction || "up", o = t.classOnly === !0 || i === "class", s = t.once !== !1, c = e.getAttribute("class");
		if (o) {
			let n = null, i = null, a = () => {
				ue(e, t), t.onEnter?.(e);
			}, o = () => {
				t.removeClassOnLeave !== !1 && (de(e, t), t.onLeave?.(e));
			};
			return r ? i = r.create({
				trigger: e,
				start: t.start || "top 85%",
				end: t.end || "bottom 15%",
				once: s,
				onEnter: a,
				onEnterBack: () => {
					a(), t.onEnterBack?.(e);
				},
				onLeave: o,
				onLeaveBack: () => {
					o(), t.onLeaveBack?.(e);
				}
			}) : s ? n = S(e, a, {
				threshold: Number(t.threshold ?? .1),
				rootMargin: t.rootMargin || "0px 0px -10% 0px"
			}) : typeof IntersectionObserver < "u" ? (n = new IntersectionObserver(([e]) => e.isIntersecting ? a() : o(), {
				threshold: Number(t.threshold ?? .1),
				rootMargin: t.rootMargin || "0px"
			}), n.observe(e)) : a(), {
				el: e,
				type: "reveal",
				replay() {
					de(e, t), requestAnimationFrame(a);
				},
				pause() {
					i?.disable?.(), n?.disconnect?.();
				},
				resume() {
					i?.enable?.();
				},
				destroy() {
					i?.kill?.(), n?.disconnect?.(), c == null ? e.removeAttribute("class") : e.setAttribute("class", c);
				}
			};
		}
		if (i === "clock") {
			let i = Number(t.startAngle ?? 0), a = t.clockDirection === "ccw", o = Math.max(.05, Number(t.duration ?? 1.4)), s = e.getAttribute("style"), c = (t) => {
				let n = h(t, 0, 1) * 360, r = a ? `conic-gradient(from ${i}deg, transparent 0deg ${360 - n}deg, #000 ${360 - n}deg)` : `conic-gradient(from ${i}deg, #000 ${n}deg, transparent ${n}deg)`;
				e.style.maskImage = r, e.style.webkitMaskImage = r, e.style.opacity = "1";
			};
			c(0);
			let l = null, u = null, d = null, f = () => {
				e.style.maskImage = "none", e.style.webkitMaskImage = "none", ue(e, t), t.onComplete?.(e);
			}, p = () => {
				let e = null, t = (n) => {
					e ??= n;
					let r = Math.min(1, (n - e) / (o * 1e3));
					c(r), r < 1 ? u = requestAnimationFrame(t) : f();
				};
				u = requestAnimationFrame(t);
			}, m = () => {
				if (n) {
					let e = { p: 0 };
					l = n.to(e, {
						p: 1,
						duration: o,
						delay: Number(t.delay ?? 0),
						ease: t.ease || "power1.inOut",
						onUpdate: () => c(e.p),
						onComplete: f
					});
				} else p();
			};
			return d = r ? r.create({
				trigger: e,
				start: t.start || "top 85%",
				once: !0,
				onEnter: m
			}) : S(e, m, { threshold: Number(t.threshold ?? .2) }), {
				el: e,
				type: "reveal",
				replay() {
					l?.kill?.(), u != null && cancelAnimationFrame(u), c(0), m();
				},
				pause() {
					l?.pause?.();
				},
				resume() {
					l?.resume?.();
				},
				destroy() {
					l?.kill?.(), u != null && cancelAnimationFrame(u), d?.kill?.(), d?.disconnect?.(), s == null ? e.removeAttribute("style") : e.setAttribute("style", s);
				}
			};
		}
		let l = i === "wipe" || i === "mask", u = (e) => {
			let t = `${(Math.max(0, Math.min(1, e)) * 100).toFixed(2)}%`;
			return a === "down" ? `inset(0px 0px ${t} 0px)` : a === "left" ? `inset(0px 0px 0px ${t})` : a === "right" ? `inset(0px ${t} 0px 0px)` : `inset(${t} 0px 0px 0px)`;
		}, d = le[i];
		if (l && (d = { opacity: 1 }), !d) return console.warn(`[Kineto/reveal] Unknown preset: ${i}`), null;
		if (!n || !r) return this.fallback(e, t, d);
		if (l) {
			let i = C(e, ["style", "class"]), a = Math.max(.05, Number(t.duration ?? .8)), o = t.ease || (t.spring === !0 ? "back.out(1.25)" : "power3.out");
			e.style.willChange = "clip-path";
			let c = { p: 1 }, l = () => {
				let t = c.p <= .002 ? "none" : u(c.p);
				e.style.clipPath = t, e.style.webkitClipPath = t;
			};
			l();
			let d = null, f = !1, p = () => {
				d?.kill(), c.p = 1, l(), d = n.to(c, {
					p: 0,
					duration: a,
					ease: o,
					delay: Number(t.delay ?? 0),
					onStart: () => ue(e, t),
					onUpdate: l,
					onComplete: () => {
						l(), t.onComplete?.(e);
					}
				});
			}, m = r.create({
				trigger: e,
				start: t.start || "top 85%",
				once: s,
				onEnter: () => {
					f || (f = !0, p());
				}
			}), h = null;
			return typeof IntersectionObserver < "u" && (h = new IntersectionObserver((e) => {
				!e.some((e) => e.isIntersecting) || f || (f = !0, h.disconnect(), h = null, m?.disable(!1), p());
			}, {
				threshold: .12,
				rootMargin: "0px 0px -8% 0px"
			}), h.observe(e)), {
				el: e,
				type: "reveal",
				replay() {
					f = !0, p();
				},
				pause() {
					d?.pause();
				},
				resume() {
					d?.resume();
				},
				destroy() {
					h?.disconnect(), m?.kill?.(), d?.kill(), i();
				}
			};
		}
		let f = t.stagger && e.children.length ? Array.from(e.children) : e, p = Array.isArray(f) ? f : [f], m = p.map((e) => C(e, ["style", "class"])), g = Math.max(0, Number(t.duration ?? .8)), _ = t.ease || (t.spring === !0 ? "back.out(1.25)" : "power3.out"), v = {
			x: 0,
			y: 0,
			xPercent: 0,
			yPercent: 0,
			scale: 1,
			rotation: 0,
			rotationX: 0,
			rotationY: 0,
			opacity: 1,
			filter: "blur(0px)",
			duration: g,
			delay: Number(t.delay ?? 0),
			ease: _,
			stagger: t.stagger || void 0,
			onStart: () => ue(e, t),
			onComplete: () => t.onComplete?.(e)
		}, y = {
			...v,
			scrollTrigger: {
				trigger: e,
				start: t.start || "top 85%",
				end: t.end,
				toggleActions: s ? "play none none none" : "play reverse play reverse",
				onEnter: () => t.onEnter?.(e),
				onLeave: () => {
					t.onLeave?.(e), !s && t.removeClassOnLeave !== !1 && de(e, t);
				},
				onEnterBack: () => {
					ue(e, t), t.onEnterBack?.(e);
				},
				onLeaveBack: () => {
					t.onLeaveBack?.(e), !s && t.removeClassOnLeave !== !1 && de(e, t);
				}
			}
		};
		p.forEach((e) => {
			e.style.willChange = "transform,opacity,filter,clip-path";
		});
		let w = n.fromTo(f, d, y), T = null;
		return typeof IntersectionObserver < "u" && (T = new IntersectionObserver((e) => {
			e.some((e) => e.isIntersecting) && (T.disconnect(), T = null, w.progress() === 0 && (w.scrollTrigger?.disable(!1), n.fromTo(f, d, {
				...v,
				delay: 0,
				overwrite: "auto"
			})));
		}, {
			threshold: .12,
			rootMargin: "0px 0px -8% 0px"
		}), T.observe(e)), {
			el: e,
			type: "reveal",
			replay() {
				n.fromTo(f, d, {
					...v,
					delay: 0,
					overwrite: "auto"
				});
			},
			pause() {
				w.pause();
			},
			resume() {
				w.resume();
			},
			destroy() {
				T?.disconnect(), w.scrollTrigger?.kill?.(), w.kill(), m.forEach((e) => e());
			}
		};
	},
	reduced(e) {
		let t = w(e, [
			"opacity",
			"transform",
			"filter",
			"clipPath"
		]);
		return e.style.opacity = "1", e.style.transform = "none", e.style.filter = "none", e.style.clipPath = "none", {
			el: e,
			type: "reveal",
			pause() {},
			resume() {},
			destroy: t
		};
	},
	fallback(e, t = {}, n = le["fade-up"]) {
		let r = C(e, ["style", "class"]), i = Number(n.x ?? 0), a = Number(n.y ?? 24), o = Number(n.scale ?? 1);
		e.style.opacity = String(n.opacity ?? 0), e.style.transform = `translate3d(${i}px,${a}px,0) scale(${o})`, n.filter && (e.style.filter = n.filter), n.clipPath && (e.style.clipPath = n.clipPath);
		let s = () => {
			let n = Math.max(0, Number(t.duration ?? .55));
			e.style.transition = `opacity ${n}s ease,transform ${n}s ease,filter ${n}s ease,clip-path ${n}s ease`, ue(e, t), requestAnimationFrame(() => {
				e.style.opacity = "1", e.style.transform = "none", e.style.filter = "none", e.style.clipPath = "inset(0)", t.onComplete?.(e);
			});
		}, c = S(e, s, {
			threshold: Number(t.threshold ?? .1),
			rootMargin: t.rootMargin || "0px 0px -10% 0px"
		});
		return {
			el: e,
			type: "reveal",
			replay() {
				e.style.opacity = String(n.opacity ?? 0), requestAnimationFrame(s);
			},
			pause() {},
			resume() {},
			destroy() {
				c.disconnect(), r();
			}
		};
	}
};
//#endregion
//#region src/modules/counter.js
function pe(e) {
	return e.format ? e.format : e.separator ? String(e.separator) : e.grouping === !0 || e.comma === !0 ? "," : "";
}
function me(e) {
	return e.animate ? e.animate([
		{ opacity: 1 },
		{ opacity: 1 },
		{ opacity: .15 },
		{ opacity: .15 }
	], {
		duration: 1e3,
		iterations: Infinity,
		easing: "steps(1,end)"
	}) : null;
}
function he(e) {
	let t = `var(--kt-counter-seam,${e.seamColor || "rgba(0,0,0,.5)"})`, n = e.shadow === !1 || e.shadow === "none" ? "none" : typeof e.shadow == "string" ? e.shadow : "drop-shadow(0 2px 5px rgba(0,0,0,.3))";
	return {
		seam: t,
		shadow: `var(--kt-counter-flip-shadow,${n})`,
		hasShadow: n !== "none",
		separatorColor: e.separatorColor || ""
	};
}
function ge(e, t, n) {
	if (!t) return;
	let r = document.createElement("span");
	r.className = n, r.textContent = t, e.appendChild(r);
}
function _e(e, t, n = "kt-counter-char") {
	let r = document.createElement("span");
	return r.className = n, r.textContent = t, r.style.display = "inline-block", e.appendChild(r), r;
}
function ve(e, t) {
	if (t.start === !1) return;
	let n = e.getBoundingClientRect();
	if (!(n.bottom > 0 && n.top < window.innerHeight)) return {
		trigger: e,
		start: t.start || "top 85%",
		toggleActions: t.once === !1 ? "play reverse play reverse" : "play none none none"
	};
}
var ye = {
	create(e, t) {
		let n = b(), r = e.innerHTML, i = e.getAttribute("style"), a = C(e, ["aria-label", "aria-live"]), o = t.mode || t.preset || t.style || "slot", s = Number(t.from ?? 0), c = Number.parseFloat((e.textContent || "").replace(/[^0-9.-]/g, "")), l = Number(t.to ?? (Number.isFinite(c) ? c : 0)), u = Math.max(0, Number(t.duration ?? 2)), d = Math.max(0, Number(t.decimals ?? 0)), f = t.prefix || "", p = t.suffix || "", m = {
			decimals: d,
			format: pe(t),
			locale: t.locale
		}, h = M(l, m), g = `${f}${h}${p}`, _ = ve(e, t), v = [];
		e.setAttribute("aria-label", g), e.setAttribute("aria-live", "polite");
		let y = (e) => (e && v.push(e), e), x = () => {
			v.forEach((e) => {
				e.scrollTrigger?.kill?.(), e.kill?.();
			}), v.length = 0;
		};
		if (o === "plain") {
			let r = { value: s }, i = () => {
				e.textContent = `${f}${M(r.value, m)}${p}`;
			};
			i(), n ? y(n.to(r, {
				value: l,
				duration: u,
				delay: Number(t.delay ?? 0),
				ease: t.ease || "power2.out",
				onUpdate: i,
				onComplete: () => t.onComplete?.(e),
				scrollTrigger: _
			})) : (r.value = l, i(), t.onComplete?.(e));
		} else if (o === "digit") {
			e.innerHTML = "", e.style.display = "inline-flex", e.style.alignItems = "baseline", ge(e, f, "kt-counter-prefix");
			let r = [];
			for (let t of h) /\d/.test(t) ? r.push({
				node: _e(e, "0", "kt-counter-digit"),
				target: Number(t)
			}) : _e(e, t, "kt-counter-separator");
			ge(e, p, "kt-counter-suffix");
			let i = Math.max(0, Number(t.loops ?? 2)), a = Math.max(0, Number(t.stagger ?? .06));
			if (n) {
				let o = n.timeline({
					delay: Number(t.delay ?? 0),
					scrollTrigger: _,
					onComplete: () => t.onComplete?.(e)
				});
				r.forEach(({ node: e, target: n }, r) => {
					let s = { value: 0 }, c = i * 10 + n, l = -1;
					o.to(s, {
						value: c,
						duration: Math.max(.05, u + r * a),
						ease: t.ease || "none",
						onUpdate: () => {
							let t = Math.floor(s.value) % 10;
							t !== l && (l = t, e.textContent = String(t));
						},
						onComplete: () => {
							e.textContent = String(n);
						}
					}, 0);
				}), y(o);
			} else r.forEach(({ node: e, target: t }) => {
				e.textContent = String(t);
			}), t.onComplete?.(e);
		} else if (o === "pop") {
			e.innerHTML = "", e.style.display = "inline-flex", e.style.alignItems = "baseline", ge(e, f, "kt-counter-prefix");
			let r = Array.from(h, (t) => _e(e, t, /\d/.test(t) ? "kt-counter-digit kt-counter-pop-char" : "kt-counter-separator kt-counter-pop-char"));
			ge(e, p, "kt-counter-suffix");
			let i = t.popAlign || "bottom", a = i === "top" ? "50% 0%" : i === "center" ? "50% 50%" : "50% 85%", o = Math.max(1, Number(t.popScale ?? 1.8)), s = Math.max(.1, u || .8), c = Math.min(.36, Math.max(.14, s * .38)), l = Math.max(.05, Number(t.popDuration ?? c)), d = r.length > 1 ? Math.max(.025, (s - l) / (r.length - 1)) : 0, m = Math.max(0, Number(t.stagger ?? d));
			if (n) {
				let i = n.timeline({
					delay: Number(t.delay ?? 0),
					scrollTrigger: _,
					onComplete: () => t.onComplete?.(e)
				});
				i.set(r, {
					opacity: 0,
					scale: o,
					transformOrigin: a
				}), r.forEach((e, n) => {
					i.to(e, {
						opacity: 1,
						scale: 1,
						duration: l,
						ease: t.ease || "back.out(2.2)",
						clearProps: "transform,opacity"
					}, n * m);
				}), y(i);
			} else r.forEach((e, t) => {
				e.style.opacity = "0", e.style.transformOrigin = a, e.style.transform = `scale(${o})`, e.style.transition = `opacity ${l}s ease ${t * m}s,transform ${l}s cubic-bezier(.2,.9,.3,1.25) ${t * m}s`, requestAnimationFrame(() => {
					e.style.opacity = "1", e.style.transform = "scale(1)";
				});
			}), setTimeout(() => t.onComplete?.(e), (l + m * r.length) * 1e3);
		} else if (o === "flip") {
			e.innerHTML = "", e.style.display = "inline-flex", e.style.alignItems = "center", e.style.gap = `${Math.max(0, Number(t.gap ?? 3))}px`, ge(e, f, "kt-counter-prefix");
			let n = t.tile !== !1, r = t.tileColor || "#191b20", i = t.tileTextColor || "#f6f7fb", a = Math.max(0, Number(t.tileRadius ?? 6)), o = "1.24em", c = he(t), d = [], m = t.bareBackground || "Canvas", g = (e) => `position:absolute;left:0;right:0;height:50%;overflow:hidden;${e ? "top:0;border-radius:" + (n ? `${a}px ${a}px 0 0` : "0") : "bottom:0;border-radius:" + (n ? `0 0 ${a}px ${a}px` : "0")};background:${n ? r : m};backface-visibility:hidden;`, _ = (e) => `position:absolute;left:0;width:100%;height:${o};line-height:${o};text-align:center;${e ? "top:0" : "bottom:0"};color:${n ? i : "inherit"};`, v = (e, t) => {
				let n = document.createElement("span");
				n.setAttribute("aria-hidden", "true"), n.style.cssText = g(e) + (t ? `transform-origin:50% ${e ? "100%" : "0%"};will-change:transform;z-index:3;` : "z-index:1;");
				let r = document.createElement("span");
				return r.style.cssText = _(e), r.textContent = "0", n.appendChild(r), {
					half: n,
					glyph: r
				};
			}, b = l >= s, x = h.replace(/\D/g, "").length, C = String(Math.round(Math.abs(s))).padStart(x, "0").slice(-x), w = 0;
			for (let t of h) {
				if (!/\d/.test(t)) {
					let r = document.createElement("span");
					r.className = "kt-counter-separator", r.textContent = t, n && (r.style.opacity = ".7"), e.appendChild(r);
					continue;
				}
				let r = Number(C[w] || "0");
				w += 1;
				let i = document.createElement("span");
				i.className = "kt-counter-flip-cell", i.style.cssText = `display:inline-block;position:relative;width:${n ? "1.34ch" : "1.12ch"};height:${o};perspective:340px;${n && c.hasShadow ? `filter:${c.shadow};` : ""}`;
				let a = v(!0, !1), s = v(!1, !1), l = v(!0, !0), u = v(!1, !0);
				if (u.half.style.transform = "rotateX(90deg)", i.append(a.half, s.half, l.half, u.half), n) {
					let e = document.createElement("span");
					e.className = "kt-counter-seam", e.setAttribute("aria-hidden", "true"), e.style.cssText = `position:absolute;left:0;right:0;top:50%;height:1px;margin-top:-0.5px;background:${c.seam};z-index:4;pointer-events:none;`, i.appendChild(e);
				}
				e.appendChild(i), d.push({
					topStatic: a,
					bottomStatic: s,
					topFlap: l,
					bottomFlap: u,
					target: Number(t),
					start: r
				});
			}
			ge(e, p, "kt-counter-suffix");
			let T = Math.max(0, Number(t.loops ?? 1)), E = /* @__PURE__ */ new Set(), D = !0, O = (e, t) => {
				let n = setTimeout(() => {
					E.delete(n), D && e();
				}, t);
				E.add(n);
			}, k = (e, t) => {
				e.topStatic.glyph.textContent = String(t), e.bottomStatic.glyph.textContent = String(t), e.topFlap.glyph.textContent = String(t), e.bottomFlap.glyph.textContent = String(t), e.topFlap.half.style.transform = "rotateX(0deg)", e.bottomFlap.half.style.transform = "rotateX(90deg)";
			}, A = (e) => n ? e.withFilter : e.plain, j = (e, t, n, r, i = !0) => {
				let a = Math.max(34, r / 2);
				if (i) {
					e.topStatic.glyph.textContent = String(n), e.bottomStatic.glyph.textContent = String(t), e.topFlap.glyph.textContent = String(t), e.bottomFlap.glyph.textContent = String(n), e.topFlap.half.style.transform = "rotateX(0deg)", e.bottomFlap.half.style.transform = "rotateX(90deg)";
					let r = A({
						withFilter: [{
							transform: "rotateX(0deg)",
							filter: "brightness(1)"
						}, {
							transform: "rotateX(-90deg)",
							filter: "brightness(.6)"
						}],
						plain: [{ transform: "rotateX(0deg)" }, { transform: "rotateX(-90deg)" }]
					}), i = A({
						withFilter: [{
							transform: "rotateX(90deg)",
							filter: "brightness(.6)"
						}, {
							transform: "rotateX(0deg)",
							filter: "brightness(1)"
						}],
						plain: [{ transform: "rotateX(90deg)" }, { transform: "rotateX(0deg)" }]
					});
					e.topFlap.half.animate(r, {
						duration: a,
						easing: "cubic-bezier(.55,0,.85,.5)",
						fill: "forwards"
					}), O(() => {
						e.bottomFlap.half.animate(i, {
							duration: a,
							easing: "cubic-bezier(.15,.6,.3,1.15)",
							fill: "forwards"
						}), O(() => {
							e.bottomStatic.glyph.textContent = String(n);
						}, a);
					}, a);
				} else {
					e.topStatic.glyph.textContent = String(t), e.bottomStatic.glyph.textContent = String(n), e.bottomFlap.glyph.textContent = String(t), e.topFlap.glyph.textContent = String(n), e.bottomFlap.half.style.transform = "rotateX(0deg)", e.topFlap.half.style.transform = "rotateX(-90deg)";
					let r = A({
						withFilter: [{
							transform: "rotateX(0deg)",
							filter: "brightness(1)"
						}, {
							transform: "rotateX(90deg)",
							filter: "brightness(.6)"
						}],
						plain: [{ transform: "rotateX(0deg)" }, { transform: "rotateX(90deg)" }]
					}), i = A({
						withFilter: [{
							transform: "rotateX(-90deg)",
							filter: "brightness(.6)"
						}, {
							transform: "rotateX(0deg)",
							filter: "brightness(1)"
						}],
						plain: [{ transform: "rotateX(-90deg)" }, { transform: "rotateX(0deg)" }]
					});
					e.bottomFlap.half.animate(r, {
						duration: a,
						easing: "cubic-bezier(.55,0,.85,.5)",
						fill: "forwards"
					}), O(() => {
						e.topFlap.half.animate(i, {
							duration: a,
							easing: "cubic-bezier(.15,.6,.3,1.15)",
							fill: "forwards"
						}), O(() => {
							e.topStatic.glyph.textContent = String(n);
						}, a);
					}, a);
				}
			}, M = () => {
				E.forEach(clearTimeout), E.clear(), D = !0;
				let n = Math.max(0, Number(t.stagger ?? .08)) * 1e3, r = 0;
				d.forEach((i, a) => {
					k(i, i.start);
					let o = b ? ((i.target - i.start) % 10 + 10) % 10 : ((i.start - i.target) % 10 + 10) % 10, s = T * 10 + o;
					if (s === 0) return;
					r += 1;
					let c = Math.max(120, u * 1e3 / Math.max(1, s));
					for (let o = 1; o <= s; o += 1) {
						let l = o === s, u = b ? (i.start + o - 1) % 10 : ((i.start - (o - 1)) % 10 + 10) % 10, d = b ? (i.start + o) % 10 : ((i.start - o) % 10 + 10) % 10;
						O(() => {
							j(i, u, d, c, b), l && (--r, r === 0 && O(() => t.onComplete?.(e), c));
						}, a * n + (o - 1) * c + Number(t.delay ?? 0) * 1e3);
					}
				});
			}, N = e.getBoundingClientRect(), P = t.start === !1 || N.bottom > 0 && N.top < window.innerHeight, F = null;
			P ? M() : F = S(e, M, { threshold: .3 }), y({
				restart: M,
				pause: () => {
					D = !1;
				},
				resume: () => {
					D = !0;
				},
				kill: () => {
					D = !1, E.forEach(clearTimeout), E.clear(), F?.disconnect();
				}
			});
		} else if (o === "clock") {
			e.innerHTML = "", e.style.display = "inline-flex", e.style.alignItems = "center", e.setAttribute("aria-live", "off");
			let n = getComputedStyle(e), r = Number.parseFloat(n.lineHeight), i = Number.parseFloat(n.fontSize), a = Math.max(1, Number(t.lineHeight ?? (Number.isFinite(r) ? r : Number.isFinite(i) ? i * 1.2 : 40))), o = t.seconds !== !1, s = t.hour12 === !0, c = String(t.clockSeparator ?? ":"), l = t.blink !== !1, u = t.clockStyle || "roll", d = Math.max(80, Number(t.rollDuration ?? .28) * 1e3), m = String(t.daysLabel ?? "d"), h = t.until ? new Date(t.until) : null, g = t.since ? new Date(t.since) : null, _ = !1, v = (e) => String(e).padStart(2, "0"), b = () => {
				if (h || g) {
					let n = h ? h.getTime() - Date.now() : Date.now() - g.getTime();
					h && n <= 0 && !_ && (_ = !0, t.onComplete?.(e)), n = Math.max(0, n);
					let r = Math.floor(n / 864e5), i = [v(Math.floor(n / 36e5) % 24), v(Math.floor(n / 6e4) % 60)];
					return o && i.push(v(Math.floor(n / 1e3) % 60)), {
						text: i.join(c),
						meridiem: "",
						days: r
					};
				}
				let n = /* @__PURE__ */ new Date(), r = n.getHours(), i = "";
				s && (i = r >= 12 ? "PM" : "AM", r = r % 12 || 12);
				let a = [v(r), v(n.getMinutes())];
				return o && a.push(v(n.getSeconds())), {
					text: a.join(c),
					meridiem: i,
					days: null
				};
			}, x = (e) => {
				let t = document.createElement("span");
				t.className = "kt-counter-digit kt-counter-clock-digit", t.style.cssText = `display:inline-block;overflow:hidden;height:${a}px;min-width:1ch;text-align:center;`;
				let n = document.createElement("span");
				n.style.cssText = "display:block;will-change:transform;";
				let r = document.createElement("span");
				return r.style.cssText = `display:block;height:${a}px;line-height:${a}px;`, r.textContent = e, n.appendChild(r), t.appendChild(n), {
					viewport: t,
					stack: n,
					value: e
				};
			}, S = he(t), C = {
				tile: t.tile !== !1,
				tileColor: t.tileColor || "#191b20",
				tileText: t.tileTextColor || "#f6f7fb",
				radius: Math.max(0, Number(t.tileRadius ?? 6)),
				bareBackground: t.bareBackground || "Canvas"
			}, w = (e) => {
				let t = C, n = "1.24em", r = (e) => `position:absolute;left:0;right:0;height:50%;overflow:hidden;${e ? "top:0;border-radius:" + (t.tile ? `${t.radius}px ${t.radius}px 0 0` : "0") : "bottom:0;border-radius:" + (t.tile ? `0 0 ${t.radius}px ${t.radius}px` : "0")};background:${t.tile ? t.tileColor : t.bareBackground};backface-visibility:hidden;`, i = (e) => `position:absolute;left:0;width:100%;height:${n};line-height:${n};text-align:center;${e ? "top:0" : "bottom:0"};color:${t.tile ? t.tileText : "inherit"};`, a = (t, n) => {
					let a = document.createElement("span");
					a.setAttribute("aria-hidden", "true"), a.style.cssText = r(t) + (n ? `transform-origin:50% ${t ? "100%" : "0%"};will-change:transform;z-index:3;` : "z-index:1;");
					let o = document.createElement("span");
					return o.style.cssText = i(t), o.textContent = e, a.appendChild(o), {
						half: a,
						glyph: o
					};
				}, o = document.createElement("span");
				o.className = "kt-counter-digit kt-counter-clock-digit kt-counter-flip-cell", o.style.cssText = `display:inline-block;position:relative;width:${t.tile ? "1.34ch" : "1.12ch"};height:1.24em;perspective:340px;${t.tile ? `${S.hasShadow ? `filter:${S.shadow};` : ""}margin:0 1px;` : ""}`;
				let s = {
					topStatic: a(!0, !1),
					bottomStatic: a(!1, !1),
					topFlap: a(!0, !0),
					bottomFlap: a(!1, !0)
				};
				if (s.bottomFlap.half.style.transform = "rotateX(90deg)", o.append(s.topStatic.half, s.bottomStatic.half, s.topFlap.half, s.bottomFlap.half), t.tile) {
					let e = document.createElement("span");
					e.className = "kt-counter-seam", e.setAttribute("aria-hidden", "true"), e.style.cssText = `position:absolute;left:0;right:0;top:50%;height:1px;margin-top:-0.5px;background:${S.seam};z-index:4;pointer-events:none;`, o.appendChild(e);
				}
				return {
					viewport: o,
					parts: s,
					value: e
				};
			}, T = (e, t) => {
				let n = e.value;
				e.value = t;
				let r = e.parts;
				if (!r.topFlap.half.animate) {
					[
						r.topStatic,
						r.bottomStatic,
						r.topFlap,
						r.bottomFlap
					].forEach((e) => {
						e.glyph.textContent = t;
					});
					return;
				}
				let i = Math.max(40, d * 1.5 / 2);
				r.topStatic.glyph.textContent = t, r.bottomStatic.glyph.textContent = n, r.topFlap.glyph.textContent = n, r.bottomFlap.glyph.textContent = t, r.topFlap.half.style.transform = "rotateX(0deg)", r.bottomFlap.half.style.transform = "rotateX(90deg)";
				let a = C.tile, o = a ? [{
					transform: "rotateX(0deg)",
					filter: "brightness(1)"
				}, {
					transform: "rotateX(-90deg)",
					filter: "brightness(.6)"
				}] : [{ transform: "rotateX(0deg)" }, { transform: "rotateX(-90deg)" }], s = a ? [{
					transform: "rotateX(90deg)",
					filter: "brightness(.6)"
				}, {
					transform: "rotateX(0deg)",
					filter: "brightness(1)"
				}] : [{ transform: "rotateX(90deg)" }, { transform: "rotateX(0deg)" }];
				r.topFlap.half.animate(o, {
					duration: i,
					easing: "cubic-bezier(.55,0,.85,.5)",
					fill: "forwards"
				}), setTimeout(() => {
					r.bottomFlap.half.animate(s, {
						duration: i,
						easing: "cubic-bezier(.15,.6,.3,1.15)",
						fill: "forwards"
					}), setTimeout(() => {
						r.bottomStatic.glyph.textContent = t;
					}, i);
				}, i);
			}, E = [], D = null, O = null, k = "", A = /* @__PURE__ */ new Set(), j = (e) => e != null && (e > 0 || t.showDays === !0), M = (e) => `${j(e.days) ? String(e.days).length : 0}|${e.text.length}`, N = (t) => {
				A.forEach((e) => e.cancel()), A.clear(), e.innerHTML = "", E = [], D = null, O = null, ge(e, f, "kt-counter-prefix"), j(t.days) && (O = document.createElement("span"), O.className = "kt-counter-days", O.style.cssText = "margin-right:.5ch;", O.textContent = `${t.days}${m}`, e.appendChild(O));
				for (let n of t.text) if (/\d/.test(n)) {
					let t = u === "flip" ? w(n) : x(n);
					e.appendChild(t.viewport), E.push(t);
				} else {
					let t = _e(e, n, "kt-counter-separator kt-counter-clock-separator");
					if (l) {
						let e = me(t);
						e && A.add(e);
					}
					E.push(null);
				}
				s && !h && !g && (D = document.createElement("span"), D.className = "kt-counter-suffix kt-counter-meridiem", D.style.cssText = "margin-left:.4ch;font-size:.55em;opacity:.75;align-self:center;", D.textContent = t.meridiem, e.appendChild(D)), ge(e, p, "kt-counter-suffix");
			}, P = (e, n) => {
				if (u === "flip") {
					T(e, n);
					return;
				}
				e.value = n;
				let r = e.stack.firstChild;
				if (u === "instant" || !e.stack.animate) {
					r.textContent = n;
					return;
				}
				if (u === "fade") {
					e.stack.animate([
						{ opacity: 1 },
						{
							opacity: 0,
							offset: .45
						},
						{
							opacity: 0,
							offset: .55
						},
						{ opacity: 1 }
					], {
						duration: d,
						easing: "ease"
					}), setTimeout(() => {
						r.textContent = n;
					}, d / 2);
					return;
				}
				let i = (t.rollDirection || (h ? "down" : "up")) === "down", o = document.createElement("span");
				if (o.style.cssText = `display:block;height:${a}px;line-height:${a}px;`, o.textContent = n, i) for (e.stack.insertBefore(o, e.stack.firstChild); e.stack.children.length > 2;) e.stack.lastChild.remove();
				else for (e.stack.appendChild(o); e.stack.children.length > 2;) e.stack.firstChild.remove();
				let s = e.stack.animate(i ? [{ transform: `translateY(-${a}px)` }, { transform: "translateY(0)" }] : [{ transform: "translateY(0)" }, { transform: `translateY(-${a}px)` }], {
					duration: d,
					easing: "cubic-bezier(.3,.7,.25,1)",
					fill: "forwards"
				});
				s.finished.catch(() => {}).finally(() => {
					e.stack.children.length > 1 && (i ? e.stack.lastChild.remove() : e.stack.firstChild.remove()), s.cancel?.();
				});
			}, F = (t) => {
				let n = j(t.days) ? `${t.days}${m} ` : "";
				e.setAttribute("aria-label", `${n}${t.text}${t.meridiem ? ` ${t.meridiem}` : ""}`);
			}, I = b();
			k = M(I), N(I), F(I);
			let L = !0, R = () => {
				if (!L) return;
				let e = b(), t = M(e);
				if (t !== k) k = t, N(e);
				else {
					if (Array.from(e.text).forEach((e, t) => {
						let n = E[t];
						n && n.value !== e && P(n, e);
					}), O) {
						let t = `${e.days}${m}`;
						O.textContent !== t && (O.textContent = t);
					}
					D && D.textContent !== e.meridiem && (D.textContent = e.meridiem);
				}
				F(e);
			}, z = setInterval(R, 250);
			y({
				kill: () => {
					L = !1, clearInterval(z), A.forEach((e) => e.cancel());
				},
				pause: () => {
					L = !1, clearInterval(z), A.forEach((e) => e.pause());
				},
				resume: () => {
					L || (L = !0, z = setInterval(R, 250)), A.forEach((e) => e.play());
				},
				restart: () => {
					L || (L = !0, z = setInterval(R, 250));
				}
			});
		} else {
			let r = getComputedStyle(e), i = Number.parseFloat(r.lineHeight), a = Number.parseFloat(r.fontSize), o = Number.isFinite(i) ? i : Number.isFinite(a) ? a * 1.2 : 40, c = Math.max(1, Number(t.lineHeight ?? o));
			e.innerHTML = "", e.style.display = "inline-flex", e.style.alignItems = "flex-end", e.style.overflow = "hidden", ge(e, f, "kt-counter-prefix");
			let d = h.replace(/\D/g, "").length, m = String(Math.round(Math.abs(s))).padStart(d, "0").slice(-d), g = l >= s, v = [], b = 0;
			for (let n of h) {
				if (!/\d/.test(n)) {
					_e(e, n, "kt-counter-separator");
					continue;
				}
				let r = Number(n), i = Number(m[b] || "0");
				b += 1;
				let a = Math.max(0, Number(t.loops ?? 3 + Math.floor(Math.random() * 2))), o = (g ? ((r - i) % 10 + 10) % 10 : ((i - r) % 10 + 10) % 10) + a * 10, s = document.createElement("span");
				s.className = "kt-counter-slot", s.style.cssText = `display:inline-block;overflow:hidden;height:${c}px;vertical-align:bottom;`;
				let l = document.createElement("span");
				l.className = "kt-counter-reel", l.style.cssText = "display:flex;flex-direction:column;will-change:transform;";
				let u = [];
				for (let e = 0; e <= o; e += 1) u.push(g ? (i + e) % 10 : ((i - e) % 10 + 10) % 10);
				g || u.reverse(), u.forEach((e) => {
					let t = document.createElement("span");
					t.textContent = String(e), t.style.cssText = `height:${c}px;line-height:${c}px;display:flex;align-items:center;justify-content:center;`, l.appendChild(t);
				}), s.appendChild(l), e.appendChild(s), v.push({
					reel: l,
					fromY: g ? 0 : -(o * c),
					toY: g ? -(o * c) : 0
				});
			}
			if (ge(e, p, "kt-counter-suffix"), n) {
				let r = n.timeline({
					delay: Number(t.delay ?? 0),
					scrollTrigger: _,
					onComplete: () => t.onComplete?.(e)
				});
				v.forEach(({ reel: e, fromY: n, toY: i }, a) => {
					r.fromTo(e, { y: n }, {
						y: i,
						duration: u + a * Number(t.stagger ?? .1),
						ease: t.ease || "power3.inOut"
					}, 0);
				}), y(r);
			} else v.forEach(({ reel: e, toY: t }) => {
				e.style.transform = `translateY(${t}px)`;
			}), t.onComplete?.(e);
		}
		return t.separatorColor && e.querySelectorAll(".kt-counter-separator").forEach((e) => {
			e.style.color = `var(--kt-counter-separator,${t.separatorColor})`;
		}), t.blinkSeparators === !0 && o !== "clock" && o !== "plain" && e.querySelectorAll(".kt-counter-separator").forEach((e) => {
			let t = me(e);
			t && y({
				kill: () => t.cancel(),
				pause: () => t.pause(),
				resume: () => t.play()
			});
		}), {
			el: e,
			type: "counter",
			replay: () => v.forEach((e) => e.restart?.()),
			pause: () => v.forEach((e) => e.pause?.()),
			resume: () => v.forEach((e) => e.resume?.()),
			destroy: () => {
				x(), e.innerHTML = r, i == null ? e.removeAttribute("style") : e.setAttribute("style", i), a();
			}
		};
	},
	reduced(e, t) {
		let n = e.innerHTML, r = e.getAttribute("style");
		if ((t.mode || t.preset || t.style || "slot") === "clock") {
			let i = String(t.clockSeparator ?? ":"), a = t.seconds !== !1, o = t.hour12 === !0, s = () => {
				let n = (e) => String(e).padStart(2, "0");
				if (t.until || t.since) {
					let r = t.until ? new Date(t.until) : new Date(t.since), o = Math.max(0, t.until ? r.getTime() - Date.now() : Date.now() - r.getTime()), s = Math.floor(o / 864e5), c = [n(Math.floor(o / 36e5) % 24), n(Math.floor(o / 6e4) % 60)];
					a && c.push(n(Math.floor(o / 1e3) % 60));
					let l = s > 0 || t.showDays === !0 ? `${s}${t.daysLabel ?? "d"} ` : "";
					e.textContent = `${t.prefix || ""}${l}${c.join(i)}${t.suffix || ""}`;
					return;
				}
				let r = /* @__PURE__ */ new Date(), s = r.getHours(), c = "";
				o && (c = s >= 12 ? " PM" : " AM", s = s % 12 || 12);
				let l = [n(s), n(r.getMinutes())];
				a && l.push(n(r.getSeconds())), e.textContent = `${t.prefix || ""}${l.join(i)}${c}${t.suffix || ""}`;
			};
			s();
			let c = setInterval(s, 1e3);
			return {
				el: e,
				type: "counter",
				pause() {},
				resume() {},
				destroy() {
					clearInterval(c), e.innerHTML = n, r == null ? e.removeAttribute("style") : e.setAttribute("style", r);
				}
			};
		}
		let i = Math.max(0, Number(t.decimals ?? 0)), a = Number.parseFloat((e.textContent || "").replace(/[^0-9.-]/g, "")), o = Number(t.to ?? (Number.isFinite(a) ? a : 0)), s = pe(t);
		return e.textContent = `${t.prefix || ""}${M(o, {
			decimals: i,
			format: s,
			locale: t.locale
		})}${t.suffix || ""}`, {
			el: e,
			type: "counter",
			pause() {},
			resume() {},
			destroy() {
				e.innerHTML = n, r == null ? e.removeAttribute("style") : e.setAttribute("style", r);
			}
		};
	}
}, be = /\.(?:gif|apng|webp)(?:$|[?#])/i;
function xe(e, t = {}) {
	return t.src || e.dataset.src || e.getAttribute("data-src") || e.currentSrc || e.getAttribute("src") || "";
}
function Se(e, t) {
	let n = Number(e ?? t);
	return Number.isFinite(n) ? n <= 30 ? n * 1e3 : n : t * 1e3;
}
function Ce(e, t, n) {
	let r = Math.max(1, Math.min(t || 300, n || 200)), i = (e) => e <= 1 ? Math.max(1, Math.round(1 / Math.max(.004, e))) : Math.round(e);
	if (Array.isArray(e.steps) && e.steps.length) {
		let t = e.steps.map(Number).filter((e) => Number.isFinite(e) && e > 0).map(i);
		if (t.length) return t.sort((e, t) => t - e);
	}
	let a = Math.max(2, Math.round(Number(e.pixelStepCount ?? e.stepCount ?? 8))), o = e.pixelStart != null || e.pixelEnd != null, s = o ? h(i(h(Number(e.pixelStart ?? .035), .004, 1)), 2, 200) : h(Math.round(r / 6), 20, 96), c = o ? i(h(Number(e.pixelEnd ?? 1), .01, 1)) : 1, l = [];
	for (let e = 0; e < a; e += 1) {
		let t = e / Math.max(1, a - 1), n = s * (Math.max(1, c) / s) ** +t, r = Math.max(c, Math.round(n));
		l.length && r >= l[l.length - 1] && (r = Math.max(c, l[l.length - 1] - 1)), l.push(r);
	}
	return l[l.length - 1] = c, l;
}
function we(e) {
	return e.length > 1 && e[e.length - 1] <= 1 ? e.slice(0, -1) : e.length ? e : [2];
}
function Te(e, t, n, r) {
	let i = Math.max(n / e, r / t), a = Math.min(e, n / i), o = Math.min(t, r / i);
	return {
		sx: (e - a) / 2,
		sy: (t - o) / 2,
		sw: a,
		sh: o
	};
}
function Ee(e, t) {
	let n = e.parentElement, r = !1, i = n?.getAttribute("style") ?? null;
	n?.classList.contains("kt-lazy-wrap") || (n = document.createElement("span"), n.className = "kt-lazy-wrap", e.parentNode?.insertBefore(n, e), n.appendChild(e), r = !0), getComputedStyle(n).position === "static" && (n.style.position = "relative"), n.style.overflow = "hidden", n.style.display = t.display || "block", n.style.lineHeight = "0";
	let a = n.parentElement?.getBoundingClientRect(), o = t.aspectRatio || e.getAttribute("data-aspect-ratio"), s = Number(e.getAttribute("width")), c = Number(e.getAttribute("height"));
	return n.style.width = "100%", o ? n.style.aspectRatio = String(o).replace(":", " / ") : s > 0 && c > 0 ? n.style.aspectRatio = `${s} / ${c}` : r && a && a.height > 2 ? n.style.height = "100%" : n.getBoundingClientRect().height < 2 && (n.style.aspectRatio = "16 / 9"), t.height && (n.style.height = typeof t.height == "number" ? `${t.height}px` : String(t.height)), {
		wrapper: n,
		created: r,
		originalWrapperStyle: i
	};
}
function De(e, t, n = 2) {
	let r = document.createElement("span");
	return r.className = t, r.setAttribute("aria-hidden", "true"), r.style.cssText = `position:absolute;inset:0;z-index:${n};display:block;overflow:hidden;pointer-events:none;border-radius:inherit;`, e.appendChild(r), r;
}
function Oe(e, t, n = {}) {
	let r = document.createElement("img");
	r.className = "kt-lazy-live-image", r.alt = "", r.setAttribute("aria-hidden", "true"), r.loading = "eager", r.decoding = "async", n.crossOrigin && (r.crossOrigin = n.crossOrigin);
	let i = n.srcset || t.getAttribute("data-srcset") || t.getAttribute("srcset"), a = n.sizes || t.getAttribute("sizes");
	return i && (r.srcset = i), a && (r.sizes = a), r.src = e, r.style.cssText = `display:block;width:100%;height:100%;object-fit:${n.objectFit || "cover"};object-position:${n.objectPosition || "50% 50%"};`, r;
}
function ke(e, t, n = 4) {
	let r = document.createElement("canvas");
	r.className = "kt-lazy-noise", r.setAttribute("aria-hidden", "true"), r.width = Math.max(32, Number(t.noiseWidth ?? 128)), r.height = Math.max(18, Number(t.noiseHeight ?? 72)), r.style.cssText = `position:absolute;inset:0;width:100%;height:100%;z-index:${n};pointer-events:none;mix-blend-mode:${t.noiseBlend || "soft-light"};opacity:0;border-radius:inherit;`, e.appendChild(r);
	let i = r.getContext("2d", { alpha: !0 }), a = 0, o = 0, s = 1e3 / h(Number(t.noiseFps ?? 24), 4, 60);
	return {
		canvas: r,
		draw: (e = performance.now()) => {
			if (!i || e - a < s) return;
			a = e;
			let n = i.createImageData(r.width, r.height), c = h(Number(t.noiseContrast ?? 1), .1, 3);
			for (let e = 0; e < n.data.length; e += 4) {
				let t = (Math.random() - .5) * 255 * c + 128, r = h(Math.round(t), 0, 255);
				n.data[e] = r, n.data[e + 1] = r, n.data[e + 2] = r, n.data[e + 3] = 255;
			}
			i.putImageData(n, 0, 0), o += 1, r.dataset.frames = String(o);
		}
	};
}
function Ae(e, t, n = 8, r = !1) {
	let i = h(t * 100, 0, 100), a = h(Number(n), 0, 30), o = h(i - a, 0, 100), s = h(i + a, 0, 100), c = e === "up" ? "to top" : e === "left" ? "to left" : e === "right" ? "to right" : "to bottom";
	return r ? `linear-gradient(${c}, transparent 0%, transparent ${o}%, #000 ${s}%, #000 100%)` : `linear-gradient(${c}, #000 0%, #000 ${o}%, transparent ${s}%, transparent 100%)`;
}
function je(e, t, n) {
	return new Promise((r, i) => {
		let a = new Image();
		a.decoding = "async", n.crossOrigin && (a.crossOrigin = n.crossOrigin);
		let o = n.srcset || t.getAttribute("data-srcset") || t.getAttribute("srcset");
		o && (a.srcset = o), a.onload = () => r(a), a.onerror = () => i(/* @__PURE__ */ Error(`Kineto lazy image failed to load: ${e}`)), a.src = e, a.complete && a.naturalWidth && r(a);
	});
}
var Me = {
	create(e, t = {}) {
		let n = t.preset || t.effect || "fade", r = n === "noise" ? "dissolve" : n === "zoom" ? "blur-up" : n, i = xe(e, t);
		if (!i) return null;
		let a = {
			style: e.getAttribute("style"),
			src: e.getAttribute("src"),
			srcset: e.getAttribute("srcset"),
			sizes: e.getAttribute("sizes"),
			loading: e.getAttribute("loading"),
			decoding: e.getAttribute("decoding")
		}, { wrapper: o, created: s, originalWrapperStyle: c } = Ee(e, t);
		e.loading = t.nativeLazy === !1 ? "eager" : "lazy", e.decoding = "async", e.style.display = "block", e.style.width = "100%", e.style.height = "100%", e.style.objectFit = t.objectFit || "cover", e.style.objectPosition = t.objectPosition || "50% 50%";
		let l = [], u = /* @__PURE__ */ new Set(), d = null, f = null, p = !1, m = !1, g = !1, _ = null, v = (e, t) => {
			let n = setTimeout(() => {
				u.delete(n), p || e();
			}, Math.max(0, Number(t) || 0));
			return u.add(n), n;
		}, y = () => {
			l.splice(0).forEach((e) => e.remove()), _?.canvas.remove(), _ = null;
		}, b = () => {
			let n = t.srcset || e.getAttribute("data-srcset");
			n && (e.srcset = n), t.sizes && (e.sizes = t.sizes), e.loading = "eager", e.src = i, e.style.opacity = "1", e.style.filter = "none", e.style.transform = "none", e.style.clipPath = "none", e.style.maskImage = "none", e.style.webkitMaskImage = "none";
		}, x = () => {
			b(), y(), t.onProgress?.(1, e), t.onLoad?.(e);
		}, C = () => {
			let n = t.skeletonVariant || t.variant || "shimmer", r = De(o, `kt-lazy-skeleton kt-lazy-skeleton-${n}`, 5), i = t.skeletonColor || "color-mix(in srgb, currentColor 9%, transparent)", a = t.skeletonHighlight || "rgba(255,255,255,.45)", s = Math.max(.3, Number(t.skeletonSpeed ?? 1.5));
			if (r.style.backgroundColor = i, n === "pulse" ? r.style.animation = `kt-skeleton-pulse ${s}s ease-in-out infinite` : (r.style.backgroundImage = `linear-gradient(${Number(t.skeletonAngle ?? 100)}deg,transparent 32%,${a} 50%,transparent 68%)`, r.style.backgroundSize = "250% 100%", r.style.animation = `kt-shimmer ${s}s cubic-bezier(.4,.2,.6,.8) infinite`), t.skeletonIcon !== !1) {
				let e = document.createElement("span");
				e.className = "kt-lazy-skeleton-icon", e.setAttribute("aria-hidden", "true"), e.style.cssText = "position:absolute;left:50%;top:50%;width:15%;max-width:64px;min-width:28px;aspect-ratio:1;transform:translate(-50%,-50%);opacity:.32;", e.innerHTML = "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.6\" stroke-linecap=\"round\" stroke-linejoin=\"round\" style=\"width:100%;height:100%\"><rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"3\"/><circle cx=\"8.8\" cy=\"8.8\" r=\"1.9\"/><path d=\"m21 15.2-3.6-3.6a1.8 1.8 0 0 0-2.6 0L6 21\"/></svg>", r.appendChild(e);
			}
			return l.push(r), e.style.opacity = "0", r;
		}, w = async () => {
			if (g || p) return;
			g = !0;
			let n = performance.now(), s;
			try {
				s = await je(i, e, t);
			} catch (n) {
				y(), t.fallbackSrc ? e.src = t.fallbackSrc : a.src == null ? e.removeAttribute("src") : e.setAttribute("src", a.src), e.style.opacity = "1", t.onError?.(n, e);
				return;
			}
			let c = Math.max(0, Number(t.minDuration ?? 0)) - (performance.now() - n);
			if (c > 0 && await new Promise((e) => v(e, c)), !p) {
				if (r === "skeleton") {
					let n = l[0] || C();
					b();
					let r = Math.max(0, Number(t.fadeDuration ?? t.duration ?? .45));
					e.style.transform = "scale(1.015)", e.style.transition = `opacity ${r}s ease, transform ${Math.max(r, .5)}s cubic-bezier(.22,.8,.3,1)`, n.style.animation = "none", n.style.transition = `opacity ${Math.min(Math.max(r * .5, .18), .32)}s ease`, requestAnimationFrame(() => {
						e.style.opacity = "1", e.style.transform = "scale(1)", n.style.opacity = "0";
					}), v(y, r * 1e3 + 60), t.onLoad?.(e, s);
					return;
				}
				if (r === "fade") {
					e.src = i, e.style.transition = "none", e.style.opacity = "0", e.offsetWidth, e.style.transition = `opacity ${Math.max(0, Number(t.duration ?? .7))}s ${t.ease || "ease"}`, requestAnimationFrame(() => {
						e.style.opacity = "1";
					}), t.onLoad?.(e, s);
					return;
				}
				if (r === "blur-up") {
					e.src = i, e.style.transition = "none", e.style.opacity = "1", e.style.filter = `blur(${Math.max(0, Number(t.blur ?? 18))}px)`, e.style.transform = `scale(${Math.max(1, Number(t.startScale ?? 1.06))})`;
					let n = Math.max(0, Number(t.duration ?? .85));
					e.offsetWidth, requestAnimationFrame(() => {
						e.style.transition = `filter ${n}s ease,transform ${n}s cubic-bezier(.22,.8,.3,1)`, e.style.filter = "blur(0px)", e.style.transform = "scale(1)";
					}), t.onLoad?.(e, s);
					return;
				}
				if (r === "polaroid") {
					e.src = i;
					let n = t.frame !== !1, r = null;
					if (n) {
						r = De(o, "kt-lazy-polaroid-frame", 6);
						let e = "clamp(6px, 4.5%, 18px)";
						r.style.cssText += `border:${e} solid ${t.frameColor || "#fbfaf7"};border-bottom-width:calc(${e} * 3.2);box-shadow:inset 0 0 8px rgba(0,0,0,.12);`, l.push(r);
					}
					let a = Math.max(.2, Number(t.duration ?? 2.4));
					e.style.transition = "none", e.style.opacity = "1", e.style.filter = "brightness(2.1) saturate(.05) contrast(.72) sepia(.28) blur(7px)", e.style.transform = `rotate(${Number(t.rotate ?? -2)}deg) scale(.965)`, o.style.transition = "none", e.offsetWidth, requestAnimationFrame(() => requestAnimationFrame(() => {
						e.style.transition = `filter ${a}s cubic-bezier(.3,.1,.25,1),transform ${Math.min(a, 1.1)}s cubic-bezier(.34,1.4,.44,1)`, e.style.filter = "none", e.style.transform = "none";
					})), v(() => {
						t.keepFrame === !0 ? (b(), t.onLoad?.(e, s)) : x();
					}, a * 1e3 + 120);
					return;
				}
				if (r === "crt") {
					e.src = i;
					let n = Math.max(.3, Number(t.duration ?? 1.1));
					e.style.opacity = "1", e.style.transformOrigin = "center", e.style.willChange = "transform, filter, opacity", e.style.animation = `kt-lazy-crt ${n}s cubic-bezier(.2,.7,.2,1) both`;
					let r = De(o, "kt-lazy-crt-beam", 7);
					r.style.cssText += `pointer-events:none;top:50%;bottom:auto;height:2px;transform:translateY(-50%);background:linear-gradient(90deg,transparent,rgba(255,255,255,.85) 16%,#fff 50%,rgba(255,255,255,.85) 84%,transparent);box-shadow:0 0 12px 2px rgba(255,255,255,.5);animation:kt-lazy-crt-beam ${n}s ease-out both;`, l.push(r);
					let a = De(o, "kt-lazy-crt-bloom", 8);
					if (a.style.cssText += `pointer-events:none;background:#fff;animation:kt-lazy-crt-bloom ${n}s ease-out both;`, l.push(a), t.frame !== !1) {
						let e = De(o, "kt-lazy-crt-scan", 5);
						e.style.cssText += `pointer-events:none;background:repeating-linear-gradient(to bottom,rgba(0,0,0,.09) 0,rgba(0,0,0,.09) 1px,transparent 1px,transparent 3px);mix-blend-mode:multiply;opacity:0;animation:kt-lazy-crt-scan ${n}s ease both;`, l.push(e);
						let t = De(o, "kt-lazy-crt-roll", 6);
						t.style.cssText += `pointer-events:none;top:0;bottom:auto;height:60%;background:linear-gradient(to bottom,transparent 0%,rgba(0,0,0,.18) 35%,rgba(0,0,0,.28) 50%,rgba(0,0,0,.18) 65%,transparent 100%);filter:blur(3px);animation:kt-lazy-crt-roll ${n}s linear both;`, l.push(t);
					}
					v(() => {
						e.style.animation = "", e.style.willChange = "", x();
					}, n * 1e3 + 160);
					return;
				}
				if (r === "pixelate") {
					e.src = i, e.style.opacity = "1";
					let n = De(o, "kt-lazy-pixelate-layer", 3), r = document.createElement("canvas");
					r.className = "kt-lazy-pixelate-canvas", r.style.cssText = "position:absolute;inset:0;width:100%;height:100%;display:block;", n.appendChild(r), l.push(n);
					let a = r.getContext("2d", {
						alpha: !0,
						desynchronized: !0
					}), c = document.createElement("canvas"), u = c.getContext("2d", { alpha: !0 }), d = o.getBoundingClientRect(), g = we(Ce(t, d.width, d.height)), _ = Math.max(0, Number(t.stepDuration ?? 0)), y = _ > 0 ? _ * g.length : Se(t.duration, 1.25), b = Math.max(0, Number(t.delay ?? 100)), S = Math.max(0, Number(t.holdDuration ?? 0)), C = h(Number(t.maxDpr ?? 2), .5, 4), w = 1e3 / h(Number(t.renderFps ?? 60), 4, 120), T = 0, E = 0, D = () => {
						let e = o.getBoundingClientRect();
						T = Math.max(1, e.width), E = Math.max(1, e.height);
						let t = h(window.devicePixelRatio || 1, 1, C), n = Math.max(1, Math.round(T * t)), i = Math.max(1, Math.round(E * t));
						(r.width !== n || r.height !== i) && (r.width = n, r.height = i), a.setTransform(t, 0, 0, t, 0, 0);
					}, O = (t) => {
						let n = e.complete && e.naturalWidth ? e : s, r = n.naturalWidth, i = n.naturalHeight;
						if (!r || !i) return;
						let o = Math.max(1, Math.ceil(T / Math.max(1, t))), l = Math.max(1, Math.ceil(E / Math.max(1, t)));
						(c.width !== o || c.height !== l) && (c.width = o, c.height = l);
						let d = Te(r, i, T, E);
						u.clearRect(0, 0, o, l), u.imageSmoothingEnabled = !0;
						try {
							u.drawImage(n, d.sx, d.sy, d.sw, d.sh, 0, 0, o, l);
						} catch {
							return;
						}
						a.clearRect(0, 0, T, E), a.imageSmoothingEnabled = !1, a.drawImage(c, 0, 0, o, l, 0, 0, T, E);
					}, k = null, A = null, j = -Infinity, M = -1, N = (n) => {
						if (p) return;
						if (m) {
							A ??= n, f = requestAnimationFrame(N);
							return;
						}
						A != null && k != null && (k += n - A, A = null), k ??= n;
						let r = h((n - k) / Math.max(1, y), 0, 1), i = r >= 1 ? g.length - 1 : Math.min(g.length - 1, Math.floor(r * g.length));
						for (; M < i;) M += 1, D(), O(g[M]), j = n, t.onProgress?.(h((M + 1) / (g.length + 1), 0, 1), e);
						if (r >= 1) {
							v(x, S);
							return;
						}
						n - j >= w && (D(), O(g[i]), j = n), f = requestAnimationFrame(N);
					};
					D(), O(g[0]), v(() => {
						f = requestAnimationFrame(N);
					}, b);
					return;
				}
				if (r === "flicker") {
					e.src = i, e.style.opacity = "1";
					let n = De(o, "kt-lazy-flicker-layer", 3);
					n.style.background = t.flickerBackground || "#000";
					let r = document.createElement("canvas");
					r.style.cssText = "position:absolute;inset:0;width:100%;height:100%;display:block;", n.appendChild(r), l.push(n);
					let a = r.getContext("2d", { alpha: !1 }), c = Math.max(120, Se(t.duration, 1.15)), u = h(Number(t.glitchStrength ?? 1), .1, 3), d = Math.max(2, Math.round(Number(t.sliceCount ?? 7))), g = Math.max(0, Number(t.delay ?? 60)), _ = null, y = null, b = () => {
						let e = o.getBoundingClientRect(), n = h(window.devicePixelRatio || 1, 1, h(Number(t.maxDpr ?? 2), .5, 4)), i = Math.max(1, Math.round(e.width * n)), a = Math.max(1, Math.round(e.height * n));
						(r.width !== i || r.height !== a) && (r.width = i, r.height = a);
					}, S = (t) => {
						let n = e.complete && e.naturalWidth ? e : s;
						if (!n.naturalWidth) return;
						let i = r.width, o = r.height, c = Te(n.naturalWidth, n.naturalHeight, i, o);
						if (a.fillStyle = "#000", a.fillRect(0, 0, i, o), Math.random() < (1 - t) * .28) return;
						let l = (1 - t) * u;
						a.globalAlpha = 1;
						for (let e = 0; e < d; e += 1) {
							let t = Math.floor(e / d * o), r = Math.ceil(o / d), s = Math.round((Math.random() - .5) * i * .12 * l * (Math.random() < .4 ? 1 : .15));
							a.drawImage(n, c.sx, c.sy + t / o * c.sh, c.sw, r / o * c.sh, s, t, i, r);
						}
						l > .15 && Math.random() < .6 && (a.globalAlpha = .18 * l, a.drawImage(n, c.sx, c.sy, c.sw, c.sh, Math.round(8 * l), 0, i, o), a.globalAlpha = 1);
					}, C = (n) => {
						if (p) return;
						if (m) {
							y ??= n, f = requestAnimationFrame(C);
							return;
						}
						y != null && _ != null && (_ += n - y, y = null), _ ??= n;
						let r = h((n - _) / c, 0, 1);
						b(), S(r), t.onProgress?.(r, e), r < 1 ? f = requestAnimationFrame(C) : x();
					};
					v(() => {
						f = requestAnimationFrame(C);
					}, g);
					return;
				}
				if (r === "print" || r === "dissolve") {
					e.src = i, e.style.opacity = "0";
					let n = De(o, `kt-lazy-${r}-base`, 2), a = Oe(i, e, t);
					n.appendChild(a), l.push(n);
					let s = null, c = null, u = null;
					r === "print" && (s = De(o, "kt-lazy-print-sharp", 3), c = Oe(i, e, t), s.appendChild(c), l.push(s), u = De(o, "kt-lazy-print-edge", 5), u.style.mixBlendMode = "soft-light", l.push(u)), _ = ke(o, t, 4);
					let d = Math.max(50, Se(t.duration, r === "print" ? 2.2 : 1.55)), g = Math.max(0, Number(t.delay ?? 100)), y = Math.max(0, Number(t.blur ?? 16)), b = h(Number(t.noise ?? (r === "print" ? .3 : .48)), 0, 1), S = t.direction || "down", C = Number(t.feather ?? (r === "print" ? 12 : 8)), w = null, T = null, E = (n) => {
						if (p) return;
						if (m) {
							T ??= n, f = requestAnimationFrame(E);
							return;
						}
						T != null && w != null && (w += n - T, T = null), w ??= n;
						let i = h((n - w) / d, 0, 1), o = 1 - (1 - i) ** 2.2;
						if (_.draw(n), r === "print") {
							let e = i < .5 ? 2 * i * i : 1 - (-2 * i + 2) ** 2 / 2, n = y * (1 - i * .45);
							a.style.filter = `blur(${n}px) contrast(${1 + (1 - i) * .1}) brightness(${1 + (1 - i) * .06})`, s.style.maskImage = Ae(S, e, C, !1), s.style.webkitMaskImage = s.style.maskImage, _.canvas.style.maskImage = Ae(S, e, C, !0), _.canvas.style.webkitMaskImage = _.canvas.style.maskImage, _.canvas.style.opacity = String(b * (1 - i * .5));
							let r = S === "up" ? "to top" : S === "left" ? "to left" : S === "right" ? "to right" : "to bottom", o = h(e * 100, 0, 100), c = h(Number(t.edgeWidth ?? 9), 2, 30);
							u.style.opacity = i >= 1 ? "0" : "1", u.style.background = `linear-gradient(${r}, transparent ${h(o - c, 0, 100)}%, rgba(255,255,255,${h(Number(t.edgeOpacity ?? .5), 0, 1)}) ${o}%, transparent ${h(o + c * .4, 0, 100)}%)`;
						} else a.style.filter = `blur(${y * (1 - o)}px) contrast(${1 + (1 - o) * .22})`, _.canvas.style.opacity = String(b * (1 - o) ** 1.2);
						t.onProgress?.(i, e), i < 1 ? f = requestAnimationFrame(E) : x();
					};
					v(() => {
						f = requestAnimationFrame(E);
					}, g);
					return;
				}
				b(), t.onLoad?.(e, s);
			}
		};
		return r === "skeleton" ? C() : [
			"blur-up",
			"polaroid",
			"pixelate"
		].includes(r) || (e.style.opacity = "0"), d = S(e, w, {
			threshold: Number(t.threshold ?? .05),
			rootMargin: t.rootMargin || "200px 0px"
		}), {
			el: e,
			type: "lazy",
			get animatedMedia() {
				return t.animated === !0 || be.test(i);
			},
			replay() {
				y(), g = !1, r === "skeleton" && C(), w();
			},
			pause() {
				m = !0;
			},
			resume() {
				m = !1;
			},
			destroy() {
				p = !0, m = !1, d?.disconnect(), f != null && cancelAnimationFrame(f), u.forEach(clearTimeout), u.clear(), y(), s && o.parentNode ? (o.parentNode.insertBefore(e, o), o.remove()) : s || (c == null ? o.removeAttribute("style") : o.setAttribute("style", c));
				let t = (t, n) => n == null ? e.removeAttribute(t) : e.setAttribute(t, n);
				t("style", a.style), t("src", a.src), t("srcset", a.srcset), t("sizes", a.sizes), t("loading", a.loading), t("decoding", a.decoding);
			}
		};
	},
	reduced(e, t = {}) {
		let n = e.getAttribute("style"), r = e.getAttribute("src"), i = xe(e, t);
		return i && (e.src = i), e.style.opacity = "1", e.style.filter = "none", e.style.transform = "none", {
			el: e,
			type: "lazy",
			pause() {},
			resume() {},
			destroy() {
				n == null ? e.removeAttribute("style") : e.setAttribute("style", n), r == null ? e.removeAttribute("src") : e.setAttribute("src", r);
			}
		};
	}
}, Ne = {
	rise: {
		from: {
			y: "110%",
			opacity: 0
		},
		to: {
			y: 0,
			opacity: 1
		},
		wrap: !0
	},
	wave: {
		from: {
			y: 30,
			opacity: 0
		},
		to: {
			y: 0,
			opacity: 1
		}
	},
	fade: {
		from: { opacity: 0 },
		to: { opacity: 1 }
	},
	spin: {
		from: {
			rotateY: -95,
			opacity: 0,
			y: 8
		},
		to: {
			rotateY: 0,
			opacity: 1,
			y: 0
		}
	},
	flip: {
		from: {
			rotateX: -90,
			opacity: 0,
			y: 10
		},
		to: {
			rotateX: 0,
			opacity: 1,
			y: 0
		}
	},
	scale: {
		from: {
			scale: .4,
			opacity: 0
		},
		to: {
			scale: 1,
			opacity: 1
		}
	},
	blur: {
		from: {
			opacity: 0,
			filter: "blur(10px)",
			y: 12
		},
		to: {
			opacity: 1,
			filter: "blur(0px)",
			y: 0
		}
	},
	"slide-up": {
		from: {
			y: "0.9em",
			opacity: 0
		},
		to: {
			y: 0,
			opacity: 1
		}
	},
	"slide-down": {
		from: {
			y: "-0.9em",
			opacity: 0
		},
		to: {
			y: 0,
			opacity: 1
		}
	}
}, Pe = {
	"slide-up": {
		y: "-0.7em",
		opacity: 0
	},
	"slide-down": {
		y: "0.7em",
		opacity: 0
	},
	fade: { opacity: 0 },
	blur: {
		opacity: 0,
		filter: "blur(8px)"
	},
	scale: {
		scale: .6,
		opacity: 0
	},
	flip: {
		rotateX: 90,
		opacity: 0
	},
	spin: {
		rotateY: 95,
		opacity: 0
	}
};
function Fe(e, t, n, r) {
	let i = [], a = (t) => {
		let n = document.createElement("span");
		if (n.style.display = "inline-block", n.style.transformStyle = "preserve-3d", n.style.backfaceVisibility = "hidden", n.setAttribute("aria-hidden", "true"), n.textContent = t, r) {
			let t = document.createElement("span");
			t.style.cssText = "display:inline-block;overflow:hidden;vertical-align:bottom;", t.appendChild(n), e.appendChild(t);
		} else e.appendChild(n);
		i.push(n);
	};
	return n === "word" ? t.split(/(\s+)/).forEach((t) => {
		t && (/^\s+$/.test(t) ? e.appendChild(document.createTextNode(t)) : a(t));
	}) : j(t).forEach((t) => {
		/^\s$/.test(t) ? e.appendChild(document.createTextNode(t)) : a(t);
	}), i;
}
var Ie = {
	create(e, t) {
		let n = b(), r = x();
		if (!n || !r) return null;
		let i = t.by || "char", a = typeof t.animation == "string" && Ne[t.animation] ? t.animation : Ne[t.preset] ? t.preset : "rise", o = Ne[a], s = e.innerHTML, c = C(e, ["aria-label"]), l = e.textContent || "", u = w(e, [
			"overflow",
			"perspective",
			"display",
			"minHeight"
		]), d = Array.isArray(t.texts) && t.texts.length ? t.texts.map(String) : null, f = Number(t.duration ?? .8), p = Number(t.stagger ?? .03), m = t.ease || "power3.out";
		e.setAttribute("aria-label", d ? d.join(", ") : l), e.innerHTML = "", (a === "spin" || a === "flip") && (e.style.perspective = `${Number(t.perspective ?? 600)}px`);
		let h = Fe(e, d ? d[0] : l, i, o.wrap && !d), g = null, _ = null, v = 0, y = !0, S = (r) => (g?.kill(), g = n.fromTo(h, { ...o.from }, {
			...o.to,
			duration: f,
			delay: Number(t.delay ?? 0),
			ease: a === "wave" ? t.ease || "back.out(2.2)" : m,
			stagger: p,
			overwrite: !0,
			onComplete: () => {
				t.onComplete?.(e), r?.();
			}
		}), g), T = Math.max(200, Number(t.hold ?? t.pause ?? 2e3)), E = Pe[t.swapOut] || Pe["slide-up"], D = () => {
			!d || d.length < 2 || !y || (clearTimeout(_), _ = setTimeout(() => {
				y && (g?.kill(), g = n.to(h, {
					...E,
					duration: Math.min(.45, f),
					ease: t.swapEase || "power2.in",
					stagger: Math.min(.02, p),
					overwrite: !0,
					onComplete: () => {
						y && (v = (v + 1) % d.length, e.innerHTML = "", h = Fe(e, d[v], i, !1), t.onSwap?.(v, d[v], e), S(D));
					}
				}));
			}, T));
		}, O = !1, k = r.create({
			trigger: e,
			start: t.start || "top 85%",
			onEnter: () => {
				O && t.once !== !1 || (O = !0, S(d ? D : null));
			},
			onLeaveBack: () => {
				t.once === !1 && (O = !1, clearTimeout(_), g?.kill(), n.set(h, { ...o.from }));
			}
		});
		return n.set(h, { ...o.from }), {
			el: e,
			type: "textSplit",
			get units() {
				return h;
			},
			replay: () => {
				clearTimeout(_), g?.kill(), d && (v = 0, e.innerHTML = "", h = Fe(e, d[0], i, !1)), n.set(h, { ...o.from }), S(d ? D : null);
			},
			pause: () => {
				g?.pause(), clearTimeout(_);
			},
			resume: () => {
				g?.resume(), d && !g?.isActive() && D();
			},
			destroy: () => {
				y = !1, clearTimeout(_), k.kill(), g?.kill(), e.innerHTML = s, c(), u();
			}
		};
	},
	reduced(e) {
		let t = w(e, ["opacity", "transform"]);
		return e.style.opacity = "1", e.style.transform = "none", {
			el: e,
			type: "textSplit",
			pause() {},
			resume() {},
			destroy: t
		};
	}
}, Le = {
	create(e, t) {
		let n = b(), r = x(), i = e.innerHTML, a = C(e, ["aria-label"]), o = e.textContent || "";
		e.setAttribute("aria-label", o), e.innerHTML = "";
		let s = j(o).map((t) => {
			if (/^\s$/.test(t)) return e.appendChild(document.createTextNode(t)), null;
			let n = document.createElement("span");
			return n.style.cssText = "display:inline-block;filter:blur(8px);opacity:0;will-change:filter,opacity;", n.setAttribute("aria-hidden", "true"), n.textContent = t, e.appendChild(n), n;
		}).filter(Boolean), c = t.duration ?? .6, l = t.stagger ?? .03, u = null, d = null, f = /* @__PURE__ */ new Set(), p = () => {
			f.forEach(clearTimeout), f.clear();
		}, m = () => {
			if (p(), !s.length) {
				t.onComplete?.();
				return;
			}
			s.forEach((e, n) => {
				let r = setTimeout(() => {
					f.delete(r), e.style.transition = `filter ${c}s ease, opacity ${c}s ease`, e.style.filter = "blur(0)", e.style.opacity = "1", n === s.length - 1 && t.onComplete?.();
				}, l * n * 1e3);
				f.add(r);
			});
		};
		return n && r ? d = n.to(s, {
			filter: "blur(0px)",
			opacity: 1,
			duration: c,
			stagger: l,
			ease: t.ease || "power2.out",
			onComplete: t.onComplete,
			scrollTrigger: {
				trigger: e,
				start: t.start || "top 85%",
				toggleActions: t.once === !1 ? "play reverse play reverse" : "play none none none"
			}
		}) : u = S(e, m, { threshold: .1 }), {
			el: e,
			type: "blurText",
			replay: () => {
				if (d) {
					d.restart();
					return;
				}
				s.forEach((e) => {
					e.style.filter = "blur(8px)", e.style.opacity = "0";
				}), m();
			},
			pause: () => d?.pause(),
			resume: () => d?.resume(),
			destroy: () => {
				u?.disconnect(), p(), d?.scrollTrigger?.kill(), d?.kill(), e.innerHTML = i, a();
			}
		};
	},
	reduced(e) {
		let t = w(e, ["opacity", "filter"]);
		return e.style.opacity = "1", e.style.filter = "none", {
			el: e,
			type: "blurText",
			pause() {},
			resume() {},
			destroy: t
		};
	}
};
//#endregion
//#region src/modules/shuffle.js
function Re(e, t) {
	return e.length && e[Math.floor(Math.random() * e.length)] || t;
}
var ze = {
	create(e, t) {
		let n = t.text ?? e.textContent ?? "", r = e.innerHTML, i = C(e, ["aria-label"]), a = String(t.chars || "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*"), o = Math.max(12, Number(t.speed ?? 34)), s = Math.max(1, Number(t.revealRate ?? 2)), c = P({
			rainbow: t.rainbow,
			rainbowColors: t.rainbowColors,
			scrambleFade: t.scrambleFade
		}), l = j(n), u = 0, d = 0, f = !0, p = !1, m = null, h = null;
		e.setAttribute("aria-label", n);
		let g = [], _ = () => (e.innerHTML = "", g = l.map((t) => {
			if (/^\s$/.test(t)) return e.appendChild(document.createTextNode(t)), null;
			let n = document.createElement("span");
			return n.setAttribute("aria-hidden", "true"), n.style.cssText = "display:inline-block;text-align:center;", n.textContent = t, e.appendChild(n), n;
		}), g.forEach((e) => {
			e && (e.style.width = `${Math.ceil(e.getBoundingClientRect().width * 100) / 100}px`);
		}), g), v = () => {
			g.forEach((e, t) => {
				e && (t < u ? (e.textContent = l[t], c?.clear(e)) : (e.textContent = Re(a, l[t]), c?.paint(e)));
			});
		}, y = () => {
			p = !1, g.forEach((e, t) => {
				e && (e.textContent = l[t], c?.clear(e));
			}), t.onComplete?.(e);
		}, b = () => {
			if (!(!f || !p)) {
				if (v(), d += 1, d % s === 0 && (u += 1), u >= l.length) {
					y();
					return;
				}
				m = setTimeout(b, o);
			}
		}, x = () => {
			clearTimeout(m), u = 0, d = 0, f = !0, p = !0, _(), v(), m = setTimeout(b, o);
		};
		return h = S(e, x, {
			threshold: Number(t.threshold ?? .2),
			rootMargin: t.rootMargin || "0px 0px -5% 0px"
		}), {
			el: e,
			type: "shuffle",
			replay: x,
			pause: () => {
				f = !1, clearTimeout(m);
			},
			resume: () => {
				f || !p || (f = !0, b());
			},
			destroy: () => {
				f = !1, p = !1, clearTimeout(m), h?.disconnect(), e.innerHTML = r, i();
			}
		};
	},
	reduced(e) {
		e.textContent = e.getAttribute("aria-label") || e.textContent;
	}
}, Be = {
	create(e, t) {
		let n = e.innerHTML, r = C(e, ["aria-label"]), i = Array.isArray(t.strings) ? t.strings.map(String) : t.strings == null ? [e.textContent || ""] : [String(t.strings)], a = Number(t.typeSpeed ?? 60), o = Number(t.eraseSpeed ?? 30), s = Number(t.pauseAfter ?? 1500), c = t.loop !== !1, l = t.caret !== !1, u = String(t.caretChar ?? "|"), d = t.hangul === !0 || t.compose === !0;
		e.setAttribute("aria-label", i.join(", ")), e.innerHTML = `<span class="kt-tw-text" aria-hidden="true"></span>${l ? `<span class="kt-tw-caret" aria-hidden="true">${u}</span>` : ""}`;
		let f = e.querySelector(".kt-tw-text"), p = 0, m = 0, h = 0, g = !1, _ = !0, v = null, y = (e) => d ? A(e) : [e], b = () => {
			if (!_) return;
			let n = j(i[p]);
			if (g) --m, h = 0, f.textContent = n.slice(0, Math.max(0, m)).join(""), m <= 0 ? (g = !1, p = (p + 1) % i.length, v = setTimeout(b, a)) : v = setTimeout(b, o);
			else {
				let r = n.slice(0, m).join("");
				if (m >= n.length) {
					if (f.textContent = r, !c && p === i.length - 1) {
						t.onComplete?.(e);
						return;
					}
					v = setTimeout(() => {
						g = !0, b();
					}, s);
					return;
				}
				let o = y(n[m]);
				f.textContent = r + o[Math.min(h, o.length - 1)], h += 1, h >= o.length && (h = 0, m += 1), v = setTimeout(b, d ? Math.max(16, a * .72) : a);
			}
		};
		return b(), {
			el: e,
			type: "typewriter",
			replay: () => {
				clearTimeout(v), p = 0, m = 0, h = 0, g = !1, _ = !0, f.textContent = "", b();
			},
			pause: () => {
				_ = !1, clearTimeout(v);
			},
			resume: () => {
				_ || (_ = !0, b());
			},
			destroy: () => {
				_ = !1, clearTimeout(v), e.innerHTML = n, r();
			}
		};
	},
	reduced(e, t) {
		let n = e.innerHTML, r = Array.isArray(t.strings) ? t.strings : t.strings == null ? [e.textContent] : [t.strings];
		return e.textContent = String(r[0] ?? ""), {
			el: e,
			type: "typewriter",
			pause() {},
			resume() {},
			destroy() {
				e.innerHTML = n;
			}
		};
	}
}, Ve = {
	create(e, t) {
		let n = e.innerHTML, r = C(e, ["aria-label"]), i = String(t.text ?? e.textContent ?? ""), a = t.mode || t.preset || "stream", o = Number(t.speed ?? (a === "stream" ? 30 : a === "hangul" ? 80 : 100)), s = Number(t.delay ?? 0), c = b(), l = /* @__PURE__ */ new Set(), u = [], d = null, f = !0, p = !1;
		e.setAttribute("aria-label", i), e.innerHTML = "";
		let m = (e, t) => {
			let n = setTimeout(() => {
				l.delete(n), f && e();
			}, t);
			return l.add(n), n;
		}, h = () => {
			l.forEach(clearTimeout), l.clear(), u.forEach((e) => e.kill?.()), u.length = 0;
		}, g = (e, t = {}) => {
			let n = document.createElement("span");
			return n.textContent = e, n.setAttribute("aria-hidden", "true"), n.style.display = "inline-block", Object.assign(n.style, t), n;
		}, _ = () => t.onComplete?.(e), v = () => {
			let t = j(i), n = 0, r = g("");
			e.appendChild(r);
			let a = () => {
				if (n >= t.length) {
					r.remove(), _();
					return;
				}
				let e = t[n];
				if (/^\s$/.test(e)) {
					r.before(document.createTextNode(e)), n += 1, m(a, o);
					return;
				}
				let i = A(e), s = 0, c = () => {
					r.textContent = i[s], s += 1, s < i.length ? m(c, o) : (r.before(g(e)), r.textContent = "", n += 1, m(a, o));
				};
				c();
			};
			m(a, s * 1e3);
		}, y = () => {
			let n = j(i).map((t) => {
				if (/^\s$/.test(t)) return e.appendChild(document.createTextNode(t)), null;
				let n = g(t, {
					opacity: "0",
					transformOrigin: "bottom"
				});
				return e.appendChild(n), n;
			}).filter(Boolean);
			c ? (c.set(n, {
				y: 20,
				scaleY: .5,
				opacity: 0
			}), u.push(c.to(n, {
				y: 0,
				scaleY: 1,
				opacity: 1,
				duration: Number(t.duration ?? .8),
				stagger: Number(t.stagger ?? .04),
				ease: t.ease || "elastic.out(1, 0.4)",
				delay: s,
				onComplete: _
			}))) : n.forEach((e, r) => m(() => {
				e.style.transition = "opacity .4s ease, transform .4s ease", e.style.opacity = "1", e.style.transform = "none", r === n.length - 1 && _();
			}, s * 1e3 + r * Number(t.stagger ?? .04) * 1e3));
		}, x = () => {
			let n;
			n = a === "word" ? i.split(/(\s+)/) : a === "line" ? i.split(/(\n)/) : j(i);
			let r = [];
			n.forEach((t) => {
				if (!t) return;
				if (/^\s+$/.test(t)) {
					e.appendChild(document.createTextNode(t));
					return;
				}
				let n = g("", {
					overflow: "hidden",
					verticalAlign: "bottom",
					paddingBottom: "2px"
				}), i = g(t, {
					opacity: "0",
					transform: "translateY(100%)"
				});
				n.appendChild(i), e.appendChild(n), r.push(i);
			}), c ? u.push(c.to(r, {
				y: "0%",
				opacity: 1,
				duration: Number(t.duration ?? .6),
				stagger: Number(t.stagger ?? .05),
				ease: t.ease || "power3.out",
				delay: s,
				onComplete: _
			})) : r.forEach((e, n) => m(() => {
				e.style.transition = "opacity .5s ease, transform .5s ease", e.style.opacity = "1", e.style.transform = "translateY(0)", n === r.length - 1 && _();
			}, s * 1e3 + n * Number(t.stagger ?? .05) * 1e3));
		}, w = () => {
			let n = String(t.chars || "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789<>/\\|=+*#"), r = P({
				rainbow: t.rainbow,
				rainbowColors: t.rainbowColors,
				scrambleFade: t.scrambleFade
			}), a = Math.max(1, Math.round(Number(t.flickerCount ?? 3))), c = Math.max(200, Number(t.hold ?? 1400)), l = j(i).map((t) => {
				if (/^\s$/.test(t)) return {
					span: g("\xA0", { width: "0.45em" }),
					char: t,
					space: !0
				};
				let n = g(t, { visibility: "hidden" });
				return e.appendChild(n), {
					span: n,
					char: t,
					space: !1
				};
			});
			l.forEach(({ span: t, space: n }) => {
				n && e.appendChild(t);
			}), e.innerHTML = "", l.forEach(({ span: t }) => e.appendChild(t));
			let u = 0, d = () => {
				if (!f) return;
				if (u >= l.length) {
					_(), t.loop === !0 && m(() => {
						l.forEach(({ span: e, space: t }) => {
							t || (e.style.visibility = "hidden");
						}), u = 0, m(d, o);
					}, c);
					return;
				}
				let e = l[u];
				if (u += 1, e.space) {
					m(d, o * .6);
					return;
				}
				e.span.style.visibility = "visible";
				let i = 0, s = () => {
					f && (i < a ? (e.span.textContent = n[Math.floor(Math.random() * n.length)], r?.paint(e.span), i += 1, m(s, Math.max(16, o * .45))) : (e.span.textContent = e.char, r?.clear(e.span), m(d, o)));
				};
				s();
			};
			m(d, s * 1e3);
		}, T = () => {
			let n = Math.max(.1, Number(t.duration ?? .9)) * 1e3, r = j(i).map((t) => {
				if (/^\s$/.test(t)) return e.appendChild(document.createTextNode(t)), null;
				let n = g(t, { opacity: "0" });
				return e.appendChild(n), n;
			}).filter(Boolean), a = (e, t = !0) => {
				let r = 2 + Math.floor(Math.random() * 3), i = [{ opacity: 0 }];
				for (let e = 0; e < r; e += 1) i.push({
					opacity: 1,
					offset: Math.min(.92, (e + .4) / (r + 1))
				}), i.push({
					opacity: Math.random() * .25,
					offset: Math.min(.96, (e + .8) / (r + 1))
				});
				i.push({ opacity: +!!t });
				let a = e.animate(i, {
					duration: n * (.55 + Math.random() * .7),
					delay: Math.random() * n * .6 + s * 1e3,
					easing: "steps(1, end)",
					fill: "both"
				});
				return u.push(a), a;
			}, o = 0;
			if (r.forEach((e) => {
				a(e).finished.then(() => {
					o += 1, o === r.length && _();
				}).catch(() => {});
			}), t.flickerLoop === !0) {
				let e = () => {
					if (!f) return;
					let t = r[Math.floor(Math.random() * r.length)];
					if (t) {
						let e = t.animate([
							{ opacity: 1 },
							{
								opacity: .15,
								offset: .3
							},
							{
								opacity: 1,
								offset: .5
							},
							{
								opacity: .4,
								offset: .7
							},
							{ opacity: 1 }
						], {
							duration: 260 + Math.random() * 240,
							easing: "steps(1, end)"
						});
						u.push(e);
					}
					m(e, 500 + Math.random() * 1800);
				};
				m(e, n + 600);
			}
		}, E = () => {
			p || !f || (p = !0, a === "hangul" ? v() : a === "bounce" ? y() : a === "decode" ? w() : a === "flicker" ? T() : x());
		};
		d = S(e, E, {
			threshold: Number(t.threshold ?? .2),
			rootMargin: t.rootMargin || "0px"
		});
		let D = () => {
			h(), e.innerHTML = "", f = !0, p = !1, E();
		};
		return {
			el: e,
			type: "textReveal",
			replay: D,
			pause: () => {
				f = !1, l.forEach(clearTimeout), u.forEach((e) => e.pause?.());
			},
			resume: () => {
				f || (f = !0, u.length ? u.forEach((e) => e.resume?.()) : D());
			},
			destroy: () => {
				f = !1, d?.disconnect(), h(), e.innerHTML = n, r();
			}
		};
	},
	reduced(e, t) {
		let n = e.innerHTML;
		return e.textContent = String(t.text ?? e.getAttribute("aria-label") ?? e.textContent ?? ""), {
			el: e,
			type: "textReveal",
			pause() {},
			resume() {},
			destroy() {
				e.innerHTML = n;
			}
		};
	}
}, He = {
	"slide-up": {
		enter: [{
			transform: "translateY(0.9em)",
			opacity: 0
		}, {
			transform: "translateY(0)",
			opacity: 1
		}],
		leave: [{
			transform: "translateY(0)",
			opacity: 1
		}, {
			transform: "translateY(-0.7em)",
			opacity: 0
		}]
	},
	slide: null,
	rise: {
		enter: [{
			transform: "translateY(110%)",
			opacity: 0
		}, {
			transform: "translateY(0)",
			opacity: 1
		}],
		leave: [{
			transform: "translateY(0)",
			opacity: 1
		}, {
			transform: "translateY(-110%)",
			opacity: 0
		}],
		clip: !0
	},
	fade: {
		enter: [{ opacity: 0 }, { opacity: 1 }],
		leave: [{ opacity: 1 }, { opacity: 0 }]
	},
	blur: {
		enter: [{
			opacity: 0,
			filter: "blur(14px)"
		}, {
			opacity: 1,
			filter: "blur(0px)"
		}],
		leave: [{
			opacity: 1,
			filter: "blur(0px)"
		}, {
			opacity: 0,
			filter: "blur(12px)"
		}]
	},
	scale: {
		enter: [{
			opacity: 0,
			transform: "scale(.82)"
		}, {
			opacity: 1,
			transform: "scale(1)"
		}],
		leave: [{
			opacity: 1,
			transform: "scale(1)"
		}, {
			opacity: 0,
			transform: "scale(1.12)"
		}]
	},
	clip: {
		enter: [{
			clipPath: "inset(0 100% 0 0)",
			webkitClipPath: "inset(0 100% 0 0)"
		}, {
			clipPath: "inset(0 0 0 0)",
			webkitClipPath: "inset(0 0 0 0)"
		}],
		leave: [{
			clipPath: "inset(0 0 0 0)",
			webkitClipPath: "inset(0 0 0 0)"
		}, {
			clipPath: "inset(0 0 0 100%)",
			webkitClipPath: "inset(0 0 0 100%)"
		}]
	}
};
He.slide = He["slide-up"];
var Ue = {
	create(e, t) {
		let n = e.innerHTML, r = e.getAttribute("style"), i = Array.isArray(t.texts) ? t.texts.map(String) : null;
		if (!i) {
			let t = Array.from(e.children).map((e) => e.textContent.trim()).filter(Boolean);
			i = t.length ? t : [String(e.textContent || "").trim()].filter(Boolean);
		}
		if (!i.length) return null;
		let a = t.effect || t.preset || "slide-up", o = He[a] || a === "shimmer" || a === "dissolve" ? a : "slide-up", s = o === "dissolve", c = Math.max(0, Number(t.blur ?? 14));
		He.blur.enter[0].filter = `blur(${c}px)`, He.blur.leave[1].filter = `blur(${Math.round(c * .85)}px)`, He.scale.enter[0].transform = `scale(${Math.max(.1, Number(t.startScale ?? .82))})`, He.scale.leave[1].transform = `scale(${Math.max(.1, Number(t.endScale ?? 1.12))})`;
		let l = Math.max(50, Number(t.duration ?? .55) * (Number(t.duration ?? .55) <= 20 ? 1e3 : 1)), u = Math.max(0, Number(t.pause ?? t.hold ?? 1600)), d = t.loop !== !1, f = t.charMode === !0 || s, p = Math.max(0, Number(t.stagger ?? .035)) * 1e3, m = Math.max(0, Number(t.jitter ?? 5));
		if (e.innerHTML = "", e.style.display = "block", e.style.position = getComputedStyle(e).position === "static" ? "relative" : e.style.position, t.minHeight ? e.style.minHeight = typeof t.minHeight == "number" ? `${t.minHeight}px` : String(t.minHeight) : e.style.minHeight = "1.3em", o === "shimmer") {
			let a = document.createElement("span");
			a.textContent = i[0];
			let o = t.baseColor || "currentColor", s = t.shimColor || "rgba(160,205,255,1)";
			a.style.cssText = `display:inline-block;background-image:linear-gradient(100deg,${o} 38%,${s} 50%,${o} 62%);background-size:220% 100%;-webkit-background-clip:text;background-clip:text;color:transparent;-webkit-text-fill-color:transparent;`, e.appendChild(a);
			let c = a.animate([{ backgroundPosition: "160% 0" }, { backgroundPosition: "-160% 0" }], {
				duration: Math.max(600, Number(t.shimSpeed ?? 2.4) * 1e3),
				iterations: Infinity,
				easing: "linear"
			});
			return {
				el: e,
				type: "textTransition",
				get index() {
					return 0;
				},
				setText(e) {
					a.textContent = String(e);
				},
				next() {},
				replay() {
					c.currentTime = 0, c.play();
				},
				pause: () => c.pause(),
				resume: () => c.play(),
				destroy: () => {
					c.cancel(), e.innerHTML = n, r == null ? e.removeAttribute("style") : e.setAttribute("style", r);
				}
			};
		}
		let h = s ? He.fade : He[o], g = document.createElement("span");
		g.style.cssText = `display:block;${h.clip ? "overflow:hidden;" : ""}`;
		let _ = document.createElement("span");
		_.style.cssText = "display:block;will-change:transform,opacity,filter;", _.setAttribute("aria-live", t.ariaLive || "polite"), g.appendChild(_), e.appendChild(g);
		let v = 0, y = !0, b = null, x = /* @__PURE__ */ new Set(), S = (e, t, n) => {
			let r = e.animate(t, {
				fill: "forwards",
				...n
			});
			return x.add(r), r.finished.catch(() => {}).finally(() => x.delete(r)), r;
		}, C = () => {
			clearTimeout(b), b = null, x.forEach((e) => e.cancel()), x.clear();
		}, w = () => {
			clearTimeout(b), !(!y || i.length < 2) && (b = setTimeout(A, u));
		}, T = (e) => {
			f ? (_.innerHTML = "", j(e).forEach((e) => {
				if (/^\s$/.test(e)) {
					_.appendChild(document.createTextNode(e));
					return;
				}
				let t = document.createElement("span");
				t.style.cssText = "display:inline-block;will-change:transform,opacity;", t.textContent = e, _.appendChild(t);
			})) : _.textContent = e;
		}, E = () => Array.from(_.querySelectorAll("span")), D = (e) => {
			let t = (Math.random() - .5) * m * 2, n = (Math.random() - .5) * m * 1.4;
			return e ? [
				{
					opacity: 0,
					transform: `translate(${t}px,${n}px)`
				},
				{
					opacity: .85,
					transform: `translate(${(-t * .6).toFixed(1)}px,${(-n * .6).toFixed(1)}px)`,
					offset: .45
				},
				{
					opacity: .3,
					transform: `translate(${(t * .4).toFixed(1)}px,${(n * .3).toFixed(1)}px)`,
					offset: .62
				},
				{
					opacity: 1,
					transform: "translate(0,0)"
				}
			] : [
				{
					opacity: 1,
					transform: "translate(0,0)"
				},
				{
					opacity: .25,
					transform: `translate(${(t * .5).toFixed(1)}px,${(n * .4).toFixed(1)}px)`,
					offset: .35
				},
				{
					opacity: .8,
					transform: `translate(${(-t * .4).toFixed(1)}px,${(-n * .5).toFixed(1)}px)`,
					offset: .55
				},
				{
					opacity: 0,
					transform: `translate(${t}px,${n}px)`
				}
			];
		}, O = (e) => {
			if (f) {
				let n = E(), r = 0;
				if (!n.length) {
					e?.();
					return;
				}
				n.forEach((i, a) => {
					S(i, s ? D(!0) : h.enter, {
						duration: l,
						delay: s ? Math.random() * l * .5 : a * Math.min(p, 900 / Math.max(1, n.length)),
						easing: s ? `steps(${2 + Math.floor(Math.random() * 3)}, end)` : typeof t.ease == "string" && t.ease.includes("(") ? t.ease : "cubic-bezier(.22,.8,.3,1)"
					}).finished.then(() => {
						r += 1, r === n.length && e?.();
					}).catch(() => {});
				});
			} else S(_, h.enter, {
				duration: l,
				easing: "cubic-bezier(.22,.8,.3,1)"
			}).finished.then(() => e?.()).catch(() => {});
		}, k = (e) => {
			if (f) {
				let t = E().reverse(), n = 0;
				if (!t.length) {
					e?.();
					return;
				}
				t.forEach((r, i) => {
					S(r, s ? D(!1) : h.leave, {
						duration: l * .55,
						delay: s ? Math.random() * l * .35 : i * Math.min(p * .6, 500 / Math.max(1, t.length)),
						easing: s ? `steps(${2 + Math.floor(Math.random() * 3)}, end)` : "cubic-bezier(.5,0,.75,.4)"
					}).finished.then(() => {
						n += 1, n === t.length && e?.();
					}).catch(() => {});
				});
			} else S(_, h.leave, {
				duration: l * .55,
				easing: "cubic-bezier(.5,0,.75,.4)"
			}).finished.then(() => e?.()).catch(() => {});
		}, A = () => {
			if (!y) return;
			let n = v + 1;
			if (!d && n >= i.length) {
				t.onComplete?.(e);
				return;
			}
			k(() => {
				y && (v = n % i.length, T(i[v]), t.onChange?.(v, i[v], e), O(w));
			});
		};
		return T(i[0]), O(w), {
			el: e,
			type: "textTransition",
			get index() {
				return v;
			},
			next: () => {
				clearTimeout(b), A();
			},
			replay: () => {
				C(), y = !0, v = 0, T(i[0]), O(w);
			},
			pause: () => {
				y = !1, clearTimeout(b), x.forEach((e) => e.pause());
			},
			resume: () => {
				y || (y = !0, x.forEach((e) => e.play()), x.size || w());
			},
			destroy: () => {
				y = !1, C(), e.innerHTML = n, r == null ? e.removeAttribute("style") : e.setAttribute("style", r);
			}
		};
	},
	reduced(e) {
		let t = Array.from(e.children), n = t.map((e) => e.getAttribute("style"));
		return t.forEach((e, t) => {
			e.style.display = t === 0 ? "" : "none";
		}), {
			el: e,
			type: "textTransition",
			pause() {},
			resume() {},
			destroy() {
				t.forEach((e, t) => {
					n[t] == null ? e.removeAttribute("style") : e.setAttribute("style", n[t]);
				});
			}
		};
	}
}, We = {
	create(e, t) {
		let n = e.parentElement || e, r = t.strength ?? .4, i = t.radius ?? 100, a = t.ease ?? .15, o = w(e, ["transform", "willChange"]), s = 0, c = 0, l = 0, u = 0, d = !1, f = !0, p = null;
		e.style.willChange = "transform";
		let h = () => {
			if (!f) return;
			l = m(l, s, a), u = m(u, c, a), e.style.transform = `translate3d(${l}px, ${u}px, 0)`;
			let t = Math.abs(l - s) > .1 || Math.abs(u - c) > .1;
			p = d || t ? requestAnimationFrame(h) : null;
		}, g = () => {
			p == null && f && (p = requestAnimationFrame(h));
		}, _ = (t) => {
			let n = e.getBoundingClientRect(), a = t.clientX - (n.left + n.width / 2), o = t.clientY - (n.top + n.height / 2);
			Math.hypot(a, o) <= i * 1.5 ? (d = !0, s = a * r, c = o * r, g()) : (d = !1, s = 0, c = 0, g());
		}, v = () => {
			d = !1, s = 0, c = 0, g();
		};
		return n.addEventListener("pointermove", _, { passive: !0 }), n.addEventListener("pointerleave", v), {
			el: e,
			type: "magnetic",
			pause: () => {
				f = !1, p != null && cancelAnimationFrame(p), p = null;
			},
			resume: () => {
				f || (f = !0, g());
			},
			destroy: () => {
				f = !1, p != null && cancelAnimationFrame(p), n.removeEventListener("pointermove", _), n.removeEventListener("pointerleave", v), o();
			}
		};
	},
	reduced() {},
	fallback(e, t) {
		return this.create(e, t);
	}
}, Ge = {
	create(e, t) {
		let n = b(), r = x(), i = e.innerHTML, a = e.getAttribute("style"), o = Math.abs(Number(t.speed ?? 50)), s = t.direction === "right" ? 1 : -1, c = t.reverseOnScrollUp === !0, l = Number(t.scrollAcceleration ?? 0), u = t.pauseOnHover !== !1, d = Math.max(1, Number(t.clones ?? 2));
		e.style.display = "flex", e.style.overflow = "hidden", e.style.whiteSpace = "nowrap";
		let f = document.createElement("div");
		for (f.className = "kt-marquee-group", f.style.cssText = "display:flex;flex:0 0 auto;will-change:transform;"; e.firstChild;) f.appendChild(e.firstChild);
		e.appendChild(f);
		for (let t = 0; t < d; t += 1) {
			let t = f.cloneNode(!0);
			t.setAttribute("aria-hidden", "true"), e.appendChild(t);
		}
		let p = Array.from(e.children), m = o * s, h = m, g = !1, _ = m, v = s < 0 ? 0 : -(f.offsetWidth || 0), y = !0, S = null, C = performance.now(), w = (e) => {
			n ? n.set(p, { x: e }) : p.forEach((t) => {
				t.style.transform = `translate3d(${e}px,0,0)`;
			});
		}, T = (e = performance.now()) => {
			if (!y) return;
			let t = Math.min(.05, Math.max(0, (e - C) / 1e3));
			C = e;
			let n = f.offsetWidth;
			if (n > 0) {
				for (_ += (h - _) * Math.min(1, t * 8), v += _ * t; v <= -n;) v += n;
				for (; v > 0;) v -= n;
				w(v), g || (h += (m - h) * Math.min(1, t * 4));
			}
			S = requestAnimationFrame(T);
		};
		S = requestAnimationFrame(T);
		let E = null, D = Math.max(0, Number(t.skew ?? 0)), O = 0, k = 0, A = null, j = () => {
			y && (O *= .9, k += (O - k) * .12, e.style.transform = `skewX(${k.toFixed(3)}deg)`, A = requestAnimationFrame(j));
		};
		r && (c || l > 0 || D > 0) && (E = r.create({
			trigger: document.documentElement,
			start: 0,
			end: "max",
			onUpdate: (e) => {
				let t = e.getVelocity();
				c && (m = o * (e.direction < 0 ? 1 : -1)), !g && (c || l > 0) && (h = m + t / 50 * l * -s), D > 0 && (O = Math.max(-D, Math.min(D, t / 220 * D)));
			}
		}), D > 0 && (A = requestAnimationFrame(j)));
		let M = () => {
			g = !0, h = 0;
		}, N = () => {
			g = !1, h = m;
		};
		return u && (e.addEventListener("pointerenter", M), e.addEventListener("pointerleave", N)), {
			el: e,
			type: "marquee",
			pause: () => {
				y = !1, S != null && cancelAnimationFrame(S);
			},
			resume: () => {
				y || (y = !0, C = performance.now(), S = requestAnimationFrame(T));
			},
			destroy: () => {
				y = !1, S != null && cancelAnimationFrame(S), A != null && cancelAnimationFrame(A), E?.kill(), e.removeEventListener("pointerenter", M), e.removeEventListener("pointerleave", N), e.innerHTML = i, a == null ? e.removeAttribute("style") : e.setAttribute("style", a);
			}
		};
	},
	reduced(e) {
		let t = w(e, ["overflowX", "transform"]);
		return e.style.overflowX = "auto", e.style.transform = "none", {
			el: e,
			type: "marquee",
			pause() {},
			resume() {},
			destroy: t
		};
	}
};
//#endregion
//#region src/modules/overflowText.js
function Q(e, t, n = 0) {
	let r = Number(e ?? t);
	return Number.isFinite(r) ? Math.max(n, r) : t;
}
function Ke(e) {
	let t = String(e || "top-to-bottom").toLowerCase();
	return {
		down: "top-to-bottom",
		up: "bottom-to-top",
		right: "left-to-right",
		left: "right-to-left"
	}[t] || t;
}
function qe(e) {
	return e === "bottom-to-top" ? "inset(100% 0 0 0)" : e === "left-to-right" ? "inset(0 100% 0 0)" : e === "right-to-left" ? "inset(0 0 0 100%)" : "inset(0 0 100% 0)";
}
function Je(e) {
	return e === "bottom-to-top" ? "inset(0 0 100% 0)" : e === "left-to-right" ? "inset(0 0 0 100%)" : e === "right-to-left" ? "inset(0 100% 0 0)" : "inset(100% 0 0 0)";
}
function Ye(e, t = "0.3em") {
	return e === "bottom-to-top" ? `translate3d(0,-${t},0)` : e === "left-to-right" ? `translate3d(${t},0,0)` : e === "right-to-left" ? `translate3d(-${t},0,0)` : `translate3d(0,${t},0)`;
}
function Xe(e, t) {
	if (Array.isArray(t.items)) return t.items.map(String).filter(Boolean);
	if (typeof t.items == "string") try {
		let e = JSON.parse(t.items);
		if (Array.isArray(e)) return e.map(String).filter(Boolean);
	} catch {
		return t.items.split("|").map((e) => e.trim()).filter(Boolean);
	}
	let n = e.getAttribute("data-items");
	if (n) return n.split("|").map((e) => e.trim()).filter(Boolean);
	let r = Array.from(e.children).map((e) => e.innerHTML.trim()).filter(Boolean);
	return r.length ? r : [e.textContent.trim()].filter(Boolean);
}
function Ze(e) {
	let t = document.createElement("div");
	return t.innerHTML = e, t.textContent || "";
}
var Qe = {
	create(e, t = {}) {
		let n = t.mode || t.preset || "loop", r = Q(t.speed, 36, 1), i = Q(t.delay, 700), a = Q(t.endPause, 900), o = Q(t.restartDelay, i), s = Q(t.gap, 32), c = t.direction === "right" ? 1 : -1, l = Ke(t.maskDirection || t.transitionDirection), u = Q(t.maskDuration, 260, 20), d = t.pauseOnHover !== !1, f = e.innerHTML, p = e.getAttribute("style"), m = e.getAttribute("title"), g = e.getAttribute("aria-label"), _ = e.getAttribute("role"), v = String(t.text ?? e.textContent ?? "").trim(), y = n === "rolling" ? Xe(e, t) : null, b = null, x = null, S = null, C = !1, w = !1, T = null, E = null, D = 0;
		e.textContent = "", e.style.overflow = "hidden", e.style.whiteSpace = "nowrap", getComputedStyle(e).position === "static" && (e.style.position = "relative"), v && e.setAttribute("aria-label", v), !m && t.title !== !1 && v && e.setAttribute("title", v);
		let O = !1, k = null, A = () => {
			b?.cancel?.(), b = null, clearTimeout(S), S = null, k = null;
		}, M = (e, t) => {
			clearTimeout(S), S = setTimeout(() => {
				if (S = null, !C) {
					if (w || O) {
						k = e;
						return;
					}
					e();
				}
			}, Math.max(0, t));
		}, N = async (e) => {
			let n = e.animate([{
				clipPath: "inset(0 0 0 0)",
				webkitClipPath: "inset(0 0 0 0)",
				transform: "translate3d(0,0,0)",
				opacity: 1
			}, {
				clipPath: qe(l),
				webkitClipPath: qe(l),
				transform: Ye(l),
				opacity: .6
			}], {
				duration: u,
				easing: t.maskEase || "cubic-bezier(.5,0,.75,.4)",
				fill: "forwards"
			});
			b = n;
			try {
				await n.finished;
			} catch {}
			b === n && (b = null);
		}, P = async (e) => {
			let n = e.animate([{
				clipPath: Je(l),
				webkitClipPath: Je(l),
				transform: Ye(l === "bottom-to-top" ? "top-to-bottom" : l === "top-to-bottom" ? "bottom-to-top" : l === "left-to-right" ? "right-to-left" : "left-to-right"),
				opacity: .6
			}, {
				clipPath: "inset(0 0 0 0)",
				webkitClipPath: "inset(0 0 0 0)",
				transform: "translate3d(0,0,0)",
				opacity: 1
			}], {
				duration: u,
				easing: t.maskEase || "cubic-bezier(.22,.8,.3,1)",
				fill: "forwards"
			});
			b = n;
			try {
				await n.finished;
			} catch {}
			b === n && (b = null);
		}, F = (e = v, t = !1, n = !1) => {
			let r = document.createElement("span");
			return r.className = "kt-overflow-text-segment", n ? r.innerHTML = e : r.textContent = e, r.style.cssText = "display:inline-block;flex:0 0 auto;white-space:nowrap;", t && r.setAttribute("aria-hidden", "true"), r;
		}, I = () => {
			let n = y || [];
			if (!n.length) return;
			e.setAttribute("role", t.role || "status"), e.setAttribute("aria-live", t.ariaLive || "polite");
			let r = document.createElement("span");
			r.className = "kt-overflow-rolling-viewport", r.style.cssText = "display:block;position:relative;height:1.35em;overflow:hidden;", E = document.createElement("span"), E.className = "kt-overflow-rolling-track", E.style.cssText = "display:flex;flex-direction:column;will-change:transform;";
			let i = F(n[0], !1, !0), a = F(n[1 % n.length], !0, !0);
			i.style.height = a.style.height = "1.35em", i.style.lineHeight = a.style.lineHeight = "1.35em", i.style.display = a.style.display = "flex", i.style.alignItems = a.style.alignItems = "center", i.style.gap = a.style.gap = "0.4em", E.append(i, a), r.appendChild(E), e.appendChild(r);
			let o = t.rollDirection === "down" ? 1 : -1, s = Q(t.rollDuration, 380, 50), c = Q(t.holdDuration, 1500, 100), l = async () => {
				if (C || w || n.length < 2) return;
				let r = (D + 1) % n.length, i = o < 0 ? E.lastElementChild : E.firstElementChild;
				i.innerHTML = n[r];
				let a = o < 0 ? "translate3d(0,0,0)" : "translate3d(0,-1.35em,0)", u = o < 0 ? "translate3d(0,-1.35em,0)" : "translate3d(0,0,0)";
				E.style.transform = a;
				let d = E.animate([{ transform: a }, { transform: u }], {
					duration: s,
					easing: t.easing || "cubic-bezier(.22,.8,.25,1)",
					fill: "forwards"
				});
				b = d;
				try {
					await d.finished;
				} catch {
					return;
				}
				if (!C) {
					if (d.cancel(), o < 0) {
						let e = E.firstElementChild;
						E.appendChild(e);
					} else {
						let e = E.lastElementChild;
						E.insertBefore(e, E.firstElementChild);
					}
					E.style.transform = "translate3d(0,0,0)", D = r, e.setAttribute("aria-label", Ze(n[D])), t.onChange?.(D, n[D], e), M(l, c);
				}
			};
			n.length > 1 && M(l, Q(t.delay, c));
		}, L = () => {
			A(), e.textContent = "", T = document.createElement("span"), T.className = "kt-overflow-text-viewport", T.style.cssText = "display:block;position:relative;overflow:hidden;will-change:clip-path,transform;", E = document.createElement("span"), E.className = `kt-overflow-text-track kt-overflow-text-${n}`, E.setAttribute("aria-hidden", "true"), E.dataset.mode = n, E.style.cssText = "display:inline-flex;align-items:center;white-space:nowrap;will-change:transform;";
			let l = F();
			E.appendChild(l), T.appendChild(E), e.appendChild(T);
			let u = T.clientWidth || e.clientWidth, d = Math.max(0, l.scrollWidth - u), f = t.force === !0 || d > Q(t.threshold, 1);
			if (e.dataset.ktOverflowActive = String(f), !f) {
				E.style.display = "inline-block", E.style.maxWidth = "100%", E.style.overflow = "hidden", E.style.textOverflow = t.ellipsis === !1 ? "clip" : "ellipsis";
				return;
			}
			if (n === "loop") {
				l.style.marginRight = `${s}px`;
				let e = F(v, !0);
				e.style.marginRight = `${s}px`, E.appendChild(e);
				let n = l.getBoundingClientRect().width + s, a = Math.max(200, n / r * 1e3), o = c < 0 ? 0 : -n, u = c < 0 ? -n : 0;
				b = E.animate([{ transform: `translate3d(${o}px,0,0)` }, { transform: `translate3d(${u}px,0,0)` }], {
					duration: a,
					delay: i,
					iterations: t.repeat === !1 ? 1 : Infinity,
					easing: "linear",
					fill: "both"
				});
				return;
			}
			let p = d, m = Math.max(120, p / r * 1e3), g = c < 0 ? 0 : -p, _ = c < 0 ? -p : 0;
			if (E.style.transform = `translate3d(${g}px,0,0)`, n === "bounce") {
				let e = i + m + a + m + o, n = h(i / e, 0, 1), r = h((i + m) / e, n, 1), s = h((i + m + a) / e, r, 1), c = h((i + m + a + m) / e, s, 1);
				b = E.animate([
					{
						transform: `translate3d(${g}px,0,0)`,
						offset: 0
					},
					{
						transform: `translate3d(${g}px,0,0)`,
						offset: n
					},
					{
						transform: `translate3d(${_}px,0,0)`,
						offset: r
					},
					{
						transform: `translate3d(${_}px,0,0)`,
						offset: s
					},
					{
						transform: `translate3d(${g}px,0,0)`,
						offset: c
					},
					{
						transform: `translate3d(${g}px,0,0)`,
						offset: 1
					}
				], {
					duration: e,
					iterations: t.repeat === !1 ? 1 : Infinity,
					easing: t.easing || "ease-in-out",
					fill: "both"
				});
				return;
			}
			if (n === "once") {
				b = E.animate([{ transform: `translate3d(${g}px,0,0)` }, { transform: `translate3d(${_}px,0,0)` }], {
					duration: m,
					delay: i,
					easing: t.easing || "ease-in-out",
					fill: "forwards"
				});
				return;
			}
			if (n === "page-roll" || n === "pageRoll") {
				let n = Math.max(1, u - Q(t.pageOverlap, 12)), r = [0];
				for (let e = n; e < d; e += n) r.push(e);
				r.at(-1) !== d && r.push(d);
				let a = Q(t.rollDuration, 420, 60), s = Q(t.pageDuration, 1200, 120), l = t.rollDirection === "down";
				T.style.height = "1.3em", E.remove();
				let f = (e) => {
					let t = document.createElement("span");
					t.className = "kt-overflow-text-line", t.setAttribute("aria-hidden", "true"), t.style.cssText = "position:absolute;left:0;top:0;height:100%;display:inline-flex;align-items:center;white-space:nowrap;will-change:transform;";
					let n = F();
					return n.style.transform = `translate3d(${e}px,0,0)`, t.appendChild(n), T.appendChild(t), t;
				}, p = (e) => {
					let t = r[e];
					return c < 0 ? -t : -(d - t);
				}, m = f(0), h = f(0);
				h.style.transform = "translateY(100%)";
				let g = 0, _ = async () => {
					if (C || w) return;
					g = (g + 1) % r.length, h.firstElementChild.style.transform = `translate3d(${p(g)}px,0,0)`;
					let n = l ? "translateY(-100%)" : "translateY(100%)", i = l ? "translateY(100%)" : "translateY(-100%)";
					h.style.transform = n;
					let c = t.easing || "cubic-bezier(.22,.8,.25,1)", u = m.animate([{ transform: "translateY(0)" }, { transform: i }], {
						duration: a,
						easing: c,
						fill: "forwards"
					}), d = h.animate([{ transform: n }, { transform: "translateY(0)" }], {
						duration: a,
						easing: c,
						fill: "forwards"
					});
					b = d;
					try {
						await Promise.all([u.finished, d.finished]);
					} catch {
						return;
					}
					if (C) return;
					u.cancel(), d.cancel();
					let f = m;
					m = h, h = f, m.style.transform = "translateY(0)", h.style.transform = "translateY(100%)", m.dataset.page = String(g), t.onPage?.(g, r.length, e), (t.repeat !== !1 || g < r.length - 1) && M(_, g === 0 ? o : s);
				};
				M(_, i);
				return;
			}
			if (n === "dissolve") {
				let n = Math.max(1, u - Q(t.pageOverlap, 12)), r = [0];
				for (let e = n; e < d; e += n) r.push(e);
				r.at(-1) !== d && r.push(d);
				let a = Q(t.dissolveDuration ?? t.maskDuration, 460, 100), s = Q(t.jitter, 5, 0);
				E.style.display = "inline-block", E.textContent = "";
				let l = [];
				j(v).forEach((e) => {
					if (/^\s$/.test(e)) {
						E.appendChild(document.createTextNode(e));
						return;
					}
					let t = document.createElement("span");
					t.textContent = e, t.style.cssText = "display:inline-block;will-change:transform,opacity,filter;", E.appendChild(t), l.push(t);
				});
				let f = (e) => Promise.all(l.map((t) => {
					let n = (Math.random() - .5) * s * 2, r = (Math.random() - .5) * s * 1.4, i = e ? [
						{
							opacity: 0,
							transform: `translate(${n}px,${r}px)`
						},
						{
							opacity: .85,
							transform: `translate(${(-n * .6).toFixed(1)}px,${(-r * .6).toFixed(1)}px)`,
							offset: .45
						},
						{
							opacity: .3,
							transform: `translate(${(n * .4).toFixed(1)}px,${(r * .3).toFixed(1)}px)`,
							offset: .62
						},
						{
							opacity: 1,
							transform: "translate(0,0)"
						}
					] : [
						{
							opacity: 1,
							transform: "translate(0,0)"
						},
						{
							opacity: .25,
							transform: `translate(${(n * .5).toFixed(1)}px,${(r * .4).toFixed(1)}px)`,
							offset: .35
						},
						{
							opacity: .8,
							transform: `translate(${(-n * .4).toFixed(1)}px,${(-r * .5).toFixed(1)}px)`,
							offset: .55
						},
						{
							opacity: 0,
							transform: `translate(${n}px,${r}px)`
						}
					], o = t.animate(i, {
						duration: a,
						delay: Math.random() * a * .5,
						easing: `steps(${2 + Math.floor(Math.random() * 3)}, end)`,
						fill: "forwards"
					});
					return b = o, o.finished.catch(() => {});
				})), p = 0, m = Q(t.pageDuration, 1200, 120), h = async () => {
					if (C || w || (await f(!1), C)) return;
					p = (p + 1) % r.length;
					let n = r[p], i = c < 0 ? -n : -(d - n);
					E.style.transform = `translate3d(${i}px,0,0)`, await f(!0), E.dataset.page = String(p), t.onPage?.(p, r.length, e), (t.repeat !== !1 || p < r.length - 1) && M(h, p === 0 ? o : m);
				};
				M(h, i);
				return;
			}
			if (n === "flip") {
				e.style.perspective = `${Q(t.perspective, 520, 120)}px`;
				let n = Math.max(1, u - Q(t.pageOverlap, 12)), r = [0];
				for (let e = n; e < d; e += n) r.push(e);
				r.at(-1) !== d && r.push(d);
				let a = 0, s = Q(t.pageDuration, 1200, 120), l = Q(t.flipDuration ?? t.maskDuration, 300, 60), f = (t.flipDirection || "down") === "up" ? 1 : -1;
				T.style.transformOrigin = "50% 50%", T.style.willChange = "transform,opacity";
				let p = async () => {
					if (C || w) return;
					let n = T.animate([{
						transform: "rotateX(0deg)",
						opacity: 1
					}, {
						transform: `rotateX(${f * 88}deg)`,
						opacity: .4
					}], {
						duration: l / 2,
						easing: "cubic-bezier(.55,0,.7,.4)",
						fill: "forwards"
					});
					b = n;
					try {
						await n.finished;
					} catch {
						return;
					}
					if (C) return;
					a = (a + 1) % r.length;
					let i = r[a], u = c < 0 ? -i : -(d - i);
					E.style.transform = `translate3d(${u}px,0,0)`;
					let m = T.animate([{
						transform: `rotateX(${-f * 88}deg)`,
						opacity: .4
					}, {
						transform: "rotateX(0deg)",
						opacity: 1
					}], {
						duration: l / 2,
						easing: "cubic-bezier(.25,.7,.35,1)",
						fill: "forwards"
					});
					b = m;
					try {
						await m.finished;
					} catch {
						return;
					}
					E.dataset.page = String(a), t.onPage?.(a, r.length, e), (t.repeat !== !1 || a < r.length - 1) && M(p, a === 0 ? o : s);
				};
				M(p, i);
				return;
			}
			if (n === "page") {
				let n = Math.max(1, u - Q(t.pageOverlap, 12)), r = [0];
				for (let e = n; e < d; e += n) r.push(e);
				r.at(-1) !== d && r.push(d);
				let a = 0, s = Q(t.pageDuration, 1100, 120), l = async () => {
					if (C || w || (await N(T), C)) return;
					a = (a + 1) % r.length;
					let n = r[a], i = c < 0 ? -n : -(d - n);
					E.style.transform = `translate3d(${i}px,0,0)`, T.offsetWidth, await P(T), E.dataset.page = String(a), t.onPage?.(a, r.length, e), (t.repeat !== !1 || a < r.length - 1) && M(l, a === 0 ? o : s);
				};
				M(l, i);
				return;
			}
			let y = async () => {
				if (C || w) return;
				E.style.transform = `translate3d(${g}px,0,0)`, T.style.clipPath = "inset(0 0 0 0)";
				let e = E.animate([{ transform: `translate3d(${g}px,0,0)` }, { transform: `translate3d(${_}px,0,0)` }], {
					duration: m,
					delay: i,
					easing: t.easing || "linear",
					fill: "forwards"
				});
				b = e;
				try {
					await e.finished;
				} catch {
					return;
				}
				C || w || (e.cancel(), E.style.transform = `translate3d(${_}px,0,0)`, M(async () => {
					await N(T), !C && (E.style.transform = `translate3d(${g}px,0,0)`, T.offsetWidth, await P(T), t.repeat !== !1 && M(y, o));
				}, a));
			};
			y();
		}, R = () => {
			n === "rolling" ? I() : L();
		};
		if (R(), typeof ResizeObserver < "u" && n !== "rolling") {
			let t = e.clientWidth;
			x = new ResizeObserver(() => {
				Math.abs(e.clientWidth - t) < 1 || (t = e.clientWidth, L());
			}), x.observe(e);
		}
		let z = () => {
			O = !0, b?.playState === "running" && b.pause();
		}, B = () => {
			if (O = !1, b?.playState === "paused" && b.play(), k && S == null) {
				let e = k;
				k = null, M(e, 220);
			}
		};
		return d && (e.addEventListener("pointerenter", z), e.addEventListener("pointerleave", B)), {
			el: e,
			type: "overflowText",
			get index() {
				return D;
			},
			replay() {
				A(), D = 0, R();
			},
			pause() {
				w = !0, b?.pause?.(), clearTimeout(S);
			},
			resume() {
				w = !1, b?.play?.(), b || R();
			},
			destroy() {
				C = !0, A(), x?.disconnect(), e.removeEventListener("pointerenter", z), e.removeEventListener("pointerleave", B), p == null ? e.removeAttribute("style") : e.setAttribute("style", p), m == null ? e.removeAttribute("title") : e.setAttribute("title", m), g == null ? e.removeAttribute("aria-label") : e.setAttribute("aria-label", g), _ == null ? e.removeAttribute("role") : e.setAttribute("role", _), e.innerHTML = f, delete e.dataset.ktOverflowActive;
			}
		};
	},
	reduced() {}
};
//#endregion
//#region src/modules/loader.js
function $e(e, t, n) {
	if (typeof n.renderUI == "function") {
		let t = n.renderUI(e, n) || {};
		return t.root && e.appendChild(t.root), {
			root: t.root || e,
			render: t.render || (() => {})
		};
	}
	let r = n.color || "var(--kt-loader-color,currentColor)", i = n.trackColor || "rgba(127,127,127,.18)", a = n.showPercent !== !1, o = null, s = null, c = null;
	if (t === "slot") c = document.createElement("div"), c.className = "kt-loader-counter", c.style.cssText = "position:absolute;inset:0;display:grid;place-items:center;font-size:clamp(2.5rem,8vw,5rem);font-weight:850;font-variant-numeric:tabular-nums;color:var(--kt-loader-color,currentColor);", o = document.createElement("span"), o.textContent = "0%", c.appendChild(o);
	else if (t === "circular") {
		let e = Math.max(48, Number(n.size ?? 132)), t = Math.max(1, Number(n.stroke ?? 8)), l = (e - t) / 2, u = 2 * Math.PI * l;
		c = document.createElement("div"), c.className = "kt-loader-circular", c.style.cssText = `position:absolute;left:50%;top:50%;width:${e}px;height:${e}px;transform:translate(-50%,-50%);`, c.innerHTML = `<svg aria-hidden="true" viewBox="0 0 ${e} ${e}" style="display:block;width:100%;height:100%;transform:rotate(-90deg)"><circle cx="${e / 2}" cy="${e / 2}" r="${l}" fill="none" stroke="${i}" stroke-width="${t}"></circle><circle class="kt-loader-circular-progress" cx="${e / 2}" cy="${e / 2}" r="${l}" fill="none" stroke="${r}" stroke-width="${t}" stroke-linecap="round" stroke-dasharray="${u}" stroke-dashoffset="${u}"></circle></svg><span class="kt-loader-value" style="position:absolute;inset:0;display:${a ? "grid" : "none"};place-items:center;font-weight:800;font-variant-numeric:tabular-nums">0%</span>`, s = c.querySelector(".kt-loader-circular-progress"), o = c.querySelector(".kt-loader-value"), s.dataset.circumference = String(u);
	} else if (t === "bar") {
		let e = n.barWidth || "min(68vw,420px)", t = Math.max(2, Number(n.barHeight ?? 5));
		c = document.createElement("div"), c.className = "kt-loader-bar", c.style.cssText = `position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:${typeof e == "number" ? `${e}px` : e};display:grid;gap:12px;`;
		let l = n.label ? `<span class="kt-loader-label" style="font-size:.8rem;letter-spacing:.08em;text-transform:uppercase;opacity:.65">${String(n.label)}</span>` : "";
		c.innerHTML = `${l}<span class="kt-loader-bar-track" style="display:block;position:relative;height:${t}px;border-radius:999px;overflow:hidden;background:${i}"><span class="kt-loader-bar-progress" style="display:block;width:100%;height:100%;transform:scaleX(0);transform-origin:left;background:${r};border-radius:inherit"></span></span><span class="kt-loader-value" style="display:${a ? "block" : "none"};text-align:right;font-variant-numeric:tabular-nums;font-weight:700">0%</span>`, s = c.querySelector(".kt-loader-bar-progress"), o = c.querySelector(".kt-loader-value");
	}
	let l = null, u = n.fill === !0 ? "up" : n.fill;
	if ([
		"up",
		"down",
		"left",
		"right"
	].includes(u)) {
		l = document.createElement("div"), l.className = "kt-loader-fill", l.setAttribute("aria-hidden", "true");
		let t = {
			up: "bottom",
			down: "top",
			left: "right",
			right: "left"
		}[u], i = u === "left" || u === "right" ? "scaleX" : "scaleY";
		l.dataset.axis = i, l.style.cssText = `position:absolute;inset:0;background:${n.fillColor || r};transform-origin:${t === "bottom" ? "center bottom" : t === "top" ? "center top" : t === "left" ? "left center" : "right center"};transform:${i}(0);will-change:transform;`, e.insertBefore(l, e.firstChild);
	}
	return c && (c.setAttribute("aria-hidden", "true"), e.appendChild(c), n.labelColor && (c.style.color = n.labelColor), n.labelBlend && (c.style.mixBlendMode = String(n.labelBlend))), {
		root: c,
		render: (e) => {
			let n = h(Number(e) || 0, 0, 100);
			if (o && (o.textContent = `${Math.round(n)}%`), t === "bar" && s && (s.style.transform = `scaleX(${n / 100})`), t === "circular" && s) {
				let e = Number(s.dataset.circumference || 0);
				s.style.strokeDashoffset = String(e * (1 - n / 100));
			}
			l && (l.style.transform = `${l.dataset.axis}(${n / 100})`);
		}
	};
}
function et(e) {
	if (Array.isArray(e.resources)) return e.resources;
	let t = e.resourceSelector || "img[src],img[data-src],video[src],source[src],link[rel=\"stylesheet\"],script[src]";
	return Array.from(document.querySelectorAll(t));
}
var tt = {
	create(e, t = {}) {
		let n = t.type || t.preset || "bar", r = t.source || t.progressSource || "window", i = Math.max(0, Number(t.minDuration ?? 0)), a = t.hideScrollbar !== !1, o = {
			style: e.getAttribute("style"),
			class: e.getAttribute("class"),
			bodyOverflow: document.body.style.overflow,
			rootOverflow: document.documentElement.style.overflow,
			aria: e.getAttribute("aria-label"),
			role: e.getAttribute("role")
		};
		t.className && e.classList.add(...String(t.className).split(/\s+/).filter(Boolean));
		let s = $e(e, n, t), c = h(Number(t.progress ?? t.percent ?? 0), 0, 100), l = c, u = !1, d = !1, f = !1, p = null, m = null, g = null, _ = null, v = [], y = performance.now();
		e.setAttribute("role", "status"), e.setAttribute("aria-label", t.ariaLabel || "Loading"), a && (document.body.style.overflow = "hidden", document.documentElement.style.overflow = "hidden");
		let b = () => {
			s.render(l), e.setAttribute("aria-valuenow", String(Math.round(l))), t.onProgress?.(l, e);
		}, x = () => {
			d || (f || (l += (c - l) * h(Number(t.smoothing ?? .16), .01, 1)), Math.abs(l - c) < .05 && (l = c), b(), p = requestAnimationFrame(x));
		};
		p = requestAnimationFrame(x);
		let S = () => {
			if (d) return;
			let n = Math.max(0, Number(t.exitDuration ?? t.duration ?? .45)), r = t.exit || t.transition || "fade", i = [
				"up",
				"down",
				"left",
				"right"
			], a = i.includes(t.exitDirection) ? t.exitDirection : i.includes(t.fill) ? t.fill : "up";
			if ((r === "wipe" || r === "mask") && (e.style.clipPath = "inset(0 0 0 0)", e.style.webkitClipPath = "inset(0 0 0 0)", e.offsetWidth), e.style.transition = `opacity ${n}s ease,transform ${n}s cubic-bezier(.4,0,.2,1),clip-path ${n}s cubic-bezier(.76,0,.24,1),-webkit-clip-path ${n}s cubic-bezier(.76,0,.24,1)`, r === "slide") {
				let t = {
					up: "0,-100%",
					down: "0,100%",
					left: "-100%,0",
					right: "100%,0"
				};
				e.style.transform = `translate3d(${t[a]},0)`;
			} else if (r === "wipe" || r === "mask") {
				let t = {
					up: "0 0 100% 0",
					down: "100% 0 0 0",
					left: "0 100% 0 0",
					right: "0 0 0 100%"
				};
				e.style.clipPath = `inset(${t[a]})`, e.style.webkitClipPath = `inset(${t[a]})`;
			} else e.style.opacity = "0";
			m = setTimeout(() => {
				e.style.display = "none", document.body.style.overflow = o.bodyOverflow, document.documentElement.style.overflow = o.rootOverflow, t.onComplete?.(e);
			}, n * 1e3 + 20);
		}, C = () => {
			if (u || d) return;
			u = !0, c = 100;
			let e = Math.max(0, i - (performance.now() - y));
			setTimeout(() => {
				c = 100, l = 100, b(), setTimeout(S, Math.max(0, Number(t.completeHold ?? 120)));
			}, e);
		}, w = (e) => {
			d || u || (c = h(Number(e) || 0, 0, 100), c >= 100 && C());
		}, T = (n) => {
			if (!n?.then) return n;
			w(Math.max(c, Number(t.promiseStart ?? 8)));
			let r = Number(t.promiseStart ?? 8), i = setInterval(() => {
				r += (Number(t.promiseCeiling ?? 88) - r) * .08, w(r);
			}, 120);
			return v.push(() => clearInterval(i)), Promise.resolve(n).then((e) => (clearInterval(i), C(), e), (n) => {
				throw clearInterval(i), t.onError?.(n, e), t.completeOnError !== !1 && C(), n;
			});
		}, E = async (e, t) => {
			let n = await fetch(e, t), r = Number(n.headers.get("content-length"));
			if (!n.body || !Number.isFinite(r) || r <= 0) return w(80), C(), n;
			let i = 0, a = n.body.getReader(), o = [];
			for (;;) {
				let { done: e, value: t } = await a.read();
				if (e) break;
				o.push(t), i += t.byteLength, w(i / r * 100);
			}
			C();
			let s = new globalThis.Blob(o, { type: n.headers.get("content-type") || "application/octet-stream" });
			return new globalThis.Response(s, {
				status: n.status,
				statusText: n.statusText,
				headers: n.headers
			});
		};
		if (r === "manual") {
			let e = Math.max(0, Number(t.manualDuration ?? t.duration ?? 0));
			if (e > 0) {
				let t = performance.now(), n = (r) => {
					d || u || (f || w((r - t) / (e <= 30 ? e * 1e3 : e) * 100), u || requestAnimationFrame(n));
				};
				requestAnimationFrame(n);
			}
		} else if (r === "promise" && t.promise) T(t.promise);
		else if (r === "fetch" && (t.url || t.fetch)) E(t.url || t.fetch, t.fetchOptions).catch((n) => {
			t.onError?.(n, e), t.completeOnError !== !1 && C();
		});
		else if (r === "resources") {
			let e = et(t);
			if (!e.length) C();
			else {
				let t = 0, n = () => {
					t += 1, w(t / e.length * 100);
				};
				e.forEach((e) => {
					(e.tagName === "IMG" ? e.complete : e.readyState >= 2) ? n() : (e.addEventListener("load", n, { once: !0 }), e.addEventListener("error", n, { once: !0 }), v.push(() => {
						e.removeEventListener("load", n), e.removeEventListener("error", n);
					}));
				});
			}
		} else {
			let e = performance.getEntriesByType?.("resource")?.length || 0, n = 0;
			if (globalThis.PerformanceObserver !== void 0) {
				_ = new globalThis.PerformanceObserver((r) => {
					n += r.getEntries().length;
					let i = Math.max(Number(t.expectedResources ?? e + 12), e + n);
					w(Math.min(92, (e + n) / i * 100));
				});
				try {
					_.observe({
						type: "resource",
						buffered: !0
					});
				} catch {}
			}
			document.readyState === "complete" ? C() : (g = C, window.addEventListener("load", g, { once: !0 }));
		}
		return b(), {
			el: e,
			type: "loader",
			get progress() {
				return l;
			},
			setProgress: w,
			complete: C,
			trackPromise: T,
			trackFetch: E,
			pause() {
				f = !0;
			},
			resume() {
				f = !1;
			},
			destroy() {
				d = !0, clearTimeout(m), p != null && cancelAnimationFrame(p), g && window.removeEventListener("load", g), _?.disconnect(), v.forEach((e) => e()), s.root?.remove(), document.body.style.overflow = o.bodyOverflow, document.documentElement.style.overflow = o.rootOverflow, o.style == null ? e.removeAttribute("style") : e.setAttribute("style", o.style), o.aria == null ? e.removeAttribute("aria-label") : e.setAttribute("aria-label", o.aria), o.role == null ? e.removeAttribute("role") : e.setAttribute("role", o.role), o.class == null ? e.removeAttribute("class") : e.setAttribute("class", o.class), e.removeAttribute("aria-valuenow");
			}
		};
	},
	reduced(e) {
		let t = e.style.display;
		return e.style.display = "none", {
			el: e,
			type: "loader",
			pause() {},
			resume() {},
			destroy() {
				e.style.display = t;
			}
		};
	}
}, nt = {
	create(e, t) {
		if (t.disableOnMobile === !0 && typeof window < "u" && window.matchMedia?.("(hover: none), (pointer: coarse)").matches) return null;
		let n = window.matchMedia?.("(hover: none)").matches === !0, r = typeof DeviceOrientationEvent < "u";
		if (n && (t.gyro === !1 || !r)) return null;
		let i = Math.max(0, Number(t.max ?? 12)), a = Math.max(0, Number(t.maxX ?? i)), o = Math.max(0, Number(t.maxY ?? i)), s = Math.max(100, Number(t.perspective ?? 1e3)), c = Math.max(.5, Number(t.scale ?? 1.02)), l = h(Number(t.smoothing ?? t.ease ?? .1), .01, 1), u = Math.max(.1, Number(t.sensitivity ?? 1)), d = t.axis || "both", f = t.reverse === !0 ? -1 : 1, g = t.reset !== !1, _ = t.glare !== !1, v = Math.max(20, Number(t.glareRadius ?? 180)), y = h(Number(t.glareOpacity ?? .32), 0, 1), b = t.glareColor || "rgba(255,255,255,.85)", x = Math.max(0, Number(t.glareBlur ?? 8)), S = w(e, [
			"transform",
			"transformStyle",
			"willChange",
			"position"
		]);
		getComputedStyle(e).position === "static" && (e.style.position = "relative"), e.style.transformStyle = "preserve-3d", e.style.willChange = "transform";
		let C = 0, T = 0, E = 0, D = 0, O = 1, k = 1, A = !0, j = null, M = !1, N = null, P = null, F = 50, I = 50;
		_ && (N = document.createElement("span"), N.className = "kt-tilt-glare-wrap", N.setAttribute("aria-hidden", "true"), N.style.cssText = "position:absolute;inset:0;overflow:hidden;border-radius:inherit;pointer-events:none;z-index:9;", P = document.createElement("span"), P.className = "kt-tilt-glare", P.style.cssText = `position:absolute;width:${v * 2}px;height:${v * 2}px;left:${-v}px;top:${-v}px;border-radius:50%;pointer-events:none;background:radial-gradient(circle,${b},rgba(255,255,255,0) 68%);filter:blur(${x}px);opacity:0;transition:opacity .2s ease;mix-blend-mode:screen;`, N.appendChild(P), e.appendChild(N));
		let L = () => {
			if (!A) return;
			E = m(E, C, l), D = m(D, T, l), k = m(k, O, l), e.style.transform = `perspective(${s}px) rotateX(${E}deg) rotateY(${D}deg) scale3d(${k},${k},${k})`, P && (P.style.transform = `translate3d(${F}%,${I}%,0)`);
			let t = Math.abs(E - C) > .02 || Math.abs(D - T) > .02 || Math.abs(k - O) > .002;
			j = M || t ? requestAnimationFrame(L) : null;
		}, R = () => {
			A && j == null && (j = requestAnimationFrame(L));
		}, z = () => {
			M = !0, O = c, P && (P.style.opacity = String(y)), R();
		}, B = (t) => {
			let n = e.getBoundingClientRect();
			if (!n.width || !n.height) return;
			let r = h(((t.clientX - n.left) / n.width - .5) * u + .5, 0, 1), i = h(((t.clientY - n.top) / n.height - .5) * u + .5, 0, 1);
			C = d === "x" ? 0 : -(i - .5) * 2 * a * f, T = d === "y" ? 0 : (r - .5) * 2 * o * f, F = r * 100, I = i * 100, R();
		}, V = () => {
			M = !1, g && (C = 0, T = 0, O = 1), P && (P.style.opacity = "0"), R();
		}, H = null;
		return n ? (H = (e) => {
			let t = h((e.gamma || 0) / 28, -1, 1), n = h(((e.beta || 0) - 40) / 28, -1, 1);
			C = -n * a * f, T = t * o * f, F = (t + 1) * 50, I = (n + 1) * 50, P && (P.style.opacity = String(y)), M = !0, R();
		}, p().then((e) => {
			e && A && window.addEventListener("deviceorientation", H, { passive: !0 });
		})) : (e.addEventListener("pointerenter", z), e.addEventListener("pointermove", B, { passive: !0 }), e.addEventListener("pointerleave", V)), {
			el: e,
			type: "tilt",
			pause: () => {
				A = !1, j != null && cancelAnimationFrame(j);
			},
			resume: () => {
				A || (A = !0, R());
			},
			destroy: () => {
				A = !1, j != null && cancelAnimationFrame(j), e.removeEventListener("pointerenter", z), e.removeEventListener("pointermove", B), e.removeEventListener("pointerleave", V), H && window.removeEventListener("deviceorientation", H), N?.remove(), S();
			}
		};
	},
	reduced() {},
	fallback() {
		return null;
	}
}, rt = /* @__PURE__ */ new WeakMap();
function it(e) {
	if (!e.clickSprite) return null;
	let t = rt.get(e);
	if (!t) {
		t = {}, rt.set(e, t);
		let n = new Image();
		n.onload = () => {
			let e = n.naturalHeight || 96, r = Math.max(1, Math.round(n.naturalWidth / Math.max(1, e)));
			Object.assign(t, {
				width: n.naturalWidth / r,
				height: e,
				frames: r
			});
		}, n.src = e.clickSprite;
	}
	return t;
}
function at(e) {
	return e.clientX >= 0 && e.clientY >= 0 && e.clientX <= window.innerWidth && e.clientY <= window.innerHeight;
}
function ot(e, t) {
	return t.global === !0 ? !1 : t.global === !1 ? !0 : !e || e === document.body || e === document.documentElement ? !1 : e.clientWidth > 4 && e.clientHeight > 4;
}
var st = {
	create(e, t = {}) {
		if (window.matchMedia?.("(hover: none), (pointer: coarse)").matches || navigator.maxTouchPoints > 0) return !t.clickSprite && !t.clickImage ? null : (it(t), this._clickEffectsOnly(e, t));
		let n = t.type || t.preset || "dot", r = h(Number(t.smoothing ?? t.ease ?? t.speed ?? .16), .01, 1), i = Math.max(1, Number(t.dotSize ?? 7)), a = Math.max(i, Number(t.followerSize ?? 34)), o = Math.max(.1, Number(t.hoverScale ?? 1.7)), s = Math.max(.1, Number(t.pressScale ?? .82)), c = t.color || "currentColor", l = t.borderColor || c, u = t.background || "transparent", d = t.mixBlendMode || "normal", f = h(Number(t.opacity ?? 1), 0, 1), p = Number(t.zIndex ?? 2147483e3), g = t.hoverSelector || "a,button,input,select,textarea,label,[role=\"button\"],[data-kt-cursor-hover]", _ = t.hiddenSelector || "[data-kt-cursor-hide]", v = ot(e, t), y = document.documentElement, b = y.style.cursor;
		v ? (e.classList.add("kt-cursor-scope"), e.setAttribute("data-kt-cursor-scope", "")) : y.classList.add("kt-cursor-active");
		let x = document.createElement("div");
		x.className = `kt-cursor kt-cursor-${n}${t.className ? ` ${t.className}` : ""}`, x.setAttribute("aria-hidden", "true"), x.style.cssText = `position:fixed;top:0;left:0;z-index:${p};pointer-events:none;opacity:0;color:${c};mix-blend-mode:${d};transition:opacity .18s ease;`;
		let S = null, C = null, w = null, T = null, E = null, D = {
			nodes: [],
			xs: [],
			ys: [],
			angles: []
		}, O = {
			pool: [],
			last: 0
		}, k = (e = i) => {
			S = document.createElement("span"), S.className = "kt-cursor-dot", S.dataset.baseSize = String(e), S.style.cssText = `position:fixed;left:0;top:0;width:${e}px;height:${e}px;border-radius:50%;background:${t.dotColor || c};will-change:transform;transform:translate3d(-100px,-100px,0) translate(-50%,-50%);transition:width .22s cubic-bezier(.3,.7,.35,1.25),height .22s cubic-bezier(.3,.7,.35,1.25),opacity .18s ease;`, x.appendChild(S);
		}, A = (e = "circle") => {
			C = document.createElement("span"), C.className = "kt-cursor-follower", C.style.cssText = `position:fixed;left:0;top:0;width:${a}px;height:${a}px;border:${Math.max(0, Number(t.borderWidth ?? 1))}px solid ${l};border-radius:${e === "square" ? t.radius || "8px" : "50%"};background:${u};box-shadow:${t.shadow || "none"};will-change:transform;transform:translate3d(-100px,-100px,0) translate(-50%,-50%) scale(1);transition:background-color .2s ease,border-color .2s ease;backdrop-filter:${t.backdropFilter || "none"};`, x.appendChild(C);
		}, j = (e) => {
			w = document.createElement("span"), w.className = "kt-cursor-single", w.style.cssText = "position:fixed;left:0;top:0;will-change:transform;transform:translate3d(-100px,-100px,0);", e != null && (w.innerHTML = e), x.appendChild(w);
		}, M = (e, t = D.nodes.length) => {
			let n = document.createElement("span");
			return n.setAttribute("aria-hidden", "true"), n.style.cssText = `position:fixed;left:0;top:0;pointer-events:none;z-index:${p - t};will-change:transform;transform:translate3d(-200px,-200px,0);${e}`, x.appendChild(n), D.nodes.push(n), D.xs.push(-200), D.ys.push(-200), n;
		};
		if (n === "crosshair") if (t.full !== !1) j("<span style=\"position:fixed;left:0;right:0;top:0;height:1px;background:currentColor;opacity:.4\"></span><span style=\"position:fixed;top:0;bottom:0;left:0;width:1px;background:currentColor;opacity:.4\"></span>"), w.dataset.crosshairFull = "true", w.style.transform = "none", w.style.willChange = "auto", k(Math.max(4, i));
		else {
			let e = Math.max(8, Number(t.crosshairSize ?? 20));
			j(`<span style="position:absolute;width:${e}px;height:1px;background:currentColor;left:${-e / 2}px;top:0"></span><span style="position:absolute;width:1px;height:${e}px;background:currentColor;left:0;top:${-e / 2}px"></span>`);
		}
		else if (n === "image" && t.src) {
			j("");
			let e = document.createElement("img");
			e.src = t.src, e.alt = "", e.style.cssText = `display:block;width:${Number(t.width ?? 36)}px;height:${Number(t.height ?? 36)}px;transform:translate(-50%,-50%) rotate(${Number(t.rotate ?? 0)}deg);object-fit:contain;`, w.appendChild(e);
		} else if (n === "custom") j(t.template || t.html || (e !== document.body && e !== document.documentElement && !v ? e.innerHTML : "")), w.firstElementChild?.setAttribute("aria-hidden", "true");
		else if (n === "text") {
			let e = Math.max(40, a * 2.4), n = t.rotateText || t.text || "KINETO · KINETO · ", r = `kt-cur-txt-${Math.random().toString(36).slice(2, 7)}`;
			E = document.createElement("style"), E.textContent = `@keyframes ${r} { to { transform: rotate(360deg); } }`, document.head.appendChild(E);
			let o = e / 2 - Math.max(8, Number(t.labelSize ?? 11));
			j(`<svg width="${e}" height="${e}" viewBox="0 0 ${e} ${e}" style="position:absolute;left:${-e / 2}px;top:${-e / 2}px;animation:${r} ${Math.max(2, Number(t.rotateDuration ?? 7))}s linear infinite;transform-origin:center;"><defs><path id="${r}-p" d="M ${e / 2},${e / 2 - o} a ${o},${o} 0 1,1 -0.01,0 Z"></path></defs><text style="fill:${t.textColor || c};font: 700 ${Number(t.labelSize ?? 11)}px ui-monospace,monospace;letter-spacing:.16em;text-transform:uppercase;"><textPath href="#${r}-p">${String(n)}</textPath></text></svg>`), t.dot !== !1 && k(Math.max(3, i - 2));
		} else if (n === "trail") {
			let e = Math.max(3, Math.round(Number(t.trailCount ?? 9))), n = Math.max(4, Number(t.trailSize ?? 13));
			for (let r = 0; r < e; r += 1) {
				let i = Math.max(2, Math.round(n * (1 - r / e * .6))), a = (1 - r / e * .75).toFixed(2), o = M(`width:${i}px;height:${i}px;border-radius:50%;background:${t.trailColor || c};opacity:${a};`, r);
				o.dataset.half = String(i / 2);
			}
			D.spring = h(Number(t.spring ?? .28), .05, .9);
		} else if (n === "orbit") {
			let e = String(t.orbitText || t.text || "KINETO · "), n = Array.from(e);
			n.forEach((e, r) => {
				let i = M(`font:700 ${Number(t.labelSize ?? 12)}px ui-monospace,monospace;color:${t.textColor || c};text-transform:uppercase;line-height:1;`, r);
				i.textContent = e === " " ? "\xA0" : e, D.angles.push(r / n.length * Math.PI * 2);
			}), D.orbitRadius = Math.max(16, Number(t.orbitRadius ?? 56)), D.orbitSpeed = Number(t.orbitSpeed ?? .016), D.squash = h(Number(t.orbitSquash ?? .42), .1, 1), D.orbitHoverRadius = D.orbitRadius * Math.max(1, Number(t.orbitHoverScale ?? 1.55)), D.orbitCur = D.orbitRadius, D.squashCur = D.squash;
		} else if (n === "snake") {
			let e = String(t.snakeText || t.text || "KINETO"), n = Number(t.labelSize ?? 14);
			Array.from(e).forEach((e, r) => {
				let i = M(`font:800 ${n}px ui-monospace,monospace;color:${t.textColor || c};line-height:1;`, r);
				i.textContent = e === " " ? "\xA0" : e;
			}), D.spring = h(Number(t.spring ?? .35), .05, .9), D.gap = Math.max(4, Number(t.snakeGap ?? n * .78)), D.scales = D.nodes.map(() => 1), D.minScale = h(Number(t.snakeMinScale ?? .42), .1, 1), D.scaleEase = h(Number(t.snakeScaleEase ?? .08), .02, .5);
		} else n === "sparkle" ? (k(Math.max(4, i - 1)), O.symbols = Array.isArray(t.sparkleSymbols) ? t.sparkleSymbols : [
			"✦",
			"✧",
			"★",
			"✺",
			"·",
			"✱"
		], O.size = Math.max(8, Number(t.sparkleSize ?? 15)), O.duration = Math.max(150, Number(t.sparkleDuration ?? 620)), O.throttle = Math.max(16, Number(t.sparkleThrottle ?? 42)), O.colors = [t.sparkleColor || (c === "currentColor" ? "#ffd166" : c), t.sparkleColor2 || "#7b9fff"]) : n === "blob" ? (A("circle"), C.style.background = t.background || c, C.style.border = "0", C.style.opacity = ".75", C.style.filter = `blur(${Math.max(0, Number(t.blur ?? 0))}px)`) : n === "ring" ? (A(t.shape || "circle"), t.dot === !0 && k()) : (k(), t.follower !== !1 && A(t.shape || "circle"));
		t.label !== !1 && (S || C || w) && (T = document.createElement("span"), T.className = "kt-cursor-label", T.style.cssText = `position:absolute;inset:0;display:flex;align-items:center;justify-content:center;white-space:nowrap;font:800 ${Number(t.labelSize ?? 9)}px/1 ui-sans-serif,system-ui,sans-serif;letter-spacing:.1em;text-transform:uppercase;color:${t.labelColor || "#fff"};opacity:0;transition:opacity .18s ease;pointer-events:none;`, (S || C || w).appendChild(T)), document.body.appendChild(x);
		let N = window.innerWidth / 2, P = window.innerHeight / 2, F = N, I = P, L = !0, R = !1, z = !1, B = null, V = null, H = !v, U = (e) => {
			R = e, x.style.opacity = e ? String(f) : "0";
		}, W = t.hoverEffect || (S ? "dot" : "ring"), G = Math.max(i + 2, Number(t.hoverDotSize ?? (C ? a * .58 : i * 3))), K = () => (V && W === "ring" ? o : 1) * (z ? s : 1), ee = (e) => {
			if (V = e, x.classList.add("is-hover"), t.hoverClass && x.classList.add(...String(t.hoverClass).split(/\s+/).filter(Boolean)), w) {
				let r = e.getAttribute("data-kt-cursor-hover-src") || t.hoverSrc, i = w.querySelector("img");
				i && r && (i.dataset.baseSrc || (i.dataset.baseSrc = i.src), i.src = r), n === "custom" && t.hoverTemplate && (w.dataset.baseHtml ?? (w.dataset.baseHtml = w.innerHTML), w.innerHTML = t.hoverTemplate);
			}
			let r = e.getAttribute("data-kt-cursor-label") || t.hoverLabel || "";
			if (T && (T.textContent = r, T.style.opacity = r ? "1" : "0"), C && (C.style.backgroundColor = e.getAttribute("data-kt-cursor-background") || t.hoverBackground || u, C.style.borderColor = e.getAttribute("data-kt-cursor-color") || t.hoverColor || l), S) {
				if (t.hideDotOnHover === !0) S.style.opacity = "0";
				else if (W === "dot") {
					let e = T && r ? Math.max(G, T.scrollWidth + 18) : G;
					S.style.width = `${e}px`, S.style.height = `${e}px`, S.style.opacity = String(t.hoverDotOpacity ?? .94);
				}
			}
			t.onEnter?.(e, x);
		}, te = () => {
			let e = V;
			if (V = null, x.classList.remove("is-hover"), t.hoverClass && x.classList.remove(...String(t.hoverClass).split(/\s+/).filter(Boolean)), w) {
				let e = w.querySelector("img");
				e && e.dataset.baseSrc && (e.src = e.dataset.baseSrc), n === "custom" && w.dataset.baseHtml != null && (w.innerHTML = w.dataset.baseHtml);
			}
			if (T && (T.style.opacity = "0"), C && (C.style.backgroundColor = u, C.style.borderColor = l), S) {
				S.style.opacity = "1";
				let e = S.dataset.baseSize || i;
				S.style.width = `${e}px`, S.style.height = `${e}px`;
			}
			t.onLeave?.(e, x);
		}, q = (e, t) => {
			let n = O.pool.pop() || document.createElement("span");
			n.setAttribute("aria-hidden", "true");
			let r = O.symbols[Math.floor(Math.random() * O.symbols.length)], i = Math.random() > .5 ? O.colors[0] : O.colors[1], a = O.size * (.6 + Math.random() * .9), o = Math.random() * 360, s = 8 + Math.random() * 26, c = Math.cos(o * Math.PI / 180) * s, l = Math.sin(o * Math.PI / 180) * s;
			n.textContent = r, n.style.cssText = `position:fixed;left:${e + c}px;top:${t + l}px;z-index:${p - 2};pointer-events:none;font-size:${a}px;font-weight:900;line-height:1;color:${i};text-shadow:0 0 6px currentColor;transform:translate(-50%,-50%) rotate(${o}deg) scale(1);opacity:1;transition:none;`, n.parentNode || x.appendChild(n), n.offsetWidth, n.style.transition = `opacity ${O.duration}ms cubic-bezier(.2,0,.8,1),transform ${O.duration}ms cubic-bezier(.2,0,.8,1)`, requestAnimationFrame(() => {
				n.style.opacity = "0", n.style.transform = `translate(-50%,-50%) rotate(${o + 90}deg) scale(.1)`;
			}), setTimeout(() => {
				n.parentNode && O.pool.push(n);
			}, O.duration + 60);
		}, J = (e) => v ? H : !e.target?.closest?.("[data-kt-cursor-scope]"), Y = (t) => {
			N = t.clientX, P = t.clientY, v && (H = !!(t.target && typeof t.target.closest == "function" && (t.target.closest("[data-kt-cursor-scope]") === e || e.contains(t.target))));
			let r = J(t) && at(t) && !t.target?.closest?.(_);
			if (r !== R && U(r), S && (S.style.transform = `translate3d(${N}px,${P}px,0) translate(-50%,-50%)`), w && (w.dataset.crosshairFull ? (w.children[0].style.transform = `translateY(${P}px)`, w.children[1].style.transform = `translateX(${N}px)`) : w.style.transform = `translate3d(${N}px,${P}px,0)`), n === "sparkle" && R) {
				let e = performance.now();
				e - O.last >= O.throttle && (O.last = e, q(N, P));
			}
		}, ne = (t) => {
			if (v && !e.contains(t.target)) return;
			let n = t.target.closest?.(g);
			n && n !== V ? ee(n) : !n && V && te();
		}, re = (e) => {
			V && !V.contains(e.relatedTarget) && te(), e.relatedTarget || U(!1);
		}, X = null, ie = (e, n) => {
			if (t.clickSprite) {
				let r = it(t) || {}, i = Math.max(8, Number(t.clickSpriteWidth ?? r.width ?? 96)), a = Math.max(8, Number(t.clickSpriteHeight ?? r.height ?? i)), o = Math.max(1, Math.round(Number(t.clickSpriteFrames ?? r.frames ?? 8))), s = Math.max(80, Number(t.clickSpriteDuration ?? 480)), c = `${i}x${o}`;
				if (!X) {
					let e = `kt-cur-spr-${Math.random().toString(36).slice(2, 7)}`;
					X = document.createElement("style"), X.dataset.uid = e, document.head.appendChild(X);
				}
				X.dataset.signature !== c && (X.dataset.signature = c, X.textContent = `@keyframes ${X.dataset.uid} { to { background-position: -${i * o}px 0; } }`);
				let l = document.createElement("span");
				l.setAttribute("aria-hidden", "true"), l.style.cssText = `position:fixed;left:${e}px;top:${n}px;width:${i}px;height:${a}px;transform:translate(-50%,-50%);pointer-events:none;z-index:${p + 1};background:url("${t.clickSprite}") 0 0/auto ${a}px no-repeat;animation:${X.dataset.uid} ${s}ms steps(${o}) forwards;`, x.appendChild(l), setTimeout(() => l.remove(), s + 40);
			} else if (t.clickImage) {
				let r = Math.max(8, Number(t.clickImageSize ?? 96)), i = Math.max(80, Number(t.clickImageDuration ?? 700)), a = document.createElement("img");
				a.alt = "", a.setAttribute("aria-hidden", "true");
				let o = String(t.clickImage);
				a.src = o + (o.includes("?") ? "&" : "?") + "mkc=" + Date.now(), a.style.cssText = `position:fixed;left:${e}px;top:${n}px;width:${r}px;height:auto;transform:translate(-50%,-50%);pointer-events:none;z-index:${p + 1};`, x.appendChild(a), setTimeout(() => a.remove(), i);
			}
		}, ae = (e) => {
			z = !0, x.classList.add("is-pressed"), R && (t.clickSprite || t.clickImage) && ie(e.clientX, e.clientY);
		}, oe = () => {
			z = !1, x.classList.remove("is-pressed");
		}, Z = (e) => {
			e.relatedTarget || U(!1);
		}, se = () => {
			H = !1, U(!1), V && te();
		}, ce = () => {
			if (L) {
				if (F = m(F, N, r), I = m(I, P, r), C && (C.style.transform = `translate3d(${F}px,${I}px,0) translate(-50%,-50%) scale(${K()})`), n === "text" && w && !w.dataset.crosshairFull && (w.style.transform = `translate3d(${F}px,${I}px,0) scale(${z ? s : 1})`), n === "trail") {
					let e = N, t = P, n = D.spring || .2;
					D.nodes.forEach((r, i) => {
						D.xs[i] = m(D.xs[i], e, n), D.ys[i] = m(D.ys[i], t, n);
						let a = Number(r.dataset.half || 0);
						r.style.transform = `translate3d(${D.xs[i] - a}px,${D.ys[i] - a}px,0)`, e = D.xs[i], t = D.ys[i];
					});
				} else if (n === "snake") {
					let e = N, t = P, n = D.spring || .35, r = D.gap || 11, i = D.minScale ?? .42, a = D.scaleEase ?? .08;
					D.nodes.forEach((o, s) => {
						D.xs[s] = m(D.xs[s], e, n), D.ys[s] = m(D.ys[s], t, n);
						let c = Math.hypot(e - D.xs[s], t - D.ys[s]), l = h(i + (1 - i) * Math.sqrt(Math.min(1, c / r)), i, 1);
						D.scales[s] = m(D.scales[s] ?? 1, l, a), o.style.transform = `translate3d(${D.xs[s]}px,${D.ys[s]}px,0) scale(${D.scales[s].toFixed(3)})`, e = D.xs[s], t = D.ys[s];
					});
				} else if (n === "orbit") {
					let e = (V ? D.orbitHoverRadius : D.orbitRadius) * (z ? s : 1);
					D.orbitCur = m(D.orbitCur, e, z ? .28 : .12), D.squashCur = m(D.squashCur, V ? 1 : D.squash, .12), D.angles = D.angles.map((e) => e + D.orbitSpeed), D.nodes.forEach((e, t) => {
						let n = F + D.orbitCur * Math.cos(D.angles[t]), r = I + D.orbitCur * Math.sin(D.angles[t]) * D.squashCur;
						e.style.transform = `translate3d(${Math.round(n)}px,${Math.round(r)}px,0)`;
					});
				}
				B = requestAnimationFrame(ce);
			}
		};
		return window.addEventListener("pointermove", Y, { passive: !0 }), document.addEventListener("pointerover", ne), document.addEventListener("pointerout", re), document.addEventListener("pointerdown", ae, { passive: !0 }), document.addEventListener("pointerup", oe, { passive: !0 }), window.addEventListener("mouseout", Z), v && e.addEventListener("pointerleave", se), B = requestAnimationFrame(ce), {
			el: e,
			type: "cursor",
			cursor: x,
			setLabel(e = "") {
				T && (T.textContent = e, T.style.opacity = e ? "1" : "0");
			},
			show() {
				x.hidden = !1, U(!0);
			},
			hide() {
				U(!1);
			},
			pause() {
				L = !1, B != null && cancelAnimationFrame(B), x.hidden = !0;
			},
			resume() {
				L || (L = !0, x.hidden = !1, B = requestAnimationFrame(ce));
			},
			destroy() {
				L = !1, B != null && cancelAnimationFrame(B), window.removeEventListener("pointermove", Y), document.removeEventListener("pointerover", ne), document.removeEventListener("pointerout", re), document.removeEventListener("pointerdown", ae), document.removeEventListener("pointerup", oe), window.removeEventListener("mouseout", Z), v && (e.removeEventListener("pointerleave", se), e.classList.remove("kt-cursor-scope"), e.removeAttribute("data-kt-cursor-scope")), E?.remove(), X?.remove(), x.remove(), !v && !document.querySelector(".kt-cursor") && (y.classList.remove("kt-cursor-active"), y.style.cursor = b);
			}
		};
	},
	_clickEffectsOnly(e, t) {
		let n = Number(t.zIndex ?? 2147483e3), r = null, i = (e, i) => {
			if (t.clickSprite) {
				let a = it(t) || {}, o = Math.max(8, Number(t.clickSpriteWidth ?? a.width ?? 96)), s = Math.max(8, Number(t.clickSpriteHeight ?? a.height ?? o)), c = Math.max(1, Math.round(Number(t.clickSpriteFrames ?? a.frames ?? 8))), l = Math.max(80, Number(t.clickSpriteDuration ?? 480)), u = `${o}x${c}`;
				if (!r) {
					let e = `kt-cur-spr-${Math.random().toString(36).slice(2, 7)}`;
					r = document.createElement("style"), r.dataset.uid = e, document.head.appendChild(r);
				}
				r.dataset.signature !== u && (r.dataset.signature = u, r.textContent = `@keyframes ${r.dataset.uid} { to { background-position: -${o * c}px 0; } }`);
				let d = document.createElement("span");
				d.setAttribute("aria-hidden", "true"), d.style.cssText = `position:fixed;left:${e}px;top:${i}px;width:${o}px;height:${s}px;transform:translate(-50%,-50%);pointer-events:none;z-index:${n + 1};background:url("${t.clickSprite}") 0 0/auto ${s}px no-repeat;animation:${r.dataset.uid} ${l}ms steps(${c}) forwards;`, document.body.appendChild(d), setTimeout(() => d.remove(), l + 40);
			} else if (t.clickImage) {
				let r = Math.max(8, Number(t.clickImageSize ?? 96)), a = Math.max(80, Number(t.clickImageDuration ?? 700)), o = document.createElement("img");
				o.alt = "", o.setAttribute("aria-hidden", "true");
				let s = String(t.clickImage);
				o.src = s + (s.includes("?") ? "&" : "?") + "mkc=" + Date.now(), o.style.cssText = `position:fixed;left:${e}px;top:${i}px;width:${r}px;height:auto;transform:translate(-50%,-50%);pointer-events:none;z-index:${n + 1};`, document.body.appendChild(o), setTimeout(() => o.remove(), a);
			}
		}, a = e === document.body || e === document.documentElement ? document : e, o = (e) => i(e.clientX, e.clientY);
		return a.addEventListener("pointerdown", o, { passive: !0 }), {
			el: e,
			type: "cursor",
			pause() {},
			resume() {},
			destroy() {
				a.removeEventListener("pointerdown", o), r?.remove();
			}
		};
	},
	reduced() {},
	fallback() {
		return null;
	}
}, ct = {
	create(e, t) {
		let n = x();
		if (!n) return null;
		let r = t.baseColor || "rgba(255,255,255,.15)", i = t.fillColor || "currentColor", a = e.innerHTML, o = C(e, ["aria-label"]), s = e.textContent || "";
		e.setAttribute("aria-label", s), e.innerHTML = "";
		let c = j(s).map((t) => {
			if (/^\s$/.test(t)) return e.appendChild(document.createTextNode(t)), null;
			let n = document.createElement("span");
			return n.setAttribute("aria-hidden", "true"), n.textContent = t, n.style.cssText = `background-image:linear-gradient(to right,${i} 50%,${r} 50%);background-size:200% 100%;background-position:100% 0;-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;color:transparent;`, e.appendChild(n), n;
		}).filter(Boolean), l = (e) => {
			let t = h(e, 0, 1) * c.length;
			c.forEach((e, n) => {
				let r = h(t - n, 0, 1);
				e.style.backgroundPosition = `${100 - r * 100}% 0`;
			});
		};
		l(0);
		let u = n.create({
			trigger: e,
			start: t.start || "top 70%",
			end: t.end || "bottom 30%",
			scrub: t.scrub ?? .8,
			onUpdate: (n) => {
				l(n.progress), t.onUpdate?.(n.progress, e, n);
			}
		});
		return {
			el: e,
			type: "textFill",
			pause: () => u.disable(),
			resume: () => u.enable(),
			destroy: () => {
				u.kill(), e.innerHTML = a, o();
			}
		};
	},
	reduced(e) {
		let t = Array.from(e.querySelectorAll("span")), n = t.map((e) => e.style.color);
		return t.forEach((e) => {
			e.style.color = "currentColor";
		}), {
			el: e,
			type: "textFill",
			pause() {},
			resume() {},
			destroy() {
				t.forEach((e, t) => {
					e.style.color = n[t];
				});
			}
		};
	}
};
//#endregion
//#region src/modules/stickyStack.js
function lt(e, t) {
	let n = Number(t.distance ?? 80), r = Number(t.scaleFrom ?? .82), i = Number(t.rotate ?? 6);
	return e === "fade" ? { autoAlpha: 0 } : e === "scale" ? {
		autoAlpha: 0,
		scale: r
	} : e === "blur" ? {
		autoAlpha: 0,
		filter: `blur(${Number(t.blur ?? 18)}px)`,
		scale: r
	} : e === "slide-left" ? {
		autoAlpha: 0,
		x: -n
	} : e === "slide-right" ? {
		autoAlpha: 0,
		x: n
	} : e === "rotate" ? {
		autoAlpha: 0,
		y: n,
		rotate: i,
		scale: r
	} : e === "depth" ? {
		autoAlpha: 0,
		y: n,
		z: -240,
		rotateX: i,
		scale: r
	} : {
		autoAlpha: 0,
		y: n
	};
}
var ut = {
	create(e, t = {}) {
		let n = b(), r = x(), i = t.mode || t.type || t.preset || "vertical", a = Array.from(e.children);
		if (!a.length) return null;
		let o = e.getAttribute("style"), s = a.map((e) => e.getAttribute("style")), c = [];
		if (i === "vertical") {
			let i = t.align || "center", o = Number(t.top ?? t.offsetTop ?? 24), s = Number(t.offsetY ?? t.offset ?? 16), l = Number(t.gap ?? 24), u = t.reverseZ === !0 ? -1 : 1;
			e.style.position = "relative", e.style.display = "block", e.style.overflow = "visible", e.style.paddingBottom = `${Math.max(0, Number(t.bottomSpace ?? o + s * Math.max(0, a.length - 1)))}px`;
			let d = (e, t) => i === "center" ? `calc(50vh - ${Math.round((e.offsetHeight || 0) / 2)}px + ${t * s}px)` : `${o + t * s}px`;
			a.forEach((e, n) => {
				e.style.position = "sticky", e.style.top = d(e, n), e.style.marginBottom = n === a.length - 1 ? "0px" : `${l}px`, e.style.zIndex = String(u > 0 ? n + 1 : a.length - n), e.style.transformOrigin = t.transformOrigin || "50% 0%";
			}), n && r && (t.scalePrevious !== !1 || t.fadePrevious === !0) && a.slice(0, -1).forEach((e, r) => {
				let l = a[r + 1], u = n.to(e, {
					scale: Number(t.previousScale ?? .96),
					opacity: t.fadePrevious === !0 ? Number(t.previousOpacity ?? .55) : 1,
					filter: t.previousBlur ? `blur(${Number(t.previousBlur)}px)` : "none",
					ease: "none",
					scrollTrigger: {
						trigger: l,
						start: () => `top ${(i === "center" ? Math.round((window.innerHeight - l.offsetHeight) / 2) : o) + (r + 1) * s + Number(t.transitionStartOffset ?? 160)}`,
						end: () => `top ${(i === "center" ? Math.round((window.innerHeight - l.offsetHeight) / 2) : o) + (r + 1) * s}`,
						scrub: Number(t.scrub ?? .5),
						invalidateOnRefresh: !0
					}
				});
				c.push(u);
			});
		} else if (i === "horizontal") {
			if (!n || !r) return null;
			let i = Math.max(0, Number(t.gap ?? 24)), o = t.panelWidth || "100%";
			e.style.display = "flex", e.style.flexWrap = "nowrap", e.style.gap = `${i}px`, e.style.overflow = "hidden", e.style.width = "100%", a.forEach((e) => {
				e.style.flex = `0 0 ${o}`;
			});
			let s = () => Math.max(0, e.scrollWidth - e.clientWidth), l = n.to(e, {
				"--kt-horizontal-progress": 1,
				ease: "none",
				scrollTrigger: {
					trigger: e,
					pin: t.pin !== !1,
					pinSpacing: t.pinSpacing !== !1,
					scrub: Number(t.scrub ?? 1),
					start: t.start || ((t.align || "center") === "center" ? "center center" : "top top"),
					end: () => t.end || `+=${Math.max(window.innerWidth, s())}`,
					invalidateOnRefresh: !0,
					snap: t.snap === !0 && 1 / Math.max(1, a.length - 1),
					onUpdate: (n) => {
						let r = -s() * n.progress;
						a.forEach((e) => {
							e.style.transform = `translate3d(${r}px,0,0)`;
						}), t.onProgress?.(n.progress, e);
					}
				}
			});
			c.push(l);
		} else if (i === "zindex") {
			if (!n || !r) return null;
			e.style.position = "relative", a.forEach((e, r) => {
				e.style.position = "sticky", e.style.top = t.top || "0px", e.style.minHeight = t.itemHeight || "100vh", e.style.zIndex = String(r + 1), r > 0 && c.push(n.fromTo(e, {
					yPercent: 18,
					opacity: .55,
					scale: .9
				}, {
					yPercent: 0,
					opacity: 1,
					scale: 1,
					ease: t.ease || "power2.inOut",
					scrollTrigger: {
						trigger: e,
						start: t.start || "top bottom",
						end: t.end || "top top",
						scrub: Number(t.scrub ?? 1)
					}
				}));
			});
		} else if (i === "floating") {
			if (!n || !r) return null;
			let i = t.effect || "fade-up", o = Math.min(.9, Math.max(0, Number(t.overlap ?? .25))), s = Math.max(.1, Number(t.itemDuration ?? 1));
			e.style.position = "relative", e.style.minHeight = t.minHeight || "70vh", e.style.perspective = `${Number(t.perspective ?? 1200)}px`, a.forEach((e, t) => {
				e.style.position = "absolute", e.style.inset = "0", e.style.display = "flex", e.style.alignItems = "center", e.style.justifyContent = "center", e.style.zIndex = String(t + 1), e.style.transformStyle = "preserve-3d";
			});
			let l = n.timeline({ scrollTrigger: {
				trigger: e,
				pin: t.pin !== !1,
				pinSpacing: t.pinSpacing !== !1,
				scrub: Number(t.scrub ?? 1),
				start: t.start || ((t.align || "center") === "center" ? "center center" : "top top"),
				end: t.end || `+=${Math.max(1, a.length) * Number(t.scrollLength ?? 80)}%`,
				anticipatePin: 1
			} });
			a.forEach((e, n) => {
				let r = n * s * (1 - o);
				l.fromTo(e, lt(i, t), {
					autoAlpha: 1,
					x: 0,
					y: 0,
					z: 0,
					rotate: 0,
					rotateX: 0,
					scale: 1,
					filter: "blur(0px)",
					duration: s,
					ease: t.ease || "power2.out"
				}, r), n < a.length - 1 && l.to(e, {
					autoAlpha: Number(t.previousOpacity ?? .18),
					scale: Number(t.previousScale ?? .88),
					y: Number(t.previousY ?? -40),
					filter: t.fadePrevious === !1 ? "blur(0px)" : `blur(${Number(t.previousBlur ?? 8)}px)`,
					duration: s,
					ease: t.ease || "power2.inOut"
				}, r + s * (1 - o));
			}), c.push(l);
		}
		return {
			el: e,
			type: "stickyStack",
			pause() {
				c.forEach((e) => e.pause?.());
			},
			resume() {
				c.forEach((e) => e.resume?.());
			},
			destroy() {
				c.forEach((e) => {
					e.scrollTrigger?.kill?.(), e.kill?.();
				}), o == null ? e.removeAttribute("style") : e.setAttribute("style", o), a.forEach((e, t) => {
					let n = s[t];
					n == null ? e.removeAttribute("style") : e.setAttribute("style", n);
				});
			}
		};
	},
	reduced(e) {
		let t = Array.from(e.children), n = t.map((e) => e.getAttribute("style"));
		return t.forEach((e) => {
			e.style.position = "relative", e.style.inset = "auto", e.style.transform = "none", e.style.opacity = "1", e.style.filter = "none";
		}), {
			el: e,
			type: "stickyStack",
			pause() {},
			resume() {},
			destroy() {
				t.forEach((e, t) => n[t] == null ? e.removeAttribute("style") : e.setAttribute("style", n[t]));
			}
		};
	}
}, dt = {
	create(e, t = {}) {
		let n = x();
		if (!n) return null;
		let r = t.mode || t.preset || t.effect || "skew", i = t.axis === "x" ? "x" : "y", a = t.reverse === !0 ? -1 : 1, o = Math.max(0, Number(t.maxSkew ?? 8)), s = Math.max(0, Number(t.maxBlur ?? 0)), c = Math.max(0, Number(t.distance ?? 48)), l = Math.max(0, Number(t.maxRotate ?? 4)), u = Math.max(0, Number(t.maxScale ?? .08)), d = Math.max(100, Number(t.velocityDivisor ?? 2200)), f = t.spring !== !1 && t.elastic !== !1, p = h(Number(t.smoothing ?? .16), .01, 1), g = h(Number(t.decay ?? .08), .001, 1), _ = Math.max(1, Number(t.stiffness ?? 170)), v = Math.max(.1, Number(t.damping ?? 24)), y = Math.max(.05, Number(t.mass ?? 1)), b = h(Number(t.response ?? 1), .05, 4), S = w(e, [
			"transform",
			"filter",
			"willChange"
		]);
		e.style.willChange = s ? "transform,filter" : "transform";
		let C = 0, T = 0, E = 0, D = !0, O = null, k = performance.now(), A = n.create({
			trigger: t.global === !0 ? document.documentElement : e,
			start: t.start || (t.global === !0 ? 0 : "top bottom"),
			end: t.end || (t.global === !0 ? "max" : "bottom top"),
			onUpdate: (n) => {
				C = h(n.getVelocity() / d, -1, 1) * a * b, t.onDirection?.(n.direction, e, n);
			}
		}), j = (n) => {
			let a = n * c, d = n * o, f = n * l, p = 1 + Math.abs(n) * u, m;
			m = r === "translate" ? i === "x" ? `translate3d(${a}px,0,0)` : `translate3d(0,${a}px,0)` : r === "rotate" ? `rotate(${f}deg)` : r === "scale" ? `scale(${p})` : r === "combo" ? `${i === "x" ? `translate3d(${a}px,0,0)` : `translate3d(0,${a}px,0)`} skew${i === "x" ? "Y" : "X"}(${d}deg) rotate(${f}deg) scale(${p})` : `skew${i === "x" ? "Y" : "X"}(${d}deg)`, e.style.transform = m, s && (e.style.filter = `blur(${Math.abs(n) * s}px)`), t.onUpdate?.(n, e);
		}, M = (e) => {
			if (!D) return;
			let t = Math.min(.05, Math.max(.001, (e - k) / 1e3));
			if (k = e, f) {
				let e = (-_ * (T - C) + -v * E) / y;
				E += e * t, T += E * t, C = m(C, 0, g);
			} else T = m(T, C, p), C = m(C, 0, g), E = 0;
			Math.abs(T) < 1e-4 && Math.abs(C) < 1e-4 && (T = 0), j(T), O = requestAnimationFrame(M);
		};
		return O = requestAnimationFrame(M), {
			el: e,
			type: "scrollVelocity",
			get value() {
				return T;
			},
			pause() {
				D = !1, O != null && cancelAnimationFrame(O);
			},
			resume() {
				D || (D = !0, k = performance.now(), O = requestAnimationFrame(M));
			},
			destroy() {
				D = !1, O != null && cancelAnimationFrame(O), A.kill(), S();
			}
		};
	},
	reduced() {}
};
//#endregion
//#region src/modules/progress.js
function ft(e) {
	let t = e.target || "page";
	return () => {
		if (t === "page") {
			let e = document.documentElement.scrollHeight - window.innerHeight;
			return e > 0 ? h(window.scrollY / e, 0, 1) : 0;
		}
		let e = document.querySelector(t);
		if (!e) return 0;
		let n = e.getBoundingClientRect();
		return h((window.innerHeight - n.top) / (window.innerHeight + n.height), 0, 1);
	};
}
function pt(e, t) {
	let [n, r] = String(e || "bottom-right").split("-");
	return `${n === "top" ? "top" : "bottom"}:${t}px;${r === "left" ? "left" : "right"}:${t}px;`;
}
var mt = { create(e, t) {
	let n = t.ui || "", r = h(Number(t.smoothing ?? 0), 0, .95), i = Math.max(0, Number(t.showAfter ?? 0)), a = t.hideAtEnd === !0, o = ft(t), s = !0, c = null, l = 0, u = null, d = [], f = () => {
		if (!s) return;
		let n = o();
		l = r > 0 ? l + (n - l) * (1 - r) : n, u?.(l, n), t.onUpdate?.(l, e), c = requestAnimationFrame(f);
	}, p = (e, t) => {
		if (!i && !a) return;
		let n = i > 0 && window.scrollY < i || a && t >= .999;
		e.style.opacity = n ? "0" : "1", e.style.pointerEvents = n ? "none" : "";
	}, m = null, g = null;
	if (n === "bar") {
		let n = Math.max(1, Number(t.thickness ?? 3)), r = t.attach || "fixed", i = t.position === "bottom" ? "bottom" : "top", a = Math.max(0, Number(t.radius ?? 0)), o = t.color || "var(--kt-progress-color,#ff5b1c)", s = t.color2 ? `linear-gradient(90deg,${o},${t.color2})` : o, c = document.createElement("div");
		c.className = "kt-progress-bar", c.setAttribute("aria-hidden", "true"), c.style.cssText = r === "fixed" ? `position:fixed;left:0;right:0;${i}:0;height:${n}px;z-index:${Number(t.zIndex ?? 1002)};background:${t.trackColor || "var(--kt-progress-track,transparent)"};border-radius:${a}px;transition:opacity .25s ease;` : `position:relative;width:100%;height:${n}px;background:${t.trackColor || "var(--kt-progress-track,rgba(128,128,128,.18))"};border-radius:${a}px;overflow:hidden;transition:opacity .25s ease;`;
		let l = document.createElement("div");
		l.className = "kt-progress-bar-fill", l.style.cssText = `width:100%;height:100%;background:${s};border-radius:inherit;transform:scaleX(0);transform-origin:left center;will-change:transform;`, c.appendChild(l), (r === "fixed" ? document.body : e).appendChild(c), d.push(c), u = (e, t) => {
			l.style.transform = `scaleX(${e})`, p(c, t);
		};
	} else if (n === "ring") {
		let n = Math.max(20, Number(t.size ?? 46)), r = Math.max(1, Number(t.stroke ?? 3)), i = t.attach || "fixed", a = t.showPercent === !0, o = t.clickToTop === !0, s = (n - r) / 2, c = 2 * Math.PI * s, l = t.color || "var(--kt-progress-color,#ff5b1c)", f = t.trackColor || "var(--kt-progress-track,rgba(128,128,128,.22))", m = document.createElement(o ? "button" : "div");
		m.className = "kt-progress-ring", o ? (m.type = "button", m.setAttribute("aria-label", t.label || "Scroll back to top")) : m.setAttribute("aria-hidden", "true"), m.style.cssText = `${i === "fixed" ? `position:fixed;${pt(t.position, Math.max(0, Number(t.offset ?? 18)))}z-index:${Number(t.zIndex ?? 1200)};` : "position:relative;"}width:${n}px;height:${n}px;display:inline-flex;align-items:center;justify-content:center;border:0;padding:0;background:var(--kt-progress-ring-bg,transparent);border-radius:50%;${o ? "cursor:pointer;" : ""}transition:opacity .25s ease;color:inherit;`, m.innerHTML = `<svg viewBox="0 0 ${n} ${n}" width="${n}" height="${n}" aria-hidden="true" style="position:absolute;inset:0;transform:rotate(-90deg);"><circle class="kt-progress-ring-track" cx="${n / 2}" cy="${n / 2}" r="${s}" fill="none" stroke="${f}" stroke-width="${r}"/><circle class="kt-progress-ring-fill" cx="${n / 2}" cy="${n / 2}" r="${s}" fill="none" stroke="${l}" stroke-width="${r}" stroke-linecap="round" stroke-dasharray="${c}" stroke-dashoffset="${c}"/></svg>`;
		let h = document.createElement("span");
		h.className = "kt-progress-ring-label", h.style.cssText = `position:relative;font:600 ${Math.round(n * (a ? .26 : .36))}px/1 ui-monospace,monospace;user-select:none;`, h.textContent = a ? "0%" : o ? "↑" : "", m.appendChild(h);
		let g = m.querySelector(".kt-progress-ring-fill");
		o && m.addEventListener("click", () => window.scrollTo({
			top: 0,
			behavior: "smooth"
		})), (i === "fixed" ? document.body : e).appendChild(m), d.push(m), u = (e, t) => {
			g.setAttribute("stroke-dashoffset", String(c * (1 - e))), a && (h.textContent = `${Math.round(e * 100)}%`), p(m, t);
		};
	} else {
		let n = t.property || "scaleX";
		m = w(e, [
			"transform",
			"transformOrigin",
			"width",
			"willChange"
		]), g = C(e, ["aria-hidden"]), e.style.transformOrigin = "left center", e.style.willChange = n === "scaleX" ? "transform" : "width", e.setAttribute("aria-hidden", "true"), u = (t) => {
			n === "scaleX" ? e.style.transform = `scaleX(${t})` : e.style.width = `${t * 100}%`;
		};
	}
	return c = requestAnimationFrame(f), {
		el: e,
		type: "progress",
		pause: () => {
			s = !1, c != null && cancelAnimationFrame(c);
		},
		resume: () => {
			s || (s = !0, c = requestAnimationFrame(f));
		},
		destroy: () => {
			s = !1, c != null && cancelAnimationFrame(c), d.forEach((e) => e.remove()), g?.(), m?.();
		}
	};
} }, ht = {
	create(e, t = {}) {
		let n = e.querySelector(".kt-slider-wrap") || e, r = n.querySelector(".kt-slider-track") || e.firstElementChild;
		if (!r) return null;
		let i = Array.from(r.children);
		if (!i.length) return null;
		let a = (t.effect || t.preset || "slide") === "coverflow", o = Math.max(0, Number(t.gap ?? (a ? 22 : 0))), s = h(Number(t.perView ?? (a ? 1.35 : 1)), 1, i.length), c = a || (t.align || "center") !== "left", l = c ? i.length - 1 : Math.max(0, Math.ceil(i.length - s)), u = t.loop === !0 ? "infinite" : t.loop || "off", d = u === "infinite", f = h(Number(t.smoothing ?? .14 / Math.max(.2, Number(t.speed ?? t.duration ?? .55) / .55)), .02, .5), p = t.autoplay === !0 ? 3e3 : Math.max(0, Number(t.autoplay || 0)), g = t.pauseOnHover !== !1, _ = Number(t.rotate ?? 32), v = Number(t.depth ?? 140), y = Number(t.scaleStep ?? .12), b = h(Number(t.minScale ?? .8), .2, 1), x = Number(t.opacityStep ?? .32), S = h(Number(t.minOpacity ?? .25), 0, 1), C = t.axis === "y", w = {
			wrap: n.getAttribute("style"),
			track: r.getAttribute("style"),
			wrapRole: n.getAttribute("role"),
			wrapLabel: n.getAttribute("aria-label"),
			wrapTab: n.getAttribute("tabindex"),
			slides: i.map((e) => ({
				style: e.getAttribute("style"),
				role: e.getAttribute("role"),
				hidden: e.getAttribute("aria-hidden"),
				label: e.getAttribute("aria-label")
			}))
		}, T = h(Math.round(Number(t.initial ?? 0)), 0, l), E = T, D = T, O = !1, k = 0, A = 0, j = 0, M = 0, N = 0, P = null, F = null, I = null, L = !1, R = !0;
		n.setAttribute("role", "region"), n.setAttribute("aria-roledescription", "carousel"), n.setAttribute("aria-label", t.label || "Carousel"), n.hasAttribute("tabindex") || (n.tabIndex = 0), n.style.overflow = "hidden", n.style.touchAction = C ? "pan-x" : "pan-y", n.style.position = "relative", a && (n.style.perspective = `${Number(t.perspective ?? 1100)}px`), r.style.display = "block", r.style.position = "relative", r.style.width = "100%", r.style.transformStyle = a ? "preserve-3d" : "flat";
		let z = 100 / s;
		i.forEach((e, t) => {
			e.style.position = t === 0 ? "relative" : "absolute", e.style.top = "0", e.style.left = "0", C ? (e.style.width = "100%", e.style.height = `calc(${z}% - ${o * (s - 1) / s}px)`, t !== 0 && (e.style.width = "100%")) : (e.style.width = `calc(${z}% - ${o * (s - 1) / s}px)`, e.style.minWidth = "0", t !== 0 && (e.style.height = "100%")), e.style.transformOrigin = "50% 50%", e.style.willChange = "transform,opacity", e.style.transition = "none", e.setAttribute("role", "group"), e.setAttribute("aria-roledescription", "slide"), e.setAttribute("aria-label", `${t + 1} of ${i.length}`);
		});
		let B = () => {
			let e = n.getBoundingClientRect(), t = (C ? e.height : e.width) || 1, r = (C ? i[0].offsetHeight : i[0].offsetWidth) || t / s;
			return {
				width: t,
				slideWidth: r,
				step: r + o
			};
		}, V = () => {
			let { width: e, slideWidth: n, step: r } = B(), o = c ? (e - n) / 2 : 0;
			i.forEach((e, n) => {
				let i = d ? K(n - E) : n - E, s = Math.abs(i), c = o + i * r * (a ? Number(t.spacing ?? .62) : 1);
				if (a) {
					let t = h(-i * _, -_ * 1.4, _ * 1.4), n = Math.max(b, 1 - s * y);
					e.style.transform = C ? `translate3d(0,${c}px,${-s * v}px) rotateX(${-t}deg) scale(${n})` : `translate3d(${c}px,0,${-s * v}px) rotateY(${t}deg) scale(${n})`, e.style.opacity = String(Math.max(S, 1 - s * x)), e.style.zIndex = String(1e3 - Math.round(s * 10));
				} else e.style.transform = C ? `translate3d(0,${c}px,0)` : `translate3d(${c}px,0,0)`, e.style.opacity = "1", e.style.zIndex = "";
			});
		}, H = () => {
			i.forEach((e, t) => {
				let n = t === T, r = c ? Math.abs(t - T) > Math.ceil(s / 2) : t < T || t >= T + Math.ceil(s);
				e.setAttribute("aria-hidden", String(a ? !n : r)), e.classList.toggle("is-active", n);
			}), e.dataset.ktSliderIndex = String(T), t.onChange?.(T, i[T], e);
		}, U = () => {
			R && (E = m(E, D, O ? .55 : f), V(), O || Math.abs(E - D) > .0015 ? F = requestAnimationFrame(U) : (E = D, V(), F = null));
		}, W = () => {
			R && F == null && (F = requestAnimationFrame(U));
		}, G = i.length, K = (e) => (e = (e % G + G) % G, e > G / 2 ? e - G : e), ee = (e) => (Math.round(e) % G + G) % G, te = (e) => {
			D = d ? e : h(e, 0, l);
			let t = d ? ee(D) : h(Math.round(D), 0, l);
			t !== T && (T = t, H()), W();
		}, q = (e) => {
			if (d) {
				let t = Math.round(D);
				te(t + Math.round(K(e - t)));
			} else te(e);
		}, J = () => d ? te(Math.round(D) + 1) : q(u === "rewind" && T >= l ? 0 : T + 1), Y = () => d ? te(Math.round(D) - 1) : q(u === "rewind" && T <= 0 ? l : T - 1), ne = () => {
			clearInterval(I), I = null;
		}, re = () => {
			ne(), !(!p || L) && (I = setInterval(() => {
				O || J();
			}, p));
		}, X = (e) => {
			e.pointerType === "mouse" && e.button !== 0 || (O = !0, P = e.pointerId, k = C ? e.clientY : e.clientX, A = D, j = C ? e.clientY : e.clientX, M = performance.now(), N = 0, n.setPointerCapture?.(P), ne(), W());
		}, ie = (e) => {
			if (!O || e.pointerId !== P) return;
			let { step: t } = B(), n = C ? e.clientY : e.clientX, r = n - k, i = A - r / Math.max(1, t);
			d || (i < 0 ? i *= .3 : i > l && (i = l + (i - l) * .3));
			let a = performance.now(), o = Math.max(1, a - M);
			N = (j - n) / o, j = n, M = a, D = i, W();
		}, ae = (e) => {
			if (!O || e.pointerId !== P) return;
			O = !1, n.releasePointerCapture?.(P);
			let { step: t } = B(), r = h(N * t * .35 / Math.max(1, t), -1.2, 1.2);
			q(D + r), re();
		}, oe = (e) => {
			let t = C ? "ArrowDown" : "ArrowRight", n = C ? "ArrowUp" : "ArrowLeft";
			e.key === t ? (e.preventDefault(), J()) : e.key === n ? (e.preventDefault(), Y()) : e.key === "Home" ? (e.preventDefault(), q(0)) : e.key === "End" && (e.preventDefault(), q(l));
		}, Z = Array.from(document.querySelectorAll(t.nextSelector || `[data-kt-slider-next="${e.id || ""}"], [data-kt-slider-next]`)).filter((e) => !e.dataset.ktSliderBound), se = Array.from(document.querySelectorAll(t.prevSelector || `[data-kt-slider-prev="${e.id || ""}"], [data-kt-slider-prev]`)).filter((e) => !e.dataset.ktSliderBound), ce = (e, t) => {
			e.dataset.ktSliderBound = "true", e.addEventListener("click", t);
		};
		Z.forEach((e) => ce(e, J)), se.forEach((e) => ce(e, Y));
		let le = (e) => {
			O && e.preventDefault();
		};
		n.addEventListener("pointerdown", X), n.addEventListener("pointermove", ie), n.addEventListener("pointerup", ae), n.addEventListener("pointercancel", ae), n.addEventListener("touchmove", le, { passive: !1 }), n.addEventListener("keydown", oe);
		let ue = () => {
			g && ne();
		}, de = () => {
			g && re();
		};
		n.addEventListener("pointerenter", ue), n.addEventListener("pointerleave", de);
		let fe = typeof ResizeObserver < "u" ? new ResizeObserver(() => {
			V();
		}) : null;
		return fe?.observe(n), V(), H(), re(), {
			el: e,
			type: "slider",
			get index() {
				return T;
			},
			next: J,
			prev: Y,
			goTo(e) {
				q(Number(e));
			},
			replay() {
				q(0);
			},
			pause() {
				L = !0, ne();
			},
			resume() {
				L = !1, re();
			},
			destroy() {
				R = !1, ne(), F != null && cancelAnimationFrame(F), fe?.disconnect(), n.removeEventListener("pointerdown", X), n.removeEventListener("pointermove", ie), n.removeEventListener("pointerup", ae), n.removeEventListener("pointercancel", ae), n.removeEventListener("touchmove", le), n.removeEventListener("keydown", oe), n.removeEventListener("pointerenter", ue), n.removeEventListener("pointerleave", de), Z.forEach((e) => {
					e.removeEventListener("click", J), delete e.dataset.ktSliderBound;
				}), se.forEach((e) => {
					e.removeEventListener("click", Y), delete e.dataset.ktSliderBound;
				});
				let t = (e, t, n) => n == null ? e.removeAttribute(t) : e.setAttribute(t, n);
				t(n, "style", w.wrap), t(r, "style", w.track), t(n, "role", w.wrapRole), t(n, "aria-label", w.wrapLabel), t(n, "tabindex", w.wrapTab), i.forEach((e, n) => {
					let r = w.slides[n];
					t(e, "style", r.style), t(e, "role", r.role), t(e, "aria-hidden", r.hidden), t(e, "aria-label", r.label), e.classList.remove("is-active");
				}), delete e.dataset.ktSliderIndex;
			}
		};
	},
	reduced(e) {
		let t = w(e, ["overflowX", "scrollSnapType"]);
		return e.style.overflowX = "auto", e.style.scrollSnapType = "x mandatory", {
			el: e,
			type: "slider",
			pause() {},
			resume() {},
			destroy: t
		};
	}
};
//#endregion
//#region src/modules/ambientMedia.js
function gt(e, t = {}) {
	return t.ambientSrc || t.source || t.src || e.dataset?.src || e.getAttribute?.("data-src") || e.currentSrc || e.getAttribute?.("src") || "";
}
function _t(e, t, n) {
	let r = document.createElement("img");
	r.className = "kt-ambient-image-clone", r.alt = "", r.setAttribute("aria-hidden", "true"), r.loading = "eager", r.decoding = "async", r.src = e;
	let i = n.ambientSrcset || t.getAttribute?.("data-srcset") || t.getAttribute?.("srcset");
	return i && (r.srcset = i), r.style.cssText = "display:block;width:100%;height:100%;object-fit:cover;object-position:50% 50%;", r;
}
var vt = {
	create(e, t = {}) {
		let n = [
			"VIDEO",
			"IFRAME",
			"IMG",
			"PICTURE"
		].includes(e.tagName) ? e : e.querySelector("video,iframe,img,picture");
		if (!n) return null;
		let r = n.tagName === "PICTURE" ? n.querySelector("img") : n;
		if (!r) return null;
		let i = r.closest(".kt-lazy-wrap") || r, a = i.parentElement, o = !1, s = a?.getAttribute("style") ?? null, c = i.getAttribute("style"), l = r.getAttribute("style");
		!a || !a.classList.contains("kt-ambient-wrap") || getComputedStyle(a).overflow === "hidden" ? (a = document.createElement("span"), a.className = "kt-ambient-wrap", a.style.cssText = "position:relative;display:block;isolation:isolate;overflow:visible;width:100%;height:100%;", i.parentNode?.insertBefore(a, i), a.appendChild(i), o = !0) : (getComputedStyle(a).position === "static" && (a.style.position = "relative"), a.style.isolation = "isolate", t.allowOverflow !== !1 && (a.style.overflow = "visible")), i.style.position = i.style.position || "relative", i.style.zIndex = "1", r.style.position = r.style.position || "relative", r.style.zIndex = "1";
		let u = document.createElement("span");
		u.className = "kt-ambient-glow", u.setAttribute("aria-hidden", "true");
		let d = Number(t.inset ?? -28), f = Math.max(0, Number(t.blur ?? 42)), p = Math.min(1, Math.max(0, Number(t.opacity ?? .62))), m = Math.max(1, Number(t.scale ?? 1.06));
		u.style.cssText = `position:absolute;inset:${d}px;z-index:0;pointer-events:none;border-radius:${t.radius || "inherit"};overflow:hidden;filter:blur(${f}px) saturate(${Number(t.saturation ?? 1.45)}) brightness(${Number(t.brightness ?? .82)});opacity:${p};transform:scale(${m}) translateZ(0);transform-origin:center;transition:opacity .25s ease;`, a.insertBefore(u, i);
		let h = r.tagName, g = gt(r, t), _ = null, v = null, y = null, b = null, x = !0, S = 0, C = null, w = 0, T = t.color || t.fallbackColor || "rgba(100,120,180,.42)", E = () => {
			u.style.background = T, u.dataset.mode = "color";
		};
		if (h === "IMG" || h === "IFRAME" && g) if (g) {
			y = _t(g, r, t), u.appendChild(y), u.dataset.mode = "image-clone";
			let e = () => {
				let e = gt(r, t);
				e && y.src !== new URL(e, document.baseURI).href && (y.src = e);
			};
			C = new globalThis.MutationObserver(e), C.observe(r, {
				attributes: !0,
				attributeFilter: [
					"src",
					"data-src",
					"srcset",
					"data-srcset"
				]
			}), r.addEventListener("load", e), u._mkLoadHandler = e;
		} else E();
		else if (h === "VIDEO") {
			_ = document.createElement("canvas"), _.className = "kt-ambient-video-canvas", _.width = Math.max(16, Number(t.sampleWidth ?? 48)), _.height = Math.max(9, Number(t.sampleHeight ?? 27)), _.style.cssText = "display:block;width:100%;height:100%;object-fit:cover;", v = _.getContext("2d", { alpha: !1 }), u.appendChild(_), u.dataset.mode = "video-sample";
			let e = 1e3 / Math.min(30, Math.max(2, Number(t.sampleFps ?? 12))), n = (t) => {
				if (x) {
					if (t - S >= e && r.readyState >= 2) {
						S = t;
						try {
							v.drawImage(r, 0, 0, _.width, _.height), w += 1, _.dataset.frames = String(w);
						} catch {
							E();
						}
					}
					b = requestAnimationFrame(n);
				}
			};
			b = requestAnimationFrame(n);
		} else E();
		let D = null, O = null, k = !0, A = {
			el: e,
			type: "ambientMedia",
			get mode() {
				return u.dataset.mode;
			},
			get frames() {
				return w;
			},
			pause() {
				x = !1, b != null && cancelAnimationFrame(b), u.style.opacity = t.hideOnPause === !0 ? "0" : String(p);
			},
			resume() {
				x || (x = !0, u.style.opacity = String(p), _ && (b = requestAnimationFrame((e) => {
					S = e - 1e3;
					let n = (e) => {
						if (x) {
							if (e - S >= 1e3 / Math.min(30, Math.max(2, Number(t.sampleFps ?? 12))) && r.readyState >= 2) {
								S = e;
								try {
									v.drawImage(r, 0, 0, _.width, _.height), w += 1, _.dataset.frames = String(w);
								} catch {
									E();
								}
							}
							b = requestAnimationFrame(n);
						}
					};
					n(e);
				})));
			},
			destroy() {
				x = !1, b != null && cancelAnimationFrame(b), C?.disconnect(), D?.disconnect(), O && document.removeEventListener("visibilitychange", O), u._mkLoadHandler && r.removeEventListener("load", u._mkLoadHandler), u.remove(), o && a.parentNode ? (a.parentNode.insertBefore(i, a), a.remove()) : o || (s == null ? a.removeAttribute("style") : a.setAttribute("style", s)), c == null ? i.removeAttribute("style") : i.setAttribute("style", c), l == null ? r.removeAttribute("style") : r.setAttribute("style", l);
			}
		};
		return _ && typeof IntersectionObserver < "u" && (D = new IntersectionObserver((e) => {
			k = !!e[0]?.isIntersecting, k && !document.hidden ? A.resume() : A.pause();
		}, { rootMargin: "120px" }), D.observe(e), O = () => {
			document.hidden ? A.pause() : k && A.resume();
		}, document.addEventListener("visibilitychange", O)), A;
	},
	reduced() {}
}, yt = {
	create(e, t) {
		let n = t.effect || t.preset || "curtain", r = Math.max(.1, Number(t.duration ?? .9)) * 1e3, i = typeof t.ease == "string" && (t.ease.includes("(") || t.ease.startsWith("ease") || t.ease === "linear") ? t.ease : "cubic-bezier(.76,0,.24,1)", a = t.color || "#0a0908", o = t.color2 || a, s = Math.max(0, Number(t.delay ?? 0)) * 1e3, c = t.direction || "up", l = [], u = /* @__PURE__ */ new Set(), d = /* @__PURE__ */ new Set(), f = !1, p = (e, t) => {
			let n = setTimeout(() => {
				d.delete(n), e();
			}, t);
			return d.add(n), n;
		}, m = (e) => {
			let t = document.createElement("div");
			return t.setAttribute("aria-hidden", "true"), t.style.cssText = `position:fixed;z-index:99997;pointer-events:none;background:${a};${e}`, document.body.appendChild(t), l.push(t), t;
		}, h = (e, t, n) => {
			let a = e.animate(t, {
				duration: r,
				delay: s,
				easing: i,
				fill: "forwards",
				...n
			});
			return u.add(a), a.finished.catch(() => {}).finally(() => u.delete(a)), a;
		}, g = () => {
			f || (f = !0, l.forEach((e) => e.remove()), t.onComplete?.());
		};
		if (n === "split") if (c === "left" || c === "right" || t.axis === "x") {
			let e = m("left:0;top:0;width:50%;height:100%;"), t = m(`right:0;top:0;width:50%;height:100%;background:${o};`);
			h(e, [{ transform: "translateX(0)" }, { transform: "translateX(-100%)" }]), h(t, [{ transform: "translateX(0)" }, { transform: "translateX(100%)" }]).finished.then(g).catch(g);
		} else {
			let e = m("left:0;top:0;width:100%;height:50%;"), t = m(`left:0;bottom:0;width:100%;height:50%;background:${o};`);
			h(e, [{ transform: "translateY(0)" }, { transform: "translateY(-100%)" }]), h(t, [{ transform: "translateY(0)" }, { transform: "translateY(100%)" }]).finished.then(g).catch(g);
		}
		else if (n === "blinds") {
			let e = Math.max(3, Math.round(Number(t.count ?? 6))), n = Math.max(0, Number(t.stagger ?? .07)) * 1e3, r = null;
			for (let t = 0; t < e; t += 1) r = h(m(`top:0;height:100%;left:${t / e * 100}%;width:${100 / e + .1}%;background:${t % 2 ? o : a};transform-origin:top;`), [{ transform: "scaleY(1)" }, { transform: "scaleY(0)" }], { delay: s + t * n });
			r?.finished.then(g).catch(g);
		} else if (n === "diagonal") {
			let e = Number(t.angle ?? -14), n = c === "left" ? "-120%" : "120%", i = (e) => m(`top:50%;left:50%;width:260vmax;height:260vmax;margin:-130vmax 0 0 -130vmax;background:${e};will-change:transform;`), l = i(o);
			h(i(a), [{ transform: `rotate(${e}deg) translateX(0)` }, { transform: `rotate(${e}deg) translateX(${n})` }]), h(l, [{ transform: `rotate(${e}deg) translateX(0)` }, { transform: `rotate(${e}deg) translateX(${n})` }], { delay: s + r * .14 }).finished.then(g).catch(g);
		} else if (n === "circle") h(m("width:200vmax;height:200vmax;top:50%;left:50%;margin:-100vmax 0 0 -100vmax;border-radius:50%;"), [{ transform: "scale(1)" }, { transform: "scale(0)" }]).finished.then(g).catch(g);
		else if (n === "wipe") {
			let e = m("inset:0;"), t = c === "left" ? "left" : c === "up" ? "top" : c === "down" ? "bottom" : "right";
			e.style.transformOrigin = t;
			let n = t === "left" || t === "right" ? "scaleX" : "scaleY";
			h(e, [{ transform: `${n}(1)` }, { transform: `${n}(0)` }]).finished.then(g).catch(g);
		} else if (n === "fade") h(m("inset:0;"), [{ opacity: 1 }, { opacity: 0 }], { easing: "ease" }).finished.then(g).catch(g);
		else if (n === "checker") {
			let e = Math.max(2, Math.round(Number(t.count ?? 8))), n = Math.max(2, Math.round(e * (window.innerHeight / Math.max(1, window.innerWidth)))), i = e * n, c = Array.from({ length: i }, (e, t) => t).sort(() => Math.random() - .5), l = Math.max(0, Number(t.stagger ?? .012)) * 1e3, u = null;
			c.forEach((t, i) => {
				let c = t % e, d = Math.floor(t / e), f = m(`left:${c / e * 100}%;top:${d / n * 100}%;width:${100 / e + .1}%;height:${100 / n + .1}%;background:${(c + d) % 2 ? o : a};`);
				u = h(f, [{
					transform: "scale(1)",
					opacity: 1
				}, {
					transform: "scale(0)",
					opacity: 0
				}], {
					duration: Math.max(160, r * .45),
					delay: s + i * l
				});
			}), u?.finished.then(g).catch(g);
		} else if (n === "strips") {
			let e = Math.max(3, Math.round(Number(t.count ?? 9))), n = Array.from({ length: e }, (e, t) => t).sort(() => Math.random() - .5), i = Math.max(0, Number(t.stagger ?? .05)) * 1e3, l = c !== "down", u = null;
			n.forEach((t, n) => {
				let c = m(`top:0;height:100%;left:${t / e * 100}%;width:${100 / e + .1}%;background:${t % 2 ? o : a};`);
				u = h(c, [{ transform: "translateY(0)" }, { transform: `translateY(${l ? "-102%" : "102%"})` }], {
					duration: Math.max(200, r * .7),
					delay: s + n * i
				});
			}), u?.finished.then(g).catch(g);
		} else if (n === "shutter") {
			let e = Math.max(3, Math.round(Number(t.count ?? 6))), n = Math.max(0, Number(t.stagger ?? .06)) * 1e3, r = null;
			for (let t = 0; t < e; t += 1) r = h(m(`left:0;width:100%;top:${t / e * 100}%;height:${100 / e + .1}%;background:${t % 2 ? o : a};transform-origin:${t % 2 ? "right" : "left"} center;`), [{ transform: "scaleX(1)" }, { transform: "scaleX(0)" }], { delay: s + t * n });
			r?.finished.then(g).catch(g);
		} else {
			let e = m(`inset:0;background:${o};`), t = m("inset:0;"), n = c === "down" ? "bottom" : c === "left" ? "left" : c === "right" ? "right" : "top";
			t.style.transformOrigin = n, e.style.transformOrigin = n;
			let i = n === "left" || n === "right" ? "scaleX" : "scaleY";
			h(t, [{ transform: `${i}(1)` }, { transform: `${i}(0)` }]), h(e, [{ transform: `${i}(1)` }, { transform: `${i}(0)` }], { delay: s + r * .12 }).finished.then(g).catch(g);
		}
		return p(g, s + r * 2 + 600), {
			el: e,
			type: "pageReveal",
			pause: () => u.forEach((e) => e.pause()),
			resume: () => u.forEach((e) => e.play()),
			destroy: () => {
				u.forEach((e) => e.cancel()), u.clear(), d.forEach(clearTimeout), d.clear(), l.forEach((e) => e.remove());
			}
		};
	},
	reduced(e, t) {
		t.onComplete?.();
	}
};
//#endregion
//#region src/modules/glitch.js
function bt(e) {
	let t = e;
	for (; t && t !== document.documentElement;) {
		let e = getComputedStyle(t).backgroundColor, n = e && e.match(/rgba?\(([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:[,\s/]+([\d.]+))?\)/);
		if (n && (n[4] == null || Number(n[4]) > .15)) return .2126 * Number(n[1]) + .7152 * Number(n[2]) + .0722 * Number(n[3]) < 128;
		t = t.parentElement;
	}
	return !1;
}
var xt = "!@#$%^&*()<>?/|{}~ABCDEFGHIJabcdefghij0123456789", St = {
	create(e, t) {
		let n = t.preset || t.type || "rgb", r = n === "digital" ? "noise" : n, i = h(Number(t.intensity ?? 1), .1, 3), a = Math.max(.1, Number(t.speed ?? 1)), o = t.loop !== !1, s = t.trigger || "auto";
		if (r === "crt" || r === "vcr") {
			let t = e.tagName === "IMG" ? e : e.querySelector?.("img"), n = e.tagName === "IMG" ? e.parentElement : e;
			if (t && n) {
				let o = r === "vcr", s = n.style.position, c = n.style.overflow, l = t.style.filter, u = t.style.animation;
				getComputedStyle(n).position === "static" && (n.style.position = "relative"), n.style.overflow = "hidden";
				let d = .08 * i, f = .035 * i, p = document.createElement("div");
				p.className = "kt-glitch-crt", p.setAttribute("aria-hidden", "true"), p.style.cssText = `position:absolute;inset:0;z-index:3;pointer-events:none;border-radius:inherit;overflow:hidden;background:repeating-linear-gradient(0deg,rgba(0,0,0,${d}) 0,rgba(0,0,0,${d}) 1px,transparent 1px,transparent 3px),repeating-linear-gradient(90deg,rgba(255,40,40,${f}) 0,rgba(255,40,40,${f}) 1px,rgba(40,255,90,${f}) 1px,rgba(40,255,90,${f}) 2px,rgba(60,120,255,${f}) 2px,rgba(60,120,255,${f}) 3px);box-shadow:inset 0 0 ${o ? 70 : 110}px rgba(0,0,0,${o ? .45 : .4}),inset 0 0 20px rgba(0,0,0,.28);animation:kt-crt-flicker ${(o ? 2.2 : 3.4) / a}s ease-in-out infinite;`;
				let m = document.createElement("div");
				m.style.cssText = `position:absolute;left:0;right:0;height:${o ? 22 : 34}%;pointer-events:none;background:linear-gradient(to bottom,transparent,rgba(255,255,255,${o ? .04 : .07}) 45%,rgba(255,255,255,${o ? .08 : .11}) 55%,transparent);filter:blur(1px);animation:kt-crt-roll ${(o ? 4.5 : 8) / a}s linear infinite;`, p.appendChild(m), t.style.filter = `${l ? l + " " : ""}saturate(${o ? 1.18 : 1.08}) contrast(1.06) brightness(1.02)`;
				let h = null, g = null;
				o && (h = document.createElement("div"), h.style.cssText = `position:absolute;inset:-20%;pointer-events:none;opacity:.08;mix-blend-mode:overlay;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");animation:kt-vcr-noise ${.5 / a}s steps(3,end) infinite;`, p.appendChild(h), g = document.createElement("div"), g.style.cssText = `position:absolute;left:0;right:0;height:20%;pointer-events:none;background:linear-gradient(to bottom,transparent 0%,rgba(0,0,0,.16) 38%,rgba(0,0,0,.32) 50%,rgba(0,0,0,.16) 62%,transparent 100%);mix-blend-mode:multiply;filter:blur(2px);animation:kt-vcr-track ${3.2 / a}s linear infinite;`, p.appendChild(g), t.style.filter += " drop-shadow(1.2px 0 0 rgba(255,0,60,.4)) drop-shadow(-1.2px 0 0 rgba(0,180,255,.4))", t.style.animation = `kt-vcr-jitter ${7 / a}s steps(1,end) infinite`), n.appendChild(p);
				let _ = (e) => {
					[
						p,
						m,
						h,
						g
					].forEach((t) => {
						t && (t.style.animationPlayState = e);
					}), o && (t.style.animationPlayState = e);
				};
				return {
					el: e,
					type: "glitch",
					replay: () => {},
					pause: () => _("paused"),
					resume: () => _("running"),
					destroy: () => {
						p.remove(), n.style.position = s, n.style.overflow = c, t.style.filter = l, t.style.animation = u;
					}
				};
			}
		}
		if (r === "image" || r === "reveal") {
			let n = r === "reveal", c = e.tagName === "IMG" ? e : e.querySelector?.("img");
			if (!c) return null;
			let l = e.tagName === "IMG" ? e.parentElement : e;
			if (!l) return null;
			let u = l.style.position;
			getComputedStyle(l).position === "static" && (l.style.position = "relative");
			let d = document.createElement("canvas");
			d.className = "kt-glitch-image-canvas", d.setAttribute("aria-hidden", "true"), d.style.cssText = "position:absolute;inset:0;width:100%;height:100%;pointer-events:none;border-radius:inherit;z-index:2;opacity:0;", l.appendChild(d);
			let f = d.getContext("2d", { alpha: !1 }), p = Math.max(2, Math.round(Number(t.sliceCount ?? 7))), m = !0, g = null, _ = /* @__PURE__ */ new Set(), v = (e, t) => {
				let n = setTimeout(() => {
					_.delete(n), m && e();
				}, t / a);
				_.add(n);
			}, y = () => {
				let e = l.getBoundingClientRect(), t = h(window.devicePixelRatio || 1, 1, 2), n = Math.max(1, Math.round(e.width * t)), r = Math.max(1, Math.round(e.height * t));
				(d.width !== n || d.height !== r) && (d.width = n, d.height = r);
			}, b = (e) => {
				if (!c.naturalWidth) return;
				let t = d.width, n = d.height, r = Math.max(t / c.naturalWidth, n / c.naturalHeight), a = Math.min(c.naturalWidth, t / r), o = Math.min(c.naturalHeight, n / r), s = (c.naturalWidth - a) / 2, l = (c.naturalHeight - o) / 2, u = e * i;
				if (f.filter = "none", f.fillStyle = "#000", f.fillRect(0, 0, t, n), !(Math.random() < u * .12)) {
					"filter" in f && (f.globalCompositeOperation = "screen", f.globalAlpha = .55, f.filter = "hue-rotate(90deg) saturate(3)", f.drawImage(c, s, l, a, o, Math.round(-t * .02 * u), 0, t, n), f.filter = "hue-rotate(-90deg) saturate(3)", f.drawImage(c, s, l, a, o, Math.round(t * .02 * u), 0, t, n), f.filter = "none", f.globalAlpha = 1, f.globalCompositeOperation = "source-over");
					for (let e = 0; e < p; e += 1) {
						let r = Math.floor(e / p * n), i = Math.ceil(n / p), d = Math.random() < .55, m = d ? Math.round((Math.random() - .5) * t * .16 * u) : 0;
						d && Math.random() < .28 && "filter" in f && (f.filter = `invert(1) brightness(${1 + u * .3})`), f.drawImage(c, s, l + r / n * o, a, i / n * o, m, r, t, i), f.filter = "none";
					}
					f.globalAlpha = .18 * u, f.fillStyle = "#000";
					for (let e = 0; e < n; e += 4) f.fillRect(0, e, t, 1);
					f.globalAlpha = 1;
				}
			};
			n && (c.style.opacity = "0");
			let x = () => {
				if (!m) return;
				let e = n ? Math.max(200, Number(t.duration ?? 1.15) * 1e3) / a : (140 + Math.random() * 260) / a, r = performance.now();
				d.style.opacity = "1", y();
				let i = (t) => {
					if (!m) return;
					let a = Math.min(1, (t - r) / e);
					b(n ? 1 - a : 1 - a * .5), a < 1 ? g = requestAnimationFrame(i) : n ? (c.style.opacity = "1", d.style.opacity = "0") : (d.style.opacity = "0", o && v(x, 700 + Math.random() * 1800));
				};
				g = requestAnimationFrame(i);
			}, S = null, C = null;
			return s === "hover" ? (S = () => {
				m = !0, x();
			}, C = () => {
				_.forEach(clearTimeout), _.clear(), g != null && cancelAnimationFrame(g), d.style.opacity = "0";
			}, l.addEventListener("pointerenter", S), l.addEventListener("pointerleave", C)) : v(x, 400), {
				el: e,
				type: "glitch",
				replay: () => {
					m = !0, n && (c.style.opacity = "0"), x();
				},
				pause: () => {
					m = !1, _.forEach(clearTimeout), _.clear(), g != null && cancelAnimationFrame(g), d.style.opacity = "0";
				},
				resume: () => {
					m || (m = !0, v(x, 200));
				},
				destroy: () => {
					m = !1, _.forEach(clearTimeout), _.clear(), g != null && cancelAnimationFrame(g), S && l.removeEventListener("pointerenter", S), C && l.removeEventListener("pointerleave", C), n && (c.style.opacity = ""), d.remove(), l.style.position = u;
				}
			};
		}
		let c = e.innerHTML, l = e.getAttribute("style"), u = C(e, ["aria-label"]), d = e.textContent || "", f = bt(e), p = t.blendMode || (f ? "screen" : "multiply"), m = Array.isArray(t.colors) && t.colors.length >= 2 ? t.colors : f ? [
			"rgba(255,0,60,.9)",
			"rgba(0,255,0,.85)",
			"rgba(61,139,255,.9)"
		] : [
			"#ff0040",
			"#00b894",
			"#2f6bff"
		];
		if (e.tagName === "IMG" || e.querySelector && e.querySelector("img") || !d || !String(d).trim()) return {
			el: e,
			type: "glitch",
			replay() {},
			pause() {},
			resume() {},
			destroy() {}
		};
		e.setAttribute("aria-label", d), e.innerHTML = "", e.style.position = "relative", e.style.display = "inline-block";
		let g = document.createElement("span");
		g.textContent = d, g.style.cssText = "position:relative;z-index:2;display:inline-block;will-change:transform;", g.setAttribute("aria-hidden", "true"), e.appendChild(g);
		let _ = m.slice(0, 3).map((t, n) => {
			let r = document.createElement("span");
			return r.textContent = d, r.setAttribute("aria-hidden", "true"), r.style.cssText = `position:absolute;inset:0;z-index:${3 + n};opacity:0;pointer-events:none;color:${t};mix-blend-mode:${p};will-change:transform,clip-path;`, e.appendChild(r), r;
		}), v = null, y = /* @__PURE__ */ new Set(), b = /* @__PURE__ */ new Set(), x = !0, S = (e, t) => {
			let n = setTimeout(() => {
				y.delete(n), x && e();
			}, Math.max(0, t) / a);
			return y.add(n), n;
		}, w = (e, t, n) => {
			let r = e.animate(t, n);
			return b.add(r), r.finished.catch(() => {}).finally(() => b.delete(r)), r;
		}, T = () => {
			y.forEach(clearTimeout), y.clear(), b.forEach((e) => e.cancel()), b.clear(), g.textContent = d, _.forEach((e) => {
				e.style.opacity = "0";
			});
		}, E = () => {
			if (!x) return;
			let e = (170 + Math.random() * 280) / a, t = () => {
				let e = Math.round(Math.random() * 82), t = Math.round(4 + Math.random() * 20 * i);
				return `inset(${e}% 0 ${Math.max(0, 100 - e - t)}% 0)`;
			}, n = (Math.random() - .5) * 18 * i, r = (Math.random() - .5) * 5 * i, s = Math.max(2, Math.round(3 + i));
			_.forEach((i, a) => {
				let o = a === 1 ? -.6 : a === 2 ? .45 : 1;
				w(i, [
					{
						opacity: .9,
						clipPath: t(),
						webkitClipPath: t(),
						transform: `translate(${n * o}px,${r * o}px)`
					},
					{
						opacity: .85,
						clipPath: t(),
						webkitClipPath: t(),
						transform: `translate(${-n * o * .6}px,${-r * o}px)`,
						offset: .5
					},
					{
						opacity: 0,
						clipPath: "inset(0 0 0 0)",
						webkitClipPath: "inset(0 0 0 0)",
						transform: "translate(0,0)"
					}
				], {
					duration: e,
					delay: a * 18,
					easing: `steps(${s}, end)`,
					fill: "forwards"
				});
			}), w(g, [
				{ transform: "skewX(0deg)" },
				{
					transform: `skewX(${1.8 * i}deg) translateX(${n * .2}px)`,
					offset: .33
				},
				{
					transform: `skewX(${-1.4 * i}deg)`,
					offset: .66
				},
				{ transform: "skewX(0deg)" }
			], {
				duration: e,
				easing: `steps(${s}, end)`
			}), o && S(E, 520 + Math.random() * 1400);
		}, D = () => {
			if (!x) return;
			let e = (320 + Math.random() * 320) / a, t = 40 / a, n = Math.max(3, Math.round(e / t)), r = 0, s = () => {
				if (!x) return;
				r += 1;
				let e = r / n;
				g.textContent = Array.from(d, (t) => /^\s$/.test(t) ? t : Math.random() > e * (1.35 - Math.min(.9, .3 * i)) ? xt[Math.floor(Math.random() * 48)] : t).join(""), r < n ? S(s, t) : (g.textContent = d, o && S(D, 620 + Math.random() * 1100));
			};
			s();
		}, O = () => {
			if (!x) return;
			v || (v = document.createElement("span"), v.setAttribute("aria-hidden", "true"), v.style.cssText = `position:absolute;inset:0;z-index:6;pointer-events:none;border-radius:inherit;background:repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,${.13 * i}) 2px,rgba(0,0,0,${.13 * i}) 4px);opacity:0;transition:opacity .2s ease;`, e.appendChild(v)), v.style.opacity = "1";
			let t = (900 + Math.random() * 700) / a, n = 4 * i;
			w(e, [
				{
					opacity: 1,
					filter: "none",
					transform: "none"
				},
				{
					opacity: .82,
					filter: "brightness(1.35) hue-rotate(6deg)",
					transform: `translateX(${n}px)`,
					offset: .08
				},
				{
					transform: `translateX(${-n}px)`,
					offset: .09
				},
				{
					opacity: 1,
					filter: "none",
					transform: "none",
					offset: .1
				},
				{
					opacity: .78,
					filter: "brightness(.85) hue-rotate(-8deg)",
					transform: `skewX(${1.5 * i}deg)`,
					offset: .45
				},
				{
					filter: "none",
					transform: "none",
					opacity: 1,
					offset: .46
				},
				{
					opacity: .9,
					filter: "brightness(1.2)",
					transform: `translateX(${-n * .5}px)`,
					offset: .72
				},
				{
					transform: "none",
					offset: .73
				},
				{
					opacity: 1,
					filter: "none",
					transform: "none"
				}
			], {
				duration: t,
				easing: "linear"
			}), S(() => {
				v && (v.style.opacity = "0"), o && x && S(O, 900 + Math.random() * 1500);
			}, t);
		}, k = () => {
			r === "noise" ? D() : r === "crt" ? O() : E();
		}, A = null, j = null, M = null;
		if (s === "hover") A = () => {
			x = !0, k();
		}, j = () => {
			T();
		}, e.addEventListener("pointerenter", A), e.addEventListener("pointerleave", j);
		else if (s === "scroll" || s === "view") M = new IntersectionObserver((e) => {
			e.forEach((e) => {
				e.isIntersecting && k();
			});
		}, { threshold: .4 }), M.observe(e);
		else {
			let e = Number(t.delay ?? (r === "noise" ? .7 : .35));
			S(k, e <= 10 ? e * 1e3 : e);
		}
		return {
			el: e,
			type: "glitch",
			replay: () => {
				T(), x = !0, k();
			},
			pause: () => {
				x = !1, T();
			},
			resume: () => {
				x || (x = !0, S(k, 120));
			},
			destroy: () => {
				x = !1, T(), A && e.removeEventListener("pointerenter", A), j && e.removeEventListener("pointerleave", j), M?.disconnect(), e.innerHTML = c, l == null ? e.removeAttribute("style") : e.setAttribute("style", l), u();
			}
		};
	},
	reduced(e) {
		return {
			el: e,
			type: "glitch",
			pause() {},
			resume() {},
			destroy: C(e, ["aria-label"])
		};
	}
};
//#endregion
//#region src/modules/cardGlow.js
function Ct(e, t = !1) {
	return e == null ? t : e !== !1 && e !== "false" && e !== 0 && e !== "0";
}
var wt = {
	create(e, t = {}) {
		if (t.disableOnMobile === !0 && typeof window < "u" && window.matchMedia?.("(hover: none), (pointer: coarse)").matches) return null;
		let n = t.mode || t.preset || "spotlight", r = e.getAttribute("style"), i = getComputedStyle(e);
		i.position === "static" && (e.style.position = "relative"), n === "aurora" || n === "comet" ? i.zIndex === "auto" && (e.style.zIndex = "1") : (i.overflow === "visible" && (e.style.overflow = "hidden"), e.style.isolation = "isolate");
		let a = Math.max(24, Number(t.radius ?? 180)), o = h(Number(t.opacity ?? t.intensity ?? .72), 0, 1), s = Math.max(0, Number(t.blur ?? 14)), c = Number(t.spread ?? 0), l = t.follow !== !1, u = Math.max(.1, Number(t.sensitivity ?? 1)), d = h(Number(t.smoothing ?? t.speed ?? .16), .01, 1), f = t.color || t.color1 || "rgba(120,150,255,.58)", p = t.color2 || "rgba(148,255,226,.34)", g = document.createElement("span");
		g.className = `kt-card-glow kt-card-glow-${n}`, g.setAttribute("aria-hidden", "true"), g.style.cssText = "position:absolute;inset:0;z-index:0;border-radius:inherit;pointer-events:none;overflow:hidden;opacity:0;transition:opacity .2s ease;";
		let _ = document.createElement("span");
		_.className = "kt-card-glow-spotlight", _.style.cssText = `position:absolute;left:${-a}px;top:${-a}px;width:${a * 2}px;height:${a * 2}px;border-radius:50%;background:radial-gradient(circle,${f} 0%,transparent 70%);filter:blur(${s}px);opacity:${o};mix-blend-mode:${t.blendMode || "screen"};will-change:transform;`, g.appendChild(_);
		let v = Ct(t.surface ?? t.reflection, !1), y = null;
		if (v) {
			y = document.createElement("span"), y.className = "kt-card-glow-surface";
			let e = h(Number(t.surfaceOpacity ?? .38), 0, 1), n = Math.max(0, Number(t.surfaceBlur ?? 0)), r = t.surfaceBlend || "soft-light";
			y.style.cssText = `position:absolute;inset:${Number(t.surfaceInset ?? 0)}px;border-radius:inherit;opacity:${e};mix-blend-mode:${r};filter:blur(${n}px);will-change:background;`, g.appendChild(y);
		}
		let b = Ct(t.borderGlow ?? t.luminousBorder, n === "border"), x = null;
		if (b) {
			x = document.createElement("span"), x.className = "kt-card-glow-border";
			let e = Math.max(1, Number(t.borderWidth ?? 1.5)), n = h(Number(t.borderOpacity ?? .8), 0, 1);
			x.style.cssText = `position:absolute;inset:${Number(t.borderInset ?? c)}px;border-radius:inherit;padding:${e}px;opacity:${n};filter:blur(${Math.max(0, Number(t.borderBlur ?? 0))}px);background:radial-gradient(${Math.max(40, Number(t.borderRadius ?? a * .75))}px circle at var(--kt-x,50%) var(--kt-y,50%),${t.borderColor || f},${t.borderColor2 || p} 42%,transparent 74%);-webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);mask-composite:exclude;will-change:background;`, g.appendChild(x);
		}
		if (n === "comet") {
			let e = Math.max(1, Number(t.borderWidth ?? 2)), n = t.borderColor || t.color || "rgba(123,159,255,1)", r = t.borderColor2 || t.color2 || "rgba(91,232,190,.9)", i = Math.max(.8, Number(t.cycleDuration ?? t.speed ?? 3));
			if (g.style.cssText = `position:absolute;inset:0;z-index:0;border-radius:inherit;pointer-events:none;opacity:${+!!Ct(t.alwaysOn, !0)};transition:opacity .35s ease;`, _.style.cssText = `position:absolute;inset:0;border-radius:inherit;padding:${e}px;background:conic-gradient(from var(--kt-angle,0deg),transparent 0deg,${n} 80deg,${r} 160deg,transparent 280deg);-webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);mask-composite:exclude;opacity:${o};animation:kt-border-spin ${i}s linear infinite;filter:blur(${Math.max(0, Number(t.blur ?? 0))}px);will-change:background;`, s > 0 && t.halo !== !1) {
				let e = _.cloneNode(!1);
				e.className = "kt-card-glow-comet-haze", e.style.filter = `blur(${Math.max(6, s)}px)`, e.style.opacity = String(o * .7), g.appendChild(e);
			}
		} else if (n === "aurora") {
			let e = Math.max(2, Number(t.spread ?? 6)), n = Math.max(1, Number(t.cycleDuration ?? t.speed ?? 6)), r = t.color1 || t.color || "rgba(88,150,255,.55)", i = t.color2 || "rgba(94,234,195,.45)";
			g.style.cssText = `position:absolute;inset:${-e}px;z-index:-1;border-radius:inherit;pointer-events:none;opacity:0;transition:opacity .45s ease;`, _.style.cssText = `position:absolute;inset:0;border-radius:inherit;background:conic-gradient(from var(--kt-angle,0deg),${r},${i},${r});filter:blur(${Math.max(4, s)}px);opacity:${o};animation:kt-border-spin ${n}s linear infinite;will-change:filter;`;
		} else n === "shine" && (_.style.cssText = `position:absolute;top:0;bottom:0;left:-55%;width:42%;border-radius:0;background:linear-gradient(90deg,transparent,${f},transparent);filter:blur(${s}px);opacity:${o};transform:skewX(-20deg);will-change:transform;`);
		e.insertBefore(g, e.firstChild), Array.from(e.children).forEach((e) => {
			e !== g && getComputedStyle(e).position === "static" && (e.style.position = "relative");
		});
		let S = e.clientWidth / 2, C = e.clientHeight / 2, w = S, T = C, E = null, D = !0, O = !1, k = (e, n) => {
			if (!y) return;
			let r = Math.atan2(n - 50, e - 50) * 180 / Math.PI + 90, i = t.surfaceGradient;
			y.style.background = i || `linear-gradient(${r}deg,transparent 12%,${t.surfaceColor || "rgba(255,255,255,.48)"} 42%,${t.surfaceColor2 || "rgba(145,180,255,.16)"} 55%,transparent 78%)`, y.style.backgroundSize = `${Math.max(100, Number(t.surfaceSize ?? 170))}% ${Math.max(100, Number(t.surfaceSize ?? 170))}%`, y.style.backgroundPosition = `${e}% ${n}%`;
		}, A = () => {
			if (!D) return;
			w = m(w, S, d), T = m(T, C, d);
			let t = Math.max(1, e.clientWidth), r = Math.max(1, e.clientHeight), i = h(w / t * 100, 0, 100), a = h(T / r * 100, 0, 100);
			g.style.setProperty("--kt-x", `${i}%`), g.style.setProperty("--kt-y", `${a}%`), (n === "spotlight" || n === "pointer" || n === "border") && (_.style.transform = `translate3d(${w}px,${T}px,0)`), k(i, a);
			let o = Math.abs(w - S) > .08 || Math.abs(T - C) > .08;
			E = O && (l || o) ? requestAnimationFrame(A) : null;
		}, j = () => {
			D && E == null && n !== "aurora" && n !== "shine" && n !== "comet" && (E = requestAnimationFrame(A));
		}, M = (t) => {
			if (!l) return;
			let n = e.getBoundingClientRect();
			if (!n.width || !n.height) return;
			let r = h(((t.clientX - n.left) / n.width - .5) * u + .5, 0, 1), i = h(((t.clientY - n.top) / n.height - .5) * u + .5, 0, 1);
			S = r * n.width, C = i * n.height, j();
		}, N = (e) => {
			O = !0, g.style.opacity = "1", M(e), n === "shine" && _.animate([{ transform: "translateX(0) skewX(-20deg)" }, { transform: "translateX(390%) skewX(-20deg)" }], {
				duration: Math.max(100, Number(t.duration ?? 800)),
				easing: t.ease || "ease-in-out"
			}), j();
		}, P = () => {
			O = !1, S = e.clientWidth / 2, C = e.clientHeight / 2, g.style.opacity = Ct(t.alwaysOn, n === "aurora" || n === "comet") ? String(o) : "0", j();
		}, F = (e) => {
			O = !0, g.style.opacity = "1", M(e), g.animate([
				{ filter: "brightness(1)" },
				{
					filter: "brightness(1.5) saturate(1.15)",
					offset: .28
				},
				{ filter: "brightness(1)" }
			], {
				duration: 520,
				easing: "cubic-bezier(.2,.7,.2,1)"
			}), j();
		};
		return e.addEventListener("pointerenter", N), e.addEventListener("pointermove", M, { passive: !0 }), e.addEventListener("pointerleave", P), e.addEventListener("pointerdown", F), Ct(t.alwaysOn, n === "aurora" || n === "comet") && (g.style.opacity = String(o)), k(50, 50), {
			el: e,
			type: "cardGlow",
			pause() {
				D = !1, E != null && cancelAnimationFrame(E), _.style.animationPlayState = "paused";
			},
			resume() {
				D || (D = !0, _.style.animationPlayState = "running", j());
			},
			destroy() {
				D = !1, E != null && cancelAnimationFrame(E), e.removeEventListener("pointerenter", N), e.removeEventListener("pointermove", M), e.removeEventListener("pointerleave", P), e.removeEventListener("pointerdown", F), g.remove(), r == null ? e.removeAttribute("style") : e.setAttribute("style", r);
			}
		};
	},
	reduced() {}
}, Tt = /* @__PURE__ */ new Set(), Et = null;
function Dt(e, t = {}) {
	return t.src || e.dataset.src || e.getAttribute("data-src") || e.getAttribute("href") || (e.tagName === "IMG" ? e.currentSrc || e.src : "") || e.querySelector?.("img")?.currentSrc || e.querySelector?.("img")?.src || "";
}
function Ot(e, t, n) {
	let r = document.createElement("button");
	return r.type = "button", r.className = e, r.setAttribute("aria-label", t), r.textContent = n, r;
}
function kt() {
	let e = document.createElement("div");
	if (e.id = "kt-lightbox", e.className = "kt-lightbox", e.hidden = !0, e.setAttribute("role", "dialog"), e.setAttribute("aria-modal", "true"), e.setAttribute("aria-label", "Media viewer"), e.style.cssText = "position:fixed;inset:0;width:100%;height:100%;margin:0;padding:0;z-index:2147482000;display:none;overflow:hidden;", !document.getElementById("kt-lightbox-style")) {
		let e = document.createElement("style");
		e.id = "kt-lightbox-style", e.textContent = "\n      .kt-lightbox button{transition:background-color .18s ease,border-color .18s ease,transform .18s ease,opacity .18s ease;}\n      .kt-lightbox .kt-lightbox-toolbar button:hover:not(:disabled){background:rgba(255,255,255,.16)!important;border-color:rgba(255,255,255,.3)!important;}\n      .kt-lightbox .kt-lightbox-toolbar button:disabled{opacity:.32;cursor:default;}\n      .kt-lightbox .kt-lightbox-prev:hover,.kt-lightbox .kt-lightbox-next:hover{background:rgba(255,255,255,.14)!important;transform:translateY(-50%) scale(1.06);}\n      .kt-lightbox .kt-lightbox-stage.is-zoomed{cursor:grab;}\n      .kt-lightbox .kt-lightbox-stage.is-panning{cursor:grabbing;}\n      @media (max-width: 760px) {\n        .kt-lightbox .kt-lightbox-toolbar{padding:12px max(16px, env(safe-area-inset-right)) 10px max(16px, env(safe-area-inset-left));justify-content:space-between;}\n        /* On narrow screens the absolutely-centered counter overlaps the zoom /\n           close controls — drop it back into flow so space-between separates them. */\n        .kt-lightbox .kt-lightbox-counter{position:static !important;left:auto !important;top:auto !important;transform:none !important;}\n        .kt-lightbox .kt-lightbox-toolbar button{min-width:34px;height:34px;padding:0 8px;}\n        .kt-lightbox .kt-lightbox-zoom-out,.kt-lightbox .kt-lightbox-zoom-in,.kt-lightbox .kt-lightbox-close{width:34px;padding:0;aspect-ratio:1;}\n        .kt-lightbox .kt-lightbox-prev{left:max(10px, env(safe-area-inset-left)) !important;}\n        .kt-lightbox .kt-lightbox-next{right:max(10px, env(safe-area-inset-right)) !important;}\n        .kt-lightbox .kt-lightbox-info{padding-bottom:calc(22px + env(safe-area-inset-bottom)) !important;}\n      }\n    ", document.head.appendChild(e);
	}
	let t = document.createElement("button");
	t.type = "button", t.className = "kt-lightbox-backdrop", t.setAttribute("aria-label", "Close viewer"), t.style.cssText = "position:absolute;inset:0;width:100%;height:100%;border:0;margin:0;padding:0;background:var(--kt-lightbox-backdrop,rgba(10,10,14,.88));backdrop-filter:blur(var(--kt-lightbox-backdrop-blur,20px)) saturate(1.15);-webkit-backdrop-filter:blur(var(--kt-lightbox-backdrop-blur,20px)) saturate(1.15);cursor:zoom-out;";
	let n = document.createElement("div");
	n.className = "kt-lightbox-shell", n.style.cssText = "position:absolute;inset:0;display:grid;grid-template-rows:auto minmax(0,1fr) auto;pointer-events:none;color:white;";
	let r = document.createElement("div");
	r.className = "kt-lightbox-toolbar", r.style.cssText = "position:relative;z-index:5;display:flex;align-items:center;justify-content:space-between;gap:10px;padding:14px 16px;pointer-events:auto;";
	let i = document.createElement("span");
	i.className = "kt-lightbox-counter", i.style.cssText = "position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);font:600 12.5px/1 ui-monospace,monospace;letter-spacing:.06em;color:rgba(255,255,255,.85);background:rgba(20,20,26,.5);border:1px solid rgba(255,255,255,.12);padding:6px 13px;border-radius:99px;backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);";
	let a = document.createElement("div");
	a.className = "kt-lightbox-actions", a.style.cssText = "display:flex;align-items:center;gap:2px;padding:4px;background:rgba(20,20,26,.5);border:1px solid rgba(255,255,255,.12);border-radius:13px;backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);";
	let o = Ot("kt-lightbox-zoom-out", "Zoom out", "−"), s = Ot("kt-lightbox-zoom-reset", "Reset zoom", "100%"), c = Ot("kt-lightbox-zoom-in", "Zoom in", "+"), l = Ot("kt-lightbox-share", "Share", "↗"), u = Ot("kt-lightbox-close", "Close viewer", "×");
	[
		o,
		s,
		c,
		l,
		u
	].forEach((e) => {
		e.style.cssText = "min-width:34px;height:34px;padding:0 8px;display:inline-flex;align-items:center;justify-content:center;border:0;border-radius:9px;background:var(--kt-lightbox-button-bg,transparent);color:var(--kt-lightbox-button-color,white);font:600 15px/1 sans-serif;cursor:pointer;transition:background-color .15s ease;";
	});
	let d = document.createElement("span");
	d.style.cssText = "width:1px;height:18px;margin:0 8px;background:rgba(255,255,255,.16);flex:0 0 auto;", s.style.minWidth = "54px", s.title = "Click to type an exact zoom %", l.hidden = !0, l.title = "Share", l.innerHTML = "<svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' aria-hidden='true'><circle cx='18' cy='5' r='3'/><circle cx='6' cy='12' r='3'/><circle cx='18' cy='19' r='3'/><path d='M8.6 13.5l6.8 4M15.4 6.5l-6.8 4'/></svg>", u.style.fontSize = "22px", a.append(o, s, c, d, l, u), a.style.marginLeft = "auto", r.append(i, a);
	let f = document.createElement("div");
	f.className = "kt-lightbox-stage", f.style.cssText = "position:relative;min-width:0;min-height:0;display:grid;place-items:center;overflow:hidden;pointer-events:auto;touch-action:none;";
	let p = document.createElement("div");
	p.className = "kt-lightbox-stage-content", p.style.cssText = "display:flex;flex-direction:column;align-items:center;gap:16px;max-width:100%;max-height:100%;min-height:0;";
	let m = document.createElement("div");
	m.className = "kt-lightbox-media-host", m.style.cssText = "position:relative;display:grid;place-items:center;max-width:100%;min-height:0;will-change:transform;transform-origin:center;";
	let h = document.createElement("img");
	h.className = "kt-lightbox-image", h.alt = "", h.style.cssText = "display:block;max-width:min(94vw,1800px);max-height:calc(100vh - 230px);width:auto;height:auto;object-fit:contain;border-radius:var(--kt-lightbox-radius,4px);user-select:none;-webkit-user-drag:none;", m.appendChild(h), p.appendChild(m), f.appendChild(p);
	let g = Ot("kt-lightbox-prev", "Previous item", "‹"), _ = Ot("kt-lightbox-next", "Next item", "›");
	[g, _].forEach((e) => {
		e.style.cssText = "position:absolute;top:50%;z-index:4;width:48px;height:48px;border:1px solid var(--kt-lightbox-button-border,rgba(255,255,255,.14));border-radius:999px;background:var(--kt-lightbox-button-bg,rgba(255,255,255,.08));backdrop-filter:blur(10px);color:var(--kt-lightbox-button-color,white);font:300 30px/1 sans-serif;transform:translateY(-50%);cursor:pointer;pointer-events:auto;display:grid;place-items:center;padding-bottom:4px;", f.appendChild(e);
	}), g.style.left = "14px", _.style.right = "14px";
	let v = document.createElement("div");
	v.className = "kt-lightbox-caption", v.style.cssText = "max-width:min(860px,92vw);text-align:center;flex:0 0 auto;transition:opacity .25s ease;";
	let y = document.createElement("strong");
	y.className = "kt-lightbox-title", y.style.cssText = "display:block;font:650 15px/1.4 sans-serif;";
	let b = document.createElement("span");
	b.className = "kt-lightbox-description", b.style.cssText = "display:block;margin-top:4px;opacity:.68;font:400 13px/1.45 sans-serif;", v.append(y, b), p.appendChild(v);
	let x = document.createElement("div");
	x.className = "kt-lightbox-info", x.style.cssText = "position:relative;z-index:5;display:flex;flex-direction:column;align-items:center;padding:16px 18px 26px;pointer-events:none;text-align:center;";
	let S = document.createElement("span");
	S.className = "kt-lightbox-meta", S.style.cssText = "font:500 11px/1.4 ui-monospace,monospace;opacity:.55;text-align:center;", x.append(S);
	let C = document.createElement("div");
	C.className = "kt-lightbox-minimap", C.hidden = !0, C.style.cssText = "position:absolute;right:18px;bottom:86px;z-index:6;width:140px;height:90px;border:1px solid rgba(255,255,255,.25);border-radius:8px;overflow:hidden;background:#111;pointer-events:none;box-shadow:0 8px 30px rgba(0,0,0,.35);";
	let w = document.createElement("img");
	w.alt = "", w.style.cssText = "width:100%;height:100%;object-fit:contain;opacity:.65;";
	let T = document.createElement("span");
	T.style.cssText = "position:absolute;border:1px solid white;background:rgba(255,255,255,.08);", C.append(w, T);
	let E = document.createElement("div");
	E.className = "kt-lightbox-custom-ui", E.style.pointerEvents = "auto", r.prepend(E), n.append(r, f, x), e.append(t, n, C), document.body.appendChild(e);
	let D = null, O = [], k = 0, A = "", j = null, M = 1, N = 0, P = 0, F = !1, I = null, L = 0, R = 0, z = 0, B = 0, V = null, H = !1, U = {
		root: e,
		backdrop: t,
		shell: n,
		toolbar: r,
		stage: f,
		image: h,
		closeButton: u,
		previous: g,
		next: _,
		zoomIn: c,
		zoomOut: o,
		zoomReset: s,
		shareButton: l,
		info: x,
		title: y,
		description: b,
		meta: S,
		minimap: C,
		custom: E,
		counter: i
	}, W = () => {
		let e = D?.minimap !== !1 && M > 1.02;
		if (C.hidden = !e, !e) return;
		let t = At(100 / M, 12, 100), n = At(100 / M, 12, 100), r = Math.max(1, f.clientWidth * (M - 1) / 2), i = Math.max(1, f.clientHeight * (M - 1) / 2), a = At(50 - t / 2 - N / (r * 2) * (100 - t), 0, 100 - t), o = At(50 - n / 2 - P / (i * 2) * (100 - n), 0, 100 - n);
		T.style.width = `${t}%`, T.style.height = `${n}%`, T.style.left = `${a}%`, T.style.top = `${o}%`;
	}, G = () => {
		let e = Math.max(0, f.clientWidth * (M - 1) / 2), t = Math.max(0, f.clientHeight * (M - 1) / 2);
		N = At(N, -e, e), P = At(P, -t, t), m.style.transform = `translate3d(${N}px,${P}px,0) scale(${M})`, s.querySelector("input") || (s.textContent = `${Math.round(M * 100)}%`);
		let n = Number(D?.minZoom ?? 1), r = Math.max(n, Number(D?.maxZoom ?? 5));
		o.disabled = M <= n + .001, c.disabled = M >= r - .001, f.classList.toggle("is-zoomed", M > 1.001), v.style.opacity = M > 1.02 ? "0" : "1", W();
	}, K = (e, t, n) => {
		let r = Number(D?.minZoom ?? 1), i = At(e, r, Math.max(r, Number(D?.maxZoom ?? 5)));
		if (t != null && n != null && i !== M) {
			let e = f.getBoundingClientRect(), r = t - e.left - e.width / 2, a = n - e.top - e.height / 2, o = i / M;
			N = r - (r - N) * o, P = a - (a - P) * o;
		}
		M = i, M <= 1.001 && (N = 0, P = 0), G();
	}, ee = () => {
		M = 1, N = 0, P = 0, G();
	}, te = () => {
		if (D?.backdropColor != null || D?.backdropOpacity != null) {
			let e = At(Number(D?.backdropOpacity ?? .9), 0, 1);
			t.style.background = D?.backdropColor || `rgba(0,0,0,${e})`;
		} else t.style.background = "var(--kt-lightbox-backdrop,rgba(10,10,14,.88))";
		let n = `blur(${D?.backdropBlur == null ? "var(--kt-lightbox-backdrop-blur,20px)" : `${Math.max(0, Number(D.backdropBlur))}px`}) saturate(1.15)`;
		t.style.backdropFilter = n, t.style.webkitBackdropFilter = n, e.style.setProperty("--kt-lightbox-radius", `${Number(D?.radius ?? 4)}px`), e.className = `kt-lightbox ${D?.className || ""}`.trim(), r.hidden = D?.toolbar === !1;
		let i = typeof location < "u" && /^https?:$/i.test(location.protocol), a = typeof navigator < "u" && typeof navigator.share == "function" && i;
		l.hidden = !(D?.share === !0 && a), d.hidden = l.hidden, x.hidden = D?.info === !1, E.innerHTML = D?.uiTemplate || "", D?.renderUI?.(E, U, D);
	}, q = (e) => {
		if (!O.length) return;
		V?.destroy?.(), V = null, k = (e + O.length) % O.length, D = O[k], ee();
		let t = D.src;
		h.removeAttribute("srcset"), h.removeAttribute("sizes"), h.alt = D.alt || "", h.style.opacity = "1", h.style.filter = "none", h.style.transform = "none", D.lazyEffect ? (h.removeAttribute("src"), h.dataset.src = t, V = D.Kineto?.create("lazy", h, {
			effect: D.lazyEffect,
			...D.lazyOptions || {},
			rootMargin: "0px",
			nativeLazy: !1
		})) : (h.removeAttribute("data-src"), h.src = t), w.src = t, y.textContent = D.title || "", b.textContent = D.description || "";
		let n = O.length > 1;
		g.hidden = !n, _.hidden = !n, i.textContent = n ? `${k + 1} / ${O.length}` : "", m.animate?.([{
			opacity: 0,
			transform: "translate3d(0,10px,0) scale(.985)"
		}, {
			opacity: 1,
			transform: "translate3d(0,0,0) scale(1)"
		}], {
			duration: 170,
			easing: "cubic-bezier(.22,.8,.3,1)"
		}), te(), h.onload = () => {
			let e = `${h.naturalWidth || "?"}×${h.naturalHeight || "?"} · ${k + 1}/${O.length}`, t = D.metadata && typeof D.metadata == "object" ? Object.entries(D.metadata).map(([e, t]) => `${e}: ${t}`).join(" · ") : String(D.metadata || "");
			if (S.textContent = t ? `${e} · ${t}` : e, D.onLoad?.(h, D), D.exif && D.src) {
				let e = D.src;
				fetch(e).then((e) => e.arrayBuffer()).then((t) => {
					if (D?.src !== e) return;
					let n = jt(t);
					n && (S.textContent += ` · ${n}`);
				}).catch(() => {});
			}
		}, D.onChange?.(k, D, U);
	}, J = () => {
		if (e.hidden) return;
		let t = Math.max(0, Number(D?.duration ?? .12));
		e.style.transition = `opacity ${t}s ease`, e.style.opacity = "0", setTimeout(() => {
			e.hidden = !0, e.style.display = "none", e.style.opacity = "1", document.body.style.overflow = A, V?.destroy?.(), V = null, j?.focus?.(), D?.onClose?.();
		}, t * 1e3);
	}, Y = (t) => {
		j = document.activeElement, A = document.body.style.overflow, O = t.group ? Array.from(Tt).filter((e) => e.group === t.group) : [t], q(Math.max(0, O.indexOf(t))), e.hidden = !1, e.style.display = "block", e.style.opacity = "0", document.body.style.overflow = "hidden";
		let n = Math.max(0, Number(t.duration ?? .12));
		e.style.transition = `opacity ${n}s ease`, requestAnimationFrame(() => {
			e.style.opacity = "1";
		}), u.focus(), t.onOpen?.(U);
	}, ne = (t) => {
		e.hidden || (t.key === "Escape" ? J() : t.key === "ArrowLeft" && O.length > 1 ? q(k - 1) : t.key === "ArrowRight" && O.length > 1 ? q(k + 1) : t.key === "+" || t.key === "=" ? K(M + Number(D?.zoomStep ?? .5)) : t.key === "-" ? K(M - Number(D?.zoomStep ?? .5)) : t.key === "0" && ee());
	}, re = (e) => {
		if (D?.zoom === !1) return;
		e.preventDefault();
		let t = Number(D?.wheelStep ?? .18);
		K(M * (e.deltaY < 0 ? 1 + t : 1 / (1 + t)), e.clientX, e.clientY);
	}, X = /* @__PURE__ */ new Map(), ie = 0, ae = 1, oe = () => {
		let e = [...X.values()];
		return Math.hypot(e[0].x - e[1].x, e[0].y - e[1].y);
	}, Z = () => {
		let e = [...X.values()];
		return {
			x: (e[0].x + e[1].x) / 2,
			y: (e[0].y + e[1].y) / 2
		};
	}, se = (e) => {
		if (!e.target.closest("button,.kt-lightbox-toolbar,.kt-lightbox-info")) {
			X.set(e.pointerId, {
				x: e.clientX,
				y: e.clientY
			});
			try {
				f.setPointerCapture?.(e.pointerId);
			} catch {}
			if (X.size === 2) {
				ie = oe(), ae = M, F = !1;
				return;
			}
			M <= 1 || (F = !0, I = e.pointerId, L = e.clientX, R = e.clientY, z = N, B = P, f.classList.add("is-panning"));
		}
	}, ce = (e) => {
		if (X.has(e.pointerId) && X.set(e.pointerId, {
			x: e.clientX,
			y: e.clientY
		}), X.size === 2 && ie > 0) {
			let e = Z();
			K(ae * (oe() / ie), e.x, e.y);
			return;
		}
		!F || e.pointerId !== I || (N = z + e.clientX - L, P = B + e.clientY - R, G());
	}, le = (e) => {
		X.delete(e.pointerId), f.releasePointerCapture?.(e.pointerId), X.size < 2 && (ie = 0), !(!F || e.pointerId !== I) && (F = !1, f.classList.remove("is-panning"));
	};
	t.addEventListener("click", () => {
		H || D?.closeOnBackdrop !== !1 && J();
	});
	let ue = null;
	f.addEventListener("pointerdown", (e) => {
		ue = {
			x: e.clientX,
			y: e.clientY
		};
	}), f.addEventListener("click", (e) => {
		H || D?.closeOnBackdrop === !1 || M > 1.001 || e.target !== f && e.target !== p || ue && Math.hypot(e.clientX - ue.x, e.clientY - ue.y) > 8 || J();
	}), u.addEventListener("click", J), g.addEventListener("click", () => q(k - 1)), _.addEventListener("click", () => q(k + 1)), c.addEventListener("click", () => K(M + Number(D?.zoomStep ?? .5))), o.addEventListener("click", () => K(M - Number(D?.zoomStep ?? .5))), s.addEventListener("dblclick", ee), s.addEventListener("click", () => {
		if (D?.zoom === !1 || s.querySelector("input")) return;
		let e = document.createElement("input");
		e.type = "text", e.inputMode = "numeric", e.value = String(Math.round(M * 100)), e.setAttribute("aria-label", "Zoom percent"), e.style.cssText = "width:46px;background:transparent;border:0;color:inherit;font:inherit;text-align:center;outline:none;", s.textContent = "", s.appendChild(e), e.focus(), e.select();
		let t = (t) => {
			if (t) {
				let t = parseFloat(e.value);
				!isNaN(t) && t > 0 && K(t / 100);
			}
			e.isConnected && e.remove(), G();
		};
		e.addEventListener("keydown", (e) => {
			e.stopPropagation(), e.key === "Enter" ? (e.preventDefault(), t(!0)) : e.key === "Escape" && (e.preventDefault(), t(!1));
		}), e.addEventListener("click", (e) => e.stopPropagation()), e.addEventListener("blur", () => t(!0));
	}), l.addEventListener("click", async () => {
		let e = D?.src || "";
		try {
			e = new URL(e, location.href).href;
		} catch {}
		let t = {
			title: D?.title || document.title,
			url: e
		}, n = /^https?:/i.test(e), r = async () => {
			if (navigator.clipboard) {
				await navigator.clipboard.writeText(e);
				let t = l.innerHTML;
				l.textContent = "✓", setTimeout(() => {
					l.innerHTML = t;
				}, 1200);
			}
		};
		try {
			if (n && navigator.share && (!navigator.canShare || navigator.canShare(t))) {
				H = !0;
				try {
					await navigator.share(t);
				} finally {
					setTimeout(() => {
						H = !1;
					}, 400);
				}
			} else await r();
		} catch {
			setTimeout(() => {
				H = !1;
			}, 400);
		}
	}), f.addEventListener("wheel", re, { passive: !1 }), f.addEventListener("pointerdown", se), f.addEventListener("pointermove", ce), f.addEventListener("pointerup", le), f.addEventListener("pointercancel", le);
	let de = null, fe = null, pe = null;
	return f.addEventListener("pointerdown", (e) => {
		if (!e.isPrimary || e.pointerType === "mouse" || M > 1.001 || O.length <= 1 || e.target.closest("button,.kt-lightbox-toolbar,.kt-lightbox-info")) {
			de = null;
			return;
		}
		pe = e.pointerId, de = e.clientX, fe = e.clientY;
	}), f.addEventListener("pointerup", (e) => {
		if (de == null || e.pointerId !== pe) return;
		let t = e.clientX - de, n = e.clientY - fe;
		de = fe = null, pe = null, M <= 1.001 && Math.abs(t) > 50 && Math.abs(t) > Math.abs(n) * 1.4 && q(k + (t < 0 ? 1 : -1));
	}), h.addEventListener("dblclick", (e) => K(M > 1 ? 1 : Number(D?.doubleClickZoom ?? 2), e.clientX, e.clientY)), document.addEventListener("keydown", ne), {
		root: e,
		controls: U,
		open: Y,
		close: J,
		next() {
			q(k + 1);
		},
		prev() {
			q(k - 1);
		},
		zoom(e) {
			K(Number(e));
		},
		destroy() {
			V?.destroy?.(), document.removeEventListener("keydown", ne), document.body.style.overflow = A, e.remove();
		}
	};
}
function At(e, t, n) {
	return Math.min(n, Math.max(t, e));
}
function jt(e) {
	try {
		let t = new DataView(e);
		if (t.byteLength < 12 || t.getUint16(0) !== 65496) return "";
		let n = 2, r = -1;
		for (; n < t.byteLength - 4 && t.getUint8(n) === 255;) {
			if (t.getUint16(n) === 65505) {
				r = n;
				break;
			}
			n += 2 + t.getUint16(n + 2);
		}
		if (r < 0 || t.getUint32(r + 4) !== 1165519206) return "";
		let i = r + 10, a = t.getUint16(i) === 18761, o = (e) => t.getUint16(e, a), s = (e) => t.getUint32(e, a), c = {
			1: 1,
			2: 1,
			3: 2,
			4: 4,
			5: 8,
			7: 1,
			9: 4,
			10: 8
		}, l = {}, u = (e) => {
			if (e + 2 > t.byteLength) return;
			let n = o(e);
			for (let r = 0; r < n; r += 1) {
				let n = e + 2 + r * 12;
				if (n + 12 > t.byteLength) break;
				let a = o(n), u = o(n + 2), d = s(n + 4), f = n + 8;
				(c[u] || 1) * d > 4 && (f = i + s(n + 8)), l[a] = {
					type: u,
					num: d,
					valOff: f
				};
			}
		}, d = (e) => {
			if (!e) return "";
			let n = "";
			for (let r = 0; r < e.num && e.valOff + r < t.byteLength; r += 1) {
				let i = t.getUint8(e.valOff + r);
				i && (n += String.fromCharCode(i));
			}
			return n.trim();
		}, f = (e) => {
			if (!e || e.valOff + 8 > t.byteLength) return null;
			let n = s(e.valOff), r = s(e.valOff + 4);
			return r ? n / r : null;
		}, p = (e) => e ? e.type === 3 ? o(e.valOff) : s(e.valOff) : null;
		u(i + s(i + 4)), l[34665] && u(i + p(l[34665]));
		let m = [], h = d(l[271]), g = d(l[272]);
		g ? m.push(h && !g.startsWith(h) ? `${h} ${g}` : g) : h && m.push(h);
		let _ = f(l[33434]);
		_ && m.push(_ >= 1 ? `${_}s` : `1/${Math.round(1 / _)}s`);
		let v = f(l[33437]);
		v && m.push(`f/${Math.round(v * 10) / 10}`);
		let y = p(l[34855]);
		y && m.push(`ISO ${y}`);
		let b = f(l[37386]);
		return b && m.push(`${Math.round(b)}mm`), m.join(" · ");
	} catch {
		return "";
	}
}
var Mt = {
	create(e, t = {}, n) {
		let r = Dt(e, t);
		if (!r) return null;
		Et ||= kt();
		let i = e.style.cursor, a = e.tagName === "IMG" ? e : e.querySelector?.("img"), o = {
			el: e,
			src: r,
			alt: t.alt || a?.alt || e.getAttribute("aria-label") || "",
			title: t.title || e.dataset.title || a?.dataset?.title || a?.alt || "",
			description: t.description || t.caption || e.dataset.description || e.dataset.caption || "",
			metadata: t.metadata,
			group: t.group || e.dataset.ktLightboxGroup || e.getAttribute("data-kt-lightbox-group") || null,
			backdropColor: t.backdropColor,
			backdropOpacity: t.backdropOpacity,
			backdropBlur: t.backdropBlur,
			duration: t.lightboxDuration ?? t.duration,
			radius: t.radius,
			toolbar: t.toolbar,
			info: t.info,
			zoom: t.zoom,
			minZoom: t.minZoom,
			maxZoom: t.maxZoom,
			zoomStep: t.zoomStep,
			wheelStep: t.wheelStep,
			doubleClickZoom: t.doubleClickZoom,
			closeOnBackdrop: t.closeOnBackdrop,
			minimap: t.minimap,
			className: t.className,
			uiTemplate: t.uiTemplate,
			renderUI: t.renderUI,
			lazyEffect: t.lazyEffect,
			lazyOptions: t.lazyOptions,
			onOpen: t.onOpen,
			onClose: t.onClose,
			onChange: t.onChange,
			onLoad: t.onLoad,
			share: t.share === !0,
			exif: t.exif === !0,
			Kineto: n
		};
		Tt.add(o), e.style.cursor = t.cursor || "zoom-in";
		let s = (e) => {
			e?.preventDefault?.(), Et.open(o);
		};
		return e.addEventListener("click", s), {
			el: e,
			type: "lightbox",
			open: s,
			close() {
				Et?.close();
			},
			next() {
				Et?.next();
			},
			prev() {
				Et?.prev();
			},
			zoom(e) {
				Et?.zoom(e);
			},
			pause() {},
			resume() {},
			destroy() {
				e.removeEventListener("click", s), e.style.cursor = i, Tt.delete(o), Tt.size || (Et?.destroy(), Et = null);
			}
		};
	},
	reduced() {}
}, Nt = null;
function Pt(e) {
	let t = getComputedStyle(e), n = t.transitionDuration.split(",").map((e) => Number.parseFloat(e) * (e.includes("ms") ? 1 : 1e3)), r = t.transitionDelay.split(",").map((e) => Number.parseFloat(e) * (e.includes("ms") ? 1 : 1e3));
	return Math.max(0, ...n.map((e, t) => e + (r[t] ?? r[0] ?? 0)));
}
var Ft = {
	create(e, t) {
		if (Nt) return Nt;
		let n = t.container || "main", r = t.linkSelector || "a[href]:not([target=\"_blank\"]):not([download]):not([data-kt-no-transition])", i = t.animationSelector || "[class*=\"transition-\"]", a = Number(t.minDuration ?? 400), o = /* @__PURE__ */ new Map(), s = null, c = !1, l = !1, u = (e, t) => {
			if (!t || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return !1;
			let n = new URL(t.href, window.location.href);
			return !(n.origin !== window.location.origin || n.pathname === window.location.pathname && n.search === window.location.search);
		}, d = async (e) => {
			if (t.cache !== !1 && o.has(e)) return o.get(e);
			s?.abort(), s = new AbortController();
			try {
				let n = await fetch(e, {
					signal: s.signal,
					headers: { "X-Kineto-Navigation": "1" }
				});
				if (!n.ok) return null;
				let r = await n.text();
				return t.cache !== !1 && o.set(e, r), r;
			} catch (e) {
				return e.name !== "AbortError" && t.onError?.(e), null;
			}
		}, f = () => {
			let e = Array.from(document.querySelectorAll(i)), t = Math.max(a, ...e.map(Pt));
			return new Promise((e) => setTimeout(e, t));
		}, p = (e) => {
			e.querySelectorAll("script").forEach((e) => {
				let t = document.createElement("script");
				Array.from(e.attributes).forEach((e) => t.setAttribute(e.name, e.value)), t.textContent = e.textContent, e.replaceWith(t);
			});
		}, m = (e, r, i) => {
			let a = new DOMParser().parseFromString(e, "text/html"), o = document.querySelector(n), s = a.querySelector(n);
			if (!o || !s) return !1;
			Z.destroy(o), o.innerHTML = s.innerHTML, Array.from(s.attributes).forEach((e) => {
				e.name !== "id" && o.setAttribute(e.name, e.value);
			}), t.executeScripts !== !1 && p(o), document.title = a.title || document.title, i || history.pushState({ kinetoUrl: r }, document.title, r), window.scrollTo({
				top: Number(t.scrollTop ?? 0),
				behavior: "auto"
			});
			let c = document.documentElement;
			return c.classList.remove("kt-is-leaving"), c.classList.add("kt-is-entering"), Z.scan(o), Z.refresh(), t.onEnter?.(o, a), requestAnimationFrame(() => requestAnimationFrame(() => {
				c.classList.remove("kt-is-animating", "kt-is-entering");
			})), !0;
		}, h = async (e, n = !1) => {
			if (l || c) return;
			l = !0;
			let r = document.documentElement;
			r.classList.add("kt-is-animating", "kt-is-leaving"), r.classList.remove("kt-is-entering"), t.onLeave?.(e);
			let [i] = await Promise.all([d(e), f()]);
			if (c) return;
			let a = i && m(i, e, n);
			l = !1, a || window.location.assign(e);
		}, g = (e) => {
			let n = e.target.closest?.(r);
			u(e, n) && (e.preventDefault(), t.onClick?.(n, e), h(n.href));
		}, _ = () => h(window.location.href, !0);
		return history.state?.kinetoUrl || history.replaceState({
			...history.state || {},
			kinetoUrl: window.location.href
		}, document.title, window.location.href), document.addEventListener("click", g), window.addEventListener("popstate", _), Nt = {
			el: document.documentElement,
			type: "pageTransition",
			navigate: h,
			pause() {},
			resume() {},
			destroy() {
				c = !0, s?.abort(), document.removeEventListener("click", g), window.removeEventListener("popstate", _), document.documentElement.classList.remove("kt-is-animating", "kt-is-leaving", "kt-is-entering"), Nt === this && (Nt = null);
			}
		}, Nt;
	},
	reduced() {}
}, It = {
	tap: [10],
	"double-tap": [
		12,
		70,
		12
	],
	soft: [6],
	rigid: [18],
	heavy: [45],
	success: [
		10,
		50,
		10,
		50,
		22
	],
	warning: [
		28,
		60,
		28
	],
	error: [
		55,
		70,
		55,
		70,
		90
	],
	ratchet: [
		7,
		22,
		7,
		22,
		7,
		22,
		7,
		22,
		7,
		22,
		7
	],
	heartbeat: [
		18,
		90,
		34,
		240,
		18,
		90,
		34
	],
	"long-press": [90]
}, Lt = {
	create(e, t) {
		if (typeof navigator > "u" || typeof navigator.vibrate != "function") return null;
		let n = It[t.preset || t.haptic] || (Array.isArray(t.pattern) ? t.pattern.map(Number) : Number(t.pattern ?? 50)), r = t.trigger || "hover", i = !0, a = null, o = () => {
			i && navigator.vibrate(n);
		};
		return r === "hover" && !window.matchMedia?.("(hover: none)").matches ? e.addEventListener("pointerenter", o) : r === "click" ? e.addEventListener("click", o) : r === "scroll" && typeof IntersectionObserver < "u" && (a = new IntersectionObserver((e) => {
			e.some((e) => e.isIntersecting) && o();
		}, { threshold: Number(t.threshold ?? .1) }), a.observe(e)), {
			el: e,
			type: "vibrate",
			play: o,
			replay: o,
			pause: () => {
				i = !1, navigator.vibrate(0);
			},
			resume: () => {
				i = !0;
			},
			destroy: () => {
				i = !1, navigator.vibrate(0), e.removeEventListener("pointerenter", o), e.removeEventListener("click", o), a?.disconnect();
			}
		};
	},
	reduced() {}
}, Rt = {
	create(e, t) {
		let n = w(e, [
			"position",
			"overflow",
			"isolation"
		]);
		getComputedStyle(e).position === "static" && (e.style.position = "relative"), t.unbounded !== !0 && (e.style.overflow = "hidden"), e.style.isolation = "isolate";
		let r = /* @__PURE__ */ new Set(), i = t.color || "currentColor", a = Math.max(0, Math.min(1, Number(t.opacity ?? .22))), o = Math.max(80, Number(t.duration ?? 520)), s = Math.max(1, Number(t.scale ?? 1)), c = (n) => {
			if (n.pointerType === "mouse" && n.button > 0) return;
			let c = e.getBoundingClientRect(), l = t.centered === !0, u = l ? c.width / 2 : n.clientX - c.left, d = l ? c.height / 2 : n.clientY - c.top, f = Math.hypot(Math.max(u, c.width - u), Math.max(d, c.height - d)) * s, p = document.createElement("span");
			p.className = "kt-ripple-wave", p.setAttribute("aria-hidden", "true"), p.style.cssText = `position:absolute;left:${u}px;top:${d}px;width:${f * 2}px;height:${f * 2}px;border-radius:50%;background:${i};opacity:${a};pointer-events:none;transform:translate(-50%,-50%) scale(0);transform-origin:center;z-index:0;will-change:transform,opacity;`, e.appendChild(p), r.add(p), p.animate([{
				transform: "translate(-50%,-50%) scale(0)",
				opacity: a
			}, {
				transform: "translate(-50%,-50%) scale(1)",
				opacity: 0
			}], {
				duration: o,
				easing: t.easing || "cubic-bezier(.2,.7,.2,1)",
				fill: "forwards"
			}).finished.catch(() => {}).finally(() => {
				r.delete(p), p.remove();
			});
		};
		return e.addEventListener("pointerdown", c), {
			el: e,
			type: "ripple",
			pause() {
				r.forEach((e) => e.getAnimations().forEach((e) => e.pause()));
			},
			resume() {
				r.forEach((e) => e.getAnimations().forEach((e) => e.play()));
			},
			destroy() {
				e.removeEventListener("pointerdown", c), r.forEach((e) => {
					e.getAnimations().forEach((e) => e.cancel()), e.remove();
				}), r.clear(), n();
			}
		};
	},
	reduced(e, t) {
		return t.disableInReducedMotion === !1 ? this.create(e, {
			...t,
			duration: Math.min(160, Number(t.duration ?? 160))
		}) : {
			el: e,
			type: "ripple",
			pause() {},
			resume() {},
			destroy() {}
		};
	}
}, zt = { create(e, t) {
	let n = t.property || "--scroll-progress", r = typeof CSS < "u" && CSS.supports?.("animation-timeline", "scroll()"), i = {
		animationName: e.style.animationName,
		animationTimeline: e.style.animationTimeline,
		animationRangeStart: e.style.animationRangeStart,
		animationRangeEnd: e.style.animationRangeEnd,
		animationFillMode: e.style.animationFillMode,
		animationPlayState: e.style.animationPlayState,
		property: e.style.getPropertyValue(n)
	};
	if (r && t.cssAnimation) return e.style.animationName = t.cssAnimation, e.style.animationTimeline = "view()", e.style.animationRangeStart = t.rangeStart || "entry 0%", e.style.animationRangeEnd = t.rangeEnd || "exit 100%", e.style.animationFillMode = "both", e.style.animationPlayState = "running", {
		el: e,
		type: "cssScroll",
		pause: () => {
			e.style.animationPlayState = "paused";
		},
		resume: () => {
			e.style.animationPlayState = "running";
		},
		destroy: () => {
			e.style.animationName = i.animationName, e.style.animationTimeline = i.animationTimeline, e.style.animationRangeStart = i.animationRangeStart, e.style.animationRangeEnd = i.animationRangeEnd, e.style.animationFillMode = i.animationFillMode, e.style.animationPlayState = i.animationPlayState, i.property ? e.style.setProperty(n, i.property) : e.style.removeProperty(n);
		}
	};
	let a = x();
	if (!a) return null;
	let o = a.create({
		trigger: e,
		start: t.start || "top bottom",
		end: t.end || "bottom top",
		scrub: !0,
		onUpdate: (r) => {
			e.style.setProperty(n, r.progress), t.onUpdate?.(r.progress, e, r);
		}
	});
	return {
		el: e,
		type: "cssScroll",
		pause: () => o.disable(),
		resume: () => o.enable(),
		destroy: () => {
			o.kill(), i.property ? e.style.setProperty(n, i.property) : e.style.removeProperty(n);
		}
	};
} }, Bt = {
	create(e, t) {
		let n = b(), r = x();
		if (!n || !r) return null;
		let i = Array.isArray(t.urls) ? t.urls : null, a = Math.max(1, Number(t.frames ?? i?.length ?? 100)), o = t.urlPrefix || "https://example.com/seq/frame_", s = t.extension || ".jpg", c = Number(t.padding ?? 3), l = {
			parent: e.parentNode,
			next: e.nextSibling,
			style: e.getAttribute("style")
		}, u = document.createElement("div");
		u.className = "kt-scroll-sequence-wrap", u.style.height = t.scrollLength || `${Math.max(2, a * Number(t.vhPerFrame ?? 3))}vh`, l.parent.insertBefore(u, e), u.appendChild(e), e.style.position = "sticky", e.style.top = t.top == null ? "0" : typeof t.top == "number" ? `${t.top}px` : String(t.top), e.style.height = t.height || "100vh", e.style.overflow = "hidden";
		let d = document.createElement("canvas");
		d.setAttribute("aria-hidden", "true"), d.style.cssText = "display:block;width:100%;height:100%;", e.appendChild(d);
		let f = d.getContext("2d"), p = Array(a), m = Array(a).fill("idle"), h = { frame: 0 }, g = 1, _ = 1, v = 1, y = (e) => i?.[e] || `${o}${String(e + 1).padStart(c, "0")}${s}`, S = (e) => {
			if (e < 0 || e >= a || m[e] !== "idle") return;
			m[e] = "loading";
			let n = new Image();
			t.crossOrigin && (n.crossOrigin = t.crossOrigin), n.decoding = "async", n.onload = () => {
				m[e] = "loaded", p[e] = n, (Math.round(h.frame) === e || e === 0) && w(e);
			}, n.onerror = () => {
				m[e] = "error", t.onError?.(e, n.src);
			}, n.src = y(e), p[e] = n;
		}, C = (e) => {
			let n = Number(t.preloadRadius ?? 8);
			for (let t = -n; t <= n; t += 1) S(e + t);
		}, w = (e) => {
			let n = p[e];
			if (!n || m[e] !== "loaded" || !n.naturalWidth) {
				C(e);
				return;
			}
			f.clearRect(0, 0, d.width, d.height), f.imageSmoothingEnabled = !0;
			let r = n.naturalWidth / n.naturalHeight, i = g / _, a, o, s, c;
			if ((t.fit || "cover") === "contain") {
				let e = Math.min(g / n.naturalWidth, _ / n.naturalHeight);
				a = n.naturalWidth * e, o = n.naturalHeight * e;
			} else r > i ? (o = _, a = _ * r) : (a = g, o = g / r);
			s = (g - a) / 2, c = (_ - o) / 2, f.drawImage(n, s * v, c * v, a * v, o * v), t.onFrame?.(e, n, d);
		}, T = () => {
			let n = e.getBoundingClientRect();
			g = Math.max(1, n.width || window.innerWidth), _ = Math.max(1, n.height || window.innerHeight), v = Math.min(window.devicePixelRatio || 1, Number(t.maxDpr ?? 2)), d.width = Math.round(g * v), d.height = Math.round(_ * v), w(Math.round(h.frame));
		}, E = typeof ResizeObserver < "u" ? new ResizeObserver(T) : null;
		E?.observe(e), window.addEventListener("resize", T), T(), S(0), C(0);
		let D = n.to(h, {
			frame: a - 1,
			snap: { frame: 1 },
			ease: "none",
			scrollTrigger: {
				trigger: u,
				start: t.start || "top top",
				end: t.end || "bottom bottom",
				scrub: t.scrub ?? .5,
				invalidateOnRefresh: !0
			},
			onUpdate: () => {
				let e = Math.round(h.frame);
				C(e), w(e);
			}
		});
		return {
			el: e,
			type: "scrollSequence",
			pause: () => D.pause(),
			resume: () => D.resume(),
			destroy: () => {
				E?.disconnect(), window.removeEventListener("resize", T), D.scrollTrigger?.kill(), D.kill(), p.forEach((e) => {
					e && (e.onload = null, e.onerror = null);
				}), d.remove(), u.parentNode && (u.parentNode.insertBefore(e, u), u.remove()), l.style == null ? e.removeAttribute("style") : e.setAttribute("style", l.style), l.next && l.next.parentNode === l.parent && l.parent.insertBefore(e, l.next);
			}
		};
	},
	reduced(e, t) {
		let n = Array.isArray(t.urls) ? t.urls[0] : `${t.urlPrefix || "https://example.com/seq/frame_"}${"1".padStart(Number(t.padding ?? 3), "0")}${t.extension || ".jpg"}`;
		if (!n) return null;
		let r = e.getAttribute("style");
		return e.style.backgroundImage = `url("${n}")`, e.style.backgroundSize = t.fit || "cover", e.style.backgroundPosition = "center", {
			el: e,
			type: "scrollSequence",
			pause() {},
			resume() {},
			destroy() {
				r == null ? e.removeAttribute("style") : e.setAttribute("style", r);
			}
		};
	}
};
//#endregion
//#region src/modules/brushReveal.js
function Vt(e, t, n, r) {
	let i = Math.max(n / e, r / t), a = Math.min(e, n / i), o = Math.min(t, r / i);
	return {
		sx: (e - a) / 2,
		sy: (t - o) / 2,
		sw: a,
		sh: o
	};
}
//#endregion
//#region src/index.js
var Ht = {
	parallax: se,
	mouseParallax: ce,
	reveal: fe,
	counter: ye,
	lazy: Me,
	textSplit: Ie,
	blurText: Le,
	shuffle: ze,
	typewriter: Be,
	textReveal: Ve,
	textTransition: Ue,
	magnetic: We,
	marquee: Ge,
	overflowText: Qe,
	loader: tt,
	tilt: nt,
	cursor: st,
	textFill: ct,
	stickyStack: ut,
	scrollVelocity: dt,
	progress: mt,
	slider: ht,
	ambientMedia: vt,
	pageReveal: yt,
	glitch: St,
	cardGlow: wt,
	lightbox: Mt,
	pageTransition: Ft,
	vibrate: Lt,
	ripple: Rt,
	cssScroll: zt,
	scrollSequence: Bt,
	brushReveal: {
		create(e, t = {}) {
			let n = t.src || t.revealSrc || e.getAttribute("data-reveal-src") || "";
			if (!n) return null;
			let r = Math.max(8, Number(t.radius ?? 80)), i = h(Number(t.softness ?? .55), 0, 1), a = Math.max(0, Number(t.blur ?? 0)), o = t.persist === !0, s = h(Number(t.fade ?? .045), .002, .5), c = h(Number(t.maxDpr ?? 2), 1, 3), l = e.getAttribute("style");
			getComputedStyle(e).position === "static" && (e.style.position = "relative"), e.style.touchAction = "none";
			let u = document.createElement("canvas");
			u.className = "kt-brush-reveal-canvas", u.setAttribute("aria-hidden", "true"), u.style.cssText = "position:absolute;inset:0;width:100%;height:100%;pointer-events:none;border-radius:inherit;z-index:2;", e.appendChild(u);
			let d = u.getContext("2d", { alpha: !0 }), f = document.createElement("canvas"), p = f.getContext("2d", { alpha: !0 }), m = new Image();
			m.decoding = "async", t.crossOrigin && (m.crossOrigin = t.crossOrigin);
			let g = !1;
			m.onload = () => {
				g = !0;
			}, m.onerror = () => t.onError?.(/* @__PURE__ */ Error(`Kineto brushReveal image failed to load: ${n}`), e), m.src = n;
			let _ = 0, v = 0, y = 1, b = null, x = !0, S = !1, C = !1, w = 0, T = null, E = null, D = () => {
				let t = e.getBoundingClientRect();
				_ = Math.max(1, t.width), v = Math.max(1, t.height), y = h(window.devicePixelRatio || 1, 1, c);
				let n = Math.max(1, Math.round(_ * y)), r = Math.max(1, Math.round(v * y));
				(u.width !== n || u.height !== r) && (u.width = n, u.height = r, f.width = n, f.height = r);
			};
			D();
			let O = (e, n) => {
				let o = e * y, s = n * y, c = r * y, l = c * (1 - i), u = h(Number(t.opacity ?? 1), .05, 1), d = p.createRadialGradient(o, s, Math.max(.5, l), o, s, c);
				d.addColorStop(0, `rgba(255,255,255,${u})`), d.addColorStop(1, "rgba(255,255,255,0)"), p.save(), p.globalCompositeOperation = "source-over", a > 0 && "filter" in p && (p.filter = `blur(${a * y}px)`), p.fillStyle = d, p.beginPath(), p.arc(o, s, c, 0, Math.PI * 2), p.fill(), p.restore(), a > 0 && (p.save(), p.globalCompositeOperation = "source-over", p.fillStyle = `rgba(255,255,255,${u})`, p.beginPath(), p.arc(o, s, Math.max(.5, l), 0, Math.PI * 2), p.fill(), p.restore()), C = !0, w = Math.min(1.5, w + .06);
			}, k = (e, t) => {
				if (T == null) O(e, t);
				else {
					let n = Math.hypot(e - T, t - E), i = Math.max(1, Math.ceil(n / (r * .35)));
					for (let n = 1; n <= i; n += 1) O(T + (e - T) * n / i, E + (t - E) * n / i);
				}
				T = e, E = t;
			}, A = () => {
				if (x) {
					if (!o && C) {
						let e = Math.min(.5, s * (w < .22 ? 4 : 1));
						p.globalCompositeOperation = "destination-out", p.fillStyle = `rgba(0,0,0,${e})`, p.fillRect(0, 0, f.width, f.height), w *= 1 - e;
					}
					if (S && T != null && O(T, E), d.clearRect(0, 0, u.width, u.height), g && C) {
						let e = Vt(m.naturalWidth, m.naturalHeight, u.width, u.height);
						d.globalCompositeOperation = "source-over", d.drawImage(m, e.sx, e.sy, e.sw, e.sh, 0, 0, u.width, u.height), d.globalCompositeOperation = "destination-in", d.drawImage(f, 0, 0), d.globalCompositeOperation = "source-over";
					}
					if (!o && !S && w < .008) {
						C = !1, w = 0, p.clearRect(0, 0, f.width, f.height), d.clearRect(0, 0, u.width, u.height), b = null;
						return;
					}
					b = S || !o && C || o && S ? requestAnimationFrame(A) : null;
				}
			}, j = () => {
				x && b == null && (b = requestAnimationFrame(A));
			}, M = () => {
				S = !0, T = null, E = null, D(), j();
			}, N = (t) => {
				if (!S) return;
				let n = e.getBoundingClientRect();
				k(t.clientX - n.left, t.clientY - n.top), j();
			}, P = () => {
				S = !1, T = null, E = null, j();
			}, F = (t) => {
				S = !0, D(), e.setPointerCapture?.(t.pointerId);
				let n = e.getBoundingClientRect();
				T = t.clientX - n.left, E = t.clientY - n.top, O(T, E), j();
			}, I = (e) => {
				e.pointerType !== "mouse" && (S = !1, T = null, E = null), j();
			};
			e.addEventListener("pointerenter", M), e.addEventListener("pointerdown", F), e.addEventListener("pointermove", N, { passive: !0 }), e.addEventListener("pointerup", I), e.addEventListener("pointercancel", I), e.addEventListener("pointerleave", P);
			let L = typeof ResizeObserver < "u" ? new ResizeObserver(D) : null;
			return L?.observe(e), {
				el: e,
				type: "brushReveal",
				clear() {
					p.clearRect(0, 0, f.width, f.height), d.clearRect(0, 0, u.width, u.height), C = !1, w = 0;
				},
				replay() {
					this.clear();
				},
				pause() {
					x = !1, b != null && cancelAnimationFrame(b), b = null;
				},
				resume() {
					x || (x = !0, j());
				},
				destroy() {
					x = !1, b != null && cancelAnimationFrame(b), e.removeEventListener("pointerenter", M), e.removeEventListener("pointerdown", F), e.removeEventListener("pointermove", N), e.removeEventListener("pointerup", I), e.removeEventListener("pointercancel", I), e.removeEventListener("pointerleave", P), L?.disconnect(), u.remove(), l == null ? e.removeAttribute("style") : e.setAttribute("style", l);
				}
			};
		},
		reduced() {}
	},
	fullpage: {
		create(e, t) {
			let n = e.innerHTML, r = e.getAttribute("style"), i = t.sectionSelector ? Array.from(e.querySelectorAll(t.sectionSelector)) : Array.from(e.children);
			if (!i.length) return null;
			let a = Math.max(.15, Number(t.duration ?? .75)), o = typeof t.ease == "string" && (t.ease.includes("(") || t.ease.startsWith("ease") || t.ease === "linear") ? t.ease : "cubic-bezier(.76,0,.24,1)", s = t.loop === !0, c = i.map((e, t) => {
				if (t === 0) return null;
				let n = e.getAttribute("data-kt-fp-axis");
				return n === "x" || n === "y" ? n : null;
			}), l = t.axis === "mixed" || c.some(Boolean), u = t.mode === "snap" && !l, d = t.axis === "x", f = [{
				x: 0,
				y: 0
			}];
			for (let e = 1; e < i.length; e += 1) {
				let t = c[e] || "x", n = f[e - 1];
				f.push(t === "y" ? {
					x: n.x,
					y: n.y + 1
				} : {
					x: n.x + 1,
					y: n.y
				});
			}
			let p = d || l, m = Math.max(4, Number(t.threshold ?? 24)), h = Math.max(0, Number(t.autoAdvance || 0)), g = null, _ = Math.min(i.length - 1, Math.max(0, Number(t.initial ?? 0))), v = !1, y = !0;
			t.height ? e.style.height = typeof t.height == "number" ? `${t.height}px` : String(t.height) : e.clientHeight < 10 && (e.style.height = "100svh"), e.classList.add("kt-fullpage"), e.style.position = "relative", e.style.overflow = "hidden", e.style.overscrollBehavior = "contain";
			let b = () => {
				let t = e.parentElement;
				for (; t && t !== document.body && t !== document.documentElement;) {
					let e = getComputedStyle(t);
					if (/(auto|scroll|overlay)/.test(e.overflowY) && t.scrollHeight > t.clientHeight) return t;
					t = t.parentElement;
				}
				return null;
			}, x = document.createElement("div");
			x.className = "kt-fullpage-track", x.style.cssText = l ? "position:relative;height:100%;width:100%;will-change:transform;" : d ? "height:100%;width:100%;display:flex;will-change:transform;" : "height:100%;will-change:transform;", i.forEach((e, t) => {
				e.classList.add("kt-fullpage-section"), e.style.height = "100%", l ? (e.style.position = "absolute", e.style.top = "0", e.style.left = "0", e.style.width = "100%", e.style.transform = `translate3d(${f[t].x * 100}%,${f[t].y * 100}%,0)`) : d && (e.style.flex = "0 0 100%"), e.style.overflowX = "hidden", e.style.overflowY = "hidden", x.appendChild(e);
			}), e.appendChild(x), e.style.touchAction = d ? "pan-y" : "none";
			let S = null;
			u && (d ? (e.style.overflowX = "auto", e.style.scrollSnapType = "x mandatory", x.style.width = `${i.length * 100}%`, i.forEach((e) => {
				e.style.flex = `0 0 ${100 / i.length}%`, e.style.scrollSnapAlign = "start";
			})) : (e.style.overflowY = "auto", e.style.scrollSnapType = "y mandatory", x.style.height = `${i.length * 100}%`, i.forEach((e) => {
				e.style.height = `${100 / i.length}%`, e.style.scrollSnapAlign = "start";
			})), S = () => {
				let n = d ? e.scrollLeft / Math.max(1, e.clientWidth) : e.scrollTop / Math.max(1, e.clientHeight), r = Math.min(i.length - 1, Math.max(0, Math.round(n)));
				r !== _ && (_ = r, T(), t.onChange?.(_, i[_]));
			}, e.addEventListener("scroll", S, { passive: !0 }));
			let C = null, w = [], T = () => w.forEach((e, t) => {
				let n = t === _;
				e.setAttribute("aria-current", n ? "true" : "false"), e.style.transform = n ? "scale(1.45)" : "scale(1)", e.style.opacity = n ? "1" : ".45";
			});
			t.dots !== !1 && (C = document.createElement("div"), C.className = "kt-fullpage-dots", C.setAttribute("role", "tablist"), C.style.cssText = p ? "position:absolute;left:50%;bottom:12px;transform:translateX(-50%);display:flex;flex-direction:row;gap:10px;z-index:5;" : "position:absolute;right:14px;top:50%;transform:translateY(-50%);display:flex;flex-direction:column;gap:10px;z-index:5;", w = i.map((e, t) => {
				let n = document.createElement("button");
				return n.type = "button", n.className = "kt-fullpage-dot", n.setAttribute("aria-label", `Go to section ${t + 1}`), n.style.cssText = "width:8px;height:8px;border-radius:50%;border:0;padding:0;cursor:pointer;background:var(--kt-fullpage-dot,currentColor);opacity:.45;transition:transform .25s ease,opacity .25s ease;", n.addEventListener("click", () => D(t)), C.appendChild(n), n;
			}), e.appendChild(C));
			let E = () => {
				v = !1;
			};
			x.addEventListener("transitionend", E);
			let D = (e, n = !1) => {
				if (!y) return;
				let r = e;
				if (s && (r = (e + i.length) % i.length), r = Math.min(i.length - 1, Math.max(0, r)), r === _ && !n) return;
				let c = _;
				_ = r, t.onLeave?.(c, _, i[c]), u ? i[_].scrollIntoView(d ? {
					behavior: n ? "auto" : "smooth",
					inline: "start",
					block: "nearest"
				} : {
					behavior: n ? "auto" : "smooth",
					block: "start"
				}) : (v = !n, x.style.transition = n ? "none" : `transform ${a}s ${o}`, x.style.transform = l ? `translate3d(${-f[_].x * 100}%,${-f[_].y * 100}%,0)` : d ? `translate3d(${-_ * 100}%,0,0)` : `translate3d(0,${-_ * 100}%,0)`, n || setTimeout(E, a * 1e3 + 120)), T(), h && M(), t.onChange?.(_, i[_]);
			}, O = (e) => s || (e > 0 ? _ < i.length - 1 : _ > 0), k = () => i.forEach((e) => {
				e.style.overflowY = e.scrollHeight > e.clientHeight + 2 ? "auto" : "hidden";
			}), A = (e) => {
				let t = i[_];
				if (!t) return !1;
				let n = t.scrollHeight - t.clientHeight;
				return n <= 2 ? !1 : e > 0 ? t.scrollTop < n - 1 : t.scrollTop > 1;
			}, j = () => {
				g &&= (clearInterval(g), null);
			}, M = () => {
				!h || !y || (j(), g = setInterval(() => {
					v || (_ >= i.length - 1 && !s ? D(0) : D(_ + 1));
				}, h));
			}, N = 0, P = 0, F = !1, I = (t) => {
				if (u && !d) return;
				let n = performance.now(), r = n - P < 140;
				P = n, r || (F = !1);
				let o = t.deltaMode === 1 ? 16 : t.deltaMode === 2 ? e.clientHeight : 1, s = t.deltaY * o, c = t.deltaX * o, l = p && Math.abs(c) >= Math.abs(s) ? c : s;
				if (Math.abs(l) < 4) return;
				let f = l > 0 ? 1 : -1;
				if (!d && A(f)) {
					t.preventDefault(), t.stopPropagation(), i[_].scrollTop += s, h && M();
					return;
				}
				let m = b();
				if (m) {
					let n = e.getBoundingClientRect(), r = m.getBoundingClientRect();
					if (!(n.top <= r.top + 1 && n.bottom >= r.bottom - 1)) {
						t.preventDefault(), t.stopPropagation(), m.scrollTop += s;
						return;
					}
				}
				if (!O(f)) {
					if (t.preventDefault(), t.stopPropagation(), v || F) return;
					m ? m.scrollTop += s : window.scrollBy(0, s);
					return;
				}
				t.preventDefault(), t.stopPropagation(), !(v || n < N) && (N = n + Math.max(320, a * 1e3 + 90), D(_ + f), O(f) || (F = !0));
			}, L = null, R = null, z = !1, B = (e) => {
				let t = L.x - e.x, n = L.y - e.y;
				return d || l && Math.abs(t) >= Math.abs(n) ? t : n;
			}, V = (e) => {
				let t = e.touches[0];
				L = {
					x: t.clientX,
					y: t.clientY
				}, R = {
					x: t.clientX,
					y: t.clientY
				}, z = !1;
			}, H = (t) => {
				if (u || !L) return;
				let n = t.touches[0], r = {
					x: n.clientX,
					y: n.clientY
				}, a = R.y - r.y;
				R = r;
				let o = B(r);
				if (Math.abs(o) < 3) return;
				let s = o > 0 ? 1 : -1;
				if (!d && A(s)) {
					t.preventDefault(), i[_].scrollTop += a;
					return;
				}
				let c = d ? null : b();
				if (c) {
					let n = e.getBoundingClientRect(), r = c.getBoundingClientRect();
					if (!(n.top <= r.top + 1 && n.bottom >= r.bottom - 1)) {
						t.preventDefault(), c.scrollTop += a;
						return;
					}
				}
				if (v || z) {
					t.preventDefault();
					return;
				}
				if (!O(s)) {
					d || (t.preventDefault(), c ? c.scrollTop += a : window.scrollBy(0, a));
					return;
				}
				t.preventDefault(), Math.abs(o) >= m && (z = !0, D(_ + s));
			}, U = () => {
				L = null, R = null;
			}, W = (t) => {
				if (!e.contains(document.activeElement)) return;
				let n = l ? [
					"ArrowRight",
					"ArrowDown",
					"PageDown",
					" "
				] : d ? [
					"ArrowRight",
					"PageDown",
					" "
				] : [
					"ArrowDown",
					"PageDown",
					" "
				], r = l ? [
					"ArrowLeft",
					"ArrowUp",
					"PageUp"
				] : d ? ["ArrowLeft", "PageUp"] : ["ArrowUp", "PageUp"], a = n.includes(t.key), o = r.includes(t.key);
				!a && !o && t.key !== "Home" && t.key !== "End" || (t.preventDefault(), t.key === "Home" ? D(0) : t.key === "End" ? D(i.length - 1) : D(_ + (a ? 1 : -1)));
			}, G = null, K = !1, ee = (t) => {
				u || t.pointerType !== "mouse" || t.button !== 0 || t.target.closest(".kt-fullpage-dot") || (G = d ? t.clientX : t.clientY, K = !1, e.style.cursor = "grabbing");
			}, te = (e) => {
				if (G == null || K || v || e.pointerType !== "mouse") return;
				let t = G - (d ? e.clientX : e.clientY);
				if (Math.abs(t) >= m) {
					K = !0;
					let e = t > 0 ? 1 : -1;
					O(e) && D(_ + e);
				}
			}, q = () => {
				G = null, e.style.cursor = t.drag === !1 ? "" : "grab";
			};
			t.drag !== !1 && !u && (e.style.cursor = "grab", e.style.userSelect = "none", e.addEventListener("pointerdown", ee), window.addEventListener("pointermove", te), window.addEventListener("pointerup", q)), t.wheel !== !1 && e.addEventListener("wheel", I, { passive: !1 }), t.touch !== !1 && (e.addEventListener("touchstart", V, { passive: !0 }), e.addEventListener("touchmove", H, { passive: !1 }), e.addEventListener("touchend", U, { passive: !0 })), t.keyboard !== !1 && (e.hasAttribute("tabindex") || e.setAttribute("tabindex", "0"), e.addEventListener("keydown", W)), D(_, !0), requestAnimationFrame(k);
			let J = null;
			return typeof ResizeObserver < "u" && (J = new ResizeObserver(k), J.observe(e)), M(), {
				el: e,
				type: "fullpage",
				go: D,
				next: () => D(_ + 1),
				prev: () => D(_ - 1),
				get index() {
					return _;
				},
				pause() {
					j();
				},
				resume() {
					M();
				},
				destroy() {
					y = !1, j(), J?.disconnect(), e.removeEventListener("wheel", I), e.removeEventListener("touchstart", V), e.removeEventListener("touchmove", H), e.removeEventListener("touchend", U), e.removeEventListener("keydown", W), e.removeEventListener("pointerdown", ee), window.removeEventListener("pointermove", te), window.removeEventListener("pointerup", q), S && e.removeEventListener("scroll", S), x.removeEventListener("transitionend", E), e.classList.remove("kt-fullpage"), e.innerHTML = n, r == null ? e.removeAttribute("style") : e.setAttribute("style", r);
				}
			};
		},
		reduced(e, t) {
			let n = e.getAttribute("style"), r = t.sectionSelector ? Array.from(e.querySelectorAll(t.sectionSelector)) : Array.from(e.children);
			e.clientHeight < 10 && !t.height && (e.style.height = "100svh"), e.style.overflowY = "auto", e.style.scrollSnapType = "y proximity";
			let i = r.map((e) => {
				let t = e.getAttribute("style");
				return e.style.minHeight = "100%", e.style.scrollSnapAlign = "start", () => {
					t == null ? e.removeAttribute("style") : e.setAttribute("style", t);
				};
			});
			return {
				el: e,
				type: "fullpage",
				pause() {},
				resume() {},
				destroy() {
					i.forEach((e) => e()), n == null ? e.removeAttribute("style") : e.setAttribute("style", n);
				}
			};
		}
	}
};
Object.entries(Ht).forEach(([e, t]) => Z.register(e, t));
var $ = (e) => (t, n) => Z[e](t, n), Ut = $("parallax"), Wt = $("mouseParallax"), Gt = $("reveal"), Kt = $("counter"), qt = $("lazy"), Jt = $("textSplit"), Yt = $("blurText"), Xt = $("shuffle"), Zt = $("typewriter"), Qt = $("textReveal"), $t = $("textTransition"), en = $("magnetic"), tn = $("marquee"), nn = $("overflowText"), rn = $("loader"), an = $("tilt"), on = $("cursor"), sn = $("textFill"), cn = $("stickyStack"), ln = $("scrollVelocity"), un = $("progress"), dn = $("slider"), fn = $("ambientMedia"), pn = $("pageReveal"), mn = $("glitch"), hn = $("cardGlow"), gn = $("lightbox"), _n = $("pageTransition"), vn = $("vibrate"), yn = $("ripple"), bn = $("cssScroll"), xn = $("scrollSequence"), Sn = $("brushReveal"), Cn = $("fullpage"), wn = Z;
//#endregion
export { fn as ambientMedia, Yt as blurText, Sn as brushReveal, hn as cardGlow, Kt as counter, bn as cssScroll, on as cursor, wn as default, Cn as fullpage, mn as glitch, qt as lazy, gn as lightbox, rn as loader, en as magnetic, tn as marquee, Ht as modules, Wt as mouseParallax, nn as overflowText, pn as pageReveal, _n as pageTransition, Ut as parallax, un as progress, Gt as reveal, yn as ripple, xn as scrollSequence, ln as scrollVelocity, Xt as shuffle, dn as slider, cn as stickyStack, sn as textFill, Qt as textReveal, Jt as textSplit, $t as textTransition, an as tilt, Zt as typewriter, vn as vibrate };
