export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }

  const payload = {
    sender:  { name: 'Tatin* Web', email: 'info@tatindemanzana.com' },
    to:      [{ email: 'carolina@tatindemanzana.com', name: 'Carolina Escudé' }],
    replyTo: { email, name },
    subject: `Nueva idea de ${name} · Tatin*`,
    htmlContent: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#1B1147">
        <h2 style="font-size:22px;margin-bottom:24px">Nueva idea recibida desde <strong>tatindemanzana.com</strong></h2>
        <table style="width:100%;border-collapse:collapse">
          <tr><td style="padding:10px 0;border-bottom:1px solid #eee;width:120px;color:#888;font-size:13px">Nombre</td>
              <td style="padding:10px 0;border-bottom:1px solid #eee;font-weight:600">${escapeHtml(name)}</td></tr>
          <tr><td style="padding:10px 0;border-bottom:1px solid #eee;color:#888;font-size:13px">Email</td>
              <td style="padding:10px 0;border-bottom:1px solid #eee"><a href="mailto:${escapeHtml(email)}" style="color:#1B1147">${escapeHtml(email)}</a></td></tr>
          <tr><td style="padding:10px 0;color:#888;font-size:13px;vertical-align:top;padding-top:14px">Mensaje</td>
              <td style="padding:10px 0;line-height:1.6">${escapeHtml(message).replace(/\n/g, '<br>')}</td></tr>
        </table>
        <p style="margin-top:32px;font-size:12px;color:#aaa">Enviado desde el formulario de tatin-web.vercel.app</p>
      </div>
    `,
  };

  const brevoRes = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'api-key':     process.env.BREVO_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!brevoRes.ok) {
    const err = await brevoRes.text();
    console.error('Brevo error:', err);
    return res.status(500).json({ error: 'No se pudo enviar. Inténtalo de nuevo.' });
  }

  return res.status(200).json({ ok: true });
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
