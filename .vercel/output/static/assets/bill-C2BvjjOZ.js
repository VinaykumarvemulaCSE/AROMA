import{s as e}from"./sonner-DTl-7ZV-.js";import{r as t,t as n}from"./format-DWDicie1.js";var r=e(`download`,[[`path`,{d:`M12 15V3`,key:`m9g1x1`}],[`path`,{d:`M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4`,key:`ih7n3h`}],[`path`,{d:`m7 10 5 5 5-5`,key:`brsn70`}]]);function i(e){let r=e.subtotal??e.items.reduce((e,t)=>e+t.price*t.qty,0),i=e.tax??0,a=e.delivery??0,o=`<!doctype html><html><head><meta charset="utf-8"/>
<title>Bill ${e.id} — ${n.name}</title>
<style>
  *{box-sizing:border-box}
  body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Inter,sans-serif;color:#1c1410;margin:0;padding:32px;background:#fff;max-width:560px;margin:0 auto}
  h1{font-size:22px;margin:0 0 4px;letter-spacing:-.02em}
  .muted{color:#6b5d54;font-size:12px}
  .row{display:flex;justify-content:space-between;align-items:flex-start;gap:12px}
  hr{border:0;border-top:1px dashed #d8cfc7;margin:18px 0}
  table{width:100%;border-collapse:collapse;font-size:13px}
  th,td{text-align:left;padding:6px 0;vertical-align:top}
  th{font-weight:600;border-bottom:1px solid #e3dcd5}
  td.qty,th.qty{width:36px;text-align:center}
  td.amt,th.amt{text-align:right;white-space:nowrap}
  .total{font-weight:700;font-size:16px}
  .footer{text-align:center;margin-top:24px;font-size:11px;color:#8a7d73}
  .brand{display:flex;align-items:center;gap:10px}
  .logo{width:38px;height:38px;border-radius:999px;background:#26170c;color:#fcf9f8;display:grid;place-items:center;font-weight:700;font-family:Poppins,sans-serif}
  @media print { body{padding:16px} .noprint{display:none} }
</style></head><body>
  <div class="row">
    <div class="brand">
      <div class="logo">A</div>
      <div>
        <h1>${n.name}</h1>
        <div class="muted">${n.address}</div>
        <div class="muted">${n.phone} · ${n.email}</div>
      </div>
    </div>
    <div style="text-align:right">
      <div style="font-weight:700">Bill</div>
      <div class="muted">#${e.id}</div>
      <div class="muted">${new Date(e.createdAt).toLocaleString(`en-IN`)}</div>
    </div>
  </div>
  <hr/>
  ${e.contact?`<div class="muted">Customer: <strong style="color:#1c1410">${e.contact.name}</strong> · ${e.contact.phone}</div>`:``}
  ${e.addr?`<div class="muted">Deliver to: ${e.addr.line1}, ${e.addr.city} ${e.addr.pin}</div>`:``}
  <hr/>
  <table>
    <thead><tr><th class="qty">Qty</th><th>Item</th><th class="amt">Price</th><th class="amt">Amount</th></tr></thead>
    <tbody>
      ${e.items.map(e=>`<tr><td class="qty">${e.qty}</td><td>${e.name}</td><td class="amt">${t(e.price)}</td><td class="amt">${t(e.price*e.qty)}</td></tr>`).join(``)}
    </tbody>
  </table>
  <hr/>
  <table>
    <tr><td>Subtotal</td><td class="amt">${t(r)}</td></tr>
    ${i?`<tr><td>GST</td><td class="amt">${t(i)}</td></tr>`:``}
    ${a?`<tr><td>Delivery</td><td class="amt">${t(a)}</td></tr>`:``}
    <tr class="total"><td>Total</td><td class="amt">${t(e.total)}</td></tr>
  </table>
  <div class="footer">Thank you for choosing Aroma. Brewed with love in Nalgonda.</div>
  <div class="noprint" style="text-align:center;margin-top:20px">
    <button onclick="window.print()" style="padding:10px 18px;border-radius:8px;background:#26170c;color:#fff;border:0;font-size:14px;cursor:pointer">Save as PDF / Print</button>
  </div>
  <script>window.addEventListener('load',()=>setTimeout(()=>window.print(),300))<\/script>
</body></html>`,s=window.open(``,`_blank`,`width=620,height=820`);if(!s){let t=new Blob([o],{type:`text/html`}),n=URL.createObjectURL(t),r=document.createElement(`a`);r.href=n,r.download=`aroma-bill-${e.id}.html`,r.click(),URL.revokeObjectURL(n);return}s.document.write(o),s.document.close()}export{r as n,i as t};