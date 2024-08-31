from playwright.sync_api import sync_playwright
import base64

page_url = "https://www.colamanga.com/manga-fh164016/1/98.html"
user_agent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"

with sync_playwright() as p:
    browser = p.chromium.launch()
    context = browser.new_context(user_agent=user_agent)
    page = context.new_page()
    page.set_extra_http_headers({"Referer": page_url})
    page.goto(page_url)

    blob_data = page.evaluate("""
        async () => {
            const response = await fetch('https://www.colamanga.com/585d5975-7318-4ec0-8739-07747c1b8084');
            const blobData = await response.blob();

            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result.split(',')[1]);
                reader.onerror = reject;
                reader.readAsDataURL(blobData);
            });
        }
    """)
    print(blob_data)
    with open("output_image.jpg", "wb") as f:
        f.write(base64.b64decode(blob_data))
    browser.close()

print("Image saved successfully.")