import puppeteer from 'https://deno.land/x/puppeteer@16.2.0/mod.ts'

Deno.serve(async (req) => {
  try {
    const { html } = await req.json()

    if (!html) {
      return new Response('Missing html body', { status: 400 })
    }

    const browserlessApiKey = Deno.env.get('BROWSERLESS_API_KEY')
    if (!browserlessApiKey) {
      return new Response('Missing BROWSERLESS_API_KEY environment variable', { status: 500 })
    }

    const browser = await puppeteer.connect({
      browserWSEndpoint: `wss://chrome.browserless.io?token=${browserlessApiKey}`,
    })

    const page = await browser.newPage()
    await page.setContent(html, { waitUntil: 'networkidle0' })

    // Add custom CSS to ensure A4 size and print layout
    await page.addStyleTag({
      content: `
            @page { size: A4; margin: 0; }
            body { margin: 0; padding: 0; }
            * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        `
    })

    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '0px', right: '0px', bottom: '0px', left: '0px' }
    })

    await browser.close()

    return new Response(pdf, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="invoice.pdf"',
      },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
