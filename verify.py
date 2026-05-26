import time
import random
import re

run_id = int(time.time())
test_email = f"jules.tester+{run_id}@collabcode.com"
test_nickname = f"Jules_{random.randint(1000, 9999)}"
admin_email = f"admin.jules+{run_id}@collabcode.com"
admin_nickname = f"Admin_{random.randint(1000, 9999)}"

from playwright.sync_api import sync_playwright, expect
import time

def test_landing(page):
    print("Testing landing page...")
    page.goto("http://localhost:5173")
    expect(page.get_by_role("heading", name="Empower Your Code Collaborations in Real-Time")).to_be_visible()

    # Check mock Monaco Canvas
    print("Checking Monaco mockup...")
    page.get_by_text("main.cpp").click()
    page.get_by_text("Document.js").click()

    # Go to login
    print("Navigating to login...")
    page.get_by_role("link", name="Login to Existing Account").click()
    expect(page.get_by_text("Welcome back")).to_be_visible()

def test_register(page):
    print("Registering user...")
    page.get_by_text("Create one").click()

    page.get_by_placeholder("e.g. Alex Chen").fill(test_nickname)
    page.get_by_placeholder("you@example.com").fill(test_email)
    page.locator("input[type='password']").first.fill("password123")
    page.locator("input[type='password']").nth(1).fill("password123")

    # Select Expert from dropdown

    page.locator("div.grid.grid-cols-3 > div").nth(2).click()


    time.sleep(1)

    page.get_by_role("button", name="Create Account").click()

    # Should navigate to Login
    expect(page.get_by_text("Join Workspace")).to_be_visible(timeout=5000)

def test_workspace(page):
    # Depending on register redirect, we might be at login
    page.goto("http://localhost:5173/login")
    print("Logging in...")
    page.get_by_placeholder("you@example.com").fill(test_email)
    page.locator("input[type='password']").first.fill("password123")
    page.get_by_role("button", name="Sign In").click()

    print("Joining room...")
    expect(page.get_by_text("Join Workspace")).to_be_visible(timeout=5000)
    page.get_by_placeholder("e.g. hackathon-2026").fill("jules-sandbox-room")
    page.get_by_role("button", name="Enter Workspace").click()

    # Verify workspace
    print("Verifying workspace...")
    expect(page.get_by_text("Connected").first).to_be_visible(timeout=5000)

    # Wait for yjs connection
    time.sleep(2)

    # Dark/Light toggle
    print("Toggling theme...")
    # Update locator based on the screenshot, it's a button with a moon/sun icon
    # Just look for the first button in the top right that isn't 'Disconnect'
    theme_btn = page.locator("button.p-2.rounded-lg.transition-all").first
    # Actually wait, let's find it more reliably.
    # The header has a div with round buttons. Let's find button that doesn't have text "Disconnect" and "Run Code"
    theme_btn = page.locator("header").locator("button").filter(has_not_text="Disconnect").filter(has_not_text="Run Code").first
    theme_btn.click()
    time.sleep(1)

    # Editor typing
    print("Typing in Monaco...")
    # Click inside the editor to focus it by clicking .view-lines
    page.locator(".monaco-editor .view-lines").first.click(position={"x": 10, "y": 10})
    page.keyboard.press("Control+A")
    page.keyboard.press("Meta+A")
    page.keyboard.press("Backspace")
    page.keyboard.type("const testing = 'Jules Workspace Sync';")


    # Check sidebar
    print("Checking sidebar...")
    page.get_by_text("Collaborators").click()
    expect(page.get_by_text("You")).to_be_visible()

    page.get_by_text("Preferences").click()
    # Find font slider
    slider = page.locator("input[type='range']")
    slider.fill("24")

    page.get_by_text("Chat").click()
    chat_input = page.get_by_placeholder("Type a message...")
    chat_input.fill("Hello from Jules testing subagent!")

    # Find send button - it has an SVG icon
    # Locate by finding the button next to the input
    page.keyboard.press("Enter")
    expect(page.get_by_text("Hello from Jules testing subagent!")).to_be_visible()

def test_exit(page):
    print("Exiting workspace...")
    page.get_by_role("button", name="Disconnect").click()
    try:
        expect(page.get_by_text("Exit Diagnostics & Feedback")).to_be_visible()
    except Exception as e:
        page.screenshot(path="error_exit.png", full_page=True)
        raise e

    # Click 5 stars
    stars = page.locator("button > svg.text-yellow-400").nth(4)
    # The SVG might not have the text-yellow-400 initially if 0 stars, let's just click the 5th star button
    star_btn = page.locator("div.flex.items-center.gap-1\\.5 > button").nth(4)
    star_btn.click()
    expect(page.get_by_text("Excellent! 🚀")).to_be_visible()

    page.get_by_placeholder("Any thoughts on the editor performance, latency, or visual theme?").fill("WebSockets, Yjs, and cursors are running beautifully!")
    page.get_by_role("button", name="Submit & Disconnect").click()

    # Expect redirect to landing
    expect(page.get_by_role("heading", name="Empower Your Code Collaborations in Real-Time")).to_be_visible(timeout=5000)

def test_admin(page):
    print("Registering Admin...")
    page.goto("http://localhost:5173/login")
    page.get_by_text("Create one").click()

    page.get_by_placeholder("e.g. Alex Chen").fill(admin_nickname)
    page.get_by_placeholder("you@example.com").fill(admin_email)
    page.locator("input[type='password']").first.fill("password123")
    page.locator("input[type='password']").nth(1).fill("password123")

    # Select Admin role
    page.locator("select[name='role']").select_option("admin")


    page.locator("div.grid.grid-cols-3 > div").nth(2).click()


    page.get_by_role("button", name="Create Account").click()
    # It might redirect to workspace first because of the register response bug, let's wait for that then manually go to admin
    expect(page.get_by_text("Join Workspace")).to_be_visible(timeout=5000)
    page.goto("http://localhost:5173/admin")
    print("Verifying Admin dashboard...")
    expect(page.get_by_text("Administrative Shield Workspace")).to_be_visible(timeout=5000)

    # Check charts
    expect(page.locator("svg").first).to_be_visible()
    expect(page.get_by_text(test_nickname)).to_be_visible()

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            test_landing(page)
            test_register(page)
            test_workspace(page)
            test_exit(page)
            test_admin(page)
            print("All tests passed!")
            page.screenshot(path="verification.png")
        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="error.png")
            raise
        finally:
            browser.close()
