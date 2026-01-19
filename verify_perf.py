from playwright.sync_api import Page, expect, sync_playwright

def verify_repertory_browser(page: Page):
    # 1. Arrange
    print("Navigating to verify-perf page...")
    page.goto("http://localhost:3000/verify-perf")

    # Wait for the component to load
    print("Waiting for 'Professional Repertory Browser' title...")
    expect(page.get_by_text("Professional Repertory Browser")).to_be_visible(timeout=30000)

    # 2. Act: Select a category and then a symptom
    # Click "Mind" category
    print("Clicking 'Mind' category...")
    page.get_by_role("button", name="Mind").first.click()

    # Check for "Anxiety" symptom card
    print("Waiting for 'Anxiety' symptom...")
    expect(page.get_by_text("Anxiety")).to_be_visible()

    # Click the + button (toggle selection) for Anxiety
    print("Selecting 'Anxiety' symptom...")
    # Find the button associated with Anxiety.
    # The card structure: CardHeader -> div -> CardTitle(text="Anxiety") ... div -> Button(icon=Plus)
    # We can use xpath or layout selectors.
    # //div[contains(@class, 'card-header')]//span[text()='Anxiety']/ancestor::div[contains(@class, 'card-header')]//button

    # Let's try locating the card first.
    # The card contains "Anxiety" and "2 remedies" (from mock data: Ars and Lyc)

    # We can click the button that is inside the card header for "Anxiety".
    # Since there are multiple buttons (remedy buttons in content), we need to be specific.
    # The toggle button is in the header.

    # Simple approach: The toggle button is the one with "h-6 w-6" class in the header?
    # Or simply: click the button that is NOT a remedy button. Remedy buttons have remedy names.
    # The toggle button has no text.

    # Let's use the fact it's in the same row as the title.
    page.locator("div.flex.items-center.justify-between", has_text="Anxiety").get_by_role("button").first.click()

    # 3. Assert: Check if it appears in "Selected Symptoms Analysis"
    print("Verifying selection...")
    # Selected Symptoms Analysis section appears when something is selected.
    expect(page.get_by_text("Selected Symptoms Analysis")).to_be_visible()

    # Check that "Anxiety" badge is present in that section
    # The badge has the text "Anxiety".
    expect(page.get_by_text("Anxiety").nth(1)).to_be_visible() # nth(1) because first one is in the card title?
    # Actually, verify "1 selected" badge
    expect(page.get_by_text("1 selected")).to_be_visible()

    # 4. Screenshot
    print("Taking screenshot...")
    page.screenshot(path="/home/jules/verification/verification.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        print("Launching browser...")
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            verify_repertory_browser(page)
            print("Verification successful!")
        except Exception as e:
            print(f"Verification failed: {e}")
            page.screenshot(path="/home/jules/verification/failure.png")
            raise
        finally:
            browser.close()
