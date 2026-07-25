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
var d = { spring: !1 };
function f(e = {}) {
	Object.assign(d, e);
}
function p() {
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
var m = null;
function h() {
	return typeof DeviceOrientationEvent > "u" ? Promise.resolve(!1) : typeof DeviceOrientationEvent.requestPermission == "function" ? m || (m = new Promise((e) => {
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
	}), m) : Promise.resolve(!0);
}
function g(e, t, n) {
	return e + (t - e) * n;
}
function _(e, t, n) {
	return Math.min(n, Math.max(t, e));
}
function v(e) {
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
function y(e) {
	return e.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
}
function b(e, t = typeof document < "u" ? document : null) {
	return !e || !t ? [] : typeof e == "string" ? Array.from(t.querySelectorAll(e)) : typeof window < "u" && e === window || typeof document < "u" && e === document || typeof Element < "u" && e instanceof Element ? [e] : typeof NodeList < "u" && e instanceof NodeList || typeof HTMLCollection < "u" && e instanceof HTMLCollection || Array.isArray(e) || (typeof e == "object" || typeof e == "function") && typeof Symbol < "u" && typeof e[Symbol.iterator] == "function" ? Array.from(e).filter(Boolean) : [];
}
function x(e, t) {
	let n = {}, r = `kt${t[0].toUpperCase()}${t.slice(1)}`;
	for (let [t, i] of Object.entries(e.dataset || {})) {
		if (!t.startsWith("kt")) continue;
		if (t === r) {
			let e = v(i);
			e && typeof e == "object" && !Array.isArray(e) ? Object.assign(n, e) : e !== !0 && e !== "" && (n.preset = e);
			continue;
		}
		let e = t.slice(2);
		e && (n[e[0].toLowerCase() + e.slice(1)] = v(i));
	}
	return n;
}
function S() {
	return l();
}
function C() {
	return u();
}
function w(e, t, n = {}) {
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
function T(e, t) {
	let n = new Map(t.map((t) => [t, e.getAttribute(t)]));
	return () => {
		n.forEach((t, n) => {
			t == null ? e.removeAttribute(n) : e.setAttribute(n, t);
		});
	};
}
function E(e, t) {
	let n = new Map(t.map((t) => [t, e.style[t]]));
	return () => {
		n.forEach((t, n) => {
			e.style[n] = t;
		});
	};
}
function D(e, t, n = () => {}) {
	return {
		el: e,
		type: t,
		pause() {},
		resume() {},
		destroy: n
	};
}
var O = [
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
], k = [
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
], A = /* @__PURE__ */ ".ㄱ.ㄲ.ㄳ.ㄴ.ㄵ.ㄶ.ㄷ.ㄹ.ㄺ.ㄻ.ㄼ.ㄽ.ㄾ.ㄿ.ㅀ.ㅁ.ㅂ.ㅄ.ㅅ.ㅆ.ㅇ.ㅈ.ㅊ.ㅋ.ㅌ.ㅍ.ㅎ".split(".");
function j(e) {
	let t = e.codePointAt(0);
	if (t < 44032 || t > 55203) return null;
	let n = t - 44032, r = Math.floor(n / 588), i = Math.floor(n % 588 / 28), a = n % 28;
	return {
		cho: r,
		jung: i,
		jong: a,
		pieces: [
			O[r],
			k[i],
			...a ? [A[a]] : []
		]
	};
}
function M(e) {
	let t = j(e);
	if (!t) return [e];
	let n = [O[t.cho]], r = String.fromCharCode(44032 + t.cho * 588 + t.jung * 28);
	return n.push(r), t.jong && n.push(e), n;
}
function N(e, t = !1) {
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
		pieces: j(e)?.pieces || [e],
		frames: M(e)
	})) : n;
}
function P(e, { decimals: t = 0, format: n = "", locale: r } = {}) {
	let i = Number(e);
	return Number.isFinite(i) ? n === "," || r ? new Intl.NumberFormat(r || "en-US", {
		minimumFractionDigits: t,
		maximumFractionDigits: t
	}).format(i) : i.toFixed(t) : String(e);
}
function F(e) {
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
function I(e) {
	let t = e.scrambleFade === !0, n = e.rainbow === !0 && !t;
	if (!n && !t) return null;
	let r = e.rainbowColors;
	typeof r == "string" && (r = r.split(",").map((e) => e.trim()).filter(Boolean));
	let i = Array.isArray(r) && r.length ? r.map(F).filter(Boolean) : null, a = () => {
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
var L = /* @__PURE__ */ new Map(), R = /* @__PURE__ */ new Set(), z = /* @__PURE__ */ new WeakMap(), B = !1, V = !1, H = null, U = null, W = null, G = null, ee = null, te = null, K = {
	smooth: !1,
	smoothOptions: {
		lerp: .08,
		wheelMultiplier: 1,
		smoothWheel: !0
	},
	respectReducedMotion: !0,
	forceReducedMotion: !1,
	performance: "auto",
	spring: !1,
	debug: !1
};
function q(...e) {
	K.debug && console.info("[Kineto]", ...e);
}
function J(e, t, n, r) {
	let i = e || D(t, n), a = {};
	return Object.defineProperties(a, Object.getOwnPropertyDescriptors(i)), a.el = i.el || t, a.sourceEl = t, a.type = i.type || n, a.options = r, a.pause = typeof i.pause == "function" ? i.pause.bind(i) : () => {}, a.resume = typeof i.resume == "function" ? i.resume.bind(i) : () => {}, a.destroy = typeof i.destroy == "function" ? i.destroy.bind(i) : () => {}, a;
}
function ne(e, t = !1) {
	let n = z.get(e);
	return !n && t && (n = /* @__PURE__ */ new Map(), z.set(e, n)), n;
}
function re(e, t, n, r) {
	let i = J(n, e, t, r), a = {
		sourceEl: e,
		name: t,
		instance: i,
		options: r,
		destroyImplementation: i.destroy,
		destroying: !1
	};
	return i.destroy = () => Y(a), R.add(a), ne(e, !0).set(t, a), i;
}
function Y(e, t = !0, n = !0) {
	if (!e || !R.has(e) || e.destroying) return;
	e.destroying = !0, R.delete(e);
	let r = ne(e.sourceEl);
	if (r?.delete(e.name), r?.size === 0 && z.delete(e.sourceEl), t) try {
		e.destroyImplementation();
	} catch (t) {
		console.error(`[Kineto/${e.name}] destroy() failed:`, t);
	}
	n && R.size === 0 && se();
}
function X(e, t) {
	return t.some((t) => typeof document < "u" && t === document || typeof window < "u" && t === window || e.sourceEl === t || e.instance.el === t || typeof t.contains == "function" && (t.contains(e.sourceEl) || t.contains(e.instance.el)));
}
function ie() {
	if (B || Z.env.ssr) return;
	B = !0, ce();
	let e = S(), t = C(), n = Z.performance;
	try {
		t?.config?.({ ignoreMobileResize: !0 });
	} catch {}
	K.smooth && n !== "low" && ae(e, t), ee = () => {
		let e = document.hidden ? "pause" : "resume";
		R.forEach(({ instance: t, name: n }) => {
			try {
				t[e]();
			} catch (t) {
				console.error(`[Kineto/${n}] ${e}() failed:`, t);
			}
		});
	}, document.addEventListener("visibilitychange", ee);
}
function ae(t = S(), n = C()) {
	if (U || Z.env.ssr || !K.smooth || Z.performance === "low") return U;
	try {
		if (U = new e(K.smoothOptions), n && U.on("scroll", n.update), t?.ticker) G = (e) => U?.raf(e * 1e3), t.ticker.add(G), t.ticker.lagSmoothing(0);
		else {
			let e = (t) => {
				U?.raf(t), U && (W = requestAnimationFrame(e));
			};
			W = requestAnimationFrame(e);
		}
	} catch (e) {
		U = null, q("Lenis initialization skipped.", e);
	}
	return U;
}
function oe() {
	let e = S();
	G && e?.ticker && e.ticker.remove(G), G = null, W && cancelAnimationFrame(W), W = null, U?.destroy?.(), U = null;
}
function se() {
	ee && typeof document < "u" && document.removeEventListener("visibilitychange", ee), ee = null, H && typeof document < "u" && document.removeEventListener("DOMContentLoaded", H), H = null, oe(), B = !1, V = !1;
}
function ce() {
	if (typeof document > "u" || document.getElementById("kineto-inline-fallback")) return;
	let e = document.createElement("style");
	e.id = "kineto-inline-fallback", e.textContent = "\n    @property --kt-angle { syntax: \"<angle>\"; initial-value: 0deg; inherits: false; }\n    @keyframes kt-border-spin { to { --kt-angle: 360deg; } }\n    @keyframes kt-shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }\n    @keyframes kt-aurora { to { transform: rotate(360deg); } }\n    @keyframes kt-aurora-drift { 0% { transform: translate3d(-3%,-2%,0) scale(1.06); } 100% { transform: translate3d(3%,2%,0) scale(1.12); } }\n    @keyframes kt-caret { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }\n    .kt-cursor-active, .kt-cursor-active * { cursor: none !important; }\n    .kt-cursor-scope, .kt-cursor-scope * { cursor: none !important; }\n    .kt-tw-caret { animation: kt-caret .8s step-end infinite; }\n    .kt-slide { position: relative; flex: 0 0 100%; min-width: 0; }\n    .kt-slider-wrap { position: relative; overflow: hidden; }\n    @media (prefers-reduced-motion: reduce) {\n      [data-kt-reveal], [data-kt-text-split], [data-kt-blur-text] { opacity: 1 !important; transform: none !important; filter: none !important; }\n    }\n  ", document.head.appendChild(e);
}
var Z = {
	version: "0.8.42",
	get env() {
		return te ||= p(), te;
	},
	get performance() {
		return K.performance === "auto" ? this.env.perf : K.performance;
	},
	get registry() {
		return Object.fromEntries(L);
	},
	get instanceCount() {
		return R.size;
	},
	get smoothEnabled() {
		return !!U;
	},
	get lenis() {
		return U;
	},
	config(e = {}) {
		return e.smoothOptions && (K.smoothOptions = {
			...K.smoothOptions,
			...e.smoothOptions
		}), Object.assign(K, {
			...e,
			smoothOptions: K.smoothOptions
		}), e.spring !== void 0 && f({ spring: e.spring === !0 }), te = null, this;
	},
	setAnimationEngine: c,
	enableSmooth(e = {}) {
		return K.smooth = !0, K.smoothOptions = {
			...K.smoothOptions,
			...e
		}, B ? ae() : ie(), this;
	},
	disableSmooth() {
		return K.smooth = !1, oe(), this;
	},
	toggleSmooth(e, t = {}) {
		return (typeof e == "boolean" ? e : !K.smooth) ? this.enableSmooth(t) : this.disableSmooth();
	},
	scrollTo(e, t = {}) {
		return U ? (U.scrollTo(e, t), this) : (typeof e == "number" ? window.scrollTo({
			top: e,
			behavior: t.behavior || "smooth"
		}) : b(e)[0]?.scrollIntoView?.({
			behavior: t.behavior || "smooth",
			block: t.block || "start"
		}), this);
	},
	register(e, t) {
		return !e || !t || typeof t.create != "function" ? (console.warn(`[Kineto] Module "${e}" needs a create() function.`), this) : (L.set(e, t), this[e] = (t, n = {}) => this.create(e, t, n), this);
	},
	unregister(e) {
		return Array.from(R).forEach((t) => {
			t.name === e && Y(t);
		}), L.delete(e), delete this[e], this;
	},
	create(e, t, n = {}) {
		let r = L.get(e);
		if (!r) return console.warn(`[Kineto] Unknown module: ${e}`), null;
		let i = b(t);
		if (!i.length) return null;
		let a = i.map((t) => {
			let i = ne(t)?.get(e);
			if (i) return i.instance;
			try {
				let i, a = K.forceReducedMotion || K.respectReducedMotion && this.env.reducedMotion, o = r.reducedMotion || r.reduced;
				return i = a ? o?.(t, n, this) || D(t, e) : this.performance === "low" && typeof r.fallback == "function" ? r.fallback(t, n, this) || D(t, e) : r.create(t, n, this), i ? re(t, e, i, n) : null;
			} catch (t) {
				return console.error(`[Kineto/${e}] create() failed:`, t), null;
			}
		}).filter(Boolean);
		return a.length && ie(), a.length <= 1 ? a[0] || null : a;
	},
	scan(e = typeof document < "u" ? document : null) {
		return this.env.ssr || !e ? this : (ie(), L.forEach((t, n) => {
			let r = `[data-kt-${y(n)}]`, i = [];
			typeof Element < "u" && e instanceof Element && e.matches(r) && i.push(e), typeof e.querySelectorAll == "function" && i.push(...e.querySelectorAll(r)), i.forEach((e) => this.create(n, e, x(e, n)));
		}), typeof requestAnimationFrame < "u" ? requestAnimationFrame(() => document.documentElement.classList.remove("kt-preload")) : document.documentElement.classList.remove("kt-preload"), this);
	},
	init(e = typeof document < "u" ? document : null) {
		return this.scan(e);
	},
	initModules(e) {
		return b(e).forEach((e) => this.scan(e)), this;
	},
	autoInit(e = typeof document < "u" ? document : null) {
		return this.env.ssr || !e ? this : document.readyState === "loading" ? (V || (V = !0, H = () => {
			V = !1, H = null, this.scan(e);
		}, document.addEventListener("DOMContentLoaded", H, { once: !0 })), this) : this.scan(e);
	},
	getInstance(e, t) {
		let n = b(e)[0];
		return n ? t ? ne(n)?.get(t)?.instance || null : Array.from(ne(n)?.values() || [], ({ instance: e }) => e) : null;
	},
	destroyModule(e, t) {
		let n = b(e);
		return n.length && Array.from(R).forEach((e) => {
			e.name === t && X(e, n) && Y(e);
		}), this;
	},
	replay(e, t, n) {
		let r = b(e), i = [];
		Array.from(R).forEach((e) => {
			e.name === t && X(e, r) && i.push(e);
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
			let t = b(e);
			return Array.from(R).forEach((e) => {
				X(e, t) && Y(e);
			}), this;
		}
		return Array.from(R).forEach((e) => Y(e)), se(), this;
	},
	pause() {
		return R.forEach(({ instance: e }) => e.pause()), U?.stop(), this;
	},
	resume() {
		return R.forEach(({ instance: e }) => e.resume()), U?.start(), this;
	},
	refresh() {
		return C()?.refresh(), this;
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
var le = {
	create(e, t) {
		let n = S(), r = C();
		if (!n || !r) return this.fallback(e, t);
		let i = E(e, ["transform", "willChange"]), a = t.speed ?? .5, o = t.axis || "y", s = (t.distance ?? 200) * Math.abs(a), c = { [o]: a < 0 ? s : -s }, l = {
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
		let t = E(e, ["transform"]), n = S();
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
	fallback(e, t = {}) {
		let n = E(e, ["transform", "willChange"]), r = t.axis === "x" ? "x" : "y", i = Number(t.speed ?? .5), a = Number(t.distance ?? 200) * i;
		e.style.willChange = "transform";
		let o = !1, s = () => {
			o = !1;
			let t = e.getBoundingClientRect(), n = window.innerHeight || document.documentElement.clientHeight, i = ((n - t.top) / (n + t.height) - .5) * 2 * -a;
			e.style.transform = r === "x" ? `translate3d(${i}px,0,0)` : `translate3d(0,${i}px,0)`;
		}, c = () => {
			o || (o = !0, requestAnimationFrame(s));
		};
		return s(), window.addEventListener("scroll", c, { passive: !0 }), window.addEventListener("resize", c, { passive: !0 }), {
			el: e,
			type: "parallax",
			pause() {
				window.removeEventListener("scroll", c);
			},
			resume() {
				window.addEventListener("scroll", c, { passive: !0 });
			},
			destroy() {
				window.removeEventListener("scroll", c), window.removeEventListener("resize", c), n();
			}
		};
	}
}, ue = {
	create(e, t) {
		let n = p();
		if ((t.mode || t.preset) === "compass") {
			let r = _(Number(t.smoothing ?? t.ease ?? .08), .01, 1), i = Number(t.rotateOffset ?? 0), a = t.compassRange == null ? null : Number(t.compassRange), o = Number(t.sensitivity ?? 1), s = t.global ? window : e, c = E(e, ["transform", "willChange"]);
			e.style.willChange = "transform";
			let l = 0, u = 0, d = !0, f = null, p = t.gyro !== !1 && n.touch && n.hasGyro, m = (e) => {
				e.alpha != null && (l = -e.alpha * o);
			}, g = (n) => {
				let r = e.getBoundingClientRect();
				if (!(!r.width || !r.height)) if (a != null) {
					let e = t.global ? {
						left: 0,
						width: window.innerWidth
					} : r;
					l = _(((n.clientX - e.left) / e.width - .5) * 2, -1, 1) * a * o;
				} else l = Math.atan2(n.clientY - (r.top + r.height / 2), n.clientX - (r.left + r.width / 2)) * 180 / Math.PI * o;
			}, v = () => {
				if (!d) return;
				let t = (l - u) % 360;
				t > 180 && (t -= 360), t < -180 && (t += 360), u += t * r, e.style.transform = `rotate(${(u + i).toFixed(3)}deg)`, f = requestAnimationFrame(v);
			};
			return p ? h().then((e) => {
				e && d && window.addEventListener("deviceorientation", m, { passive: !0 });
			}) : s.addEventListener("pointermove", g, { passive: !0 }), f = requestAnimationFrame(v), {
				el: e,
				type: "mouseParallax",
				pause: () => {
					d = !1, f != null && cancelAnimationFrame(f);
				},
				resume: () => {
					d || (d = !0, f = requestAnimationFrame(v));
				},
				destroy: () => {
					d = !1, f != null && cancelAnimationFrame(f), s.removeEventListener("pointermove", g), window.removeEventListener("deviceorientation", m), c();
				}
			};
		}
		let r = t.ease ?? .08, i = t.maxX ?? 40, a = t.maxY ?? 40, o = t.global ? window : e, s = t.gyro !== !1 && n.hasGyro && n.touch, c = Array.from(e.querySelectorAll("[data-mp-speed], [data-kt-mouse-speed]"));
		c.length || c.push(e);
		let l = c.map((e) => E(e, ["transform", "willChange"]));
		c.forEach((e) => {
			e.style.willChange = "transform";
		});
		let u = 0, d = 0, f = !0, m = null, v = c.map(() => 0), y = c.map(() => 0), b = (n) => {
			let r = t.global ? {
				left: 0,
				top: 0,
				width: window.innerWidth,
				height: window.innerHeight
			} : e.getBoundingClientRect();
			!r.width || !r.height || (u = ((n.clientX - r.left) / r.width - .5) * 2, d = ((n.clientY - r.top) / r.height - .5) * 2);
		}, x = (e) => {
			u = _((e.gamma || 0) / 30, -1, 1), d = _((e.beta || 0) / 30, -1, 1);
		};
		s ? h().then((e) => {
			e && f && window.addEventListener("deviceorientation", x, { passive: !0 });
		}) : o.addEventListener("pointermove", b, { passive: !0 });
		let S = () => {
			f && (c.forEach((e, n) => {
				let o = Number(e.dataset.mpSpeed ?? e.dataset.ktMouseSpeed ?? t.speed ?? .05);
				v[n] = g(v[n], u * i * o, r), y[n] = g(y[n], d * a * o, r), e.style.transform = `translate3d(${v[n]}px, ${y[n]}px, 0)`;
			}), m = requestAnimationFrame(S));
		};
		return m = requestAnimationFrame(S), {
			el: e,
			type: "mouseParallax",
			pause: () => {
				f = !1, m != null && cancelAnimationFrame(m);
			},
			resume: () => {
				f || (f = !0, m = requestAnimationFrame(S));
			},
			destroy: () => {
				f = !1, m != null && cancelAnimationFrame(m), o.removeEventListener("pointermove", b), window.removeEventListener("deviceorientation", x), l.forEach((e) => e());
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
}, de = {
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
function fe(e, t) {
	let n = String(t.enterClass || t.activeClass || "is-inview").split(/\s+/).filter(Boolean);
	String(t.leaveClass || "").split(/\s+/).filter(Boolean).forEach((t) => e.classList.remove(t)), n.forEach((t) => e.classList.add(t)), t.onClassChange?.(!0, e);
}
function pe(e, t) {
	let n = String(t.enterClass || t.activeClass || "is-inview").split(/\s+/).filter(Boolean), r = String(t.leaveClass || "").split(/\s+/).filter(Boolean);
	n.forEach((t) => e.classList.remove(t)), r.forEach((t) => e.classList.add(t)), t.onClassChange?.(!1, e);
}
var me = {
	create(e, t = {}) {
		let n = S(), r = C(), i = t.preset || "fade-up", a = t.direction || "up", o = t.classOnly === !0 || i === "class", s = t.once !== !1, c = e.getAttribute("class");
		if (o) {
			let n = null, i = null, a = () => {
				fe(e, t), t.onEnter?.(e);
			}, o = () => {
				t.removeClassOnLeave !== !1 && (pe(e, t), t.onLeave?.(e));
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
			}) : s ? n = w(e, a, {
				threshold: Number(t.threshold ?? .1),
				rootMargin: t.rootMargin || "0px 0px -10% 0px"
			}) : typeof IntersectionObserver < "u" ? (n = new IntersectionObserver(([e]) => e.isIntersecting ? a() : o(), {
				threshold: Number(t.threshold ?? .1),
				rootMargin: t.rootMargin || "0px"
			}), n.observe(e)) : a(), {
				el: e,
				type: "reveal",
				replay() {
					pe(e, t), requestAnimationFrame(a);
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
				let n = _(t, 0, 1) * 360, r = a ? `conic-gradient(from ${i}deg, transparent 0deg ${360 - n}deg, #000 ${360 - n}deg)` : `conic-gradient(from ${i}deg, #000 ${n}deg, transparent ${n}deg)`;
				e.style.maskImage = r, e.style.webkitMaskImage = r, e.style.opacity = "1";
			};
			c(0);
			let l = null, u = null, d = null, f = () => {
				e.style.maskImage = "none", e.style.webkitMaskImage = "none", fe(e, t), t.onComplete?.(e);
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
			}) : w(e, m, { threshold: Number(t.threshold ?? .2) }), {
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
		}, f = de[i];
		if (l && (f = { opacity: 1 }), !f) return console.warn(`[Kineto/reveal] Unknown preset: ${i}`), null;
		if (!n || !r) return this.fallback(e, t, f);
		if (l) {
			let i = T(e, ["style", "class"]), a = Math.max(.05, Number(t.duration ?? .8)), o = t.ease || ((t.spring ?? d.spring) === !0 ? "back.out(1.25)" : "power3.out");
			e.style.willChange = "clip-path";
			let c = { p: 1 }, l = () => {
				let t = c.p <= .002 ? "none" : u(c.p);
				e.style.clipPath = t, e.style.webkitClipPath = t;
			};
			l();
			let f = null, p = !1, m = () => {
				f?.kill(), c.p = 1, l(), f = n.to(c, {
					p: 0,
					duration: a,
					ease: o,
					delay: Number(t.delay ?? 0),
					onStart: () => fe(e, t),
					onUpdate: l,
					onComplete: () => {
						l(), e.style.willChange = "", t.onComplete?.(e);
					}
				});
			}, h = r.create({
				trigger: e,
				start: t.start || "top 85%",
				once: s,
				onEnter: () => {
					p || (p = !0, m());
				}
			}), g = null;
			return typeof IntersectionObserver < "u" && (g = new IntersectionObserver((e) => {
				!e.some((e) => e.isIntersecting) || p || (p = !0, g.disconnect(), g = null, h?.disable(!1), m());
			}, {
				threshold: .12,
				rootMargin: "0px 0px -8% 0px"
			}), g.observe(e)), {
				el: e,
				type: "reveal",
				replay() {
					p = !0, m();
				},
				pause() {
					f?.pause();
				},
				resume() {
					f?.resume();
				},
				destroy() {
					g?.disconnect(), h?.kill?.(), f?.kill(), i();
				}
			};
		}
		let p = t.stagger && e.children.length ? Array.from(e.children) : e, m = Array.isArray(p) ? p : [p], h = m.map((e) => T(e, ["style", "class"])), g = Math.max(0, Number(t.duration ?? .8)), v = t.ease || ((t.spring ?? d.spring) === !0 ? "back.out(1.25)" : "power3.out"), y = {
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
			ease: v,
			stagger: t.stagger || void 0,
			onStart: () => fe(e, t),
			onComplete: () => {
				m.forEach((e) => {
					e.style.willChange = "";
				}), t.onComplete?.(e);
			}
		}, b = {
			...y,
			scrollTrigger: {
				trigger: e,
				start: t.start || "top 85%",
				end: t.end,
				toggleActions: s ? "play none none none" : "play reverse play reverse",
				onEnter: () => t.onEnter?.(e),
				onLeave: () => {
					t.onLeave?.(e), !s && t.removeClassOnLeave !== !1 && pe(e, t);
				},
				onEnterBack: () => {
					fe(e, t), t.onEnterBack?.(e);
				},
				onLeaveBack: () => {
					t.onLeaveBack?.(e), !s && t.removeClassOnLeave !== !1 && pe(e, t);
				}
			}
		};
		m.forEach((e) => {
			e.style.willChange = "transform,opacity,filter,clip-path";
		});
		let x = n.fromTo(p, f, b), E = null;
		return typeof IntersectionObserver < "u" && (E = new IntersectionObserver((e) => {
			e.some((e) => e.isIntersecting) && (E.disconnect(), E = null, x.progress() === 0 && (x.scrollTrigger?.disable(!1), n.fromTo(p, f, {
				...y,
				delay: 0,
				overwrite: "auto"
			})));
		}, {
			threshold: .12,
			rootMargin: "0px 0px -8% 0px"
		}), E.observe(e)), {
			el: e,
			type: "reveal",
			replay() {
				n.fromTo(p, f, {
					...y,
					delay: 0,
					overwrite: "auto"
				});
			},
			pause() {
				x.pause();
			},
			resume() {
				x.resume();
			},
			destroy() {
				E?.disconnect(), x.scrollTrigger?.kill?.(), x.kill(), h.forEach((e) => e());
			}
		};
	},
	reduced(e) {
		let t = E(e, [
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
	fallback(e, t = {}, n = de["fade-up"]) {
		let r = T(e, ["style", "class"]), i = Number(n.x ?? 0), a = Number(n.y ?? 24), o = Number(n.scale ?? 1);
		e.style.opacity = String(n.opacity ?? 0), e.style.transform = `translate3d(${i}px,${a}px,0) scale(${o})`, n.filter && (e.style.filter = n.filter), n.clipPath && (e.style.clipPath = n.clipPath);
		let s = () => {
			let n = Math.max(0, Number(t.duration ?? .55));
			e.style.transition = `opacity ${n}s ease,transform ${n}s ease,filter ${n}s ease,clip-path ${n}s ease`, fe(e, t), requestAnimationFrame(() => {
				e.style.opacity = "1", e.style.transform = "none", e.style.filter = "none", e.style.clipPath = "inset(0)", t.onComplete?.(e);
			});
		}, c = w(e, s, {
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
function he(e) {
	return e.format ? e.format : e.separator ? String(e.separator) : e.grouping === !0 || e.comma === !0 ? "," : "";
}
function ge(e) {
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
function _e(e) {
	let t = `var(--kt-counter-seam,${e.seamColor || "rgba(0,0,0,.5)"})`, n = e.shadow === !1 || e.shadow === "none" ? "none" : typeof e.shadow == "string" ? e.shadow : "drop-shadow(0 2px 5px rgba(0,0,0,.3))";
	return {
		seam: t,
		shadow: `var(--kt-counter-flip-shadow,${n})`,
		hasShadow: n !== "none",
		separatorColor: e.separatorColor || ""
	};
}
function ve(e, t, n) {
	if (!t) return;
	let r = document.createElement("span");
	r.className = n, r.textContent = t, e.appendChild(r);
}
function ye(e, t, n = "kt-counter-char") {
	let r = document.createElement("span");
	return r.className = n, r.textContent = t, r.style.display = "inline-block", e.appendChild(r), r;
}
function be(e, t) {
	if (t.start === !1) return;
	let n = e.getBoundingClientRect();
	if (!(n.bottom > 0 && n.top < window.innerHeight)) return {
		trigger: e,
		start: t.start || "top 85%",
		toggleActions: t.once === !1 ? "play reverse play reverse" : "play none none none"
	};
}
var xe = {
	create(e, t) {
		let n = S(), r = e.innerHTML, i = e.getAttribute("style"), a = T(e, ["aria-label", "aria-live"]), o = t.mode || t.preset || t.style || "slot", s = Number(t.from ?? 0), c = Number.parseFloat((e.textContent || "").replace(/[^0-9.-]/g, "")), l = Number(t.to ?? (Number.isFinite(c) ? c : 0)), u = Math.max(0, Number(t.duration ?? 2)), d = Math.max(0, Number(t.decimals ?? 0)), f = t.prefix || "", p = t.suffix || "", m = {
			decimals: d,
			format: he(t),
			locale: t.locale
		}, h = P(l, m), g = `${f}${h}${p}`, _ = be(e, t), v = [];
		e.setAttribute("aria-label", g), e.setAttribute("aria-live", "polite");
		let y = (e) => (e && v.push(e), e), b = () => {
			v.forEach((e) => {
				e.scrollTrigger?.kill?.(), e.kill?.();
			}), v.length = 0;
		};
		if (o === "plain") {
			let r = { value: s }, i = () => {
				e.textContent = `${f}${P(r.value, m)}${p}`;
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
			e.innerHTML = "", e.style.display = "inline-flex", e.style.alignItems = "baseline", ve(e, f, "kt-counter-prefix");
			let r = [];
			for (let t of h) /\d/.test(t) ? r.push({
				node: ye(e, "0", "kt-counter-digit"),
				target: Number(t)
			}) : ye(e, t, "kt-counter-separator");
			ve(e, p, "kt-counter-suffix");
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
			e.innerHTML = "", e.style.display = "inline-flex", e.style.alignItems = "baseline", ve(e, f, "kt-counter-prefix");
			let r = Array.from(h, (t) => ye(e, t, /\d/.test(t) ? "kt-counter-digit kt-counter-pop-char" : "kt-counter-separator kt-counter-pop-char"));
			ve(e, p, "kt-counter-suffix");
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
			e.innerHTML = "", e.style.display = "inline-flex", e.style.alignItems = "center", e.style.gap = `${Math.max(0, Number(t.gap ?? 3))}px`, ve(e, f, "kt-counter-prefix");
			let n = t.tile !== !1, r = t.tileColor || "#191b20", i = t.tileTextColor || "#f6f7fb", a = Math.max(0, Number(t.tileRadius ?? 6)), o = "1.24em", c = _e(t), d = [], m = t.bareBackground || "Canvas", g = (e) => `position:absolute;left:0;right:0;height:50%;overflow:hidden;${e ? "top:0;border-radius:" + (n ? `${a}px ${a}px 0 0` : "0") : "bottom:0;border-radius:" + (n ? `0 0 ${a}px ${a}px` : "0")};background:${n ? r : m};backface-visibility:hidden;`, _ = (e) => `position:absolute;left:0;width:100%;height:${o};line-height:${o};text-align:center;${e ? "top:0" : "bottom:0"};color:${n ? i : "inherit"};`, v = (e, t) => {
				let n = document.createElement("span");
				n.setAttribute("aria-hidden", "true"), n.style.cssText = g(e) + (t ? `transform-origin:50% ${e ? "100%" : "0%"};will-change:transform;z-index:3;` : "z-index:1;");
				let r = document.createElement("span");
				return r.style.cssText = _(e), r.textContent = "0", n.appendChild(r), {
					half: n,
					glyph: r
				};
			}, b = l >= s, x = h.replace(/\D/g, "").length, S = String(Math.round(Math.abs(s))).padStart(x, "0").slice(-x), C = 0;
			for (let t of h) {
				if (!/\d/.test(t)) {
					let r = document.createElement("span");
					r.className = "kt-counter-separator", r.textContent = t, n && (r.style.opacity = ".7"), e.appendChild(r);
					continue;
				}
				let r = Number(S[C] || "0");
				C += 1;
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
			ve(e, p, "kt-counter-suffix");
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
			P ? M() : F = w(e, M, { threshold: .3 }), y({
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
			}, S = _e(t), C = {
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
				A.forEach((e) => e.cancel()), A.clear(), e.innerHTML = "", E = [], D = null, O = null, ve(e, f, "kt-counter-prefix"), j(t.days) && (O = document.createElement("span"), O.className = "kt-counter-days", O.style.cssText = "margin-right:.5ch;", O.textContent = `${t.days}${m}`, e.appendChild(O));
				for (let n of t.text) if (/\d/.test(n)) {
					let t = u === "flip" ? w(n) : x(n);
					e.appendChild(t.viewport), E.push(t);
				} else {
					let t = ye(e, n, "kt-counter-separator kt-counter-clock-separator");
					if (l) {
						let e = ge(t);
						e && A.add(e);
					}
					E.push(null);
				}
				s && !h && !g && (D = document.createElement("span"), D.className = "kt-counter-suffix kt-counter-meridiem", D.style.cssText = "margin-left:.4ch;font-size:.55em;opacity:.75;align-self:center;", D.textContent = t.meridiem, e.appendChild(D)), ve(e, p, "kt-counter-suffix");
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
			e.innerHTML = "", e.style.display = "inline-flex", e.style.alignItems = "flex-end", e.style.overflow = "hidden", ve(e, f, "kt-counter-prefix");
			let d = h.replace(/\D/g, "").length, m = String(Math.round(Math.abs(s))).padStart(d, "0").slice(-d), g = l >= s, v = [], b = 0;
			for (let n of h) {
				if (!/\d/.test(n)) {
					ye(e, n, "kt-counter-separator");
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
			if (ve(e, p, "kt-counter-suffix"), n) {
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
			let t = ge(e);
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
				b(), e.innerHTML = r, i == null ? e.removeAttribute("style") : e.setAttribute("style", i), a();
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
		let i = Math.max(0, Number(t.decimals ?? 0)), a = Number.parseFloat((e.textContent || "").replace(/[^0-9.-]/g, "")), o = Number(t.to ?? (Number.isFinite(a) ? a : 0)), s = he(t);
		return e.textContent = `${t.prefix || ""}${P(o, {
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
}, Se = /\.(?:gif|apng|webp)(?:$|[?#])/i;
function Ce(e, t = {}) {
	return t.src || e.dataset.src || e.getAttribute("data-src") || e.currentSrc || e.getAttribute("src") || "";
}
function we(e, t) {
	let n = Number(e ?? t);
	return Number.isFinite(n) ? n <= 30 ? n * 1e3 : n : t * 1e3;
}
function Te(e, t, n) {
	let r = Math.max(1, Math.min(t || 300, n || 200)), i = (e) => e <= 1 ? Math.max(1, Math.round(1 / Math.max(.004, e))) : Math.round(e);
	if (Array.isArray(e.steps) && e.steps.length) {
		let t = e.steps.map(Number).filter((e) => Number.isFinite(e) && e > 0).map(i);
		if (t.length) return t.sort((e, t) => t - e);
	}
	let a = Math.max(2, Math.round(Number(e.pixelStepCount ?? e.stepCount ?? 8))), o = e.pixelStart != null || e.pixelEnd != null, s = o ? _(i(_(Number(e.pixelStart ?? .035), .004, 1)), 2, 200) : _(Math.round(r / 6), 20, 96), c = o ? i(_(Number(e.pixelEnd ?? 1), .01, 1)) : 1, l = [];
	for (let e = 0; e < a; e += 1) {
		let t = e / Math.max(1, a - 1), n = s * (Math.max(1, c) / s) ** +t, r = Math.max(c, Math.round(n));
		l.length && r >= l[l.length - 1] && (r = Math.max(c, l[l.length - 1] - 1)), l.push(r);
	}
	return l[l.length - 1] = c, l;
}
function Ee(e) {
	return e.length > 1 && e[e.length - 1] <= 1 ? e.slice(0, -1) : e.length ? e : [2];
}
function De(e, t, n, r) {
	let i = Math.max(n / e, r / t), a = Math.min(e, n / i), o = Math.min(t, r / i);
	return {
		sx: (e - a) / 2,
		sy: (t - o) / 2,
		sw: a,
		sh: o
	};
}
function Oe(e, t) {
	let n = e.parentElement, r = !1, i = n?.getAttribute("style") ?? null;
	n?.classList.contains("kt-lazy-wrap") || (n = document.createElement("span"), n.className = "kt-lazy-wrap", e.parentNode?.insertBefore(n, e), n.appendChild(e), r = !0), getComputedStyle(n).position === "static" && (n.style.position = "relative"), n.style.overflow = "hidden", n.style.display = t.display || "block", n.style.lineHeight = "0";
	let a = n.parentElement?.getBoundingClientRect(), o = t.aspectRatio || e.getAttribute("data-aspect-ratio"), s = Number(e.getAttribute("width")), c = Number(e.getAttribute("height"));
	return n.style.width = "100%", o ? n.style.aspectRatio = String(o).replace(":", " / ") : s > 0 && c > 0 ? n.style.aspectRatio = `${s} / ${c}` : r && a && a.height > 2 ? n.style.height = "100%" : n.getBoundingClientRect().height < 2 && (n.style.aspectRatio = "16 / 9"), t.height && (n.style.height = typeof t.height == "number" ? `${t.height}px` : String(t.height)), {
		wrapper: n,
		created: r,
		originalWrapperStyle: i
	};
}
function ke(e, t, n = 2) {
	let r = document.createElement("span");
	return r.className = t, r.setAttribute("aria-hidden", "true"), r.style.cssText = `position:absolute;inset:0;z-index:${n};display:block;overflow:hidden;pointer-events:none;border-radius:inherit;`, e.appendChild(r), r;
}
function Ae(e, t, n = {}) {
	let r = document.createElement("img");
	r.className = "kt-lazy-live-image", r.alt = "", r.setAttribute("aria-hidden", "true"), r.loading = "eager", r.decoding = "async", n.crossOrigin && (r.crossOrigin = n.crossOrigin);
	let i = n.srcset || t.getAttribute("data-srcset") || t.getAttribute("srcset"), a = n.sizes || t.getAttribute("sizes");
	return i && (r.srcset = i), a && (r.sizes = a), r.src = e, r.style.cssText = `display:block;width:100%;height:100%;object-fit:${n.objectFit || "cover"};object-position:${n.objectPosition || "50% 50%"};`, r;
}
function je(e, t, n = 4) {
	let r = document.createElement("canvas");
	r.className = "kt-lazy-noise", r.setAttribute("aria-hidden", "true"), r.width = Math.max(32, Number(t.noiseWidth ?? 128)), r.height = Math.max(18, Number(t.noiseHeight ?? 72)), r.style.cssText = `position:absolute;inset:0;width:100%;height:100%;z-index:${n};pointer-events:none;mix-blend-mode:${t.noiseBlend || "soft-light"};opacity:0;border-radius:inherit;`, e.appendChild(r);
	let i = r.getContext("2d", { alpha: !0 }), a = 0, o = 0, s = 1e3 / _(Number(t.noiseFps ?? 24), 4, 60);
	return {
		canvas: r,
		draw: (e = performance.now()) => {
			if (!i || e - a < s) return;
			a = e;
			let n = i.createImageData(r.width, r.height), c = _(Number(t.noiseContrast ?? 1), .1, 3);
			for (let e = 0; e < n.data.length; e += 4) {
				let t = (Math.random() - .5) * 255 * c + 128, r = _(Math.round(t), 0, 255);
				n.data[e] = r, n.data[e + 1] = r, n.data[e + 2] = r, n.data[e + 3] = 255;
			}
			i.putImageData(n, 0, 0), o += 1, r.dataset.frames = String(o);
		}
	};
}
function Me(e, t, n = 8, r = !1) {
	let i = _(t * 100, 0, 100), a = _(Number(n), 0, 30), o = _(i - a, 0, 100), s = _(i + a, 0, 100), c = e === "up" ? "to top" : e === "left" ? "to left" : e === "right" ? "to right" : "to bottom";
	return r ? `linear-gradient(${c}, transparent 0%, transparent ${o}%, #000 ${s}%, #000 100%)` : `linear-gradient(${c}, #000 0%, #000 ${o}%, transparent ${s}%, transparent 100%)`;
}
function Ne(e, t, n) {
	return new Promise((r, i) => {
		let a = new Image();
		a.decoding = "async", n.crossOrigin && (a.crossOrigin = n.crossOrigin);
		let o = n.srcset || t.getAttribute("data-srcset") || t.getAttribute("srcset");
		o && (a.srcset = o), a.onload = () => r(a), a.onerror = () => i(/* @__PURE__ */ Error(`Kineto lazy image failed to load: ${e}`)), a.src = e, a.complete && a.naturalWidth && r(a);
	});
}
var Pe = {
	create(e, t = {}) {
		let n = t.preset || t.effect || "fade", r = n === "noise" ? "dissolve" : n === "zoom" ? "blur-up" : n, i = Ce(e, t);
		if (!i) return null;
		let a = {
			style: e.getAttribute("style"),
			src: e.getAttribute("src"),
			srcset: e.getAttribute("srcset"),
			sizes: e.getAttribute("sizes"),
			loading: e.getAttribute("loading"),
			decoding: e.getAttribute("decoding")
		}, { wrapper: o, created: s, originalWrapperStyle: c } = Oe(e, t);
		e.loading = t.nativeLazy === !1 ? "eager" : "lazy", e.decoding = "async", e.style.display = "block", e.style.width = "100%", e.style.height = "100%", e.style.objectFit = t.objectFit || "cover", e.style.objectPosition = t.objectPosition || "50% 50%";
		let l = [], u = /* @__PURE__ */ new Set(), d = null, f = null, p = !1, m = !1, h = !1, g = null, v = (e, t) => {
			let n = setTimeout(() => {
				u.delete(n), p || e();
			}, Math.max(0, Number(t) || 0));
			return u.add(n), n;
		}, y = () => {
			l.splice(0).forEach((e) => e.remove()), g?.canvas.remove(), g = null;
		}, b = () => {
			let n = t.srcset || e.getAttribute("data-srcset");
			n && (e.srcset = n), t.sizes && (e.sizes = t.sizes), e.loading = "eager", e.src = i, e.style.opacity = "1", e.style.filter = "none", e.style.transform = "none", e.style.clipPath = "none", e.style.maskImage = "none", e.style.webkitMaskImage = "none";
		}, x = () => {
			b(), y(), t.onProgress?.(1, e), t.onLoad?.(e);
		}, S = () => {
			let n = t.skeletonVariant || t.variant || "shimmer", r = ke(o, `kt-lazy-skeleton kt-lazy-skeleton-${n}`, 5), i = t.skeletonColor || "color-mix(in srgb, currentColor 9%, transparent)", a = t.skeletonHighlight || "rgba(255,255,255,.45)", s = Math.max(.3, Number(t.skeletonSpeed ?? 1.5));
			if (r.style.backgroundColor = i, n === "pulse" ? r.style.animation = `kt-skeleton-pulse ${s}s ease-in-out infinite` : (r.style.backgroundImage = `linear-gradient(${Number(t.skeletonAngle ?? 100)}deg,transparent 32%,${a} 50%,transparent 68%)`, r.style.backgroundSize = "250% 100%", r.style.animation = `kt-shimmer ${s}s cubic-bezier(.4,.2,.6,.8) infinite`), t.skeletonIcon !== !1) {
				let e = document.createElement("span");
				e.className = "kt-lazy-skeleton-icon", e.setAttribute("aria-hidden", "true"), e.style.cssText = "position:absolute;left:50%;top:50%;width:15%;max-width:64px;min-width:28px;aspect-ratio:1;transform:translate(-50%,-50%);opacity:.32;", e.innerHTML = "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.6\" stroke-linecap=\"round\" stroke-linejoin=\"round\" style=\"width:100%;height:100%\"><rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"3\"/><circle cx=\"8.8\" cy=\"8.8\" r=\"1.9\"/><path d=\"m21 15.2-3.6-3.6a1.8 1.8 0 0 0-2.6 0L6 21\"/></svg>", r.appendChild(e);
			}
			return l.push(r), e.style.opacity = "0", r;
		}, C = async () => {
			if (h || p) return;
			h = !0;
			let n = performance.now(), s;
			try {
				s = await Ne(i, e, t);
			} catch (n) {
				y(), t.fallbackSrc ? e.src = t.fallbackSrc : a.src == null ? e.removeAttribute("src") : e.setAttribute("src", a.src), e.style.opacity = "1", t.onError?.(n, e);
				return;
			}
			let c = Math.max(0, Number(t.minDuration ?? 0)) - (performance.now() - n);
			if (c > 0 && await new Promise((e) => v(e, c)), !p) {
				if (r === "skeleton") {
					let n = l[0] || S();
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
						r = ke(o, "kt-lazy-polaroid-frame", 6);
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
					let r = ke(o, "kt-lazy-crt-beam", 7);
					r.style.cssText += `pointer-events:none;top:50%;bottom:auto;height:2px;transform:translateY(-50%);background:linear-gradient(90deg,transparent,rgba(255,255,255,.85) 16%,#fff 50%,rgba(255,255,255,.85) 84%,transparent);box-shadow:0 0 12px 2px rgba(255,255,255,.5);animation:kt-lazy-crt-beam ${n}s ease-out both;`, l.push(r);
					let a = ke(o, "kt-lazy-crt-bloom", 8);
					if (a.style.cssText += `pointer-events:none;background:#fff;animation:kt-lazy-crt-bloom ${n}s ease-out both;`, l.push(a), t.frame !== !1) {
						let e = ke(o, "kt-lazy-crt-scan", 5);
						e.style.cssText += `pointer-events:none;background:repeating-linear-gradient(to bottom,rgba(0,0,0,.09) 0,rgba(0,0,0,.09) 1px,transparent 1px,transparent 3px);mix-blend-mode:multiply;opacity:0;animation:kt-lazy-crt-scan ${n}s ease both;`, l.push(e);
						let t = ke(o, "kt-lazy-crt-roll", 6);
						t.style.cssText += `pointer-events:none;top:0;bottom:auto;height:60%;background:linear-gradient(to bottom,transparent 0%,rgba(0,0,0,.18) 35%,rgba(0,0,0,.28) 50%,rgba(0,0,0,.18) 65%,transparent 100%);filter:blur(3px);animation:kt-lazy-crt-roll ${n}s linear both;`, l.push(t);
					}
					v(() => {
						e.style.animation = "", e.style.willChange = "", x();
					}, n * 1e3 + 160);
					return;
				}
				if (r === "pixelate") {
					e.src = i, e.style.opacity = "1";
					let n = ke(o, "kt-lazy-pixelate-layer", 3), r = document.createElement("canvas");
					r.className = "kt-lazy-pixelate-canvas", r.style.cssText = "position:absolute;inset:0;width:100%;height:100%;display:block;", n.appendChild(r), l.push(n);
					let a = t.noise !== !1 && t.noise !== 0 && t.noise !== "0" && t.noise !== "false", c = typeof t.noise == "number" ? _(t.noise, 0, 1) : .14;
					a && (g = je(o, t, 4), g.canvas.style.opacity = String(c));
					let u = r.getContext("2d", {
						alpha: !0,
						desynchronized: !0
					}), d = document.createElement("canvas"), h = d.getContext("2d", { alpha: !0 }), y = o.getBoundingClientRect(), b = Ee(Te(t, y.width, y.height)), S = Math.max(0, Number(t.stepDuration ?? 0)), C = S > 0 ? S * b.length : we(t.duration, 1.25), w = Math.max(0, Number(t.delay ?? 100)), T = Math.max(0, Number(t.holdDuration ?? 0)), E = _(Number(t.maxDpr ?? 2), .5, 4), D = 1e3 / _(Number(t.renderFps ?? 60), 4, 120), O = 0, k = 0, A = () => {
						let e = o.getBoundingClientRect();
						O = Math.max(1, e.width), k = Math.max(1, e.height);
						let t = _(window.devicePixelRatio || 1, 1, E), n = Math.max(1, Math.round(O * t)), i = Math.max(1, Math.round(k * t));
						(r.width !== n || r.height !== i) && (r.width = n, r.height = i), u.setTransform(t, 0, 0, t, 0, 0);
					}, j = (t) => {
						let n = e.complete && e.naturalWidth ? e : s, r = n.naturalWidth, i = n.naturalHeight;
						if (!r || !i) return;
						let a = Math.max(1, Math.ceil(O / Math.max(1, t))), o = Math.max(1, Math.ceil(k / Math.max(1, t)));
						(d.width !== a || d.height !== o) && (d.width = a, d.height = o);
						let c = De(r, i, O, k);
						h.clearRect(0, 0, a, o), h.imageSmoothingEnabled = !0;
						try {
							h.drawImage(n, c.sx, c.sy, c.sw, c.sh, 0, 0, a, o);
						} catch {
							return;
						}
						u.clearRect(0, 0, O, k), u.imageSmoothingEnabled = !1, u.drawImage(d, 0, 0, a, o, 0, 0, O, k);
					}, M = null, N = null, P = -Infinity, F = -1, I = (n) => {
						if (p) return;
						if (m) {
							N ??= n, f = requestAnimationFrame(I);
							return;
						}
						N != null && M != null && (M += n - N, N = null), M ??= n;
						let r = _((n - M) / Math.max(1, C), 0, 1);
						g && (g.draw(n), g.canvas.style.opacity = String(c * Math.max(0, 1 - r)));
						let i = r >= 1 ? b.length - 1 : Math.min(b.length - 1, Math.floor(r * b.length));
						for (; F < i;) F += 1, A(), j(b[F]), P = n, t.onProgress?.(_((F + 1) / (b.length + 1), 0, 1), e);
						if (r >= 1) {
							v(x, T);
							return;
						}
						n - P >= D && (A(), j(b[i]), P = n), f = requestAnimationFrame(I);
					};
					A(), j(b[0]), v(() => {
						f = requestAnimationFrame(I);
					}, w);
					return;
				}
				if (r === "flicker") {
					e.src = i, e.style.opacity = "1";
					let n = ke(o, "kt-lazy-flicker-layer", 3);
					n.style.background = t.flickerBackground || "#000";
					let r = document.createElement("canvas");
					r.style.cssText = "position:absolute;inset:0;width:100%;height:100%;display:block;", n.appendChild(r), l.push(n);
					let a = r.getContext("2d", { alpha: !1 }), c = Math.max(120, we(t.duration, 1.15)), u = _(Number(t.glitchStrength ?? 1), .1, 3), d = Math.max(2, Math.round(Number(t.sliceCount ?? 7))), h = Math.max(0, Number(t.delay ?? 60)), g = null, y = null, b = () => {
						let e = o.getBoundingClientRect(), n = _(window.devicePixelRatio || 1, 1, _(Number(t.maxDpr ?? 2), .5, 4)), i = Math.max(1, Math.round(e.width * n)), a = Math.max(1, Math.round(e.height * n));
						(r.width !== i || r.height !== a) && (r.width = i, r.height = a);
					}, S = (t) => {
						let n = e.complete && e.naturalWidth ? e : s;
						if (!n.naturalWidth) return;
						let i = r.width, o = r.height, c = De(n.naturalWidth, n.naturalHeight, i, o);
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
						y != null && g != null && (g += n - y, y = null), g ??= n;
						let r = _((n - g) / c, 0, 1);
						b(), S(r), t.onProgress?.(r, e), r < 1 ? f = requestAnimationFrame(C) : x();
					};
					v(() => {
						f = requestAnimationFrame(C);
					}, h);
					return;
				}
				if (r === "print" || r === "dissolve") {
					e.src = i, e.style.opacity = "0";
					let n = ke(o, `kt-lazy-${r}-base`, 2), a = Ae(i, e, t);
					n.appendChild(a), l.push(n);
					let s = null, c = null, u = null;
					r === "print" && (s = ke(o, "kt-lazy-print-sharp", 3), c = Ae(i, e, t), s.appendChild(c), l.push(s), u = ke(o, "kt-lazy-print-edge", 5), u.style.mixBlendMode = "soft-light", l.push(u)), g = je(o, t, 4);
					let d = Math.max(50, we(t.duration, r === "print" ? 2.2 : 1.55)), h = Math.max(0, Number(t.delay ?? 100)), y = Math.max(0, Number(t.blur ?? 16)), b = _(Number(t.noise ?? (r === "print" ? .3 : .48)), 0, 1), S = t.direction || "down", C = Number(t.feather ?? (r === "print" ? 12 : 8)), w = null, T = null, E = (n) => {
						if (p) return;
						if (m) {
							T ??= n, f = requestAnimationFrame(E);
							return;
						}
						T != null && w != null && (w += n - T, T = null), w ??= n;
						let i = _((n - w) / d, 0, 1), o = 1 - (1 - i) ** 2.2;
						if (g.draw(n), r === "print") {
							let e = i < .5 ? 2 * i * i : 1 - (-2 * i + 2) ** 2 / 2, n = y * (1 - i * .45);
							a.style.filter = `blur(${n}px) contrast(${1 + (1 - i) * .1}) brightness(${1 + (1 - i) * .06})`, s.style.maskImage = Me(S, e, C, !1), s.style.webkitMaskImage = s.style.maskImage, g.canvas.style.maskImage = Me(S, e, C, !0), g.canvas.style.webkitMaskImage = g.canvas.style.maskImage, g.canvas.style.opacity = String(b * (1 - i * .5));
							let r = S === "up" ? "to top" : S === "left" ? "to left" : S === "right" ? "to right" : "to bottom", o = _(e * 100, 0, 100), c = _(Number(t.edgeWidth ?? 9), 2, 30);
							u.style.opacity = i >= 1 ? "0" : "1", u.style.background = `linear-gradient(${r}, transparent ${_(o - c, 0, 100)}%, rgba(255,255,255,${_(Number(t.edgeOpacity ?? .5), 0, 1)}) ${o}%, transparent ${_(o + c * .4, 0, 100)}%)`;
						} else a.style.filter = `blur(${y * (1 - o)}px) contrast(${1 + (1 - o) * .22})`, g.canvas.style.opacity = String(b * (1 - o) ** 1.2);
						t.onProgress?.(i, e), i < 1 ? f = requestAnimationFrame(E) : x();
					};
					v(() => {
						f = requestAnimationFrame(E);
					}, h);
					return;
				}
				b(), t.onLoad?.(e, s);
			}
		};
		return r === "skeleton" ? S() : [
			"blur-up",
			"polaroid",
			"pixelate"
		].includes(r) || (e.style.opacity = "0"), d = w(e, C, {
			threshold: Number(t.threshold ?? .05),
			rootMargin: t.rootMargin || "200px 0px"
		}), {
			el: e,
			type: "lazy",
			get animatedMedia() {
				return t.animated === !0 || Se.test(i);
			},
			replay() {
				y(), h = !1, r === "skeleton" && S(), C();
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
		let n = e.getAttribute("style"), r = e.getAttribute("src"), i = Ce(e, t);
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
}, Fe = {
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
}, Ie = {
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
function Le(e, t, n, r) {
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
	}) : N(t).forEach((t) => {
		/^\s$/.test(t) ? e.appendChild(document.createTextNode(t)) : a(t);
	}), i;
}
var Re = {
	create(e, t) {
		let n = S(), r = C();
		if (!n || !r) return null;
		let i = t.by || "char", a = typeof t.animation == "string" && Fe[t.animation] ? t.animation : Fe[t.preset] ? t.preset : "rise", o = Fe[a], s = e.innerHTML, c = T(e, ["aria-label"]), l = e.textContent || "", u = E(e, [
			"overflow",
			"perspective",
			"display",
			"minHeight"
		]), d = Array.isArray(t.texts) && t.texts.length ? t.texts.map(String) : null, f = Number(t.duration ?? .8), p = Number(t.stagger ?? .03), m = t.ease || "power3.out";
		e.setAttribute("aria-label", d ? d.join(", ") : l), e.innerHTML = "", (a === "spin" || a === "flip") && (e.style.perspective = `${Number(t.perspective ?? 600)}px`);
		let h = Le(e, d ? d[0] : l, i, o.wrap && !d), g = null, _ = null, v = 0, y = !0, b = (r) => (g?.kill(), g = n.fromTo(h, { ...o.from }, {
			...o.to,
			duration: f,
			delay: Number(t.delay ?? 0),
			ease: a === "wave" ? t.ease || "back.out(2.2)" : m,
			stagger: p,
			overwrite: !0,
			onComplete: () => {
				t.onComplete?.(e), r?.();
			}
		}), g), x = Math.max(200, Number(t.hold ?? t.pause ?? 2e3)), w = Ie[t.swapOut] || Ie["slide-up"], D = () => {
			!d || d.length < 2 || !y || (clearTimeout(_), _ = setTimeout(() => {
				y && (g?.kill(), g = n.to(h, {
					...w,
					duration: Math.min(.45, f),
					ease: t.swapEase || "power2.in",
					stagger: Math.min(.02, p),
					overwrite: !0,
					onComplete: () => {
						y && (v = (v + 1) % d.length, e.innerHTML = "", h = Le(e, d[v], i, !1), t.onSwap?.(v, d[v], e), b(D));
					}
				}));
			}, x));
		}, O = !1, k = r.create({
			trigger: e,
			start: t.start || "top 85%",
			onEnter: () => {
				O && t.once !== !1 || (O = !0, b(d ? D : null));
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
				clearTimeout(_), g?.kill(), d && (v = 0, e.innerHTML = "", h = Le(e, d[0], i, !1)), n.set(h, { ...o.from }), b(d ? D : null);
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
		let t = E(e, ["opacity", "transform"]);
		return e.style.opacity = "1", e.style.transform = "none", {
			el: e,
			type: "textSplit",
			pause() {},
			resume() {},
			destroy: t
		};
	}
}, ze = {
	create(e, t) {
		let n = S(), r = C(), i = e.innerHTML, a = T(e, ["aria-label"]), o = e.textContent || "";
		e.setAttribute("aria-label", o), e.innerHTML = "";
		let s = N(o).map((t) => {
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
		}) : u = w(e, m, { threshold: .1 }), {
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
		let t = E(e, ["opacity", "filter"]);
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
function Be(e, t) {
	return e.length && e[Math.floor(Math.random() * e.length)] || t;
}
var Ve = {
	create(e, t) {
		let n = t.text ?? e.textContent ?? "", r = e.innerHTML, i = T(e, ["aria-label"]), a = String(t.chars || "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*"), o = Math.max(12, Number(t.speed ?? 34)), s = Math.max(1, Number(t.revealRate ?? 2)), c = I({
			rainbow: t.rainbow,
			rainbowColors: t.rainbowColors,
			scrambleFade: t.scrambleFade
		}), l = N(n), u = 0, d = 0, f = !0, p = !1, m = null, h = null;
		e.setAttribute("aria-label", n);
		let g = [], _ = () => (e.innerHTML = "", g = l.map((t) => {
			if (/^\s$/.test(t)) return e.appendChild(document.createTextNode(t)), null;
			let n = document.createElement("span");
			return n.setAttribute("aria-hidden", "true"), n.style.cssText = "display:inline-block;text-align:center;", n.textContent = t, e.appendChild(n), n;
		}), g.forEach((e) => {
			e && (e.style.width = `${Math.ceil(e.getBoundingClientRect().width * 100) / 100}px`);
		}), g), v = () => {
			g.forEach((e, t) => {
				e && (t < u ? (e.textContent = l[t], c?.clear(e)) : (e.textContent = Be(a, l[t]), c?.paint(e)));
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
		return h = w(e, x, {
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
}, He = {
	create(e, t) {
		let n = e.innerHTML, r = T(e, ["aria-label"]), i = Array.isArray(t.strings) ? t.strings.map(String) : t.strings == null ? [e.textContent || ""] : [String(t.strings)], a = Number(t.typeSpeed ?? 60), o = Number(t.eraseSpeed ?? 30), s = Number(t.pauseAfter ?? 1500), c = t.loop !== !1, l = t.caret !== !1, u = String(t.caretChar ?? "|"), d = t.hangul === !0 || t.compose === !0;
		e.setAttribute("aria-label", i.join(", ")), e.innerHTML = `<span class="kt-tw-text" aria-hidden="true"></span>${l ? `<span class="kt-tw-caret" aria-hidden="true">${u}</span>` : ""}`;
		let f = e.querySelector(".kt-tw-text"), p = 0, m = 0, h = 0, g = !1, _ = !0, v = null, y = (e) => d ? M(e) : [e], b = () => {
			if (!_) return;
			let n = N(i[p]);
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
}, Ue = {
	create(e, t) {
		let n = e.innerHTML, r = T(e, ["aria-label"]), i = String(t.text ?? e.textContent ?? ""), a = t.mode || t.preset || "stream", o = Number(t.speed ?? (a === "stream" ? 30 : a === "hangul" ? 80 : 100)), s = Number(t.delay ?? 0), c = S(), l = /* @__PURE__ */ new Set(), u = [], d = null, f = !0, p = !1;
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
			let t = N(i), n = 0, r = g("");
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
				let i = M(e), s = 0, c = () => {
					r.textContent = i[s], s += 1, s < i.length ? m(c, o) : (r.before(g(e)), r.textContent = "", n += 1, m(a, o));
				};
				c();
			};
			m(a, s * 1e3);
		}, y = () => {
			let n = N(i).map((t) => {
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
		}, b = () => {
			let n;
			n = a === "word" ? i.split(/(\s+)/) : a === "line" ? i.split(/(\n)/) : N(i);
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
		}, x = () => {
			let n = String(t.chars || "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789<>/\\|=+*#"), r = I({
				rainbow: t.rainbow,
				rainbowColors: t.rainbowColors,
				scrambleFade: t.scrambleFade
			}), a = Math.max(1, Math.round(Number(t.flickerCount ?? 3))), c = Math.max(200, Number(t.hold ?? 1400)), l = N(i).map((t) => {
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
		}, C = () => {
			let n = Math.max(.1, Number(t.duration ?? .9)) * 1e3, r = N(i).map((t) => {
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
			p || !f || (p = !0, a === "hangul" ? v() : a === "bounce" ? y() : a === "decode" ? x() : a === "flicker" ? C() : b());
		};
		d = w(e, E, {
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
}, We = {
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
We.slide = We["slide-up"];
var Ge = {
	create(e, t) {
		let n = e.innerHTML, r = e.getAttribute("style"), i = Array.isArray(t.texts) ? t.texts.map(String) : null;
		if (!i) {
			let t = Array.from(e.children).map((e) => e.textContent.trim()).filter(Boolean);
			i = t.length ? t : [String(e.textContent || "").trim()].filter(Boolean);
		}
		if (!i.length) return null;
		let a = t.effect || t.preset || "slide-up", o = We[a] || a === "shimmer" || a === "dissolve" ? a : "slide-up", s = o === "dissolve", c = Math.max(0, Number(t.blur ?? 14));
		We.blur.enter[0].filter = `blur(${c}px)`, We.blur.leave[1].filter = `blur(${Math.round(c * .85)}px)`, We.scale.enter[0].transform = `scale(${Math.max(.1, Number(t.startScale ?? .82))})`, We.scale.leave[1].transform = `scale(${Math.max(.1, Number(t.endScale ?? 1.12))})`;
		let l = Math.max(50, Number(t.duration ?? .55) * (Number(t.duration ?? .55) <= 20 ? 1e3 : 1)), u = Math.max(0, Number(t.pause ?? t.hold ?? 1600)), d = t.loop !== !1, f = t.charMode === !0 || s, p = Math.max(0, Number(t.stagger ?? .035)) * 1e3, m = [
			"ltr",
			"rtl",
			"random"
		].includes(t.charDirection) ? t.charDirection : "ltr", h = (e) => {
			if (m === "rtl") return Array.from({ length: e }, (t, n) => e - 1 - n);
			if (m === "random") {
				let t = Array.from({ length: e }, (e, t) => t);
				for (let n = e - 1; n > 0; --n) {
					let e = Math.floor(Math.random() * (n + 1));
					[t[n], t[e]] = [t[e], t[n]];
				}
				return t;
			}
			return Array.from({ length: e }, (e, t) => t);
		}, g = Math.max(0, Number(t.jitter ?? 5));
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
		let _ = s ? We.fade : We[o], v = document.createElement("span");
		v.style.cssText = `display:block;${_.clip ? "overflow:hidden;" : ""}`;
		let y = document.createElement("span");
		y.style.cssText = "display:block;will-change:transform,opacity,filter;", y.setAttribute("aria-live", t.ariaLive || "polite"), v.appendChild(y), e.appendChild(v);
		let b = 0, x = !0, S = null, C = /* @__PURE__ */ new Set(), w = (e, t, n) => {
			let r = e.animate(t, {
				fill: "forwards",
				...n
			});
			return C.add(r), r.finished.catch(() => {}).finally(() => C.delete(r)), r;
		}, T = () => {
			clearTimeout(S), S = null, C.forEach((e) => e.cancel()), C.clear();
		}, E = () => {
			clearTimeout(S), !(!x || i.length < 2) && (S = setTimeout(M, u));
		}, D = (e) => {
			f ? (y.innerHTML = "", N(e).forEach((e) => {
				if (/^\s$/.test(e)) {
					y.appendChild(document.createTextNode(e));
					return;
				}
				let t = document.createElement("span");
				t.style.cssText = "display:inline-block;will-change:transform,opacity;", t.textContent = e, y.appendChild(t);
			})) : y.textContent = e;
		}, O = () => Array.from(y.querySelectorAll("span")), k = (e) => {
			let t = (Math.random() - .5) * g * 2, n = (Math.random() - .5) * g * 1.4;
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
		}, A = (e) => {
			if (f) {
				let n = O(), r = 0;
				if (!n.length) {
					e?.();
					return;
				}
				let i = h(n.length);
				n.forEach((a, o) => {
					w(a, s ? k(!0) : _.enter, {
						duration: l,
						delay: s ? Math.random() * l * .5 : i[o] * Math.min(p, 900 / Math.max(1, n.length)),
						easing: s ? `steps(${2 + Math.floor(Math.random() * 3)}, end)` : typeof t.ease == "string" && t.ease.includes("(") ? t.ease : "cubic-bezier(.22,.8,.3,1)"
					}).finished.then(() => {
						r += 1, r === n.length && e?.();
					}).catch(() => {});
				});
			} else w(y, _.enter, {
				duration: l,
				easing: "cubic-bezier(.22,.8,.3,1)"
			}).finished.then(() => e?.()).catch(() => {});
		}, j = (e) => {
			if (f) {
				let t = O().reverse(), n = 0;
				if (!t.length) {
					e?.();
					return;
				}
				t.forEach((r, i) => {
					w(r, s ? k(!1) : _.leave, {
						duration: l * .55,
						delay: s ? Math.random() * l * .35 : i * Math.min(p * .6, 500 / Math.max(1, t.length)),
						easing: s ? `steps(${2 + Math.floor(Math.random() * 3)}, end)` : "cubic-bezier(.5,0,.75,.4)"
					}).finished.then(() => {
						n += 1, n === t.length && e?.();
					}).catch(() => {});
				});
			} else w(y, _.leave, {
				duration: l * .55,
				easing: "cubic-bezier(.5,0,.75,.4)"
			}).finished.then(() => e?.()).catch(() => {});
		}, M = () => {
			if (!x) return;
			let n = b + 1;
			if (!d && n >= i.length) {
				t.onComplete?.(e);
				return;
			}
			j(() => {
				x && (b = n % i.length, D(i[b]), t.onChange?.(b, i[b], e), A(E));
			});
		};
		return D(i[0]), A(E), {
			el: e,
			type: "textTransition",
			get index() {
				return b;
			},
			next: () => {
				clearTimeout(S), M();
			},
			replay: () => {
				T(), x = !0, b = 0, D(i[0]), A(E);
			},
			pause: () => {
				x = !1, clearTimeout(S), C.forEach((e) => e.pause());
			},
			resume: () => {
				x || (x = !0, C.forEach((e) => e.play()), C.size || E());
			},
			destroy: () => {
				x = !1, T(), e.innerHTML = n, r == null ? e.removeAttribute("style") : e.setAttribute("style", r);
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
}, Ke = {
	create(e, t) {
		let n = e.parentElement || e, r = t.strength ?? .4, i = t.radius ?? 100, a = t.ease ?? .15, o = E(e, ["transform", "willChange"]), s = 0, c = 0, l = 0, u = 0, d = !1, f = !0, p = null;
		e.style.willChange = "transform";
		let m = () => {
			if (!f) return;
			l = g(l, s, a), u = g(u, c, a), e.style.transform = `translate3d(${l}px, ${u}px, 0)`;
			let t = Math.abs(l - s) > .1 || Math.abs(u - c) > .1;
			p = d || t ? requestAnimationFrame(m) : null;
		}, h = () => {
			p == null && f && (p = requestAnimationFrame(m));
		}, _ = (t) => {
			let n = e.getBoundingClientRect(), a = t.clientX - (n.left + n.width / 2), o = t.clientY - (n.top + n.height / 2);
			Math.hypot(a, o) <= i * 1.5 ? (d = !0, s = a * r, c = o * r, h()) : (d = !1, s = 0, c = 0, h());
		}, v = () => {
			d = !1, s = 0, c = 0, h();
		};
		return n.addEventListener("pointermove", _, { passive: !0 }), n.addEventListener("pointerleave", v), {
			el: e,
			type: "magnetic",
			pause: () => {
				f = !1, p != null && cancelAnimationFrame(p), p = null;
			},
			resume: () => {
				f || (f = !0, h());
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
}, qe = {
	create(e, t) {
		let n = S(), r = C(), i = e.innerHTML, a = e.getAttribute("style"), o = Math.abs(Number(t.speed ?? 50)), s = t.direction === "right" ? 1 : -1, c = t.reverseOnScrollUp === !0, l = Number(t.scrollAcceleration ?? 0), u = t.pauseOnHover !== !1, d = Math.max(1, Number(t.clones ?? 2));
		e.style.display = "flex", e.style.overflow = "hidden", e.style.whiteSpace = "nowrap";
		let f = Math.max(0, Number(t.fade ?? 0));
		if (f > 0) {
			let t = `linear-gradient(to right, transparent 0, #000 ${f}px, #000 calc(100% - ${f}px), transparent 100%)`;
			e.style.webkitMaskImage = t, e.style.maskImage = t;
		}
		let p = document.createElement("div");
		for (p.className = "kt-marquee-group", p.style.cssText = "display:flex;flex:0 0 auto;will-change:transform;"; e.firstChild;) p.appendChild(e.firstChild);
		e.appendChild(p);
		for (let t = 0; t < d; t += 1) {
			let t = p.cloneNode(!0);
			t.setAttribute("aria-hidden", "true"), e.appendChild(t);
		}
		let m = Array.from(e.children), h = o * s, g = h, _ = !1, v = h, y = s < 0 ? 0 : -(p.offsetWidth || 0), b = !0, x = null, w = performance.now(), T = (e) => {
			n ? n.set(m, { x: e }) : m.forEach((t) => {
				t.style.transform = `translate3d(${e}px,0,0)`;
			});
		}, E = (e = performance.now()) => {
			if (!b) return;
			let t = Math.min(.05, Math.max(0, (e - w) / 1e3));
			w = e;
			let n = p.offsetWidth;
			if (n > 0) {
				for (v += (g - v) * Math.min(1, t * 8), y += v * t; y <= -n;) y += n;
				for (; y > 0;) y -= n;
				T(y), _ || (g += (h - g) * Math.min(1, t * 4));
			}
			x = requestAnimationFrame(E);
		};
		x = requestAnimationFrame(E);
		let D = null, O = Math.max(0, Number(t.skew ?? 0)), k = 0, A = 0, j = null, M = () => {
			b && (k *= .9, A += (k - A) * .12, e.style.transform = `skewX(${A.toFixed(3)}deg)`, j = requestAnimationFrame(M));
		};
		r && (c || l > 0 || O > 0) && (D = r.create({
			trigger: document.documentElement,
			start: 0,
			end: "max",
			onUpdate: (e) => {
				let t = e.getVelocity();
				c && (h = o * (e.direction < 0 ? 1 : -1)), !_ && (c || l > 0) && (g = h + t / 50 * l * -s), O > 0 && (k = Math.max(-O, Math.min(O, t / 220 * O)));
			}
		}), O > 0 && (j = requestAnimationFrame(M)));
		let N = () => {
			_ = !0, g = 0;
		}, P = () => {
			_ = !1, g = h;
		};
		return u && (e.addEventListener("pointerenter", N), e.addEventListener("pointerleave", P)), {
			el: e,
			type: "marquee",
			pause: () => {
				b = !1, x != null && cancelAnimationFrame(x);
			},
			resume: () => {
				b || (b = !0, w = performance.now(), x = requestAnimationFrame(E));
			},
			destroy: () => {
				b = !1, x != null && cancelAnimationFrame(x), j != null && cancelAnimationFrame(j), D?.kill(), e.removeEventListener("pointerenter", N), e.removeEventListener("pointerleave", P), e.innerHTML = i, a == null ? e.removeAttribute("style") : e.setAttribute("style", a);
			}
		};
	},
	reduced(e) {
		let t = E(e, ["overflowX", "transform"]);
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
function Je(e) {
	let t = String(e || "top-to-bottom").toLowerCase();
	return {
		down: "top-to-bottom",
		up: "bottom-to-top",
		right: "left-to-right",
		left: "right-to-left"
	}[t] || t;
}
function Ye(e) {
	return e === "bottom-to-top" ? "inset(100% 0 0 0)" : e === "left-to-right" ? "inset(0 100% 0 0)" : e === "right-to-left" ? "inset(0 0 0 100%)" : "inset(0 0 100% 0)";
}
function Xe(e) {
	return e === "bottom-to-top" ? "inset(0 0 100% 0)" : e === "left-to-right" ? "inset(0 0 0 100%)" : e === "right-to-left" ? "inset(0 100% 0 0)" : "inset(100% 0 0 0)";
}
function Ze(e, t = "0.3em") {
	return e === "bottom-to-top" ? `translate3d(0,-${t},0)` : e === "left-to-right" ? `translate3d(${t},0,0)` : e === "right-to-left" ? `translate3d(-${t},0,0)` : `translate3d(0,${t},0)`;
}
function Qe(e, t) {
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
function $e(e) {
	let t = document.createElement("div");
	return t.innerHTML = e, t.textContent || "";
}
var et = {
	create(e, t = {}) {
		let n = t.mode || t.preset || "loop", r = Q(t.speed, 36, 1), i = Q(t.delay, 700), a = Q(t.endPause, 900), o = Q(t.restartDelay, i), s = Q(t.gap, 32), c = t.direction === "right" ? 1 : -1, l = Je(t.maskDirection || t.transitionDirection), u = Q(t.maskDuration, 260, 20), d = t.pauseOnHover !== !1, f = e.innerHTML, p = e.getAttribute("style"), m = e.getAttribute("title"), h = e.getAttribute("aria-label"), g = e.getAttribute("role"), v = String(t.text ?? e.textContent ?? "").trim(), y = n === "rolling" ? Qe(e, t) : null, b = [
			"fade",
			"dissolve",
			"flip",
			"page"
		].includes(n) && e.children.length >= 2 ? Qe(e, t) : null, x = null, S = null, C = null, w = !1, T = !1, E = null, D = null, O = 0;
		e.textContent = "", e.style.overflow = "hidden", e.style.whiteSpace = "nowrap", getComputedStyle(e).position === "static" && (e.style.position = "relative"), v && e.setAttribute("aria-label", v), !m && t.title !== !1 && v && e.setAttribute("title", v);
		let k = !1, A = null, j = () => {
			x?.cancel?.(), x = null, clearTimeout(C), C = null, A = null;
		}, M = (e, t) => {
			clearTimeout(C), C = setTimeout(() => {
				if (C = null, !w) {
					if (T || k) {
						A = e;
						return;
					}
					e();
				}
			}, Math.max(0, t));
		}, P = async (e) => {
			let n = e.animate([{
				clipPath: "inset(0 0 0 0)",
				webkitClipPath: "inset(0 0 0 0)",
				transform: "translate3d(0,0,0)",
				opacity: 1
			}, {
				clipPath: Ye(l),
				webkitClipPath: Ye(l),
				transform: Ze(l),
				opacity: .6
			}], {
				duration: u,
				easing: t.maskEase || "cubic-bezier(.5,0,.75,.4)",
				fill: "forwards"
			});
			x = n;
			try {
				await n.finished;
			} catch {}
			x === n && (x = null);
		}, F = async (e) => {
			let n = e.animate([{
				clipPath: Xe(l),
				webkitClipPath: Xe(l),
				transform: Ze(l === "bottom-to-top" ? "top-to-bottom" : l === "top-to-bottom" ? "bottom-to-top" : l === "left-to-right" ? "right-to-left" : "left-to-right"),
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
			x = n;
			try {
				await n.finished;
			} catch {}
			x === n && (x = null);
		}, I = (e = v, t = !1, n = !1) => {
			let r = document.createElement("span");
			return r.className = "kt-overflow-text-segment", n ? r.innerHTML = e : r.textContent = e, r.style.cssText = "display:inline-block;flex:0 0 auto;white-space:nowrap;", t && r.setAttribute("aria-hidden", "true"), r;
		}, L = () => {
			let n = y || [];
			if (!n.length) return;
			e.innerHTML = "", e.setAttribute("role", t.role || "status"), e.setAttribute("aria-live", t.ariaLive || "polite");
			let r = document.createElement("span");
			r.className = "kt-overflow-rolling-viewport", r.style.cssText = "display:block;position:relative;height:1.35em;overflow:hidden;", D = document.createElement("span"), D.className = "kt-overflow-rolling-track", D.style.cssText = "display:flex;flex-direction:column;will-change:transform;";
			let i = I(n[0], !1, !0), a = I(n[1 % n.length], !0, !0);
			i.style.height = a.style.height = "1.35em", i.style.lineHeight = a.style.lineHeight = "1.35em", i.style.display = a.style.display = "flex", i.style.alignItems = a.style.alignItems = "center", i.style.gap = a.style.gap = "0.4em", D.append(i, a), r.appendChild(D), e.appendChild(r);
			let o = t.rollDirection === "down" ? 1 : -1, s = Q(t.rollDuration, 380, 50), c = Q(t.holdDuration, 1500, 100), l = async () => {
				if (w || T || n.length < 2) return;
				let r = (O + 1) % n.length, i = o < 0 ? D.lastElementChild : D.firstElementChild;
				i.innerHTML = n[r];
				let a = o < 0 ? "translate3d(0,0,0)" : "translate3d(0,-1.35em,0)", u = o < 0 ? "translate3d(0,-1.35em,0)" : "translate3d(0,0,0)";
				D.style.transform = a;
				let d = D.animate([{ transform: a }, { transform: u }], {
					duration: s,
					easing: t.easing || "cubic-bezier(.22,.8,.25,1)",
					fill: "forwards"
				});
				x = d;
				try {
					await d.finished;
				} catch {
					return;
				}
				if (!w) {
					if (d.cancel(), o < 0) {
						let e = D.firstElementChild;
						D.appendChild(e);
					} else {
						let e = D.lastElementChild;
						D.insertBefore(e, D.firstElementChild);
					}
					D.style.transform = "translate3d(0,0,0)", O = r, e.setAttribute("aria-label", $e(n[O])), t.onChange?.(O, n[O], e), M(l, c);
				}
			};
			n.length > 1 && M(l, Q(t.delay, c));
		}, R = () => {
			let r = b || [];
			if (r.length < 2) {
				z();
				return;
			}
			j(), e.innerHTML = "", e.style.whiteSpace = "normal", e.setAttribute("role", t.role || "status"), e.setAttribute("aria-live", t.ariaLive || "polite");
			let a = document.createElement("span");
			a.className = "kt-overflow-scene-viewport", a.style.cssText = "display:block;position:relative;overflow:hidden;", n === "flip" && (a.style.perspective = `${Q(t.perspective, 700, 100)}px`), e.appendChild(a);
			let o = r.map((e) => {
				let t = document.createElement("span");
				return t.className = "kt-overflow-scene", t.innerHTML = e, t.style.cssText = "display:block;white-space:normal;position:relative;", n === "flip" && (t.style.transformOrigin = "center"), a.appendChild(t), t;
			}), s = 0;
			o.forEach((e) => {
				s = Math.max(s, e.offsetHeight);
			}), s > 0 && (a.style.height = `${s}px`), o.forEach((e, t) => {
				e.style.position = "absolute", e.style.inset = "0", e.style.opacity = t === 0 ? "1" : "0";
			});
			let c = 0, l = Q(t.pageDuration, 1800, 120), u = Q(t.dissolveDuration ?? t.flipDuration ?? t.maskDuration, 460, 60), d = t.flipDirection !== "up", f = () => {
				if (n === "dissolve") return [[{
					opacity: 1,
					filter: "blur(0px)"
				}, {
					opacity: 0,
					filter: "blur(7px)"
				}], [{
					opacity: 0,
					filter: "blur(7px)"
				}, {
					opacity: 1,
					filter: "blur(0px)"
				}]];
				if (n === "flip") return [[{
					transform: "rotateX(0deg)",
					opacity: 1
				}, {
					transform: `rotateX(${d ? -90 : 90}deg)`,
					opacity: 0
				}], [{
					transform: `rotateX(${d ? 90 : -90}deg)`,
					opacity: 0
				}, {
					transform: "rotateX(0deg)",
					opacity: 1
				}]];
				if (n === "page") {
					let e = t.maskDirection !== "bottom-to-top";
					return [[{ clipPath: "inset(0 0 0 0)" }, { clipPath: e ? "inset(0 0 100% 0)" : "inset(100% 0 0 0)" }], [{ clipPath: e ? "inset(100% 0 0 0)" : "inset(0 0 100% 0)" }, { clipPath: "inset(0 0 0 0)" }]];
				}
				return [[{ opacity: 1 }, { opacity: 0 }], [{ opacity: 0 }, { opacity: 1 }]];
			}, p = (r) => {
				if (w) return;
				let i = o[c], a = o[r], [s, l] = f(), d = {
					duration: u,
					easing: n === "flip" ? "cubic-bezier(.4,0,.2,1)" : "ease",
					fill: "both"
				}, p = i.animate(s, d);
				x = a.animate(l, d), x.onfinish = () => {
					p.cancel(), x?.cancel?.(), i.style.opacity = "0", i.style.transform = "", i.style.filter = "", i.style.clipPath = "", a.style.opacity = "1", a.style.transform = "", a.style.filter = "", a.style.clipPath = "";
				}, c = r, O = r, t.onPage?.(r, o.length, e);
			}, m = () => {
				if (w) return;
				if (T) {
					M(m, l);
					return;
				}
				let e = (c + 1) % o.length;
				p(e), (t.repeat !== !1 || e !== 0) && M(m, l);
			};
			M(m, i + l);
		}, z = () => {
			j(), e.textContent = "", E = document.createElement("span"), E.className = "kt-overflow-text-viewport", E.style.cssText = "display:block;position:relative;overflow:hidden;will-change:clip-path,transform;", D = document.createElement("span"), D.className = `kt-overflow-text-track kt-overflow-text-${n}`, D.setAttribute("aria-hidden", "true"), D.dataset.mode = n, D.style.cssText = "display:inline-flex;align-items:center;white-space:nowrap;will-change:transform;";
			let l = I();
			D.appendChild(l), E.appendChild(D), e.appendChild(E);
			let u = E.clientWidth || e.clientWidth, d = Math.max(0, l.scrollWidth - u), f = t.force === !0 || d > Q(t.threshold, 1);
			if (e.dataset.ktOverflowActive = String(f), !f) {
				D.style.display = "inline-block", D.style.maxWidth = "100%", D.style.overflow = "hidden", D.style.textOverflow = t.ellipsis === !1 ? "clip" : "ellipsis";
				return;
			}
			if (n === "loop") {
				l.style.marginRight = `${s}px`;
				let e = I(v, !0);
				e.style.marginRight = `${s}px`, D.appendChild(e);
				let n = l.getBoundingClientRect().width + s, a = Math.max(200, n / r * 1e3), o = c < 0 ? 0 : -n, u = c < 0 ? -n : 0;
				x = D.animate([{ transform: `translate3d(${o}px,0,0)` }, { transform: `translate3d(${u}px,0,0)` }], {
					duration: a,
					delay: i,
					iterations: t.repeat === !1 ? 1 : Infinity,
					easing: "linear",
					fill: "both"
				});
				return;
			}
			let p = d, m = Math.max(120, p / r * 1e3), h = c < 0 ? 0 : -p, g = c < 0 ? -p : 0;
			if (D.style.transform = `translate3d(${h}px,0,0)`, n === "bounce") {
				let e = i + m + a + m + o, n = _(i / e, 0, 1), r = _((i + m) / e, n, 1), s = _((i + m + a) / e, r, 1), c = _((i + m + a + m) / e, s, 1);
				x = D.animate([
					{
						transform: `translate3d(${h}px,0,0)`,
						offset: 0
					},
					{
						transform: `translate3d(${h}px,0,0)`,
						offset: n
					},
					{
						transform: `translate3d(${g}px,0,0)`,
						offset: r
					},
					{
						transform: `translate3d(${g}px,0,0)`,
						offset: s
					},
					{
						transform: `translate3d(${h}px,0,0)`,
						offset: c
					},
					{
						transform: `translate3d(${h}px,0,0)`,
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
				x = D.animate([{ transform: `translate3d(${h}px,0,0)` }, { transform: `translate3d(${g}px,0,0)` }], {
					duration: m,
					delay: i,
					easing: t.easing || "ease-in-out",
					fill: "forwards"
				});
				return;
			}
			if (n === "scroll-fade" || n === "scrollFade") {
				let e = Q(t.maskDuration, 320, 10);
				if (t.crossfade === !0) {
					let n = l.getBoundingClientRect().height || l.offsetHeight;
					E.style.height = n ? `${n}px` : "1.35em", D.style.position = "absolute", D.style.left = "0", D.style.top = "0", D.style.willChange = "transform,opacity";
					let r = async () => {
						if (w || T) return;
						D.style.opacity = "1", D.style.transform = `translate3d(${h}px,0,0)`;
						let n = D.animate([{ transform: `translate3d(${h}px,0,0)` }, { transform: `translate3d(${g}px,0,0)` }], {
							duration: m,
							delay: i,
							easing: t.easing || "linear",
							fill: "forwards"
						});
						x = n;
						try {
							await n.finished;
						} catch {
							return;
						}
						if (w || T || (n.cancel(), D.style.transform = `translate3d(${g}px,0,0)`, await new Promise((e) => M(e, a)), w || T)) return;
						let s = D.cloneNode(!0);
						s.setAttribute("aria-hidden", "true"), s.style.cssText = D.style.cssText, s.style.transform = `translate3d(${g}px,0,0)`, s.style.opacity = "1", E.appendChild(s), D.style.transform = `translate3d(${h}px,0,0)`, D.style.opacity = "0", s.animate([{ opacity: 1 }, { opacity: 0 }], {
							duration: e,
							easing: "ease",
							fill: "forwards"
						});
						let c = D.animate([{ opacity: 0 }, { opacity: 1 }], {
							duration: e,
							easing: "ease",
							fill: "forwards"
						});
						x = c;
						try {
							await c.finished;
						} catch {
							s.remove();
							return;
						}
						s.remove(), D.style.opacity = "1", t.repeat !== !1 && M(r, o);
					};
					r();
					return;
				}
				let n = i + e + m + e + a, r = _(i / n, 0, 1), s = _((i + e) / n, r, 1), c = _((i + e + m) / n, s, 1), u = _((i + e + m + e) / n, c, 1);
				x = D.animate([
					{
						transform: `translate3d(${h}px,0,0)`,
						opacity: 0,
						offset: 0
					},
					{
						transform: `translate3d(${h}px,0,0)`,
						opacity: 0,
						offset: r
					},
					{
						transform: `translate3d(${h}px,0,0)`,
						opacity: 1,
						offset: s
					},
					{
						transform: `translate3d(${g}px,0,0)`,
						opacity: 1,
						offset: c
					},
					{
						transform: `translate3d(${g}px,0,0)`,
						opacity: 0,
						offset: u
					},
					{
						transform: `translate3d(${g}px,0,0)`,
						opacity: 0,
						offset: 1
					}
				], {
					duration: n,
					iterations: t.repeat === !1 ? 1 : Infinity,
					easing: "linear",
					fill: "both"
				});
				return;
			}
			if (n === "page-roll" || n === "pageRoll") {
				let n = Math.max(1, u - Q(t.pageOverlap, 12)), r = [0];
				for (let e = n; e < d; e += n) r.push(e);
				r.at(-1) !== d && r.push(d);
				let a = Q(t.rollDuration, 420, 60), s = Q(t.pageDuration, 1200, 120), l = t.rollDirection === "down";
				E.style.height = "1.3em", D.remove();
				let f = (e) => {
					let t = document.createElement("span");
					t.className = "kt-overflow-text-line", t.setAttribute("aria-hidden", "true"), t.style.cssText = "position:absolute;left:0;top:0;height:100%;display:inline-flex;align-items:center;white-space:nowrap;will-change:transform;";
					let n = I();
					return n.style.transform = `translate3d(${e}px,0,0)`, t.appendChild(n), E.appendChild(t), t;
				}, p = (e) => {
					let t = r[e];
					return c < 0 ? -t : -(d - t);
				}, m = f(0), h = f(0);
				h.style.transform = "translateY(100%)";
				let g = 0, _ = async () => {
					if (w || T) return;
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
					x = d;
					try {
						await Promise.all([u.finished, d.finished]);
					} catch {
						return;
					}
					if (w) return;
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
				D.style.display = "inline-block", D.textContent = "";
				let l = [];
				N(v).forEach((e) => {
					if (/^\s$/.test(e)) {
						D.appendChild(document.createTextNode(e));
						return;
					}
					let t = document.createElement("span");
					t.textContent = e, t.style.cssText = "display:inline-block;will-change:transform,opacity,filter;", D.appendChild(t), l.push(t);
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
					return x = o, o.finished.catch(() => {});
				})), p = 0, m = Q(t.pageDuration, 1200, 120), h = async () => {
					if (w || T || (await f(!1), w)) return;
					p = (p + 1) % r.length;
					let n = r[p], i = c < 0 ? -n : -(d - n);
					D.style.transform = `translate3d(${i}px,0,0)`, await f(!0), D.dataset.page = String(p), t.onPage?.(p, r.length, e), (t.repeat !== !1 || p < r.length - 1) && M(h, p === 0 ? o : m);
				};
				M(h, i);
				return;
			}
			if (n === "fade") {
				let n = Math.max(1, u - Q(t.pageOverlap, 12)), r = [0];
				for (let e = n; e < d; e += n) r.push(e);
				r.at(-1) !== d && r.push(d);
				let a = Q(t.maskDuration, 300, 10), s = Q(t.pageDuration, 1200, 120), l = 0, f = async () => {
					if (w || T || (await D.animate([{ opacity: 1 }, { opacity: 0 }], {
						duration: a,
						easing: "ease",
						fill: "forwards"
					}).finished.catch(() => {}), w)) return;
					l = (l + 1) % r.length;
					let n = r[l], i = c < 0 ? -n : -(d - n);
					D.style.transform = `translate3d(${i}px,0,0)`, x = D.animate([{ opacity: 0 }, { opacity: 1 }], {
						duration: a,
						easing: "ease",
						fill: "forwards"
					}), await x.finished.catch(() => {}), D.dataset.page = String(l), t.onPage?.(l, r.length, e), (t.repeat !== !1 || l < r.length - 1) && M(f, l === 0 ? o : s);
				};
				M(f, i);
				return;
			}
			if (n === "flip") {
				e.style.perspective = `${Q(t.perspective, 520, 120)}px`;
				let n = Math.max(1, u - Q(t.pageOverlap, 12)), r = [0];
				for (let e = n; e < d; e += n) r.push(e);
				r.at(-1) !== d && r.push(d);
				let a = 0, s = Q(t.pageDuration, 1200, 120), l = Q(t.flipDuration ?? t.maskDuration, 300, 60), f = (t.flipDirection || "down") === "up" ? 1 : -1;
				E.style.transformOrigin = "50% 50%", E.style.willChange = "transform,opacity";
				let p = async () => {
					if (w || T) return;
					let n = E.animate([{
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
					x = n;
					try {
						await n.finished;
					} catch {
						return;
					}
					if (w) return;
					a = (a + 1) % r.length;
					let i = r[a], u = c < 0 ? -i : -(d - i);
					D.style.transform = `translate3d(${u}px,0,0)`;
					let m = E.animate([{
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
					x = m;
					try {
						await m.finished;
					} catch {
						return;
					}
					D.dataset.page = String(a), t.onPage?.(a, r.length, e), (t.repeat !== !1 || a < r.length - 1) && M(p, a === 0 ? o : s);
				};
				M(p, i);
				return;
			}
			if (n === "page") {
				let n = Math.max(1, u - Q(t.pageOverlap, 12)), r = [0];
				for (let e = n; e < d; e += n) r.push(e);
				r.at(-1) !== d && r.push(d);
				let a = 0, s = Q(t.pageDuration, 1100, 120), l = async () => {
					if (w || T || (await P(E), w)) return;
					a = (a + 1) % r.length;
					let n = r[a], i = c < 0 ? -n : -(d - n);
					D.style.transform = `translate3d(${i}px,0,0)`, E.offsetWidth, await F(E), D.dataset.page = String(a), t.onPage?.(a, r.length, e), (t.repeat !== !1 || a < r.length - 1) && M(l, a === 0 ? o : s);
				};
				M(l, i);
				return;
			}
			let y = async () => {
				if (w || T) return;
				D.style.transform = `translate3d(${h}px,0,0)`, E.style.clipPath = "inset(0 0 0 0)";
				let e = D.animate([{ transform: `translate3d(${h}px,0,0)` }, { transform: `translate3d(${g}px,0,0)` }], {
					duration: m,
					delay: i,
					easing: t.easing || "linear",
					fill: "forwards"
				});
				x = e;
				try {
					await e.finished;
				} catch {
					return;
				}
				w || T || (e.cancel(), D.style.transform = `translate3d(${g}px,0,0)`, M(async () => {
					await P(E), !w && (D.style.transform = `translate3d(${h}px,0,0)`, E.offsetWidth, await F(E), t.repeat !== !1 && M(y, o));
				}, a));
			};
			y();
		}, B = () => {
			n === "rolling" ? L() : b && b.length >= 2 ? R() : z();
		};
		B();
		let V = [
			"rolling",
			"fade",
			"dissolve",
			"flip",
			"page",
			"page-roll",
			"pageRoll",
			"scroll-fade",
			"scrollFade"
		].includes(n) || b && b.length >= 2;
		if (typeof ResizeObserver < "u" && n !== "rolling") {
			let t = e.clientWidth;
			S = new ResizeObserver(() => {
				Math.abs(e.clientWidth - t) < 1 || (t = e.clientWidth, j(), B());
			}), S.observe(e);
		}
		let H = () => {
			k = !0, x?.playState === "running" && x.pause();
		}, U = () => {
			if (k = !1, x?.playState === "paused" && x.play(), A && C == null) {
				let e = A;
				A = null, M(e, 220);
			}
		};
		return d && (e.addEventListener("pointerenter", H), e.addEventListener("pointerleave", U)), {
			el: e,
			type: "overflowText",
			get index() {
				return O;
			},
			replay() {
				j(), O = 0, B();
			},
			pause() {
				T = !0, x?.pause?.(), clearTimeout(C);
			},
			resume() {
				T = !1, V ? (j(), B()) : (x?.play?.(), x || B());
			},
			destroy() {
				w = !0, j(), S?.disconnect(), e.removeEventListener("pointerenter", H), e.removeEventListener("pointerleave", U), p == null ? e.removeAttribute("style") : e.setAttribute("style", p), m == null ? e.removeAttribute("title") : e.setAttribute("title", m), h == null ? e.removeAttribute("aria-label") : e.setAttribute("aria-label", h), g == null ? e.removeAttribute("role") : e.setAttribute("role", g), e.innerHTML = f, delete e.dataset.ktOverflowActive;
			}
		};
	},
	reduced() {}
};
//#endregion
//#region src/modules/loader.js
function tt(e, t, n) {
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
		fillEl: l,
		render: (e) => {
			let n = _(Number(e) || 0, 0, 100);
			if (o && (o.textContent = `${Math.round(n)}%`), t === "bar" && s && (s.style.transform = `scaleX(${n / 100})`), t === "circular" && s) {
				let e = Number(s.dataset.circumference || 0);
				s.style.strokeDashoffset = String(e * (1 - n / 100));
			}
			l && (l.style.transform = `${l.dataset.axis}(${n / 100})`);
		}
	};
}
function nt(e) {
	if (Array.isArray(e.resources)) return e.resources;
	let t = e.resourceSelector || "img[src],img[data-src],video[src],source[src],link[rel=\"stylesheet\"],script[src]";
	return Array.from(document.querySelectorAll(t));
}
var rt = {
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
		let s = tt(e, n, t), c = _(Number(t.progress ?? t.percent ?? 0), 0, 100), l = c, u = !1, d = !1, f = !1, p = null, m = null, h = null, g = null, v = [], y = performance.now();
		e.setAttribute("role", "status"), e.setAttribute("aria-label", t.ariaLabel || "Loading"), a && (document.body.style.overflow = "hidden", document.documentElement.style.overflow = "hidden");
		let b = () => {
			s.render(l), e.setAttribute("aria-valuenow", String(Math.round(l))), e.style.setProperty("--kt-loader-progress", (l / 100).toFixed(4)), e.style.setProperty("--kt-loader-percent", String(Math.round(l))), t.onProgress?.(l, e);
		}, x = () => {
			d || (f || (l += (c - l) * _(Number(t.smoothing ?? .16), .01, 1)), Math.abs(l - c) < .05 && (l = c), b(), p = requestAnimationFrame(x));
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
			d || u || (c = _(Number(e) || 0, 0, 100), c >= 100 && C());
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
			let e = nt(t);
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
				g = new globalThis.PerformanceObserver((r) => {
					n += r.getEntries().length;
					let i = Math.max(Number(t.expectedResources ?? e + 12), e + n);
					w(Math.min(92, (e + n) / i * 100));
				});
				try {
					g.observe({
						type: "resource",
						buffered: !0
					});
				} catch {}
			}
			document.readyState === "complete" ? C() : (h = C, window.addEventListener("load", h, { once: !0 }));
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
				d = !0, clearTimeout(m), p != null && cancelAnimationFrame(p), h && window.removeEventListener("load", h), g?.disconnect(), v.forEach((e) => e()), s.root && s.root !== e && s.root.remove(), s.fillEl?.remove(), document.body.style.overflow = o.bodyOverflow, document.documentElement.style.overflow = o.rootOverflow, o.style == null ? e.removeAttribute("style") : e.setAttribute("style", o.style), o.aria == null ? e.removeAttribute("aria-label") : e.setAttribute("aria-label", o.aria), o.role == null ? e.removeAttribute("role") : e.setAttribute("role", o.role), o.class == null ? e.removeAttribute("class") : e.setAttribute("class", o.class), e.removeAttribute("aria-valuenow");
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
}, it = {
	create(e, t) {
		if (t.disableOnMobile === !0 && typeof window < "u" && window.matchMedia?.("(hover: none), (pointer: coarse)").matches) return null;
		let n = window.matchMedia?.("(hover: none)").matches === !0, r = typeof DeviceOrientationEvent < "u";
		if (n && (t.gyro === !1 || !r)) return null;
		let i = Math.max(0, Number(t.max ?? 12)), a = Math.max(0, Number(t.maxX ?? i)), o = Math.max(0, Number(t.maxY ?? i)), s = Math.max(100, Number(t.perspective ?? 1e3)), c = Math.max(.5, Number(t.scale ?? 1.02)), l = _(Number(t.smoothing ?? t.ease ?? .1), .01, 1), u = Math.max(.1, Number(t.sensitivity ?? 1)), d = t.axis || "both", f = t.reverse === !0 ? -1 : 1, p = t.reset !== !1, m = t.glare !== !1, v = Math.max(20, Number(t.glareRadius ?? 180)), y = _(Number(t.glareOpacity ?? .32), 0, 1), b = t.glareColor || "rgba(255,255,255,.85)", x = Math.max(0, Number(t.glareBlur ?? 8)), S = E(e, [
			"transform",
			"transformStyle",
			"willChange",
			"position"
		]);
		getComputedStyle(e).position === "static" && (e.style.position = "relative"), e.style.transformStyle = "preserve-3d", e.style.willChange = "transform";
		let C = 0, w = 0, T = 0, D = 0, O = 1, k = 1, A = !0, j = null, M = !1, N = null, P = null, F = 50, I = 50;
		m && (N = document.createElement("span"), N.className = "kt-tilt-glare-wrap", N.setAttribute("aria-hidden", "true"), N.style.cssText = "position:absolute;inset:0;overflow:hidden;border-radius:inherit;pointer-events:none;z-index:9;", P = document.createElement("span"), P.className = "kt-tilt-glare", P.style.cssText = `position:absolute;width:${v * 2}px;height:${v * 2}px;left:${-v}px;top:${-v}px;border-radius:50%;pointer-events:none;background:radial-gradient(circle,${b},rgba(255,255,255,0) 68%);filter:blur(${x}px);opacity:0;transition:opacity .2s ease;mix-blend-mode:screen;`, N.appendChild(P), e.appendChild(N));
		let L = () => {
			if (!A) return;
			T = g(T, C, l), D = g(D, w, l), k = g(k, O, l), e.style.transform = `perspective(${s}px) rotateX(${T}deg) rotateY(${D}deg) scale3d(${k},${k},${k})`, P && (P.style.transform = `translate3d(${F}%,${I}%,0)`);
			let t = Math.abs(T - C) > .02 || Math.abs(D - w) > .02 || Math.abs(k - O) > .002;
			j = M || t ? requestAnimationFrame(L) : null;
		}, R = () => {
			A && j == null && (j = requestAnimationFrame(L));
		}, z = () => {
			M = !0, O = c, P && (P.style.opacity = String(y)), R();
		}, B = (t) => {
			let n = e.getBoundingClientRect();
			if (!n.width || !n.height) return;
			let r = _(((t.clientX - n.left) / n.width - .5) * u + .5, 0, 1), i = _(((t.clientY - n.top) / n.height - .5) * u + .5, 0, 1);
			C = d === "x" ? 0 : -(i - .5) * 2 * a * f, w = d === "y" ? 0 : (r - .5) * 2 * o * f, F = r * 100, I = i * 100, R();
		}, V = () => {
			M = !1, p && (C = 0, w = 0, O = 1), P && (P.style.opacity = "0"), R();
		}, H = null;
		return n ? (H = (e) => {
			let t = _((e.gamma || 0) / 28, -1, 1), n = _(((e.beta || 0) - 40) / 28, -1, 1);
			C = -n * a * f, w = t * o * f, F = (t + 1) * 50, I = (n + 1) * 50, P && (P.style.opacity = String(y)), M = !0, R();
		}, h().then((e) => {
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
}, at = /* @__PURE__ */ new WeakMap();
function ot(e) {
	if (!e.clickSprite) return null;
	let t = at.get(e);
	if (!t) {
		t = {}, at.set(e, t);
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
function st(e) {
	return e.clientX >= 0 && e.clientY >= 0 && e.clientX <= window.innerWidth && e.clientY <= window.innerHeight;
}
function ct(e, t) {
	return t.global === !0 ? !1 : t.global === !1 ? !0 : !e || e === document.body || e === document.documentElement || !e.children.length && !e.textContent.trim() ? !1 : e.clientWidth > 4 && e.clientHeight > 4;
}
var lt = {
	create(e, t = {}) {
		if (window.matchMedia?.("(hover: none), (pointer: coarse)").matches || navigator.maxTouchPoints > 0) return !t.clickSprite && !t.clickImage ? null : (ot(t), this._clickEffectsOnly(e, t));
		let n = t.type || t.preset || "dot", r = _(Number(t.smoothing ?? t.ease ?? t.speed ?? .16), .01, 1), i = Math.max(1, Number(t.dotSize ?? 7)), a = Math.max(i, Number(t.followerSize ?? 34)), o = Math.max(.1, Number(t.hoverScale ?? 1.7)), s = Math.max(.1, Number(t.pressScale ?? .82)), c = t.color || "currentColor", l = t.borderColor || c, u = t.background || "transparent", d = t.mixBlendMode || "normal", f = _(Number(t.opacity ?? 1), 0, 1), p = Number(t.zIndex ?? 2147483e3), m = t.hoverSelector || "a,button,input,select,textarea,label,[role=\"button\"],[data-kt-cursor-hover]", h = t.hiddenSelector || "[data-kt-cursor-hide]", v = ct(e, t), y = document.documentElement, b = y.style.cursor;
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
			D.spring = _(Number(t.spring ?? .28), .05, .9);
		} else if (n === "orbit") {
			let e = String(t.orbitText || t.text || "KINETO · "), n = Array.from(e);
			n.forEach((e, r) => {
				let i = M(`font:700 ${Number(t.labelSize ?? 12)}px ui-monospace,monospace;color:${t.textColor || c};text-transform:uppercase;line-height:1;`, r);
				i.textContent = e === " " ? "\xA0" : e, D.angles.push(r / n.length * Math.PI * 2);
			}), D.orbitRadius = Math.max(16, Number(t.orbitRadius ?? 56)), D.orbitSpeed = Number(t.orbitSpeed ?? .016), D.squash = _(Number(t.orbitSquash ?? .42), .1, 1), D.orbitHoverRadius = D.orbitRadius * Math.max(1, Number(t.orbitHoverScale ?? 1.55)), D.orbitCur = D.orbitRadius, D.squashCur = D.squash;
		} else if (n === "snake") {
			let e = String(t.snakeText || t.text || "KINETO"), n = Number(t.labelSize ?? 14);
			Array.from(e).forEach((e, r) => {
				let i = M(`font:800 ${n}px ui-monospace,monospace;color:${t.textColor || c};line-height:1;`, r);
				i.textContent = e === " " ? "\xA0" : e;
			}), D.spring = _(Number(t.spring ?? .35), .05, .9), D.gap = Math.max(4, Number(t.snakeGap ?? n * .78)), D.scales = D.nodes.map(() => 1), D.minScale = _(Number(t.snakeMinScale ?? .42), .1, 1), D.scaleEase = _(Number(t.snakeScaleEase ?? .08), .02, .5);
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
		}, W = t.hoverEffect || (S ? "dot" : "ring"), G = Math.max(i + 2, Number(t.hoverDotSize ?? (C ? a * .58 : i * 3))), ee = () => (V && W === "ring" ? o : 1) * (z ? s : 1), te = (e) => {
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
		}, K = () => {
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
		}, J = (e) => v ? H : !e.target?.closest?.("[data-kt-cursor-scope]"), ne = (t) => {
			N = t.clientX, P = t.clientY, v && (H = !!(t.target && typeof t.target.closest == "function" && (t.target.closest("[data-kt-cursor-scope]") === e || e.contains(t.target))));
			let r = J(t) && st(t) && !t.target?.closest?.(h);
			if (r !== R && U(r), S && (S.style.transform = `translate3d(${N}px,${P}px,0) translate(-50%,-50%)`), w && (w.dataset.crosshairFull ? (w.children[0].style.transform = `translateY(${P}px)`, w.children[1].style.transform = `translateX(${N}px)`) : w.style.transform = `translate3d(${N}px,${P}px,0)`), n === "sparkle" && R) {
				let e = performance.now();
				e - O.last >= O.throttle && (O.last = e, q(N, P));
			}
		}, re = (t) => {
			if (v && !e.contains(t.target)) return;
			let n = t.target.closest?.(m);
			n && n !== V ? te(n) : !n && V && K();
		}, Y = (e) => {
			V && !V.contains(e.relatedTarget) && K(), e.relatedTarget || U(!1);
		}, X = null, ie = (e, n) => {
			if (t.clickSprite) {
				let r = ot(t) || {}, i = Math.max(8, Number(t.clickSpriteWidth ?? r.width ?? 96)), a = Math.max(8, Number(t.clickSpriteHeight ?? r.height ?? i)), o = Math.max(1, Math.round(Number(t.clickSpriteFrames ?? r.frames ?? 8))), s = Math.max(80, Number(t.clickSpriteDuration ?? 480)), c = `${i}x${o}`;
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
		}, se = (e) => {
			e.relatedTarget || U(!1);
		}, ce = () => {
			H = !1, U(!1), V && K();
		}, Z = () => {
			if (L) {
				if (F = g(F, N, r), I = g(I, P, r), C && (C.style.transform = `translate3d(${F}px,${I}px,0) translate(-50%,-50%) scale(${ee()})`), n === "text" && w && !w.dataset.crosshairFull && (w.style.transform = `translate3d(${F}px,${I}px,0) scale(${z ? s : 1})`), n === "trail") {
					let e = N, t = P, n = D.spring || .2;
					D.nodes.forEach((r, i) => {
						D.xs[i] = g(D.xs[i], e, n), D.ys[i] = g(D.ys[i], t, n);
						let a = Number(r.dataset.half || 0);
						r.style.transform = `translate3d(${D.xs[i] - a}px,${D.ys[i] - a}px,0)`, e = D.xs[i], t = D.ys[i];
					});
				} else if (n === "snake") {
					let e = N, t = P, n = D.spring || .35, r = D.gap || 11, i = D.minScale ?? .42, a = D.scaleEase ?? .08;
					D.nodes.forEach((o, s) => {
						D.xs[s] = g(D.xs[s], e, n), D.ys[s] = g(D.ys[s], t, n);
						let c = Math.hypot(e - D.xs[s], t - D.ys[s]), l = _(i + (1 - i) * Math.sqrt(Math.min(1, c / r)), i, 1);
						D.scales[s] = g(D.scales[s] ?? 1, l, a), o.style.transform = `translate3d(${D.xs[s]}px,${D.ys[s]}px,0) scale(${D.scales[s].toFixed(3)})`, e = D.xs[s], t = D.ys[s];
					});
				} else if (n === "orbit") {
					let e = (V ? D.orbitHoverRadius : D.orbitRadius) * (z ? s : 1);
					D.orbitCur = g(D.orbitCur, e, z ? .28 : .12), D.squashCur = g(D.squashCur, V ? 1 : D.squash, .12), D.angles = D.angles.map((e) => e + D.orbitSpeed), D.nodes.forEach((e, t) => {
						let n = F + D.orbitCur * Math.cos(D.angles[t]), r = I + D.orbitCur * Math.sin(D.angles[t]) * D.squashCur;
						e.style.transform = `translate3d(${Math.round(n)}px,${Math.round(r)}px,0)`;
					});
				}
				B = requestAnimationFrame(Z);
			}
		};
		return window.addEventListener("pointermove", ne, { passive: !0 }), document.addEventListener("pointerover", re), document.addEventListener("pointerout", Y), document.addEventListener("pointerdown", ae, { passive: !0 }), document.addEventListener("pointerup", oe, { passive: !0 }), window.addEventListener("mouseout", se), v && e.addEventListener("pointerleave", ce), B = requestAnimationFrame(Z), {
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
				L || (L = !0, x.hidden = !1, B = requestAnimationFrame(Z));
			},
			destroy() {
				L = !1, B != null && cancelAnimationFrame(B), window.removeEventListener("pointermove", ne), document.removeEventListener("pointerover", re), document.removeEventListener("pointerout", Y), document.removeEventListener("pointerdown", ae), document.removeEventListener("pointerup", oe), window.removeEventListener("mouseout", se), v && (e.removeEventListener("pointerleave", ce), e.classList.remove("kt-cursor-scope"), e.removeAttribute("data-kt-cursor-scope")), E?.remove(), X?.remove(), x.remove(), !v && !document.querySelector(".kt-cursor") && (y.classList.remove("kt-cursor-active"), y.style.cursor = b);
			}
		};
	},
	_clickEffectsOnly(e, t) {
		let n = Number(t.zIndex ?? 2147483e3), r = null, i = (e, i) => {
			if (t.clickSprite) {
				let a = ot(t) || {}, o = Math.max(8, Number(t.clickSpriteWidth ?? a.width ?? 96)), s = Math.max(8, Number(t.clickSpriteHeight ?? a.height ?? o)), c = Math.max(1, Math.round(Number(t.clickSpriteFrames ?? a.frames ?? 8))), l = Math.max(80, Number(t.clickSpriteDuration ?? 480)), u = `${o}x${c}`;
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
}, ut = {
	create(e, t) {
		let n = C();
		if (!n) return null;
		let r = t.baseColor || "rgba(255,255,255,.15)", i = t.fillColor || "currentColor", a = e.innerHTML, o = T(e, ["aria-label"]), s = e.textContent || "";
		e.setAttribute("aria-label", s), e.innerHTML = "";
		let c = N(s).map((t) => {
			if (/^\s$/.test(t)) return e.appendChild(document.createTextNode(t)), null;
			let n = document.createElement("span");
			return n.setAttribute("aria-hidden", "true"), n.textContent = t, n.style.cssText = `display:inline-block;padding:0 .06em;margin:0 -.06em;background-image:linear-gradient(to right,${i} 50%,${r} 50%);background-size:200% 100%;background-position:100% 0;-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;color:transparent;`, e.appendChild(n), n;
		}).filter(Boolean), l = (e) => {
			let t = _(e, 0, 1) * c.length;
			c.forEach((e, n) => {
				let r = _(t - n, 0, 1);
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
function dt(e, t) {
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
var ft = {
	create(e, t = {}) {
		let n = S(), r = C(), i = t.mode || t.type || t.preset || "vertical", a = Array.from(e.children);
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
				l.fromTo(e, dt(i, t), {
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
}, pt = {
	create(e, t = {}) {
		let n = C();
		if (!n) return null;
		let r = t.mode || t.preset || t.effect || "skew", i = t.axis === "x" ? "x" : "y", a = t.reverse === !0 ? -1 : 1, o = Math.max(0, Number(t.maxSkew ?? 8)), s = Math.max(0, Number(t.maxBlur ?? 0)), c = Math.max(0, Number(t.distance ?? 48)), l = Math.max(0, Number(t.maxRotate ?? 4)), u = Math.max(0, Number(t.maxScale ?? .08)), d = Math.max(100, Number(t.velocityDivisor ?? 2200)), f = t.spring !== !1 && t.elastic !== !1, p = _(Number(t.smoothing ?? .16), .01, 1), m = _(Number(t.decay ?? .08), .001, 1), h = Math.max(1, Number(t.stiffness ?? 170)), v = Math.max(.1, Number(t.damping ?? 24)), y = Math.max(.05, Number(t.mass ?? 1)), b = _(Number(t.response ?? 1), .05, 4), x = E(e, [
			"transform",
			"filter",
			"willChange"
		]);
		e.style.willChange = s ? "transform,filter" : "transform";
		let S = 0, w = 0, T = 0, D = !0, O = null, k = performance.now(), A = n.create({
			trigger: t.global === !0 ? document.documentElement : e,
			start: t.start || (t.global === !0 ? 0 : "top bottom"),
			end: t.end || (t.global === !0 ? "max" : "bottom top"),
			onUpdate: (n) => {
				S = _(n.getVelocity() / d, -1, 1) * a * b, t.onDirection?.(n.direction, e, n);
			}
		}), j = (n) => {
			let a = n * c, d = n * o, f = n * l, p = 1 + Math.abs(n) * u, m;
			m = r === "translate" ? i === "x" ? `translate3d(${a}px,0,0)` : `translate3d(0,${a}px,0)` : r === "rotate" ? `rotate(${f}deg)` : r === "scale" ? `scale(${p})` : r === "combo" ? `${i === "x" ? `translate3d(${a}px,0,0)` : `translate3d(0,${a}px,0)`} skew${i === "x" ? "Y" : "X"}(${d}deg) rotate(${f}deg) scale(${p})` : `skew${i === "x" ? "Y" : "X"}(${d}deg)`, e.style.transform = m, s && (e.style.filter = `blur(${Math.abs(n) * s}px)`), t.onUpdate?.(n, e);
		}, M = (e) => {
			if (!D) return;
			let t = Math.min(.05, Math.max(.001, (e - k) / 1e3));
			if (k = e, f) {
				let e = (-h * (w - S) + -v * T) / y;
				T += e * t, w += T * t, S = g(S, 0, m);
			} else w = g(w, S, p), S = g(S, 0, m), T = 0;
			Math.abs(w) < 1e-4 && Math.abs(S) < 1e-4 && (w = 0), j(w), O = requestAnimationFrame(M);
		};
		return O = requestAnimationFrame(M), {
			el: e,
			type: "scrollVelocity",
			get value() {
				return w;
			},
			pause() {
				D = !1, O != null && cancelAnimationFrame(O);
			},
			resume() {
				D || (D = !0, k = performance.now(), O = requestAnimationFrame(M));
			},
			destroy() {
				D = !1, O != null && cancelAnimationFrame(O), A.kill(), x();
			}
		};
	},
	reduced() {}
};
//#endregion
//#region src/modules/progress.js
function mt(e) {
	let t = e.target || "page";
	return () => {
		if (t === "page") {
			let e = document.documentElement.scrollHeight - window.innerHeight;
			return e > 0 ? _(window.scrollY / e, 0, 1) : 0;
		}
		let e = document.querySelector(t);
		if (!e) return 0;
		let n = e.getBoundingClientRect();
		return _((window.innerHeight - n.top) / (window.innerHeight + n.height), 0, 1);
	};
}
function ht(e, t) {
	let [n, r] = String(e || "bottom-right").split("-");
	return `${n === "top" ? "top" : "bottom"}:${t}px;${r === "left" ? "left" : "right"}:${t}px;`;
}
var gt = { create(e, t) {
	let n = t.ui || "", r = _(Number(t.smoothing ?? 0), 0, .95), i = Math.max(0, Number(t.showAfter ?? 0)), a = t.hideAtEnd === !0, o = mt(t), s = !0, c = null, l = 0, u = null, d = [], f = () => {
		if (!s) return;
		let n = o();
		l = r > 0 ? l + (n - l) * (1 - r) : n, u?.(l, n), t.onUpdate?.(l, e), c = requestAnimationFrame(f);
	}, p = (e, t) => {
		if (!i && !a) return;
		let n = i > 0 && window.scrollY < i || a && t >= .999;
		e.style.opacity = n ? "0" : "1", e.style.pointerEvents = n ? "none" : "";
	}, m = null, h = null;
	if (n === "bar") {
		let n = Math.max(1, Number(t.thickness ?? 3)), r = t.attach || "fixed", i = t.position === "bottom" ? "bottom" : "top", a = Math.max(0, Number(t.radius ?? 0)), o = t.color || "var(--kt-progress-color,#ff5b1c)", s = t.color2 ? `linear-gradient(90deg,${o},${t.color2})` : o, c = document.createElement("div");
		c.className = "kt-progress-bar", c.setAttribute("aria-hidden", "true"), c.style.cssText = r === "fixed" ? `position:fixed;left:0;right:0;${i}:0;height:${n}px;z-index:${Number(t.zIndex ?? 1002)};background:${t.trackColor || "var(--kt-progress-track,transparent)"};border-radius:${a}px;transition:opacity .25s ease;` : `position:relative;width:100%;height:${n}px;background:${t.trackColor || "var(--kt-progress-track,rgba(128,128,128,.18))"};border-radius:${a}px;overflow:hidden;transition:opacity .25s ease;`;
		let l = document.createElement("div");
		l.className = "kt-progress-bar-fill", l.style.cssText = `width:100%;height:100%;background:${s};border-radius:inherit;transform:scaleX(0);transform-origin:left center;will-change:transform;`, c.appendChild(l), (r === "fixed" ? document.body : e).appendChild(c), d.push(c), u = (e, t) => {
			l.style.transform = `scaleX(${e})`, p(c, t);
		};
	} else if (n === "ring") {
		let n = Math.max(20, Number(t.size ?? 46)), r = Math.max(1, Number(t.stroke ?? 3)), i = t.attach || "fixed", a = t.showPercent === !0, o = t.clickToTop === !0, s = (n - r) / 2, c = 2 * Math.PI * s, l = t.color || "var(--kt-progress-color,#ff5b1c)", f = t.trackColor || "var(--kt-progress-track,rgba(128,128,128,.22))", m = document.createElement(o ? "button" : "div");
		m.className = "kt-progress-ring", o ? (m.type = "button", m.setAttribute("aria-label", t.label || "Scroll back to top")) : m.setAttribute("aria-hidden", "true"), m.style.cssText = `${i === "fixed" ? `position:fixed;${ht(t.position, Math.max(0, Number(t.offset ?? 18)))}z-index:${Number(t.zIndex ?? 1200)};` : "position:relative;"}width:${n}px;height:${n}px;display:inline-flex;align-items:center;justify-content:center;border:0;padding:0;background:var(--kt-progress-ring-bg,transparent);border-radius:50%;${o ? "cursor:pointer;" : ""}transition:opacity .25s ease;color:inherit;`, m.innerHTML = `<svg viewBox="0 0 ${n} ${n}" width="${n}" height="${n}" aria-hidden="true" style="position:absolute;inset:0;transform:rotate(-90deg);"><circle class="kt-progress-ring-track" cx="${n / 2}" cy="${n / 2}" r="${s}" fill="none" stroke="${f}" stroke-width="${r}"/><circle class="kt-progress-ring-fill" cx="${n / 2}" cy="${n / 2}" r="${s}" fill="none" stroke="${l}" stroke-width="${r}" stroke-linecap="round" stroke-dasharray="${c}" stroke-dashoffset="${c}"/></svg>`;
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
		n.startsWith("--") ? (m = () => e.style.removeProperty(n), u = (t) => {
			e.style.setProperty(n, t.toFixed(4));
		}) : (m = E(e, [
			"transform",
			"transformOrigin",
			"width",
			"willChange"
		]), h = T(e, ["aria-hidden"]), e.style.transformOrigin = "left center", e.style.willChange = n === "scaleX" ? "transform" : "width", e.setAttribute("aria-hidden", "true"), u = (t) => {
			n === "scaleX" ? e.style.transform = `scaleX(${t})` : e.style.width = `${t * 100}%`;
		});
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
			s = !1, c != null && cancelAnimationFrame(c), d.forEach((e) => e.remove()), h?.(), m?.();
		}
	};
} }, _t = {
	create(e, t = {}) {
		let n = e.querySelector(".kt-slider-wrap") || e, r = n.querySelector(".kt-slider-track") || e.firstElementChild;
		if (!r) return null;
		let i = Array.from(r.children);
		if (!i.length) return null;
		let a = (t.effect || t.preset || "slide") === "coverflow", o = Math.max(0, Number(t.gap ?? (a ? 22 : 0))), s = _(Number(t.perView ?? (a ? 1.35 : 1)), 1, i.length), c = a || (t.align || "center") !== "left", l = c ? i.length - 1 : Math.max(0, Math.ceil(i.length - s)), u = t.loop === !0 ? "infinite" : t.loop || "off", d = u === "infinite", f = _(Number(t.smoothing ?? .14 / Math.max(.2, Number(t.speed ?? t.duration ?? .55) / .55)), .02, .5), p = t.autoplay === !0 ? 3e3 : Math.max(0, Number(t.autoplay || 0)), m = t.pauseOnHover !== !1, h = Number(t.rotate ?? 32), v = Number(t.depth ?? 140), y = Number(t.scaleStep ?? .12), b = _(Number(t.minScale ?? .8), .2, 1), x = Number(t.opacityStep ?? .32), S = _(Number(t.minOpacity ?? .25), 0, 1), C = t.axis === "y", w = {
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
		}, T = _(Math.round(Number(t.initial ?? 0)), 0, l), E = T, D = T, O = !1, k = 0, A = 0, j = 0, M = 0, N = 0, P = null, F = null, I = null, L = !1, R = !0;
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
				let i = d ? ee(n - E) : n - E, s = Math.abs(i), c = o + i * r * (a ? Number(t.spacing ?? .62) : 1);
				if (a) {
					let t = _(-i * h, -h * 1.4, h * 1.4), n = Math.max(b, 1 - s * y);
					e.style.transform = C ? `translate3d(0,${c}px,${-s * v}px) rotateX(${-t}deg) scale(${n})` : `translate3d(${c}px,0,${-s * v}px) rotateY(${t}deg) scale(${n})`, e.style.opacity = String(Math.max(S, 1 - s * x)), e.style.zIndex = String(1e3 - Math.round(s * 10));
				} else e.style.transform = C ? `translate3d(0,${c}px,0)` : `translate3d(${c}px,0,0)`, e.style.opacity = "1", e.style.zIndex = "";
			});
		}, H = () => {
			i.forEach((e, t) => {
				let n = t === T, r = c ? Math.abs(t - T) > Math.ceil(s / 2) : t < T || t >= T + Math.ceil(s);
				e.setAttribute("aria-hidden", String(a ? !n : r)), e.classList.toggle("is-active", n);
			}), e.dataset.ktSliderIndex = String(T), t.onChange?.(T, i[T], e);
		}, U = () => {
			R && (E = g(E, D, O ? .55 : f), V(), O || Math.abs(E - D) > .0015 ? F = requestAnimationFrame(U) : (E = D, V(), F = null));
		}, W = () => {
			R && F == null && (F = requestAnimationFrame(U));
		}, G = i.length, ee = (e) => (e = (e % G + G) % G, e > G / 2 ? e - G : e), te = (e) => (Math.round(e) % G + G) % G, K = (e) => {
			D = d ? e : _(e, 0, l);
			let t = d ? te(D) : _(Math.round(D), 0, l);
			t !== T && (T = t, H()), W();
		}, q = (e) => {
			if (d) {
				let t = Math.round(D);
				K(t + Math.round(ee(e - t)));
			} else K(e);
		}, J = () => d ? K(Math.round(D) + 1) : q(u === "rewind" && T >= l ? 0 : T + 1), ne = () => d ? K(Math.round(D) - 1) : q(u === "rewind" && T <= 0 ? l : T - 1), re = () => {
			clearInterval(I), I = null;
		}, Y = () => {
			re(), !(!p || L) && (I = setInterval(() => {
				O || J();
			}, p));
		}, X = (e) => {
			e.pointerType === "mouse" && e.button !== 0 || (O = !0, P = e.pointerId, k = C ? e.clientY : e.clientX, A = D, j = C ? e.clientY : e.clientX, M = performance.now(), N = 0, n.setPointerCapture?.(P), re(), W());
		}, ie = (e) => {
			if (!O || e.pointerId !== P) return;
			let { step: t } = B(), n = C ? e.clientY : e.clientX, r = n - k, i = A - r / Math.max(1, t);
			d || (i < 0 ? i *= .3 : i > l && (i = l + (i - l) * .3));
			let a = performance.now(), o = Math.max(1, a - M);
			N = (j - n) / o, j = n, M = a, D = i, W();
		}, ae = (e) => {
			if (!O || e.pointerId !== P) return;
			O = !1, n.releasePointerCapture?.(P);
			let { step: t } = B(), r = _(N * t * .35 / Math.max(1, t), -1.2, 1.2);
			q(D + r), Y();
		}, oe = (e) => {
			let t = C ? "ArrowDown" : "ArrowRight", n = C ? "ArrowUp" : "ArrowLeft";
			e.key === t ? (e.preventDefault(), J()) : e.key === n ? (e.preventDefault(), ne()) : e.key === "Home" ? (e.preventDefault(), q(0)) : e.key === "End" && (e.preventDefault(), q(l));
		}, se = Array.from(document.querySelectorAll(t.nextSelector || `[data-kt-slider-next="${e.id || ""}"], [data-kt-slider-next]`)).filter((e) => !e.dataset.ktSliderBound), ce = Array.from(document.querySelectorAll(t.prevSelector || `[data-kt-slider-prev="${e.id || ""}"], [data-kt-slider-prev]`)).filter((e) => !e.dataset.ktSliderBound), Z = (e, t) => {
			e.dataset.ktSliderBound = "true", e.addEventListener("click", t);
		};
		se.forEach((e) => Z(e, J)), ce.forEach((e) => Z(e, ne));
		let le = (e) => {
			O && e.preventDefault();
		};
		n.addEventListener("pointerdown", X), n.addEventListener("pointermove", ie), n.addEventListener("pointerup", ae), n.addEventListener("pointercancel", ae), n.addEventListener("touchmove", le, { passive: !1 }), n.addEventListener("keydown", oe);
		let ue = t.wheel === !0, de = 0, fe = (e) => {
			let t = Math.abs(e.deltaX) >= Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
			if (Math.abs(t) < 6) return;
			e.preventDefault();
			let n = performance.now();
			n - de < 320 || (de = n, t > 0 ? J() : ne());
		};
		ue && n.addEventListener("wheel", fe, { passive: !1 });
		let pe = () => {
			m && re();
		}, me = () => {
			m && Y();
		};
		n.addEventListener("pointerenter", pe), n.addEventListener("pointerleave", me);
		let he = typeof ResizeObserver < "u" ? new ResizeObserver(() => {
			V();
		}) : null;
		return he?.observe(n), V(), H(), Y(), {
			el: e,
			type: "slider",
			get index() {
				return T;
			},
			next: J,
			prev: ne,
			goTo(e) {
				q(Number(e));
			},
			replay() {
				q(0);
			},
			pause() {
				L = !0, re();
			},
			resume() {
				L = !1, Y();
			},
			destroy() {
				R = !1, re(), F != null && cancelAnimationFrame(F), he?.disconnect(), n.removeEventListener("pointerdown", X), n.removeEventListener("pointermove", ie), n.removeEventListener("pointerup", ae), n.removeEventListener("pointercancel", ae), n.removeEventListener("touchmove", le), n.removeEventListener("keydown", oe), n.removeEventListener("wheel", fe), n.removeEventListener("pointerenter", pe), n.removeEventListener("pointerleave", me), se.forEach((e) => {
					e.removeEventListener("click", J), delete e.dataset.ktSliderBound;
				}), ce.forEach((e) => {
					e.removeEventListener("click", ne), delete e.dataset.ktSliderBound;
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
		let t = E(e, ["overflowX", "scrollSnapType"]);
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
function vt(e, t = {}) {
	return t.ambientSrc || t.source || t.src || e.dataset?.src || e.getAttribute?.("data-src") || e.currentSrc || e.getAttribute?.("src") || "";
}
function yt(e, t, n) {
	let r = document.createElement("img");
	r.className = "kt-ambient-image-clone", r.alt = "", r.setAttribute("aria-hidden", "true"), r.loading = "eager", r.decoding = "async", r.src = e;
	let i = n.ambientSrcset || t.getAttribute?.("data-srcset") || t.getAttribute?.("srcset");
	return i && (r.srcset = i), r.style.cssText = "display:block;width:100%;height:100%;object-fit:cover;object-position:50% 50%;", r;
}
var bt = {
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
		u.style.cssText = `position:absolute;inset:${d}px;z-index:0;pointer-events:none;border-radius:${t.radius || "inherit"};overflow:hidden;filter:blur(${f}px) saturate(${Number(t.saturation ?? 1.45)}) brightness(${Number(t.brightness ?? .82)});opacity:0;transform:scale(${m}) translateZ(0);transform-origin:center;transition:opacity .45s ease;`, a.insertBefore(u, i);
		let h = r.tagName, g = vt(r, t), _ = null, v = null, y = null, b = null, x = !0, S = 0, C = null, w = 0, T = !1, E = !0, D = null, O = t.color || t.fallbackColor || "rgba(100,120,180,.42)", k = !1, A = () => {
			k = !0, u.style.opacity = String(p);
		}, j = () => {
			k = !1, u.style.opacity = "0";
		}, M = () => {
			u.style.background = O, u.dataset.mode = "color", A();
		};
		if (h === "IMG" || h === "IFRAME" && g) if (g) {
			y = yt(g, r, t), u.appendChild(y), u.dataset.mode = "image-clone", y.complete && y.naturalWidth ? A() : y.addEventListener("load", A, { once: !0 });
			let e = () => {
				let e = vt(r, t);
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
		} else M();
		else if (h === "VIDEO") {
			_ = document.createElement("canvas"), _.className = "kt-ambient-video-canvas", _.width = Math.max(16, Number(t.sampleWidth ?? 48)), _.height = Math.max(9, Number(t.sampleHeight ?? 27)), _.style.cssText = "display:block;width:100%;height:100%;object-fit:cover;", v = _.getContext("2d", {
				alpha: !1,
				desynchronized: !0
			}), u.appendChild(_), u.dataset.mode = "video-sample";
			let e = 1e3 / Math.min(30, Math.max(2, Number(t.sampleFps ?? 12))), n = (t) => {
				if (x) {
					if (t - S >= e && r.readyState >= 2) {
						S = t;
						try {
							v.drawImage(r, 0, 0, _.width, _.height), w += 1, _.dataset.frames = String(w);
						} catch {
							M();
						}
					}
					b = requestAnimationFrame(n);
				}
			}, i = () => {
				b == null && x && (S = 0, b = requestAnimationFrame(n));
			}, a = () => {
				b != null && (cancelAnimationFrame(b), b = null);
			}, o = () => {
				if (!(r.readyState < 2)) try {
					v.drawImage(r, 0, 0, _.width, _.height), w += 1, _.dataset.frames = String(w);
				} catch {
					M();
				}
			};
			D = {
				start: i,
				stop: a
			};
			let s = () => {
				T = !0, E && !document.hidden && (A(), i());
			}, c = () => {
				T = !1, a(), o(), r.readyState >= 2 && A();
			}, l = () => {
				T || (o(), r.readyState >= 2 && A());
			}, d = () => {
				T = !1, a(), j();
			};
			r.addEventListener("playing", s), r.addEventListener("pause", c), r.addEventListener("ended", c), r.addEventListener("loadeddata", l), r.addEventListener("emptied", d), u._mkVid = {
				onPlaying: s,
				onPause: c,
				onFrame: l,
				onBlank: d
			}, !r.paused && !r.ended && r.readyState >= 2 ? s() : r.readyState >= 2 && l();
		} else M();
		let N = null, P = null, F = {
			el: e,
			type: "ambientMedia",
			get mode() {
				return u.dataset.mode;
			},
			get frames() {
				return w;
			},
			pause() {
				x = !1, D?.stop(), b != null && (cancelAnimationFrame(b), b = null), (t.hideOnPause === !0 || _ && !k) && (u.style.opacity = "0");
			},
			resume() {
				x || (x = !0, _ && k && A(), _ && T && D?.start());
			},
			destroy() {
				x = !1, D?.stop(), b != null && cancelAnimationFrame(b), C?.disconnect(), N?.disconnect(), P && document.removeEventListener("visibilitychange", P), u._mkLoadHandler && r.removeEventListener("load", u._mkLoadHandler), u._mkVid && (r.removeEventListener("playing", u._mkVid.onPlaying), r.removeEventListener("pause", u._mkVid.onPause), r.removeEventListener("ended", u._mkVid.onPause), r.removeEventListener("loadeddata", u._mkVid.onFrame), r.removeEventListener("emptied", u._mkVid.onBlank)), u.remove(), o && a.parentNode ? (a.parentNode.insertBefore(i, a), a.remove()) : o || (s == null ? a.removeAttribute("style") : a.setAttribute("style", s)), c == null ? i.removeAttribute("style") : i.setAttribute("style", c), l == null ? r.removeAttribute("style") : r.setAttribute("style", l);
			}
		};
		return _ && typeof IntersectionObserver < "u" && (N = new IntersectionObserver((e) => {
			E = !!e[0]?.isIntersecting, E && !document.hidden ? F.resume() : F.pause();
		}, { rootMargin: "120px" }), N.observe(e), P = () => {
			document.hidden ? F.pause() : E && F.resume();
		}, document.addEventListener("visibilitychange", P)), F;
	},
	reduced() {}
}, xt = {
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
function St(e) {
	let t = e;
	for (; t && t !== document.documentElement;) {
		let e = getComputedStyle(t).backgroundColor, n = e && e.match(/rgba?\(([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:[,\s/]+([\d.]+))?\)/);
		if (n && (n[4] == null || Number(n[4]) > .15)) return .2126 * Number(n[1]) + .7152 * Number(n[2]) + .0722 * Number(n[3]) < 128;
		t = t.parentElement;
	}
	return !1;
}
var Ct = "!@#$%^&*()<>?/|{}~ABCDEFGHIJabcdefghij0123456789", wt = {
	create(e, t) {
		let n = t.preset || t.type || "rgb", r = n === "digital" ? "noise" : n, i = _(Number(t.intensity ?? 1), .1, 3), a = Math.max(.1, Number(t.speed ?? 1)), o = t.loop !== !1, s = t.trigger || "auto";
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
			let f = d.getContext("2d", { alpha: !1 }), p = Math.max(2, Math.round(Number(t.sliceCount ?? 7))), m = !0, h = null, g = /* @__PURE__ */ new Set(), v = (e, t) => {
				let n = setTimeout(() => {
					g.delete(n), m && e();
				}, t / a);
				g.add(n);
			}, y = () => {
				let e = l.getBoundingClientRect(), t = _(window.devicePixelRatio || 1, 1, 2), n = Math.max(1, Math.round(e.width * t)), r = Math.max(1, Math.round(e.height * t));
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
					b(n ? 1 - a : 1 - a * .5), a < 1 ? h = requestAnimationFrame(i) : n ? (c.style.opacity = "1", d.style.opacity = "0") : (d.style.opacity = "0", o && v(x, 700 + Math.random() * 1800));
				};
				h = requestAnimationFrame(i);
			}, S = null, C = null;
			return s === "hover" ? (S = () => {
				m = !0, x();
			}, C = () => {
				g.forEach(clearTimeout), g.clear(), h != null && cancelAnimationFrame(h), d.style.opacity = "0";
			}, l.addEventListener("pointerenter", S), l.addEventListener("pointerleave", C)) : v(x, 400), {
				el: e,
				type: "glitch",
				replay: () => {
					m = !0, n && (c.style.opacity = "0"), x();
				},
				pause: () => {
					m = !1, g.forEach(clearTimeout), g.clear(), h != null && cancelAnimationFrame(h), d.style.opacity = "0";
				},
				resume: () => {
					m || (m = !0, v(x, 200));
				},
				destroy: () => {
					m = !1, g.forEach(clearTimeout), g.clear(), h != null && cancelAnimationFrame(h), S && l.removeEventListener("pointerenter", S), C && l.removeEventListener("pointerleave", C), n && (c.style.opacity = ""), d.remove(), l.style.position = u;
				}
			};
		}
		let c = e.innerHTML, l = e.getAttribute("style"), u = T(e, ["aria-label"]), d = e.textContent || "", f = St(e), p = t.blendMode || (f ? "screen" : "multiply"), m = Array.isArray(t.colors) && t.colors.length >= 2 ? t.colors : f ? [
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
		let h = document.createElement("span");
		h.textContent = d, h.style.cssText = "position:relative;z-index:2;display:inline-block;will-change:transform;", h.setAttribute("aria-hidden", "true"), e.appendChild(h);
		let g = m.slice(0, 3).map((t, n) => {
			let r = document.createElement("span");
			return r.textContent = d, r.setAttribute("aria-hidden", "true"), r.style.cssText = `position:absolute;inset:0;z-index:${3 + n};opacity:0;pointer-events:none;color:${t};mix-blend-mode:${p};will-change:transform,clip-path;`, e.appendChild(r), r;
		}), v = null, y = /* @__PURE__ */ new Set(), b = /* @__PURE__ */ new Set(), x = !0, S = (e, t) => {
			let n = setTimeout(() => {
				y.delete(n), x && e();
			}, Math.max(0, t) / a);
			return y.add(n), n;
		}, C = (e, t, n) => {
			let r = e.animate(t, n);
			return b.add(r), r.finished.catch(() => {}).finally(() => b.delete(r)), r;
		}, w = () => {
			y.forEach(clearTimeout), y.clear(), b.forEach((e) => e.cancel()), b.clear(), h.textContent = d, g.forEach((e) => {
				e.style.opacity = "0";
			});
		}, E = () => {
			if (!x) return;
			let e = (170 + Math.random() * 280) / a, t = () => {
				let e = Math.round(Math.random() * 82), t = Math.round(4 + Math.random() * 20 * i);
				return `inset(${e}% 0 ${Math.max(0, 100 - e - t)}% 0)`;
			}, n = (Math.random() - .5) * 18 * i, r = (Math.random() - .5) * 5 * i, s = Math.max(2, Math.round(3 + i));
			g.forEach((i, a) => {
				let o = a === 1 ? -.6 : a === 2 ? .45 : 1;
				C(i, [
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
			}), C(h, [
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
				h.textContent = Array.from(d, (t) => /^\s$/.test(t) ? t : Math.random() > e * (1.35 - Math.min(.9, .3 * i)) ? Ct[Math.floor(Math.random() * 48)] : t).join(""), r < n ? S(s, t) : (h.textContent = d, o && S(D, 620 + Math.random() * 1100));
			};
			s();
		}, O = () => {
			if (!x) return;
			v || (v = document.createElement("span"), v.setAttribute("aria-hidden", "true"), v.style.cssText = `position:absolute;inset:0;z-index:6;pointer-events:none;border-radius:inherit;background:repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,${.13 * i}) 2px,rgba(0,0,0,${.13 * i}) 4px);opacity:0;transition:opacity .2s ease;`, e.appendChild(v)), v.style.opacity = "1";
			let t = (900 + Math.random() * 700) / a, n = 4 * i;
			C(e, [
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
			w();
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
				w(), x = !0, k();
			},
			pause: () => {
				x = !1, w();
			},
			resume: () => {
				x || (x = !0, S(k, 120));
			},
			destroy: () => {
				x = !1, w(), A && e.removeEventListener("pointerenter", A), j && e.removeEventListener("pointerleave", j), M?.disconnect(), e.innerHTML = c, l == null ? e.removeAttribute("style") : e.setAttribute("style", l), u();
			}
		};
	},
	reduced(e) {
		return {
			el: e,
			type: "glitch",
			pause() {},
			resume() {},
			destroy: T(e, ["aria-label"])
		};
	}
};
//#endregion
//#region src/modules/cardGlow.js
function Tt(e, t = !1) {
	return e == null ? t : e !== !1 && e !== "false" && e !== 0 && e !== "0";
}
var Et = {
	create(e, t = {}) {
		if (t.disableOnMobile === !0 && typeof window < "u" && window.matchMedia?.("(hover: none), (pointer: coarse)").matches) return null;
		let n = t.mode || t.preset || "spotlight", r = e.getAttribute("style"), i = getComputedStyle(e);
		i.position === "static" && (e.style.position = "relative"), n === "aurora" || n === "comet" ? i.zIndex === "auto" && (e.style.zIndex = "1") : (i.overflow === "visible" && (e.style.overflow = "hidden"), e.style.isolation = "isolate");
		let a = Math.max(24, Number(t.radius ?? 180)), o = _(Number(t.opacity ?? t.intensity ?? .72), 0, 1), s = Math.max(0, Number(t.blur ?? 14)), c = Number(t.spread ?? 0), l = t.follow !== !1, u = Math.max(.1, Number(t.sensitivity ?? 1)), d = _(Number(t.smoothing ?? t.speed ?? .16), .01, 1), f = t.color || t.color1 || "rgba(120,150,255,.58)", p = t.color2 || "rgba(148,255,226,.34)", m = document.createElement("span");
		m.className = `kt-card-glow kt-card-glow-${n}`, m.setAttribute("aria-hidden", "true"), m.style.cssText = "position:absolute;inset:0;z-index:0;border-radius:inherit;pointer-events:none;overflow:hidden;opacity:0;transition:opacity .2s ease;";
		let h = document.createElement("span");
		h.className = "kt-card-glow-spotlight", h.style.cssText = `position:absolute;left:${-a}px;top:${-a}px;width:${a * 2}px;height:${a * 2}px;border-radius:50%;background:radial-gradient(circle,${f} 0%,transparent 70%);filter:blur(${s}px);opacity:${o};mix-blend-mode:${t.blendMode || "screen"};will-change:transform;`, m.appendChild(h);
		let v = Tt(t.surface ?? t.reflection, !1), y = null;
		if (v) {
			y = document.createElement("span"), y.className = "kt-card-glow-surface";
			let e = _(Number(t.surfaceOpacity ?? .38), 0, 1), n = Math.max(0, Number(t.surfaceBlur ?? 0)), r = t.surfaceBlend || "soft-light";
			y.style.cssText = `position:absolute;inset:${Number(t.surfaceInset ?? 0)}px;border-radius:inherit;opacity:${e};mix-blend-mode:${r};filter:blur(${n}px);will-change:background;`, m.appendChild(y);
		}
		let b = Tt(t.borderGlow ?? t.luminousBorder, n === "border"), x = null;
		if (b) {
			x = document.createElement("span"), x.className = "kt-card-glow-border";
			let e = Math.max(1, Number(t.borderWidth ?? 1.5)), n = _(Number(t.borderOpacity ?? .8), 0, 1);
			x.style.cssText = `position:absolute;inset:${Number(t.borderInset ?? c)}px;border-radius:inherit;padding:${e}px;opacity:${n};filter:blur(${Math.max(0, Number(t.borderBlur ?? 0))}px);background:radial-gradient(${Math.max(40, Number(t.borderRadius ?? a * .75))}px circle at var(--kt-x,50%) var(--kt-y,50%),${t.borderColor || f},${t.borderColor2 || p} 42%,transparent 74%);-webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);mask-composite:exclude;will-change:background;`, m.appendChild(x);
		}
		if (n === "comet") {
			let e = Math.max(1, Number(t.borderWidth ?? 2)), n = t.borderColor || t.color || "rgba(123,159,255,1)", r = t.borderColor2 || t.color2 || "rgba(91,232,190,.9)", i = Math.max(.8, Number(t.cycleDuration ?? t.speed ?? 3));
			if (m.style.cssText = `position:absolute;inset:0;z-index:0;border-radius:inherit;pointer-events:none;opacity:${+!!Tt(t.alwaysOn, !0)};transition:opacity .35s ease;`, h.style.cssText = `position:absolute;inset:0;border-radius:inherit;padding:${e}px;background:conic-gradient(from var(--kt-angle,0deg),transparent 0deg,${n} 80deg,${r} 160deg,transparent 280deg);-webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);mask-composite:exclude;opacity:${o};animation:kt-border-spin ${i}s linear infinite;filter:blur(${Math.max(0, Number(t.blur ?? 0))}px);will-change:background;`, s > 0 && t.halo !== !1) {
				let e = h.cloneNode(!1);
				e.className = "kt-card-glow-comet-haze", e.style.filter = `blur(${Math.max(6, s)}px)`, e.style.opacity = String(o * .7), m.appendChild(e);
			}
		} else if (n === "aurora") {
			let e = Math.max(2, Number(t.spread ?? 6)), n = Math.max(1, Number(t.cycleDuration ?? t.speed ?? 6)), r = t.color1 || t.color || "rgba(88,150,255,.55)", i = t.color2 || "rgba(94,234,195,.45)";
			m.style.cssText = `position:absolute;inset:${-e}px;z-index:-1;border-radius:inherit;pointer-events:none;opacity:0;transition:opacity .45s ease;`, h.style.cssText = `position:absolute;inset:0;border-radius:inherit;background:conic-gradient(from var(--kt-angle,0deg),${r},${i},${r});filter:blur(${Math.max(4, s)}px);opacity:${o};animation:kt-border-spin ${n}s linear infinite;will-change:filter;`;
		} else n === "shine" && (h.style.cssText = `position:absolute;top:0;bottom:0;left:-55%;width:42%;border-radius:0;background:linear-gradient(90deg,transparent,${f},transparent);filter:blur(${s}px);opacity:${o};transform:skewX(-20deg);will-change:transform;`);
		e.insertBefore(m, e.firstChild);
		let S = [];
		Array.from(e.children).forEach((e) => {
			e !== m && getComputedStyle(e).position === "static" && (e.style.position = "relative", S.push(e));
		});
		let C = e.clientWidth / 2, w = e.clientHeight / 2, T = C, E = w, D = null, O = !0, k = !1, A = (e, n) => {
			if (!y) return;
			let r = Math.atan2(n - 50, e - 50) * 180 / Math.PI + 90, i = t.surfaceGradient;
			y.style.background = i || `linear-gradient(${r}deg,transparent 12%,${t.surfaceColor || "rgba(255,255,255,.48)"} 42%,${t.surfaceColor2 || "rgba(145,180,255,.16)"} 55%,transparent 78%)`, y.style.backgroundSize = `${Math.max(100, Number(t.surfaceSize ?? 170))}% ${Math.max(100, Number(t.surfaceSize ?? 170))}%`, y.style.backgroundPosition = `${e}% ${n}%`;
		}, j = () => {
			if (!O) return;
			T = g(T, C, d), E = g(E, w, d);
			let t = Math.max(1, e.clientWidth), r = Math.max(1, e.clientHeight), i = _(T / t * 100, 0, 100), a = _(E / r * 100, 0, 100);
			m.style.setProperty("--kt-x", `${i}%`), m.style.setProperty("--kt-y", `${a}%`), (n === "spotlight" || n === "pointer" || n === "border") && (h.style.transform = `translate3d(${T}px,${E}px,0)`), A(i, a);
			let o = Math.abs(T - C) > .08 || Math.abs(E - w) > .08;
			D = k && (l || o) ? requestAnimationFrame(j) : null;
		}, M = () => {
			O && D == null && n !== "aurora" && n !== "shine" && n !== "comet" && (D = requestAnimationFrame(j));
		}, N = (t) => {
			if (!l) return;
			let n = e.getBoundingClientRect();
			if (!n.width || !n.height) return;
			let r = _(((t.clientX - n.left) / n.width - .5) * u + .5, 0, 1), i = _(((t.clientY - n.top) / n.height - .5) * u + .5, 0, 1);
			C = r * n.width, w = i * n.height, M();
		}, P = (e) => {
			k = !0, m.style.opacity = "1", N(e), n === "shine" && h.animate([{ transform: "translateX(0) skewX(-20deg)" }, { transform: "translateX(390%) skewX(-20deg)" }], {
				duration: Math.max(100, Number(t.duration ?? 800)),
				easing: t.ease || "ease-in-out"
			}), M();
		}, F = () => {
			k = !1, C = e.clientWidth / 2, w = e.clientHeight / 2, m.style.opacity = Tt(t.alwaysOn, n === "aurora" || n === "comet") ? String(o) : "0", M();
		}, I = (e) => {
			k = !0, m.style.opacity = "1", N(e), m.animate([
				{ filter: "brightness(1)" },
				{
					filter: "brightness(1.5) saturate(1.15)",
					offset: .28
				},
				{ filter: "brightness(1)" }
			], {
				duration: 520,
				easing: "cubic-bezier(.2,.7,.2,1)"
			}), M();
		};
		return e.addEventListener("pointerenter", P), e.addEventListener("pointermove", N, { passive: !0 }), e.addEventListener("pointerleave", F), e.addEventListener("pointerdown", I), Tt(t.alwaysOn, n === "aurora" || n === "comet") && (m.style.opacity = String(o)), A(50, 50), {
			el: e,
			type: "cardGlow",
			pause() {
				O = !1, D != null && cancelAnimationFrame(D), h.style.animationPlayState = "paused";
			},
			resume() {
				O || (O = !0, h.style.animationPlayState = "running", M());
			},
			destroy() {
				O = !1, D != null && cancelAnimationFrame(D), e.removeEventListener("pointerenter", P), e.removeEventListener("pointermove", N), e.removeEventListener("pointerleave", F), e.removeEventListener("pointerdown", I), m.remove(), S.forEach((e) => {
					e.style.position = "";
				}), r == null ? e.removeAttribute("style") : e.setAttribute("style", r);
			}
		};
	},
	reduced() {}
}, Dt = /* @__PURE__ */ new Set(), Ot = null;
function kt(e, t = {}) {
	return t.src || e.dataset.src || e.getAttribute("data-src") || e.getAttribute("href") || (e.tagName === "IMG" ? e.currentSrc || e.src : "") || e.querySelector?.("img")?.currentSrc || e.querySelector?.("img")?.src || "";
}
function At(e, t, n) {
	let r = document.createElement("button");
	return r.type = "button", r.className = e, r.setAttribute("aria-label", t), r.textContent = n, r;
}
function jt() {
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
	let o = At("kt-lightbox-zoom-out", "Zoom out", "−"), s = At("kt-lightbox-zoom-reset", "Reset zoom", "100%"), c = At("kt-lightbox-zoom-in", "Zoom in", "+"), l = At("kt-lightbox-share", "Share", "↗"), u = At("kt-lightbox-download", "Download", ""), d = At("kt-lightbox-close", "Close viewer", "×");
	[
		o,
		s,
		c,
		l,
		u,
		d
	].forEach((e) => {
		e.style.cssText = "min-width:34px;height:34px;padding:0 8px;display:inline-flex;align-items:center;justify-content:center;border:0;border-radius:9px;background:var(--kt-lightbox-button-bg,transparent);color:var(--kt-lightbox-button-color,white);font:600 15px/1 sans-serif;cursor:pointer;transition:background-color .15s ease;";
	});
	let f = document.createElement("span");
	f.style.cssText = "width:1px;height:18px;margin:0 8px;background:rgba(255,255,255,.16);flex:0 0 auto;", s.style.minWidth = "54px", s.title = "Click to type an exact zoom %", l.hidden = !0, l.title = "Share", l.innerHTML = "<svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' aria-hidden='true'><circle cx='18' cy='5' r='3'/><circle cx='6' cy='12' r='3'/><circle cx='18' cy='19' r='3'/><path d='M8.6 13.5l6.8 4M15.4 6.5l-6.8 4'/></svg>", u.hidden = !0, u.title = "Download", u.innerHTML = "<svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' aria-hidden='true'><path d='M12 3v12'/><path d='M7 11l5 5 5-5'/><path d='M5 21h14'/></svg>", d.style.fontSize = "22px", a.append(o, s, c, f, l, u, d), a.style.marginLeft = "auto", r.append(i, a);
	let p = document.createElement("div");
	p.className = "kt-lightbox-stage", p.style.cssText = "position:relative;min-width:0;min-height:0;display:grid;place-items:center;overflow:hidden;pointer-events:auto;touch-action:none;";
	let m = document.createElement("div");
	m.className = "kt-lightbox-stage-content", m.style.cssText = "display:flex;flex-direction:column;align-items:center;gap:16px;max-width:100%;max-height:100%;min-height:0;";
	let h = document.createElement("div");
	h.className = "kt-lightbox-media-host", h.style.cssText = "position:relative;display:grid;place-items:center;max-width:100%;min-height:0;will-change:transform;transform-origin:center;";
	let g = document.createElement("img");
	g.className = "kt-lightbox-image", g.alt = "", g.style.cssText = "display:block;max-width:min(94vw,1800px);max-height:calc(100vh - 230px);width:auto;height:auto;object-fit:contain;border-radius:var(--kt-lightbox-radius,4px);user-select:none;-webkit-user-drag:none;", h.appendChild(g), m.appendChild(h), p.appendChild(m);
	let _ = At("kt-lightbox-prev", "Previous item", "‹"), v = At("kt-lightbox-next", "Next item", "›");
	[_, v].forEach((e) => {
		e.style.cssText = "position:absolute;top:50%;z-index:4;width:48px;height:48px;border:1px solid var(--kt-lightbox-button-border,rgba(255,255,255,.14));border-radius:999px;background:var(--kt-lightbox-button-bg,rgba(255,255,255,.08));backdrop-filter:blur(10px);color:var(--kt-lightbox-button-color,white);font:300 30px/1 sans-serif;transform:translateY(-50%);cursor:pointer;pointer-events:auto;display:grid;place-items:center;padding-bottom:4px;", p.appendChild(e);
	}), _.style.left = "14px", v.style.right = "14px";
	let y = document.createElement("div");
	y.className = "kt-lightbox-caption", y.style.cssText = "max-width:min(860px,92vw);text-align:center;flex:0 0 auto;transition:opacity .25s ease;";
	let b = document.createElement("strong");
	b.className = "kt-lightbox-title", b.style.cssText = "display:block;font:650 15px/1.4 sans-serif;";
	let x = document.createElement("span");
	x.className = "kt-lightbox-description", x.style.cssText = "display:block;margin-top:4px;opacity:.68;font:400 13px/1.45 sans-serif;", y.append(b, x), m.appendChild(y);
	let S = document.createElement("div");
	S.className = "kt-lightbox-info", S.style.cssText = "position:relative;z-index:5;display:flex;flex-direction:column;align-items:center;padding:16px 18px 26px;pointer-events:none;text-align:center;";
	let C = document.createElement("span");
	C.className = "kt-lightbox-meta", C.style.cssText = "font:500 11px/1.4 ui-monospace,monospace;opacity:.55;text-align:center;", S.append(C);
	let w = document.createElement("div");
	w.className = "kt-lightbox-minimap", w.hidden = !0, w.style.cssText = "position:absolute;right:18px;bottom:86px;z-index:6;width:140px;height:90px;border:1px solid rgba(255,255,255,.25);border-radius:8px;overflow:hidden;background:#111;pointer-events:none;box-shadow:0 8px 30px rgba(0,0,0,.35);";
	let T = document.createElement("img");
	T.alt = "", T.style.cssText = "width:100%;height:100%;object-fit:contain;opacity:.65;";
	let E = document.createElement("span");
	E.style.cssText = "position:absolute;border:1px solid white;background:rgba(255,255,255,.08);", w.append(T, E);
	let D = document.createElement("div");
	D.className = "kt-lightbox-custom-ui", D.style.pointerEvents = "auto", r.prepend(D);
	let O = document.createElement("div");
	O.className = "kt-lightbox-filmstrip", O.hidden = !0, O.style.cssText = "position:relative;z-index:5;display:flex;gap:8px;justify-content:center;flex-wrap:nowrap;overflow-x:auto;padding:6px 16px 16px;pointer-events:auto;scrollbar-width:none;", n.append(r, p, O, S), e.append(t, n, w), document.body.appendChild(e);
	let k = null, A = [], j = 0, M = "", N = null, P = 1, F = 0, I = 0, L = !1, R = null, z = 0, B = 0, V = 0, H = 0, U = null, W = !1, G = {
		root: e,
		backdrop: t,
		shell: n,
		toolbar: r,
		stage: p,
		image: g,
		closeButton: d,
		previous: _,
		next: v,
		zoomIn: c,
		zoomOut: o,
		zoomReset: s,
		shareButton: l,
		downloadButton: u,
		info: S,
		title: b,
		description: x,
		meta: C,
		minimap: w,
		custom: D,
		counter: i,
		filmstrip: O
	}, ee = () => {
		let e = k?.thumbnails === !0 && A.length > 1;
		if (O.hidden = !e, !e) {
			O.innerHTML = "";
			return;
		}
		O.innerHTML = "", A.forEach((e, t) => {
			let n = document.createElement("button");
			n.type = "button", n.className = "kt-lightbox-thumb" + (t === j ? " kt-active" : ""), n.setAttribute("aria-label", `${t + 1}`), n.style.cssText = `flex:0 0 auto;width:64px;height:44px;border-radius:6px;overflow:hidden;padding:0;cursor:pointer;background:#111;border:2px solid ${t === j ? "var(--kt-lightbox-accent,#ff5b1c)" : "transparent"};opacity:${t === j ? "1" : ".55"};transition:opacity .16s ease,border-color .16s ease;`;
			let r = document.createElement("img");
			r.src = e.thumb, r.alt = e.alt || "", r.loading = "lazy", r.style.cssText = "width:100%;height:100%;object-fit:cover;", n.appendChild(r), n.addEventListener("click", (e) => {
				e.stopPropagation(), Y(t);
			}), O.appendChild(n);
		});
	}, te = () => {
		O.hidden || Array.from(O.children).forEach((e, t) => {
			let n = t === j;
			e.classList.toggle("kt-active", n), e.style.borderColor = n ? "var(--kt-lightbox-accent,#ff5b1c)" : "transparent", e.style.opacity = n ? "1" : ".55";
		});
	}, K = () => {
		let e = k?.minimap !== !1 && P > 1.02;
		if (w.hidden = !e, !e) return;
		let t = Mt(100 / P, 12, 100), n = Mt(100 / P, 12, 100), r = Math.max(1, p.clientWidth * (P - 1) / 2), i = Math.max(1, p.clientHeight * (P - 1) / 2), a = Mt(50 - t / 2 - F / (r * 2) * (100 - t), 0, 100 - t), o = Mt(50 - n / 2 - I / (i * 2) * (100 - n), 0, 100 - n);
		E.style.width = `${t}%`, E.style.height = `${n}%`, E.style.left = `${a}%`, E.style.top = `${o}%`;
	}, q = () => {
		let e = Math.max(0, p.clientWidth * (P - 1) / 2), t = Math.max(0, p.clientHeight * (P - 1) / 2);
		F = Mt(F, -e, e), I = Mt(I, -t, t), h.style.transform = `translate3d(${F}px,${I}px,0) scale(${P})`, s.querySelector("input") || (s.textContent = `${Math.round(P * 100)}%`);
		let n = Number(k?.minZoom ?? 1), r = Math.max(n, Number(k?.maxZoom ?? 5));
		o.disabled = P <= n + .001, c.disabled = P >= r - .001, p.classList.toggle("is-zoomed", P > 1.001), y.style.opacity = P > 1.02 ? "0" : "1", K();
	}, J = (e, t, n) => {
		let r = Number(k?.minZoom ?? 1), i = Mt(e, r, Math.max(r, Number(k?.maxZoom ?? 5)));
		if (t != null && n != null && i !== P) {
			let e = p.getBoundingClientRect(), r = t - e.left - e.width / 2, a = n - e.top - e.height / 2, o = i / P;
			F = r - (r - F) * o, I = a - (a - I) * o;
		}
		P = i, P <= 1.001 && (F = 0, I = 0), q();
	}, ne = () => {
		P = 1, F = 0, I = 0, q();
	}, re = () => {
		if (k?.backdropColor != null || k?.backdropOpacity != null) {
			let e = Mt(Number(k?.backdropOpacity ?? .9), 0, 1);
			t.style.background = k?.backdropColor || `rgba(0,0,0,${e})`;
		} else t.style.background = "var(--kt-lightbox-backdrop,rgba(10,10,14,.88))";
		let n = `blur(${k?.backdropBlur == null ? "var(--kt-lightbox-backdrop-blur,20px)" : `${Math.max(0, Number(k.backdropBlur))}px`}) saturate(1.15)`;
		t.style.backdropFilter = n, t.style.webkitBackdropFilter = n, e.style.setProperty("--kt-lightbox-radius", `${Number(k?.radius ?? 4)}px`), e.className = `kt-lightbox ${k?.className || ""}`.trim(), r.hidden = k?.toolbar === !1;
		let i = typeof location < "u" && /^https?:$/i.test(location.protocol), a = typeof navigator < "u" && typeof navigator.share == "function" && i;
		l.hidden = !(k?.share === !0 && a), u.hidden = k?.download !== !0, f.hidden = l.hidden && u.hidden, S.hidden = k?.info === !1, D.innerHTML = k?.uiTemplate || "", k?.renderUI?.(D, G, k);
	}, Y = (e) => {
		if (!A.length) return;
		U?.destroy?.(), U = null;
		let t = j;
		j = (e + A.length) % A.length, k = A[j], ne();
		let n = k.transition || "rise";
		if (n === "crossfade" && t !== j && g.getAttribute("src") && h.animate) {
			let e = g.cloneNode(!1);
			e.removeAttribute("data-src"), e.style.cssText = "position:absolute;inset:0;margin:auto;max-width:100%;max-height:100%;object-fit:contain;z-index:3;pointer-events:none;", h.appendChild(e);
			let t = e.animate([{ opacity: 1 }, { opacity: 0 }], {
				duration: 320,
				easing: "ease"
			}), n = () => e.remove();
			t.onfinish = n, t.oncancel = n;
		}
		let r = k.src;
		g.removeAttribute("srcset"), g.removeAttribute("sizes"), g.alt = k.alt || "", g.style.opacity = "1", g.style.filter = "none", g.style.transform = "none", k.lazyEffect ? (g.removeAttribute("src"), g.dataset.src = r, U = k.Kineto?.create("lazy", g, {
			effect: k.lazyEffect,
			...k.lazyOptions || {},
			rootMargin: "0px",
			nativeLazy: !1
		})) : (g.removeAttribute("data-src"), g.src = r), T.src = r, b.textContent = k.title || "", x.textContent = k.description || "";
		let a = A.length > 1;
		if (_.hidden = !a, v.hidden = !a, i.textContent = a ? `${j + 1} / ${A.length}` : "", n !== "none" && n !== "crossfade" && h.animate) {
			let r = {
				fade: [{ opacity: 0 }, { opacity: 1 }],
				dissolve: [{
					opacity: 0,
					filter: "blur(7px)"
				}, {
					opacity: 1,
					filter: "blur(0)"
				}],
				slide: [{
					opacity: 0,
					transform: `translate3d(${(e < t ? -1 : 1) * 42}px,0,0)`
				}, {
					opacity: 1,
					transform: "translate3d(0,0,0)"
				}],
				zoom: [{
					opacity: 0,
					transform: "scale(.9)"
				}, {
					opacity: 1,
					transform: "scale(1)"
				}],
				rise: [{
					opacity: 0,
					transform: "translate3d(0,10px,0) scale(.985)"
				}, {
					opacity: 1,
					transform: "translate3d(0,0,0) scale(1)"
				}]
			}[n];
			r && h.animate(r, {
				duration: n === "slide" ? 260 : 200,
				easing: "cubic-bezier(.22,.8,.3,1)"
			});
		}
		re(), te(), g.onload = () => {
			let e = `${g.naturalWidth || "?"}×${g.naturalHeight || "?"} · ${j + 1}/${A.length}`, t = k.metadata && typeof k.metadata == "object" ? Object.entries(k.metadata).map(([e, t]) => `${e}: ${t}`).join(" · ") : String(k.metadata || "");
			if (C.textContent = t ? `${e} · ${t}` : e, k.onLoad?.(g, k), k.exif && k.src) {
				let e = k.src;
				fetch(e).then((e) => e.arrayBuffer()).then((t) => {
					if (k?.src !== e) return;
					let n = Nt(t);
					n && (C.textContent += ` · ${n}`);
				}).catch(() => {});
			}
		}, k.onChange?.(j, k, G);
	}, X = () => {
		if (e.hidden) return;
		let t = Math.max(0, Number(k?.duration ?? .12));
		e.style.transition = `opacity ${t}s ease`, e.style.opacity = "0", setTimeout(() => {
			e.hidden = !0, e.style.display = "none", e.style.opacity = "1", document.body.style.overflow = M, U?.destroy?.(), U = null, N?.focus?.(), k?.onClose?.();
		}, t * 1e3);
	}, ie = (t) => {
		N = document.activeElement, M = document.body.style.overflow, A = t.group ? Array.from(Dt).filter((e) => e.group === t.group) : [t], Y(Math.max(0, A.indexOf(t))), ee(), e.hidden = !1, e.style.display = "block", e.style.opacity = "0", document.body.style.overflow = "hidden";
		let n = Math.max(0, Number(t.duration ?? .12));
		e.style.transition = `opacity ${n}s ease`, requestAnimationFrame(() => {
			e.style.opacity = "1";
		}), d.focus(), t.onOpen?.(G);
	}, ae = (t) => {
		e.hidden || (t.key === "Escape" ? X() : t.key === "ArrowLeft" && A.length > 1 ? Y(j - 1) : t.key === "ArrowRight" && A.length > 1 ? Y(j + 1) : t.key === "+" || t.key === "=" ? J(P + Number(k?.zoomStep ?? .5)) : t.key === "-" ? J(P - Number(k?.zoomStep ?? .5)) : t.key === "0" && ne());
	}, oe = (e) => {
		if (k?.zoom === !1) return;
		e.preventDefault();
		let t = Number(k?.wheelStep ?? .18);
		J(P * (e.deltaY < 0 ? 1 + t : 1 / (1 + t)), e.clientX, e.clientY);
	}, se = /* @__PURE__ */ new Map(), ce = 0, Z = 1, le = () => {
		let e = [...se.values()];
		return Math.hypot(e[0].x - e[1].x, e[0].y - e[1].y);
	}, ue = () => {
		let e = [...se.values()];
		return {
			x: (e[0].x + e[1].x) / 2,
			y: (e[0].y + e[1].y) / 2
		};
	}, de = (e) => {
		if (!e.target.closest("button,.kt-lightbox-toolbar,.kt-lightbox-info")) {
			se.set(e.pointerId, {
				x: e.clientX,
				y: e.clientY
			});
			try {
				p.setPointerCapture?.(e.pointerId);
			} catch {}
			if (se.size === 2) {
				ce = le(), Z = P, L = !1;
				return;
			}
			P <= 1 || (L = !0, R = e.pointerId, z = e.clientX, B = e.clientY, V = F, H = I, p.classList.add("is-panning"));
		}
	}, fe = (e) => {
		if (se.has(e.pointerId) && se.set(e.pointerId, {
			x: e.clientX,
			y: e.clientY
		}), se.size === 2 && ce > 0) {
			let e = ue();
			J(Z * (le() / ce), e.x, e.y);
			return;
		}
		!L || e.pointerId !== R || (F = V + e.clientX - z, I = H + e.clientY - B, q());
	}, pe = (e) => {
		se.delete(e.pointerId), p.releasePointerCapture?.(e.pointerId), se.size < 2 && (ce = 0), !(!L || e.pointerId !== R) && (L = !1, p.classList.remove("is-panning"));
	};
	t.addEventListener("click", () => {
		W || k?.closeOnBackdrop !== !1 && X();
	});
	let me = null;
	p.addEventListener("pointerdown", (e) => {
		me = {
			x: e.clientX,
			y: e.clientY
		};
	}), p.addEventListener("click", (e) => {
		W || k?.closeOnBackdrop === !1 || P > 1.001 || e.target !== p && e.target !== m || me && Math.hypot(e.clientX - me.x, e.clientY - me.y) > 8 || X();
	}), d.addEventListener("click", X), _.addEventListener("click", () => Y(j - 1)), v.addEventListener("click", () => Y(j + 1)), c.addEventListener("click", () => J(P + Number(k?.zoomStep ?? .5))), o.addEventListener("click", () => J(P - Number(k?.zoomStep ?? .5))), s.addEventListener("dblclick", ne), s.addEventListener("click", () => {
		if (k?.zoom === !1 || s.querySelector("input")) return;
		let e = document.createElement("input");
		e.type = "text", e.inputMode = "numeric", e.value = String(Math.round(P * 100)), e.setAttribute("aria-label", "Zoom percent"), e.style.cssText = "width:46px;background:transparent;border:0;color:inherit;font:inherit;text-align:center;outline:none;", s.textContent = "", s.appendChild(e), e.focus(), e.select();
		let t = (t) => {
			if (t) {
				let t = parseFloat(e.value);
				!isNaN(t) && t > 0 && J(t / 100);
			}
			e.isConnected && e.remove(), q();
		};
		e.addEventListener("keydown", (e) => {
			e.stopPropagation(), e.key === "Enter" ? (e.preventDefault(), t(!0)) : e.key === "Escape" && (e.preventDefault(), t(!1));
		}), e.addEventListener("click", (e) => e.stopPropagation()), e.addEventListener("blur", () => t(!0));
	}), l.addEventListener("click", async () => {
		let e = k?.src || "";
		try {
			e = new URL(e, location.href).href;
		} catch {}
		let t = {
			title: k?.title || document.title,
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
				W = !0;
				try {
					await navigator.share(t);
				} finally {
					setTimeout(() => {
						W = !1;
					}, 400);
				}
			} else await r();
		} catch {
			setTimeout(() => {
				W = !1;
			}, 400);
		}
	}), u.addEventListener("click", async () => {
		let e = k?.src;
		if (!e) return;
		let t = String(k?.title || e.split("/").pop() || "image").replace(/[^\w.-]+/g, "_");
		try {
			let n = await (await fetch(e, { mode: "cors" })).blob(), r = URL.createObjectURL(n), i = document.createElement("a");
			i.href = r, i.download = t, document.body.appendChild(i), i.click(), i.remove(), setTimeout(() => URL.revokeObjectURL(r), 4e3);
		} catch {
			let n = document.createElement("a");
			n.href = e, n.download = t, n.target = "_blank", n.rel = "noopener", document.body.appendChild(n), n.click(), n.remove();
		}
	}), p.addEventListener("wheel", oe, { passive: !1 }), p.addEventListener("pointerdown", de), p.addEventListener("pointermove", fe), p.addEventListener("pointerup", pe), p.addEventListener("pointercancel", pe);
	let he = null, ge = null, _e = null;
	return p.addEventListener("pointerdown", (e) => {
		if (!e.isPrimary || e.pointerType === "mouse" || P > 1.001 || A.length <= 1 || e.target.closest("button,.kt-lightbox-toolbar,.kt-lightbox-info")) {
			he = null;
			return;
		}
		_e = e.pointerId, he = e.clientX, ge = e.clientY;
	}), p.addEventListener("pointerup", (e) => {
		if (he == null || e.pointerId !== _e) return;
		let t = e.clientX - he, n = e.clientY - ge;
		he = ge = null, _e = null, P <= 1.001 && Math.abs(t) > 50 && Math.abs(t) > Math.abs(n) * 1.4 && Y(j + (t < 0 ? 1 : -1));
	}), g.addEventListener("dblclick", (e) => J(P > 1 ? 1 : Number(k?.doubleClickZoom ?? 2), e.clientX, e.clientY)), document.addEventListener("keydown", ae), {
		root: e,
		controls: G,
		open: ie,
		close: X,
		next() {
			Y(j + 1);
		},
		prev() {
			Y(j - 1);
		},
		zoom(e) {
			J(Number(e));
		},
		destroy() {
			U?.destroy?.(), document.removeEventListener("keydown", ae), document.body.style.overflow = M, e.remove();
		}
	};
}
function Mt(e, t, n) {
	return Math.min(n, Math.max(t, e));
}
function Nt(e) {
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
var Pt = {
	create(e, t = {}, n) {
		let r = kt(e, t);
		if (!r) return null;
		Ot ||= jt();
		let i = e.style.cursor, a = e.tagName === "IMG" ? e : e.querySelector?.("img"), o = {
			el: e,
			src: r,
			thumb: a?.currentSrc || a?.src || e.getAttribute("href") || r,
			thumbnails: t.thumbnails === !0,
			alt: t.alt || a?.alt || e.getAttribute("aria-label") || "",
			title: t.title || e.dataset.title || a?.dataset?.title || a?.alt || "",
			description: t.description || t.caption || e.dataset.description || e.dataset.caption || "",
			metadata: t.metadata,
			group: t.group || e.dataset.ktLightboxGroup || e.getAttribute("data-kt-lightbox-group") || null,
			backdropColor: t.backdropColor,
			backdropOpacity: t.backdropOpacity,
			backdropBlur: t.backdropBlur,
			duration: t.lightboxDuration ?? t.duration,
			transition: t.transition,
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
			download: t.download === !0,
			exif: t.exif === !0,
			Kineto: n
		};
		Dt.add(o), e.style.cursor = t.cursor || "zoom-in";
		let s = (e) => {
			e?.preventDefault?.(), Ot.open(o);
		};
		return e.addEventListener("click", s), {
			el: e,
			type: "lightbox",
			open: s,
			close() {
				Ot?.close();
			},
			next() {
				Ot?.next();
			},
			prev() {
				Ot?.prev();
			},
			zoom(e) {
				Ot?.zoom(e);
			},
			pause() {},
			resume() {},
			destroy() {
				e.removeEventListener("click", s), e.style.cursor = i, Dt.delete(o), Dt.size || (Ot?.destroy(), Ot = null);
			}
		};
	},
	reduced() {}
}, Ft = null;
function It(e) {
	let t = getComputedStyle(e), n = t.transitionDuration.split(",").map((e) => Number.parseFloat(e) * (e.includes("ms") ? 1 : 1e3)), r = t.transitionDelay.split(",").map((e) => Number.parseFloat(e) * (e.includes("ms") ? 1 : 1e3));
	return Math.max(0, ...n.map((e, t) => e + (r[t] ?? r[0] ?? 0)));
}
var Lt = {
	create(e, t) {
		if (Ft) return Ft;
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
			let e = Array.from(document.querySelectorAll(i)), t = Math.max(a, ...e.map(It));
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
		}, document.title, window.location.href), document.addEventListener("click", g), window.addEventListener("popstate", _), Ft = {
			el: document.documentElement,
			type: "pageTransition",
			navigate: h,
			pause() {},
			resume() {},
			destroy() {
				c = !0, s?.abort(), document.removeEventListener("click", g), window.removeEventListener("popstate", _), document.documentElement.classList.remove("kt-is-animating", "kt-is-leaving", "kt-is-entering"), Ft === this && (Ft = null);
			}
		}, Ft;
	},
	reduced() {}
}, Rt = {
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
}, zt = {
	create(e, t) {
		if (typeof navigator > "u" || typeof navigator.vibrate != "function") return null;
		let n = Rt[t.preset || t.haptic] || (Array.isArray(t.pattern) ? t.pattern.map(Number) : Number(t.pattern ?? 50)), r = t.trigger || "hover", i = !0, a = null, o = () => {
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
}, Bt = {
	create(e, t) {
		let n = E(e, [
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
}, Vt = { create(e, t) {
	let n = t.property || "--scroll-progress", r = typeof CSS < "u" && CSS.supports?.("animation-timeline", "scroll()"), i = {
		animationName: e.style.animationName,
		animationTimeline: e.style.animationTimeline,
		animationRangeStart: e.style.animationRangeStart,
		animationRangeEnd: e.style.animationRangeEnd,
		animationFillMode: e.style.animationFillMode,
		animationPlayState: e.style.animationPlayState,
		property: e.style.getPropertyValue(n)
	};
	if (r && t.cssAnimation) {
		let r = (t.axis || "").trim(), a = t.timeline === "scroll";
		return e.style.animationName = t.cssAnimation, e.style.animationTimeline = a ? `scroll(nearest${r ? ` ${r}` : ""})` : `view(${r})`, e.style.animationRangeStart = t.rangeStart || (a ? "0%" : "entry 0%"), e.style.animationRangeEnd = t.rangeEnd || (a ? "100%" : "exit 100%"), e.style.animationFillMode = "both", e.style.animationPlayState = "running", {
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
	}
	let a = C();
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
} }, Ht = {
	create(e, t) {
		let n = S(), r = C();
		if (!n || !r) return null;
		let i = Array.isArray(t.urls) ? t.urls : null, a = Math.max(1, Number(t.frames ?? i?.length ?? 100)), o = t.urlPrefix || "https://example.com/seq/frame_", s = t.extension || ".jpg", c = Number(t.padding ?? 3), l = {
			parent: e.parentNode,
			next: e.nextSibling,
			style: e.getAttribute("style")
		}, u = document.createElement("div");
		u.className = "kt-scroll-sequence-wrap", u.style.height = t.scrollLength || `${Math.max(2, a * Number(t.vhPerFrame ?? 3))}vh`, l.parent.insertBefore(u, e), u.appendChild(e), e.style.position = "sticky", e.style.top = t.top == null ? "0" : typeof t.top == "number" ? `${t.top}px` : String(t.top), e.style.height = t.height || "100vh", e.style.overflow = "hidden";
		let d = document.createElement("canvas");
		d.setAttribute("aria-hidden", "true"), d.style.cssText = "display:block;width:100%;height:100%;", e.appendChild(d);
		let f = d.getContext("2d"), p = Array(a), m = Array(a).fill("idle"), h = { frame: 0 }, g = 1, _ = 1, v = 1, y = (e) => i?.[e] || `${o}${String(e + 1).padStart(c, "0")}${s}`, b = (e) => {
			if (e < 0 || e >= a || m[e] !== "idle") return;
			m[e] = "loading";
			let n = new Image();
			t.crossOrigin && (n.crossOrigin = t.crossOrigin), n.decoding = "async", n.onload = () => {
				m[e] = "loaded", p[e] = n, (Math.round(h.frame) === e || e === 0) && w(e);
			}, n.onerror = () => {
				m[e] = "error", t.onError?.(e, n.src);
			}, n.src = y(e), p[e] = n;
		}, x = (e) => {
			let n = Number(t.preloadRadius ?? 8);
			for (let t = -n; t <= n; t += 1) b(e + t);
		}, w = (e) => {
			let n = p[e];
			if (!n || m[e] !== "loaded" || !n.naturalWidth) {
				x(e);
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
		E?.observe(e), window.addEventListener("resize", T), T(), b(0), x(0);
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
				x(e), w(e);
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
function Ut(e, t, n, r) {
	let i = Math.max(n / e, r / t), a = Math.min(e, n / i), o = Math.min(t, r / i);
	return {
		sx: (e - a) / 2,
		sy: (t - o) / 2,
		sw: a,
		sh: o
	};
}
var Wt = {
	create(e, t = {}) {
		let n = t.src || t.revealSrc || e.getAttribute("data-reveal-src") || "";
		if (!n) return null;
		let r = Math.max(8, Number(t.radius ?? 80)), i = _(Number(t.softness ?? .55), 0, 1), a = Math.max(0, Number(t.blur ?? 0)), o = t.persist === !0, s = _(Number(t.fade ?? .045), .002, .5), c = _(Number(t.maxDpr ?? 2), 1, 3), l = t.hold === !0, u = _(Number(t.threshold ?? .5), 0, 1), d = document.createElement("canvas");
		d.width = d.height = 48;
		let f = d.getContext("2d", { willReadFrequently: !0 }), p = 0, m = 0, h = !1, g = () => {
			try {
				f.clearRect(0, 0, 48, 48), f.drawImage(S, 0, 0, 48, 48);
				let e = f.getImageData(0, 0, 48, 48).data, t = 0;
				for (let n = 3; n < e.length; n += 4) e[n] > 50 && (t += 1);
				return t / 2304;
			} catch {
				return null;
			}
		}, v = (n) => {
			if (n - p < 120) return;
			p = n;
			let r = g();
			if (r != null) {
				if (Math.abs(r - m) > .004) {
					m = r, t.onProgress?.(r, e);
					try {
						e.dispatchEvent(new CustomEvent("kt-brush-progress", {
							bubbles: !0,
							detail: { progress: r }
						}));
					} catch {}
				}
				if (!h && r >= u) {
					h = !0, t.onReveal?.(r, e);
					try {
						e.dispatchEvent(new CustomEvent("kt-brush-reveal", {
							bubbles: !0,
							detail: { progress: r }
						}));
					} catch {}
				}
			}
		}, y = e.getAttribute("style");
		getComputedStyle(e).position === "static" && (e.style.position = "relative"), e.style.touchAction = "none";
		let b = document.createElement("canvas");
		b.className = "kt-brush-reveal-canvas", b.setAttribute("aria-hidden", "true"), b.style.cssText = "position:absolute;inset:0;width:100%;height:100%;pointer-events:none;border-radius:inherit;z-index:2;", e.appendChild(b);
		let x = b.getContext("2d", { alpha: !0 }), S = document.createElement("canvas"), C = S.getContext("2d", { alpha: !0 }), w = new Image();
		w.decoding = "async", t.crossOrigin && (w.crossOrigin = t.crossOrigin);
		let T = !1;
		w.onload = () => {
			T = !0;
		}, w.onerror = () => t.onError?.(/* @__PURE__ */ Error(`Kineto brushReveal image failed to load: ${n}`), e), w.src = n;
		let E = 0, D = 0, O = 1, k = null, A = !0, j = !1, M = !1, N = 0, P = null, F = null, I = () => {
			let t = e.getBoundingClientRect();
			E = Math.max(1, t.width), D = Math.max(1, t.height), O = _(window.devicePixelRatio || 1, 1, c);
			let n = Math.max(1, Math.round(E * O)), r = Math.max(1, Math.round(D * O));
			(b.width !== n || b.height !== r) && (b.width = n, b.height = r, S.width = n, S.height = r);
		};
		I();
		let L = (e, n) => {
			let o = e * O, s = n * O, c = r * O, l = c * (1 - i), u = _(Number(t.opacity ?? 1), .05, 1), d = C.createRadialGradient(o, s, Math.max(.5, l), o, s, c);
			d.addColorStop(0, `rgba(255,255,255,${u})`), d.addColorStop(1, "rgba(255,255,255,0)"), C.save(), C.globalCompositeOperation = "source-over", a > 0 && "filter" in C && (C.filter = `blur(${a * O}px)`), C.fillStyle = d, C.beginPath(), C.arc(o, s, c, 0, Math.PI * 2), C.fill(), C.restore(), a > 0 && (C.save(), C.globalCompositeOperation = "source-over", C.fillStyle = `rgba(255,255,255,${u})`, C.beginPath(), C.arc(o, s, Math.max(.5, l), 0, Math.PI * 2), C.fill(), C.restore()), M = !0, N = Math.min(1.5, N + .06);
		}, R = (e, t) => {
			if (P == null) L(e, t);
			else {
				let n = Math.hypot(e - P, t - F), i = Math.max(1, Math.ceil(n / (r * .35)));
				for (let n = 1; n <= i; n += 1) L(P + (e - P) * n / i, F + (t - F) * n / i);
			}
			P = e, F = t;
		}, z = () => {
			if (A) {
				if (!o && M) {
					let e = Math.min(.5, s * (N < .22 ? 4 : 1));
					C.globalCompositeOperation = "destination-out", C.fillStyle = `rgba(0,0,0,${e})`, C.fillRect(0, 0, S.width, S.height), N *= 1 - e;
				}
				if (j && P != null && L(P, F), x.clearRect(0, 0, b.width, b.height), T && M) {
					let e = Ut(w.naturalWidth, w.naturalHeight, b.width, b.height);
					x.globalCompositeOperation = "source-over", x.drawImage(w, e.sx, e.sy, e.sw, e.sh, 0, 0, b.width, b.height), x.globalCompositeOperation = "destination-in", x.drawImage(S, 0, 0), x.globalCompositeOperation = "source-over";
				}
				if (M && v(performance.now()), !o && !j && N < .008) {
					M = !1, N = 0, C.clearRect(0, 0, S.width, S.height), x.clearRect(0, 0, b.width, b.height), k = null;
					return;
				}
				k = j || !o && M || o && j ? requestAnimationFrame(z) : null;
			}
		}, B = () => {
			A && k == null && (k = requestAnimationFrame(z));
		}, V = () => {
			l || (j = !0, P = null, F = null, I(), B());
		}, H = (t) => {
			if (!j) return;
			let n = e.getBoundingClientRect();
			R(t.clientX - n.left, t.clientY - n.top), B();
		}, U = () => {
			j = !1, P = null, F = null, B();
		}, W = (t) => {
			j = !0, I(), e.setPointerCapture?.(t.pointerId);
			let n = e.getBoundingClientRect();
			P = t.clientX - n.left, F = t.clientY - n.top, L(P, F), B();
		}, G = (e) => {
			(l || e.pointerType !== "mouse") && (j = !1, P = null, F = null), B();
		};
		e.addEventListener("pointerenter", V), e.addEventListener("pointerdown", W), e.addEventListener("pointermove", H, { passive: !0 }), e.addEventListener("pointerup", G), e.addEventListener("pointercancel", G), e.addEventListener("pointerleave", U);
		let ee = typeof ResizeObserver < "u" ? new ResizeObserver(I) : null;
		return ee?.observe(e), {
			el: e,
			type: "brushReveal",
			clear() {
				C.clearRect(0, 0, S.width, S.height), x.clearRect(0, 0, b.width, b.height), M = !1, N = 0, h = !1, m = 0, p = 0;
			},
			progress() {
				return m;
			},
			replay() {
				this.clear();
			},
			pause() {
				A = !1, k != null && cancelAnimationFrame(k), k = null;
			},
			resume() {
				A || (A = !0, B());
			},
			destroy() {
				A = !1, k != null && cancelAnimationFrame(k), e.removeEventListener("pointerenter", V), e.removeEventListener("pointerdown", W), e.removeEventListener("pointermove", H), e.removeEventListener("pointerup", G), e.removeEventListener("pointercancel", G), e.removeEventListener("pointerleave", U), ee?.disconnect(), b.remove(), y == null ? e.removeAttribute("style") : e.setAttribute("style", y);
			}
		};
	},
	reduced() {}
}, Gt = {
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
		}, G = null, ee = !1, te = (t) => {
			u || t.pointerType !== "mouse" || t.button !== 0 || t.target.closest(".kt-fullpage-dot") || (G = d ? t.clientX : t.clientY, ee = !1, e.style.cursor = "grabbing");
		}, K = (e) => {
			if (G == null || ee || v || e.pointerType !== "mouse") return;
			let t = G - (d ? e.clientX : e.clientY);
			if (Math.abs(t) >= m) {
				ee = !0;
				let e = t > 0 ? 1 : -1;
				O(e) && D(_ + e);
			}
		}, q = () => {
			G = null, e.style.cursor = t.drag === !1 ? "" : "grab";
		};
		t.drag !== !1 && !u && (e.style.cursor = "grab", e.style.userSelect = "none", e.addEventListener("pointerdown", te), window.addEventListener("pointermove", K), window.addEventListener("pointerup", q)), t.wheel !== !1 && e.addEventListener("wheel", I, { passive: !1 }), t.touch !== !1 && (e.addEventListener("touchstart", V, { passive: !0 }), e.addEventListener("touchmove", H, { passive: !1 }), e.addEventListener("touchend", U, { passive: !0 })), t.keyboard !== !1 && (e.hasAttribute("tabindex") || e.setAttribute("tabindex", "0"), e.addEventListener("keydown", W)), D(_, !0), requestAnimationFrame(k);
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
				y = !1, j(), J?.disconnect(), e.removeEventListener("wheel", I), e.removeEventListener("touchstart", V), e.removeEventListener("touchmove", H), e.removeEventListener("touchend", U), e.removeEventListener("keydown", W), e.removeEventListener("pointerdown", te), window.removeEventListener("pointermove", K), window.removeEventListener("pointerup", q), S && e.removeEventListener("scroll", S), x.removeEventListener("transitionend", E), e.classList.remove("kt-fullpage"), e.innerHTML = n, r == null ? e.removeAttribute("style") : e.setAttribute("style", r);
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
}, Kt = {
	create(e, t = {}) {
		let n = p(), r = t.trigger || "click", i = _(Math.round(Number(t.count ?? 90)), 4, 400), a = _(Number(t.spread ?? 62), 5, 180), o = Math.max(.4, Number(t.duration ?? 1.8)), s = Number(t.gravity ?? .9), c = _(Number(t.scalar ?? 1), .3, 4), l = Number(t.zIndex ?? 11e3), u = Array.isArray(t.colors) && t.colors.length ? t.colors : typeof t.colors == "string" && t.colors.trim() ? t.colors.split(",").map((e) => e.trim()) : [
			"#ff5b1c",
			"#ffd166",
			"#2ec16b",
			"#4aa8ff",
			"#c86bff"
		], d = null, f = null, m = [], h = null, g = 0, v = () => {
			if (d) return;
			d = document.createElement("canvas"), d.setAttribute("aria-hidden", "true"), d.style.cssText = `position:fixed;inset:0;width:100vw;height:100vh;pointer-events:none;z-index:${l};`;
			let e = _(window.devicePixelRatio || 1, 1, 2);
			d.width = Math.round(window.innerWidth * e), d.height = Math.round(window.innerHeight * e), f = d.getContext("2d", {
				alpha: !0,
				desynchronized: !0
			}), f.setTransform(e, 0, 0, e, 0, 0), document.body.appendChild(d);
		}, y = (e) => {
			let t = g ? Math.min(48, e - g) / 16.67 : 1;
			g = e, f.clearRect(0, 0, window.innerWidth, window.innerHeight);
			let n = 0;
			for (let e of m) e.life <= 0 || (n += 1, e.life -= t / (o * 60), e.vy += s * .28 * t, e.vx *= .99, e.x += e.vx * t, e.y += e.vy * t, e.rotation += e.spin * t, f.globalAlpha = _(e.life, 0, 1), f.fillStyle = e.color, f.save(), f.translate(e.x, e.y), f.rotate(e.rotation), f.fillRect(-e.size / 2, -e.size / 2, e.size, e.size * .6), f.restore());
			f.globalAlpha = 1, n > 0 ? h = requestAnimationFrame(y) : (h = null, d?.remove(), d = null, f = null, m = []);
		}, b = (t, r) => {
			if (n.reducedMotion) return;
			v();
			let o = e.getBoundingClientRect(), s = t ?? o.left + o.width / 2, l = r ?? o.top + o.height / 2, d = -Math.PI / 2;
			for (let e = 0; e < i; e += 1) {
				let e = d + (Math.random() - .5) * (a * Math.PI / 180) * 2, t = (5 + Math.random() * 6) * c;
				m.push({
					x: s,
					y: l,
					vx: Math.cos(e) * t,
					vy: Math.sin(e) * t,
					size: (6 + Math.random() * 6) * c,
					color: u[Math.random() * u.length | 0],
					rotation: Math.random() * Math.PI,
					spin: (Math.random() - .5) * .4,
					life: 1
				});
			}
			h ??= (g = 0, requestAnimationFrame(y));
		}, x = null, S = t.once === !0, C = (t) => {
			b(t.clientX, t.clientY), S && e.removeEventListener("click", C);
		};
		return r === "click" ? e.addEventListener("click", C) : r === "auto" ? b() : r === "view" && typeof IntersectionObserver < "u" && (x = new IntersectionObserver((e) => {
			for (let t of e) if (t.isIntersecting) {
				b(), x.disconnect(), x = null;
				break;
			}
		}, { threshold: .35 }), x.observe(e)), {
			el: e,
			type: "confetti",
			fire: (e, t) => b(e, t),
			replay: () => b(),
			pause() {},
			resume() {},
			destroy() {
				r === "click" && e.removeEventListener("click", C), x &&= (x.disconnect(), null), h != null && cancelAnimationFrame(h), h = null, d?.remove(), d = null, m = [];
			}
		};
	},
	reduced(e) {
		return {
			el: e,
			type: "confetti",
			fire() {},
			replay() {},
			pause() {},
			resume() {},
			destroy() {}
		};
	}
}, qt = {
	create(e, t = {}) {
		let n = e.matches("details") ? [e] : Array.from(e.querySelectorAll("details"));
		if (!n.length) return null;
		let r = Math.max(.05, Number(t.duration ?? .4)), i = t.ease || "cubic-bezier(.22,.8,.3,1)", a = t.single === !0, o = Math.max(0, Number(t.blur ?? 6)), s = [
			"blur",
			"fade",
			"none"
		].includes(t.effect) ? t.effect : "blur", c = +(s === "none"), l = s === "blur" ? o : 0, u = t.arrowPosition === "left" ? "left" : "right";
		e.classList.add("kt-accordion"), e.classList.toggle("kt-accordion--arrow-left", u === "left");
		let d = [], f = (e) => {
			let t = e.querySelector("summary");
			if (!t) return null;
			let n = document.createElement("div");
			n.className = "kt-accordion-panel", n.style.overflow = "hidden", Array.from(e.childNodes).forEach((e) => {
				e !== t && n.appendChild(e);
			}), e.appendChild(n), t.classList.add("kt-accordion-summary"), e.open && e.classList.add("kt-open");
			let o = null, s = () => {
				o &&= (o.cancel(), null);
			}, u = () => {
				s(), e.open = !0, e.classList.add("kt-open");
				let t = n.scrollHeight;
				o = n.animate([{
					height: "0px",
					opacity: c,
					filter: `blur(${l}px)`
				}, {
					height: `${t}px`,
					opacity: 1,
					filter: "blur(0px)"
				}], {
					duration: r * 1e3,
					easing: i
				}), o.onfinish = () => {
					n.style.height = "", o = null;
				};
			}, f = () => {
				s(), e.classList.remove("kt-open");
				let t = n.scrollHeight;
				o = n.animate([{
					height: `${t}px`,
					opacity: 1,
					filter: "blur(0px)"
				}, {
					height: "0px",
					opacity: c,
					filter: `blur(${l}px)`
				}], {
					duration: r * 1e3,
					easing: i
				}), o.onfinish = () => {
					e.open = !1, o = null;
				};
			}, p = (t) => {
				if (t.preventDefault(), e.open) {
					f();
					return;
				}
				a && d.forEach((t) => {
					t.details !== e && t.details.open && t.closeIt();
				}), u();
			};
			return t.addEventListener("click", p), {
				details: e,
				closeIt: f,
				destroy() {
					s(), t.removeEventListener("click", p), t.classList.remove("kt-accordion-summary"), e.classList.remove("kt-open"), Array.from(n.childNodes).forEach((t) => e.insertBefore(t, n)), n.remove();
				}
			};
		};
		return n.forEach((e) => {
			let t = f(e);
			t && d.push(t);
		}), {
			el: e,
			type: "accordion",
			pause() {},
			resume() {},
			destroy() {
				d.forEach((e) => e.destroy()), e.classList.remove("kt-accordion", "kt-accordion--arrow-left");
			}
		};
	},
	reduced(e) {
		return {
			el: e,
			type: "accordion",
			pause() {},
			resume() {},
			destroy() {}
		};
	}
}, Jt = { create(e, t = {}) {
	let n = t.mode === "mash" ? "mash" : "hold", r = Math.max(120, Number(t.duration ?? 1e3)), i = t.color || "var(--kt-hold-fill, color-mix(in srgb, currentColor 22%, transparent))", a = t.blend || "var(--kt-hold-blend, normal)", o = _(Number(t.step ?? .08), .01, 1), s = Math.max(0, Number(t.decay ?? .4)), c = e.style.position, l = e.style.overflow;
	getComputedStyle(e).position === "static" && (e.style.position = "relative"), e.style.overflow = e.style.overflow || "hidden";
	let u = document.createElement("span");
	u.className = "kt-hold-fill", u.setAttribute("aria-hidden", "true"), u.style.cssText = `position:absolute;inset:0;transform-origin:left center;transform:scaleX(0);background:${i};mix-blend-mode:${a};pointer-events:none;border-radius:inherit;z-index:0;`, e.insertBefore(u, e.firstChild);
	let d = null, f = !1, p = !1, m = 0, h = (e) => {
		m = _(e, 0, 1), u.style.transform = `scaleX(${m})`;
	}, g = () => {
		d != null && (cancelAnimationFrame(d), d = null);
	}, v = () => {
		if (t.submit === !1) return;
		let n = t.action || e.getAttribute("data-kt-hold-action");
		if (n) {
			document.querySelector(n)?.click?.();
			return;
		}
		if (e.tagName === "A" && e.getAttribute("href")) {
			window.location.href = e.href;
			return;
		}
		let r = e.closest?.("form"), i = t.submit === !0 || e.type === "submit" || e.getAttribute("data-kt-hold-submit") != null;
		r && i && (typeof r.requestSubmit == "function" ? r.requestSubmit(e.type === "submit" ? e : void 0) : r.submit());
	}, y = () => {
		if (p) return;
		p = !0, f = !1, g(), h(1), e.classList.add("kt-hold-confirmed"), e.setAttribute("aria-pressed", "true");
		let n = !0;
		try {
			n = e.dispatchEvent(new CustomEvent("kt-hold-confirm", {
				bubbles: !0,
				cancelable: !0
			}));
		} catch {}
		t.onComplete?.(e), n && v();
	}, b = 0, x = (e) => {
		let t = _((e - b) / r, 0, 1);
		if (h(t), t >= 1) {
			d = null, y();
			return;
		}
		d = requestAnimationFrame(x);
	}, S = () => {
		f || p || (f = !0, b = performance.now(), u.style.transition = "none", g(), d = requestAnimationFrame(x));
	}, C = () => {
		f = !1, g(), !p && (u.style.transition = `transform ${Math.min(.35, r / 3e3)}s ease`, h(0));
	}, w = 0, T = (e) => {
		let t = w ? (e - w) / 1e3 : 0;
		if (w = e, h(m - s * t), m <= 0) {
			d = null, w = 0;
			return;
		}
		d = requestAnimationFrame(T);
	}, E = () => {
		if (!p) {
			if (u.style.transition = "none", h(m + o), m >= 1) {
				y();
				return;
			}
			w = 0, d ??= requestAnimationFrame(T);
		}
	}, D = (e) => {
		e.pointerType === "mouse" && e.button !== 0 || (n === "mash" ? E() : S());
	}, O = (e) => {
		e.key !== "Enter" && e.key !== " " || (e.preventDefault(), n === "mash" ? e.repeat || E() : S());
	}, k = (e) => {
		n === "hold" && (e.key === "Enter" || e.key === " ") && C();
	};
	return e.addEventListener("pointerdown", D), n === "hold" && (e.addEventListener("pointerup", C), e.addEventListener("pointerleave", C), e.addEventListener("pointercancel", C)), e.addEventListener("keydown", O), e.addEventListener("keyup", k), {
		el: e,
		type: "hold",
		progress: () => m,
		reset() {
			p = !1, e.classList.remove("kt-hold-confirmed"), e.removeAttribute("aria-pressed"), g(), w = 0, u.style.transition = "transform .2s ease", h(0);
		},
		pause() {},
		resume() {},
		destroy() {
			g(), e.removeEventListener("pointerdown", D), e.removeEventListener("pointerup", C), e.removeEventListener("pointerleave", C), e.removeEventListener("pointercancel", C), e.removeEventListener("keydown", O), e.removeEventListener("keyup", k), u.remove(), e.style.position = c, e.style.overflow = l, e.classList.remove("kt-hold-confirmed"), e.removeAttribute("aria-pressed");
		}
	};
} }, Yt = {
	create(e, t = {}) {
		let n = Array.from(e.querySelectorAll("li")).filter((e) => e.querySelector(":scope > .kt-menu-panel"));
		if (!n.length) return null;
		let r = p().reducedMotion, i = typeof matchMedia < "u" && matchMedia("(hover:hover) and (pointer:fine)").matches, a = t.trigger === "click" ? "click" : "hover", o = t.layout === "mega" ? "mega" : "dropdown", s = Math.max(0, Number(t.openDelay ?? 60)), c = Math.max(0, Number(t.closeDelay ?? 180)), l = Math.max(.05, Number(t.duration ?? .24)), u = ["chevron", "plus"].includes(t.indicator) ? t.indicator : "none";
		e.classList.add("kt-menu", o === "mega" ? "kt-menu--mega" : "kt-menu--dropdown"), u !== "none" && e.classList.add(`kt-menu--ind-${u}`);
		let d = (e) => Array.from(e.querySelectorAll("a[href],button:not([disabled]),input:not([disabled]),select,textarea,[tabindex]:not([tabindex=\"-1\"])")), f = [], m = null, h = null, g = null, _ = 0, v = (e) => {
			clearTimeout(g), m !== e && (m && y(m, !0), m = e, e.li.classList.add("kt-open"), e.trg.setAttribute("aria-expanded", "true"), e.panel.hidden = !1, e.anim &&= (e.anim.cancel(), null), r || (e.anim = e.panel.animate([{
				opacity: 0,
				transform: "translateY(-6px)"
			}, {
				opacity: 1,
				transform: "translateY(0)"
			}], {
				duration: l * 1e3,
				easing: "cubic-bezier(.22,.8,.3,1)"
			})));
		}, y = (e, t) => {
			if (!e) return;
			e.li.classList.remove("kt-open"), e.trg.setAttribute("aria-expanded", "false");
			let n = () => {
				e.panel.hidden = !0, e.anim = null;
			};
			e.anim &&= (e.anim.cancel(), null), r || t ? n() : (e.anim = e.panel.animate([{
				opacity: 1,
				transform: "translateY(0)"
			}, {
				opacity: 0,
				transform: "translateY(-6px)"
			}], {
				duration: l * 700,
				easing: "ease"
			}), e.anim.onfinish = n, e.anim.oncancel = n), m === e && (m = null);
		};
		if (n.forEach((e) => {
			let t = e.querySelector(":scope > .kt-menu-panel"), n = e.querySelector("a,button,summary,[role=\"button\"]") || e.firstElementChild;
			if (!t || !n) return;
			_ += 1, t.id = t.id || `kt-menu-panel-${_}`, t.hidden = !0, n.setAttribute("aria-haspopup", "true"), n.setAttribute("aria-expanded", "false"), n.setAttribute("aria-controls", t.id), n.classList.add("kt-menu-trigger");
			let r = e.getAttribute("data-kt-menu-trigger"), o = r === "click" ? "click" : r === "hover" ? "hover" : a, l = e.getAttribute("data-kt-menu-open"), u = l ? Array.from(document.querySelectorAll(l)) : [], p = {
				li: e,
				panel: t,
				trg: n,
				anim: null,
				handlers: {}
			}, b = () => f.indexOf(p), x = () => {
				clearTimeout(g), clearTimeout(h), h = setTimeout(() => v(p), s);
			}, S = () => {
				clearTimeout(h), clearTimeout(g), g = setTimeout(() => y(p), c);
			}, C = (e) => {
				e.preventDefault(), m === p ? y(p) : v(p);
			}, w = (e) => {
				e.key === "ArrowDown" || e.key === "Enter" || e.key === " " ? (e.preventDefault(), v(p), d(t)[0]?.focus()) : e.key === "Escape" ? (y(p), n.focus()) : e.key === "ArrowRight" ? (e.preventDefault(), f[(b() + 1) % f.length].trg.focus()) : e.key === "ArrowLeft" && (e.preventDefault(), f[(b() - 1 + f.length) % f.length].trg.focus());
			}, T = (e) => {
				if (e.key === "Escape") {
					y(p), n.focus();
					return;
				}
				if (e.key === "ArrowDown" || e.key === "ArrowUp") {
					let n = d(t);
					if (!n.length) return;
					e.preventDefault();
					let r = n.indexOf(document.activeElement);
					n[e.key === "ArrowDown" ? (r + 1) % n.length : (r - 1 + n.length) % n.length].focus();
				}
			}, E = (t) => {
				e.contains(t.relatedTarget) || y(p);
			}, D = o === "hover";
			i && (D || u.length) && (e.addEventListener("mouseenter", x), e.addEventListener("mouseleave", S)), (!D || !i) && n.addEventListener("click", C), i && u.forEach((e) => {
				e.addEventListener("mouseenter", x), e.addEventListener("mouseleave", S);
			}), n.addEventListener("keydown", w), t.addEventListener("keydown", T), e.addEventListener("focusout", E), p.handlers = {
				onEnter: x,
				onLeave: S,
				onClick: C,
				onKey: w,
				onPanelKey: T,
				onFocusOut: E,
				zones: u
			}, f.push(p);
		}), !f.length) return null;
		let b = (e) => {
			m && !m.li.contains(e.target) && y(m);
		}, x = (e) => {
			if (e.key === "Escape" && m) {
				let e = m;
				y(e), e.trg.focus();
			}
		};
		return document.addEventListener("pointerdown", b, !0), document.addEventListener("keydown", x), {
			el: e,
			type: "megaMenu",
			pause() {},
			resume() {},
			destroy() {
				clearTimeout(h), clearTimeout(g), document.removeEventListener("pointerdown", b, !0), document.removeEventListener("keydown", x), e.classList.remove("kt-menu", "kt-menu--mega", "kt-menu--dropdown", "kt-menu--ind-chevron", "kt-menu--ind-plus"), f.forEach((e) => {
					let t = e.handlers;
					e.li.removeEventListener("mouseenter", t.onEnter), e.li.removeEventListener("mouseleave", t.onLeave), e.trg.removeEventListener("click", t.onClick), e.trg.removeEventListener("keydown", t.onKey), e.panel.removeEventListener("keydown", t.onPanelKey), e.li.removeEventListener("focusout", t.onFocusOut), (t.zones || []).forEach((e) => {
						e.removeEventListener("mouseenter", t.onEnter), e.removeEventListener("mouseleave", t.onLeave);
					}), e.li.classList.remove("kt-open"), e.trg.classList.remove("kt-menu-trigger"), e.panel.hidden = !1, e.trg.removeAttribute("aria-haspopup"), e.trg.removeAttribute("aria-expanded"), e.trg.removeAttribute("aria-controls");
				});
			}
		};
	},
	reduced(e, t) {
		return this.create(e, t);
	}
}, Xt = {}, Zt = (e) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">${e}</svg>`, Qt = {
	info: Zt("<path d=\"M12 11v5\"/><path d=\"M12 7.5h.01\"/>"),
	success: Zt("<path d=\"M5 12.5l4.2 4.2L19 7\"/>"),
	warning: Zt("<path d=\"M12 8v5\"/><path d=\"M12 16.5h.01\"/>"),
	error: Zt("<path d=\"M7.5 7.5l9 9\"/><path d=\"M16.5 7.5l-9 9\"/>")
}, $t = (e) => {
	if (Xt[e]) return Xt[e];
	let t = document.createElement("div");
	return t.className = `kt-toast-region kt-toast-region--${e}`, t.setAttribute("role", "region"), t.setAttribute("aria-label", "Notifications"), document.body.appendChild(t), Xt[e] = t, t;
}, en = {
	parallax: le,
	mouseParallax: ue,
	reveal: me,
	counter: xe,
	lazy: Pe,
	textSplit: Re,
	blurText: ze,
	shuffle: Ve,
	typewriter: He,
	textReveal: Ue,
	textTransition: Ge,
	magnetic: Ke,
	marquee: qe,
	overflowText: et,
	loader: rt,
	tilt: it,
	cursor: lt,
	textFill: ut,
	stickyStack: ft,
	scrollVelocity: pt,
	progress: gt,
	slider: _t,
	ambientMedia: bt,
	pageReveal: xt,
	glitch: wt,
	cardGlow: Et,
	lightbox: Pt,
	pageTransition: Lt,
	vibrate: zt,
	ripple: Bt,
	cssScroll: Vt,
	scrollSequence: Ht,
	brushReveal: Wt,
	fullpage: Gt,
	confetti: Kt,
	accordion: qt,
	hold: Jt,
	megaMenu: Yt,
	toast: {
		create(e, t = {}) {
			let n = p().reducedMotion, r = t.position || "bottom-right", i = t.type || "info", a = _(Number(t.duration ?? 1e4), 1e3, 3e4), o = t.dismissible !== !1, s = t.message || e.getAttribute("data-kt-message") || e.textContent.trim() || "Done", c = t.progressBar === "ring" ? "ring" : t.progressBar === "fill" ? "fill" : t.progressBar === !0 || t.progressBar === "bar" ? "bar" : "none", l = Math.max(1, Number(t.max ?? 5)), u = t.icon, d = (e, d = {}) => {
				let f = d.type || i, p = $t(d.position || r);
				for (; p.children.length >= l;) p.firstElementChild?.remove();
				let m = document.createElement("div");
				m.className = `kt-toast kt-toast--${f}`, m.setAttribute("role", f === "error" || f === "warning" ? "alert" : "status"), t.barColor && m.style.setProperty("--kt-toast-bar", t.barColor);
				let h = f !== "none" && u !== !1 ? typeof u == "string" ? u : Qt[f] || "" : "", g = document.createElement("span");
				g.className = "kt-toast__msg", g.textContent = e ?? s, m.appendChild(g);
				let _ = !1, v = () => m.remove(), y = () => {
					if (_) return;
					if (_ = !0, clearTimeout(S), C && C.cancel(), n || !m.animate) {
						v();
						return;
					}
					let e = m.animate([{
						opacity: 1,
						transform: "none"
					}, {
						opacity: 0,
						transform: "translateY(6px) scale(.98)"
					}], {
						duration: 200,
						easing: "ease"
					});
					e.onfinish = v, e.oncancel = v;
				};
				if (o) {
					let e = document.createElement("button");
					e.type = "button", e.className = "kt-toast__close", e.setAttribute("aria-label", "Dismiss"), e.innerHTML = "&times;", e.addEventListener("click", y), m.appendChild(e);
				}
				p.appendChild(m), !n && m.animate && m.animate([{
					opacity: 0,
					transform: "translateY(10px)"
				}, {
					opacity: 1,
					transform: "translateY(0)"
				}], {
					duration: 240,
					easing: "cubic-bezier(.22,.8,.3,1)"
				});
				let b = Math.max(1e3, Number(d.duration ?? a)), x = 0, S = null, C = null, w = () => {
					_ || (x = performance.now(), clearTimeout(S), S = setTimeout(y, Math.max(300, b)));
				}, T = () => {
					_ || !x || (clearTimeout(S), b = Math.max(300, b - (performance.now() - x)), x = 0);
				};
				if (c === "ring" && !n && m.animate) {
					let e = document.createElement("span");
					e.className = "kt-toast__ring", e.setAttribute("aria-hidden", "true");
					let t = 2 * Math.PI * 9;
					if (e.innerHTML = `<svg viewBox="0 0 24 24"><circle class="kt-toast__ring-track" cx="12" cy="12" r="9"></circle><circle class="kt-toast__ring-fill" cx="12" cy="12" r="9" transform="rotate(-90 12 12)" stroke-dasharray="${t}" stroke-dashoffset="0"></circle></svg>`, h) {
						let t = document.createElement("span");
						t.className = "kt-toast__ring-icon", t.setAttribute("aria-hidden", "true"), t.innerHTML = h, e.appendChild(t);
					}
					m.insertBefore(e, m.firstChild), C = e.querySelector(".kt-toast__ring-fill").animate([{ strokeDashoffset: 0 }, { strokeDashoffset: t }], {
						duration: b,
						easing: "linear"
					});
				} else {
					if (h) {
						let e = document.createElement("span");
						e.className = "kt-toast__icon", e.setAttribute("aria-hidden", "true"), e.innerHTML = h, m.insertBefore(e, m.firstChild);
					}
					if (c === "bar" && !n && m.animate) {
						let e = document.createElement("span");
						e.className = "kt-toast__bar", e.setAttribute("aria-hidden", "true"), m.appendChild(e), C = e.animate([{ transform: "scaleX(1)" }, { transform: "scaleX(0)" }], {
							duration: b,
							easing: "linear"
						});
					} else if (c === "fill" && !n && m.animate) {
						let e = document.createElement("span");
						e.className = "kt-toast__fill", e.setAttribute("aria-hidden", "true"), m.insertBefore(e, m.firstChild), C = e.animate([{ transform: "scaleX(0)" }, { transform: "scaleX(1)" }], {
							duration: b,
							easing: "linear",
							fill: "forwards"
						});
					}
				}
				let E = () => {
					T(), C && C.pause();
				}, D = () => {
					w(), C && C.play();
				};
				return m.addEventListener("mouseenter", E), m.addEventListener("mouseleave", D), m.addEventListener("focusin", E), m.addEventListener("focusout", D), w(), {
					dismiss: y,
					el: m
				};
			}, f = () => d();
			return e.addEventListener("click", f), {
				el: e,
				type: "toast",
				show: d,
				pause() {},
				resume() {},
				destroy() {
					e.removeEventListener("click", f);
				}
			};
		},
		reduced(e, t) {
			return this.create(e, t);
		}
	},
	bottomSheet: {
		create(e, t = {}) {
			let n = p().reducedMotion, r = Math.max(.05, Number(t.duration ?? .34)), i = t.backdrop !== !1, a = _(Number(t.backdropOpacity ?? .5), 0, 1), o = t.dismissible !== !1, s = t.handle !== !1, c = t.trigger || "[data-kt-sheet-trigger]";
			e.classList.add("kt-sheet"), e.setAttribute("role", "dialog"), e.setAttribute("aria-modal", "true"), e.hidden = !0;
			let l = null;
			i && (l = document.createElement("div"), l.className = "kt-sheet-backdrop", l.hidden = !0);
			let u = null;
			s && (u = document.createElement("div"), u.className = "kt-sheet__handle", u.setAttribute("aria-hidden", "true"), e.insertBefore(u, e.firstChild));
			let d = !1, f = null, m = null, h = () => Array.from(e.querySelectorAll("a[href],button:not([disabled]),input:not([disabled]),select,textarea,[tabindex]:not([tabindex=\"-1\"])")), g = () => {
				d || (d = !0, f = document.activeElement, l && (document.body.appendChild(l), l.hidden = !1, n || l.animate([{ opacity: 0 }, { opacity: a }], {
					duration: r * 1e3,
					easing: "ease"
				})), e.hidden = !1, e.classList.add("kt-open"), m && m.cancel(), n || (m = e.animate([{ transform: "translateY(100%)" }, { transform: "translateY(0)" }], {
					duration: r * 1e3,
					easing: "cubic-bezier(.22,.8,.3,1)"
				})), (h()[0] || e).focus?.(), document.addEventListener("keydown", y, !0));
			}, v = () => {
				if (!d) return;
				d = !1, e.classList.remove("kt-open"), document.removeEventListener("keydown", y, !0);
				let t = () => {
					d || (e.hidden = !0, l && (l.hidden = !0));
				};
				l && !n && l.animate([{ opacity: a }, { opacity: 0 }], {
					duration: r * 800,
					easing: "ease"
				}), n ? t() : (m && m.cancel(), m = e.animate([{ transform: "translateY(0)" }, { transform: "translateY(100%)" }], {
					duration: r * 800,
					easing: "ease"
				}), m.onfinish = t, m.oncancel = t), f?.focus?.();
			}, y = (e) => {
				if (e.key === "Escape" && o) {
					e.preventDefault(), v();
					return;
				}
				if (e.key !== "Tab") return;
				let t = h();
				if (!t.length) return;
				let n = t[0], r = t[t.length - 1];
				e.shiftKey && document.activeElement === n ? (e.preventDefault(), r.focus()) : !e.shiftKey && document.activeElement === r && (e.preventDefault(), n.focus());
			};
			if (l && o && l.addEventListener("click", v), l && l.style.setProperty("--kt-sheet-backdrop-opacity", String(a)), u && o) {
				let t = 0, n = !1, r = (r) => {
					n = !0, t = r.clientY, e.style.transition = "none", u.setPointerCapture?.(r.pointerId);
				}, i = (r) => {
					if (!n) return;
					let i = Math.max(0, r.clientY - t);
					e.style.transform = `translateY(${i}px)`;
				}, a = (r) => {
					if (!n) return;
					n = !1, e.style.transition = "";
					let i = Math.max(0, r.clientY - t);
					e.style.transform = "", i > 90 && v();
				};
				u.addEventListener("pointerdown", r), u.addEventListener("pointermove", i), u.addEventListener("pointerup", a), u.addEventListener("pointercancel", a), u._kt = {
					down: r,
					move: i,
					up: a
				};
			}
			let b = e.id ? Array.from(document.querySelectorAll(c)).filter((n) => (n.getAttribute("data-kt-sheet-trigger") || n.getAttribute("href") || "") === `#${e.id}` || t.trigger) : [], x = (e) => {
				e.preventDefault(), g();
			};
			return b.forEach((e) => {
				e.setAttribute("aria-haspopup", "dialog"), e.addEventListener("click", x);
			}), {
				el: e,
				type: "bottomSheet",
				open: g,
				close: v,
				pause() {},
				resume() {},
				destroy() {
					v(), document.removeEventListener("keydown", y, !0), b.forEach((e) => e.removeEventListener("click", x)), l && l.remove(), u && u.remove(), e.classList.remove("kt-sheet", "kt-open"), e.removeAttribute("role"), e.removeAttribute("aria-modal"), e.hidden = !1;
				}
			};
		},
		reduced(e, t) {
			return this.create(e, t);
		}
	},
	tabs: {
		create(e, t = {}) {
			let n = p().reducedMotion, r = t.activation === "manual" ? "manual" : "automatic", i = t.orientation === "vertical" ? "vertical" : "horizontal", a = Math.max(0, Number(t.duration ?? .28)), o = t.indicator !== !1, s = t.effect || "fade", c = [
				"slide",
				"none",
				"fade"
			].includes(t.indicatorMotion) ? t.indicatorMotion : "slide", l = e.querySelector("[role=\"tablist\"], .kt-tablist") || e.firstElementChild;
			if (!l) return null;
			let u = Array.from(l.querySelectorAll("button, a, [role=\"tab\"], .kt-tab")).filter((e) => e.closest("[role=\"tablist\"], .kt-tablist") === l), d = Array.from(e.querySelectorAll("[role=\"tabpanel\"], .kt-tabpanel, [data-kt-tabpanel]"));
			if (!u.length || !d.length) return null;
			e.classList.add("kt-tabs", `kt-tabs--${i}`), s === "none" && e.classList.add("kt-tabs--instant"), c === "none" && e.classList.add("kt-tabs--ind-none"), l.setAttribute("role", "tablist"), l.setAttribute("aria-orientation", i);
			let f = null;
			o && (f = document.createElement("span"), f.className = "kt-tabs__indicator", f.setAttribute("aria-hidden", "true"), l.appendChild(f), getComputedStyle(l).position === "static" && (l.style.position = "relative"));
			let m = Math.max(0, u.findIndex((e) => e.getAttribute("aria-selected") === "true"));
			m < 0 && (m = 0);
			let h = Math.random().toString(36).slice(2, 7);
			u.forEach((e, t) => {
				e.setAttribute("role", "tab"), e.id = e.id || `kt-tab-${h}-${t}`, !e.querySelector("*") && !e.hasAttribute("data-kt-label") && e.setAttribute("data-kt-label", e.textContent.trim());
				let n = d[t];
				n && (n.setAttribute("role", "tabpanel"), n.id = n.id || `kt-tabpanel-${h}-${t}`, n.setAttribute("aria-labelledby", e.id), n.setAttribute("tabindex", "0"), e.setAttribute("aria-controls", n.id));
			});
			let g = () => {
				let e = u[m];
				i === "vertical" ? (f.style.transform = `translateY(${e.offsetTop}px)`, f.style.setProperty("height", `${e.offsetHeight}px`, "important"), f.style.removeProperty("width")) : (f.style.transform = `translateX(${e.offsetLeft}px)`, f.style.setProperty("width", `${e.offsetWidth}px`, "important"), f.style.removeProperty("height"));
			}, v = !0, y = () => {
				if (f) {
					if (c === "fade" && !v && !n && typeof f.animate == "function") {
						let e = f.style.transition;
						f.animate([{ opacity: 1 }, { opacity: 0 }], {
							duration: 120,
							easing: "ease"
						}).onfinish = () => {
							f.style.transition = "none", g(), f.offsetWidth, f.style.transition = e, f.animate([{ opacity: 0 }, { opacity: 1 }], {
								duration: 160,
								easing: "ease"
							});
						};
					} else g();
					v = !1;
				}
			}, b = () => s === "slide" ? [{
				opacity: 0,
				transform: "translateX(8px)"
			}, {
				opacity: 1,
				transform: "none"
			}] : s === "blur" ? [{
				opacity: 0,
				filter: "blur(6px)"
			}, {
				opacity: 1,
				filter: "blur(0px)"
			}] : [{ opacity: 0 }, { opacity: 1 }], x = (r, i = !0) => {
				let o = m;
				m = _(r, 0, u.length - 1);
				let c = o !== m, l = !n && s !== "none" && a > 0, f = s === "cross" || s === "crossfade";
				if (u.forEach((e, t) => {
					let n = t === m;
					e.setAttribute("aria-selected", n ? "true" : "false"), e.setAttribute("tabindex", n ? "0" : "-1"), e.classList.toggle("kt-active", n);
					let r = d[t];
					if (r) if (n) {
						if (r.hidden = !1, r.classList.add("kt-active"), l) {
							let e = f && c ? a * 500 : 0;
							r.animate(b(), {
								duration: a * (f ? 500 : 1e3),
								delay: e,
								easing: "cubic-bezier(.22,.8,.3,1)",
								fill: "backwards"
							});
						}
					} else if (t === o && f && l && c) {
						r.classList.remove("kt-active");
						let e = r.animate([{ opacity: 1 }, { opacity: 0 }], {
							duration: a * 500,
							easing: "ease"
						});
						e.onfinish = () => {
							r.hidden = !0;
						}, e.oncancel = () => {
							r.hidden = !0;
						};
					} else r.hidden = !0, r.classList.remove("kt-active");
				}), y(), c) {
					t.onChange?.(m, u[m], d[m]);
					try {
						e.dispatchEvent(new CustomEvent("kt-tabs-change", {
							bubbles: !0,
							detail: { index: m }
						}));
					} catch {}
				}
				i && u[m].focus();
			}, S = (e) => {
				let t = u.indexOf(e.currentTarget);
				t >= 0 && (e.preventDefault(), x(t, !1));
			}, C = i === "vertical" ? "ArrowUp" : "ArrowLeft", w = i === "vertical" ? "ArrowDown" : "ArrowRight", T = (e) => {
				let t = null;
				if (e.key === w) t = (u.indexOf(e.currentTarget) + 1) % u.length;
				else if (e.key === C) t = (u.indexOf(e.currentTarget) - 1 + u.length) % u.length;
				else if (e.key === "Home") t = 0;
				else if (e.key === "End") t = u.length - 1;
				else if ((e.key === "Enter" || e.key === " ") && r === "manual") {
					e.preventDefault(), x(u.indexOf(e.currentTarget), !1);
					return;
				}
				t != null && (e.preventDefault(), u[t].focus(), r === "automatic" && x(t, !1));
			};
			u.forEach((e) => {
				e.addEventListener("click", S), e.addEventListener("keydown", T);
			}), x(m, !1);
			let E = () => y();
			return window.addEventListener("resize", E), requestAnimationFrame(y), {
				el: e,
				type: "tabs",
				select: (e) => x(e, !1),
				pause() {},
				resume() {},
				destroy() {
					window.removeEventListener("resize", E), u.forEach((e) => {
						e.removeEventListener("click", S), e.removeEventListener("keydown", T), e.removeAttribute("data-kt-label");
					}), f?.remove(), e.classList.remove("kt-tabs", `kt-tabs--${i}`, "kt-tabs--ind-none", "kt-tabs--instant"), d.forEach((e) => {
						e.hidden = !1;
					});
				}
			};
		},
		reduced(e, t) {
			return this.create(e, t);
		}
	},
	radial: {
		create(e, t = {}) {
			let n = p().reducedMotion, r = (() => {
				let t = Array.from(e.querySelectorAll(":scope > .kt-radial-item"));
				return t.length ? t : Array.from(e.children).filter((e) => e.nodeType === 1 && !e.matches(".kt-radial-controls, button"));
			})();
			if (r.length < 2) return null;
			let i = Math.max(40, Number(t.radius ?? 260)), a = Number(t.step ?? 26), o = [
				"bottom",
				"top",
				"left",
				"right"
			].includes(t.position) ? t.position : "bottom", s = {
				bottom: -90,
				top: 90,
				left: 0,
				right: 180
			}[o], c = t.activeAngle == null ? s : Number(t.activeAngle), l = Math.max(0, Number(t.duration ?? .6)), u = t.loop !== !1, d = t.drag !== !1, f = t.controls !== !1;
			e.classList.add("kt-radial", `kt-radial--${o}`), e.style.setProperty("--kt-radial-radius", `${i}px`), e.setAttribute("role", "group"), e.setAttribute("aria-roledescription", "carousel");
			let m = document.createElement("div");
			if (m.className = "kt-radial-hub", e.appendChild(m), r.forEach((e) => {
				e.classList.add("kt-radial-item"), m.appendChild(e);
			}), t.align === "center") {
				let e = c * Math.PI / 180;
				m.style.left = `calc(50% - ${(Math.cos(e) * i).toFixed(1)}px)`, m.style.top = `calc(50% - ${(Math.sin(e) * i).toFixed(1)}px)`;
			}
			let h = Math.floor(r.length / 2), g = document.createElement("div");
			g.className = "kt-radial-live", g.setAttribute("aria-live", "polite"), g.style.cssText = "position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);", e.appendChild(g);
			let v = r.length, y = () => {
				r.forEach((e, t) => {
					let r = t - h;
					u && (r = (r % v + v) % v, r > v / 2 && (r -= v));
					let o = e._ktOffset, s = o !== void 0 && Math.abs(r - o) > v / 2;
					e._ktOffset = r;
					let d = c + r * a;
					e.style.transition = n || l === 0 || s ? "none" : `transform ${l}s cubic-bezier(.22,.8,.3,1), opacity ${l}s ease`, e.style.transform = `rotate(${d}deg) translate(${i}px) rotate(${-d}deg) translate(-50%, -50%)`, e.style.opacity = String(Math.max(0, 1 - Math.abs(r) * .42));
					let f = t === h;
					e.classList.toggle("kt-active", f), e.classList.toggle("active-item", f), f ? e.setAttribute("aria-current", "true") : e.removeAttribute("aria-current"), e.style.zIndex = String(100 - Math.abs(r));
				}), g.textContent = `${h + 1} / ${r.length}`;
			}, b = (e) => {
				h = u ? (e % r.length + r.length) % r.length : _(e, 0, r.length - 1), y();
			}, x = () => b(h + 1), S = () => b(h - 1);
			r.forEach((e, t) => {
				e.style.cursor = "pointer", e.addEventListener("click", () => b(t)), e.hasAttribute("tabindex") || (e.tabIndex = -1);
			});
			let C = e.querySelector(".kt-radial-controls"), w = null, T = null, E = !1;
			f && (C || (C = document.createElement("div"), C.className = "kt-radial-controls", C.innerHTML = "<button type=\"button\" class=\"kt-radial-prev\" aria-label=\"Previous\"></button><button type=\"button\" class=\"kt-radial-next\" aria-label=\"Next\"></button>", e.appendChild(C), E = !0), w = C.querySelector(".kt-radial-prev, [data-kt-radial-prev]"), T = C.querySelector(".kt-radial-next, [data-kt-radial-next]"), w?.addEventListener("click", S), T?.addEventListener("click", x));
			let D = (e) => {
				e.key === "ArrowRight" || e.key === "ArrowDown" ? (e.preventDefault(), x()) : (e.key === "ArrowLeft" || e.key === "ArrowUp") && (e.preventDefault(), S());
			};
			e.hasAttribute("tabindex") || (e.tabIndex = 0), e.addEventListener("keydown", D);
			let O = null, k = o === "bottom" || o === "top", A = (e) => {
				!d || e.target.closest(".kt-radial-controls, button") || (O = {
					x: e.clientX,
					y: e.clientY,
					start: h,
					moved: !1
				});
			}, j = (e) => {
				if (!O) return;
				let t = k ? e.clientX - O.x : e.clientY - O.y;
				Math.abs(t) <= 6 || (O.moved = !0, b(O.start + Math.round(-t / 60)));
			}, M = () => {
				O = null;
			};
			d && (e.addEventListener("pointerdown", A), e.addEventListener("pointermove", j), e.addEventListener("pointerup", M), e.addEventListener("pointercancel", M));
			let N = Math.max(0, Number(t.autoplay ?? 0)), P = null, F = () => {
				N && !n && (I(), P = setInterval(x, N));
			}, I = () => {
				P &&= (clearInterval(P), null);
			};
			return N && (e.addEventListener("mouseenter", I), e.addEventListener("mouseleave", F), F()), y(), {
				el: e,
				type: "radial",
				next: x,
				prev: S,
				go: b,
				pause: I,
				resume: F,
				destroy() {
					I(), e.removeEventListener("keydown", D), e.removeEventListener("pointerdown", A), e.removeEventListener("pointermove", j), e.removeEventListener("pointerup", M), e.removeEventListener("pointercancel", M), e.removeEventListener("mouseenter", I), e.removeEventListener("mouseleave", F), w?.removeEventListener("click", S), T?.removeEventListener("click", x), r.forEach((t) => {
						t.style.transform = "", t.style.transition = "", t.classList.remove("kt-active", "active-item"), e.appendChild(t);
					}), m.remove(), g.remove(), E && C.remove(), e.classList.remove("kt-radial", `kt-radial--${o}`), e.removeAttribute("role"), e.removeAttribute("aria-roledescription");
				}
			};
		},
		reduced(e, t) {
			return this.create(e, t);
		}
	},
	coverReveal: {
		create(e, t = {}) {
			let n = p().reducedMotion, r = t.color || "#ff5b1c", i = t.color2 || "#12141a", a = [
				"left",
				"right",
				"up",
				"down"
			].includes(t.direction) ? t.direction : "right", o = Math.max(.05, Number(t.duration ?? .7)), s = Math.max(0, Number(t.delay ?? 0)), c = t.ease || "cubic-bezier(.77,0,.18,1)", l = _(Math.round(Number(t.layers ?? 2)), 1, 3), u = Math.max(0, Number(t.stagger ?? 120)), d = t.lines === !0, f = {
				right: "translateX(101%)",
				left: "translateX(-101%)",
				down: "translateY(101%)",
				up: "translateY(-101%)"
			}[a], m = [], h = [], g = e, v = null, y = (e) => {
				let t = e.style.position, n = e.style.overflow;
				getComputedStyle(e).position === "static" && (e.style.position = "relative"), e.style.overflow = "hidden";
				let a = [];
				for (let t = 0; t < l; t += 1) {
					let n = l > 1 && t === l - 1 ? i : r, s = document.createElement("span");
					s.setAttribute("aria-hidden", "true"), s.style.cssText = `position:absolute;inset:0;background:${n};z-index:${20 + t};transform:translate(0,0);transition:transform ${o}s ${c};pointer-events:none;will-change:transform;`, e.appendChild(s), a.push(s);
				}
				return h.push({
					container: e,
					panels: a,
					restorePosition: t,
					restoreOverflow: n
				}), a;
			}, b = null, x = () => {
				let t = getComputedStyle(e), n = e.tagName === "IMG" || t.display.startsWith("inline"), r = document.createElement("div");
				r.className = "kt-cover-wrap", r.style.cssText = `position:relative;overflow:hidden;display:${n ? "inline-block" : "block"};border-radius:${t.borderRadius};`, e.parentNode.insertBefore(r, e), r.appendChild(e), g = r, v = () => {
					r.parentNode && (r.parentNode.insertBefore(e, r), r.remove());
				}, y(r);
			};
			function S() {
				let t = e.textContent, n = t.split(/\s+/).filter((e) => e.length);
				if (n.length < 1) return !1;
				b = t, e.textContent = "";
				let r = n.map((t, r) => {
					let i = document.createElement("span");
					return i.textContent = t, e.appendChild(i), r < n.length - 1 && e.appendChild(document.createTextNode(" ")), i;
				}), i = [], a = null, o = null;
				return r.forEach((e) => {
					let t = Math.round(e.getBoundingClientRect().top);
					(o === null || Math.abs(t - o) > 3) && (a = [], i.push(a), o = t), a.push(e);
				}), e.textContent = "", i.forEach((t) => {
					let n = document.createElement("span");
					n.className = "kt-cover-line", n.style.cssText = "position:relative;display:block;overflow:hidden;width:max-content;max-width:100%;", n.textContent = t.map((e) => e.textContent).join(" "), e.appendChild(n), y(n);
				}), !0;
			}
			d && S() || x();
			let C = !1, w = null, T = () => {
				if (C) return;
				C = !0, e.offsetWidth, requestAnimationFrame(() => {
					h.forEach((e, t) => {
						let n = s + (d ? t * u : 0);
						e.panels.forEach((e, t) => {
							let r = l - 1 - t;
							m.push(setTimeout(() => {
								e.style.transform = f;
							}, n + r * u));
						});
					});
				});
				let n = d ? Math.max(0, h.length - 1) : 0, r = s + n * u + (l - 1) * u + o * 1e3 + 80;
				m.push(setTimeout(() => {
					h.forEach((e) => e.panels.forEach((e) => e.remove())), t.onComplete?.(e);
				}, r));
			}, E = t.waitForImage !== !1, D = d ? null : e.tagName === "IMG" ? e : e.querySelector && e.querySelector("img"), O = () => {
				if (E && D && !(D.complete && D.naturalWidth)) {
					let e = !1, t = () => {
						e || (e = !0, T());
					};
					try {
						D.decode && D.decode().then(t, t);
					} catch {}
					D.addEventListener("load", t, { once: !0 }), D.addEventListener("error", t, { once: !0 }), setTimeout(t, 4e3);
				} else T();
			};
			return n ? h.forEach((e) => e.panels.forEach((e) => e.remove())) : typeof IntersectionObserver < "u" ? (w = new IntersectionObserver((e) => {
				for (let t of e) if (t.isIntersecting) {
					w.disconnect(), w = null, O();
					break;
				}
			}, { threshold: _(Number(t.threshold ?? .2), 0, 1) }), w.observe(g)) : O(), {
				el: e,
				type: "coverReveal",
				replay() {
					C = !1, m.forEach(clearTimeout), m = [], !n && (h.forEach((e) => {
						e.panels = [];
						for (let t = 0; t < l; t += 1) {
							let n = l > 1 && t === l - 1 ? i : r, a = document.createElement("span");
							a.style.cssText = `position:absolute;inset:0;background:${n};z-index:${20 + t};transform:translate(0,0);transition:transform ${o}s ${c};pointer-events:none;`, e.container.appendChild(a), e.panels.push(a);
						}
					}), requestAnimationFrame(T));
				},
				pause() {},
				resume() {},
				destroy() {
					w?.disconnect(), m.forEach(clearTimeout), h.forEach((e) => {
						e.panels.forEach((e) => e.remove()), e.container.style.overflow = e.restoreOverflow, e.container.style.position = e.restorePosition;
					}), v?.(), b != null && (e.textContent = b);
				}
			};
		},
		reduced(e, t) {
			return this.create(e, t);
		}
	},
	gesture: {
		create(e, t = {}) {
			if (p().reducedMotion) return {
				el: e,
				type: "gesture",
				pause() {},
				resume() {},
				destroy() {}
			};
			let n = Number(t.hoverScale ?? 1.04), r = Number(t.tapScale ?? .96), i = Number(t.lift ?? 0), a = Math.max(0, Number(t.duration ?? .22)), o = t.ease || (d.spring ? "cubic-bezier(.34,1.8,.5,1)" : "cubic-bezier(.34,1.56,.64,1)"), s = t.origin || "center", c = e.style.transition, l = e.style.transform, u = e.style.transformOrigin, f = e.style.willChange;
			e.style.transition = `transform ${a}s ${o}`, e.style.transformOrigin = s, e.style.willChange = "transform";
			let m = !1, h = !1, g = () => {
				let t = h ? r : m ? n : 1, a = m && !h ? -i : 0;
				e.style.transform = `translateY(${a}px) scale(${t})`;
			}, _ = () => {
				m = !0, g();
			}, v = () => {
				m = !1, h = !1, g();
			}, y = () => {
				h = !0, g();
			}, b = () => {
				h = !1, g();
			}, x = () => {
				m = !0, g();
			}, S = () => {
				m = !1, h = !1, g();
			}, C = (e) => {
				(e.key === " " || e.key === "Enter") && (h = !0, g());
			}, w = (e) => {
				(e.key === " " || e.key === "Enter") && (h = !1, g());
			};
			return e.addEventListener("pointerenter", _), e.addEventListener("pointerleave", v), e.addEventListener("pointerdown", y), e.addEventListener("pointerup", b), e.addEventListener("pointercancel", b), e.addEventListener("focus", x), e.addEventListener("blur", S), e.addEventListener("keydown", C), e.addEventListener("keyup", w), {
				el: e,
				type: "gesture",
				pause() {},
				resume() {},
				destroy() {
					e.removeEventListener("pointerenter", _), e.removeEventListener("pointerleave", v), e.removeEventListener("pointerdown", y), e.removeEventListener("pointerup", b), e.removeEventListener("pointercancel", b), e.removeEventListener("focus", x), e.removeEventListener("blur", S), e.removeEventListener("keydown", C), e.removeEventListener("keyup", w), e.style.transition = c, e.style.transform = l, e.style.transformOrigin = u, e.style.willChange = f;
				}
			};
		},
		reduced(e) {
			return {
				el: e,
				type: "gesture",
				pause() {},
				resume() {},
				destroy() {}
			};
		}
	},
	drag: {
		create(e, t = {}) {
			p().reducedMotion;
			let n = [
				"x",
				"y",
				"both"
			].includes(t.axis) ? t.axis : "both", r = t.bounds, i = t.snapBack === !0, a = t.inertia !== !1 && !i, o = t.handle && e.querySelector(t.handle) || e, s = e.style.transform, c = e.style.transition, l = e.style.touchAction, u = o.style.cursor;
			e.style.touchAction = n === "x" ? "pan-y" : n === "y" ? "pan-x" : "none", o.style.cursor = "grab";
			let d = 0, f = 0, m = !1, h = 0, g = 0, v = 0, y = 0, b = 0, x = 0, S = 0, C = 0, w = 0, T = null, E = () => {
				if (r !== "parent") return null;
				let t = e.offsetParent || e.parentElement;
				if (!t) return null;
				let n = t.getBoundingClientRect(), i = e.getBoundingClientRect(), a = i.left - d, o = i.top - f;
				return {
					minX: n.left - a,
					maxX: n.right - (a + i.width),
					minY: n.top - o,
					maxY: n.bottom - (o + i.height)
				};
			}, D = (t, r) => {
				n === "y" && (t = 0), n === "x" && (r = 0);
				let i = E();
				i && (t = _(t, i.minX, i.maxX), r = _(r, i.minY, i.maxY)), d = t, f = r, e.style.transform = `translate(${d}px, ${f}px)`;
			}, O = (t) => {
				t.button != null && t.button !== 0 || (m = !0, e.style.transition = "none", o.style.cursor = "grabbing", h = t.clientX, g = t.clientY, v = d, y = f, b = t.clientX, x = t.clientY, S = performance.now(), T &&= (cancelAnimationFrame(T), null));
			}, k = (e) => {
				if (!m) return;
				D(v + (e.clientX - h), y + (e.clientY - g));
				let t = performance.now(), n = t - S || 16;
				C = (e.clientX - b) / n, w = (e.clientY - x) / n, b = e.clientX, x = e.clientY, S = t;
			}, A = () => {
				if (m) {
					if (m = !1, o.style.cursor = "grab", i) e.style.transition = "transform .42s cubic-bezier(.22,.8,.3,1)", D(0, 0);
					else if (a && (Math.abs(C) > .02 || Math.abs(w) > .02)) {
						let e = () => {
							C *= .92, w *= .92, D(d + C * 16, f + w * 16), T = Math.abs(C) > .02 || Math.abs(w) > .02 ? requestAnimationFrame(e) : null;
						};
						T = requestAnimationFrame(e);
					}
				}
			}, j = (t) => {
				let n = t.shiftKey ? 20 : 6, r = !0;
				e.style.transition = "transform .12s ease", t.key === "ArrowLeft" ? D(d - n, f) : t.key === "ArrowRight" ? D(d + n, f) : t.key === "ArrowUp" ? D(d, f - n) : t.key === "ArrowDown" ? D(d, f + n) : r = !1, r && t.preventDefault();
			};
			return o.addEventListener("pointerdown", O), window.addEventListener("pointermove", k), window.addEventListener("pointerup", A), window.addEventListener("pointercancel", A), e.hasAttribute("tabindex") || (e.tabIndex = 0), e.addEventListener("keydown", j), {
				el: e,
				type: "drag",
				reset() {
					e.style.transition = "transform .42s cubic-bezier(.22,.8,.3,1)", D(0, 0);
				},
				pause() {},
				resume() {},
				destroy() {
					T && cancelAnimationFrame(T), o.removeEventListener("pointerdown", O), window.removeEventListener("pointermove", k), window.removeEventListener("pointerup", A), window.removeEventListener("pointercancel", A), e.removeEventListener("keydown", j), e.style.transform = s, e.style.transition = c, e.style.touchAction = l, o.style.cursor = u;
				}
			};
		},
		reduced(e, t) {
			return this.create(e, t);
		}
	},
	tooltip: {
		create(e, t = {}) {
			let n = p().reducedMotion, r = e.getAttribute("title"), i = t.content || e.getAttribute("data-kt-title") || r || e.getAttribute("aria-label") || "";
			if (!i) return null;
			r != null && e.removeAttribute("title");
			let a = [
				"top",
				"bottom",
				"left",
				"right"
			].includes(t.placement) ? t.placement : "top", o = [
				"hover",
				"focus",
				"click",
				"manual"
			].includes(t.trigger) ? t.trigger : "hover", s = Math.max(0, Number(t.delay ?? 120)), c = Math.max(0, Number(t.hideDelay ?? 80)), l = Number(t.offset ?? 8), u = Math.max(0, Number(t.duration ?? .16)), d = t.interactive === !0, f = [
				"fade",
				"scale",
				"shift",
				"none"
			].includes(t.effect) ? t.effect : "fade", m = f === "scale" ? {
				opacity: 0,
				transform: "scale(0.9)"
			} : f === "shift" ? {
				opacity: 0,
				transform: "translateY(5px)"
			} : {
				opacity: 0,
				transform: "none"
			}, h = {
				opacity: 1,
				transform: "none"
			}, g = document.createElement("div");
			g.className = "kt-tooltip", g.setAttribute("role", "tooltip"), g.id = `kt-tooltip-${Math.random().toString(36).slice(2, 8)}`, g.hidden = !0, g.style.position = "fixed", g.style.opacity = "0", g.textContent = i;
			let v = document.createElement("span");
			v.className = "kt-tooltip__arrow", v.setAttribute("aria-hidden", "true"), g.appendChild(v), document.body.appendChild(g);
			let y = e.getAttribute("aria-describedby");
			e.setAttribute("aria-describedby", y ? `${y} ${g.id}` : g.id);
			let b = !1, x = null, S = null, C = null, w = () => {
				let t = e.getBoundingClientRect(), n = g.offsetWidth, r = g.offsetHeight, i = window.innerWidth, o = window.innerHeight, s = a;
				s === "top" && t.top - r - l < 0 ? s = "bottom" : s === "bottom" && t.bottom + r + l > o ? s = "top" : s === "left" && t.left - n - l < 0 ? s = "right" : s === "right" && t.right + n + l > i && (s = "left");
				let c, u;
				s === "top" ? (c = t.left + t.width / 2 - n / 2, u = t.top - r - l) : s === "bottom" ? (c = t.left + t.width / 2 - n / 2, u = t.bottom + l) : s === "left" ? (c = t.left - n - l, u = t.top + t.height / 2 - r / 2) : (c = t.right + l, u = t.top + t.height / 2 - r / 2), c = _(c, 4, i - n - 4), u = _(u, 4, o - r - 4), g.dataset.placement = s, g.style.left = `${Math.round(c)}px`, g.style.top = `${Math.round(u)}px`;
			}, T = () => {
				clearTimeout(S), !b && (b = !0, g.hidden = !1, w(), C && C.cancel(), g.style.opacity = "1", !n && f !== "none" && (C = g.animate([m, h], {
					duration: u * 1e3,
					easing: "ease"
				})), window.addEventListener("scroll", w, !0), window.addEventListener("resize", w));
			}, E = () => {
				if (clearTimeout(x), !b) return;
				b = !1;
				let e = () => {
					b || (g.hidden = !0, g.style.opacity = "0");
				};
				C && C.cancel(), g.style.opacity = "0", !n && f !== "none" ? (C = g.animate([h, m], {
					duration: u * 700,
					easing: "ease"
				}), C.onfinish = e, C.oncancel = e) : e(), window.removeEventListener("scroll", w, !0), window.removeEventListener("resize", w);
			}, D = () => {
				clearTimeout(S), x = setTimeout(T, s);
			}, O = () => {
				clearTimeout(x), S = setTimeout(E, c);
			}, k = () => D(), A = () => O(), j = () => T(), M = () => E(), N = () => {
				b ? E() : T();
			}, P = (e) => {
				e.key === "Escape" && b && E();
			}, F = (t) => {
				b && !e.contains(t.target) && !g.contains(t.target) && E();
			};
			return o === "hover" ? (e.addEventListener("pointerenter", k), e.addEventListener("pointerleave", A), e.addEventListener("focus", j), e.addEventListener("blur", M), d && (g.style.pointerEvents = "auto", g.addEventListener("pointerenter", () => clearTimeout(S)), g.addEventListener("pointerleave", O))) : o === "focus" ? (e.addEventListener("focus", j), e.addEventListener("blur", M)) : o === "click" && (e.addEventListener("click", N), document.addEventListener("pointerdown", F, !0)), e.addEventListener("keydown", P), {
				el: e,
				type: "tooltip",
				show: T,
				hide: E,
				pause() {},
				resume() {},
				destroy() {
					clearTimeout(x), clearTimeout(S), window.removeEventListener("scroll", w, !0), window.removeEventListener("resize", w), e.removeEventListener("pointerenter", k), e.removeEventListener("pointerleave", A), e.removeEventListener("focus", j), e.removeEventListener("blur", M), e.removeEventListener("click", N), document.removeEventListener("pointerdown", F, !0), e.removeEventListener("keydown", P), g.remove();
					let t = (e.getAttribute("aria-describedby") || "").split(/\s+/).filter((e) => e && e !== g.id).join(" ");
					t ? e.setAttribute("aria-describedby", t) : e.removeAttribute("aria-describedby"), r != null && e.setAttribute("title", r);
				}
			};
		},
		reduced(e, t) {
			return this.create(e, t);
		}
	},
	switch: {
		create(e, t = {}) {
			let n = p().reducedMotion, r = Math.max(14, Number(t.size ?? 24)), i = t.onColor || "var(--kt-switch-on, #ff5b1c)", a = t.offColor || "var(--kt-switch-off, color-mix(in srgb, currentColor 26%, transparent))", o = t.thumbColor || "var(--kt-switch-thumb, #fff)", s = Math.max(0, Number(t.duration ?? .22)), c = e.tagName === "INPUT" ? null : e.querySelector("input[type=\"checkbox\"], input[type=\"radio\"]");
			c && (c.style.position = "absolute", c.style.opacity = "0", c.style.pointerEvents = "none", c.style.width = "0", c.style.height = "0", c.tabIndex = -1);
			let l = t.checked === !0 || (c ? c.checked : e.getAttribute("aria-checked") === "true" || e.hasAttribute("checked")), u = e.getAttribute("style"), d = Math.round(r * .16), f = Math.round(r * .8);
			e.classList.add("kt-switch"), e.setAttribute("role", "switch"), e.tagName !== "BUTTON" && e.tagName !== "INPUT" && !e.hasAttribute("tabindex") && (e.tabIndex = 0), e.style.display = "inline-flex", e.style.alignItems = "center", e.style.boxSizing = "content-box", e.style.width = `${r + f}px`, e.style.height = `${r}px`, e.style.padding = `${d}px`, e.style.borderRadius = `${r}px`, e.style.border = "0", e.style.cursor = "pointer", e.style.transition = `background-color ${s}s ease`, e.style.verticalAlign = "middle";
			let m = document.createElement("span");
			m.className = "kt-switch__thumb", m.setAttribute("aria-hidden", "true"), m.style.cssText = `width:${r}px;height:${r}px;border-radius:50%;background:${o};box-shadow:0 1px 3px rgba(0,0,0,.3);transition:transform ${n ? 0 : s}s cubic-bezier(.22,.8,.3,1);will-change:transform;flex:0 0 auto;`, e.appendChild(m);
			let h = () => {
				e.setAttribute("aria-checked", l ? "true" : "false"), e.classList.toggle("kt-on", l), e.style.backgroundColor = l ? i : a, m.style.transform = l ? `translateX(${f}px)` : "translateX(0)", c && c.checked !== l && (c.checked = l);
			}, g = () => {
				if (l = !l, h(), c) try {
					c.dispatchEvent(new Event("change", { bubbles: !0 })), c.dispatchEvent(new Event("input", { bubbles: !0 }));
				} catch {}
				t.onChange?.(l, e);
				try {
					e.dispatchEvent(new CustomEvent("kt-switch-change", {
						bubbles: !0,
						detail: { checked: l }
					}));
				} catch {}
			}, _ = (e) => {
				e.target !== c && (e.preventDefault(), g());
			}, v = (e) => {
				(e.key === " " || e.key === "Enter") && (e.preventDefault(), g());
			}, y = () => {
				c && c.checked !== l && (l = c.checked, h());
			};
			return e.addEventListener("click", _), e.addEventListener("keydown", v), c && c.addEventListener("change", y), h(), {
				el: e,
				type: "switch",
				toggle: g,
				set(e) {
					l = !!e, h();
				},
				get checked() {
					return l;
				},
				pause() {},
				resume() {},
				destroy() {
					e.removeEventListener("click", _), e.removeEventListener("keydown", v), c && (c.removeEventListener("change", y), c.style.position = "", c.style.opacity = "", c.style.pointerEvents = "", c.style.width = "", c.style.height = "", c.removeAttribute("tabindex")), m.remove(), e.classList.remove("kt-switch", "kt-on"), e.removeAttribute("role"), e.removeAttribute("aria-checked"), u == null ? e.removeAttribute("style") : e.setAttribute("style", u);
				}
			};
		},
		reduced(e, t) {
			return this.create(e, t);
		}
	},
	flip: {
		create(e, t = {}) {
			let n = p().reducedMotion, r = Math.max(0, Number(t.duration ?? .4)), i = t.ease || "cubic-bezier(.22,.8,.3,1)", a = Math.max(0, Number(t.stagger ?? 0)), o = t.item || null, s = () => o ? Array.from(e.querySelectorAll(o)) : Array.from(e.children), c = /* @__PURE__ */ new WeakMap(), l = /* @__PURE__ */ new WeakSet(), u = () => {
				c = /* @__PURE__ */ new WeakMap(), l = /* @__PURE__ */ new WeakSet(), s().forEach((e) => {
					c.set(e, e.getBoundingClientRect()), l.add(e);
				});
			}, d = () => {
				if (n || r === 0) {
					u();
					return;
				}
				let e = 0;
				s().forEach((t) => {
					let n = c.get(t), o = t.getBoundingClientRect();
					if (!n || !l.has(t)) {
						t.animate([{
							opacity: 0,
							transform: "scale(.92)"
						}, {
							opacity: 1,
							transform: "none"
						}], {
							duration: r * 1e3,
							easing: i,
							delay: e * a * 1e3
						}), e += 1;
						return;
					}
					let s = n.left - o.left, u = n.top - o.top, d = o.width ? n.width / o.width : 1, f = o.height ? n.height / o.height : 1;
					Math.abs(s) < 1 && Math.abs(u) < 1 && Math.abs(d - 1) < .01 && Math.abs(f - 1) < .01 || (t.animate([{ transform: `translate(${s}px, ${u}px) scale(${d}, ${f})` }, { transform: "none" }], {
						duration: r * 1e3,
						easing: i,
						delay: e * a * 1e3
					}), e += 1);
				}), u();
			}, f = null;
			return t.watch !== !1 && typeof MutationObserver < "u" && (f = new MutationObserver(() => d()), f.observe(e, {
				childList: !0,
				subtree: !1
			})), u(), {
				el: e,
				type: "flip",
				record: u,
				play: d,
				pause() {
					f?.disconnect();
				},
				resume() {
					f && t.watch !== !1 && f.observe(e, {
						childList: !0,
						subtree: !1
					});
				},
				destroy() {
					f?.disconnect(), f = null;
				}
			};
		},
		reduced(e, t) {
			return this.create(e, t);
		}
	},
	scrollShadows: {
		create(e, t = {}) {
			let n = t.axis === "horizontal" ? "horizontal" : "vertical", r = Math.max(4, Number(t.size ?? 44)), i = t.mode === "mask" ? "mask" : "shadow", a = n === "horizontal";
			if (a ? getComputedStyle(e).overflowX === "visible" && (e.style.overflowX = "auto") : getComputedStyle(e).overflowY === "visible" && (e.style.overflowY = "auto"), i === "mask") {
				let t = E(e, [
					"maskImage",
					"webkitMaskImage",
					"overflowX",
					"overflowY"
				]), n = a ? "to right" : "to bottom", i = !1, o = () => {
					i = !1;
					let t = a ? e.scrollLeft : e.scrollTop, o = a ? e.scrollWidth - e.clientWidth : e.scrollHeight - e.clientHeight, s = Math.max(0, Math.min(r, t)), c = Math.max(0, Math.min(r, o - t)), l = `linear-gradient(${n}, transparent 0, #000 ${s}px, #000 calc(100% - ${c}px), transparent 100%)`;
					e.style.maskImage = l, e.style.webkitMaskImage = l;
				}, s = () => {
					i || (i = !0, requestAnimationFrame(o));
				};
				return o(), e.addEventListener("scroll", s, { passive: !0 }), window.addEventListener("resize", s, { passive: !0 }), {
					el: e,
					type: "scrollShadows",
					pause() {},
					resume() {},
					destroy() {
						e.removeEventListener("scroll", s), window.removeEventListener("resize", s), t();
					}
				};
			}
			let o = Math.round(r * .34), s = typeof getComputedStyle < "u" ? getComputedStyle(e).backgroundColor : "", c = s && s !== "rgba(0, 0, 0, 0)" && s !== "transparent", l = t.color || (c ? s : "Canvas"), u = `var(--kt-scroll-shadow, ${t.shadow || "rgba(0, 0, 0, 0.24)"})`, d = Math.max(0, Math.min(1, Number(t.opacity ?? 1))), f = d < 1 ? `color-mix(in srgb, ${u} ${Math.round(d * 100)}%, transparent)` : u, p = t.shape === "linear", m = E(e, [
				"backgroundImage",
				"backgroundRepeat",
				"backgroundSize",
				"backgroundPosition",
				"backgroundAttachment",
				"backgroundColor",
				"overflowX",
				"overflowY"
			]), h = a ? [`linear-gradient(to right, ${l} 30%, rgba(0,0,0,0))`, `linear-gradient(to left, ${l} 30%, rgba(0,0,0,0))`] : [`linear-gradient(${l} 30%, rgba(0,0,0,0))`, `linear-gradient(rgba(0,0,0,0), ${l} 70%)`], g = p ? a ? [`linear-gradient(to right, ${f}, rgba(0,0,0,0))`, `linear-gradient(to left, ${f}, rgba(0,0,0,0))`] : [`linear-gradient(to bottom, ${f}, rgba(0,0,0,0))`, `linear-gradient(to top, ${f}, rgba(0,0,0,0))`] : a ? [`radial-gradient(farthest-side at 0 50%, ${f}, rgba(0,0,0,0))`, `radial-gradient(farthest-side at 100% 50%, ${f}, rgba(0,0,0,0))`] : [`radial-gradient(farthest-side at 50% 0, ${f}, rgba(0,0,0,0))`, `radial-gradient(farthest-side at 50% 100%, ${f}, rgba(0,0,0,0))`];
			return e.style.backgroundImage = [...h, ...g].join(", "), e.style.backgroundRepeat = "no-repeat", e.style.backgroundColor = l, a ? (e.style.backgroundSize = `${r}px 100%, ${r}px 100%, ${o}px 100%, ${o}px 100%`, e.style.backgroundAttachment = "local, local, scroll, scroll", e.style.backgroundPosition = "left center, right center, left center, right center") : (e.style.backgroundSize = `100% ${r}px, 100% ${r}px, 100% ${o}px, 100% ${o}px`, e.style.backgroundAttachment = "local, local, scroll, scroll", e.style.backgroundPosition = "center top, center bottom, center top, center bottom"), {
				el: e,
				type: "scrollShadows",
				pause() {},
				resume() {},
				destroy() {
					m();
				}
			};
		},
		reduced(e, t) {
			return this.create(e, t);
		}
	},
	stickyHeader: { create(e, t = {}) {
		let n = Math.max(0, Number(t.offset ?? 8)), r = Math.max(1, Number(t.distance ?? 120)), i = t.shrink !== !1, a = t.shadow !== !1, o = t.activeClass || "kt-stuck";
		e.classList.add("kt-sticky-header"), i && e.classList.add("kt-sh-shrink"), a && e.classList.add("kt-sh-shadow");
		let s = ((e) => {
			let t = e.parentElement;
			for (; t && t !== document.body && t !== document.documentElement;) {
				let e = getComputedStyle(t).overflowY;
				if ((e === "auto" || e === "scroll") && t.scrollHeight > t.clientHeight + 1) return t;
				t = t.parentElement;
			}
			return window;
		})(e), c = () => s === window ? window.scrollY || document.documentElement.scrollTop || 0 : s.scrollTop, l = !1, u = !1, d = () => {
			u = !1;
			let i = c(), a = _(i / r, 0, 1);
			e.style.setProperty("--kt-header-progress", a.toFixed(4));
			let s = i > n;
			s !== l && (l = s, e.classList.toggle(o, l), t.onChange?.(l, a, e));
		}, f = () => {
			u || (u = !0, requestAnimationFrame(d));
		};
		return d(), s.addEventListener("scroll", f, { passive: !0 }), window.addEventListener("resize", f, { passive: !0 }), {
			el: e,
			type: "stickyHeader",
			pause() {
				s.removeEventListener("scroll", f);
			},
			resume() {
				s.addEventListener("scroll", f, { passive: !0 });
			},
			destroy() {
				s.removeEventListener("scroll", f), window.removeEventListener("resize", f), e.classList.remove("kt-sticky-header", "kt-sh-shrink", "kt-sh-shadow", o), e.style.removeProperty("--kt-header-progress");
			}
		};
	} },
	horizontalScroll: {
		create(e, t = {}) {
			let n = t.height || "100vh", r = t.smooth === !0 ? .12 : typeof t.smooth == "number" ? _(t.smooth, .02, 1) : 0;
			if (!e.parentNode) return null;
			let i = Array.from(e.childNodes), a = e.getAttribute("style"), o = e.style.position, s = document.createElement("div");
			s.className = "kt-hscroll-viewport";
			let c = document.createElement("div");
			c.className = "kt-hscroll-track", i.forEach((e) => c.appendChild(e)), s.appendChild(c), e.appendChild(s), e.classList.add("kt-hscroll"), s.style.cssText = `position:sticky;top:0;height:${n};overflow:hidden;display:flex;align-items:center;`, c.style.cssText = "display:flex;flex:0 0 auto;will-change:transform;";
			let l = 0, u = 0, d = 0, f = null, p = !1, m = () => {
				let t = s.clientWidth;
				l = Math.max(0, c.scrollWidth - t), e.style.height = `calc(${n} + ${l}px)`;
			}, h = () => {
				let t = e.getBoundingClientRect(), n = s.clientHeight, r = e.offsetHeight - n, i = _(-t.top, 0, r);
				u = (r > 0 ? i / r : 0) * l;
			}, v = () => {
				d = r ? g(d, u, r) : u, c.style.transform = `translate3d(${-d}px,0,0)`, r && Math.abs(d - u) > .2 ? f = requestAnimationFrame(v) : (d = u, c.style.transform = `translate3d(${-d}px,0,0)`, f = null);
			}, y = () => {
				p && (h(), r ? f ??= requestAnimationFrame(v) : v());
			}, b = !1, x = () => {
				b || (b = !0, requestAnimationFrame(() => {
					b = !1, y();
				}));
			}, S = () => {
				m(), y();
			};
			e.style.position = o || "relative", p = !0, m(), y(), window.addEventListener("scroll", x, { passive: !0 }), window.addEventListener("resize", S, { passive: !0 });
			let C = typeof ResizeObserver < "u" ? new ResizeObserver(S) : null;
			return C?.observe(c), {
				el: e,
				type: "horizontalScroll",
				pause() {
					p = !1;
				},
				resume() {
					p = !0, y();
				},
				destroy: () => {
					p = !1, f != null && cancelAnimationFrame(f), window.removeEventListener("scroll", x), window.removeEventListener("resize", S), C?.disconnect(), Array.from(c.childNodes).forEach((t) => e.insertBefore(t, s)), s.remove(), e.classList.remove("kt-hscroll"), a == null ? e.removeAttribute("style") : e.setAttribute("style", a);
				}
			};
		},
		reduced(e) {
			return e.style.overflowX = "auto", {
				el: e,
				type: "horizontalScroll",
				pause() {},
				resume() {},
				destroy() {
					e.style.overflowX = "";
				}
			};
		}
	}
};
Object.entries(en).forEach(([e, t]) => Z.register(e, t));
var $ = (e) => (t, n) => Z[e](t, n), tn = $("parallax"), nn = $("mouseParallax"), rn = $("reveal"), an = $("counter"), on = $("lazy"), sn = $("textSplit"), cn = $("blurText"), ln = $("shuffle"), un = $("typewriter"), dn = $("textReveal"), fn = $("textTransition"), pn = $("magnetic"), mn = $("marquee"), hn = $("overflowText"), gn = $("loader"), _n = $("tilt"), vn = $("cursor"), yn = $("textFill"), bn = $("stickyStack"), xn = $("scrollVelocity"), Sn = $("progress"), Cn = $("slider"), wn = $("ambientMedia"), Tn = $("pageReveal"), En = $("glitch"), Dn = $("cardGlow"), On = $("lightbox"), kn = $("pageTransition"), An = $("vibrate"), jn = $("ripple"), Mn = $("cssScroll"), Nn = $("scrollSequence"), Pn = $("brushReveal"), Fn = $("fullpage"), In = $("confetti"), Ln = $("accordion"), Rn = $("hold"), zn = $("megaMenu"), Bn = $("toast"), Vn = $("bottomSheet"), Hn = $("tabs"), Un = $("radial"), Wn = $("coverReveal"), Gn = $("gesture"), Kn = $("drag"), qn = $("tooltip"), Jn = $("switch"), Yn = $("flip"), Xn = $("scrollShadows"), Zn = $("stickyHeader"), Qn = $("horizontalScroll"), $n = Z;
//#endregion
export { Ln as accordion, wn as ambientMedia, cn as blurText, Vn as bottomSheet, Pn as brushReveal, Dn as cardGlow, In as confetti, an as counter, Wn as coverReveal, Mn as cssScroll, vn as cursor, $n as default, Kn as drag, Yn as flip, Fn as fullpage, Gn as gesture, En as glitch, Rn as hold, Qn as horizontalScroll, on as lazy, On as lightbox, gn as loader, pn as magnetic, mn as marquee, zn as megaMenu, en as modules, nn as mouseParallax, hn as overflowText, Tn as pageReveal, kn as pageTransition, tn as parallax, Sn as progress, Un as radial, rn as reveal, jn as ripple, Nn as scrollSequence, Xn as scrollShadows, xn as scrollVelocity, ln as shuffle, Cn as slider, Zn as stickyHeader, bn as stickyStack, Jn as switch, Hn as tabs, yn as textFill, dn as textReveal, sn as textSplit, fn as textTransition, _n as tilt, Bn as toast, qn as tooltip, un as typewriter, An as vibrate };
