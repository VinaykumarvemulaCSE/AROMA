import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { t as cn } from "./utils-C_uf36nf.mjs";
import { v as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { E as MapPin, U as Circle } from "../_libs/lucide-react.mjs";
import { n as RadioGroupIndicator, r as RadioGroupItem$1, t as RadioGroup$1 } from "../_libs/@radix-ui/react-radio-group+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/AddressAutocomplete-lZWJIlm2.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var RadioGroup = import_react.forwardRef(({ className, ...props }, ref) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RadioGroup$1, {
		className: cn("grid gap-2", className),
		...props,
		ref
	});
});
RadioGroup.displayName = RadioGroup$1.displayName;
var RadioGroupItem = import_react.forwardRef(({ className, ...props }, ref) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RadioGroupItem$1, {
		ref,
		className: cn("aspect-square h-4 w-4 rounded-full border border-primary text-primary shadow cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50", className),
		...props,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RadioGroupIndicator, {
			className: "flex items-center justify-center",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Circle, { className: "h-3.5 w-3.5 fill-primary" })
		})
	});
});
RadioGroupItem.displayName = RadioGroupItem$1.displayName;
var MAPS_KEY = "AIzaSyC4bk66BuEQK9OhzJvBjM6dFuCXs_tkl";
var scriptLoaded = false;
function loadMapsScript() {
	if (scriptLoaded || false) return Promise.resolve();
	return new Promise((resolve) => {
		const s = document.createElement("script");
		s.src = `https://maps.googleapis.com/maps/api/js?key=${MAPS_KEY}&libraries=places`;
		s.async = true;
		s.defer = true;
		s.onload = () => {
			scriptLoaded = true;
			resolve();
		};
		document.head.appendChild(s);
	});
}
function AddressAutocomplete({ value, onChange, placeholder = "Start typing your address…", className, required }) {
	const inputRef = (0, import_react.useRef)(null);
	const [ready, setReady] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		loadMapsScript().then(() => setReady(true));
	}, []);
	(0, import_react.useEffect)(() => {
		if (!ready || !inputRef.current) return;
		const autocomplete = new google.maps.places.Autocomplete(inputRef.current, {
			componentRestrictions: { country: "in" },
			fields: [
				"address_components",
				"formatted_address",
				"geometry",
				"place_id"
			],
			types: ["address"]
		});
		const listener = autocomplete.addListener("place_changed", () => {
			const place = autocomplete.getPlace();
			if (!place.address_components) return;
			const get = (type) => place.address_components.find((c) => c.types.includes(type))?.long_name ?? "";
			const streetNumber = get("street_number");
			const route = get("route");
			const sublocality = get("sublocality_level_1") || get("sublocality");
			const city = get("locality") || get("administrative_area_level_2") || get("administrative_area_level_1");
			const pin = get("postal_code");
			const line1 = [
				streetNumber,
				route,
				sublocality
			].filter(Boolean).join(", ");
			const location = place.geometry?.location ? {
				address: place.formatted_address ?? line1,
				latitude: place.geometry.location.lat(),
				longitude: place.geometry.location.lng(),
				placeId: place.place_id ?? ""
			} : void 0;
			onChange(place.formatted_address ?? line1, {
				line1: line1 || (place.formatted_address ?? ""),
				city,
				pin
			}, location);
		});
		return () => {
			google.maps.event.removeListener(listener);
		};
	}, [ready, onChange]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
			ref: inputRef,
			defaultValue: value,
			onChange: (e) => onChange(e.target.value),
			placeholder,
			required,
			className: `flex h-9 w-full rounded-md border border-input bg-transparent pl-9 pr-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring ${className ?? ""}`
		})]
	});
}
//#endregion
export { RadioGroup as n, RadioGroupItem as r, AddressAutocomplete as t };
