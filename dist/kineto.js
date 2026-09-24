//#region src/runtime.js
var e = typeof window < "u" ? window : void 0, t = (e) => e?.default || e?.gsap || e, n = (e) => Promise.resolve().then(e), r = {
	gsap: "https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/gsap.min.js",
	scrollTrigger: "https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/ScrollTrigger.min.js",
	lenis: "https://cdn.jsdelivr.net/npm/lenis@1.3.26/dist/lenis.min.js",
	gsapIntegrity: "sha384-XmJ9SoHtVOHoQUcKvFAzVXwdkKo1Ie3bhmSoIAkcdsHGaIrVJIkmozyq0FJeb/Ly",
	scrollTriggerIntegrity: "sha384-wl5TeDVvOWt30Pbf8aSo2ZrzsOjddu3avOBvHe+p+OhJt9gP6w9YXmDkN5DK2/dF",
	lenisIntegrity: "sha384-jqpi9VmOdhyLoLURgjCn7EpnG9BbnHW57ibIZoeaIU+erWDH3k8fQQg0xH2ySjnw"
}, i = e && e.gsap ? t(e.gsap) : null, a = e && e.ScrollTrigger ? t(e.ScrollTrigger) : null, o = null, s = null;
function c(t = {}) {
	let n = "gsap" in t && t.gsap !== r.gsap || "scrollTrigger" in t && t.scrollTrigger !== r.scrollTrigger, i = "lenis" in t && t.lenis !== r.lenis;
	n && ("gsap" in t && !("gsapIntegrity" in t) && (r.gsapIntegrity = ""), "scrollTrigger" in t && !("scrollTriggerIntegrity" in t) && (r.scrollTriggerIntegrity = "")), i && !("lenisIntegrity" in t) && (r.lenisIntegrity = ""), Object.assign(r, t), n && !m() && (o = null), i && !(e && e.Lenis) && (s = null);
}
function l() {
	return { ...r };
}
function u() {
	if (i && a && typeof i.registerPlugin == "function") try {
		i.registerPlugin(a);
	} catch {}
}
function d({ gsap: e, ScrollTrigger: n } = {}) {
	e && (i = t(e)), n && (a = t(n)), u();
}
function f() {
	return i || (e && e.gsap ? (i = t(e.gsap), e.ScrollTrigger && !a && (a = t(e.ScrollTrigger)), u(), i) : null);
}
function p() {
	return a || (e && e.ScrollTrigger ? (a = t(e.ScrollTrigger), a) : null);
}
function m() {
	return !!(f()?.registerPlugin && p());
}
function h(e, t, n = 12e3) {
	return new Promise((r, i) => {
		if (!e) {
			i(/* @__PURE__ */ Error("Kineto: engine disabled"));
			return;
		}
		if (typeof document > "u") {
			i(/* @__PURE__ */ Error("Kineto: no document to load " + e));
			return;
		}
		let a = Array.from(document.getElementsByTagName("script")).find((n) => n.src === e && n.dataset.ktFailed !== "1" && (!t || n.integrity === t));
		if (a) {
			if (a.dataset.ktLoaded === "1") {
				r();
				return;
			}
			let t = null, o = () => {
				clearTimeout(t), a.removeEventListener("load", s), a.removeEventListener("error", c);
			}, s = () => {
				o(), a.dataset.ktLoaded = "1", r();
			}, c = () => {
				o(), a.dataset.ktFailed = "1", i(/* @__PURE__ */ Error("Kineto: load failed " + e));
			};
			a.addEventListener("load", s, { once: !0 }), a.addEventListener("error", c, { once: !0 }), t = setTimeout(() => {
				o(), i(/* @__PURE__ */ Error("Kineto: load timeout " + e));
			}, n);
			return;
		}
		let o = document.createElement("script");
		o.src = e, t && (o.integrity = t, o.crossOrigin = "anonymous"), o.async = !0, o.dataset.ktEngine = "";
		let s = null, c = () => {
			clearTimeout(s), o.removeEventListener("load", l), o.removeEventListener("error", u);
		}, l = () => {
			c(), o.dataset.ktLoaded = "1", r();
		}, u = () => {
			c(), o.remove(), i(/* @__PURE__ */ Error("Kineto: load failed " + e));
		};
		o.addEventListener("load", l, { once: !0 }), o.addEventListener("error", u, { once: !0 }), s = setTimeout(() => {
			c(), o.remove(), i(/* @__PURE__ */ Error("Kineto: load timeout " + e));
		}, n), (document.head || document.documentElement).appendChild(o);
	});
}
function g() {
	return m() ? (u(), Promise.resolve(f())) : o || (o = (async () => {
		try {
			e && e.gsap || await h(r.gsap, r.gsapIntegrity), e && e.ScrollTrigger || await h(r.scrollTrigger, r.scrollTriggerIntegrity), d({
				gsap: e && e.gsap,
				ScrollTrigger: e && e.ScrollTrigger
			});
		} catch {}
		let t = f();
		return m() || n(() => {
			o = null;
		}), t;
	})(), o);
}
function _() {
	return e && e.Lenis ? Promise.resolve(t(e.Lenis)) : s || (s = (async () => {
		try {
			await h(r.lenis, r.lenisIntegrity);
		} catch {
			return n(() => {
				s = null;
			}), null;
		}
		let i = e && e.Lenis ? t(e.Lenis) : null;
		return i || n(() => {
			s = null;
		}), i;
	})(), s);
}
//#endregion
//#region src/easings.js
var v = Math.PI * 2, y = (e) => e < 0 ? 0 : e > 1 ? 1 : e, b = {
	"sine-in": [
		.12,
		0,
		.39,
		0
	],
	"sine-out": [
		.61,
		1,
		.88,
		1
	],
	"sine-in-out": [
		.37,
		0,
		.63,
		1
	],
	"quad-in": [
		.11,
		0,
		.5,
		0
	],
	"quad-out": [
		.5,
		1,
		.89,
		1
	],
	"quad-in-out": [
		.45,
		0,
		.55,
		1
	],
	"cubic-in": [
		.32,
		0,
		.67,
		0
	],
	"cubic-out": [
		.33,
		1,
		.68,
		1
	],
	"cubic-in-out": [
		.65,
		0,
		.35,
		1
	],
	"quart-in": [
		.5,
		0,
		.75,
		0
	],
	"quart-out": [
		.25,
		1,
		.5,
		1
	],
	"quart-in-out": [
		.76,
		0,
		.24,
		1
	],
	"quint-in": [
		.64,
		0,
		.78,
		0
	],
	"quint-out": [
		.22,
		1,
		.36,
		1
	],
	"quint-in-out": [
		.83,
		0,
		.17,
		1
	],
	"expo-in": [
		.7,
		0,
		.84,
		0
	],
	"expo-out": [
		.16,
		1,
		.3,
		1
	],
	"expo-in-out": [
		.87,
		0,
		.13,
		1
	],
	"circ-in": [
		.55,
		0,
		1,
		.45
	],
	"circ-out": [
		0,
		.55,
		.45,
		1
	],
	"circ-in-out": [
		.85,
		0,
		.15,
		1
	],
	"back-in": [
		.36,
		0,
		.66,
		-.56
	],
	"back-out": [
		.34,
		1.56,
		.64,
		1
	],
	"back-in-out": [
		.68,
		-.6,
		.32,
		1.6
	]
}, x = [
	"linear",
	"ease",
	"ease-in",
	"ease-out",
	"ease-in-out"
], S = (e) => e === 0 ? 0 : e === 1 ? 1 : 2 ** (-10 * e) * Math.sin((e * 10 - .75) * (v / 3)) + 1, C = (e) => e === 0 ? 0 : e === 1 ? 1 : -(2 ** (10 * e - 10)) * Math.sin((e * 10 - 10.75) * (v / 3)), w = (e) => e === 0 ? 0 : e === 1 ? 1 : e < .5 ? -(2 ** (20 * e - 10) * Math.sin((20 * e - 11.125) * (v / 4.5))) / 2 : 2 ** (-20 * e + 10) * Math.sin((20 * e - 11.125) * (v / 4.5)) / 2 + 1, T = (e) => {
	let t = 7.5625, n = 2.75;
	return e < 1 / n ? t * e * e : e < 2 / n ? t * (e -= 1.5 / n) * e + .75 : e < 2.5 / n ? t * (e -= 2.25 / n) * e + .9375 : t * (e -= 2.625 / n) * e + .984375;
}, E = {
	"elastic-in": C,
	"elastic-out": S,
	"elastic-in-out": w,
	"bounce-in": (e) => 1 - T(1 - e),
	"bounce-out": T,
	"bounce-in-out": (e) => e < .5 ? (1 - T(1 - 2 * e)) / 2 : (1 + T(2 * e - 1)) / 2
};
function D({ stiffness: e = 170, damping: t = 26, mass: n = 1, velocity: r = 0 } = {}) {
	let i = Math.max(1, e), a = Math.max(0, t), o = Math.max(.01, n), s = r, c = Math.sqrt(i / o), l = a / (2 * Math.sqrt(i * o)), u = l < 1 ? l * c : c, d = Math.min(10, Math.max(.15, -Math.log(.005) / (u || 1))), f = (e) => {
		let t = e * d;
		if (l < 1) {
			let e = c * Math.sqrt(1 - l * l), n = (l * c + -s) / e;
			return 1 - Math.exp(-l * c * t) * (1 * Math.cos(e * t) + n * Math.sin(e * t));
		}
		if (l === 1) return 1 - Math.exp(-c * t) * (1 + (c - s) * t);
		let n = c * Math.sqrt(l * l - 1), r = (l * c - s) / n;
		return 1 - Math.exp(-l * c * t) * (1 * Math.cosh(n * t) + r * Math.sinh(n * t));
	};
	return (e) => e <= 0 ? 0 : e >= 1 ? 1 : f(e);
}
function O(e, t = 40) {
	let n = [];
	for (let r = 0; r <= t; r++) {
		let i = r / t;
		n.push(Number(e(i).toFixed(5)));
	}
	return `linear(${n.join(",")})`;
}
function k(e) {
	return Array.isArray(e) && e.length === 4 && e.every((e) => typeof e == "number" && Number.isFinite(e)) && e[0] >= 0 && e[0] <= 1 && e[2] >= 0 && e[2] <= 1;
}
var A = (e) => `cubic-bezier(${e.join(",")})`, j = {
	keywords: x,
	families: {
		Sine: "cubic-bezier",
		Quad: "cubic-bezier",
		Cubic: "cubic-bezier",
		Quart: "cubic-bezier",
		Quint: "cubic-bezier",
		Expo: "cubic-bezier",
		Circ: "cubic-bezier",
		Back: "cubic-bezier",
		Elastic: "linear",
		Bounce: "linear",
		Spring: "spring",
		Steps: "steps"
	},
	tokens: [
		...x,
		...Object.keys(b),
		...Object.keys(E),
		"spring",
		"steps"
	]
};
function M(e) {
	if (e == null) return "ease";
	if (typeof e == "object") return e.spring ? O(D(e.spring)) : Array.isArray(e) && k(e) ? A(e) : "ease";
	let t = String(e).trim(), n = t.toLowerCase();
	return x.includes(n) ? n : b[n] ? A(b[n]) : E[n] ? O(E[n]) : n === "spring" ? O(D()) : (/^(cubic-bezier|linear|steps)\(/i.test(t), t);
}
var N = {
	sine: "sine",
	quad: "power1",
	cubic: "power2",
	quart: "power3",
	quint: "power4",
	expo: "expo",
	circ: "circ",
	back: "back",
	elastic: "elastic",
	bounce: "bounce"
};
function P(e) {
	if (e == null) return;
	let t = String(e).trim(), n = t.toLowerCase();
	if (n === "linear" || n === "none") return "none";
	if (n === "ease") return "power1.inOut";
	if (n === "ease-in") return "power1.in";
	if (n === "ease-out") return "power1.out";
	if (n === "ease-in-out") return "power1.inOut";
	if (n === "spring") return "elastic.out(1,0.5)";
	let r = n.match(/^([a-z]+)-(in-out|in|out)$/);
	if (r && N[r[1]]) {
		let e = r[2] === "in-out" ? "inOut" : r[2];
		return `${N[r[1]]}.${e}`;
	}
	return t;
}
function F(e) {
	if (e && typeof e == "object" && e.spring) return D(e.spring);
	let t = String(e || "").toLowerCase();
	if (E[t]) return E[t];
	if (t === "spring") return D();
	if (b[t]) {
		let e = b[t];
		return I(e[0], e[1], e[2], e[3]);
	}
	return (e) => y(e);
}
function I(e, t, n, r) {
	let i = 3 * e, a = 3 * (n - e) - i, o = 1 - i - a, s = 3 * t, c = 3 * (r - t) - s, l = 1 - s - c, u = (e) => ((o * e + a) * e + i) * e, d = (e) => ((l * e + c) * e + s) * e, f = (e) => (3 * o * e + 2 * a) * e + i;
	return (e) => {
		let t = e;
		for (let n = 0; n < 8; n++) {
			let n = f(t) || 1e-6;
			t -= (u(t) - e) / n;
		}
		return d(y(t));
	};
}
//#endregion
//#region src/utils.js
var L = M, R = P, z = { spring: !1 };
function B(e = {}) {
	Object.assign(z, e);
}
function V() {
	if (typeof window > "u") return {
		ssr: !0,
		reducedMotion: !1,
		perf: "high",
		touch: !1,
		hasGyro: !1,
		canVibrate: !1,
		saveData: !1
	};
	let e = typeof navigator < "u" && navigator ? navigator : {}, t = e.connection || e.mozConnection || e.webkitConnection, n = typeof window.matchMedia == "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches, r = !!t?.saveData, i = /(^|-)2g|slow-2g/.test(t?.effectiveType || ""), a = (e.deviceMemory || 8) < 4, o = (e.hardwareConcurrency || 8) < 4;
	return {
		ssr: !1,
		reducedMotion: n,
		perf: r || i ? "low" : a || o ? "mid" : "high",
		saveData: r,
		touch: "ontouchstart" in window || (e.maxTouchPoints || 0) > 0,
		hasGyro: typeof DeviceOrientationEvent < "u",
		canVibrate: typeof e.vibrate == "function"
	};
}
var H = null;
function U() {
	return typeof DeviceOrientationEvent > "u" ? Promise.resolve(!1) : typeof DeviceOrientationEvent.requestPermission == "function" ? H || (H = new Promise((e) => {
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
	}), H) : Promise.resolve(!0);
}
function W(e, t, n) {
	return e + (t - e) * n;
}
function G(e, t, n) {
	return Math.min(n, Math.max(t, e));
}
function K(e, t = 0, n = -Infinity, r = Infinity) {
	if (typeof e == "string" && e.trim() === "") return t;
	let i = Number(e);
	return Number.isFinite(i) ? G(i, n, r) : t;
}
function ee(e, t) {
	let n = t && typeof t == "object" && !Array.isArray(t) ? t : {};
	return (t, r) => {
		let i = n[t], a = typeof i == "string" && i !== "" ? i : e[t];
		return a == null ? "" : r ? String(a).replace(/\{(\w+)\}/g, (e, t) => Object.prototype.hasOwnProperty.call(r, t) ? String(r[t]) : e) : String(a);
	};
}
function q(e) {
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
function J(e) {
	return e.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
}
function Y(e, t = typeof document < "u" ? document : null) {
	return !e || !t ? [] : typeof e == "string" ? Array.from(t.querySelectorAll(e)) : typeof window < "u" && e === window || typeof document < "u" && e === document || typeof Element < "u" && e instanceof Element ? [e] : typeof NodeList < "u" && e instanceof NodeList || typeof HTMLCollection < "u" && e instanceof HTMLCollection || Array.isArray(e) || (typeof e == "object" || typeof e == "function") && typeof Symbol < "u" && typeof e[Symbol.iterator] == "function" ? Array.from(e).filter(Boolean) : [];
}
var X = /* @__PURE__ */ new WeakMap();
function te(e, t = {}) {
	let n = e?.ownerDocument;
	if (!e || !n) return {
		update() {},
		destroy() {}
	};
	let r = null;
	if (typeof t.progressScope == "string") try {
		r = e.closest(t.progressScope) || n.querySelector(t.progressScope);
	} catch {}
	else t.progressScope?.querySelectorAll && (r = t.progressScope);
	r ||= e.closest("[data-kt-progress-scope]") || e;
	let i = new Set(r.querySelectorAll?.("[data-kt-progress-output]") || []), a = t.progressOutput;
	if (typeof a == "string") {
		let e = [];
		try {
			e = [...r.querySelectorAll?.(a) || []];
		} catch {}
		if (e.forEach((e) => i.add(e)), !e.length) try {
			n.querySelectorAll(a).forEach((e) => i.add(e));
		} catch {}
	} else if (a?.nodeType === 1) i.add(a);
	else if (a && typeof a[Symbol.iterator] == "function") for (let e of a) e?.nodeType === 1 && i.add(e);
	let o = [...i].map((e) => {
		let t = X.get(e);
		return t || (t = {
			owners: 0,
			text: e.textContent,
			value: "value" in e ? e.value : void 0,
			dataValue: e.getAttribute("data-kt-progress-value"),
			state: e.getAttribute("data-kt-progress-state"),
			progressVar: e.style.getPropertyValue("--kt-progress"),
			percentVar: e.style.getPropertyValue("--kt-percent")
		}, X.set(e, t)), t.owners += 1, e;
	}), s = !1;
	return {
		update(e, n = "running") {
			let r = G(Number(e) || 0, 0, 100), a = Math.round(r);
			i.forEach((e) => {
				let i = e.dataset.ktProgressTemplate || t.progressTemplate || "{value}%", o = String(i).split("{value}").join(String(a)).split("{progress}").join(String(a)).split("{state}").join(String(n));
				"value" in e && /^(?:INPUT|OUTPUT|PROGRESS)$/.test(e.tagName) ? e.value = e.tagName === "PROGRESS" ? r : o : e.textContent = o, e.dataset.ktProgressValue = String(a), e.dataset.ktProgressState = String(n), e.style.setProperty("--kt-progress", (r / 100).toFixed(4)), e.style.setProperty("--kt-percent", String(a));
			});
		},
		destroy() {
			s || (s = !0, o.forEach((e) => {
				let t = X.get(e);
				!t || --t.owners > 0 || (t.value === void 0 ? e.textContent = t.text : e.value = t.value, t.dataValue == null ? e.removeAttribute("data-kt-progress-value") : e.setAttribute("data-kt-progress-value", t.dataValue), t.state == null ? e.removeAttribute("data-kt-progress-state") : e.setAttribute("data-kt-progress-state", t.state), t.progressVar ? e.style.setProperty("--kt-progress", t.progressVar) : e.style.removeProperty("--kt-progress"), t.percentVar ? e.style.setProperty("--kt-percent", t.percentVar) : e.style.removeProperty("--kt-percent"), X.delete(e));
			}));
		}
	};
}
function ne(e, t) {
	let n = {}, r = `kt${t[0].toUpperCase()}${t.slice(1)}`, i = t === "radial" ? "position" : "preset";
	for (let [t, a] of Object.entries(e.dataset || {})) {
		if (!t.startsWith("kt")) continue;
		if (t === r) {
			let e = q(a);
			e && typeof e == "object" && !Array.isArray(e) ? Object.assign(n, e) : e !== !0 && e !== "" && (n[i] = e);
			continue;
		}
		let e = t.slice(2);
		e && (n[e[0].toLowerCase() + e.slice(1)] = q(a));
	}
	return n;
}
function re() {
	return f();
}
function ie() {
	return p();
}
function ae(e, t, n = {}) {
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
function oe(e, t = ["class", "style"]) {
	if (e && typeof e.getAttribute == "function") for (let n of t) e.getAttribute(n) === "" && e.removeAttribute(n);
}
function se(e, t) {
	let n = new Map(t.map((t) => [t, e.getAttribute(t)]));
	return () => {
		n.forEach((t, n) => {
			if (t != null) {
				e.setAttribute(n, t);
				return;
			}
			e.removeAttribute(n), e.getAttribute(n) === "" && e.removeAttribute(n);
		});
	};
}
function ce(e) {
	return e.includes("-") ? e : J(e).replace(/^(webkit|moz|ms|o)-/, "-$1-");
}
function le(e) {
	return e.includes("-") ? e.replace(/^-/, "").replace(/-([a-z])/g, (e, t) => t.toUpperCase()) : e;
}
function Z(e, t) {
	let n = e.hasAttribute("style"), r = t.map((t) => {
		let n = ce(t), r = le(t);
		return {
			name: n,
			member: r,
			value: e.style.getPropertyValue(n),
			priority: e.style.getPropertyPriority(n),
			memberValue: e.style[r]
		};
	});
	return () => {
		r.forEach(({ name: t, member: n, value: r, priority: i, memberValue: a }) => {
			if (r) {
				e.style.setProperty(t, r, i);
				return;
			}
			e.style.removeProperty(t), e.style[n] !== a && (a === void 0 ? delete e.style[n] : e.style[n] = a);
		}), !n && !e.style.length && e.removeAttribute("style");
	};
}
function ue(e, t, n = () => {}) {
	return {
		el: e,
		type: t,
		pause() {},
		resume() {},
		destroy: n
	};
}
var de = [
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
], Q = [
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
], fe = /* @__PURE__ */ ".ㄱ.ㄲ.ㄳ.ㄴ.ㄵ.ㄶ.ㄷ.ㄹ.ㄺ.ㄻ.ㄼ.ㄽ.ㄾ.ㄿ.ㅀ.ㅁ.ㅂ.ㅄ.ㅅ.ㅆ.ㅇ.ㅈ.ㅊ.ㅋ.ㅌ.ㅍ.ㅎ".split(".");
function pe(e) {
	let t = e.codePointAt(0);
	if (t < 44032 || t > 55203) return null;
	let n = t - 44032, r = Math.floor(n / 588), i = Math.floor(n % 588 / 28), a = n % 28;
	return {
		cho: r,
		jung: i,
		jong: a,
		pieces: [
			de[r],
			Q[i],
			...a ? [fe[a]] : []
		]
	};
}
function me(e) {
	let t = pe(e);
	if (!t) return [e];
	let n = [de[t.cho]], r = String.fromCharCode(44032 + t.cho * 588 + t.jung * 28);
	return n.push(r), t.jong && n.push(e), n;
}
function he(e, t = !1) {
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
		pieces: pe(e)?.pieces || [e],
		frames: me(e)
	})) : n;
}
function ge(e) {
	return String(e ?? "").replace(/\r\n?/g, "\n").replace(/[\u2028\u2029]/g, "\n");
}
function _e(e) {
	if (!e?.childNodes) return ge(e?.textContent || "");
	let t = "", n = (e) => {
		if (e.nodeType === 3) {
			t += e.nodeValue || "";
			return;
		}
		if (e.nodeType === 1) {
			if (e.tagName === "BR") {
				t += "\n";
				return;
			}
			e.childNodes.forEach(n);
		}
	};
	return e.childNodes.forEach(n), ge(t);
}
function ve(e) {
	Array.from(e.childNodes).forEach((e) => {
		if (e.nodeType === 3) {
			let t = ge(e.nodeValue);
			if (!t.includes("\n")) return;
			let n = document.createDocumentFragment();
			t.split(/(\n)/).forEach((e) => {
				e && n.appendChild(e === "\n" ? document.createElement("br") : document.createTextNode(e));
			}), e.replaceWith(n);
		} else e.nodeType === 1 && !["SCRIPT", "STYLE"].includes(e.tagName) && ve(e);
	});
}
function ye(e) {
	let t = [], n = (e) => {
		let r = Array.from(e.childNodes);
		t.push([e, r]), r.forEach((e) => {
			e.nodeType === 1 && n(e);
		});
	};
	return n(e), () => t.forEach(([e, t]) => e.replaceChildren(...t));
}
function be(e, { decimals: t = 0, format: n = "", locale: r } = {}) {
	let i = Number(e);
	return Number.isFinite(i) ? n === "," || r ? new Intl.NumberFormat(r || "en-US", {
		minimumFractionDigits: t,
		maximumFractionDigits: t
	}).format(i) : i.toFixed(t) : String(e);
}
function xe(e) {
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
function Se(e) {
	let t = e.scrambleFade === !0, n = e.rainbow === !0 && !t;
	if (!n && !t) return null;
	let r = e.rainbowColors;
	typeof r == "string" && (r = r.split(",").map((e) => e.trim()).filter(Boolean));
	let i = Array.isArray(r) && r.length ? r.map(xe).filter(Boolean) : null, a = () => {
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
//#region src/diagnostics.js
var Ce = /^KT_[A-Z0-9_]+$/, we = /* @__PURE__ */ new Set([
	"register",
	"create",
	"update",
	"destroy",
	"replay",
	"runtime"
]), Te = Object.freeze({
	DEBUG: "KT_DEBUG",
	INVALID_MODULE: "KT_INVALID_MODULE",
	UNKNOWN_MODULE: "KT_UNKNOWN_MODULE",
	CREATE_FAILED: "KT_CREATE_FAILED",
	NOT_APPLICABLE: "KT_NOT_APPLICABLE",
	UPDATE_FAILED: "KT_UPDATE_FAILED",
	DESTROY_FAILED: "KT_DESTROY_FAILED",
	LIFECYCLE_FAILED: "KT_LIFECYCLE_FAILED",
	TRANSFORM_CONFLICT: "KT_TRANSFORM_CONFLICT",
	DEPRECATED: "KT_DEPRECATED"
});
function Ee({ code: e, module: t = "core", phase: n = "runtime", recoverable: r = !1, cause: i, detail: a } = {}) {
	if (typeof e != "string" || !Ce.test(e)) throw TypeError(`Invalid Kineto diagnostic code: ${String(e)}`);
	if (typeof t != "string" || !t) throw TypeError("Kineto diagnostic module must be a non-empty string");
	if (!we.has(n)) throw TypeError(`Invalid Kineto diagnostic phase: ${String(n)}`);
	return Object.freeze({
		code: e,
		module: t,
		phase: n,
		recoverable: r === !0,
		...i === void 0 ? {} : { cause: i },
		...a === void 0 ? {} : { detail: a },
		timestamp: Date.now()
	});
}
function De({ isEnabled: e = () => !1, sink: t = null } = {}) {
	let n = [], r = /* @__PURE__ */ new Set();
	return Object.freeze({
		emit: (i) => {
			let a = Ee(i);
			if (!e()) return a;
			n.push(a), n.length > 50 && n.shift();
			try {
				t?.(a);
			} catch {}
			return r.forEach((e) => {
				try {
					e(a);
				} catch {}
			}), a;
		},
		create: Ee,
		subscribe(e) {
			if (typeof e != "function") throw TypeError("Kineto diagnostic subscriber must be a function");
			return r.add(e), () => r.delete(e);
		},
		clear() {
			n.length = 0;
		},
		get history() {
			return n.slice();
		}
	});
}
//#endregion
//#region src/core.js
var Oe = /* @__PURE__ */ new Set([
	"blurText",
	"counter",
	"cssScroll",
	"marquee",
	"parallax",
	"reveal",
	"scrollSequence",
	"scrollVelocity",
	"stickyStack",
	"textFill",
	"textReveal",
	"textSplit"
]), ke = {
	cursor: ["lightbox"],
	drag: ["fullpage", "radial"],
	hold: ["textReveal", "textSplit"],
	progress: ["slider", "loadingIndicator"]
};
function Ae(e, t) {
	return (ke[t] || []).some((t) => e.hasAttribute?.(`data-kt-${J(t)}`));
}
var je = /* @__PURE__ */ new Map(), Me = /* @__PURE__ */ new Set(), Ne = /* @__PURE__ */ new WeakMap(), Pe = /* @__PURE__ */ new Map(), Fe = !1, Ie = !1, Le = null, Re = null, ze = null, Be = null, Ve = null, He = null, Ue = null, We = {
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
	debug: !1,
	debugSink: null
}, Ge = De({
	isEnabled: () => !!(We.debug || typeof We.debugSink == "function"),
	sink: (e) => {
		typeof We.debugSink == "function" ? We.debugSink(e) : We.debug && console.info("[Kineto]", e);
	}
});
function Ke() {
	if (typeof document > "u" || !Me.size) return;
	let e = [...Me].map((e) => ({
		el: e.sourceEl,
		name: e.name,
		options: e.options
	}));
	e.forEach(({ el: e, name: t }) => {
		try {
			bt.destroyModule(e, t);
		} catch {}
	}), e.forEach(({ el: e, name: t, options: n }) => {
		try {
			bt.create(t, e, n);
		} catch {}
	});
}
var qe = !1, Je = null, Ye = null;
function Xe() {
	if (qe || typeof window > "u" || typeof window.matchMedia != "function") return;
	qe = !0;
	let e = window.matchMedia("(prefers-reduced-motion: reduce)"), t = () => {
		Ue && (Ue.reducedMotion = e.matches), We.respectReducedMotion && !We.forceReducedMotion && Ke();
		try {
			document.dispatchEvent(new CustomEvent("kineto:reduced-motion", { detail: { reduced: bt.prefersReducedMotion } }));
		} catch {}
	};
	e.addEventListener ? e.addEventListener("change", t) : e.addListener && e.addListener(t), Je = e, Ye = t, et();
}
var Ze = !1, Qe = null, $e = null;
function et() {
	if (Ze || typeof navigator > "u") return;
	let e = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
	if (!e || typeof e.addEventListener != "function") return;
	Ze = !0;
	let t = () => {
		Ue = null;
		try {
			document.dispatchEvent(new CustomEvent("kineto:environment", { detail: {
				performance: bt.performance,
				saveData: !!e.saveData,
				effectiveType: e.effectiveType
			} }));
		} catch {}
	};
	Qe = e, $e = t, e.addEventListener("change", t);
}
function tt(...e) {
	Ge.emit({
		code: Te.DEBUG,
		module: "core",
		phase: "runtime",
		recoverable: !0,
		detail: { message: e.map((e) => e instanceof Error ? e.message : e) }
	});
}
function nt(e) {
	return Ge.emit(e);
}
function rt(e, t, n, r) {
	let i = e || ue(t, n), a = {};
	return Object.defineProperties(a, Object.getOwnPropertyDescriptors(i)), a.el = i.el || t, a.sourceEl = t, a.type = i.type || n, a.options = r, a.pause = typeof i.pause == "function" ? i.pause.bind(i) : () => {}, a.resume = typeof i.resume == "function" ? i.resume.bind(i) : () => {}, a.destroy = typeof i.destroy == "function" ? i.destroy.bind(i) : () => {}, a;
}
function it(e, t = !1) {
	let n = Ne.get(e);
	return !n && t && (n = /* @__PURE__ */ new Map(), Ne.set(e, n)), n;
}
function at(e, t, n, r) {
	let i = rt(n, e, t, r), a = i.destroy, o = i.pause, s = i.resume, c = {
		sourceEl: e,
		name: t,
		instance: i,
		options: r,
		destroyImplementation: a,
		destroying: !1,
		visibility: !1,
		paused: !1
	};
	return i.pause = () => {
		if (Me.has(c)) return c.visibility || (c.paused = !0), c.visibility = !1, o();
	}, i.resume = () => {
		if (Me.has(c) && (c.visibility || (c.paused = !1), c.visibility = !1, !document.hidden)) return s();
	}, i.destroy = () => st(c), Me.add(c), it(e, !0).set(t, c), i;
}
function ot(e) {
	if (!e || typeof e.tagName != "string") return "unknown element";
	let t = e.tagName.toLowerCase(), n = e.id ? `#${e.id}` : "", r = typeof e.className == "string" ? e.className.trim().split(/\s+/).filter(Boolean)[0] : "";
	return `${t}${n}${r ? `.${r}` : ""}`;
}
function st(e, t = !0, n = !0) {
	if (!e || !Me.has(e) || e.destroying) return;
	e.destroying = !0, Me.delete(e);
	let r = it(e.sourceEl);
	if (r?.delete(e.name), r?.size === 0 && Ne.delete(e.sourceEl), t) {
		try {
			e.destroyImplementation();
		} catch (t) {
			console.error(`[Kineto/${e.name}] destroy() failed:`, t), nt({
				code: Te.DESTROY_FAILED,
				module: e.name,
				phase: "destroy",
				recoverable: !0,
				cause: t
			});
		}
		oe(e.sourceEl);
	}
	n && Me.size === 0 && vt();
}
function ct(e, t) {
	return t.some((t) => typeof document < "u" && t === document || typeof window < "u" && t === window || e.sourceEl === t || e.instance.el === t || typeof t.contains == "function" && (t.contains(e.sourceEl) || t.contains(e.instance.el)));
}
function lt() {
	Array.from(Me).forEach((e) => {
		let t = e.sourceEl;
		t && t.isConnected === !1 && st(e);
	});
}
function ut(e, t) {
	let n = t.attributes === !0, r = /* @__PURE__ */ new Set(), i = !1, a = !1, o = !0, s = () => {
		if (!o) return;
		a = !1;
		let t = r;
		r = /* @__PURE__ */ new Set();
		let n = i;
		i = !1, t.forEach((n) => {
			if (o && n.isConnected && e.contains(n)) {
				for (let r = n.parentNode; r; r = r.parentNode) {
					if (t.has(r)) return;
					if (r === e) break;
				}
				bt.scan(n);
			}
		}), o && n && lt();
	}, c = () => {
		a || (a = !0, Promise.resolve().then(s));
	}, l = new MutationObserver((e) => {
		e.forEach((e) => {
			if (e.type === "attributes") {
				String(e.attributeName || "").startsWith("data-kt-") && r.add(e.target);
				return;
			}
			e.addedNodes.forEach((e) => {
				e.nodeType === 1 && r.add(e);
			}), e.removedNodes.length && (i = !0);
		}), (r.size || i) && c();
	});
	return l.observe(e, {
		childList: !0,
		subtree: !0,
		attributes: n
	}), { disconnect() {
		o = !1, l.disconnect(), r.clear();
	} };
}
function dt() {
	if (Fe || bt.env.ssr) return;
	Fe = !0, yt();
	let e = re(), t = ie(), n = bt.performance;
	try {
		t?.config?.({ ignoreMobileResize: !0 });
	} catch {}
	We.smooth && n !== "low" && gt(e, t), He = () => {
		let e = document.hidden ? "pause" : "resume";
		Me.forEach((t) => {
			if (document.hidden || !t.paused) try {
				t.visibility = !0, t.instance[e]();
			} catch (n) {
				console.error(`[Kineto/${t.name}] ${e}() failed:`, n);
			} finally {
				t.visibility = !1;
			}
		});
	}, document.addEventListener("visibilitychange", He);
}
var ft = /* @__PURE__ */ new Set([
	"bottomSheet",
	"drag",
	"gesture",
	"lazy",
	"loader",
	"magnetic",
	"marquee",
	"mouseParallax",
	"parallax",
	"progress",
	"reveal",
	"scrollVelocity",
	"textSplit",
	"tilt"
]), pt = /* @__PURE__ */ new WeakMap();
function mt(e, t) {
	if (!ft.has(t)) return;
	let n = it(e);
	if (!n) return;
	let r = [...n.keys()].find((e) => e !== t && ft.has(e));
	if (!r) return;
	let i = pt.get(e) || /* @__PURE__ */ new Set(), a = [t, r].sort().join("+");
	i.has(a) || (i.add(a), pt.set(e, i), console.warn(`[Kineto] "${t}" and "${r}" both write this element's transform, so one will overwrite the other. Put them on nested elements instead. See docs/rfc/module-composition.md`), nt({
		code: Te.TRANSFORM_CONFLICT,
		module: t,
		phase: "create",
		recoverable: !0,
		detail: { otherModule: r }
	}));
}
function ht(e) {
	let t = e && e.nodeType === 1 ? e : e && e.parentElement, n = typeof document < "u" ? document : null;
	for (; t && n && t !== n.body && t !== n.documentElement;) {
		if (t.nodeType === 1) {
			if (t.hasAttribute("data-lenis-prevent") || t.hasAttribute("data-lenis-prevent-wheel")) return !0;
			let e = getComputedStyle(t), n = e.overflowY;
			if ((n === "auto" || n === "scroll") && t.scrollHeight > t.clientHeight + 1) return !0;
			let r = e.overflowX;
			if ((r === "auto" || r === "scroll") && t.scrollWidth > t.clientWidth + 1) return !0;
		}
		t = t.parentElement;
	}
	return !1;
}
function gt(e = re(), t = ie()) {
	return Re || bt.env.ssr || !We.smooth || bt.performance === "low" ? Promise.resolve(Re) : Ve || (Ve = (async () => {
		try {
			let n = await _();
			if (!n || Re || !We.smooth || bt.env.ssr || bt.performance === "low") return Re;
			let r = { ...We.smoothOptions };
			if (typeof r.prevent != "function" && (r.prevent = (e) => ht(e)), Re = new n(r), t && Re.on("scroll", t.update), e?.ticker) Be = (e) => Re?.raf(e * 1e3), e.ticker.add(Be), e.ticker.lagSmoothing(0);
			else {
				let e = (t) => {
					Re?.raf(t), Re && (ze = requestAnimationFrame(e));
				};
				ze = requestAnimationFrame(e);
			}
		} catch (e) {
			Re = null, tt("Lenis initialization skipped.", e);
		} finally {
			Ve = null;
		}
		return Re;
	})(), Ve);
}
function _t() {
	let e = re();
	Be && e?.ticker && e.ticker.remove(Be), Be = null, ze && cancelAnimationFrame(ze), ze = null, Re?.destroy?.(), Re = null;
}
function vt() {
	He && typeof document < "u" && document.removeEventListener("visibilitychange", He), He = null, Le && typeof document < "u" && document.removeEventListener("DOMContentLoaded", Le), Le = null, Je && Ye && (Je.removeEventListener ? Je.removeEventListener("change", Ye) : Je.removeListener?.(Ye)), Je = null, Ye = null, qe = !1, Qe && $e && Qe.removeEventListener?.("change", $e), Qe = null, $e = null, Ze = !1, _t(), Fe = !1, Ie = !1;
}
function yt() {
	if (typeof document > "u" || document.getElementById("kineto-inline-fallback")) return;
	let e = document.createElement("style");
	e.id = "kineto-inline-fallback", e.textContent = "\n    @property --kt-angle { syntax: \"<angle>\"; initial-value: 0deg; inherits: false; }\n    @keyframes kt-border-spin { to { --kt-angle: 360deg; } }\n    @keyframes kt-shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }\n    @keyframes kt-aurora { to { transform: rotate(360deg); } }\n    @keyframes kt-aurora-drift { 0% { transform: translate3d(-3%,-2%,0) scale(1.06); } 100% { transform: translate3d(3%,2%,0) scale(1.12); } }\n    @keyframes kt-caret { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }\n    .kt-cursor-active, .kt-cursor-active * { cursor: none !important; }\n    .kt-cursor-scope, .kt-cursor-scope * { cursor: none !important; }\n    .kt-tw-caret { animation: kt-caret .8s step-end infinite; }\n    .kt-slide { position: relative; flex: 0 0 100%; min-width: 0; }\n    .kt-slider-wrap { position: relative; overflow: hidden; }\n    @media (prefers-reduced-motion: reduce) {\n      [data-kt-reveal], [data-kt-text-split], [data-kt-blur-text] { opacity: 1 !important; transform: none !important; filter: none !important; }\n    }\n  ", document.head.appendChild(e);
}
var bt = {
	version: "0.11.0",
	easing: M,
	easingFn: F,
	easings: j,
	get env() {
		return Ue ||= V(), Xe(), Ue;
	},
	get prefersReducedMotion() {
		return We.forceReducedMotion ? !0 : !!(We.respectReducedMotion && this.env.reducedMotion);
	},
	setReducedMotion(e) {
		e === "always" ? (We.forceReducedMotion = !0, We.respectReducedMotion = !0) : e === "never" ? (We.forceReducedMotion = !1, We.respectReducedMotion = !1) : (We.forceReducedMotion = !1, We.respectReducedMotion = !0), Ke();
		try {
			document.dispatchEvent(new CustomEvent("kineto:reduced-motion", { detail: { reduced: this.prefersReducedMotion } }));
		} catch {}
		return this;
	},
	get performance() {
		return We.performance === "auto" ? this.env.perf : We.performance;
	},
	get registry() {
		return Object.fromEntries(je);
	},
	get instanceCount() {
		return Me.size;
	},
	diagnostics: Ge,
	diagnosticCodes: Te,
	get smoothEnabled() {
		return !!Re;
	},
	get lenis() {
		return Re;
	},
	config(e = {}) {
		return e.smoothOptions && (We.smoothOptions = {
			...We.smoothOptions,
			...e.smoothOptions
		}), Object.assign(We, {
			...e,
			smoothOptions: We.smoothOptions
		}), e.spring !== void 0 && B({ spring: e.spring === !0 }), Ue = null, this;
	},
	setAnimationEngine: d,
	setEngineSource(e = {}) {
		return c(e), this;
	},
	getEngineSource() {
		return l();
	},
	enableSmooth(e = {}) {
		return We.smooth = !0, We.smoothOptions = {
			...We.smoothOptions,
			...e
		}, Fe ? gt() : dt(), this;
	},
	disableSmooth() {
		return We.smooth = !1, _t(), this;
	},
	toggleSmooth(e, t = {}) {
		return (typeof e == "boolean" ? e : !We.smooth) ? this.enableSmooth(t) : this.disableSmooth();
	},
	scrollTo(e, t = {}) {
		return Re ? (Re.scrollTo(e, t), this) : (typeof e == "number" ? window.scrollTo({
			top: e,
			behavior: t.behavior || "smooth"
		}) : Y(e)[0]?.scrollIntoView?.({
			behavior: t.behavior || "smooth",
			block: t.block || "start"
		}), this);
	},
	register(e, t) {
		return !e || !t || typeof t.create != "function" ? (console.warn(`[Kineto] Module "${e}" needs a create() function.`), nt({
			code: Te.INVALID_MODULE,
			module: String(e || "unknown"),
			phase: "register",
			recoverable: !0
		}), this) : (je.set(e, t), this[e] = (t, n = {}) => this.create(e, t, n), this);
	},
	unregister(e) {
		return Array.from(Me).forEach((t) => {
			t.name === e && st(t);
		}), je.delete(e), delete this[e], this;
	},
	create(e, t, n = {}) {
		let r = je.get(e);
		if (!r) return console.warn(`[Kineto] Unknown module: ${e}`), nt({
			code: Te.UNKNOWN_MODULE,
			module: String(e || "unknown"),
			phase: "create",
			recoverable: !0
		}), null;
		let i = Y(t);
		if (!i.length) return null;
		let a = i.map((t) => {
			let i = it(t)?.get(e);
			if (i) return i.instance;
			mt(t, e);
			try {
				let i, a = this.prefersReducedMotion, o = r.reducedMotion || r.reduced;
				return i = a ? (o ? o.call(r, t, n, this) : void 0) || ue(t, e) : this.performance === "low" && typeof r.fallback == "function" ? r.fallback.call(r, t, n, this) || ue(t, e) : r.create(t, n, this), i ? at(t, e, i, n) : (nt({
					code: Te.NOT_APPLICABLE,
					module: e,
					phase: "create",
					recoverable: !0,
					detail: ot(t)
				}), null);
			} catch (t) {
				return console.error(`[Kineto/${e}] create() failed:`, t), nt({
					code: Te.CREATE_FAILED,
					module: e,
					phase: "create",
					recoverable: !0,
					cause: t
				}), null;
			}
		}).filter(Boolean);
		return a.length && dt(), a.length <= 1 ? a[0] || null : a;
	},
	scan(e = typeof document < "u" ? document : null) {
		if (this.env.ssr || !e) return this;
		dt();
		function* t(t) {
			let n = `[data-kt-${J(t)}]`, r = e.querySelectorAll?.(n) || [];
			e.matches?.(n) && (yield e), yield* r;
		}
		let n = (e, t) => !it(e)?.has(t) && !Ae(e, t), r = (e) => {
			je.forEach((r, i) => {
				if (Oe.has(i) === e) for (let e of t(i)) n(e, i) && this.create(i, e, ne(e, i));
			});
		}, i = () => {
			typeof requestAnimationFrame < "u" ? requestAnimationFrame(() => document.documentElement.classList.remove("kt-preload")) : document.documentElement.classList.remove("kt-preload");
		};
		r(!1);
		let a = Array.from(Oe).some((e) => {
			if (!je.has(e)) return !1;
			for (let r of t(e)) if (n(r, e)) return !0;
			return !1;
		}), o = () => {
			r(!0), i();
		};
		return a && !m() ? g().finally(o) : o(), this;
	},
	init(e = typeof document < "u" ? document : null) {
		return this.scan(e);
	},
	initModules(e) {
		return Y(e).forEach((e) => this.scan(e)), this;
	},
	autoInit(e = typeof document < "u" ? document : null) {
		return this.env.ssr || !e ? this : document.readyState === "loading" ? (Ie || (Ie = !0, Le = () => {
			Ie = !1, Le = null, this.scan(e);
		}, document.addEventListener("DOMContentLoaded", Le, { once: !0 })), this) : this.scan(e);
	},
	observe(e = typeof document < "u" ? document : null, t = {}) {
		let n = typeof e == "string" ? Y(e)[0] : e, r = {
			root: n || null,
			active: !1,
			disconnect() {}
		};
		if (this.env.ssr || !n || typeof MutationObserver > "u") return r;
		let i = Pe.get(n);
		if (i) return i.handle;
		let a = ut(n, t), o = {
			root: n,
			active: !0,
			disconnect: () => {
				let e = Pe.get(n);
				e && e.handle === o && (e.live.disconnect(), Pe.delete(n), o.active = !1);
			}
		};
		return Pe.set(n, {
			live: a,
			handle: o
		}), t.scan !== !1 && this.scan(n), o;
	},
	getInstance(e, t) {
		let n = Y(e)[0];
		return n ? t ? it(n)?.get(t)?.instance || null : Array.from(it(n)?.values() || [], ({ instance: e }) => e) : null;
	},
	updateModule(e, t, n = {}) {
		let r = Y(e), i = 0;
		return r.forEach((e) => {
			let r = it(e)?.get(t);
			if (r && typeof r.instance.update == "function") {
				let e = {
					...r.options,
					...n
				};
				try {
					if (r.instance.update(n, e) !== !1) {
						r.options = e, i += 1;
						return;
					}
				} catch (e) {
					console.error(`[Kineto/${t}] update() failed, recreating:`, e), nt({
						code: Te.UPDATE_FAILED,
						module: t,
						phase: "update",
						recoverable: !0,
						cause: e
					});
				}
			}
			let a = r ? {
				...r.options,
				...n
			} : n;
			r?.instance?.effect === "radial" && Number.isFinite(r.instance.index) && (a.initialIndex = r.instance.index), this.destroyModule(e, t), this.create(t, e, a);
		}), i > 0;
	},
	destroyModule(e, t) {
		let n = Y(e);
		return n.length && Array.from(Me).forEach((e) => {
			e.name === t && ct(e, n) && st(e);
		}), this;
	},
	replay(e, t, n) {
		let r = Y(e), i = [];
		Array.from(Me).forEach((e) => {
			e.name === t && ct(e, r) && i.push(e);
		});
		let a = [];
		return i.forEach((e) => {
			if (!n && typeof e.instance?.replay == "function") e.instance.replay(), a.push(e.instance);
			else {
				let r = e.sourceEl, i = n || e.options;
				st(e, !0, !1);
				let o = this.create(t, r, i);
				o && a.push(o);
			}
		}), a.length <= 1 ? a[0] || null : a;
	},
	destroy(e) {
		if (e) {
			let t = Y(e);
			return Array.from(Me).forEach((e) => {
				ct(e, t) && st(e);
			}), this;
		}
		return Array.from(Me).forEach((e) => st(e)), Array.from(Pe.values()).forEach(({ handle: e }) => e.disconnect()), vt(), this;
	},
	pause() {
		return Me.forEach(({ instance: e }) => e.pause()), Re?.stop(), this;
	},
	resume() {
		return Me.forEach(({ instance: e }) => e.resume()), Re?.start(), this;
	},
	refresh() {
		return ie()?.refresh(), this;
	}
};
bt.core = {
	initModules: (e) => bt.initModules(e),
	destroyModule: (e, t) => bt.destroyModule(e, t),
	getInstance: (e, t) => bt.getInstance(e, t),
	replay: (e, t, n) => bt.replay(e, t, n),
	scan: (e) => bt.scan(e),
	enableSmooth: (e) => bt.enableSmooth(e),
	disableSmooth: () => bt.disableSmooth(),
	toggleSmooth: (e, t) => bt.toggleSmooth(e, t),
	scrollTo: (e, t) => bt.scrollTo(e, t)
};
//#endregion
//#region src/modules/parallax.js
var xt = {
	create(e, t) {
		let n = re(), r = ie();
		if (!n || !r) return this.fallback(e, t);
		let i = Z(e, ["transform", "willChange"]), a = t.speed ?? .5, o = t.axis || "y", s = (t.distance ?? 200) * Math.abs(a), c = { [o]: a < 0 ? s : -s }, l = {
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
		let t = Z(e, ["transform"]), n = re();
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
		let n = Z(e, ["transform", "willChange"]), r = t.axis === "x" ? "x" : "y", i = Number(t.speed ?? .5), a = Number(t.distance ?? 200) * i;
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
}, St = {
	create(e, t) {
		let n = V();
		if ((t.mode || t.preset) === "compass") {
			let r = G(Number(t.smoothing ?? t.ease ?? .08), .01, 1), i = Number(t.rotateOffset ?? 0), a = t.compassRange == null ? null : Number(t.compassRange), o = Number(t.sensitivity ?? 1), s = t.global ? window : e, c = Z(e, ["transform", "willChange"]);
			e.style.willChange = "transform";
			let l = 0, u = 0, d = !0, f = null, p = t.gyro !== !1 && n.touch && n.hasGyro, m = (e) => {
				e.alpha != null && (l = -e.alpha * o);
			}, h = (n) => {
				let r = e.getBoundingClientRect();
				if (r.width && r.height) {
					if (a != null) {
						let e = t.global ? {
							left: 0,
							width: window.innerWidth
						} : r;
						l = G(((n.clientX - e.left) / e.width - .5) * 2, -1, 1) * a * o;
					} else l = Math.atan2(n.clientY - (r.top + r.height / 2), n.clientX - (r.left + r.width / 2)) * 180 / Math.PI * o;
				}
			}, g = () => {
				if (!d) return;
				let t = (l - u) % 360;
				t > 180 && (t -= 360), t < -180 && (t += 360), u += t * r, e.style.transform = `rotate(${(u + i).toFixed(3)}deg)`, f = requestAnimationFrame(g);
			};
			return p ? U().then((e) => {
				e && d && window.addEventListener("deviceorientation", m, { passive: !0 });
			}) : s.addEventListener("pointermove", h, { passive: !0 }), f = requestAnimationFrame(g), {
				el: e,
				type: "mouseParallax",
				pause: () => {
					d = !1, f != null && cancelAnimationFrame(f);
				},
				resume: () => {
					d || (d = !0, f = requestAnimationFrame(g));
				},
				destroy: () => {
					d = !1, f != null && cancelAnimationFrame(f), s.removeEventListener("pointermove", h), window.removeEventListener("deviceorientation", m), c();
				}
			};
		}
		let r = t.ease ?? .08, i = t.maxX ?? 40, a = t.maxY ?? 40, o = t.global ? window : e, s = t.gyro !== !1 && n.hasGyro && n.touch, c = Array.from(e.querySelectorAll("[data-mp-speed], [data-kt-mouse-speed]"));
		c.length || c.push(e);
		let l = c.map((e) => Z(e, ["transform", "willChange"]));
		c.forEach((e) => {
			e.style.willChange = "transform";
		});
		let u = 0, d = 0, f = !0, p = null, m = c.map(() => 0), h = c.map(() => 0), g = (n) => {
			let r = t.global ? {
				left: 0,
				top: 0,
				width: window.innerWidth,
				height: window.innerHeight
			} : e.getBoundingClientRect();
			r.width && r.height && (u = ((n.clientX - r.left) / r.width - .5) * 2, d = ((n.clientY - r.top) / r.height - .5) * 2);
		}, _ = (e) => {
			u = G((e.gamma || 0) / 30, -1, 1), d = G((e.beta || 0) / 30, -1, 1);
		};
		s ? U().then((e) => {
			e && f && window.addEventListener("deviceorientation", _, { passive: !0 });
		}) : o.addEventListener("pointermove", g, { passive: !0 });
		let v = () => {
			f && (c.forEach((e, n) => {
				let o = Number(e.dataset.mpSpeed ?? e.dataset.ktMouseSpeed ?? t.speed ?? .05);
				m[n] = W(m[n], u * i * o, r), h[n] = W(h[n], d * a * o, r), e.style.transform = `translate3d(${m[n]}px, ${h[n]}px, 0)`;
			}), p = requestAnimationFrame(v));
		};
		return p = requestAnimationFrame(v), {
			el: e,
			type: "mouseParallax",
			pause: () => {
				f = !1, p != null && cancelAnimationFrame(p);
			},
			resume: () => {
				f || (f = !0, p = requestAnimationFrame(v));
			},
			destroy: () => {
				f = !1, p != null && cancelAnimationFrame(p), o.removeEventListener("pointermove", g), window.removeEventListener("deviceorientation", _), l.forEach((e) => e());
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
}, Ct = {
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
	swing: {
		rotate: -12,
		x: -28,
		transformOrigin: "0% 0%",
		opacity: 0
	},
	skew: {
		skewY: 7,
		y: 28,
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
}, wt = /* @__PURE__ */ new Set([
	"start",
	"end",
	"center",
	"edges",
	"random"
]), Tt = (e, t) => t.stagger && e.children.length ? Array.from(e.children) : [e];
function Et(e, t) {
	let n = [.../* @__PURE__ */ new Set([...t, e])].map((e) => se(e, ["style", "class"]));
	return () => n.forEach((e) => e());
}
function Dt(e) {
	return wt.has(String(e)) ? String(e) : "start";
}
function Ot(e, t, n) {
	n = Dt(n);
	let r = Math.max(0, Number(t) || 0), i = Math.max(0, e - 1), a = i / 2, o;
	if (n === "end") o = (e) => i - e;
	else if (n === "center") o = (e) => Math.abs(e - a);
	else if (n === "edges") o = (e) => a - Math.abs(e - a);
	else if (n === "random") {
		let t = Array.from({ length: e }, (e, t) => t);
		for (let e = t.length - 1; e > 0; --e) {
			let n = Math.floor(Math.random() * (e + 1));
			[t[e], t[n]] = [t[n], t[e]];
		}
		o = (e) => t[e];
	} else o = (e) => e;
	return Array.from({ length: e }, (e, t) => o(t) * r);
}
function kt(e, t, n) {
	let r = String(t.enterClass || t.activeClass || "is-inview").split(/\s+/).filter(Boolean), i = String(t.leaveClass || "").split(/\s+/).filter(Boolean), [a, o] = n ? [i, r] : [r, i];
	e.classList.remove(...a), e.classList.add(...o), t.onClassChange?.(n, e);
}
var At = (e, t) => kt(e, t, !0), jt = (e, t) => kt(e, t, !1);
function Mt(e, t, n, r, i, a, o = () => e.getBoundingClientRect()) {
	let s = !1, c = null, l = null, u = null, d = Number(t.threshold ?? (n ? .2 : .1)), f = String(t.rootMargin || (n ? "0px" : "0px 0px -10% 0px")).trim().split(/\s+/), p = () => {
		if (c = null, s) return;
		let t = document.documentElement.clientWidth || window.innerWidth, n = document.documentElement.clientHeight || window.innerHeight, i = [
			0,
			1,
			2,
			3
		].map((e) => {
			let n = f[e] || f[e % 2] || f[0];
			return Number.parseFloat(n) * (n.endsWith("%") ? t / 100 : 1);
		}), u = o(), p = -i[0], m = n + i[2], h = -i[3], g = t + i[1];
		for (let t = e.parentElement; t; t = t.parentElement) {
			let e = getComputedStyle(t);
			if (!/(hidden|clip|auto|scroll)/.test(e.overflowX + e.overflowY)) continue;
			let n = t.getBoundingClientRect(), r = t.offsetWidth ? n.width / t.offsetWidth : 1, i = t.offsetHeight ? n.height / t.offsetHeight : 1;
			e.overflowX !== "visible" && (h = Math.max(h, n.left + t.clientLeft * r), g = Math.min(g, n.left + (t.clientLeft + t.clientWidth) * r)), e.overflowY !== "visible" && (p = Math.max(p, n.top + t.clientTop * i), m = Math.min(m, n.top + (t.clientTop + t.clientHeight) * i));
		}
		let _ = Math.max(0, Math.min(u.right, g) - Math.max(u.left, h)) * Math.max(0, Math.min(u.bottom, m) - Math.max(u.top, p)), v = _ > 0 && _ / (u.width * u.height) >= d;
		if (a) {
			v && a();
			return;
		}
		let y = v ? 0 : u.top >= (p + m - u.height) / 2 ? 1 : -1, b = l;
		l = y, !(b == null && y !== 0 || b === y) && (b === -1 ? r(2) : (b === 1 || b == null) && r(0), !s && (y === -1 ? r(1) : y === 1 && r(3)));
	}, m = () => {
		!s && c == null && (c = requestAnimationFrame(p));
	};
	return typeof IntersectionObserver < "u" ? (u = new IntersectionObserver(m, {
		threshold: d,
		rootMargin: f.join(" ")
	}), u.observe(e)) : a || r(0), i && !a && (document.addEventListener("scroll", m, {
		passive: !0,
		capture: !0
	}), window.addEventListener("resize", m, { passive: !0 })), { disconnect() {
		s = !0, u?.disconnect(), c != null && cancelAnimationFrame(c), document.removeEventListener("scroll", m, !0), window.removeEventListener("resize", m);
	} };
}
function Nt(e, t, n, r, i, a) {
	let o = t.preset || "fade-up", s = Tt(e, t), c = Et(e, s), l = t.once !== !1, u = !l || t.onEnter || t.onLeave || t.onEnterBack || t.onLeaveBack, d = { time: 0 }, f = !1, p = !1, m = !1, h = -1, g = 1, _, v, y, b, x = null, S = null, C = null, w = null, T = null, E = () => {
		x?.pause(), S != null && cancelAnimationFrame(S), S = C = null;
	}, D = () => {
		f || s.forEach((e, r) => {
			let s = G(b(G((d.time - v[r]) / _, 0, 1)), 0, 1);
			if (e.style.opacity = !n && !i && s === 0 ? "0" : "1", o === "clock") {
				let n = s * 360, r = t.clockDirection === "ccw" ? `transparent 0deg ${360 - n}deg, #000 ${360 - n}deg` : `#000 ${n}deg, transparent ${n}deg`, i = s === 1 ? "none" : `conic-gradient(from ${Number(t.startAngle ?? 0)}deg, ${r})`;
				e.style.maskImage = e.style.webkitMaskImage = i;
			} else {
				let t = s >= .998 || !n && s === 0 ? "none" : a(1 - s);
				e.style.clipPath = e.style.webkitClipPath = t;
			}
			e.style.willChange = s > 0 && s < 1 ? i ? "mask-image" : "clip-path" : "";
		});
	}, O = () => {
		f || (D(), u || (T?.disconnect(), w?.kill()), t.onComplete?.(e));
	}, k = (e) => {
		S = null, !(f || p) && (C != null && (d.time = G(d.time + (e - C) * g / 1e3, 0, y)), C = e, D(), (g > 0 ? d.time < y : d.time > 0) ? S = requestAnimationFrame(k) : g > 0 && O());
	}, A = () => {
		f || p || (n ? g > 0 ? x.play() : x.reverse() : S == null && (g > 0 ? d.time < y : d.time > 0) && (C = null, S = requestAnimationFrame(k)));
	}, j = () => {
		E(), x?.kill(), _ = Math.max(.05, Number(t.duration ?? (i ? 1.4 : n ? .8 : .55)));
		let e = Number(t.delay ?? 0);
		v = Ot(s.length, t.stagger, t.order).map((t) => t + (n && !i ? e : Math.max(0, e))), y = Math.max(.001, _ + Math.max(...v));
		let r = t.enterEase ?? t.ease, a = {
			ease: [
				.25,
				.1,
				.25,
				1
			],
			"ease-in": [
				.42,
				0,
				1,
				1
			],
			"ease-out": [
				0,
				0,
				.58,
				1
			],
			"ease-in-out": [
				.42,
				0,
				.58,
				1
			]
		}[r || (i ? "linear" : "ease")] || String(r).match(/^cubic-bezier\(\s*([\d.+-]+)\s*,\s*([\d.+-]+)\s*,\s*([\d.+-]+)\s*,\s*([\d.+-]+)\s*\)$/)?.slice(1).map(Number);
		b = n ? n.parseEase(r ? R(r) : i ? "power1.inOut" : (t.spring ?? z.spring) === !0 ? "back.out(1.25)" : "power3.out") : a ? I(...a) : F(r), d.time = 0, g = 1, D(), n && (x = n.to(d, {
			time: y,
			duration: y,
			ease: "none",
			paused: !0,
			onUpdate: D,
			onComplete: O
		}));
	}, M = (n) => {
		if (!(f || h === n)) {
			if (h = n, n % 2 == 0 && (!m || !l)) {
				if (m = !0, g = 1, At(e, t), f) return;
				A();
			}
			[
				t.onEnter,
				t.onLeave,
				t.onEnterBack,
				t.onLeaveBack
			][n]?.(e), !(f || n % 2 == 0 || l) && (t.removeClassOnLeave !== !1 && jt(e, t), !f && (g = -1, A()));
		}
	};
	return j(), r && (w = r.create({
		trigger: e,
		start: t.start || "top 85%",
		end: t.end,
		onEnter: () => M(0),
		onLeave: () => M(1),
		onEnterBack: () => M(2),
		onLeaveBack: () => M(3)
	})), T = Mt(e, t, i, M, u, r ? () => {
		m || M(0);
	} : null), {
		el: e,
		type: "reveal",
		replay(n) {
			f || (Object.assign(t, n || {}), j(), p = !1, m = !0, At(e, t), A());
		},
		pause() {
			p = !0, E();
		},
		resume() {
			p = !1, A();
		},
		destroy() {
			f = !0, E(), x?.kill(), w?.kill(), T?.disconnect(), c();
		}
	};
}
var Pt = {
	create(e, t = {}, n) {
		let r = n?.performance === "low" ? null : re(), i = r && ie(), a = t.preset || "fade-up", o = a.startsWith("slide-") ? a.slice(6) : null, s = t.direction || o || (a === "mask" ? "right" : "up"), c = a.startsWith("slide-") && [
			"up",
			"down",
			"left",
			"right"
		].includes(s) ? `slide-${s}` : a, l = t.classOnly === !0 || a === "class", u = t.once !== !1, d = e.getAttribute("class");
		if (l) {
			let n = null, r = null, a = null, o = !1, s = !1, c = !1, l = () => {
				o || s || (c = !0, At(e, t), o || t.onEnter?.(e));
			}, f = () => {
				o || s || t.removeClassOnLeave !== !1 && (jt(e, t), o || t.onLeave?.(e));
			}, p = () => {
				!o && s && (s = !1, r?.enable?.(), (!u || !c) && n?.observe?.(e));
			};
			return i ? r = i.create({
				trigger: e,
				start: t.start || "top 85%",
				end: t.end || "bottom 15%",
				once: u,
				onEnter: l,
				onEnterBack: () => {
					l(), o || t.onEnterBack?.(e);
				},
				onLeave: f,
				onLeaveBack: () => {
					f(), o || t.onLeaveBack?.(e);
				}
			}) : u ? n = ae(e, l, {
				threshold: Number(t.threshold ?? .1),
				rootMargin: t.rootMargin || "0px 0px -10% 0px"
			}) : typeof IntersectionObserver < "u" ? (n = new IntersectionObserver(([e]) => e.isIntersecting ? l() : f(), {
				threshold: Number(t.threshold ?? .1),
				rootMargin: t.rootMargin || "0px"
			}), n.observe(e)) : l(), {
				el: e,
				type: "reveal",
				replay(n) {
					p(), !o && (Object.assign(t, n || {}), a != null && cancelAnimationFrame(a), jt(e, t), !o && (a = requestAnimationFrame(() => {
						a = null, l();
					})));
				},
				pause() {
					o || (s = !0, r?.disable?.(), n?.disconnect?.());
				},
				resume: p,
				destroy() {
					o = !0, a != null && cancelAnimationFrame(a), r?.kill?.(), n?.disconnect?.(), d == null ? e.removeAttribute("class") : e.setAttribute("class", d);
				}
			};
		}
		let f = a === "clock", p = c === "wipe" || c === "mask", m = (e) => {
			let t = `${(Math.max(0, Math.min(1, e)) * 100).toFixed(2)}%`;
			return s === "down" ? `inset(0px 0px ${t} 0px)` : s === "left" ? `inset(0px 0px 0px ${t})` : s === "right" ? `inset(0px ${t} 0px 0px)` : `inset(${t} 0px 0px 0px)`;
		};
		if (f || p) return Nt(e, t, f || i ? r : null, i, f, m);
		let h = Ct[c];
		if (h && t.distance != null && t.distance !== "") {
			let e = Math.max(0, Number(t.distance));
			Number.isFinite(e) && (h = { ...h }, "xPercent" in h && (h.x = Math.sign(h.xPercent || 1) * e, delete h.xPercent), "yPercent" in h && (h.y = Math.sign(h.yPercent || 1) * e, delete h.yPercent), "x" in h && !("xPercent" in Ct[c]) && (h.x = Math.sign(h.x || 1) * e), "y" in h && !("yPercent" in Ct[c]) && (h.y = Math.sign(h.y || 1) * e));
		}
		if (!h) return console.warn(`[Kineto/reveal] Unknown preset: ${a}`), null;
		if (!r || !i) return this.fallback(e, t, h);
		let g = Tt(e, t), _ = Et(e, g), v = Math.max(0, Number(t.duration ?? .8)), y = t.enterEase ?? t.ease ? R(t.enterEase ?? t.ease) : (t.spring ?? z.spring) === !0 ? "back.out(1.25)" : "power3.out", b = !1, x = (n = Number(t.delay ?? 0)) => {
			let r = Ot(g.length, t.stagger, t.order);
			return {
				x: 0,
				y: 0,
				xPercent: 0,
				yPercent: 0,
				scale: 1,
				rotation: 0,
				rotationX: 0,
				rotationY: 0,
				skewX: 0,
				skewY: 0,
				opacity: 1,
				filter: "blur(0px)",
				duration: v,
				delay: n,
				ease: y,
				stagger: t.stagger ? (e) => r[e] : void 0,
				onStart: () => At(e, t),
				onComplete: () => {
					g.forEach((e) => {
						e.style.willChange = "";
					}), t.onComplete?.(e);
				}
			};
		}, S = null, C = null, w = () => {
			S && (C !== S && C?.kill(), C = S);
		}, T = {
			...x(),
			scrollTrigger: {
				trigger: e,
				start: t.start || "top 85%",
				end: t.end,
				toggleActions: u ? "play none none none" : "play reverse play reverse",
				onEnter: () => {
					b || (w(), t.onEnter?.(e));
				},
				onLeave: () => {
					b || (w(), t.onLeave?.(e), !b && !u && t.removeClassOnLeave !== !1 && jt(e, t));
				},
				onEnterBack: () => {
					b || (w(), At(e, t), b || t.onEnterBack?.(e));
				},
				onLeaveBack: () => {
					b || (w(), t.onLeaveBack?.(e), !b && !u && t.removeClassOnLeave !== !1 && jt(e, t));
				}
			}
		};
		g.forEach((e) => {
			e.style.willChange = "transform,opacity,filter,clip-path";
		}), S = r.fromTo(g, h, T), C = S;
		let E = (e = 0) => {
			b || (D?.disconnect(), D = null, u && S.scrollTrigger?.disable(!1), S.pause(), C !== S && C.kill(), C = r.fromTo(g, h, {
				...x(e),
				overwrite: "auto"
			}));
		}, D = null;
		return typeof IntersectionObserver < "u" && (D = new IntersectionObserver((e) => {
			e.some((e) => e.isIntersecting) && (D.disconnect(), D = null, S.progress() === 0 && E(Number(t.delay ?? 0)));
		}, {
			threshold: .12,
			rootMargin: "0px 0px -8% 0px"
		}), D.observe(e)), {
			el: e,
			type: "reveal",
			replay(e) {
				Object.assign(t, e || {}), E();
			},
			pause() {
				C.pause();
			},
			resume() {
				C.resume();
			},
			destroy() {
				b = !0, D?.disconnect(), S.scrollTrigger?.kill?.(), C.kill(), S.kill(), _();
			}
		};
	},
	reduced(e) {
		let t = Z(e, [
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
	fallback(e, t = {}, n = Ct["fade-up"]) {
		if (n.performance === "low") return this.create(e, t, n);
		let r = Tt(e, t), i = Et(e, r), a = String(n.opacity ?? 0), o = Number(n.x ?? 0), s = Number(n.y ?? 0), c = Number(n.xPercent ?? 0), l = Number(n.yPercent ?? 0), u = Number(n.scale ?? 1), d = Number(n.rotate ?? n.rotation ?? 0), f = Number(n.rotationX ?? 0), p = Number(n.rotationY ?? 0), m = Number(n.skewX ?? 0), h = Number(n.skewY ?? 0), g = Number(n.transformPerspective ?? 0), _ = Math.max(0, Number(t.duration ?? .55)), v = t.once !== !1, y = !v || t.onEnter || t.onLeave || t.onEnterBack || t.onLeaveBack, b = [], x = !1, S = !1, C = !1, w = 1, T = 0, E = null, D = /* @__PURE__ */ new Set(), O = /* @__PURE__ */ new Set(), k = /* @__PURE__ */ new Set(), A = (e) => {
			let t = requestAnimationFrame(() => {
				k.delete(t), x || e();
			});
			k.add(t);
		}, j = () => {
			T++, D.forEach((e) => {
				e.onfinish = null, e.cancel();
			}), D.clear(), O.clear(), b.forEach(clearTimeout), b = [], k.forEach(cancelAnimationFrame), k.clear();
		}, M = () => {
			x || w < 0 || (y || E?.disconnect(), t.onComplete?.(e));
		}, N = () => {
			D.forEach((e) => {
				e.playbackRate = w;
				let t = e.effect.getComputedTiming().endTime;
				!S && (w > 0 ? e.currentTime < t : e.currentTime > 0) && e.play();
			});
		}, P = [
			g ? `perspective(${g}px)` : "",
			`translate3d(${o}px,${s}px,0)`,
			c || l ? `translate(${c}%,${l}%)` : "",
			d ? `rotate(${d}deg)` : "",
			f ? `rotateX(${f}deg)` : "",
			p ? `rotateY(${p}deg)` : "",
			m ? `skewX(${m}deg)` : "",
			h ? `skewY(${h}deg)` : "",
			u === 1 ? "" : `scale(${u})`
		].filter(Boolean).join(" "), F = [{
			opacity: a,
			transform: P,
			filter: n.filter || "none"
		}, {
			opacity: "1",
			transform: "none",
			filter: "none"
		}], I = (e) => {
			e.style.transition = "none", e.style.opacity = a, e.style.transform = P, n.transformOrigin && (e.style.transformOrigin = n.transformOrigin), n.filter && (e.style.filter = n.filter);
		};
		r.forEach(I);
		let L = () => {
			if (x) return;
			j();
			let n = T;
			C = !0, w = 1;
			let i = Ot(r.length, t.stagger, t.order), a = Math.max(0, Number(t.delay ?? 0)), o = i.indexOf(Math.max(...i));
			At(e, t), !(x || n !== T) && r.forEach((e, t) => {
				if (typeof e.animate == "function") {
					Object.assign(e.style, F[1]);
					let r = e.animate(F, {
						duration: _ * 1e3,
						delay: (a + i[t]) * 1e3,
						easing: "ease",
						fill: v ? "backwards" : "both"
					});
					D.add(r), O.add(r), S && r.pause(), r.onfinish = () => {
						x || n !== T || w < 0 || !O.delete(r) || (v && (r.onfinish = null, D.delete(r)), O.size || M());
					};
					return;
				}
				b.push(setTimeout(() => A(() => {
					e.style.transition = `opacity ${_}s ease,transform ${_}s ease,filter ${_}s ease`, Object.assign(e.style, F[1]), t === o && b.push(setTimeout(() => {
						M();
					}, _ * 1e3));
				}), (a + i[t]) * 1e3));
			});
		};
		return E = Mt(e, t, !1, (n) => {
			if (x || (n % 2 == 0 && (!C || !v) && (!C || !D.size ? L() : (w = 1, D.forEach((e) => O.add(e)), At(e, t), x || N())), x)) return;
			let i = T;
			[
				t.onEnter,
				t.onLeave,
				t.onEnterBack,
				t.onLeaveBack
			][n]?.(e), !(x || i !== T || n % 2 == 0 || v) && (t.removeClassOnLeave !== !1 && jt(e, t), !(x || i !== T) && (w = -1, D.size ? N() : (j(), r.forEach((e) => {
				e.style.transition = `opacity ${_}s ease,transform ${_}s ease,filter ${_}s ease`, Object.assign(e.style, F[0]);
			}))));
		}, y, null, () => {
			if (r[0] !== e) return e.getBoundingClientRect();
			let t = e.style.getPropertyValue("transform"), n = e.style.getPropertyPriority("transform");
			e.style.setProperty("transform", "none", "important");
			let i = e.getBoundingClientRect();
			return t ? e.style.setProperty("transform", t, n) : e.style.removeProperty("transform"), i;
		}), {
			el: e,
			type: "reveal",
			replay(e) {
				x || (Object.assign(t, e || {}), S = !1, y || E.disconnect(), j(), r.forEach(I), A(L));
			},
			pause() {
				x || (S = !0, D.forEach((e) => e.pause()));
			},
			resume() {
				x || (S = !1, N());
			},
			destroy() {
				x = !0, E.disconnect(), j(), r.forEach((e) => e.getAttribute("style")), i();
			}
		};
	}
};
//#endregion
//#region src/modules/counter.js
function Ft(e) {
	return e.format ? e.format : e.separator ? String(e.separator) : e.grouping === !0 || e.comma === !0 ? "," : "";
}
function It(e) {
	return e.classList.add("kt-counter-separator--blink"), null;
}
function Lt(e) {
	let t = `var(--kt-counter-seam,${e.seamColor || "rgba(0,0,0,.5)"})`, n = e.shadow === !1 || e.shadow === "none" ? "none" : typeof e.shadow == "string" ? e.shadow : "drop-shadow(0 2px 5px rgba(0,0,0,.3))";
	return {
		seam: t,
		shadow: `var(--kt-counter-flip-shadow,${n})`,
		hasShadow: n !== "none",
		separatorColor: e.separatorColor || ""
	};
}
function Rt(e, t, n) {
	if (!t) return;
	let r = document.createElement("span");
	r.className = n, r.textContent = t, e.appendChild(r);
}
function zt(e, t, n = "kt-counter-char") {
	let r = document.createElement("span");
	return r.className = n, r.textContent = t, r.style.display = "inline-block", e.appendChild(r), r;
}
function Bt(e, t) {
	let n = Number(t);
	if (t != null && Number.isFinite(n) && n > 0) return n;
	let r = getComputedStyle(e), i = Number.parseFloat(r.fontSize), a = String(r.lineHeight || "").trim(), o = Number.parseFloat(a);
	if (/px$/i.test(a) && Number.isFinite(o) && o > 0) return o;
	if (Number.isFinite(i) && i > 0) {
		if (/^\d*\.?\d+$/.test(a) && o > 0 || /^\d*\.?\d+em$/i.test(a) && o > 0) return i * o;
		if (/^\d*\.?\d+%$/.test(a) && o > 0) return i * o / 100;
	}
	let s = document.createElement("span");
	s.textContent = "0", s.setAttribute("aria-hidden", "true"), s.style.cssText = "position:absolute;visibility:hidden;pointer-events:none;display:inline-block;padding:0;border:0;line-height:inherit;", e.appendChild(s);
	let c = s.getBoundingClientRect().height;
	return s.remove(), Number.isFinite(c) && c > 0 ? c : Number.isFinite(i) && i > 0 ? i * 1.2 : 40;
}
function Vt(e, t, n = "") {
	let r = `${Math.max(1, t)}px`;
	e.style.cssText = `${n}overflow:hidden;height:${r};max-height:${r};block-size:${r};max-block-size:${r};contain:paint;`;
}
function Ht(e, t) {
	if (t.start === !1) return;
	let n = e.getBoundingClientRect();
	if (!(n.bottom > 0 && n.top < window.innerHeight)) return {
		trigger: e,
		start: t.start || "top 85%",
		toggleActions: t.once === !1 ? "play reverse play reverse" : "play none none none"
	};
}
var Ut = {
	create(e, t) {
		let n = re(), r = e.innerHTML, i = e.getAttribute("style"), a = se(e, ["aria-label", "aria-live"]), o = t.secondsOnly === !0, s = o ? "clock" : t.mode || t.preset || t.style || "slot", c = Number(t.from ?? 0), l = Number.parseFloat((e.textContent || "").replace(/[^0-9.-]/g, "")), u = Number(t.to ?? (Number.isFinite(l) ? l : 0)), d = Math.max(0, Number(t.duration ?? 2)), f = Math.max(0, Number(t.decimals ?? 0)), p = t.prefix || "", m = t.suffix || "", h = {
			decimals: f,
			format: Ft(t),
			locale: t.locale
		}, g = be(u, h), _ = `${p}${g}${m}`, v = Ht(e, t), y = [];
		e.setAttribute("aria-label", _), e.setAttribute("aria-live", "polite");
		let b = (e) => (e && y.push(e), e), x = () => {
			y.forEach((e) => {
				e.scrollTrigger?.kill?.(), e.kill?.();
			}), y.length = 0;
		};
		if (s === "plain") {
			let r = { value: c }, i = () => {
				e.textContent = `${p}${be(r.value, h)}${m}`;
			};
			i(), n ? b(n.to(r, {
				value: u,
				duration: d,
				delay: Number(t.delay ?? 0),
				ease: t.ease || "power2.out",
				onUpdate: i,
				onComplete: () => t.onComplete?.(e),
				scrollTrigger: v
			})) : (r.value = u, i(), t.onComplete?.(e));
		} else if (s === "digit") {
			e.innerHTML = "", e.style.display = "inline-flex", e.style.alignItems = "baseline", Rt(e, p, "kt-counter-prefix");
			let r = [];
			for (let t of g) /\d/.test(t) ? r.push({
				node: zt(e, "0", "kt-counter-digit"),
				target: Number(t)
			}) : zt(e, t, "kt-counter-separator");
			Rt(e, m, "kt-counter-suffix");
			let i = Math.max(0, Number(t.loops ?? 2)), a = Math.max(0, Number(t.stagger ?? .06));
			if (n) {
				let o = n.timeline({
					delay: Number(t.delay ?? 0),
					scrollTrigger: v,
					onComplete: () => t.onComplete?.(e)
				});
				r.forEach(({ node: e, target: n }, r) => {
					let s = { value: 0 }, c = i * 10 + n, l = -1;
					o.to(s, {
						value: c,
						duration: Math.max(.05, d + r * a),
						ease: t.ease || "none",
						onUpdate: () => {
							let t = Math.floor(s.value) % 10;
							t !== l && (l = t, e.textContent = String(t));
						},
						onComplete: () => {
							e.textContent = String(n);
						}
					}, 0);
				}), b(o);
			} else r.forEach(({ node: e, target: t }) => {
				e.textContent = String(t);
			}), t.onComplete?.(e);
		} else if (s === "pop") {
			e.innerHTML = "", e.style.display = "inline-flex", e.style.alignItems = "baseline", Rt(e, p, "kt-counter-prefix");
			let r = Array.from(g, (t) => zt(e, t, /\d/.test(t) ? "kt-counter-digit kt-counter-pop-char" : "kt-counter-separator kt-counter-pop-char"));
			Rt(e, m, "kt-counter-suffix");
			let i = t.popAlign || "bottom", a = i === "top" ? "50% 0%" : i === "center" ? "50% 50%" : "50% 85%", o = Math.max(1, Number(t.popScale ?? 1.8)), s = Math.max(.1, d || .8), c = Math.min(.36, Math.max(.14, s * .38)), l = Math.max(.05, Number(t.popDuration ?? c)), u = r.length > 1 ? Math.max(.025, (s - l) / (r.length - 1)) : 0, f = Math.max(0, Number(t.stagger ?? u));
			if (n) {
				let i = n.timeline({
					delay: Number(t.delay ?? 0),
					scrollTrigger: v,
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
					}, n * f);
				}), b(i);
			} else r.forEach((e, t) => {
				e.style.opacity = "0", e.style.transformOrigin = a, e.style.transform = `scale(${o})`, e.style.transition = `opacity ${l}s ease ${t * f}s,transform ${l}s cubic-bezier(.2,.9,.3,1.25) ${t * f}s`, requestAnimationFrame(() => {
					e.style.opacity = "1", e.style.transform = "scale(1)";
				});
			}), setTimeout(() => t.onComplete?.(e), (l + f * r.length) * 1e3);
		} else if (s === "flip") {
			e.innerHTML = "", e.style.display = "inline-flex", e.style.alignItems = "center", e.style.gap = `${Math.max(0, Number(t.gap ?? 3))}px`, Rt(e, p, "kt-counter-prefix");
			let n = t.tileColor || "#191b20", r = t.tileTextColor || "#f6f7fb", i = Math.max(0, Number(t.tileRadius ?? 6)), a = "1.24em", o = Lt(t), s = [], l = (e) => `position:absolute;left:0;right:0;height:50%;overflow:hidden;${e ? `top:0;border-radius:${i}px ${i}px 0 0` : `bottom:0;border-radius:0 0 ${i}px ${i}px`};background:${n};backface-visibility:hidden;`, f = (e) => `position:absolute;left:0;width:100%;height:${a};line-height:${a};text-align:center;${e ? "top:0" : "bottom:0"};color:${r};`, h = (e, t) => {
				let n = document.createElement("span");
				n.setAttribute("aria-hidden", "true"), n.style.cssText = l(e) + (t ? `transform-origin:50% ${e ? "100%" : "0%"};will-change:transform;z-index:3;` : "z-index:1;");
				let r = document.createElement("span");
				return r.style.cssText = f(e), r.textContent = "0", n.appendChild(r), {
					half: n,
					glyph: r
				};
			}, _ = u >= c, v = g.replace(/\D/g, "").length, y = String(Math.round(Math.abs(c))).padStart(v, "0").slice(-v), x = 0;
			for (let t of g) {
				if (!/\d/.test(t)) {
					let n = document.createElement("span");
					n.className = "kt-counter-separator", n.textContent = t, n.style.opacity = ".7", e.appendChild(n);
					continue;
				}
				let n = Number(y[x] || "0");
				x += 1;
				let r = document.createElement("span");
				r.className = "kt-counter-flip-cell", r.style.cssText = `display:inline-block;position:relative;width:1.34ch;height:${a};perspective:340px;${o.hasShadow ? `filter:${o.shadow};` : ""}`;
				let i = h(!0, !1), c = h(!1, !1), l = h(!0, !0), u = h(!1, !0);
				u.half.style.transform = "rotateX(90deg)", r.append(i.half, c.half, l.half, u.half);
				let d = document.createElement("span");
				d.className = "kt-counter-seam", d.setAttribute("aria-hidden", "true"), d.style.cssText = `position:absolute;left:0;right:0;top:50%;height:1px;margin-top:-0.5px;background:${o.seam};z-index:4;pointer-events:none;`, r.appendChild(d), e.appendChild(r), s.push({
					topStatic: i,
					bottomStatic: c,
					topFlap: l,
					bottomFlap: u,
					target: Number(t),
					start: n
				});
			}
			Rt(e, m, "kt-counter-suffix");
			let S = Math.max(0, Number(t.loops ?? 1)), C = /* @__PURE__ */ new Set(), w = !0, T = (e, t) => {
				let n = setTimeout(() => {
					C.delete(n), w && e();
				}, t);
				C.add(n);
			}, E = (e, t) => {
				e.topStatic.half.style.visibility = "visible", e.bottomStatic.half.style.visibility = "visible", e.topStatic.glyph.textContent = String(t), e.bottomStatic.glyph.textContent = String(t), e.topFlap.glyph.textContent = String(t), e.bottomFlap.glyph.textContent = String(t), e.topFlap.half.style.transform = "rotateX(0deg)", e.bottomFlap.half.style.transform = "rotateX(90deg)";
			}, D = (e) => e.withFilter, O = (e, t, n, r, i = !0) => {
				let a = Math.max(34, r / 2);
				if (i) {
					e.topStatic.glyph.textContent = String(n), e.bottomStatic.glyph.textContent = String(t), e.topFlap.glyph.textContent = String(t), e.bottomFlap.glyph.textContent = String(n), e.topFlap.half.style.transform = "rotateX(0deg)", e.bottomFlap.half.style.transform = "rotateX(90deg)", e.bottomStatic.half.style.visibility = "hidden";
					let r = D({
						withFilter: [{
							transform: "rotateX(0deg)",
							filter: "brightness(1)"
						}, {
							transform: "rotateX(-90deg)",
							filter: "brightness(.6)"
						}],
						plain: [{ transform: "rotateX(0deg)" }, { transform: "rotateX(-90deg)" }]
					}), i = D({
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
					}), T(() => {
						e.bottomFlap.half.animate(i, {
							duration: a,
							easing: "cubic-bezier(.15,.6,.3,1.15)",
							fill: "forwards"
						}), T(() => {
							e.bottomStatic.glyph.textContent = String(n), e.bottomStatic.half.style.visibility = "visible";
						}, a);
					}, a);
				} else {
					e.topStatic.glyph.textContent = String(t), e.bottomStatic.glyph.textContent = String(n), e.bottomFlap.glyph.textContent = String(t), e.topFlap.glyph.textContent = String(n), e.bottomFlap.half.style.transform = "rotateX(0deg)", e.topFlap.half.style.transform = "rotateX(-90deg)", e.topStatic.half.style.visibility = "hidden";
					let r = D({
						withFilter: [{
							transform: "rotateX(0deg)",
							filter: "brightness(1)"
						}, {
							transform: "rotateX(90deg)",
							filter: "brightness(.6)"
						}],
						plain: [{ transform: "rotateX(0deg)" }, { transform: "rotateX(90deg)" }]
					}), i = D({
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
					}), T(() => {
						e.topFlap.half.animate(i, {
							duration: a,
							easing: "cubic-bezier(.15,.6,.3,1.15)",
							fill: "forwards"
						}), T(() => {
							e.topStatic.glyph.textContent = String(n), e.topStatic.half.style.visibility = "visible";
						}, a);
					}, a);
				}
			}, k = () => {
				C.forEach(clearTimeout), C.clear(), w = !0;
				let n = Math.max(0, Number(t.stagger ?? .08)) * 1e3, r = 0;
				s.forEach((i, a) => {
					E(i, i.start);
					let o = _ ? ((i.target - i.start) % 10 + 10) % 10 : ((i.start - i.target) % 10 + 10) % 10, s = S * 10 + o;
					if (s === 0) return;
					r += 1;
					let c = Math.max(120, d * 1e3 / Math.max(1, s));
					for (let o = 1; o <= s; o += 1) {
						let l = o === s, u = _ ? (i.start + o - 1) % 10 : ((i.start - (o - 1)) % 10 + 10) % 10, d = _ ? (i.start + o) % 10 : ((i.start - o) % 10 + 10) % 10;
						T(() => {
							O(i, u, d, c, _), l && (--r, r === 0 && T(() => t.onComplete?.(e), c));
						}, a * n + (o - 1) * c + Number(t.delay ?? 0) * 1e3);
					}
				});
			}, A = e.getBoundingClientRect(), j = t.start === !1 || A.bottom > 0 && A.top < window.innerHeight, M = null;
			j ? k() : M = ae(e, k, { threshold: .3 }), b({
				restart: k,
				pause: () => {
					w = !1;
				},
				resume: () => {
					w = !0;
				},
				kill: () => {
					w = !1, C.forEach(clearTimeout), C.clear(), M?.disconnect();
				}
			});
		} else if (s === "clock") {
			e.innerHTML = "", e.style.display = "inline-flex", e.style.alignItems = "center", e.setAttribute("aria-live", "off");
			let n = Bt(e, t.lineHeight), r = t.seconds !== !1, i = Math.max(1, Math.round(Number(t.secondsDigits ?? 3))), a = String(t.secondsLabel ?? "S"), s = t.hour12 === !0, c = String(t.clockSeparator ?? ":"), l = t.blink !== !1, u = t.clockStyle || "roll", d = Math.max(80, Number(t.rollDuration ?? .28) * 1e3), f = String(t.daysLabel ?? "d"), h = t.until ? new Date(t.until) : null, g = t.since ? new Date(t.since) : null, _ = !1, v = (e) => String(e).padStart(2, "0"), y = () => {
				if (h || g) {
					let n = h ? h.getTime() - Date.now() : Date.now() - g.getTime();
					if (h && n <= 0 && !_ && (_ = !0, t.onComplete?.(e)), n = Math.max(0, n), o) return {
						text: `${String(Math.floor(n / 1e3)).padStart(i, "0")}${a}`,
						meridiem: "",
						days: null
					};
					let s = Math.floor(n / 864e5), l = [v(Math.floor(n / 36e5) % 24), v(Math.floor(n / 6e4) % 60)];
					return r && l.push(v(Math.floor(n / 1e3) % 60)), {
						text: l.join(c),
						meridiem: "",
						days: s
					};
				}
				let n = /* @__PURE__ */ new Date();
				if (o) return {
					text: `${String(n.getSeconds()).padStart(i, "0")}${a}`,
					meridiem: "",
					days: null
				};
				let l = n.getHours(), u = "";
				s && (u = l >= 12 ? "PM" : "AM", l = l % 12 || 12);
				let d = [v(l), v(n.getMinutes())];
				return r && d.push(v(n.getSeconds())), {
					text: d.join(c),
					meridiem: u,
					days: null
				};
			}, x = (e) => {
				let t = document.createElement("span");
				t.className = "kt-counter-digit kt-counter-clock-digit", Vt(t, n, "display:inline-block;min-width:1ch;text-align:center;vertical-align:bottom;");
				let r = document.createElement("span");
				r.style.cssText = "display:block;will-change:transform;";
				let i = document.createElement("span");
				return i.style.cssText = `display:block;height:${n}px;line-height:${n}px;`, i.textContent = e, r.appendChild(i), t.appendChild(r), {
					viewport: t,
					stack: r,
					value: e
				};
			}, S = Lt(t), C = {
				tileColor: t.tileColor || "#191b20",
				tileText: t.tileTextColor || "#f6f7fb",
				radius: Math.max(0, Number(t.tileRadius ?? 6))
			}, w = (e) => {
				let t = C, n = "1.24em", r = (e) => `position:absolute;left:0;right:0;height:50%;overflow:hidden;${e ? `top:0;border-radius:${t.radius}px ${t.radius}px 0 0` : `bottom:0;border-radius:0 0 ${t.radius}px ${t.radius}px`};background:${t.tileColor};backface-visibility:hidden;`, i = (e) => `position:absolute;left:0;width:100%;height:${n};line-height:${n};text-align:center;${e ? "top:0" : "bottom:0"};color:${t.tileText};`, a = (t, n) => {
					let a = document.createElement("span");
					a.setAttribute("aria-hidden", "true"), a.style.cssText = r(t) + (n ? `transform-origin:50% ${t ? "100%" : "0%"};will-change:transform;z-index:3;` : "z-index:1;");
					let o = document.createElement("span");
					return o.style.cssText = i(t), o.textContent = e, a.appendChild(o), {
						half: a,
						glyph: o
					};
				}, o = document.createElement("span");
				o.className = "kt-counter-digit kt-counter-clock-digit kt-counter-flip-cell", o.style.cssText = `display:inline-block;position:relative;width:1.34ch;height:1.24em;perspective:340px;${S.hasShadow ? `filter:${S.shadow};` : ""}margin:0 1px;`;
				let s = {
					topStatic: a(!0, !1),
					bottomStatic: a(!1, !1),
					topFlap: a(!0, !0),
					bottomFlap: a(!1, !0)
				};
				s.bottomFlap.half.style.transform = "rotateX(90deg)", o.append(s.topStatic.half, s.bottomStatic.half, s.topFlap.half, s.bottomFlap.half);
				let c = document.createElement("span");
				return c.className = "kt-counter-seam", c.setAttribute("aria-hidden", "true"), c.style.cssText = `position:absolute;left:0;right:0;top:50%;height:1px;margin-top:-0.5px;background:${S.seam};z-index:4;pointer-events:none;`, o.appendChild(c), {
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
				r.topStatic.glyph.textContent = t, r.bottomStatic.glyph.textContent = n, r.topFlap.glyph.textContent = n, r.bottomFlap.glyph.textContent = t, r.topFlap.half.style.transform = "rotateX(0deg)", r.bottomFlap.half.style.transform = "rotateX(90deg)", r.bottomStatic.half.style.visibility = "hidden";
				let a = [{
					transform: "rotateX(0deg)",
					filter: "brightness(1)"
				}, {
					transform: "rotateX(-90deg)",
					filter: "brightness(.6)"
				}], o = [{
					transform: "rotateX(90deg)",
					filter: "brightness(.6)"
				}, {
					transform: "rotateX(0deg)",
					filter: "brightness(1)"
				}];
				r.topFlap.half.animate(a, {
					duration: i,
					easing: "cubic-bezier(.55,0,.85,.5)",
					fill: "forwards"
				}), setTimeout(() => {
					r.bottomFlap.half.animate(o, {
						duration: i,
						easing: "cubic-bezier(.15,.6,.3,1.15)",
						fill: "forwards"
					}), setTimeout(() => {
						r.bottomStatic.glyph.textContent = t, r.bottomStatic.half.style.visibility = "visible";
					}, i);
				}, i);
			}, E = [], D = null, O = null, k = "", A = /* @__PURE__ */ new Set(), j = (e) => e != null && (e > 0 || t.showDays === !0), M = (e) => `${j(e.days) ? String(e.days).length : 0}|${e.text.length}`, N = (t) => {
				A.forEach((e) => e.cancel()), A.clear(), e.innerHTML = "", E = [], D = null, O = null, Rt(e, p, "kt-counter-prefix"), j(t.days) && (O = document.createElement("span"), O.className = "kt-counter-days", O.style.cssText = "margin-right:.5ch;", O.textContent = `${t.days}${f}`, e.appendChild(O));
				for (let n of t.text) if (/\d/.test(n)) {
					let t = u === "flip" ? w(n) : x(n);
					e.appendChild(t.viewport), E.push(t);
				} else {
					let t = zt(e, n, "kt-counter-separator kt-counter-clock-separator");
					if (l && n === c) {
						let e = It(t);
						e && A.add(e);
					}
					E.push(null);
				}
				s && !h && !g && (D = document.createElement("span"), D.className = "kt-counter-suffix kt-counter-meridiem", D.style.cssText = "margin-left:.4ch;font-size:.55em;opacity:.75;align-self:center;", D.textContent = t.meridiem, e.appendChild(D)), Rt(e, m, "kt-counter-suffix");
			}, P = (e, r) => {
				if (u === "flip") {
					T(e, r);
					return;
				}
				e.value = r;
				let i = e.stack.firstChild;
				if (u === "instant" || !e.stack.animate) {
					i.textContent = r;
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
						i.textContent = r;
					}, d / 2);
					return;
				}
				let a = (t.rollDirection || (h ? "down" : "up")) === "down", o = document.createElement("span");
				if (o.style.cssText = `display:block;height:${n}px;line-height:${n}px;`, o.textContent = r, a) for (e.stack.insertBefore(o, e.stack.firstChild); e.stack.children.length > 2;) e.stack.lastChild.remove();
				else for (e.stack.appendChild(o); e.stack.children.length > 2;) e.stack.firstChild.remove();
				let s = e.stack.animate(a ? [{ transform: `translateY(-${n}px)` }, { transform: "translateY(0)" }] : [{ transform: "translateY(0)" }, { transform: `translateY(-${n}px)` }], {
					duration: d,
					easing: "cubic-bezier(.3,.7,.25,1)",
					fill: "forwards"
				});
				s.finished.catch(() => {}).finally(() => {
					e.stack.children.length > 1 && (a ? e.stack.lastChild.remove() : e.stack.firstChild.remove()), s.cancel?.();
				});
			}, F = (t) => {
				let n = j(t.days) ? `${t.days}${f} ` : "";
				e.setAttribute("aria-label", `${n}${t.text}${t.meridiem ? ` ${t.meridiem}` : ""}`);
			}, I = y();
			k = M(I), N(I), F(I);
			let L = !0, R = () => {
				if (!L) return;
				let e = y(), t = M(e);
				if (t !== k) k = t, N(e);
				else {
					if (Array.from(e.text).forEach((e, t) => {
						let n = E[t];
						n && n.value !== e && P(n, e);
					}), O) {
						let t = `${e.days}${f}`;
						O.textContent !== t && (O.textContent = t);
					}
					D && D.textContent !== e.meridiem && (D.textContent = e.meridiem);
				}
				F(e);
			}, z = setInterval(R, 250);
			b({
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
			let r = Bt(e, t.lineHeight);
			e.innerHTML = "", e.style.display = "inline-flex", e.style.alignItems = "flex-end", e.style.overflow = "hidden", Rt(e, p, "kt-counter-prefix");
			let i = g.replace(/\D/g, "").length, a = String(Math.round(Math.abs(c))).padStart(i, "0").slice(-i), o = u >= c, s = [], l = 0;
			for (let n of g) {
				if (!/\d/.test(n)) {
					zt(e, n, "kt-counter-separator");
					continue;
				}
				let i = Number(n), c = Number(a[l] || "0");
				l += 1;
				let u = Math.max(0, Number(t.loops ?? 3 + Math.floor(Math.random() * 2))), d = (o ? ((i - c) % 10 + 10) % 10 : ((c - i) % 10 + 10) % 10) + u * 10, f = document.createElement("span");
				f.className = "kt-counter-slot", Vt(f, r, "display:inline-block;vertical-align:bottom;");
				let p = document.createElement("span");
				p.className = "kt-counter-reel", p.style.cssText = "display:flex;flex-direction:column;will-change:transform;";
				let m = [];
				for (let e = 0; e <= d; e += 1) m.push(o ? (c + e) % 10 : ((c - e) % 10 + 10) % 10);
				o || m.reverse(), m.forEach((e) => {
					let t = document.createElement("span");
					t.textContent = String(e), t.style.cssText = `height:${r}px;line-height:${r}px;display:flex;align-items:center;justify-content:center;`, p.appendChild(t);
				}), f.appendChild(p), e.appendChild(f), s.push({
					reel: p,
					fromY: o ? 0 : -(d * r),
					toY: o ? -(d * r) : 0
				});
			}
			if (Rt(e, m, "kt-counter-suffix"), n) {
				let r = n.timeline({
					delay: Number(t.delay ?? 0),
					scrollTrigger: v,
					onComplete: () => t.onComplete?.(e)
				});
				s.forEach(({ reel: e, fromY: n, toY: i }, a) => {
					r.fromTo(e, { y: n }, {
						y: i,
						duration: d + a * Number(t.stagger ?? .1),
						ease: t.ease || "power3.inOut"
					}, 0);
				}), b(r);
			} else s.forEach(({ reel: e, toY: t }) => {
				e.style.transform = `translateY(${t}px)`;
			}), t.onComplete?.(e);
		}
		return t.separatorColor && e.querySelectorAll(".kt-counter-separator").forEach((e) => {
			e.style.color = `var(--kt-counter-separator,${t.separatorColor})`;
		}), t.blinkSeparators === !0 && s !== "clock" && s !== "plain" && e.querySelectorAll(".kt-counter-separator").forEach((e) => {
			let t = It(e);
			t && b({
				kill: () => t.cancel(),
				pause: () => t.pause(),
				resume: () => t.play()
			});
		}), {
			el: e,
			type: "counter",
			replay: () => y.forEach((e) => e.restart?.()),
			pause: () => y.forEach((e) => e.pause?.()),
			resume: () => y.forEach((e) => e.resume?.()),
			destroy: () => {
				x(), e.innerHTML = r, i == null ? e.removeAttribute("style") : e.setAttribute("style", i), a();
			}
		};
	},
	reduced(e, t) {
		let n = e.innerHTML, r = e.getAttribute("style");
		if ((t.secondsOnly === !0 ? "clock" : t.mode || t.preset || t.style || "slot") === "clock") {
			let i = String(t.clockSeparator ?? ":"), a = t.seconds !== !1, o = t.hour12 === !0, s = () => {
				let n = (e) => String(e).padStart(2, "0"), r = t.secondsOnly === !0;
				if (t.until || t.since) {
					let o = t.until ? new Date(t.until) : new Date(t.since), s = Math.max(0, t.until ? o.getTime() - Date.now() : Date.now() - o.getTime());
					if (r) {
						let n = Math.max(1, Math.round(Number(t.secondsDigits ?? 3)));
						e.textContent = `${String(Math.floor(s / 1e3)).padStart(n, "0")}${String(t.secondsLabel ?? "S")}`;
						return;
					}
					let c = Math.floor(s / 864e5), l = [n(Math.floor(s / 36e5) % 24), n(Math.floor(s / 6e4) % 60)];
					a && l.push(n(Math.floor(s / 1e3) % 60));
					let u = c > 0 || t.showDays === !0 ? `${c}${t.daysLabel ?? "d"} ` : "";
					e.textContent = `${t.prefix || ""}${u}${l.join(i)}${t.suffix || ""}`;
					return;
				}
				let s = /* @__PURE__ */ new Date();
				if (r) {
					let n = Math.max(1, Math.round(Number(t.secondsDigits ?? 3)));
					e.textContent = `${String(s.getSeconds()).padStart(n, "0")}${String(t.secondsLabel ?? "S")}`;
					return;
				}
				let c = s.getHours(), l = "";
				o && (l = c >= 12 ? " PM" : " AM", c = c % 12 || 12);
				let u = [n(c), n(s.getMinutes())];
				a && u.push(n(s.getSeconds())), e.textContent = `${t.prefix || ""}${u.join(i)}${l}${t.suffix || ""}`;
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
		let i = Math.max(0, Number(t.decimals ?? 0)), a = Number.parseFloat((e.textContent || "").replace(/[^0-9.-]/g, "")), o = Number(t.to ?? (Number.isFinite(a) ? a : 0)), s = Ft(t);
		return e.textContent = `${t.prefix || ""}${be(o, {
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
};
//#endregion
//#region src/modules/dateTime.js
function Wt(e, t = "") {
	if (e instanceof Date && !Number.isNaN(e.getTime())) return e;
	if (typeof e == "number" && Number.isFinite(e)) return new Date(e < 0xe8d4a51000 ? e * 1e3 : e);
	let n = String(e ?? "").trim();
	if (!n) return null;
	if (/^\d{10,13}$/.test(n)) return Wt(Number(n), t);
	let r = /^ko(?:-|$)/i.test(String(t)), i = (e, t, n) => {
		let r = new Date(Date.UTC(Number(e), Number(t) - 1, Number(n)));
		return r.getUTCFullYear() === Number(e) && r.getUTCMonth() === Number(t) - 1 && r.getUTCDate() === Number(n);
	}, a = (e = "0", t = "0", n = "0", r = "0") => {
		let i = Number(e), a = Number(t), o = Number(n), s = String(r), c = Number(s.slice(0, 3).padEnd(3, "0"));
		return /^\d+$/.test(s) && Number.isInteger(i) && i >= 0 && i <= 23 && Number.isInteger(a) && a >= 0 && a <= 59 && Number.isInteger(o) && o >= 0 && o <= 59 && Number.isInteger(c) && c >= 0 && c <= 999;
	}, o = (e = "0") => {
		let t = String(e);
		return /^\d+$/.test(t) ? t.slice(0, 3).padEnd(3, "0") : null;
	}, s = (e) => {
		if (!e) return "";
		if (String(e).toUpperCase() === "Z") return "Z";
		let t = String(e).match(/^([+-])(\d{2}):?(\d{2})$/);
		return !t || Number(t[2]) > 23 || Number(t[3]) > 59 ? null : `${t[1]}${t[2]}:${t[3]}`;
	}, c = n.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})(?:(?:[T\s]+)(\d{1,2})(?::?(\d{2}))?(?::?(\d{2})(?:\.(\d+))?)?\s*(Z|[+-]\d{2}:?\d{2})?)?$/i);
	if (c) {
		let [, e, t, n, l, u = "0", d = "0", f = "0", p] = c;
		if (!i(e, t, n)) return null;
		let m = s(p);
		if (p && !m) return null;
		if (l === void 0) {
			if (p) return null;
			let i = r ? /* @__PURE__ */ new Date(`${e}-${String(t).padStart(2, "0")}-${String(n).padStart(2, "0")}T00:00:00.000+09:00`) : /* @__PURE__ */ new Date(`${e}-${String(t).padStart(2, "0")}-${String(n).padStart(2, "0")}`);
			return Number.isNaN(i.getTime()) ? null : i;
		}
		if (!a(l, u, d, f)) return null;
		let h = m || (r ? "+09:00" : ""), g = o(f);
		if (!g) return null;
		let _ = `${e}-${String(t).padStart(2, "0")}-${String(n).padStart(2, "0")}T${String(l).padStart(2, "0")}:${String(u).padStart(2, "0")}:${String(d).padStart(2, "0")}.${g}${h}`, v = new Date(_);
		return Number.isNaN(v.getTime()) ? null : v;
	}
	let l = new Date(n);
	if (!Number.isNaN(l.getTime()) && (/^\d{4}-\d{2}-\d{2}(?:$|[T\s])/.test(n) || /^[A-Za-z]{3},\s/.test(n))) return l;
	let u = n.match(/^(\d{4})(\d{2})(\d{2})(?:(\d{2})(\d{2})(\d{2})(?:\.(\d{1,3}))?)?$/);
	if (u) {
		let [, e, t, n, o = "0", s = "0", c = "0", l = "0"] = u;
		if (!i(e, t, n) || !a(o, s, c, l)) return null;
		let d = `${e}-${t}-${n}T${o.padStart(2, "0")}:${s.padStart(2, "0")}:${c.padStart(2, "0")}.${l.padEnd(3, "0")}${r ? "+09:00" : ""}`, f = new Date(d);
		return Number.isNaN(f.getTime()) ? null : f;
	}
	let d = n.match(/^(\d{4})\s*년\s*(\d{1,2})\s*월\s*(\d{1,2})\s*일(?:\s*(\d{1,2})\s*시)?(?:\s*(\d{1,2})\s*분)?(?:\s*(\d{1,2})\s*초)?$/);
	if (d) {
		let [, e, t, n, r = "0", o = "0", s = "0"] = d;
		if (!i(e, t, n) || !a(r, o, s)) return null;
		let c = /* @__PURE__ */ new Date(`${e}-${t.padStart(2, "0")}-${n.padStart(2, "0")}T${r.padStart(2, "0")}:${o.padStart(2, "0")}:${s.padStart(2, "0")}+09:00`);
		return Number.isNaN(c.getTime()) ? null : c;
	}
	let f = n.match(/^(\d{4})\s*년\s*(\d{1,2})\s*월\s*(\d{1,2})\s*일(?:\s+(\d{1,2})(?::(\d{2})(?::(\d{2}))?)?)?$/);
	if (f) {
		let [, e, t, n, r = "0", o = "0", s = "0"] = f;
		if (!i(e, t, n) || !a(r, o, s)) return null;
		let c = /* @__PURE__ */ new Date(`${e}-${t.padStart(2, "0")}-${n.padStart(2, "0")}T${r.padStart(2, "0")}:${o.padStart(2, "0")}:${s.padStart(2, "0")}+09:00`);
		return Number.isNaN(c.getTime()) ? null : c;
	}
	let p = n.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{4})(?:[ T](\d{1,2}):?(\d{2})?(?::?(\d{2})(?:\.(\d+))?)?\s*(Z|[+-]\d{2}:?\d{2})?)?$/i);
	if (p) {
		let [, e, n, c, l, u, d, f = "0", m] = p, h = l ?? "0", g = u ?? "0", _ = d ?? "0", v = Number(e), y = Number(n), b = /^en-US(?:-|$)/i.test(String(t)), x = v > 12 ? y : y > 12 || b ? v : y, S = v > 12 ? v : y > 12 || b ? y : v, C = s(m);
		if (m && !C) return null;
		if (x >= 1 && x <= 12 && S >= 1 && S <= 31 && i(c, x, S) && a(h, g, _, f)) {
			if (r || C) {
				let e = o(f);
				if (!e) return null;
				let t = C || "+09:00";
				return /* @__PURE__ */ new Date(`${c}-${String(x).padStart(2, "0")}-${String(S).padStart(2, "0")}T${String(h).padStart(2, "0")}:${String(g).padStart(2, "0")}:${String(_).padStart(2, "0")}.${e}${t}`);
			}
			return new Date(Number(c), x - 1, S, Number(h), Number(g), Number(_), Number(o(f)));
		}
	}
	let m = n.replace(/\./g, "-").replace(/\//g, "-"), h = new Date(m);
	return Number.isNaN(h.getTime()) ? null : h;
}
var Gt = [
	["year", 315576e5],
	["month", 26298e5],
	["week", 6048e5],
	["day", 864e5],
	["hour", 36e5],
	["minute", 6e4],
	["second", 1e3]
];
function Kt(e, t, n) {
	let r = String(n.relativeUnit || "auto"), [i, a] = Gt.find(([e]) => e === r) || Gt.find(([, t]) => Math.abs(e) >= t) || Gt.at(-1), o = e / a, s = String(n.relativeRounding || "round"), c = s === "floor" ? Math.floor(o) : s === "ceil" ? Math.ceil(o) : s === "trunc" ? Math.trunc(o) : Math.round(o);
	return new Intl.RelativeTimeFormat(t || void 0, {
		numeric: n.numeric || "auto",
		style: n.relativeStyle || "long"
	}).format(c, i);
}
function qt(e, t) {
	let n = Number(t.relativeCutoff ?? 0);
	if (!Number.isFinite(n) || n <= 0) return !1;
	let r = Gt.find(([e]) => e === String(t.relativeCutoffUnit || "day"));
	return !!r && Math.abs(e) >= n * r[1];
}
var Jt = { create(e, t) {
	let n = e.innerHTML, r = e.getAttribute("style"), i = se(e, [
		"aria-label",
		"aria-live",
		"datetime"
	]), a = t.locale || document.documentElement.lang || void 0, o = Wt(t.value ?? t.date ?? t.datetime ?? t.source ?? e.getAttribute("datetime") ?? e.textContent, a), s = t.mode || t.preset || "relative", c = Math.max(1e3, Number(t.updateInterval ?? 3e4)), l = () => {
		if (!o) {
			e.textContent = t.fallback || n || "";
			return;
		}
		let r = t.now ? new Date(t.now).getTime() : Date.now(), i = o.getTime() - r, c = Kt(i, a, t), l = new Intl.DateTimeFormat(a, {
			dateStyle: t.dateStyle || "medium",
			timeStyle: t.timeStyle || void 0,
			timeZone: t.timeZone || void 0
		}).format(o);
		e.textContent = s === "absolute" ? l : s === "both" ? `${c} · ${l}` : qt(i, t) ? l : c, e.setAttribute("datetime", o.toISOString()), e.setAttribute("aria-label", e.textContent);
	};
	e.setAttribute("aria-live", "off"), l();
	let u = s === "absolute" || t.live === !1 ? null : setInterval(l, c);
	return {
		el: e,
		type: "dateTime",
		render: l,
		destroy() {
			u && clearInterval(u), e.innerHTML = n, r == null ? e.removeAttribute("style") : e.setAttribute("style", r), i();
		}
	};
} }, Yt = [
	0,
	2,
	3,
	1
], Xt = (e) => {
	let t = e.length, n = [];
	for (let r = 0; r < t * 2; r += 1) {
		let i = [];
		for (let n = 0; n < t * 2; n += 1) {
			let a = (r < t ? 0 : 2) + (n < t ? 0 : 1);
			i.push(e[r % t][n % t] * 4 + Yt[a]);
		}
		n.push(i);
	}
	return n;
}, Zt = (e) => {
	let t = [[0]];
	for (; t.length < e;) t = Xt(t);
	return t;
}, Qt = [
	[
		24,
		10,
		12,
		26,
		35,
		47,
		49,
		37
	],
	[
		8,
		0,
		2,
		14,
		45,
		59,
		61,
		51
	],
	[
		22,
		6,
		4,
		16,
		43,
		57,
		63,
		53
	],
	[
		30,
		20,
		18,
		28,
		33,
		41,
		55,
		39
	],
	[
		34,
		46,
		48,
		36,
		25,
		11,
		13,
		27
	],
	[
		44,
		58,
		60,
		50,
		9,
		1,
		3,
		15
	],
	[
		42,
		56,
		62,
		52,
		23,
		7,
		5,
		17
	],
	[
		32,
		40,
		54,
		38,
		31,
		21,
		19,
		29
	]
], $t = (e) => {
	let t = e.length, n = t * t;
	return e.map((e) => e.map((e) => (e + .5) / n));
}, en = Object.freeze({
	"2x2": $t(Zt(2)),
	"4x4": $t(Zt(4)),
	"8x8": $t(Zt(8)),
	"16x16": $t(Zt(16)),
	cluster: $t(Qt)
}), tn = (e, t, n) => {
	let r = 52.9829189 * (.06711056 * (e + n * 1.7) + .00583715 * (t + n));
	return r - Math.floor(r);
}, nn = Object.freeze([
	"8x8",
	"4x4",
	"2x2",
	"16x16",
	"cluster",
	"noise",
	"random",
	"floyd-steinberg",
	"atkinson"
]), rn = Object.freeze([
	"dot",
	"square",
	"line",
	"cross",
	"diamond",
	"ring",
	"triangle"
]), an = "@%#*+=-:. ";
function on(e) {
	let t = (Number(e) || 2654435769) >>> 0;
	return () => {
		t = t + 1831565813 >>> 0;
		let e = t;
		return e = Math.imul(e ^ e >>> 15, e | 1), e ^= e + Math.imul(e ^ e >>> 7, e | 61), ((e ^ e >>> 14) >>> 0) / 4294967296;
	};
}
var sn = 256, cn = "#010203", ln = /* @__PURE__ */ new Map(), un = /^var\(\s*(--[\w-]+)\s*(?:,\s*([\s\S]+?)\s*)?\)$/;
function dn(e, t = null) {
	let n = String(e ?? "").trim(), r = un.exec(n);
	if (!r) return n;
	if (typeof window > "u" || typeof getComputedStyle != "function") return r[2] || "";
	let i = (t && t.nodeType === 1 ? t : null) || (typeof document < "u" ? document.documentElement : null);
	return i ? getComputedStyle(i).getPropertyValue(r[1]).trim() || r[2] || "" : r[2] || "";
}
function fn(e, t = [
	0,
	0,
	0
], n = null) {
	let r = dn(e, n);
	if (!r) return t;
	if (ln.has(r)) return ln.get(r);
	let i = typeof document < "u" ? document.createElement("canvas").getContext("2d") : null;
	if (!i) return t;
	let a = t;
	if (i.fillStyle = cn, i.fillStyle = r, i.fillStyle !== cn || r.toLowerCase() === cn) {
		i.fillRect(0, 0, 1, 1);
		let [e, t, n] = i.getImageData(0, 0, 1, 1).data;
		a = [
			e,
			t,
			n
		];
	}
	return ln.size >= sn && ln.clear(), ln.set(r, a), a;
}
var pn = (e, t, n) => e + (t - e) * n, mn = (e, t, n) => (.2126 * e + .7152 * t + .0722 * n) / 255;
function hn(e, t, n, r) {
	let i = Math.max(n / e, r / t), a = Math.min(e, n / i), o = Math.min(t, r / i);
	return {
		sx: (e - a) / 2,
		sy: (t - o) / 2,
		sw: a,
		sh: o
	};
}
function gn(e) {
	return e ? e.videoWidth || e.videoHeight ? {
		width: e.videoWidth,
		height: e.videoHeight
	} : e.naturalWidth || e.naturalHeight ? {
		width: e.naturalWidth,
		height: e.naturalHeight
	} : {
		width: e.width || 0,
		height: e.height || 0
	} : {
		width: 0,
		height: 0
	};
}
function _n(e, t, n, r) {
	let i = e * 374761393 + t * 668265263 + n * 2246822519 + r | 0;
	return i = Math.imul(i ^ i >>> 13, 1274126177), ((i ^ i >>> 16) >>> 0) / 4294967296;
}
function vn(e, t, n, r) {
	let i = Math.max(3, n), a = (e) => e * e * (3 - 2 * e), o = e / i, s = t / i, c = Math.floor(o), l = Math.floor(s), u = a(o - c), d = a(s - l), f = _n(c, l, 0, r) * (1 - u) + _n(c + 1, l, 0, r) * u, p = _n(c, l + 1, 0, r) * (1 - u) + _n(c + 1, l + 1, 0, r) * u;
	return G((f * (1 - d) + p * d) * .82 + _n(e, t, 0, r) * .18, 0, 1);
}
var yn = Object.freeze([
	"none",
	"drift",
	"shuffle",
	"scan",
	"flow",
	"pulse"
]), bn = Object.freeze([
	"none",
	"lens",
	"spotlight",
	"ripple"
]);
function xn(e, t = {}) {
	return {
		style: e,
		originalColors: t.originalColors === !0,
		paper: fn(t.paperColor, [
			244,
			241,
			234
		], t.scope),
		ink: fn(t.inkColor, [
			17,
			17,
			17
		], t.scope),
		accent: t.accentColor ? fn(t.accentColor, [
			0,
			0,
			0
		], t.scope) : null,
		colorSteps: G(Math.round(Number(t.colorSteps ?? (e === "dither" ? 2 : 4))), 2, 8),
		inverted: t.inverted === !0,
		seed: t.seed,
		type: nn.includes(t.type) ? t.type : "8x8",
		shape: rn.includes(t.shape) ? t.shape : "dot",
		angle: K(t.angle, 0, 0, 90),
		chars: typeof t.chars == "string" && t.chars.length >= 2 ? t.chars : an,
		font: t.font || "ui-monospace, \"SF Mono\", Menlo, Consolas, monospace",
		contrast: K(t.contrast, 1, 0, 3),
		brightness: K(t.brightness, 0, -1, 1),
		...Sn(t)
	};
}
function Sn(e = {}) {
	return {
		motion: yn.includes(e.motion) ? e.motion : "none",
		motionSpeed: K(e.motionSpeed, 1, .05, 6),
		motionAmount: K(e.motionAmount, .5, 0, 1),
		pointer: bn.includes(e.pointer) ? e.pointer : "none",
		pointerRadius: K(e.pointerRadius, 140, 10, 1200),
		pointerStrength: K(e.pointerStrength, .6, 0, 1),
		pointerCellSize: K(e.pointerCellSize, 0, 0, 64)
	};
}
var Cn = Object.freeze([
	"motion",
	"motionSpeed",
	"motionAmount",
	"pointer",
	"pointerRadius",
	"pointerStrength",
	"pointerCellSize"
]);
function wn(e, t, { maxDpr: n = 2 } = {}) {
	let r = e.getContext("2d", {
		alpha: !0,
		desynchronized: !0
	}), i = document.createElement("canvas"), a = i.getContext("2d", {
		alpha: !0,
		willReadFrequently: !0
	}), o = (Number(t.seed) || 2654435769) | 0, s = on(t.seed), c = 0, l = 0, u = 1, d = null, f = t.type === "floyd-steinberg" ? [
		[
			1,
			0,
			7 / 16
		],
		[
			-1,
			1,
			3 / 16
		],
		[
			0,
			1,
			5 / 16
		],
		[
			1,
			1,
			1 / 16
		]
	] : t.type === "atkinson" ? [
		[
			1,
			0,
			1 / 8
		],
		[
			2,
			0,
			1 / 8
		],
		[
			-1,
			1,
			1 / 8
		],
		[
			0,
			1,
			1 / 8
		],
		[
			1,
			1,
			1 / 8
		],
		[
			0,
			2,
			1 / 8
		]
	] : null, p = t.type === "atkinson" ? 3 : 2, m = (t, i) => {
		u = G(typeof window < "u" && window.devicePixelRatio || 1, 1, n), c = Math.max(1, Math.round(Math.max(1, t) * u)), l = Math.max(1, Math.round(Math.max(1, i) * u)), (e.width !== c || e.height !== l) && (e.width = c, e.height = l), r.setTransform(1, 0, 0, 1, 0, 0);
	}, h = (e, t, n = 0, r = 0) => {
		let { width: o, height: s } = gn(e);
		if (!o || !s) return null;
		let u = n !== 0 || r !== 0, d = Math.max(1, Math.ceil(c / t) + +!!u), f = Math.max(1, Math.ceil(l / t) + +!!u);
		(i.width !== d || i.height !== f) && (i.width = d, i.height = f);
		let p = hn(o, s, c, l), m = d * t / c, h = f * t / l;
		a.imageSmoothingEnabled = !0, a.clearRect(0, 0, d, f);
		try {
			a.drawImage(e, p.sx, p.sy, p.sw * m, p.sh * h, 0, 0, d, f);
			let i = a.getImageData(0, 0, d, f);
			return {
				cols: d,
				rows: f,
				cell: t,
				originX: -n,
				originY: -r,
				imageData: i,
				data: i.data
			};
		} catch {
			return null;
		}
	}, g = (e, t) => Math.round(e * (t - 1)) / (t - 1), _ = (e, n, r = null) => {
		if (t.originalColors) {
			let e = t.colorSteps;
			return n.map((t) => {
				let n = t / 255 * (e - 1);
				if (r == null) return Math.round(g(t / 255, e) * 255);
				let i = Math.floor(n);
				return Math.round(G((i + +(n - i > r)) / (e - 1), 0, 1) * 255);
			});
		}
		let i = t.paper, a = t.ink;
		return t.accent && e > 0 && e < 1 && (e < .5 ? (a = t.accent, e *= 2) : (i = t.accent, e = e * 2 - 1)), [
			pn(i[0], a[0], e),
			pn(i[1], a[1], e),
			pn(i[2], a[2], e)
		];
	}, v = ([e, t, n]) => `rgb(${Math.round(e)},${Math.round(t)},${Math.round(n)})`, y = (e) => G((e - .5) * t.contrast + .5 + t.brightness, 0, 1), b = (e, n) => {
		let r = y(mn(e[n], e[n + 1], e[n + 2])), i = e[n + 3] / 255;
		return G((t.inverted ? r : 1 - r) * i, 0, 1);
	}, x = (e, n, r, i) => {
		let { motion: a, motionAmount: s, motionSpeed: c } = t, l = (r || 0) / 1e3, d = Math.floor(l * c * 18), f = l * c, p = Math.max(1, e.rows * .12), m = (f * .45 % 1.3 - .15) * e.rows, h = a === "pulse" ? Math.sin(f * 2.2) * .22 * s : 0, g = a === "drift" ? Math.floor(f * 3.1) : 0, _ = a === "drift" ? Math.floor(f * 2.3) : 0, v = a === "drift" ? (e, t) => Math.sin(e * .21 + t * .16 - f * 2.6) * .05 * s : null, y = a === "drift" ? f * 5 : 0, b = i && i.active ? i.x : null, x = i && i.active ? i.y : null, S = t.pointerRadius * u, C = t.pointerStrength, w = t.pointer !== "none" && b != null;
		return {
			pulse: h,
			noisePhase: y,
			falloff(e, t) {
				if (!w) return 1;
				let n = Math.hypot(e - b, t - x) / S;
				return n >= 1 ? 1 : n * n * (3 - 2 * n);
			},
			driftX: g,
			driftY: _,
			inkShift(e, r, i, u) {
				let f = h;
				if (v && (f += v(e, r)), a === "shuffle" && _n(e, r, d, o ^ 20973) < s * .5) f += (_n(e, r, d + 1, o) - .5) * .9;
				else if (a === "scan") {
					let e = Math.abs(r - m);
					e < p && (f += (1 - e / p) * .45 * s);
				}
				if (w && t.pointer !== "lens") {
					let e = 1 - this.falloff(i, u);
					if (e > 0) {
						if (t.pointer === "spotlight") f += e * C * .7;
						else if (t.pointer === "ripple") {
							let t = Math.sin(Math.hypot(i - b, u - x) / (n * 2) - l * 4 * c);
							f += e * t * C * .5;
						}
					}
				}
				return f;
			},
			thresholdShift(e, t) {
				return a === "drift" ? (_n(e, t, d, o ^ 40503) - .5) * .14 * s : a === "shuffle" && _n(e, t, d, o ^ 20973) < s * .5 ? _n(e, t, d + 7, o) - .5 : 0;
			},
			glyphShift(e, t) {
				return a === "shuffle" && _n(e, t, d, o ^ 12059) < s ? _n(e, t, d + 3, o) < .5 ? -1 : 1 : +(a === "drift" && _n(e, t, d, o ^ 31802) < s * .3);
			}
		};
	}, S = (e, n) => {
		let { cols: o, rows: c, cell: l, data: u, originX: m, originY: h } = e, v = t.colorSteps, y = en[t.type], x = t.originalColors ? 3 : 1, S = o * x;
		if (f) {
			let e = S * p;
			!d || d.length !== e ? d = new Float32Array(e) : d.fill(0);
		}
		let C = (e, t, n, r) => {
			for (let [i, a, s] of f) {
				let l = e + i;
				l >= 0 && l < o && t + a < c && (d[a * S + l * x + n] += r * s);
			}
		}, w = [
			0,
			0,
			0
		];
		for (let e = 0; e < c; e += 1) {
			for (let r = 0; r < o; r += 1) {
				let i = (e * o + r) * 4;
				for (let e = 0; e < 3; e += 1) w[e] = u[i + e];
				let a = m + r * l + l / 2, c = h + e * l + l / 2, p;
				if (f) {
					for (let o = 0; o < x; o += 1) {
						let s = G((t.originalColors ? w[o] / 255 : b(u, i) + n.inkShift(r, e, a, c)) + d[r * x + o], 0, 1), l = g(s, v);
						C(r, e, o, s - l), t.originalColors ? w[o] = Math.round(l * 255) : p = _(l);
					}
					t.originalColors && (p = w);
				} else {
					let o = G((y ? y[(e + n.driftY) % y.length][(r + n.driftX) % y.length] : t.type === "noise" ? tn(r, e, n.noisePhase) : s()) + n.thresholdShift(r, e), 0, 1);
					if (t.originalColors) p = _(0, w, o);
					else {
						let t = G(b(u, i) + n.inkShift(r, e, a, c), 0, 1) * (v - 1), s = Math.floor(t);
						p = _(G((s + +(t - s > o)) / (v - 1), 0, 1));
					}
				}
				u[i] = p[0], u[i + 1] = p[1], u[i + 2] = p[2], u[i + 3] = 255;
			}
			f && (d.copyWithin(0, S), d.fill(0, -S));
		}
		a.putImageData(e.imageData, 0, 0), r.imageSmoothingEnabled = !1, r.drawImage(i, 0, 0, o, c, m, h, o * l, c * l);
	}, C = {
		square(e, t, n, r, i) {
			let a = r * Math.sqrt(i);
			e.fillRect(t - a / 2, n - a / 2, a, a);
		},
		line(e, t, n, r, i) {
			let a = Math.max(.5, r * i);
			e.fillRect(t - r / 2, n - a / 2, r, a);
		},
		cross(e, t, n, r, i) {
			let a = r * Math.sqrt(i), o = Math.max(.5, a * .36);
			e.fillRect(t - a / 2, n - o / 2, a, o), e.fillRect(t - o / 2, n - a / 2, o, a);
		},
		diamond(e, t, n, r, i) {
			let a = r / 2 * Math.sqrt(i) * 1.35;
			e.beginPath(), e.moveTo(t, n - a), e.lineTo(t + a, n), e.lineTo(t, n + a), e.lineTo(t - a, n), e.closePath(), e.fill();
		},
		ring(e, t, n, r, i) {
			let a = r / 2 * Math.sqrt(i), o = Math.max(.5, a * (1 - i * .85));
			e.beginPath(), e.arc(t, n, Math.max(o / 2, a - o / 2), 0, Math.PI * 2), e.lineWidth = o, e.strokeStyle = e.fillStyle, e.stroke();
		},
		triangle(e, t, n, r, i) {
			let a = r / 2 * Math.sqrt(i) * 1.5;
			e.beginPath(), e.moveTo(t, n - a), e.lineTo(t + a * .866, n + a * .5), e.lineTo(t - a * .866, n + a * .5), e.closePath(), e.fill();
		},
		dot(e, t, n, r, i) {
			e.beginPath(), e.arc(t, n, r / 2 * Math.sqrt(i), 0, Math.PI * 2), e.fill();
		}
	}, w = {
		dither: S,
		halftone: (e, n) => {
			let { cols: i, rows: a, cell: o, data: s, originX: u, originY: d } = e;
			r.fillStyle = v(t.paper), r.fillRect(0, 0, c, l);
			let f = C[t.shape] || C.dot;
			t.originalColors || (r.fillStyle = v(t.ink));
			let p = (e, t, r, o) => {
				let c = (G(t, 0, a - 1) * i + G(e, 0, i - 1)) * 4;
				return {
					index: c,
					ink: G(b(s, c) + n.inkShift(e, t, r, o), 0, 1)
				};
			}, m = (e, n, i, a) => {
				let { index: c, ink: l } = p(e, n, i, a);
				l <= .02 || (t.originalColors && (r.fillStyle = v(_(l, [
					s[c],
					s[c + 1],
					s[c + 2]
				]))), f(r, i, a, o, l));
			};
			if (!t.angle) {
				for (let e = 0; e < a; e += 1) for (let t = 0; t < i; t += 1) m(t, e, u + t * o + o / 2, d + e * o + o / 2);
				return;
			}
			let h = t.angle * Math.PI / 180, g = Math.cos(h), y = Math.sin(h), x = c / 2, S = l / 2, w = Math.ceil(Math.hypot(c, l) / (2 * o)) + 1;
			for (let e = -w; e <= w; e += 1) for (let t = -w; t <= w; t += 1) {
				let n = x + (t * g - e * y) * o, r = S + (t * y + e * g) * o;
				n < -o || r < -o || n > c + o || r > l + o || m(Math.floor((n - u) / o), Math.floor((r - d) / o), n, r);
			}
		},
		ascii: (e, n) => {
			let { cols: i, rows: a, cell: o, data: s, originX: u, originY: d } = e, f = t.chars;
			r.fillStyle = v(t.paper), r.fillRect(0, 0, c, l), r.font = `${Math.max(4, o * 1.15)}px ${t.font}`, r.textAlign = "center", r.textBaseline = "middle", t.originalColors || (r.fillStyle = v(t.ink));
			for (let e = 0; e < a; e += 1) for (let a = 0; a < i; a += 1) {
				let c = (e * i + a) * 4, l = u + a * o + o / 2, p = d + e * o + o / 2, m = G(b(s, c) + n.inkShift(a, e, l, p), 0, 1), h = f[G(Math.floor((1 - m) * f.length) + n.glyphShift(a, e), 0, f.length - 1)];
				h !== " " && (t.originalColors && (r.fillStyle = v(_(m, [
					s[c],
					s[c + 1],
					s[c + 2]
				]))), r.fillText(h, l, p));
			}
		}
	};
	return {
		canvas: e,
		sync: m,
		configure(e = {}) {
			return Object.assign(t, Sn({
				...t,
				...e
			})), t;
		},
		get live() {
			return t.motion !== "none" || t.pointer !== "none";
		},
		render(e, n, i = {}) {
			if (!r || !a) return !1;
			let o = Math.max(1, Math.round(Math.max(1, n) * u)), s = i.time || 0, d = t.motion === "flow" ? s / 1e3 * t.motionSpeed * o * 1.6 % o : 0, f = h(e, o, d, d * .35);
			if (!f) return !1;
			let p = i.pointer && i.pointer.active ? {
				active: !0,
				x: i.pointer.x * u,
				y: i.pointer.y * u
			} : null, m = x(f, o, s, p), g = w[t.style] || S;
			if (r.clearRect(0, 0, c, l), g(f, m), t.pointer === "lens" && p) {
				let i = Math.max(1, Math.round((t.pointerCellSize || n / 2) * u));
				if (i !== o) {
					let n = h(e, i);
					n && (r.save(), r.beginPath(), r.arc(p.x, p.y, t.pointerRadius * u, 0, Math.PI * 2), r.clip(), g(n, x(n, i, s, null)), r.restore());
				}
			}
			return !0;
		},
		mask(e, t, n) {
			if (!r) return;
			let i = G(e, 0, 1);
			if (i <= 0) return;
			let a = Math.max(1, Math.round(Math.max(1, n) * u)), s = Math.max(1, Math.ceil(c / a)), d = Math.max(1, Math.ceil(l / a)), f = Math.max(3, Math.round(Math.min(s, d) / 12));
			r.save(), r.globalCompositeOperation = "destination-out", r.fillStyle = "#000";
			for (let e = 0; e < d; e += 1) for (let n = 0; n < s; n += 1) (t === "wipe" ? G(n / s * .55 + e / d * .45 + (_n(n, e, 0, o) - .5) * .22, 0, 1) : vn(n, e, f, o)) < i && r.fillRect(n * a, e * a, a, a);
			r.restore();
		},
		destroy() {
			d = null, i.width = 1, i.height = 1;
		}
	};
}
//#endregion
//#region src/modules/media/wrapper.js
var Tn = Object.freeze(["kt-lazy-wrap", "kt-stylize-wrap"]);
function En(e) {
	return !!(e && Tn.some((t) => e.classList?.contains(t)));
}
function Dn(e, { className: t = "kt-lazy-wrap", display: n, aspectRatio: r, height: i } = {}) {
	let a = e.parentElement, o = !1, s = getComputedStyle(e).borderRadius, c = a?.getAttribute("style") ?? null;
	En(a) || (a = document.createElement("span"), a.className = t, e.parentNode?.insertBefore(a, e), a.appendChild(e), o = !0), getComputedStyle(a).position === "static" && (a.style.position = "relative"), a.style.overflow = "hidden", a.style.display = n || "block", a.style.lineHeight = "0", s && s !== "0px" && (a.style.borderRadius = s);
	let l = a.parentElement?.getBoundingClientRect(), u = r || e.getAttribute("data-aspect-ratio"), d = Number(e.getAttribute("width")), f = Number(e.getAttribute("height"));
	return a.style.width = "100%", u ? a.style.aspectRatio = String(u).replace(":", " / ") : d > 0 && f > 0 ? a.style.aspectRatio = `${d} / ${f}` : o && l && l.height > 2 ? a.style.height = "100%" : a.getBoundingClientRect().height < 2 && (a.style.aspectRatio = "16 / 9"), i && (a.style.height = typeof i == "number" ? `${i}px` : String(i)), {
		wrapper: a,
		created: o,
		originalWrapperStyle: c
	};
}
function On(e, { wrapper: t, created: n, originalWrapperStyle: r }) {
	n && t.parentNode ? (t.parentNode.insertBefore(e, t), t.remove()) : n || (r == null ? t.removeAttribute("style") : t.setAttribute("style", r));
}
function kn(e, t, n = 2) {
	let r = document.createElement("span");
	return r.className = t, r.setAttribute("aria-hidden", "true"), r.style.cssText = `position:absolute;inset:0;z-index:${n};display:block;overflow:hidden;pointer-events:none;border-radius:inherit;`, e.appendChild(r), r;
}
//#endregion
//#region src/modules/media/stylizer.js
var An = Object.freeze([
	"dither",
	"ascii",
	"halftone"
]), jn = new Set(An), Mn = {
	dither: 6,
	ascii: 12,
	halftone: 8
}, Nn = {
	dither: 2,
	ascii: 5,
	halftone: 3
}, Pn = .7, Fn = Object.freeze([
	"shrink",
	"dissolve",
	"wipe"
]), In = /\.(?:gif|apng|webp)(?:$|[?#])/i;
function Ln(e) {
	let t = {
		x: 0,
		y: 0,
		active: !1
	}, n = (n) => {
		let r = e.getBoundingClientRect();
		t.x = n.clientX - r.left, t.y = n.clientY - r.top, t.active = !0;
	}, r = () => {
		t.active = !1;
	};
	return e.addEventListener("pointermove", n, { passive: !0 }), e.addEventListener("pointerdown", n, { passive: !0 }), e.addEventListener("pointerleave", r, { passive: !0 }), {
		state: t,
		destroy() {
			e.removeEventListener("pointermove", n), e.removeEventListener("pointerdown", n), e.removeEventListener("pointerleave", r);
		}
	};
}
function Rn(e) {
	return jn.has(e);
}
function zn(e, t) {
	let n = Number(e ?? t);
	return Number.isFinite(n) ? n <= 30 ? n * 1e3 : n : t * 1e3;
}
function Bn(e, t, n) {
	let r = G(e / Pn, 0, 1), i = G((e - Pn) / .30000000000000004, 0, 1);
	return {
		cell: t * (n / t) ** +r,
		layerOpacity: 1 - i
	};
}
function Vn(e, t = {}, { lowTier: n = !1, persistFps: r = 24, revealFps: i = 24, maxDpr: a = 2 } = {}) {
	if (!jn.has(e)) return null;
	let o = t.persist === !0, s = G(Number(t.cellSize ?? Mn[e]), 2, 64), c = {
		scope: t.scope,
		paperColor: t.paperColor,
		inkColor: t.inkColor,
		accentColor: t.accentColor,
		originalColors: t.originalColors === !0,
		colorSteps: t.colorSteps,
		inverted: t.inverted === !0,
		seed: t.seed,
		contrast: t.contrast,
		brightness: t.brightness,
		motion: t.motion,
		motionSpeed: t.motionSpeed,
		motionAmount: t.motionAmount,
		pointer: t.pointer,
		pointerRadius: t.pointerRadius,
		pointerStrength: t.pointerStrength,
		pointerCellSize: t.pointerCellSize
	};
	e === "dither" && (c.type = t.ditherType), e === "ascii" && (c.chars = t.asciiChars, c.font = t.asciiFont), e === "halftone" && (c.shape = t.halftoneShape, c.angle = t.halftoneAngle);
	let l = xn(e, c), u = l.motion !== "none" || l.pointer !== "none", d = t.renderFps ?? (o ? r : i);
	return {
		persist: o,
		live: u,
		startCell: s,
		handoffCell: Math.min(s, Nn[e]),
		transition: Fn.includes(t.transition) ? t.transition : "shrink",
		styleConfig: l,
		fps: G(Number(d), 4, n ? 12 : 60),
		maxDpr: G(Number(t.maxDpr ?? a), .5, 4),
		ease: F(t.ease || "cubic-out")
	};
}
function Hn(e, t = {}, n = null) {
	return n ? n.setLiveLook(t) : Object.assign(e.styleConfig, Sn({
		...e.styleConfig,
		...t
	})), e.live = e.styleConfig.motion !== "none" || e.styleConfig.pointer !== "none", e.live;
}
function Un(e, t, n = "kt-stylize") {
	let r = kn(e, `${n}-${t}-layer ${n}-stylized-layer`, 3), i = document.createElement("canvas");
	return i.className = `${n}-${t}-canvas ${n}-stylized-canvas`, i.style.cssText = "position:absolute;inset:0;width:100%;height:100%;display:block;", r.appendChild(i), {
		layer: r,
		canvas: i
	};
}
function Wn({ el: e, wrapper: t, effect: n, settings: r, prefix: i = "kt-stylize", drawable: a = () => e, animatedSource: o = !1, durationMs: s = 1600, delayMs: c = 60, holdMs: l = 0, onProgress: u, onFinish: d, onRendered: f }) {
	let { persist: p, startCell: m, handoffCell: h, transition: g, styleConfig: _, fps: v, maxDpr: y, ease: b } = r, { layer: x, canvas: S } = Un(t, n, i), C = wn(S, _, { maxDpr: y }), w = 1e3 / v, T = r.live, E = _.pointer === "none" ? null : Ln(t), D = () => {
		_.pointer === "none" ? (E?.destroy(), E = null) : E ||= Ln(t);
	}, O = null, k = null, A = !1, j = !1, M = !1, N = !0, P = 0, F = null, I = null, L = !1, R = null, z = -Infinity, B = 0, V = null, H = () => M && !A && !j && !document.hidden, U = () => {
		H() && F && O == null && (O = requestAnimationFrame((e) => {
			O = null, H() && F?.(e);
		}));
	}, W = () => {
		if (!H() || !I || I.id != null) return;
		let e = I;
		e.at = performance.now(), e.id = setTimeout(() => {
			e.id = null, e.remaining = 0, H() && I === e && (I = null, e.callback());
		}, e.remaining);
	}, K = (e, t) => {
		I = {
			callback: e,
			remaining: Math.max(0, Number(t) || 0),
			id: null,
			at: 0
		}, W();
	}, ee = (e) => (V != null && (B += e - V), V = e, B), q = (e, n = B) => {
		let r = t.getBoundingClientRect();
		return C.sync(r.width, r.height), C.render(a(), e, {
			time: n,
			pointer: E?.state
		});
	}, J = () => {
		O != null && cancelAnimationFrame(O), O = null, V = null, I?.id != null && (clearTimeout(I.id), I.remaining = Math.max(0, I.remaining - (performance.now() - I.at)), I.id = null);
	}, Y = () => {
		J(), I = null, F = null, k?.disconnect(), k = null, L = !1;
	}, X = () => {
		let t = P, n = q(m);
		f?.(n), !(A || t !== P) && (u?.(1, e), !(A || t !== P) && n && re());
	}, te = (e) => {
		let t = ee(e);
		e - z >= w && (q(m, t), z = e), U();
	}, ne = () => {
		k || typeof ResizeObserver > "u" || (k = new ResizeObserver(() => {
			A || (H() ? q(m) : L = !0);
		}), k.observe(t));
	};
	function re() {
		if (o || T) {
			k?.disconnect(), k = null, F || (F = te, U());
			return;
		}
		F === te && (J(), F = null), ne();
	}
	let ie = () => {
		let t = (t) => {
			let n = P, r = ee(t);
			R ??= r;
			let i = G((r - R) / s, 0, 1);
			if (t - z >= w || i >= 1) {
				let a = G(b(i), 0, 1), o;
				if (g === "shrink") {
					let { cell: e, layerOpacity: t } = Bn(a, m, h);
					o = q(e, r), x.style.opacity = String(t);
				} else o = q(m, r), o && C.mask(a, g, m);
				if (!o && z === -Infinity) {
					F = null, d?.();
					return;
				}
				if (u?.(i, e), A || n !== P) return;
				z = t;
			}
			i < 1 ? U() : (F = null, K(() => d?.(), l));
		};
		q(m), K(() => {
			F = t, U();
		}, c);
	}, ae = () => {
		H() && (N && (N = !1, p ? X() : ie()), L && (L = !1, q(m)), W(), U());
	}, oe = () => {
		document.hidden ? J() : ae();
	};
	return document.addEventListener("visibilitychange", oe), {
		layer: x,
		canvas: S,
		renderer: C,
		get persist() {
			return p;
		},
		setLiveLook(e = {}) {
			A || (C.configure(e), T = C.live, D(), p && M && re(), p && M && !F && H() && q(m));
		},
		start() {
			A || M || (M = !0, ae());
		},
		pause() {
			j = !0, J();
		},
		resume() {
			j = !1, ae();
		},
		replay() {
			A || (Y(), P++, M = !1, N = !0, R = null, z = -Infinity, x.style.opacity = "1", x.isConnected || t.appendChild(x), this.start());
		},
		destroy() {
			A || (A = !0, Y(), document.removeEventListener("visibilitychange", oe), E?.destroy(), C.destroy(), x.remove());
		}
	};
}
function Gn({ el: e, wrapper: t, effect: n, settings: r, prefix: i = "kt-stylize", durationMs: a = 1600, delayMs: o = 0, holdMs: s = 0, onProgress: c, onFinish: l }) {
	let { persist: u, startCell: d, handoffCell: f, transition: p, styleConfig: m, fps: h, maxDpr: g, ease: _ } = r, { layer: v, canvas: y } = Un(t, n, i), b = wn(y, m, { maxDpr: g }), x = 1e3 / h, S = m.pointer === "none" ? null : Ln(t), C = null, w = !1, T = !1, E = !1, D = !1, O = 0, k = null, A = 0, j = -Infinity, M = 0, N = (n, r = M) => {
		if (e.readyState < 2) return !1;
		let i = t.getBoundingClientRect();
		return b.sync(i.width, i.height), b.render(e, n, {
			time: r,
			pointer: S?.state
		});
	}, P = () => E && !w && !T && !document.hidden && !e.paused && !e.ended && !D && e.readyState >= 2, F = () => {
		C != null && cancelAnimationFrame(C), C = null, k = null;
	}, I = () => {
		P() && C == null && (C = requestAnimationFrame(R));
	}, L = () => {
		D = !0, F(), v.remove(), l?.();
	}, R = (t) => {
		if (C = null, !P()) {
			k = null;
			return;
		}
		if (k != null && (O += t - k), k = t, t - j < x) {
			I();
			return;
		}
		if (M = e.currentTime * 1e3, j = t, u) {
			N(d), I();
			return;
		}
		let n = A, r = G((O - o) / a, 0, 1), i = G(_(r), 0, 1), l;
		if (p === "shrink") {
			let { cell: e, layerOpacity: t } = Bn(i, d, f);
			l = N(e), v.style.opacity = String(t);
		} else l = N(d), l && b.mask(i, p, d);
		c?.(l ? r : 1, e), !(w || n !== A) && (!l || O >= o + a + s ? L() : I());
	}, z = () => {
		w || D || (E = !0, I());
	}, B = () => {
		document.hidden ? F() : I();
	}, V = [
		"pause",
		"ended",
		"waiting"
	];
	return e.addEventListener("playing", I), V.forEach((t) => e.addEventListener(t, F)), document.addEventListener("visibilitychange", B), {
		layer: v,
		canvas: y,
		renderer: b,
		get persist() {
			return u;
		},
		setLiveLook(e = {}) {
			w || (b.configure(e), m.pointer === "none" ? (S?.destroy(), S = null) : S ||= Ln(t), E && !P() && N(d));
		},
		start: z,
		pause() {
			T = !0, F();
		},
		resume() {
			T = !1, I();
		},
		replay() {
			w || (F(), A++, O = 0, D = !1, j = -Infinity, v.style.opacity = "1", v.isConnected || t.appendChild(v), z());
		},
		destroy() {
			w || (w = !0, F(), e.removeEventListener("playing", I), V.forEach((t) => e.removeEventListener(t, F)), document.removeEventListener("visibilitychange", B), S?.destroy(), b.destroy(), v.remove());
		}
	};
}
//#endregion
//#region src/modules/lazy.js
var Kn = "stylize";
function qn(e) {
	return {
		display: e.display,
		aspectRatio: e.aspectRatio,
		height: e.height
	};
}
function Jn(e, t = {}) {
	return t.src || e.dataset.src || e.getAttribute("data-src") || e.currentSrc || e.getAttribute("src") || "";
}
function Yn(e, t, n) {
	let r = Math.max(1, Math.min(t || 300, n || 200)), i = (e) => e <= 1 ? Math.max(1, Math.round(1 / Math.max(.004, e))) : Math.round(e);
	if (Array.isArray(e.steps) && e.steps.length) {
		let t = e.steps.map(Number).filter((e) => Number.isFinite(e) && e > 0).map(i);
		if (t.length) return t.sort((e, t) => t - e);
	}
	let a = Math.max(2, Math.round(Number(e.pixelStepCount ?? e.stepCount ?? 8))), o = e.pixelStart != null || e.pixelEnd != null, s = o ? G(i(G(Number(e.pixelStart ?? .035), .004, 1)), 2, 200) : G(Math.round(r / 6), 20, 96), c = o ? i(G(Number(e.pixelEnd ?? 1), .01, 1)) : 1, l = [];
	for (let e = 0; e < a; e += 1) {
		let t = e / Math.max(1, a - 1), n = s * (Math.max(1, c) / s) ** +t, r = Math.max(c, Math.round(n));
		l.length && r >= l[l.length - 1] && (r = Math.max(c, l[l.length - 1] - 1)), l.push(r);
	}
	return l[l.length - 1] = c, l;
}
function Xn(e) {
	return e.length > 1 && e[e.length - 1] <= 1 ? e.slice(0, -1) : e.length ? e : [2];
}
function Zn(e, t, n = {}) {
	let r = document.createElement("img");
	r.className = "kt-lazy-live-image", r.alt = "", r.setAttribute("aria-hidden", "true"), r.loading = "eager", r.decoding = "async", n.crossOrigin && (r.crossOrigin = n.crossOrigin);
	let i = n.srcset || t.getAttribute("data-srcset") || t.getAttribute("srcset"), a = n.sizes || t.getAttribute("sizes");
	return i && (r.srcset = i), a && (r.sizes = a), r.src = e, r.style.cssText = `display:block;width:100%;height:100%;object-fit:${n.objectFit || "cover"};object-position:${n.objectPosition || "50% 50%"};border-radius:inherit;`, r;
}
function Qn(e, t, n = 4) {
	let r = document.createElement("canvas");
	r.className = "kt-lazy-noise", r.setAttribute("aria-hidden", "true"), r.width = Math.max(32, Number(t.noiseWidth ?? 320)), r.height = Math.max(18, Number(t.noiseHeight ?? 180)), r.style.cssText = `position:absolute;inset:0;width:100%;height:100%;z-index:${n};pointer-events:none;mix-blend-mode:${t.noiseBlend || "overlay"};opacity:0;border-radius:inherit;`, e.appendChild(r);
	let i = r.getContext("2d", { alpha: !0 }), a = 0, o = 0, s = 1e3 / G(Number(t.noiseFps ?? 30), 4, 60);
	return {
		canvas: r,
		draw: (e = performance.now()) => {
			if (!i || e - a < s) return;
			a = e;
			let n = i.createImageData(r.width, r.height), c = G(Number(t.noiseContrast ?? .95), .1, 3);
			for (let e = 0; e < n.data.length; e += 4) {
				let t = (Math.random() - .5) * 255 * c + 128, r = G(Math.round(t), 0, 255);
				n.data[e] = r, n.data[e + 1] = r, n.data[e + 2] = r, n.data[e + 3] = 255;
			}
			i.putImageData(n, 0, 0), o += 1, r.dataset.frames = String(o);
		}
	};
}
function $n(e, t, n = 8, r = !1) {
	let i = G(t * 100, 0, 100), a = G(Number(n), 0, 30), o = G(i - a, 0, 100), s = G(i + a, 0, 100), c = e === "up" ? "to top" : e === "left" ? "to left" : e === "right" ? "to right" : "to bottom";
	return r ? `linear-gradient(${c}, transparent 0%, transparent ${o}%, #000 ${s}%, #000 100%)` : `linear-gradient(${c}, #000 0%, #000 ${o}%, transparent ${s}%, transparent 100%)`;
}
function er(e, t, n) {
	return new Promise((r, i) => {
		let a = new Image();
		a.decoding = "async", n.crossOrigin && (a.crossOrigin = n.crossOrigin);
		let o = n.srcset || t.getAttribute("data-srcset") || t.getAttribute("srcset");
		o && (a.srcset = o), a.onload = () => r(a), a.onerror = () => i(/* @__PURE__ */ Error(`Kineto lazy image failed to load: ${e}`)), a.src = e, a.complete && a.naturalWidth && r(a);
	});
}
function tr(e, t = {}) {
	let n = {
		style: e.getAttribute("style"),
		src: e.getAttribute("src"),
		preload: e.getAttribute("preload")
	}, r = Array.from(e.querySelectorAll("source")), i = t.src || e.dataset.src || e.getAttribute("data-src") || "", a = Math.max(0, Number(t.duration ?? .6)) * 1e3, o = t.ease || "cubic-bezier(.22,.8,.3,1)", s = t.once !== !1, c = t.autoplay !== !1;
	t.muted !== !1 && (e.muted = !0, e.setAttribute("muted", "")), t.loop !== !1 && (e.loop = !0), t.playsinline !== !1 && e.setAttribute("playsinline", ""), e.preload = t.preload || "none", e.style.opacity = "0", e.style.transition = `opacity ${a}ms ${o}`, e.style.willChange = "opacity";
	let l = !1, u = !1, d = null, f = () => {
		if (l) return;
		l = !0;
		let t = !1;
		r.forEach((e) => {
			let n = e.dataset.src || e.getAttribute("data-src");
			n && (e.src = n, t = !0);
		}), i && (e.src = i, t = !0), t && e.load();
	}, p = () => {
		if (!u) {
			if (e.style.opacity = "1", c) {
				let t = e.play?.();
				t && typeof t.catch == "function" && t.catch(() => {});
			}
			t.onReveal?.(e);
		}
	}, m = () => {
		f(), e.readyState >= 2 ? p() : e.addEventListener("loadeddata", p, { once: !0 });
	};
	return s ? d = ae(e, m, {
		threshold: Number(t.threshold ?? .15),
		rootMargin: t.rootMargin || "200px 0px"
	}) : typeof IntersectionObserver < "u" ? (d = new IntersectionObserver((t) => {
		t.forEach((t) => {
			t.isIntersecting ? m() : l && e.pause?.();
		});
	}, {
		threshold: Number(t.threshold ?? .15),
		rootMargin: t.rootMargin || "0px"
	}), d.observe(e)) : m(), {
		el: e,
		type: "lazy",
		get animatedMedia() {
			return !0;
		},
		replay() {
			l = !1, e.style.opacity = "0", m();
		},
		pause() {
			e.pause?.();
		},
		resume() {
			if (l && c) {
				let t = e.play?.();
				t && typeof t.catch == "function" && t.catch(() => {});
			}
		},
		destroy() {
			u = !0, d?.disconnect?.(), e.pause?.(), e.removeEventListener("loadeddata", p);
			let t = (t, n) => n == null ? e.removeAttribute(t) : e.setAttribute(t, n);
			t("style", n.style), t("src", n.src), t("preload", n.preload);
		}
	};
}
function nr(e, t, n = null) {
	let r = { scope: n };
	return (e === "dither" || e === "ascii" || e === "halftone") && (r.persist = t.persist, r.cellSize = t.cellSize, r.paperColor = t.paperColor, r.inkColor = t.inkColor, r.accentColor = t.accentColor, r.originalColors = t.originalColors, r.colorSteps = t.colorSteps, r.inverted = t.inverted, r.seed = t.seed, r.renderFps = t.renderFps, r.maxDpr = t.maxDpr, r.ease = t.ease), e === "dither" && (r.ditherType = t.ditherType), e === "ascii" && (r.asciiChars = t.asciiChars, r.asciiFont = t.asciiFont), e === "halftone" && (r.halftoneShape = t.halftoneShape, r.halftoneAngle = t.halftoneAngle), r;
}
function rr(e, t, n, r = null) {
	ir(r, n);
	let i = r?.performance === "low", a = Dn(e, qn(t)), { wrapper: o } = a, s = e.getAttribute("style");
	e.style.display = "block", e.style.width = "100%", e.style.height = "100%", e.style.objectFit = t.objectFit || "cover";
	let c = Gn({
		el: e,
		wrapper: o,
		effect: n,
		settings: Vn(n, nr(n, t, e), {
			lowTier: i,
			persistFps: 24,
			revealFps: 24,
			maxDpr: 1.5
		}),
		prefix: "kt-lazy",
		durationMs: Math.max(120, zn(t.duration, 1.6)),
		onProgress: (e, n) => t.onProgress?.(e, n)
	}), l = tr(e, {
		...t,
		onReveal: (e) => {
			t.onReveal?.(e), c.start();
		}
	});
	return {
		el: e,
		type: "lazy",
		get animatedMedia() {
			return !0;
		},
		replay() {
			l.replay(), c.replay();
		},
		pause() {
			c.pause(), l.pause();
		},
		resume() {
			c.resume(), l.resume();
		},
		destroy() {
			c.destroy(), l.destroy(), On(e, a), s == null ? e.removeAttribute("style") : e.setAttribute("style", s);
		}
	};
}
function ir(e, t) {
	let n = e?.diagnostics, r = e?.diagnosticCodes?.DEPRECATED;
	if (n && r) try {
		n.emit(n.create({
			code: r,
			module: "lazy",
			phase: "create",
			recoverable: !0,
			detail: {
				variant: t,
				replacement: `data-kt-${Kn}="${t}"`,
				removal: "next major"
			}
		}));
	} catch {}
}
var ar = {
	create(e, t = {}, n = null) {
		if (e.tagName === "VIDEO") {
			let r = t.preset || t.effect || "fade";
			return Rn(r) ? rr(e, t, r, n) : tr(e, t);
		}
		let r = t.preset || t.effect || "fade", i = r === "noise" ? "dissolve" : r === "zoom" ? "blur-up" : r, a = Jn(e, t);
		if (!a) return null;
		let o = {
			style: e.getAttribute("style"),
			src: e.getAttribute("src"),
			srcset: e.getAttribute("srcset"),
			sizes: e.getAttribute("sizes"),
			loading: e.getAttribute("loading"),
			decoding: e.getAttribute("decoding")
		}, s = Dn(e, qn(t)), { wrapper: c } = s;
		Rn(i) && ir(n, i), e.loading = t.nativeLazy === !1 ? "eager" : "lazy", e.decoding = "async", e.style.display = "block", e.style.width = "100%", e.style.height = "100%", e.style.objectFit = t.objectFit || "cover", e.style.objectPosition = t.objectPosition || "50% 50%";
		let l = [], u = /* @__PURE__ */ new Set(), d = null, f = null, p = !1, m = !1, h = !1, g = null, _ = null, v = 0, y = n?.performance === "low", b = (e, t) => {
			let n = setTimeout(() => {
				u.delete(n), p || e();
			}, Math.max(0, Number(t) || 0));
			return u.add(n), n;
		}, x = () => {
			l.splice(0).forEach((e) => e.remove()), g?.canvas.remove(), g = null, _?.destroy(), _ = null;
		}, S = () => {
			let n = t.srcset || e.getAttribute("data-srcset");
			n && (e.srcset = n), t.sizes && (e.sizes = t.sizes), e.loading = "eager", e.src = a, e.style.opacity = "1", e.style.filter = "none", e.style.transform = "none", e.style.clipPath = "none", e.style.maskImage = "none", e.style.webkitMaskImage = "none";
		}, C = () => {
			S(), x(), t.onProgress?.(1, e), t.onLoad?.(e);
		}, w = () => {
			let n = t.skeletonVariant || t.variant || "shimmer", r = kn(c, `kt-lazy-skeleton kt-lazy-skeleton-${n}`, 5), i = t.skeletonColor || "color-mix(in srgb, currentColor 9%, transparent)", a = t.skeletonHighlight || "rgba(255,255,255,.45)", o = Math.max(.3, Number(t.skeletonSpeed ?? 1.5));
			if (r.style.backgroundColor = i, n === "pulse" ? r.style.animation = `kt-skeleton-pulse ${o}s ease-in-out infinite` : (r.style.backgroundImage = `linear-gradient(${Number(t.skeletonAngle ?? 100)}deg,transparent 32%,${a} 50%,transparent 68%)`, r.style.backgroundSize = "250% 100%", r.style.animation = `kt-shimmer ${o}s cubic-bezier(.4,.2,.6,.8) infinite`), t.skeletonIcon !== !1) {
				let e = document.createElement("span");
				e.className = "kt-lazy-skeleton-icon", e.setAttribute("aria-hidden", "true"), e.innerHTML = "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.6\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"3\"/><circle cx=\"8.8\" cy=\"8.8\" r=\"1.9\"/><path d=\"m21 15.2-3.6-3.6a1.8 1.8 0 0 0-2.6 0L6 21\"/></svg>", r.appendChild(e);
			}
			return l.push(r), e.style.opacity = "0", r;
		}, T = async () => {
			if (h || p) return;
			h = !0;
			let n = performance.now(), r;
			try {
				r = await er(a, e, t);
			} catch (n) {
				x(), t.fallbackSrc ? e.src = t.fallbackSrc : o.src == null ? e.removeAttribute("src") : e.setAttribute("src", o.src), e.style.opacity = "1", t.onError?.(n, e);
				return;
			}
			let s = Math.max(0, Number(t.minDuration ?? 0)) - (performance.now() - n);
			if (s > 0 && await new Promise((e) => b(e, s)), !p) {
				if (i === "skeleton") {
					let n = l[0] || w();
					S();
					let i = Math.max(0, Number(t.fadeDuration ?? t.duration ?? .45));
					e.style.transform = "scale(1.015)", e.style.transition = `opacity ${i}s ease, transform ${Math.max(i, .5)}s cubic-bezier(.22,.8,.3,1)`, n.style.animation = "none", n.style.transition = `opacity ${Math.min(Math.max(i * .5, .18), .32)}s ease`, requestAnimationFrame(() => {
						e.style.opacity = "1", e.style.transform = "scale(1)", n.style.opacity = "0";
					}), b(x, i * 1e3 + 60), t.onLoad?.(e, r);
					return;
				}
				if (i === "fade") {
					e.src = a, e.style.transition = "none", e.style.opacity = "0", e.offsetWidth, e.style.transition = `opacity ${Math.max(0, Number(t.duration ?? .7))}s ${t.ease || "ease"}`, requestAnimationFrame(() => {
						e.style.opacity = "1";
					}), t.onLoad?.(e, r);
					return;
				}
				if (i === "blur-up") {
					e.src = a, e.style.transition = "none", e.style.opacity = "1", e.style.filter = `blur(${Math.max(0, Number(t.blur ?? 18))}px)`, e.style.transform = `scale(${Math.max(1, Number(t.startScale ?? 1.06))})`;
					let n = Math.max(0, Number(t.duration ?? .85));
					e.offsetWidth, requestAnimationFrame(() => {
						e.style.transition = `filter ${n}s ease,transform ${n}s cubic-bezier(.22,.8,.3,1)`, e.style.filter = "blur(0px)", e.style.transform = "scale(1)";
					}), t.onLoad?.(e, r);
					return;
				}
				if (i === "polaroid") {
					e.src = a;
					let n = t.frame !== !1, i = null;
					if (n) {
						i = kn(c, "kt-lazy-polaroid-frame", 6);
						let e = "clamp(6px, 4.5%, 18px)";
						i.style.cssText += `border:${e} solid ${t.frameColor || "#fbfaf7"};border-bottom-width:calc(${e} * 3.2);box-shadow:inset 0 0 8px rgba(0,0,0,.12);`, l.push(i);
					}
					let o = Math.max(.2, Number(t.duration ?? 2.4));
					e.style.transition = "none", e.style.opacity = "1", e.style.filter = "brightness(2.1) saturate(.05) contrast(.72) sepia(.28) blur(7px)", e.style.transform = `rotate(${Number(t.rotate ?? -2)}deg) scale(.965)`, c.style.transition = "none", e.offsetWidth, requestAnimationFrame(() => requestAnimationFrame(() => {
						e.style.transition = `filter ${o}s cubic-bezier(.3,.1,.25,1),transform ${Math.min(o, 1.1)}s cubic-bezier(.34,1.4,.44,1)`, e.style.filter = "none", e.style.transform = "none";
					})), b(() => {
						t.keepFrame === !0 ? (S(), t.onLoad?.(e, r)) : C();
					}, o * 1e3 + 120);
					return;
				}
				if (i === "crt") {
					e.src = a;
					let n = Math.max(.3, Number(t.duration ?? 1.1));
					e.style.opacity = "1", e.style.transformOrigin = "center", e.style.willChange = "transform, filter, opacity", e.style.animation = `kt-lazy-crt ${n}s cubic-bezier(.2,.7,.2,1) both`;
					let r = kn(c, "kt-lazy-crt-beam", 7);
					r.style.cssText += `pointer-events:none;top:50%;bottom:auto;height:2px;transform:translateY(-50%);background:linear-gradient(90deg,transparent,rgba(255,255,255,.85) 16%,#fff 50%,rgba(255,255,255,.85) 84%,transparent);box-shadow:0 0 12px 2px rgba(255,255,255,.5);animation:kt-lazy-crt-beam ${n}s ease-out both;`, l.push(r);
					let i = kn(c, "kt-lazy-crt-bloom", 8);
					if (i.style.cssText += `pointer-events:none;background:#fff;animation:kt-lazy-crt-bloom ${n}s ease-out both;`, l.push(i), t.frame !== !1) {
						let e = kn(c, "kt-lazy-crt-scan", 5);
						e.style.cssText += `pointer-events:none;background:repeating-linear-gradient(to bottom,rgba(0,0,0,.09) 0,rgba(0,0,0,.09) 1px,transparent 1px,transparent 3px);mix-blend-mode:multiply;opacity:0;animation:kt-lazy-crt-scan ${n}s ease both;`, l.push(e);
						let t = kn(c, "kt-lazy-crt-roll", 6);
						t.style.cssText += `pointer-events:none;top:0;bottom:auto;height:60%;background:linear-gradient(to bottom,transparent 0%,rgba(0,0,0,.18) 35%,rgba(0,0,0,.28) 50%,rgba(0,0,0,.18) 65%,transparent 100%);filter:blur(3px);animation:kt-lazy-crt-roll ${n}s linear both;`, l.push(t);
					}
					b(() => {
						e.style.animation = "", e.style.willChange = "", C();
					}, n * 1e3 + 160);
					return;
				}
				if (i === "data-mosaic" || i === "rgb-slice-burst") {
					let n = Math.max(.1, Number(t.duration ?? 1.1));
					e.src = a, e.style.opacity = "1";
					let r = kn(c, `kt-lazy-${i}-layer`, 3);
					r.style.cssText += ";overflow:hidden";
					let o = c.getBoundingClientRect(), s = o.width || e.naturalWidth || 300, l = o.height || e.naturalHeight || 200, u = v;
					v += 1;
					let d = ((Math.floor(Number(t.seed ?? 20260729)) || 1) >>> 0) + Math.imul(u, 2654435761) >>> 0, f = () => {
						d = d + 1831565813 >>> 0;
						let e = d;
						return e = Math.imul(e ^ e >>> 15, e | 1), e ^= e + Math.imul(e ^ e >>> 7, e | 61), ((e ^ e >>> 14) >>> 0) / 4294967296;
					}, p = (e, t) => e + f() * (t - e);
					if (i === "data-mosaic") {
						let e = Math.max(8, Number(t.tileMax ?? 44)), i = Math.max(3, Number(t.tileMin ?? 8)), a = String(t.skeletonColor || "#0a0908"), o = [], c = (t, n, u) => {
							if (t >= s || n >= l) return;
							if (u / 2 >= i && f() < .68) {
								let e = u / 2;
								c(t, n, e), c(t + e, n, e), c(t, n + e, e), c(t + e, n + e, e);
								return;
							}
							let d = Math.ceil(Math.min(u, s - t)), p = Math.ceil(Math.min(u, l - n));
							if (d <= 0 || p <= 0) return;
							let m = document.createElement("span");
							m.style.cssText = `position:absolute;left:${t}px;top:${n}px;width:${d}px;height:${p}px;background:${a}`, r.appendChild(m), o.push({
								tile: m,
								weight: f() * .66 + u / e * .34
							});
						};
						for (let t = 0; t < l; t += e) for (let n = 0; n < s; n += e) c(n, t, e);
						o.sort((e, t) => e.weight - t.weight), o.forEach((e, t) => {
							let r = t / Math.max(1, o.length - 1);
							b(() => {
								e.tile.style.transition = "opacity 90ms linear", e.tile.style.opacity = "0";
							}, r * n * 1e3);
						}), b(() => {
							r.remove(), C();
						}, n * 1e3 + 200);
					} else {
						let e = Array.isArray(t.colors) && t.colors.length >= 3 ? t.colors : [
							"#ff2020",
							"#20ff40",
							"#2060ff"
						], i = Math.round(p(4, 7)), o = Math.max(6, s * .05), c = Array.from({ length: i * 2 }, (e, t) => t);
						for (let e = c.length - 1; e > 0; --e) {
							let t = Math.floor(f() * (e + 1)), n = c[e];
							c[e] = c[t], c[t] = n;
						}
						for (let t = 0; t < i; t += 1) {
							let i = l / c.length, s = Math.max(6, Math.min(i * 1.4, p(l * .035, l * .12))), u = Math.min(l - s, c[t] * i + p(0, i * .5)), d = document.createElement("span");
							d.style.cssText = `position:absolute;left:0;right:0;top:${u}px;height:${s}px;overflow:hidden;mix-blend-mode:screen;pointer-events:none;opacity:${p(.32, .6).toFixed(2)}`;
							let m = document.createElement("span");
							m.style.cssText = `position:absolute;left:0;top:${-u}px;width:100%;height:${l}px;background-image:url("${String(a).replace(/["\\]/g, "\\$&")}");background-size:cover;background-position:center;background-color:${e[t % e.length]};background-blend-mode:multiply;`, d.appendChild(m), r.appendChild(d);
							let h = f() < .3, g = (f() < .5 ? -1 : 1) * (h ? p(o * .5, o) : p(2, 9)), _ = [
								{
									transform: `translateX(${g.toFixed(1)}px)`,
									opacity: d.style.opacity
								},
								{
									transform: `translateX(${(-g * .55).toFixed(1)}px)`,
									opacity: d.style.opacity,
									offset: .45
								},
								{
									transform: `translateX(${(g * .22).toFixed(1)}px)`,
									opacity: "0.35",
									offset: .75
								},
								{
									transform: "translateX(0)",
									opacity: "0"
								}
							], v = Math.max(220, n * 520);
							typeof d.animate == "function" ? d.animate(_, {
								duration: v,
								easing: "steps(5, end)",
								fill: "forwards"
							}) : (d.style.transition = `transform ${v}ms steps(5, end), opacity ${v}ms linear`, d.style.transform = "translateX(0)", d.style.opacity = "0");
						}
						b(() => {
							r.remove(), C();
						}, n * 1e3 + 200);
					}
					return;
				}
				if (i === "wave" || i === "grain") {
					e.src = a, e.style.opacity = "1";
					let n = Math.max(120, zn(t.duration, i === "wave" ? 1.35 : 1.1)), o = Math.max(0, Number(t.delay ?? 60)), s = G(Number(t.maxDpr ?? 1.5), .5, 2), u = 1e3 / G(Number(t.renderFps ?? (i === "wave" ? 30 : 24)), 4, 60), d = F(t.ease || "cubic-out"), h = G(Number(t.grain ?? t.noise ?? (i === "wave" ? .13 : .3)), 0, 1), _ = kn(c, `kt-lazy-${i}-layer`, 3), v = document.createElement("canvas");
					v.className = `kt-lazy-${i}-canvas`, _.appendChild(v), l.push(_);
					let y = v.getContext("2d", {
						alpha: !0,
						desynchronized: !0
					});
					g = Qn(c, t, 4), g.canvas.classList.add("kt-lazy-grain-canvas");
					let x = null, S = null, w = -Infinity, T = 0, E = 0, D = 1, O = () => {
						let e = c.getBoundingClientRect();
						T = Math.max(1, e.width), E = Math.max(1, e.height), D = G(window.devicePixelRatio || 1, 1, s);
						let t = Math.max(1, Math.round(T * D)), n = Math.max(1, Math.round(E * D));
						(v.width !== t || v.height !== n) && (v.width = t, v.height = n), y.setTransform(D, 0, 0, D, 0, 0);
					}, k = (n, a) => {
						let o = e.complete && e.naturalWidth ? e : r;
						if (!o.naturalWidth) return;
						let s = hn(o.naturalWidth, o.naturalHeight, T, E);
						if (y.clearRect(0, 0, T, E), i === "grain") y.drawImage(o, s.sx, s.sy, s.sw, s.sh, 0, 0, T, E);
						else {
							let e = Math.max(0, Number(t.waveAmplitude ?? 22)) * (1 - n), r = Math.max(.001, Number(t.waveFrequency ?? .035)), i = Number(t.waveSpeed ?? .012), c = Math.max(1, Math.round(Number(t.waveSliceHeight ?? 2)));
							for (let t = 0; t < E; t += c) {
								let n = s.sy + t / E * s.sh, l = Math.max(1, c / E * s.sh), u = Math.sin(t * r + a * i) * e;
								y.drawImage(o, s.sx, n, s.sw, l, u, t, T, c);
							}
						}
					}, A = (r) => {
						if (p) return;
						if (m) {
							S ??= r, f = requestAnimationFrame(A);
							return;
						}
						S != null && x != null && (x += r - S, S = null), x ??= r;
						let i = G((r - x) / n, 0, 1), a = G(d(i), 0, 1);
						(r - w >= u || i >= 1) && (O(), k(a, r), g.draw(r), g.canvas.style.opacity = String(h * (1 - a) ** 1.15), _.style.opacity = String(Math.max(0, 1 - a)), t.onProgress?.(i, e), w = r), i < 1 ? f = requestAnimationFrame(A) : C();
					};
					b(() => {
						f = requestAnimationFrame(A);
					}, o);
					return;
				}
				if (i === "pixelate") {
					e.src = a, e.style.opacity = "1";
					let n = kn(c, "kt-lazy-pixelate-layer", 3), i = document.createElement("canvas");
					i.className = "kt-lazy-pixelate-canvas", i.style.cssText = "position:absolute;inset:0;width:100%;height:100%;display:block;", n.appendChild(i), l.push(n);
					let o = t.noise !== !1 && t.noise !== 0 && t.noise !== "0" && t.noise !== "false", s = typeof t.noise == "number" ? G(t.noise, 0, 1) : .14;
					o && (g = Qn(c, t, 4), g.canvas.style.opacity = String(s));
					let u = i.getContext("2d", {
						alpha: !0,
						desynchronized: !0
					}), d = document.createElement("canvas"), h = d.getContext("2d", { alpha: !0 }), _ = c.getBoundingClientRect(), v = Xn(Yn(t, _.width, _.height)), y = Math.max(0, Number(t.stepDuration ?? 0)), x = y > 0 ? y * v.length : zn(t.duration, 1.25), S = Math.max(0, Number(t.delay ?? 100)), w = Math.max(0, Number(t.holdDuration ?? 0)), T = G(Number(t.maxDpr ?? 2), .5, 4), E = 1e3 / G(Number(t.renderFps ?? 60), 4, 120), D = 0, O = 0, k = () => {
						let e = c.getBoundingClientRect();
						D = Math.max(1, e.width), O = Math.max(1, e.height);
						let t = G(window.devicePixelRatio || 1, 1, T), n = Math.max(1, Math.round(D * t)), r = Math.max(1, Math.round(O * t));
						(i.width !== n || i.height !== r) && (i.width = n, i.height = r), u.setTransform(t, 0, 0, t, 0, 0);
					}, A = (t) => {
						let n = e.complete && e.naturalWidth ? e : r, i = n.naturalWidth, a = n.naturalHeight;
						if (!i || !a) return;
						let o = Math.max(1, Math.ceil(D / Math.max(1, t))), s = Math.max(1, Math.ceil(O / Math.max(1, t)));
						(d.width !== o || d.height !== s) && (d.width = o, d.height = s);
						let c = hn(i, a, D, O);
						h.clearRect(0, 0, o, s), h.imageSmoothingEnabled = !0;
						try {
							h.drawImage(n, c.sx, c.sy, c.sw, c.sh, 0, 0, o, s);
						} catch {
							return;
						}
						u.clearRect(0, 0, D, O), u.imageSmoothingEnabled = !1, u.drawImage(d, 0, 0, o, s, 0, 0, D, O);
					}, j = null, M = null, N = -Infinity, P = -1, F = (n) => {
						if (p) return;
						if (m) {
							M ??= n, f = requestAnimationFrame(F);
							return;
						}
						M != null && j != null && (j += n - M, M = null), j ??= n;
						let r = G((n - j) / Math.max(1, x), 0, 1);
						g && (g.draw(n), g.canvas.style.opacity = String(s * Math.max(0, 1 - r)));
						let i = r >= 1 ? v.length - 1 : Math.min(v.length - 1, Math.floor(r * v.length));
						for (; P < i;) P += 1, k(), A(v[P]), N = n, t.onProgress?.(G((P + 1) / (v.length + 1), 0, 1), e);
						if (r >= 1) {
							b(C, w);
							return;
						}
						n - N >= E && (k(), A(v[i]), N = n), f = requestAnimationFrame(F);
					};
					k(), A(v[0]), b(() => {
						f = requestAnimationFrame(F);
					}, S);
					return;
				}
				if (i === "flicker") {
					e.src = a, e.style.opacity = "1";
					let n = kn(c, "kt-lazy-flicker-layer", 3);
					n.style.background = t.flickerBackground || "#000";
					let i = document.createElement("canvas");
					i.style.cssText = "position:absolute;inset:0;width:100%;height:100%;display:block;", n.appendChild(i), l.push(n);
					let o = i.getContext("2d", { alpha: !1 }), s = Math.max(120, zn(t.duration, 1.15)), u = G(Number(t.glitchStrength ?? 1), .1, 3), d = Math.max(2, Math.round(Number(t.sliceCount ?? 7))), h = Math.max(0, Number(t.delay ?? 60)), g = null, _ = null, v = () => {
						let e = c.getBoundingClientRect(), n = G(window.devicePixelRatio || 1, 1, G(Number(t.maxDpr ?? 2), .5, 4)), r = Math.max(1, Math.round(e.width * n)), a = Math.max(1, Math.round(e.height * n));
						(i.width !== r || i.height !== a) && (i.width = r, i.height = a);
					}, y = (t) => {
						let n = e.complete && e.naturalWidth ? e : r;
						if (!n.naturalWidth) return;
						let a = i.width, s = i.height, c = hn(n.naturalWidth, n.naturalHeight, a, s);
						if (o.fillStyle = "#000", o.fillRect(0, 0, a, s), Math.random() < (1 - t) * .28) return;
						let l = (1 - t) * u;
						o.globalAlpha = 1;
						for (let e = 0; e < d; e += 1) {
							let t = Math.floor(e / d * s), r = Math.ceil(s / d), i = Math.round((Math.random() - .5) * a * .12 * l * (Math.random() < .4 ? 1 : .15));
							o.drawImage(n, c.sx, c.sy + t / s * c.sh, c.sw, r / s * c.sh, i, t, a, r);
						}
						l > .15 && Math.random() < .6 && (o.globalAlpha = .18 * l, o.drawImage(n, c.sx, c.sy, c.sw, c.sh, Math.round(8 * l), 0, a, s), o.globalAlpha = 1);
					}, x = (n) => {
						if (p) return;
						if (m) {
							_ ??= n, f = requestAnimationFrame(x);
							return;
						}
						_ != null && g != null && (g += n - _, _ = null), g ??= n;
						let r = G((n - g) / s, 0, 1);
						v(), y(r), t.onProgress?.(r, e), r < 1 ? f = requestAnimationFrame(x) : C();
					};
					b(() => {
						f = requestAnimationFrame(x);
					}, h);
					return;
				}
				if (i === "dither" || i === "ascii" || i === "halftone") {
					e.src = a, e.style.opacity = "1";
					let n = Vn(i, nr(i, t, e), {
						lowTier: y,
						persistFps: 24,
						revealFps: 30,
						maxDpr: 2
					});
					_ = Wn({
						el: e,
						wrapper: c,
						effect: i,
						settings: n,
						prefix: "kt-lazy",
						drawable: () => e.complete && e.naturalWidth ? e : r,
						animatedSource: t.animated === !0 || In.test(a),
						durationMs: Math.max(120, zn(t.duration, 1.6)),
						delayMs: Math.max(0, Number(t.delay ?? 60)),
						holdMs: Math.max(0, Number(t.holdDuration ?? 0)),
						onProgress: (e, n) => t.onProgress?.(e, n),
						onFinish: C
					}), l.push(_.layer), n.persist && t.onLoad?.(e, r), _.start();
					return;
				}
				if (i === "print" || i === "dissolve") {
					e.src = a, e.style.opacity = "0";
					let n = kn(c, `kt-lazy-${i}-base`, 2), r = Zn(a, e, t);
					n.appendChild(r), l.push(n);
					let o = null, s = null, u = null;
					i === "print" && (o = kn(c, "kt-lazy-print-sharp", 3), s = Zn(a, e, t), o.appendChild(s), l.push(o), u = kn(c, "kt-lazy-print-edge", 5), u.style.mixBlendMode = "soft-light", l.push(u)), g = Qn(c, t, 4);
					let d = Math.max(50, zn(t.duration, i === "print" ? 2.2 : 1.55)), h = Math.max(0, Number(t.delay ?? 100)), _ = Math.max(0, Number(t.blur ?? 16)), v = G(Number(t.noise ?? (i === "print" ? .3 : .68)), 0, 1), y = t.direction || "down", x = Number(t.feather ?? (i === "print" ? 12 : 8)), S = null, w = null, T = (n) => {
						if (p) return;
						if (m) {
							w ??= n, f = requestAnimationFrame(T);
							return;
						}
						w != null && S != null && (S += n - w, w = null), S ??= n;
						let a = G((n - S) / d, 0, 1), s = 1 - (1 - a) ** 2.2;
						if (g.draw(n), i === "print") {
							let e = a < .5 ? 2 * a * a : 1 - (-2 * a + 2) ** 2 / 2, n = _ * (1 - a * .45);
							r.style.filter = `blur(${n}px) contrast(${1 + (1 - a) * .1}) brightness(${1 + (1 - a) * .06})`, o.style.maskImage = $n(y, e, x, !1), o.style.webkitMaskImage = o.style.maskImage, g.canvas.style.maskImage = $n(y, e, x, !0), g.canvas.style.webkitMaskImage = g.canvas.style.maskImage, g.canvas.style.opacity = String(v * (1 - a ** 1.6 * .85));
							let i = y === "up" ? "to top" : y === "left" ? "to left" : y === "right" ? "to right" : "to bottom", s = G(e * 100, 0, 100), c = G(Number(t.edgeWidth ?? 9), 2, 30);
							u.style.opacity = a >= 1 ? "0" : "1", u.style.background = `linear-gradient(${i}, transparent ${G(s - c, 0, 100)}%, rgba(255,255,255,${G(Number(t.edgeOpacity ?? .5), 0, 1)}) ${s}%, transparent ${G(s + c * .4, 0, 100)}%)`;
						} else r.style.filter = `blur(${_ * (1 - s)}px) contrast(${1 + (1 - s) * .22})`, g.canvas.style.opacity = String(v * (1 - s) ** 1.2);
						t.onProgress?.(a, e), a < 1 ? f = requestAnimationFrame(T) : C();
					};
					b(() => {
						f = requestAnimationFrame(T);
					}, h);
					return;
				}
				S(), t.onLoad?.(e, r);
			}
		};
		return i === "skeleton" ? w() : ![
			"blur-up",
			"polaroid",
			"pixelate"
		].includes(i) && !Rn(i) && (e.style.opacity = "0"), d = ae(e, T, {
			threshold: Number(t.threshold ?? .05),
			rootMargin: t.rootMargin || "200px 0px"
		}), {
			el: e,
			type: "lazy",
			get animatedMedia() {
				return t.animated === !0 || In.test(a);
			},
			replay() {
				x(), h = !1, i === "skeleton" && w(), T();
			},
			pause() {
				m = !0, _?.pause();
			},
			resume() {
				m = !1, _?.resume();
			},
			destroy() {
				p = !0, m = !1, d?.disconnect(), f != null && cancelAnimationFrame(f), u.forEach(clearTimeout), u.clear(), x(), On(e, s);
				let t = (t, n) => n == null ? e.removeAttribute(t) : e.setAttribute(t, n);
				t("style", o.style), t("src", o.src), t("srcset", o.srcset), t("sizes", o.sizes), t("loading", o.loading), t("decoding", o.decoding);
			}
		};
	},
	reduced(e, t = {}) {
		let n = e.getAttribute("style"), r = e.getAttribute("src"), i = Jn(e, t);
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
}, or = /* @__PURE__ */ new Set([
	"load",
	"view",
	"manual"
]), sr = "kt-stylize-wrap";
function cr(e) {
	return {
		className: sr,
		display: e.display,
		aspectRatio: e.aspectRatio,
		height: e.height
	};
}
function lr(e, t) {
	let n = e.getAttribute("style");
	return e.style.display = "block", e.style.width = "100%", e.style.height = "100%", e.style.objectFit = t.objectFit || "cover", e.tagName === "IMG" && (e.style.objectPosition = t.objectPosition || "50% 50%"), n;
}
function ur(e) {
	return e.tagName === "IMG" || e.tagName === "VIDEO" ? e : e.querySelector("img, video");
}
function dr(e) {
	return e.currentSrc || e.getAttribute("src") || e.getAttribute("data-src") || "";
}
function fr(e, t, n, r = null) {
	let i = {
		scope: r,
		persist: n === "persist",
		cellSize: t.cellSize,
		paperColor: t.paperColor,
		inkColor: t.inkColor,
		accentColor: t.accentColor,
		originalColors: t.originalColors,
		colorSteps: t.colorSteps,
		inverted: t.inverted,
		contrast: t.contrast,
		brightness: t.brightness,
		motion: t.motion,
		motionSpeed: t.motionSpeed,
		motionAmount: t.motionAmount,
		pointer: t.pointer,
		pointerRadius: t.pointerRadius,
		pointerStrength: t.pointerStrength,
		pointerCellSize: t.pointerCellSize,
		transition: t.transition || "dissolve",
		seed: t.seed,
		renderFps: t.renderFps,
		maxDpr: t.maxDpr,
		ease: t.ease
	};
	return e === "dither" && (i.ditherType = t.ditherType), e === "ascii" && (i.asciiChars = t.asciiChars, i.asciiFont = t.asciiFont), e === "halftone" && (i.halftoneShape = t.halftoneShape, i.halftoneAngle = t.halftoneAngle), i;
}
function pr(e = {}) {
	let t = {};
	for (let n of Object.keys(e)) {
		if (!Cn.includes(n)) return null;
		t[n] = e[n];
	}
	return t;
}
function mr(e) {
	return {
		durationMs: Math.max(120, zn(e.duration, 1.6)),
		delayMs: Math.max(0, zn(e.delay, 0)),
		holdMs: Math.max(0, zn(e.holdDuration, 0))
	};
}
function hr(e, t, n, r, i) {
	let a = r.mode === "reveal" ? "reveal" : "persist", o = or.has(r.trigger) ? r.trigger : "load", s = i?.performance === "low", c = Dn(t, cr(r)), { wrapper: l } = c, u = lr(t, r), d = Vn(n, fr(n, r, a, t), {
		lowTier: s,
		persistFps: 24,
		revealFps: 30,
		maxDpr: 2
	}), f = dr(t), p = r.animated === !0 || In.test(f), m = null, h = null, g = !1, _ = !1, v = !1, y = () => {
		m?.destroy(), m = null, r.onComplete?.(t);
	}, b = () => {
		g || m || (m = Wn({
			el: t,
			wrapper: l,
			effect: n,
			settings: d,
			prefix: "kt-stylize",
			animatedSource: p,
			...mr(r),
			onProgress: (e, t) => r.onProgress?.(e, t),
			onFinish: y,
			onRendered: (e) => {
				e && a === "persist" && r.onComplete?.(t);
			}
		}), _ && m.pause(), m.start());
	}, x = () => {
		if (!(g || v)) {
			if (v = !0, a === "persist" || o === "load") {
				b();
				return;
			}
			o === "view" && (h = ae(t, b, {
				threshold: Number(r.threshold ?? .05),
				rootMargin: r.rootMargin || "0px"
			}));
		}
	}, S = () => t.complete && t.naturalWidth > 0, C = () => {
		t.removeEventListener("load", C), x();
	};
	return S() ? x() : t.addEventListener("load", C), {
		el: e,
		type: "stylize",
		get animatedMedia() {
			return p || d.live;
		},
		get motion() {
			return d.styleConfig.motion;
		},
		update(e = {}) {
			let t = pr(e);
			return t ? (Hn(d, t, m), !0) : !1;
		},
		replay() {
			if (!g) {
				if (m) {
					m.replay();
					return;
				}
				S() && b();
			}
		},
		pause() {
			_ = !0, m?.pause();
		},
		resume() {
			_ = !1, m?.resume();
		},
		destroy() {
			g || (g = !0, t.removeEventListener("load", C), h?.disconnect(), h = null, m?.destroy(), m = null, On(t, c), u == null ? t.removeAttribute("style") : t.setAttribute("style", u));
		}
	};
}
function gr(e, t, n, r, i) {
	let a = !1, o = !1, s = !1, c = null, l = null, u = r.mode === "reveal" ? "reveal" : "persist", d = or.has(r.trigger) ? r.trigger : "load", f = i?.performance === "low", p = Dn(t, cr(r)), { wrapper: m } = p, h = lr(t, r), g = Vn(n, fr(n, r, u, t), {
		lowTier: f,
		persistFps: 24,
		revealFps: 24,
		maxDpr: 1.5
	}), _ = () => {
		a || l || t.readyState < 2 || (c?.disconnect(), c = null, l = Gn({
			el: t,
			wrapper: m,
			effect: n,
			settings: g,
			prefix: "kt-stylize",
			...mr(r),
			onProgress: (e, t) => r.onProgress?.(e, t),
			onFinish: () => r.onComplete?.(t)
		}), o && l.pause(), l.start());
	}, v = () => {
		if (!a) {
			if (s || u === "persist" || d === "load") {
				_();
				return;
			}
			d === "view" && (c = ae(t, _, {
				threshold: Number(r.threshold ?? .05),
				rootMargin: r.rootMargin || "0px"
			}));
		}
	}, y = () => {
		t.removeEventListener("loadeddata", y), v();
	};
	return t.readyState >= 2 ? v() : t.addEventListener("loadeddata", y), {
		el: e,
		type: "stylize",
		get animatedMedia() {
			return !0;
		},
		get motion() {
			return g.styleConfig.motion;
		},
		update(e = {}) {
			let t = pr(e);
			return t ? (Hn(g, t, l), !0) : !1;
		},
		replay() {
			a || (s = !0, l ? l.replay() : _());
		},
		pause() {
			o = !0, l?.pause();
		},
		resume() {
			o = !1, l?.resume();
		},
		destroy() {
			a || (a = !0, t.removeEventListener("loadeddata", y), c?.disconnect(), l?.destroy(), On(t, p), h == null ? t.removeAttribute("style") : t.setAttribute("style", h));
		}
	};
}
var _r = {
	create(e, t = {}, n = null) {
		let r = ur(e);
		if (!r) return null;
		let i = t.preset || t.effect || "dither", a = Rn(i) ? i : An[0];
		return r.tagName === "VIDEO" ? gr(e, r, a, t, n) : hr(e, r, a, t, n);
	},
	reduced(e, t = {}, n = null) {
		return t.mode === "reveal" ? {
			el: e,
			type: "stylize",
			motion: "none",
			pause() {},
			resume() {},
			replay() {},
			destroy() {}
		} : this.create(e, {
			...t,
			motion: "none",
			pointer: "none"
		}, n);
	}
}, vr = {
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
	},
	drift: {
		from: {
			x: "0.55em",
			opacity: 0
		},
		to: {
			x: 0,
			opacity: 1
		}
	},
	squeeze: {
		from: {
			x: "0.4em",
			opacity: 0,
			scaleX: .28
		},
		to: {
			x: 0,
			opacity: 1,
			scaleX: 1
		}
	}
}, yr = {
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
	},
	drift: {
		x: "-0.45em",
		opacity: 0
	},
	squeeze: {
		x: "-0.35em",
		opacity: 0,
		scaleX: .28
	}
};
function br(e, t, n, r) {
	let i = [], a = () => {
		let t = document.createElement("br");
		t.setAttribute("aria-hidden", "true"), e.appendChild(t);
	}, o = (t) => {
		ge(t).split(/(\n)/).forEach((t) => {
			t && (t === "\n" ? a() : e.appendChild(document.createTextNode(t)));
		});
	}, s = (t) => {
		let n = document.createElement("span");
		if (n.style.display = "inline-block", n.style.transformStyle = "preserve-3d", n.style.backfaceVisibility = "hidden", n.setAttribute("aria-hidden", "true"), n.textContent = t, r) {
			let t = document.createElement("span");
			t.style.cssText = "display:inline-block;overflow:hidden;vertical-align:bottom;", t.appendChild(n), e.appendChild(t);
		} else e.appendChild(n);
		i.push(n);
	};
	return n === "word" ? ge(t).split(/(\n|[^\S\n]+)/).forEach((e) => {
		e && (/^\s+$/.test(e) ? o(e) : s(e));
	}) : he(ge(t)).forEach((e) => {
		/^\s$/.test(e) ? o(e) : s(e);
	}), i;
}
var xr = {
	create(e, t) {
		let n = re(), r = ie();
		if (!n || !r) return null;
		let i = t.by || "char", a = typeof t.animation == "string" && vr[t.animation] ? t.animation : vr[t.preset] ? t.preset : "rise", o = vr[a], s = ye(e), c = se(e, ["aria-label"]), l = _e(e), u = Z(e, [
			"overflow",
			"perspective",
			"display",
			"minHeight"
		]), d = Array.isArray(t.texts) && t.texts.length ? t.texts.map((e) => ge(String(e))) : null, f = Number(t.duration ?? .8), p = Number(t.stagger ?? .03), m = t.ease ? R(t.ease) : "power3.out";
		e.setAttribute("aria-label", d ? d[0] : l), e.innerHTML = "", (a === "spin" || a === "flip") && (e.style.perspective = `${Number(t.perspective ?? 600)}px`);
		let h = br(e, d ? d[0] : l, i, o.wrap && !d), g = null, _ = null, v = 0, y = !0, b = (r) => (g?.kill(), g = n.fromTo(h, { ...o.from }, {
			...o.to,
			duration: f,
			delay: Number(t.delay ?? 0),
			ease: a === "wave" ? t.ease ? R(t.ease) : "back.out(2.2)" : m,
			stagger: p,
			overwrite: !0,
			onComplete: () => {
				t.onComplete?.(e), r?.();
			}
		}), g), x = Math.max(200, Number(t.hold ?? t.pause ?? 2e3)), S = yr[t.swapOut] || yr["slide-up"], C = () => {
			!d || d.length < 2 || !y || (clearTimeout(_), _ = setTimeout(() => {
				y && (g?.kill(), g = n.to(h, {
					...S,
					duration: Math.min(.45, f),
					ease: t.swapEase ? R(t.swapEase) : "power2.in",
					stagger: Math.min(.02, p),
					overwrite: !0,
					onComplete: () => {
						y && (v = (v + 1) % d.length, e.innerHTML = "", h = br(e, d[v], i, !1), e.setAttribute("aria-label", d[v]), t.onSwap?.(v, d[v], e), b(C));
					}
				}));
			}, x));
		}, w = !1, T = r.create({
			trigger: e,
			start: t.start || "top 85%",
			onEnter: () => {
				w && t.once !== !1 || (w = !0, b(d ? C : null));
			},
			onLeaveBack: () => {
				t.once === !1 && (w = !1, clearTimeout(_), g?.kill(), n.set(h, { ...o.from }));
			}
		});
		return n.set(h, { ...o.from }), {
			el: e,
			type: "textSplit",
			get units() {
				return h;
			},
			replay: () => {
				clearTimeout(_), g?.kill(), d && (v = 0, e.innerHTML = "", h = br(e, d[0], i, !1), e.setAttribute("aria-label", d[0])), n.set(h, { ...o.from }), b(d ? C : null);
			},
			pause: () => {
				g?.pause(), clearTimeout(_);
			},
			resume: () => {
				g?.resume(), d && !g?.isActive() && C();
			},
			destroy: () => {
				y = !1, clearTimeout(_), T.kill(), g?.kill(), s(), c(), u();
			}
		};
	},
	reduced(e, t = {}) {
		let n = ye(e), r = se(e, ["aria-label"]), i = Z(e, ["opacity", "transform"]), a = Array.isArray(t.texts) && t.texts.length ? ge(String(t.texts[0])) : _e(e);
		return Array.isArray(t.texts) && t.texts.length && (e.textContent = a), ve(e), e.setAttribute("aria-label", a), e.style.opacity = "1", e.style.transform = "none", {
			el: e,
			type: "textSplit",
			pause() {},
			resume() {},
			destroy() {
				n(), r(), i();
			}
		};
	}
}, Sr = {
	create(e, t) {
		let n = re(), r = ie(), i = ye(e), a = se(e, ["aria-label"]), o = _e(e);
		e.setAttribute("aria-label", o), e.innerHTML = "";
		let s = he(o).map((t) => {
			if (/^\s$/.test(t)) {
				let n = t === "\n" ? document.createElement("br") : document.createTextNode(t);
				return t === "\n" && n.setAttribute("aria-hidden", "true"), e.appendChild(n), null;
			}
			let n = document.createElement("span");
			return n.style.cssText = "display:inline-block;filter:blur(8px);opacity:0;will-change:filter,opacity;", n.setAttribute("aria-hidden", "true"), n.textContent = t, e.appendChild(n), n;
		}).filter(Boolean), c = t.duration ?? .6, l = t.stagger ?? .03, u = null, d = null, f = () => typeof performance < "u" ? performance.now() : Date.now(), p = /* @__PURE__ */ new Set(), m = 0, h = (e, t) => {
			let n = {
				run: e,
				runAt: f() + t
			};
			n.id = setTimeout(() => {
				p.delete(n), e();
			}, t), p.add(n);
		}, g = () => {
			p.forEach((e) => clearTimeout(e.id)), p.clear(), m = 0;
		}, _ = () => {
			t.once !== !1 && s.forEach((e) => {
				e.style.willChange = "";
			});
		}, v = () => {
			if (g(), !s.length) {
				t.onComplete?.();
				return;
			}
			s.forEach((e, n) => {
				h(() => {
					e.style.transition = `filter ${c}s ease, opacity ${c}s ease`, e.style.filter = "blur(0)", e.style.opacity = "1", n === s.length - 1 && (_(), t.onComplete?.());
				}, l * n * 1e3);
			});
		};
		return n && r ? d = n.to(s, {
			filter: "blur(0px)",
			opacity: 1,
			duration: c,
			stagger: l,
			ease: t.ease ? R(t.ease) : "power2.out",
			onComplete: () => {
				_(), t.onComplete?.();
			},
			scrollTrigger: {
				trigger: e,
				start: t.start || "top 85%",
				toggleActions: t.once === !1 ? "play reverse play reverse" : "play none none none"
			}
		}) : u = ae(e, v, { threshold: .1 }), {
			el: e,
			type: "blurText",
			replay: () => {
				if (d) {
					d.restart();
					return;
				}
				s.forEach((e) => {
					e.style.filter = "blur(8px)", e.style.opacity = "0";
				}), v();
			},
			pause: () => {
				d?.pause(), !m && p.size && (m = f(), p.forEach((e) => clearTimeout(e.id)));
			},
			resume: () => {
				if (d?.resume(), !m) return;
				let e = f() - m;
				m = 0, p.forEach((t) => {
					t.runAt += e, t.id = setTimeout(() => {
						p.delete(t), t.run();
					}, Math.max(0, t.runAt - f()));
				});
			},
			destroy: () => {
				u?.disconnect(), g(), d?.scrollTrigger?.kill(), d?.kill(), i(), a();
			}
		};
	},
	reduced(e) {
		let t = ye(e), n = se(e, ["aria-label"]), r = Z(e, ["opacity", "filter"]);
		return e.setAttribute("aria-label", _e(e)), ve(e), e.style.opacity = "1", e.style.filter = "none", {
			el: e,
			type: "blurText",
			pause() {},
			resume() {},
			destroy() {
				t(), n(), r();
			}
		};
	}
}, Cr = {
	create(e, t) {
		let n = e.innerHTML, r = se(e, ["aria-label"]), i = Array.isArray(t.strings) ? t.strings.map(String) : t.strings == null ? [e.textContent || ""] : [String(t.strings)], a = Number(t.typeSpeed ?? 60), o = Number(t.eraseSpeed ?? 30), s = Number(t.pauseAfter ?? 1500), c = t.loop !== !1, l = t.caret !== !1, u = String(t.caretChar ?? "|"), d = t.hangul === !0 || t.compose === !0;
		e.setAttribute("aria-label", i.join(", ")), e.innerHTML = `<span class="kt-tw-text" aria-hidden="true"></span>${l ? `<span class="kt-tw-caret" aria-hidden="true">${u}</span>` : ""}`;
		let f = e.querySelector(".kt-tw-text"), p = 0, m = 0, h = 0, g = !1, _ = !0, v = null, y = (e) => d ? me(e) : [e], b = () => {
			if (!_) return;
			let n = he(i[p]);
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
	},
	fallback(e, t) {
		return this.reduced(e, t);
	}
};
//#endregion
//#region src/modules/textReveal.js
function wr() {
	let e = document.createElement("br");
	return e.setAttribute("aria-hidden", "true"), e;
}
function Tr(e, t) {
	ge(t).split(/(\n)/).forEach((t) => {
		t && e.appendChild(t === "\n" ? wr() : document.createTextNode(t));
	});
}
var Er = {
	create(e, t) {
		let n = ye(e), r = se(e, ["aria-label"]), i = ge(t.text ?? _e(e)), a = t.mode || t.preset || "stream", o = Number(t.speed ?? (a === "stream" ? 30 : a === "hangul" ? 80 : 100)), s = Number(t.delay ?? 0), c = re(), l = /* @__PURE__ */ new Set(), u = [], d = null, f = !0, p = !1, m = !1, h = 0;
		e.setAttribute("aria-label", i), e.innerHTML = "";
		let g = (e, t) => {
			let n = setTimeout(() => {
				l.delete(n), f && e();
			}, t);
			return l.add(n), n;
		}, _ = () => {
			h += 1, l.forEach(clearTimeout), l.clear(), u.forEach((e) => {
				typeof e.kill == "function" ? e.kill() : e.cancel?.();
			}), u.length = 0;
		}, v = (e) => {
			typeof e.resume == "function" ? e.resume() : e.play?.();
		}, y = (e, t = {}) => {
			let n = document.createElement("span");
			return n.textContent = e, n.setAttribute("aria-hidden", "true"), n.style.display = "inline-block", Object.assign(n.style, t), n;
		}, b = () => {
			f && !m && t.onComplete?.(e);
		}, x = () => {
			let t = he(i), n = 0, r = y("");
			e.appendChild(r);
			let a = () => {
				if (n >= t.length) {
					r.remove(), b();
					return;
				}
				let e = t[n];
				if (/^\s$/.test(e)) {
					e === "\n" ? r.before(wr()) : r.before(document.createTextNode(e)), n += 1, g(a, o);
					return;
				}
				let i = me(e), s = 0, c = () => {
					r.textContent = i[s], s += 1, s < i.length ? g(c, o) : (r.before(y(e)), r.textContent = "", n += 1, g(a, o));
				};
				c();
			};
			g(a, s * 1e3);
		}, S = () => {
			let n = he(i).map((t) => {
				if (/^\s$/.test(t)) return Tr(e, t), null;
				let n = y(t, {
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
				ease: t.ease ? R(t.ease) : "elastic.out(1, 0.4)",
				delay: s,
				onComplete: b
			}))) : n.forEach((e, r) => g(() => {
				e.style.transition = "opacity .4s var(--kt-ease-ui, ease), transform .4s var(--kt-ease-ui, ease)", e.style.opacity = "1", e.style.transform = "none", r === n.length - 1 && b();
			}, s * 1e3 + r * Number(t.stagger ?? .04) * 1e3));
		}, C = () => {
			let n;
			n = a === "word" ? i.split(/(\n|[^\S\n]+)/) : a === "line" ? i.split(/(\n)/) : he(i);
			let r = [];
			n.forEach((t) => {
				if (!t) return;
				if (/^\s+$/.test(t)) {
					Tr(e, t);
					return;
				}
				let n = y("", {
					overflow: "hidden",
					verticalAlign: "bottom",
					paddingBottom: "2px"
				}), i = y(t, {
					opacity: "0",
					transform: "translateY(100%)"
				});
				n.appendChild(i), e.appendChild(n), r.push(i);
			}), c ? u.push(c.to(r, {
				y: "0%",
				opacity: 1,
				duration: Number(t.duration ?? .6),
				stagger: Number(t.stagger ?? .05),
				ease: t.ease ? R(t.ease) : "power3.out",
				delay: s,
				onComplete: b
			})) : r.forEach((e, n) => g(() => {
				e.style.transition = "opacity .5s var(--kt-ease-ui, ease), transform .5s var(--kt-ease-ui, ease)", e.style.opacity = "1", e.style.transform = "translateY(0)", n === r.length - 1 && b();
			}, s * 1e3 + n * Number(t.stagger ?? .05) * 1e3));
		}, w = () => {
			let n = String(t.chars || "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789<>/\\|=+*#"), r = Se({
				rainbow: t.rainbow,
				rainbowColors: t.rainbowColors,
				scrambleFade: t.scrambleFade
			}), a = Math.max(1, Math.round(Number(t.flickerCount ?? 3))), c = Math.max(200, Number(t.hold ?? 1400)), l = he(i).map((e) => e === "\n" ? {
				span: wr(),
				char: e,
				space: !0,
				break: !0
			} : /^\s$/.test(e) ? {
				span: y("\xA0", { width: "0.45em" }),
				char: e,
				space: !0
			} : {
				span: y(e, { visibility: "hidden" }),
				char: e,
				space: !1
			});
			l.forEach(({ span: t }) => e.appendChild(t));
			let u = 0, d = () => {
				if (!f) return;
				if (u >= l.length) {
					b(), t.loop === !0 && g(() => {
						l.forEach(({ span: e, space: t }) => {
							t || (e.style.visibility = "hidden");
						}), u = 0, g(d, o);
					}, c);
					return;
				}
				let e = l[u];
				if (u += 1, e.space) {
					g(d, e.break ? 0 : o * .6);
					return;
				}
				e.span.style.visibility = "visible";
				let i = 0, s = () => {
					f && (i < a ? (e.span.textContent = n[Math.floor(Math.random() * n.length)], r?.paint(e.span), i += 1, g(s, Math.max(16, o * .45))) : (e.span.textContent = e.char, r?.clear(e.span), g(d, o)));
				};
				s();
			};
			g(d, s * 1e3);
		}, T = () => {
			let n = h, r = Math.max(.1, Number(t.duration ?? .9)) * 1e3, a = he(i).map((t) => {
				if (/^\s$/.test(t)) return Tr(e, t), null;
				let n = y(t, { opacity: "0" });
				return e.appendChild(n), n;
			}).filter(Boolean), o = (e, t = !0) => {
				let n = 2 + Math.floor(Math.random() * 3), i = [{ opacity: 0 }];
				for (let e = 0; e < n; e += 1) i.push({
					opacity: 1,
					offset: Math.min(.92, (e + .4) / (n + 1))
				}), i.push({
					opacity: Math.random() * .25,
					offset: Math.min(.96, (e + .8) / (n + 1))
				});
				i.push({ opacity: +!!t });
				let a = e.animate(i, {
					duration: r * (.55 + Math.random() * .7),
					delay: Math.random() * r * .6 + s * 1e3,
					easing: "steps(1, end)",
					fill: "both"
				});
				return u.push(a), a;
			}, c = 0;
			if (a.forEach((e) => {
				o(e).finished.then(() => {
					n === h && (c += 1, c === a.length && b());
				}).catch(() => {});
			}), t.flickerLoop === !0) {
				let e = () => {
					if (!f) return;
					let t = a[Math.floor(Math.random() * a.length)];
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
					g(e, 500 + Math.random() * 1800);
				};
				g(e, r + 600);
			}
		}, E = () => {
			let n = String(t.chars || "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*"), r = Se({
				rainbow: t.rainbow,
				rainbowColors: t.rainbowColors,
				scrambleFade: t.scrambleFade
			}), a = Math.max(12, Number(t.speed ?? 34)), o = Math.max(1, Number(t.revealRate ?? 2)), c = he(i), l = c.map((t) => {
				if (/^\s$/.test(t)) return Tr(e, t), null;
				let n = y(t, { textAlign: "center" });
				return e.appendChild(n), n;
			});
			l.forEach((e) => {
				e && (e.style.width = `${Math.ceil(e.getBoundingClientRect().width * 100) / 100}px`);
			});
			let u = 0, d = 0, p = () => {
				l.forEach((e, t) => {
					e && (t < u ? (e.textContent = c[t], r?.clear(e)) : (e.textContent = n[Math.floor(Math.random() * n.length)] || c[t], r?.paint(e)));
				});
			}, m = () => {
				if (f) {
					if (p(), d += 1, d % o === 0 && (u += 1), u >= c.length) {
						l.forEach((e, t) => {
							e && (e.textContent = c[t], r?.clear(e));
						}), b(), t.loop === !0 && g(() => {
							u = 0, d = 0, m();
						}, Math.max(200, Number(t.hold ?? 1400)));
						return;
					}
					g(m, a);
				}
			};
			p(), g(m, s * 1e3);
		}, D = () => {
			!p && f && (p = !0, a === "hangul" ? x() : a === "bounce" ? S() : a === "decode" ? w() : a === "flicker" ? T() : a === "shuffle" ? E() : C());
		};
		d = ae(e, D, {
			threshold: Number(t.threshold ?? .2),
			rootMargin: t.rootMargin || "0px"
		});
		let O = () => {
			m || (_(), e.innerHTML = "", f = !0, p = !1, D());
		};
		return {
			el: e,
			type: "textReveal",
			replay: O,
			pause: () => {
				m || (f = !1, l.forEach(clearTimeout), l.clear(), u.forEach((e) => e.pause?.()));
			},
			resume: () => {
				!m && !f && (f = !0, u.length ? u.forEach(v) : O());
			},
			destroy: () => {
				m || (m = !0, f = !1, d?.disconnect(), _(), n(), r());
			}
		};
	},
	reduced(e, t = {}) {
		let n = ye(e), r = se(e, ["aria-label"]), i = ge(t.text ?? _e(e));
		return e.setAttribute("aria-label", i), t.text != null && (e.textContent = i), ve(e), {
			el: e,
			type: "textReveal",
			pause() {},
			resume() {},
			destroy() {
				n(), r();
			}
		};
	}
}, Dr = {
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
	flip: {
		enter: [{
			transform: "perspective(600px) rotateX(-72deg)",
			opacity: 0
		}, {
			transform: "perspective(600px) rotateX(0deg)",
			opacity: 1
		}],
		leave: [{
			transform: "perspective(600px) rotateX(0deg)",
			opacity: 1
		}, {
			transform: "perspective(600px) rotateX(58deg)",
			opacity: 0
		}],
		clip: !0
	},
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
}, Or = {
	create(e, t) {
		let n = e.innerHTML, r = e.getAttribute("style"), i = Array.isArray(t.texts) ? t.texts.map(String) : null;
		if (!i) {
			let t = Array.from(e.children).map((e) => e.textContent.trim()).filter(Boolean);
			i = t.length ? t : [String(e.textContent || "").trim()].filter(Boolean);
		}
		if (!i.length) return null;
		let a = t.effect || t.preset || "slide-up", o = Dr[a] || a === "shimmer" || a === "dissolve" ? a : "slide-up", s = o === "dissolve", c = Math.max(0, Number(t.blur ?? 14));
		Dr.blur.enter[0].filter = `blur(${c}px)`, Dr.blur.leave[1].filter = `blur(${Math.round(c * .85)}px)`, Dr.scale.enter[0].transform = `scale(${Math.max(.1, Number(t.startScale ?? .82))})`, Dr.scale.leave[1].transform = `scale(${Math.max(.1, Number(t.endScale ?? 1.12))})`;
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
		let _ = s ? Dr.fade : Dr[o], v = document.createElement("span");
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
			f ? (y.innerHTML = "", he(e).forEach((e) => {
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
						easing: s ? `steps(${2 + Math.floor(Math.random() * 3)}, end)` : t.ease ? L(t.ease) : "cubic-bezier(.22,.8,.3,1)"
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
	},
	fallback(e, t) {
		return this.reduced(e, t);
	}
};
//#endregion
//#region src/modules/magnetic.js
function kr(e, t, n) {
	if (!(t > 0) || e >= t) return 1;
	let r = (Math.cos(e / t * Math.PI) + 1) / 2;
	return 1 + (n - 1) * r;
}
function Ar(e, { axis: t, maxScale: n, lift: r, range: i, ease: a, item: o }) {
	let s = t === "vertical" || t === "y", c = Math.max(1, Number(n ?? 1.8)), l = Number(r ?? 10), u = Math.max(1, Number(i ?? 120)), d = G(Number(a ?? .22), .02, 1), f = o || null, p = () => f ? Array.from(e.querySelectorAll(f)) : Array.from(e.children), m = /* @__PURE__ */ new Map(), h = [], g = !0, _ = null, v = null, y = [], b = null, x = () => {
		let t = p();
		t.forEach((e) => {
			m.has(e) || m.set(e, Z(e, [
				"transform",
				"transform-origin",
				"will-change"
			])), e.style.transform = "";
		});
		let n = e.getBoundingClientRect();
		h = t.map((e) => {
			let t = e.getBoundingClientRect();
			return {
				node: e,
				centre: s ? t.top + t.height / 2 - n.top : t.left + t.width / 2 - n.left,
				size: s ? t.height : t.width
			};
		}), t.forEach((e) => {
			e.style.transformOrigin = s ? "left center" : "center bottom", e.style.willChange = "transform";
		}), y = h.map(() => 1);
	}, S = () => {
		if (!h.length) return;
		let e = h.map(({ centre: e }) => v == null ? 1 : kr(Math.abs(v - e), u, c)), t = !0;
		y = y.map((n, r) => {
			let i = W(n, e[r], d);
			return Math.abs(i - e[r]) > .002 && (t = !1), i;
		});
		let n = h.map(({ size: e }, t) => e * (y[t] - 1) / 2), r = [0];
		for (let e = 1; e < h.length; e += 1) r[e] = r[e - 1] + n[e - 1] + n[e];
		b ??= v ?? h[Math.floor(h.length / 2)].centre, v != null && (b = W(b, v, d), Math.abs(b - v) > .02 && (t = !1));
		let i = h.findIndex(({ centre: e }) => e >= b);
		i < 0 && (i = h.length - 1);
		let a = Math.max(0, i - 1), o = h[i].centre - h[a].centre, f = o ? G((b - h[a].centre) / o, 0, 1) : 0, p = W(r[a], r[i], f);
		return h.forEach(({ node: e }, t) => {
			let n = r[t] - p, i = (y[t] - 1) / Math.max(1e-4, c - 1), a = s ? `translate3d(${(l * i).toFixed(2)}px, ${n.toFixed(2)}px, 0)` : `translate3d(${n.toFixed(2)}px, ${(-l * i).toFixed(2)}px, 0)`;
			e.style.transform = `${a} scale(${y[t].toFixed(3)})`;
		}), t;
	}, C = () => {
		if (!g) {
			_ = null;
			return;
		}
		_ = S() ? null : requestAnimationFrame(C);
	}, w = () => {
		g && _ == null && (_ = requestAnimationFrame(C));
	}, T = (t) => {
		let n = e.getBoundingClientRect();
		v = s ? t.clientY - n.top : t.clientX - n.left, w();
	}, E = () => {
		v = null, w();
	};
	x(), S(), e.addEventListener("pointermove", T, { passive: !0 }), e.addEventListener("pointerleave", E);
	let D = null;
	return typeof ResizeObserver < "u" && (D = new ResizeObserver(() => {
		v ?? x();
	}), D.observe(e)), {
		el: e,
		type: "magnetic",
		pause() {
			g = !1, _ != null && cancelAnimationFrame(_), _ = null;
		},
		resume() {
			g || (g = !0, w());
		},
		destroy() {
			g = !1, _ != null && cancelAnimationFrame(_), D?.disconnect(), e.removeEventListener("pointermove", T), e.removeEventListener("pointerleave", E), m.forEach((e, t) => {
				e(), oe(t);
			}), m.clear();
		}
	};
}
function jr(e, { strength: t, radius: n, ease: r }) {
	let i = e.parentElement || e, a = t ?? .4, o = n ?? 100, s = r ?? .15, c = Z(e, ["transform", "willChange"]), l = 0, u = 0, d = 0, f = 0, p = !1, m = !0, h = null;
	e.style.willChange = "transform";
	let g = () => {
		if (!m) return;
		d = W(d, l, s), f = W(f, u, s), e.style.transform = `translate3d(${d}px, ${f}px, 0)`;
		let t = Math.abs(d - l) > .1 || Math.abs(f - u) > .1;
		h = p || t ? requestAnimationFrame(g) : null;
	}, _ = () => {
		h == null && m && (h = requestAnimationFrame(g));
	}, v = (t) => {
		let n = e.getBoundingClientRect(), r = t.clientX - (n.left + n.width / 2), i = t.clientY - (n.top + n.height / 2);
		Math.hypot(r, i) <= o * 1.5 ? (p = !0, l = r * a, u = i * a, _()) : (p = !1, l = 0, u = 0, _());
	}, y = () => {
		p = !1, l = 0, u = 0, _();
	};
	return i.addEventListener("pointermove", v, { passive: !0 }), i.addEventListener("pointerleave", y), {
		el: e,
		type: "magnetic",
		pause: () => {
			m = !1, h != null && cancelAnimationFrame(h), h = null;
		},
		resume: () => {
			m || (m = !0, _());
		},
		destroy: () => {
			m = !1, h != null && cancelAnimationFrame(h), i.removeEventListener("pointermove", v), i.removeEventListener("pointerleave", y), c();
		}
	};
}
var Mr = {
	create(e, t) {
		return (t.preset === "dock" || t.effect === "dock" ? "dock" : "pointer") == "dock" ? Ar(e, {
			axis: t.axis,
			maxScale: t.maxScale,
			lift: t.lift,
			range: t.range,
			ease: t.ease,
			item: t.item
		}) : jr(e, {
			strength: t.strength,
			radius: t.radius,
			ease: t.ease
		});
	},
	reduced() {},
	fallback(e, t) {
		return this.create(e, t);
	}
}, Nr = {
	create(e, t) {
		let n = re(), r = ie(), i = e.innerHTML, a = e.getAttribute("style"), o = Math.abs(Number(t.speed ?? 50)), s = t.direction === "right" ? 1 : -1, c = t.reverseOnScrollUp === !0, l = Number(t.scrollAcceleration ?? 0), u = t.pauseOnHover !== !1, d = Math.max(1, Number(t.clones ?? 2));
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
		let m = Array.from(e.children), h = o * s, g = h, _ = !1, v = h, y = p.offsetWidth || 0, b = s < 0 ? 0 : -y, x = !0, S = null, C = performance.now(), w = typeof ResizeObserver < "u" ? new ResizeObserver(() => {
			y = p.offsetWidth || 0;
		}) : null;
		w?.observe(p);
		let T = (e) => {
			n ? n.set(m, { x: e }) : m.forEach((t) => {
				t.style.transform = `translate3d(${e}px,0,0)`;
			});
		}, E = (e = performance.now()) => {
			if (!x) return;
			let t = Math.min(.05, Math.max(0, (e - C) / 1e3));
			C = e;
			let n = y;
			if (n > 0) {
				for (v += (g - v) * Math.min(1, t * 8), b += v * t; b <= -n;) b += n;
				for (; b > 0;) b -= n;
				T(b), _ || (g += (h - g) * Math.min(1, t * 4));
			}
			S = requestAnimationFrame(E);
		};
		S = requestAnimationFrame(E);
		let D = null, O = Math.max(0, Number(t.skew ?? 0)), k = 0, A = 0, j = null, M = () => {
			x && (k *= .9, A += (k - A) * .12, e.style.transform = `skewX(${A.toFixed(3)}deg)`, j = requestAnimationFrame(M));
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
				x = !1, S != null && cancelAnimationFrame(S);
			},
			resume: () => {
				x || (x = !0, C = performance.now(), S = requestAnimationFrame(E));
			},
			destroy: () => {
				x = !1, S != null && cancelAnimationFrame(S), j != null && cancelAnimationFrame(j), w?.disconnect(), D?.kill(), e.removeEventListener("pointerenter", N), e.removeEventListener("pointerleave", P), e.innerHTML = i, a == null ? e.removeAttribute("style") : e.setAttribute("style", a);
			}
		};
	},
	reduced(e) {
		let t = Z(e, ["overflowX", "transform"]);
		return e.style.overflowX = "auto", e.style.transform = "none", {
			el: e,
			type: "marquee",
			pause() {},
			resume() {},
			destroy: t
		};
	},
	fallback(e, t) {
		return this.reduced(e, t);
	}
};
//#endregion
//#region src/modules/overflowText.js
function Pr(e) {
	let t = String(e || "top-to-bottom").toLowerCase();
	return {
		down: "top-to-bottom",
		up: "bottom-to-top",
		right: "left-to-right",
		left: "right-to-left"
	}[t] || t;
}
function Fr(e) {
	return e === "bottom-to-top" ? "inset(100% 0 0 0)" : e === "left-to-right" ? "inset(0 100% 0 0)" : e === "right-to-left" ? "inset(0 0 0 100%)" : "inset(0 0 100% 0)";
}
function Ir(e) {
	return e === "bottom-to-top" ? "inset(0 0 100% 0)" : e === "left-to-right" ? "inset(0 0 0 100%)" : e === "right-to-left" ? "inset(0 100% 0 0)" : "inset(100% 0 0 0)";
}
function Lr(e, t = "0.3em") {
	return e === "bottom-to-top" ? `translate3d(0,-${t},0)` : e === "left-to-right" ? `translate3d(${t},0,0)` : e === "right-to-left" ? `translate3d(-${t},0,0)` : `translate3d(0,${t},0)`;
}
function Rr(e, t) {
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
function zr(e) {
	let t = document.createElement("div");
	return t.innerHTML = e, t.textContent || "";
}
var Br = {
	create(e, t = {}) {
		let n = t.mode || t.preset || "loop", r = K(t.speed, 36, 1), i = K(t.delay, 700), a = K(t.endPause, 900), o = K(t.restartDelay, i), s = K(t.gap, 32), c = t.direction === "right" ? 1 : -1, l = Pr(t.maskDirection || t.transitionDirection), u = K(t.maskDuration, 260, 20), d = t.pauseOnHover !== !1, f = t.trigger === "hover", p = null, m = null, h = null, g = null, _ = null, v = e.innerHTML, y = e.getAttribute("style"), b = e.getAttribute("title"), x = e.getAttribute("aria-label"), S = e.getAttribute("role"), C = String(t.text ?? e.textContent ?? "").trim(), w = n === "rolling" ? Rr(e, t) : null, T = [
			"fade",
			"dissolve",
			"flip",
			"page"
		].includes(n) && e.children.length >= 2 ? Rr(e, t) : null, E = null, D = null, O = null, k = !1, A = !1, j = null, M = null, N = 0;
		e.textContent = "", e.style.overflow = "hidden", e.style.whiteSpace = "nowrap", getComputedStyle(e).position === "static" && (e.style.position = "relative"), C && e.setAttribute("aria-label", C), !b && t.title !== !1 && C && e.setAttribute("title", C);
		let P = !1, F = null, I = () => {
			E?.cancel?.(), E = null, clearTimeout(O), O = null, F = null;
		}, L = (e, t) => {
			clearTimeout(O), O = setTimeout(() => {
				if (O = null, !k) {
					if (A || P) {
						F = e;
						return;
					}
					e();
				}
			}, Math.max(0, t));
		}, R = async (e) => {
			let n = e.animate([{
				clipPath: "inset(0 0 0 0)",
				webkitClipPath: "inset(0 0 0 0)",
				transform: "translate3d(0,0,0)",
				opacity: 1
			}, {
				clipPath: Fr(l),
				webkitClipPath: Fr(l),
				transform: Lr(l),
				opacity: .6
			}], {
				duration: u,
				easing: t.maskEase || "cubic-bezier(.5,0,.75,.4)",
				fill: "forwards"
			});
			E = n;
			try {
				await n.finished;
			} catch {}
			E === n && (E = null);
		}, z = async (e) => {
			let n = e.animate([{
				clipPath: Ir(l),
				webkitClipPath: Ir(l),
				transform: Lr(l === "bottom-to-top" ? "top-to-bottom" : l === "top-to-bottom" ? "bottom-to-top" : l === "left-to-right" ? "right-to-left" : "left-to-right"),
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
			E = n;
			try {
				await n.finished;
			} catch {}
			E === n && (E = null);
		}, B = (e = C, t = !1, n = !1) => {
			let r = document.createElement("span");
			return r.className = "kt-overflow-text-segment", n ? r.innerHTML = e : r.textContent = e, r.style.cssText = "display:inline-block;flex:0 0 auto;white-space:nowrap;", t && r.setAttribute("aria-hidden", "true"), r;
		}, V = () => {
			let n = w || [];
			if (!n.length) return;
			e.innerHTML = "", e.setAttribute("role", t.role || "status"), e.setAttribute("aria-live", t.ariaLive || "polite");
			let r = document.createElement("span");
			r.className = "kt-overflow-rolling-viewport", r.style.cssText = "display:block;position:relative;height:1.35em;overflow:hidden;", M = document.createElement("span"), M.className = "kt-overflow-rolling-track", M.style.cssText = "display:flex;flex-direction:column;will-change:transform;";
			let i = B(n[0], !1, !0), a = B(n[1 % n.length], !0, !0);
			i.style.height = a.style.height = "1.35em", i.style.lineHeight = a.style.lineHeight = "1.35em", i.style.display = a.style.display = "flex", i.style.alignItems = a.style.alignItems = "center", i.style.gap = a.style.gap = "0.4em", M.append(i, a), r.appendChild(M), e.appendChild(r);
			let o = t.rollDirection === "down" ? 1 : -1, s = K(t.rollDuration, 380, 50), c = K(t.holdDuration, 1500, 100), l = async () => {
				if (k || A || n.length < 2) return;
				let r = (N + 1) % n.length, i = o < 0 ? M.lastElementChild : M.firstElementChild;
				i.innerHTML = n[r];
				let a = o < 0 ? "translate3d(0,0,0)" : "translate3d(0,-1.35em,0)", u = o < 0 ? "translate3d(0,-1.35em,0)" : "translate3d(0,0,0)";
				M.style.transform = a;
				let d = M.animate([{ transform: a }, { transform: u }], {
					duration: s,
					easing: t.easing || "cubic-bezier(.22,.8,.25,1)",
					fill: "forwards"
				});
				E = d;
				try {
					await d.finished;
				} catch {
					return;
				}
				if (!k) {
					if (d.cancel(), o < 0) {
						let e = M.firstElementChild;
						M.appendChild(e);
					} else {
						let e = M.lastElementChild;
						M.insertBefore(e, M.firstElementChild);
					}
					M.style.transform = "translate3d(0,0,0)", N = r, e.setAttribute("aria-label", zr(n[N])), t.onChange?.(N, n[N], e), f || L(l, c);
				}
			};
			if (f) {
				_ = t.hoverTarget && (e.closest(t.hoverTarget) || e.parentElement) || e;
				let i = t.restoreOnLeave !== !1, a = t.loopOnHover === !0, o = t.restoreDirection === "continue" || t.restoreDirection === "forward", c = t.easing || "cubic-bezier(.22,.8,.25,1)", l = "translate3d(0,0,0)", u = "translate3d(0,-1.35em,0)", d = 0, f = null, v = () => {
					M.style.transition = "none", M.firstElementChild && (M.firstElementChild.innerHTML = n[0]), M.lastElementChild && (M.lastElementChild.innerHTML = n[1 % n.length]), N = 0, M.style.transform = l, e.setAttribute("aria-label", zr(n[0]));
				}, y = null, b = () => {
					if (y) return;
					let i = Math.round(r.getBoundingClientRect().width || e.getBoundingClientRect().width || 120), a = n.map(zr).join(" ");
					e.innerHTML = "";
					let o = document.createElement("span");
					o.style.cssText = `display:inline-block;overflow:hidden;white-space:nowrap;vertical-align:bottom;width:${i}px;max-width:${i}px;`;
					let s = document.createElement("span");
					s.style.cssText = "display:inline-flex;white-space:nowrap;will-change:transform;";
					let c = document.createElement("span");
					c.textContent = a + "  ";
					let l = document.createElement("span");
					l.setAttribute("aria-hidden", "true"), l.textContent = a + "  ", s.append(c, l), o.appendChild(s), e.appendChild(o);
					let u = c.getBoundingClientRect().width || 200, d = Math.max(20, K(t.speed, 60));
					y = s.animate([{ transform: "translateX(0)" }, { transform: `translateX(${-u}px)` }], {
						duration: Math.max(600, u / d * 1e3),
						iterations: Infinity,
						easing: "linear"
					});
				}, x = () => {
					y && (y.cancel(), y = null, e.innerHTML = "", e.appendChild(r), v());
				};
				if (o && M.children.length < 3 && M.firstElementChild) {
					let e = M.firstElementChild.cloneNode(!0);
					e.innerHTML = n[0], M.appendChild(e);
				}
				p = () => {
					if (!k) {
						if (a) {
							b();
							return;
						}
						if (clearTimeout(f), o) {
							M.style.transition = "none", M.style.transform = l, M.offsetHeight, M.style.transition = `transform ${s}ms ${c}`, M.style.transform = u, e.setAttribute("aria-label", zr(n[1 % n.length])), t.onChange?.(1 % n.length, n[1 % n.length], e);
							return;
						}
						v(), M.offsetHeight, M.style.transition = `transform ${s}ms ${c}`, M.style.transform = u, e.setAttribute("aria-label", zr(n[1 % n.length])), t.onChange?.(1 % n.length, n[1 % n.length], e);
					}
				}, m = () => {
					if (!k) {
						if (a) {
							i && x();
							return;
						}
						if (i) {
							if (o) {
								M.style.transition = `transform ${s}ms ${c}`, M.style.transform = "translate3d(0,-2.7em,0)", e.setAttribute("aria-label", zr(n[0])), t.onChange?.(0, n[0], e), clearTimeout(f), f = setTimeout(() => {
									k || (M.style.transition = "none", M.style.transform = l);
								}, s + 60);
								return;
							}
							M.style.transition = `transform ${s}ms ${c}`, M.style.transform = l, e.setAttribute("aria-label", zr(n[0])), t.onChange?.(0, n[0], e);
						}
					}
				}, h = (e) => {
					d || p(), d |= e.type === "pointerenter" ? 1 : 2;
				}, g = (e) => {
					e.type === "focusout" && _.contains(e.relatedTarget) || (d &= e.type === "pointerleave" ? -2 : -3, d || m());
				}, _.addEventListener("pointerenter", h), _.addEventListener("focusin", h), _.addEventListener("pointerleave", g), _.addEventListener("focusout", g);
			} else n.length > 1 && L(l, K(t.delay, c));
		}, H = () => {
			let r = T || [];
			if (r.length < 2) {
				U();
				return;
			}
			I(), e.innerHTML = "", e.style.whiteSpace = "normal", e.setAttribute("role", t.role || "status"), e.setAttribute("aria-live", t.ariaLive || "polite");
			let a = document.createElement("span");
			a.className = "kt-overflow-scene-viewport", a.style.cssText = "display:block;position:relative;overflow:hidden;", n === "flip" && (a.style.perspective = `${K(t.perspective, 700, 100)}px`), e.appendChild(a);
			let o = r.map((e) => {
				let t = document.createElement("span");
				return t.className = "kt-overflow-scene", t.innerHTML = e, t.style.cssText = "display:block;white-space:normal;position:relative;", n === "flip" && (t.style.transformOrigin = "center"), a.appendChild(t), t;
			}), s = 0;
			o.forEach((e) => {
				s = Math.max(s, e.offsetHeight);
			}), s > 0 && (a.style.height = `${s}px`), o.forEach((e, t) => {
				e.style.position = "absolute", e.style.inset = "0", e.style.opacity = t === 0 ? "1" : "0";
			});
			let c = 0, l = K(t.pageDuration, 1800, 120), u = K(t.dissolveDuration ?? t.flipDuration ?? t.maskDuration, 460, 60), d = t.flipDirection !== "up", f = () => {
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
				if (k) return;
				let i = o[c], a = o[r], [s, l] = f(), d = {
					duration: u,
					easing: n === "flip" ? "cubic-bezier(.4,0,.2,1)" : "ease",
					fill: "both"
				}, p = i.animate(s, d);
				E = a.animate(l, d), E.onfinish = () => {
					p.cancel(), E?.cancel?.(), i.style.opacity = "0", i.style.transform = "", i.style.filter = "", i.style.clipPath = "", a.style.opacity = "1", a.style.transform = "", a.style.filter = "", a.style.clipPath = "";
				}, c = r, N = r, t.onPage?.(r, o.length, e);
			}, m = () => {
				if (k) return;
				if (A) {
					L(m, l);
					return;
				}
				let e = (c + 1) % o.length;
				p(e), (t.repeat !== !1 || e !== 0) && L(m, l);
			};
			L(m, i + l);
		}, U = () => {
			I(), e.textContent = "", j = document.createElement("span"), j.className = "kt-overflow-text-viewport", j.style.cssText = "display:block;position:relative;overflow:hidden;will-change:clip-path,transform;", M = document.createElement("span"), M.className = `kt-overflow-text-track kt-overflow-text-${n}`, M.setAttribute("aria-hidden", "true"), M.dataset.mode = n, M.style.cssText = "display:inline-flex;align-items:center;white-space:nowrap;will-change:transform;";
			let l = B();
			M.appendChild(l), j.appendChild(M), e.appendChild(j);
			let u = j.clientWidth || e.clientWidth, d = Math.max(0, l.scrollWidth - u), f = t.force === !0 || d > K(t.threshold, 1);
			if (e.dataset.ktOverflowActive = String(f), !f) {
				M.style.display = "inline-block", M.style.maxWidth = "100%", M.style.overflow = "hidden", M.style.textOverflow = t.ellipsis === !1 ? "clip" : "ellipsis";
				return;
			}
			if (n === "loop") {
				l.style.marginRight = `${s}px`;
				let e = B(C, !0);
				e.style.marginRight = `${s}px`, M.appendChild(e);
				let n = l.getBoundingClientRect().width + s, a = Math.max(200, n / r * 1e3), o = c < 0 ? 0 : -n, u = c < 0 ? -n : 0;
				E = M.animate([{ transform: `translate3d(${o}px,0,0)` }, { transform: `translate3d(${u}px,0,0)` }], {
					duration: a,
					delay: i,
					iterations: t.repeat === !1 ? 1 : Infinity,
					easing: "linear",
					fill: "both"
				});
				return;
			}
			let p = d, m = Math.max(120, p / r * 1e3), h = c < 0 ? 0 : -p, g = c < 0 ? -p : 0;
			if (M.style.transform = `translate3d(${h}px,0,0)`, n === "bounce") {
				let e = i + m + a + m + o, n = G(i / e, 0, 1), r = G((i + m) / e, n, 1), s = G((i + m + a) / e, r, 1), c = G((i + m + a + m) / e, s, 1);
				E = M.animate([
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
				E = M.animate([{ transform: `translate3d(${h}px,0,0)` }, { transform: `translate3d(${g}px,0,0)` }], {
					duration: m,
					delay: i,
					easing: t.easing || "ease-in-out",
					fill: "forwards"
				});
				return;
			}
			if (n === "scroll-fade" || n === "scrollFade") {
				let e = K(t.maskDuration, 320, 10);
				if (t.crossfade === !0) {
					let n = l.getBoundingClientRect().height || l.offsetHeight;
					j.style.height = n ? `${n}px` : "1.35em", M.style.position = "absolute", M.style.left = "0", M.style.top = "0", M.style.willChange = "transform,opacity";
					let r = async () => {
						if (k || A) return;
						M.style.opacity = "1", M.style.transform = `translate3d(${h}px,0,0)`;
						let n = M.animate([{ transform: `translate3d(${h}px,0,0)` }, { transform: `translate3d(${g}px,0,0)` }], {
							duration: m,
							delay: i,
							easing: t.easing || "linear",
							fill: "forwards"
						});
						E = n;
						try {
							await n.finished;
						} catch {
							return;
						}
						if (k || A || (n.cancel(), M.style.transform = `translate3d(${g}px,0,0)`, await new Promise((e) => L(e, a)), k || A)) return;
						let s = M.cloneNode(!0);
						s.setAttribute("aria-hidden", "true"), s.style.cssText = M.style.cssText, s.style.transform = `translate3d(${g}px,0,0)`, s.style.opacity = "1", j.appendChild(s), M.style.transform = `translate3d(${h}px,0,0)`, M.style.opacity = "0", s.animate([{ opacity: 1 }, { opacity: 0 }], {
							duration: e,
							easing: "ease",
							fill: "forwards"
						});
						let c = M.animate([{ opacity: 0 }, { opacity: 1 }], {
							duration: e,
							easing: "ease",
							fill: "forwards"
						});
						E = c;
						try {
							await c.finished;
						} catch {
							s.remove();
							return;
						}
						s.remove(), M.style.opacity = "1", t.repeat !== !1 && L(r, o);
					};
					r();
					return;
				}
				let n = i + e + m + e + a, r = G(i / n, 0, 1), s = G((i + e) / n, r, 1), c = G((i + e + m) / n, s, 1), u = G((i + e + m + e) / n, c, 1);
				E = M.animate([
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
				let n = Math.max(1, u - K(t.pageOverlap, 12)), r = [0];
				for (let e = n; e < d; e += n) r.push(e);
				r[r.length - 1] !== d && r.push(d);
				let a = K(t.rollDuration, 420, 60), s = K(t.pageDuration, 1200, 120), l = t.rollDirection === "down";
				j.style.height = "1.3em", M.remove();
				let f = (e) => {
					let t = document.createElement("span");
					t.className = "kt-overflow-text-line", t.setAttribute("aria-hidden", "true"), t.style.cssText = "position:absolute;left:0;top:0;height:100%;display:inline-flex;align-items:center;white-space:nowrap;will-change:transform;";
					let n = B();
					return n.style.transform = `translate3d(${e}px,0,0)`, t.appendChild(n), j.appendChild(t), t;
				}, p = (e) => {
					let t = r[e];
					return c < 0 ? -t : -(d - t);
				}, m = f(0), h = f(0);
				h.style.transform = "translateY(100%)";
				let g = 0, _ = async () => {
					if (k || A) return;
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
					E = d;
					try {
						await Promise.all([u.finished, d.finished]);
					} catch {
						return;
					}
					if (k) return;
					u.cancel(), d.cancel();
					let f = m;
					m = h, h = f, m.style.transform = "translateY(0)", h.style.transform = "translateY(100%)", m.dataset.page = String(g), t.onPage?.(g, r.length, e), (t.repeat !== !1 || g < r.length - 1) && L(_, g === 0 ? o : s);
				};
				L(_, i);
				return;
			}
			if (n === "dissolve") {
				let n = Math.max(1, u - K(t.pageOverlap, 12)), r = [0];
				for (let e = n; e < d; e += n) r.push(e);
				r[r.length - 1] !== d && r.push(d);
				let a = K(t.dissolveDuration ?? t.maskDuration, 460, 100), s = K(t.jitter, 5, 0);
				M.style.display = "inline-block", M.textContent = "";
				let l = [];
				he(C).forEach((e) => {
					if (/^\s$/.test(e)) {
						M.appendChild(document.createTextNode(e));
						return;
					}
					let t = document.createElement("span");
					t.textContent = e, t.style.cssText = "display:inline-block;will-change:transform,opacity,filter;", M.appendChild(t), l.push(t);
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
					return E = o, o.finished.catch(() => {});
				})), p = 0, m = K(t.pageDuration, 1200, 120), h = async () => {
					if (k || A || (await f(!1), k)) return;
					p = (p + 1) % r.length;
					let n = r[p], i = c < 0 ? -n : -(d - n);
					M.style.transform = `translate3d(${i}px,0,0)`, await f(!0), M.dataset.page = String(p), t.onPage?.(p, r.length, e), (t.repeat !== !1 || p < r.length - 1) && L(h, p === 0 ? o : m);
				};
				L(h, i);
				return;
			}
			if (n === "fade") {
				let n = Math.max(1, u - K(t.pageOverlap, 12)), r = [0];
				for (let e = n; e < d; e += n) r.push(e);
				r[r.length - 1] !== d && r.push(d);
				let a = K(t.maskDuration, 300, 10), s = K(t.pageDuration, 1200, 120), l = 0, f = async () => {
					if (k || A || (await M.animate([{ opacity: 1 }, { opacity: 0 }], {
						duration: a,
						easing: "ease",
						fill: "forwards"
					}).finished.catch(() => {}), k)) return;
					l = (l + 1) % r.length;
					let n = r[l], i = c < 0 ? -n : -(d - n);
					M.style.transform = `translate3d(${i}px,0,0)`, E = M.animate([{ opacity: 0 }, { opacity: 1 }], {
						duration: a,
						easing: "ease",
						fill: "forwards"
					}), await E.finished.catch(() => {}), M.dataset.page = String(l), t.onPage?.(l, r.length, e), (t.repeat !== !1 || l < r.length - 1) && L(f, l === 0 ? o : s);
				};
				L(f, i);
				return;
			}
			if (n === "flip") {
				e.style.perspective = `${K(t.perspective, 520, 120)}px`;
				let n = Math.max(1, u - K(t.pageOverlap, 12)), r = [0];
				for (let e = n; e < d; e += n) r.push(e);
				r[r.length - 1] !== d && r.push(d);
				let a = 0, s = K(t.pageDuration, 1200, 120), l = K(t.flipDuration ?? t.maskDuration, 300, 60), f = (t.flipDirection || "down") === "up" ? 1 : -1;
				j.style.transformOrigin = "50% 50%", j.style.willChange = "transform,opacity";
				let p = async () => {
					if (k || A) return;
					let n = j.animate([{
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
					E = n;
					try {
						await n.finished;
					} catch {
						return;
					}
					if (k) return;
					a = (a + 1) % r.length;
					let i = r[a], u = c < 0 ? -i : -(d - i);
					M.style.transform = `translate3d(${u}px,0,0)`;
					let m = j.animate([{
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
					E = m;
					try {
						await m.finished;
					} catch {
						return;
					}
					M.dataset.page = String(a), t.onPage?.(a, r.length, e), (t.repeat !== !1 || a < r.length - 1) && L(p, a === 0 ? o : s);
				};
				L(p, i);
				return;
			}
			if (n === "page") {
				let n = Math.max(1, u - K(t.pageOverlap, 12)), r = [0];
				for (let e = n; e < d; e += n) r.push(e);
				r[r.length - 1] !== d && r.push(d);
				let a = 0, s = K(t.pageDuration, 1100, 120), l = async () => {
					if (k || A || (await R(j), k)) return;
					a = (a + 1) % r.length;
					let n = r[a], i = c < 0 ? -n : -(d - n);
					M.style.transform = `translate3d(${i}px,0,0)`, j.offsetWidth, await z(j), M.dataset.page = String(a), t.onPage?.(a, r.length, e), (t.repeat !== !1 || a < r.length - 1) && L(l, a === 0 ? o : s);
				};
				L(l, i);
				return;
			}
			let _ = async () => {
				if (k || A) return;
				M.style.transform = `translate3d(${h}px,0,0)`, j.style.clipPath = "inset(0 0 0 0)";
				let e = M.animate([{ transform: `translate3d(${h}px,0,0)` }, { transform: `translate3d(${g}px,0,0)` }], {
					duration: m,
					delay: i,
					easing: t.easing || "linear",
					fill: "forwards"
				});
				E = e;
				try {
					await e.finished;
				} catch {
					return;
				}
				k || A || (e.cancel(), M.style.transform = `translate3d(${g}px,0,0)`, L(async () => {
					await R(j), !k && (M.style.transform = `translate3d(${h}px,0,0)`, j.offsetWidth, await z(j), t.repeat !== !1 && L(_, o));
				}, a));
			};
			_();
		}, W = () => {
			n === "rolling" ? V() : T && T.length >= 2 ? H() : U();
		};
		W();
		let ee = [
			"rolling",
			"fade",
			"dissolve",
			"flip",
			"page",
			"page-roll",
			"pageRoll",
			"scroll-fade",
			"scrollFade"
		].includes(n) || T && T.length >= 2;
		if (typeof ResizeObserver < "u" && n !== "rolling") {
			let t = e.clientWidth;
			D = new ResizeObserver(() => {
				Math.abs(e.clientWidth - t) < 1 || (t = e.clientWidth, I(), W());
			}), D.observe(e);
		}
		let q = () => {
			P = !0, E?.playState === "running" && E.pause();
		}, J = () => {
			if (P = !1, E?.playState === "paused" && E.play(), F && O == null) {
				let e = F;
				F = null, L(e, 220);
			}
		};
		return d && !f && (e.addEventListener("pointerenter", q), e.addEventListener("pointerleave", J)), {
			el: e,
			type: "overflowText",
			get index() {
				return N;
			},
			replay() {
				I(), N = 0, W();
			},
			pause() {
				A = !0, E?.pause?.(), clearTimeout(O);
			},
			resume() {
				A = !1, ee ? (I(), W()) : (E?.play?.(), E || W());
			},
			destroy() {
				k = !0, I(), D?.disconnect(), e.removeEventListener("pointerenter", q), e.removeEventListener("pointerleave", J), _ && h && (_.removeEventListener("pointerenter", h), _.removeEventListener("focusin", h)), _ && g && (_.removeEventListener("pointerleave", g), _.removeEventListener("focusout", g)), y == null ? e.removeAttribute("style") : e.setAttribute("style", y), b == null ? e.removeAttribute("title") : e.setAttribute("title", b), x == null ? e.removeAttribute("aria-label") : e.setAttribute("aria-label", x), S == null ? e.removeAttribute("role") : e.setAttribute("role", S), e.innerHTML = v, delete e.dataset.ktOverflowActive;
			}
		};
	},
	fallback() {},
	reduced() {}
}, Vr = 0, Hr = null;
function Ur() {
	typeof document > "u" || (Vr === 0 && (Hr = {
		body: document.body.style.overflow,
		root: document.documentElement.style.overflow,
		gutter: document.documentElement.style.scrollbarGutter,
		scroll: [window.scrollX, window.scrollY]
	}, document.body.style.overflow = "hidden", document.documentElement.style.overflow = "hidden", document.documentElement.style.scrollbarGutter = "auto"), Vr += 1);
}
function Wr() {
	if (!(typeof document > "u" || Vr === 0) && (--Vr, Vr === 0 && Hr)) {
		document.body.style.overflow = Hr.body, document.documentElement.style.overflow = Hr.root, document.documentElement.style.scrollbarGutter = Hr.gutter;
		let e = document.scrollingElement || document.documentElement;
		[e.scrollLeft, e.scrollTop] = Hr.scroll, Hr = null;
	}
}
function Gr(e, t, n) {
	let r = document.createElement(e);
	return t && (r.className = t), n != null && (r.textContent = String(n)), r;
}
function Kr(e, t, n) {
	if (typeof n.renderUI == "function") {
		let t = n.renderUI(e, n) || {};
		return t.root && e.appendChild(t.root), {
			root: t.root || e,
			render: t.render || (() => {}),
			setState: t.setState || (() => {}),
			destroy: t.destroy || (() => {})
		};
	}
	let r = n.color || "var(--kt-loader-color,currentColor)", i = n.trackColor || "rgba(127,127,127,.18)", a = n.showPercent !== !1;
	e.style.setProperty("--kt-loader-color", r), e.style.setProperty("--kt-loader-track-color", i), e.style.setProperty("--kt-loader-radius", typeof n.radius == "number" ? `${n.radius}px` : n.radius || "999px");
	let o = null, s = null, c = null;
	if (t === "slot") c = Gr("div", "kt-loader-ui kt-loader-counter"), o = Gr("span", "kt-loader-value"), o.textContent = "0%", c.appendChild(o);
	else if (t === "circular") {
		let e = Math.max(48, Number(n.size ?? 132)), t = Math.max(1, Number(n.stroke ?? 8)), r = (e - t) / 2, i = 2 * Math.PI * r;
		c = Gr("div", "kt-loader-ui kt-loader-circular"), c.style.setProperty("--kt-loader-size", `${e}px`), c.style.setProperty("--kt-loader-stroke", `${t}px`);
		let l = document.createElementNS("http://www.w3.org/2000/svg", "svg");
		l.setAttribute("aria-hidden", "true"), l.setAttribute("viewBox", `0 0 ${e} ${e}`);
		let u = document.createElementNS("http://www.w3.org/2000/svg", "circle");
		u.classList.add("kt-loader-circular-track");
		let d = document.createElementNS("http://www.w3.org/2000/svg", "circle");
		d.classList.add("kt-loader-circular-progress"), [u, d].forEach((n) => {
			n.setAttribute("cx", String(e / 2)), n.setAttribute("cy", String(e / 2)), n.setAttribute("r", String(r)), n.setAttribute("fill", "none"), n.setAttribute("stroke-width", String(t));
		}), d.setAttribute("stroke-linecap", n.linecap || "round"), d.setAttribute("stroke-dasharray", String(i)), d.setAttribute("stroke-dashoffset", String(i)), l.append(u, d), o = Gr("span", "kt-loader-value", "0%"), o.hidden = !a, c.append(l, o), s = d, s.dataset.circumference = String(i);
	} else if (t === "bar") {
		let e = n.barWidth || "min(68vw,420px)", t = Math.max(2, Number(n.barHeight ?? 5));
		c = Gr("div", "kt-loader-ui kt-loader-bar"), c.style.setProperty("--kt-loader-bar-width", typeof e == "number" ? `${e}px` : e), c.style.setProperty("--kt-loader-bar-height", `${t}px`), n.label && c.appendChild(Gr("span", "kt-loader-label", n.label));
		let r = Gr("span", "kt-loader-bar-track");
		s = Gr("span", "kt-loader-bar-progress"), r.appendChild(s), o = Gr("span", "kt-loader-value", "0%"), o.hidden = !a, c.append(r, o);
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
			let n = G(Number(e) || 0, 0, 100);
			if (o && (o.textContent = `${Math.round(n)}%`), t === "bar" && s && (s.style.transform = `scaleX(${n / 100})`), t === "circular" && s) {
				let e = Number(s.dataset.circumference || 0);
				s.style.strokeDashoffset = String(e * (1 - n / 100));
			}
			l && (l.style.transform = `${l.dataset.axis}(${n / 100})`);
		},
		setState: (e) => {
			c && (c.dataset.state = e);
		},
		destroy() {}
	};
}
function qr(e) {
	if (Array.isArray(e.resources)) return e.resources;
	let t = e.resourceSelector || "img[src],img[data-src],video[src],source[src],link[rel=\"stylesheet\"],script[src]";
	return Array.from(document.querySelectorAll(t));
}
var Jr = {
	create(e, t = {}) {
		let n = t.type || t.preset || "bar", r = [
			"slot",
			"circular",
			"bar"
		].includes(n) ? n : "bar", i = t.source || t.progressSource || "window", a = Math.max(0, Number(t.minDuration ?? 0)), o = t.hideScrollbar !== !1, s = {
			style: e.getAttribute("style"),
			class: e.getAttribute("class"),
			aria: e.getAttribute("aria-label"),
			role: e.getAttribute("role"),
			busy: e.getAttribute("aria-busy"),
			live: e.getAttribute("aria-live"),
			valueMin: e.getAttribute("aria-valuemin"),
			valueMax: e.getAttribute("aria-valuemax"),
			valueNow: e.getAttribute("aria-valuenow"),
			hidden: e.hidden
		};
		t.className && e.classList.add(...String(t.className).split(/\s+/).filter(Boolean));
		let c = Kr(e, r, t), l = te(e, {
			...t,
			progressOutput: t.progressOutput,
			progressScope: t.progressScope,
			progressTemplate: t.progressTemplate
		}), u = G(Number(t.progress ?? t.percent ?? 0), 0, 100), d = u, f = !1, p = !1, m = !1, h = null, g = null, _ = null, v = "idle", y = "completed", b, x = !1, S = new Promise((e) => {
			b = e;
		}), C = [], w = /* @__PURE__ */ new Set(), T = (e, t) => {
			let n = setTimeout(() => {
				w.delete(n), e();
			}, t);
			return w.add(n), n;
		}, E = performance.now(), D = !1, O = () => {
			D && (D = !1, Wr());
		}, k = () => {
			o && !D && (Ur(), D = !0);
		}, A = (t, n = {}) => {
			try {
				e.dispatchEvent(new CustomEvent(`kt-loader-${t}`, {
					bubbles: !0,
					detail: {
						loader: e,
						state: v,
						progress: d,
						...n
					}
				}));
			} catch {}
		}, j = (n, r = {}) => {
			if (v === n) return;
			let i = v;
			v = n, e.dataset.ktLoaderState = n, c.setState?.(n), l.update(d, n), t.onStateChange?.(n, i, e, r), A("statechange", {
				previous: i,
				...r
			});
		}, M = (t, n = {}) => {
			x || (x = !0, b?.({
				status: t,
				progress: d,
				el: e,
				...n
			}));
		};
		e.setAttribute("role", "progressbar"), e.setAttribute("aria-label", t.ariaLabel || "Loading"), e.setAttribute("aria-live", t.announce === !1 ? "off" : "polite"), e.setAttribute("aria-busy", "true"), e.setAttribute("aria-valuemin", "0"), e.setAttribute("aria-valuemax", "100"), k(), j("running"), t.onStart?.(e), A("start");
		let N = () => {
			c.render(d), e.setAttribute("aria-valuenow", String(Math.round(d))), e.style.setProperty("--kt-loader-progress", (d / 100).toFixed(4)), e.style.setProperty("--kt-loader-percent", String(Math.round(d))), l.update(d, v), t.onProgress?.(d, e), A("progress", { value: d });
		}, P = () => {
			h = null, !p && (m || (d += (u - d) * G(Number(t.smoothing ?? .16), .01, 1)), Math.abs(d - u) < .05 && (d = u), N(), !p && d !== u && (h = requestAnimationFrame(P)));
		}, F = () => {
			!p && h == null && d !== u && (h = requestAnimationFrame(P));
		};
		h = requestAnimationFrame(P);
		let I = () => {
			if (p) return;
			h != null && (cancelAnimationFrame(h), h = null);
			let n = Math.max(0, Number(t.exitDuration ?? t.duration ?? .45)), r = t.exit || t.transition || "fade", i = [
				"up",
				"down",
				"left",
				"right"
			], a = i.includes(t.exitDirection) ? t.exitDirection : i.includes(t.fill) ? t.fill : "up";
			if (O(), t.revealEffect) {
				let r = {
					up: "0,-100%",
					down: "0,100%",
					left: "-100%,0",
					right: "100%,0"
				}[a] || "0,-100%", i = {
					up: "0 0 100% 0",
					down: "100% 0 0 0",
					left: "0 100% 0 0",
					right: "0 0 0 100%"
				}, o = {
					flash: [{ transform: "translate3d(0,0,0)" }, { transform: `translate3d(${r},0)` }],
					wipe: [{ clipPath: "inset(0 0 0 0)" }, { clipPath: `inset(${i[a]})` }],
					curtain: [{ clipPath: "inset(0 0 0 0)" }, { clipPath: `inset(${i[a]})` }],
					iris: [{ clipPath: "circle(150% at 50% 50%)" }, { clipPath: "circle(0% at 50% 50%)" }],
					circle: [{ clipPath: "circle(150% at 50% 50%)" }, { clipPath: "circle(0% at 50% 50%)" }],
					split: [{ clipPath: "inset(0 0 0 0)" }, { clipPath: "inset(0 50% 0 50%)" }],
					blinds: [{ clipPath: "inset(0 0 0 0)" }, { clipPath: `inset(${i[a]})` }],
					fade: [{ opacity: 1 }, { opacity: 0 }]
				}, s = o[t.revealEffect] || o.wipe;
				e.style.willChange = "clip-path, transform, opacity";
				let c = e.animate(s, {
					duration: Math.max(120, n * 1e3),
					easing: "cubic-bezier(.165,.84,.44,1)",
					fill: "forwards"
				}), l = () => {
					e.style.display = "none", e.hidden = !0, e.setAttribute("aria-busy", "false"), e.style.removeProperty("will-change"), j(y), t.onComplete?.(e);
				};
				c.finished.then(l).catch(l);
				return;
			}
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
			T(() => {
				e.style.display = "none", e.hidden = !0, e.setAttribute("aria-busy", "false"), O(), j(y), t.onComplete?.(e), t.onHide?.(e, y), A("complete", { outcome: y }), A("hide", { reason: y }), M(y);
			}, n * 1e3 + 20);
		}, L = (e = "completed") => {
			if (f || p) return;
			f = !0, y = e, j("completing", { outcome: y }), u = 100;
			let n = Math.max(0, a - (performance.now() - E));
			T(() => {
				u = 100, d = 100, N(), T(I, Math.max(0, Number(t.completeHold ?? 120)));
			}, n);
		}, R = (e) => {
			p || f || (u = G(Number(e) || 0, 0, 100), F(), u >= 100 && L());
		}, z = () => p || f ? !1 : (e.hidden = !1, e.style.display = "", e.style.opacity = "", e.style.transform = "", e.style.clipPath = "", e.style.webkitClipPath = "", e.setAttribute("aria-busy", "true"), k(), j(m ? "paused" : "running"), t.onShow?.(e), A("show"), !0), B = (n = "manual") => !p && (e.style.display = "none", e.hidden = !0, e.setAttribute("aria-busy", "false"), O(), j("hidden", { reason: n }), t.onHide?.(e, n), A("hide", { reason: n }), !0), V = (n = "cancelled") => p || f ? !1 : (f = !0, h != null && (cancelAnimationFrame(h), h = null), w.forEach((e) => clearTimeout(e)), w.clear(), e.style.display = "none", e.hidden = !0, e.setAttribute("aria-busy", "false"), O(), j("cancelled", { reason: n }), t.onCancel?.(n, e), t.onHide?.(e, n), A("cancel", { reason: n }), A("hide", { reason: n }), M("cancelled", { reason: n }), !0), H = (n) => p || f ? !1 : (t.onError?.(n, e), j("error", { error: n }), A("error", { error: n }), t.completeOnError === !1 ? (e.setAttribute("aria-busy", "false"), O(), M("error", { error: n })) : L("error"), !0), U = (e) => {
			if (!e?.then) return e;
			R(Math.max(u, Number(t.promiseStart ?? 8)));
			let n = Number(t.promiseStart ?? 8), r = setInterval(() => {
				n += (Number(t.promiseCeiling ?? 88) - n) * .08, R(n);
			}, 120);
			return C.push(() => clearInterval(r)), Promise.resolve(e).then((e) => (clearInterval(r), L(), e), (e) => {
				throw clearInterval(r), H(e), e;
			});
		}, W = async (e, t) => {
			let n = await fetch(e, t), r = Number(n.headers.get("content-length"));
			if (!n.body || !Number.isFinite(r) || r <= 0) return R(80), L(), n;
			let i = 0, a = n.body.getReader(), o = [];
			for (;;) {
				let { done: e, value: t } = await a.read();
				if (e) break;
				o.push(t), i += t.byteLength, R(i / r * 100);
			}
			L();
			let s = new globalThis.Blob(o, { type: n.headers.get("content-type") || "application/octet-stream" });
			return new globalThis.Response(s, {
				status: n.status,
				statusText: n.statusText,
				headers: n.headers
			});
		};
		if (i === "manual") {
			let e = Math.max(0, Number(t.manualDuration ?? t.duration ?? 0));
			if (e > 0) {
				let t = performance.now(), n = (r) => {
					p || f || (m || R((r - t) / (e <= 30 ? e * 1e3 : e) * 100), f || requestAnimationFrame(n));
				};
				requestAnimationFrame(n);
			}
		} else if (i === "promise" && t.promise) U(t.promise);
		else if (i === "fetch" && (t.url || t.fetch)) W(t.url || t.fetch, t.fetchOptions).catch((e) => {
			H(e);
		});
		else if (i === "resources") {
			let e = qr(t);
			if (!e.length) L();
			else {
				let t = 0, n = () => {
					t += 1, R(t / e.length * 100);
				};
				e.forEach((e) => {
					(e.tagName === "IMG" ? e.complete : e.readyState >= 2) ? n() : (e.addEventListener("load", n, { once: !0 }), e.addEventListener("error", n, { once: !0 }), C.push(() => {
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
					R(Math.min(92, (e + n) / i * 100));
				});
				try {
					_.observe({
						type: "resource",
						buffered: !0
					});
				} catch {}
			}
			document.readyState === "complete" ? L() : (g = L, window.addEventListener("load", g, { once: !0 }));
		}
		return N(), {
			el: e,
			type: "loader",
			get progress() {
				return d;
			},
			get state() {
				return v;
			},
			get finished() {
				return S;
			},
			setProgress: R,
			complete: L,
			show: z,
			hide: B,
			cancel: V,
			fail: H,
			trackPromise: U,
			trackFetch: W,
			pause() {
				p || f || (m = !0, e.classList.add("is-paused"), j("paused"));
			},
			resume() {
				p || f || (m = !1, e.classList.remove("is-paused"), j("running"), F());
			},
			destroy() {
				p || (p = !0, j("destroyed"), w.forEach((e) => clearTimeout(e)), w.clear(), h != null && (cancelAnimationFrame(h), h = null), g && window.removeEventListener("load", g), _?.disconnect(), C.forEach((e) => e()), O(), c.destroy?.(), l.destroy(), c.root && c.root !== e && c.root.remove(), c.fillEl?.remove(), s.style == null ? e.removeAttribute("style") : e.setAttribute("style", s.style), s.aria == null ? e.removeAttribute("aria-label") : e.setAttribute("aria-label", s.aria), s.role == null ? e.removeAttribute("role") : e.setAttribute("role", s.role), s.class == null ? e.removeAttribute("class") : e.setAttribute("class", s.class), s.busy == null ? e.removeAttribute("aria-busy") : e.setAttribute("aria-busy", s.busy), s.live == null ? e.removeAttribute("aria-live") : e.setAttribute("aria-live", s.live), s.valueMin == null ? e.removeAttribute("aria-valuemin") : e.setAttribute("aria-valuemin", s.valueMin), s.valueMax == null ? e.removeAttribute("aria-valuemax") : e.setAttribute("aria-valuemax", s.valueMax), s.valueNow == null ? e.removeAttribute("aria-valuenow") : e.setAttribute("aria-valuenow", s.valueNow), e.hidden = s.hidden, delete e.dataset.ktLoaderState, M("destroyed"));
			}
		};
	},
	fallback(e, t = {}) {
		return this.reduced(e, t);
	},
	reduced(e, t = {}) {
		let n = e.style.display;
		e.style.display = "none";
		let r = !1, i = !1, a = "completing", o, s = new Promise((e) => {
			o = e;
		}), c = setTimeout(() => {
			r = !0, a = "completed", t.onComplete?.(e), t.onStateChange?.("completed", "completing", e), o?.({
				status: "completed",
				progress: 100,
				el: e
			});
		}, 0);
		return {
			el: e,
			type: "loader",
			get progress() {
				return 100;
			},
			get state() {
				return a;
			},
			get finished() {
				return s;
			},
			setProgress() {},
			complete() {},
			trackPromise(e) {
				return e;
			},
			trackFetch(e, t) {
				return fetch(e, t);
			},
			show() {
				return !1;
			},
			hide() {
				return !0;
			},
			cancel(n = "cancelled") {
				return r || i ? !1 : (clearTimeout(c), r = !0, a = "cancelled", t.onCancel?.(n, e), o?.({
					status: "cancelled",
					progress: 100,
					el: e,
					reason: n
				}), !0);
			},
			fail(n) {
				return r || i ? !1 : (clearTimeout(c), r = !0, a = "error", t.onError?.(n, e), o?.({
					status: "error",
					progress: 100,
					el: e,
					error: n
				}), !0);
			},
			pause() {},
			resume() {},
			destroy() {
				i || (i = !0, r || (clearTimeout(c), o?.({
					status: "destroyed",
					progress: 100,
					el: e
				})), a = "destroyed", e.style.display = n);
			}
		};
	}
}, Yr = Object.freeze([
	"frameInterval",
	"color",
	"highlightColor",
	"textSize",
	"fontFamily",
	"fontWeight",
	"letterSpacing",
	"lineHeight",
	"fixedWidth",
	"asciiOnly",
	"glow",
	"glowColor",
	"frames",
	"ariaLabel"
]), Xr = Object.freeze([...Yr, "direction"]), Zr = Object.freeze([
	...Xr,
	"viewportWidth",
	"motionDuration"
]), Qr = 10;
function $r(e, t) {
	let n = Array(e).fill(" ");
	return t(n), n.join("");
}
function ei(e, { width: t = Qr, open: n = "[", close: r = "]" } = {}) {
	let i = t - e.length, a = [], o = (i) => a.push(`${n} ${$r(t, (t) => {
		for (let n = 0; n < e.length; n += 1) t[i + n] = e[n];
	})} ${r}`);
	for (let e = 0; e <= i; e += 1) o(e);
	for (let e = i - 1; e >= 1; --e) o(e);
	return a;
}
function ti(e, { width: t = Qr, open: n = "[", close: r = "]" } = {}) {
	let i = [];
	for (let a = 0; a < t; a += 1) i.push(`${n} ${$r(t, (n) => {
		for (let r = 0; r < e.length; r += 1) n[(a + r) % t] = e[r];
	})} ${r}`);
	return i;
}
function ni({ width: e = Qr, head: t = ">", tail: n = "=" } = {}) {
	let r = [];
	for (let i = 1; i <= e; i += 1) r.push(`[ ${$r(e, (e) => {
		for (let t = 0; t < i - 1; t += 1) e[t] = n;
		e[i - 1] = t;
	})} ]`);
	return r;
}
var ri = Object.freeze([
	...Zr,
	"dotCount",
	"fillChar",
	"emptyChar",
	"progress",
	"indeterminate"
]), ii = Object.freeze([
	...Yr,
	"text",
	"label",
	"cursorChar"
]), ai = Object.freeze([
	"direction",
	"color",
	"dotSize",
	"dotGap",
	"motionDuration",
	"frameInterval",
	"dotShape",
	"highlightColor",
	"baseColor",
	"ariaLabel",
	"asciiOnly",
	"transformOrigin"
]), oi = Object.freeze([
	...Yr,
	"text",
	"label",
	"progress",
	"motionDuration",
	"highlightColor"
]), si = [
	{
		id: "line-slash",
		name: "Line",
		description: "The classic CLI spinner — four slashes cycling in place.",
		renderer: "text-frame",
		frames: [
			"|",
			"/",
			"-",
			"\\"
		],
		defaultInterval: 80,
		fixedWidth: !0,
		supportedOptions: Yr,
		fallbackFrames: [
			"|",
			"/",
			"-",
			"\\"
		],
		legacyAliases: ["ascii"]
	},
	{
		id: "dots",
		name: "Dots",
		description: "Ellipsis that grows one dot at a time, on a fixed width.",
		renderer: "multiline-frame",
		frames: [
			".",
			"..\n ",
			"...\n ",
			"....\n "
		],
		defaultInterval: 280,
		fixedWidth: !0,
		supportedOptions: Yr,
		legacyAliases: ["pulse"]
	},
	{
		id: "braille",
		name: "Braille",
		description: "Braille dots rotate around the cell for a smooth, tiny spin.",
		renderer: "text-frame",
		frames: "⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏".split(""),
		defaultInterval: 80,
		fixedWidth: !0,
		supportedOptions: Yr,
		fallbackFrames: [
			"|",
			"/",
			"-",
			"\\"
		]
	},
	{
		id: "braille-pulse",
		name: "Braille Pulse",
		description: "Braille fill pulse",
		renderer: "text-frame",
		frames: [..."⠀⣀⣤⣶⣿⣿⣿⣶⣤⣀"],
		defaultInterval: 140,
		fixedWidth: !0,
		supportedOptions: Yr,
		fallbackFrames: [
			".",
			"o",
			"O",
			"o"
		]
	},
	{
		id: "quarter-circle",
		name: "Quarter Circle",
		description: "One quarter of a disc sweeps around the circle.",
		renderer: "text-frame",
		frames: [
			"◐",
			"◓",
			"◑",
			"◒"
		],
		defaultInterval: 100,
		fixedWidth: !0,
		supportedOptions: Yr,
		fallbackFrames: [
			"o",
			"O",
			"o",
			"."
		],
		legacyAliases: ["quadrant"]
	},
	{
		id: "circle",
		name: "Circle",
		description: "A clock-face glyph steps through four quarter turns.",
		renderer: "text-frame",
		frames: [
			"◴",
			"◷",
			"◶",
			"◵"
		],
		defaultInterval: 100,
		fixedWidth: !0,
		supportedOptions: Yr,
		fallbackFrames: [
			"o",
			"O",
			"o",
			"."
		]
	},
	{
		id: "clock",
		name: "Clock",
		description: "Clock faces advance through 12, 3, 6 and 9.",
		renderer: "text-frame",
		frames: [
			"🕛",
			"🕒",
			"🕕",
			"🕘"
		],
		defaultInterval: 240,
		fixedWidth: !0,
		supportedOptions: Yr,
		fallbackFrames: [
			"12",
			"3 ",
			"6 ",
			"9 "
		]
	},
	{
		id: "arrow-orbit",
		name: "Arrow Orbit",
		description: "An arrow points around all eight compass directions.",
		renderer: "text-frame",
		frames: [
			"←",
			"↖",
			"↑",
			"↗",
			"→",
			"↘",
			"↓",
			"↙"
		],
		defaultInterval: 90,
		fixedWidth: !0,
		supportedOptions: Yr,
		legacyAliases: ["arrow"]
	},
	{
		id: "triangle",
		name: "Triangle",
		description: "Solid corner triangles rotate through the four quadrants.",
		renderer: "text-frame",
		frames: [
			"◢",
			"◣",
			"◤",
			"◥"
		],
		defaultInterval: 100,
		fixedWidth: !0,
		supportedOptions: Yr
	},
	{
		id: "box-corners",
		name: "Box Corners",
		description: "A quarter block hops around the corners of the cell.",
		renderer: "text-frame",
		frames: [
			"▖",
			"▘",
			"▝",
			"▗"
		],
		defaultInterval: 100,
		fixedWidth: !0,
		supportedOptions: Yr,
		fallbackFrames: [
			"|",
			"/",
			"-",
			"\\"
		],
		legacyAliases: ["squares"]
	},
	{
		id: "block-shade",
		name: "Block Shade",
		description: "Shade blocks step from light to solid and back.",
		renderer: "text-frame",
		frames: [
			"░",
			"▒",
			"▓",
			"█",
			"▓",
			"▒"
		],
		defaultInterval: 90,
		fixedWidth: !0,
		supportedOptions: Yr
	},
	{
		id: "growing-blocks",
		name: "Growing Blocks",
		description: "A bar grows to full height, then shrinks away.",
		renderer: "text-frame",
		frames: "▁▂▃▄▅▆▇█▇▆▅▄▃▂".split(""),
		defaultInterval: 72,
		fixedWidth: !0,
		supportedOptions: Yr,
		legacyAliases: ["line"]
	},
	{
		id: "moon",
		name: "Moon",
		description: "Moon phases cycle through the four quarters.",
		renderer: "text-frame",
		frames: [
			"◑",
			"◒",
			"◐",
			"◓"
		],
		defaultInterval: 100,
		fixedWidth: !0,
		supportedOptions: Yr,
		legacyAliases: ["corners"]
	},
	{
		id: "diamond",
		name: "Diamond",
		description: "A diamond fills from outline to solid and back.",
		renderer: "text-frame",
		frames: [
			"◇",
			"◈",
			"◆",
			"◈"
		],
		defaultInterval: 100,
		fixedWidth: !0,
		supportedOptions: Yr,
		fallbackFrames: [
			".",
			"*",
			"#",
			"*"
		]
	},
	{
		id: "pulse-dot",
		name: "Pulse Dot",
		description: "A dot swells from hairline to solid.",
		renderer: "text-frame",
		frames: [
			"·",
			"•",
			"●",
			"•"
		],
		defaultInterval: 120,
		fixedWidth: !0,
		supportedOptions: Yr
	},
	{
		id: "spark",
		name: "Spark",
		description: "A sparkle grows and fades on the spot.",
		renderer: "text-frame",
		frames: [
			"·",
			"✧",
			"✦",
			"✧"
		],
		defaultInterval: 100,
		fixedWidth: !0,
		supportedOptions: Yr
	},
	{
		id: "binary",
		name: "Binary",
		description: "A fixed-width four-bit counter ticking up from 0000.",
		renderer: "text-frame",
		frames: Array.from({ length: 16 }, (e, t) => t.toString(2).padStart(4, "0")),
		defaultInterval: 140,
		fixedWidth: !0,
		supportedOptions: Yr
	},
	{
		id: "toggle-blocks",
		name: "Toggle Blocks",
		description: "A square toggles between empty, half and filled.",
		renderer: "multiline-frame",
		frames: [
			"□",
			"▣",
			"■",
			"▣"
		],
		defaultInterval: 180,
		fixedWidth: !0,
		supportedOptions: Yr,
		legacyAliases: ["boxes"]
	},
	{
		id: "cross",
		name: "Cross",
		description: "A plus and a multiply sign alternate.",
		renderer: "text-frame",
		frames: [
			"+",
			"×",
			"+",
			"×"
		],
		defaultInterval: 140,
		fixedWidth: !0,
		supportedOptions: Yr
	},
	{
		id: "asterisk",
		name: "Asterisk",
		description: "Plus, multiply and asterisk in rotation.",
		renderer: "text-frame",
		frames: [
			"+",
			"×",
			"✳",
			"×"
		],
		defaultInterval: 140,
		fixedWidth: !0,
		supportedOptions: Yr
	},
	{
		id: "quad-dot-chase",
		name: "Quad Dot Chase",
		description: "Four corner dots hand a bright head around a 2×2 square, each trailing dot a step dimmer.",
		renderer: "matrix-frame",
		frames: [],
		defaultInterval: 200,
		supportedOptions: ai,
		accessibilityLabel: "Loading",
		legacyAliases: ["quad-dot-pulse"]
	},
	{
		id: "bouncing-ball",
		name: "Bouncing Ball",
		description: "A ball travels the track and bounces off both walls.",
		renderer: "marquee-frame",
		frames: ei("●"),
		defaultInterval: 90,
		fixedWidth: !0,
		supportedOptions: Zr
	},
	{
		id: "bouncing-bar",
		name: "Bouncing Bar",
		description: "A three-cell bar slides the track and rebounds.",
		renderer: "marquee-frame",
		frames: ei("==="),
		defaultInterval: 90,
		fixedWidth: !0,
		supportedOptions: Zr
	},
	{
		id: "scanner",
		name: "Scanner",
		description: "A beam grows from one wall to the far end, then restarts. Reverse mirrors the arrowhead; a numeric progress fills it like a bar.",
		renderer: "marquee-frame",
		frames: ni(),
		defaultInterval: 90,
		fixedWidth: !0,
		supportedOptions: ri
	},
	{
		id: "snake",
		name: "Snake",
		description: "A three-cell body wraps around the track without a jump.",
		renderer: "marquee-frame",
		frames: ti("■■■"),
		defaultInterval: 90,
		fixedWidth: !0,
		supportedOptions: Zr
	},
	{
		id: "marquee",
		name: "Marquee",
		description: "Your text scrolls continuously through a fixed viewport.",
		renderer: "marquee-frame",
		frames: [],
		defaultInterval: 120,
		fixedWidth: !0,
		supportedOptions: [
			...Zr,
			"text",
			"textEffect"
		]
	},
	{
		id: "typing-cursor",
		name: "Typing Cursor",
		description: "A label with an underscore caret blinking after it.",
		renderer: "cursor-frame",
		frames: [],
		defaultInterval: 480,
		fixedWidth: !1,
		supportedOptions: ii
	},
	{
		id: "ellipsis-typing",
		name: "Ellipsis Typing",
		description: "Three dots appear one by one, reserved up front so nothing shifts.",
		renderer: "cursor-frame",
		frames: [],
		defaultInterval: 400,
		fixedWidth: !1,
		supportedOptions: ii
	},
	{
		id: "block-cursor",
		name: "Block Cursor",
		description: "A label followed by a solid block caret.",
		renderer: "cursor-frame",
		frames: [],
		defaultInterval: 480,
		fixedWidth: !1,
		supportedOptions: ii
	},
	{
		id: "command-prompt",
		name: "Command Prompt",
		description: "A shell prompt with a blinking caret after the command.",
		renderer: "cursor-frame",
		frames: [],
		defaultInterval: 480,
		fixedWidth: !1,
		supportedOptions: ii
	},
	{
		id: "dot-cursor",
		name: "Dot Cursor",
		description: "A label with a small middot caret blinking after it.",
		renderer: "cursor-frame",
		frames: [],
		defaultInterval: 480,
		fixedWidth: !1,
		supportedOptions: ii
	},
	{
		id: "spinner-label",
		name: "Spinner + Label",
		description: "A braille spinner beside a text label.",
		renderer: "compound-frame",
		frames: [],
		defaultInterval: 80,
		fixedWidth: !0,
		supportedOptions: oi,
		compound: {
			spinner: "braille",
			showLabel: !0
		}
	},
	{
		id: "quad-dots-label",
		name: "Quad Dots + Label",
		description: "The 2x2 dot chase beside a text label.",
		renderer: "compound-frame",
		frames: [],
		defaultInterval: 250,
		fixedWidth: !0,
		supportedOptions: oi,
		compound: {
			spinner: "quad-dot-chase",
			showLabel: !0
		}
	},
	{
		id: "spinner-elapsed",
		name: "Spinner + Elapsed Time",
		description: "A spinner with a running clock, plus a percentage when given one.",
		renderer: "compound-frame",
		frames: [],
		defaultInterval: 80,
		fixedWidth: !0,
		supportedOptions: oi,
		compound: {
			spinner: "braille",
			showLabel: !0,
			showElapsed: !0
		}
	},
	{
		id: "spinner-step",
		name: "Spinner + Step",
		description: "A spinner with a step counter such as 3/8.",
		renderer: "compound-frame",
		frames: [],
		defaultInterval: 80,
		fixedWidth: !0,
		supportedOptions: oi,
		compound: {
			spinner: "braille",
			showLabel: !0,
			showStep: !0,
			stepTotal: 8
		}
	},
	{
		id: "spinner-meter",
		name: "Spinner + Meter",
		description: "A spinner with an ASCII progress bar and a percentage.",
		renderer: "compound-frame",
		frames: [],
		defaultInterval: 80,
		fixedWidth: !0,
		supportedOptions: oi,
		compound: {
			spinner: "braille",
			showLabel: !0,
			showMeter: !0,
			meterCount: 8
		}
	}
], ci = Object.freeze(Object.fromEntries(si.map((e) => [e.id, e]))), li = Object.freeze(Object.fromEntries(si.flatMap((e) => (e.legacyAliases || []).map((t) => [t, e.id])))), ui = Object.freeze(si.map((e) => e.id));
function di(e) {
	let t = String(e || "").trim();
	if (!t) return null;
	if (ci[t]) return ci[t];
	let n = li[t];
	return n ? ci[n] : null;
}
function fi(e) {
	return di(e);
}
function pi() {
	return si.slice();
}
var mi = Object.freeze({
	ascii: "|/-\\",
	pulse: ".oO°Oo",
	quadrant: "◐◓◑◒",
	braille: "⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏",
	arrow: "←↖↑↗→↘↓↙",
	line: "▁▃▅▆▇█▇▆▅▃",
	circle: "◴◷◶◵",
	corners: "◜◝◞◟",
	squares: "▖▘▝▗",
	boxes: "◰◳◲◱"
}), hi = "ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,\"Liberation Mono\",\"Courier New\",monospace", gi = [
	1,
	.68,
	.32,
	.12
], _i = [
	"● •\n· ·",
	"• ●\n· ·",
	"· •\n· ●",
	"· ·\n● •"
];
function vi(e, t, n) {
	let r = document.createElement(e);
	return t && (r.className = t), n != null && (r.textContent = String(n)), r.setAttribute("aria-hidden", "true"), r;
}
function yi(e) {
	let t = String(e);
	return typeof Intl < "u" && typeof Intl.Segmenter == "function" ? [...new Intl.Segmenter(void 0, { granularity: "grapheme" }).segment(t)].map((e) => e.segment) : [...t];
}
var bi = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#$%&@?";
function xi() {
	return bi[Math.floor(Math.random() * 42)];
}
function Si(e, t = 12, n = {}) {
	let r = yi(String(e || "Loading")).slice(0, 40), i = Math.max(4, Math.round(Number(t) || 12)), a = (e) => `[ ${e.join("")} ]`, o = ["shuffle", "decode"].includes(n.textEffect) ? n.textEffect : null;
	if (o) {
		let e = [], t = o === "decode" ? 2 : 3;
		for (let n = 0; n <= r.length; n += 1) for (let i = 0; i < (n === r.length ? 1 : t); i += 1) e.push(a(r.map((e, t) => t < n || e === " " ? e : o === "decode" ? t === n ? xi() : "·" : xi())));
		return e;
	}
	let s = [...r, ...Array(i).fill(" ")], c = [];
	for (let e = 0; e < s.length; e += 1) {
		let t = [];
		for (let n = 0; n < i; n += 1) t.push(s[(e + n) % s.length]);
		c.push(a(t));
	}
	return c.reverse(), c;
}
function Ci(e, t) {
	let n = Math.round(Ei(Number(e.dotCount ?? 10), 3, 40)), r = e.fillChar || "=", i = t ? "<" : ">", a = e.emptyChar === "" ? " " : e.emptyChar || " ", o = (e) => {
		let o = Array(n).fill(a);
		for (let i = 0; i < e - 1; i += 1) o[t ? n - 1 - i : i] = r;
		return o[t ? n - e : e - 1] = i, `[ ${o.join("")} ]`;
	}, s = wi(e);
	if (s != null) return [o(Math.max(1, Math.round(s / 100 * n)))];
	let c = [];
	for (let e = 1; e <= n; e += 1) c.push(o(e));
	return c;
}
function wi(e) {
	if (e.indeterminate === !0) return null;
	let t = e.progress;
	if (t == null || t === "" || t === !1) return null;
	let n = Number(t);
	return Number.isFinite(n) ? Ei(n, 0, 100) : null;
}
function Ti(e, t, n = 10) {
	let r = Math.round(Ei(Number(e.dotCount ?? n), 5, 40)), i = e.fillChar || "█", a = e.emptyChar || "░", o = Ei(Number(t ?? e.progress ?? 60), 0, 100), s = e.spread != null && e.spread !== "" ? Math.round(Ei(Number(e.spread), 0, r)) : Math.round(o / 100 * r);
	return `[${i.repeat(s)}${a.repeat(Math.max(0, r - s))}] ${Math.round(o)}%`;
}
function Ei(e, t, n) {
	return Math.min(n, Math.max(t, Number.isFinite(e) ? e : t));
}
function Di(e, t) {
	let n = String(t.text || t.label || "Loading"), r = t.cursorChar || null;
	switch (e) {
		case "typing-cursor": return {
			label: n,
			caret: r || "_",
			mode: "blink"
		};
		case "block-cursor": return {
			label: n,
			caret: r || "█",
			mode: "blink"
		};
		case "dot-cursor": return {
			label: n,
			caret: r || "·",
			mode: "blink"
		};
		case "command-prompt": return {
			label: "> npm run build",
			caret: r || "_",
			mode: "blink"
		};
		case "ellipsis-typing": return {
			label: n,
			caret: r || ".",
			mode: "ellipsis"
		};
		default: return {
			label: n,
			caret: r || "_",
			mode: "blink"
		};
	}
}
function Oi(e, t) {
	return Array.isArray(t.frames) && t.frames.length ? t.frames.map(String).filter(Boolean) : t.asciiOnly && e.fallbackFrames?.length ? e.fallbackFrames.slice() : e.renderer === "marquee-frame" && e.id === "marquee" ? Si(t.text || t.label, Number(t.viewportWidth ?? 12), t) : e.id === "scanner" ? Ci(t, t.direction === "reverse" || t.direction === "rtl") : e.id === "quad-dot-chase" && t.asciiOnly ? _i.slice() : e.frames.slice();
}
function ki(e, t) {
	if (t.renderer === "matrix-frame") {
		let t = Math.max(400, Number(e.motionDuration ?? 1) * 1e3);
		return Math.max(40, Number(e.frameInterval ?? t / 4));
	}
	return Math.max(40, Number(e.frameInterval ?? t.defaultInterval ?? Number(e.motionDuration ?? 1.1) * 1e3 / 12));
}
function Ai(e, t, n) {
	let r = e.ownerDocument?.defaultView || globalThis, i = n.direction === "reverse" || n.direction === "rtl", a = Oi(t, n), o = 0, s = null, c = null, l = !1, u = 0, d = r.performance?.now?.() ?? Date.now(), f = null;
	e.classList.add(`kt-loading-terminal--${t.id}`), (t.fixedWidth || n.fixedWidth) && e.classList.add("is-fixed-width"), e.style.setProperty("--kt-loading-font-family", n.fontFamily || hi), n.fontWeight && e.style.setProperty("--kt-loading-font-weight", String(n.fontWeight)), n.letterSpacing != null && e.style.setProperty("--kt-loading-letter-spacing", String(n.letterSpacing)), n.lineHeight != null && e.style.setProperty("--kt-loading-line-height", String(n.lineHeight)), n.highlightColor && e.style.setProperty("--kt-loading-highlight-color", n.highlightColor);
	let p = null, m = [], h = null, g = null, _ = null, v = [], y = null, b = 0, x = (e) => {
		if (v.length) {
			if (y === "ellipsis") {
				let t = e % (v.length + 1);
				v.forEach((e, n) => {
					e.style.opacity = n < t ? "1" : "0";
				});
				return;
			}
			v[0].style.opacity = e % 2 ? "0" : "1";
		}
	}, S = () => {
		s != null && (r.clearTimeout(s), r.clearInterval(s)), s = null, c != null && r.cancelAnimationFrame(c), c = null, f != null && r.clearInterval(f), f = null;
	}, C = (e) => {
		p && (t.renderer, p.textContent = e);
	}, w = () => {
		if (v.length) {
			b = (b + 1) % (y === "ellipsis" ? v.length + 1 : 2), x(b);
			return;
		}
		if (a.length < 2) return;
		let e = i && t.id !== "scanner" ? -1 : 1;
		o = (o + e + a.length) % a.length, C(a[o]);
	}, T = () => {
		if (S(), l) return;
		if (t.renderer === "matrix-frame" && !n.asciiOnly) {
			let a = Math.max(2, Number(n.dotSize ?? 4)), o = Math.max(0, Number(n.dotGap ?? 4)), c = Math.max(80, Math.min(220, Number(n.opacityTransition ?? 160)));
			e.style.setProperty("--kt-terminal-dot-size", `${a}px`), e.style.setProperty("--kt-terminal-dot-gap", `${o}px`), e.style.setProperty("--kt-terminal-dot-transition", `${c}ms`);
			let d = Mi(Number(n.minOpacity ?? .12), 0, 1), f = Mi(Number(n.trailStrength ?? 1), 0, 1), p = ki(n, t), h = () => {
				l || (m.forEach((e, t) => {
					let n = gi[i ? (t - u + 4) % 4 : (u - t + 4) % 4] ?? d;
					e.style.opacity = String(d + (n - d) * f);
				}), u = i ? (u + 3) % 4 : (u + 1) % 4);
			};
			h(), s = r.setInterval(h, p);
			return;
		}
		if (t.renderer === "compound-frame") {
			f = r.setInterval(() => {
				if (!g || l) return;
				let e = t.compound || {};
				if (e.showElapsed) {
					let e = (r.performance?.now?.() ?? Date.now()) - d, t = Math.floor(e / 1e3), i = `${String(Math.floor(t / 60)).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`, a = n.progress == null ? null : Mi(Number(n.progress), 0, 100);
					g.textContent = a == null ? i : `${i}·${Math.round(a)}%`;
				} else if (e.showStep) {
					let t = Math.max(1, Math.round(Number(n.stepTotal ?? e.stepTotal ?? 8))), i = Math.floor(((r.performance?.now?.() ?? Date.now()) - d) / 900) % t + 1;
					g.textContent = `${i}/${t}`;
				} else e.showMeter && (g.textContent = Ti(n, null, e.meterCount));
			}, 250);
			return;
		}
		if (a.length < 2 && !v.length) return;
		let o = ki(n, t), c = () => {
			w(), s = r.setTimeout(c, o);
		};
		s = r.setTimeout(c, o);
	};
	if (t.renderer === "matrix-frame") {
		if (e.classList.add("kt-loading-terminal--quad-dots"), n.asciiOnly) a = _i.slice(), p = vi("span", "kt-loading-terminal__frame kt-loading-terminal__frame--multiline", a[0]), e.appendChild(p);
		else {
			let t = vi("span", "terminal-spinner terminal-spinner--quad-dots");
			for (let e = 0; e < 4; e += 1) {
				let r = vi("span", "quad-dot kt-loading-terminal__quad-dot");
				r.dataset.index = String(e), n.dotShape === "square" && r.classList.add("is-square"), t.appendChild(r), m.push(r);
			}
			e.appendChild(t);
		}
	} else if (t.renderer === "compound-frame") {
		let r = t.compound || {}, i = n.showSpinner !== !1, a = String(n.text ?? n.label ?? "Running"), o = n.showLabel !== !1 && a !== "", s = n.showStatus !== !1, c = vi("span", "kt-loading-terminal__compound"), l = vi("span", "kt-loading-terminal__compound-spinner");
		_ = vi("span", "kt-loading-terminal__compound-label", a), g = vi("span", "kt-loading-terminal__compound-status", ""), i && c.appendChild(l), o && c.appendChild(_), s && c.appendChild(g), e.appendChild(c), s || (g = null);
		let u = i ? fi(r.spinner || "braille") : null;
		if (u) {
			let e = vi("span", "kt-loading kt-loading--terminal");
			l.appendChild(e), h = Ai(e, u, {
				...n,
				direction: n.direction,
				frameInterval: n.frameInterval ?? u.defaultInterval
			});
		}
		if (r.showMeter && g) {
			g.textContent = Ti(n, null, r.meterCount);
			let t = Math.round(Ei(Number(n.dotCount ?? r.meterCount ?? 10), 5, 40));
			e.style.setProperty("--kt-terminal-status-width", `${t + 7}ch`);
		}
	} else {
		let n = t.renderer === "multiline-frame";
		p = vi("i", `kt-loading-terminal__frame${n ? " kt-loading-terminal__frame--multiline" : ""}`, a[0] || ""), n && (p.style.whiteSpace = "pre"), e.appendChild(p);
	}
	if (t.renderer === "cursor-frame") {
		let e = Di(t.id, n);
		p.textContent = "", p.classList.add("kt-loading-terminal__frame--cursor"), p.appendChild(vi("span", "kt-loading-terminal__cursor-label", e.label));
		let r = e.mode === "ellipsis" ? 3 : 1;
		v = [];
		for (let t = 0; t < r; t += 1) {
			let t = vi("i", "kt-loading-terminal__caret", e.caret);
			p.appendChild(t), v.push(t);
		}
		y = e.mode, x(0);
	}
	return T(), {
		restart() {
			o = 0, u = 0, d = r.performance?.now?.() ?? Date.now(), a[0] != null && C(a[0]), h?.restart?.(), T();
		},
		setState(e) {
			l = e !== "running", h?.setState?.(e), l ? S() : T();
		},
		render(e) {
			if (t.id === "scanner") {
				n.progress = Mi(Number(e) || 0, 0, 100), a = Ci(n, i), o = 0, C(a[0]), T();
				return;
			}
			if (t.renderer !== "compound-frame" || !g) return;
			let r = t.compound || {}, s = Mi(Number(e) || 0, 0, 100);
			r.showMeter ? g.textContent = Ti(n, s, r.meterCount) : r.showElapsed && (n.progress = s);
		},
		destroy() {
			S(), h?.destroy?.(), h = null;
		},
		getSnapshot() {
			return {
				presetId: t.id,
				renderer: t.renderer,
				frameIndex: o,
				reversed: i,
				interval: ki(n, t),
				frames: a.slice()
			};
		}
	};
}
function ji(e, t, n, r) {
	let i = mi[t];
	if (!i) return null;
	let a = Array.from(i), o = vi("i", "kt-loading-terminal__frame", a[0]);
	e.appendChild(o), e.classList.add(`kt-loading-terminal--${t}`);
	let s = 0, c = null, l = !1, u = e.ownerDocument?.defaultView || globalThis, d = n.direction === "reverse" || n.direction === "rtl", f = () => {
		c != null && u.clearTimeout(c), c = null;
	}, p = () => {
		if (f(), l || a.length < 2) return;
		let e = Math.max(40, Number(n.frameInterval ?? Number(n.motionDuration ?? 1.1) * 1e3 / 12));
		c = u.setTimeout(() => {
			s = (s + (d ? -1 : 1) + a.length) % a.length, o.textContent = a[s], p();
		}, e);
	};
	return p(), {
		restart() {
			s = 0, o.textContent = a[0], p();
		},
		setState(e) {
			l = e !== "running", l ? f() : p();
		},
		render() {},
		destroy() {
			f();
		},
		getSnapshot() {
			return {
				presetId: t,
				renderer: "text-frame",
				frameIndex: s,
				reversed: d,
				frames: a
			};
		}
	};
}
function Mi(e, t, n) {
	return Math.min(n, Math.max(t, e));
}
//#endregion
//#region src/modules/loadingIndicator.js
function Ni(e, t, n) {
	let r = document.createElement(e);
	return t && (r.className = t), n != null && (r.textContent = String(n)), r.setAttribute("aria-hidden", "true"), r;
}
function Pi(e, t, n) {
	return t.includes(e) ? e : n;
}
var Fi = Object.freeze({ ...mi }), Ii = [
	"cursor",
	"dots",
	"blocks",
	"meter",
	...ui,
	...Object.keys(Fi)
];
function Li(e, t, n) {
	if (typeof n.renderUI == "function") {
		let t = n.renderUI(e, n) || {};
		return t.root && e.appendChild(t.root), {
			root: t.root || e,
			render: t.render || (() => {}),
			setState: t.setState || (() => {}),
			destroy: t.destroy || (() => {})
		};
	}
	let r = Ni("span", `kt-loading kt-loading--${t}`), i = null, a = null, o = null, s = null, c = [], l = null, u = null, d = 0, f = !1, p = !0, m = [], h = null, g = e.ownerDocument?.defaultView || globalThis, _ = n.direction === "reverse" || n.direction === "rtl", v = () => {
		u != null && (g.clearTimeout(u), g.clearInterval(u)), u = null;
	}, y = () => {
		if (v(), f || !l || m.length < 2) return;
		let e = Math.max(40, Number(n.frameInterval ?? Number(n.motionDuration ?? 1.1) * 1e3 / 12));
		u = g.setTimeout(() => {
			d = (d + (_ ? -1 : 1) + m.length) % m.length, l.textContent = m[d], y();
		}, e);
	};
	if (t === "spinner") {
		let e = Pi(n.spinnerStyle, [
			"ring",
			"comet",
			"spokes"
		], "comet");
		if (r.classList.add(`kt-loading-spinner--${e}`), e === "spokes") {
			n.rotateSpokes && r.classList.add("is-rotating");
			let e = Math.round(G(Number(n.dotCount ?? 12), 6, 16));
			for (let t = 0; t < e; t += 1) {
				let i = Ni("i", "kt-loading-spinner__spoke"), a = 360 / e * t;
				i.style.setProperty("--kt-loading-angle", `${a}deg`), i.style.setProperty("--kt-loading-index", String(t)), i.style.setProperty("--kt-loading-count", String(e));
				let o = _ ? t : e - 1 - t;
				i.style.animationDelay = `${-(Number(n.motionDuration ?? 1.1) / e) * o}s`, r.appendChild(i);
			}
		} else if (e === "ring") r.appendChild(Ni("i", "kt-loading-spinner__ring"));
		else {
			let e = Pi(n.spinnerMode, [
				"grow",
				"spin",
				"fill"
			], "spin"), t = n.track === !0;
			r.classList.add(`kt-loading-spinner--mode-${e}`), t && r.classList.add("has-track");
			let i = "http://www.w3.org/2000/svg", o = document.createElementNS(i, "svg");
			o.setAttribute("viewBox", "0 0 48 48"), o.setAttribute("class", "kt-loading-spinner__svg"), o.setAttribute("aria-hidden", "true");
			let s = (e) => {
				let t = document.createElementNS(i, "circle");
				return t.setAttribute("cx", "24"), t.setAttribute("cy", "24"), t.setAttribute("r", "20"), t.setAttribute("class", e), t;
			};
			t && o.appendChild(s("kt-loading-spinner__track")), a = s("kt-loading-spinner__arc"), o.appendChild(a), r.appendChild(o), e === "fill" && r.classList.add("is-determinate-arc");
		}
	} else if (t === "dots") {
		let e = Pi(n.dotStyle, [
			"pulse",
			"bounce",
			"wave"
		], "wave");
		r.classList.add(`kt-loading-dots--${e}`);
		let t = Math.round(G(Number(n.dotCount ?? 3), 3, 8));
		for (let e = 0; e < t; e += 1) {
			let n = Ni("i", "kt-loading-dot");
			n.style.setProperty("--kt-loading-index", String(e));
			let i = _ ? t - 1 - e : e;
			n.style.animationDelay = `${i * 110}ms`, r.appendChild(n);
		}
	} else if (t === "bar") {
		let e = Ni("span", "kt-loading-bar__track");
		i = Ni("i", "kt-loading-bar__progress"), e.appendChild(i), r.appendChild(e), n.indeterminate !== !1 && (r.classList.add("is-indeterminate"), r.classList.add(`is-bar-${Pi(n.barMode, [
			"slide",
			"grow",
			"pingpong"
		], "slide")}`));
	} else if (t === "shimmer" || t === "shimmer-wave") {
		let e = String(n.text || n.label || "Loading");
		if (t === "shimmer") {
			let t = Ni("span", "kt-loading-shimmer__text", e);
			t.dataset.text = e, _ && t.classList.add("is-reverse"), r.appendChild(t);
		} else {
			let t = Ni("span", "kt-loading-shimmer-wave__text");
			Array.from(e).forEach((n, r) => {
				let i = Ni("i", "kt-loading-shimmer-wave__char", n === " " ? "\xA0" : n);
				i.style.setProperty("--kt-loading-index", String(r));
				let a = _ ? e.length - 1 - r : r;
				i.style.animationDelay = `${a * 42}ms`, t.appendChild(i);
			}), r.appendChild(t);
		}
	} else {
		let e = Pi(n.terminalStyle, Ii, "cursor"), t = Array.isArray(n.frames) ? n.frames.map(String).filter(Boolean) : [], i = t.length ? "custom" : e;
		if (r.classList.add(`kt-loading-terminal--${i}`), i === "dots") for (let e = 0; e < 3; e += 1) {
			let t = Ni("i", "kt-loading-terminal__dot", ".");
			t.style.setProperty("--kt-loading-index", String(e));
			let n = _ ? 2 - e : e;
			t.style.animationDelay = `${n * 140}ms`, r.appendChild(t);
		}
		else if (i === "blocks") {
			let e = Math.round(G(Number(n.dotCount ?? 4), 3, 8));
			for (let t = 0; t < e; t += 1) {
				let n = Ni("i", "kt-loading-terminal__block", "■");
				n.style.setProperty("--kt-loading-index", String(t));
				let i = _ ? e - 1 - t : t;
				n.style.animationDelay = `${i * 120}ms`, r.appendChild(n), c.push(n);
			}
		} else if (i === "meter") {
			o = Ni("span", "kt-loading-terminal__meter");
			let e = Math.round(G(Number(n.dotCount ?? 10), 5, 40)), t = n.emptyChar || "░", i = n.fillChar || "█";
			o.dataset.count = e, o.dataset.emptyChar = t, o.dataset.fillChar = i, o.appendChild(Ni("i", "kt-loading-terminal__bracket", "["));
			let a = [];
			for (let n = 0; n < e; n += 1) {
				let e = Ni("i", "kt-loading-terminal__cell", t);
				e.style.setProperty("--kt-loading-index", String(n)), o.appendChild(e), a.push(e);
			}
			o.appendChild(Ni("i", "kt-loading-terminal__bracket", "]"));
			let c = (e) => {
				a.forEach((n, r) => {
					let a = !!e(r);
					n.textContent = a ? i : t, n.classList.toggle("is-filled", a);
				});
			};
			if (n.indeterminate !== !0) {
				if (o.classList.add("is-determinate"), n.spread != null && n.spread !== "") {
					let t = Math.round(G(Number(n.spread), 0, e));
					o.dataset.lit = String(t), c((e) => e < t);
				} else c(() => !1);
			} else {
				let t = Math.round(G(Number(n.spread ?? 0) || Math.max(1, Math.round(e * .3)), 1, e)), r = 0, i = Math.max(40, Number(n.frameInterval ?? Number(n.motionDuration ?? 1.1) * 1e3 / e));
				c((n) => (n - r + e * 2) % e < t), s = g.setInterval(() => {
					f || (r = (r + (_ ? -1 : 1) + e) % e, c((n) => (n - r + e * 2) % e < t));
				}, i);
			}
			r.appendChild(o);
		} else if (i === "cursor") r.appendChild(Ni("i", "kt-loading-terminal__cursor", n.cursorChar || "█"));
		else {
			let i = t.length ? null : fi(e);
			i ? h = Ai(r, i, {
				...n,
				showSpinner: n.showSpinner,
				showLabel: n.showLabel,
				showStatus: n.showStatus,
				stepTotal: n.stepTotal
			}) : t.length ? (m = t, l = Ni("i", "kt-loading-terminal__frame", m[0]), r.classList.add("kt-loading-terminal--custom"), r.appendChild(l), y()) : Fi[e] ? h = ji(r, e, n) : (m = Array.from(Fi.ascii || "|/-\\"), l = Ni("i", "kt-loading-terminal__frame", m[0]), r.classList.add("kt-loading-terminal--ascii"), r.appendChild(l), y());
		}
	}
	return _ && t !== "shimmer" && r.classList.add("is-reverse"), n.glow === !0 && r.classList.add("has-glow"), r.setAttribute("aria-hidden", "true"), e.appendChild(r), {
		root: r,
		render(e) {
			let t = G(Number(e) || 0, 0, 100);
			i && !r.classList.contains("is-indeterminate") && (i.style.transform = `scaleX(${t / 100})`);
			let s = p && r.classList.contains("kt-loading-terminal--scanner") && (n.progress == null || n.progress === "") && n.indeterminate !== !1;
			if (p = !1, s || h?.render?.(t), a && r.classList.contains("is-determinate-arc")) {
				let e = 125.66;
				a.style.strokeDasharray = `${(e * t / 100).toFixed(2)} ${e}`;
			}
			if (o && o.classList.contains("is-determinate") && o.dataset.lit == null) {
				let e = Number(o.dataset.count), n = o.dataset.emptyChar, r = o.dataset.fillChar, i = Math.round(t / 100 * e);
				o.querySelectorAll(".kt-loading-terminal__cell").forEach((e, t) => {
					let a = t < i;
					e.textContent = a ? r : n, e.classList.toggle("is-filled", a);
				});
			}
			if (c.length && n.indeterminate === !1) {
				let e = Math.round(t / 100 * c.length);
				c.forEach((t, n) => {
					let r = n < e;
					t.classList.toggle("is-filled", r), t.style.opacity = r ? "1" : "0.25";
				});
			}
		},
		setState(e) {
			r.dataset.state = e, f = e !== "running", h ? h.setState(e) : f ? v() : y();
		},
		destroy() {
			v(), s != null && (g.clearInterval(s), s = null), h?.destroy?.(), r.remove();
		},
		restartFrames() {
			d = 0, l && m[0] != null && (l.textContent = m[0]), h?.restart?.(), !h && !f && y();
		}
	};
}
var Ri = {
	create(e, t = {}) {
		let n = Pi(t.type || t.preset, [
			"spinner",
			"dots",
			"bar",
			"shimmer",
			"shimmer-wave",
			"terminal"
		], "spinner"), r = {
			style: e.getAttribute("style"),
			className: e.getAttribute("class"),
			role: e.getAttribute("role"),
			aria: e.getAttribute("aria-label"),
			busy: e.getAttribute("aria-busy"),
			valueMin: e.getAttribute("aria-valuemin"),
			valueMax: e.getAttribute("aria-valuemax"),
			valueNow: e.getAttribute("aria-valuenow"),
			hidden: e.hidden
		}, i = Math.max(.2, Number(t.motionDuration ?? 1.1)), a = Pi(t.terminalStyle, Ii, "cursor"), o = n === "bar" && t.indeterminate === !1 || n === "spinner" && t.spinnerStyle === "comet" && t.spinnerMode === "fill" || n === "terminal" && (a === "meter" || a === "scanner" && t.indeterminate !== !0 && t.progress != null), s = t.color || "currentColor";
		e.classList.add("kt-loading-indicator"), t.className && e.classList.add(...String(t.className).split(/\s+/).filter(Boolean)), e.style.setProperty("--kt-loading-color", s), e.style.setProperty("--kt-loading-track-color", t.trackColor || "rgba(127,127,127,.18)"), e.style.setProperty("--kt-loading-highlight-color", t.highlightColor || t.glowColor || "currentColor"), e.style.setProperty("--kt-loading-base-color", t.baseColor || "color-mix(in srgb,currentColor 32%,transparent)"), e.style.setProperty("--kt-loading-size", `${Math.max(18, Number(t.size ?? 48))}px`), e.style.setProperty("--kt-loading-stroke", `${Math.max(1, Number(t.stroke ?? 4))}px`), e.style.setProperty("--kt-loading-bar-width", typeof t.barWidth == "number" ? `${t.barWidth}px` : t.barWidth || "min(240px,70vw)"), e.style.setProperty("--kt-loading-bar-height", `${Math.max(2, Number(t.barHeight ?? 5))}px`), e.style.setProperty("--kt-loading-dot-size", `${Math.max(2, Number(t.dotSize ?? 8))}px`), e.style.setProperty("--kt-loading-dot-gap", `${Math.max(0, Number(t.dotGap ?? 6))}px`), e.style.setProperty("--kt-loading-motion-duration", `${i}s`), e.style.setProperty("--kt-loading-fast-duration", `${i * .72}s`), e.style.setProperty("--kt-loading-glow-color", t.glowColor || s), e.style.setProperty("--kt-loading-glow-size", `${Math.max(0, Number(t.glowSize ?? 16))}px`), e.style.setProperty("--kt-loading-text-size", typeof t.textSize == "number" ? `${t.textSize}px` : t.textSize || "1rem"), e.style.setProperty("--kt-loading-spread", `${G(Number(t.spread ?? 24), 2, 80)}%`), t.transformOrigin && e.style.setProperty("--kt-loading-transform-origin", String(t.transformOrigin)), t.fontFamily && e.style.setProperty("--kt-loading-font-family", t.fontFamily), t.fontWeight && e.style.setProperty("--kt-loading-font-weight", String(t.fontWeight)), t.letterSpacing != null && e.style.setProperty("--kt-loading-letter-spacing", String(t.letterSpacing)), t.lineHeight != null && e.style.setProperty("--kt-loading-line-height", String(t.lineHeight)), t.fixedWidth && e.classList.add("is-terminal-fixed-width"), t.asciiOnly && e.classList.add("is-ascii-only"), t.viewportWidth != null && e.style.setProperty("--kt-terminal-viewport-width", `${Math.max(4, Number(t.viewportWidth))}ch`), (t.secondaryColor || t.highlightColor) && e.style.setProperty("--kt-loading-secondary-color", t.secondaryColor || t.highlightColor);
		let c = Li(e, n, t), l = te(e, {
			...t,
			progressOutput: t.progressOutput,
			progressScope: t.progressScope,
			progressTemplate: t.progressTemplate
		}), u = e.ownerDocument?.defaultView?.CustomEvent || globalThis.CustomEvent, d = G(Number(t.progress ?? 0), 0, 100), f = "running", p = !1, m = null, h = [], g, _ = !1, v = new Promise((e) => {
			g = e;
		}), y = (t, n = {}) => {
			u && e.dispatchEvent(new u(`kt-loading-indicator-${t}`, {
				bubbles: !0,
				detail: {
					indicator: e,
					state: f,
					progress: d,
					...n
				}
			}));
		}, b = (n) => {
			if (f === n) return;
			let r = f;
			f = n, e.dataset.ktLoadingState = n, c.setState?.(n), l.update(d, n), t.onStateChange?.(n, r, e), y("statechange", { previous: r });
		}, x = () => {
			c.render?.(d), e.style.setProperty("--kt-loading-progress", (d / 100).toFixed(4)), e.style.setProperty("--kt-loading-percent", String(Math.round(d))), o && e.setAttribute("aria-valuenow", String(Math.round(d))), l.update(d, f), t.onProgress?.(d, e), y("progress", { value: d });
		}, S = (t) => {
			_ || (_ = !0, g?.({
				status: t,
				progress: d,
				el: e
			}));
		}, C = (n = "manual") => !p && (e.hidden = !0, e.setAttribute("aria-busy", "false"), b("hidden"), t.onHide?.(e, n), y("hide", { reason: n }), !0), w = () => !p && (e.hidden = !1, e.setAttribute("aria-busy", "true"), b("running"), t.onShow?.(e), y("show"), !0), T = (n = "completed") => {
			if (p || f === "completing" || f === "completed") return !1;
			d = 100, x(), b("completing");
			let r = Math.max(0, Number(t.completeHold ?? 120)), i = Math.max(0, Number(t.exitDuration ?? 180));
			return e.style.setProperty("--kt-loading-exit-duration", `${i}ms`), e.classList.add("is-complete"), m = setTimeout(() => {
				p || (e.hidden = t.hideOnComplete !== !1, e.setAttribute("aria-busy", "false"), b(n), t.onComplete?.(e, n), y("complete", { status: n }), S(n));
			}, r + i), !0;
		}, E = (e) => !p && (d = G(Number(e) || 0, 0, 100), x(), d >= 100 && t.autoComplete !== !1 && T(), !0), D = (n) => (w(), Promise.resolve(n).then((e) => (T(), e), (n) => {
			throw b("error"), t.onError?.(n, e), y("error", { error: n }), t.completeOnError !== !1 && T("error"), n;
		})), O = (t) => {
			let n = typeof t == "string" ? e.ownerDocument.querySelector(t) : t?.el || t;
			if (!n?.addEventListener) return () => {};
			let r = (e) => E(e.detail?.value ?? e.detail?.progress ?? 0), i = () => T(), a = [
				["kt-loader-progress", r],
				["kt-loading-indicator-progress", r],
				["kt-loader-complete", i],
				["kt-loading-indicator-complete", i]
			];
			a.forEach(([e, t]) => n.addEventListener(e, t));
			let o = () => a.forEach(([e, t]) => n.removeEventListener(e, t));
			h.push(o);
			let s = t?.progress ?? n.getAttribute?.("aria-valuenow");
			return Number.isFinite(Number(s)) && E(s), o;
		};
		return e.setAttribute("role", o ? "progressbar" : "status"), e.setAttribute("aria-label", t.ariaLabel || "Loading"), e.setAttribute("aria-busy", "true"), o && (e.setAttribute("aria-valuemin", "0"), e.setAttribute("aria-valuemax", "100")), x(), t.progressSource && O(t.progressSource), t.onStart?.(e), y("start"), {
			el: e,
			type: "loadingIndicator",
			get progress() {
				return d;
			},
			get state() {
				return f;
			},
			get finished() {
				return v;
			},
			setProgress: E,
			bindProgress: O,
			start: w,
			show: w,
			hide: C,
			stop: T,
			complete: T,
			trackPromise: D,
			pause() {
				p || (e.classList.add("is-paused"), b("paused"));
			},
			resume() {
				p || (e.classList.remove("is-paused"), b("running"));
			},
			restart() {
				p || (c.restartFrames?.(), b("running"));
			},
			destroy() {
				p || (p = !0, m && clearTimeout(m), h.splice(0).forEach((e) => e()), c.destroy?.(), l.destroy(), r.style == null ? e.removeAttribute("style") : e.setAttribute("style", r.style), r.className == null ? e.removeAttribute("class") : e.setAttribute("class", r.className), r.role == null ? e.removeAttribute("role") : e.setAttribute("role", r.role), r.aria == null ? e.removeAttribute("aria-label") : e.setAttribute("aria-label", r.aria), r.busy == null ? e.removeAttribute("aria-busy") : e.setAttribute("aria-busy", r.busy), r.valueMin == null ? e.removeAttribute("aria-valuemin") : e.setAttribute("aria-valuemin", r.valueMin), r.valueMax == null ? e.removeAttribute("aria-valuemax") : e.setAttribute("aria-valuemax", r.valueMax), r.valueNow == null ? e.removeAttribute("aria-valuenow") : e.setAttribute("aria-valuenow", r.valueNow), e.hidden = r.hidden, delete e.dataset.ktLoadingState, S("destroyed"));
			}
		};
	},
	reduced(e, t = {}) {
		let n = this.create(e, t);
		return n.pause(), n;
	}
}, zi = /* @__PURE__ */ new WeakMap();
function Bi(e, t) {
	return {
		value: e.getPropertyValue(t),
		priority: e.getPropertyPriority(t)
	};
}
function Vi(e, t, n) {
	n.value ? e.setProperty(t, n.value, n.priority) : e.removeProperty(t);
}
function Hi(e, t, n = {}) {
	let r = e.style, i = zi.get(e);
	if (!i) {
		i = {
			refs: 0,
			hadClass: e.classList.contains("kt-interactive-shadow"),
			base: Bi(r, "--kt-shadow-base-runtime"),
			boxShadow: Bi(r, "box-shadow")
		};
		let t = getComputedStyle(e).boxShadow;
		t && t !== "none" && r.setProperty("--kt-shadow-base-runtime", t), e.classList.add("kt-interactive-shadow"), r.setProperty("box-shadow", "var(--kt-tilt-shadow, var(--kt-tilt-shadow-runtime, 0 0 0 transparent)), var(--kt-card-glow-shadow, var(--kt-card-glow-shadow-runtime, 0 0 0 transparent)), var(--kt-shadow-base, var(--kt-shadow-base-runtime, 0 0 0 transparent))"), zi.set(e, i);
	}
	i.refs += 1;
	let a = `--kt-${t}-shadow-runtime`, o = `--kt-${t}-shadow-active-opacity`, s = Bi(r, a), c = Bi(r, o), l = `--kt-${t}-shadow`, u = n.enabled === !0 || !!String(n.css || "").trim(), d = Math.max(0, Math.min(1, Number(n.opacity ?? .28))), f = Math.max(0, Number(n.blur ?? 34)), p = Number(n.spread ?? -8), m = n.color || "#111827", h = n.inset === !0 ? "inset " : "", g = String(n.css || "").trim(), _ = !1, v = (e = 0, t = 0, n = !0) => {
		if (_) return;
		let i = u && n;
		if (r.setProperty(o, `${i ? d * 100 : 0}%`), g && i) {
			r.setProperty(a, g);
			return;
		}
		r.setProperty(a, `${h}var(${l}-x, ${Number(e).toFixed(2)}px) var(${l}-y, ${Number(t).toFixed(2)}px) var(${l}-blur, ${f}px) var(${l}-spread, ${p}px) color-mix(in srgb, var(${l}-color, ${m}) var(${l}-opacity, var(${o})), transparent)`);
	};
	return v(Number(n.x ?? 0), Number(n.y ?? 0), n.active !== !1), {
		update: v,
		destroy() {
			_ || (_ = !0, Vi(r, a, s), Vi(r, o, c), --i.refs, !(i.refs > 0) && (Vi(r, "--kt-shadow-base-runtime", i.base), Vi(r, "box-shadow", i.boxShadow), i.hadClass || e.classList.remove("kt-interactive-shadow"), zi.delete(e)));
		}
	};
}
//#endregion
//#region src/modules/tilt.js
var Ui = {
	create(e, t) {
		if (t.disableOnMobile === !0 && typeof window < "u" && window.matchMedia?.("(hover: none), (pointer: coarse)").matches) return null;
		let n = window.matchMedia?.("(hover: none)").matches === !0, r = typeof DeviceOrientationEvent < "u";
		if (n && (t.gyro === !1 || !r)) return null;
		let i = Math.max(0, Number(t.max ?? 12)), a = Math.max(0, Number(t.maxX ?? i)), o = Math.max(0, Number(t.maxY ?? i)), s = Math.max(100, Number(t.perspective ?? 1e3)), c = Math.max(.5, Number(t.scale ?? 1.02)), l = G(Number(t.smoothing ?? t.ease ?? .1), .01, 1), u = Math.max(.1, Number(t.sensitivity ?? 1)), d = t.axis || "both", f = t.reverse === !0 ? -1 : 1, p = t.reset !== !1, m = t.glare !== !1, h = Math.max(20, Number(t.glareRadius ?? 180)), g = G(Number(t.glareOpacity ?? .32), 0, 1), _ = t.glareColor || "rgba(255,255,255,.85)", v = Math.max(0, Number(t.glareBlur ?? 8)), y = t.tiltShadowCss || "", b = t.tiltShadow === !0 || !!String(y).trim(), x = t.tiltShadowColor || "#111827", S = G(Number(t.tiltShadowOpacity ?? .28), 0, 1), C = Math.max(0, Number(t.tiltShadowBlur ?? 34)), w = Number(t.tiltShadowSpread ?? -8), T = Number(t.tiltShadowX ?? 0), E = Number(t.tiltShadowY ?? 14), D = Math.max(0, Number(t.tiltShadowFollow ?? 1.1)), O = t.tiltShadowHoverOnly === !0, k = t.tiltShadowInset === !0, A = Z(e, [
			"transform",
			"transformStyle",
			"willChange",
			"position"
		]);
		getComputedStyle(e).position === "static" && (e.style.position = "relative"), e.style.transformStyle = "preserve-3d", e.style.willChange = "transform";
		let j = 0, M = 0, N = 0, P = 0, F = 1, I = 1, L = !0, R = null, z = !1, B = null, V = null, H = 50, K = 50, ee = Hi(e, "tilt", {
			enabled: b,
			color: x,
			opacity: S,
			blur: C,
			spread: w,
			x: T,
			y: E,
			inset: k,
			css: y,
			active: b && !O
		});
		m && (B = document.createElement("span"), B.className = "kt-tilt-glare-wrap", B.setAttribute("aria-hidden", "true"), B.style.cssText = "position:absolute;inset:0;overflow:hidden;border-radius:inherit;pointer-events:none;z-index:9;", V = document.createElement("span"), V.className = "kt-tilt-glare", V.style.cssText = `position:absolute;width:${h * 2}px;height:${h * 2}px;left:${-h}px;top:${-h}px;border-radius:50%;pointer-events:none;background:radial-gradient(circle,${_},rgba(255,255,255,0) 68%);filter:blur(${v}px);opacity:0;transition:opacity .2s var(--kt-ease-ui, ease);mix-blend-mode:screen;`, B.appendChild(V), e.appendChild(B));
		let q = () => {
			if (!L) return;
			N = W(N, j, l), P = W(P, M, l), I = W(I, F, l), e.style.transform = `perspective(${s}px) rotateX(${N}deg) rotateY(${P}deg) scale3d(${I},${I},${I})`, ee.update(T - P * D, E + N * D, !O || z), V && (V.style.transform = `translate3d(${H}%,${K}%,0)`);
			let t = Math.abs(N - j) > .02 || Math.abs(P - M) > .02 || Math.abs(I - F) > .002;
			R = z || t ? requestAnimationFrame(q) : null;
		}, J = () => {
			L && R == null && (R = requestAnimationFrame(q));
		}, Y = () => {
			z = !0, F = c, V && (V.style.opacity = String(g)), J();
		}, X = (t) => {
			let n = e.getBoundingClientRect();
			if (!n.width || !n.height) return;
			let r = G(((t.clientX - n.left) / n.width - .5) * u + .5, 0, 1), i = G(((t.clientY - n.top) / n.height - .5) * u + .5, 0, 1);
			j = d === "x" ? 0 : -(i - .5) * 2 * a * f, M = d === "y" ? 0 : (r - .5) * 2 * o * f, H = r * 100, K = i * 100, J();
		}, te = () => {
			z = !1, p && (j = 0, M = 0, F = 1), V && (V.style.opacity = "0"), J();
		}, ne = null;
		return n ? (ne = (e) => {
			let t = G((e.gamma || 0) / 28, -1, 1), n = G(((e.beta || 0) - 40) / 28, -1, 1);
			j = -n * a * f, M = t * o * f, H = (t + 1) * 50, K = (n + 1) * 50, V && (V.style.opacity = String(g)), z = !0, J();
		}, U().then((e) => {
			e && L && window.addEventListener("deviceorientation", ne, { passive: !0 });
		})) : (e.addEventListener("pointerenter", Y), e.addEventListener("pointermove", X, { passive: !0 }), e.addEventListener("pointerleave", te)), {
			el: e,
			type: "tilt",
			pause: () => {
				L = !1, R != null && cancelAnimationFrame(R);
			},
			resume: () => {
				L || (L = !0, J());
			},
			destroy: () => {
				L = !1, R != null && cancelAnimationFrame(R), e.removeEventListener("pointerenter", Y), e.removeEventListener("pointermove", X), e.removeEventListener("pointerleave", te), ne && window.removeEventListener("deviceorientation", ne), B?.remove(), ee.destroy(), A();
			}
		};
	},
	reduced() {},
	fallback() {
		return null;
	}
}, Wi = [
	137,
	80,
	78,
	71,
	13,
	10,
	26,
	10
], Gi = /* @__PURE__ */ new Set(["NETSCAPE2.0", "ANIMEXTS1.0"]), Ki = /* @__PURE__ */ new Uint32Array(256);
for (let e = 0; e < 256; e += 1) {
	let t = e;
	for (let e = 0; e < 8; e += 1) t = t & 1 ? 3988292384 ^ t >>> 1 : t >>> 1;
	Ki[e] = t >>> 0;
}
function qi(e) {
	return e instanceof Uint8Array ? e.slice() : ArrayBuffer.isView(e) ? new Uint8Array(e.buffer, e.byteOffset, e.byteLength).slice() : new Uint8Array(e).slice();
}
function Ji(e, t, n) {
	let r = "";
	for (let i = 0; i < n; i += 1) r += String.fromCharCode(e[t + i]);
	return r;
}
function Yi(e, t, n) {
	let r = 4294967295;
	for (let i = t; i < n; i += 1) r = Ki[(r ^ e[i]) & 255] ^ r >>> 8;
	return (r ^ 4294967295) >>> 0;
}
function Xi(e) {
	return e.length >= Wi.length && Wi.every((t, n) => e[n] === t);
}
function Zi(e) {
	let t = new DataView(e.buffer, e.byteOffset, e.byteLength), n = Wi.length, r = !1, i = 0;
	for (; n + 12 <= e.length;) {
		let a = t.getUint32(n, !1), o = n + 12 + a;
		if (o > e.length) break;
		let s = Ji(e, n + 4, 4);
		if (s === "acTL" && a === 8) t.setUint32(n + 12, 1, !1), t.setUint32(n + 8 + a, Yi(e, n + 4, n + 8 + a), !1), r = !0;
		else if (s === "fcTL" && a === 26) {
			let e = t.getUint16(n + 28, !1) / (t.getUint16(n + 30, !1) || 100) * 1e3;
			i += e > 10 ? e : 100;
		}
		if (s === "IEND" || s === "IDAT" && !r) break;
		n = o;
	}
	return {
		bytes: e,
		format: r ? "apng" : "png",
		animated: r,
		normalized: r,
		duration: i
	};
}
function Qi(e) {
	return e.length >= 12 && Ji(e, 0, 4) === "RIFF" && Ji(e, 8, 4) === "WEBP";
}
function $i(e) {
	let t = new DataView(e.buffer, e.byteOffset, e.byteLength), n = 12, r = !1, i = 0;
	for (; n + 8 <= e.length;) {
		let a = Ji(e, n, 4), o = t.getUint32(n + 4, !0), s = n + 8 + o;
		if (s > e.length) break;
		if (a === "ANIM" && o >= 6) t.setUint16(n + 12, 1, !0), r = !0;
		else if (a === "ANMF" && o >= 16) {
			let t = e[n + 20] | e[n + 21] << 8 | e[n + 22] << 16;
			i += t > 10 ? t : 100;
		}
		n = s + (o & 1);
	}
	return {
		bytes: e,
		format: "webp",
		animated: r,
		normalized: r,
		duration: i
	};
}
function ea(e) {
	let t = e.length >= 6 ? Ji(e, 0, 6) : "";
	return t === "GIF87a" || t === "GIF89a";
}
function ta(e, t) {
	let n = t;
	for (; n < e.length;) {
		let t = e[n];
		if (n += 1, t === 0) return n;
		if (n + t > e.length) return -1;
		n += t;
	}
	return -1;
}
function na(e) {
	if (e.length < 13) return {
		bytes: e,
		format: "gif",
		animated: !1,
		normalized: !1
	};
	let t = [], n = 0, r = 0, i = 100, a = 13;
	for (e[10] & 128 && (a += 3 * 2 ** ((e[10] & 7) + 1)); a < e.length;) {
		let o = e[a];
		if (o === 59) break;
		if (o === 44) {
			if (a + 10 > e.length) break;
			n += 1, r += i, i = 100;
			let t = e[a + 9];
			if (a += 10, t & 128 && (a += 3 * 2 ** ((t & 7) + 1)), a >= e.length || (a = ta(e, a + 1), a < 0)) break;
			continue;
		}
		if (o === 33) {
			if (a + 3 > e.length) break;
			let n = a, r = e[a + 1], o = a + 2, s = e[o];
			if (r === 249 && s === 4 && a + 8 <= e.length) {
				let t = (e[a + 4] | e[a + 5] << 8) * 10;
				i = t > 10 ? t : 100;
			}
			let c = r === 255 && s === 11 && o + 12 <= e.length ? Ji(e, o + 1, 11) : "";
			if (a = ta(e, o), a < 0) break;
			Gi.has(c) && t.push([n, a]);
			continue;
		}
		return {
			bytes: e,
			format: "gif",
			animated: n > 1,
			normalized: !1,
			duration: r
		};
	}
	if (!t.length) return {
		bytes: e,
		format: "gif",
		animated: n > 1,
		normalized: !1,
		duration: r
	};
	let o = new Uint8Array(e.length - t.reduce((e, [t, n]) => e + n - t, 0)), s = 0, c = 0;
	for (let [n, r] of t) o.set(e.subarray(s, n), c), c += n - s, s = r;
	return o.set(e.subarray(s), c), {
		bytes: o,
		format: "gif",
		animated: n > 1,
		normalized: !0,
		duration: r
	};
}
function ra(e) {
	let t = qi(e);
	return Xi(t) ? Zi(t) : Qi(t) ? $i(t) : ea(t) ? na(t) : {
		bytes: t,
		format: null,
		animated: !1,
		normalized: !1
	};
}
function ia(e, t) {
	if (/^(?:data|blob):/i.test(e)) return e;
	let n = e.indexOf("#"), r = n < 0 ? e : e.slice(0, n), i = n < 0 ? "" : e.slice(n);
	return `${r}${r.includes("?") ? "&" : "?"}kt-click=${Date.now()}-${t}${i}`;
}
var aa = /* @__PURE__ */ new WeakMap();
function oa(e, t) {
	if (!e.clickSprite) return null;
	let n = aa.get(e);
	if (!n) {
		n = {}, aa.set(e, n);
		let r = t.defaultView?.Image || globalThis.Image;
		if (!r) return n;
		let i = new r();
		i.onload = () => {
			let e = i.naturalHeight || 96, t = Math.max(1, Math.round(i.naturalWidth / Math.max(1, e)));
			Object.assign(n, {
				width: i.naturalWidth / t,
				height: e,
				frames: t
			});
		}, i.src = e.clickSprite;
	}
	return n;
}
async function sa(e, t, n) {
	let r = t.defaultView?.fetch || globalThis.fetch;
	if (typeof r != "function") return null;
	let i = t.defaultView || globalThis, a = n?.signal, o, s, c = new Promise((e) => {
		s = () => e(null), a?.addEventListener("abort", s, { once: !0 }), o = i.setTimeout(() => {
			n?.abort(), e(null);
		}, 15e3), a?.aborted && e(null);
	}), l = async () => {
		let n = await r(e, {
			mode: "cors",
			credentials: "same-origin",
			signal: a
		});
		if (!n.ok) return null;
		let i = ra(await n.arrayBuffer());
		if (!i.format) return null;
		let o = {
			apng: "image/png",
			png: "image/png",
			webp: "image/webp",
			gif: "image/gif"
		}[i.format], s = t.defaultView?.Blob || globalThis.Blob;
		return {
			...i,
			blob: new s([i.bytes], { type: o })
		};
	};
	try {
		return await Promise.race([l(), c]);
	} catch {
		return null;
	} finally {
		i.clearTimeout(o), a?.removeEventListener("abort", s);
	}
}
function ca(e, t, n = 2147483e3) {
	let r = t?.ownerDocument || globalThis.document;
	if (!r || !e.clickSprite && !e.clickImage) return {
		spawn() {},
		destroy() {}
	};
	let i = r.defaultView || globalThis, a = r.defaultView?.URL || globalThis.URL, o = r.defaultView?.AbortController || globalThis.AbortController, s = o ? new o() : null, c = /* @__PURE__ */ new Set(), l = /* @__PURE__ */ new Map(), u = /* @__PURE__ */ new Map(), d = null, f = !1, p = 0, m = e.clickImage ? String(e.clickImage) : "", h = m && !e.clickSprite ? sa(m, r, s) : Promise.resolve(null), g = (e) => {
		let t = l.get(e);
		t != null && i.clearTimeout(t), l.delete(e);
		let n = u.get(e);
		n && a?.revokeObjectURL?.(n), u.delete(e), c.delete(e), e.onload = null, e.onerror = null, e.remove();
	}, _ = (e, t) => {
		let n = l.get(e);
		n != null && i.clearTimeout(n), l.set(e, i.setTimeout(() => g(e), t));
	}, v = (i, a) => {
		let o = oa(e, r) || {}, s = Math.max(8, Number(e.clickSpriteWidth ?? o.width ?? 96)), l = Math.max(8, Number(e.clickSpriteHeight ?? o.height ?? s)), u = Math.max(1, Math.round(Number(e.clickSpriteFrames ?? o.frames ?? 8))), f = Math.max(80, Number(e.clickSpriteDuration ?? 480)), p = u > 1 ? `steps(${u}, jump-none)` : "steps(1)", m = `${s}x${u}`;
		if (!d) {
			let e = `kt-cur-spr-${Math.random().toString(36).slice(2, 7)}`;
			d = r.createElement("style"), d.dataset.uid = e, r.head.appendChild(d);
		}
		d.dataset.signature !== m && (d.dataset.signature = m, d.textContent = `@keyframes ${d.dataset.uid} { to { background-position: -${s * (u - 1)}px 0; } }`);
		let h = r.createElement("span");
		h.className = "kt-cursor-click-sprite", h.setAttribute("aria-hidden", "true");
		let g = JSON.stringify(String(e.clickSprite));
		return h.style.cssText = `position:fixed;left:${i}px;top:${a}px;width:${s}px;height:${l}px;transform:translate(-50%,-50%);pointer-events:none;z-index:${n + 1};background-image:url(${g});background-position:0 0;background-size:auto ${l}px;background-repeat:no-repeat;animation:${d.dataset.uid} ${f}ms ${p} forwards;`, t.appendChild(h), c.add(h), _(h, f + 40), h;
	}, y = async (i, o) => {
		let s = ++p, l = await h;
		if (f) return null;
		let d = Math.max(8, Number(e.clickImageSize ?? 96)), v = Number(e.clickImageDuration ?? 0), y = Number.isFinite(v) && v > 0 ? Math.max(80, v) : Math.max(700, (l?.duration || 0) + 80), b = r.createElement("img");
		b.className = "kt-cursor-click-image", b.alt = "", b.setAttribute("aria-hidden", "true"), b.onload = () => _(b, y), b.onerror = () => g(b), b.style.cssText = `position:fixed;left:${i}px;top:${o}px;width:${d}px;height:auto;transform:translate(-50%,-50%);pointer-events:none;z-index:${n + 1};`;
		let x = null;
		if (l?.blob && typeof a?.createObjectURL == "function") try {
			x = a.createObjectURL(l.blob);
		} catch {
			x = null;
		}
		let S = ia(m, s);
		return x ? (u.set(b, x), b.dataset.ktClickImageFormat = l.format, b.dataset.ktClickImageLoop = "one", b.onerror = () => {
			let e = u.get(b);
			e && a?.revokeObjectURL?.(e), u.delete(b), b.dataset.ktClickImageLoop = "duration-fallback", b.onerror = () => g(b), b.src = S;
		}, b.src = x) : (b.dataset.ktClickImageLoop = "duration-fallback", b.src = S), t.appendChild(b), c.add(b), _(b, 15e3), b;
	};
	return {
		spawn(t, n) {
			return f ? null : e.clickSprite ? v(t, n) : y(t, n);
		},
		destroy() {
			f = !0, s?.abort(), [...c].forEach(g), d?.remove(), d = null;
		}
	};
}
//#endregion
//#region src/modules/cursor.js
function la(e) {
	return {
		clickImage: e.clickImage,
		clickImageDuration: e.clickImageDuration,
		clickImageSize: e.clickImageSize,
		clickSprite: e.clickSprite,
		clickSpriteDuration: e.clickSpriteDuration,
		clickSpriteFrames: e.clickSpriteFrames,
		clickSpriteHeight: e.clickSpriteHeight,
		clickSpriteWidth: e.clickSpriteWidth
	};
}
function ua(e) {
	return e.clientX >= 0 && e.clientY >= 0 && e.clientX <= window.innerWidth && e.clientY <= window.innerHeight;
}
function da(e, t) {
	return t.global === !0 ? !1 : t.global === !1 ? !0 : !e || e === document.body || e === document.documentElement || !e.children.length && !e.textContent.trim() ? !1 : e.clientWidth > 4 && e.clientHeight > 4;
}
function fa(e, t = "#fff") {
	if (!e || e === "transparent" || e === "currentColor") return t;
	let n = document.createElement("span");
	n.style.color = e, n.style.display = "none", document.body.appendChild(n);
	let r = getComputedStyle(n).color.match(/[\d.]+/g);
	if (n.remove(), !r || r.length < 3) return t;
	let [i, a, o] = r.slice(0, 3).map(Number);
	return (.2126 * i + .7152 * a + .0722 * o) / 255 > .58 ? "#101318" : "#fff";
}
var pa = {
	create(e, t = {}) {
		if (window.matchMedia?.("(hover: none), (pointer: coarse)").matches || navigator.maxTouchPoints > 0) return !t.clickSprite && !t.clickImage ? null : this._clickEffectsOnly(e, t);
		let n = t.type || t.preset || "dot", r = G(Number(t.smoothing ?? t.ease ?? t.speed ?? .16), .01, 1), i = Math.max(1, Number(t.dotSize ?? 7)), a = Math.max(i, Number(t.followerSize ?? 34)), o = Math.max(.1, Number(t.hoverScale ?? 1.7)), s = Math.max(.1, Number(t.pressScale ?? .82)), c = t.color || "currentColor", l = t.borderColor || c, u = t.background || "transparent", d = t.mixBlendMode || "normal", f = G(Number(t.opacity ?? 1), 0, 1), p = Number(t.zIndex ?? 2147483e3), m = t.hoverSelector || "a,button,input,select,textarea,label,[role=\"button\"],[data-kt-cursor-hover]", h = t.hiddenSelector || "[data-kt-cursor-hide]", g = da(e, t), _ = document.documentElement, v = _.style.cursor;
		g ? (e.classList.add("kt-cursor-scope"), e.setAttribute("data-kt-cursor-scope", "")) : _.classList.add("kt-cursor-active");
		let y = document.createElement("div");
		y.className = `kt-cursor kt-cursor-${n}${t.className ? ` ${t.className}` : ""}`, y.setAttribute("aria-hidden", "true"), y.style.cssText = `position:fixed;top:0;left:0;z-index:${p};pointer-events:none;opacity:0;color:${c};mix-blend-mode:${d};transition:opacity .18s var(--kt-ease-ui, ease);`;
		let b = null, x = null, S = null, C = null, w = {
			nodes: [],
			xs: [],
			ys: [],
			angles: []
		}, T = {
			pool: [],
			last: 0
		}, E = (e = i) => {
			b = document.createElement("span"), b.className = "kt-cursor-dot", b.dataset.baseSize = String(e), b.style.cssText = `position:fixed;left:0;top:0;width:${e}px;height:${e}px;border-radius:999px;background:${t.dotColor || c};box-shadow:${t.dotShadow || "0 1px 4px rgba(0,0,0,.2)"};will-change:transform;transform:translate3d(-100px,-100px,0) translate(-50%,-50%);transition:width .22s cubic-bezier(.3,.7,.35,1.15),height .22s cubic-bezier(.3,.7,.35,1.15),background-color .18s ease,box-shadow .18s ease,opacity .18s var(--kt-ease-ui, ease);`, y.appendChild(b);
		}, D = (e = "circle") => {
			x = document.createElement("span"), x.className = "kt-cursor-follower";
			let n = e === "square" ? t.radius || "8px" : "50%";
			x.dataset.baseWidth = String(a), x.dataset.baseHeight = String(a), x.dataset.baseRadius = String(n), x.style.cssText = `position:fixed;left:0;top:0;width:${a}px;height:${a}px;border:${Math.max(0, Number(t.borderWidth ?? 1))}px solid ${l};border-radius:${n};background:${u};box-shadow:${t.shadow || "none"};will-change:transform,width,height;transform:translate3d(-100px,-100px,0) translate(-50%,-50%) scale(1);transition:width .26s cubic-bezier(.2,.8,.2,1),height .26s cubic-bezier(.2,.8,.2,1),border-radius .26s cubic-bezier(.2,.8,.2,1),background-color .2s var(--kt-ease-ui, ease),border-color .2s var(--kt-ease-ui, ease),box-shadow .2s var(--kt-ease-ui, ease);backdrop-filter:${t.backdropFilter || "none"};`, y.appendChild(x);
		}, O = (e) => {
			S = document.createElement("span"), S.className = "kt-cursor-single", S.style.cssText = "position:fixed;left:0;top:0;will-change:transform;transform:translate3d(-100px,-100px,0);", e != null && (S.innerHTML = e), y.appendChild(S);
		}, k = (e, t = w.nodes.length) => {
			let n = document.createElement("span");
			return n.setAttribute("aria-hidden", "true"), n.style.cssText = `position:fixed;left:0;top:0;pointer-events:none;z-index:${p - t};will-change:transform;transform:translate3d(-200px,-200px,0);${e}`, y.appendChild(n), w.nodes.push(n), w.xs.push(-200), w.ys.push(-200), n;
		};
		if (n === "crosshair") {
			if (t.full !== !1) O("<span class=\"kt-cursor-hair kt-cursor-hair--vp-x\"></span><span class=\"kt-cursor-hair kt-cursor-hair--vp-y\"></span>"), S.dataset.crosshairFull = "true", S.style.transform = "none", S.style.willChange = "auto", E(Math.max(4, i));
			else {
				let e = Math.max(8, Number(t.crosshairSize ?? 20));
				O("<span class=\"kt-cursor-hair kt-cursor-hair--x\"></span><span class=\"kt-cursor-hair kt-cursor-hair--y\"></span>"), S.style.setProperty("--kt-cursor-cross", `${e}px`);
			}
		} else if (n === "image" && t.src) {
			O("");
			let e = document.createElement("img");
			e.src = t.src, e.alt = "", e.className = "kt-cursor-image", e.style.setProperty("--kt-cursor-w", `${Number(t.width ?? 36)}px`), e.style.setProperty("--kt-cursor-h", `${Number(t.height ?? 36)}px`), e.style.setProperty("--kt-cursor-rotate", `${Number(t.rotate ?? 0)}deg`), S.appendChild(e);
		} else if (n === "custom") O(t.template || t.html || (e !== document.body && e !== document.documentElement && !g ? e.innerHTML : "")), S.firstElementChild?.setAttribute("aria-hidden", "true");
		else if (n === "text") {
			let e = Math.max(40, a * 2.4), n = t.rotateText || t.text || "KINETO · KINETO · ", r = `kt-cur-txt-${Math.random().toString(36).slice(2, 7)}`, o = Math.max(8, Number(t.labelSize ?? 11)), s = e / 2 - o;
			O(`<svg class="kt-cursor-textring" width="${e}" height="${e}" viewBox="0 0 ${e} ${e}"><defs><path id="${r}-p" d="M ${e / 2},${e / 2 - s} a ${s},${s} 0 1,1 -0.01,0 Z"></path></defs><text><textPath href="#${r}-p">${String(n)}</textPath></text></svg>`), S.style.setProperty("--kt-cursor-textring", `${e}px`), S.style.setProperty("--kt-cursor-textring-dur", `${Math.max(2, Number(t.rotateDuration ?? 7))}s`), S.style.setProperty("--kt-cursor-textring-fill", String(t.textColor || c)), S.style.setProperty("--kt-cursor-textring-size", `${Number(t.labelSize ?? 11)}px`), t.dot !== !1 && E(Math.max(3, i - 2));
		} else if (n === "trail") {
			let e = Math.max(3, Math.round(Number(t.trailCount ?? 9))), n = Math.max(4, Number(t.trailSize ?? 13));
			for (let r = 0; r < e; r += 1) {
				let i = Math.max(2, Math.round(n * (1 - r / e * .6))), a = (1 - r / e * .75).toFixed(2), o = k(`width:${i}px;height:${i}px;border-radius:50%;background:${t.trailColor || c};opacity:${a};`, r);
				o.dataset.half = String(i / 2);
			}
			w.spring = G(Number(t.spring ?? .28), .05, .9);
		} else if (n === "orbit") {
			let e = String(t.orbitText || t.text || "KINETO · "), n = Array.from(e);
			n.forEach((e, r) => {
				let i = k(`font:700 ${Number(t.labelSize ?? 12)}px ui-monospace,monospace;color:${t.textColor || c};text-transform:uppercase;line-height:1;`, r);
				i.textContent = e === " " ? "\xA0" : e, w.angles.push(r / n.length * Math.PI * 2);
			}), w.orbitRadius = Math.max(16, Number(t.orbitRadius ?? 56)), w.orbitSpeed = Number(t.orbitSpeed ?? .016), w.squash = G(Number(t.orbitSquash ?? .42), .1, 1), w.orbitHoverRadius = w.orbitRadius * Math.max(1, Number(t.orbitHoverScale ?? 1.55)), w.orbitCur = w.orbitRadius, w.squashCur = w.squash;
		} else if (n === "snake") {
			let e = String(t.snakeText || t.text || "KINETO"), n = Number(t.labelSize ?? 14);
			Array.from(e).forEach((e, r) => {
				let i = k(`font:800 ${n}px ui-monospace,monospace;color:${t.textColor || c};line-height:1;`, r);
				i.textContent = e === " " ? "\xA0" : e;
			}), w.spring = G(Number(t.spring ?? .35), .05, .9), w.gap = Math.max(4, Number(t.snakeGap ?? n * .78)), w.scales = w.nodes.map(() => 1), w.minScale = G(Number(t.snakeMinScale ?? .42), .1, 1), w.scaleEase = G(Number(t.snakeScaleEase ?? .08), .02, .5);
		} else n === "sparkle" ? (E(Math.max(4, i - 1)), T.symbols = Array.isArray(t.sparkleSymbols) ? t.sparkleSymbols : [
			"✦",
			"✧",
			"★",
			"✺",
			"·",
			"✱"
		], T.size = Math.max(8, Number(t.sparkleSize ?? 15)), T.duration = Math.max(150, Number(t.sparkleDuration ?? 620)), T.throttle = Math.max(16, Number(t.sparkleThrottle ?? 42)), T.colors = [t.sparkleColor || (c === "currentColor" ? "#ffd166" : c), t.sparkleColor2 || "#7b9fff"]) : n === "blob" ? (D("circle"), x.style.background = t.background || c, x.style.border = "0", x.style.opacity = ".75", x.style.filter = `blur(${Math.max(0, Number(t.blur ?? 0))}px)`) : n === "ring" ? (D(t.shape || "circle"), t.dot === !0 && E()) : (E(), t.follower !== !1 && D(t.shape || "circle"));
		t.label !== !1 && (b || x || S) && (C = document.createElement("span"), C.className = "kt-cursor-label", C.style.cssText = `position:absolute;inset:0;display:flex;align-items:center;justify-content:center;padding:0 13px;white-space:nowrap;font:750 ${Number(t.labelSize ?? 9)}px/1 ui-sans-serif,system-ui,sans-serif;letter-spacing:.08em;text-transform:uppercase;color:${t.labelColor || "#fff"};opacity:0;transform:scale(.82);transition:opacity .16s var(--kt-ease-ui, ease),transform .24s cubic-bezier(.2,.8,.2,1),color .18s var(--kt-ease-ui, ease);pointer-events:none;`, (t.hoverEffect === "pill" && x ? x : b || x || S).appendChild(C)), document.body.appendChild(y);
		let A = ca(la(t), y, p), j = window.innerWidth / 2, M = window.innerHeight / 2, N = j, P = M, F = !0, I = !1, L = !1, R = null, z = null, B = !g, V = (e) => {
			I = e, y.style.opacity = e ? String(f) : "0";
		}, H = t.hoverEffect || (b ? "dot" : "ring"), U = Math.max(i + 2, Number(t.hoverDotSize ?? (x ? a * .58 : i * 3))), K = () => (z && H === "ring" ? o : 1) * (L ? s : 1), ee = (e) => {
			if (z = e, y.classList.add("is-hover"), t.hoverClass && y.classList.add(...String(t.hoverClass).split(/\s+/).filter(Boolean)), S) {
				let r = e.getAttribute("data-kt-cursor-hover-src") || t.hoverSrc, i = S.querySelector("img");
				i && r && (i.dataset.baseSrc || (i.dataset.baseSrc = i.src), i.src = r), n === "custom" && t.hoverTemplate && (S.dataset.baseHtml ?? (S.dataset.baseHtml = S.innerHTML), S.innerHTML = t.hoverTemplate);
			}
			let r = e.getAttribute("data-kt-cursor-label") || t.hoverLabel || "";
			if (C && (C.textContent = r, C.style.opacity = r ? "1" : "0", C.style.transform = r ? "scale(1)" : "scale(.82)"), x) {
				let n = e.getAttribute("data-kt-cursor-color") || t.hoverColor || l, i = e.getAttribute("data-kt-cursor-background") || t.hoverBackground || (r ? n : u);
				if (x.style.backgroundColor = H === "dot" ? u : i, x.style.borderColor = n, x.style.boxShadow = r && H !== "dot" ? t.hoverShadow || "0 10px 30px rgba(0,0,0,.18), inset 0 0 0 1px rgba(255,255,255,.18)" : t.shadow || "0 0 0 1px rgba(255,255,255,.45),0 4px 16px rgba(0,0,0,.16)", H === "pill" && r) {
					let e = Math.max(26, Number(t.hoverDotSize ?? 38)), n = Math.max(e + 14, C.scrollWidth + 2);
					x.style.width = `${n}px`, x.style.height = `${e}px`, x.style.borderRadius = `${e / 2}px`;
				}
				C && r && (C.style.color = e.getAttribute("data-kt-cursor-label-color") || t.labelColor || fa(i));
			}
			if (b) {
				if (t.hideDotOnHover === !0) b.style.opacity = "0";
				else if (H === "dot") {
					let n = e.getAttribute("data-kt-cursor-color") || t.hoverColor || c, i = C && r ? Math.max(U + 14, C.scrollWidth + 18) : U;
					b.style.width = `${i}px`, b.style.height = `${U}px`, b.style.backgroundColor = e.getAttribute("data-kt-cursor-background") || t.hoverBackground || n, b.style.boxShadow = t.hoverShadow || "0 8px 24px rgba(0,0,0,.2),inset 0 0 0 1px rgba(255,255,255,.22)", b.style.opacity = String(t.hoverDotOpacity ?? .94), C && r && (C.style.color = e.getAttribute("data-kt-cursor-label-color") || t.labelColor || fa(b.style.backgroundColor));
				}
			}
			t.onEnter?.(e, y);
		}, q = () => {
			let e = z;
			if (z = null, y.classList.remove("is-hover"), t.hoverClass && y.classList.remove(...String(t.hoverClass).split(/\s+/).filter(Boolean)), S) {
				let e = S.querySelector("img");
				e && e.dataset.baseSrc && (e.src = e.dataset.baseSrc), n === "custom" && S.dataset.baseHtml != null && (S.innerHTML = S.dataset.baseHtml);
			}
			if (C && (C.style.opacity = "0", C.style.transform = "scale(.82)", C.style.color = t.labelColor || "#fff"), x && (x.style.width = `${x.dataset.baseWidth || a}px`, x.style.height = `${x.dataset.baseHeight || a}px`, x.style.borderRadius = x.dataset.baseRadius || "50%", x.style.backgroundColor = u, x.style.borderColor = l, x.style.boxShadow = t.shadow || "none"), b) {
				b.style.opacity = "1";
				let e = b.dataset.baseSize || i;
				b.style.width = `${e}px`, b.style.height = `${e}px`, b.style.backgroundColor = t.dotColor || c, b.style.boxShadow = t.dotShadow || "0 1px 4px rgba(0,0,0,.2)";
			}
			t.onLeave?.(e, y);
		}, J = (e, t) => {
			let n = T.pool.pop() || document.createElement("span");
			n.setAttribute("aria-hidden", "true");
			let r = T.symbols[Math.floor(Math.random() * T.symbols.length)], i = Math.random() > .5 ? T.colors[0] : T.colors[1], a = T.size * (.6 + Math.random() * .9), o = Math.random() * 360, s = 8 + Math.random() * 26, c = Math.cos(o * Math.PI / 180) * s, l = Math.sin(o * Math.PI / 180) * s;
			n.textContent = r, n.style.cssText = `position:fixed;left:${e + c}px;top:${t + l}px;z-index:${p - 2};pointer-events:none;font-size:${a}px;font-weight:900;line-height:1;color:${i};text-shadow:0 0 6px currentColor;transform:translate(-50%,-50%) rotate(${o}deg) scale(1);opacity:1;transition:none;`, n.parentNode || y.appendChild(n), n.offsetWidth, n.style.transition = `opacity ${T.duration}ms cubic-bezier(.2,0,.8,1),transform ${T.duration}ms cubic-bezier(.2,0,.8,1)`, requestAnimationFrame(() => {
				n.style.opacity = "0", n.style.transform = `translate(-50%,-50%) rotate(${o + 90}deg) scale(.1)`;
			}), setTimeout(() => {
				n.parentNode && T.pool.push(n);
			}, T.duration + 60);
		}, Y = (e) => g ? B : !e.target?.closest?.("[data-kt-cursor-scope]"), X = (t) => {
			j = t.clientX, M = t.clientY, g && (B = !(!t.target || typeof t.target.closest != "function" || t.target.closest("[data-kt-cursor-scope]") !== e && !e.contains(t.target)));
			let r = Y(t) && ua(t) && !t.target?.closest?.(h);
			if (r !== I && V(r), b && (b.style.transform = `translate3d(${j}px,${M}px,0) translate(-50%,-50%)`), S && (S.dataset.crosshairFull ? (S.children[0].style.transform = `translateY(${M}px)`, S.children[1].style.transform = `translateX(${j}px)`) : S.style.transform = `translate3d(${j}px,${M}px,0)`), n === "sparkle" && I) {
				let e = performance.now();
				e - T.last >= T.throttle && (T.last = e, J(j, M));
			}
		}, te = (t) => {
			if (g && !e.contains(t.target)) return;
			let n = t.target.closest?.(m);
			n && n !== z ? ee(n) : !n && z && q();
		}, ne = (e) => {
			z && !z.contains(e.relatedTarget) && q(), e.relatedTarget || V(!1);
		}, re = (e) => {
			L = !0, y.classList.add("is-pressed"), I && (t.clickSprite || t.clickImage) && A.spawn(e.clientX, e.clientY);
		}, ie = () => {
			L = !1, y.classList.remove("is-pressed");
		}, ae = (e) => {
			e.relatedTarget || V(!1);
		}, oe = () => {
			B = !1, V(!1), z && q();
		}, se = 0, ce = (e, t) => 1 - (1 - e) ** Math.min(4, Math.max(.25, t / 16.667)), le = (e = performance.now()) => {
			if (!F) return;
			let t = se ? e - se : 16.667;
			se = e;
			let i = ce(r, t);
			if (N = W(N, j, i), P = W(P, M, i), x && (x.style.transform = `translate3d(${N}px,${P}px,0) translate(-50%,-50%) scale(${K()})`), n === "text" && S && !S.dataset.crosshairFull && (S.style.transform = `translate3d(${N}px,${P}px,0) scale(${L ? s : 1})`), n === "trail") {
				let e = j, n = M, r = ce(w.spring || .2, t);
				w.nodes.forEach((t, i) => {
					w.xs[i] = W(w.xs[i], e, r), w.ys[i] = W(w.ys[i], n, r);
					let a = Number(t.dataset.half || 0);
					t.style.transform = `translate3d(${w.xs[i] - a}px,${w.ys[i] - a}px,0)`, e = w.xs[i], n = w.ys[i];
				});
			} else if (n === "snake") {
				let e = j, n = M, r = ce(w.spring || .35, t), i = w.gap || 11, a = w.minScale ?? .42, o = ce(w.scaleEase ?? .08, t);
				w.nodes.forEach((t, s) => {
					w.xs[s] = W(w.xs[s], e, r), w.ys[s] = W(w.ys[s], n, r);
					let c = Math.hypot(e - w.xs[s], n - w.ys[s]), l = G(a + (1 - a) * Math.sqrt(Math.min(1, c / i)), a, 1);
					w.scales[s] = W(w.scales[s] ?? 1, l, o), t.style.transform = `translate3d(${w.xs[s]}px,${w.ys[s]}px,0) scale(${w.scales[s].toFixed(3)})`, e = w.xs[s], n = w.ys[s];
				});
			} else if (n === "orbit") {
				let e = (z ? w.orbitHoverRadius : w.orbitRadius) * (L ? s : 1);
				w.orbitCur = W(w.orbitCur, e, ce(L ? .28 : .12, t)), w.squashCur = W(w.squashCur, z ? 1 : w.squash, ce(.12, t)), w.angles = w.angles.map((e) => e + w.orbitSpeed * t / 16.667), w.nodes.forEach((e, t) => {
					let n = N + w.orbitCur * Math.cos(w.angles[t]), r = P + w.orbitCur * Math.sin(w.angles[t]) * w.squashCur;
					e.style.transform = `translate3d(${Math.round(n)}px,${Math.round(r)}px,0)`;
				});
			}
			R = requestAnimationFrame(le);
		};
		return window.addEventListener("pointermove", X, { passive: !0 }), document.addEventListener("pointerover", te), document.addEventListener("pointerout", ne), document.addEventListener("pointerdown", re, { passive: !0 }), document.addEventListener("pointerup", ie, { passive: !0 }), window.addEventListener("mouseout", ae), g && e.addEventListener("pointerleave", oe), R = requestAnimationFrame(le), {
			el: e,
			type: "cursor",
			cursor: y,
			setLabel(e = "") {
				C && (C.textContent = e, C.style.opacity = e ? "1" : "0");
			},
			show() {
				y.hidden = !1, V(!0);
			},
			hide() {
				V(!1);
			},
			pause() {
				F = !1, R != null && cancelAnimationFrame(R), y.hidden = !0;
			},
			resume() {
				F || (F = !0, se = 0, y.hidden = !1, R = requestAnimationFrame(le));
			},
			destroy() {
				F = !1, R != null && cancelAnimationFrame(R), window.removeEventListener("pointermove", X), document.removeEventListener("pointerover", te), document.removeEventListener("pointerout", ne), document.removeEventListener("pointerdown", re), document.removeEventListener("pointerup", ie), window.removeEventListener("mouseout", ae), g && (e.removeEventListener("pointerleave", oe), e.classList.remove("kt-cursor-scope"), e.removeAttribute("data-kt-cursor-scope")), A.destroy(), y.remove(), !g && !document.querySelector(".kt-cursor") && (_.classList.remove("kt-cursor-active"), _.style.cursor = v);
			}
		};
	},
	_clickEffectsOnly(e, t) {
		let n = Number(t.zIndex ?? 2147483e3), r = e === document.body || e === document.documentElement ? document : e, i = ca(la(t), document.body, n), a = (e) => i.spawn(e.clientX, e.clientY);
		return r.addEventListener("pointerdown", a, { passive: !0 }), {
			el: e,
			type: "cursor",
			pause() {},
			resume() {},
			destroy() {
				r.removeEventListener("pointerdown", a), i.destroy();
			}
		};
	},
	reduced() {},
	fallback() {
		return null;
	}
}, ma = {
	create(e, t) {
		let n = ie();
		if (!n) return null;
		let r = t.baseColor || "rgba(255,255,255,.15)", i = t.fillColor || "currentColor", a = e.innerHTML, o = se(e, ["aria-label"]), s = e.textContent || "";
		e.setAttribute("aria-label", s), e.innerHTML = "";
		let c = he(s).map((t) => {
			if (/^\s$/.test(t)) return e.appendChild(document.createTextNode(t)), null;
			let n = document.createElement("span");
			return n.setAttribute("aria-hidden", "true"), n.textContent = t, n.style.cssText = `display:inline-block;padding:0 .06em;margin:0 -.06em;background-image:linear-gradient(to right,${i} 50%,${r} 50%);background-size:200% 100%;background-position:100% 0;-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;color:transparent;`, e.appendChild(n), n;
		}).filter(Boolean), l = (e) => {
			let t = G(e, 0, 1) * c.length;
			c.forEach((e, n) => {
				let r = G(t - n, 0, 1);
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
function ha(e, t) {
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
var ga = {
	create(e, t = {}) {
		let n = re(), r = ie(), i = t.mode || t.type || t.preset || "vertical", a = Array.from(e.children);
		if (!a.length) return null;
		let o = e.getAttribute("style"), s = a.map((e) => e.getAttribute("style")), c = [], l = null, u = !1;
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
			let i = Math.max(0, Number(t.gap ?? 24)), o = t.panelWidth || "100%";
			if (n && r) {
				e.style.display = "flex", e.style.flexWrap = "nowrap", e.style.gap = `${i}px`, e.style.overflow = "hidden", e.style.width = "100%", a.forEach((e) => {
					e.style.flex = `0 0 ${o}`;
				});
				let r = () => Math.max(0, e.scrollWidth - e.clientWidth), s = n.to(e, {
					"--kt-horizontal-progress": 1,
					ease: "none",
					scrollTrigger: {
						trigger: e,
						pin: t.pin !== !1,
						pinSpacing: t.pinSpacing !== !1,
						scrub: Number(t.scrub ?? 1),
						start: t.start || ((t.align || "center") === "center" ? "center center" : "top top"),
						end: () => t.end || `+=${Math.max(window.innerWidth, r())}`,
						invalidateOnRefresh: !0,
						snap: t.snap === !0 && 1 / Math.max(1, a.length - 1),
						onUpdate: (n) => {
							let i = -r() * n.progress;
							a.forEach((e) => {
								e.style.transform = `translate3d(${i}px,0,0)`;
							}), t.onProgress?.(n.progress, e);
						}
					}
				});
				c.push(s);
			} else {
				let n = document.createElement("div"), r = document.createElement("div");
				n.className = "kt-sticky-horizontal-viewport", r.className = "kt-sticky-horizontal-track", n.style.cssText = "position:sticky;top:15svh;width:100%;max-width:100%;min-width:0;height:70svh;overflow:hidden;box-sizing:border-box;", r.style.cssText = `display:flex;align-items:stretch;gap:${i}px;width:max-content;min-width:max-content;height:100%;will-change:transform;`, a.forEach((e) => {
					e.style.flex = `0 0 ${o}`, r.appendChild(e);
				}), n.appendChild(r), e.appendChild(n), e.style.position = "relative", e.style.width = "100%", e.style.maxWidth = "100%", e.style.minWidth = "0", e.style.height = "auto", e.style.overflow = "visible";
				let s = 0, c = 0, d = () => {
					if (c = 0, u) return;
					let i = e.getBoundingClientRect(), a = Number.parseFloat(getComputedStyle(n).top) || 0, o = Math.max(1, e.offsetHeight - n.offsetHeight), l = Math.min(1, Math.max(0, (a - i.top) / o));
					r.style.transform = `translate3d(${-s * l}px,0,0)`, e.style.setProperty("--kt-horizontal-progress", String(l)), t.onProgress?.(l, e);
				}, f = () => {
					c ||= requestAnimationFrame(d);
				}, p = () => {
					o === "100%" && a.forEach((e) => {
						e.style.flexBasis = `${n.clientWidth}px`;
					}), s = Math.max(0, r.scrollWidth - n.clientWidth), e.style.minHeight = `calc(70svh + ${s}px)`, f();
				};
				window.addEventListener("scroll", f, { passive: !0 }), window.addEventListener("resize", p, { passive: !0 });
				let m = typeof ResizeObserver < "u" ? new ResizeObserver(p) : null;
				m?.observe(r), p(), l = () => {
					c && cancelAnimationFrame(c), window.removeEventListener("scroll", f), window.removeEventListener("resize", p), m?.disconnect(), a.forEach((t) => e.insertBefore(t, n)), n.remove();
				};
			}
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
			let i = t.effect || "fade-up", o = Math.min(.9, Math.max(0, Number(t.overlap ?? .25))), s = Math.max(.1, Number(t.itemDuration ?? 1));
			if (e.style.width = "100%", e.style.maxWidth = "100%", e.style.minWidth = "0", e.style.boxSizing = "border-box", n && r) {
				e.style.position = "relative", e.style.minHeight = t.minHeight || "70vh", e.style.perspective = `${Number(t.perspective ?? 1200)}px`, a.forEach((e, t) => {
					e.style.position = "absolute", e.style.inset = "0", e.style.display = "flex", e.style.alignItems = "center", e.style.justifyContent = "center", e.style.zIndex = String(t + 1), e.style.transformStyle = "preserve-3d";
				});
				let r = n.timeline({ scrollTrigger: {
					trigger: e,
					pin: t.pin !== !1,
					pinSpacing: t.pinSpacing !== !1,
					scrub: Number(t.scrub ?? 1),
					start: t.start || ((t.align || "center") === "center" ? "center center" : "top top"),
					end: t.end || `+=${Math.max(1, a.length) * Number(t.scrollLength ?? 80)}%`,
					anticipatePin: 1
				} });
				a.forEach((e, n) => {
					let c = n * s * (1 - o);
					r.fromTo(e, ha(i, t), {
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
					}, c), n < a.length - 1 && r.to(e, {
						autoAlpha: Number(t.previousOpacity ?? .18),
						scale: Number(t.previousScale ?? .88),
						y: Number(t.previousY ?? -40),
						filter: t.fadePrevious === !1 ? "blur(0px)" : `blur(${Number(t.previousBlur ?? 8)}px)`,
						duration: s,
						ease: t.ease || "power2.inOut"
					}, c + s * (1 - o));
				}), c.push(r);
			} else {
				let n = t.minHeight || "70svh", r = Math.max(20, Number(t.scrollLength ?? 80)), o = Number(t.distance ?? 80), s = Number(t.previousOpacity ?? .18), c = Number(t.previousScale ?? .88), d = Number(t.previousY ?? -40), f = t.fadePrevious === !1 ? 0 : Number(t.previousBlur ?? 8), p = document.createElement("div");
				p.className = "kt-floating-viewport";
				let m = getComputedStyle(e);
				p.style.cssText = `position:sticky;top:calc((100svh - ${n}) / 2);width:100%;height:${n};overflow:hidden;border-radius:inherit;background:${m.background};color:${m.color};perspective:${Number(t.perspective ?? 1200)}px;`, a.forEach((e, t) => {
					e.style.position = "absolute", e.style.inset = "0", e.style.display = "flex", e.style.alignItems = "center", e.style.justifyContent = "center", e.style.zIndex = String(t + 1), e.style.transformStyle = "preserve-3d", p.appendChild(e);
				}), e.appendChild(p), e.style.position = "relative", e.style.height = "auto", e.style.minHeight = `calc(${n} + ${Math.max(1, a.length - 1) * r}vh)`, e.style.overflow = "visible", e.style.background = "transparent";
				let h = 0, g = () => {
					if (h = 0, u) return;
					let n = e.getBoundingClientRect(), r = Number.parseFloat(getComputedStyle(p).top) || 0, l = Math.max(1, e.offsetHeight - p.offsetHeight), m = Math.min(1, Math.max(0, (r - n.top) / l)), g = m * Math.max(1, a.length - 1);
					a.forEach((e, n) => {
						let r = n - g, a = Math.min(1, Math.max(0, r)), l = Math.min(1, Math.max(0, -r)), u = 0, p = a * o + l * d, m = 0, h = 0, _ = 0;
						i === "slide-left" && (u = -a * o, p = l * d), i === "slide-right" && (u = a * o, p = l * d), i === "rotate" && (m = a * Number(t.rotate ?? 6)), i === "depth" && (_ = -a * 240, h = a * Number(t.rotate ?? 6));
						let v = 1 - a * (1 - Number(t.scaleFrom ?? .82)) - l * (1 - c);
						e.style.opacity = String((1 - a) * (1 - l * (1 - s))), e.style.filter = `blur(${l * f + (i === "blur" ? a * Number(t.blur ?? 18) : 0)}px)`, e.style.transform = `translate3d(${u}px,${p}px,${_}px) rotate(${m}deg) rotateX(${h}deg) scale(${v})`;
					}), t.onProgress?.(m, e);
				}, _ = () => {
					h ||= requestAnimationFrame(g);
				};
				window.addEventListener("scroll", _, { passive: !0 }), window.addEventListener("resize", _, { passive: !0 }), _(), l = () => {
					h && cancelAnimationFrame(h), window.removeEventListener("scroll", _), window.removeEventListener("resize", _), a.forEach((t) => e.insertBefore(t, p)), p.remove();
				};
			}
		}
		return {
			el: e,
			type: "stickyStack",
			pause() {
				u = !0, c.forEach((e) => e.pause?.());
			},
			resume() {
				u = !1, c.forEach((e) => e.resume?.()), window.dispatchEvent(new Event("scroll"));
			},
			destroy() {
				c.forEach((e) => {
					e.scrollTrigger?.kill?.(), e.kill?.();
				}), l?.(), o == null ? e.removeAttribute("style") : e.setAttribute("style", o), a.forEach((e, t) => {
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
}, _a = {
	create(e, t = {}) {
		let n = ie();
		if (!n) return null;
		let r = t.mode || t.preset || t.effect || "skew", i = t.axis === "x" ? "x" : "y", a = t.reverse === !0 ? -1 : 1, o = Math.max(0, Number(t.maxSkew ?? 8)), s = Math.max(0, Number(t.maxBlur ?? 0)), c = Math.max(0, Number(t.distance ?? 48)), l = Math.max(0, Number(t.maxRotate ?? 4)), u = Math.max(0, Number(t.maxScale ?? .08)), d = Math.max(100, Number(t.velocityDivisor ?? 2200)), f = t.spring !== !1 && t.elastic !== !1, p = G(Number(t.smoothing ?? .16), .01, 1), m = G(Number(t.decay ?? .08), .001, 1), h = Math.max(1, Number(t.stiffness ?? 170)), g = Math.max(.1, Number(t.damping ?? 24)), _ = Math.max(.05, Number(t.mass ?? 1)), v = G(Number(t.response ?? 1), .05, 4), y = Z(e, [
			"transform",
			"filter",
			"willChange"
		]);
		e.style.willChange = s ? "transform,filter" : "transform";
		let b = 0, x = 0, S = 0, C = !0, w = !1, T = null, E = performance.now(), D = (n) => {
			let a = n * c, d = n * o, f = n * l, p = 1 + Math.abs(n) * u, m;
			m = r === "translate" ? i === "x" ? `translate3d(${a}px,0,0)` : `translate3d(0,${a}px,0)` : r === "rotate" ? `rotate(${f}deg)` : r === "scale" ? `scale(${p})` : r === "combo" ? `${i === "x" ? `translate3d(${a}px,0,0)` : `translate3d(0,${a}px,0)`} skew${i === "x" ? "Y" : "X"}(${d}deg) rotate(${f}deg) scale(${p})` : `skew${i === "x" ? "Y" : "X"}(${d}deg)`, e.style.transform = m, s && (e.style.filter = `blur(${Math.abs(n) * s}px)`), t.onUpdate?.(n, e);
		}, O = (e) => {
			if (T = null, !C) return;
			let t = Math.min(.05, Math.max(.001, (e - E) / 1e3));
			if (E = e, f) {
				let e = (-h * (x - b) + -g * S) / _;
				S += e * t, x += S * t, b = W(b, 0, m);
			} else x = W(x, b, p), b = W(b, 0, m), S = 0;
			let n = Math.abs(x) < 1e-4 && Math.abs(b) < 1e-4 && Math.abs(S) < 1e-4;
			n && (x = b = S = 0), D(x), n || k();
		}, k = () => {
			C && T == null && (T = requestAnimationFrame(O));
		}, A = n.create({
			trigger: t.global === !0 ? document.documentElement : e,
			start: t.start || (t.global === !0 ? 0 : "top bottom"),
			end: t.end || (t.global === !0 ? "max" : "bottom top"),
			onUpdate: (n) => {
				w || (T ?? (E = performance.now()), b = G(n.getVelocity() / d, -1, 1) * a * v, t.onDirection?.(n.direction, e, n), k());
			}
		});
		k();
		let j = () => {
			C = !1, T != null && cancelAnimationFrame(T), T = null;
		};
		return {
			el: e,
			type: "scrollVelocity",
			get value() {
				return x;
			},
			pause: j,
			resume() {
				!C && !w && (C = !0, E = performance.now(), k());
			},
			destroy() {
				w || (w = !0, j(), A.kill(), y());
			}
		};
	},
	reduced() {}
};
//#endregion
//#region src/modules/progress.js
function va(e) {
	let t = e.target || "page", n = null;
	return () => {
		if (t === "page") {
			let e = document.documentElement.scrollHeight - window.innerHeight;
			return e > 0 ? G(window.scrollY / e, 0, 1) : 0;
		}
		if ((!n || !n.isConnected) && (n = document.querySelector(t)), !n) return 0;
		let e = n.getBoundingClientRect();
		return G((window.innerHeight - e.top) / (window.innerHeight + e.height), 0, 1);
	};
}
function ya(e, t) {
	let [n, r] = String(e || "bottom-right").split("-");
	return `${n === "top" ? "top" : "bottom"}:${t}px;${r === "left" ? "left" : "right"}:${t}px;`;
}
var ba = {
	create(e, t) {
		if (e.hasAttribute("data-kt-slider") && /^(?:|true|false)$/i.test(e.getAttribute("data-kt-progress") || "")) return null;
		let n = t.ui || "", r = G(Number(t.smoothing ?? 0), 0, .95), i = Math.max(0, Number(t.showAfter ?? 0)), a = t.hideAtEnd === !0, o = va(t), s = !0, c = null, l = 0, u = null, d = [], f = -1, p = () => {
			if (!s) return;
			let n = o();
			if (l = r > 0 ? l + (n - l) * (1 - r) : n, u?.(l, n), t.onUpdate?.(l, e), window.scrollY === f && Math.abs(n - l) < 6e-4) {
				c = null;
				return;
			}
			f = window.scrollY, c = requestAnimationFrame(p);
		}, m = () => {
			s && c == null && (f = -1, c = requestAnimationFrame(p));
		}, h = (e, t) => {
			if (!i && !a) return;
			let n = i > 0 && window.scrollY < i || a && t >= .999;
			e.style.opacity = n ? "0" : "1", e.style.pointerEvents = n ? "none" : "";
		}, g = null, _ = null;
		if (n === "bar") {
			let n = Math.max(1, Number(t.thickness ?? 3)), r = t.attach || "fixed", i = t.position === "bottom" ? "bottom" : "top", a = Math.max(0, Number(t.radius ?? 0)), o = t.color || "var(--kt-progress-color,#ff5b1c)", s = t.color2 ? `linear-gradient(90deg,${o},${t.color2})` : o, c = document.createElement("div");
			c.className = "kt-progress-bar", c.setAttribute("aria-hidden", "true"), c.style.cssText = r === "fixed" ? `position:fixed;left:0;right:0;${i}:0;height:${n}px;z-index:${Number(t.zIndex ?? 1002)};background:${t.trackColor || "var(--kt-progress-track,transparent)"};border-radius:${a}px;transition:opacity .25s var(--kt-ease-ui, ease);` : `position:relative;width:100%;height:${n}px;background:${t.trackColor || "var(--kt-progress-track,rgba(128,128,128,.18))"};border-radius:${a}px;overflow:hidden;transition:opacity .25s var(--kt-ease-ui, ease);`;
			let l = document.createElement("div");
			l.className = "kt-progress-bar-fill", l.style.cssText = `width:100%;height:100%;background:${s};border-radius:inherit;transform:scaleX(0);transform-origin:left center;will-change:transform;`, c.appendChild(l), (r === "fixed" ? document.body : e).appendChild(c), d.push(c), u = (e, t) => {
				l.style.transform = `scaleX(${e})`, h(c, t);
			};
		} else if (n === "ring") {
			let n = Math.max(20, Number(t.size ?? 46)), r = Math.max(1, Number(t.stroke ?? 3)), i = t.attach || "fixed", a = t.showPercent === !0, o = t.clickToTop === !0, s = (n - r) / 2, c = 2 * Math.PI * s, l = t.color || "var(--kt-progress-color,#ff5b1c)", f = t.trackColor || "var(--kt-progress-track,rgba(128,128,128,.22))", p = document.createElement(o ? "button" : "div");
			p.className = "kt-progress-ring", o ? (p.type = "button", p.setAttribute("aria-label", t.label || "Scroll back to top")) : p.setAttribute("aria-hidden", "true"), p.style.cssText = `${i === "fixed" ? `position:fixed;${ya(t.position, Math.max(0, Number(t.offset ?? 18)))}z-index:${Number(t.zIndex ?? 1200)};` : "position:relative;"}width:${n}px;height:${n}px;display:inline-flex;align-items:center;justify-content:center;border:0;padding:0;background:var(--kt-progress-ring-bg,transparent);border-radius:50%;${o ? "cursor:pointer;" : ""}transition:opacity .25s var(--kt-ease-ui, ease);color:inherit;`, p.innerHTML = `<svg class="kt-progress-ring-svg" viewBox="0 0 ${n} ${n}" width="${n}" height="${n}" aria-hidden="true"><circle class="kt-progress-ring-track" cx="${n / 2}" cy="${n / 2}" r="${s}" fill="none" stroke="${f}" stroke-width="${r}"/><circle class="kt-progress-ring-fill" cx="${n / 2}" cy="${n / 2}" r="${s}" fill="none" stroke="${l}" stroke-width="${r}" stroke-linecap="round" stroke-dasharray="${c}" stroke-dashoffset="${c}"/></svg>`;
			let m = document.createElement("span");
			m.className = "kt-progress-ring-label", m.style.cssText = `position:relative;font:600 ${Math.round(n * (a ? .26 : .36))}px/1 ui-monospace,monospace;user-select:none;`, m.textContent = a ? "0%" : o ? "↑" : "", p.appendChild(m);
			let g = p.querySelector(".kt-progress-ring-fill");
			o && p.addEventListener("click", () => window.scrollTo({
				top: 0,
				behavior: "smooth"
			})), (i === "fixed" ? document.body : e).appendChild(p), d.push(p), u = (e, t) => {
				g.setAttribute("stroke-dashoffset", String(c * (1 - e))), a && (m.textContent = `${Math.round(e * 100)}%`), h(p, t);
			};
		} else {
			let n = t.property || "scaleX";
			n.startsWith("--") ? (g = () => e.style.removeProperty(n), u = (t) => {
				e.style.setProperty(n, t.toFixed(4));
			}) : (g = Z(e, [
				"transform",
				"transformOrigin",
				"width",
				"willChange"
			]), _ = se(e, ["aria-hidden"]), e.style.transformOrigin = "left center", e.style.willChange = n === "scaleX" ? "transform" : "width", e.setAttribute("aria-hidden", "true"), u = (t) => {
				n === "scaleX" ? e.style.transform = `scaleX(${t})` : e.style.width = `${t * 100}%`;
			});
		}
		return c = requestAnimationFrame(p), window.addEventListener("scroll", m, { passive: !0 }), window.addEventListener("resize", m, { passive: !0 }), {
			el: e,
			type: "progress",
			pause: () => {
				s = !1, c != null && cancelAnimationFrame(c), c = null;
			},
			resume: () => {
				s || (s = !0, m());
			},
			destroy: () => {
				s = !1, c != null && cancelAnimationFrame(c), window.removeEventListener("scroll", m), window.removeEventListener("resize", m), d.forEach((e) => e.remove()), _?.(), g?.();
			}
		};
	},
	reduced(e, t = {}) {
		return this.create(e, {
			...t,
			smoothing: 0
		});
	}
}, xa = (e, t, n = [], r = []) => {
	let i = e.hasAttribute("style"), a = e.hasAttribute("class"), o = se(e, r), s = t.map((t) => [
		t,
		e.style.getPropertyValue(t),
		e.style.getPropertyPriority(t)
	]), c = n.map((t) => [t, e.classList.contains(t)]);
	return () => {
		o(), s.forEach((t) => e.style.setProperty(...t)), c.forEach((t) => e.classList.toggle(...t)), !i && !e.style.length && e.removeAttribute("style"), !a && !e.classList.length && e.removeAttribute("class");
	};
}, Sa = (e, t) => {
	let n = t.flatMap((e) => e.matches("img") ? [e] : [...e.querySelectorAll("img")]).map((e) => {
		let t = Z(e, ["userSelect", "webkitUserDrag"]), n = xa(e, ["user-select", "-webkit-user-drag"], [], ["draggable"]);
		return e.draggable = !1, e.style.userSelect = "none", e.style.webkitUserDrag = "none", () => {
			t(), n();
		};
	}), r = (e) => {
		t.some((t) => t.contains(e.target)) && e.preventDefault();
	};
	return e.addEventListener("dragstart", r, !0), () => {
		e.removeEventListener("dragstart", r, !0), n.forEach((e) => e());
	};
}, Ca = {
	create(e, t = {}) {
		let n = ee({
			dot: "Go to slide {n}",
			slide: "{n} of {total}",
			pause: "Pause carousel autoplay",
			resume: "Resume carousel autoplay",
			carouselRole: "carousel",
			slideRole: "slide"
		}, t.labels);
		if ((t.effect || t.preset) === "radial") {
			let r = V().reducedMotion, i = (() => {
				let t = Array.from(e.querySelectorAll(":scope > .kt-radial-item"));
				return t.length ? t : Array.from(e.children).filter((e) => e.nodeType === 1 && !e.matches(".kt-radial-controls, button"));
			})();
			if (i.length < 2) return null;
			let a = t.position === "center", o = Math.max(40, Number(t.radius ?? 260)), s = Math.max(0, ...i.map((e) => Math.max(e.offsetWidth, e.offsetHeight))), c = Math.min(e.clientWidth, e.clientHeight), l = c > s ? Math.max(40, (c - s - 16) / 2) : o, u = a ? Math.min(o, l) : o, d = a ? 360 / i.length : Number(t.step ?? 26), f = [
				"bottom",
				"top",
				"left",
				"right",
				"center"
			].includes(t.position) ? t.position : "bottom", p = {
				bottom: -90,
				top: 90,
				left: 0,
				right: 180,
				center: -90
			}[f], m = t.activeAngle == null ? p : Number(t.activeAngle), h = Math.max(0, Number(t.duration ?? .6)), g = t.smoothing == null ? 0 : G(t.smoothing, .02, .5), _ = t.spring === !0, v = G(Number(t.stiffness ?? 170), 20, 400), y = G(Number(t.damping ?? 24), 1, 80), b = G(Number(t.mass ?? 1), .1, 4), x = t.loop !== !1 && t.loop !== "off", S = t.drag !== !1, C = t.controls !== !1, w = t.pauseWhenOffscreen !== !1, T = xa(e, ["touch-action", "--kt-radial-radius"], ["kt-radial", `kt-radial--${f}`], [
				"role",
				"aria-roledescription",
				"tabindex"
			]), E = (t.activeClass || "").trim(), D = i.map((e) => ({
				item: e,
				next: e.nextSibling,
				restore: xa(e, [
					"transform",
					"transition",
					"opacity",
					"z-index",
					"cursor"
				], [
					"kt-radial-item",
					"kt-active",
					"active-item",
					E
				].filter(Boolean), ["aria-current", "tabindex"])
			})), O = Sa(e, i);
			e.classList.add("kt-radial", `kt-radial--${f}`), e.style.setProperty("--kt-radial-radius", `${u}px`), e.style.touchAction = f === "bottom" || f === "top" ? "pan-y" : "pan-x", e.setAttribute("role", "group"), e.setAttribute("aria-roledescription", n("carouselRole"));
			let k = document.createElement("div");
			if (k.className = "kt-radial-hub", e.appendChild(k), i.forEach((e) => {
				e.classList.add("kt-radial-item"), k.appendChild(e);
			}), a) k.style.left = "50%", k.style.top = "50%";
			else if (t.align === "center") {
				let e = m * Math.PI / 180;
				k.style.left = `calc(50% - ${(Math.cos(e) * u).toFixed(1)}px)`, k.style.top = `calc(50% - ${(Math.sin(e) * u).toFixed(1)}px)`;
			}
			let A = Number(t.initialIndex ?? t.index), j = Number.isFinite(A) ? G(Math.round(A), 0, i.length - 1) : Math.floor(i.length / 2), M = document.createElement("div");
			M.className = "kt-radial-live", M.setAttribute("aria-live", "polite"), M.style.cssText = "position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);", e.appendChild(M);
			let N = i.length, P = j, F = j, I = null, L = 0, R = -16, z = !1, B = null, H = (e) => {
				i.forEach((t, n) => {
					let r = n - e;
					x && (r = (r % N + N) % N, r > N / 2 && (r -= N));
					let i = m + r * d;
					t.style.transition = "none", t.style.transform = `rotate(${i}deg) translate(${u}px) rotate(${-i}deg) translate(-50%, -50%)`, t.style.opacity = a ? "1" : String(Math.max(0, 1 - Math.max(0, Math.abs(r) - 1)));
					let o = n === j;
					t.classList.toggle("kt-active", o), t.classList.toggle("active-item", o), E && t.classList.toggle(E, o), o ? t.setAttribute("aria-current", "true") : t.removeAttribute("aria-current"), t.style.zIndex = String(100 - Math.abs(r));
				}), M.textContent = `${j + 1} / ${i.length}`;
			}, U = (e) => {
				let t = j, n = x ? (e % i.length + i.length) % i.length : G(e, 0, i.length - 1), a = n - t;
				if (x && (a > N / 2 ? a -= N : a < -N / 2 && (a += N)), j = n, F += a, I && cancelAnimationFrame(I), z) {
					P = F, L = 0, H(P);
					return;
				}
				if (r || h === 0) {
					P = F, L = 0, H(P);
					return;
				}
				let o = P, s = performance.now();
				R = s - 16;
				let c = (e) => {
					let t = Math.min(64, Math.max(0, e - R));
					if (R = e, _) {
						let e = t / 1e3, n = ((F - P) * v - L * y) / b;
						L += n * e, P += L * e;
					} else if (g) P = W(P, F, g);
					else {
						let t = 1 - (1 - Math.min(1, (e - s) / (h * 1e3))) ** 3;
						P = o + (F - o) * t;
					}
					H(P), (_ ? Math.abs(P - F) <= .0015 && Math.abs(L) <= .0015 : g ? Math.abs(P - F) <= .0015 : e - s >= h * 1e3) ? (P = F, L = 0, H(P), I = null) : I = requestAnimationFrame(c);
				};
				I = requestAnimationFrame(c);
			}, K = () => U(j + 1), ee = () => U(j - 1);
			i.forEach((e) => {
				e.style.cursor = "pointer", e.hasAttribute("tabindex") || (e.tabIndex = -1);
			});
			let q = !1, J = null, Y = (e) => {
				if (q) {
					q = !1, J != null && clearTimeout(J), J = null, e.preventDefault();
					return;
				}
				let t = e.target.closest(".kt-radial-item"), n = i.indexOf(t);
				n >= 0 && U(n);
			};
			k.addEventListener("click", Y);
			let X = e.querySelector(".kt-radial-controls"), te = null, ne = null, re = !1;
			C && (X || (X = document.createElement("div"), X.className = "kt-radial-controls", X.innerHTML = "<button type=\"button\" class=\"kt-radial-prev\" aria-label=\"Previous\"></button><button type=\"button\" class=\"kt-radial-next\" aria-label=\"Next\"></button>", e.appendChild(X), re = !0), te = X.querySelector(".kt-radial-prev, [data-kt-radial-prev]"), ne = X.querySelector(".kt-radial-next, [data-kt-radial-next]"), te?.addEventListener("click", ee), ne?.addEventListener("click", K));
			let ie = (e) => {
				e.key === "ArrowRight" || e.key === "ArrowDown" ? (e.preventDefault(), K()) : (e.key === "ArrowLeft" || e.key === "ArrowUp") && (e.preventDefault(), ee());
			};
			e.hasAttribute("tabindex") || (e.tabIndex = 0), e.addEventListener("keydown", ie);
			let ae = null, oe = f === "bottom" || f === "top", se = (e) => {
				S && !e.target.closest(".kt-radial-controls, button") && (e.pointerType !== "mouse" || e.button === 0) && (ae = {
					x: e.clientX,
					y: e.clientY,
					start: j,
					pointerId: e.pointerId,
					moved: !1,
					captured: !1,
					lastIndex: j
				});
			}, ce = (t) => {
				if (!ae || t.pointerId !== ae.pointerId) return;
				let n = oe ? t.clientX - ae.x : t.clientY - ae.y;
				if (Math.abs(n) <= 6) return;
				ae.captured || (e.setPointerCapture?.(t.pointerId), ae.captured = !0), ae.moved = !0;
				let r = ae.start + Math.round(-n / 60);
				r !== ae.lastIndex && (ae.lastIndex = r, U(r));
			}, le = (t) => {
				ae && t.pointerId === ae.pointerId && (ae.captured && e.releasePointerCapture?.(t.pointerId), ae.moved && (q = !0, J != null && clearTimeout(J), J = setTimeout(() => {
					q = !1, J = null;
				}, 2e3)), ae = null);
			}, Z = (e) => {
				ae?.moved && e.preventDefault();
			};
			S && (e.addEventListener("pointerdown", se), e.addEventListener("pointermove", ce), e.addEventListener("pointerup", le), e.addEventListener("pointercancel", le), e.addEventListener("touchmove", Z, { passive: !1 }));
			let ue = Math.max(0, Number(t.autoplay ?? 0)), de = null, Q = () => {
				ue && !r && !z && (fe(), de = setInterval(K, ue));
			}, fe = () => {
				de &&= (clearInterval(de), null);
			};
			return ue && (e.addEventListener("mouseenter", fe), e.addEventListener("mouseleave", Q), Q()), H(P), w && typeof IntersectionObserver < "u" && (B = new IntersectionObserver(([e]) => {
				let t = !!(e?.isIntersecting && (e.intersectionRatio == null || e.intersectionRatio > 0));
				t !== !z && (z = !t, z ? (fe(), I &&= (cancelAnimationFrame(I), null)) : (Math.abs(P - F) > .0015 && (P = F, H(P)), Q()));
			}, { threshold: .01 }), B.observe(e)), {
				el: e,
				type: "slider",
				effect: "radial",
				get index() {
					return j;
				},
				next: K,
				prev: ee,
				go: U,
				pause: fe,
				resume: Q,
				destroy() {
					fe(), B?.disconnect(), I && cancelAnimationFrame(I), J != null && clearTimeout(J), k.removeEventListener("click", Y), e.removeEventListener("keydown", ie), e.removeEventListener("pointerdown", se), e.removeEventListener("pointermove", ce), e.removeEventListener("pointerup", le), e.removeEventListener("pointercancel", le), e.removeEventListener("touchmove", Z), e.removeEventListener("mouseenter", fe), e.removeEventListener("mouseleave", Q), te?.removeEventListener("click", ee), ne?.removeEventListener("click", K), [...D].reverse().forEach(({ item: t, next: n, restore: r }) => {
						e.insertBefore(t, n?.parentNode === e ? n : null), r();
					}), O(), k.remove(), M.remove(), re && X.remove(), T();
				}
			};
		}
		let r = e.querySelector(".kt-slider-wrap") || e, i = r.querySelector(".kt-slider-track") || e.firstElementChild;
		if (!i) return null;
		let a = Array.from(i.children);
		if (!a.length) return null;
		let o = V().reducedMotion, s = (t, n) => {
			let r = e.ownerDocument?.defaultView?.CustomEvent || globalThis.CustomEvent;
			r && e.dispatchEvent(new r(t, { detail: n }));
		}, c = String(t.effect || t.preset || "slide").toLowerCase(), l = c === "coverflow", u = c === "fade", d = c === "dissolve", f = c === "wipe", p = c === "flip", m = c === "cube", h = c === "cards", g = c === "creative", _ = u || d || f || p || m || h || g, v = l && t.activeShadow === !0, y = G(Number(t.activeShadowOpacity ?? .28), 0, 1), b = Math.max(0, Number(t.gap ?? (l ? 22 : 0))), x = (() => {
			let e = t.breakpoints;
			if (typeof e == "string") try {
				e = JSON.parse(e);
			} catch {
				e = null;
			}
			if (!e || typeof e != "object") return null;
			let n = typeof window < "u" ? window.innerWidth : 0, r = null, i = -1;
			Object.entries(e).forEach(([e, t]) => {
				let a = Number(e);
				Number.isFinite(a) && n >= a && a > i && (i = a, r = t);
			});
			let a = Number(r?.perView ?? r?.slidesPerView);
			return Number.isFinite(a) ? a : null;
		})(), S = _ ? 1 : G(Number(x ?? t.perView ?? (l ? 1.35 : 1)), 1, a.length), C = Math.max(1, Math.round(Number(t.perGroup ?? 1))), w = l || (t.align || "center") !== "left", T = w ? a.length - 1 : Math.max(0, Math.ceil(a.length - S)), E = t.loop === !0 ? "infinite" : t.loop || "off", D = E === "infinite", O = G(Number(t.smoothing ?? .14 / Math.max(.2, Number(t.speed ?? t.duration ?? .55) / .55)), .02, .5), k = t.spring === !0, A = G(Number(t.stiffness ?? 170), 20, 400), j = G(Number(t.damping ?? 24), 1, 80), M = G(Number(t.mass ?? 1), .1, 4), N = G(Number(t.velocityInfluence ?? .35), 0, 1.2), P = t.momentum !== !1, F = t.bounce === !0, I = t.stickySnap === !0, L = t.autoplay === !0 ? 3e3 : Math.max(0, Number(t.autoplay || 0)), R = t.pauseOnHover === !0, z = t.pauseWhenOffscreen !== !1, B = Number(t.rotate ?? 32), H = Number(t.depth ?? 140), U = Number(t.scaleStep ?? .12), K = G(Number(t.minScale ?? .8), .2, 1), q = Number(t.opacityStep ?? .32), J = G(Number(t.minOpacity ?? .25), 0, 1), Y = t.axis === "y", X = G(Number(t.effectIntensity ?? 1), 0, 3), te = String(t.effectDirection || (Y ? "up" : "left")).toLowerCase(), ne = t.drag !== !1, re = t.touch !== !1, ie = t.keyboard !== !1, ae = !1, oe = !1;
		c === "slide" && (ae = t.scrollSnap === !0, oe = ae && E === "off" && !Y && S === 1 && b === 0 && t.autoHeight !== !0 && re);
		let ce = xa(e, [t.grabCursor === !0 && "cursor", v && "--kt-slide-active-shadow-opacity"].filter(Boolean), [`kt-slider--${c}`, "kt-slider--active-shadow"], [
			"data-kt-slider-index",
			"data-kt-slider-effect",
			"data-kt-slider-scroll-snap"
		]), le = xa(r, [
			"overflow",
			"overflow-x",
			"overflow-y",
			"overflow-clip-margin",
			"touch-action",
			"position",
			"perspective",
			"scroll-snap-type",
			"scroll-behavior",
			"overscroll-behavior-x",
			"height",
			"transition"
		], [], [
			"role",
			"aria-roledescription",
			"aria-label",
			"tabindex",
			"aria-disabled"
		]), Z = se(i, ["style"]), ue = a.map((e) => se(e, [
			"class",
			"style",
			"role",
			"aria-roledescription",
			"aria-hidden",
			"aria-label"
		])), de = Sa(r, a), Q = G(Math.round(Number(t.initial ?? 0)), 0, T), fe = Q, pe = Q, me = 0, he = !1, ge = !1, _e = Q, ve = !1, ye = 0, be = 0, xe = 0, Se = 0, Ce = 0, we = 0, Te = 0, Ee = null, De = null, Oe = -16, ke = null, Ae = 0, je = L, Me = !1, Ne = !1, Pe = null, Fe = !1, Ie = !0, Le = null, Re = t.enabled !== !1, ze = () => {};
		r.setAttribute("role", "region"), r.setAttribute("aria-roledescription", n("carouselRole")), r.setAttribute("aria-label", t.label || "Carousel"), r.hasAttribute("tabindex") || (r.tabIndex = 0), v ? (r.style.overflow = "clip", r.style.overflowClipMargin = "var(--kt-slide-active-shadow-room, 56px)") : (r.style.overflow = "hidden", r.style.removeProperty("overflow-clip-margin")), r.style.touchAction = Y ? "pan-x" : "pan-y", r.style.position = "relative", oe && (r.style.overflowX = "auto", r.style.overflowY = "hidden", r.style.scrollSnapType = "x mandatory", r.style.scrollBehavior = o ? "auto" : "smooth", r.style.touchAction = "pan-x pan-y", r.style.overscrollBehaviorX = "contain"), (l || p || m || h || g) && (r.style.perspective = `${Number(t.perspective ?? 1100)}px`), e.dataset.ktSliderEffect = c, ae && (e.dataset.ktSliderScrollSnap = oe ? "native" : "fallback"), e.classList.add(`kt-slider--${c}`), e.classList.toggle("kt-slider--active-shadow", v), v && e.style.setProperty("--kt-slide-active-shadow-opacity", `${Number((y * 100).toFixed(2))}%`), i.style.display = oe ? "flex" : "block", i.style.position = "relative", i.style.width = "100%", i.style.transformStyle = l ? "preserve-3d" : "flat", oe && (i.style.flexWrap = "nowrap");
		let Be = 100 / S;
		a.forEach((e, r) => {
			oe ? (e.style.position = "relative", e.style.top = "", e.style.left = "", e.style.width = "100%", e.style.minWidth = "100%", e.style.flex = "0 0 100%", e.style.height = "100%", e.style.scrollSnapAlign = "start") : (e.style.position = r === 0 ? "relative" : "absolute", e.style.top = "0", e.style.left = "0"), !oe && Y ? (e.style.width = "100%", e.style.height = `calc(${Be}% - ${b * (S - 1) / S}px)`) : oe || (e.style.width = `calc(${Be}% - ${b * (S - 1) / S}px)`, e.style.minWidth = "0", r !== 0 && t.autoHeight !== !0 && (e.style.height = "100%")), e.style.transformOrigin = "50% 50%", e.style.willChange = oe ? "auto" : v ? "transform,opacity,filter" : "transform,opacity", e.style.transition = "none", oe && (e.style.transform = "none"), e.setAttribute("role", "group"), e.setAttribute("aria-roledescription", n("slideRole")), e.setAttribute("aria-label", n("slide", {
				n: r + 1,
				total: a.length
			}));
		});
		let Ve = () => {
			let e = r.getBoundingClientRect(), t = (Y ? e.height : e.width) || 1, n = (Y ? a[0].offsetHeight : a[0].offsetWidth) || t / S;
			return {
				width: t,
				slideWidth: n,
				step: n + b
			};
		}, He = () => {
			if (oe) {
				a.forEach((e) => {
					e.style.transform = "none", e.style.opacity = "1", e.style.filter = "", e.style.clipPath = "", e.style.backfaceVisibility = "", e.style.zIndex = "", e.style.pointerEvents = "", e.style.setProperty("--kt-slider-slide-distance", "0"), e.style.setProperty("--kt-slider-slide-progress", "1"), e.style.setProperty("--kt-slider-transition-mix", "0");
				});
				return;
			}
			if (_) {
				a.forEach((e, t) => {
					let n = D ? Xe(t - fe) : t - fe, r = Math.abs(n), i = G(1 - r, 0, 1), a = G(1 - Math.abs(i * 2 - 1), 0, 1);
					if (e.style.setProperty("--kt-slider-slide-distance", String(n)), e.style.setProperty("--kt-slider-slide-progress", String(i)), e.style.setProperty("--kt-slider-transition-mix", String(a)), e.style.filter = "", e.style.clipPath = "", e.style.backfaceVisibility = "", u) e.style.transform = "translate3d(0,0,0)", e.style.opacity = String(i);
					else if (d) {
						let t = r * 14 * X, n = 1 + r * .045 * X;
						e.style.transform = `translate3d(0,0,0) scale(${n})`, e.style.filter = `blur(${t}px) saturate(${Math.max(.72, 1 - r * .18)})`, e.style.opacity = String(i ** .78);
					} else if (f) {
						let t = (1 - i) * 100, a = Math.sign(pe - fe) || 1, o = Math.sign(n) === a, s = {
							left: `inset(0 ${t}% 0 0)`,
							right: `inset(0 0 0 ${t}%)`,
							up: `inset(0 0 ${t}% 0)`,
							down: `inset(${t}% 0 0 0)`
						};
						e.style.transform = "translate3d(0,0,0)", e.style.clipPath = o ? s[te] || s.left : "inset(0)", e.style.opacity = r < 1 ? "1" : "0";
					} else if (p) {
						let t = G(n * -180 * X, -180, 180);
						e.style.transform = `translate3d(0,0,${-r * 40}px) rotate${Y ? "X" : "Y"}(${t}deg)`, e.style.backfaceVisibility = "hidden", e.style.opacity = String(i);
					} else if (m) {
						let t = G(n * -90 * X, -100, 100), a = n * 50;
						e.style.transformOrigin = Y ? n > 0 ? "50% 100%" : "50% 0%" : n > 0 ? "100% 50%" : "0% 50%", e.style.transform = Y ? `translate3d(0,${a}%,${-r * 80}px) rotateX(${t}deg)` : `translate3d(${a}%,0,${-r * 80}px) rotateY(${t}deg)`, e.style.backfaceVisibility = "hidden", e.style.opacity = String(i);
					} else if (h) {
						let t = n * 7 * X, i = r * 8 * X, a = n * 4 * X, o = Math.max(.82, 1 - r * .055 * X);
						e.style.transform = `translate3d(${t}%,${i}px,${-r * 70}px) rotateZ(${a}deg) scale(${o})`, e.style.opacity = String(Math.max(0, 1 - r * .45));
					} else {
						let t = n * 34 * X, a = n * -7 * X, o = n * -5 * X, s = Math.max(.78, 1 - r * .12 * X);
						e.style.transform = `translate3d(${t}%,${a}%,${-r * 150}px) rotateZ(${o}deg) scale(${s})`, e.style.filter = `blur(${r * 4 * X}px)`, e.style.opacity = String(i);
					}
					e.style.zIndex = String(f && Math.sign(n) === (Math.sign(pe - fe) || 1) ? 3 : r < .5 ? 2 : 1), e.style.pointerEvents = r < .5 ? "" : "none";
				});
				return;
			}
			let { width: e, slideWidth: n, step: r } = Ve(), i = w ? (e - n) / 2 : 0;
			a.forEach((e, n) => {
				let a = D ? Xe(n - fe) : n - fe, o = Math.abs(a), s = i + a * r * (l ? Number(t.spacing ?? .62) : 1);
				if (l) {
					let t = G(-a * B, -B * 1.4, B * 1.4), n = Math.max(K, 1 - o * U);
					e.style.transform = Y ? `translate3d(0,${s}px,${-o * H}px) rotateX(${-t}deg) scale(${n})` : `translate3d(${s}px,0,${-o * H}px) rotateY(${t}deg) scale(${n})`, e.style.opacity = String(Math.max(J, 1 - o * q)), e.style.zIndex = String(1e3 - Math.round(o * 10));
				} else e.style.transform = Y ? `translate3d(0,${s}px,0)` : `translate3d(${s}px,0,0)`, e.style.opacity = "1", e.style.zIndex = "";
			});
		}, Ue = () => {
			a.forEach((e, t) => {
				let n = t === Q, r = w ? Math.abs(t - Q) > Math.ceil(S / 2) : t < Q || t >= Q + Math.ceil(S);
				e.setAttribute("aria-hidden", String(l ? !n : r)), e.classList.toggle("is-active", n);
			}), e.dataset.ktSliderIndex = String(Q), Nt(), dt(), it(Q), t.onChange?.(Q, a[Q], e);
		}, We = (n) => {
			if (n === Q) return !1;
			let r = Q;
			return t.onBeforeChange?.(n, r, e), s("kt-slider-before-change", {
				index: n,
				previousIndex: r,
				slide: a[n]
			}), Q = n, Ue(), s("kt-slider-change", {
				index: Q,
				previousIndex: r,
				slide: a[Q]
			}), !0;
		}, Ge = null, Ke = () => {
			oe && Ie && Ge == null && (Ge = requestAnimationFrame(() => {
				Ge = null;
				let e = Math.max(1, r.clientWidth || r.getBoundingClientRect().width), t = G(Math.round(r.scrollLeft / e), 0, T);
				pe = t, fe = t, We(t);
			}));
		}, qe = (e) => {
			if (!Ie) return;
			if (Ne) {
				De = null;
				return;
			}
			let t = Math.min(64, e - Oe);
			Oe = e;
			let n = k || ge;
			if (n && !he) {
				let e = t / 1e3, n = (((ge ? _e : pe) - fe) * A - me * j) / M;
				me += n * e, fe += me * e;
			} else {
				he && (me = 0);
				let e = 1 - (1 - (he ? .55 : O)) ** (t / 16);
				fe = W(fe, pe, e);
			}
			He();
			let r = n ? Math.abs(fe - pe) <= .0015 && Math.abs(me) <= .0015 : Math.abs(fe - pe) <= .0015;
			he || !r ? De = requestAnimationFrame(qe) : (ge = !1, fe = pe, me = 0, He(), De = null);
		}, Je = () => {
			Ie && De == null && (De = requestAnimationFrame(qe));
		}, Ye = a.length, Xe = (e) => (e = (e % Ye + Ye) % Ye, e > Ye / 2 ? e - Ye : e), Ze = (e) => (Math.round(e) % Ye + Ye) % Ye, Qe = (e, { snap: t = !0 } = {}) => {
			if (!Re) return;
			ge = !1;
			let n = D ? e : G(e, 0, T);
			pe = !D && t ? Math.round(n) : n;
			let i = D ? Ze(pe) : G(Math.round(pe), 0, T);
			if (oe) {
				pe = i, fe = i, We(i);
				let e = Math.max(1, r.clientWidth || r.getBoundingClientRect().width);
				o ? r.scrollLeft = i * e : r.scrollTo?.({
					left: i * e,
					behavior: "smooth"
				});
				return;
			}
			We(i), Je();
		}, $e = (e) => {
			if (D) {
				let t = Math.round(pe);
				Qe(t + Math.round(Xe(e - t)), { snap: !0 });
			} else Qe(e, { snap: !0 });
		}, et = () => D ? Qe(Math.round(pe) + C) : $e(E === "rewind" && Q >= T ? 0 : Math.min(T, Q + C)), tt = () => D ? Qe(Math.round(pe) - C) : $e(E === "rewind" && Q <= 0 ? T : Math.max(0, Q - C)), nt = (() => {
			let e = t.sync;
			return e ? (Array.isArray(e) ? e : [e]).map((e) => typeof e == "string" ? document.querySelector(e) : e).filter(Boolean) : [];
		})(), rt = !1, it = (t) => {
			nt.length && !rt && nt.forEach((n) => {
				let r = n.__ktSlider;
				r && r.el !== e && r.syncTo(t);
			});
		}, at = t.sync ? !0 : t.slideToClickedSlide === !0, ot = [], st = () => {
			e.style.cursor = "grabbing";
		}, ct = () => {
			e.style.cursor = "grab";
		};
		t.grabCursor === !0 && (e.style.cursor = "grab", e.addEventListener("pointerdown", st), e.addEventListener("pointerup", ct)), at && a.forEach((e, t) => {
			let n = (e) => {
				if (performance.now() < St) {
					e.preventDefault();
					return;
				}
				e.target.closest?.("a,button,input,select,textarea") || t !== Q && $e(t);
			};
			e.addEventListener("click", n), ot.push({
				slide: e,
				onClick: n
			});
		});
		let lt = t.autoHeight === !0, ut = null, dt = () => {
			if (!Ie || !lt) return;
			let e = a[Q];
			if (!e) return;
			let n = Math.round(e.scrollHeight || e.getBoundingClientRect().height);
			n && (r.style.transition = `height ${Math.max(.05, Number(t.duration ?? .6))}s cubic-bezier(.22,.8,.3,1)`, r.style.height = `${n}px`);
		};
		lt && (i.style.alignItems = "flex-start", ut = () => dt(), window.addEventListener("resize", ut), requestAnimationFrame(dt));
		let ft = (e = !0) => {
			ke != null && e && (je = Math.max(0, je - (performance.now() - Ae))), clearTimeout(ke), ke = null;
		}, pt = () => {
			je = L, ze();
		}, mt = (e = !1) => {
			ft(!1), e && pt(), !(!L || Fe || Me || he || Ne) && (je <= 16 && (je = L), Ae = performance.now(), ke = setTimeout(() => {
				ke = null, !he && !Fe && !Me && (et(), pt()), mt();
			}, je));
		}, ht = (e) => {
			if (Re && (e.pointerType !== "mouse" || e.button === 0) && !(e.pointerType === "mouse" ? !ne : !re)) {
				if (oe) {
					if (e.pointerType !== "mouse") return;
					he = !0, ve = !1, Ee = e.pointerId, ye = e.clientX, be = r.scrollLeft, Se = e.clientX, Ce = performance.now(), r.style.scrollSnapType = "none", r.style.scrollBehavior = "auto", r.setPointerCapture?.(Ee), ft();
					return;
				}
				he = !0, ge = !1, me = 0, ve = !1, Ee = e.pointerId, ye = Y ? e.clientY : e.clientX, xe = pe, Se = Y ? e.clientY : e.clientX, Ce = performance.now(), we = 0, Te = 0, r.setPointerCapture?.(Ee), ft(), Je();
			}
		}, gt = (e) => {
			if (!he || e.pointerId !== Ee) return;
			if (oe) {
				let t = e.clientX - ye;
				if (!ve && Math.abs(t) < 5) return;
				ve = !0;
				let n = Math.max(0, r.scrollWidth - r.clientWidth);
				r.scrollLeft = G(be - t, 0, n), e.preventDefault();
				return;
			}
			let { step: t } = Ve(), n = Y ? e.clientY : e.clientX, i = n - ye;
			if (!ve && Math.abs(i) < 5) return;
			ve = !0;
			let a = xe - i / Math.max(1, t);
			D || (a < 0 ? a *= .3 : a > T && (a = T + (a - T) * .3));
			let o = performance.now(), s = Math.max(1, o - Ce), c = (Se - n) / s;
			Te = Math.min(5, Te + 1), we += (c - we) * (2 / (Te + 1)), Se = n, Ce = o, pe = a, Je();
		}, _t = (e) => {
			if (!he || e.pointerId !== Ee) return;
			if (he = !1, r.releasePointerCapture?.(Ee), oe) {
				ve && (St = performance.now() + 250);
				let e = Math.max(1, r.clientWidth || r.getBoundingClientRect().width), t = r.scrollLeft;
				r.style.scrollSnapType = "x mandatory", r.style.scrollBehavior = o ? "auto" : "smooth", Qe(Math.round(t / e)), mt();
				return;
			}
			ve && (St = performance.now() + 250);
			let t = P ? G(we * N, -1.2, 1.2) : 0, n = pe + t;
			F && !o && !D && (pe < 0 || pe > T || n < 0 || n > T) ? (_e = G(n, 0, T), Qe(_e, { snap: !0 }), ge = !0, me = 0, Je()) : Qe(n, { snap: I }), mt();
		}, vt = (e) => {
			if (!Re || !ie) return;
			let t = Y ? "ArrowDown" : "ArrowRight", n = Y ? "ArrowUp" : "ArrowLeft";
			e.key === t ? (e.preventDefault(), et()) : e.key === n ? (e.preventDefault(), tt()) : e.key === "Home" ? (e.preventDefault(), $e(0)) : e.key === "End" && (e.preventDefault(), $e(T));
		}, yt = Array.from(document.querySelectorAll(t.nextSelector || `[data-kt-slider-next="${e.id || ""}"], [data-kt-slider-next]`)).filter((e) => !e.dataset.ktSliderBound), bt = Array.from(document.querySelectorAll(t.prevSelector || `[data-kt-slider-prev="${e.id || ""}"], [data-kt-slider-prev]`)).filter((e) => !e.dataset.ktSliderBound), xt = (e, t) => {
			e.dataset.ktSliderBound = "true", e.addEventListener("click", t);
		};
		yt.forEach((e) => xt(e, et)), bt.forEach((e) => xt(e, tt));
		let St = 0, Ct = (e) => {
			he && ve && e.preventDefault();
		};
		r.addEventListener("pointerdown", ht), r.addEventListener("pointermove", gt), r.addEventListener("pointerup", _t), r.addEventListener("pointercancel", _t), r.addEventListener("touchmove", Ct, { passive: !1 }), r.addEventListener("keydown", vt);
		let wt = t.wheel === !0, Tt = 0, Et = (e) => {
			if (!Re) return;
			if (oe) {
				!wt && Math.abs(e.deltaX) >= Math.abs(e.deltaY) && e.preventDefault();
				return;
			}
			let t = Math.abs(e.deltaX) >= Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
			if (Math.abs(t) < 6) return;
			e.preventDefault();
			let n = performance.now();
			n - Tt < 320 || (Tt = n, t > 0 ? et() : tt());
		};
		(wt || oe) && r.addEventListener("wheel", Et, { passive: !1 });
		let Dt = () => {
			R && (Me = !0, ft());
		}, Ot = () => {
			R && (Me = !1, mt());
		};
		r.addEventListener("pointerenter", Dt), r.addEventListener("pointerleave", Ot), z && typeof IntersectionObserver < "u" && (Pe = new IntersectionObserver(([e]) => {
			let t = !!(e?.isIntersecting && (e.intersectionRatio == null || e.intersectionRatio > 0));
			t !== !Ne && (Ne = !t, Ne ? (ft(), De != null && (cancelAnimationFrame(De), De = null), Ut()) : (Je(), mt(), Gt()));
		}, { threshold: .01 }), Pe.observe(e));
		let kt = typeof ResizeObserver < "u" ? new ResizeObserver(() => {
			if (He(), oe) {
				let e = Math.max(1, r.clientWidth || r.getBoundingClientRect().width), t = r.style.scrollBehavior;
				r.style.scrollBehavior = "auto", r.scrollLeft = Q * e, r.style.scrollBehavior = t;
			}
		}) : null;
		kt?.observe(r), oe && r.addEventListener("scroll", Ke, { passive: !0 });
		let At = t.dots === !0, jt = [], Mt = null;
		At && (Mt = document.createElement("div"), Mt.className = "kt-slider-dots", a.forEach((e, t) => {
			let r = document.createElement("button");
			r.type = "button", r.className = "kt-slider-dot", r.setAttribute("aria-label", n("dot", { n: t + 1 })), r.addEventListener("pointerdown", (e) => e.stopPropagation()), r.addEventListener("click", (e) => {
				e.stopPropagation(), $e(t), mt(!0);
			}), Mt.appendChild(r), jt.push(r);
		}), r.appendChild(Mt));
		let Nt = () => {
			jt.forEach((e, t) => {
				let n = t === Q;
				e.classList.toggle("is-active", n), e.setAttribute("aria-current", String(n));
			});
		}, Pt = t.progress === !0 && L > 0, Ft = t.progressType === "ring" ? "ring" : "bar", It = null, Lt = null, Rt = null;
		Pt && (Lt = document.createElement("div"), Lt.className = `kt-slider-progress kt-slider-progress--${Ft}`, Ft === "ring" ? (Lt.innerHTML = "<svg class=\"kt-slider-progress__svg\" viewBox=\"0 0 36 36\" aria-hidden=\"true\"><circle class=\"kt-slider-progress__track\" cx=\"18\" cy=\"18\" r=\"15\"/><circle class=\"kt-slider-progress__fill\" cx=\"18\" cy=\"18\" r=\"15\" pathLength=\"1\" stroke-dasharray=\"1\" stroke-dashoffset=\"1\"/></svg>", It = Lt.querySelector(".kt-slider-progress__fill")) : (Lt.setAttribute("aria-hidden", "true"), It = document.createElement("div"), It.className = "kt-slider-progress__fill", Lt.appendChild(It)), r.appendChild(Lt));
		let zt = () => {
			Le && (Le.dataset.paused = String(Fe), Le.setAttribute("aria-label", n(Fe ? "resume" : "pause")), Le.setAttribute("aria-pressed", String(Fe)), Le.innerHTML = Fe ? "<svg viewBox=\"0 0 20 20\" aria-hidden=\"true\"><path d=\"M7 5.2v9.6L14.5 10 7 5.2Z\" fill=\"currentColor\"/></svg>" : "<svg viewBox=\"0 0 20 20\" aria-hidden=\"true\"><path d=\"M6.4 5.2h2.4v9.6H6.4zm4.8 0h2.4v9.6h-2.4z\" fill=\"currentColor\"/></svg>");
		};
		t.pauseButton === !0 && L > 0 && (Le = document.createElement("button"), Le.type = "button", Le.className = "kt-slider-pause", Le.addEventListener("pointerdown", (e) => e.stopPropagation()), Le.addEventListener("click", (e) => {
			e.stopPropagation(), Fe = !Fe, Fe ? ft() : mt(), zt();
		}), zt(), Lt && Ft === "ring" ? (Lt.classList.add("has-control"), Lt.appendChild(Le)) : r.appendChild(Le));
		let Bt = 0, Vt = () => {
			It && (Ft === "ring" ? It.style.strokeDashoffset = String(1 - Bt) : It.style.transform = `scaleX(${Bt})`);
		}, Ht = () => {
			Bt = 0, Vt();
		}, Ut = () => {
			Rt != null && (cancelAnimationFrame(Rt), Rt = null);
		}, Wt = () => {
			if (!It) {
				Rt = null;
				return;
			}
			if (ke != null && !he && !Fe && !Me) {
				let e = performance.now() - Ae;
				Bt = G((L - je + e) / L, 0, 1);
			}
			Vt(), Rt = requestAnimationFrame(Wt);
		}, Gt = () => {
			It && Rt == null && Wt();
		};
		ze = Ht, He(), Ue(), oe && requestAnimationFrame(() => {
			if (!Ie) return;
			let e = Math.max(1, r.clientWidth || r.getBoundingClientRect().width), t = r.style.scrollBehavior;
			r.style.scrollBehavior = "auto", r.scrollLeft = Q * e, r.style.scrollBehavior = t;
		}), mt(), Gt(), t.onInit?.(e), s("kt-slider-init", {
			index: Q,
			slide: a[Q]
		});
		let Kt = {
			el: e,
			type: "slider",
			get index() {
				return Q;
			},
			get slides() {
				return a.slice();
			},
			syncTo(e) {
				rt = !0;
				try {
					$e(Number(e));
				} finally {
					rt = !1;
				}
			},
			next: et,
			prev: tt,
			slideNext: et,
			slidePrev: tt,
			goTo(e) {
				$e(Number(e));
			},
			slideTo(e) {
				$e(Number(e));
			},
			replay() {
				$e(0);
			},
			get paused() {
				return Fe;
			},
			get enabled() {
				return Re;
			},
			get isBeginning() {
				return !D && Q === 0;
			},
			get isEnd() {
				return !D && Q === T;
			},
			enable() {
				Re = !0, r.removeAttribute("aria-disabled");
			},
			disable() {
				Re = !1, ft(), r.setAttribute("aria-disabled", "true");
			},
			pause() {
				Fe = !0, ft(), zt();
			},
			resume() {
				Fe = !1, mt(), zt();
			},
			destroy() {
				Ie = !1, ft(), Ut(), Pe?.disconnect(), jt.forEach((e) => e.remove()), Mt?.remove(), Lt?.remove(), Le?.remove(), De != null && cancelAnimationFrame(De), Ge != null && cancelAnimationFrame(Ge), kt?.disconnect(), r.removeEventListener("pointerdown", ht), r.removeEventListener("pointermove", gt), r.removeEventListener("pointerup", _t), r.removeEventListener("pointercancel", _t), r.removeEventListener("touchmove", Ct), r.removeEventListener("keydown", vt), r.removeEventListener("wheel", Et), r.removeEventListener("pointerenter", Dt), r.removeEventListener("pointerleave", Ot), r.removeEventListener("scroll", Ke), yt.forEach((e) => {
					e.removeEventListener("click", et), delete e.dataset.ktSliderBound;
				}), bt.forEach((e) => {
					e.removeEventListener("click", tt), delete e.dataset.ktSliderBound;
				}), e.removeEventListener("pointerdown", st), e.removeEventListener("pointerup", ct), le(), Z(), ue.forEach((e) => e()), de(), ot.forEach(({ slide: e, onClick: t }) => e.removeEventListener("click", t)), ut && window.removeEventListener("resize", ut), ce(), delete e.__ktSlider;
			}
		};
		return e.__ktSlider = Kt, Kt;
	},
	reduced(e) {
		let t = Z(e, ["overflowX", "scrollSnapType"]);
		return e.style.overflowX = "auto", e.style.scrollSnapType = "x mandatory", {
			el: e,
			type: "slider",
			pause() {},
			resume() {},
			destroy: t
		};
	},
	fallback(e, t) {
		return this.reduced(e, t);
	}
};
//#endregion
//#region src/modules/ambientMedia.js
function wa(e, t = {}) {
	return t.ambientSrc || t.source || t.src || e.dataset?.src || e.getAttribute?.("data-src") || e.currentSrc || e.getAttribute?.("src") || "";
}
function Ta(e, t, n) {
	let r = document.createElement("img");
	r.className = "kt-ambient-image-clone", r.alt = "", r.setAttribute("aria-hidden", "true"), r.loading = "eager", r.decoding = "async", r.src = e;
	let i = n.ambientSrcset || t.getAttribute?.("data-srcset") || t.getAttribute?.("srcset");
	return i && (r.srcset = i), r.style.cssText = "display:block;width:100%;height:100%;object-fit:cover;object-position:50% 50%;", r;
}
var Ea = {
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
		u.style.cssText = `position:absolute;inset:${d}px;z-index:0;pointer-events:none;border-radius:${t.radius || "inherit"};overflow:hidden;filter:blur(${f}px) saturate(${Number(t.saturation ?? 1.45)}) brightness(${Number(t.brightness ?? .82)});opacity:0;transform:scale(${m}) translateZ(0);transform-origin:center;transition:opacity .45s var(--kt-ease-ui, ease);`, a.insertBefore(u, i);
		let h = r.tagName, g = wa(r, t), _ = null, v = null, y = null, b = null, x = !0, S = 0, C = null, w = 0, T = !1, E = !0, D = null, O = t.color || t.fallbackColor || "rgba(100,120,180,.42)", k = !1, A = () => {
			k = !0, u.style.opacity = String(p);
		}, j = () => {
			k = !1, u.style.opacity = "0";
		}, M = () => {
			u.style.background = O, u.dataset.mode = "color", A();
		};
		if (h === "IMG" || h === "IFRAME" && g) {
			if (g) {
				y = Ta(g, r, t), u.appendChild(y), u.dataset.mode = "image-clone", y.complete && y.naturalWidth ? A() : y.addEventListener("load", A, { once: !0 });
				let e = () => {
					let e = wa(r, t);
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
		} else if (h === "VIDEO") {
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
	fallback() {},
	reduced() {}
}, Da = (e, t, n) => Math.min(n, Math.max(t, Number.isFinite(e) ? e : t)), Oa = {
	expo: "cubic-bezier(.16,1,.3,1)",
	quint: "cubic-bezier(.22,1,.36,1)",
	quart: "cubic-bezier(.25,1,.5,1)",
	inOut: "cubic-bezier(.76,0,.24,1)"
}, ka = {
	create(e, t) {
		let n = t.effect || t.preset || "curtain", r = Math.max(.1, Number(t.duration ?? .9)) * 1e3, i = typeof t.ease == "string" && (t.ease.includes("(") || t.ease.startsWith("ease") || t.ease === "linear") ? t.ease : Oa.expo, a = typeof t.ease == "string" && t.ease.length > 0, o = t.color || "#0a0908", s = t.color2 || o, c = Math.max(0, Number(t.delay ?? 0)) * 1e3, l = t.direction || "up", u = [], d = /* @__PURE__ */ new Set(), f = /* @__PURE__ */ new Set(), p = [], m = !1, h = (e, t) => {
			let n = setTimeout(() => {
				f.delete(n), e();
			}, t);
			return f.add(n), n;
		}, g = (e, t) => {
			let n = document.createElement("div");
			return n.setAttribute("aria-hidden", "true"), n.style.cssText = `position:fixed;z-index:99997;pointer-events:none;background:${o};${e}`, (t || document.body).appendChild(n), u.push(n), n;
		}, _ = (e, t, n) => {
			let r = e.animate(t, {
				duration: y,
				delay: c,
				easing: i,
				fill: "forwards",
				...n
			});
			return d.add(r), r.finished.catch(() => {}).finally(() => d.delete(r)), r;
		}, v = () => {
			m || (m = !0, u.forEach((e) => e.remove()), p.forEach((e) => {
				try {
					e();
				} catch {}
			}), t.onComplete?.());
		}, y = r * ({
			fade: 1.85,
			zoom: 1.5,
			shutter: 1.35,
			diagonal: 1.4,
			grid: 1.35,
			blinds: 1.2,
			split: 1.15,
			curve: 1.3,
			dissolve: 1.35,
			push: 1.3,
			fold: 1.3,
			iris: 1.25,
			flash: 1.25,
			curtain: 1
		}[n] ?? 1), b = (e, t, n) => t < 2 ? 0 : e / (t - 1) * y * n, x = (e, t) => g(`background:${t || o};will-change:transform,opacity;${e}`), S = (e) => (e.finished.then(v).catch(v), e);
		if (n === "split") {
			let e = l === "left" || l === "right" || t.axis === "x", n = y * .06;
			if (e) {
				let e = x("left:0;top:0;width:calc(50% + 1px);height:100%;"), t = x("right:0;top:0;width:calc(50% + 1px);height:100%;", s);
				_(e, [{ transform: "translateX(0)" }, { transform: "translateX(-102%)" }], { easing: i }), S(_(t, [{ transform: "translateX(0)" }, { transform: "translateX(102%)" }], {
					delay: c + n,
					easing: i
				}));
			} else {
				let e = x("left:0;top:0;width:100%;height:calc(50% + 1px);"), t = x("left:0;bottom:0;width:100%;height:calc(50% + 1px);", s);
				_(e, [{ transform: "translateY(0)" }, { transform: "translateY(-102%)" }], { easing: i }), S(_(t, [{ transform: "translateY(0)" }, { transform: "translateY(102%)" }], {
					delay: c + n,
					easing: i
				}));
			}
		} else if (n === "blinds") {
			let e = Math.max(3, Math.round(Number(t.count ?? 7))), n = Da(Number(t.stagger ?? .45), 0, .8), r = null;
			for (let t = 0; t < e; t += 1) r = _(x(`top:0;height:100%;left:${t / e * 100}%;width:calc(${100 / e}% + 1px);transform-origin:${t % 2 ? "bottom" : "top"};`, t % 2 ? s : o), [{ transform: "scaleY(1)" }, { transform: "scaleY(0)" }], {
				delay: c + b(t, e, n),
				duration: y * .82,
				easing: i
			});
			r && S(r);
		} else if (n === "shutter") {
			let e = Math.max(3, Math.round(Number(t.count ?? 7))), n = Da(Number(t.stagger ?? .45), 0, .8), r = null;
			for (let t = 0; t < e; t += 1) r = _(x(`left:0;width:100%;top:${t / e * 100}%;height:calc(${100 / e}% + 1px);transform-origin:${t % 2 ? "right" : "left"} center;`, t % 2 ? s : o), [{ transform: "scaleX(1)" }, { transform: "scaleX(0)" }], {
				delay: c + b(t, e, n),
				duration: y * .84,
				easing: i
			});
			r && S(r);
		} else if (n === "diagonal") {
			let e = -Math.abs(Number(t.angle ?? 14)), n = l === "left" ? "-135%" : "135%", r = (e) => x("top:50%;left:50%;width:260vmax;height:260vmax;margin:-130vmax 0 0 -130vmax;", e), a = r(s);
			_(r(o), [{ transform: `rotate(${e}deg) translateX(0)` }, { transform: `rotate(${e}deg) translateX(${n})` }], { easing: i }), S(_(a, [{ transform: `rotate(${e}deg) translateX(0)` }, { transform: `rotate(${e}deg) translateX(${n})` }], {
				delay: c + y * .11,
				duration: y * 1.05,
				easing: i
			}));
		} else if (n === "curve") {
			let e = l === "down" ? "down" : l === "left" ? "left" : l === "right" ? "right" : "up", n = e === "left" || e === "right", r = Da(Math.abs(Number(t.angle ?? 14)) * 1.3, 4, 40), o = x(n ? "top:0;bottom:0;left:-10vw;width:120vw;" : "left:0;right:0;top:-10vh;height:120vh;"), s = (t) => e === "up" ? `0 0 50% 50% / 0 0 ${t}vh ${t}vh` : e === "down" ? `50% 50% 0 0 / ${t}vh ${t}vh 0 0` : e === "left" ? `0 50% 50% 0 / 0 ${t}vw ${t}vw 0` : `50% 0 0 50% / ${t}vw 0 0 ${t}vw`, c = e === "up" || e === "left" ? -1 : 1, u = (e) => n ? `translateX(${e}%)` : `translateY(${e}%)`;
			S(_(o, [
				{
					transform: u(0),
					borderRadius: s(0)
				},
				{
					transform: u(c * 50),
					borderRadius: s(r),
					offset: .42
				},
				{
					transform: u(c * 118),
					borderRadius: s(0)
				}
			], {
				duration: y * 1.12,
				easing: a ? i : Oa.quint
			}));
		} else if (n === "dissolve") {
			let e = l === "down" ? "to top" : l === "left" ? "to right" : l === "right" ? "to left" : "to bottom", t = l === "left" || l === "right", n = x("inset:0;"), r = `linear-gradient(${e}, #000 0 42%, transparent 58% 100%)`, o = t ? "200% 100%" : "100% 200%", s = t ? l === "left" ? "100% 50%" : "0% 50%" : l === "down" ? "50% 100%" : "50% 0%", c = t ? l === "left" ? "0% 50%" : "100% 50%" : l === "down" ? "50% 0%" : "50% 100%";
			n.style.maskImage = r, n.style.webkitMaskImage = r, n.style.maskSize = o, n.style.webkitMaskSize = o, n.style.maskRepeat = "no-repeat", n.style.webkitMaskRepeat = "no-repeat", S(_(n, [{
				maskPosition: s,
				webkitMaskPosition: s
			}, {
				maskPosition: c,
				webkitMaskPosition: c
			}], {
				duration: y * 1.15,
				easing: a ? i : Oa.quint
			}));
		} else if (n === "push") {
			let t = l === "down" ? "down" : l === "left" ? "left" : l === "right" ? "right" : "up", n = {
				up: "translateY(-102%)",
				down: "translateY(102%)",
				left: "translateX(-102%)",
				right: "translateX(102%)"
			}[t], r = {
				up: "translateY(11vh)",
				down: "translateY(-11vh)",
				left: "translateX(11vw)",
				right: "translateX(-11vw)"
			}[t], u = e === document.body || e === document.documentElement ? document.documentElement : e, f = x("inset:0;", o), m = x("inset:0;", s);
			m.style.zIndex = "99996";
			let h = a ? i : Oa.quint;
			_(m, [{ transform: "translate(0,0)" }, { transform: n }], {
				duration: y * 1.08,
				easing: h
			}), _(f, [{ transform: "translate(0,0)" }, { transform: n }], {
				delay: c + y * .05,
				easing: h
			});
			let g = document.documentElement, b = window.innerWidth - g.clientWidth, S = g.style.overflow, C = g.style.paddingRight;
			g.style.overflow = "clip", b > 0 && (g.style.paddingRight = `${b}px`), p.push(() => {
				S ? g.style.overflow = S : g.style.removeProperty("overflow"), C ? g.style.paddingRight = C : g.style.removeProperty("padding-right");
			});
			let w = u.animate([{ transform: r }, { transform: "translate(0,0)" }], {
				duration: y * 1.08,
				delay: c,
				easing: h
			});
			d.add(w), w.finished.catch(() => {}).finally(() => d.delete(w)), w.finished.then(v).catch(v);
		} else if (n === "grid") {
			let e = Math.max(2, Math.round(Number(t.count ?? 7) * .6)), n = Math.max(2, Math.round(e * (window.innerHeight / Math.max(1, window.innerWidth)) * 1.25)), r = Da(Number(t.stagger ?? .45), 0, .9), a = e - 1 + (n - 1), l = null, u = -1;
			for (let t = 0; t < n; t += 1) for (let d = 0; d < e; d += 1) {
				let f = (d + t) % 2, p = x(`left:${d / e * 100}%;top:${t / n * 100}%;width:calc(${100 / e}% + 1px);height:calc(${100 / n}% + 1px);transform-origin:${f ? "bottom" : "top"};`, f ? s : o), m = c + (a === 0 ? 0 : (d + t) / a) * y * r, h = y * .66, g = _(p, [{ transform: "scaleY(1)" }, { transform: "scaleY(0)" }], {
					delay: m,
					duration: h,
					easing: i
				});
				m + h > u && (u = m + h, l = g);
			}
			l && S(l);
		} else if (n === "fold") {
			let e = Math.max(4, Math.round(Number(t.count ?? 7))), n = Da(Number(t.stagger ?? .45), 0, .8), r = l !== "right", a = g("inset:0;background:transparent;perspective:1200px;perspective-origin:50% 50%;"), u = [];
			for (let t = 0; t < e; t += 1) {
				let n = document.createElement("div"), r = t % 2 ? "right" : "left";
				n.style.cssText = `position:absolute;top:0;bottom:0;left:${t / e * 100}%;width:calc(${100 / e}% + 1px);background:${t % 2 ? s : o};transform-origin:${r} center;will-change:transform;backface-visibility:hidden;`, a.appendChild(n), u.push(n);
			}
			let d = null, f = -1;
			u.forEach((t, a) => {
				let o = r ? a / (e - 1) : 1 - a / (e - 1), s = c + o * y * n, l = y * .78, u = _(t, [{ transform: "translateX(0) rotateY(0deg)" }, { transform: `translateX(${r ? "-" : ""}${100 / e * .9}%) rotateY(${a % 2 ? "-" : ""}88deg)` }], {
					delay: s,
					duration: l,
					easing: i
				});
				s + l > f && (f = s + l, d = u);
			}), d && S(d);
		} else if (n === "fade") S(_(x("inset:0;"), [{
			opacity: 1,
			transform: "scale(1)"
		}, {
			opacity: 0,
			transform: "scale(1.045)"
		}], { easing: a ? i : Oa.quart }));
		else if (n === "zoom") {
			let t = e === document.body || e === document.documentElement ? document.documentElement : e, n = t.getBoundingClientRect(), r = window.innerWidth / 2 - n.left, o = window.innerHeight / 2 - n.top;
			t.style.transformOrigin = `${r}px ${o}px`;
			let s = a ? i : Oa.quint, l = t.animate([{
				transform: "scale(0.72)",
				opacity: 0
			}, {
				transform: "scale(1)",
				opacity: 1
			}], {
				duration: y,
				delay: c,
				easing: s
			});
			d.add(l), l.finished.catch(() => {}).finally(() => d.delete(l)), p.push(() => t.style.removeProperty("transform-origin")), l.finished.then(v).catch(v);
		} else if (n === "iris") {
			let e = x("inset:0;", s), t = x("inset:0;"), n = (e) => `circle(${e} at 50% 50%)`;
			_(t, [{ clipPath: n("150%") }, { clipPath: n("0%") }], { easing: i }), S(_(e, [
				{ clipPath: n("150%") },
				{
					clipPath: n("150%"),
					offset: .16
				},
				{ clipPath: n("0%") }
			], {
				duration: y * 1.28,
				easing: i
			}));
		} else if (n === "data-mosaic") {
			let e = (Math.floor(Number(t.seed ?? 20260729)) || 1) >>> 0, n = () => {
				e = e + 1831565813 >>> 0;
				let t = e;
				return t = Math.imul(t ^ t >>> 15, t | 1), t ^= t + Math.imul(t ^ t >>> 7, t | 61), ((t ^ t >>> 14) >>> 0) / 4294967296;
			}, r = Da(Number(t.density ?? 1), .3, 2), i = Math.max(4, Number(t.tileMin ?? 10)), a = Math.max(i * 2, Number(t.tileMax ?? 96)), s = Da(Number(t.largeTileChance ?? .15), 0, 1), l = Da(Number(t.smallTileChance ?? .55), 0, 1), u = Math.max(0, Number(t.noiseDuration ?? .18)) * 1e3, d = Math.max(0, Number(t.cleanupDuration ?? .35)) * 1e3, f = Math.max(400, y * 1.45), p = Math.max(120, f - u - d), m = window.innerWidth, _ = window.innerHeight, b = Math.max(0, Number(t.overscan ?? 0)), x = g(`inset:${-b}px;background:${o};`), S = [], C = Math.ceil((m + b * 2) / a), w = Math.ceil((_ + b * 2) / a), T = Math.max(1, C * w), E = Da(Math.round(Da(560 * r, 80, 1400)) / T, 1, 36), D = Math.max(1, Math.min(6, Math.round(a / i)));
			for (let e = 0; e < w; e += 1) for (let t = 0; t < C; t += 1) {
				let r = n(), i = Math.sqrt(E), o = r < l ? Math.min(D, Math.max(2, Math.round(i * 1.6))) : r < l + (1 - l - s) ? Math.min(D, Math.max(1, Math.round(i))) : 1, c = a / o;
				for (let r = 0; r < o; r += 1) for (let i = 0; i < o; i += 1) S.push({
					x: -b + t * a + i * c,
					y: -b + e * a + r * c,
					w: c,
					h: c,
					weight: n() * .72 + c / a * .28
				});
			}
			S.sort((e, t) => e.weight - t.weight);
			let O = S.map((e) => g(`left:${e.x}px;top:${e.y}px;width:${Math.ceil(e.w)}px;height:${Math.ceil(e.h)}px;background:${o};will-change:opacity,transform;`));
			O.forEach((e, t) => {
				let n = t / Math.max(1, O.length - 1);
				h(() => {
					e.style.transition = `opacity 150ms ${Oa.quart}, transform 150ms ${Oa.quart}`, e.style.opacity = "0", e.style.transform = "scale(.86)";
				}, c + u + n * p);
			}), h(() => {
				x.style.transition = `opacity ${Math.round(u)}ms steps(6,end)`, x.style.opacity = "0";
			}, c + u * .35), h(v, c + u + p + d);
		} else if (n === "center-slit") {
			let e = Math.max(8, Number(t.lineWidth ?? 160)), n = Math.max(.5, Number(t.lineHeight ?? 1)), r = Math.max(.05, Number(t.verticalDuration ?? .65)) * 1e3, o = Math.max(.05, Number(t.horizontalDuration ?? .6)) * 1e3, l = e / 2, u = n / 2, d = a ? i : "cubic-bezier(.65,0,.35,1)", f = a ? i : "cubic-bezier(.87,0,.13,1)", p = x(`left:0;right:0;top:0;height:calc(50% - ${u}px);transform-origin:top;`), m = x(`left:0;right:0;bottom:0;height:calc(50% - ${u}px);transform-origin:bottom;`), h = x(`top:0;bottom:0;left:0;width:calc(50% - ${l}px);transform-origin:left;`, s), g = x(`top:0;bottom:0;right:0;width:calc(50% - ${l}px);transform-origin:right;`, s), v = t.reverse === !0, y = [
				{
					transform: "scaleY(1)",
					offset: 0
				},
				{
					transform: "scaleY(.985)",
					offset: 180 / (180 + r),
					easing: d
				},
				{
					transform: "scaleY(0)",
					offset: 1
				}
			], b = [{ transform: "scaleX(1)" }, { transform: "scaleX(0)" }], C = {
				duration: 180 + r,
				easing: d,
				delay: c
			}, w = {
				duration: o,
				easing: f,
				delay: c + 180 + r
			};
			if (v) {
				let e = [{ transform: "scaleX(0)" }, { transform: "scaleX(1)" }], t = [{ transform: "scaleY(0)" }, { transform: "scaleY(1)" }];
				_(h, e, {
					duration: o,
					easing: f,
					delay: c
				}), _(g, e, {
					duration: o,
					easing: f,
					delay: c
				}), _(p, t, {
					duration: r,
					easing: d,
					delay: c + o
				}), S(_(m, t, {
					duration: r,
					easing: d,
					delay: c + o
				}));
			} else _(p, y, C), _(m, y.map((e) => ({ ...e })), C), _(h, b, w), S(_(g, b.map((e) => ({ ...e })), w));
		} else if (n === "flash") {
			let e = g("left:-10vw;right:-10vw;top:50%;height:2px;margin-top:-1px;background:linear-gradient(90deg,transparent,#fff 12%,#fff 88%,transparent);filter:blur(1.5px);mix-blend-mode:screen;will-change:transform,opacity;"), t = g("inset:0;background:transparent;mix-blend-mode:screen;background-image:radial-gradient(120% 40% at 50% 50%,rgba(255,255,255,.85),transparent 70%);will-change:opacity;"), n = x("inset:0;"), r = Math.max(90, y * .16), i = Math.max(260, y * .62);
			_(e, [{
				transform: "scaleX(0) scaleY(1)",
				opacity: 0
			}, {
				transform: "scaleX(1) scaleY(1)",
				opacity: 1
			}], {
				duration: r,
				easing: Oa.quart
			}), _(e, [
				{
					transform: "scaleX(1) scaleY(1)",
					opacity: 1
				},
				{
					transform: "scaleX(1) scaleY(90)",
					opacity: .9,
					offset: .55
				},
				{
					transform: "scaleX(1) scaleY(220)",
					opacity: 0
				}
			], {
				delay: c + r,
				duration: i,
				easing: Oa.expo
			}), _(t, [
				{ opacity: 0 },
				{
					opacity: 1,
					offset: .25
				},
				{ opacity: 0 }
			], {
				delay: c + r,
				duration: i * 1.25,
				easing: Oa.quart
			}), S(_(n, [{ clipPath: "inset(0 0 0 0)" }, { clipPath: "inset(50% 0 50% 0)" }], {
				delay: c + r * .8,
				duration: i,
				easing: Oa.expo
			}));
		} else {
			let e = x("inset:0;", s), t = x("inset:0;"), n = l === "down" ? "bottom" : l === "left" ? "left" : l === "right" ? "right" : "top";
			t.style.transformOrigin = n, e.style.transformOrigin = n;
			let r = n === "left" || n === "right" ? "scaleX" : "scaleY";
			_(t, [{ transform: `${r}(1)` }, { transform: `${r}(0)` }], { easing: i }), S(_(e, [{ transform: `${r}(1)` }, { transform: `${r}(0)` }], {
				delay: c + y * .1,
				duration: y * 1.06,
				easing: i
			}));
		}
		return h(v, c + y * 2 + 600), {
			el: e,
			type: "pageReveal",
			pause: () => d.forEach((e) => e.pause()),
			resume: () => d.forEach((e) => e.play()),
			destroy: () => {
				d.forEach((e) => e.cancel()), d.clear(), f.forEach(clearTimeout), f.clear(), u.forEach((e) => e.remove()), p.forEach((e) => {
					try {
						e();
					} catch {}
				});
			}
		};
	},
	reduced(e, t) {
		t.onComplete?.();
	}
};
//#endregion
//#region src/modules/glitch.js
function Aa(e) {
	let t = e;
	for (; t && t !== document.documentElement;) {
		let e = getComputedStyle(t).backgroundColor, n = e && e.match(/rgba?\(([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:[,\s/]+([\d.]+))?\)/);
		if (n && (n[4] == null || Number(n[4]) > .15)) return .2126 * Number(n[1]) + .7152 * Number(n[2]) + .0722 * Number(n[3]) < 128;
		t = t.parentElement;
	}
	return !1;
}
var ja = "!@#$%^&*()<>?/|{}~ABCDEFGHIJabcdefghij0123456789", Ma = {
	create(e, t) {
		let n = !1, r = t.preset || t.type || "rgb", i = G(Number(t.intensity ?? 1), .1, 3), a = Math.max(.1, Number(t.speed ?? 1)), o = G(Number(t.frequency ?? 1), .1, 4), s = G(Number(t.randomness ?? 1), 0, 1), c = () => .5 + (Math.random() - .5) * s, l = (e) => e / o, u = a * o, d = t.loop !== !1, f = t.trigger || "auto";
		if (r === "rgb-slice-burst") {
			let n = (Math.floor(Number(t.seed ?? 20260729)) || 1) >>> 0, o = () => {
				n = n + 1831565813 >>> 0;
				let e = n;
				return e = Math.imul(e ^ e >>> 15, e | 1), e ^= e + Math.imul(e ^ e >>> 7, e | 61), ((e ^ e >>> 14) >>> 0) / 4294967296;
			}, c = (e, t) => {
				let n = (e + t) / 2;
				return n + (e + o() * (t - e) - n) * s;
			}, l = Array.isArray(t.colors) && t.colors.length ? t.colors : [
				"#ff2e2e",
				"#00e07a",
				"#2b6bff",
				"#ff5b1c"
			], f = Math.max(0, Number(t.channelOffset ?? 6)) * i, p = Math.max(0, Number(t.maxSliceOffset ?? 26)) * i, m = Math.max(1, Math.round(Number(t.sliceCountMin ?? 3))), h = Math.max(m, Math.round(Number(t.sliceCountMax ?? 7))), g = Math.max(30, Number(t.burstDurationMin ?? 60)), _ = Math.max(g, Number(t.burstDurationMax ?? 180)), v = Math.max(80, Number(t.intervalMin ?? 250)), y = Math.max(v, Number(t.intervalMax ?? 1200)), b = Math.max(0, Math.round(Number(t.artifactCount ?? 3))), x = [
				{
					weight: 34,
					channel: 1,
					slices: 1,
					artifacts: .3,
					label: "soft"
				},
				{
					weight: 30,
					channel: 1.4,
					slices: 1.4,
					artifacts: 1,
					label: "medium"
				},
				{
					weight: 22,
					channel: 2.1,
					slices: 1.8,
					artifacts: 1.4,
					label: "hard"
				},
				{
					weight: 14,
					channel: .6,
					slices: 2.4,
					artifacts: 1.8,
					label: "shred"
				}
			], S = x.reduce((e, t) => e + t.weight, 0), C = () => {
				let e = o() * S;
				for (let t of x) if (e -= t.weight, e <= 0) return t;
				return x[0];
			}, w = e, T = Z(w, ["position", "isolation"]);
			getComputedStyle(w).position === "static" && (w.style.position = "relative"), w.style.isolation = "isolate";
			let E = document.createElement("span");
			E.setAttribute("aria-hidden", "true"), E.style.cssText = "position:absolute;inset:0;pointer-events:none;overflow:hidden;opacity:0", w.appendChild(E);
			let D = /* @__PURE__ */ new Set(), O = (e, t) => {
				let n = setTimeout(() => {
					D.delete(n), e();
				}, t);
				return D.add(n), n;
			}, k = !0, A = !1, j = () => {
				E.textContent = "", E.style.opacity = "0";
			}, M = () => {
				if (!k || A) return;
				let e = C(), n = c(g, _) / a, r = w.getBoundingClientRect(), i = r.width || 1, s = r.height || 1;
				E.textContent = "", E.style.opacity = "1";
				let x = f * e.channel;
				["#ff0040", "#00ffd0"].forEach((t, n) => {
					let r = document.createElement("span"), i = (n ? -1 : 1) * x * c(.6, 1);
					r.style.cssText = `position:absolute;inset:0;background:${t};mix-blend-mode:screen;opacity:${(.22 * e.channel).toFixed(2)};transform:translateX(${i.toFixed(1)}px)`, E.appendChild(r);
				});
				let S = Math.round(c(m, h) * e.slices);
				for (let e = 0; e < S; e += 1) {
					let e = c(s * .02, s * .16), n = c(0, Math.max(0, s - e)), r = c(-p, p), i = document.createElement("span");
					i.style.cssText = `position:absolute;left:0;right:0;top:${n.toFixed(1)}px;height:${e.toFixed(1)}px;background:${l[Math.floor(o() * l.length)]};mix-blend-mode:${t.blendMode || "screen"};opacity:${c(.35, .85).toFixed(2)};transform:translateX(${r.toFixed(1)}px)`, E.appendChild(i);
				}
				let T = Math.round(b * e.artifacts);
				for (let e = 0; e < T; e += 1) {
					let e = c(Number(t.artifactMinSize ?? 6), Number(t.artifactMaxSize ?? 42)), n = c(4, 16), r = document.createElement("span");
					r.style.cssText = `position:absolute;left:${c(0, i - e).toFixed(1)}px;top:${c(0, s - n).toFixed(1)}px;width:${e.toFixed(1)}px;height:${n.toFixed(1)}px;background:${l[Math.floor(o() * l.length)]}`, E.appendChild(r);
				}
				O(() => {
					j(), d && O(M, c(v, y) / u);
				}, n);
			};
			return V().reducedMotion ? {
				el: e,
				type: "glitch",
				preset: r,
				pause() {},
				resume() {},
				destroy() {
					E.remove(), T();
				}
			} : (O(M, Math.max(0, Number(t.delay ?? 0)) * 1e3 + c(v, y) / u), {
				el: e,
				type: "glitch",
				preset: r,
				fire: M,
				pause() {
					k && (A = !0, j());
				},
				resume() {
					k && (A = !1, O(M, c(v, y) / u));
				},
				destroy() {
					k && (k = !1, D.forEach(clearTimeout), E.remove(), T());
				}
			});
		}
		if (r === "wave") {
			let n = Array.isArray(t.colors) ? t.colors.filter((e) => typeof e == "string" && CSS.supports("color", e)) : [];
			if (n.length) {
				let t = document.createElement("span");
				t.style.display = "none", e.appendChild(t), n.forEach((e, r) => {
					t.style.color = e, n[r] = getComputedStyle(t).color;
				}), t.remove();
			}
			let r = typeof t.blendMode == "string" && CSS.supports("mix-blend-mode", t.blendMode) ? t.blendMode : null, a = e.style.getPropertyValue("mix-blend-mode"), o = e.style.getPropertyPriority("mix-blend-mode"), c = null, l = `kt-glitch-wave-${Math.random().toString(36).slice(2, 9)}`, p = Math.round(G(Number(t.channelOffset ?? 8), 1, 40) * i), m = "http://www.w3.org/2000/svg", h = document.createElementNS(m, "svg");
			h.setAttribute("aria-hidden", "true"), h.setAttribute("focusable", "false"), h.style.cssText = "position:absolute;width:0;height:0;overflow:hidden;pointer-events:none;";
			let g = document.createElementNS(m, "filter");
			g.setAttribute("id", l), g.setAttribute("x", "-15%"), g.setAttribute("y", "-15%"), g.setAttribute("width", "130%"), g.setAttribute("height", "130%");
			let _ = document.createElementNS(m, "feTurbulence");
			_.setAttribute("type", "fractalNoise"), _.setAttribute("baseFrequency", "0.0008 0.06"), _.setAttribute("numOctaves", "1"), _.setAttribute("seed", String(Math.floor(Number(t.seed ?? 7)) || 7)), _.setAttribute("result", "noise");
			let v = Number(t.duration), y = Number.isFinite(v) ? Math.max(42, v * 1e3 / u) : Math.max(600, 2600 / u), b = Math.max(0, Number(t.delay) || 0), x = b <= 10 ? b * 1e3 : b, S = e.style.getPropertyValue("filter"), C = e.style.getPropertyPriority("filter"), w = e.hasAttribute("style"), T = -x, E = null, D = null, O = !0, k = !1, A = f !== "hover" && f !== "scroll" && f !== "view", j = !1, M = !1, N = () => {
				M &&= (r !== null && (a ? e.style.setProperty("mix-blend-mode", a, o) : e.style.removeProperty("mix-blend-mode")), S ? e.style.setProperty("filter", S, C) : e.style.removeProperty("filter"), !w && !e.style.length && e.removeAttribute("style"), !1);
			}, P = () => {
				clearTimeout(D), D = null, E !== null && (T += performance.now() - E), E = null;
			}, F = () => {
				if (!O || k || !A || j || document.hidden) return;
				let t = performance.now();
				if (E !== null && (T += t - E), E = t, !d && T >= y) {
					j = !0, E = null, N();
					return;
				}
				if (T >= 0) {
					M ||= (e.style.setProperty("filter", `${S ? S + " " : ""}url(#${l})`, C), r !== null && e.style.setProperty("mix-blend-mode", r, o), !0);
					let t = T % y / y;
					if (c) {
						let e = n[Math.floor(t * n.length)];
						c.getAttribute("flood-color") !== e && c.setAttribute("flood-color", e);
					}
					let i = `0.0008 ${(.055 + ((t < .5 ? t * 2 : (1 - t) * 2) ** 1.6 - .5) * .07 * s).toFixed(4)}`;
					_.getAttribute("baseFrequency") !== i && _.setAttribute("baseFrequency", i);
				}
				D = setTimeout(() => {
					D = null, F();
				}, T < 0 ? -T : 42);
			}, I = () => {
				D === null && F();
			}, L = (e) => {
				O && A !== e && (P(), A = e, A ? (T = -x, j = !1, I()) : N());
			}, R = () => L(!0), z = () => L(!1), B = () => {
				document.hidden ? P() : I();
			}, V = null, H = document.createElementNS(m, "feDisplacementMap");
			if (H.setAttribute("in", "SourceGraphic"), H.setAttribute("in2", "noise"), H.setAttribute("scale", String(p)), H.setAttribute("xChannelSelector", "R"), H.setAttribute("yChannelSelector", "G"), g.appendChild(_), g.appendChild(H), n.length) {
				H.setAttribute("result", "warped"), c = document.createElementNS(m, "feFlood"), c.setAttribute("flood-opacity", "0.35"), c.setAttribute("flood-color", n[0]);
				let e = document.createElementNS(m, "feComposite");
				e.setAttribute("in2", "warped"), e.setAttribute("operator", "atop"), g.append(c, e);
			}
			return h.appendChild(g), document.body.appendChild(h), f === "hover" ? (e.addEventListener("pointerenter", R), e.addEventListener("pointerleave", z)) : (f === "scroll" || f === "view") && (typeof IntersectionObserver == "function" ? (V = new IntersectionObserver((e) => {
				e.forEach((e) => L(e.isIntersecting));
			}, { threshold: .4 }), V.observe(e)) : A = !0), document.addEventListener("visibilitychange", B), I(), {
				el: e,
				type: "glitch",
				replay: () => {
					O && (P(), T = 0, k = j = !1, A = !0, I());
				},
				pause: () => {
					O && !k && (P(), k = !0);
				},
				resume: () => {
					O && k && (k = !1, I());
				},
				destroy: () => {
					O && (O = !1, P(), e.removeEventListener("pointerenter", R), e.removeEventListener("pointerleave", z), V?.disconnect(), document.removeEventListener("visibilitychange", B), h.remove(), N());
				}
			};
		}
		if (r === "crt" || r === "vcr") {
			let t = e.tagName === "IMG" ? e : e.querySelector?.("img"), a = e.tagName === "IMG" ? e.parentElement : e;
			if (t && a) {
				let o = r === "vcr", c = Z(a, ["position", "overflow"]), l = Z(t, [
					"filter",
					"animation",
					"animation-play-state"
				]), d = t.style.filter;
				getComputedStyle(a).position === "static" && (a.style.position = "relative"), a.style.overflow = "hidden";
				let f = .08 * i, p = .035 * i, m = document.createElement("div");
				m.className = "kt-glitch-crt", m.setAttribute("aria-hidden", "true"), m.style.cssText = `position:absolute;inset:0;z-index:3;pointer-events:none;border-radius:inherit;overflow:hidden;background:repeating-linear-gradient(0deg,rgba(0,0,0,${f}) 0,rgba(0,0,0,${f}) 1px,transparent 1px,transparent 3px),repeating-linear-gradient(90deg,rgba(255,40,40,${p}) 0,rgba(255,40,40,${p}) 1px,rgba(40,255,90,${p}) 1px,rgba(40,255,90,${p}) 2px,rgba(60,120,255,${p}) 2px,rgba(60,120,255,${p}) 3px);box-shadow:inset 0 0 ${o ? 70 : 110}px rgba(0,0,0,${o ? .45 : .4}),inset 0 0 20px rgba(0,0,0,.28);animation:${s > 0 ? `kt-crt-flicker ${(o ? 2.2 : 3.4) / u}s ease-in-out infinite` : "none"};`;
				let h = document.createElement("div");
				h.style.cssText = `position:absolute;left:0;right:0;height:${o ? 22 : 34}%;pointer-events:none;background:linear-gradient(to bottom,transparent,rgba(255,255,255,${o ? .04 : .07}) 45%,rgba(255,255,255,${o ? .08 : .11}) 55%,transparent);filter:blur(1px);animation:kt-crt-roll ${(o ? 4.5 : 8) / u}s linear infinite;`, m.appendChild(h), t.style.filter = `${d ? d + " " : ""}saturate(${o ? 1.18 : 1.08}) contrast(1.06) brightness(1.02)`;
				let g = null, _ = null;
				o && (g = document.createElement("div"), g.style.cssText = `position:absolute;inset:-20%;pointer-events:none;opacity:${.08 * s * i};mix-blend-mode:overlay;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");animation:kt-vcr-noise ${.5 / u}s steps(3,end) infinite;`, m.appendChild(g), _ = document.createElement("div"), _.style.cssText = `position:absolute;left:0;right:0;height:20%;pointer-events:none;background:linear-gradient(to bottom,transparent 0%,rgba(0,0,0,.16) 38%,rgba(0,0,0,.32) 50%,rgba(0,0,0,.16) 62%,transparent 100%);mix-blend-mode:multiply;filter:blur(2px);animation:kt-vcr-track ${3.2 / u}s linear infinite;`, m.appendChild(_), t.style.filter += " drop-shadow(1.2px 0 0 rgba(255,0,60,.4)) drop-shadow(-1.2px 0 0 rgba(0,180,255,.4))", t.style.animation = s > 0 ? `kt-vcr-jitter ${7 / u}s steps(1,end) infinite` : "none"), a.appendChild(m);
				let v = (e) => {
					n || ([
						m,
						h,
						g,
						_
					].forEach((t) => {
						t && (t.style.animationPlayState = e);
					}), o && (t.style.animationPlayState = e));
				};
				return {
					el: e,
					type: "glitch",
					replay: () => {},
					pause: () => v("paused"),
					resume: () => v("running"),
					destroy: () => {
						n || (n = !0, m.remove(), c(), l());
					}
				};
			}
		}
		if (r === "image" || r === "reveal" || r === "datamosh") {
			let o = r === "reveal", s = r === "datamosh", u = e.tagName === "IMG" ? e : e.querySelector?.("img");
			if (!u) return null;
			let p = e.tagName === "IMG" ? e.parentElement : e;
			if (!p) return null;
			let m = Z(p, ["position"]), h = Z(u, ["opacity"]);
			getComputedStyle(p).position === "static" && (p.style.position = "relative");
			let g = document.createElement("canvas");
			g.className = "kt-glitch-image-canvas", g.setAttribute("aria-hidden", "true"), g.style.cssText = "position:absolute;inset:0;width:100%;height:100%;pointer-events:none;border-radius:inherit;z-index:2;opacity:0;", p.appendChild(g);
			let _ = g.getContext("2d", { alpha: !1 }), v = document.createElement("canvas"), y = v.getContext("2d", { alpha: !1 }), b = Math.max(2, Math.round(Number(t.sliceCount ?? 7))), x = !0, S = null, C = /* @__PURE__ */ new Set(), w = (e, t) => {
				let n = setTimeout(() => {
					C.delete(n), x && e();
				}, t);
				C.add(n);
			}, T = () => {
				let e = p.getBoundingClientRect(), t = G(window.devicePixelRatio || 1, 1, 2), n = Math.max(1, Math.round(e.width * t)), r = Math.max(1, Math.round(e.height * t));
				(g.width !== n || g.height !== r) && (g.width = n, g.height = r);
			}, E = (e) => {
				if (!u.naturalWidth) return;
				let t = g.width, n = g.height, r = Math.max(t / u.naturalWidth, n / u.naturalHeight), a = Math.min(u.naturalWidth, t / r), o = Math.min(u.naturalHeight, n / r), l = (u.naturalWidth - a) / 2, d = (u.naturalHeight - o) / 2, f = e * i;
				if (_.filter = "none", _.imageSmoothingEnabled = !0, _.fillStyle = "#000", _.fillRect(0, 0, t, n), !(!s && c() < f * .12)) {
					if (s) {
						_.drawImage(u, l, d, a, o, 0, 0, t, n);
						let e = Math.max(8, Math.round(18 / Math.max(.55, i))), r = Math.max(2, Math.ceil(t / e)), s = Math.max(2, Math.ceil(n / e));
						(v.width !== r || v.height !== s) && (v.width = r, v.height = s), y.imageSmoothingEnabled = !0, y.drawImage(u, l, d, a, o, 0, 0, r, s);
						let p = e, m = Math.max(10, Math.round(b * 3.2));
						_.imageSmoothingEnabled = !1;
						for (let e = 0; e < m; e += 1) {
							let e = Math.floor(c() * Math.max(1, r - 3)), t = Math.floor(c() * Math.max(1, s - 2)), n = Math.max(1, Math.min(r - e, 2 + Math.floor(c() * 8))), i = Math.max(1, Math.min(s - t, 1 + Math.floor(c() * 4))), a = n * p, o = i * p, l = e * p, u = t * p, d = Math.round((c() - .5) * 7 * f) * p, m = c() < .22 ? Math.round((c() - .5) * 2) * p : 0;
							_.globalAlpha = .76 + c() * .24, _.drawImage(v, e, t, n, i, l + d, u + m, a, o), c() < .18 && (_.globalCompositeOperation = "screen", _.fillStyle = c() > .5 ? "rgba(0,225,255,.16)" : "rgba(255,30,100,.14)", _.fillRect(l + d, u + m, a, o), _.globalCompositeOperation = "source-over");
						}
						_.globalAlpha = 1;
						let h = Math.max(2, Math.round(p / 4)), g = Math.max(40, Math.round(t * n / 1800)), x = [
							"#050505",
							"#f5f5f5",
							"#10e8d2",
							"#f32183",
							"#5d72ff"
						];
						_.globalCompositeOperation = "source-over";
						for (let e = 0; e < g; e += 1) {
							let e = Math.floor(c() * t / h) * h, r = Math.floor(c() * n / h) * h, i = h * (1 + Math.floor(c() * 4)), a = h * (1 + Math.floor(c() * 2));
							_.globalAlpha = .08 + c() * .28 * Math.min(1.2, f), _.fillStyle = x[Math.floor(c() * x.length)], _.fillRect(e, r, i, a);
						}
						_.globalAlpha = .22 * Math.min(1.2, f);
						for (let e = 0; e < 2 + Math.round(i); e += 1) {
							let e = Math.floor(c() * n / h) * h;
							_.fillStyle = c() > .55 ? "#050505" : x[2 + Math.floor(c() * 3)], _.fillRect(0, e, t * (.22 + c() * .78), h);
						}
						_.globalAlpha = .1, _.fillStyle = "#000";
						for (let e = 0; e < n; e += 4) _.fillRect(0, e, t, 1);
						_.globalAlpha = 1, _.imageSmoothingEnabled = !0;
						return;
					}
					"filter" in _ && (_.globalCompositeOperation = "screen", _.globalAlpha = .55, _.filter = "hue-rotate(90deg) saturate(3)", _.drawImage(u, l, d, a, o, Math.round(-t * .02 * f), 0, t, n), _.filter = "hue-rotate(-90deg) saturate(3)", _.drawImage(u, l, d, a, o, Math.round(t * .02 * f), 0, t, n), _.filter = "none", _.globalAlpha = 1, _.globalCompositeOperation = "source-over");
					for (let e = 0; e < b; e += 1) {
						let r = Math.floor(e / b * n), i = Math.ceil(n / b), s = c() < .55, p = s ? Math.round((c() - .5) * t * .16 * f) : 0;
						s && c() < .28 && "filter" in _ && (_.filter = `invert(1) brightness(${1 + f * .3})`), _.drawImage(u, l, d + r / n * o, a, i / n * o, p, r, t, i), _.filter = "none";
					}
					_.globalAlpha = .18 * f, _.fillStyle = "#000";
					for (let e = 0; e < n; e += 4) _.fillRect(0, e, t, 1);
					_.globalAlpha = 1;
				}
			};
			o && (u.style.opacity = "0");
			let D = () => {
				if (!x) return;
				let e = o ? Math.max(200, Number(t.duration ?? 1.15) * 1e3) / a : s ? Math.max(220, Number(t.duration ?? .48) * 1e3) / a : (140 + c() * 260) / a, n = performance.now();
				g.style.opacity = "1", T();
				let r = (t) => {
					if (!x) return;
					let i = Math.min(1, (t - n) / e);
					E(o ? 1 - i : s ? .35 + Math.sin(i * Math.PI) * .8 : 1 - i * .5), i < 1 ? S = requestAnimationFrame(r) : o ? (u.style.opacity = "1", g.style.opacity = "0") : (g.style.opacity = "0", d && w(D, l(s ? 900 + c() * 2100 : 700 + c() * 1800)));
				};
				S = requestAnimationFrame(r);
			}, O = null, k = null;
			if (f === "hover") O = () => {
				x = !0, D();
			}, k = () => {
				C.forEach(clearTimeout), C.clear(), S != null && cancelAnimationFrame(S), g.style.opacity = "0";
			}, p.addEventListener("pointerenter", O), p.addEventListener("pointerleave", k);
			else {
				let e = Number(t.delay ?? .4);
				w(D, e <= 10 ? e * 1e3 : e);
			}
			return {
				el: e,
				type: "glitch",
				replay: () => {
					n || (x = !0, o && (u.style.opacity = "0"), D());
				},
				pause: () => {
					n || (x = !1, C.forEach(clearTimeout), C.clear(), S != null && cancelAnimationFrame(S), g.style.opacity = "0");
				},
				resume: () => {
					!n && !x && (x = !0, w(D, 200));
				},
				destroy: () => {
					n || (n = !0, x = !1, C.forEach(clearTimeout), C.clear(), S != null && cancelAnimationFrame(S), O && p.removeEventListener("pointerenter", O), k && p.removeEventListener("pointerleave", k), o && h(), g.remove(), m());
				}
			};
		}
		let p = e.innerHTML, m = e.getAttribute("style"), h = se(e, ["aria-label"]), g = e.textContent || "", _ = Aa(e), v = t.blendMode || (_ ? "screen" : "multiply"), y = Array.isArray(t.colors) && t.colors.length >= 2 ? t.colors : _ ? [
			"rgba(255,0,60,.9)",
			"rgba(0,255,0,.85)",
			"rgba(61,139,255,.9)"
		] : [
			"#ff0040",
			"#00b894",
			"#2f6bff"
		];
		if (e.tagName === "IMG" || e.querySelector && e.querySelector("img") || !g || !String(g).trim()) return {
			el: e,
			type: "glitch",
			replay() {},
			pause() {},
			resume() {},
			destroy() {}
		};
		e.setAttribute("aria-label", g), e.innerHTML = "", e.style.position = "relative", e.style.display = "inline-block";
		let b = document.createElement("span");
		b.style.cssText = "position:relative;z-index:2;display:block;white-space:inherit;font:inherit;letter-spacing:inherit;text-align:inherit;will-change:transform;", b.setAttribute("aria-hidden", "true");
		let x = document.createElement("span");
		x.textContent = g, x.style.cssText = "position:relative;display:block;white-space:inherit;font:inherit;letter-spacing:inherit;text-align:inherit;will-change:transform;", b.appendChild(x), e.appendChild(b);
		let S = y.slice(0, 3).map((e, t) => {
			let n = document.createElement("span");
			return n.textContent = g, n.setAttribute("aria-hidden", "true"), n.style.cssText = `position:absolute;inset:0;z-index:${3 + t};display:block;white-space:inherit;font:inherit;letter-spacing:inherit;text-align:inherit;transform-origin:0 0;opacity:0;pointer-events:none;color:${e};mix-blend-mode:${v};will-change:transform,clip-path;`, b.appendChild(n), n;
		}), C = null, w = /* @__PURE__ */ new Set(), T = /* @__PURE__ */ new Set(), E = /* @__PURE__ */ new Set(), D = /* @__PURE__ */ new Set(), O = !0, k = (e, t) => {
			let n = setTimeout(() => {
				w.delete(n), O && e();
			}, Math.max(0, t));
			return w.add(n), n;
		}, A = (e, t, n) => {
			let r = e.animate(t, n);
			return T.add(r), r.finished.catch(() => {}).finally(() => T.delete(r)), r;
		}, j = () => {
			w.forEach(clearTimeout), w.clear(), T.forEach((e) => e.cancel()), T.clear(), D.forEach(cancelAnimationFrame), D.clear(), E.forEach((e) => e.remove()), E.clear(), x.textContent = g, S.forEach((e) => {
				e.style.opacity = "0";
			});
		}, M = () => {
			if (!O) return;
			let e = Number(t.duration), n = (Number.isFinite(e) ? Math.max(.05, e) * 1e3 : 170 + c() * 280) / a, r = () => {
				let e = Math.round(c() * 82), t = Math.round(4 + c() * 20 * i);
				return `inset(${e}% 0 ${Math.max(0, 100 - e - t)}% 0)`;
			}, o = (c() - .5) * 18 * i, s = (c() - .5) * 5 * i, u = Math.max(2, Math.round(3 + i)), f = [
				-1,
				0,
				1
			];
			S.forEach((e, t) => {
				let i = f[t] ?? 0;
				A(e, [
					{
						opacity: .9,
						clipPath: r(),
						webkitClipPath: r(),
						transform: `translate(${o * i}px,${s * i}px)`
					},
					{
						opacity: .85,
						clipPath: r(),
						webkitClipPath: r(),
						transform: `translate(${-o * i * .6}px,${-s * i}px)`,
						offset: .5
					},
					{
						opacity: 0,
						clipPath: "inset(0 0 0 0)",
						webkitClipPath: "inset(0 0 0 0)",
						transform: "translate(0,0)"
					}
				], {
					duration: n,
					delay: t * 18,
					easing: `steps(${u}, end)`,
					fill: "forwards"
				});
			}), A(x, [
				{ transform: "skewX(0deg)" },
				{
					transform: `skewX(${1.8 * i}deg)`,
					offset: .33
				},
				{
					transform: `skewX(${-1.4 * i}deg)`,
					offset: .66
				},
				{ transform: "skewX(0deg)" }
			], {
				duration: n,
				easing: `steps(${u}, end)`
			}), d && k(M, l(520 + c() * 1400));
		}, N = () => {
			if (!O) return;
			let e = Number(t.duration), n = (Number.isFinite(e) ? Math.max(.05, e) * 1e3 : 320 + c() * 320) / a, r = 40 / a, o = Math.max(3, Math.round(n / r)), s = 0, u = () => {
				if (!O) return;
				s += 1;
				let e = s / o;
				x.textContent = Array.from(g, (t) => /^\s$/.test(t) ? t : c() > e * (1.35 - Math.min(.9, .3 * i)) ? ja[Math.floor(c() * 48)] : t).join(""), s < o ? k(u, r) : (x.textContent = g, d && k(N, l(620 + c() * 1100)));
			};
			u();
		}, P = () => {
			let e = b.getBoundingClientRect(), t = [{
				left: 0,
				top: 0,
				width: e.width,
				height: e.height
			}];
			if (typeof document.createRange != "function") return t;
			let n = [];
			try {
				let e = document.createRange();
				e.selectNodeContents(x), n = Array.from(e.getClientRects());
			} catch {
				return t;
			}
			let r = n.filter((e) => e.width > 1 && e.height > 1).map((t) => ({
				left: t.left - e.left,
				top: t.top - e.top,
				width: t.width,
				height: t.height
			}));
			return r.length ? r : t;
		}, F = () => {
			if (!O) return;
			let e = Math.max(180, Number(t.duration ?? .42) * 1e3) / a, n = Math.max(4, Math.round(5 + i * 2));
			A(x, [
				{
					transform: "translate(0,0)",
					filter: "none"
				},
				{
					transform: `translate(${Math.round(2 * i)}px,0)`,
					filter: "contrast(1.3)",
					offset: .18
				},
				{
					transform: `translate(${Math.round(-3 * i)}px,${Math.round(1 * i)}px)`,
					filter: "contrast(1.55)",
					offset: .52
				},
				{
					transform: "translate(0,0)",
					filter: "none"
				}
			], {
				duration: e,
				easing: `steps(${n}, end)`
			});
			let r = b.getBoundingClientRect(), o = P(), s = o.reduce((e, t) => Math.min(e, t.height), Infinity), u = Math.max(4, Math.round(Math.min(s || r.height || 24, 40) / 7)), f = (e) => Math.max(1, Math.ceil(e.width / u)) * Math.max(1, Math.ceil(e.height / u)), p = o.reduce((e, t) => e + f(t), 0), m = Math.min(p, Math.max(14, Math.round(18 + i * 8)));
			for (let t = 0; t < m; t += 1) {
				let t = document.createElement("span"), a = c() * p, s = o[o.length - 1];
				for (let e of o) if (a -= f(e), a <= 0) {
					s = e;
					break;
				}
				let l = Math.max(1, Math.ceil(s.width / u)), d = Math.max(1, Math.ceil(s.height / u)), m = Math.floor(c() * l), h = Math.floor(c() * d), _ = 1 + Math.floor(c() * 3), v = 1 + Math.floor(c() * 2), y = s.left + m * u, x = s.top + h * u, S = Math.min(s.left + s.width - y, _ * u), C = Math.min(s.top + s.height - x, v * u), w = Math.max(0, r.width - y - S), T = Math.max(0, r.height - x - C);
				t.textContent = g, t.setAttribute("aria-hidden", "true"), t.style.cssText = `position:absolute;z-index:8;inset:0;display:block;white-space:inherit;font:inherit;letter-spacing:inherit;text-align:inherit;color:inherit;pointer-events:none;clip-path:inset(${x}px ${w}px ${T}px ${y}px);`, b.appendChild(t), E.add(t);
				let D = Math.round((c() - .5) * 7 * i) * u, O = c() < .35 ? Math.round((c() - .5) * 3) * u : 0;
				A(t, [
					{
						opacity: 0,
						transform: "translate(0,0)"
					},
					{
						opacity: 1,
						transform: `translate(${D}px,${O}px)`,
						offset: .18
					},
					{
						opacity: .92,
						transform: `translate(${-D * .45}px,${-O}px)`,
						offset: .62
					},
					{
						opacity: 0,
						transform: "translate(0,0)"
					}
				], {
					duration: e * (.55 + c() * .45),
					delay: c() * 70,
					easing: `steps(${n}, end)`,
					fill: "forwards"
				}).finished.catch(() => {}).finally(() => {
					t.remove(), E.delete(t);
				});
			}
			let h = document.createElement("canvas"), v = Math.max(1, Math.round(r.width)), y = Math.max(1, Math.round(r.height));
			h.width = v, h.height = y, h.setAttribute("aria-hidden", "true"), h.style.cssText = `position:absolute;inset:0;z-index:7;width:100%;height:100%;pointer-events:none;image-rendering:pixelated;mix-blend-mode:${_ ? "screen" : "multiply"};`, b.appendChild(h), E.add(h);
			let S = h.getContext("2d"), C = performance.now(), w = null, T = (t) => {
				if (D.delete(w), !O || !h.isConnected || t - C >= e) {
					h.remove(), E.delete(h);
					return;
				}
				S.clearRect(0, 0, v, y);
				let n = _ ? [
					"#ffffff",
					"#00f5d4",
					"#ff2d95",
					"#6c7dff",
					"#050505"
				] : [
					"#111111",
					"#00a98f",
					"#e60065",
					"#3155df",
					"#ffffff"
				], r = o.reduce((e, t) => e + t.width * t.height, 0), i = Math.max(18, Math.round(r / 260)), a = () => {
					let e = c() * r;
					for (let t of o) if (e -= t.width * t.height, e <= 0) return t;
					return o[o.length - 1];
				};
				for (let e = 0; e < i; e += 1) {
					let e = a(), t = e.left + Math.floor(c() * Math.max(1, Math.ceil(e.width / u))) * u, r = e.top + Math.floor(c() * Math.max(1, Math.ceil(e.height / u))) * u;
					S.globalAlpha = .15 + c() * .55, S.fillStyle = n[Math.floor(c() * n.length)], S.fillRect(t, r, Math.min(u * (1 + Math.floor(c() * 3)), e.left + e.width - t), u);
				}
				let s = a();
				S.globalAlpha = .28, S.fillStyle = n[Math.floor(c() * n.length)], S.fillRect(s.left, s.top + Math.floor(c() * Math.max(1, Math.ceil(s.height / u))) * u, s.width, Math.max(1, Math.round(u / 2))), S.globalAlpha = 1, w = requestAnimationFrame(T), D.add(w);
			};
			w = requestAnimationFrame(T), D.add(w), d && k(F, l(700 + c() * 1700));
		}, I = () => {
			if (!O) return;
			C || (C = document.createElement("span"), C.setAttribute("aria-hidden", "true"), C.style.cssText = `position:absolute;inset:0;z-index:6;pointer-events:none;border-radius:inherit;background:repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,${.13 * i}) 2px,rgba(0,0,0,${.13 * i}) 4px);opacity:0;transition:opacity .2s var(--kt-ease-ui, ease);`, e.appendChild(C)), C.style.opacity = "1";
			let n = Number(t.duration), r = (Number.isFinite(n) ? Math.max(.05, n) * 1e3 : 900 + c() * 700) / a, o = 4 * i;
			A(e, [
				{
					opacity: 1,
					filter: "none",
					transform: "none"
				},
				{
					opacity: .82,
					filter: "brightness(1.35) hue-rotate(6deg)",
					transform: `translateX(${o}px)`,
					offset: .08
				},
				{
					transform: `translateX(${-o}px)`,
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
					transform: `translateX(${-o * .5}px)`,
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
				duration: r,
				easing: "linear"
			}), k(() => {
				C && (C.style.opacity = "0"), d && O && k(I, l(900 + c() * 1500));
			}, r);
		}, L = () => {
			r === "noise" ? N() : r === "pixel" ? F() : r === "crt" ? I() : M();
		}, R = null, z = null, B = null;
		if (f === "hover") R = () => {
			O = !0, L();
		}, z = () => {
			j();
		}, e.addEventListener("pointerenter", R), e.addEventListener("pointerleave", z);
		else if (f === "scroll" || f === "view") B = new IntersectionObserver((e) => {
			e.forEach((e) => {
				e.isIntersecting && L();
			});
		}, { threshold: .4 }), B.observe(e);
		else {
			let e = Number(t.delay ?? (r === "noise" ? .7 : r === "pixel" ? .5 : .35));
			k(L, e <= 10 ? e * 1e3 : e);
		}
		return {
			el: e,
			type: "glitch",
			replay: () => {
				n || (j(), O = !0, L());
			},
			pause: () => {
				n || (O = !1, j());
			},
			resume: () => {
				n || O || (O = !0, k(L, 120));
			},
			destroy: () => {
				n || (n = !0, O = !1, j(), R && e.removeEventListener("pointerenter", R), z && e.removeEventListener("pointerleave", z), B?.disconnect(), e.innerHTML = p, m == null ? e.removeAttribute("style") : e.setAttribute("style", m), h());
			}
		};
	},
	fallback(e) {
		return this.reduced(e);
	},
	reduced(e) {
		return {
			el: e,
			type: "glitch",
			pause() {},
			resume() {},
			destroy: se(e, ["aria-label"])
		};
	}
};
function Na(e, t, n, r, i) {
	let a = Math.max(0, Math.min(i, Math.min(n, r) / 2)), o = Math.abs(e - n / 2) - (n / 2 - a), s = Math.abs(t - r / 2) - (r / 2 - a);
	return Math.hypot(Math.max(o, 0), Math.max(s, 0)) + Math.min(Math.max(o, s), 0) - a;
}
function Pa(e, t, n, r, i) {
	let a = e.createImageData(t, n), o = Math.max(1, i);
	for (let e = 0; e < n; e += 1) for (let i = 0; i < t; i += 1) {
		let s = -Na(i + .5, e + .5, t, n, r), c = s <= 0 || s >= o ? 0 : 1 - s / o, l = Math.sin(c * Math.PI / 2), u = (e * t + i) * 4;
		if (l === 0) a.data[u] = 128, a.data[u + 1] = 128;
		else {
			let o = (Na(i + 1.5, e + .5, t, n, r) - Na(i - .5, e + .5, t, n, r)) / 2, s = (Na(i + .5, e + 1.5, t, n, r) - Na(i + .5, e - .5, t, n, r)) / 2, c = Math.hypot(o, s) || 1;
			a.data[u] = Math.round(128 - o / c * l * 127), a.data[u + 1] = Math.round(128 - s / c * l * 127);
		}
		a.data[u + 2] = 128, a.data[u + 3] = 255;
	}
	return a;
}
function Fa() {
	return typeof navigator < "u" && /(?:Chrome|Chromium|Edg)\//.test(navigator.userAgent) && typeof CSS < "u" && typeof CSS.supports == "function" && CSS.supports("backdrop-filter", "url(#kt-glass-probe)");
}
function Ia() {
	return typeof CSS < "u" && typeof CSS.supports == "function" && (CSS.supports("backdrop-filter", "blur(4px)") || CSS.supports("-webkit-backdrop-filter", "blur(4px)"));
}
//#endregion
//#region src/modules/cardGlow.js
function La(e, t = !1) {
	return e == null ? t : e !== !1 && e !== "false" && e !== 0 && e !== "0";
}
var Ra = {
	create(e, t = {}) {
		if (t.disableOnMobile === !0 && typeof window < "u" && window.matchMedia?.("(hover: none), (pointer: coarse)").matches) return null;
		let n = t.mode || t.preset || "spotlight", r = getComputedStyle(e), i = Z(e, [
			"position",
			"zIndex",
			"overflow",
			"isolation"
		]);
		r.position === "static" && (e.style.position = "relative"), n === "aurora" || n === "comet" ? r.zIndex === "auto" && (e.style.zIndex = "1") : n === "glass" ? r.overflow === "visible" && (e.style.overflow = "hidden") : (r.overflow === "visible" && (e.style.overflow = "hidden"), e.style.isolation = "isolate");
		let a = Math.max(24, Number(t.radius ?? 180)), o = G(Number(t.opacity ?? t.intensity ?? .72), 0, 1), s = Math.max(0, Number(t.blur ?? 14)), c = Number(t.spread ?? 0), l = t.follow !== !1, u = Math.max(.1, Number(t.sensitivity ?? 1)), d = G(Number(t.smoothing ?? t.speed ?? .16), .01, 1), f = t.color || t.color1 || "rgba(120,150,255,.58)", p = t.color2 || "rgba(148,255,226,.34)", m = t.shadowCss || "", h = La(t.shadow, !1) || !!String(m).trim(), g = t.shadowColor || "#111827", _ = G(Number(t.shadowOpacity ?? .24), 0, 1), v = Math.max(0, Number(t.shadowBlur ?? 32)), y = Number(t.shadowSpread ?? -10), b = Number(t.shadowX ?? 0), x = Number(t.shadowY ?? 12), S = Math.max(0, Number(t.shadowFollow ?? 12)), C = t.shadowHoverOnly === !0, w = Hi(e, "card-glow", {
			enabled: h,
			color: g,
			opacity: _,
			blur: v,
			spread: y,
			x: b,
			y: x,
			inset: t.shadowInset === !0,
			css: m,
			active: h && !C
		}), T = 20, E = !1, D = "", O = null, k = null, A = document.createElement("span");
		A.className = `kt-card-glow kt-card-glow-${n}`, A.setAttribute("aria-hidden", "true"), A.style.cssText = "position:absolute;inset:0;z-index:0;border-radius:inherit;pointer-events:none;overflow:hidden;opacity:0;transition:opacity .2s var(--kt-ease-ui, ease);";
		let j = document.createElement("span");
		j.className = "kt-card-glow-spotlight", j.style.cssText = `position:absolute;left:${-a}px;top:${-a}px;width:${a * 2}px;height:${a * 2}px;border-radius:50%;background:radial-gradient(circle,${f} 0%,transparent 70%);filter:blur(${s}px);opacity:${o};mix-blend-mode:${t.blendMode || "screen"};will-change:transform;`, A.appendChild(j);
		let M = La(t.surface ?? t.reflection, !1), N = null;
		if (M) {
			N = document.createElement("span"), N.className = "kt-card-glow-surface";
			let e = G(Number(t.surfaceOpacity ?? .38), 0, 1), n = Math.max(0, Number(t.surfaceBlur ?? 0)), r = t.surfaceBlend || "soft-light";
			N.style.cssText = `position:absolute;inset:${Number(t.surfaceInset ?? 0)}px;border-radius:inherit;opacity:${e};mix-blend-mode:${r};filter:blur(${n}px);will-change:background;`, A.appendChild(N);
		}
		let P = La(t.borderGlow ?? t.luminousBorder, n === "border"), F = null;
		if (P) {
			F = document.createElement("span"), F.className = "kt-card-glow-border";
			let e = Math.max(1, Number(t.borderWidth ?? 1.5)), n = G(Number(t.borderOpacity ?? .8), 0, 1);
			F.style.cssText = `position:absolute;inset:${Number(t.borderInset ?? c)}px;border-radius:inherit;padding:${e}px;opacity:${n};filter:blur(${Math.max(0, Number(t.borderBlur ?? 0))}px);background:radial-gradient(${Math.max(40, Number(t.borderRadius ?? a * .75))}px circle at var(--kt-x,50%) var(--kt-y,50%),${t.borderColor || f},${t.borderColor2 || p} 42%,transparent 74%);-webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);mask-composite:exclude;will-change:background;`, A.appendChild(F);
		}
		if (n === "comet") {
			let e = Math.max(1, Number(t.borderWidth ?? 2)), n = t.borderColor || t.color || "rgba(123,159,255,1)", r = t.borderColor2 || t.color2 || "rgba(91,232,190,.9)", i = Math.max(.8, Number(t.cycleDuration ?? t.speed ?? 3));
			if (A.style.cssText = `position:absolute;inset:0;z-index:0;border-radius:inherit;pointer-events:none;opacity:${+!!La(t.alwaysOn, !0)};transition:opacity .35s var(--kt-ease-ui, ease);`, j.style.cssText = `position:absolute;inset:0;border-radius:inherit;padding:${e}px;background:conic-gradient(from var(--kt-angle,0deg),transparent 0deg,${n} 80deg,${r} 160deg,transparent 280deg);-webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);mask-composite:exclude;opacity:${o};animation:kt-border-spin ${i}s linear infinite;filter:blur(${Math.max(0, Number(t.blur ?? 0))}px);will-change:background;`, s > 0 && t.halo !== !1) {
				let e = j.cloneNode(!1);
				e.className = "kt-card-glow-comet-haze", e.style.filter = `blur(${Math.max(6, s)}px)`, e.style.opacity = String(o * .7), A.appendChild(e);
			}
		} else if (n === "aurora") {
			let e = Math.max(2, Number(t.spread ?? 6)), n = Math.max(1, Number(t.cycleDuration ?? t.speed ?? 6)), r = t.color1 || t.color || "rgba(88,150,255,.55)", i = t.color2 || "rgba(94,234,195,.45)";
			A.style.cssText = `position:absolute;inset:${-e}px;z-index:-1;border-radius:inherit;pointer-events:none;opacity:0;transition:opacity .45s var(--kt-ease-ui, ease);`, j.style.cssText = `position:absolute;inset:0;border-radius:inherit;background:conic-gradient(from var(--kt-angle,0deg),${r},${i},${r});filter:blur(${Math.max(4, s)}px);opacity:${o};animation:kt-border-spin ${n}s linear infinite;will-change:filter;`;
		} else if (n === "shine") j.style.cssText = `position:absolute;top:0;bottom:0;left:-55%;width:42%;border-radius:0;background:linear-gradient(90deg,transparent,${f},transparent);filter:blur(${s}px);opacity:${o};transform:skewX(-20deg);will-change:transform;`;
		else if (n === "glass") {
			let e = Math.max(0, Number(t.glassBlur ?? 14)), n = Math.max(0, Number(t.glassSaturate ?? 1.7)), r = Math.max(.5, Number(t.glassRim ?? 1.5)), i = G(Number(t.glassRimOpacity ?? .9), 0, 1), a = G(Number(t.glassSheen ?? .3), 0, 1), o = t.glassRefraction !== "off" && t.glassRefraction !== !1;
			T = Math.max(1, Number(t.glassDepth ?? 20)), E = Ia() && o && Fa(), D = E ? `kt-glass-${Math.random().toString(36).slice(2, 10)}` : "";
			let s = `${E ? `url(#${D}) ` : ""}blur(${e}px) saturate(${n})`, c = t.glassTint || "rgba(255,255,255,.10)";
			A.style.cssText = `position:absolute;inset:0;z-index:0;border-radius:inherit;pointer-events:none;overflow:hidden;opacity:1;background:${c};box-shadow:inset 0 1px 1px #ffffff40,inset 0 -1px 2px #00000020;`, Ia() && (A.style.backdropFilter = s, A.style.webkitBackdropFilter = s), j.style.cssText = `position:absolute;inset:0;border-radius:inherit;padding:${r}px;opacity:${i};-webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);mask-composite:exclude;will-change:background;`;
			let l = document.createElement("span");
			l.className = "kt-card-glow-sheen", l.style.cssText = `position:absolute;inset:0;border-radius:inherit;pointer-events:none;opacity:${a};`, A.appendChild(l), O = l;
		}
		e.insertBefore(A, e.firstChild);
		let I = [];
		Array.from(e.children).forEach((e) => {
			e !== A && getComputedStyle(e).position === "static" && (I.push(Z(e, ["position"])), e.style.position = "relative");
		});
		let L = () => {
			let e = document.createElementNS("http://www.w3.org/2000/svg", "svg");
			return e.setAttribute("aria-hidden", "true"), e.style.cssText = "position:absolute;width:0;height:0;overflow:hidden;", e.innerHTML = `<filter id="${D}" color-interpolation-filters="sRGB" x="0" y="0" width="100%" height="100%"><feImage x="0" y="0" result="kt-map"></feImage><feDisplacementMap in="SourceGraphic" in2="kt-map" xChannelSelector="R" yChannelSelector="G"></feDisplacementMap></filter>`, A.appendChild(e), {
				svg: e,
				image: e.querySelector("feImage"),
				displace: e.querySelector("feDisplacementMap")
			};
		}, R = () => {
			if (!E) return;
			let t = Math.round(e.clientWidth), n = Math.round(e.clientHeight);
			if (t < 2 || n < 2) return;
			k ||= L();
			let r = document.createElement("canvas");
			r.width = t, r.height = n;
			let i = r.getContext("2d", { willReadFrequently: !1 });
			if (!i) return;
			let a = parseFloat(getComputedStyle(e).borderTopLeftRadius) || 0;
			i.putImageData(Pa(i, t, n, a, T), 0, 0), k.image.setAttribute("href", r.toDataURL()), k.image.setAttribute("width", String(t)), k.image.setAttribute("height", String(n)), k.displace.setAttribute("scale", String(Math.round(T * 1.2)));
		}, z = null;
		if (E && typeof ResizeObserver < "u") {
			let t = "";
			z = new ResizeObserver(() => {
				let n = `${Math.round(e.clientWidth)}x${Math.round(e.clientHeight)}`;
				n !== t && (t = n, R());
			}), z.observe(e);
		} else E && R();
		let B = e.clientWidth * (n === "glass" ? .25 : .5), V = e.clientHeight * (n === "glass" ? .2 : .5), H = B, U = V, K = null, ee = !0, q = !1, J = (e, n) => {
			if (!N) return;
			let r = Math.atan2(n - 50, e - 50) * 180 / Math.PI + 90, i = t.surfaceGradient;
			N.style.background = i || `linear-gradient(${r}deg,transparent 12%,${t.surfaceColor || "rgba(255,255,255,.48)"} 42%,${t.surfaceColor2 || "rgba(145,180,255,.16)"} 55%,transparent 78%)`, N.style.backgroundSize = `${Math.max(100, Number(t.surfaceSize ?? 170))}% ${Math.max(100, Number(t.surfaceSize ?? 170))}%`, N.style.backgroundPosition = `${e}% ${n}%`;
		}, Y = () => {
			if (!ee) return;
			H = W(H, B, d), U = W(U, V, d);
			let t = Math.max(1, e.clientWidth), r = Math.max(1, e.clientHeight), i = G(H / t * 100, 0, 100), a = G(U / r * 100, 0, 100);
			if (w.update(b + (i - 50) / 50 * S, x + (a - 50) / 50 * S, !C || q), A.style.setProperty("--kt-x", `${i}%`), A.style.setProperty("--kt-y", `${a}%`), n === "spotlight" || n === "edge" || n === "border") {
				let t = H, r = U;
				if (n === "edge") {
					let n = e.clientWidth, i = e.clientHeight, a = H, o = n - H, s = U, c = i - U, l = Math.min(a, o, s, c);
					l === a ? t = 0 : l === o ? t = n : r = l === s ? 0 : i;
				}
				j.style.transform = `translate3d(${t}px,${r}px,0)`;
			}
			if (J(i, a), n === "glass") {
				let e = Math.atan2(a - 50, i - 50) * 180 / Math.PI + 90;
				j.style.background = `linear-gradient(${e + 180}deg,rgba(255,255,255,.95) 0%,rgba(255,255,255,.22) 34%,rgba(255,255,255,0) 52%,rgba(255,255,255,.5) 100%)`, O && (O.style.background = `linear-gradient(${e + 180}deg,rgba(255,255,255,.55) 0%,rgba(255,255,255,0) 46%)`);
			}
			K = Math.abs(H - B) > .08 || Math.abs(U - V) > .08 || q && l && n !== "glass" ? requestAnimationFrame(Y) : null;
		}, X = () => {
			ee && K == null && n !== "aurora" && n !== "shine" && n !== "comet" && (K = requestAnimationFrame(Y));
		}, te = (t) => {
			if (!l) return;
			let n = e.getBoundingClientRect();
			if (!n.width || !n.height) return;
			let r = G(((t.clientX - n.left) / n.width - .5) * u + .5, 0, 1), i = G(((t.clientY - n.top) / n.height - .5) * u + .5, 0, 1);
			B = r * n.width, V = i * n.height, X();
		}, ne = (e) => {
			q = !0, A.style.opacity = "1", w.update(b, x, !0), te(e), n === "shine" && j.animate([{ transform: "translateX(0) skewX(-20deg)" }, { transform: "translateX(390%) skewX(-20deg)" }], {
				duration: Math.max(100, Number(t.duration ?? 800)),
				easing: t.ease || "ease-in-out"
			}), X();
		}, re = () => {
			q = !1, B = e.clientWidth * (n === "glass" ? .25 : .5), V = e.clientHeight * (n === "glass" ? .2 : .5), A.style.opacity = n === "glass" ? "1" : La(t.alwaysOn, n === "aurora" || n === "comet") ? String(o) : "0", w.update(b, x, !C), X();
		}, ie = (e) => {
			q = !0, A.style.opacity = "1", w.update(b, x, !0), te(e), A.animate([
				{ filter: "brightness(1)" },
				{
					filter: "brightness(1.5) saturate(1.15)",
					offset: .28
				},
				{ filter: "brightness(1)" }
			], {
				duration: 520,
				easing: "cubic-bezier(.2,.7,.2,1)"
			}), X();
		};
		return e.addEventListener("pointerenter", ne), e.addEventListener("pointermove", te, { passive: !0 }), e.addEventListener("pointerleave", re), e.addEventListener("pointerdown", ie), La(t.alwaysOn, n === "aurora" || n === "comet") && (A.style.opacity = String(o)), J(50, 50), n === "glass" && (A.style.opacity = "1", Y()), {
			el: e,
			type: "cardGlow",
			pause() {
				ee = !1, K != null && cancelAnimationFrame(K), K = null, j.style.animationPlayState = "paused";
			},
			resume() {
				ee || (ee = !0, j.style.animationPlayState = "running", X());
			},
			destroy() {
				ee = !1, z?.disconnect(), z = null, K != null && cancelAnimationFrame(K), e.removeEventListener("pointerenter", ne), e.removeEventListener("pointermove", te), e.removeEventListener("pointerleave", re), e.removeEventListener("pointerdown", ie), A.remove(), I.forEach((e) => e()), w.destroy(), i();
			}
		};
	},
	fallback() {},
	reduced() {}
}, za = /* @__PURE__ */ new Set(), Ba = null;
function Va(e, t = {}) {
	return t.src || e.dataset.src || e.getAttribute("data-src") || e.getAttribute("href") || (e.tagName === "IMG" ? e.currentSrc || e.src : "") || e.querySelector?.("img")?.currentSrc || e.querySelector?.("img")?.src || "";
}
function Ha(e, t, n) {
	let r = document.createElement("button");
	return r.type = "button", r.className = e, r.setAttribute("aria-label", t), r.textContent = n, r;
}
var Ua = {
	viewer: "Media viewer",
	backdrop: "Close viewer",
	close: "Close viewer",
	previous: "Previous item",
	next: "Next item",
	zoomIn: "Zoom in",
	zoomOut: "Zoom out",
	zoomReset: "Reset zoom",
	zoomHint: "Click to type an exact zoom %",
	zoomInput: "Zoom percent",
	thumbnail: "Item {n} of {total}",
	share: "Share",
	download: "Download"
};
function Wa(e) {
	let t = document.createElement("div");
	if (t.id = "kt-lightbox", t.className = "kt-lightbox", t.hidden = !0, t.setAttribute("role", "dialog"), t.setAttribute("aria-modal", "true"), t.setAttribute("aria-label", e("viewer")), t.style.cssText = "position:fixed;inset:0;width:100%;height:100%;margin:0;padding:0;z-index:2147482000;display:none;overflow:hidden;", !document.getElementById("kt-lightbox-style")) {
		let e = document.createElement("style");
		e.id = "kt-lightbox-style", e.textContent = "\n      .kt-lightbox button{transition:background-color .18s var(--kt-ease-ui, ease),border-color .18s var(--kt-ease-ui, ease),transform .18s var(--kt-ease-ui, ease),opacity .18s var(--kt-ease-ui, ease);}\n      .kt-lightbox .kt-lightbox-toolbar button:hover:not(:disabled){background:rgba(255,255,255,.16)!important;border-color:rgba(255,255,255,.3)!important;}\n      .kt-lightbox .kt-lightbox-toolbar button:disabled{opacity:.32;cursor:default;}\n      .kt-lightbox .kt-lightbox-prev:hover,.kt-lightbox .kt-lightbox-next:hover{background:rgba(255,255,255,.14)!important;transform:translateY(-50%) scale(1.06);}\n      .kt-lightbox .kt-lightbox-stage.is-zoomed{cursor:grab;}\n      .kt-lightbox .kt-lightbox-stage.is-panning{cursor:grabbing;}\n      @media (max-width: 760px) {\n        .kt-lightbox .kt-lightbox-toolbar{padding:12px max(16px, env(safe-area-inset-right)) 10px max(16px, env(safe-area-inset-left));justify-content:space-between;}\n        /* On narrow screens the absolutely-centered counter overlaps the zoom /\n           close controls — drop it back into flow so space-between separates them. */\n        .kt-lightbox .kt-lightbox-counter{position:static !important;left:auto !important;top:auto !important;transform:none !important;}\n        .kt-lightbox .kt-lightbox-toolbar button{min-width:34px;height:34px;padding:0 8px;}\n        .kt-lightbox .kt-lightbox-zoom-out,.kt-lightbox .kt-lightbox-zoom-in,.kt-lightbox .kt-lightbox-close{width:34px;padding:0;aspect-ratio:1;}\n        .kt-lightbox .kt-lightbox-prev{left:max(10px, env(safe-area-inset-left)) !important;}\n        .kt-lightbox .kt-lightbox-next{right:max(10px, env(safe-area-inset-right)) !important;}\n        .kt-lightbox .kt-lightbox-info{padding-bottom:calc(22px + env(safe-area-inset-bottom)) !important;}\n      }\n    ", document.head.appendChild(e);
	}
	let n = document.createElement("button");
	n.type = "button", n.className = "kt-lightbox-backdrop", n.setAttribute("aria-label", e("backdrop")), n.style.cssText = "position:absolute;inset:0;width:100%;height:100%;border:0;margin:0;padding:0;background:var(--kt-lightbox-backdrop,rgba(10,10,14,.88));backdrop-filter:blur(var(--kt-lightbox-backdrop-blur,20px)) saturate(1.15);-webkit-backdrop-filter:blur(var(--kt-lightbox-backdrop-blur,20px)) saturate(1.15);cursor:zoom-out;";
	let r = document.createElement("div");
	r.className = "kt-lightbox-shell", r.style.cssText = "position:absolute;inset:0;display:grid;grid-template-rows:auto minmax(0,1fr) auto;pointer-events:none;color:white;";
	let i = document.createElement("div");
	i.className = "kt-lightbox-toolbar", i.style.cssText = "position:relative;z-index:5;display:flex;align-items:center;justify-content:space-between;gap:10px;padding:14px 16px;pointer-events:auto;";
	let a = document.createElement("span");
	a.className = "kt-lightbox-counter", a.style.cssText = "position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);font:600 12.5px/1 ui-monospace,monospace;letter-spacing:.06em;color:rgba(255,255,255,.85);background:rgba(20,20,26,.5);border:1px solid rgba(255,255,255,.12);padding:6px 13px;border-radius:99px;backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);";
	let o = document.createElement("div");
	o.className = "kt-lightbox-actions", o.style.cssText = "display:flex;align-items:center;gap:2px;padding:4px;background:rgba(20,20,26,.5);border:1px solid rgba(255,255,255,.12);border-radius:13px;backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);";
	let s = Ha("kt-lightbox-zoom-out", e("zoomOut"), "−"), c = Ha("kt-lightbox-zoom-reset", e("zoomReset"), "100%"), l = Ha("kt-lightbox-zoom-in", e("zoomIn"), "+"), u = Ha("kt-lightbox-share", e("share"), "↗"), d = Ha("kt-lightbox-download", e("download"), ""), f = Ha("kt-lightbox-close", e("close"), "×");
	[
		s,
		c,
		l,
		u,
		d,
		f
	].forEach((e) => {
		e.style.cssText = "min-width:34px;height:34px;padding:0 8px;display:inline-flex;align-items:center;justify-content:center;border:0;border-radius:9px;background:var(--kt-lightbox-button-bg,transparent);color:var(--kt-lightbox-button-color,white);font:600 15px/1 sans-serif;cursor:pointer;transition:background-color .15s var(--kt-ease-ui, ease);";
	});
	let p = document.createElement("span");
	p.style.cssText = "width:1px;height:18px;margin:0 8px;background:rgba(255,255,255,.16);flex:0 0 auto;", c.style.minWidth = "54px", c.title = e("zoomHint"), u.hidden = !0, u.title = e("share"), u.innerHTML = "<svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' aria-hidden='true'><circle cx='18' cy='5' r='3'/><circle cx='6' cy='12' r='3'/><circle cx='18' cy='19' r='3'/><path d='M8.6 13.5l6.8 4M15.4 6.5l-6.8 4'/></svg>", d.hidden = !0, d.title = e("download"), d.innerHTML = "<svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' aria-hidden='true'><path d='M12 3v12'/><path d='M7 11l5 5 5-5'/><path d='M5 21h14'/></svg>", f.style.fontSize = "22px", o.append(s, c, l, p, u, d, f), o.style.marginLeft = "auto", i.append(a, o);
	let m = document.createElement("div");
	m.className = "kt-lightbox-stage", m.style.cssText = "position:relative;min-width:0;min-height:0;display:grid;place-items:center;overflow:hidden;pointer-events:auto;touch-action:none;";
	let h = document.createElement("div");
	h.className = "kt-lightbox-stage-content", h.style.cssText = "display:flex;flex-direction:column;align-items:center;gap:16px;max-width:100%;max-height:100%;min-height:0;";
	let g = document.createElement("div");
	g.className = "kt-lightbox-media-host", g.style.cssText = "position:relative;display:grid;place-items:center;max-width:100%;min-height:0;will-change:transform;transform-origin:center;";
	let _ = document.createElement("img");
	_.className = "kt-lightbox-image", _.alt = "", _.style.cssText = "display:block;max-width:min(94vw,1800px);max-height:calc(100vh - 230px);width:auto;height:auto;object-fit:contain;border-radius:var(--kt-lightbox-radius,4px);user-select:none;-webkit-user-drag:none;", g.appendChild(_), h.appendChild(g), m.appendChild(h);
	let v = Ha("kt-lightbox-prev", e("previous"), "‹"), y = Ha("kt-lightbox-next", e("next"), "›");
	[v, y].forEach((e) => {
		e.style.cssText = "position:absolute;top:50%;z-index:4;width:48px;height:48px;border:1px solid var(--kt-lightbox-button-border,rgba(255,255,255,.14));border-radius:999px;background:var(--kt-lightbox-button-bg,rgba(255,255,255,.08));backdrop-filter:blur(10px);color:var(--kt-lightbox-button-color,white);font:300 30px/1 sans-serif;transform:translateY(-50%);cursor:pointer;pointer-events:auto;display:grid;place-items:center;padding-bottom:4px;", m.appendChild(e);
	}), v.style.left = "14px", y.style.right = "14px";
	let b = document.createElement("div");
	b.className = "kt-lightbox-caption", b.style.cssText = "max-width:min(860px,92vw);text-align:center;flex:0 0 auto;transition:opacity .25s var(--kt-ease-ui, ease);";
	let x = document.createElement("strong");
	x.className = "kt-lightbox-title", x.style.cssText = "display:block;font:650 15px/1.4 sans-serif;";
	let S = document.createElement("span");
	S.className = "kt-lightbox-description", S.style.cssText = "display:block;margin-top:4px;opacity:.68;font:400 13px/1.45 sans-serif;", b.append(x, S), h.appendChild(b);
	let C = document.createElement("div");
	C.className = "kt-lightbox-info", C.style.cssText = "position:relative;z-index:5;display:flex;flex-direction:column;align-items:center;padding:16px 18px 26px;pointer-events:none;text-align:center;";
	let w = document.createElement("span");
	w.className = "kt-lightbox-meta", w.style.cssText = "font:500 11px/1.4 ui-monospace,monospace;opacity:.55;text-align:center;", C.append(w);
	let T = document.createElement("div");
	T.className = "kt-lightbox-minimap", T.hidden = !0, T.style.cssText = "position:absolute;right:18px;bottom:86px;z-index:6;width:140px;height:90px;border:1px solid rgba(255,255,255,.25);border-radius:8px;overflow:hidden;background:#111;pointer-events:none;box-shadow:0 8px 30px rgba(0,0,0,.35);";
	let E = document.createElement("img");
	E.alt = "", E.style.cssText = "width:100%;height:100%;object-fit:contain;opacity:.65;";
	let D = document.createElement("span");
	D.style.cssText = "position:absolute;border:1px solid white;background:rgba(255,255,255,.08);", T.append(E, D);
	let O = document.createElement("div");
	O.className = "kt-lightbox-custom-ui", O.style.pointerEvents = "auto", i.prepend(O);
	let k = document.createElement("div");
	k.className = "kt-lightbox-filmstrip", k.hidden = !0, k.style.cssText = "position:relative;z-index:5;display:flex;gap:8px;justify-content:center;flex-wrap:nowrap;overflow-x:auto;padding:6px 16px 16px;pointer-events:auto;scrollbar-width:none;", r.append(i, m, k, C), t.append(n, r, T), document.body.appendChild(t);
	let A = null, j = [], M = 0, N = "", P = null, F = 1, I = 0, L = 0, R = !1, z = null, B = 0, V = 0, H = 0, U = 0, W = null, G = !1, K = {
		root: t,
		backdrop: n,
		shell: r,
		toolbar: i,
		stage: m,
		image: _,
		closeButton: f,
		previous: v,
		next: y,
		zoomIn: l,
		zoomOut: s,
		zoomReset: c,
		shareButton: u,
		downloadButton: d,
		info: C,
		title: x,
		description: S,
		meta: w,
		minimap: T,
		custom: O,
		counter: a,
		filmstrip: k
	}, ee = () => {
		let t = A?.thumbnails === !0 && j.length > 1;
		if (k.hidden = !t, _.style.maxHeight = t ? "calc(100vh - 320px)" : "calc(100vh - 230px)", !t) {
			k.innerHTML = "";
			return;
		}
		k.innerHTML = "", j.forEach((t, n) => {
			let r = document.createElement("button");
			r.type = "button", r.className = "kt-lightbox-thumb" + (n === M ? " kt-active" : ""), r.setAttribute("aria-label", e("thumbnail", {
				n: n + 1,
				total: j.length
			})), r.style.cssText = `flex:0 0 auto;width:64px;height:44px;border-radius:6px;overflow:hidden;padding:0;cursor:pointer;background:#111;border:2px solid ${n === M ? "var(--kt-lightbox-accent,#ff5b1c)" : "transparent"};opacity:${n === M ? "1" : ".55"};transition:opacity .16s var(--kt-ease-ui, ease),border-color .16s var(--kt-ease-ui, ease);`;
			let i = document.createElement("img");
			i.src = t.thumb, i.alt = t.alt || "", i.loading = "lazy", i.style.cssText = "width:100%;height:100%;object-fit:cover;", r.appendChild(i), r.addEventListener("click", (e) => {
				e.stopPropagation(), re(n);
			}), k.appendChild(r);
		});
	}, q = () => {
		k.hidden || Array.from(k.children).forEach((e, t) => {
			let n = t === M;
			e.classList.toggle("kt-active", n), e.style.borderColor = n ? "var(--kt-lightbox-accent,#ff5b1c)" : "transparent", e.style.opacity = n ? "1" : ".55";
		});
	}, J = () => {
		let e = A?.minimap !== !1 && F > 1.02;
		if (T.hidden = !e, !e) return;
		let t = Ga(100 / F, 12, 100), n = Ga(100 / F, 12, 100), r = Math.max(1, m.clientWidth * (F - 1) / 2), i = Math.max(1, m.clientHeight * (F - 1) / 2), a = Ga(50 - t / 2 - I / (r * 2) * (100 - t), 0, 100 - t), o = Ga(50 - n / 2 - L / (i * 2) * (100 - n), 0, 100 - n);
		D.style.width = `${t}%`, D.style.height = `${n}%`, D.style.left = `${a}%`, D.style.top = `${o}%`;
	}, Y = () => {
		let e = Math.max(0, m.clientWidth * (F - 1) / 2), t = Math.max(0, m.clientHeight * (F - 1) / 2);
		I = Ga(I, -e, e), L = Ga(L, -t, t), g.style.transform = `translate3d(${I}px,${L}px,0) scale(${F})`, c.querySelector("input") || (c.textContent = `${Math.round(F * 100)}%`);
		let n = Number(A?.minZoom ?? 1), r = Math.max(n, Number(A?.maxZoom ?? 5));
		s.disabled = F <= n + .001, l.disabled = F >= r - .001, m.classList.toggle("is-zoomed", F > 1.001), b.style.opacity = F > 1.02 ? "0" : "1", J();
	}, X = (e, t, n) => {
		let r = Number(A?.minZoom ?? 1), i = Ga(e, r, Math.max(r, Number(A?.maxZoom ?? 5)));
		if (t != null && n != null && i !== F) {
			let e = m.getBoundingClientRect(), r = t - e.left - e.width / 2, a = n - e.top - e.height / 2, o = i / F;
			I = r - (r - I) * o, L = a - (a - L) * o;
		}
		F = i, F <= 1.001 && (I = 0, L = 0), Y();
	}, te = () => {
		F = 1, I = 0, L = 0, Y();
	}, ne = () => {
		if (A?.backdropColor != null || A?.backdropOpacity != null) {
			let e = Ga(Number(A?.backdropOpacity ?? .9), 0, 1);
			n.style.background = A?.backdropColor || `rgba(0,0,0,${e})`;
		} else n.style.background = "var(--kt-lightbox-backdrop,rgba(10,10,14,.88))";
		let e = `blur(${A?.backdropBlur == null ? "var(--kt-lightbox-backdrop-blur,20px)" : `${Math.max(0, Number(A.backdropBlur))}px`}) saturate(1.15)`;
		n.style.backdropFilter = e, n.style.webkitBackdropFilter = e, t.style.setProperty("--kt-lightbox-radius", `${Number(A?.radius ?? 4)}px`), t.className = `kt-lightbox ${A?.className || ""}`.trim(), i.hidden = A?.toolbar === !1;
		let r = typeof location < "u" && /^https?:$/i.test(location.protocol), a = typeof navigator < "u" && typeof navigator.share == "function" && r;
		u.hidden = !(A?.share === !0 && a), d.hidden = A?.download !== !0, p.hidden = u.hidden && d.hidden, C.hidden = A?.info === !1, O.innerHTML = A?.uiTemplate || "", A?.renderUI?.(O, K, A);
	}, re = (e) => {
		if (!j.length) return;
		W?.destroy?.(), W = null;
		let t = M;
		M = (e + j.length) % j.length, A = j[M], te();
		let n = A.transition || "rise";
		if (n === "crossfade" && t !== M && _.getAttribute("src") && g.animate) {
			let e = _.cloneNode(!1);
			e.removeAttribute("data-src"), e.style.cssText = "position:absolute;inset:0;margin:auto;max-width:100%;max-height:100%;object-fit:contain;z-index:3;pointer-events:none;", g.appendChild(e);
			let t = e.animate([{ opacity: 1 }, { opacity: 0 }], {
				duration: 320,
				easing: "ease"
			}), n = () => e.remove();
			t.onfinish = n, t.oncancel = n;
		}
		let r = A.src;
		_.removeAttribute("srcset"), _.removeAttribute("sizes"), _.alt = A.alt || "", _.style.opacity = "1", _.style.filter = "none", _.style.transform = "none", A.lazyEffect ? (_.removeAttribute("src"), _.dataset.src = r, W = A.Kineto?.create("lazy", _, {
			effect: A.lazyEffect,
			...A.lazyOptions || {},
			rootMargin: "0px",
			nativeLazy: !1
		})) : (_.removeAttribute("data-src"), _.src = r), E.src = r, x.textContent = A.title || "", S.textContent = A.description || "";
		let i = j.length > 1;
		if (v.hidden = !i, y.hidden = !i, a.textContent = i ? `${M + 1} / ${j.length}` : "", n !== "none" && n !== "crossfade" && g.animate) {
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
			r && g.animate(r, {
				duration: n === "slide" ? 260 : 200,
				easing: "cubic-bezier(.22,.8,.3,1)"
			});
		}
		ne(), q(), _.onload = () => {
			let e = `${_.naturalWidth || "?"}×${_.naturalHeight || "?"} · ${M + 1}/${j.length}`, t = A.metadata && typeof A.metadata == "object" ? Object.entries(A.metadata).map(([e, t]) => `${e}: ${t}`).join(" · ") : String(A.metadata || "");
			if (w.textContent = t ? `${e} · ${t}` : e, A.onLoad?.(_, A), A.exif && A.src) {
				let e = A.src;
				fetch(e).then((e) => e.arrayBuffer()).then((t) => {
					if (A?.src !== e) return;
					let n = Ka(t);
					n && (w.textContent += ` · ${n}`);
				}).catch(() => {});
			}
		}, A.onChange?.(M, A, K);
	}, ie = () => {
		if (t.hidden) return;
		let e = Math.max(0, Number(A?.duration ?? .12));
		t.style.transition = `opacity ${e}s ease`, t.style.opacity = "0", setTimeout(() => {
			t.hidden = !0, t.style.display = "none", t.style.opacity = "1", document.body.style.overflow = N, W?.destroy?.(), W = null, P?.focus?.(), A?.onClose?.();
		}, e * 1e3);
	}, ae = (e) => {
		P = document.activeElement, N = document.body.style.overflow, j = e.group ? Array.from(za).filter((t) => t.group === e.group) : [e], re(Math.max(0, j.indexOf(e))), ee(), t.hidden = !1, t.style.display = "block", t.style.opacity = "0", document.body.style.overflow = "hidden";
		let n = Math.max(0, Number(e.duration ?? .12));
		t.style.transition = `opacity ${n}s ease`, requestAnimationFrame(() => {
			t.style.opacity = "1";
		}), f.focus(), e.onOpen?.(K);
	}, oe = (e) => {
		if (!t.hidden) {
			if (e.key === "Escape") {
				ie();
				return;
			}
			if (e.key === "Tab") {
				let t = [...r.querySelectorAll("button, [href], [tabindex]:not([tabindex=\"-1\"])")].filter((e) => !e.hidden && e.offsetParent !== null);
				if (!t.length) return;
				let n = t[0], i = t[t.length - 1], a = document.activeElement;
				e.shiftKey && (a === n || !r.contains(a)) ? (e.preventDefault(), i.focus()) : !e.shiftKey && (a === i || !r.contains(a)) && (e.preventDefault(), n.focus());
				return;
			}
			e.key === "ArrowLeft" && j.length > 1 ? re(M - 1) : e.key === "ArrowRight" && j.length > 1 ? re(M + 1) : e.key === "+" || e.key === "=" ? X(F + Number(A?.zoomStep ?? .5)) : e.key === "-" ? X(F - Number(A?.zoomStep ?? .5)) : e.key === "0" && te();
		}
	}, se = (e) => {
		if (A?.zoom === !1) return;
		e.preventDefault();
		let t = Number(A?.wheelStep ?? .18);
		X(F * (e.deltaY < 0 ? 1 + t : 1 / (1 + t)), e.clientX, e.clientY);
	}, ce = /* @__PURE__ */ new Map(), le = 0, Z = 1, ue = () => {
		let e = [...ce.values()];
		return Math.hypot(e[0].x - e[1].x, e[0].y - e[1].y);
	}, de = () => {
		let e = [...ce.values()];
		return {
			x: (e[0].x + e[1].x) / 2,
			y: (e[0].y + e[1].y) / 2
		};
	}, Q = (e) => {
		if (!e.target.closest("button,.kt-lightbox-toolbar,.kt-lightbox-info")) {
			ce.set(e.pointerId, {
				x: e.clientX,
				y: e.clientY
			});
			try {
				m.setPointerCapture?.(e.pointerId);
			} catch {}
			if (ce.size === 2) {
				le = ue(), Z = F, R = !1;
				return;
			}
			F <= 1 || (R = !0, z = e.pointerId, B = e.clientX, V = e.clientY, H = I, U = L, m.classList.add("is-panning"));
		}
	}, fe = (e) => {
		if (ce.has(e.pointerId) && ce.set(e.pointerId, {
			x: e.clientX,
			y: e.clientY
		}), ce.size === 2 && le > 0) {
			let e = de();
			X(Z * (ue() / le), e.x, e.y);
			return;
		}
		R && e.pointerId === z && (I = H + e.clientX - B, L = U + e.clientY - V, Y());
	}, pe = (e) => {
		ce.delete(e.pointerId), m.releasePointerCapture?.(e.pointerId), ce.size < 2 && (le = 0), R && e.pointerId === z && (R = !1, m.classList.remove("is-panning"));
	};
	n.addEventListener("click", () => {
		G || A?.closeOnBackdrop !== !1 && ie();
	});
	let me = null;
	m.addEventListener("pointerdown", (e) => {
		me = {
			x: e.clientX,
			y: e.clientY
		};
	}), m.addEventListener("click", (e) => {
		G || A?.closeOnBackdrop === !1 || F > 1.001 || (e.target === m || e.target === h) && (me && Math.hypot(e.clientX - me.x, e.clientY - me.y) > 8 || ie());
	}), f.addEventListener("click", ie), v.addEventListener("click", () => re(M - 1)), y.addEventListener("click", () => re(M + 1)), l.addEventListener("click", () => X(F + Number(A?.zoomStep ?? .5))), s.addEventListener("click", () => X(F - Number(A?.zoomStep ?? .5))), c.addEventListener("dblclick", te), c.addEventListener("click", () => {
		if (A?.zoom === !1 || c.querySelector("input")) return;
		let t = document.createElement("input");
		t.type = "text", t.inputMode = "numeric", t.value = String(Math.round(F * 100)), t.setAttribute("aria-label", e("zoomInput")), t.style.cssText = "width:46px;background:transparent;border:0;color:inherit;font:inherit;text-align:center;outline:none;", c.textContent = "", c.appendChild(t), t.focus(), t.select();
		let n = (e) => {
			if (e) {
				let e = parseFloat(t.value);
				!isNaN(e) && e > 0 && X(e / 100);
			}
			t.isConnected && t.remove(), Y();
		};
		t.addEventListener("keydown", (e) => {
			e.stopPropagation(), e.key === "Enter" ? (e.preventDefault(), n(!0)) : e.key === "Escape" && (e.preventDefault(), n(!1));
		}), t.addEventListener("click", (e) => e.stopPropagation()), t.addEventListener("blur", () => n(!0));
	}), u.addEventListener("click", async () => {
		let e = A?.src || "";
		try {
			e = new URL(e, location.href).href;
		} catch {}
		let t = {
			title: A?.title || document.title,
			url: e
		}, n = /^https?:/i.test(e), r = async () => {
			if (navigator.clipboard) {
				await navigator.clipboard.writeText(e);
				let t = u.innerHTML;
				u.textContent = "✓", setTimeout(() => {
					u.innerHTML = t;
				}, 1200);
			}
		};
		try {
			if (n && navigator.share && (!navigator.canShare || navigator.canShare(t))) {
				G = !0;
				try {
					await navigator.share(t);
				} finally {
					setTimeout(() => {
						G = !1;
					}, 400);
				}
			} else await r();
		} catch {
			setTimeout(() => {
				G = !1;
			}, 400);
		}
	}), d.addEventListener("click", async () => {
		let e = A?.src;
		if (!e) return;
		let t = String(A?.title || e.split("/").pop() || "image").replace(/[^\w.-]+/g, "_");
		try {
			let n = await (await fetch(e, { mode: "cors" })).blob(), r = URL.createObjectURL(n), i = document.createElement("a");
			i.href = r, i.download = t, document.body.appendChild(i), i.click(), i.remove(), setTimeout(() => URL.revokeObjectURL(r), 4e3);
		} catch {
			let n = document.createElement("a");
			n.href = e, n.download = t, n.target = "_blank", n.rel = "noopener", document.body.appendChild(n), n.click(), n.remove();
		}
	}), m.addEventListener("wheel", se, { passive: !1 }), m.addEventListener("pointerdown", Q), m.addEventListener("pointermove", fe), m.addEventListener("pointerup", pe), m.addEventListener("pointercancel", pe);
	let he = null, ge = null, _e = null;
	return m.addEventListener("pointerdown", (e) => {
		if (!e.isPrimary || e.pointerType === "mouse" || F > 1.001 || j.length <= 1 || e.target.closest("button,.kt-lightbox-toolbar,.kt-lightbox-info")) {
			he = null;
			return;
		}
		_e = e.pointerId, he = e.clientX, ge = e.clientY;
	}), m.addEventListener("pointerup", (e) => {
		if (he == null || e.pointerId !== _e) return;
		let t = e.clientX - he, n = e.clientY - ge;
		he = ge = null, _e = null, F <= 1.001 && Math.abs(t) > 50 && Math.abs(t) > Math.abs(n) * 1.4 && re(M + (t < 0 ? 1 : -1));
	}), _.addEventListener("dblclick", (e) => X(F > 1 ? 1 : Number(A?.doubleClickZoom ?? 2), e.clientX, e.clientY)), document.addEventListener("keydown", oe), {
		root: t,
		controls: K,
		open: ae,
		close: ie,
		next() {
			re(M + 1);
		},
		prev() {
			re(M - 1);
		},
		zoom(e) {
			X(Number(e));
		},
		destroy() {
			W?.destroy?.(), document.removeEventListener("keydown", oe), document.body.style.overflow = N, t.remove(), document.getElementById("kt-lightbox-style")?.remove();
		}
	};
}
function Ga(e, t, n) {
	return Math.min(n, Math.max(t, e));
}
function Ka(e) {
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
var qa = {
	create(e, t = {}, n) {
		let r = Va(e, t);
		if (!r) return null;
		Ba ||= Wa(ee(Ua, t.labels));
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
		za.add(o), e.style.cursor = t.cursor || "zoom-in";
		let s = (e) => {
			e?.preventDefault?.(), Ba.open(o);
		};
		return e.addEventListener("click", s), {
			el: e,
			type: "lightbox",
			open: s,
			close() {
				Ba?.close();
			},
			next() {
				Ba?.next();
			},
			prev() {
				Ba?.prev();
			},
			zoom(e) {
				Ba?.zoom(e);
			},
			pause() {},
			resume() {},
			destroy() {
				e.removeEventListener("click", s), e.style.cursor = i, za.delete(o), za.size || (Ba?.destroy(), Ba = null);
			}
		};
	},
	reduced() {}
}, Ja = null, Ya = {
	fade: {
		pre: "opacity:0",
		in: "opacity:1",
		out: "opacity:0"
	},
	slide: {
		pre: "transform:translateX(100%)",
		in: "transform:translateX(0)",
		out: "transform:translateX(-100%)"
	},
	cover: {
		pre: "transform:translateY(100%)",
		in: "transform:translateY(0)",
		out: "transform:translateY(-100%)"
	},
	curtain: {
		pre: "clip-path:inset(0 50% 0 50%)",
		in: "clip-path:inset(0 0 0 0)",
		out: "clip-path:inset(0 0 0 100%)"
	},
	circle: {
		pre: "clip-path:circle(0% at 50% 50%)",
		in: "clip-path:circle(75% at 50% 50%)",
		out: "clip-path:circle(0% at 50% 50%)"
	},
	wipe: {
		pre: "clip-path:polygon(0 0,0 0,-30% 100%,-30% 100%)",
		in: "clip-path:polygon(0 0,130% 0,100% 100%,-30% 100%)",
		out: "clip-path:polygon(130% 0,130% 0,100% 100%,100% 100%)"
	},
	split: {
		pre: "clip-path:inset(50% 0 50% 0)",
		in: "clip-path:inset(0 0 0 0)",
		out: "clip-path:inset(100% 0 0 0)"
	},
	blinds: {
		pre: "clip-path:inset(0 0 100% 0)",
		in: "clip-path:inset(0 0 0 0)",
		out: "clip-path:inset(100% 0 0 0)"
	}
};
function Xa(e) {
	let t = String(e.effect || "none");
	if (t === "none" || t === "css" || !Ya[t]) return null;
	let n = Ya[t], r = Math.max(.05, Number(e.duration ?? .5)), i = e.ease ? L(e.ease) : "cubic-bezier(.76,0,.24,1)", a = e.color || "#101318", o = e.color2 || a, s = t === "curtain" ? `linear-gradient(90deg,${a} 50%,${o} 50%)` : t === "blinds" ? `repeating-linear-gradient(0deg,${a} 0,${a} 12.5%,${o} 12.5%,${o} 25%)` : o === a ? a : `linear-gradient(135deg,${a},${o})`, c = document.createElement("div");
	c.setAttribute("aria-hidden", "true"), c.style.cssText = `position:fixed;inset:0;z-index:2147483000;pointer-events:none;background:${s};transition:all ${r}s ${i};${n.pre}`, document.body.appendChild(c);
	let l = (e) => new Promise((t) => {
		requestAnimationFrame(() => {
			c.style.cssText = `position:fixed;inset:0;z-index:2147483000;pointer-events:none;background:${s};transition:all ${r}s ${i};${e}`, setTimeout(t, r * 1e3 + 30);
		});
	});
	return {
		coverIn: () => l(n.in),
		coverOut: () => l(n.out),
		remove: () => c.remove()
	};
}
function Za(e) {
	let t = getComputedStyle(e), n = t.transitionDuration.split(",").map((e) => Number.parseFloat(e) * (e.includes("ms") ? 1 : 1e3)), r = t.transitionDelay.split(",").map((e) => Number.parseFloat(e) * (e.includes("ms") ? 1 : 1e3));
	return Math.max(0, ...n.map((e, t) => e + (r[t] ?? r[0] ?? 0)));
}
var Qa = {
	create(e, t) {
		if (Ja) return Ja;
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
			let e = Array.from(document.querySelectorAll(i)), t = Math.max(a, ...e.map(Za));
			return new Promise((e) => setTimeout(e, t));
		}, p = (e) => {
			e.querySelectorAll("script").forEach((e) => {
				let t = document.createElement("script");
				Array.from(e.attributes).forEach((e) => t.setAttribute(e.name, e.value)), t.textContent = e.textContent, e.replaceWith(t);
			});
		}, m = (e, r, i) => {
			let a = new DOMParser().parseFromString(e, "text/html"), o = document.querySelector(n), s = a.querySelector(n);
			if (!o || !s) return !1;
			bt.destroy(o), o.innerHTML = s.innerHTML, Array.from(s.attributes).forEach((e) => {
				e.name !== "id" && o.setAttribute(e.name, e.value);
			}), t.executeScripts !== !1 && p(o), document.title = a.title || document.title, i || history.pushState({ kinetoUrl: r }, document.title, r), window.scrollTo({
				top: Number(t.scrollTop ?? 0),
				behavior: "auto"
			});
			let c = document.documentElement;
			return c.classList.remove("kt-is-leaving"), c.classList.add("kt-is-entering"), bt.scan(o), bt.refresh(), t.onEnter?.(o, a), requestAnimationFrame(() => requestAnimationFrame(() => {
				c.classList.remove("kt-is-animating", "kt-is-entering");
			})), !0;
		}, h = (e) => e.pathname + e.search, g = h(window.location), _ = async (e, n = !1) => {
			if (l || c) return;
			l = !0, g = h(new URL(e, window.location.href));
			let r = document.documentElement;
			r.classList.add("kt-is-animating", "kt-is-leaving"), r.classList.remove("kt-is-entering"), t.onLeave?.(e);
			let i = Xa(t), a = i ? i.coverIn() : f(), [o] = await Promise.all([d(e), a]);
			if (c) {
				i?.remove();
				return;
			}
			let s = o && m(o, e, n);
			i && (await i.coverOut(), i.remove()), l = !1, s || window.location.assign(e);
		}, v = (e) => {
			let n = e.target.closest?.(r);
			u(e, n) && (e.preventDefault(), t.onClick?.(n, e), _(n.href));
		}, y = () => {
			h(window.location) !== g && _(window.location.href, !0);
		};
		return history.state?.kinetoUrl || history.replaceState({
			...history.state || {},
			kinetoUrl: window.location.href
		}, document.title, window.location.href), document.addEventListener("click", v), window.addEventListener("popstate", y), Ja = {
			el: document.documentElement,
			type: "pageTransition",
			navigate: _,
			pause() {},
			resume() {},
			destroy() {
				c = !0, s?.abort(), document.removeEventListener("click", v), window.removeEventListener("popstate", y), document.documentElement.classList.remove("kt-is-animating", "kt-is-leaving", "kt-is-entering"), Ja === this && (Ja = null);
			}
		}, Ja;
	},
	reduced() {}
}, $a = {
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
}, eo = {
	create(e, t) {
		if (typeof navigator > "u" || typeof navigator.vibrate != "function") return null;
		let n = $a[t.preset || t.haptic] || (Array.isArray(t.pattern) ? t.pattern.map(Number) : Number(t.pattern ?? 50)), r = t.trigger || "hover", i = !0, a = null, o = () => {
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
}, to = {
	create(e, t) {
		let n = Z(e, [
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
};
//#endregion
//#region src/modules/cssScroll.js
function no(e, t) {
	let n = e.style.getPropertyValue(t), r = e.style.getPropertyPriority(t);
	return {
		value: n,
		priority: r,
		restore() {
			n ? e.style.setProperty(t, n, r) : e.style.removeProperty(t);
		}
	};
}
var ro = {
	create(e, t) {
		let n = t.property || "--scroll-progress", r = String(t.axis || "").trim(), i = t.timeline === "scroll", a = i ? `scroll(nearest${r ? ` ${r}` : ""})` : `view(${r})`, o = typeof CSS < "u" && CSS.supports?.("animation-timeline", a), s = no(e, n), c = {
			animationName: e.style.animationName,
			animationTimeline: e.style.animationTimeline,
			animationRangeStart: e.style.animationRangeStart,
			animationRangeEnd: e.style.animationRangeEnd,
			animationFillMode: e.style.animationFillMode,
			animationPlayState: e.style.animationPlayState
		};
		if (o && t.cssAnimation) return e.style.animationName = t.cssAnimation, e.style.animationTimeline = a, e.style.animationRangeStart = t.rangeStart || (i ? "0%" : "entry 0%"), e.style.animationRangeEnd = t.rangeEnd || (i ? "100%" : "exit 100%"), e.style.animationFillMode = "both", e.style.animationPlayState = "running", {
			el: e,
			type: "cssScroll",
			pause: () => {
				e.style.animationPlayState = "paused";
			},
			resume: () => {
				e.style.animationPlayState = "running";
			},
			destroy: () => {
				e.style.animationName = c.animationName, e.style.animationTimeline = c.animationTimeline, e.style.animationRangeStart = c.animationRangeStart, e.style.animationRangeEnd = c.animationRangeEnd, e.style.animationFillMode = c.animationFillMode, e.style.animationPlayState = c.animationPlayState, s.restore();
			}
		};
		let l = ie();
		if (!l) return null;
		let u = l.create({
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
			pause: () => u.disable(),
			resume: () => u.enable(),
			destroy: () => {
				u.kill(), s.restore();
			}
		};
	},
	reduced(e, t = {}) {
		let n = t.property || "--scroll-progress", r = no(e, n);
		return e.style.setProperty(n, "1", r.priority), {
			el: e,
			type: "cssScroll",
			pause() {},
			resume() {},
			destroy: r.restore
		};
	}
}, io = {
	create(e, t) {
		let n = Array.isArray(t.urls) && t.urls.length ? t.urls : null;
		if (!n && !t.urlPrefix) return null;
		let r = re(), i = ie();
		if (!r || !i) return null;
		let a = Math.max(1, Number(t.frames ?? n?.length ?? 100)), o = t.urlPrefix || "", s = t.extension || ".jpg", c = Number(t.padding ?? 3), l = {
			parent: e.parentNode,
			next: e.nextSibling,
			style: e.getAttribute("style")
		}, u = document.createElement("div");
		u.className = "kt-scroll-sequence-wrap", u.style.height = t.scrollLength || `${Math.max(2, a * Number(t.vhPerFrame ?? 3))}vh`, l.parent.insertBefore(u, e), u.appendChild(e), e.style.position = "sticky", e.style.top = t.top == null ? "0" : typeof t.top == "number" ? `${t.top}px` : String(t.top), e.style.height = t.height || "100vh", e.style.overflow = "hidden";
		let d = document.createElement("canvas");
		d.setAttribute("aria-hidden", "true"), d.style.cssText = "display:block;width:100%;height:100%;", e.appendChild(d);
		let f = d.getContext("2d"), p = Array(a), m = Array(a).fill("idle"), h = { frame: 0 }, g = 1, _ = 1, v = 1, y = (e) => n?.[e] || `${o}${String(e + 1).padStart(c, "0")}${s}`, b = (e) => {
			if (e < 0 || e >= a || m[e] !== "idle") return;
			m[e] = "loading";
			let n = new Image();
			t.crossOrigin && (n.crossOrigin = t.crossOrigin), n.decoding = "async", n.onload = () => {
				m[e] = "loaded", p[e] = n, (Math.round(h.frame) === e || e === 0) && S(e);
			}, n.onerror = () => {
				m[e] = "error", t.onError?.(e, n.src);
			}, n.src = y(e), p[e] = n;
		}, x = (e) => {
			let n = Number(t.preloadRadius ?? 8);
			for (let t = -n; t <= n; t += 1) b(e + t);
		}, S = (e) => {
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
		}, C = () => {
			let n = e.getBoundingClientRect();
			g = Math.max(1, n.width || window.innerWidth), _ = Math.max(1, n.height || window.innerHeight), v = Math.min(window.devicePixelRatio || 1, Number(t.maxDpr ?? 2)), d.width = Math.round(g * v), d.height = Math.round(_ * v), S(Math.round(h.frame));
		}, w = typeof ResizeObserver < "u" ? new ResizeObserver(C) : null;
		w?.observe(e), window.addEventListener("resize", C), C(), b(0), x(0);
		let T = r.to(h, {
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
				x(e), S(e);
			}
		});
		return {
			el: e,
			type: "scrollSequence",
			pause: () => T.pause(),
			resume: () => T.resume(),
			destroy: () => {
				w?.disconnect(), window.removeEventListener("resize", C), T.scrollTrigger?.kill(), T.kill(), p.forEach((e) => {
					e && (e.onload = null, e.onerror = null);
				}), d.remove(), u.parentNode && (u.parentNode.insertBefore(e, u), u.remove()), l.style == null ? e.removeAttribute("style") : e.setAttribute("style", l.style), l.next && l.next.parentNode === l.parent && l.parent.insertBefore(e, l.next);
			}
		};
	},
	fallback(e, t) {
		return this.reduced(e, t);
	},
	reduced(e, t) {
		let n = Array.isArray(t.urls) && t.urls.length ? t.urls[0] : t.urlPrefix ? `${t.urlPrefix}${"1".padStart(Number(t.padding ?? 3), "0")}${t.extension || ".jpg"}` : null;
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
function ao(e, t, n, r) {
	let i = Math.max(n / e, r / t), a = Math.min(e, n / i), o = Math.min(t, r / i);
	return {
		sx: (e - a) / 2,
		sy: (t - o) / 2,
		sw: a,
		sh: o
	};
}
var oo = {
	create(e, t = {}) {
		let n = t.src || t.revealSrc || e.getAttribute("data-reveal-src") || "";
		if (!n) return null;
		let r = Math.max(8, Number(t.radius ?? 80)), i = G(Number(t.softness ?? .55), 0, 1), a = Math.max(0, Number(t.blur ?? 0)), o = t.persist === !0, s = G(Number(t.fade ?? .045), .002, .5), c = G(Number(t.maxDpr ?? 2), 1, 3), l = t.hold === !0, u = G(Number(t.threshold ?? .5), 0, 1), d = document.createElement("canvas");
		d.width = d.height = 48;
		let f = d.getContext("2d", { willReadFrequently: !0 }), p = 0, m = 0, h = !1, g = () => {
			try {
				f.clearRect(0, 0, 48, 48), f.drawImage(T, 0, 0, 48, 48);
				let e = f.getImageData(0, 0, 48, 48).data, t = 0;
				for (let n = 3; n < e.length; n += 4) e[n] > 50 && (t += 1);
				return t / 2304;
			} catch {
				return null;
			}
		}, _ = (n) => {
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
		}, v = e.getAttribute("style");
		getComputedStyle(e).position === "static" && (e.style.position = "relative"), e.style.touchAction = "none";
		let y = [], b = (t = e) => {
			(t.matches?.("img") ? [t] : [...t.querySelectorAll?.("img") || []]).forEach((e) => {
				y.some((t) => t.node === e) || (y.push({
					node: e,
					hadAttribute: e.hasAttribute("draggable"),
					value: e.getAttribute("draggable")
				}), e.draggable = !1);
			});
		};
		b();
		let x = (e) => e.preventDefault();
		e.addEventListener("dragstart", x);
		let S = typeof MutationObserver < "u" ? new MutationObserver((e) => {
			e.forEach(({ addedNodes: e }) => e.forEach((e) => b(e)));
		}) : null;
		S?.observe(e, {
			childList: !0,
			subtree: !0
		});
		let C = document.createElement("canvas");
		C.className = "kt-brush-reveal-canvas", C.setAttribute("aria-hidden", "true"), C.style.cssText = "position:absolute;inset:0;width:100%;height:100%;pointer-events:none;border-radius:inherit;z-index:2;", e.appendChild(C);
		let w = C.getContext("2d", { alpha: !0 }), T = document.createElement("canvas"), E = T.getContext("2d", { alpha: !0 }), D = new Image();
		D.decoding = "async", t.crossOrigin && (D.crossOrigin = t.crossOrigin);
		let O = !1;
		D.onload = () => {
			O = !0;
		}, D.onerror = () => t.onError?.(/* @__PURE__ */ Error(`Kineto brushReveal image failed to load: ${n}`), e), D.src = n;
		let k = 0, A = 0, j = 1, M = null, N = !0, P = !1, F = !1, I = 0, L = null, R = null, z = () => {
			let t = e.getBoundingClientRect();
			k = Math.max(1, t.width), A = Math.max(1, t.height), j = G(window.devicePixelRatio || 1, 1, c);
			let n = Math.max(1, Math.round(k * j)), r = Math.max(1, Math.round(A * j));
			(C.width !== n || C.height !== r) && (C.width = n, C.height = r, T.width = n, T.height = r);
		};
		z();
		let B = (e, n) => {
			let o = e * j, s = n * j, c = r * j, l = c * (1 - i), u = G(Number(t.opacity ?? 1), .05, 1), d = E.createRadialGradient(o, s, Math.max(.5, l), o, s, c);
			d.addColorStop(0, `rgba(255,255,255,${u})`), d.addColorStop(1, "rgba(255,255,255,0)"), E.save(), E.globalCompositeOperation = "source-over", a > 0 && "filter" in E && (E.filter = `blur(${a * j}px)`), E.fillStyle = d, E.beginPath(), E.arc(o, s, c, 0, Math.PI * 2), E.fill(), E.restore(), a > 0 && (E.save(), E.globalCompositeOperation = "source-over", E.fillStyle = `rgba(255,255,255,${u})`, E.beginPath(), E.arc(o, s, Math.max(.5, l), 0, Math.PI * 2), E.fill(), E.restore()), F = !0, I = Math.min(1.5, I + .06);
		}, V = (e, t) => {
			if (L == null) B(e, t);
			else {
				let n = Math.hypot(e - L, t - R), i = Math.max(1, Math.ceil(n / (r * .35)));
				for (let n = 1; n <= i; n += 1) B(L + (e - L) * n / i, R + (t - R) * n / i);
			}
			L = e, R = t;
		}, H = () => {
			if (N) {
				if (!o && F) {
					let e = Math.min(.5, s * (I < .22 ? 4 : 1));
					E.globalCompositeOperation = "destination-out", E.fillStyle = `rgba(0,0,0,${e})`, E.fillRect(0, 0, T.width, T.height), I *= 1 - e;
				}
				if (P && L != null && B(L, R), w.clearRect(0, 0, C.width, C.height), O && F) {
					let e = ao(D.naturalWidth, D.naturalHeight, C.width, C.height);
					w.globalCompositeOperation = "source-over", w.drawImage(D, e.sx, e.sy, e.sw, e.sh, 0, 0, C.width, C.height), w.globalCompositeOperation = "destination-in", w.drawImage(T, 0, 0), w.globalCompositeOperation = "source-over";
				}
				if (F && _(performance.now()), !o && !P && I < .008) {
					F = !1, I = 0, E.clearRect(0, 0, T.width, T.height), w.clearRect(0, 0, C.width, C.height), M = null;
					return;
				}
				M = P || !o && F || o && P ? requestAnimationFrame(H) : null;
			}
		}, U = () => {
			N && M == null && (M = requestAnimationFrame(H));
		}, W = () => {
			l || (P = !0, L = null, R = null, z(), U());
		}, K = (t) => {
			if (!P) return;
			let n = e.getBoundingClientRect();
			V(t.clientX - n.left, t.clientY - n.top), U();
		}, ee = () => {
			P = !1, L = null, R = null, U();
		}, q = (t) => {
			P = !0, z(), e.setPointerCapture?.(t.pointerId);
			let n = e.getBoundingClientRect();
			L = t.clientX - n.left, R = t.clientY - n.top, B(L, R), U();
		}, J = (e) => {
			(l || e.pointerType !== "mouse") && (P = !1, L = null, R = null), U();
		};
		e.addEventListener("pointerenter", W), e.addEventListener("pointerdown", q), e.addEventListener("pointermove", K, { passive: !0 }), e.addEventListener("pointerup", J), e.addEventListener("pointercancel", J), e.addEventListener("pointerleave", ee);
		let Y = typeof ResizeObserver < "u" ? new ResizeObserver(z) : null;
		return Y?.observe(e), {
			el: e,
			type: "brushReveal",
			clear() {
				E.clearRect(0, 0, T.width, T.height), w.clearRect(0, 0, C.width, C.height), F = !1, I = 0, h = !1, m = 0, p = 0;
			},
			progress() {
				return m;
			},
			replay() {
				this.clear();
			},
			pause() {
				N = !1, M != null && cancelAnimationFrame(M), M = null;
			},
			resume() {
				N || (N = !0, U());
			},
			destroy() {
				N = !1, M != null && cancelAnimationFrame(M), e.removeEventListener("pointerenter", W), e.removeEventListener("pointerdown", q), e.removeEventListener("pointermove", K), e.removeEventListener("pointerup", J), e.removeEventListener("pointercancel", J), e.removeEventListener("pointerleave", ee), e.removeEventListener("dragstart", x), S?.disconnect(), y.forEach(({ node: e, hadAttribute: t, value: n }) => {
					t ? e.setAttribute("draggable", n) : e.removeAttribute("draggable");
				}), Y?.disconnect(), C.remove(), v == null ? e.removeAttribute("style") : e.setAttribute("style", v);
			}
		};
	},
	fallback() {},
	reduced() {}
}, so = {
	create(e, t) {
		let n = ee({ dot: "Go to section {n}" }, t.labels), r = e.innerHTML, i = e.getAttribute("style"), a = t.sectionSelector ? Array.from(e.querySelectorAll(t.sectionSelector)) : Array.from(e.children);
		if (!a.length) return null;
		let o = Math.max(.15, Number(t.duration ?? .75)), s = typeof t.ease == "string" && (t.ease.includes("(") || t.ease.startsWith("ease") || t.ease === "linear") ? t.ease : "cubic-bezier(.76,0,.24,1)", c = t.loop === !0, l = a.map((e, t) => {
			if (t === 0) return null;
			let n = e.getAttribute("data-kt-fp-axis");
			return n === "x" || n === "y" ? n : null;
		}), u = t.axis === "mixed" || l.some(Boolean), d = t.mode === "snap" && !u, f = t.axis === "x", p = [{
			x: 0,
			y: 0
		}];
		for (let e = 1; e < a.length; e += 1) {
			let t = l[e] || "x", n = p[e - 1];
			p.push(t === "y" ? {
				x: n.x,
				y: n.y + 1
			} : {
				x: n.x + 1,
				y: n.y
			});
		}
		let m = f || u, h = Math.max(4, Number(t.threshold ?? 24)), g = Math.max(0, Number(t.autoAdvance || 0)), _ = null, v = Math.min(a.length - 1, Math.max(0, Number(t.initial ?? 0))), y = /* @__PURE__ */ new Set([v]), b = !1, x = !0;
		t.height ? e.style.height = typeof t.height == "number" ? `${t.height}px` : String(t.height) : e.clientHeight < 10 && (e.style.height = "100svh"), e.classList.add("kt-fullpage"), e.style.position = "relative", e.style.overflow = "hidden", e.style.overscrollBehavior = "contain";
		let S = () => {
			let t = e.parentElement;
			for (; t && t !== document.body && t !== document.documentElement;) {
				let e = getComputedStyle(t);
				if (/(auto|scroll|overlay)/.test(e.overflowY) && t.scrollHeight > t.clientHeight) return t;
				t = t.parentElement;
			}
			return null;
		}, C = document.createElement("div");
		C.className = "kt-fullpage-track", C.style.cssText = u ? "position:relative;height:100%;width:100%;will-change:transform;" : f ? "height:100%;width:100%;display:flex;will-change:transform;" : "height:100%;will-change:transform;", a.forEach((e, t) => {
			e.classList.add("kt-fullpage-section"), e.style.height = "100%", u ? (e.style.position = "absolute", e.style.top = "0", e.style.left = "0", e.style.width = "100%", e.style.transform = `translate3d(${p[t].x * 100}%,${p[t].y * 100}%,0)`) : f && (e.style.flex = "0 0 100%"), e.style.overflowX = "hidden", e.style.overflowY = "hidden", C.appendChild(e);
		}), e.appendChild(C), e.style.touchAction = f ? "pan-y" : "none";
		let w = null;
		d && (f ? (e.style.overflowX = "auto", e.style.scrollSnapType = "x mandatory", C.style.width = `${a.length * 100}%`, a.forEach((e) => {
			e.style.flex = `0 0 ${100 / a.length}%`, e.style.scrollSnapAlign = "start";
		})) : (e.style.overflowY = "auto", e.style.scrollSnapType = "y mandatory", C.style.height = `${a.length * 100}%`, a.forEach((e) => {
			e.style.height = `${100 / a.length}%`, e.style.scrollSnapAlign = "start";
		})), w = () => {
			let n = f ? e.scrollLeft / Math.max(1, e.clientWidth) : e.scrollTop / Math.max(1, e.clientHeight), r = Math.min(a.length - 1, Math.max(0, Math.round(n)));
			r !== v && (v = r, D(), t.onChange?.(v, a[v]));
		}, e.addEventListener("scroll", w, { passive: !0 }));
		let T = null, E = [], D = () => E.forEach((e, t) => {
			let n = t === v;
			e.setAttribute("aria-current", n ? "true" : "false"), e.style.transform = n ? "scale(1.45)" : "scale(1)", e.style.opacity = n ? "1" : ".45";
		});
		t.dots !== !1 && (T = document.createElement("div"), T.className = "kt-fullpage-dots", T.setAttribute("role", "tablist"), T.style.cssText = m ? "position:absolute;left:50%;bottom:12px;transform:translateX(-50%);display:flex;flex-direction:row;gap:10px;z-index:5;" : "position:absolute;right:14px;top:50%;transform:translateY(-50%);display:flex;flex-direction:column;gap:10px;z-index:5;", E = a.map((e, t) => {
			let r = document.createElement("button");
			return r.type = "button", r.className = "kt-fullpage-dot", r.setAttribute("aria-label", n("dot", { n: t + 1 })), r.style.cssText = "width:8px;height:8px;border-radius:50%;border:0;padding:0;cursor:pointer;background:var(--kt-fullpage-dot,currentColor);opacity:.45;transition:transform .25s var(--kt-ease-ui, ease),opacity .25s var(--kt-ease-ui, ease);", r.addEventListener("click", () => k(t)), T.appendChild(r), r;
		}), e.appendChild(T));
		let O = () => {
			b = !1;
		};
		C.addEventListener("transitionend", O);
		let k = (e, n = !1) => {
			if (!x) return;
			let r = e;
			if (c && (r = (e + a.length) % a.length), r = Math.min(a.length - 1, Math.max(0, r)), r === v && !n) return;
			let i = v;
			v = r, r !== i && a[r] && !y.has(r) && (a[r].scrollTop = 0), y.add(r), t.onLeave?.(i, v, a[i]), d ? a[v].scrollIntoView(f ? {
				behavior: n ? "auto" : "smooth",
				inline: "start",
				block: "nearest"
			} : {
				behavior: n ? "auto" : "smooth",
				block: "start"
			}) : (b = !n, C.style.transition = n ? "none" : `transform ${o}s ${s}`, C.style.transform = u ? `translate3d(${-p[v].x * 100}%,${-p[v].y * 100}%,0)` : f ? `translate3d(${-v * 100}%,0,0)` : `translate3d(0,${-v * 100}%,0)`, n || setTimeout(O, o * 1e3 + 120)), D(), g && P(), t.onChange?.(v, a[v]);
		}, A = (e) => c || (e > 0 ? v < a.length - 1 : v > 0), j = () => a.forEach((e) => {
			e.style.overflowY = e.scrollHeight > e.clientHeight + 2 ? "auto" : "hidden";
		}), M = (e) => {
			let t = a[v];
			if (!t) return !1;
			let n = t.scrollHeight - t.clientHeight;
			return n <= 2 ? !1 : e > 0 ? t.scrollTop < n - 1 : t.scrollTop > 1;
		}, N = () => {
			_ &&= (clearInterval(_), null);
		}, P = () => {
			g && x && (N(), _ = setInterval(() => {
				b || (v >= a.length - 1 && !c ? k(0) : k(v + 1));
			}, g));
		}, F = 0, I = 0, L = !1, R = (t) => {
			if (d && !f) return;
			let n = performance.now(), r = n - I < 140;
			I = n, r || (L = !1);
			let i = t.deltaMode === 1 ? 16 : t.deltaMode === 2 ? e.clientHeight : 1, s = t.deltaY * i, c = t.deltaX * i, l = m && Math.abs(c) >= Math.abs(s) ? c : s;
			if (Math.abs(l) < 4) return;
			let u = l > 0 ? 1 : -1;
			if (b || L) {
				t.preventDefault(), t.stopPropagation();
				return;
			}
			if (!f && M(u)) {
				t.preventDefault(), t.stopPropagation(), a[v].scrollTop += s, g && P();
				return;
			}
			let p = S();
			if (p) {
				let n = e.getBoundingClientRect(), r = p.getBoundingClientRect();
				if (!(n.top <= r.top + 1 && n.bottom >= r.bottom - 1)) {
					t.preventDefault(), t.stopPropagation(), p.scrollTop += s;
					return;
				}
			}
			if (!A(u)) {
				if (t.preventDefault(), t.stopPropagation(), b || L) return;
				p ? p.scrollTop += s : window.scrollBy(0, s);
				return;
			}
			t.preventDefault(), t.stopPropagation(), !(b || n < F) && (F = n + Math.max(320, o * 1e3 + 90), k(v + u), L = !0);
		}, z = null, B = null, V = !1, H = (e) => {
			let t = z.x - e.x, n = z.y - e.y;
			return f || u && Math.abs(t) >= Math.abs(n) ? t : n;
		}, U = (e) => {
			let t = e.touches[0];
			z = {
				x: t.clientX,
				y: t.clientY
			}, B = {
				x: t.clientX,
				y: t.clientY
			}, V = !1;
		}, W = (t) => {
			if (d || !z) return;
			let n = t.touches[0], r = {
				x: n.clientX,
				y: n.clientY
			}, i = B.y - r.y;
			B = r;
			let o = H(r);
			if (Math.abs(o) < 3) return;
			let s = o > 0 ? 1 : -1;
			if (b || V) {
				t.preventDefault();
				return;
			}
			if (!f && M(s)) {
				t.preventDefault(), a[v].scrollTop += i;
				return;
			}
			let c = f ? null : S();
			if (c) {
				let n = e.getBoundingClientRect(), r = c.getBoundingClientRect();
				if (!(n.top <= r.top + 1 && n.bottom >= r.bottom - 1)) {
					t.preventDefault(), c.scrollTop += i;
					return;
				}
			}
			if (!A(s)) {
				f || (t.preventDefault(), c ? c.scrollTop += i : window.scrollBy(0, i));
				return;
			}
			t.preventDefault(), Math.abs(o) >= h && (V = !0, k(v + s));
		}, G = () => {
			z = null, B = null;
		}, K = (t) => {
			if (!e.contains(document.activeElement)) return;
			let n = u ? [
				"ArrowRight",
				"ArrowDown",
				"PageDown",
				" "
			] : f ? [
				"ArrowRight",
				"PageDown",
				" "
			] : [
				"ArrowDown",
				"PageDown",
				" "
			], r = u ? [
				"ArrowLeft",
				"ArrowUp",
				"PageUp"
			] : f ? ["ArrowLeft", "PageUp"] : ["ArrowUp", "PageUp"], i = n.includes(t.key), o = r.includes(t.key);
			(i || o || t.key === "Home" || t.key === "End") && (t.preventDefault(), t.key === "Home" ? k(0) : t.key === "End" ? k(a.length - 1) : k(v + (i ? 1 : -1)));
		}, q = null, J = !1, Y = (t) => {
			d || t.pointerType !== "mouse" || t.button !== 0 || t.target.closest(".kt-fullpage-dot") || (q = f ? t.clientX : t.clientY, J = !1, e.style.cursor = "grabbing");
		}, X = (e) => {
			if (q == null || J || b || e.pointerType !== "mouse") return;
			let t = q - (f ? e.clientX : e.clientY);
			if (Math.abs(t) >= h) {
				J = !0;
				let e = t > 0 ? 1 : -1;
				A(e) && k(v + e);
			}
		}, te = () => {
			q = null, e.style.cursor = t.drag === !1 ? "" : "grab";
		};
		t.drag !== !1 && !d && (e.style.cursor = "grab", e.style.userSelect = "none", e.addEventListener("pointerdown", Y), window.addEventListener("pointermove", X), window.addEventListener("pointerup", te)), t.wheel !== !1 && e.addEventListener("wheel", R, { passive: !1 }), t.touch !== !1 && (e.addEventListener("touchstart", U, { passive: !0 }), e.addEventListener("touchmove", W, { passive: !1 }), e.addEventListener("touchend", G, { passive: !0 })), t.keyboard !== !1 && (e.hasAttribute("tabindex") || e.setAttribute("tabindex", "0"), e.addEventListener("keydown", K)), k(v, !0), requestAnimationFrame(j);
		let ne = null;
		return typeof ResizeObserver < "u" && (ne = new ResizeObserver(j), ne.observe(e)), P(), {
			el: e,
			type: "fullpage",
			go: k,
			next: () => k(v + 1),
			prev: () => k(v - 1),
			get index() {
				return v;
			},
			pause() {
				N();
			},
			resume() {
				P();
			},
			destroy() {
				x = !1, N(), ne?.disconnect(), e.removeEventListener("wheel", R), e.removeEventListener("touchstart", U), e.removeEventListener("touchmove", W), e.removeEventListener("touchend", G), e.removeEventListener("keydown", K), e.removeEventListener("pointerdown", Y), window.removeEventListener("pointermove", X), window.removeEventListener("pointerup", te), w && e.removeEventListener("scroll", w), C.removeEventListener("transitionend", O), e.classList.remove("kt-fullpage"), e.innerHTML = r, i == null ? e.removeAttribute("style") : e.setAttribute("style", i);
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
}, co = {
	create(e, t = {}) {
		let n = V(), r = t.trigger || "click", i = G(Math.round(Number(t.count ?? 90)), 4, 400), a = G(Number(t.spread ?? 62), 5, 180), o = Math.max(.4, Number(t.duration ?? 1.8)), s = Number(t.gravity ?? .9), c = G(Number(t.scalar ?? 1), .3, 4), l = Number(t.zIndex ?? 11e3), u = Array.isArray(t.colors) && t.colors.length ? t.colors : typeof t.colors == "string" && t.colors.trim() ? t.colors.split(",").map((e) => e.trim()) : [
			"#ff5b1c",
			"#ffd166",
			"#2ec16b",
			"#4aa8ff",
			"#c86bff"
		], d = null, f = null, p = [], m = null, h = 0, g = () => {
			if (d) return;
			d = document.createElement("canvas"), d.setAttribute("aria-hidden", "true"), d.style.cssText = `position:fixed;inset:0;width:100vw;height:100vh;pointer-events:none;z-index:${l};`;
			let e = G(window.devicePixelRatio || 1, 1, 2);
			d.width = Math.round(window.innerWidth * e), d.height = Math.round(window.innerHeight * e), f = d.getContext("2d", {
				alpha: !0,
				desynchronized: !0
			}), f.setTransform(e, 0, 0, e, 0, 0), document.body.appendChild(d);
		}, _ = (e) => {
			let t = h ? Math.min(48, e - h) / 16.67 : 1;
			h = e, f.clearRect(0, 0, window.innerWidth, window.innerHeight);
			let n = 0;
			for (let e of p) e.life <= 0 || (n += 1, e.life -= t / (o * 60), e.vy += s * .28 * t, e.vx *= .99, e.x += e.vx * t, e.y += e.vy * t, e.rotation += e.spin * t, f.globalAlpha = G(e.life, 0, 1), f.fillStyle = e.color, f.save(), f.translate(e.x, e.y), f.rotate(e.rotation), f.fillRect(-e.size / 2, -e.size / 2, e.size, e.size * .6), f.restore());
			f.globalAlpha = 1, n > 0 ? m = requestAnimationFrame(_) : (m = null, d?.remove(), d = null, f = null, p = []);
		}, v = (t, r) => {
			if (n.reducedMotion) return;
			g();
			let o = e.getBoundingClientRect(), s = t ?? o.left + o.width / 2, l = r ?? o.top + o.height / 2, d = -Math.PI / 2;
			for (let e = 0; e < i; e += 1) {
				let e = d + (Math.random() - .5) * (a * Math.PI / 180) * 2, t = (5 + Math.random() * 6) * c;
				p.push({
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
			m ??= (h = 0, requestAnimationFrame(_));
		}, y = null, b = t.once === !0, x = (t) => {
			v(t.clientX, t.clientY), b && e.removeEventListener("click", x);
		};
		return r === "click" ? e.addEventListener("click", x) : r === "auto" ? v() : r === "view" && typeof IntersectionObserver < "u" && (y = new IntersectionObserver((e) => {
			for (let t of e) if (t.isIntersecting) {
				v(), y.disconnect(), y = null;
				break;
			}
		}, { threshold: .35 }), y.observe(e)), {
			el: e,
			type: "confetti",
			fire: (e, t) => v(e, t),
			replay: () => v(),
			pause() {},
			resume() {},
			destroy() {
				r === "click" && e.removeEventListener("click", x), y &&= (y.disconnect(), null), m != null && cancelAnimationFrame(m), m = null, d?.remove(), d = null, p = [];
			}
		};
	},
	fallback(e) {
		return this.reduced(e);
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
}, lo = {
	create(e, t = {}) {
		let n = e.matches("details") ? [e] : Array.from(e.querySelectorAll("details"));
		if (!n.length) return null;
		let r = Math.max(.05, Number(t.duration ?? .4)), i = t.ease ? L(t.ease) : "cubic-bezier(.22,.8,.3,1)", a = t.single === !0, o = Math.max(0, Number(t.blur ?? 6)), s = [
			"blur",
			"fade",
			"none"
		].includes(t.effect) ? t.effect : "blur", c = +(s === "none"), l = s === "blur" ? o : 0, u = t.arrowPosition === "left" ? "left" : "right", d = (t.activeClass || "").trim(), f = d ? ["kt-open", d] : ["kt-open"];
		e.classList.add("kt-accordion"), e.classList.toggle("kt-accordion--arrow-left", u === "left");
		let p = [], m = (e) => {
			let t = e.querySelector("summary");
			if (!t) return null;
			let n = document.createElement("div");
			n.className = "kt-accordion-panel", n.style.overflow = "hidden", Array.from(e.childNodes).forEach((e) => {
				e !== t && n.appendChild(e);
			}), e.appendChild(n), t.classList.add("kt-accordion-summary"), e.open && e.classList.add(...f);
			let o = null, s = () => {
				o &&= (o.cancel(), null);
			}, u = () => {
				s(), e.open = !0, e.classList.add(...f);
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
			}, d = () => {
				s(), e.classList.remove(...f);
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
			}, m = (t) => {
				if (t.preventDefault(), e.open) {
					d();
					return;
				}
				a && p.forEach((t) => {
					t.details !== e && t.details.open && t.closeIt();
				}), u();
			};
			return t.addEventListener("click", m), {
				details: e,
				closeIt: d,
				destroy() {
					s(), t.removeEventListener("click", m), t.classList.remove("kt-accordion-summary"), oe(t), e.classList.remove(...f), Array.from(n.childNodes).forEach((t) => e.insertBefore(t, n)), n.remove();
				}
			};
		};
		return n.forEach((e) => {
			let t = m(e);
			t && p.push(t);
		}), {
			el: e,
			type: "accordion",
			pause() {},
			resume() {},
			destroy() {
				p.forEach((e) => e.destroy()), e.classList.remove("kt-accordion", "kt-accordion--arrow-left");
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
}, uo = {
	create(e, t = {}) {
		let n = t.mode === "mash" || t.mode === "tap" ? t.mode : "hold", r = Math.max(120, Number(t.duration ?? 1e3)), i = t.color || "var(--kt-hold-fill, color-mix(in srgb, currentColor 22%, transparent))", a = t.blend || "var(--kt-hold-blend, normal)", o = G(Number(t.step ?? .08), .01, 1), s = Math.max(0, Number(t.decay ?? .4)), c = n !== "tap", l = e.style.position, u = e.style.overflow;
		c && (getComputedStyle(e).position === "static" && (e.style.position = "relative"), e.style.overflow = e.style.overflow || "hidden");
		let d = document.createElement("span");
		d.className = "kt-hold-fill", d.setAttribute("aria-hidden", "true"), d.style.cssText = `position:absolute;inset:0;transform-origin:left center;transform:scaleX(0);background:${i};mix-blend-mode:${a};pointer-events:none;border-radius:0;z-index:0;`, c && e.insertBefore(d, e.firstChild);
		let f = null, p = !1, m = !1, h = 0, g = (e) => {
			h = G(e, 0, 1), d.style.transform = `scaleX(${h})`;
		}, _ = () => {
			f != null && (cancelAnimationFrame(f), f = null);
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
			if (m) return;
			m = !0, p = !1, _(), g(1), e.classList.add("kt-hold-confirmed"), e.setAttribute("aria-pressed", "true");
			let n = !0;
			try {
				n = e.dispatchEvent(new CustomEvent("kt-hold-confirm", {
					bubbles: !0,
					cancelable: !0
				}));
			} catch {}
			t.onComplete?.(e), n && v();
		}, b = 0, x = (e) => {
			let t = G((e - b) / r, 0, 1);
			if (g(t), t >= 1) {
				f = null, y();
				return;
			}
			f = requestAnimationFrame(x);
		}, S = () => {
			p || m || (p = !0, b = performance.now(), d.style.transition = "none", _(), f = requestAnimationFrame(x));
		}, C = () => {
			p = !1, _(), !m && (d.style.transition = `transform ${Math.min(.35, r / 3e3)}s ease`, g(0));
		}, w = 0, T = (e) => {
			let t = w ? (e - w) / 1e3 : 0;
			if (w = e, g(h - s * t), h <= 0) {
				f = null, w = 0;
				return;
			}
			f = requestAnimationFrame(T);
		}, E = () => {
			if (!m) {
				if (d.style.transition = "none", g(h + o), h >= 1) {
					y();
					return;
				}
				w = 0, f ??= requestAnimationFrame(T);
			}
		}, D = ee({ confirm: "Sure?" }, t.labels), O = ye(e), k = !1, A = null, j = () => {
			k && (k = !1, clearTimeout(A), A = null, O(), e.classList.remove("kt-hold-armed"), e.removeAttribute("aria-pressed"));
		}, M = () => {
			k || m || (k = !0, e.textContent = D("confirm"), e.classList.add("kt-hold-armed"), e.setAttribute("aria-pressed", "false"), clearTimeout(A), A = setTimeout(j, r));
		}, N = (t) => {
			k && !e.contains(t.target) && j();
		}, P = (e) => {
			k && e.key === "Escape" && j();
		}, F = (e) => {
			if (e.pointerType !== "mouse" || e.button === 0) {
				if (n === "tap") {
					k ? (j(), y()) : M();
					return;
				}
				n === "mash" ? E() : S();
			}
		}, I = (e) => {
			n !== "tap" || m || (e.preventDefault(), e.stopPropagation());
		}, L = (e) => {
			if (e.key === "Enter" || e.key === " ") {
				if (e.preventDefault(), n === "tap") {
					e.repeat || (k ? (j(), y()) : M());
					return;
				}
				n === "mash" ? e.repeat || E() : S();
			}
		}, R = (e) => {
			n === "hold" && (e.key === "Enter" || e.key === " ") && C();
		};
		return e.addEventListener("pointerdown", F), n === "hold" && (e.addEventListener("pointerup", C), e.addEventListener("pointerleave", C), e.addEventListener("pointercancel", C)), n === "tap" && (e.addEventListener("click", I, !0), e.addEventListener("blur", j), document.addEventListener("pointerdown", N, !0), document.addEventListener("keydown", P)), e.addEventListener("keydown", L), e.addEventListener("keyup", R), {
			el: e,
			type: "hold",
			progress: () => h,
			get armed() {
				return k;
			},
			reset() {
				j(), m = !1, e.classList.remove("kt-hold-confirmed"), e.removeAttribute("aria-pressed"), _(), w = 0, d.style.transition = "transform .2s var(--kt-ease-ui, ease)", g(0);
			},
			pause() {},
			resume() {},
			destroy() {
				_(), j(), e.removeEventListener("click", I, !0), e.removeEventListener("blur", j), document.removeEventListener("pointerdown", N, !0), document.removeEventListener("keydown", P), e.classList.remove("kt-hold-armed"), e.removeEventListener("pointerdown", F), e.removeEventListener("pointerup", C), e.removeEventListener("pointerleave", C), e.removeEventListener("pointercancel", C), e.removeEventListener("keydown", L), e.removeEventListener("keyup", R), d.remove(), e.style.position = l, e.style.overflow = u, e.classList.remove("kt-hold-confirmed"), e.removeAttribute("aria-pressed");
			}
		};
	},
	reduced(e, t = {}) {
		!/^(a|button)$/i.test(e.tagName) && !e.hasAttribute("tabindex") && (e.tabIndex = 0);
		let n = () => {
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
		}, r = !1, i = () => {
			if (r) return;
			r = !0, e.classList.add("kt-hold-confirmed");
			let i = !0;
			try {
				i = e.dispatchEvent(new CustomEvent("kt-hold-confirm", {
					bubbles: !0,
					cancelable: !0
				}));
			} catch {}
			t.onComplete?.(e), i && n();
		};
		return e.addEventListener("click", i), {
			el: e,
			type: "hold",
			pause() {},
			resume() {},
			destroy() {
				e.removeEventListener("click", i), e.classList.remove("kt-hold-confirmed");
			}
		};
	}
}, fo = 0;
function po(e) {
	let t;
	do
		t = `kt-menu-panel-${++fo}`;
	while (e.getRootNode?.().getElementById?.(t) || e.ownerDocument.getElementById(t));
	return t;
}
var mo = "a[href],button:not([disabled]),input:not([disabled]),select,textarea,[tabindex]:not([tabindex=\"-1\"])", ho = (e) => Array.from(e.querySelectorAll(mo));
function go(e, t, n) {
	if (e <= 1) return [t];
	let r = Math.abs(n) >= 359.5 ? e : e - 1;
	return Array.from({ length: e }, (e, i) => t + n * i / r);
}
function _o(e, t) {
	let n = (e - 90) * Math.PI / 180;
	return {
		x: Math.cos(n) * t,
		y: Math.sin(n) * t
	};
}
function vo(e) {
	return `${Math.abs(e) < .005 ? 0 : Number(e.toFixed(2))}px`;
}
function yo({ duration: e, responsive: t, reduce: n }) {
	let r = (e) => !n && typeof e.animate == "function";
	return {
		attach() {},
		detach() {},
		cut(e) {
			e.a &&= (e.a.onfinish = e.a.oncancel = null, e.a.cancel(), null);
		},
		open(n) {
			if (t !== "custom" && window.innerWidth <= 720) {
				let e = n.t.getBoundingClientRect().bottom + 6;
				n.p.style.setProperty("--kt-menu-panel-top", `${Math.max(12, Math.min(e, window.innerHeight - 172))}px`);
			}
			r(n.p) && (n.a = n.p.animate([{
				opacity: 0,
				transform: "translateY(-6px)"
			}, {
				opacity: 1,
				transform: "translateY(0)"
			}], {
				duration: e * 1e3,
				easing: "cubic-bezier(.22,.8,.3,1)"
			}));
		},
		close(t, n, i) {
			if (i || !r(t.p)) {
				n();
				return;
			}
			t.a = t.p.animate([{
				opacity: 1,
				transform: "translateY(0)"
			}, {
				opacity: 0,
				transform: "translateY(-6px)"
			}], {
				duration: e * 700,
				easing: "ease"
			}), t.a.onfinish = n, t.a.oncancel = n;
		}
	};
}
function bo({ radius: e, start: t, sweep: n, stagger: r, duration: i, reduce: a }) {
	let o = /* @__PURE__ */ new Map();
	return {
		attach(s) {
			let c = ho(s.p), l = go(c.length, t, n), u = c.map((t, n) => {
				let i = Z(t, [
					"--kt-menu-x",
					"--kt-menu-y",
					"--kt-menu-delay"
				]), { x: o, y: s } = _o(l[n], e);
				return t.classList.add("kt-menu-item"), t.style.setProperty("--kt-menu-x", vo(o)), t.style.setProperty("--kt-menu-y", vo(s)), t.style.setProperty("--kt-menu-delay", `${a ? 0 : n * r}ms`), () => {
					t.classList.remove("kt-menu-item"), i(), oe(t);
				};
			});
			s.p.style.setProperty("--kt-menu-ring-duration", `${i}s`);
			let d = a ? 0 : i * 1e3 + Math.max(0, c.length - 1) * r;
			o.set(s, {
				undo: u,
				settle: d,
				timer: null
			});
		},
		detach(e) {
			let t = o.get(e);
			t && (clearTimeout(t.timer), t.undo.forEach((e) => e()), o.delete(e));
		},
		cut(e) {
			let t = o.get(e);
			t && (clearTimeout(t.timer), t.timer = null);
		},
		open(e) {
			e.p.offsetWidth, e.p.classList.add("kt-menu-ring-open");
		},
		close(e, t, n) {
			e.p.classList.remove("kt-menu-ring-open");
			let r = o.get(e);
			if (n || !r?.settle) {
				t();
				return;
			}
			r.timer = setTimeout(t, r.settle);
		}
	};
}
var xo = {
	create(e, t = {}) {
		let n = Array.from(e.querySelectorAll("li")).filter((e) => e.querySelector(":scope > .kt-menu-panel"));
		if (!n.length) return null;
		let r = V().reducedMotion, i = typeof matchMedia < "u" && matchMedia("(any-hover: hover) and (any-pointer: fine)").matches, a = t.trigger === "click" ? "click" : "hover", o = ["mega", "radial"].includes(t.layout) ? t.layout : "dropdown", s = K(t.openDelay, 60, 0), c = K(t.closeDelay, 180, 0), l = K(t.duration, .24, .05), u = t.responsive === "scroll" || t.responsive === "custom" ? t.responsive : "wrap", d = ["chevron", "plus"].includes(t.indicator) ? t.indicator : "none", f = o === "radial" ? bo({
			radius: K(t.radius, 104, 8, 2e3),
			start: K(t.startAngle, -90, -360, 360),
			sweep: K(t.sweep, 180, -360, 360),
			stagger: K(t.stagger, 40, 0, 2e3),
			duration: l,
			reduce: r
		}) : yo({
			duration: l,
			responsive: u,
			reduce: r
		}), p = se(e, ["class"]);
		e.classList.add("kt-menu", `kt-menu--${o}`, `kt-menu--responsive-${u}`, `kt-menu--ind-${d}`);
		let m = [], h = null, g = null, _ = null, v = (e) => {
			let { i: t, p: n, t: r } = e;
			clearTimeout(_), h !== e && (h && y(h, !0), f.cut(e), h = e, t.classList.add("kt-open"), r.setAttribute("aria-expanded", "true"), n.hidden = !1, f.open(e));
		}, y = (e, t) => {
			if (!e) return;
			let { i: n, p: r, t: i } = e;
			n.classList.remove("kt-open"), i.setAttribute("aria-expanded", "false"), f.cut(e), f.close(e, () => {
				r.hidden = !0, e.a = null;
			}, t), h === e && (h = null);
		};
		if (n.forEach((e) => {
			let t = e.querySelector(":scope > .kt-menu-panel"), n = e.querySelector("a,button,summary,[role=\"button\"]") || e.firstElementChild;
			if (!t || !n) return;
			let r = [
				se(e, ["class"]),
				se(n, [
					"class",
					"aria-haspopup",
					"aria-expanded",
					"aria-controls"
				]),
				se(t, [
					"class",
					"style",
					"id",
					"hidden"
				])
			];
			t.id ||= po(t), t.hidden = !0, n.setAttribute("aria-haspopup", "true"), n.setAttribute("aria-expanded", "false"), n.setAttribute("aria-controls", t.id), n.classList.add("kt-menu-trigger");
			let o = e.getAttribute("data-kt-menu-trigger"), l = o === "click" ? "click" : o === "hover" ? "hover" : a, u = e.getAttribute("data-kt-menu-open"), d = u ? Array.from(document.querySelectorAll(u)) : [], p = {
				i: e,
				p: t,
				t: n,
				a: null,
				r
			}, b = () => m.indexOf(p), x = () => {
				clearTimeout(_), clearTimeout(g), g = setTimeout(() => v(p), s);
			}, S = () => {
				clearTimeout(g), clearTimeout(_), _ = setTimeout(() => y(p), c);
			}, C = (e) => {
				D && i && window.innerWidth > 720 || (e.preventDefault(), h === p ? y(p) : v(p));
			}, w = (e) => {
				e.key === "ArrowDown" || e.key === "Enter" || e.key === " " ? (e.preventDefault(), v(p), ho(t)[0]?.focus()) : e.key === "Escape" ? (y(p), n.focus()) : e.key === "ArrowRight" ? (e.preventDefault(), m[(b() + 1) % m.length].t.focus()) : e.key === "ArrowLeft" && (e.preventDefault(), m[(b() - 1 + m.length) % m.length].t.focus());
			}, T = (e) => {
				if (e.key === "Escape") {
					y(p), n.focus();
					return;
				}
				if (e.key === "ArrowDown" || e.key === "ArrowUp") {
					let n = ho(t);
					if (!n.length) return;
					e.preventDefault();
					let r = n.indexOf(document.activeElement);
					n[e.key === "ArrowDown" ? (r + 1) % n.length : (r - 1 + n.length) % n.length].focus();
				}
			}, E = (t) => {
				e.contains(t.relatedTarget) || y(p);
			}, D = l === "hover";
			i && (D || d.length) && (e.addEventListener("mouseenter", x), e.addEventListener("mouseleave", S));
			let O = -Infinity, k = (e) => {
				if (e.pointerType === "mouse" || D && i && window.innerWidth > 720) return;
				let t = performance.now();
				t - O < 400 || (O = t, e.preventDefault(), h === p ? y(p) : v(p));
			}, A = (e) => {
				(e.detail === 0 || performance.now() - O >= 400) && C(e);
			};
			n.addEventListener("pointerup", k), n.addEventListener("click", A), i && d.forEach((e) => {
				e.addEventListener("mouseenter", x), e.addEventListener("mouseleave", S);
			}), n.addEventListener("keydown", w), t.addEventListener("keydown", T), e.addEventListener("focusout", E), p.h = [
				x,
				S,
				A,
				k,
				w,
				T,
				E,
				d
			], f.attach(p), m.push(p);
		}), !m.length) return p(), null;
		let b = (e) => {
			h && !h.i.contains(e.target) && y(h);
		}, x = (e) => {
			if (e.key === "Escape" && h) {
				let e = h;
				y(e), e.t.focus();
			}
		};
		return document.addEventListener("pointerdown", b, !0), document.addEventListener("keydown", x), {
			el: e,
			type: "megaMenu",
			pause() {},
			resume() {},
			destroy() {
				clearTimeout(g), clearTimeout(_), document.removeEventListener("pointerdown", b, !0), document.removeEventListener("keydown", x), m.forEach((e) => {
					let { i: t, p: n, t: r, h: i, r: a } = e, [o, s, c, l, u, d, p, m] = i;
					f.cut(e), f.detach(e), t.removeEventListener("mouseenter", o), t.removeEventListener("mouseleave", s), r.removeEventListener("pointerup", l), r.removeEventListener("click", c), r.removeEventListener("keydown", u), n.removeEventListener("keydown", d), t.removeEventListener("focusout", p), m.forEach((e) => {
						e.removeEventListener("mouseenter", o), e.removeEventListener("mouseleave", s);
					}), a.forEach((e) => e());
				}), p();
			}
		};
	},
	reduced(e, t) {
		return this.create(e, t);
	}
}, So = {}, Co = (e) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">${e}</svg>`, wo = {
	info: Co("<path d=\"M12 11v5\"/><path d=\"M12 7.5h.01\"/>"),
	success: Co("<path d=\"M5 12.5l4.2 4.2L19 7\"/>"),
	warning: Co("<path d=\"M12 8v5\"/><path d=\"M12 16.5h.01\"/>"),
	error: Co("<path d=\"M7.5 7.5l9 9\"/><path d=\"M16.5 7.5l-9 9\"/>")
}, To = {
	region: "Notifications",
	dismiss: "Dismiss"
}, Eo = /* @__PURE__ */ new Set(), Do = () => {
	if (!Eo.size) for (let [e, t] of Object.entries(So)) t.children.length || (t.remove(), delete So[e]);
}, Oo = (e, t) => {
	if (So[e]) return So[e];
	let n = document.createElement("div");
	return n.className = `kt-toast-region kt-toast-region--${e}`, n.setAttribute("role", "region"), n.setAttribute("aria-label", t("region")), document.body.appendChild(n), So[e] = n, n;
}, ko = {
	create(e, t = {}) {
		let n = V().reducedMotion, r = t.position || "bottom-right", i = t.type || "info", a = G(Number(t.duration ?? 5e3), 1e3, 3e4), o = t.dismissible !== !1, s = t.message || e.getAttribute("data-kt-message") || e.textContent.trim() || "Done", c = t.progressBar === "ring" ? "ring" : t.progressBar === "fill" ? "fill" : t.progressBar === !0 || t.progressBar === "bar" ? "bar" : "none", l = Math.max(1, Number(t.max ?? 5)), u = t.icon, d = ee(To, t.labels), f = /* @__PURE__ */ new Set(), p = (e, p = {}) => {
			let m = p.type || i, h = Oo(p.position || r, d);
			for (; h.children.length >= l;) h.firstElementChild?.remove();
			let g = document.createElement("div");
			g.className = `kt-toast kt-toast--${m}`, g.setAttribute("role", m === "error" || m === "warning" ? "alert" : "status"), t.barColor && g.style.setProperty("--kt-toast-bar", t.barColor);
			let _ = m !== "none" && u !== !1 ? typeof u == "string" ? u : wo[m] || "" : "", v = document.createElement("span");
			v.className = "kt-toast__msg", v.textContent = e ?? s, g.appendChild(v);
			let y = !1, b = () => {
				f.delete(S), g.remove(), Do();
			}, x = () => {
				if (D) {
					try {
						D.commitStyles?.();
					} catch {}
					D.cancel();
				}
			}, S = () => {
				y || (y = !0, clearTimeout(E), x(), b());
			};
			f.add(S);
			let C = () => {
				if (y) return;
				if (y = !0, clearTimeout(E), x(), n || !g.animate) {
					b();
					return;
				}
				let e = g.animate([{
					opacity: 1,
					transform: "none"
				}, {
					opacity: 0,
					transform: "translateY(6px) scale(.98)"
				}], {
					duration: 200,
					easing: "ease"
				});
				e.onfinish = b, e.oncancel = b;
			};
			if (o) {
				let e = document.createElement("button");
				e.type = "button", e.className = "kt-toast__close", e.setAttribute("aria-label", d("dismiss")), e.innerHTML = "&times;", e.addEventListener("click", C), g.appendChild(e);
			}
			h.appendChild(g), !n && g.animate && g.animate([{
				opacity: 0,
				transform: "translateY(10px)"
			}, {
				opacity: 1,
				transform: "translateY(0)"
			}], {
				duration: 240,
				easing: "cubic-bezier(.22,.8,.3,1)"
			});
			let w = Math.max(1e3, Number(p.duration ?? a)), T = 0, E = null, D = null, O = () => {
				y || (T = performance.now(), clearTimeout(E), E = setTimeout(C, Math.max(300, w)));
			}, k = () => {
				!y && T && (clearTimeout(E), w = Math.max(300, w - (performance.now() - T)), T = 0);
			};
			if (c === "ring" && !n && g.animate) {
				let e = document.createElement("span");
				e.className = "kt-toast__ring", e.setAttribute("aria-hidden", "true");
				let t = 2 * Math.PI * 9;
				if (e.innerHTML = `<svg viewBox="0 0 24 24"><circle class="kt-toast__ring-track" cx="12" cy="12" r="9"></circle><circle class="kt-toast__ring-fill" cx="12" cy="12" r="9" transform="rotate(-90 12 12)" stroke-dasharray="${t}" stroke-dashoffset="0"></circle></svg>`, _) {
					let t = document.createElement("span");
					t.className = "kt-toast__ring-icon", t.setAttribute("aria-hidden", "true"), t.innerHTML = _, e.appendChild(t);
				}
				g.insertBefore(e, g.firstChild), D = e.querySelector(".kt-toast__ring-fill").animate([{ strokeDashoffset: 0 }, { strokeDashoffset: t }], {
					duration: w,
					easing: "linear",
					fill: "forwards"
				});
			} else {
				if (_) {
					let e = document.createElement("span");
					e.className = "kt-toast__icon", e.setAttribute("aria-hidden", "true"), e.innerHTML = _, g.insertBefore(e, g.firstChild);
				}
				if (c === "bar" && !n && g.animate) {
					let e = document.createElement("span");
					e.className = "kt-toast__bar", e.setAttribute("aria-hidden", "true"), g.appendChild(e), D = e.animate([{ transform: "scaleX(1)" }, { transform: "scaleX(0)" }], {
						duration: w,
						easing: "linear",
						fill: "forwards"
					});
				} else if (c === "fill" && !n && g.animate) {
					let e = document.createElement("span");
					e.className = "kt-toast__fill", e.setAttribute("aria-hidden", "true"), g.insertBefore(e, g.firstChild), D = e.animate([{ transform: "scaleX(0)" }, { transform: "scaleX(1)" }], {
						duration: w,
						easing: "linear",
						fill: "forwards"
					});
				}
			}
			let A = () => {
				k(), D && D.pause();
			}, j = () => {
				O(), D && D.play();
			};
			return g.addEventListener("mouseenter", A), g.addEventListener("mouseleave", j), g.addEventListener("focusin", A), g.addEventListener("focusout", j), O(), {
				dismiss: C,
				el: g
			};
		}, m = () => p();
		e.addEventListener("click", m);
		let h = {
			el: e,
			type: "toast",
			show: p,
			pause() {},
			resume() {},
			destroy() {
				e.removeEventListener("click", m), Eo.delete(h), [...f].forEach((e) => e()), Do();
			}
		};
		return Eo.add(h), h;
	},
	reduced(e, t) {
		return this.create(e, t);
	}
}, Ao = {
	create(e, t = {}) {
		let n = (t, n) => {
			let r = e.ownerDocument?.defaultView?.CustomEvent || globalThis.CustomEvent;
			r && e.dispatchEvent(new r(t, { detail: n }));
		}, r = V().reducedMotion, i = Math.max(.05, Number(t.duration ?? .34)), a = t.backdrop !== !1, o = G(Number(t.backdropOpacity ?? .5), 0, 1), s = t.dismissible !== !1, c = t.handle !== !1, l = t.trigger || "[data-kt-sheet-trigger]";
		e.classList.add("kt-sheet"), e.setAttribute("role", "dialog"), e.setAttribute("aria-modal", "true");
		let u = se(e, ["aria-label", "aria-labelledby"]);
		if (!e.hasAttribute("aria-label") && !e.hasAttribute("aria-labelledby")) {
			let n = e.querySelector("h1,h2,h3,h4,[data-kt-sheet-title]");
			n ? (n.id ||= `kt-sheet-title-${Math.random().toString(36).slice(2, 7)}`, e.setAttribute("aria-labelledby", n.id)) : e.setAttribute("aria-label", t.label || "Sheet");
		}
		e.hidden = !0;
		let d = null;
		a && (d = document.createElement("div"), d.className = "kt-sheet-backdrop", d.hidden = !0);
		let f = null;
		c && (f = document.createElement("div"), f.className = "kt-sheet__handle", f.setAttribute("aria-hidden", "true"), e.insertBefore(f, e.firstChild));
		let p = !1, m = null, h = null, g = () => Array.from(e.querySelectorAll("a[href],button:not([disabled]),input:not([disabled]),select,textarea,[tabindex]:not([tabindex=\"-1\"])")), _ = () => {
			p || (p = !0, m = document.activeElement, d && (document.body.appendChild(d), d.hidden = !1, r || d.animate([{ opacity: 0 }, { opacity: o }], {
				duration: i * 1e3,
				easing: "ease"
			})), e.hidden = !1, e.classList.add("kt-open"), h && h.cancel(), r || (h = e.animate([{ transform: "translateY(100%)" }, { transform: "translateY(0)" }], {
				duration: i * 1e3,
				easing: "cubic-bezier(.22,.8,.3,1)"
			})), (g()[0] || e).focus?.(), document.addEventListener("keydown", y, !0));
		}, v = () => {
			if (!p) return;
			p = !1, e.classList.remove("kt-open"), document.removeEventListener("keydown", y, !0);
			let t = () => {
				p || (e.hidden = !0, d && (d.hidden = !0));
			};
			d && !r && d.animate([{ opacity: o }, { opacity: 0 }], {
				duration: i * 800,
				easing: "ease"
			}), r ? t() : (h && h.cancel(), h = e.animate([{ transform: "translateY(0)" }, { transform: "translateY(100%)" }], {
				duration: i * 800,
				easing: "ease"
			}), h.onfinish = t, h.oncancel = t), m?.focus?.();
		}, y = (e) => {
			if (e.key === "Escape" && s) {
				e.preventDefault(), v();
				return;
			}
			if (e.key !== "Tab") return;
			let t = g();
			if (!t.length) return;
			let n = t[0], r = t[t.length - 1];
			e.shiftKey && document.activeElement === n ? (e.preventDefault(), r.focus()) : !e.shiftKey && document.activeElement === r && (e.preventDefault(), n.focus());
		};
		d && s && d.addEventListener("click", v), d && d.style.setProperty("--kt-sheet-backdrop-opacity", String(o));
		let b = t.resizable === !0, x = t.resizeArea === "header" ? "header" : "handle", S = Math.max(120, Number(t.minHeight ?? 140)), C = () => {
			let e = t.maxHeight, n = typeof window < "u" ? window.innerHeight : 800;
			if (e == null || e === "") return n * .5;
			let r = String(e).trim();
			if (/vh$/i.test(r) || /%$/.test(r)) {
				let e = parseFloat(r);
				return Number.isFinite(e) ? e / 100 * n : n * .5;
			}
			let i = parseFloat(r);
			return Number.isFinite(i) && i > 0 ? i : n * .5;
		}, w = t.autoHeight === !0, T = () => {
			w && (e.style.height = "auto", e.style.maxHeight = `${Math.round(C())}px`, e.style.overflowY = "auto");
		}, E = () => {
			if (w) {
				T();
				return;
			}
			t.maxHeight != null && t.maxHeight !== "" && (e.style.maxHeight = `${Math.round(C())}px`, e.style.overflowY = "auto");
		}, D = null;
		typeof window < "u" && (E(), D = () => E(), window.addEventListener("resize", D));
		let O = () => {
			e.style.height = "", e.style.maxHeight = "", w && T();
		}, k = [];
		if (f && b) {
			f.style.cursor = "ns-resize", f.style.touchAction = "none", e.classList.add("kt-sheet--resizable");
			let n = t.resizeLabel ?? "Drag to resize · Double-click to reset";
			f.title = f.title || n;
		}
		b && (e.classList.add(`kt-sheet--resize-${x}`), e.dataset.ktSheetResizeArea = x);
		let A = e.querySelector("[data-kt-sheet-header],.kt-sheet__header,header"), j = b && x === "header" ? [f, A].filter((e, t, n) => e && n.indexOf(e) === t) : [f].filter(Boolean), M = "button,a,input,select,textarea,label,[contenteditable=\"true\"],[data-kt-sheet-no-resize]";
		j.forEach((r) => {
			let i = 0, a = 0, o = !1, c = !1, l = 0, u = r === f ? "handle" : "header";
			b && (r.style.cursor = "ns-resize", r.style.touchAction = "none");
			let d = 0, p = !1, m = (t) => {
				if ((t.pointerType !== "mouse" || t.button === 0) && !t.target.closest?.(M)) {
					if (o = !0, c = !1, p = r === f, p) {
						e.style.transition = "none", e.classList.add("kt-sheet--dragging");
						try {
							r.setPointerCapture?.(t.pointerId);
						} catch {}
					}
					i = t.clientY, d = t.clientX, a = e.getBoundingClientRect().height;
				}
			}, h = (s) => {
				if (!o) return;
				let l = s.clientY - i;
				if (!p) {
					let t = Math.abs(s.clientX - d);
					if (Math.abs(l) < 7 || Math.abs(l) < t) return;
					p = !0, e.style.transition = "none", e.classList.add("kt-sheet--dragging");
					try {
						r.setPointerCapture?.(s.pointerId);
					} catch {}
					e.ownerDocument?.defaultView?.getSelection?.()?.removeAllRanges?.();
				}
				if (Math.abs(l) > 3 && (c = !0), b) {
					let r = Math.round((typeof window < "u" ? window.innerHeight : 800) * .95), i = Math.min(r, C()), o = Math.min(i, Math.max(S, Math.round(a - l)));
					e.style.height = `${o}px`, e.style.maxHeight = `${i}px`, t.onResize?.(o, e), n("kt-sheet-resize", {
						height: o,
						source: u
					});
				} else e.style.transform = `translateY(${Math.max(0, l)}px)`;
			}, g = (t) => {
				if (o) {
					if (o = !1, e.style.transition = "", e.classList.remove("kt-sheet--dragging"), !b) {
						let n = Math.max(0, t.clientY - i);
						e.style.transform = "", s && n > 90 && v();
					} else if (!c) {
						let e = Date.now();
						e - l < 320 && O(), l = e;
					}
				}
			}, _ = b ? (e) => {
				e.target.closest?.(M) || O();
			} : null;
			r.addEventListener("pointerdown", m), r.addEventListener("pointermove", h), r.addEventListener("pointerup", g), r.addEventListener("pointercancel", g), _ && r.addEventListener("dblclick", _), k.push({
				surface: r,
				down: m,
				move: h,
				up: g,
				dblclick: _
			});
		});
		let N = e.id ? Array.from(document.querySelectorAll(l)).filter((n) => (n.getAttribute("data-kt-sheet-trigger") || n.getAttribute("href") || "") === `#${e.id}` || t.trigger) : [], P = (e) => {
			e.preventDefault(), _();
		};
		return N.forEach((e) => {
			e.setAttribute("aria-haspopup", "dialog"), e.addEventListener("click", P);
		}), {
			el: e,
			type: "bottomSheet",
			open: _,
			close: v,
			resetSize: O,
			pause() {},
			resume() {},
			destroy() {
				v(), document.removeEventListener("keydown", y, !0), N.forEach((e) => e.removeEventListener("click", P)), k.forEach(({ surface: e, down: t, move: n, up: r, dblclick: i }) => {
					e.removeEventListener("pointerdown", t), e.removeEventListener("pointermove", n), e.removeEventListener("pointerup", r), e.removeEventListener("pointercancel", r), i && e.removeEventListener("dblclick", i);
				}), d && d.remove(), f && f.remove(), D && window.removeEventListener("resize", D), e.style.removeProperty("overflow-y"), e.classList.remove("kt-sheet", "kt-open", "kt-sheet--resizable", "kt-sheet--resize-handle", "kt-sheet--resize-header", "kt-sheet--dragging"), delete e.dataset.ktSheetResizeArea, e.removeAttribute("role"), e.removeAttribute("aria-modal"), e.hidden = !1, u();
			}
		};
	},
	reduced(e, t) {
		return this.create(e, t);
	}
}, jo = {
	create(e, t = {}) {
		let n = V().reducedMotion, r = t.activation === "manual" ? "manual" : "automatic", i = t.orientation === "vertical" ? "vertical" : "horizontal", a = Math.max(0, Number(t.duration ?? .28)), o = t.indicator !== !1, s = t.effect || "fade", c = (t.activeClass || "").trim(), l = [
			"slide",
			"none",
			"fade"
		].includes(t.indicatorMotion) ? t.indicatorMotion : "slide", u = e.querySelector("[role=\"tablist\"], .kt-tablist") || e.firstElementChild;
		if (!u) return null;
		let d = Array.from(u.querySelectorAll("button, a, [role=\"tab\"], .kt-tab")).filter((e) => e.closest("[role=\"tablist\"], .kt-tablist") === u), f = Array.from(e.querySelectorAll("[role=\"tabpanel\"], .kt-tabpanel, [data-kt-tabpanel]"));
		if (!d.length || !f.length) return null;
		let p = se(u, ["role", "aria-orientation"]), m = Z(u, ["position"]), h = d.map((e) => se(e, [
			"role",
			"id",
			"aria-controls",
			"aria-selected",
			"tabindex",
			"data-kt-label"
		])), g = f.map((e) => se(e, [
			"role",
			"id",
			"aria-labelledby",
			"tabindex"
		]));
		e.classList.add("kt-tabs", `kt-tabs--${i}`), s === "none" && e.classList.add("kt-tabs--instant"), l === "none" && e.classList.add("kt-tabs--ind-none"), u.setAttribute("role", "tablist"), u.setAttribute("aria-orientation", i);
		let _ = null;
		o && (_ = document.createElement("span"), _.className = "kt-tabs__indicator", _.setAttribute("aria-hidden", "true"), u.appendChild(_), getComputedStyle(u).position === "static" && (u.style.position = "relative"));
		let v = Math.max(0, d.findIndex((e) => e.getAttribute("aria-selected") === "true"));
		v < 0 && (v = 0);
		let y = Math.random().toString(36).slice(2, 7);
		d.forEach((e, t) => {
			e.setAttribute("role", "tab"), e.id = e.id || `kt-tab-${y}-${t}`, !e.querySelector("*") && !e.hasAttribute("data-kt-label") && e.setAttribute("data-kt-label", e.textContent.trim());
			let n = f[t];
			n && (n.setAttribute("role", "tabpanel"), n.id = n.id || `kt-tabpanel-${y}-${t}`, n.setAttribute("aria-labelledby", e.id), n.setAttribute("tabindex", "0"), e.setAttribute("aria-controls", n.id));
		});
		let b = () => {
			let e = d[v];
			i === "vertical" ? (_.style.transform = `translateY(${e.offsetTop}px)`, _.style.setProperty("height", `${e.offsetHeight}px`, "important"), _.style.removeProperty("width")) : (_.style.transform = `translateX(${e.offsetLeft}px)`, _.style.setProperty("width", `${e.offsetWidth}px`, "important"), _.style.removeProperty("height"));
		}, x = !0, S = () => {
			if (_) {
				if (l === "fade" && !x && !n && typeof _.animate == "function") {
					let e = _.style.transition;
					_.animate([{ opacity: 1 }, { opacity: 0 }], {
						duration: 120,
						easing: "ease"
					}).onfinish = () => {
						_.style.transition = "none", b(), _.offsetWidth, _.style.transition = e, _.animate([{ opacity: 0 }, { opacity: 1 }], {
							duration: 160,
							easing: "ease"
						});
					};
				} else b();
				x = !1;
			}
		}, C = () => {
			_ && (b(), x = !1);
		}, w = () => s === "slide" ? [{
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
		}] : [{ opacity: 0 }, { opacity: 1 }], T = (r, i = !0) => {
			let o = v;
			v = G(r, 0, d.length - 1);
			let l = o !== v, u = !n && s !== "none" && a > 0, p = s === "cross" || s === "crossfade";
			if (d.forEach((e, t) => {
				let n = t === v;
				e.setAttribute("aria-selected", n ? "true" : "false"), e.setAttribute("tabindex", n ? "0" : "-1"), e.classList.toggle("kt-active", n), c && e.classList.toggle(c, n);
				let r = f[t];
				if (r) {
					if (n) {
						if (r.hidden = !1, r.classList.add("kt-active"), u) {
							let e = p && l ? a * 500 : 0;
							r.animate(w(), {
								duration: a * (p ? 500 : 1e3),
								delay: e,
								easing: "cubic-bezier(.22,.8,.3,1)",
								fill: "backwards"
							});
						}
					} else if (t === o && p && u && l) {
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
				}
			}), S(), l) {
				t.onChange?.(v, d[v], f[v]);
				try {
					e.dispatchEvent(new CustomEvent("kt-tabs-change", {
						bubbles: !0,
						detail: { index: v }
					}));
				} catch {}
			}
			i && d[v].focus();
		}, E = (e) => {
			let t = d.indexOf(e.currentTarget);
			t >= 0 && (e.preventDefault(), T(t, !1));
		}, D = i === "vertical" ? "ArrowUp" : "ArrowLeft", O = i === "vertical" ? "ArrowDown" : "ArrowRight", k = (e) => {
			let t = null;
			if (e.key === O) t = (d.indexOf(e.currentTarget) + 1) % d.length;
			else if (e.key === D) t = (d.indexOf(e.currentTarget) - 1 + d.length) % d.length;
			else if (e.key === "Home") t = 0;
			else if (e.key === "End") t = d.length - 1;
			else if ((e.key === "Enter" || e.key === " ") && r === "manual") {
				e.preventDefault(), T(d.indexOf(e.currentTarget), !1);
				return;
			}
			t != null && (e.preventDefault(), d[t].focus(), r === "automatic" && T(t, !1));
		};
		d.forEach((e) => {
			e.addEventListener("click", E), e.addEventListener("keydown", k);
		}), T(v, !1);
		let A = _ && typeof ResizeObserver < "u" ? new ResizeObserver(S) : null;
		A?.observe(u), A || window.addEventListener("resize", S);
		let j = _ && typeof MutationObserver < "u" ? new MutationObserver(() => requestAnimationFrame(S)) : null, M = e.closest?.("[hidden]");
		j && M && j.observe(M, {
			attributes: !0,
			attributeFilter: ["hidden"]
		});
		let N = requestAnimationFrame(S);
		return {
			el: e,
			type: "tabs",
			select: (e) => T(e, !1),
			refresh: C,
			pause() {},
			resume() {},
			destroy() {
				cancelAnimationFrame(N), A || window.removeEventListener("resize", S), A?.disconnect(), j?.disconnect(), d.forEach((e, t) => {
					e.removeEventListener("click", E), e.removeEventListener("keydown", k), e.classList.remove("kt-active"), h[t](), oe(e);
				}), _?.remove(), e.classList.remove("kt-tabs", `kt-tabs--${i}`, "kt-tabs--ind-none", "kt-tabs--instant"), f.forEach((e, t) => {
					e.hidden = !1, e.classList.remove("kt-active"), g[t](), oe(e);
				}), m(), p();
			}
		};
	},
	reduced(e, t) {
		return this.create(e, t);
	}
};
//#endregion
//#region src/modules/radial.js
function Mo(e, t = {}) {
	let n = t.position, r = {
		preset: "radial",
		position: [
			"bottom",
			"top",
			"left",
			"right"
		].includes(n) ? n : "bottom",
		align: t.align,
		radius: t.radius,
		step: t.step,
		activeAngle: t.activeAngle,
		duration: t.duration,
		smoothing: t.smoothing,
		spring: t.spring,
		stiffness: t.stiffness,
		damping: t.damping,
		mass: t.mass,
		loop: t.loop,
		drag: t.drag,
		controls: t.controls,
		autoplay: t.autoplay,
		activeClass: t.activeClass
	}, i = Ca.create(e, {
		...r,
		effect: "radial"
	});
	return i && (i.type = "radial"), i;
}
var No = {
	create: Mo,
	reduced: Mo
}, Po = /* @__PURE__ */ new Set([
	"single",
	"pair",
	"palette",
	"auto"
]), Fo = (e) => {
	if (Array.isArray(e)) return e.map(String).map((e) => e.trim()).filter(Boolean);
	let t = String(e || "").trim();
	if (!t) return [];
	if (t.includes("|")) return t.split("|").map((e) => e.trim()).filter(Boolean);
	let n = [], r = 0, i = 0;
	for (let e = 0; e < t.length; e += 1) {
		let a = t[e];
		a === "(" ? r += 1 : a === ")" ? r = Math.max(0, r - 1) : a === "," && r === 0 && (n.push(t.slice(i, e).trim()), i = e + 1);
	}
	return n.push(t.slice(i).trim()), n.filter(Boolean);
}, Io = (e) => {
	let t = String(e || "").trim(), n = t.match(/^rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)/i);
	if (n) return [
		Number(n[1]),
		Number(n[2]),
		Number(n[3])
	];
	let r = t.match(/^#([\da-f]{3}|[\da-f]{6})$/i)?.[1];
	if (!r) return null;
	let i = r.length === 3 ? r.split("").map((e) => e + e).join("") : r;
	return [
		0,
		2,
		4
	].map((e) => Number.parseInt(i.slice(e, e + 2), 16));
}, Lo = ([e, t, n]) => {
	let r = e / 255, i = t / 255, a = n / 255, o = Math.max(r, i, a), s = Math.min(r, i, a), c = (o + s) / 2;
	if (o === s) return [
		0,
		0,
		c * 100
	];
	let l = o - s, u = l / (1 - Math.abs(2 * c - 1)), d = o === r ? (i - a) / l % 6 : o === i ? (a - r) / l + 2 : (r - i) / l + 4;
	return d = (d * 60 + 360) % 360, [
		d,
		u * 100,
		c * 100
	];
}, Ro = (e) => {
	let t = e?.tagName === "IMG" ? e : e?.querySelector?.("img");
	if (!t || !t.complete || !t.naturalWidth) return null;
	try {
		let e = document.createElement("canvas");
		e.width = 12, e.height = 12;
		let n = e.getContext("2d", { willReadFrequently: !0 });
		if (!n) return null;
		n.drawImage(t, 0, 0, 12, 12);
		let r = n.getImageData(0, 0, 12, 12).data, i = 0, a = 0, o = 0, s = 0;
		for (let e = 0; e < r.length; e += 4) {
			let t = r[e + 3] / 255;
			t < .08 || (i += r[e] * t, a += r[e + 1] * t, o += r[e + 2] * t, s += t);
		}
		return s ? [
			i / s,
			a / s,
			o / s
		] : null;
	} catch {
		return null;
	}
}, zo = (e) => {
	let t = e?.tagName === "IMG" ? e : e?.querySelector?.("img");
	if (!t || !t.complete || !t.naturalWidth) return null;
	try {
		let e = document.createElement("canvas");
		e.width = 20, e.height = 20;
		let n = e.getContext("2d", { willReadFrequently: !0 });
		if (!n) return null;
		n.drawImage(t, 0, 0, 20, 20);
		let r = n.getImageData(0, 0, 20, 20).data, i = /* @__PURE__ */ new Map();
		for (let e = 0; e < r.length; e += 4) {
			if (r[e + 3] < 32) continue;
			let t = r[e], n = r[e + 1], a = r[e + 2], o = `${t >> 4}:${n >> 4}:${a >> 4}`, s = i.get(o) || [
				0,
				0,
				0,
				0
			];
			s[0] += t, s[1] += n, s[2] += a, s[3] += 1, i.set(o, s);
		}
		let a = [...i.values()].map(([e, t, n, r]) => {
			let i = [
				e / r,
				t / r,
				n / r
			], a = Math.max(...i) - Math.min(...i), o = (Math.max(...i) + Math.min(...i)) / 2;
			return {
				rgb: i,
				count: r,
				accent: a * 2 + Math.abs(o - 200) * .4
			};
		}).sort((e, t) => t.count - e.count).slice(0, 32);
		if (!a.length) return null;
		let o = (e, t) => (e[0] - t[0]) ** 2 + (e[1] - t[1]) ** 2 + (e[2] - t[2]) ** 2, s = [a[0], a[0]], c = -1;
		return a.forEach((e, t) => a.slice(t + 1).forEach((t) => {
			let n = Math.sqrt(e.count * t.count) * o(e.rgb, t.rgb);
			n > c && (s = [e, t], c = n);
		})), s.sort((e, t) => t.accent - e.accent), s.map(({ rgb: e }) => `rgb(${e.map((e) => Math.round(e)).join(" ")})`);
	} catch {
		return null;
	}
}, Bo = (e) => {
	let t = e?.parentElement;
	for (; t;) {
		let e = getComputedStyle(t).backgroundColor, n = Number(e.match(/rgba?\([^/]*[,/]\s*([\d.]+)\s*\)$/)?.[1] ?? 1), r = Io(e);
		if (r && n > .05) return r;
		t = t.parentElement;
	}
	return null;
}, Vo = (e) => {
	let [t, n, r] = Lo(Ro(e) || Bo(e) || [
		255,
		91,
		28
	]), i = G(n < 18 ? 64 : n, 48, 82), a = G(r < 18 ? 45 : r > 82 ? 56 : r, 36, 66), o = Math.round(Math.random() * 16 - 8);
	return [
		`hsl(${Math.round(t)} ${Math.round(i)}% ${Math.round(a)}%)`,
		`hsl(${Math.round((t + 28 + o + 360) % 360)} ${Math.round(G(i + 7, 48, 88))}% ${Math.round(G(a + 7, 38, 72))}%)`,
		`hsl(${Math.round((t - 34 + o + 360) % 360)} ${Math.round(G(i - 4, 44, 80))}% ${Math.round(G(a - 6, 32, 64))}%)`
	];
}, Ho = {
	create(e, t = {}) {
		let n = V().reducedMotion, r = t.color || "#ff5b1c", i = t.color2 || "#12141a", a = Po.has(t.colorMode) ? t.colorMode : Fo(t.colors).length ? "palette" : "pair", o = Fo(t.colors), s = [
			"left",
			"right",
			"up",
			"down",
			"random"
		].includes(t.direction) ? t.direction : "right", c = Math.max(.05, Number(t.duration ?? .7)), l = Math.max(0, Number(t.delay ?? 0)), u = t.ease ? L(t.ease) : "cubic-bezier(.77,0,.18,1)", d = G(Math.round(Number(t.layers ?? 2)), 1, 3), f = t.mask === !0, p = Math.max(0, d - +!!f), m = Math.max(0, Number(t.stagger ?? 120)), h = t.lines === !0, g = () => s === "random" ? [
			"left",
			"right",
			"up",
			"down"
		][Math.floor(Math.random() * 4)] : s, _ = (e) => ({
			right: "translateX(101%)",
			left: "translateX(-101%)",
			down: "translateY(101%)",
			up: "translateY(-101%)"
		})[e], v = [], y = [], b = e, x = null, S = !0, C = (t) => a === "single" ? [r] : a === "pair" ? [r, i] : a === "palette" ? o.length ? o : [r, i] : zo(t) || zo(e) || Vo(t || e), w = (e) => {
			let t = C(e.container), n = a === "palette" ? Math.floor(Math.random() * t.length) : 0;
			e.panels.forEach((e, r) => {
				let i = a === "pair" ? d > 1 && r === d - 1 ? t[1] : t[0] : t[(n + r) % t.length];
				e.style.background = i;
			});
		}, T = (e) => {
			e.panels = [];
			for (let t = 0; t < p; t += 1) {
				let n = document.createElement("span");
				n.setAttribute("aria-hidden", "true"), n.style.cssText = `position:absolute;inset:0;z-index:${20 + t};transform:translate(0,0);transition:transform ${c}s ${u};pointer-events:none;will-change:transform;`, e.container.appendChild(n), e.panels.push(n);
			}
			w(e);
		}, E = (e, t = e) => {
			let n = e.style.position, r = e.style.overflow;
			getComputedStyle(e).position === "static" && (e.style.position = "relative"), e.style.overflow = "hidden";
			let i = {
				container: e,
				content: t,
				panels: [],
				restorePosition: n,
				restoreOverflow: r,
				restoreClipPath: e.style.clipPath,
				restoreWebkitClipPath: e.style.webkitClipPath,
				restoreTransition: e.style.transition
			};
			return T(i), y.push(i), i.panels;
		}, D = null, O = () => {
			let t = getComputedStyle(e), n = e.tagName === "IMG" || t.display.startsWith("inline"), r = document.createElement("div");
			r.className = "kt-cover-wrap", r.style.cssText = `position:relative;overflow:hidden;display:${n ? "inline-block" : "block"};width:${n ? "auto" : "100%"};height:${n ? "auto" : "100%"};min-width:0;min-height:0;border-radius:${t.borderRadius};`, e.parentNode.insertBefore(r, e), r.appendChild(e), b = r, x = () => {
				r.parentNode && (r.parentNode.insertBefore(e, r), r.remove());
			}, E(r, e);
		};
		function k() {
			let t = e.textContent, n = t.split(/\s+/).filter((e) => e.length);
			if (n.length < 1) return !1;
			D = t, e.textContent = "";
			let r = n.map((t, r) => {
				let i = document.createElement("span");
				return i.textContent = t, e.appendChild(i), r < n.length - 1 && e.appendChild(document.createTextNode(" ")), i;
			}), i = [], a = null, o = null;
			return r.forEach((e) => {
				let t = Math.round(e.getBoundingClientRect().top);
				(o === null || Math.abs(t - o) > 3) && (a = [], i.push(a), o = t), a.push(e);
			}), e.textContent = "", i.forEach((t) => {
				let n = document.createElement("span");
				n.className = "kt-cover-line", n.style.cssText = "position:relative;display:block;overflow:hidden;width:max-content;max-width:100%;";
				let r = document.createElement("span");
				r.style.display = "block", r.textContent = t.map((e) => e.textContent).join(" "), n.appendChild(r), e.appendChild(n), E(n, r);
			}), !0;
		}
		h && k() || O();
		let A = !1, j = null, M = null, N = (e) => ({
			right: "inset(0 0 0 100%)",
			left: "inset(0 100% 0 0)",
			down: "inset(100% 0 0 0)",
			up: "inset(0 0 100% 0)"
		})[e] || "inset(0 0 0 100%)", P = [
			"left",
			"right",
			"up",
			"down"
		].includes(t.maskDirection) ? t.maskDirection : null, F = (e) => {
			e.container.style.clipPath = e.restoreClipPath, e.container.style.webkitClipPath = e.restoreWebkitClipPath, e.container.style.transition = e.restoreTransition;
		}, I = () => {
			if (!S || A) return;
			A = !0;
			let n = g(), r = _(n);
			f && y.forEach((e) => {
				let t = e.container;
				t.style.clipPath = N(P || n), t.style.webkitClipPath = t.style.clipPath, t.style.transition = `clip-path ${c}s ${u},-webkit-clip-path ${c}s ${u}`;
			}), e.offsetWidth, requestAnimationFrame(() => {
				y.forEach((e, t) => {
					let n = l + (h ? t * m : 0);
					f && v.push(setTimeout(() => {
						S && (e.container.style.clipPath = "inset(0 0 0 0)", e.container.style.webkitClipPath = "inset(0 0 0 0)");
					}, n)), e.panels.forEach((e, t) => {
						let i = Math.max(0, d - 1 - t);
						v.push(setTimeout(() => {
							S && (e.style.transform = r);
						}, n + i * m));
					});
				});
			});
			let i = h ? Math.max(0, y.length - 1) : 0, a = l + i * m + Math.max(0, d - 1) * m + c * 1e3 + 80;
			v.push(setTimeout(() => {
				S && (y.forEach((e) => {
					e.panels.forEach((e) => e.remove()), f && F(e);
				}), t.onComplete?.(e));
			}, a));
		}, R = t.waitForImage !== !1, z = h ? null : e.tagName === "IMG" ? e : e.querySelector && e.querySelector("img"), B = () => {
			if (R && z && !(z.complete && z.naturalWidth)) {
				let e = !1, t = () => {
					!e && S && (e = !0, z.removeEventListener("load", t), z.removeEventListener("error", t), a === "auto" && y.forEach(w), I());
				};
				try {
					z.decode && z.decode().then(t, t);
				} catch {}
				z.addEventListener("load", t, { once: !0 }), z.addEventListener("error", t, { once: !0 }), v.push(setTimeout(t, 4e3));
			} else a === "auto" && y.forEach(w), I();
		};
		n ? y.forEach((e) => e.panels.forEach((e) => e.remove())) : typeof IntersectionObserver < "u" ? M = requestAnimationFrame(() => {
			if (!S) return;
			let e = b.getBoundingClientRect();
			if (e.bottom > 0 && e.right > 0 && e.top < window.innerHeight && e.left < window.innerWidth) {
				B();
				return;
			}
			j = new IntersectionObserver((e) => {
				for (let t of e) if (t.isIntersecting) {
					j.disconnect(), j = null, B();
					break;
				}
			}, { threshold: G(Number(t.threshold ?? .2), 0, 1) }), j.observe(b);
		}) : B();
		let H = null, U = 0;
		t.watch === !0 && typeof MutationObserver < "u" && (H = new MutationObserver(() => {
			S && !n && (U && cancelAnimationFrame(U), U = requestAnimationFrame(() => {
				U = 0, S && W.replay();
			}));
		}), H.observe(e, {
			childList: !0,
			subtree: !1,
			characterData: !0
		}));
		let W = {
			el: e,
			type: "coverReveal",
			replay() {
				A = !1, v.forEach(clearTimeout), v = [], !n && (y.forEach((e) => {
					e.panels.forEach((e) => e.remove()), T(e);
				}), requestAnimationFrame(I));
			},
			exit() {
				return n ? Promise.resolve() : (A = !1, v.forEach(clearTimeout), v = [], y.forEach((e) => {
					e.panels.forEach((e) => e.remove()), T(e), f && F(e);
				}), new Promise((e) => requestAnimationFrame(() => e())));
			},
			async refresh(t) {
				await this.exit(), typeof t == "function" && await t(e), this.replay();
			},
			pause() {},
			resume() {},
			destroy() {
				S = !1, j?.disconnect(), H?.disconnect(), U && cancelAnimationFrame(U), M != null && cancelAnimationFrame(M), v.forEach(clearTimeout), y.forEach((e) => {
					e.panels.forEach((e) => e.remove()), F(e), e.container.style.overflow = e.restoreOverflow, e.container.style.position = e.restorePosition;
				}), x?.(), D != null && (e.textContent = D);
			}
		};
		return W;
	},
	reduced(e, t) {
		return this.create(e, t);
	}
};
//#endregion
//#region src/modules/gesture.js
function Uo(e, { threshold: t, max: n, resistance: r, duration: i, labels: a, onRefresh: o }) {
	let s = Math.max(20, Number(t ?? 64)), c = Math.max(s, Number(n ?? s * 1.8)), l = G(Number(r ?? .7), .05, 1), u = Math.max(0, Number(i ?? .32)), d = ee({
		pull: "Pull to refresh",
		release: "Release to refresh",
		busy: "Refreshing"
	}, a), f = Z(e, [
		"transform",
		"transition",
		"overscroll-behavior",
		"touch-action"
	]);
	e.style.overscrollBehavior = "contain";
	let p = document.createElement("span");
	p.className = "kt-pull-indicator", p.setAttribute("role", "status"), p.setAttribute("aria-live", "polite"), p.style.cssText = "position:absolute;left:50%;top:0;translate:-50% 0;display:grid;place-items:center;width:34px;height:34px;pointer-events:none;opacity:0;color:currentColor;", p.innerHTML = "<svg viewBox=\"0 0 36 36\" width=\"26\" height=\"26\" aria-hidden=\"true\"><circle cx=\"18\" cy=\"18\" r=\"15\" fill=\"none\" stroke=\"currentColor\" stroke-opacity=\".2\" stroke-width=\"3\"></circle><circle class=\"kt-pull-arc\" cx=\"18\" cy=\"18\" r=\"15\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"3\" stroke-linecap=\"round\" stroke-dasharray=\"94.2\" stroke-dashoffset=\"94.2\" transform=\"rotate(-90 18 18)\"></circle></svg><span class=\"kt-pull-label\"></span>";
	let m = p.querySelector(".kt-pull-arc"), h = p.querySelector(".kt-pull-label"), g = e.parentElement || e, _ = Z(g, ["position"]);
	getComputedStyle(g).position === "static" && (g.style.position = "relative"), g.appendChild(p);
	let v = (e) => {
		let t = e * l;
		if (t <= s) return t;
		let n = Math.max(1, c - s);
		return s + n * (1 - Math.exp(-(t - s) / n));
	}, y = !1, b = !1, x = 0, S = 0, C = null, w = (t, n) => {
		S = t;
		let r = G(S / s, 0, 1);
		e.style.transition = n ? `transform ${u}s cubic-bezier(.22,.8,.3,1)` : "none", e.style.transform = S ? `translateY(${S.toFixed(1)}px)` : "", p.style.opacity = String(G(S / (s * .6), 0, 1)), p.style.translate = `-50% ${Math.max(0, S - 34).toFixed(1)}px`, m.setAttribute("stroke-dashoffset", String(94.2 * (1 - r))), p.style.rotate = b ? "" : `${r * 180}deg`;
		let i = d(b ? "busy" : r >= 1 ? "release" : "pull");
		h.textContent !== i && (h.textContent = i);
	}, T = () => {
		if (!y) return;
		if (y = !1, C = null, S < s || b) {
			w(0, !0);
			return;
		}
		b = !0, e.classList.add("kt-pull-loading"), p.classList.add("kt-pull-spinning"), w(s, !0);
		let t = !0;
		try {
			t = e.dispatchEvent(new CustomEvent("kt-pull-refresh", {
				bubbles: !0,
				cancelable: !0
			}));
		} catch {}
		let n = t ? o?.(e) : null;
		Promise.resolve(n).finally(() => A.done());
	}, E = (t) => {
		b || e.scrollTop > 0 || (C = t.pointerId, x = t.clientY, y = !0);
	}, D = (e) => {
		if (!y || e.pointerId !== C) return;
		let t = e.clientY - x;
		if (t <= 0) {
			S && w(0, !1);
			return;
		}
		w(v(t), !1);
	}, O = () => T(), k = (e) => {
		y && S > 0 && e.preventDefault();
	};
	e.addEventListener("pointerdown", E, { passive: !0 }), e.addEventListener("pointermove", D, { passive: !0 }), e.addEventListener("pointerup", O), e.addEventListener("pointercancel", O), e.addEventListener("touchmove", k, { passive: !1 });
	let A = {
		el: e,
		type: "gesture",
		get refreshing() {
			return b;
		},
		refresh() {
			b || (y = !0, S = s, T());
		},
		done() {
			b && (b = !1, e.classList.remove("kt-pull-loading"), p.classList.remove("kt-pull-spinning"), w(0, !0));
		},
		pause() {},
		resume() {},
		destroy() {
			e.removeEventListener("pointerdown", E), e.removeEventListener("pointermove", D), e.removeEventListener("pointerup", O), e.removeEventListener("pointercancel", O), e.removeEventListener("touchmove", k), e.classList.remove("kt-pull-loading"), p.remove(), f(), _();
		}
	};
	return A;
}
function Wo(e, { hoverScale: t, tapScale: n, lift: r, duration: i, ease: a, hoverEase: o, pressEase: s, origin: c }) {
	if (V().reducedMotion) return {
		el: e,
		type: "gesture",
		pause() {},
		resume() {},
		destroy() {}
	};
	let l = Number(t ?? 1.04), u = Number(n ?? .96), d = Number(r ?? 0), f = Math.max(0, Number(i ?? .22)), p = a ? L(a) : z.spring ? "cubic-bezier(.34,1.8,.5,1)" : "cubic-bezier(.34,1.56,.64,1)", m = o ? L(o) : p, h = s ? L(s) : p, g = c || "center", _ = e.style.transition, v = e.style.transform, y = e.style.transformOrigin, b = e.style.willChange;
	e.style.transition = `transform ${f}s ${p}`, e.style.transformOrigin = g, e.style.willChange = "transform";
	let x = !1, S = !1, C = () => {
		let t = S ? u : x ? l : 1, n = x && !S ? -d : 0;
		e.style.transition = `transform ${f}s ${S ? h : m}`, e.style.transform = `translateY(${n}px) scale(${t})`;
	}, w = () => {
		x = !0, C();
	}, T = () => {
		x = !1, S = !1, C();
	}, E = () => {
		S = !0, C();
	}, D = () => {
		S = !1, C();
	}, O = () => {
		x = !0, C();
	}, k = () => {
		x = !1, S = !1, C();
	}, A = (e) => {
		(e.key === " " || e.key === "Enter") && (S = !0, C());
	}, j = (e) => {
		(e.key === " " || e.key === "Enter") && (S = !1, C());
	};
	return e.addEventListener("pointerenter", w), e.addEventListener("pointerleave", T), e.addEventListener("pointerdown", E), e.addEventListener("pointerup", D), e.addEventListener("pointercancel", D), e.addEventListener("focus", O), e.addEventListener("blur", k), e.addEventListener("keydown", A), e.addEventListener("keyup", j), {
		el: e,
		type: "gesture",
		pause() {},
		resume() {},
		destroy() {
			e.removeEventListener("pointerenter", w), e.removeEventListener("pointerleave", T), e.removeEventListener("pointerdown", E), e.removeEventListener("pointerup", D), e.removeEventListener("pointercancel", D), e.removeEventListener("focus", O), e.removeEventListener("blur", k), e.removeEventListener("keydown", A), e.removeEventListener("keyup", j), e.style.transition = _, e.style.transform = v, e.style.transformOrigin = y, e.style.willChange = b;
		}
	};
}
var Go = {
	create(e, t = {}) {
		return (t.preset === "pull" || t.effect === "pull" ? "pull" : "spring") == "pull" ? Uo(e, {
			threshold: t.threshold,
			max: t.max,
			resistance: t.resistance,
			duration: t.duration,
			labels: t.labels,
			onRefresh: t.onRefresh
		}) : Wo(e, {
			hoverScale: t.hoverScale,
			tapScale: t.tapScale,
			lift: t.lift,
			duration: t.duration,
			ease: t.ease,
			hoverEase: t.hoverEase,
			pressEase: t.pressEase,
			origin: t.origin
		});
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
}, Ko = {
	create(e, t = {}) {
		let n = [
			"x",
			"y",
			"both"
		].includes(t.axis) ? t.axis : "both", r = t.bounds, i = t.snapBack === !0, a = t.inertia !== !1 && !i, o = t.handle && e.querySelector(t.handle) || e, s = e.style.transform, c = e.style.transition, l = e.style.touchAction, u = o.style.cursor;
		e.style.touchAction = n === "x" ? "pan-y" : n === "y" ? "pan-x" : "none", o.style.cursor = "grab";
		let d = 0, f = 0, p = !1, m = 0, h = 0, g = 0, _ = 0, v = 0, y = 0, b = 0, x = 0, S = 0, C = null, w = () => {
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
		}, T = (t, r) => {
			n === "y" && (t = 0), n === "x" && (r = 0);
			let i = w();
			i && (t = G(t, i.minX, i.maxX), r = G(r, i.minY, i.maxY)), d = t, f = r, e.style.transform = `translate(${d}px, ${f}px)`;
		}, E = (t) => {
			(t.button == null || t.button === 0) && (p = !0, e.style.transition = "none", o.style.cursor = "grabbing", m = t.clientX, h = t.clientY, g = d, _ = f, v = t.clientX, y = t.clientY, b = performance.now(), C &&= (cancelAnimationFrame(C), null));
		}, D = (e) => {
			if (!p) return;
			T(g + (e.clientX - m), _ + (e.clientY - h));
			let t = performance.now(), n = t - b || 16;
			x = (e.clientX - v) / n, S = (e.clientY - y) / n, v = e.clientX, y = e.clientY, b = t;
		}, O = () => {
			if (p) {
				if (p = !1, o.style.cursor = "grab", i) e.style.transition = "transform .42s cubic-bezier(.22,.8,.3,1)", T(0, 0);
				else if (a && (Math.abs(x) > .02 || Math.abs(S) > .02)) {
					let e = () => {
						x *= .92, S *= .92, T(d + x * 16, f + S * 16), C = Math.abs(x) > .02 || Math.abs(S) > .02 ? requestAnimationFrame(e) : null;
					};
					C = requestAnimationFrame(e);
				}
			}
		}, k = (t) => {
			let n = t.shiftKey ? 20 : 6, r = !0;
			e.style.transition = "transform .12s var(--kt-ease-ui, ease)", t.key === "ArrowLeft" ? T(d - n, f) : t.key === "ArrowRight" ? T(d + n, f) : t.key === "ArrowUp" ? T(d, f - n) : t.key === "ArrowDown" ? T(d, f + n) : r = !1, r && t.preventDefault();
		};
		o.addEventListener("pointerdown", E), window.addEventListener("pointermove", D), window.addEventListener("pointerup", O), window.addEventListener("pointercancel", O);
		let A = se(e, ["tabindex"]);
		return e.hasAttribute("tabindex") || (e.tabIndex = 0), e.addEventListener("keydown", k), {
			el: e,
			type: "drag",
			reset() {
				e.style.transition = "transform .42s cubic-bezier(.22,.8,.3,1)", T(0, 0);
			},
			pause() {},
			resume() {},
			destroy() {
				C && cancelAnimationFrame(C), o.removeEventListener("pointerdown", E), window.removeEventListener("pointermove", D), window.removeEventListener("pointerup", O), window.removeEventListener("pointercancel", O), e.removeEventListener("keydown", k), A(), e.style.transform = s, e.style.transition = c, e.style.touchAction = l, o.style.cursor = u;
			}
		};
	},
	reduced(e, t) {
		return this.create(e, t);
	}
}, qo = {
	create(e, t = {}) {
		let n = V().reducedMotion, r = e.getAttribute("title"), i = t.content || e.getAttribute("data-kt-title") || r || e.getAttribute("aria-label") || "";
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
		].includes(t.trigger) ? t.trigger : "hover", s = Math.max(0, Number(t.delay ?? 120)), c = Math.max(0, Number(t.hideDelay ?? 80)), l = Number(t.offset ?? 8), u = Math.max(0, Number(t.duration ?? .16)), d = t.interactive === !0, f = t.html === !0, p = [
			"fade",
			"scale",
			"shift",
			"none"
		].includes(t.effect) ? t.effect : "fade", m = p === "scale" ? {
			opacity: 0,
			transform: "scale(0.9)"
		} : p === "shift" ? {
			opacity: 0,
			transform: "translateY(5px)"
		} : {
			opacity: 0,
			transform: "none"
		}, h = {
			opacity: 1,
			transform: "none"
		}, g = document.createElement("div");
		g.className = "kt-tooltip", g.setAttribute("role", "tooltip"), g.id = `kt-tooltip-${Math.random().toString(36).slice(2, 8)}`, g.hidden = !0, g.style.position = "fixed", g.style.opacity = "0", f ? g.innerHTML = i : g.textContent = i;
		let _ = document.createElement("span");
		_.className = "kt-tooltip__arrow", _.setAttribute("aria-hidden", "true"), g.appendChild(_), document.body.appendChild(g);
		let v = e.getAttribute("aria-describedby");
		e.setAttribute("aria-describedby", v ? `${v} ${g.id}` : g.id);
		let y = !1, b = null, x = null, S = null, C = () => {
			let t = e.getBoundingClientRect(), n = g.offsetWidth, r = g.offsetHeight, i = window.innerWidth, o = window.innerHeight, s = a;
			s === "top" && t.top - r - l < 0 ? s = "bottom" : s === "bottom" && t.bottom + r + l > o ? s = "top" : s === "left" && t.left - n - l < 0 ? s = "right" : s === "right" && t.right + n + l > i && (s = "left");
			let c, u;
			s === "top" ? (c = t.left + t.width / 2 - n / 2, u = t.top - r - l) : s === "bottom" ? (c = t.left + t.width / 2 - n / 2, u = t.bottom + l) : s === "left" ? (c = t.left - n - l, u = t.top + t.height / 2 - r / 2) : (c = t.right + l, u = t.top + t.height / 2 - r / 2), c = G(c, 4, i - n - 4), u = G(u, 4, o - r - 4), g.dataset.placement = s, g.style.left = `${Math.round(c)}px`, g.style.top = `${Math.round(u)}px`;
		}, w = () => {
			clearTimeout(x), !y && (y = !0, g.hidden = !1, C(), S && S.cancel(), g.style.opacity = "1", !n && p !== "none" && (S = g.animate([m, h], {
				duration: u * 1e3,
				easing: "ease"
			})), window.addEventListener("scroll", C, {
				capture: !0,
				passive: !0
			}), window.addEventListener("resize", C));
		}, T = () => {
			if (clearTimeout(b), !y) return;
			y = !1;
			let e = () => {
				y || (g.hidden = !0, g.style.opacity = "0");
			};
			S && S.cancel(), g.style.opacity = "0", !n && p !== "none" ? (S = g.animate([h, m], {
				duration: u * 700,
				easing: "ease"
			}), S.onfinish = e, S.oncancel = e) : e(), window.removeEventListener("scroll", C, !0), window.removeEventListener("resize", C);
		}, E = () => {
			clearTimeout(x), b = setTimeout(w, s);
		}, D = () => {
			clearTimeout(b), x = setTimeout(T, c);
		}, O = () => E(), k = () => D(), A = () => w(), j = () => T(), M = () => {
			y ? T() : w();
		}, N = (e) => {
			e.key === "Escape" && y && T();
		}, P = (t) => {
			y && !e.contains(t.target) && !g.contains(t.target) && T();
		};
		return o === "hover" ? (e.addEventListener("pointerenter", O), e.addEventListener("pointerleave", k), e.addEventListener("focus", A), e.addEventListener("blur", j), d && (g.style.pointerEvents = "auto", g.addEventListener("pointerenter", () => clearTimeout(x)), g.addEventListener("pointerleave", D))) : o === "focus" ? (e.addEventListener("focus", A), e.addEventListener("blur", j)) : o === "click" && (e.addEventListener("click", M), document.addEventListener("pointerdown", P, !0)), e.addEventListener("keydown", N), {
			el: e,
			type: "tooltip",
			show: w,
			hide: T,
			update(e = {}) {
				e.content != null && ((e.html == null ? f : e.html === !0) ? g.innerHTML = String(e.content) : g.textContent = String(e.content)), y && C();
			},
			pause() {},
			resume() {},
			destroy() {
				clearTimeout(b), clearTimeout(x), window.removeEventListener("scroll", C, !0), window.removeEventListener("resize", C), e.removeEventListener("pointerenter", O), e.removeEventListener("pointerleave", k), e.removeEventListener("focus", A), e.removeEventListener("blur", j), e.removeEventListener("click", M), document.removeEventListener("pointerdown", P, !0), e.removeEventListener("keydown", N), g.remove();
				let t = (e.getAttribute("aria-describedby") || "").split(/\s+/).filter((e) => e && e !== g.id).join(" ");
				t ? e.setAttribute("aria-describedby", t) : e.removeAttribute("aria-describedby"), r != null && e.setAttribute("title", r);
			}
		};
	},
	reduced(e, t) {
		return this.create(e, t);
	}
}, Jo = {
	create(e, t = {}) {
		let n = V().reducedMotion, r = Math.max(14, Number(t.size ?? 24)), i = t.onColor || "var(--kt-switch-on, #ff5b1c)", a = t.offColor || "var(--kt-switch-off, color-mix(in srgb, currentColor 26%, transparent))", o = t.thumbColor || "var(--kt-switch-thumb, #fff)", s = Math.max(0, Number(t.duration ?? .22)), c = e.tagName === "INPUT" ? null : e.querySelector("input[type=\"checkbox\"], input[type=\"radio\"]");
		c && (c.style.position = "absolute", c.style.opacity = "0", c.style.pointerEvents = "none", c.style.width = "0", c.style.height = "0", c.tabIndex = -1);
		let l = t.checked === !0 || (c ? c.checked : e.getAttribute("aria-checked") === "true" || e.hasAttribute("checked")), u = e.getAttribute("style"), d = Math.round(r * .16), f = Math.round(r * .8);
		e.classList.add("kt-switch"), e.setAttribute("role", "switch");
		let p = se(e, ["tabindex"]);
		e.tagName !== "BUTTON" && e.tagName !== "INPUT" && !e.hasAttribute("tabindex") && (e.tabIndex = 0), e.style.display = "inline-flex", e.style.alignItems = "center", e.style.boxSizing = "content-box", e.style.width = `${r + f}px`, e.style.height = `${r}px`, e.style.padding = `${d}px`, e.style.borderRadius = `${r}px`, e.style.border = "0", e.style.cursor = "pointer", e.style.transition = `background-color ${s}s ease`, e.style.verticalAlign = "middle";
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
				e.removeEventListener("click", _), e.removeEventListener("keydown", v), c && (c.removeEventListener("change", y), c.style.position = "", c.style.opacity = "", c.style.pointerEvents = "", c.style.width = "", c.style.height = "", c.removeAttribute("tabindex")), m.remove(), e.classList.remove("kt-switch", "kt-on"), e.removeAttribute("role"), e.removeAttribute("aria-checked"), p(), u == null ? e.removeAttribute("style") : e.setAttribute("style", u);
			}
		};
	},
	reduced(e, t) {
		return this.create(e, t);
	}
}, Yo = {
	create(e, t = {}) {
		let n = V().reducedMotion, r = Math.max(0, Number(t.duration ?? .4)), i = t.ease || "cubic-bezier(.22,.8,.3,1)", a = Math.max(0, Number(t.stagger ?? 0)), o = t.item || null, s = () => o ? Array.from(e.querySelectorAll(o)) : Array.from(e.children), c = /* @__PURE__ */ new Set(), l = (e, t) => {
			let n = e.cloneNode(!0);
			n.removeAttribute("id"), n.querySelectorAll?.("[id]").forEach((e) => e.removeAttribute("id"));
			let r = [e, ...e.querySelectorAll("*")], i = [n, ...n.querySelectorAll("*")];
			return r.forEach((e, t) => {
				let n = getComputedStyle(e);
				for (let e = 0; e < n.length; e += 1) {
					let r = n[e];
					i[t]?.style.setProperty(r, n.getPropertyValue(r), n.getPropertyPriority(r));
				}
			}), n.setAttribute("aria-hidden", "true"), n.style.cssText += `;position:fixed;left:${t.left}px;top:${t.top}px;width:${t.width}px;height:${t.height}px;margin:0;transform:none;pointer-events:none;z-index:2147483646;`, document.body.appendChild(n), c.add(n), n;
		}, u = /* @__PURE__ */ new WeakMap(), d = /* @__PURE__ */ new WeakSet(), f = () => {
			u = /* @__PURE__ */ new WeakMap(), d = /* @__PURE__ */ new WeakSet(), s().forEach((e) => {
				u.set(e, e.getBoundingClientRect()), d.add(e);
			});
		}, p = [
			"none",
			"slide",
			"fade",
			"crossfade",
			"fade-slide",
			"scale",
			"fold"
		].includes(t.mode) ? t.mode : "slide", m = Math.max(0, Number(t.foldBlur ?? 12)), h = () => p === "fade" || p === "crossfade" ? [{ opacity: 0 }, { opacity: 1 }] : [{
			opacity: 0,
			transform: "scale(.92)"
		}, {
			opacity: 1,
			transform: "none"
		}], g = (e, t, n, r) => {
			let i = `translate(${e}px, ${t}px) scale(${n}, ${r})`;
			return p === "fade" ? [
				{
					transform: i,
					opacity: 1,
					offset: 0
				},
				{
					transform: i,
					opacity: 0,
					offset: .44
				},
				{
					transform: "none",
					opacity: 0,
					offset: .56
				},
				{
					transform: "none",
					opacity: 1,
					offset: 1
				}
			] : p === "fade-slide" ? [{
				transform: i,
				opacity: .15
			}, {
				transform: "none",
				opacity: 1
			}] : p === "scale" ? [
				{
					transform: i,
					offset: 0
				},
				{
					transform: `translate(${e}px, ${t}px) scale(.18)`,
					offset: .46
				},
				{
					transform: "scale(.18)",
					offset: .54
				},
				{
					transform: "none",
					offset: 1
				}
			] : [{ transform: i }, { transform: "none" }];
		}, _ = () => {
			if (n || r === 0 || p === "none") {
				f();
				return;
			}
			let e = 0;
			s().forEach((t) => {
				let n = u.get(t), o = t.getBoundingClientRect();
				if (!n || !d.has(t)) {
					t.animate(h(), {
						duration: r * 1e3,
						easing: i,
						delay: e * a * 1e3
					}), e += 1;
					return;
				}
				let s = n.left - o.left, f = n.top - o.top, _ = o.width ? n.width / o.width : 1, v = o.height ? n.height / o.height : 1;
				if (!(Math.abs(s) < 1 && Math.abs(f) < 1 && Math.abs(_ - 1) < .01 && Math.abs(v - 1) < .01)) {
					if (p === "crossfade" || p === "fold") {
						let o = {
							duration: r * 1e3,
							easing: i,
							delay: e * a * 1e3
						}, u = `translate(${s}px, ${f}px) scale(${_}, ${v})`, d = l(t, n), h = d.animate(p === "fold" ? [
							{
								opacity: 1,
								filter: "blur(0px)",
								offset: 0
							},
							{
								opacity: 0,
								filter: `blur(${m}px)`,
								offset: .62
							},
							{
								opacity: 0,
								filter: `blur(${m}px)`,
								offset: 1
							}
						] : [{ opacity: 1 }, { opacity: 0 }], o), g = t.animate(p === "fold" ? [
							{
								transform: u,
								opacity: 0,
								filter: `blur(${m}px)`,
								offset: 0
							},
							{
								opacity: 1,
								offset: .62
							},
							{
								transform: "none",
								opacity: 1,
								filter: "blur(0px)",
								offset: 1
							}
						] : [{ opacity: 0 }, { opacity: 1 }], o);
						Promise.allSettled([h.finished, g.finished]).then(() => {
							c.delete(d), d.remove();
						}), e += 1;
						return;
					}
					t.animate(g(s, f, _, v), {
						duration: r * 1e3,
						easing: i,
						delay: e * a * 1e3
					}), e += 1;
				}
			}), f();
		}, v = null, y = () => {
			v && t.watch !== !1 && v.observe(e, {
				childList: !0,
				subtree: !1
			});
		};
		t.watch !== !1 && typeof MutationObserver < "u" && (v = new MutationObserver(() => _()), y()), f();
		let b = (r) => {
			v?.disconnect(), f();
			let i = document.createDocumentFragment();
			r.forEach((e) => i.appendChild(e));
			let a = t.viewTransition === !0 && !n && typeof document.startViewTransition == "function", o = [], s = /* @__PURE__ */ new Set();
			a && r.forEach((e) => {
				let t = e.getAttribute?.("data-kt-layout-id")?.trim();
				if (!t) return;
				let n = `kt-${t.replace(/[^a-zA-Z0-9_-]+/g, "-")}`;
				n && !s.has(n) && (s.add(n), o.push({
					item: e,
					authored: e.style.viewTransitionName,
					name: n
				}), e.style.viewTransitionName = n);
			});
			let c = () => e.appendChild(i);
			if (a && o.length) {
				let e = !1;
				try {
					let t = document.startViewTransition(() => {
						e = !0, c(), f(), y();
					});
					return Promise.resolve(t?.finished).catch(() => {}).finally(() => {
						o.forEach(({ item: e, authored: t }) => {
							t ? e.style.viewTransitionName = t : e.style.removeProperty("view-transition-name");
						});
					}), r;
				} catch {
					e || c(), o.forEach(({ item: e, authored: t }) => {
						t ? e.style.viewTransitionName = t : e.style.removeProperty("view-transition-name");
					});
				}
			} else c();
			return requestAnimationFrame(() => {
				_(), y();
			}), r;
		};
		return {
			el: e,
			type: "flip",
			record: f,
			play: _,
			reorder: b,
			shuffle: () => {
				let e = s();
				for (let t = e.length - 1; t > 0; --t) {
					let n = Math.floor(Math.random() * (t + 1));
					[e[t], e[n]] = [e[n], e[t]];
				}
				return b(e);
			},
			sort: (e = "asc", t = {}) => {
				let n = s();
				if (typeof e == "function") return b(n.sort(e));
				let r = String(e || "asc").toLowerCase(), i = (t.order || (r === "desc" ? "desc" : "asc")) === "desc" ? -1 : 1, a = t.key || (r === "date" ? "date" : r === "category" ? "category" : ""), o = t.getValue || ((e) => a ? e.dataset?.[a] ?? e.getAttribute(`data-${a}`) ?? "" : e.textContent?.trim() || ""), c = Array.isArray(t.categoryOrder) ? t.categoryOrder : null, l = new Intl.Collator(t.locale, {
					numeric: !0,
					sensitivity: "base"
				});
				return n.sort((e, t) => {
					let n = o(e), a = o(t);
					if (r === "date") return ((Date.parse(n) || 0) - (Date.parse(a) || 0)) * i;
					if (r === "category" && c) {
						let e = c.indexOf(n), t = c.indexOf(a), r = e < 0 ? c.length : e, o = t < 0 ? c.length : t;
						if (r !== o) return (r - o) * i;
					}
					return l.compare(String(n), String(a)) * i;
				}), b(n);
			},
			pause() {
				v?.disconnect();
			},
			resume() {
				y();
			},
			destroy() {
				v?.disconnect(), v = null, c.forEach((e) => e.remove()), c.clear();
			}
		};
	},
	reduced(e, t) {
		return this.create(e, t);
	}
};
//#endregion
//#region src/modules/scrollShadows.js
function Xo(e) {
	let t = String(e || "cubic-out").trim(), n = t.match(/^cubic-bezier\(\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)\s*\)$/i);
	return n ? I(...n.slice(1).map(Number)) : t === "ease" ? I(.25, .1, .25, 1) : t === "ease-in" ? I(.42, 0, 1, 1) : t === "ease-out" ? I(0, 0, .58, 1) : t === "ease-in-out" ? I(.42, 0, .58, 1) : F(t);
}
var Zo = {
	create(e, t = {}) {
		let n = t.axis === "horizontal" || t.axis === "x" ? "horizontal" : "vertical", r = Math.max(4, Number(t.size ?? 44)), i = t.mode === "mask" ? "mask" : "shadow", a = n === "horizontal", o = t.transitionMode === "instant" ? "instant" : "smooth", s = Number(t.transition), c = o === "instant" ? 0 : Math.max(0, Number(t.transitionDuration ?? (Number.isFinite(s) ? s / 1e3 : .18))) * 1e3, l = Xo(t.ease || "cubic-out"), u = null, d = () => {
			let t = a ? e.scrollLeft : e.scrollTop, r = Math.max(0, a ? e.scrollWidth - e.clientWidth : e.scrollHeight - e.clientHeight);
			return {
				axis: n,
				position: t,
				max: r,
				progress: r > 0 ? t / r : 0,
				atStart: t <= 1,
				atEnd: r <= 1 || t >= r - 1,
				canScrollStart: t > 1,
				canScrollEnd: r > 1 && t < r - 1
			};
		}, f = () => {
			let n = d();
			e.classList.toggle("kt-at-start", n.atStart), e.classList.toggle("kt-at-end", n.atEnd), e.classList.toggle("kt-can-scroll-start", n.canScrollStart), e.classList.toggle("kt-can-scroll-end", n.canScrollEnd), e.style.setProperty("--kt-scroll-shadow-progress", n.progress.toFixed(4));
			let r = `${n.atStart}:${n.atEnd}:${n.canScrollStart}:${n.canScrollEnd}`;
			if (r !== u) {
				u = r, t.onChange?.(n, e);
				let i = e.ownerDocument?.defaultView?.CustomEvent || globalThis.CustomEvent;
				i && e.dispatchEvent(new i("kineto:scroll-shadows-change", { detail: n }));
			}
			return n;
		}, p = Z(e, ["overflowX", "overflowY"]);
		if (a ? getComputedStyle(e).overflowX === "visible" && (e.style.overflowX = "auto") : getComputedStyle(e).overflowY === "visible" && (e.style.overflowY = "auto"), i === "mask") {
			let t = Z(e, ["maskImage", "webkitMaskImage"]), n = a ? "to right" : "to bottom", i = null, o = null, s = null, u = 0, m = 0, h = 0, g = 0, _ = 0, v = () => {
				e.style.setProperty("--kt-scroll-shadow-start", `${o.toFixed(2)}px`), e.style.setProperty("--kt-scroll-shadow-end", `${s.toFixed(2)}px`);
				let t = `linear-gradient(${n}, transparent 0, #000 min(var(--kt-scroll-shadow-size, ${r}px), var(--kt-scroll-shadow-start)), #000 calc(100% - min(var(--kt-scroll-shadow-size, ${r}px), var(--kt-scroll-shadow-end, ${r}px))), transparent 100%)`;
				e.style.maskImage = t, e.style.webkitMaskImage = t, f();
			}, y = (e = performance.now()) => {
				if (i = null, o == null || c === 0) {
					o = u, s = m, v();
					return;
				}
				let t = Math.max(0, e - _), n = Math.min(1, t / c), r = l(n);
				o = h + (u - h) * r, s = g + (m - g) * r, v(), n < 1 && (i = requestAnimationFrame(y));
			}, b = (t = !1) => {
				let n = a ? e.scrollLeft : e.scrollTop, l = a ? e.scrollWidth - e.clientWidth : e.scrollHeight - e.clientHeight, d = Math.max(0, Math.min(r, n)), f = Math.max(0, Math.min(r, l - n));
				(o == null || t || c === 0) && (o = d, s = f), h = o, g = s, u = d, m = f, _ = performance.now(), i != null && cancelAnimationFrame(i), i = requestAnimationFrame(y);
			}, x = () => b(!1);
			return b(!0), e.addEventListener("scroll", x, { passive: !0 }), window.addEventListener("resize", x, { passive: !0 }), {
				el: e,
				type: "scrollShadows",
				get state() {
					return d();
				},
				refresh() {
					return b(!0), d();
				},
				pause() {},
				resume() {},
				destroy() {
					i != null && cancelAnimationFrame(i), e.removeEventListener("scroll", x), window.removeEventListener("resize", x), e.classList.remove("kt-at-start", "kt-at-end", "kt-can-scroll-start", "kt-can-scroll-end"), e.style.removeProperty("--kt-scroll-shadow-progress"), e.style.removeProperty("--kt-scroll-shadow-start"), e.style.removeProperty("--kt-scroll-shadow-end"), t(), p();
				}
			};
		}
		let m = Math.round(r * .34), h = typeof getComputedStyle < "u" ? getComputedStyle(e).backgroundColor : "", g = h && h !== "rgba(0, 0, 0, 0)" && h !== "transparent", _ = `var(--kt-scroll-shadow-cover, ${t.color || (g ? h : "Canvas")})`, v = `var(--kt-scroll-shadow, ${t.shadow || "rgba(0, 0, 0, 0.24)"})`, y = Math.max(0, Math.min(1, Number(t.opacity ?? 1))), b = y < 1 ? `color-mix(in srgb, ${v} ${Math.round(y * 100)}%, transparent)` : v, x = t.shape === "linear", S = Z(e, [
			"backgroundImage",
			"backgroundRepeat",
			"backgroundSize",
			"backgroundPosition",
			"backgroundAttachment",
			"backgroundColor"
		]), C = a ? [`linear-gradient(to right, ${_} 30%, rgba(0,0,0,0))`, `linear-gradient(to left, ${_} 30%, rgba(0,0,0,0))`] : [`linear-gradient(${_} 30%, rgba(0,0,0,0))`, `linear-gradient(rgba(0,0,0,0), ${_} 70%)`], w = x ? a ? [`linear-gradient(to right, ${b}, rgba(0,0,0,0))`, `linear-gradient(to left, ${b}, rgba(0,0,0,0))`] : [`linear-gradient(to bottom, ${b}, rgba(0,0,0,0))`, `linear-gradient(to top, ${b}, rgba(0,0,0,0))`] : a ? [`radial-gradient(farthest-side at 0 50%, ${b}, rgba(0,0,0,0))`, `radial-gradient(farthest-side at 100% 50%, ${b}, rgba(0,0,0,0))`] : [`radial-gradient(farthest-side at 50% 0, ${b}, rgba(0,0,0,0))`, `radial-gradient(farthest-side at 50% 100%, ${b}, rgba(0,0,0,0))`];
		e.style.backgroundImage = [...C, ...w].join(", "), e.style.backgroundRepeat = "no-repeat", e.style.backgroundColor = _, a ? (e.style.backgroundSize = `var(--kt-scroll-shadow-size, ${r}px) 100%, var(--kt-scroll-shadow-size, ${r}px) 100%, var(--kt-scroll-shadow-shade, ${m}px) 100%, var(--kt-scroll-shadow-shade, ${m}px) 100%`, e.style.backgroundAttachment = "local, local, scroll, scroll", e.style.backgroundPosition = "left center, right center, left center, right center") : (e.style.backgroundSize = `100% var(--kt-scroll-shadow-size, ${r}px), 100% var(--kt-scroll-shadow-size, ${r}px), 100% var(--kt-scroll-shadow-shade, ${m}px), 100% var(--kt-scroll-shadow-shade, ${m}px)`, e.style.backgroundAttachment = "local, local, scroll, scroll", e.style.backgroundPosition = "center top, center bottom, center top, center bottom");
		let T = () => f();
		return e.addEventListener("scroll", T, { passive: !0 }), window.addEventListener("resize", T, { passive: !0 }), f(), {
			el: e,
			type: "scrollShadows",
			get state() {
				return d();
			},
			refresh() {
				return f();
			},
			pause() {},
			resume() {},
			destroy() {
				e.removeEventListener("scroll", T), window.removeEventListener("resize", T), e.classList.remove("kt-at-start", "kt-at-end", "kt-can-scroll-start", "kt-can-scroll-end"), e.style.removeProperty("--kt-scroll-shadow-progress"), S(), p();
			}
		};
	},
	reduced(e, t) {
		return this.create(e, t);
	}
}, Qo = Object.freeze([
	"squircle",
	"round",
	"bevel",
	"scoop",
	"notch",
	"square"
]), $o = Object.freeze({
	square: Infinity,
	squircle: 2,
	round: 1,
	bevel: 0,
	scoop: -1,
	notch: -Infinity
}), es = 12;
function ts(e, t) {
	let n = Number.isFinite(Number(t)) ? Number(t) : $o[e] ?? $o.squircle;
	return Math.max(-12, Math.min(es, n));
}
function ns(e) {
	let t = 2 / 2 ** Math.abs(e), n = e < 0;
	return {
		concave: n,
		at(e, r) {
			let i = e === 0 ? 1 : e === r ? 0 : Math.cos(e / r * (Math.PI / 2)), a = e === 0 ? 0 : e === r ? 1 : Math.sin(e / r * (Math.PI / 2));
			return n ? [1 - a ** +t, 1 - i ** +t] : [i ** +t, a ** +t];
		}
	};
}
function rs(e) {
	return e >= 0 ? 1 - 2 ** (-1 / 2 ** e) : 2 ** (-1 / 2 ** -e);
}
function is(e, t, n, r, i, a, o, s, c, l) {
	for (let u = 0; u <= l; u += 1) {
		let [d, f] = c.at(s ? l - u : u, l);
		e.push([t + a * r * d, n + o * i * f]);
	}
}
function as(e, t, n) {
	let [r, i, a, o] = e, s = Math.min(1, t / Math.max(1e-6, r + i), t / Math.max(1e-6, o + a), n / Math.max(1e-6, r + o), n / Math.max(1e-6, i + a));
	return e.map((e) => Math.max(0, e * s));
}
function os(e, t, n, r, i) {
	let [a, o, s, c] = as(n, e, t), l = Math.max(2, Math.round(i ?? Math.min(48, Math.max(8, Math.ceil(Math.max(a, o, s, c) / 2))))), u = ns(r), d = [];
	return is(d, a, a, a, a, -1, -1, !1, u, l), is(d, e - o, o, o, o, 1, -1, !0, u, l), is(d, e - s, t - s, s, s, 1, 1, !1, u, l), is(d, c, t - c, c, c, -1, 1, !0, u, l), d;
}
function ss(e, t, n, r, i) {
	return `polygon(${os(e, t, n, r, i).map(([e, t]) => `${e.toFixed(2)}px ${t.toFixed(2)}px`).join(",")})`;
}
function cs(e, t, n, r, i) {
	let [a, ...o] = os(e, t, n, r, i);
	return `M${a[0].toFixed(2)} ${a[1].toFixed(2)}${o.map(([e, t]) => `L${e.toFixed(2)} ${t.toFixed(2)}`).join("")}Z`;
}
//#endregion
//#region src/modules/squircle.js
var ls = "kt-squircle-border", us = "http://www.w3.org/2000/svg";
function ds() {
	return typeof CSS < "u" && typeof CSS.supports == "function" && CSS.supports("corner-shape", "squircle");
}
function fs(e, t, n) {
	if (e == null || e === "" || e === "auto") return null;
	let r = String(e).trim().split(/\s+/).slice(0, 4), i = (e, t) => {
		let n = /%$/.test(e), r = parseFloat(e);
		return Number.isFinite(r) ? n ? r / 100 * t : r : null;
	}, a = Math.min(t, n), o = r.map((e) => i(e, a));
	if (o.some((e) => e == null)) return null;
	let [s, c = s, l = s, u = c] = o;
	return [
		s,
		c,
		l,
		u
	];
}
function ps(e, t, n) {
	let r = Math.min(t, n), i = (e) => {
		let t = String(e || "0").trim().split(/\s+/)[0], n = parseFloat(t);
		return Number.isFinite(n) ? /%$/.test(t) ? n / 100 * r : n : 0;
	};
	return [
		i(e.borderTopLeftRadius),
		i(e.borderTopRightRadius),
		i(e.borderBottomRightRadius),
		i(e.borderBottomLeftRadius)
	];
}
function ms(e, t) {
	return Number.isFinite(Number(t)) ? `superellipse(${Number(t)})` : e;
}
function hs() {
	let e = document.createElementNS(us, "svg");
	e.setAttribute("class", ls), e.setAttribute("aria-hidden", "true"), e.setAttribute("preserveAspectRatio", "none"), e.style.cssText = "position:absolute;left:0;top:0;width:100%;height:100%;pointer-events:none;overflow:visible;";
	let t = document.createElementNS(us, "path");
	return t.setAttribute("fill", "none"), e.appendChild(t), {
		svg: e,
		path: t
	};
}
var gs = {
	create(e, t = {}) {
		let n = Qo.includes(t.preset) ? t.preset : "squircle", r = t.superellipse, i = ts(n, r), a = t.nativeShape !== "off" && t.nativeShape !== !1 && ds(), o = t.borderFollow !== "off" && t.borderFollow !== !1, s = Number.isFinite(Number(t.cornerSamples)) ? Math.round(Number(t.cornerSamples)) : void 0, c = Z(e, [
			"border-radius",
			"corner-shape",
			"clip-path",
			"position",
			"border-color"
		]), l = null, u = null, d = !1, f = "", p = {
			width: 0,
			height: 0,
			radii: [
				0,
				0,
				0,
				0
			]
		}, m = () => {
			let n = e.getBoundingClientRect(), r = getComputedStyle(e), i = Math.max(0, n.width), a = Math.max(0, n.height), o = fs(t.cornerRadius, i, a), s = ps(r, i, a);
			return {
				width: i,
				height: a,
				radii: o || (s.some((e) => e > 0) ? s : [
					24,
					24,
					24,
					24
				]),
				computed: r
			};
		}, h = ({ width: t, height: n, radii: r, computed: c }) => {
			let u = parseFloat(c.borderTopWidth) || 0;
			if (!(o && !a && u > 0 && c.borderTopStyle !== "none")) {
				l &&= (l.svg.remove(), null);
				return;
			}
			l || (c.position === "static" && (e.style.position = "relative"), l = hs(), e.appendChild(l.svg)), l.svg.setAttribute("viewBox", `0 0 ${t} ${n}`), l.path.setAttribute("d", cs(t, n, r, i, s)), l.path.setAttribute("stroke", c.borderTopColor), l.path.setAttribute("stroke-width", String(u * 2)), e.style.borderColor = "transparent";
		}, g = () => {
			if (d) return;
			let t = m(), { width: o, height: c, radii: l } = t;
			if (o <= 0 || c <= 0) return;
			let u = `${o}x${c}|${l.join(",")}`;
			u !== f && (f = u, p = {
				width: o,
				height: c,
				radii: [...l]
			}, a ? (e.style.borderRadius = l.map((e) => `${e}px`).join(" "), e.style.cornerShape = ms(n, r)) : (e.style.borderRadius = "0px", e.style.clipPath = ss(o, c, l, i, s)), h(t));
		};
		return g(), !a && typeof ResizeObserver < "u" && (u = new ResizeObserver(() => g()), u.observe(e)), {
			el: e,
			type: "squircle",
			get renderer() {
				return a ? "native" : "polyfill";
			},
			get shape() {
				return {
					preset: n,
					k: i,
					diagonal: rs(i),
					...p
				};
			},
			refresh() {
				f = "", g();
			},
			pause() {},
			resume() {},
			destroy() {
				d || (d = !0, u?.disconnect(), u = null, l?.svg.remove(), l = null, c());
			}
		};
	},
	reduced(e, t) {
		return this.create(e, t);
	}
}, _s = { create(e, t = {}) {
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
		let i = c(), a = G(i / r, 0, 1);
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
} }, vs = {
	create(e, t = {}) {
		let n = t.height || "100vh", r = t.top || `calc((100svh - ${n}) / 2)`, i = t.smooth === !0 ? .12 : typeof t.smooth == "number" ? G(t.smooth, .02, 1) : 0;
		if (!e.parentNode) return null;
		let a = Array.from(e.childNodes), o = e.getAttribute("style"), s = e.children.length === 1 && e.firstElementChild?.classList.contains("hscroll-track") ? e.firstElementChild : null, c = document.createElement("div");
		c.className = "kt-hscroll-viewport";
		let l = s || document.createElement("div"), u = l.getAttribute("style");
		s || (l.className = "kt-hscroll-track", a.forEach((e) => l.appendChild(e))), c.appendChild(l), e.appendChild(c), e.classList.add("kt-hscroll"), e.style.position = "relative", e.style.width = "100%", e.style.maxWidth = "100%", e.style.minWidth = "0", e.style.boxSizing = "border-box", c.style.cssText = `position:sticky;top:${r};width:100%;max-width:100%;min-width:0;height:${n};overflow:hidden;display:flex;align-items:center;box-sizing:border-box;`, l.style.display = "flex", l.style.flex = "0 0 auto", l.style.width = "max-content", l.style.minWidth = "max-content", l.style.willChange = "transform";
		let d = 0, f = 0, p = 0, m = null, h = !1, g = () => {
			let t = c.clientWidth;
			d = Math.max(0, l.scrollWidth - t), e.style.height = `calc(${n} + ${d}px)`;
		}, _ = () => {
			let t = e.getBoundingClientRect(), n = c.clientHeight, r = e.offsetHeight - n, i = G((Number.parseFloat(getComputedStyle(c).top) || 0) - t.top, 0, r);
			f = (r > 0 ? i / r : 0) * d;
		}, v = () => {
			p = i ? W(p, f, i) : f, l.style.transform = `translate3d(${-p}px,0,0)`, i && Math.abs(p - f) > .2 ? m = requestAnimationFrame(v) : (p = f, l.style.transform = `translate3d(${-p}px,0,0)`, m = null);
		}, y = () => {
			h && (_(), i ? m ??= requestAnimationFrame(v) : v());
		}, b = !1, x = () => {
			b || (b = !0, requestAnimationFrame(() => {
				b = !1, y();
			}));
		}, S = () => {
			g(), y();
		};
		h = !0, g(), y(), window.addEventListener("scroll", x, { passive: !0 }), window.addEventListener("resize", S, { passive: !0 });
		let C = typeof ResizeObserver < "u" ? new ResizeObserver(S) : null;
		return C?.observe(l), {
			el: e,
			type: "horizontalScroll",
			pause() {
				h = !1;
			},
			resume() {
				h = !0, y();
			},
			destroy: () => {
				h = !1, m != null && cancelAnimationFrame(m), window.removeEventListener("scroll", x), window.removeEventListener("resize", S), C?.disconnect(), s ? (e.insertBefore(l, c), u == null ? l.removeAttribute("style") : l.setAttribute("style", u)) : Array.from(l.childNodes).forEach((t) => e.insertBefore(t, c)), c.remove(), e.classList.remove("kt-hscroll"), o == null ? e.removeAttribute("style") : e.setAttribute("style", o);
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
}, ys = (e) => `${K(e)}px`;
function bs(e = {}) {
	if (!e || typeof e != "object") throw TypeError("Kineto.states state values must be objects.");
	let t = {};
	e.opacity != null && (t.opacity = String(Math.max(0, Math.min(1, K(e.opacity, 1)))));
	let n = [];
	e.x != null && n.push(`translateX(${ys(e.x)})`), e.y != null && n.push(`translateY(${ys(e.y)})`), e.scale != null && n.push(`scale(${K(e.scale, 1)})`), e.rotate != null && n.push(`rotate(${K(e.rotate)}deg)`), e.skewX != null && n.push(`skewX(${K(e.skewX)}deg)`), e.skewY != null && n.push(`skewY(${K(e.skewY)}deg)`), e.transform != null && n.push(String(e.transform)), n.length && (t.transform = n.join(" "));
	let r = [];
	return e.blur != null && r.push(`blur(${ys(e.blur)})`), e.brightness != null && r.push(`brightness(${K(e.brightness, 1)})`), e.filter != null && r.push(String(e.filter)), r.length && (t.filter = r.join(" ")), t;
}
function xs(e) {
	return Y(e).filter((e) => e?.nodeType === 1);
}
function Ss(e, t) {
	if (!t) return [];
	if (typeof t != "string") return xs(t);
	let n = [];
	return e.forEach((e) => {
		try {
			n.push(...e.querySelectorAll(t));
		} catch {}
	}), [...new Set(n)];
}
function Cs(e, t) {
	let n = {
		...t,
		...e
	};
	return {
		duration: Math.max(0, K(n.duration, 300)),
		delay: Math.max(0, K(n.delay, 0)),
		stagger: Math.max(0, K(n.stagger, 0)),
		ease: L(n.ease || "ease"),
		initial: n.initial,
		beforeChildren: n.beforeChildren === !0,
		afterChildren: n.afterChildren === !0,
		delayChildren: Math.max(0, K(n.delayChildren, 0)),
		reducedMotion: n.reducedMotion
	};
}
function ws(e = {}, t = {}, n = null) {
	if (!e || typeof e != "object" || Array.isArray(e)) throw TypeError("Kineto.states() expects a named state object.");
	let r = new Map(Object.entries(e).map(([e, t]) => [e, bs(t)]));
	if (!r.size) throw TypeError("Kineto.states() needs at least one named state.");
	let i = /* @__PURE__ */ new Map(), a = /* @__PURE__ */ new Map(), o = /* @__PURE__ */ new Set(), s = null, c = !1, l = (e) => {
		i.has(e) || i.set(e, e.getAttribute("style"));
	}, u = (e, t) => {
		l(e), Object.entries(t).forEach(([t, n]) => {
			e.style[t] = n;
		});
	}, d = () => {
		i.forEach((e, t) => {
			(t?.isConnected || t?.style) && (e == null ? t.removeAttribute("style") : t.setAttribute("style", e));
		}), i.clear();
	}, f = (e, t) => {
		e.status || (e.status = t, e.entries.forEach((t) => {
			a.get(t.el) === e && a.delete(t.el), t.timer && clearTimeout(t.timer);
			try {
				t.animation?.cancel?.();
			} catch {}
		}), o.delete(e), e.resolve({ status: t }));
	}, p = (e) => f(e, "cancelled"), m = (e, t, n, r, i, o) => {
		l(t);
		let s = a.get(t);
		s && s !== e && p(s), a.set(t, e);
		let c = {
			el: t,
			animation: null,
			timer: null,
			done: !1
		};
		e.entries.push(c);
		let d = () => {
			c.done || e.status || (c.done = !0, u(t, r), a.get(t) === e && a.delete(t), --e.remaining, e.remaining || f(e, "finished"));
		}, m = i.delay + i.stagger * o;
		if (e.reduced || !i.duration) {
			c.timer = setTimeout(d, m), m || d();
			return;
		}
		if (typeof t.animate == "function") {
			let a = n ? [n, r] : [{}, r];
			try {
				let n = t.animate(a, {
					duration: i.duration,
					delay: m,
					easing: i.ease,
					fill: "both"
				});
				c.animation = n, n.finished.then(d, () => {
					e.status || p(e);
				});
				return;
			} catch {}
		}
		c.timer = setTimeout(d, m + i.duration);
	}, h = (e, i, a = {}) => {
		if (c) return Promise.resolve({ status: "cancelled" });
		let l = r.get(i);
		if (!l) return Promise.reject(/* @__PURE__ */ RangeError(`Unknown Kineto state: ${i}`));
		let d = xs(e), f = Ss(d, a.children), h = Cs(a, t), g = h.beforeChildren ? [...f, ...d] : [...d, ...f], _ = [...new Set(g)], v = h.initial, y = v && v !== !1 ? r.get(v) : null;
		if (y && _.forEach((e) => u(e, y)), !_.length) return Promise.resolve({ status: "finished" });
		let b = {
			entries: [],
			remaining: _.length,
			status: null,
			resolve: null,
			reduced: !!(h.reducedMotion === "final" || n?.prefersReducedMotion || V().reducedMotion)
		}, x = new Promise((e) => {
			b.resolve = e;
		});
		x.cancel = () => p(b), o.add(b), s = {
			target: e,
			stateName: i,
			options: {
				...a,
				initial: !1
			}
		};
		let S = h.duration + h.stagger * Math.max(0, d.length - 1), C = h.duration + h.stagger * Math.max(0, f.length - 1), w = {
			...h,
			delay: h.delay + h.delayChildren + (h.afterChildren ? S : 0)
		}, T = {
			...h,
			delay: h.delay + (h.beforeChildren ? C + h.delayChildren : 0)
		};
		return _.forEach((e) => {
			let t = f.includes(e), n = t ? w : T, r = t ? f.indexOf(e) : d.indexOf(e);
			m(b, e, y || null, l, n, Math.max(0, r));
		}), x;
	}, g = {
		apply: h,
		replay(e = s?.target, t = s?.stateName, n = s?.options || {}) {
			return !e || !t ? Promise.resolve({ status: "finished" }) : h(e, t, {
				...n,
				initial: !1
			});
		},
		scan(e = typeof document < "u" ? document : null, t = {}) {
			let n = [];
			return e?.querySelectorAll && e.querySelectorAll("[data-kt-state]").forEach((e) => {
				let i = e.getAttribute("data-kt-state");
				i && r.has(i) && n.push(h(e, i, t));
			}), Promise.all(n).then((e) => e.at(-1) || { status: "finished" });
		},
		destroy() {
			return c ? g : (c = !0, [...o].forEach(p), d(), s = null, g);
		},
		get stateNames() {
			return [...r.keys()];
		}
	};
	return V().ssr && (g.ssr = !0), g;
}
//#endregion
//#region src/index.js
var Ts = {
	parallax: xt,
	mouseParallax: St,
	reveal: Pt,
	counter: Ut,
	dateTime: Jt,
	lazy: ar,
	stylize: _r,
	textSplit: xr,
	blurText: Sr,
	typewriter: Cr,
	textReveal: Er,
	textTransition: Or,
	magnetic: Mr,
	marquee: Nr,
	overflowText: Br,
	loader: Jr,
	loadingIndicator: Ri,
	tilt: Ui,
	cursor: pa,
	textFill: ma,
	stickyStack: ga,
	scrollVelocity: _a,
	progress: ba,
	slider: Ca,
	ambientMedia: Ea,
	pageReveal: ka,
	glitch: Ma,
	cardGlow: Ra,
	lightbox: qa,
	pageTransition: Qa,
	vibrate: eo,
	ripple: to,
	cssScroll: ro,
	scrollSequence: io,
	brushReveal: oo,
	fullpage: so,
	confetti: co,
	accordion: lo,
	hold: uo,
	megaMenu: xo,
	toast: ko,
	bottomSheet: Ao,
	tabs: jo,
	radial: No,
	coverReveal: Ho,
	gesture: Go,
	drag: Ko,
	tooltip: qo,
	switch: Jo,
	flip: Yo,
	scrollShadows: Zo,
	squircle: gs,
	stickyHeader: _s,
	horizontalScroll: vs
};
Object.entries(Ts).forEach(([e, t]) => bt.register(e, t));
var $ = (e) => (t, n) => bt[e](t, n), Es = $("parallax"), Ds = $("mouseParallax"), Os = $("reveal"), ks = $("counter"), As = $("dateTime"), js = $("lazy"), Ms = $("stylize"), Ns = $("textSplit"), Ps = $("blurText"), Fs = $("typewriter"), Is = $("textReveal"), Ls = $("textTransition"), Rs = $("magnetic"), zs = $("marquee"), Bs = $("overflowText"), Vs = $("loader"), Hs = $("loadingIndicator"), Us = $("tilt"), Ws = $("cursor"), Gs = $("textFill"), Ks = $("stickyStack"), qs = $("scrollVelocity"), Js = $("progress"), Ys = $("slider"), Xs = $("ambientMedia"), Zs = $("pageReveal"), Qs = $("glitch"), $s = $("cardGlow"), ec = $("lightbox"), tc = $("pageTransition"), nc = $("vibrate"), rc = $("ripple"), ic = $("cssScroll"), ac = $("scrollSequence"), oc = $("brushReveal"), sc = $("fullpage"), cc = $("confetti"), lc = $("accordion"), uc = $("hold"), dc = $("megaMenu"), fc = $("toast"), pc = $("bottomSheet"), mc = $("tabs"), hc = $("radial"), gc = $("coverReveal"), _c = $("gesture"), vc = $("drag"), yc = $("tooltip"), bc = $("switch"), xc = $("flip"), Sc = $("scrollShadows"), Cc = $("squircle"), wc = $("stickyHeader"), Tc = $("horizontalScroll");
bt.listTerminalFramePresets = pi, bt.states = (e, t = {}) => ws(e, t, bt);
var Ec = (e, t = {}) => ws(e, t, bt), Dc = bt;
//#endregion
export { lc as accordion, Xs as ambientMedia, Ps as blurText, pc as bottomSheet, oc as brushReveal, $s as cardGlow, cc as confetti, ks as counter, gc as coverReveal, ic as cssScroll, Ws as cursor, As as dateTime, Dc as default, vc as drag, xc as flip, sc as fullpage, _c as gesture, Qs as glitch, uc as hold, Tc as horizontalScroll, js as lazy, ec as lightbox, pi as listTerminalFramePresets, Vs as loader, Hs as loadingIndicator, Rs as magnetic, zs as marquee, dc as megaMenu, Ts as modules, Ds as mouseParallax, Bs as overflowText, Zs as pageReveal, tc as pageTransition, Es as parallax, Js as progress, hc as radial, Os as reveal, rc as ripple, ac as scrollSequence, Sc as scrollShadows, qs as scrollVelocity, Ys as slider, Cc as squircle, Ec as states, wc as stickyHeader, Ks as stickyStack, Ms as stylize, bc as switch, mc as tabs, Gs as textFill, Is as textReveal, Ns as textSplit, Ls as textTransition, Us as tilt, fc as toast, yc as tooltip, Fs as typewriter, nc as vibrate };
