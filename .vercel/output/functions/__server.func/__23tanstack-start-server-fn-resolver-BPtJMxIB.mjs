//#region node_modules/.nitro/vite/services/ssr/assets/__23tanstack-start-server-fn-resolver-BPtJMxIB.js
var manifest = {
	"00e828a7cbd00d568d07bebe5f5c0e6c24a84ec46880352adb787cb183a1f079": {
		functionName: "createOrder_createServerFn_handler",
		importer: () => import("./_ssr/orders-Bb2jetGX.mjs")
	},
	"093d110f565762dd086a4de8d75a469b81eccdcfdbf0dbdc517844003bb35e18": {
		functionName: "sendReservationStatusEmail_createServerFn_handler",
		importer: () => import("./_ssr/reservation-status-email-B9wIDpdl.mjs")
	},
	"0e91b6bfad7392ba36437684e2097df40e189e8cb3812f47cd5913dd58af257f": {
		functionName: "validateCouponCode_createServerFn_handler",
		importer: () => import("./_ssr/coupons-7QZgWFGS.mjs")
	},
	"314b56170bba00ad1781af1cbf3be156a6b730a70d69f6e35498b764523b74ed": {
		functionName: "secureUploadGalleryImage_createServerFn_handler",
		importer: () => import("./_ssr/cloudinary-BU8ep1dx.mjs")
	},
	"566e3e4499e6d969ee63c9429f5c88a0b44b790b17de8d02425d8f5e5dbdbabd": {
		functionName: "secureUploadImage_createServerFn_handler",
		importer: () => import("./_ssr/cloudinary-BU8ep1dx.mjs")
	},
	"6deda8bf1d43b4129dfdbc7d1b6093c4de2ace85d24627e9cad9bea6a3437a84": {
		functionName: "resendVerificationEmail_createServerFn_handler",
		importer: () => import("./_ssr/resend-verification-BGioVjbn.mjs")
	},
	"7dc6b68bf7651471b4c98d4b0deb29e67e9209f64869eae4b4f0db8a2167248a": {
		functionName: "sendReviewApprovalEmail_createServerFn_handler",
		importer: () => import("./_ssr/review-approval-email-ClTDyntl.mjs")
	},
	"7dd614e62b30fed541bd38d080ee9b6313c3104e41b0e7b2a284276da0afcf3a": {
		functionName: "sendCustomVerificationEmail_createServerFn_handler",
		importer: () => import("./_ssr/custom-verification-CHnYwDz-.mjs")
	},
	"8ea8690aaab80875cf482a126a44cd9f13ec49afc9b16a0316a32eb799705071": {
		functionName: "sendContactEmail_createServerFn_handler",
		importer: () => import("./_ssr/email-BbtqddJu.mjs")
	},
	"96c170bc12295fd1cd93c468f9362ee6652049aca1dcc15f2c2e86a214550b9e": {
		functionName: "checkAvailability_createServerFn_handler",
		importer: () => import("./_ssr/reservations-mn9AUEXR.mjs")
	},
	"ce298875ca5642a78128169af0dbf7abe8ae5c3e3869d097667956f552822503": {
		functionName: "secureDeleteImage_createServerFn_handler",
		importer: () => import("./_ssr/cloudinary-BU8ep1dx.mjs")
	},
	"d3807520bdee2422f9ead2be16ab8770d61a07ce4b1ad3fbd965e7773fd8a16e": {
		functionName: "submitReview_createServerFn_handler",
		importer: () => import("./_ssr/reviews-BZBKW4fv.mjs")
	},
	"e8c24639cb439d52663e9b4f4b31e5d815565814eb527c55d74ec67be200a2d4": {
		functionName: "sendOrderCancellationEmail_createServerFn_handler",
		importer: () => import("./_ssr/order-cancellation-email-BlvSDiPa.mjs")
	},
	"f327ddfa66e02f8aaf92916e00b481ffb9caa9a7fce0967c821ea599f0a10771": {
		functionName: "sendOrderStatusEmail_createServerFn_handler",
		importer: () => import("./_ssr/order-status-email-CUfpdQXk.mjs")
	},
	"f9f6b26272d80879aa9b6f9531df479177b713bf11a41e2c5dd73d72bc5dc53d": {
		functionName: "createReservation_createServerFn_handler",
		importer: () => import("./_ssr/reservations-mn9AUEXR.mjs")
	},
	"fec2b61f7a04a4182532615ffce8ee894f70318f6b11ad623f61cfc376ded786": {
		functionName: "getOrderForTracking_createServerFn_handler",
		importer: () => import("./_ssr/orders-Bb2jetGX.mjs")
	}
};
async function getServerFnById(id, access) {
	const serverFnInfo = manifest[id];
	if (!serverFnInfo) throw new Error("Server function info not found for " + id);
	const fnModule = serverFnInfo.module ?? await serverFnInfo.importer();
	if (!fnModule) throw new Error("Server function module not resolved for " + id);
	const action = fnModule[serverFnInfo.functionName];
	if (!action) throw new Error("Server function module export not resolved for serverFn ID: " + id);
	return action;
}
//#endregion
export { getServerFnById as t };
