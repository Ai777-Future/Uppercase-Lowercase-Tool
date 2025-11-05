const q = new Quill('#editor', {
  theme: 'snow',
  placeholder: 'Write your message here… Use {{firstName}}, {{lastName}}, {{email}}',
  modules: { toolbar: [['bold','italic','underline'], [{'header':[1,2,false]}], [{'list':'ordered'},{'list':'bullet'}], ['link','clean']] }
});

const els = {
  subject: document.getElementById('subject'),
  recipientsText: document.getElementById('recipientsText'),
  csvFile: document.getElementById('csvFile'),
  attachments: document.getElementById('attachments'),
  schedule: document.getElementById('schedule'),
  previewBtn: document.getElementById('previewBtn'),
  createBatchBtn: document.getElementById('createBatchBtn'),
  saveTplBtn: document.getElementById('saveTplBtn'),
  tplSelect: document.getElementById('tplSelect'),
  loadTplBtn: document.getElementById('loadTplBtn'),
  sampleSubject: document.getElementById('sampleSubject'),
  sampleBody: document.getElementById('sampleBody'),
  batches: document.getElementById('batches')
};

function getHtml() { return q.root.innerHTML; }
function sampleRecipient() {
  return { firstName: "Sandeep", lastName: "Singh", email: "sandeep@example.com" };
}
function personalize(text, r) {
  return text
   .replaceAll("{{firstName}}", r.firstName)
   .replaceAll("{{lastName}}", r.lastName)
   .replaceAll("{{email}}", r.email);
}

async function loadTemplates() {
  const res = await fetch('/api/templates');
  const data = await res.json();
  els.tplSelect.innerHTML = data.templates.map(t => `<option value="${t.id}">${t.name}</option>`).join('');
}

els.saveTplBtn.onclick = async () => {
  const name = prompt("Template name?");
  if (!name) return;
  const body = { name, subject: els.subject.value, html: getHtml() };
  const res = await fetch('/api/templates', { method:"POST", headers:{'Content-Type':'application/json'}, body: JSON.stringify(body) });
  const j = await res.json();
  alert(j.ok ? "Saved!" : "Failed");
  loadTemplates();
};

els.loadTplBtn.onclick = async () => {
  const id = els.tplSelect.value;
  if (!id) return;
  const res = await fetch('/api/templates/' + id);
  const { template } = await res.json();
  els.subject.value = template.subject;
  q.root.innerHTML = template.html;
};

els.previewBtn.onclick = () => {
  const r = sampleRecipient();
  els.sampleSubject.textContent = "Subject: " + personalize(els.subject.value || "", r);
  els.sampleBody.innerHTML = personalize(getHtml(), r);
};

async function refreshBatches() {
  const res = await fetch('/api/batches');
  const j = await res.json();
  els.batches.innerHTML = j.batches.map(b => {
    const s = b.stats || { queued:0, sent:0, failed:0 };
    return `
      <div class="batch">
        <div><b>#${b.id}</b> — ${b.subject}</div>
        <div>Created: ${new Date(b.created_at).toLocaleString()} | Scheduled: ${b.scheduled_at ? new Date(b.scheduled_at).toLocaleString() : 'now'}</div>
        <div>Status: <span class="badge ${b.status==='done'?'green': b.status==='failed'?'red':''}">${b.status}</span>
        &nbsp; Stats: queued ${s.queued} • sent ${s.sent} • failed ${s.failed}
        &nbsp; <a class="link" href="/api/exports/batch/${b.id}.csv">Export CSV</a>
        &nbsp; <a class="link" href="#" onclick="return showRecipients(${b.id})">View recipients</a></div>
        <div id="rec-${b.id}" style="margin-top:8px"></div>
      </div>`;
  }).join('');
}
window.showRecipients = async (id) => {
  const res = await fetch(`/api/batches/${id}/recipients`);
  const j = await res.json();
  document.getElementById(`rec-${id}`).innerHTML = `
    <table style="width:100%;border-collapse:collapse">
      <tr><th align="left">#</th><th align="left">First</th><th align="left">Last</th><th align="left">Email</th><th align="left">Status</th></tr>
      ${j.recipients.map(r=>`<tr>
        <td>${r.id}</td><td>${r.first||''}</td><td>${r.last||''}</td><td>${r.email}</td><td>${r.status}</td>
      </tr>`).join('')}
    </table>`;
  return false;
};
 
els.createBatchBtn.onclick = async () => {
  const fd = new FormData();
  fd.append('subject', els.subject.value);
  fd.append('html', getHtml());
  if (els.schedule.value) fd.append('scheduledAt', new Date(els.schedule.value).toISOString());

  // recipients: if CSV file selected, attach file; else textarea CSV
  if (els.csvFile.files.length) {
    fd.append('csvFile', els.csvFile.files[0]);
  } else {
    // validate/normalize textarea CSV (ensure header)
    let csvText = els.recipientsText.value.trim();
    if (csvText && !/^firstName,/i.test(csvText.split('\n')[0])) {
      csvText = "firstName,lastName,email\n" + csvText;
    }
    fd.append('recipientsText', csvText);
  }

  for (const f of els.attachments.files) fd.append('attachments', f);

  els.createBatchBtn.disabled = true;
  const res = await fetch('/api/create-batch', { method:'POST', body: fd });
  const j = await res.json();
  els.createBatchBtn.disabled = false;
  alert(j.ok ? `Batch #${j.batchId} created!` : (j.msg || "Failed"));
  refreshBatches();
};

loadTemplates();
refreshBatches();
